/* NUTRIX v16 — scanner plein écran, icônes onboarding, robot unique,
   animations (GSAP) et effets inspirés de React Bits
   (SplitText, ShinyText, SpotlightCard, Magnet) réécrits en JS léger. */
(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const ARY=(()=>{try{return localStorage.getItem('sd-v111-language')==='ary'}catch{return false}})();
const L=(fr,ar)=>ARY?ar:fr;
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
const svg=(d,w=24)=>'<svg viewBox="0 0 24 24" width="'+w+'" height="'+w+'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+d+'</svg>';
const ICON={
  close:'<path d="M6 6l12 12M18 6 6 18"/>',
  torch:'<path d="M8 3h8l-1.5 5h-5z"/><path d="M9.5 8h5v4.5L13 21h-2l-1.5-8.5z"/><path d="M12 12v2"/>',
  keypad:'<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10"/>',
  lose:'<path d="M12 21a7 7 0 0 0 7-7c0-4-3-6.5-4.5-10-1 2.5-2.2 3.6-3.5 4.5C9 6.5 8 5 8 5c-2 2.5-3 5.5-3 9a7 7 0 0 0 7 7Z"/><path d="M12 21a2.8 2.8 0 0 1-2.8-2.8c0-1.6 1.3-2.6 2.8-4.2 1.5 1.6 2.8 2.6 2.8 4.2A2.8 2.8 0 0 1 12 21Z"/>',
  maintain:'<path d="M12 4v16M7 20h10"/><path d="M5 8h14"/><path d="M5 8 2.5 14a3 3 0 0 0 5 0z"/><path d="M19 8l-2.5 6a3 3 0 0 0 5 0z"/>',
  gain:'<path d="M6.5 6.5v11M17.5 6.5v11"/><path d="M3.5 9v6M20.5 9v6"/><path d="M6.5 12h11"/>'
};

/* ------------------------------------------------------------------
   1. Scanner plein écran
   ------------------------------------------------------------------ */
function setupScanner(boxId,stopId,inputId){
  const box=document.getElementById(boxId);if(!box||box.dataset.v16)return;box.dataset.v16='1';
  // sorti des cartes (leurs transform/filter emprisonnent position:fixed) → vrai plein écran
  document.body.append(box);
  box.setAttribute('data-lenis-prevent','');
  box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label',L('Scanner un code-barres','سكاني الكود-بار'));
  const ui=document.createElement('div');ui.className='v16-scan-ui';
  ui.innerHTML=
    '<div class="v16-scan-top"><button type="button" class="v16-scan-btn" data-close aria-label="'+L('Fermer le scanner','سد السكانير')+'">'+svg(ICON.close)+'</button>'+
    '<strong>'+L('Scanner','سكانير')+'</strong>'+
    '<button type="button" class="v16-scan-btn" data-torch aria-pressed="false" aria-label="'+L('Lampe','الضو')+'" hidden>'+svg(ICON.torch)+'</button></div>'+
    '<div class="v16-scan-window" aria-hidden="true"><i></i><i></i><i></i><i></i></div>'+
    '<div class="v16-scan-bottom"><p>'+L('Place le code-barres dans le cadre','حط الكود-بار وسط الإطار')+'</p>'+
    '<button type="button" class="v16-scan-type" data-type>'+svg(ICON.keypad)+L('Taper le code','كتب الكود')+'</button>'+
    '<small>'+L('La détection est automatique','كيتقرا بوحدو')+'</small></div>';
  box.append(ui);
  const close=()=>{document.getElementById(stopId)?.click();box.hidden=true;sync()};
  const video=box.querySelector('video');
  const track=()=>{const s=video&&video.srcObject;return s&&s.getVideoTracks?s.getVideoTracks()[0]:null};
  const torchBtn=ui.querySelector('[data-torch]');
  const checkTorch=()=>{const t=track();let ok=false;try{ok=!!(t&&t.getCapabilities&&t.getCapabilities().torch)}catch{}torchBtn.hidden=!ok;torchBtn.setAttribute('aria-pressed','false')};
  video&&video.addEventListener('loadedmetadata',checkTorch);
  torchBtn.addEventListener('click',async()=>{const t=track();if(!t)return;const on=torchBtn.getAttribute('aria-pressed')!=='true';try{await t.applyConstraints({advanced:[{torch:on}]});torchBtn.setAttribute('aria-pressed',String(on))}catch{}});
  ui.querySelector('[data-close]').addEventListener('click',close);
  ui.querySelector('[data-type]').addEventListener('click',()=>{close();const i=document.getElementById(inputId);if(i){i.scrollIntoView({block:'center'});setTimeout(()=>i.focus(),150)}});
  const sync=()=>{const open=$$('#nutri-scan-box,#scan-box').some(b=>!b.hidden);document.documentElement.classList.toggle('v16-scan-open',open);if(open&&!box.hidden)setTimeout(()=>ui.querySelector('[data-close]').focus(),50);window.__v16lenis&&(open?window.__v16lenis.stop():window.__v16lenis.start())};
  new MutationObserver(sync).observe(box,{attributes:true,attributeFilter:['hidden']});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!box.hidden)close()});
}

/* ------------------------------------------------------------------
   2. Onboarding : icônes au trait au lieu des emoji
   ------------------------------------------------------------------ */
function obIcons(root){$$('.ob-goal[data-goal]>b',root).forEach(b=>{if(b.dataset.v16)return;const k=b.parentElement.dataset.goal;const d=ICON[k];if(!d)return;b.dataset.v16='1';b.innerHTML=svg(d)})}
new MutationObserver(()=>{const ob=$('.ob');if(ob)obIcons(ob)}).observe(document.body,{childList:true,subtree:true});

/* ------------------------------------------------------------------
   3. Un seul robot visible : le bouton flottant se cache quand la
      mascotte du tour est à l'écran.
   ------------------------------------------------------------------ */
function oneRobot(){
  const m=$('#nt-tour .nt-mascot'),fab=$('#v11-ai-launch');if(!m||!fab||!('IntersectionObserver' in window))return;
  fab.style.transition='opacity .25s, transform .25s';
  new IntersectionObserver(([e])=>{const show=!e.isIntersecting||!$('#page-home.active');fab.style.opacity=show?'':'0';fab.style.transform=show?'':'scale(.6)';fab.style.pointerEvents=show?'':'none'},{threshold:.35}).observe(m);
}

/* ------------------------------------------------------------------
   4. Effets façon React Bits (sans React)
   ------------------------------------------------------------------ */
function splitWords(el){
  if(!el||el.dataset.v16split)return [];el.dataset.v16split='1';el.classList.add('v16-split');
  const inner=[];
  [...el.childNodes].forEach(n=>{if(n.nodeType!==3)return;const frag=document.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach(p=>{if(!p)return;if(/^\s+$/.test(p)){frag.append(p);return}const w=document.createElement('span');w.className='w';const s=document.createElement('span');s.textContent=p;w.append(s);frag.append(w);inner.push(s)});
    n.replaceWith(frag)});
  el.setAttribute('aria-label',el.textContent.replace(/\s+/g,' ').trim());
  return inner;
}
function spotlight(){
  const sel='.card,.nx-big,.mr-promo,.nx-morocco-items>*';
  document.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest(sel);if(!c)return;c.classList.add('v16-spot');const r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')},{passive:true});
}
function shiny(){const e=$('#pulse-home .pulse-eyebrow');if(e)e.classList.add('v16-shiny')}

/* ------------------------------------------------------------------
   5. Animations : GSAP seul, chargé à la demande.
   Le défilement reste celui du navigateur (fil du compositeur) : pas de Lenis ni de
   ScrollTrigger, qui faisaient défiler et recalculer en JavaScript à chaque image et
   provoquaient saccades / sauts sur ordinateur dès que la page était occupée.
   Les apparitions au défilement passent par IntersectionObserver (aucun calcul au scroll).
   ------------------------------------------------------------------ */
function load(src){return new Promise((ok,ko)=>{const s=document.createElement('script');s.src=src;s.async=true;s.crossOrigin='anonymous';s.onload=ok;s.onerror=ko;document.head.append(s)})}
function revealOnView(els,gsap,o={}){if(!els.length)return;
  const io=new IntersectionObserver(list=>list.forEach(en=>{if(!en.isIntersecting)return;io.unobserve(en.target);gsap.fromTo(en.target,{y:o.y||24,opacity:0},{y:0,opacity:1,duration:.6,ease:'power2.out',delay:(o.stagger||0)*(o.index?o.index(en.target):0),clearProps:'transform,opacity'})}),{rootMargin:'0px 0px -10% 0px'});
  els.forEach(el=>{if(el.getBoundingClientRect().top<innerHeight*0.9)return;io.observe(el)});}
async function motion(){
  if(REDUCED)return;
  try{await load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js')}catch{return}
  const gsap=window.gsap;if(!gsap)return;
  // Hero : titre mot par mot (SplitText), puis texte et boutons
  const title=$('#pulse-hero-title');
  if(title&&$('#page-home.active')&&!ARY){
    const words=splitWords(title);
    const tl=gsap.timeline({defaults:{ease:'power3.out'}});
    if(words.length)tl.from(words,{yPercent:110,duration:.8,stagger:.06});
    tl.from('#pulse-home .pulse-hero-sub',{y:16,opacity:0,duration:.6},'-=.45')
      .from('#pulse-home .pulse-hero-cta>*',{y:22,opacity:0,duration:.55,stagger:.09,clearProps:'transform,opacity'},'-=.35');
    setTimeout(()=>{if(tl.progress()<1)tl.progress(1)},2600);
  }
  // apparition des sections hors écran (seulement celles qui ne sont pas déjà visibles)
  revealOnView($$('#nt-tour .nt-tour-top,#pulse-home .pulse-section-head,.mr-promo'),gsap);
  // Magnet : le bouton principal suit légèrement le pointeur (souris seulement)
  if(matchMedia('(pointer:fine)').matches){
    $$('.nx-big-primary,#nutri-scan-btn').forEach(b=>{
      b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.12,y:(e.clientY-r.top-r.height/2)*.22,duration:.4,ease:'power3.out',overwrite:true})});
      b.addEventListener('pointerleave',()=>gsap.to(b,{x:0,y:0,duration:.6,ease:'elastic.out(1,.4)',overwrite:true}));
    });
  }
}

/* changement de page : on ferme le chat (son robot 3D cesse de tourner en arrière-plan) */
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('.tab[data-tab],[data-tab]');if(!t)return;
  if(t.dataset.tab!=='ai'){const d=document.getElementById('v11-ai-drawer');if(d&&d.classList.contains('open'))document.getElementById('v11-ai-close')?.click()}},true);
/* classe .v16-still sur les blocs animés pendant le défilement (met en pause les animations décoratives) */
{let st=0,boxes=[];const SEL='.nt-tour,.nt-scanhero,.mr-promo,.pulse-hero,#v11-ai-launch';const set=on=>{if(on)boxes=[...document.querySelectorAll(SEL)];boxes.forEach(b=>b.classList.toggle('v16-still',on))};
 addEventListener('scroll',()=>{if(!st)set(true);clearTimeout(st);st=setTimeout(()=>{st=0;set(false)},180)},{passive:true})} // classe posée sur 5 blocs seulement : recalcul de style limité
/* changement de thème : fondu court (classe posée 350 ms seulement) */
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#dark-btn,[data-switch="autodark"]')){const r=document.documentElement;r.classList.add('theme-switching');setTimeout(()=>r.classList.remove('theme-switching'),350)}},true);
function init(){
  setupScanner('nutri-scan-box','nutri-scan-stop','nutri-query');
  setupScanner('scan-box','scan-stop','barcode-q');
  shiny();spotlight();
  // le tour est créé par nutrix-app.js : on attend qu'il existe
  let n=0;const wait=setInterval(()=>{if($('#nt-tour .nt-mascot')||++n>40){clearInterval(wait);oneRobot();motion()}},150);
}
if(document.readyState==='complete')init();else window.addEventListener('load',init,{once:true});
})();

/* ==========================================================================
   Recherche d'un produit après un scan : écran d'attente animé
   (code-barres qui se « lit », étapes des sources). Branché sur fetch :
   toute demande /api/off/product/<code> l'affiche jusqu'à la réponse.
   ========================================================================== */
(()=>{'use strict';
const ARY=(()=>{try{return localStorage.getItem('sd-v111-language')==='ary'}catch{return false}})();
const L=(fr,ar)=>ARY?ar:fr;
let box=null,t2=null,shownAt=0;
function bars(code){let h='',x=0;const s=String(code);for(let i=0;i<46;i++){const w=1+((s.charCodeAt(i%s.length)+i*7)%3);if(i%2===0)h+=`<rect x="${x}" y="0" width="${w}" height="60"/>`;x+=w+1}return `<svg viewBox="0 0 ${x} 60" preserveAspectRatio="none" aria-hidden="true">${h}</svg>`}
function show(code){
  if(!box){box=document.createElement('div');box.className='v16-find';box.setAttribute('role','status');box.setAttribute('aria-live','polite');box.setAttribute('dir',ARY?'rtl':'ltr');document.body.append(box)}
  box.innerHTML=`<div class="v16-find-card"><div class="v16-find-code">${bars(code)}<i class="v16-find-beam"></i></div>
   <strong>${L('Je cherche le produit…','كنقلب على المنتوج…')}</strong><small dir="ltr">${code}</small>
   <ol class="v16-find-steps"><li class="on">${L('Open Food Facts','Open Food Facts')}</li><li>${L('Autres bases de codes-barres','قواعد أخرى ديال الكود-بار')}</li><li>${L('Valeurs nutritionnelles','القيم الغذائية')}</li></ol></div>`;
  box.hidden=false;document.documentElement.classList.add('v16-finding');shownAt=Date.now();
  clearTimeout(t2);t2=setTimeout(()=>{const li=box.querySelectorAll('.v16-find-steps li');li[0]?.classList.replace('on','done');li[1]?.classList.add('on');t2=setTimeout(()=>{li[1]?.classList.replace('on','done');li[2]?.classList.add('on')},2600)},2200);
}
function hide(){if(!box)return;const wait=Math.max(0,700-(Date.now()-shownAt));setTimeout(()=>{clearTimeout(t2);box.hidden=true;document.documentElement.classList.remove('v16-finding')},wait)}
window.NxFind={show,hide};
const of=window.fetch.bind(window);
window.fetch=function(input,init){const u=typeof input==='string'?input:(input&&input.url)||'';const m=u.match(/\/api\/off\/product\/(\d{8,14})/);
  if(!m)return of(input,init);show(m[1]);const p=of(input,init);p.then(hide,hide);return p};
})();
