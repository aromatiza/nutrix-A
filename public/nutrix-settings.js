/* NUTRIX — écran Réglages (profil, activité, objectif, modes) + mode Ramadan.
   Les champs gardent leurs ids / data-setting : l'enregistrement reste celui de nutrix-core.js
   (écouteurs « input » et « change » sur le document, boutons calc-btn / use-calc / ramadan-btn). */
(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const ARY=(()=>{try{return localStorage.getItem('sd-v111-language')==='ary'}catch{return false}})();
const L=(fr,ar)=>ARY?ar:fr;
const S=()=>{try{return state.settings}catch{return {}}}; // « state » : variable globale de nutrix-core.js
const svg=d=>'<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+d+'</svg>';
const ICO={
  lose:'<path d="M12 21a7 7 0 0 0 7-7c0-4-3-6.5-4.5-10-1 2.5-2.2 3.6-3.5 4.5C9 6.5 8 5 8 5c-2 2.5-3 5.5-3 9a7 7 0 0 0 7 7Z"/>',
  maintain:'<path d="M12 4v16M7 20h10M5 8h14"/><path d="M5 8 2.5 14a3 3 0 0 0 5 0zM19 8l-2.5 6a3 3 0 0 0 5 0z"/>',
  gain:'<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>'
};
const fire=(el,type)=>el.dispatchEvent(new Event(type,{bubbles:true}));

/* ---------- réglages ---------- */
function pick(group,v){const sel=$('#sheet select[data-setting="'+group.dataset.for+'"]');if(!sel)return;sel.value=v;fire(sel,'change');sync();recalc()}
function sync(){
  const s=S();
  $$('#sheet [data-for]').forEach(g=>{const v=String(s[g.dataset.for]??$('#sheet select[data-setting="'+g.dataset.for+'"]')?.value??'');
    g.querySelectorAll('[data-v]').forEach(b=>{const on=b.dataset.v===v;b.classList.toggle('on',on);b.setAttribute('aria-checked',String(on))})});
  const r=$('#sheet [data-switch="ramadan"]'),d=$('#sheet [data-switch="autodark"]');
  r&&r.setAttribute('aria-checked',String(!!s.ramadan));d&&d.setAttribute('aria-checked',String(!!s.autoDark));
  $('#sheet .nxs-maghrib')?.classList.toggle('show',!!s.ramadan);
  ramadanTheme();
}
function tdee(){const s=S();const w=+s.weight,h=+s.height,a=+s.age;if(!(w&&h&&a))return null;
  const bmr=10*w+6.25*h-5*a+(s.sex==='f'?-161:5);return Math.round((bmr*parseFloat(s.activity||1.55)+(s.goal==='lose'?-500:s.goal==='gain'?300:0))/10)*10}
let rt=0;function recalc(){clearTimeout(rt);rt=setTimeout(()=>{const k=tdee();const out=$('#nxs-kcal');if(out)out.textContent=k?k.toLocaleString(ARY?'fr-MA':'fr-FR'):'—';
  $('#nxs-result')?.classList.toggle('ready',!!k);if(k)$('#calc-btn')?.click();else{$('#calc-result')&&($('#calc-result').textContent=L('Remplis l’âge, la taille et le poids.','عمّر العمر، الطول والوزن.'))}},150)}
function setup(){
  const sheet=$('#sheet');if(!sheet||sheet.dataset.nxs)return;sheet.dataset.nxs='1';sheet.querySelector('.nxs')?.setAttribute('dir',ARY?'rtl':'ltr');
  $$('#sheet [data-ico]').forEach(i=>i.innerHTML=svg(ICO[i.dataset.ico]||''));
  $$('#sheet [data-for]').forEach(g=>g.addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(b)pick(g,b.dataset.v)}));
  $$('#sheet [data-step]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();const inp=b.parentElement.querySelector('input');const step=parseFloat(b.dataset.step);
    const ph=parseFloat(inp.placeholder)||0;let v=parseFloat(String(inp.value).replace(',','.'));if(!Number.isFinite(v))v=ph;v=Math.max(0,Math.round((v+step)*10)/10);inp.value=String(v);fire(inp,'input');fire(inp,'change');recalc()}));
  sheet.addEventListener('input',e=>{if(e.target.matches('[data-setting="age"],[data-setting="height"],[data-setting="weight"]'))recalc()});
  $('#sheet [data-switch="ramadan"]')?.addEventListener('click',()=>{$('#ramadan-btn')?.click();sync()});
  $('#sheet [data-switch="autodark"]')?.addEventListener('click',()=>{$('#autodark-btn')?.click();sync()});
  $('#use-calc')?.addEventListener('click',()=>setTimeout(()=>{const b=$('#use-calc');if(b){b.textContent=L('Appliqué ✓','تطبّق ✓');setTimeout(()=>b.textContent=L('Appliquer','طبّق'),1600)}},0));
  // ouverture : nutrix-core remplit les champs, puis on met à jour l'affichage
  $('#settings-btn')?.addEventListener('click',()=>setTimeout(()=>{sync();recalc()},0));
  // glisser vers le bas pour fermer (téléphone)
  const card=sheet.querySelector('.nxs');let y0=null,dy=0;
  card.addEventListener('touchstart',e=>{if(card.scrollTop>0)return;y0=e.touches[0].clientY;dy=0},{passive:true});
  card.addEventListener('touchmove',e=>{if(y0==null)return;dy=Math.max(0,e.touches[0].clientY-y0);card.style.transform=dy?`translateY(${dy}px)`:''},{passive:true});
  card.addEventListener('touchend',()=>{if(y0==null)return;card.style.transform='';if(dy>110)$('#close-sheet')?.click();y0=null});
  sync();
}

/* ---------- mode Ramadan ---------- */
const MOON='<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>';
function ftourText(){const m=S().maghrib;if(!m)return L('Ajoute l’heure du ftour dans les réglages','زيد وقت الفطور فالإعدادات');
  const [h,mi]=m.split(':').map(Number);const t=new Date();t.setHours(h,mi,0,0);const diff=Math.round((t-new Date())/60000);
  if(diff<0)return L('Ftour passé · Saha ftourkoum','الفطور فات · صحة فطوركم');
  const hh=Math.floor(diff/60),mm=String(diff%60).padStart(2,'0');return L(`Ftour dans ${hh} h ${mm}`,`الفطور من دابا ${hh} س ${mm} د`)+' · '+m}
function ramadanChip(){const inner=$('#pulse-home .pulse-hero-inner');let chip=$('#nx-ramadan-chip');
  if(!S().ramadan){chip&&chip.remove();return}
  if(!inner)return;if(!chip){chip=document.createElement('button');chip.type='button';chip.id='nx-ramadan-chip';chip.className='nx-ramadan-chip';chip.addEventListener('click',()=>$('#settings-btn')?.click());inner.prepend(chip)}
  chip.innerHTML=svg(MOON)+'<span><b>'+L('Ramadan moubarak','رمضان مبارك')+'</b><small>'+ftourText()+'</small></span>'}
function ramadanTheme(){const on=!!S().ramadan;document.body.classList.toggle('nx-ramadan',on);ramadanChip()}

function init(){setup();ramadanTheme();setInterval(()=>{if(S().ramadan)ramadanChip()},60000)}
if(document.readyState==='complete')init();else window.addEventListener('load',init,{once:true});
window.NxSettings={sync,ramadanTheme};
})();
