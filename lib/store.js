'use strict';
// Compteurs (limites) et cache. En mémoire par défaut ; si UPSTASH_REDIS_REST_URL/TOKEN (ou KV_REST_API_URL/TOKEN) existent,
// les limites et le cache sont PARTAGÉS entre toutes les instances Vercel (obligatoire pour une vraie montée en charge).
const URL_=()=>process.env.UPSTASH_REDIS_REST_URL||process.env.KV_REST_API_URL||'';
const TOKEN=()=>process.env.UPSTASH_REDIS_REST_TOKEN||process.env.KV_REST_API_TOKEN||'';
const remote=()=>!!(URL_()&&TOKEN());
async function redis(commands){
  const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),2500);
  try{const r=await globalThis.fetch(URL_().replace(/\/$/,'')+'/pipeline',{method:'POST',headers:{Authorization:'Bearer '+TOKEN(),'Content-Type':'application/json'},body:JSON.stringify(commands),signal:ac.signal});
    if(!r.ok)throw new Error('redis '+r.status);return (await r.json()).map(x=>x.result);}
  finally{clearTimeout(tm);}
}
const hits=new Map(),cache=new Map();
function memHit(key,max,windowMs){
  const now=Date.now(),recent=(hits.get(key)||[]).filter(t=>now-t<windowMs);
  if(recent.length>=max){hits.set(key,recent);return true;}
  recent.push(now);hits.set(key,recent);
  if(hits.size>5000){for(const [k,v] of hits){if(!v.length||now-v[v.length-1]>windowMs)hits.delete(k);}}
  return false;
}
/** true si la limite est dépassée (et sinon, compte cette requête). */
async function hit(key,max,windowMs=60000){
  if(remote()){
    try{const k='nx:rl:'+key+':'+Math.floor(Date.now()/windowMs);const [n]=await redis([['INCR',k],['PEXPIRE',k,String(windowMs*2),'NX']]);return Number(n)>max;}
    catch{/* Redis indisponible : on continue avec la mémoire locale plutôt que de bloquer le site */}
  }
  return memHit(key,max,windowMs);
}
async function cacheGet(key){
  if(remote()){try{const [v]=await redis([['GET','nx:c:'+key]]);return v?JSON.parse(v):null;}catch{}}
  const e=cache.get(key);if(e&&e.exp>Date.now())return e.v;cache.delete(key);return null;
}
async function cacheSet(key,value,ttlSec){
  if(cache.size>300)cache.delete(cache.keys().next().value);
  cache.set(key,{v:value,exp:Date.now()+ttlSec*1000});
  if(remote()){try{await redis([['SET','nx:c:'+key,JSON.stringify(value),'EX',String(ttlSec)]]);}catch{}}
}
module.exports={hit,cacheGet,cacheSet,remote};
