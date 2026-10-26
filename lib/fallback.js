'use strict';
// Fournisseur de SECOURS pour le TEXTE (chat, recettes Chef) quand Gemini est saturé ou lent.
// Gratuit et sans carte : Groq (30 demandes/min) ou Cerebras. API compatible OpenAI.
//   GROQ_API_KEY=...                              → Groq, modèle llama-3.3-70b-versatile
//   (ou) LLM_FALLBACK_KEY / LLM_FALLBACK_URL / LLM_FALLBACK_MODEL pour un autre fournisseur compatible OpenAI
const E=process.env;
function config(){
  const key=E.LLM_FALLBACK_KEY||E.GROQ_API_KEY;if(!key)return null;
  return {key,url:(E.LLM_FALLBACK_URL||'https://api.groq.com/openai/v1').replace(/\/$/,''),model:E.LLM_FALLBACK_MODEL||E.GROQ_MODEL||'llama-3.3-70b-versatile'};
}
/** Format Gemini ({systemInstruction, contents}) → messages OpenAI. Les images sont ignorées (texte seulement). */
function messages(body){
  const m=[];const sys=(body.systemInstruction?.parts||[]).map(p=>p.text||'').join('\n').trim();if(sys)m.push({role:'system',content:sys});
  for(const c of body.contents||[]){const t=(c.parts||[]).map(p=>p.text||'').filter(Boolean).join('\n');if(t)m.push({role:c.role==='model'?'assistant':'user',content:t});}
  return m;
}
const req=(cfg,payload,signal)=>globalThis.fetch(cfg.url+'/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+cfg.key,'Content-Type':'application/json'},body:JSON.stringify({model:cfg.model,...payload}),signal});
/** Réponse complète. opt: {json, maxTokens, timeoutMs} → {ok,text,json?,status?} */
async function text(body,opt={}){
  const cfg=config();if(!cfg)return {ok:false,status:503,error:'Pas de modèle de secours'};
  const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),opt.timeoutMs||25000);
  try{
    const r=await req(cfg,{messages:messages(body),max_tokens:Math.min(opt.maxTokens||900,8000),...(opt.json?{response_format:{type:'json_object'}}:{})},ac.signal);
    const j=await r.json().catch(()=>({}));
    if(!r.ok)return {ok:false,status:r.status,error:'Secours indisponible',detail:String(j.error?.message||'').slice(0,200)};
    const t=String(j.choices?.[0]?.message?.content||'').replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
    if(!opt.json)return {ok:!!t,text:t};
    try{return {ok:true,text:t,json:JSON.parse(t)};}catch{return {ok:false,status:502,error:'Réponse IA illisible'};}
  }catch(e){return {ok:false,status:502,error:'Secours indisponible'};}
  finally{clearTimeout(tm);}
}
/** Réponse en direct : renvoie les morceaux de texte au fur et à mesure. */
async function* stream(body,opt={}){
  const cfg=config();if(!cfg)return;
  const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),opt.timeoutMs||40000);
  try{
    const r=await req(cfg,{messages:messages(body),max_tokens:Math.min(opt.maxTokens||900,8000),stream:true},ac.signal);
    if(!r.ok||!r.body)return;
    const dec=new TextDecoder();let buf='';
    for await(const chunk of r.body){
      buf+=dec.decode(chunk,{stream:true});let k;
      while((k=buf.indexOf('\n'))>=0){const line=buf.slice(0,k).trim();buf=buf.slice(k+1);
        if(!line.startsWith('data:')||line.includes('[DONE]'))continue;
        try{const t=JSON.parse(line.slice(5)).choices?.[0]?.delta?.content;if(t)yield t;}catch{}}
    }
  }finally{clearTimeout(tm);}
}

/** Image de secours : Cloudflare Workers AI (FLUX schnell), gratuit. CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN */
async function image(prompt,timeoutMs){
  const acc=E.CLOUDFLARE_ACCOUNT_ID,tok=E.CLOUDFLARE_API_TOKEN;if(!acc||!tok)return null;
  const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),timeoutMs||30000);
  try{
    const r=await globalThis.fetch('https://api.cloudflare.com/client/v4/accounts/'+encodeURIComponent(acc)+'/ai/run/'+(E.CLOUDFLARE_IMAGE_MODEL||'@cf/black-forest-labs/flux-1-schnell'),{method:'POST',headers:{Authorization:'Bearer '+tok,'Content-Type':'application/json'},body:JSON.stringify({prompt:String(prompt).slice(0,2000),steps:6}),signal:ac.signal});
    const j=await r.json().catch(()=>({}));const b=j.result?.image;
    return r.ok&&b?{mimeType:'image/jpeg',data:b}:null;
  }catch{return null;}finally{clearTimeout(tm);}
}
/** Voix de secours : Groq Whisper (gratuit). Entrée : WAV en base64 → texte ou null */
async function transcribe(wavB64,lang,timeoutMs){
  const cfg=config();if(!cfg)return null;
  const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),timeoutMs||25000);
  try{
    const f=new FormData();f.append('file',new Blob([Buffer.from(wavB64,'base64')],{type:'audio/wav'}),'voice.wav');
    f.append('model',E.GROQ_STT_MODEL||'whisper-large-v3-turbo');f.append('response_format','json');f.append('temperature','0');
    if(lang==='fr')f.append('language','fr');
    const r=await globalThis.fetch(cfg.url+'/audio/transcriptions',{method:'POST',headers:{Authorization:'Bearer '+cfg.key},body:f,signal:ac.signal});
    const j=await r.json().catch(()=>({}));return r.ok&&typeof j.text==='string'?j.text:null;
  }catch{return null;}finally{clearTimeout(tm);}
}
module.exports={config,text,stream,image,transcribe};
