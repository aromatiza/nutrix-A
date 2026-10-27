'use strict';
const {send,clientIp,parse}=require('../../lib/http');
const {codeOk,limited,aiGuard}=require('../../lib/guard');
const gemini=require('../../lib/gemini');
const models=require('../../lib/models');
const store=require('../../lib/store');

/** GET|POST /api/ai/dishphoto — vraies photos d’un plat marocain (Wikipedia/Commons + vérification IA) */
module.exports=async function handler(req,res){
 const url=parse(req,res);if(!url)return;
  if(!await aiGuard(req,res,'dish'))return;
  if(await limited(req,'dishpic',60))return send(res,429,{error:'Trop de demandes. Réessaie dans une minute.'});
  if(req.method!=='POST'&&req.method!=='GET')return send(res,405,{error:'Méthode incorrecte'});
  if(!process.env.GEMINI_API_KEY)return send(res,503,{error:'GEMINI_API_KEY absente'});
  const clean=(x,n=60)=>String(x||'').replace(/[^\p{L}\p{N} ’'\-(),]/gu,'').slice(0,n).trim();
  let data={};
  if(req.method==='GET'){const qs=url.searchParams;data={name:qs.get('name'),ing:String(qs.get('ing')||'').split('|'),hints:String(qs.get('hints')||'').split('|')};}
  else{let input='';try{for await(const part of req){input+=part;if(input.length>20000)throw Error('Too large');}}catch{return send(res,413,{error:'Requête trop grande'});}
   try{data=JSON.parse(input)}catch{return send(res,400,{error:'JSON invalide'})}}
  // Réponse GET mise en cache par Vercel pour TOUS les utilisateurs : seule la première personne attend l'IA.
  const sendD=(v,days)=>{res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':req.method==='GET'&&days?'public, max-age=86400, s-maxage='+Math.round(days*86400)+', stale-while-revalidate=604800':'no-store'});res.end(JSON.stringify(v));};
  const name=clean(data.name,70);if(!name)return send(res,400,{error:'Nom du plat requis'});
  const ing=(Array.isArray(data.ing)?data.ing:[]).map(x=>clean(x,30)).filter(Boolean).slice(0,10);
  const hints=(Array.isArray(data.hints)?data.hints:[]).map(x=>clean(x,50)).filter(Boolean).slice(0,3);
  const ck='dish:'+name.toLowerCase();
  const hit=await store.cacheGet(ck);if(hit)return sendD(hit,hit.ai?30:0);
  const base=(process.env.GEMINI_BASE_URL||'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/,'');
  const UA={'User-Agent':'NutrixApp/13 (nutrition PWA; image lookup)'};
  const t0=Date.now();
  try{
   // 1) l'IA écrit les meilleures recherches pour CE plat
   const qPrompt='Tu es expert en cuisine marocaine et en recherche d’images. Plat : « '+name+' »'+(ing.length?' (ingrédients : '+ing.join(', ')+')':'')+'. Donne les requêtes de recherche qui trouvent sur Wikimedia Commons des PHOTOS RÉELLES, nettes et appétissantes de EXACTEMENT ce plat prêt à manger (pas un autre plat, pas les ingrédients crus, pas un restaurant ni un marché). Mélange le nom marocain usuel, ses translittérations, le nom anglais/français et le nom arabe. Courtes (1 à 4 mots). JSON : {"queries":[string] (5 max, la plus précise d’abord),"visual":string (en français, 1 phrase : à quoi ressemble ce plat servi, pour reconnaître une bonne photo)}';
   // plats avec indices de recherche déjà connus : on saute cette demande IA (moitié moins de demandes à Gemini)
   const qP=hints.length?Promise.resolve({ok:false}):gemini.gem(base,models.model('dishsearch'),{contents:[{role:'user',parts:[{text:qPrompt}]}],generationConfig:{maxOutputTokens:400,responseMimeType:'application/json'}},{json:true,budgetMs:9000,attemptMs:7000});
   const base0=[...new Set([...hints,name.replace(/\s*\(.*\)/,'')].filter(Boolean))];
   // 2) Commons : photos haute définition seulement
   const BAD=/\b(logo|maps?|carte|flags?|drapeau|diagram|stamps?|timbre|book|poster|menu|screenshot|portrait|sign|label|packaging|market|souk|shop|store)\b/i;
   const search=async qq=>{const u='https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=14&gsrsearch='+encodeURIComponent(qq+' filetype:bitmap')+'&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiextmetadatafilter=Artist|LicenseShortName&iiurlwidth=500';
    const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),7000);
    try{const r=await fetch(u,{headers:UA,signal:ac.signal});if(!r.ok)return [];const j=await r.json();
     return Object.values(j.query?.pages||{}).sort((a,b)=>(a.index||0)-(b.index||0)).map(p=>{const i=(p.imageinfo||[])[0];if(!i||!/jpe?g|webp|png/.test(i.mime||'')||i.width<800||i.height<500||i.width/i.height>2.2||i.height/i.width>1.5||BAD.test(p.title))return null;const m=i.extmetadata||{};
      return {u:i.thumburl||i.url,f:i.descriptionurl,a:String(m.Artist?.value||'').replace(/<[^>]*>/g,'').trim().slice(0,40),l:String(m.LicenseShortName?.value||'').slice(0,20),title:String(p.title||'').slice(5,90)}}).filter(Boolean)}
    catch{return []}finally{clearTimeout(tm)}};
   const wsearch=async(l,qq)=>{const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),6000);
    try{const r=await fetch('https://'+l+'.wikipedia.org/w/api.php?action=query&format=json&redirects=1&generator=search&gsrlimit=3&gsrsearch='+encodeURIComponent(qq)+'&prop=pageimages&piprop=thumbnail|name&pithumbsize=500',{headers:UA,signal:ac.signal});if(!r.ok)return [];const j=await r.json();
     return Object.values(j.query?.pages||{}).sort((a,b)=>(a.index||0)-(b.index||0)).map(p=>p.thumbnail&&p.thumbnail.width>=300?{u:p.thumbnail.source,f:'https://'+l+'.wikipedia.org/wiki/File:'+encodeURIComponent(p.pageimage||''),a:'',l:'Wikipedia',title:'Wikipedia '+l+' : '+String(p.title).slice(0,60)}:null).filter(Boolean)}catch{return []}finally{clearTimeout(tm)}};
   // recherches sur le nom + indices lancées EN MÊME TEMPS que l'IA écrit ses requêtes
   const early=Promise.all([wsearch('en',base0[0]),wsearch('fr',base0[0]),...base0.slice(0,3).map(search)]);
   const q=await qP;
   const queries=[...new Set([...(q.ok&&Array.isArray(q.json?.queries)?q.json.queries:[]).map(x=>clean(x,50)),...base0].filter(Boolean))].slice(0,6);
   const visual=q.ok?clean(q.json?.visual,200):'';
   const extra=queries.filter(x=>!base0.slice(0,3).includes(x)).slice(0,3);
   const [e0,e1]=await Promise.all([early,Promise.all([...(extra[0]?[wsearch('en',extra[0])]:[]),...extra.map(search)])]);
   const lists=[[...e0[0],...e0[1],...(extra[0]?e1[0]:[])],...e0.slice(2),...(extra[0]?e1.slice(1):[])];const cands=[];
   for(let k=0;k<14;k++)for(const l of lists){const x=l[k];if(x&&!cands.some(y=>y.u===x.u)&&cands.length<12)cands.push(x)}
   if(!cands.length){const v={photos:[],queries,ai:true};await store.cacheSet(ck,v,6*3600);return sendD(v,1)}
   // 3) l'IA regarde chaque photo (miniatures 250 px) et garde seulement le bon plat, bien photographié
   const thumbs=await Promise.all(cands.map(async c=>{const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),4500);
    try{const r=await fetch(c.u.replace(/\/500px-/,'/250px-'),{headers:UA,signal:ac.signal});if(!r.ok)return null;const buf=Buffer.from(await r.arrayBuffer());if(buf.length>400000)return null;
     return {inlineData:{mimeType:(r.headers.get('content-type')||'image/jpeg').split(';')[0],data:buf.toString('base64')}}}catch{return null}finally{clearTimeout(tm)}}));
   const idx=[],parts=[];thumbs.forEach((t,i)=>{if(t){idx.push(i);parts.push({text:'Photo '+(idx.length-1)+' (titre : '+cands[i].title+')'},t)}});
   if(!parts.length||Date.now()-t0>40000){const v={photos:[],queries,ai:true};return sendD(v,0)}
   const vPrompt='Tu es directeur photo culinaire et expert de la cuisine marocaine. Plat recherché : « '+name+' »'+(visual?' — '+visual:'')+'. Pour CHAQUE photo numérotée ci-dessous, note : "match" 0-10 = c’est bien EXACTEMENT ce plat, servi et prêt à manger (0 si autre plat, ingrédients crus, personne, lieu, texte) ; "quality" 0-10 = netteté, lumière, cadrage, appétissant (photo de magazine = 10). JSON : {"items":[{"i":number,"match":number,"quality":number}]}';
   const v=await gemini.gem(base,models.model('dishjudge'),{contents:[{role:'user',parts:[{text:vPrompt},...parts]}],generationConfig:{maxOutputTokens:1200,responseMimeType:'application/json',thinkingConfig:{thinkingBudget:0}}},{json:true,budgetMs:Math.max(8000,52000-(Date.now()-t0)),attemptMs:20000});
   if(!v.ok)return send(res,v.status||502,{error:v.error});
   const photos=(Array.isArray(v.json?.items)?v.json.items:[]).map(x=>({c:cands[idx[Number(x.i)]],m:Number(x.match)||0,q:Number(x.quality)||0})).filter(x=>x.c&&x.m>=7&&x.q>=4).sort((a,b)=>(b.m*2+b.q)-(a.m*2+a.q)).slice(0,8).map(x=>({u:x.c.u,f:x.c.f,a:x.c.a,l:x.c.l,s:Math.round(x.m*2+x.q)}));
   const out={photos,queries,ai:true};await store.cacheSet(ck,out,out.photos.length?3*86400:6*3600);
   return sendD(out,out.photos.length?30:2);
  }catch(e){return send(res,502,{error:'Recherche photo indisponible'})}
};
