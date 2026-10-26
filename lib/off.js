'use strict';
const {send,clientIp,parse}=require('./http');
const {codeOk,limited,aiGuard}=require('./guard');
const gemini=require('./gemini');
const models=require('./models');
const store=require('./store');
const OFF_FIELDS='code,product_name,product_name_fr,brands,image_front_url,image_front_small_url,image_url,image_small_url,ingredients_text,ingredients_text_fr,nutriments,nutriscore_grade,nutrition_grades,additives_tags,additives_n,categories_tags,nova_group,allergens_tags,quantity,serving_size,countries_tags,labels_tags,product_quantity,ecoscore_grade,environmental_score_grade';
const offCache=new Map();
const offHits=[];

/** GET /api/off/search?q= et /api/off/product/<code-barres> — proxy Open Food Facts avec cache */
module.exports=async function handler(req,res){
 const url=parse(req,res);if(!url)return;
   if(req.method!=='GET') return send(res,405,{error:'Méthode incorrecte'});
   const code=url.pathname.match(/^\/api\/off\/product\/(\d{8,14})$/)?.[1];
   const search=url.pathname==='/api/off/search' ? String(url.searchParams.get('q')||'').trim().slice(0,100) : '';
   if(!code && (!search || search.length<2))return send(res,400,{error:'Code-barres ou recherche non valide'});
   const isSearch=!code;
   const key=code?'p:'+code:'s:'+search.toLowerCase();
   const saved=offCache.get(key);
   const sendOff=(d)=>{res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':isSearch?'public, s-maxage=43200, stale-while-revalidate=604800':'public, s-maxage=3600'});res.end(JSON.stringify(d));};
   if(saved && Date.now()-saved.time < (isSearch?3600000:86400000))return sendOff(saved.data);
   const now=Date.now(),lim=isSearch?40:40;
   for(let i=offHits.length-1;i>=0;i--)if(now-offHits[i].time>60000)offHits.splice(i,1);
   if(offHits.filter(x=>x.search===isSearch).length>=lim)return saved?sendOff(saved.data):send(res,429,{error:'Trop de demandes. Réessaie dans une minute.'});
   offHits.push({time:now,search:isSearch});
   const target=code ? `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${encodeURIComponent(OFF_FIELDS)}` : `https://world.openfoodfacts.org/cgi/search.pl?${new URLSearchParams({search_terms:search,search_simple:'1',action:'process',json:'1',page_size:'20',fields:OFF_FIELDS})}`;
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),14000);
   try {
     const resp=await fetch(target,{headers:{'User-Agent':'SpaceDailyNutri/2.0 (local educational project; contact: https://github.com/openfoodfacts/openfoodfacts-server)','Accept':'application/json'},signal:controller.signal});
     if(!resp.ok)return saved?sendOff(saved.data):send(res,resp.status===429?429:502,{error:resp.status===429?'Limite Open Food Facts atteinte':'Open Food Facts indisponible'});
     const data=await resp.json();
     if(offCache.size>250)offCache.delete(offCache.keys().next().value);
     offCache.set(key,{time:Date.now(),data});
     return sendOff(data);
   }catch(e){return saved?sendOff(saved.data):send(res,502,{error:'Connexion Open Food Facts impossible'});}finally{clearTimeout(timer);}
};
