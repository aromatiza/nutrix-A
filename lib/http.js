'use strict';
// Helpers HTTP partagés par toutes les routes /api.
const send=(res,code,obj,headers)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers});res.end(JSON.stringify(obj));};
function clientIp(req){const xf=String(req.headers['x-forwarded-for']||'').split(',')[0].trim();return xf||String(req.socket&&req.socket.remoteAddress||'unknown');}
/** Lit l'URL et applique CORS / contrôle d'origine. Renvoie l'URL, ou null si la réponse a déjà été envoyée. */
function parse(req,res){
  let url;try{url=new URL(req.url,'http://localhost');}catch{send(res,400,{error:'URL invalide'});return null;}
  const origin=String(req.headers.origin||'');
  const allowed=(process.env.CORS_ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).filter(Boolean);
  if(origin&&allowed.includes(origin)){
    res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');
    res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type, x-nutrix-code');
  }
  if(req.method==='OPTIONS'){res.writeHead(origin&&allowed.includes(origin)?204:403);res.end();return null;}
  if(origin&&!allowed.includes(origin)){let same=false;try{same=new URL(origin).host===req.headers.host;}catch{}if(!same){send(res,403,{error:'Origine interdite'});return null;}}
  return url;
}
module.exports={send,clientIp,parse};
