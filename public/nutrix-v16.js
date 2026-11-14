/* NUTRIX v16 — scanner plein écran, icônes onboarding, robot unique,
   animations (GSAP + ScrollTrigger + Lenis) et effets inspirés de React Bits
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
   5. GSAP + ScrollTrigger + Lenis (chargés à la demande)
   ------------------------------------------------------------------ */
function load(src){return new Promise((ok,ko)=>{const s=document.createElement('script');s.src=src;s.async=true;s.crossOrigin='anonymous';s.onload=ok;s.onerror=ko;document.head.append(s)})}
async function motion(){
  if(REDUCED)return;
  try{
    await load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js');
    await load('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js');
  }catch{return}
  const gsap=window.gsap;if(!gsap)return;
  if(window.ScrollTrigger)gsap.registerPlugin(window.ScrollTrigger);
  // Lenis : défilement doux à la molette (le tactile reste natif)
  try{
    await load('https://unpkg.com/lenis@1.1.13/dist/lenis.min.js');
    if(window.Lenis&&matchMedia('(pointer:fine)').matches){
      $$('#v11-ai-drawer,.ob,.nt-phones,[class*="drawer"],[class*="modal"],[class*="sheet"]').forEach(el=>el.setAttribute('data-lenis-prevent',''));
      const lenis=new window.Lenis({duration:1.05,smoothWheel:true,syncTouch:false});
      window.__v16lenis=lenis;
      if(window.ScrollTrigger)lenis.on('scroll',window.ScrollTrigger.update);
      gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);
    }
  }catch{}
  // Hero : titre mot par mot (SplitText), puis texte et boutons
  const title=$('#pulse-hero-title');
  if(title&&$('#page-home.active')&&!ARY){
    const words=splitWords(title);
    const tl=gsap.timeline({defaults:{ease:'power3.out'}});
    if(words.length)tl.from(words,{yPercent:110,duration:.8,stagger:.06});
    tl.from('#pulse-home .pulse-hero-sub',{y:16,opacity:0,duration:.6},'-=.45')
      .from('#pulse-home .pulse-hero-cta>*',{y:22,opacity:0,duration:.55,stagger:.09,clearProps:'transform,opacity'},'-=.35');
    // sécurité : si l'onglet est en arrière-plan (animations gelées), tout s'affiche quand même
    setTimeout(()=>{if(tl.progress()<1)tl.progress(1)},2600);
  }
  // Apparition au défilement (sections sans système de révélation existant)
  if(window.ScrollTrigger){
    const reveal=(sel,o={})=>$$(sel).forEach(el=>{const tw=gsap.from(el,Object.assign({y:28,opacity:0,duration:.7,ease:'power2.out',clearProps:'transform,opacity',scrollTrigger:{trigger:el,start:'top 88%',once:true}},o));
      // sécurité : si le déclencheur ne part jamais, l'élément reste visible
      setTimeout(()=>{if(tw.progress()===0&&el.getBoundingClientRect().top<innerHeight)tw.progress(1)},4000)});
    reveal('#nt-tour .nt-tour-top');
    reveal('#pulse-home .pulse-section-head');
    reveal('.mr-promo',{y:36});
    const items=$('#nx-morocco-items');
    if(items){const run=()=>{const kids=[...items.children].filter(k=>!k.dataset.v16in);if(!kids.length)return;kids.forEach(k=>k.dataset.v16in='1');gsap.from(kids,{y:24,opacity:0,duration:.6,stagger:.07,ease:'power2.out',clearProps:'transform,opacity',scrollTrigger:{trigger:items,start:'top 90%',once:true}})};run();new MutationObserver(run).observe(items,{childList:true})}
    // les pages changent de hauteur quand on change d'onglet
    document.addEventListener('click',e=>{if(e.target.closest('.tab,[data-tab]'))setTimeout(()=>window.ScrollTrigger.refresh(),350)});
  }
  // Magnet : le bouton principal suit légèrement le pointeur (souris seulement)
  if(matchMedia('(pointer:fine)').matches){
    $$('.nx-big-primary,#nutri-scan-btn').forEach(b=>{
      b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();gsap.to(b,{x:(e.clientX-r.left-r.width/2)*.12,y:(e.clientY-r.top-r.height/2)*.22,duration:.4,ease:'power3.out'})});
      b.addEventListener('pointerleave',()=>gsap.to(b,{x:0,y:0,duration:.6,ease:'elastic.out(1,.4)'}));
    });
  }
}

function init(){
  setupScanner('nutri-scan-box','nutri-scan-stop','nutri-query');
  setupScanner('scan-box','scan-stop','barcode-q');
  shiny();spotlight();
  // le tour est créé par nutrix-app.js : on attend qu'il existe
  let n=0;const wait=setInterval(()=>{if($('#nt-tour .nt-mascot')||++n>40){clearInterval(wait);oneRobot();motion()}},150);
}
if(document.readyState==='complete')init();else window.addEventListener('load',init,{once:true});
})();
