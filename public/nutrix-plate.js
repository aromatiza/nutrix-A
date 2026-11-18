/* NUTRIX — écran « Assiette / الصحن » façon iOS.
   UI uniquement : la logique (appel IA, plats marocains, journal, historique,
   image plus saine, recette) reste dans nutrix-app.js. On réutilise ses
   points d'accroche (.nv-slot, [data-text], [data-moro], .nv-go, .nv-gen,
   .nv-heal, .nv-journal, .nv-reset, [data-hi]) : ses écouteurs s'y attachent. */
(()=>{'use strict';
const lang=()=>{try{return localStorage.getItem('sd-v111-language')==='ary'}catch{return false}};
const ARY=lang();
const L=(fr,ar)=>ARY?ar:fr;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const r0=v=>Math.round(num(v));
const buzz=ms=>{try{navigator.vibrate&&navigator.vibrate(ms)}catch{}};
const I=(d,s=24)=>'<svg viewBox="0 0 24 24" width="'+s+'" height="'+s+'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+d+'</svg>';
const ICO={
  gallery:'<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4 18 5-5 4 4 3-3 4 4"/>',
  flash:'<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>',
  flashOff:'<path d="M13 3 9.6 7.5M16 10.5h2l-3.7 4.9M10 21l1-7.5H5l2.2-2.9"/><path d="m3 3 18 18"/>',
  pen:'<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
  close:'<path d="M6 6l12 12M18 6 6 18"/>',
  check:'<path d="m5 12.5 4.5 4.5L19 7"/>',
  redo:'<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
  spark:'<path d="m12 3 1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z"/>',
  info:'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>',
  warn:'<path d="M12 4 3 20h18zM12 10v4M12 17v.5"/>',
  chef:'<path d="M6 13.5a4 4 0 0 1 1.2-7.8 5 5 0 0 1 9.6 0A4 4 0 0 1 18 13.5V19H6z"/><path d="M6 16h12"/>',
  camera:'<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'
};
const food=(name,s)=>window.NxFood?window.NxFood.icon(name,s):I('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/>',s);
const foodK=(k,s)=>window.NxFood?window.NxFood.svg(k,s):'';
/* mêmes noms que la base marocaine de nutrix-app.js (data-moro) */
const DISHES=[
  ['Harira','Harira','حريرة','soup'],['Couscous aux sept légumes','Couscous','كسكس','semolina'],
  ['Tajine poulet olives citron','Tajine','طاجين','tagine'],['Msemen','Msemen','مسمن','bread'],
  ['Zaalouk','Zaalouk','زعلوك','salad'],['Sardines grillées','Sardines','سردين','fish'],
  ['Pastilla au poulet','Pastilla','بسطيلة','chicken'],['Baghrir (2 crêpes)','Baghrir','بغرير','bread'],
  ['Thé à la menthe (sucré)','Thé','أتاي','tea'],['Chebakia','Chebakia','شباكية','sweets']
];
const LOAD=ARY?['كنشوف الصحن…','كنعرف الماكلة…','كنحسب السعرات…','كنوجد النتيجة…']:['Je regarde l’assiette…','Je reconnais les aliments…','Je calcule les calories…','Je prépare le résultat…'];
const grade=s=>s>=75?'A':s>=55?'B':s>=35?'C':'D';

/* ---------------- caméra ---------------- */
let stream=null,torch=false;
function stopCam(){if(stream){stream.getTracks().forEach(t=>{try{t.stop()}catch{}});stream=null}torch=false}
const track=()=>stream&&stream.getVideoTracks()[0];
const active=()=>!!document.querySelector('#page-studio.active .nxp[data-mode="camera"]');
async function startCam(el){
  const v=el.querySelector('.nxp-video');if(!v||!active())return;
  if(!navigator.mediaDevices?.getUserMedia){el.classList.add('no-cam');return}
  try{
    if(!stream)stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080}}});
    if(!active()){stopCam();return}
    v.srcObject=stream;await v.play().catch(()=>{});el.classList.add('live');el.classList.remove('no-cam');
    let ok=false;try{ok=!!track().getCapabilities?.().torch}catch{}
    const fb=el.querySelector('[data-flash]');if(fb){fb.disabled=!ok;fb.setAttribute('aria-pressed','false')}
  }catch{el.classList.add('no-cam');el.classList.remove('live')}
}
function shoot(v,max=1280){const w=v.videoWidth,h=v.videoHeight;if(!w||!h)return null;const k=Math.min(1,max/Math.max(w,h));const c=document.createElement('canvas');c.width=Math.round(w*k);c.height=Math.round(h*k);c.getContext('2d').drawImage(v,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.84)}

/* ---------------- vues ---------------- */
function head(){return `<header class="nxp-head"><h3>${L('Ton assiette','الصحن ديالك')}</h3><p>${L('Une photo : calories, macros et score.','تصويرة وحدة: السعرات، الماكرو والنقطة.')}</p></header>`}
function brackets(){return '<i class="nxp-br tl"></i><i class="nxp-br tr"></i><i class="nxp-br bl"></i><i class="nxp-br br"></i>'}
function contour(items){
  const bx=(items||[]).map(i=>i&&Array.isArray(i.box)&&i.box.length===4?i.box.map(Number):null).filter(b=>b&&b.every(Number.isFinite)&&b[2]>0&&b[3]>0);
  if(!bx.length)return '<ellipse cx="50" cy="52" rx="38" ry="33" pathLength="1"/>';
  let x0=1,y0=1,x1=0,y1=0;bx.forEach(([x,y,w,h])=>{x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x+w);y1=Math.max(y1,y+h)});
  const p=.03;x0=Math.max(.02,x0-p);y0=Math.max(.02,y0-p);x1=Math.min(.98,x1+p);y1=Math.min(.98,y1+p);
  return `<rect x="${(x0*100).toFixed(1)}" y="${(y0*100).toFixed(1)}" width="${((x1-x0)*100).toFixed(1)}" height="${((y1-y0)*100).toFixed(1)}" rx="9" pathLength="1"/>`;
}
function labels(items){
  let k=0;return (items||[]).slice(0,7).map(i=>{const b=Array.isArray(i.box)?i.box.map(Number):null;if(!b||b.length!==4||!b.every(Number.isFinite))return '';
    const cx=Math.min(.9,Math.max(.1,b[0]+b[2]/2)),cy=Math.min(.92,Math.max(.12,b[1]+b[3]/2));
    return `<span class="nxp-tag" style="--x:${(cx*100).toFixed(1)}%;--y:${(cy*100).toFixed(1)}%;--i:${k++}"><i class="nxp-dot"></i><b>${food(i.name,15)}${esc(String(i.name||'').slice(0,18))}</b></span>`}).join('');
}
function ring(label,g,pct,cls){const C=2*Math.PI*26;return `<div class="nxp-ring ${cls}"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" class="bg"/><circle cx="32" cy="32" r="26" class="fg" stroke-dasharray="${C.toFixed(1)}" style="--off:${(C*(1-pct/100)).toFixed(1)};--full:${C.toFixed(1)}"/></svg><div><strong><bdi dir="ltr">${r0(g)}<small>g</small></bdi></strong><span><bdi dir="ltr">${r0(pct)}%</bdi></span></div><em>${label}</em></div>`}
function resultSheet(S){
  const d=S.result||{},kcal=num(d.kcal),p=num(d.p),c=num(d.c),f=num(d.f),s=Math.max(0,Math.min(100,num(d.score))),g=grade(s);
  const tot=p*4+c*4+f*9||1;const items=Array.isArray(d.items)?d.items.slice(0,12):[];
  const gsum=items.reduce((a,i)=>a+num(i.grams),0);
  const rows=items.map(i=>{const gr=num(i.grams);let kc=num(i.kcal),approx=false;if(!kc&&gr&&gsum){kc=kcal*gr/gsum;approx=true}
    return `<li><i class="nxp-fi">${food(i.name,22)}</i><span class="nxp-fn">${esc(String(i.name||'').slice(0,40))}${gr?`<small><bdi dir="ltr">≈ ${r0(gr)} g</bdi></small>`:''}</span>${kc?`<b><bdi dir="ltr">${approx?'≈ ':''}${r0(kc)}</bdi><small> kcal</small></b>`:''}</li>`}).join('');
  const alerts=(Array.isArray(d.alerts)?d.alerts:[]).filter(Boolean).slice(0,3);
  const notes=alerts.map(a=>`<li><i class="nxp-ni warn">${I(ICO.warn,16)}</i><span class="nxp-fn">${esc(String(a).slice(0,40))}</span></li>`).join('')+(d.tip?`<li><i class="nxp-ni">${I(ICO.info,16)}</i><span class="nxp-fn">${esc(String(d.tip).slice(0,140))}</span></li>`:'');
  const GENK=d.better_prompt;
  return `<div class="nxp-results" aria-label="${L('Résultat','النتيجة')}">
   <section class="nxp-card pad"><div class="nxp-sum">
    <div class="nxp-sum-main"><div class="nxp-kcal"><strong data-count="${r0(kcal)}">${RM?r0(kcal):0}</strong><span>kcal</span></div>
     <h4 class="nxp-dish">${esc(String(d.dish||'').slice(0,48))}</h4>${d.verdict?`<span class="nxp-verdict">${esc(String(d.verdict).slice(0,30))}</span>`:''}</div>
    <div class="nxp-score sc-${g.toLowerCase()}" role="img" aria-label="${L('Score','النقطة')} ${g}, ${s}/100"><b>${g}</b><small>${s}/100</small></div>
   </div></section>
   <section class="nxp-card pad"><h4 class="nxp-card-t">${L('Macros','الماكرو')}</h4>
    <div class="nxp-rings">${ring(L('Protéines','بروتين'),p,p*4/tot*100,'mp')}${ring(L('Glucides','نشويات'),c,c*4/tot*100,'mc')}${ring(L('Lipides','دهون'),f,f*9/tot*100,'mf')}</div></section>
   ${rows?`<div><span class="nxp-cap">${L('Aliments','الماكلة')}</span><section class="nxp-card"><ul class="nxp-list">${rows}</ul></section></div>`:''}
   ${notes?`<section class="nxp-card"><ul class="nxp-list nxp-note">${notes}</ul></section>`:''}
   ${d.src?`<p class="nxp-src">${esc(d.src)}</p>`:''}
   <button type="button" class="nxp-btn primary nv-journal" ${S.added?'disabled':''}>${S.added?I(ICO.check,20)+esc(S.added):L('Ajouter au journal','زيد للجورنال')}</button>
   <section class="nxp-card"><ul class="nxp-list nxp-links">
    ${GENK?`<li><button type="button" class="nv-gen" ${S.genBusy?'disabled':''}><i class="nxp-ni">${I(ICO.spark,16)}</i><span>${S.genBusy?L('Création…','كنصاوب…'):L('Voir l’image plus saine','شوف الصحن الصحي')}</span><em class="nxp-chev">${I(CHEV,16)}</em></button></li>`:''}
    <li><button type="button" class="nv-heal"><i class="nxp-ni">${I(ICO.chef,16)}</i><span>${L('Recette plus saine','وصفة صحية')}</span><em class="nxp-chev">${I(CHEV,16)}</em></button></li>
   </ul></section>
   ${S.genErr?`<p class="nv-err">${esc(S.genErr)}</p>`:''}${S.gen?`<section class="nxp-card"><figure class="nxp-fig"><img src="${S.gen}" alt=""><figcaption>${L('Image générée par IA · illustration','تصويرة من الذكاء الاصطناعي')}</figcaption></figure></section>`:''}
   ${S.err?`<p class="nv-err">${esc(S.err)}</p>`:''}
   <button type="button" class="nxp-btn ghost nv-reset">${L('Refaire','عاود')}</button>
  </div>`;
}
function view(S,hist){
  const img=S.imgs&&S.imgs[0],mode=S.busy?'analyzing':S.result?'result':img?'photo':'camera';
  const items=S.result&&Array.isArray(S.result.items)?S.result.items:[];
  const shot=img?`<div class="nxp-shot"><img src="${img}" alt="${L('Ton assiette','الصحن ديالك')}"><svg class="nxp-contour" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${contour(mode==='result'?items:null)}</svg>${mode==='analyzing'?'<span class="nxp-scanclip"><i class="nxp-scan"></i></span>':''}${mode==='result'?`<div class="nxp-tags">${labels(items)}</div>`:''}</div>`:'';
  const noPhotoResult=mode==='result'&&!img;
  return `<section class="nv nxp" data-tool="plate" data-mode="${mode}" dir="${ARY?'rtl':'ltr'}" lang="${ARY?'ar':'fr'}">
  ${head()}
  <div class="nxp-vf ${noPhotoResult?'nophoto':''}">
   ${mode==='camera'?`<video class="nxp-video" playsinline muted autoplay></video><div class="nxp-empty">${I(ICO.camera,34)}<span>${L('Autorise la caméra ou choisis une photo','خلي الكاميرا تخدم ولا ختار تصويرة')}</span></div>${brackets()}`:''}
   ${shot}
   ${noPhotoResult?`<div class="nxp-dishicon">${food(S.result.dish,64)}</div>`:''}
   ${mode==='analyzing'?`<div class="nxp-status" role="status" aria-live="polite"><i></i><span>${LOAD[0]}</span></div>`:''}
   ${mode==='camera'?`<div class="nxp-ctrl">
     <button type="button" class="nxp-round" data-gallery aria-label="${L('Choisir une photo','ختار تصويرة')}">${I(ICO.gallery)}</button>
     <button type="button" class="nxp-shutter" data-shutter aria-label="${L('Prendre la photo','صور')}"><i></i></button>
     <button type="button" class="nxp-round" data-flash aria-pressed="false" aria-label="${L('Flash','الضو')}" disabled>${I(ICO.flash)}</button></div>`:''}
  </div>
  ${mode!=='result'?'<div class="nxp-diet-slot"></div>':''}
  <div class="nv-slot" data-slot="0" hidden><input type="file" accept="image/jpeg,image/png,image/webp" hidden></div>
  ${mode==='camera'?`<div class="nxp-below">
    <button type="button" class="nxp-pill" data-desc>${I(ICO.pen,18)}${L('Ou décris ton plat','ولا وصف الماكلة')}</button>
    <div class="nxp-dishes" data-lenis-prevent><span class="nxp-cap">${L('Plats marocains','أطباق مغربية')}</span><div>${DISHES.map(([n,fr,ar,k])=>`<button type="button" data-moro="${esc(n)}"><i>${foodK(k,26)}</i><span>${ARY?ar:fr}</span></button>`).join('')}</div></div>
    ${S.err?`<p class="nv-err">${I(ICO.warn,18)}${esc(S.err)}</p>`:''}
    ${hist||''}
  </div>`:''}
  ${mode==='photo'&&S.err?`<div class="nxp-below"><p class="nv-err">${I(ICO.warn,18)}${esc(S.err)}</p><button type="button" class="nxp-btn ghost nv-reset">${L('Reprendre','عاود')}</button></div>`:''}
  <div class="nxp-sheet-bg" data-sheet-close hidden></div>
  <div class="nxp-sheet" data-text-sheet hidden role="dialog" aria-label="${L('Décrire le plat','وصف الماكلة')}" data-lenis-prevent>
   <i class="nxp-grab" aria-hidden="true"></i>
   <div class="nxp-sheet-h"><h4>${L('Décris ton plat','وصف الماكلة')}</h4><button type="button" class="nxp-round sm" data-sheet-close aria-label="${L('Fermer','سد')}">${I(ICO.close,20)}</button></div>
   <div class="ch-add nv-text"><input type="text" maxlength="160" data-text value="${esc(S.text||'')}" placeholder="${L('Ex. couscous, tajine poulet, burger…','مثلا: كسكس، طاجين دجاج، برغر…')}" autocomplete="off"></div>
   <button type="button" class="nxp-btn primary nv-go" ${(img||(S.text&&S.text.trim()))&&!S.busy?'':'disabled'}>${L('Analyser','حلل')}</button>
  </div>
  ${mode==='result'?resultSheet(S)+'<div class="nxp-diet-slot"></div>':''}
 </section>`;
}

/* ---------------- comportements ---------------- */
let loadTimer=null;
function fit(el){const vf=el.querySelector('.nxp-vf'),sh=el.querySelector('.nxp-shot'),im=sh&&sh.querySelector('img');if(!sh||!im)return;
  const go=()=>{const W=vf.clientWidth,H=vf.clientHeight,iw=im.naturalWidth||1,ih=im.naturalHeight||1,k=Math.min(W/iw,H/ih);sh.style.width=Math.round(iw*k)+'px';sh.style.height=Math.round(ih*k)+'px'};
  im.complete?go():im.addEventListener('load',go,{once:true});}
function count(el){const n=el.querySelector('[data-count]');if(!n)return;const to=Number(n.dataset.count)||0;if(RM||!to){n.textContent=to;return}
  const t0=performance.now(),D=1100;const step=t=>{const k=Math.min(1,(t-t0)/D),e=1-Math.pow(1-k,3);n.textContent=Math.round(to*e);if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)}
/* ligne « régime & allergies » : sous le viseur sur cet écran, remise à sa place ailleurs */
const CHEV='<path d="m9 6 6 6-6 6"/>';
const SHIELD='<path d="M12 3 5 6v5c0 4.4 3 8.3 7 10 4-1.7 7-5.6 7-10V6z"/><path d="m9 12 2 2 4-4"/>';
function dietRow(box){if(!box)return;box.classList.add('nxp-row-host');box.setAttribute('dir',ARY?'rtl':'ltr');const sp=box.querySelector('.nt-diet-h>span');const hd=box.querySelector('.nt-diet-h');if(hd&&!hd.querySelector('.nxp-chev'))hd.insertAdjacentHTML('beforeend','<span class="nxp-chev" aria-hidden="true">'+I(CHEV,16)+'</span>');
  if(sp&&!sp.querySelector('.nxp-dico')){const txt=sp.textContent.replace(/^[^\p{L}]+/u,'').trim();sp.innerHTML='<i class="nxp-dico" aria-hidden="true">'+I(SHIELD,18)+'</i><span>'+esc(ARY?'الحمية والحساسية':(txt||'Mon régime & allergies'))+'</span>'}}
let dietObs=null,DIET=null;
function placeDiet(el){const box=DIET=DIET||document.getElementById('nt-diet'),slot=el&&el.querySelector('.nxp-diet-slot');if(!box)return;
  if(!dietObs){dietObs=new MutationObserver(()=>{if(document.body.classList.contains('nxp-on'))dietRow(box)});dietObs.observe(box,{childList:true})}
  if(slot&&document.body.classList.contains('nxp-on')){slot.replaceWith(box);dietRow(box)}}
function restoreDiet(){const box=DIET||document.getElementById('nt-diet'),ws=document.getElementById('ns-workspace');if(!box||!ws)return;
  box.classList.remove('nxp-row-host');box.removeAttribute('dir');if(box.parentNode!==ws.parentNode)ws.parentNode.insertBefore(box,ws)}
function bind(el,S){
  const st=window.__nxStudio;clearInterval(loadTimer);
  sync();placeDiet(el);
  const mode=el.dataset.mode;
  const slotIn=el.querySelector('.nv-slot input');
  slotIn&&slotIn.addEventListener('change',()=>{if(slotIn.files&&slotIn.files[0]){S.__auto=true;stopCam()}});
  // une photo vient d'être choisie ou prise → analyse directe
  if(mode==='photo'&&S.__auto&&!S.err){S.__auto=false;const go=el.querySelector('.nv-go');if(go&&!go.disabled){buzz(10);setTimeout(()=>go.click(),60)}}
  if(mode==='camera'){
    el.querySelector('[data-gallery]')?.addEventListener('click',()=>slotIn&&slotIn.click());
    el.querySelector('[data-shutter]')?.addEventListener('click',()=>{const v=el.querySelector('.nxp-video');const data=el.classList.contains('live')&&v?shoot(v):null;
      if(!data){slotIn&&slotIn.click();return}
      buzz(15);el.classList.add('flashfx');S.imgs[0]=data;S.result=null;S.gen=null;S.err='';S.genErr='';S.__auto=true;stopCam();setTimeout(()=>st&&st.render('plate'),RM?0:160)});
    el.querySelector('[data-flash]')?.addEventListener('click',async e=>{const b=e.currentTarget,t=track();if(!t)return;torch=!torch;try{await t.applyConstraints({advanced:[{torch}]});b.setAttribute('aria-pressed',String(torch));}catch{torch=false}});
  }
  // feuille « décrire »
  const sheet=el.querySelector('[data-text-sheet]'),bg=el.querySelector('.nxp-sheet-bg');
  const openSheet=o=>{sheet.hidden=!o;bg.hidden=!o;if(o)setTimeout(()=>sheet.querySelector('[data-text]')?.focus(),80)};
  el.querySelector('[data-desc]')?.addEventListener('click',()=>openSheet(true));
  el.querySelectorAll('[data-sheet-close]').forEach(b=>b.addEventListener('click',()=>openSheet(false)));
  if(S.__sheet){S.__sheet=false;openSheet(true)}
  el.querySelector('[data-text]')?.addEventListener('input',()=>{S.__sheet=false});
  // analyse en cours : textes qui changent
  if(mode==='analyzing'){fit(el);let k=0;const sp=el.querySelector('.nxp-status span');loadTimer=setInterval(()=>{if(!document.body.contains(sp))return clearInterval(loadTimer);k=(k+1)%LOAD.length;sp.classList.remove('in');void sp.offsetWidth;sp.textContent=LOAD[k];sp.classList.add('in')},1500)}
  if(mode==='photo')fit(el);
  if(mode==='result'){fit(el);
    if(S.__seen!==S.result){S.__seen=S.result;buzz([8,40,12]);el.classList.add('fresh');const vf=el.querySelector('.nxp-vf');if(vf){const y=vf.getBoundingClientRect().top+scrollY-70;window.__v16lenis?window.__v16lenis.scrollTo(y):scrollTo({top:y,behavior:RM?'auto':'smooth'})}}else el.classList.add('static');
    count(el);requestAnimationFrame(()=>requestAnimationFrame(()=>el.classList.add('go')));
  }
  // les étiquettes arrivent après la feuille : sinon la feuille masquerait l'animation
  window.addEventListener('resize',()=>fit(el),{passive:true});
}
/* robot masqué + caméra coupée quand on quitte l'écran */
function sync(){const on=!!document.querySelector('#page-studio.active .nxp');document.body.classList.toggle('nxp-on',on);if(!on)restoreDiet();else placeDiet(document.querySelector('#page-studio.active .nxp'));
  const cam=document.querySelector('#page-studio.active .nxp[data-mode="camera"]');if(!cam)stopCam();else if(!stream)startCam(cam)}
document.addEventListener('click',e=>{if(e.target.closest('.tab,[data-tab],[data-tool],.pulse-nav-links button'))setTimeout(sync,80)},true);
new MutationObserver(()=>setTimeout(sync,30)).observe(document.getElementById('page-studio')||document.body,{attributes:true,attributeFilter:['class']});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopCam();else sync()});
window.NxPlate={view,bind,sync,stop:stopCam};
// si l'écran a été dessiné avant le chargement de ce fichier, on le redessine
const redraw=()=>{const st=window.__nxStudio;if(st&&document.querySelector('#ns-tabs button.on[data-tool="plate"]')&&!document.querySelector('.nxp'))st.render('plate');sync()};
if(document.readyState==='complete')redraw();else window.addEventListener('load',redraw,{once:true});
})();
