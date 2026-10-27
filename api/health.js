'use strict';
const {send,parse}=require('../lib/http');
const {codeOk,limited}=require('../lib/guard');
const gemini=require('../lib/gemini');
/** GET /api/health — état ; ?test=gemini[&code=…] — essaie le modèle de chaque fonction et mesure le temps de réponse. */
module.exports=async function handler(req,res){
 const url=parse(req,res);if(!url)return;
 if(url.searchParams.get('test')!=='gemini')return send(res,200,{ok:true,app:'nutrix-pro',version:'15.0.0-vercel'});
 if(!codeOk(req,url.searchParams.get('code')))return send(res,401,{error:'Code d’accès requis : ajoute &code=TON_CODE',code_required:true});
 if(await limited(req,'diag',3))return send(res,429,{error:'Réessaie dans une minute.'});
 return send(res,200,await gemini.diag());
};
