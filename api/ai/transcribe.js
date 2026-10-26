'use strict';
const {send,clientIp,parse}=require('../../lib/http');
const {codeOk,limited,aiGuard}=require('../../lib/guard');
const gemini=require('../../lib/gemini');
const models=require('../../lib/models');
const store=require('../../lib/store');
const fallback=require('../../lib/fallback');

/** POST /api/ai/transcribe — message vocal (WAV) → texte */
module.exports=async function handler(req,res){
 const url=parse(req,res);if(!url)return;
  if(!await aiGuard(req,res))return;
  if(await limited(req,'stt',12))return send(res,429,{error:'Trop de messages vocaux. Réessaie dans une minute.'});
  if(req.method!=='POST')return send(res,405,{error:'Méthode incorrecte'});
  if(!process.env.GEMINI_API_KEY)return send(res,503,{error:'GEMINI_API_KEY absente'});
  let input='';try{for await(const part of req){input+=part;if(input.length>4200000)throw Error('Too large');}}
  catch{return send(res,413,{error:'Audio trop long'});}
  try{
   const data=JSON.parse(input), m=/^data:audio\/(wav|x-wav);base64,([A-Za-z0-9+/=]+)$/.exec(String(data.audio||''));
   if(!m)return send(res,400,{error:'Audio WAV requis'});
   const lang=data.language==='ary'?'ary':'fr';
   const base=(process.env.GEMINI_BASE_URL||'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/,'');
   const prompt='Transcris fidèlement ce message vocal. La personne parle darija marocaine, français, ou un mélange des deux (parfois avec des mots arabes ou amazighs). Écris la darija en lettres arabes et le français en français, tel qu’entendu, sans traduire, sans ponctuation excessive, sans commentaire ni guillemets. Le sujet est généralement la nutrition, la cuisine ou les aliments. S’il n’y a aucune parole intelligible, réponds exactement: [vide]. '+(lang==='ary'?'Langue probable : darija.':'Langue probable : français.');
   const out=await gemini.gem(base,models.model('voice'),{contents:[{role:'user',parts:[{text:prompt},{inlineData:{mimeType:'audio/wav',data:m[2]}}]}],generationConfig:{maxOutputTokens:600,temperature:0,thinkingConfig:{thinkingBudget:0}}},{budgetMs:40000,attemptMs:18000});
   if(!out.ok){ // Gemini saturé → Groq Whisper (gratuit)
    const t=await fallback.transcribe(m[2],lang);
    if(t!==null)return send(res,200,{text:t.replace(/[\u0000-\u001f]/g,' ').trim().slice(0,500)});
    return send(res,out.status||502,{error:out.error,detail:out.detail});}
   let text=String(out.text||'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,500);
   if(/^\[?vide\]?\.?$/i.test(text))text='';
   return send(res,200,{text});
  }catch(e){return send(res,502,{error:'Transcription indisponible'});}
};
