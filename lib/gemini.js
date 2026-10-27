'use strict';
// Tout l'accès à Gemini passe ici : adaptation des paramètres selon le modèle, modèles de secours, relances, diagnostic.
const models=require('./models');
const NEW_GEN=m=>/^gemini-(?:[3-9]|\d{2,})/.test(m)||/^gemini-nano-banana/.test(m);
const IS_IMG=m=>/image|nano-banana/.test(m);
const base=()=>(process.env.GEMINI_BASE_URL||'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/,'');
const raw=(u,o)=>globalThis.fetch(u,o);   // lu à chaque appel (permet les tests avec un faux Gemini)

/** Gemini 3+ refuse temperature/topP/topK/candidateCount/thinkingBudget et réfléchit par défaut (lent) : on adapte la requête. */
function adaptBody(model,body,level){
  const b=JSON.parse(body);const g={...(b.generationConfig||{})};
  if(NEW_GEN(model)&&!IS_IMG(model)){
    delete g.temperature;delete g.topP;delete g.topK;delete g.candidateCount;delete g.thinkingConfig;
    if(level)g.thinkingConfig={thinkingLevel:level};
    if(g.maxOutputTokens)g.maxOutputTokens=Math.min(65536,g.maxOutputTokens+4096);   // la réflexion consomme des tokens
  }
  b.generationConfig=g;return JSON.stringify(b);
}
function chain(model){
  const list=IS_IMG(model)
    ?[model,'gemini-nano-banana-2.1','gemini-3.1-flash-image','gemini-2.5-flash-image']
    :[model,process.env.GEMINI_FALLBACK_MODEL,'gemini-3.5-flash','gemini-3.6-flash','gemini-3.5-flash-lite'];
  return [...new Set(list.filter(Boolean))].slice(0,4);
}
// Disjoncteur : un modèle qui vient de répondre 429 est mis de côté ~40 s (on ne gaspille ni quota ni temps) → le secours gratuit répond tout de suite.
const cool=new Map();
const isCool=m=>(cool.get(m)||0)>Date.now();
function trip(m,r){let s=40;try{const ra=Number(r.headers.get('retry-after'));if(ra>0)s=Math.min(90,Math.max(10,ra));}catch{}cool.set(m,Date.now()+s*1000);}
/** Comme fetch(), pour une URL .../models/<modèle>:generateContent (ou streamGenerateContent) : essaie le modèle puis les modèles de secours. */
async function gfetch(u,o){
  const us=String(u);const m=/\/models\/([^/:?]+):((?:stream)?[gG]enerateContent)/.exec(us);
  if(!m||!o||typeof o.body!=='string')return raw(u,o);
  let model;try{model=decodeURIComponent(m[1])}catch{return raw(u,o)}
  let last;
  for(const mod of chain(model)){
    if(isCool(mod))continue;
    const url=us.replace(m[0],'/models/'+encodeURIComponent(mod)+':'+m[2]);
    let r;
    try{r=await raw(url,{...o,body:adaptBody(mod,o.body,process.env.GEMINI_THINKING||'low')});}
    catch(e){if(e&&e.name==='AbortError')throw e;continue;}
    if(r.status===400&&NEW_GEN(mod)&&!IS_IMG(mod)){   // niveau de réflexion refusé ? on réessaie sans
      try{const r2=await raw(url,{...o,body:adaptBody(mod,o.body,'')});if(r2.ok)return r2;r=r2;}catch(e){if(e&&e.name==='AbortError')throw e;}
    }
    if(r.ok)return r;
    last=r;if(r.status===429)trip(mod,r);
    // 400/403/404 : modèle inconnu ou refusé ; 429 : limite de CE modèle atteinte (chaque modèle a sa propre limite) → modèle suivant
    if(![400,403,404,429].includes(r.status))return r;   // 5xx : géré par l'appelant
    try{console.warn('[gemini]',mod,r.status,String((await r.clone().json()).error?.message||'').slice(0,160))}catch{}
  }
  return last||new Response(JSON.stringify({error:{message:'Quota Gemini atteint (pause de quelques secondes)'}}),{status:429,headers:{'content-type':'application/json'}});
}
/** Appel robuste : relances (429/5xx/réseau/JSON illisible) + modèle de secours, dans un budget de temps. */
async function gem(b,model,bodyObj,opt={}){
  const key=process.env.GEMINI_API_KEY,budget=opt.budgetMs||50000,t0=Date.now();
  const list=[model,opt.fallback||process.env.GEMINI_FALLBACK_MODEL||'gemini-3.5-flash-lite',model];
  let last={status:502,error:'Connexion IA indisponible'};
  for(let i=0;i<3;i++){
    const left=budget-(Date.now()-t0);if(left<4000)break;
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),Math.min(left,opt.attemptMs||22000));
    try{
      const response=await gfetch(b+'/models/'+encodeURIComponent(list[i])+':generateContent',{method:'POST',headers:{'x-goog-api-key':key,'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify(bodyObj)});
      let result={};try{result=await response.json()}catch{}
      if(response.ok){
        const text=(result.candidates?.[0]?.content?.parts||[]).map(x=>x.text||'').join('').replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
        if(!opt.json)return {ok:true,result,text};
        try{return {ok:true,result,text,json:JSON.parse(text)}}catch{last={status:502,error:'Réponse IA illisible'};}
      }else{
        last={status:502,error:'Erreur fournisseur Gemini',detail:String(result.error?.message||'Erreur API').slice(0,250)};
        if(response.status===429){last={status:429,error:'Gemini est saturé (limite gratuite atteinte). Réessaie dans une minute.',detail:last.detail};break;}
        if(![500,502,503,504].includes(response.status))break;
      }
    }catch(e){last={status:502,error:'Connexion IA indisponible'};}
    finally{clearTimeout(timer);}
    await new Promise(r=>setTimeout(r,500+i*900));
  }
  return {ok:false,...last};
}
/** /api/health?test=gemini : essaie le modèle de CHAQUE fonction et mesure le temps de réponse. */
async function diag(){
  const key=process.env.GEMINI_API_KEY;if(!key)return {key:false};
  cool.clear();
  const b=base(),fns=models.all(),out={key:true,region:process.env.VERCEL_REGION||'local',functions:{}};
  // un modèle à la fois (7 demandes en même temps déclenchent les limites par minute de Google et faussent les mesures)
  const done={};
  for(const [fn,c] of Object.entries(fns)){
    if(done[c.model]){out.functions[fn]={...done[c.model],same:'comme '+done[c.model].fn};continue;}
    const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),20000),t0=Date.now();
    try{
      let r,j={};
      if(IS_IMG(c.model)){r=await raw(b+'/models/'+encodeURIComponent(c.model),{headers:{'x-goog-api-key':key},signal:ac.signal});j=await r.json().catch(()=>({}));}
      else{r=await raw(b+'/models/'+encodeURIComponent(c.model)+':generateContent',{method:'POST',headers:{'x-goog-api-key':key,'Content-Type':'application/json'},signal:ac.signal,
        body:adaptBody(c.model,JSON.stringify({contents:[{role:'user',parts:[{text:'Réponds seulement: OK'}]}],generationConfig:{maxOutputTokens:20}}),process.env.GEMINI_THINKING||'low')});j=await r.json().catch(()=>({}));}
      out.functions[fn]={fn,model:c.model,ok:r.ok,status:r.status,ms:Date.now()-t0,error:r.ok?undefined:(r.status===429?'QUOTA GOOGLE DÉPASSÉE : ':'')+String(j.error?.message||'').slice(0,160)};
    }catch(e){out.functions[fn]={fn,model:c.model,ok:false,ms:Date.now()-t0,error:e&&e.name==='AbortError'?'Google ne répond pas (20 s)':'connexion impossible'};}
    finally{clearTimeout(tm);}
    done[c.model]=out.functions[fn];
  }
  try{const t0=Date.now(),ac=new AbortController(),tm=setTimeout(()=>ac.abort(),20000),m=models.model('chat');
    const r=await gfetch(b+'/models/'+encodeURIComponent(m)+':streamGenerateContent?alt=sse',{method:'POST',headers:{'x-goog-api-key':key,'Content-Type':'application/json'},signal:ac.signal,body:JSON.stringify({contents:[{role:'user',parts:[{text:'Donne 3 idées de petit-déjeuner sain, en 3 lignes.'}]}],generationConfig:{maxOutputTokens:300}})});
    let first=0;if(r.ok&&r.body){for await(const c of r.body){if(!first)first=Date.now()-t0}}clearTimeout(tm);
    out.chatStream={model:m,ok:r.ok,status:r.status,firstWordMs:first,totalMs:Date.now()-t0};}
  catch(e){out.chatStream={ok:false,error:e&&e.name==='AbortError'?'délai dépassé':'connexion impossible'};}
  try{const f=require('./fallback');out.backup={text_groq:!!f.config(),image_cloudflare:!!(process.env.CLOUDFLARE_ACCOUNT_ID&&process.env.CLOUDFLARE_API_TOKEN)};}catch{}
  return out;
}
module.exports={fetch:gfetch,gem,diag,base,IS_IMG,NEW_GEN,adaptBody};
