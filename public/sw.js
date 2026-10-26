/* V13: network first and immutable offline shell fallback, no API caching. */
const CACHE='nutrix-pro-v15-4-breaker-20261026';
const SHELL=['/','/index.html','/nutrix.css','/nutrix-core.js','/nutrix-layers.js','/nutrix-app.js','/manifest.json','/icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const req=e.request,url=new URL(req.url);if(req.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
 e.respondWith(fetch(req).then(response=>{if(response.ok){const cp=response.clone();caches.open(CACHE).then(c=>c.put(req,cp)).catch(()=>{});}return response;}).catch(()=>caches.match(req).then(r=>r||(req.mode==='navigate'?caches.match('/index.html'):Response.error()))));
});
