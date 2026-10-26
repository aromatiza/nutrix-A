'use strict';
const crypto=require('node:crypto');
const {send,clientIp}=require('./http');
const store=require('./store');
/** Code d'accès (NUTRIX_ACCESS_CODE) : header x-nutrix-code, ou paramètre ?code= pour les <img>/liens. */
function codeOk(req,alt){
  const code=process.env.NUTRIX_ACCESS_CODE;if(!code)return true;
  const a=Buffer.from(String(alt||req.headers['x-nutrix-code']||'')),b=Buffer.from(code);
  return a.length===b.length&&crypto.timingSafeEqual(a,b);
}
/** true si trop de requêtes pour cette personne (fenêtre glissante). */
const limited=(req,kind,max,windowMs=60000)=>store.hit(kind+':'+clientIp(req),max,windowMs);
/** Code d'accès + limite quotidienne (AI_DAILY_LIMIT). Les photos de plats ont leur propre quota. */
async function aiGuard(req,res,kind='ai',alt){
  if(!codeOk(req,alt)){send(res,401,{error:'Code d’accès requis',code_required:true});return false;}
  const lim=Number(process.env.AI_DAILY_LIMIT||0);
  const max=kind==='dish'?Math.max(lim*3,100):lim;
  if(lim>0&&await limited(req,kind==='dish'?'dailydish':'daily',max,86400000)){send(res,429,{error:'Limite quotidienne atteinte. Reviens demain.'});return false;}
  return true;
}
module.exports={codeOk,limited,aiGuard};
