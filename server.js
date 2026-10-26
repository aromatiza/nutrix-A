'use strict';
/** Serveur LOCAL (npm start). Sur Vercel, chaque fichier de /api est une fonction séparée (voir vercel.json) et public/ est servi par le CDN. */
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const {send}=require('./lib/http');
const ROOT=path.join(__dirname,'public'),PORT=Number(process.env.PORT||3000);
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.glb':'model/gltf-binary','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.json':'application/json; charset=utf-8'};
// mêmes routes que Vercel
const routes=[
  [/^\/api\/health$/,'./api/health'],
  [/^\/api\/off\/search$/,'./api/off/search'],
  [/^\/api\/off\/product\/\d{8,14}$/,'./api/off/product/[code]'],
  [/^\/api\/ai\/chat$/,'./api/ai/chat'],
  [/^\/api\/ai\/photo$/,'./api/ai/photo'],
  [/^\/api\/ai\/vision$/,'./api/ai/vision'],
  [/^\/api\/ai\/image$/,'./api/ai/image'],
  [/^\/api\/ai\/transcribe$/,'./api/ai/transcribe'],
  [/^\/api\/ai\/dishphoto$/,'./api/ai/dishphoto']
];
async function handleRequest(req,res){
  let pathname;try{pathname=new URL(req.url,'http://localhost').pathname;}catch{return send(res,400,{error:'URL invalide'});}
  if(pathname.startsWith('/api/')){
    const r=routes.find(([re])=>re.test(pathname));
    if(!r)return send(res,404,{error:'API introuvable'});
    try{return await require(r[1])(req,res);}catch(e){console.error('[api]',pathname,e);if(!res.headersSent)return send(res,500,{error:'Erreur serveur'});return res.end();}
  }
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);return res.end();}
  let file;try{file=path.resolve(ROOT,'.'+decodeURIComponent(pathname==='/'?'/index.html':pathname));}catch{return send(res,400,{error:'Chemin invalide'});}
  if(!file.startsWith(ROOT+path.sep)||!types[path.extname(file)]){res.writeHead(404);return res.end('Not found');}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':types[path.extname(file)],'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin'});res.end(req.method==='HEAD'?undefined:data);});
}
module.exports=handleRequest;
if(require.main===module)http.createServer(handleRequest).listen(PORT,process.env.IP||'127.0.0.1',()=>console.log(`Nutrix Pro: http://localhost:${PORT}`));
