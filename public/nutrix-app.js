/* Nutrix — nutrix-app.js : nutrix-pulse-home.js, nutrix-food-tracker.js, nutrix-health-dashboard.js, nutrix-ai-copilot.js, nutrix-studio.js, nutrix-studio-vision.js, nutrix-pro-final.js, nutrix-simplify.js, nutrix-touch.js, nutrix-additives.js (ordre d’origine conservé). */

/* ===== nutrix-pulse-home.js ===== */
try{
/* Visual-only adapter: reads already-computed Nutrix DOM metrics; no mock records, no API changes. */
(()=>{'use strict';
 const menu=document.getElementById('pulse-menu-btn');const links=document.getElementById('pulse-nav-links');
 if(menu&&links){menu.addEventListener('click',()=>{const open=links.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});links.addEventListener('click',e=>{if(e.target.closest('[data-tab]')){links.classList.remove('open');menu.setAttribute('aria-expanded','false');}});}
 const pairs=[['nx-fit-score','pulse-score'],['nx-fit-cal','pulse-calories'],['nx-home-pro','pulse-protein'],['nx-fit-cal-goal','pulse-goal']];
 const sync=()=>pairs.forEach(([source,target])=>{const a=document.getElementById(source),b=document.getElementById(target);if(!a||!b)return;let value=a.textContent.trim();if(source==='nx-fit-score')value=value.replace(/\s*\/100.*/,'').trim();if(source==='nx-fit-cal-goal'){const found=value.match(/[\d\s.,]+/);value=found?found[0].trim():'—';}if(source==='nx-home-pro')value=value.replace(/g\s*$/i,'');if(value)b.textContent=value;});
 sync();const sources=pairs.map(([id])=>document.getElementById(id)).filter(Boolean);if(sources.length){const observer=new MutationObserver(sync);sources.forEach(el=>observer.observe(el,{childList:true,characterData:true,subtree:true}));}
})();

/* Bind template metric rings/bars only to existing computed Nutrix DOM. */
(()=>{'use strict';
const grab=(id)=>document.getElementById(id)?.textContent||'';
const num=(v)=>{const m=String(v).replace(/\s/g,'').match(/-?\d+(?:[.,]\d+)?/);return m?Number(m[0].replace(',','.')):NaN;};
const ids=['nx-fit-score','nx-fit-cal','nx-fit-cal-goal','nx-home-pro','nx-home-pro-goal','nx-home-fat','nx-home-fat-goal','nx-home-carb','nx-home-carb-goal'];
const put=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=Number.isFinite(value)?Math.round(value).toLocaleString('fr-FR'):'—'};
const ring=(id,value,goal)=>{const el=document.getElementById(id);if(el)el.style.setProperty('--pct',String(Number.isFinite(value)&&Number.isFinite(goal)&&goal>0?Math.max(0,Math.min(100,value/goal*100)):0));};
function update(){const [score,cal,goal,pro,proGoal,fat,fatGoal,carb,carbGoal]=ids.map(i=>num(grab(i)));
put('pulse-score',score);put('pulse-calories',cal);put('pulse-goal',goal);put('pulse-protein',pro);put('pulse-protein-goal',proGoal);put('pulse-fat',fat);put('pulse-fat-goal',fatGoal);put('pulse-carb',carb);put('pulse-carb-goal',carbGoal);
ring('pulse-ring-score',score,100);ring('pulse-ring-cal',cal,goal);ring('pulse-ring-pro',pro,proGoal);
for(const [key,value,total] of [['fat',fat,fatGoal],['carb',carb,carbGoal]]){const el=document.getElementById('pulse-'+key+'-bar');if(el)el.style.width=(Number.isFinite(value)&&Number.isFinite(total)&&total>0?Math.max(0,Math.min(100,value/total*100)):0)+'%';}}
let queued=false;const schedule=()=>{if(!queued){queued=true;queueMicrotask(()=>{queued=false;update()})}};
const nodes=ids.map(i=>document.getElementById(i)).filter(Boolean);if(nodes.length){const observer=new MutationObserver(schedule);nodes.forEach(n=>observer.observe(n,{childList:true,characterData:true,subtree:true}));}update();
})();
}catch(e){console.error("[Nutrix] nutrix-pulse-home.js",e)}

/* ===== nutrix-food-tracker.js ===== */
try{
/* V6: presentation-only enhancement. Existing Nutrix event handlers are retained. */
(()=>{'use strict';
const icon=(paths)=>`<svg viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
const icons={camera:icon('<path d="M4 7h4l2-3h4l2 3h4v13H4z"/><circle cx="12" cy="13" r="3.2"/>'),scan:icon('<path d="M7 3H4v5m13-5h3v5M4 16v5h4m12-5v5h-4M4 12h16"/>'),ai:icon('<path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z"/>'),search:icon('<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>')};
function initialize(){
 const health=document.getElementById('page-health'),input=document.getElementById('food-q'),addButton=document.getElementById('food-search-btn'),results=document.getElementById('food-results'),frequent=document.getElementById('frequent-list');
 if(!health||!input||!addButton||!results||!frequent||document.querySelector('.nx-food-tracker'))return;
 const block=input.closest('.block'),card=block?.querySelector(':scope > .card');if(!card)return;
 block.classList.add('nx-food-tracker');
 const head=document.createElement('div');head.className='nx-ft-header';head.innerHTML=`<div><span class="nx-ft-kicker">NUTRIX · SUIVI DES REPAS</span><h2>Ajouter un aliment</h2><p>Suivez votre alimentation en toute simplicité.</p></div><div class="nx-ft-actions"><button class="nx-ft-icon" type="button" data-action="scan" aria-label="Scanner un code-barres" title="Scanner">${icons.scan}</button><button class="nx-ft-icon" type="button" data-action="photo" aria-label="Analyser une photo" title="Photo IA">${icons.camera}</button><button class="nx-ft-icon" type="button" data-action="ai" aria-label="Ouvrir l'assistant IA" title="Space AI">${icons.ai}</button></div>`;
 card.prepend(head);
 const searchRow=input.closest('.form-row');const search=document.createElement('div');search.className='nx-ft-search';search.innerHTML=icons.search;search.append(input,addButton);head.after(search);searchRow?.remove();input.placeholder='Aliment, marque ou code-barres…';input.setAttribute('aria-label','Aliment, marque ou code-barres');
 const barcode=document.getElementById('barcode-q')?.closest('.form-row');if(barcode){barcode.classList.add('nx-ft-barcode');barcode.hidden=true;search.after(barcode)}
 const tabs=document.createElement('div');tabs.className='nx-ft-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Catégories alimentaires');
 const choices=[['results','Résultats'],['frequent','Fréquents']];choices.forEach(([id,label],i)=>{const b=document.createElement('button');b.type='button';b.className='nx-ft-tab';b.setAttribute('role','tab');b.dataset.pane=id;b.setAttribute('aria-selected',String(i===0));b.textContent=label;tabs.append(b)});
 const resPane=document.createElement('div');resPane.className='nx-ft-pane';resPane.dataset.pane='results';resPane.setAttribute('role','tabpanel');resPane.append(results);
 const freqPane=document.createElement('div');freqPane.className='nx-ft-pane';freqPane.dataset.pane='frequent';freqPane.setAttribute('role','tabpanel');freqPane.hidden=true;freqPane.append(frequent);
 const status=document.getElementById('food-msg');status?.classList.add('nx-ft-status');
 const portion=document.getElementById('food-grams')?.closest('.inline');portion?.classList.add('nx-ft-portion');
 const anchor=card.querySelector('.ai-nutrition-panel');if(anchor){anchor.classList.add('nx-ft-ai-panel');anchor.hidden=true;}
 if(status)status.before(tabs,resPane,freqPane);else card.append(tabs,resPane,freqPane);
 function openPane(pane){tabs.querySelectorAll('[data-pane]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.pane===pane)));resPane.hidden=pane!=='results';freqPane.hidden=pane!=='frequent'}
 tabs.addEventListener('click',e=>{const tab=e.target.closest('[data-pane]');if(tab)openPane(tab.dataset.pane)});
 addButton.addEventListener('click',()=>openPane('results'));
 const barcodeBtn=document.getElementById('barcode-btn');barcodeBtn?.addEventListener('click',()=>openPane('results'));
 head.addEventListener('click',e=>{const button=e.target.closest('[data-action]');if(!button)return;const action=button.dataset.action;if(action==='scan'){if(barcode){barcode.hidden=false;barcode.scrollIntoView({behavior:'smooth',block:'nearest'})}document.getElementById('scan-btn')?.click();}else if(action==='photo'){if(anchor){anchor.hidden=false;anchor.scrollIntoView({behavior:'smooth',block:'nearest'})}document.getElementById('ai-product-photo')?.click();}else if(action==='ai'){const launch=document.getElementById('v11-ai-launch');if(launch)launch.click();else document.querySelector('.pulse-nav-links .tab[data-tab="ai"]')?.click()}});
 if(anchor){const file=document.getElementById('ai-product-photo');file?.addEventListener('change',()=>{anchor.hidden=false})}
 const codeInput=document.getElementById('barcode-q');input.addEventListener('input',()=>{if(/^\d{8,14}$/.test(input.value.replace(/\s/g,''))){if(barcode)barcode.hidden=false;if(codeInput)codeInput.value=input.value.replace(/\s/g,'')}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
})();
}catch(e){console.error("[Nutrix] nutrix-food-tracker.js",e)}

/* ===== nutrix-health-dashboard.js ===== */
try{
/* Nutrix Santé layout adapter. Real values only; existing health tools stay mounted. */
(()=>{'use strict';
const svg=(content)=>`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${content}</svg>`;
const icons={
  plus:svg('<path d="M12 5v14M5 12h14"/>'),
  heart:svg('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>'),
  food:svg('<path d="M5 3v7m4-7v7M5 7h4M7 10v11M17 3v18M17 3c-3 4-3 8 0 10"/>'),
  chart:svg('<path d="m3 18 6-6 4 3 8-9"/>'),
  scan:svg('<path d="M7 3H4v5m13-5h3v5M4 16v5h4m12-5v5h-4M4 12h16"/>')
};
const COVER={'nh-activity':'health-photo','nh-overview':'home-photo','nh-heart':'journal-photo','nh-output':'project-photo','nh-recommend':'scanner-photo'};
const card=(extra,title,body)=>{const c=COVER[extra];return `<section class="nh-card ${extra}">${c?`<div class="nh-cover" style="--img:url(assets/sections/${c}.webp)"></div>`:''}<header class="nh-card-head"><h3>${title}</h3></header>${body}</section>`};
function init(){
  const health=document.getElementById('page-health');
  if(!health || document.getElementById('nh-dashboard')) return;
  const dashboard=document.createElement('div');
  dashboard.id='nh-dashboard';
  dashboard.className='nh-dashboard';
  dashboard.innerHTML=`
  <div class="nh-welcome">
    <div>
      <span class="nh-overline">NUTRIX · SANTÉ</span>
      <h2>Votre santé, en un regard.</h2>
      <p>Suivi nutritionnel et bien-être à partir de vos données réellement enregistrées.</p>
    </div>
    <div class="nh-welcome-actions">
      <button type="button" data-nh="add">${icons.food}<span>Ajouter un aliment</span></button>
      <button type="button" data-nh="scan">${icons.scan}<span>Scanner</span></button>
      <button type="button" data-nh="tools">${icons.chart}<span>Mes outils</span></button>
    </div>
  </div>
  <div class="nh-grid">
    ${card('nh-activity','Activité <span class="nh-muted nh-filter">7 derniers jours</span>','<div class="nh-bars" id="nh-bars"><p class="nh-empty">Ajoutez des repas pour voir votre activité.</p></div>')}
    ${card('nh-overview','Aujourd’hui','<div class="nh-overview-body"><div class="nh-donut" id="nh-donut" style="--percent:0"><div><b id="nh-kcal">—</b><small>kcal aujourd’hui</small></div></div><div class="nh-macros" id="nh-macros"></div></div>')}
    ${card('nh-goals','Objectifs du jour','<div class="nh-goal-track"><article class="nh-goal nh-goal-one"><small>Calories</small><b id="nh-goalcal">—</b><span>Progression énergétique</span><div class="nh-wave"><img src="assets/sections/journal-photo.webp" alt="Repas équilibré et suivi des calories" loading="lazy"></div></article><article class="nh-goal nh-goal-two"><small>Protéines</small><b id="nh-goalpro">—</b><span>Apport protéines</span><div class="nh-wave"><img src="assets/sections/scanner-photo.webp" alt="Produit riche en protéines" loading="lazy"></div></article><article class="nh-goal nh-goal-three"><small>Équilibre</small><b id="nh-goalwater">—</b><span>Suivi bien-être</span><div class="nh-wave"><img src="assets/sections/health-photo.webp" alt="Routine bien-être et équilibre" loading="lazy"></div></article></div>')}
    ${card('nh-trainer','Mon coach','<div class="nh-trainers"><article><div class="nh-trainer-face"><img src="assets/sections/project-photo.webp" alt="Planification nutritionnelle sur tablette avec repas équilibrés" loading="lazy"></div><b>Conseils nutrition</b><small>Nutrix AI</small><button type="button" data-nh="ai">Ouvrir le coach</button></article><article><div class="nh-trainer-face"><img src="assets/sections/health-photo.webp" alt="Suivi personnel avec montre connectée et carnet de bien-être" loading="lazy"></div><b>Suivi personnel</b><small>Vos données Santé</small><button type="button" data-nh="tools">Voir le suivi</button></article></div>')}
    ${card('nh-recommend','Actions rapides','<div class="nh-list"><button type="button" data-nh="add"><span class="nh-list-icon">'+icons.food+'</span><span><b>Ajouter un repas</b><small>Enregistrer vos calories et macros</small></span><span class="nh-list-right"><img src="assets/sections/journal-discovery.svg" alt="" loading="lazy"><em>Journal</em></span></button><button type="button" data-nh="scan"><span class="nh-list-icon">'+icons.scan+'</span><span><b>Scanner un produit</b><small>Recherche par code-barres</small></span><span class="nh-list-right"><img src="assets/sections/scanner-product.svg" alt="" loading="lazy"><em>Scanner</em></span></button><button type="button" data-nh="ai"><span class="nh-list-icon">'+icons.chart+'</span><span><b>Conseils AI</b><small>Votre assistant nutritionnel</small></span><span class="nh-list-right"><img src="assets/sections/coach-ai.svg" alt="" loading="lazy"><em>Coach</em></span></button></div>')}
    ${card('nh-heart','Tendance des calories','<div class="nh-trend-body"><div class="nh-trend-head"><div><strong id="nh-trend-value">0 kcal</strong><span>Évolution des 7 derniers jours</span></div><small id="nh-trend-range">—</small></div><svg class="nh-trend-graph" id="nh-trend-graph" viewBox="0 0 280 110" preserveAspectRatio="none" aria-hidden="true"></svg><div class="nh-chart-foot" id="nh-trend-foot"></div></div>')}
    ${card('nh-output','Bilan du jour','<div class="nh-outputs"><article><span class="nh-output-icon">'+icons.food+'</span><div><small>Apport énergétique</small><b id="nh-out-cal">—</b></div><span class="nh-output-badge">kcal</span></article><article><span class="nh-output-icon">'+icons.chart+'</span><div><small>Repas enregistrés</small><b id="nh-out-meals">—</b></div><span class="nh-output-badge">Aujourd’hui</span></article></div>')}
    ${card('nh-food','Mon parcours repas','<div class="nh-food-intro">Votre parcours alimentaire · 4 jours récents</div><div class="nh-food-timeline" id="nh-food-timeline"></div><div class="nh-food-foot"><button type="button" data-nh="add">'+icons.food+' Ajouter un aliment</button><button type="button" data-nh="journal">Voir mon journal →</button></div>')}
  </div>
  <details class="nh-existing" id="nh-existing"><summary>${icons.chart} Outils Santé et suivi détaillé <span>Humeur · Sommeil · Poids · Suivi repas · IA</span></summary><div id="nh-existing-mount" class="nh-existing-mount"></div></details>`;

  const hero=health.querySelector(':scope > .nx-section-hero');
  if(hero) hero.hidden=true;
  health.insertBefore(dashboard,hero?hero.nextSibling:health.firstChild);
  const mount=dashboard.querySelector('#nh-existing-mount');
  [...health.children].filter(node=>node!==dashboard && node!==hero).forEach(node=>mount.appendChild(node));

  const openTools=(selector)=>{
    const details=dashboard.querySelector('#nh-existing');
    details.open=true;
    requestAnimationFrame(()=>{(selector?document.querySelector(selector):details)?.scrollIntoView({behavior:'smooth',block:'start'});});
  };
  dashboard.addEventListener('click',e=>{
    const b=e.target.closest('[data-nh]'); if(!b) return;
    switch(b.dataset.nh){
      case 'add': openTools('.nx-food-tracker'); break;
      case 'scan': openTools('.nx-food-tracker'); document.querySelector('.nx-ft-actions [data-action="scan"]')?.click(); break;
      case 'tools': openTools(); break;
      case 'ai': document.getElementById('v11-ai-launch')?.click() || document.querySelector('.pulse-nav-links [data-tab="ai"]')?.click(); break;
      case 'journal': document.querySelector('.pulse-nav-links [data-tab="journal"]')?.click(); break;
    }
  });

  const refresh=()=>{
    try{
      if(typeof totals!=='function' || typeof macroGoals!=='function' || typeof current==='undefined') return;
      const t=totals(current), g=macroGoals(), target=Number(state?.settings?.target)||2000;
      const fmt=n=>Math.round(n||0).toLocaleString('fr-FR');
      const put=(id,x)=>{const el=document.getElementById(id); if(el) el.textContent=x;};
      put('nh-kcal',fmt(t.kcal));
      put('nh-goalcal',`${fmt(t.kcal)} / ${fmt(target)}`);
      put('nh-goalpro',`${fmt(t.p)} / ${fmt(g.p)}`);
      put('nh-goalwater','—');
      put('nh-out-cal',fmt(t.kcal));
      put('nh-out-meals',Object.values(dayData(current).meals||{}).filter(m=>Number(m.kcal)>0).length);
      dashboard.querySelector('#nh-donut')?.style.setProperty('--percent',Math.min(100,Math.max(0,t.kcal/target*100))+'%');

      const dates=Array.from({length:7},(_,i)=>{const d=new Date(current+'T12:00:00'); d.setDate(d.getDate()-(6-i)); return d.toISOString().slice(0,10);});
      const values=dates.map(d=>totals(d).kcal||0);
      const mx=Math.max(target,...values,1);

      const macros=[['Calories',t.kcal,target,'#a4ebc1','kcal'],['Protéines',t.p,g.p,'#80bfff','g'],['Glucides',t.c,g.c,'#f6c184','g']];
      dashboard.querySelector('#nh-macros').innerHTML = macros.map(([label,value,goal,color,unit])=>`<div class="nh-macro"><i style="background:${color}"></i><div><strong>${label}</strong><small>${fmt(value)} / ${fmt(goal)} ${unit}</small></div><b>${goal>0?Math.round(value/goal*100):0}%</b></div>`).join('');

      dashboard.querySelector('#nh-bars').innerHTML = dates.map((d,i)=>`<div class="nh-bar-col"><span>${values[i]?fmt(values[i]):'—'}</span><div class="nh-bar"><i style="height:${Math.max(values[i]?7:0,values[i]/mx*100)}%"></i></div><small>${new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'short'})}</small></div>`).join('');

      const graph=dashboard.querySelector('#nh-trend-graph');
      const trendFoot=dashboard.querySelector('#nh-trend-foot');
      const trendValue=dashboard.querySelector('#nh-trend-value');
      const trendRange=dashboard.querySelector('#nh-trend-range');
      if(graph && trendFoot && trendValue && trendRange){
        const w=280, h=110, px=10, py=16, chartH=68, baseY=py+chartH, chartW=w-px*2;
        const pts=values.map((v,i)=>{
          const x = px + (chartW * (i / Math.max(values.length-1,1)));
          const y = baseY - (v/mx)*chartH;
          return {x,y,v,label:new Date(dates[i]+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'short'})};
        });
        const path = pts.map((p,idx)=>`${idx?'L':'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
        const area = pts.length ? `M${pts[0].x.toFixed(2)} ${baseY.toFixed(2)} ` + pts.map((p,idx)=>`${idx?'L':'L'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ') + ` L${pts[pts.length-1].x.toFixed(2)} ${baseY.toFixed(2)} Z` : '';
        const last = pts[pts.length-1] || {x:w-px,y:baseY,v:0};
        graph.innerHTML = `<path d="M${px} ${py}H${w-px} M${px} ${(py+chartH/2).toFixed(2)}H${w-px} M${px} ${baseY}H${w-px}" stroke="currentColor" stroke-opacity=".12" stroke-dasharray="3 5" fill="none"></path><path d="${area}" fill="rgba(74,169,137,.12)"></path><path d="${path}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="${last.x.toFixed(2)}" cy="${last.y.toFixed(2)}" r="4.6" fill="#4ba989" stroke="#ffffff" stroke-width="1.5"></circle>`;
        trendFoot.innerHTML = pts.map(p=>`<span>${p.label}</span>`).join('');
        trendValue.textContent = `${fmt(values.reduce((a,b)=>a+b,0))} kcal`;
        trendRange.textContent = `${pts[0]?.label||'—'} → ${pts[pts.length-1]?.label||'—'}`;
      }

      const foodDates=dates.slice(-4);
      const foodCards=[
        {img:'assets/sections/journal-photo.webp',label:'Bol équilibré',alt:'Bol équilibré avec légumes et protéines'},
        {img:'assets/sections/scanner-photo.webp',label:'Découverte produit',alt:'Produit alimentaire à scanner et comparer'},
        {img:'assets/sections/home-photo.webp',label:'Routine nutrition',alt:'Repas sain pour routine nutritionnelle'},
        {img:'assets/sections/health-photo.webp',label:'Vue rapide',alt:'Smoothie et bien-être'}
      ];
      dashboard.querySelector('#nh-food-timeline').innerHTML = foodDates.map((d,i)=>{const v=totals(d),has=v.kcal>0,c=foodCards[i]||foodCards[0];return `<article class="nh-food-day ${d===current?'nh-food-day-active':''}"><div class="nh-timeline-node ${has?'is-done':''}">${has?'✓':i+1}</div><small>Jour ${i+1}</small><div class="nh-food-photo"><img src="${c.img}" alt="${c.alt}" loading="lazy"></div><b>${c.label}</b><span>${new Date(d+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'})} · ${has?fmt(v.kcal)+' kcal':'Aucun repas'}</span></article>`}).join('');
    }catch(err){
      console.warn('Nutrix health dashboard update skipped',err);
    }
  };
  const originalFields=['sum-kcal','sum-target','nx-fit-pro','nx-fit-carb','nx-fit-fat','date-label','meals'];
  let refreshQueued=false;
  const observer=new MutationObserver(()=>{ if(!refreshQueued){ refreshQueued=true; requestAnimationFrame(()=>{refreshQueued=false; refresh();}); } });
  originalFields.forEach(id=>{const el=document.getElementById(id); if(el) observer.observe(el,{subtree:true,childList:true,characterData:true});});
  refresh();
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
}catch(e){console.error("[Nutrix] nutrix-health-dashboard.js",e)}

/* ===== nutrix-ai-copilot.js ===== */
try{
/* Nutrix AI V8 side-panel enhancements. No alternative chatbot/back-end. */
(()=>{'use strict';
 const svg=(s)=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${s}"/></svg>`;
 const $=s=>document.querySelector(s);
 function ready(){const drawer=$('#v11-ai-drawer'),head=drawer?.querySelector('.v11-ai-top'),body=$('#v11-ai-body'),chat=$('#ai-chat'),input=$('#ai-input'),form=$('#ai-form');if(!drawer||!head||!body||!chat||!input||!form)return;
  const left=head.querySelector('div');if(left){left.replaceChildren();const name=document.createElement('strong');name.textContent='Nutrix AI';const small=document.createElement('small');small.textContent='Votre copilote nutritionnel';left.append(name,small)}
  const buttons=document.createElement('div');buttons.className='nx-copilot-controls';
  const add=(label,markup,click)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',label);b.title=label;b.innerHTML=markup;b.addEventListener('click',click);buttons.append(b);return b};
  const history=[];const historyNode=document.createElement('div');historyNode.className='nx-copilot-history';
  const recent=()=>{historyNode.replaceChildren();history.slice().reverse().forEach((entry)=>{const b=document.createElement('button');b.type='button';b.textContent=entry.length>80?entry.slice(0,80)+'…':entry;b.addEventListener('click',()=>{input.value=entry;input.focus();historyNode.classList.remove('open')});historyNode.append(b)})};
  add('Nouvelle conversation',svg('M12 5v14M5 12h14'),()=>{$('#ai-clear')?.click();setState('idle')});
  add('Historique',svg('M3 12a9 9 0 1 0 3-6M3 3v5h5M12 7v6l4 2'),()=>{historyNode.classList.toggle('open');recent()});
  const expand=add('Agrandir',svg('M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5'),()=>{drawer.classList.toggle('nx-ai-expanded');expand.setAttribute('aria-label',drawer.classList.contains('nx-ai-expanded')?'Réduire':'Agrandir')});
  const close=$('#v11-ai-close');if(close){head.insertBefore(buttons,close);close.textContent='×'}else head.append(buttons);
  const avatar=document.createElement('div');avatar.className='nx-copilot-avatar';avatar.dataset.state='idle';avatar.innerHTML='<div class="nx-copilot-stage" id="nx-robot-stage"><span class="nx-copilot-fallback" aria-hidden="true">✦</span></div><span class="nx-copilot-status" role="status">Prêt à vous aider</span>';
  body.prepend(historyNode);historyNode.after(avatar);
  const overview=$('#ai-overview');if(overview){overview.hidden=false;overview.removeAttribute('hidden')}
  const suggestions=$('.ai-suggestions');if(suggestions){suggestions.hidden=true}
  input.placeholder='Demandez quelque chose à Nutrix AI…';
  const quick=[['Analyser un repas','Analyse mon repas et les portions.'],['Mon bilan nutritionnel',"Analyse mon alimentation aujourd'hui."],['Idées de repas','Propose-moi un repas riche en protéines.'],['Comparer des aliments','Compare le poulet, le riz et les œufs.']];
  if(overview){overview.replaceChildren();overview.hidden=true}
  const states={idle:'Prêt à vous aider',listening:'Je vous écoute',thinking:'Analyse en cours…',answering:'Réponse prête',success:'Terminé',error:'Service indisponible'};
  function setState(state){avatar.dataset.state=state;avatar.querySelector('.nx-copilot-status').textContent=states[state]||states.idle;window.dispatchEvent(new CustomEvent('nutrix:ai-state',{detail:{state}}))}
  window.nutrixCopilotState=setState;
  input.addEventListener('focus',()=>{if(avatar.dataset.state==='idle')setState('listening')});input.addEventListener('blur',()=>{if(avatar.dataset.state==='listening')setState('idle')});
  form.addEventListener('submit',()=>{const q=input.value.trim();if(q){history.push(q);if(history.length>35)history.shift();setState('thinking');if(overview)overview.hidden=true}},true);
  $('#ai-clear')?.addEventListener('click',()=>{if(overview)overview.hidden=true;setState('idle')});
  const observer=new MutationObserver(()=>{chat.querySelectorAll('.ai-message.assistant .ai-bubble').forEach(b=>{if(b.querySelector('.nx-ai-copy'))return;const btn=document.createElement('button');btn.type='button';btn.className='nx-ai-copy';btn.textContent='Copier';btn.addEventListener('click',()=>{navigator.clipboard?.writeText(b.innerText||b.textContent||'').catch(()=>{})});b.append(btn)});});observer.observe(chat,{childList:true,subtree:false});
  // Le robot 3D (three.js + modèle) n'est chargé qu'à la première ouverture du chat, et jamais sur un téléphone faible.
  const weak=(()=>{try{const n=navigator,c=n.connection||{};return (n.deviceMemory&&n.deviceMemory<=2)||(n.hardwareConcurrency&&n.hardwareConcurrency<=2)||c.saveData||/(^|-)2g$/.test(c.effectiveType||'')||matchMedia('(prefers-reduced-motion: reduce)').matches}catch{return false}})();
  const lite=()=>{avatar.dataset.webgl='lite';const st=avatar.querySelector('#nx-robot-stage'),fab=document.querySelector('#v11-ai-launch svg');if(st&&fab&&!st.querySelector('svg')){st.replaceChildren(fab.cloneNode(true));st.querySelector('svg').classList.add('nx-copilot-lite')}};
  let started=false;const go=()=>{if(started||!drawer.classList.contains('open'))return;started=true;weak?lite():setup3D(drawer,avatar,setState,lite)};
  new MutationObserver(go).observe(drawer,{attributes:true,attributeFilter:['class']});go();
 }
 async function setup3D(drawer,avatar,setState,lite){const stage=avatar.querySelector('#nx-robot-stage');if(!stage)return;
  let renderer,scene,camera,robot,raf=0,clock=0,resize;
  try{
   const slow=ms=>new Promise((_,ko)=>setTimeout(()=>ko(new Error('timeout')),ms));
   const [THREE,{GLTFLoader}]=await Promise.race([Promise.all([import('https://esm.sh/three@0.161.0'),import('https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js')]),slow(12000)]);
   if(!stage.isConnected)return;
   renderer=new THREE.WebGLRenderer({alpha:true,antialias:(window.devicePixelRatio||1)<2,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;stage.append(renderer.domElement);
   scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(35,1,.1,20);camera.position.set(0,0,4.5);
   scene.add(new THREE.HemisphereLight(0xeefff7,0x386d5a,2.2));const key=new THREE.DirectionalLight(0xffffff,2.3);key.position.set(3,3,4);scene.add(key);
   const gltf=await new GLTFLoader().loadAsync('assets/ai/nutrix-robot.glb');robot=gltf.scene;scene.add(robot);robot.rotation.y=-.15;
   resize=()=>{const r=stage.getBoundingClientRect();const w=Math.max(r.width,1),h=Math.max(r.height,1);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};resize();
   avatar.dataset.webgl='ready';
   let last=0;const render=(now)=>{raf=0;if(!drawer.classList.contains('open')||document.hidden)return;if(now&&now-last<32){raf=requestAnimationFrame(render);return}last=now||0;clock+=.036;const state=avatar.dataset.state;robot.position.y=Math.sin(clock*1.3)*.07;robot.rotation.y=Math.sin(clock*.6)*.1+(state==='thinking'?.15:-.15);robot.rotation.z=Math.sin(clock*.55)*.025;renderer.render(scene,camera);if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches)raf=requestAnimationFrame(render)};
   const start=()=>{if(drawer.classList.contains('open')&&!document.hidden&&!raf){resize();raf=requestAnimationFrame(render)}};
   const stop=()=>{if(raf)cancelAnimationFrame(raf);raf=0};
   new MutationObserver(()=>{if(drawer.classList.contains('open'))start();else stop()}).observe(drawer,{attributes:true,attributeFilter:['class']});
   document.addEventListener('visibilitychange',()=>document.hidden?stop():start());window.addEventListener('resize',()=>{resize();start()});start();
  }catch(e){try{renderer&&renderer.dispose();renderer&&renderer.domElement.remove()}catch{}if(lite)lite();else avatar.dataset.webgl='fallback';}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready,{once:true});else ready();
})();
}catch(e){console.error("[Nutrix] nutrix-ai-copilot.js",e)}

/* ===== nutrix-studio.js ===== */
try{
/* Nutrix Studio V9 extension — five guided tools with photo / scan / manual entry and AI help. */
(()=>{'use strict';
const root=document.getElementById('ns-workspace'), tabs=document.getElementById('ns-tabs');if(!root||!tabs)return;
const STORE='nutrix-studio-v2';
const read=()=>{try{return JSON.parse(localStorage.getItem(STORE)||'{}')}catch{return {}}};
let db={fridge:[],restaurant:[],...read()};if(!Array.isArray(db.fridge))db.fridge=[];if(!Array.isArray(db.restaurant))db.restaurant=[];
const persist=()=>{try{localStorage.setItem(STORE,JSON.stringify(db))}catch{}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number.isFinite(n)?Number(n.toFixed(1)).toLocaleString('fr-FR'):'—';
const num=v=>{if(v===null||v===undefined||String(v).trim()==='')return null;const n=Number(String(v).replace(',','.'));return Number.isFinite(n)&&n>=0?n:null};
const date=()=>typeof current==='string'?current:new Date().toISOString().slice(0,10);
const input=id=>document.getElementById(id);
const on=(id,event,fn)=>input(id)?.addEventListener(event,fn);
const message=(s,cls='')=>`<div class="ns-message ${cls}">${s}</div>`;
const button=(txt,id,cls='')=>`<button type="button" class="ns-btn ${cls}" id="${id}">${txt}</button>`;
const field=(label,id,type='text',extra='')=>`<label class="ns-field"><span>${label}</span><input id="${id}" type="${type}" ${extra}></label>`;
const select=(label,id,options)=>`<label class="ns-field"><span>${label}</span><select id="${id}">${options}</select></label>`;
const fact=(label,value,unit='')=>`<div class="ns-stat"><small>${esc(label)}</small><strong>${value==null?'—':esc(fmt(value))}${value==null?'':` ${unit}`}</strong></div>`;
const card=(body,title,note='')=>`<article class="ns-card"><div class="ns-card-head"><h3>${title}</h3>${note?`<small>${note}</small>`:''}</div>${body}</article>`;
function foods(){
  const a=[...(Array.isArray(state.recent)?state.recent:[]),...(Array.isArray(state.customFoods)?state.customFoods:[])];
  const keys=new Set();
  return a.filter(f=>{const k=String(f.name||'').trim().toLowerCase();if(!k||keys.has(k))return false;keys.add(k);return true})
    .map(f=>({name:String(f.name),kcal:num(f.kcal),p:num(f.p),c:num(f.c),f:num(f.f),image:f.image||'',ingredients:f.ingredients||'',allergens:f.allergens||'',score:f.score||f.nutriscore||''}));
}
const options=()=>foods().map((f,i)=>`<option value="${i}">${esc(f.name)}</option>`).join('');
const foodFrom=id=>foods()[Number(input(id)?.value)];
function totalsFor(items){const r={kcal:0,p:0,c:0,f:0},missing=new Set();for(const {food,grams} of items){for(const key of Object.keys(r)){if(food[key]==null)missing.add(key);else r[key]+=food[key]*grams/100}}for(const key of missing)r[key]=null;return r}
function statsHtml(r){return `<div class="ns-stats">${fact('Calories',r.kcal,'kcal')}${fact('Protéines',r.p,'g')}${fact('Glucides',r.c,'g')}${fact('Lipides',r.f,'g')}</div>`}
const studioState={};
function goToScanner(){document.querySelector('.tab[data-tab="nutri"]')?.click();setTimeout(()=>document.getElementById('nutri-scan-btn')?.click(),120)}
function fileToDataUrl(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result||''));r.onerror=()=>reject(r.error||new Error('read_error'));r.readAsDataURL(file)})}
async function describeImage(dataUrl, language='fr'){try{const r=await fetch('/api/ai/photo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image:dataUrl,language})});if(!r.ok)return '';const j=await r.json();return String(j.answer||'').trim()}catch{return ''}}
async function askAI(question, context){
  try{
    const r=await fetch('/api/ai/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question,context,language:'fr'})});
    if(!r.ok) throw new Error('ai_unavailable');
    const j=await r.json();
    return String(j.answer||'').trim() || 'Réponse vide.';
  }catch{return ''}
}
function toolMeta(tool){
  return {
    plate:{title:'Composer mon assiette',desc:'Assemblez vos aliments enregistrés et obtenez le bilan nutritionnel de votre repas.',tag:'Assiette',image:'assets/sections/home-photo.webp',accent:'Assiette équilibrée'},
    fridge:{title:'Mon frigo',desc:'Suivez votre inventaire, repérez les dates limites proches et préparez vos courses.',tag:'Frigo',image:'assets/sections/journal-photo.webp',accent:'Anti-gaspillage'},
    swap:{title:'Comparer deux aliments',desc:'Choisissez le meilleur des deux selon votre priorité : protéines, calories, sucres…',tag:'Comparaison',image:'assets/sections/health-photo.webp',accent:'Meilleur choix'},
    intelligence:{title:'Comprendre un aliment',desc:'Une lecture claire de ses valeurs nutritionnelles, sans rien inventer.',tag:'Analyse',image:'assets/sections/scanner-photo.webp',accent:'Repères utiles'},
    restaurant:{title:'Choisir au restaurant',desc:'Comparez les plats d’un menu pour faire un choix plus équilibré.',tag:'Restaurant',image:'assets/sections/coach-photo.webp',accent:'Choix guidé'}
  }[tool];
}
function sectionShell(tool, manualHtml, guideHtml=''){
  const m=toolMeta(tool);
  return `
  <div class="ns-tool-head"><div class="ns-section-head"><h3>${m.title}</h3><p>${m.desc}</p></div></div>
  <div class="ns-tool-grid">
    <div class="ns-main-stack">
      <article class="ns-card ns-entry-card">
        <div class="ns-cover" style="--cover:url('${m.image}')">
          <div class="ns-cover-copy"><span class="ns-cover-tag">${m.tag}</span><h3>${m.title}</h3><p>${m.desc}</p><div class="ns-cover-pills"><span>Photo</span><span>Scan</span><span>Saisie</span></div></div>
          <div class="ns-cover-media"><img src="${m.image}" alt="${m.title}" loading="lazy"></div>
        </div>
        <div class="ns-entry-modes">
          <button type="button" class="ns-mode-btn" data-ns-photo="${tool}"><span class="ns-ico"><svg viewBox="0 0 24 24"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg></span><b>Photo</b><small>Importer une image</small></button>
          <button type="button" class="ns-mode-btn" data-ns-scan="${tool}"><span class="ns-ico"><svg viewBox="0 0 24 24"><path d="M4 8V5a1 1 0 0 1 1-1h3m8 0h3a1 1 0 0 1 1 1v3M4 16v3a1 1 0 0 0 1 1h3m8 0h3a1 1 0 0 0 1-1v-3M7 12h10"/></svg></span><b>Scan</b><small>Scanner un code-barres</small></button>
          <button type="button" class="ns-mode-btn" data-ns-manual="${tool}"><span class="ns-ico"><svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/></svg></span><b>Saisie</b><small>Remplir à la main</small></button>
        </div>
        <input type="file" id="ns-photo-${tool}" accept="image/jpeg,image/png,image/webp" hidden>
        <div id="ns-photo-preview-${tool}"></div>
      </article>
      ${manualHtml}
    </div>
    <aside class="ns-side-stack">
      <article class="ns-card ns-ai-card">
        <div class="ns-card-head"><h3>Demander à Nutrix AI</h3><small>Conseil personnalisé pour cet outil</small></div>
        <div class="ns-ai-summary"><span>${m.accent}</span><strong>Ajoutez une photo ou des informations, l’assistant les analyse pour vous.</strong></div>
        <label class="ns-field"><span>Votre question (facultatif)</span><textarea id="ns-ai-note-${tool}" rows="4" placeholder="Ex. Quelle est la meilleure option pour mon objectif ?"></textarea></label>
        <div class="ns-ai-actions"><button type="button" class="ns-btn primary" id="ns-ai-run-${tool}">Analyser</button><button type="button" class="ns-btn" id="ns-ai-open-${tool}">Ouvrir le chat</button></div>
        <div id="ns-ai-result-${tool}">${message('Ajoutez une photo, scannez un produit ou saisissez les données, puis lancez l’analyse.','soft')}</div>
      </article>
      <article class="ns-card ns-guide-card"><div class="ns-card-head"><h3>Comment ça marche</h3><small>En 3 gestes</small></div>${guideHtml || message('Photo pour montrer, Scan pour identifier un produit, Saisie pour compléter les données.','soft')}</article>
    </aside>
  </div>`;
}
function bindSectionControls(tool, manualTarget, buildQuestion, fallbackAnswer){
  const file=input(`ns-photo-${tool}`), preview=input(`ns-photo-preview-${tool}`), note=input(`ns-ai-note-${tool}`), result=input(`ns-ai-result-${tool}`);
  studioState[tool]=studioState[tool]||{};
  document.querySelector(`[data-ns-photo="${tool}"]`)?.addEventListener('click',()=>file?.click());
  document.querySelector(`[data-ns-scan="${tool}"]`)?.addEventListener('click',goToScanner);
  document.querySelector(`[data-ns-manual="${tool}"]`)?.addEventListener('click',()=>document.getElementById(manualTarget)?.scrollIntoView({behavior:'smooth',block:'start'}));
  file?.addEventListener('change',async()=>{
    const f=file.files?.[0]; if(!f) return;
    const dataUrl=await fileToDataUrl(f); studioState[tool].photo={name:f.name,dataUrl};
    preview.innerHTML=`<div class="ns-photo-inline"><img src="${dataUrl}" alt="Aperçu" loading="lazy"><div><strong>${esc(f.name)}</strong><small>Image prête pour l’assistance AI.</small></div></div>`;
  });
  input(`ns-ai-open-${tool}`)?.addEventListener('click',()=>{document.querySelector('.tab[data-tab="ai"]')?.click()});
  input(`ns-ai-run-${tool}`)?.addEventListener('click',async()=>{
    result.innerHTML=message('Analyse en cours…','soft');
    let photoText='';
    if(studioState[tool]?.photo?.dataUrl) photoText=await describeImage(studioState[tool].photo.dataUrl);
    const payload=buildQuestion({note:note?.value.trim()||'',photoText});
    const answer=await askAI(payload.question,payload.context);
    result.innerHTML=answer?`<div class="ns-ai-answer">${answer.replace(/\n/g,'<br>')}</div>`:message(fallbackAnswer({note:note?.value.trim()||'',photoText}),'soft');
  });
}

function renderPlate(){
  const manual=card(`<div id="ns-manual-plate"></div><div class="ns-row">${select('Aliment','ns-plate-food',options())}${field('Quantité (g)','ns-plate-grams','number','min="1" max="2000" step="1" value="100"')}</div>${button('Ajouter à mon assiette','ns-plate-add','primary')}<div id="ns-plate-list" class="ns-list"></div>`,`Créer mon assiette`,'Base : valeurs pour 100 g')+
               card('<div class="ns-plate-visual"><span>🥗</span><strong>Votre assiette</strong><small>Composition personnalisée</small></div><div id="ns-plate-total"></div>','Bilan de l’assiette');
  const guide='<ul class="ns-tips"><li>Photo : montrez votre assiette ou un ingrédient.</li><li>Scan : lisez le code-barres d’un produit emballé.</li><li>Saisie : choisissez vos aliments enregistrés pour un calcul plus précis.</li></ul>';
  root.innerHTML=sectionShell('plate',manual,guide);
  let entries=[];
  function update(){input('ns-plate-list').innerHTML=entries.map((x,i)=>`<div class="ns-list-item"><span>${esc(x.food.name)} <small>${x.grams} g</small></span><button data-remove="${i}" aria-label="Retirer">×</button></div>`).join('')||message('Choisissez un aliment pour commencer.');input('ns-plate-total').innerHTML=entries.length?statsHtml(totalsFor(entries))+message('Calcul basé sur les valeurs du journal. Une valeur absente reste « — ».','soft'):message('Aucune valeur calculée tant que l’assiette est vide.');}
  on('ns-plate-add','click',()=>{const f=foodFrom('ns-plate-food'),g=num(input('ns-plate-grams').value);if(!f||!g||g>2000)return alert(NXD('Choisissez un aliment et une quantité entre 1 et 2 000 g.'));entries.push({food:f,grams:g});update()});
  on('ns-plate-list','click',e=>{const b=e.target.closest('[data-remove]');if(b){entries.splice(Number(b.dataset.remove),1);update()}});update();
  bindSectionControls('plate','ns-manual-plate',({note,photoText})=>({question:`Aide-moi à équilibrer cette assiette. ${note||''}`.trim(),context:{tool:'smart-plate-builder',date:date(),photoDescription:photoText,plate:entries.map(x=>({name:x.food.name,grams:x.grams})),totals:entries.length?totalsFor(entries):null}}),({photoText})=>photoText?`Je peux déjà t’aider à partir de la photo : ${photoText}. Ajoute ensuite les aliments manuellement pour un calcul plus précis.`:'Ajoute des aliments dans ton assiette ou une photo, puis redemande une aide plus ciblée.');
}
function renderFridge(){
  const manual=card(`<div id="ns-manual-fridge"></div><div class="ns-row">${field('Produit','ns-fridge-name','text','maxlength="80" placeholder="Ex. Tomates"')}${field('Quantité','ns-fridge-qty','text','maxlength="30" placeholder="Ex. 500 g"')}</div>${field('Date limite (si connue)','ns-fridge-date','date')}${button('Ajouter au frigo','ns-fridge-add','primary')}<div id="ns-fridge-list" class="ns-list"></div>`,'Inventaire')+
               card('<div id="ns-fridge-summary"></div>','À utiliser en priorité');
  const guide='<ul class="ns-tips"><li>Photo : montrez le contenu du frigo ou vos courses.</li><li>Scan : identifiez un produit emballé.</li><li>Saisie : notez les quantités et les dates limites.</li></ul>';
  root.innerHTML=sectionShell('fridge',manual,guide);
  function update(){const today=new Date(date()+'T12:00:00');db.fridge.sort((a,b)=>(a.exp||'9999').localeCompare(b.exp||'9999'));input('ns-fridge-list').innerHTML=db.fridge.map((x,i)=>{const diff=x.exp?Math.round((new Date(x.exp+'T12:00:00')-today)/86400000):null;return `<div class="ns-list-item"><span><strong>${esc(x.name)}</strong> ${esc(x.qty)}<small>${x.exp?`Date : ${esc(x.exp)}`:'Date non renseignée'} ${diff!==null?` · ${diff<0?'Date dépassée':diff===0?"Aujourd’hui":`${diff} j`}`:''}</small></span><button data-del="${i}" aria-label="Supprimer">×</button></div>`}).join('')||message('Votre frigo est vide. Ajoutez vos ingrédients.');const priority=db.fridge.filter(x=>x.exp&&x.exp<=new Date(Date.now()+3*86400000).toISOString().slice(0,10));input('ns-fridge-summary').innerHTML=`<div class="ns-stats">${fact('Produits',db.fridge.length)}${fact('Dates proches / passées',priority.length)}</div>`+(priority.length?`<div class="ns-list">${priority.map(x=>`<div class="ns-list-item"><span>${esc(x.name)} <small>${esc(x.exp)}</small></span></div>`).join('')}</div>`:message('Aucune date proche renseignée.'))+message('La date saisie dépend de votre emballage et de vos conditions de conservation.','soft')}
  on('ns-fridge-add','click',()=>{const name=input('ns-fridge-name').value.trim();if(!name)return;db.fridge.push({name:name.slice(0,80),qty:input('ns-fridge-qty').value.slice(0,30),exp:input('ns-fridge-date').value});persist();input('ns-fridge-name').value='';input('ns-fridge-qty').value='';input('ns-fridge-date').value='';update()});
  on('ns-fridge-list','click',e=>{const b=e.target.closest('[data-del]');if(b){db.fridge.splice(Number(b.dataset.del),1);persist();update()}});update();
  bindSectionControls('fridge','ns-manual-fridge',({note,photoText})=>({question:`Aide-moi à organiser ce frigo et à prioriser ce qu’il faut utiliser. ${note||''}`.trim(),context:{tool:'smart-fridge',date:date(),photoDescription:photoText,fridge:db.fridge.slice(0,20)}}),({photoText})=>photoText?`Photo décrite : ${photoText}. Ajoute aussi les dates et les quantités pour obtenir une aide plus concrète.`:'Ajoute quelques produits du frigo ou une photo pour recevoir un conseil plus utile.');
}
function renderSwap(){
  const f=foods();
  const manual = f.length<2 ? card(message('Enregistrez au moins 2 aliments dans le Journal pour activer la comparaison.'),'Comparaison manuelle') : card(`<div id="ns-manual-swap"></div><div class="ns-row">${select('Aliment actuel','ns-swap-a',options())}${select('Alternative','ns-swap-b',options())}</div>${select('Votre priorité','ns-swap-metric','<option value="p">Plus de protéines</option><option value="kcal">Moins de calories</option><option value="c">Moins de glucides</option><option value="f">Moins de lipides</option>')}${button('Comparer','ns-swap-run','primary')}<div id="ns-swap-result"></div>`,'Comparer pour 100 g');
  const guide='<ul class="ns-tips"><li>Photo : montrez deux produits ou un emballage.</li><li>Scan : ajoutez un produit absent de votre liste.</li><li>Saisie : comparez les aliments de votre journal.</li></ul>';
  root.innerHTML=sectionShell('swap',manual,guide);
  if(f.length<2){bindSectionControls('swap','ns-manual-swap',({note,photoText})=>({question:`Aide-moi à comparer des aliments et à choisir la meilleure alternative. ${note||''}`.trim(),context:{tool:'smart-food-swap',photoDescription:photoText}}),({photoText})=>photoText?`Je peux t’aider à comparer à partir de cette photo : ${photoText}. Pour un verdict plus fiable, ajoute les produits dans Nutrix.`:'Ajoute au moins deux aliments au journal ou une photo plus claire des produits.'); return;}
  input('ns-swap-b').value='1';
  on('ns-swap-run','click',()=>{const a=foodFrom('ns-swap-a'),b=foodFrom('ns-swap-b'),k=input('ns-swap-metric').value,hi=k==='p';if(!a||!b)return;const valA=a[k],valB=b[k];let verdict='Données insuffisantes pour déterminer une alternative.';if(valA!==null&&valB!==null)verdict=valA===valB?'Les deux aliments sont équivalents pour ce critère.':(hi?valB>valA:valB<valA)?`${b.name} correspond mieux au critère choisi.`:`${a.name} correspond mieux au critère choisi.`;input('ns-swap-result').innerHTML=`<div class="ns-comparison"><div><strong>${esc(a.name)}</strong>${statsHtml(a)}</div><div><strong>${esc(b.name)}</strong>${statsHtml(b)}</div></div>${message(esc(verdict),'soft')}<p class="ns-note">Une comparaison à 100 g ne remplace pas l’analyse de la portion réelle ni des ingrédients.</p>`});
  bindSectionControls('swap','ns-manual-swap',({note,photoText})=>{const a=foodFrom('ns-swap-a'),b=foodFrom('ns-swap-b');return {question:`Compare ces deux choix alimentaires et explique-moi la meilleure option selon ma priorité. ${note||''}`.trim(),context:{tool:'smart-food-swap',priority:input('ns-swap-metric')?.value||'',photoDescription:photoText,foods:[a,b].filter(Boolean)}}},({photoText})=>photoText?`Photo reçue : ${photoText}. Utilise aussi la comparaison manuelle pour un résultat plus précis sur 100 g.`:'Choisis deux aliments puis demande à l’AI de les comparer.');
}
function renderIntelligence(){
  const f=foods();
  const manual = f.length ? card(`<div id="ns-manual-intelligence"></div>${select('Aliment enregistré','ns-int-food',options())}${button('Analyser','ns-int-run','primary')}<div id="ns-int-result"></div>`,'Lecture nutritionnelle') : card(message('Ajoutez d’abord un aliment au Journal ou utilisez le Scanner.'),'Lecture nutritionnelle');
  const guide='<ul class="ns-tips"><li>Photo : montrez l’étiquette ou le produit.</li><li>Scan : récupérez les données Open Food Facts si elles existent.</li><li>Saisie : sélectionnez un aliment enregistré pour lire ses infos.</li></ul>';
  root.innerHTML=sectionShell('intelligence',manual,guide);
  if(f.length){on('ns-int-run','click',()=>{const x=foodFrom('ns-int-food');let text=[];if(x.p!==null)text.push(x.p>=20?'Riche en protéines pour 100 g.':x.p>=10?'Apport modéré en protéines pour 100 g.':'Faible apport en protéines pour 100 g.');if(x.kcal!==null)text.push(`Énergie enregistrée : ${fmt(x.kcal)} kcal pour 100 g.`);if(x.c!==null)text.push(`Glucides enregistrés : ${fmt(x.c)} g pour 100 g.`);if(x.f!==null)text.push(`Lipides enregistrés : ${fmt(x.f)} g pour 100 g.`);input('ns-int-result').innerHTML=statsHtml(x)+card(`<ul class="ns-tips">${text.map(t=>`<li>${esc(t)}</li>`).join('')||'<li>Les valeurs nutritives ne sont pas renseignées.</li>'}</ul><p class="ns-note">Ingrédients : ${esc(x.ingredients||'non renseignés')}<br>Allergènes : ${esc(x.allergens||'non renseignés')}<br>Nutri-Score : ${esc(x.score||'non disponible')}</p>`,'Points clés')+message('Les champs absents ne sont pas interprétés comme « aucun allergène » ou « sans additif ».','soft')});}
  bindSectionControls('intelligence','ns-manual-intelligence',({note,photoText})=>{const x=f.length?foodFrom('ns-int-food'):null;return {question:`Explique-moi simplement cet aliment, ses points utiles et ses limites. ${note||''}`.trim(),context:{tool:'food-intelligence',photoDescription:photoText,food:x}}},({photoText})=>photoText?`Je peux déjà te dire ceci sur l’image : ${photoText}. Si tu scans le produit ou le sélectionnes manuellement, l’analyse sera plus claire.`:'Sélectionne un aliment ou ajoute une photo pour lancer une lecture guidée.');
}
function renderRestaurant(){
  const manual=card(`<div id="ns-manual-restaurant"></div>${field('Nom du plat','ns-rest-name','text','maxlength="100" placeholder="Ex. Salade de poulet"')}${select('Mode de préparation','ns-rest-cook','<option value="grillé / cuit au four">Grillé ou au four</option><option value="frit">Frit</option><option value="cru / salade">Cru ou salade</option><option value="inconnu">Non indiqué</option>')}${field('Ingrédients / sauces indiqués','ns-rest-note','text','maxlength="240" placeholder="Selon la carte du restaurant"')}${button('Ajouter le plat','ns-rest-add','primary')}<div id="ns-rest-list"></div>`,'Créer une sélection de menu')+
                card('<div id="ns-rest-guide"></div>','Conseils de lecture');
  const guide='<ul class="ns-tips"><li>Photo : prenez le menu ou le plat en photo.</li><li>Scan : utile pour les produits emballés vendus sur place.</li><li>Saisie : notez la cuisson, les sauces et les ingrédients annoncés.</li></ul>';
  root.innerHTML=sectionShell('restaurant',manual,guide);
  function update(){input('ns-rest-list').innerHTML=(db.restaurant||[]).map((x,i)=>`<div class="ns-list-item"><span><strong>${esc(x.name)}</strong><small>${esc(x.cook)} · ${esc(x.notes||'ingrédients non indiqués')}</small></span><button data-del="${i}" aria-label="Supprimer">×</button></div>`).join('')||message('Ajoutez les plats disponibles sur le menu.');input('ns-rest-guide').innerHTML=message('Les calories, allergènes et portions ne sont pas fournis par un simple nom de plat. Demandez au restaurant les ingrédients, les sauces, les portions et les allergènes.','soft')+`<ul class="ns-tips"><li>Privilégiez les informations détaillées plutôt que le nom du plat.</li><li>Vérifiez les sauces, assaisonnements et méthodes de cuisson.</li><li>Une préparation grillée n’est pas automatiquement moins calorique.</li></ul>`}
  on('ns-rest-add','click',()=>{const name=input('ns-rest-name').value.trim();if(!name)return;db.restaurant=db.restaurant||[];db.restaurant.push({name:name.slice(0,100),cook:input('ns-rest-cook').value,notes:input('ns-rest-note').value.slice(0,240)});persist();input('ns-rest-name').value='';input('ns-rest-note').value='';update()});
  on('ns-rest-list','click',e=>{const b=e.target.closest('[data-del]');if(b){db.restaurant.splice(Number(b.dataset.del),1);persist();update()}});update();
  bindSectionControls('restaurant','ns-manual-restaurant',({note,photoText})=>({question:`Aide-moi à choisir un plat au restaurant de façon simple et prudente. ${note||''}`.trim(),context:{tool:'restaurant-mode',photoDescription:photoText,menu:db.restaurant.slice(0,20)}}),({photoText})=>photoText?`Je peux déjà t’aider à partir de la photo : ${photoText}. Ajoute aussi les noms des plats et les sauces pour un meilleur conseil.`:'Ajoute des plats du menu ou une photo du menu pour recevoir un conseil contextualisé.');
}
const renderers={plate:renderPlate,fridge:renderFridge,swap:renderSwap,intelligence:renderIntelligence,restaurant:renderRestaurant};
let active='plate';
function show(tool){if(!renderers[tool])return;active=tool;tabs.querySelectorAll('button').forEach(b=>{const selected=b.dataset.tool===tool;b.classList.toggle('on',selected);b.setAttribute('aria-pressed',selected?'true':'false')});if(window.NutrixVision&&window.NutrixVision.render(tool))return;renderers[tool]();}
tabs.addEventListener('click',e=>{const b=e.target.closest('button[data-tool]');if(b)show(b.dataset.tool)});
show(active);
})();
}catch(e){console.error("[Nutrix] nutrix-studio.js",e)}

/* ===== nutrix-studio-vision.js ===== */
try{
/* Nutrix Studio — image-first tools. Photo in → visual result out (rings, bars, chips) with almost no text.
   Uses /api/ai/vision (structured analysis) and /api/ai/image (optional generated dish). */
(()=>{'use strict';
const root=document.getElementById('ns-workspace');if(!root)return;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const n=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,n(v)));
const r0=v=>Math.round(n(v));
const short=(s,m=40)=>String(s??'').slice(0,m);
const I={
 camera:'<svg viewBox="0 0 24 24"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
 image:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4 18 5-5 4 4 3-3 4 4"/></svg>',
 spark:'<svg viewBox="0 0 24 24"><path d="m12 3 2 5.5L19.5 10 14 12l-2 5.5L10 12 4.5 10 10 8.5zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/></svg>',
 refresh:'<svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/></svg>',
 check:'<svg viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
 warn:'<svg viewBox="0 0 24 24"><path d="M12 4 3 20h18zM12 10v4M12 17v.5"/></svg>',
 clock:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
 trophy:'<svg viewBox="0 0 24 24"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 13v4M8 20h8"/></svg>',
 flame:'<svg viewBox="0 0 24 24"><path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .3 1.2 1 2 2 2 0-3-1-5 1-8z"/></svg>',
 cube:'<svg viewBox="0 0 24 24"><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12 4 7.5"/></svg>',
 drop:'<svg viewBox="0 0 24 24"><path d="M12 3s6 6.2 6 10.5a6 6 0 0 1-12 0C6 9.2 12 3 12 3z"/></svg>',
 salt:'<svg viewBox="0 0 24 24"><path d="M8 9h8l-1 11H9zM9 9V6h6v3M10.5 13h3"/></svg>',
 muscle:'<svg viewBox="0 0 24 24"><path d="M4 14c2-1 3-3 3-6l3 1c0 2 1 3 3 3l3-2c2 0 4 2 4 5s-3 5-6 5-6 0-8-2z"/></svg>',
 close:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>'
};
const ico=k=>`<i class="nv-i">${I[k]}</i>`;
const CFG={
 plate:{title:'Photographiez votre assiette',sub:'Calories, macros et score en un coup d’œil',cta:'Analyser',slots:['Assiette']},
 fridge:{title:'Ouvrez votre frigo',sub:'Ingrédients détectés et idées de plats',cta:'Scanner le frigo',slots:['Frigo ou courses']},
 swap:{title:'Deux produits, un gagnant',sub:'Ajoutez les deux photos pour comparer',cta:'Comparer',slots:['Produit A','Produit B']},
 intelligence:{title:'Décryptez un produit',sub:'Photo de l’emballage ou de l’étiquette',cta:'Décrypter',slots:['Produit']},
 restaurant:{title:'Menu ou plat du resto',sub:'Les meilleurs choix, classés',cta:'Trouver le meilleur choix',slots:['Menu ou plat']}
};
const state={};
const HK='nutrix-vision-history';
const hist=()=>{try{return JSON.parse(localStorage.getItem(HK)||'[]')}catch{return []}};
const histSave=a=>{try{localStorage.setItem(HK,JSON.stringify(a.slice(0,24)))}catch{}};
function thumb(dataUrl){return new Promise(res=>{if(!dataUrl)return res('');const im=new Image();im.onload=()=>{const k=120/Math.max(im.width,im.height);const c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.6))};im.onerror=()=>res('');im.src=dataUrl})}
function titleOf(tool,r){return short(tool==='plate'?r.dish:tool==='fridge'?(r.items||[]).length+' ingrédients':tool==='swap'?`${(r.a||{}).name||'A'} vs ${(r.b||{}).name||'B'}`:tool==='intelligence'?r.name:((r.picks||[])[0]||{}).name||'Menu',34)}
async function remember(tool,imgs,r){const t=await thumb(imgs.find(Boolean));const a=hist();a.unshift({tool,ts:Date.now(),thumb:t,title:titleOf(tool,r),result:r});histSave(a)}
function addToJournal(r){try{const h=new Date().getHours(),meal=r.meal||(h<11?'b':h<17?'l':'d');const d=writeDay(current);d.meals[meal]=d.meals[meal]||{};const m=d.meals[meal];const add=(k,v)=>{m[k]=String(Math.round((Number(m[k])||0)+n(v))*1)};add('kcal',r.kcal);add('p',r.p);add('c',r.c);add('f',r.f);save();try{if(typeof renderAll==='function')renderAll()}catch{}return {ok:true,meal:({b:'Petit-déjeuner',l:'Déjeuner',d:'Dîner'})[meal]}}catch{return {ok:false}}}
const SK='nutrix-shopping';
const shopGet=()=>{try{return JSON.parse(localStorage.getItem(SK)||'[]')}catch{return []}};
const shopSet=a=>{try{localStorage.setItem(SK,JSON.stringify(a))}catch{}};
function missingOf(d){const m=[];(d.recipes||[]).forEach(r=>(r.missing||[]).forEach(x=>{const k=short(x,24).trim();if(k&&!m.some(y=>y.toLowerCase()===k.toLowerCase()))m.push(k)}));return m}
function shopHtml(d){const miss=missingOf(d);const list=shopGet();if(!miss.length&&!list.length)return '';return `<div class="nv-shop"><div class="nv-shop-h"><h4 class="nv-h">Liste de courses</h4>${miss.length?`<button type="button" class="nv-shop-add" data-shop-add>${ico('check')}Ajouter ${miss.length} article${miss.length>1?'s':''}</button>`:''}</div>${list.length?`<ul class="nv-shop-list">${list.map((x,i)=>`<li class="${x.done?'done':''}"><button type="button" data-shop-t="${i}" aria-label="Cocher"><i>${x.done?I.check:''}</i><span>${esc(x.t)}</span></button><button type="button" class="x" data-shop-x="${i}" aria-label="Retirer">${I.close}</button></li>`).join('')}</ul><div class="nv-shop-acts"><a class="nv-wa" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent('🛒 Ma liste de courses\n'+list.filter(x=>!x.done).map(x=>'• '+x.t).join('\n'))}">Envoyer sur WhatsApp</a><button type="button" data-shop-clear>Vider</button></div>`:''}</div>`}
function histHtml(tool){const a=hist().filter(x=>x.tool===tool).slice(0,6);if(!a.length)return '';return `<div class="nv-hist"><h4 class="nv-h">Récents</h4><div class="nv-hist-row">${a.map((x,i)=>`<button type="button" data-hi="${x.ts}" title="${esc(x.title)}">${x.thumb?`<img src="${x.thumb}" alt="">`:`<b>${ico('image')}</b>`}<span>${esc(x.title)}</span></button>`).join('')}</div></div>`}            // per tool: {imgs:[], result, gen, busy, err}
function fileToImage(file,max=1024){return new Promise((res,rej)=>{const fr=new FileReader();fr.onerror=()=>rej(new Error('read'));fr.onload=()=>{const im=new Image();im.onerror=()=>rej(new Error('img'));im.onload=()=>{const k=Math.min(1,max/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.82))};im.src=String(fr.result)};fr.readAsDataURL(file)})}
async function post(path,body,tries=2){let last;
 for(let k=0;k<tries;k++){
  try{const r=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});let j={};try{j=await r.json()}catch{}
   if(r.ok)return j;
   if(r.status===503&&/GEMINI/.test(j.error||''))throw Object.assign(new Error('Clé GEMINI_API_KEY manquante sur le serveur.'),{fatal:1});
   last=new Error(j.error||'Service indisponible.');
   // 502 = le serveur a déjà réessayé avec plusieurs modèles : inutile de tout recommencer (ça faisait attendre 2-3 minutes)
   if(![429,503,504].includes(r.status))throw Object.assign(last,{fatal:1});
  }catch(e){if(e.fatal)throw e;last=e instanceof TypeError?new Error('Connexion impossible. Vérifie ta connexion.'):e}
  if(k<tries-1)await new Promise(r=>setTimeout(r,900*(k+1)));
 }throw last||new Error('Service indisponible.')}


/* =====================  Base cuisine marocaine (instantané, sans IA)  ===================== */
const MAROC=`Harira|harira,حريرة|🍲|1 bol (300 ml)|165|8|22|4|80|Excellente en entrée, légère et riche en fibres.|lentilles,pois chiches,tomate,céleri
Tajine poulet olives citron|tajine poulet,tajine djaj,djaj mhammar,طجين دجاج|🍗|1 portion (350 g)|480|38|14|30|66|Retire la peau du poulet pour gagner ~80 kcal.|poulet,olives,citron confit,oignon
Tajine kefta aux œufs|tajine kefta,kefta tajine,كفتة|🥘|1 portion (350 g)|540|33|16|37|52|Remplace un œuf par des légumes pour alléger.|kefta,œufs,tomate,oignon
Tajine d’agneau aux pruneaux|tajine agneau,tajine pruneaux,tajine lham bel barkouk|🍖|1 portion (350 g)|650|35|42|35|42|Plat festif : garde la portion modérée.|agneau,pruneaux,amandes,miel
Tajine de poisson (chermoula)|tajine poisson,tajine hout,طجين حوت|🐟|1 portion (350 g)|380|36|16|18|82|Très bon choix : protéines maigres et oméga-3.|poisson,tomate,poivron,chermoula
Tajine de légumes|tajine legumes,tajine khodra|🥕|1 portion (350 g)|280|7|38|11|88|Léger et riche en fibres.|carottes,courgettes,pommes de terre,pois
Couscous aux sept légumes|couscous,couscous viande,couscous vendredi,كسكس|🍛|1 assiette (400 g)|650|30|85|20|62|Moins de semoule, plus de légumes = plus léger.|semoule,légumes,pois chiches,viande
Couscous tfaya|tfaya,couscous tfaya,seffa tfaya|🍯|1 assiette (400 g)|720|26|98|24|40|Riche en sucre (oignons caramélisés, raisins).|semoule,poulet,oignons caramélisés,raisins
Seffa médiouiya|seffa,seffa medfouna,seffa medouiya|🍝|1 assiette (350 g)|600|22|78|22|48|Plat sucré-salé, énergétique.|vermicelles,poulet,amandes,cannelle
Pastilla au poulet|pastilla,bastilla,بسطيلة|🥧|1 part (200 g)|540|22|42|31|40|Riche en beurre et sucre : plutôt à partager.|feuilles de brick,poulet,amandes,œufs
Rfissa|rfissa,رفيسة|🍲|1 assiette (400 g)|720|40|65|32|45|Plat dense : privilégie le bouillon.|msemen,poulet,lentilles,fenugrec
Tanjia marrakchia|tanjia,tangia,طنجية|🍖|1 portion (250 g)|600|38|6|47|40|Très gras : à déguster en petite portion.|viande,citron confit,cumin,smen
Méchoui d’agneau|mechoui,méchoui|🍖|200 g|520|44|0|38|55|Choisis les parties maigres, évite le gras visible.|agneau,sel,cumin
Brochettes de kefta (3)|brochette kefta,kefta grillée,kefta mchermla|🍢|3 brochettes (150 g)|360|28|4|26|66|Grillé : meilleur que frit.|viande hachée,persil,oignon,épices
Brochettes de poulet (3)|brochette poulet,poulet grillé|🍢|3 brochettes (180 g)|300|36|4|15|88|Très bon choix protéiné.|poulet,citron,épices
Sardines grillées|sardines,sardine grillée,سردين|🐟|3 sardines (150 g)|250|28|0|15|90|Riches en oméga-3, excellent choix.|sardines,citron,persil
Salade marocaine|salade marocaine,salade tomate concombre|🥗|150 g|70|2|9|3|95|Fraîche et légère.|tomate,concombre,oignon,huile d’olive
Zaalouk|zaalouk,zaaluk,زعلوك|🍆|100 g|80|2|8|5|90|Aubergines : riche en fibres.|aubergine,tomate,ail,huile
Taktouka|taktouka|🫑|100 g|70|2|9|3|92|Légère, riche en vitamine C.|poivrons,tomate,ail
Bissara|bissara,بيصارة|🥣|1 bol (300 ml)|220|12|28|6|85|Fèves : protéines végétales et fibres.|fèves,huile d’olive,cumin
Lentilles (adas)|adas,lentilles marocaines,عدس|🍲|1 bol (300 g)|280|18|40|5|88|Très rassasiantes et riches en fer.|lentilles,oignon,cumin
Loubia (haricots blancs)|loubia,loubia marocaine,لوبيا|🫘|1 bol (300 g)|300|16|42|7|85|Riche en fibres et protéines végétales.|haricots blancs,tomate,ail
Msemen|msemen,msemmen,مسمن|🫓|1 pièce (80 g)|230|5|30|10|50|Moins de beurre/huile = moins de calories.|farine,semoule,beurre
Baghrir (2 crêpes)|baghrir,baghrir,بغرير|🥞|2 pièces (100 g)|160|5|30|2|68|Léger, évite le miel en excès.|semoule,levure,farine
Harcha|harcha,harcha semoule|🍘|1 pièce (80 g)|220|5|33|7|55|Beaucoup de beurre : garde 1 pièce.|semoule,beurre,lait
Batbout|batbout,batbout farci|🫓|1 pièce (60 g)|170|6|32|2|70|Pain léger, bon avec de la kefta ou du fromage frais.|farine,levure
Khobz (1/4 de pain)|khobz,pain marocain,خبز|🍞|80 g|140|5|28|1|68|Choisis le khobz complet si possible.|farine,levure
Œufs au khlii|khlii,khlii oeufs,khlea|🍳|2 œufs + khlii (150 g)|380|26|2|30|50|Le khlii est salé et gras : petite quantité.|œufs,khlii,huile
Sandwich kefta|sandwich kefta,sandwich maroc|🥪|1 sandwich (300 g)|650|30|58|32|40|Prends-le sans frites pour ~-250 kcal.|pain,kefta,frites,sauce
Chebakia|chebakia,chebbakia,شباكية|🍥|1 pièce (30 g)|120|2|17|5|20|Très sucrée (miel) : 1 ou 2 maximum.|farine,miel,sésame
Cornes de gazelle|corne de gazelle,kaab el ghzal,كعب الغزال|🌙|1 pièce (40 g)|130|3|14|7|30|Riche en amandes et sucre.|amandes,sucre,beurre
Briouate aux amandes|briouate,briwat,briouates|🥠|1 pièce (40 g)|140|3|16|7|30|Frites et au miel : plaisir occasionnel.|amandes,feuilles de brick,miel
Sellou (sfouf)|sellou,sfouf,سلو|🍪|30 g|160|3|15|10|35|Très énergétique, idéal avant l’effort.|farine grillée,amandes,sésame,miel
Amlou|amlou,املو|🥜|20 g (1 c. à soupe)|125|3|4|11|45|Riche en bonnes graisses mais calorique.|amandes,huile d’argan,miel
Dattes (3)|dattes,tmar,تمر|🌴|3 dattes (60 g)|165|1|44|0|60|Source rapide d’énergie, parfaites pour rompre le jeûne.|dattes
Thé à la menthe (sucré)|the a la menthe,atay,thé menthe,أتاي|🍵|1 verre (150 ml)|60|0|15|0|55|Réduis le sucre : −40 kcal par verre.|thé vert,menthe,sucre
Jus d’orange pressé|jus orange,jus d’orange,عصير برتقال|🍊|1 verre (250 ml)|110|2|25|0|60|Préfère le fruit entier : plus de fibres.|orange
Avocat-amande (smoothie)|jus avocat,avocat amande,cocktail avocat|🥑|1 grand verre (400 ml)|450|9|40|28|42|Délicieux mais très calorique.|avocat,lait,amandes,sucre
Tajine de poulet aux légumes|tajine djaj khodra|🍗|1 portion (350 g)|420|36|20|20|78|Beaucoup de légumes, peu d’huile : très équilibré.|poulet,carottes,courgettes,pommes de terre
Tajine de bœuf aux carottes|tajine lham carottes,tajine boeuf|🥩|1 portion (350 g)|520|36|22|31|58|Choisis une viande maigre et dégraisse la sauce.|bœuf,carottes,oignon,épices
Tajine de sardines (boulettes)|tajine sardines,kefta sardines,tajine hout kefta|🐟|1 portion (300 g)|430|30|14|27|72|Excellent apport en oméga-3.|sardines,tomate,chermoula,poivron
Tajine de crevettes|tajine crevettes,tajine gambas|🦐|1 portion (300 g)|340|32|12|18|82|Léger et riche en protéines.|crevettes,tomate,ail,coriandre
Tajine de pois chiches (hmss)|tajine hmss,hmis,hummus tajine,tajine pois chiches|🫘|1 portion (350 g)|330|14|46|10|86|Végétal, rassasiant et riche en fibres.|pois chiches,oignon,tomate,cumin
Tajine de courge à l’agneau|tajine courge,tajine 9ar3,tajine qar3|🎃|1 portion (350 g)|480|30|28|27|62|La courge apporte douceur sans sucre ajouté.|agneau,courge,oignon,cannelle
Djej mqualli (poulet citron olives)|djej mqualli,mqualli,m'qualli,poulet mqualli|🍋|1 portion (300 g)|480|36|10|32|66|Retire la peau et limite l’huile.|poulet,olives,citron confit,safran
Poulet rôti à la chermoula|poulet chermoula,poulet roti,djaj chermoula|🍗|1 portion (250 g)|420|42|3|27|80|Cuisson au four : zéro friture.|poulet,chermoula,citron,coriandre
Poulet m’hamer|djej mhamer,mhamer|🍗|1 portion (300 g)|460|38|6|31|68|Évite la peau pour −90 kcal.|poulet,cumin,paprika,beurre
Foie à la chermoula|foie,kebda,kebda mchermla,كبدة|🥩|1 portion (150 g)|280|26|6|17|78|Riche en fer et vitamine A.|foie,chermoula,paprika,cumin
Boulettes de kefta sauce tomate|kefta tomate,kefta sauce,boulettes kefta|🍝|1 portion (250 g)|420|28|14|28|62|Prends la sauce, pas trop d’huile.|viande hachée,tomate,oignon,persil
Merguez grillées (3)|merguez,merguez grillees|🌭|3 pièces (150 g)|380|20|2|33|35|Très grasses : alterne avec des brochettes.|merguez,harissa
Mrouzia|mrouzia,mrouzia aid,مروزية|🍯|1 portion (300 g)|680|34|45|40|30|Plat festif très riche, garde une petite portion.|agneau,raisins,miel,amandes
Lham lhalou|lham lhalou,tajine pruneaux amandes|🍖|1 portion (300 g)|620|32|48|32|38|Sucré-salé : pas plus d’une fois par semaine.|agneau,pruneaux,miel,amandes
Berkoukes|berkoukes,berkouks|🍲|1 bol (400 g)|520|24|68|16|60|Grosses perles de semoule : prends beaucoup de légumes.|berkoukes,légumes,viande,pois chiches
Hergma|hergma,pieds de veau|🍲|1 portion (300 g)|340|24|30|14|66|Riche en collagène, plutôt léger.|pieds de veau,pois chiches,tomate
Couscous aux légumes (végétarien)|couscous legumes,couscous vegetarien|🥕|1 assiette (400 g)|480|14|82|10|80|Parfait en version complète.|semoule,carottes,courgettes,pois chiches
Couscous d’orge (belboula)|belboula,couscous orge,couscous d orge,بلبولة|🌾|1 assiette (400 g)|420|14|74|8|86|Riche en fibres, très rassasiant.|orge,légumes,lait fermenté
Couscous au poisson|couscous poisson,couscous hout|🐟|1 assiette (400 g)|520|32|68|14|74|Excellent équilibre protéines/glucides.|semoule,poisson,légumes
Soupe de légumes marocaine|soupe,soupe legumes,chorba legumes|🥣|1 bol (300 ml)|120|4|18|3|92|Légère, parfaite en entrée.|légumes,pommes de terre,coriandre
Chorba (soupe de vermicelles)|chorba,chorba frik,شربة|🍜|1 bol (300 ml)|180|9|24|5|78|Parfaite en entrée de ftour.|vermicelles,agneau,tomate,coriandre
Soupe de poisson|soupe poisson,chorba hout|🍲|1 bol (300 ml)|160|14|12|6|86|Légère et riche en protéines.|poisson,tomate,ail
Salade de betteraves|salade betterave,betterave|🥗|150 g|90|2|16|2|94|Riche en nitrates et en fibres.|betteraves,cumin,persil
Salade de carottes au cumin|salade carottes,carottes cumin|🥕|150 g|80|1|12|3|94|Fraîche et riche en bêta-carotène.|carottes,cumin,citron
Salade d’aubergines grillées|salade aubergine,aubergine grillee|🍆|150 g|90|2|9|5|90|Fumée, légère et savoureuse.|aubergine,ail,persil
Salade de lentilles|salade lentilles|🥗|200 g|220|14|32|4|90|Protéines végétales et fer.|lentilles,oignon,persil
Salade de pois chiches|salade pois chiches|🥗|200 g|260|12|34|8|88|Rassasiante, parfaite en lunch box.|pois chiches,tomate,persil
Salade d’orange à la cannelle|salade orange,orange cannelle|🍊|150 g|110|2|26|0|82|Dessert frais sans sucre ajouté.|orange,cannelle,eau de fleur d’oranger
Salade de poivrons grillés|salade poivrons|🫑|150 g|70|2|10|3|92|Riche en vitamine C.|poivrons,ail,huile d’olive
Salade concombre menthe|salade concombre|🥒|150 g|40|2|6|1|96|Hydratante, quasi zéro calorie.|concombre,menthe,citron
Pastilla au poisson|pastilla poisson,pastilla fruits de mer|🥧|1 part (200 g)|430|24|38|20|56|Plus légère que la pastilla au poulet.|poisson,vermicelles,feuilles de brick,coriandre
Mlaoui|mlaoui,melaoui,mlawi|🫓|1 pièce (80 g)|250|5|30|12|45|Utilise peu de beurre pour la cuisson.|farine,semoule,huile
Rghaif|rghaif,rghayef|🫓|1 pièce (80 g)|280|6|31|14|42|Gras : garde-le pour les occasions.|farine,beurre,huile
Sfenj|sfenj,sfinj,beignet marocain|🍩|1 pièce (60 g)|180|3|24|8|38|Frit : 1 seul beignet suffit.|farine,levure,huile
Bsissa|bsissa,besissa|🥣|30 g|130|4|18|4|62|Grains grillés, énergie durable.|orge,blé,anis,sésame
Lben (lait fermenté)|lben,raib,laban,لبن|🥛|1 verre (250 ml)|110|7|10|4|80|Probiotique, léger et rafraîchissant.|lait fermenté
Fromage frais (jben)|jben,fromage frais,جبن|🧀|60 g|80|8|2|4|82|Riche en protéines, peu calorique.|fromage frais
Mhancha|mhancha,m hanncha,serpent|🐍|1 pièce (60 g)|210|4|22|12|28|Amandes et beurre : à partager.|amandes,feuilles de brick,beurre
Ghoriba|ghoriba,ghribia,غريبة|🍪|1 pièce (30 g)|125|2|14|7|35|Choisis la ghoriba aux amandes.|semoule,sucre,beurre
Zlabia|zlabia,zlabiya,زلابية|🍯|1 pièce (40 g)|150|1|25|5|20|Trempée dans le miel : 1 seule.|farine,miel,huile
Fekkas|fekkas,fakkas|🥨|2 pièces (30 g)|100|2|18|2|62|Biscuit sec, plus léger que les gâteaux.|farine,anis,amandes
Pastilla au lait|pastilla lait,pastilla dessert|🍮|1 part (150 g)|380|8|48|17|28|Dessert très sucré : à partager.|feuilles de brick,lait,amandes,sucre
Amandes (30 g)|amandes,loz,لوز|🌰|30 g|175|6|6|15|82|Bonnes graisses, 1 poignée par jour.|amandes
Olives (10)|olives,zitoun,زيتون|🫒|10 olives (40 g)|60|0|2|6|70|Salées : modère avec la tension.|olives
Figues fraîches (3)|figues,karmous,كرموس|🍈|3 figues (150 g)|90|1|22|0|86|Sucre naturel et fibres.|figues
Grenade|grenade,rumman|🍎|1 fruit (150 g)|100|2|23|1|86|Antioxydants, parfaite en dessert.|grenade
Orange|orange,limoun|🍊|1 fruit (150 g)|70|1|17|0|92|Vitamine C, préfère-la au jus.|orange`;
const norm=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[’']/g,' ').replace(/[^a-z0-9؀-ۿ ]/g,' ').replace(/\s+/g,' ').trim();
const MAR=MAROC.split('\n').map(l=>{const a=l.split('|');return {name:a[0],keys:a[1].split(',').map(norm).filter(Boolean).concat([norm(a[0])]),emoji:a[2],portion:a[3],kcal:+a[4],p:+a[5],c:+a[6],f:+a[7],score:+a[8],tip:a[9],ing:a[10].split(',')}});
function marocFind(q){const t=norm(q);if(t.length<3)return null;let best=null,bl=0;for(const d of MAR)for(const k of d.keys){if((t===k||t.includes(k)||(k.length>=5&&k.includes(t)&&t.length>=4))&&k.length>bl){best=d;bl=k.length}}return best}
const marocResult=d=>({dish:d.name,items:d.ing.map(n=>({name:n,emoji:'',grams:0})),kcal:d.kcal,p:d.p,c:d.c,f:d.f,score:d.score,verdict:d.score>=75?'Excellent':d.score>=55?'Correct':d.score>=40?'Modéré':'À limiter',tip:d.tip,src:'🇲🇦 Base cuisine marocaine · '+d.portion,better_prompt:'Healthy version of Moroccan '+d.name+', plated beautifully'});

/* ---------- visual atoms ---------- */
function ring(value,max,label,sub,color='var(--nx-primary)'){const p=clamp(value/max*100,0,100),C=2*Math.PI*52;return `<div class="nv-ring" style="--c:${color}"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="bg"/><circle cx="60" cy="60" r="52" class="fg" stroke-dasharray="${(C*p/100).toFixed(1)} ${C.toFixed(1)}"/></svg><div><strong>${esc(label)}</strong><small>${esc(sub)}</small></div></div>`}
function bar(label,val,max,unit,color){return `<div class="nv-bar"><span>${esc(label)}</span><div><i style="width:${clamp(val/max*100,2,100)}%;background:${color}"></i></div><b>${val<10&&val%1?Math.round(val*10)/10:r0(val)}<small>${unit}</small></b></div>`}
function scoreColor(s){return s>=70?'#14a37a':s>=45?'#e8a317':'#e0533d'}
const chip=(t,e='',cls='')=>`<span class="nv-chip ${cls}">${e?`<em>${esc(e)}</em>`:''}${esc(t)}</span>`;

/* ---------- result renderers ---------- */
const R={
 plate(d){const kcal=n(d.kcal),p=n(d.p),c=n(d.c),f=n(d.f),s=clamp(d.score,0,100),items=Array.isArray(d.items)?d.items.slice(0,10):[];
  return `<div class="nv-res-top">${ring(kcal,900,r0(kcal),'kcal',scoreColor(s))}<div class="nv-res-head"><h3>${esc(short(d.dish,48))}</h3><span class="nv-badge" style="--b:${scoreColor(s)}">${s}/100 · ${esc(short(d.verdict,24))}</span></div></div>
  <div class="nv-bars">${bar('Protéines',p,60,'g','#14a37a')}${bar('Glucides',c,120,'g','#4f8df7')}${bar('Lipides',f,50,'g','#e8a317')}</div>
  <div class="nv-chips">${items.map(i=>chip(`${short(i.name,22)}${n(i.grams)>0?' · '+r0(i.grams)+' g':''}`,i.emoji)).join('')}</div>
  ${d.tip?`<p class="nv-tip">${ico('spark')}${esc(short(d.tip,90))}</p>`:''}${d.src?`<p class="nv-foot">${esc(d.src)}</p>`:''}`},
 fridge(d){const items=Array.isArray(d.items)?d.items.slice(0,16):[],rec=Array.isArray(d.recipes)?d.recipes.slice(0,3):[];
  const st={frais:['frais','ok'],a_utiliser:['à utiliser','warn'],incertain:['?','mute']};
  return `<div class="nv-chips big">${items.map(i=>{const s=st[i.state]||st.incertain;return chip(short(i.name,22),i.emoji,s[1])+''}).join('')}</div>
  <h4 class="nv-h">Idées rapides</h4><div class="nv-recipes">${rec.map(x=>`<div class="nv-recipe"><b>${esc(x.emoji||'🍽️')}</b><strong>${esc(short(x.name,40))}</strong><span>${ico('clock')}${r0(x.minutes)} min</span>${(x.missing||[]).length?`<div class="nv-miss">${(x.missing||[]).slice(0,4).map(m=>`<i>${esc(short(m,18))}</i>`).join('')}</div>`:''}</div>`).join('')}</div>${shopHtml(d)}`},
 swap(d){const a=d.a||{},b=d.b||{},w=d.winner;
  const lab=s=>s>=75?['Excellent','#14a37a']:s>=50?['Bon','#7bbf2a']:s>=25?['Médiocre','#ef8a1c']:['Mauvais','#e0533d'];
  const lvl=(v,g,o,inv)=>{v=n(v);const good=inv?v>=g:v<=g,ok=inv?v>=o:v<=o;return good?['g','Excellent']:ok?['o','Moyen']:['r','Élevé']};
  const rows=x=>[['Énergie','flame',x.kcal,' kcal',lvl(x.kcal,150,350)],['Sucres','cube',x.sugar,' g',lvl(x.sugar,5,12)],['Lipides','drop',x.fat,' g',lvl(x.fat,3,10)],['Sel','salt',x.salt,' g',lvl(x.salt,.3,1)],['Protéines','muscle',x.p,' g',(v=>v>=8?['g','Riche']:v>=3?['o','Moyen']:['m','Faible'])(n(x.p))]];
  const side=(x,k,img)=>{const s=clamp(x.score,0,100),[t,c]=lab(s),win=w===k;
   return `<article class="nv-prod ${win?'win':''}" style="--sc:${c}">
   <div class="nv-prod-hero"><span class="nv-letter">${k.toUpperCase()}</span>${img?`<img src="${img}" alt="">`:`<b>${esc(x.emoji||'🍽️')}</b>`}${win?`<span class="nv-crown">${ico('trophy')}<em>Meilleur choix</em></span>`:''}</div>
   <div class="nv-prod-body"><h4>${esc(short(x.name,34))}</h4>${x.brand?`<small>${esc(short(x.brand,26))}</small>`:''}
    <div class="nv-score"><div class="nv-score-n"><strong>${r0(s)}</strong><small>/100</small></div><div class="nv-score-bar"><i style="width:${clamp(s,3,100)}%"></i></div><span class="nv-score-l">${t}</span></div>
    <ul class="nv-facts">${rows(x).map(([l,ic,v,u,[lv,tx]])=>`<li class="${lv}"><i class="nv-fi">${I[ic]}</i><span>${l}<small>${tx}</small></span><b>${v==null?'—':(n(v)<10&&n(v)%1?Math.round(n(v)*10)/10:r0(v))}<small>${u}</small></b><em></em></li>`).join('')}</ul>
    ${Array.isArray(x.tags)&&x.tags.length?`<div class="nv-chips">${x.tags.slice(0,3).map(t=>chip(short(t,26))).join('')}</div>`:''}</div></article>`};
  const imgs=(state.swap&&state.swap.imgs)||[];
  return `<div class="nv-swap-res">${d.why?`<div class="nv-verdict">${ico('trophy')}<div><small>Verdict</small><strong>${esc(short(d.why,80))}</strong></div></div>`:''}<div class="nv-prods">${side(a,'a',imgs[0])}<div class="nv-vs-dot">VS</div>${side(b,'b',imgs[1])}</div></div>`},
 intelligence(d){const s=clamp(d.score,0,100),g=String(d.grade||'C').toUpperCase().slice(0,1),per=d.per100||{};const gc={A:'#1a9b58',B:'#7bbf2a',C:'#e8c21a',D:'#ef8a1c',E:'#e0533d'}[g]||'#e8c21a';
  const list=(a,cls,ic)=>(Array.isArray(a)?a.slice(0,3):[]).map(t=>`<li class="${cls}">${ico(ic)}${esc(short(t,34))}</li>`).join('');
  return `<div class="nv-res-top">${ring(s,100,s,'/100',scoreColor(s))}<div class="nv-res-head"><h3>${esc(d.emoji||'')} ${esc(short(d.name,40))}</h3><div class="nv-grades">${['A','B','C','D','E'].map(x=>`<i class="${x===g?'on':''}" style="--g:${{A:'#1a9b58',B:'#7bbf2a',C:'#e8c21a',D:'#ef8a1c',E:'#e0533d'}[x]}">${x}</i>`).join('')}</div></div></div>
  <ul class="nv-points">${list(d.good,'ok','check')}${list(d.watch,'warn','warn')}</ul>
  <div class="nv-bars">${bar('Énergie',n(per.kcal),600,' kcal','#e8a317')}${bar('Protéines',n(per.p),40,'g','#14a37a')}${bar('Sucres',n(per.sugar),50,'g','#e0533d')}${bar('Sel',n(per.salt),3,'g','#4f8df7')}</div><p class="nv-foot">pour 100 g · estimation</p>`},
 restaurant(d){const picks=Array.isArray(d.picks)?d.picks.slice(0,3):[];const lv={leger:'Léger',moyen:'Moyen',riche:'Riche'};
  return `<div class="nv-picks">${picks.map((x,i)=>`<div class="nv-pick ${i===0?'best':''}"><span class="nv-rank">${i+1}</span><b class="nv-emoji">${esc(x.emoji||'🍽️')}</b><div><strong>${esc(short(x.name,40))}</strong><small>${esc(short(x.why,50))}</small></div><div class="nv-pick-end"><em class="lv ${esc(x.level)}">${esc(lv[x.level]||'')}</em><span style="--b:${scoreColor(n(x.score))}">${r0(x.score)}</span></div></div>`).join('')}</div>`}
};
const GEN={plate:{k:'better_prompt',label:'Voir l’image plus saine'},fridge:{k:'image_prompt',label:'Générer le plat'},restaurant:{k:'image_prompt',label:'Voir le plat conseillé'}};

/* ---------- view ---------- */
function slotHtml(tool,i,name){const img=state[tool].imgs[i];return `<div class="nv-slot ${img?'has':''}" data-slot="${i}" tabindex="0" role="button" aria-label="${esc(name)}">
 ${img?`<img src="${img}" alt="${esc(name)}"><span class="nv-scan"></span><button type="button" class="nv-x" data-clear="${i}" aria-label="Retirer">${I.close}</button>`:`<div class="nv-slot-empty">${ico('camera')}<strong>${esc(name)}</strong><small>Prendre ou déposer une photo</small></div>`}
 <input type="file" accept="image/jpeg,image/png,image/webp" ${'capture' in document.createElement('input')?'':''} hidden></div>`}
function view(tool){const c=CFG[tool],S=state[tool];if(tool==='swap')return viewSwap(c,S);if(tool==='fridge')return viewFridge(c,S);const ready=S.imgs.filter(Boolean).length>=c.slots.length||!!(S.text&&S.text.trim());
 return `<section class="nv" data-tool="${tool}">
  <div class="nv-in"><header><h3>${esc(c.title)}</h3><p>${esc(c.sub)}</p></header>
   <div class="nv-slots n${c.slots.length}">${c.slots.map((nm,i)=>slotHtml(tool,i,nm)).join('')}</div>
   <div class="ch-add nv-text"><input type="text" maxlength="160" data-text value="${esc(S.text||'')}" placeholder="${tool==='restaurant'?'Ou écrivez le menu : tajine, pizza, salade…':tool==='intelligence'?'Ou écrivez le produit : Nutella, yaourt nature…':'Ou décrivez : couscous, tajine poulet, burger…'}" autocomplete="off"></div>
   ${tool==='plate'?`<div class="nt-moro"><small>🇲🇦 Plats marocains · instantané</small><div>${['Harira','Tajine poulet olives citron','Couscous aux sept légumes','Msemen','Pastilla au poulet','Sardines grillées','Zaalouk','Thé à la menthe (sucré)','Chebakia','Baghrir (2 crêpes)'].map(n=>`<button type="button" data-moro="${esc(n)}">${esc(n.replace(/ \(.*\)/,'').replace(' olives citron',''))}</button>`).join('')}</div></div>`:''}
   <button type="button" class="nv-go" ${ready&&!S.busy?'':'disabled'}>${S.busy?'<span class="nv-spin"></span>Analyse en cours':ico('spark')+esc(c.cta)}</button>
   ${S.err?`<p class="nv-err">${ico('warn')}${esc(S.err)}</p>`:''}${histHtml(tool)}</div>
  <div class="nv-out ${S.result||S.busy?'on':''}">${S.busy?'<div class="nv-skel"><i></i><i></i><i></i></div>':S.result?`<div class="nv-card">${R[tool](S.result)}${GEN[tool]&&S.result[GEN[tool].k]?`<button type="button" class="nv-gen" ${S.genBusy?'disabled':''}>${S.genBusy?'<span class="nv-spin dark"></span>Création…':ico('spark')+GEN[tool].label}</button>`:''}${tool==='plate'?`<button type="button" class="nv-gen nv-heal">${ico('spark')}Recette plus saine (étapes)</button><button type="button" class="nv-journal" ${S.added?'disabled':''}>${S.added?ico('check')+esc(S.added):ico('check')+'Ajouter au journal'}</button>`:''}${S.genErr?`<p class="nv-err">${ico('warn')}${esc(S.genErr)}</p>`:''}${S.gen?`<figure class="nv-fig"><img src="${S.gen}" alt="Idée de plat générée"><figcaption>Image générée par IA · illustration</figcaption></figure>`:''}<button type="button" class="nv-reset">${ico('refresh')}Nouvelle analyse</button></div>`:`<div class="nv-empty"><b>${ico('image')}</b><span>Le résultat apparaîtra ici</span></div>`}</div>
 </section>`}
function viewSwap(c,S){const ready=S.imgs.filter(Boolean).length>=2;
 return `<section class="nv nv-swap" data-tool="swap">
  <div class="nv-in"><header><h3>${esc(c.title)}</h3><p>${esc(c.sub)}</p></header>
   <div class="nv-vs-slots">${slotHtml('swap',0,'Produit A')}<div class="nv-vs-dot">VS</div>${slotHtml('swap',1,'Produit B')}</div>
   <button type="button" class="nv-go" ${ready&&!S.busy?'':'disabled'}>${S.busy?'<span class="nv-spin"></span>Comparaison en cours':ico('spark')+esc(c.cta)}</button>
   ${S.err?`<p class="nv-err">${ico('warn')}${esc(S.err)}</p>`:''}${histHtml('swap')}</div>
  ${S.busy?'<div class="nv-out on"><div class="nv-skel"><i></i><i></i><i></i></div></div>':S.result?`<div class="nv-out on nv-out-wide">${R.swap(S.result)}<button type="button" class="nv-reset">${ico('refresh')}Nouvelle comparaison</button></div>`:''}
 </section>`}
function render(tool){if(!CFG[tool])return false;state[tool]=state[tool]||{imgs:[]};root.innerHTML=view(tool);bind(tool);return true}
function bind(tool){const S=state[tool],el=root.querySelector('.nv');
 el.querySelectorAll('.nv-slot').forEach(slot=>{const i=Number(slot.dataset.slot),inp=slot.querySelector('input');
  const pick=()=>{if(!S.imgs[i])inp.click()};
  slot.addEventListener('click',e=>{if(e.target.closest('[data-clear]'))return;pick()});
  slot.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick()}});
  slot.addEventListener('dragover',e=>{e.preventDefault();slot.classList.add('drag')});slot.addEventListener('dragleave',()=>slot.classList.remove('drag'));
  slot.addEventListener('drop',e=>{e.preventDefault();slot.classList.remove('drag');set(e.dataTransfer.files?.[0])});
  inp.addEventListener('change',()=>set(inp.files?.[0]));
  async function set(f){if(!f||!/^image\//.test(f.type))return;try{S.imgs[i]=await fileToImage(f);S.result=null;S.gen=null;S.err='';S.genErr='';render(tool)}catch{S.err='Image illisible.';render(tool)}}
 });
 el.querySelectorAll('[data-clear]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();S.imgs[Number(b.dataset.clear)]=null;S.result=null;S.gen=null;render(tool)}));
 el.querySelector('[data-text]')?.addEventListener('input',e=>{S.text=e.target.value;const g=el.querySelector('.nv-go');if(g&&!S.busy)g.disabled=!(S.text.trim()||S.imgs.filter(Boolean).length>=CFG[tool].slots.length)});
 el.querySelector('[data-text]')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();el.querySelector('.nv-go')?.click()}});
 const showLocal=d=>{S.result=marocResult(d);S.gen=null;S.err='';S.added='';remember(tool,[],S.result);render(tool)};
 el.querySelectorAll('[data-moro]').forEach(b=>b.addEventListener('click',()=>{const d=MAR.find(x=>x.name===b.dataset.moro);if(d){S.text=d.name;showLocal(d)}}));
 el.querySelector('.nv-go')?.addEventListener('click',async()=>{if(tool==='plate'&&!S.imgs.filter(Boolean).length){const d=marocFind(S.text);if(d)return showLocal(d)}S.busy=true;S.err='';S.gen=null;S.genErr='';render(tool);
  try{const j=await post('/api/ai/vision',{tool,images:S.imgs.filter(Boolean),text:S.imgs.filter(Boolean).length?'':(S.text||''),note:(()=>{try{const p=JSON.parse(localStorage.getItem('nutrix-prefs')||'[]');return p.length?'Préférences : '+p.join(', '):''}catch{return ''}})(),language:document.documentElement.lang==='ary'?'ary':'fr'});S.result=j.result;S.added='';remember(tool,S.imgs,j.result);if(tool==='fridge')try{localStorage.setItem('nutrix-vision-fridge',JSON.stringify(j.result.items||[]))}catch{}}
  catch(e){S.err=e.message}S.busy=false;render(tool)});
 el.querySelector('.nv-gen')?.addEventListener('click',async()=>{S.genBusy=true;S.genErr='';render(tool);
  try{const j=await post('/api/ai/image',{prompt:short(S.result[GEN[tool].k],500)},1);S.gen=j.image}catch(e){S.genErr=e.message}S.genBusy=false;render(tool)});
 el.querySelector('[data-shop-add]')?.addEventListener('click',()=>{const l=shopGet();missingOf(S.result).forEach(t=>{if(!l.some(x=>x.t.toLowerCase()===t.toLowerCase()))l.push({t,done:false})});shopSet(l);render(tool)});
 el.querySelectorAll('[data-shop-t]').forEach(b=>b.addEventListener('click',()=>{const l=shopGet(),i=Number(b.dataset.shopT);if(l[i])l[i].done=!l[i].done;shopSet(l);render(tool)}));
 el.querySelectorAll('[data-shop-x]').forEach(b=>b.addEventListener('click',()=>{const l=shopGet();l.splice(Number(b.dataset.shopX),1);shopSet(l);render(tool)}));
 el.querySelector('[data-shop-clear]')?.addEventListener('click',()=>{shopSet([]);render(tool)});
 el.querySelectorAll('[data-hi]').forEach(b=>b.addEventListener('click',()=>{const x=hist().find(h=>String(h.ts)===b.dataset.hi);if(!x)return;S.result=x.result;S.items=null;S.chef=null;S.gen=null;S.err='';S.added='';render(tool)}));
 el.querySelector('.nv-heal')?.addEventListener('click',()=>{const md=S.result&&S.result.src&&MAR.find(x=>x.name===S.result.dish);if(md)return launchMaroc(md);const F=state.fridge=state.fridge||{imgs:[]};const items=(S.result.items||[]).map(i=>({name:short(i.name,30),emoji:i.emoji||'🍽️',state:'frais',on:true}));if(!items.length){S.err='Aucun ingrédient détecté.';return render(tool)}Object.assign(F,{imgs:[],result:null,items,typed:[],goal:'leger',servings:2,chef:null,chefErr:'',dish:S.result.dish,open:0,done:{}});document.querySelector('#ns-tabs [data-tool=fridge]')?.click();setTimeout(()=>{render('fridge');runChef(F,'fridge')},60)});
 el.querySelector('.nv-journal')?.addEventListener('click',()=>{const r=addToJournal(S.result);S.added=r.ok?'Ajouté · '+r.meal:'';if(!r.ok)S.err='Ajout impossible.';render(tool)});
 el.querySelector('.nv-reset')?.addEventListener('click',()=>{state[tool]={imgs:[]};render(tool)});
 if(tool==='fridge')bindFridge(S,el);
}

/* =====================  Chef Studio : frigo → recettes complètes pas à pas  ===================== */
const FAVK='nutrix-recipes-fav';
const favGet=()=>{try{return JSON.parse(localStorage.getItem(FAVK)||'[]')}catch{return []}};
const favSet=a=>{try{localStorage.setItem(FAVK,JSON.stringify(a.slice(0,30)))}catch{}};
const GOALS=[['equilibre','⚖️','Équilibré'],['proteine','💪','Protéiné'],['leger','🥗','Léger'],['rapide','⚡','Rapide'],['antigaspi','♻️','Anti-gaspi'],['budget','💶','Éco']];
const LEVEL={facile:'Facile',moyen:'Moyen',chef:'Chef'};
function ensureItems(S){if(!S.items){S.items=((S.result&&S.result.items)||[]).map(i=>({name:short(i.name,30),emoji:i.emoji||'🥬',state:i.state,on:true}))}
 if(!S.goal)S.goal='equilibre';if(!S.servings)S.servings=2;if(!S.typed)S.typed=[];return S}
function viewFridge(c,S){ensureItems(S);const hasPhoto=S.imgs.filter(Boolean).length>=1,hasItems=S.items.some(i=>i.on)||S.typed.length||S.maroc;
 const favs=favGet();
 const typed=`<div class="ch-add"><input type="text" id="ch-in" maxlength="40" placeholder="Ou tapez un ingrédient : œufs, riz, poulet…" autocomplete="off"><button type="button" id="ch-addbtn" aria-label="Ajouter">+</button></div>
  ${S.typed.length&&!S.items.length?`<div class="nv-chips ch-typed">${S.typed.map((t,i)=>`<button type="button" class="nv-chip ok" data-tdel="${i}">${esc(t)} ×</button>`).join('')}</div>`:''}`;
 const hasList=S.items.length>0;
 const panel=hasList||S.typed.length||S.maroc?`<div class="ch-panel">
   ${S.maroc&&S.maroc.ref?`<div class="ch-ref"><b>🇲🇦 ${esc(S.maroc.ref.name)}</b><small>Version traditionnelle : ${esc(S.maroc.ref.portion)} · ${S.maroc.ref.kcal} kcal</small></div>`:`<h4 class="nv-h">Vos ingrédients <small>touchez pour retirer</small></h4>`}
   <div class="nv-chips ch-items">${S.items.map((i,k)=>`<button type="button" class="nv-chip ch-it ${i.on?(i.state==='a_utiliser'?'warn':'ok'):'off'}" data-it="${k}"><em>${esc(i.emoji)}</em>${esc(i.name)}</button>`).join('')}${S.typed.map((t,i)=>`<button type="button" class="nv-chip ok ch-it" data-tdel="${i}"><em>➕</em>${esc(t)}</button>`).join('')}</div>
   <h4 class="nv-h">Votre envie</h4>
   <div class="ch-goals">${GOALS.map(g=>`<button type="button" class="${S.goal===g[0]?'on':''}" data-goal="${g[0]}"><em>${g[1]}</em>${g[2]}</button>`).join('')}</div>
   <div class="ch-serv"><span>Portions</span><div><button type="button" data-sv="-1" aria-label="Moins">−</button><b>${S.servings}</b><button type="button" data-sv="1" aria-label="Plus">+</button></div></div>
   <button type="button" class="nv-go ch-go" ${S.chefBusy||!hasItems?'disabled':''}>${S.chefBusy?'<span class="nv-spin"></span>Le chef cuisine…':ico('spark')+'Créer mes recettes'}</button>
   ${S.chefErr?`<p class="nv-err">${ico('warn')}${esc(S.chefErr)} <button type="button" class="ch-retry">Réessayer</button></p>`:''}</div>`:'';
 const recipes=(S.chef&&S.chef.recipes)||[];
 const out=S.chefBusy?'<div class="nv-skel"><i></i><i></i><i></i></div>':recipes.length?`<div class="ch-list">${recipes.map((r,i)=>recipeCard(r,i,S)).join('')}</div>${shopHtml({recipes:[]})}`:`<div class="nv-empty"><b>${ico('image')}</b><span>Photo ou ingrédients tapés → 3 recettes complètes avec étapes, minuteurs et courses.</span></div>`;
 const favHtml=favs.length?`<div class="nv-hist"><h4 class="nv-h">Mes recettes ♥</h4><div class="nv-hist-row">${favs.slice(0,8).map((f,i)=>`<button type="button" data-fav="${i}" title="${esc(f.name)}"><b>${esc(f.emoji||'🍽️')}</b><span>${esc(short(f.name,20))}</span></button>`).join('')}</div></div>`:'';
 return `<section class="nv ch" data-tool="fridge">
  <div class="nv-in"><header><h3>Chef Studio</h3><p>Photographiez votre frigo : l’IA détecte, vous choisissez, le chef vous guide.</p></header>
   <div class="nv-slots n1">${slotHtml('fridge',0,'Frigo ou courses')}</div>
   <button type="button" class="nv-go" ${hasPhoto&&!S.busy?'':'disabled'}>${S.busy?'<span class="nv-spin"></span>Détection en cours':ico('camera')+'Détecter les ingrédients'}</button>
   ${S.err?`<p class="nv-err">${ico('warn')}${esc(S.err)} <button type="button" class="ch-retry-scan">Réessayer</button></p>`:''}
   ${typed}${panel}${favHtml}${histHtml('fridge')}</div>
  <div class="nv-out on ch-out">${out}</div>
 </section>`}
function macro(l,v,u,c){return `<span style="--c:${c}"><b>${r0(v)}${u}</b><small>${l}</small></span>`}
function recipeCard(r,i,S){const open=S.open===i,ings=Array.isArray(r.ingredients)?r.ingredients:[],steps=Array.isArray(r.steps)?r.steps:[],miss=ings.filter(x=>!x.have);
 const faved=favGet().some(f=>f.name===r.name);
 return `<article class="ch-rec ${open?'open':''}" data-r="${i}">
  <button type="button" class="ch-rec-h" data-ropen="${i}"><b class="ch-emo">${r.img?`<img src="${r.img}" alt="">`:esc(r.emoji||'🍽️')}</b><div><strong>${esc(short(r.name,48))}</strong><small>${esc(short(r.why,70))}</small>
   <div class="ch-meta"><span>${ico('clock')}${r0(r.minutes)} min</span><span>${ico('flame')}${r0(r.kcal)} kcal</span>${n(r.kcal_trad)>n(r.kcal)+20?`<span class="lv facile">−${r0(n(r.kcal_trad)-n(r.kcal))} kcal</span>`:''}<span class="lv ${esc(r.level)}">${esc(LEVEL[r.level]||'Facile')}</span></div></div><i class="ch-caret"></i></button>
  ${open?`<div class="ch-rec-b">
   <div class="ch-macros">${macro('Protéines',r.p,' g','#14a37a')}${macro('Glucides',r.c,' g','#4f8df7')}${macro('Lipides',r.f,' g','#e8a317')}<span class="ch-time"><b>${r0(r.prep)}′ + ${r0(r.cook)}′</b><small>prépa + cuisson</small></span></div>
   ${Array.isArray(r.changes)&&r.changes.length?`<div class="ch-chg"><h4 class="nv-h">Ce qu’on a allégé${n(r.kcal_trad)?` <small>${r0(r.kcal_trad)} → ${r0(r.kcal)} kcal</small>`:''}</h4><ul>${r.changes.slice(0,4).map(c=>`<li>${esc(short(c,130))}</li>`).join('')}</ul></div>`:''}
   <h4 class="nv-h">Ingrédients · ${r0(r.servings||S.servings)} portion${(r.servings||S.servings)>1?'s':''}</h4>
   <ul class="ch-ings">${ings.map(x=>`<li class="${x.have?'have':'miss'}"><i>${x.have?I.check:'+'}</i><span>${esc(short(x.name,40))}</span><em>${esc(short(x.qty,16))}</em></li>`).join('')}</ul>
   ${miss.length?`<button type="button" class="ch-link" data-rshop="${i}">${ico('check')}Ajouter ${miss.length} manquant${miss.length>1?'s':''} aux courses</button>`:''}
   <h4 class="nv-h">Préparation</h4>
   <ol class="ch-steps">${steps.map((st,k)=>`<li class="${(S.done||{})[i+'-'+k]?'done':''}"><button type="button" class="ch-chk" data-sdone="${i}-${k}" aria-label="Étape faite">${I.check}</button><div><p>${esc(short(st.t,260))}</p>${n(st.min)>0?`<button type="button" class="ch-timer" data-timer="${i}-${k}" data-min="${r0(st.min)}">${ico('clock')}<span>${r0(st.min)}:00</span></button>`:''}</div></li>`).join('')}</ol>
   ${r.tip?`<p class="nv-tip">${ico('spark')}${esc(short(r.tip,110))}</p>`:''}${r.swap?`<p class="nv-tip alt">🥗 ${esc(short(r.swap,120))}</p>`:''}
   ${r.img?`<figure class="nv-fig"><img src="${r.img}" alt=""><figcaption>Illustration IA</figcaption></figure>`:''}
   <div class="ch-acts"><button type="button" class="ch-cook" data-cook="${i}">${ico('flame')}Mode cuisine</button>
    <button type="button" data-rimg="${i}" ${r.imgBusy||r.img||!r.image_prompt?'disabled':''}>${r.imgBusy?'<span class="nv-spin dark"></span>':ico('image')}Image</button>
    <button type="button" data-rjournal="${i}" ${r.added?'disabled':''}>${ico('check')}${r.added?'Ajouté':'Journal'}</button>
    <button type="button" data-rfav="${i}" class="${faved?'on':''}">${faved?'♥':'♡'} Favori</button></div>
   </div>`:''}
 </article>`}
const TM={};
function tick(){document.querySelectorAll('[data-timer]').forEach(b=>{const t=TM[b.dataset.timer],sp=b.querySelector('span');if(!t||!sp)return;const left=Math.max(0,Math.round((t.end-Date.now())/1000));sp.textContent=left?Math.floor(left/60)+':'+String(left%60).padStart(2,'0'):'Terminé !';b.classList.toggle('run',!!left);b.classList.toggle('end',!left);if(!left&&!t.fired){t.fired=1;try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch{}try{const a=new (window.AudioContext||window.webkitAudioContext)(),o=a.createOscillator();o.connect(a.destination);o.frequency.value=880;o.start();setTimeout(()=>o.stop(),350)}catch{}}})}
setInterval(tick,1000);
function startTimer(key,min){if(TM[key]&&!TM[key].fired&&TM[key].end>Date.now()){delete TM[key]}else TM[key]={end:Date.now()+min*60000};tick()}
function cookMode(S,i){const r=S.chef.recipes[i],steps=r.steps||[];let k=0;
 const ov=document.createElement('div');ov.className='ch-cookov';document.body.appendChild(ov);document.body.style.overflow='hidden';
 const close=()=>{ov.remove();document.body.style.overflow='';clearInterval(iv)};
 let iv;
 const draw=()=>{const st=steps[k]||{};ov.innerHTML=`<div class="ch-cookbox"><button type="button" class="ch-cx" aria-label="Fermer">${I.close}</button>
  <small>${esc(short(r.name,40))} · étape ${k+1}/${steps.length}</small><div class="ch-prog"><i style="width:${(k+1)/steps.length*100}%"></i></div>
  <p class="ch-big">${esc(st.t||'')}</p>
  ${n(st.min)>0?`<button type="button" class="ch-timer big" data-timer="cook-${i}-${k}" data-min="${r0(st.min)}">${ico('clock')}<span>${r0(st.min)}:00</span></button>`:''}
  <div class="ch-nav"><button type="button" data-p ${k?'':'disabled'}>← Précédent</button><button type="button" data-n class="pri">${k<steps.length-1?'Suivant →':'Terminé ✓'}</button></div></div>`;
  ov.querySelector('.ch-cx').onclick=close;ov.querySelector('[data-p]').onclick=()=>{k--;draw()};
  ov.querySelector('[data-n]').onclick=()=>{if(k<steps.length-1){k++;draw()}else close()};
  const tb=ov.querySelector('[data-timer]');if(tb)tb.onclick=()=>startTimer(tb.dataset.timer,Number(tb.dataset.min));tick()};
 draw();try{navigator.wakeLock&&navigator.wakeLock.request('screen').catch(()=>{})}catch{}}
function profile(){try{const o=JSON.parse(localStorage.getItem('SD_V5')||'{}').settings||{};return {goal:o.goal||'maintain',target:Number(o.target)||0,weight:Number(o.weight)||0}}catch{return {}}}
async function runChef(S,tool){S.chefBusy=true;S.chefErr='';S.open=0;render(tool);
 const names=[...S.items.filter(i=>i.on).map(i=>i.name),...S.typed];const mar=S.maroc||{};
 try{const j=await post('/api/ai/vision',{tool:'chef',ingredients:names,goal:S.goal,servings:S.servings,dish:S.dish||'',cuisine:(S.maroc?'maroc':''),ref:mar.ref||null,pool:mar.pool||[],profile:profile(),prefs:(()=>{try{return JSON.parse(localStorage.getItem('nutrix-prefs')||'[]')}catch{return []}})(),language:document.documentElement.lang==='ary'?'ary':'fr'});
  const rec=(j.result&&j.result.recipes||[]).filter(r=>r&&r.name&&Array.isArray(r.steps)&&r.steps.length);
  if(!rec.length)throw new Error('Le chef n’a pas trouvé de recette. Réessaie.');
  S.chef={recipes:rec.slice(0,3)};S.done={}}
 catch(e){S.chefErr=e.message}
 S.chefBusy=false;render(tool);setTimeout(()=>{const o=root.querySelector('.ch-out');o&&o.scrollIntoView({behavior:'smooth',block:'start'})},60)}
async function runScan(S,tool){S.busy=true;S.err='';render(tool);
 try{const j=await post('/api/ai/vision',{tool:'fridge',images:S.imgs.filter(Boolean),note:'',language:document.documentElement.lang==='ary'?'ary':'fr'});
  S.result=j.result;S.items=null;S.chef=null;ensureItems(S);remember('fridge',S.imgs,j.result);try{localStorage.setItem('nutrix-vision-fridge',JSON.stringify(j.result.items||[]))}catch{}}
 catch(e){S.err=e.message}S.busy=false;render(tool)}
function bindFridge(S,el){const tool='fridge';
 el.querySelector('.nv-go:not(.ch-go)')?.replaceWith(el.querySelector('.nv-go:not(.ch-go)').cloneNode(true));
 el.querySelector('.nv-go:not(.ch-go)')?.addEventListener('click',()=>runScan(S,tool));
 el.querySelector('.ch-retry-scan')?.addEventListener('click',()=>runScan(S,tool));
 el.querySelector('.ch-retry')?.addEventListener('click',()=>runChef(S,tool));
 const add=()=>{const inp=el.querySelector('#ch-in'),v=inp.value.split(/[,;\n]/).map(x=>x.trim()).filter(Boolean);if(!v.length)return;v.forEach(x=>{if(!S.typed.some(t=>t.toLowerCase()===x.toLowerCase()))S.typed.push(short(x,40))});render(tool);setTimeout(()=>root.querySelector('#ch-in')?.focus(),30)};
 el.querySelector('#ch-addbtn')?.addEventListener('click',add);el.querySelector('#ch-in')?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();add()}});
 el.querySelectorAll('[data-it]').forEach(b=>b.addEventListener('click',()=>{const i=S.items[Number(b.dataset.it)];if(i){i.on=!i.on;render(tool)}}));
 el.querySelectorAll('[data-tdel]').forEach(b=>b.addEventListener('click',()=>{S.typed.splice(Number(b.dataset.tdel),1);render(tool)}));
 el.querySelector('[data-maroc]')?.addEventListener('click',()=>{S.maroc=S.maroc?null:{ref:null,pool:moPool()};render(tool)});
 el.querySelectorAll('[data-goal]').forEach(b=>b.addEventListener('click',()=>{S.goal=b.dataset.goal;render(tool)}));
 el.querySelectorAll('[data-sv]').forEach(b=>b.addEventListener('click',()=>{S.servings=Math.max(1,Math.min(8,S.servings+Number(b.dataset.sv)));render(tool)}));
 el.querySelector('.ch-go')?.addEventListener('click',()=>runChef(S,tool));
 el.querySelectorAll('[data-ropen]').forEach(b=>b.addEventListener('click',()=>{const i=Number(b.dataset.ropen);S.open=S.open===i?-1:i;render(tool)}));
 el.querySelectorAll('[data-sdone]').forEach(b=>b.addEventListener('click',()=>{S.done=S.done||{};S.done[b.dataset.sdone]=!S.done[b.dataset.sdone];b.closest('li').classList.toggle('done',!!S.done[b.dataset.sdone])}));
 el.querySelectorAll('.ch-steps [data-timer]').forEach(b=>b.addEventListener('click',()=>startTimer(b.dataset.timer,Number(b.dataset.min))));
 el.querySelectorAll('[data-cook]').forEach(b=>b.addEventListener('click',()=>cookMode(S,Number(b.dataset.cook))));
 el.querySelectorAll('[data-rshop]').forEach(b=>b.addEventListener('click',()=>{const r=S.chef.recipes[Number(b.dataset.rshop)],l=shopGet();(r.ingredients||[]).filter(x=>!x.have).forEach(x=>{const t=short(x.name,30);if(!l.some(y=>y.t.toLowerCase()===t.toLowerCase()))l.push({t,done:false})});shopSet(l);b.disabled=true;b.textContent='✓ Ajouté aux courses'}));
 el.querySelectorAll('[data-rjournal]').forEach(b=>b.addEventListener('click',()=>{const r=S.chef.recipes[Number(b.dataset.rjournal)];const o=addToJournal({kcal:r.kcal,p:r.p,c:r.c,f:r.f});r.added=!!o.ok;render(tool)}));
 el.querySelectorAll('[data-rfav]').forEach(b=>b.addEventListener('click',()=>{const r=S.chef.recipes[Number(b.dataset.rfav)],f=favGet(),k=f.findIndex(x=>x.name===r.name);if(k>=0)f.splice(k,1);else f.unshift({...r,img:undefined,imgBusy:undefined,added:undefined});favSet(f);render(tool)}));
 el.querySelectorAll('[data-fav]').forEach(b=>b.addEventListener('click',()=>{const f=favGet()[Number(b.dataset.fav)];if(!f)return;S.chef={recipes:[f]};S.open=0;S.done={};render(tool)}));
 el.querySelectorAll('[data-rimg]').forEach(b=>b.addEventListener('click',async()=>{const r=S.chef.recipes[Number(b.dataset.rimg)];r.imgBusy=true;render(tool);try{const j=await post('/api/ai/image',{prompt:short(r.image_prompt,500)},1);r.img=j.image}catch(e){S.chefErr=e.message}r.imgBusy=false;render(tool)}));
}

/* =====================  Décor Studio : chef-robot + régime  ===================== */
const CHEF_SVG='<svg viewBox="0 0 150 168" aria-hidden="true"><defs><linearGradient id="chW" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#cdd9d3"/></linearGradient><radialGradient id="chH" cx=".3" cy=".25" r=".95"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#eef3f0"/><stop offset="1" stop-color="#bccac3"/></radialGradient><linearGradient id="chV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26352e"/><stop offset="1" stop-color="#060d0a"/></linearGradient><linearGradient id="chG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5df0a6"/><stop offset="1" stop-color="#0c9a62"/></linearGradient><filter id="chS" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity=".3"/></filter></defs>'+
 '<ellipse cx="72" cy="160" rx="46" ry="6" fill="#000" opacity=".22"/>'+
 '<g class="ch-av"><g filter="url(#chS)">'+
 '<g filter="url(#chS)"><rect x="34" y="46" width="104" height="82" rx="38" fill="url(#chH)"/></g>'+
 '<g filter="url(#chS)"><circle cx="58" cy="34" r="17" fill="#fff"/><circle cx="86" cy="22" r="20" fill="#fff"/><circle cx="114" cy="34" r="17" fill="#fff"/><rect x="42" y="32" width="88" height="28" rx="7" fill="#fff"/></g><path d="M62 30c3 6 3 14 0 24M86 24c3 8 3 18 0 30M110 30c-3 6-3 14 0 24" stroke="#e3ebe7" stroke-width="2.200" stroke-linecap="round" fill="none"/><rect x="42" y="52" width="88" height="8" rx="4" fill="#dbe5e0"/>'+
 '<circle cx="30" cy="88" r="11" fill="#18271f"/><circle cx="30" cy="88" r="8" fill="url(#chG)"/><circle cx="142" cy="88" r="11" fill="#18271f"/><circle cx="142" cy="88" r="8" fill="url(#chG)"/>'+
 '<rect x="43" y="60" width="86" height="56" rx="26" fill="url(#chV)"/><ellipse cx="68" cy="70" rx="18" ry="5" fill="#fff" opacity=".14" transform="rotate(-12 68 70)"/>'+
 '<g class="ch-eyes" stroke="#9bffc6" stroke-width="6" stroke-linecap="round" fill="none"><path d="M60 94q9-14 18 0"/><path d="M94 94q9-14 18 0"/></g>'+
 '<ellipse cx="55" cy="104" rx="6" ry="3.5" fill="#5dffa6" opacity=".2"/><ellipse cx="117" cy="104" rx="6" ry="3.5" fill="#5dffa6" opacity=".2"/>'+
 '<rect x="62" y="126" width="48" height="12" rx="6" fill="#1d2b25"/>'+
 '<path d="M42 138h88c10 0 16 8 15 18H27c-1-10 5-18 15-18z" fill="url(#chW)"/><circle cx="86" cy="148" r="8" fill="#0f1f18"/><path d="M86 153c-4-2-6-4.500-6-7a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 2.500-2 5-6 7z" fill="url(#chG)"/>'+
 '</g>'+
 '<g class="ch-arm"><path d="M130 142c14-2 20-14 16-26" stroke="url(#chW)" stroke-width="12" stroke-linecap="round" fill="none"/><circle cx="146" cy="114" r="8" fill="url(#chW)"/><path d="M146 108V86" stroke="#c9a46a" stroke-width="3.500" stroke-linecap="round"/><ellipse cx="146" cy="80" rx="8" ry="10" fill="#e8c27a"/></g></svg>';
const TIPS={plate:'Montre-moi ton assiette !',fridge:'Dis-moi ce qu’il y a au frigo 👨‍🍳',swap:'Deux produits ? Je te dis le meilleur.',intelligence:'Je décrypte l’étiquette pour toi.',restaurant:'Je t’aide à choisir au resto.'};
function studioDeco(){const head=document.querySelector('#page-studio .ns-head');if(!head||head.querySelector('.nt-chef'))return;
 const sym=head.querySelector('.ns-head-symbol');if(sym)sym.style.display='none';
 const d=document.createElement('div');d.className='nt-chef';
 d.innerHTML='<i class="nt-glow"></i><span class="nt-fl f1">🥕</span><span class="nt-fl f2">🍅</span><span class="nt-fl f3">🥑</span><span class="nt-fl f4">🍋</span><span class="nt-fl f5">🌿</span><span class="nt-fl f6">🧅</span><div class="nt-say">'+TIPS.plate+'</div><div class="nt-av">'+CHEF_SVG+'</div>';
 head.appendChild(d);
 const say=d.querySelector('.nt-say');
 document.getElementById('ns-tabs')?.addEventListener('click',e=>{const b=e.target.closest('[data-tool]');if(b&&TIPS[b.dataset.tool]){say.classList.remove('pop');void say.offsetWidth;say.textContent=TIPS[b.dataset.tool];say.classList.add('pop')}})}
const DIETS=['Végétarien','Halal','Sans gluten','Sans lactose','Sans sucre ajouté','Sans arachides','Sans œufs','Sans fruits à coque','Sans poisson','Diabète','Hypertension'];
function dietBar(){const page=document.getElementById('page-studio'),ws=document.getElementById('ns-workspace');if(!page||!ws||document.getElementById('nt-diet'))return;
 const get=()=>{try{return JSON.parse(localStorage.getItem('nutrix-prefs')||'[]')}catch{return []}};
 const box=document.createElement('div');box.id='nt-diet';
 const draw=()=>{const on=get();box.innerHTML=`<button type="button" class="nt-diet-h" aria-expanded="${box.classList.contains('open')}"><span>🛡️ Mon régime & allergies</span><em>${on.length?on.length+' actif'+(on.length>1?'s':''):'Aucun'}</em><i></i></button><div class="nt-diet-b"><p>Utilisé par les recettes du Chef, l’analyse et le scanner pour t’alerter.</p><div>${DIETS.map(k=>`<button type="button" class="${on.includes(k)?'on':''}" data-d="${esc(k)}">${esc(k)}</button>`).join('')}</div></div>`;
  box.querySelector('.nt-diet-h').onclick=()=>{box.classList.toggle('open');draw()};
  box.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{const a=get(),k=b.dataset.d,i=a.indexOf(k);if(i>=0)a.splice(i,1);else a.push(k);try{localStorage.setItem('nutrix-prefs',JSON.stringify(a))}catch{}draw()})};
 draw();ws.parentNode.insertBefore(box,ws)}
studioDeco();dietBar();
/* =====================  Idées du jour 🇲🇦 : menus variés selon le régime  ===================== */
const BREAK=/^(Msemen|Baghrir|Harcha|Batbout|Khobz|Œufs au khlii|Bissara|Dattes|Sellou|Amlou|Mlaoui|Rghaif|Sfenj|Bsissa|Lben|Fromage frais)/;
const SNACK=/^(Chebakia|Cornes|Briouate|Thé|Jus|Avocat|Dattes|Sellou|Amlou|Ghoriba|Zlabia|Mhancha|Fekkas|Bsissa|Amandes|Orange|Figues|Grenade|Olives|Pastilla au lait|Salade d’orange|Lben|Fromage frais|Sfenj)/;
const SIDE=/^(Salade|Soupe|Chorba|Zaalouk|Taktouka|Soupe)/;
const flags=d=>{const s=norm(d.name+' '+d.ing.join(' '));return {gluten:/semoule|farine|brick|vermicelle|msemen|batbout|khobz|pain|couscous|harcha|baghrir|pastilla|rfissa|seffa/.test(s),lait:/beurre|lait|fromage|smen/.test(s),oeuf:/oeuf|pastilla|baghrir|msemen/.test(s)&&/oeuf|pastilla/.test(s),noix:/amande|arachide|argan|noix/.test(s),poisson:/poisson|sardine|chermoula|hout/.test(s),viande:/viande|poulet|agneau|kefta|lham|mechoui|tanjia|khlii|dinde/.test(s),sucre:/miel|sucre|chebakia|cornes|briouate|sellou|tfaya|jus|avocat|dattes|amlou|pruneaux|seffa|baghrir|zlabia|mrouzia|lham lhalou/.test(s)&&d.score<65,sale:/khlii|tanjia|sandwich|olives|merguez/.test(norm(d.name))}};
function allowed(d,prefs){const f=flags(d);return !(prefs.includes('Sans gluten')&&f.gluten||prefs.includes('Sans lactose')&&f.lait||prefs.includes('Sans œufs')&&f.oeuf||(prefs.includes('Sans arachides')||prefs.includes('Sans fruits à coque'))&&f.noix||prefs.includes('Sans poisson')&&f.poisson||prefs.includes('Végétarien')&&(f.viande||f.poisson)||(prefs.includes('Diabète')||prefs.includes('Sans sucre ajouté'))&&f.sucre||prefs.includes('Hypertension')&&f.sale)}
const seedRand=a=>{a=a>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}};
const dayKey=()=>{const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate()};
const MENU={shift:{b:0,l:0,d:0}};
function pick(slot,prefs){const pool=MAR.filter(d=>allowed(d,prefs)&&(slot==='b'?BREAK.test(d.name)&&!/^(Dattes|Sellou|Amlou|Bsissa)/.test(d.name):!SNACK.test(d.name)&&!SIDE.test(d.name)&&!BREAK.test(d.name)));
 if(!pool.length)return null;
 const sorted=pool.slice().sort((x,y)=>x.name<y.name?-1:1),r=seedRand(dayKey()*7+(slot==='b'?1:slot==='l'?2:3)),order=sorted.map(d=>[r(),d]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
 // le dîner reste plus léger que le déjeuner
 const arr=slot==='d'?order.filter(d=>d.kcal<=560).concat(order.filter(d=>d.kcal>560)):order;
 return arr[(MENU.shift[slot])%arr.length]}
const moPool=()=>{let P=[];try{P=JSON.parse(localStorage.getItem('nutrix-prefs')||'[]')}catch{}const r=seedRand(dayKey()+Date.now()%97);return MAR.filter(d=>allowed(d,P)&&!SNACK.test(d.name)&&!SIDE.test(d.name)&&!BREAK.test(d.name)).map(d=>[r(),d.name]).sort((a,b)=>a[0]-b[0]).slice(0,12).map(x=>x[1])};
function launchMaroc(dish){const F=state.fridge=state.fridge||{imgs:[]};const ref=dish?{name:dish.name,portion:dish.portion,kcal:dish.kcal,ing:dish.ing}:null;Object.assign(F,{imgs:[],result:null,items:[],typed:[],goal:'equilibre',servings:2,chef:null,chefErr:'',dish:dish?dish.name:'',maroc:{ref,pool:ref?[]:moPool()},open:0,done:{}});document.querySelector('#ns-tabs [data-tool=fridge]')?.click();setTimeout(()=>{render('fridge');runChef(F,'fridge')},60)}
function menuBar(){const ws=document.getElementById('ns-workspace');if(!ws||document.getElementById('nt-menu'))return;
 const box=document.createElement('div');box.id='nt-menu';
 const prefs=()=>{try{return JSON.parse(localStorage.getItem('nutrix-prefs')||'[]')}catch{return []}};
 const NAMES={b:['Petit-déjeuner','🌅'],l:['Déjeuner','☀️'],d:['Dîner','🌙']};
 const draw=()=>{const P=prefs(),picks=['b','l','d'].map(s=>[s,pick(s,P)]);const tot=picks.reduce((a,[,d])=>a+(d?d.kcal:0),0);
  box.innerHTML=`<div class="nt-menu-h"><div><strong>🇲🇦 Menu du jour</strong><small>${P.length?'Adapté à ton régime ('+P.length+')':'Varié chaque jour, change-le comme tu veux'}</small></div><b>${tot} kcal</b></div>
  <button type="button" class="nt-menu-ai" data-ai>✨ 3 recettes marocaines healthy pour moi (IA)</button>
  <div class="nt-menu-l">${picks.map(([s,d])=>d?`<div class="nt-menu-c"><button type="button" class="nt-menu-open" data-open="${esc(d.name)}"><span class="nt-menu-e">${esc(d.emoji)}</span><span class="nt-menu-t"><small>${NAMES[s][1]} ${NAMES[s][0]}</small><b>${esc(d.name)}</b><em>${esc(d.portion)} · ${d.kcal} kcal · P${d.p} G${d.c} L${d.f}</em></span></button><div class="nt-menu-a"><button type="button" data-heal="${esc(d.name)}" aria-label="Version healthy" title="Version healthy (recette IA)">🥗</button><button type="button" data-shuf="${s}" aria-label="Autre idée" title="Autre idée">↻</button><button type="button" data-add="${s}|${esc(d.name)}" aria-label="Ajouter au journal" title="Ajouter au journal">＋</button></div></div>`:`<div class="nt-menu-c empty"><small>${NAMES[s][0]} : aucun plat compatible avec ton régime.</small></div>`).join('')}</div>`;
  box.querySelector('[data-ai]')?.addEventListener('click',()=>launchMaroc(null));
  box.querySelectorAll('[data-heal]').forEach(b=>b.onclick=()=>{const d=MAR.find(x=>x.name===b.dataset.heal);if(d)launchMaroc(d)});
  box.querySelectorAll('[data-shuf]').forEach(b=>b.onclick=()=>{MENU.shift[b.dataset.shuf]++;draw()});
  box.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{const [s,n2]=b.dataset.add.split('|'),d=MAR.find(x=>x.name===n2);if(!d)return;const o=addToJournal({kcal:d.kcal,p:d.p,c:d.c,f:d.f,meal:s});b.textContent=o.ok?'✓':'!';b.classList.add('done');setTimeout(()=>{b.textContent='＋';b.classList.remove('done')},1800)});
  box.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{const d=MAR.find(x=>x.name===b.dataset.open);if(!d)return;const tabBtn=document.querySelector('#ns-tabs [data-tool=plate]');tabBtn&&tabBtn.click();state.plate=state.plate||{imgs:[]};Object.assign(state.plate,{result:marocResult(d),text:d.name,err:'',added:'',gen:null});setTimeout(()=>{render('plate');document.querySelector('.nv-out')?.scrollIntoView({behavior:'smooth',block:'start'})},60)})};
 window.addEventListener('storage',draw);document.addEventListener('click',e=>{if(e.target.closest('#nt-diet [data-d]'))setTimeout(draw,30)});
 draw();const diet=document.getElementById('nt-diet');(diet||ws).parentNode.insertBefore(box,diet?diet.nextSibling:ws)}
/* Menu marocain retiré du Studio : il vit dans la section Cuisine marocaine */

window.NutrixVision={render};
window.NutrixMaroc={MAR,marocResult,allowed,flags,BREAK,SNACK,SIDE,MENU,pick,profile,post,journal:addToJournal,cook:r=>cookMode({chef:{recipes:[r]}},0),timer:startTimer,tick,favGet,favSet,shopGet,shopSet,esc,norm};
const cur=document.querySelector('#ns-tabs button.on')?.dataset.tool||'plate';render(cur);
})();
}catch(e){console.error("[Nutrix] nutrix-studio-vision.js",e)}

/* ===== nutrix-pro-final.js ===== */
try{
/* Nutrix Pro — AI welcome screen (greeting + suggestion cards). No backend changes. */
(()=>{'use strict';
 const SUGGESTIONS=[
  ['Analyser mon repas','Décris ou photographie ton assiette','Analyse mon repas et les portions.'],
  ['Mon bilan du jour','Calories et macros enregistrées',"Analyse mon alimentation aujourd'hui."],
  ['Idées de repas','Riches en protéines, simples à préparer','Propose-moi un repas riche en protéines.'],
  ['Comparer des aliments','Poulet, riz, œufs…','Compare le poulet, le riz et les œufs.']
 ];
 function hour(){const h=new Date().getHours();return h<5||h>=18?'Bonsoir':'Bonjour'}
 function init(){
  const drawer=document.getElementById('v11-ai-drawer'),shell=drawer&&drawer.querySelector('.ai-shell'),chat=document.getElementById('ai-chat'),input=document.getElementById('ai-input'),form=document.getElementById('ai-form');
  if(!shell||!chat||!input||!form||shell.querySelector('.nx-welcome'))return false;
  input.placeholder='Posez votre question…';const w=document.createElement('div');w.className='nx-welcome';
  w.innerHTML='<div class="nx-spark" aria-hidden="true">✦</div><h2></h2><p>Je peux analyser tes repas, tes macros et t’aider à mieux manger.</p><div class="nx-welcome-chips"></div>';
  w.querySelector('h2').textContent=hour()+', comment puis-je vous aider ?';
  const box=w.querySelector('.nx-welcome-chips');
  SUGGESTIONS.forEach(([t,s,q])=>{const b=document.createElement('button');b.type='button';b.append(document.createTextNode(t));const sm=document.createElement('small');sm.textContent=s;b.append(sm);b.addEventListener('click',()=>{input.value=q;form.requestSubmit?form.requestSubmit():form.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}))});box.append(b)});
  shell.insertBefore(w,chat);
  const sync=()=>drawer.classList.toggle('nx-welcome-on',!chat.querySelector('.ai-message.user')&&chat.querySelectorAll('.ai-message').length<=1);
  new MutationObserver(sync).observe(chat,{childList:true,subtree:true});sync();
  return true;
 }
 let n=0;const t=setInterval(()=>{if(init()||++n>40)clearInterval(t)},250);
})();

/* Section banners: same photo + green overlay language as the home hero. */
(()=>{'use strict';
 const B={
  health:['health-photo','SANTÉ · BIEN-ÊTRE','Votre santé, au quotidien','Activité, sommeil et habitudes : tout votre suivi au même endroit.'],
  journal:['journal-photo','JOURNAL · LABO','Votre journal alimentaire','Enregistrez vos repas, comparez vos produits et suivez vos apports.'],
  nutri:['scanner-photo','SCANNER','Analysez un produit en un instant','Code-barres, photo ou recherche : obtenez Nutri-Score, NOVA et valeurs clés.'],
  faq:['coach-photo','PROJET','À propos de Nutrix','Un compagnon pour analyser, comparer et mieux comprendre ce que vous mangez.']
 };
 function run(){Object.entries(B).forEach(([id,[img,eb,t,sub]])=>{const pg=document.getElementById('page-'+id);if(!pg||pg.querySelector(':scope>.nx-banner'))return;
  const d=document.createElement('header');d.className='nx-banner';d.style.setProperty('--bn','url(assets/sections/'+img+'.webp)');
  const e=document.createElement('span');e.textContent=eb;const h=document.createElement('h2');h.textContent=t;const p=document.createElement('p');p.textContent=sub;d.append(e,h,p);pg.prepend(d)})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();

/* Short labels for the mobile tab bar (full names stay in aria-label). */
(()=>{'use strict';
 const AR=document.documentElement.lang==='ary'||(()=>{try{return localStorage.getItem('sd-v111-language')==='ary'}catch{return false}})();const L=AR?{home:'الرئيسية',health:'المذكرة',nutri:'سكان',journal:'المذكرة',ai:'المساعد',studio:'Studio',faq:'المشروع'}:{home:'Accueil',health:'Santé',nutri:'Scanner',journal:'Journal',ai:'Coach',studio:'Studio',faq:'Projet'};if(AR)L.health='الصحة';
 function run(){document.querySelectorAll('.pulse-nav-links .tab[data-tab]').forEach(b=>{const t=L[b.dataset.tab];if(t)b.setAttribute('data-short',t)})}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();

/* Optional access code for AI routes (server: NUTRIX_ACCESS_CODE). Asked once, kept on this device. */
(()=>{'use strict';
 const KEY='nutrix-access-code',native=window.fetch.bind(window);let asking=null;
 const get=()=>{try{return localStorage.getItem(KEY)||''}catch{return ''}};
 const isAI=u=>/\/api\/ai\//.test(String(typeof u==='string'?u:u&&u.url||''));
 window.fetch=async(input,init={})=>{
  if(!isAI(input))return native(input,init);
  const go=()=>{const h=new Headers(init.headers||{});const c=get();if(c)h.set('x-nutrix-code',c);return native(input,{...init,headers:h})};
  let r=await go();
  if(r.status===401){let j={};try{j=await r.clone().json()}catch{}
   if(j.code_required){const sent=get();
    // une seule fenêtre même si plusieurs demandes arrivent ensemble ; si un autre appel a déjà reçu un nouveau code, on l'utilise
    if(!asking&&get()===sent)asking=new Promise(ok=>setTimeout(()=>{const c=window.prompt(NXD('Code d’accès Nutrix :'));if(c&&c.trim()){try{localStorage.setItem(KEY,c.trim())}catch{}}ok()},0)).finally(()=>{setTimeout(()=>asking=null,1500)});
    if(asking)await asking;
    if(get()&&get()!==sent)r=await go()}}
  return r};
})();

/* Onboarding: goal → body → preferences → personal calorie target. Shown once. */
(()=>{'use strict';
 const FLAG='nutrix-onboarded-v1',PREFS='nutrix-prefs';
 const done=()=>{try{return !!localStorage.getItem(FLAG)}catch{return true}};
 const GOALS=[['lose','🔥','Perdre du poids','Léger déficit calorique'],['maintain','⚖️','Garder mon poids','Équilibre au quotidien'],['gain','💪','Prendre du muscle','Plus de calories et de protéines']];
 const ACT=[['1.2','Sédentaire'],['1.375','Léger'],['1.55','Actif'],['1.725','Très actif']];
 const PREF=[['Végétarien','🥗'],['Halal','🕌'],['Sans gluten','🌾'],['Sans lactose','🥛'],['Sans sucre ajouté','🍬'],['Riche en protéines','🥚'],['Sans arachides','🥜'],['Sans œufs','🍳'],['Sans fruits à coque','🌰'],['Sans poisson','🐟'],['Diabète','🩸'],['Hypertension','🧂']];
 const D={goal:'maintain',sex:'h',age:'',height:'',weight:'',activity:'1.55',prefs:[]};
 const kcal=()=>{const w=+D.weight,h=+D.height,a=+D.age;if(!(w&&h&&a))return 2000;const bmr=10*w+6.25*h-5*a+(D.sex==='h'?5:-161);let t=bmr*(+D.activity);t+=D.goal==='lose'?-500:D.goal==='gain'?300:0;return Math.min(4500,Math.max(1200,Math.round(t/50)*50))};
 let step=0,root;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const panes=[
  ()=>`<h2>Quel est votre objectif ?</h2><p>On adapte vos calories et vos macros.</p><div class="ob-goals">${GOALS.map(([k,e,t,s])=>`<button type="button" class="ob-goal ${D.goal===k?'on':''}" data-goal="${k}"><b>${e}</b><span><strong>${t}</strong><small>${s}</small></span></button>`).join('')}</div>`,
  ()=>`<h2>Parlez-nous de vous</h2><p>Pour calculer vos besoins réels.</p>
   <div class="ob-seg">${[['h','Homme'],['f','Femme']].map(([k,t])=>`<button type="button" class="${D.sex===k?'on':''}" data-sex="${k}">${t}</button>`).join('')}</div>
   <div class="ob-fields"><label>Âge<input inputmode="numeric" data-f="age" value="${esc(D.age)}" placeholder="25"><i>ans</i></label><label>Taille<input inputmode="numeric" data-f="height" value="${esc(D.height)}" placeholder="170"><i>cm</i></label><label>Poids<input inputmode="decimal" data-f="weight" value="${esc(D.weight)}" placeholder="70"><i>kg</i></label></div>
   <div class="ob-seg four">${ACT.map(([k,t])=>`<button type="button" class="${D.activity===k?'on':''}" data-act="${k}">${t}</button>`).join('')}</div>
   <p class="ob-sub">Votre régime <small>(optionnel, plusieurs choix possibles)</small></p><div class="ob-prefs ob-diet">${PREF.map(([t,e])=>`<button type="button" class="${D.prefs.includes(t)?'on':''}" data-pref="${esc(t)}"><em>${e}</em>${t}</button>`).join('')}</div>`,
  ()=>`<h2>Vos préférences</h2><p>Optionnel — l’IA en tiendra compte.</p><div class="ob-prefs">${PREF.map(([t,e])=>`<button type="button" class="${D.prefs.includes(t)?'on':''}" data-pref="${esc(t)}"><em>${e}</em>${t}</button>`).join('')}</div>
   <div class="ob-result"><small>Votre objectif quotidien</small><strong>${kcal().toLocaleString('fr-FR')}<span> kcal</span></strong><small>${D.weight?'Calculé pour vous':'Valeur par défaut — complétez l’étape précédente pour l’affiner'}</small></div>`
 ];
 function draw(){root.innerHTML=`<div class="ob-card" role="dialog" aria-modal="true" aria-label="Configuration">
  <div class="ob-top"><div class="ob-dots">${panes.map((_,i)=>`<i class="${i<=step?'on':''}"></i>`).join('')}</div><button type="button" class="ob-skip" data-skip>Plus tard</button></div>
  <div class="ob-body">${panes[step]()}</div>
  <div class="ob-actions">${step?'<button type="button" class="ob-back" data-back>Retour</button>':'<span></span>'}<button type="button" class="ob-next" data-next>${step===panes.length-1?'Commencer':'Continuer'}</button></div></div>`}
 function finish(save){try{localStorage.setItem(FLAG,'1')}catch{}
  if(save){try{Object.assign(state.settings,{goal:D.goal,sex:D.sex,activity:D.activity,target:kcal()});['age','height','weight'].forEach(k=>{if(D[k])state.settings[k]=String(D[k])});window.save&&save_();try{renderAll()}catch{}localStorage.setItem(PREFS,JSON.stringify(D.prefs))}catch{}}
  root.classList.add('out');setTimeout(()=>root.remove(),250)}
 const save_=()=>{try{window.save()}catch{try{save()}catch{}}};
 function open(){if(root)root.remove();root=document.createElement('div');root.className='ob';document.body.append(root);draw();
  root.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
   if(t.dataset.goal){D.goal=t.dataset.goal;draw()}
   else if(t.dataset.sex){D.sex=t.dataset.sex;draw()}
   else if(t.dataset.act){D.activity=t.dataset.act;draw()}
   else if(t.dataset.pref){const p=t.dataset.pref;D.prefs=D.prefs.includes(p)?D.prefs.filter(x=>x!==p):[...D.prefs,p];draw()}
   else if('skip' in t.dataset)finish(false)
   else if('back' in t.dataset){step--;draw()}
   else if('next' in t.dataset){if(step===panes.length-1)finish(true);else{step++;draw()}}});
  root.addEventListener('input',e=>{const f=e.target.dataset.f;if(f)D[f]=e.target.value.replace(/[^0-9.]/g,'')})}
 window.NutrixOnboarding={open:()=>{step=0;open()}};
 const start=()=>{if(done())return;let has=false;try{has=Object.keys(state.days||{}).length>0||!!state.settings.weight}catch{}if(has){try{localStorage.setItem(FLAG,'1')}catch{}return}setTimeout(open,700)};
 if(document.readyState==='complete')start();else window.addEventListener('load',start,{once:true});
})();
}catch(e){console.error("[Nutrix] nutrix-pro-final.js",e)}

/* ===== nutrix-simplify.js ===== */
try{
(function(){
'use strict';
function accordion(el,label,sub,icon){
  if(!el||el.classList.contains('nx-acc'))return null;
  el.classList.add('nx-acc');
  const b=document.createElement('button');b.type='button';b.className='nx-acc-toggle';if(icon){b.classList.add('nx-acc-rich');b.innerHTML='<i class="nx-ico">'+icon+'</i><span class="nx-acc-txt"><b>'+label+'</b><small>'+(sub||'')+'</small></span>';}else b.textContent=label;
  b.addEventListener('click',()=>el.classList.toggle('open'));
  el.insertBefore(b,el.firstChild);return el;
}
function go(tab){ if(typeof window.showTab==='function')window.showTab(tab); else document.querySelector('#pulse-nav-links .tab[data-tab="'+tab+'"]')?.click(); window.scrollTo({top:0,behavior:'smooth'}); }
function simplifyNav(){
  const nav=document.getElementById('pulse-nav-links');if(!nav||nav.dataset.nxSimple)return;nav.dataset.nxSimple='1';
  const ar=()=>document.documentElement.lang==='ary';
  const health=nav.querySelector('.tab[data-tab="health"]');
  if(health){const lab=health.querySelector('.pulse-nav-label');if(lab){const set=()=>{if(document.documentElement.lang!=='ary'&&lab.textContent!=='Journal')lab.textContent='Journal';};set();new MutationObserver(set).observe(lab,{childList:true,characterData:true,subtree:true});}health.setAttribute('aria-label','Mon journal');health.setAttribute('data-short','Journal');health.title='Mon journal';}
  const coach=nav.querySelector('.tab[data-tab="ai"]');
  if(coach){const lab=coach.querySelector('.pulse-nav-label');if(lab)lab.textContent='Coach';}
  ['journal','studio','faq'].forEach(t=>nav.querySelector('.tab[data-tab="'+t+'"]')?.classList.add('nx-nav-hidden'));
  const more=document.createElement('button');more.type='button';more.className='nx-more-btn';more.setAttribute('aria-haspopup','true');more.setAttribute('aria-expanded','false');
  more.innerHTML='<svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></svg><span class="pulse-nav-label">Plus</span>';
  nav.appendChild(more);
  const sheet=document.createElement('div');sheet.className='nx-more-sheet';sheet.hidden=true;
  sheet.innerHTML='<button type="button" data-go="journal">🔎 <span><b>Découvrir</b><small>Chercher un produit, favoris, science</small></span></button><button type="button" data-go="maroc">🇲🇦 <span><b>Cuisine marocaine</b><small>Plats healthy adaptés à ton régime</small></span></button><button type="button" data-go="studio">🎨 <span><b>Studio</b><small>Outils créatifs Nutrix</small></span></button><button type="button" data-go="faq">ℹ️ <span><b>À propos</b><small>Le projet Nutrix</small></span></button>';
  document.body.appendChild(sheet);
  const close=()=>{sheet.hidden=true;more.setAttribute('aria-expanded','false');};
  more.addEventListener('click',e=>{e.stopPropagation();sheet.hidden=!sheet.hidden;more.setAttribute('aria-expanded',String(!sheet.hidden));});
  sheet.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b){go(b.dataset.go);close();}});
  document.addEventListener('click',e=>{if(!sheet.hidden&&!sheet.contains(e.target))close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
}
function simplifyHome(){
  const cta=document.querySelector('.pulse-hero-cta');if(!cta||cta.dataset.nxSimple)return;cta.dataset.nxSimple='1';
  const sub=document.querySelector('.pulse-hero-sub');if(sub)sub.textContent='Scanne un produit ou note ton repas : on te dit si c’est un bon choix.';
  cta.innerHTML='<button type="button" class="nx-big nx-big-primary" id="nx-go-scan"><i class="nx-ico"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M8 9v6M11 9v6M14 9v6M17 9v6" stroke-width="1.8"/></svg></i><span class="nx-big-txt"><b>Scanner un produit</b><small>Code-barres ou photo</small></span></button><button type="button" class="nx-big nx-big-secondary" id="nx-go-meal"><i class="nx-ico"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3v7a2 2 0 0 0 2 2v9M11 3v7a2 2 0 0 1-2 2M17 3c-2.2 1.4-3 3.8-3 6.5 0 1.9 1 2.9 3 3v8.5"/></svg></i><span class="nx-big-txt"><b>Ajouter un repas</b><small>Suivre mes calories</small></span></button>';
  document.getElementById('nx-go-scan').addEventListener('click',()=>go('nutri'));
  document.getElementById('nx-go-meal').addEventListener('click',()=>{go('health');setTimeout(()=>{const d=document.getElementById('nh-existing');if(d){d.open=true;d.scrollIntoView({behavior:'smooth',block:'start'});}},350);});
}

function robotMarkup(id){return '<svg class="nx-robot" viewBox="0 0 80 96" aria-hidden="true" focusable="false"><defs><linearGradient id="nxRH__ID__" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5eead4"/><stop offset="1" stop-color="#0d9488"/></linearGradient><linearGradient id="nxRB__ID__" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34d399"/><stop offset="1" stop-color="#047857"/></linearGradient></defs><ellipse class="nx-r-shadow" cx="40" cy="92" rx="20" ry="3.2" fill="#000" opacity=".18"/><g class="nx-r-float"><g class="nx-r-ant"><line x1="40" y1="8" x2="40" y2="20" stroke="#0f766e" stroke-width="3" stroke-linecap="round"/><circle class="nx-r-bulb" cx="40" cy="7" r="5" fill="#fbbf24"/></g><rect x="12" y="38" width="6" height="14" rx="3" fill="#0f766e"/><rect x="62" y="38" width="6" height="14" rx="3" fill="#0f766e"/><rect x="16" y="18" width="48" height="40" rx="16" fill="url(#nxRH__ID__)"/><rect x="16" y="18" width="48" height="20" rx="14" fill="#fff" opacity=".18"/><rect x="22" y="25" width="36" height="26" rx="11" fill="#0b2f2a"/><g class="nx-r-eyes"><ellipse cx="32" cy="37" rx="4" ry="5" fill="#a7f3d0"/><ellipse cx="48" cy="37" rx="4" ry="5" fill="#a7f3d0"/></g><path d="M35 45q5 4.5 10 0" stroke="#a7f3d0" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="26" cy="45" r="2.6" fill="#fb7185" opacity=".7"/><circle cx="54" cy="45" r="2.6" fill="#fb7185" opacity=".7"/><rect x="26" y="60" width="28" height="24" rx="10" fill="url(#nxRB__ID__)"/><path class="nx-r-heart" d="M40 77c-5-3.4-6.5-5.6-6.5-7.6a3.2 3.2 0 0 1 6.5-.9 3.2 3.2 0 0 1 6.5.9c0 2-1.5 4.2-6.5 7.6z" fill="#fff" opacity=".95"/><rect x="29" y="82" width="8" height="8" rx="3.5" fill="#0f766e"/><rect x="43" y="82" width="8" height="8" rx="3.5" fill="#0f766e"/><rect x="18" y="62" width="9" height="16" rx="4.5" fill="#10b981" transform="rotate(10 22 62)"/><g class="nx-r-wave"><rect x="53" y="62" width="9" height="16" rx="4.5" fill="#10b981"/></g></g></svg>'.replace(/__ID__/g,id);}
function setupRobot(){
  const fab=document.getElementById('v11-ai-launch');
  if(fab&&!fab.dataset.nxRobot){
    fab.dataset.nxRobot='1';fab.classList.add('nx-robot-fab');fab.innerHTML=robotMarkup('F');
    const ar=document.documentElement.lang==='ary';
    const bubble=document.createElement('div');bubble.className='nx-robot-bubble';bubble.hidden=true;bubble.textContent=ar?'محتاج مساعدة؟':'Besoin d’aide ?';document.body.appendChild(bubble);
    let seen=false;try{seen=sessionStorage.getItem('nx-robot-hint')==='1';}catch{}
    if(!seen){setTimeout(()=>{bubble.hidden=false;bubble.classList.add('show');setTimeout(()=>{bubble.classList.remove('show');setTimeout(()=>bubble.hidden=true,400);},5200);try{sessionStorage.setItem('nx-robot-hint','1');}catch{}},3500);}
    fab.addEventListener('click',()=>{bubble.hidden=true;});
  }
  const top=document.querySelector('#v11-ai-drawer .v11-ai-top');
  if(top&&!top.querySelector('.nx-robot-head')){const h=document.createElement('div');h.className='nx-robot-head';h.innerHTML=robotMarkup('T');top.insertBefore(h,top.firstChild);}
}
function init(){
  setupRobot();setTimeout(setupRobot,800);
  simplifyNav();simplifyHome();setTimeout(()=>{simplifyNav();simplifyHome();},600);
  const cmp=accordion(document.getElementById('nutri-compare-card'),'Comparer deux produits','Lequel est le meilleur choix ?','<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="8" height="14" rx="2.2"/><rect x="13" y="5" width="8" height="14" rx="2.2"/><path d="M6 10h2M16 10h2M6 14h2M16 14h2"/></svg>');
  document.getElementById('nutri-focus-compare')?.addEventListener('click',()=>cmp&&cmp.classList.add('open'));
  accordion(document.getElementById('v5-laboratoire'),'🔬 Comprendre Nutri-Score, NOVA et additifs');
  // Health: make the real food logging entry obvious
  const t=setInterval(()=>{
    const s=document.querySelector('#nh-existing>summary');
    if(s){clearInterval(t);const d=s.parentElement;
      s.innerHTML='<i class="nx-ico"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></i><span class="nx-meal-txt"><b>Ajouter un repas</b><small>Repas · calories · sommeil · poids</small></span><em class="nx-chev" aria-hidden="true"></em>';
      d.classList.add('nx-add-meal');
      const grid=document.querySelector('#nh-dashboard .nh-grid'),after=grid&&grid.querySelector('.nh-overview');
      if(grid&&after&&d.parentElement!==grid)after.insertAdjacentElement('afterend',d);}
  },300);setTimeout(()=>clearInterval(t),8000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
}catch(e){console.error("[Nutrix] nutrix-simplify.js",e)}

/* ===== nutrix-touch.js ===== */
try{
/* NUTRIX touch v3 — scanner switch, articles carousel (no layout/logic rewrite) */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const ar=()=>document.documentElement.lang==='ary';

/* ---------- Scanner: camera + code first, extras behind a switch ---------- */
function setupScanner(){
  const page=$('#page-nutri');if(!page||page.dataset.ntDone)return;
  const compare=$('#nutri-compare-card'),bottom=$('.nutri-bottom-grid',page),detail=$('.nutri-detail-grid',page);
  if(!compare||!bottom||bottom.children.length<2)return;
  page.dataset.ntDone='1';
  const recent=bottom.children[0],fav=bottom.children[1];
  recent.dataset.ntPanel='recent';fav.dataset.ntPanel='fav';compare.dataset.ntPanel='compare';
  compare.classList.add('open');            // always open inside the switch
  const wrap=document.createElement('section');wrap.className='nt-panels';wrap.dataset.active='recent';
  const L=(fr,a)=>ar()?a:fr;
  wrap.innerHTML='<div class="nt-seg" role="tablist"><i class="nt-seg-pill"></i>'+
    '<button type="button" role="tab" data-nt="recent" aria-selected="true">'+L('Récents','الأخيرة')+'</button>'+
    '<button type="button" role="tab" data-nt="fav" aria-selected="false">'+L('Favoris','المفضلة')+'</button>'+
    '<button type="button" role="tab" data-nt="compare" aria-selected="false">'+L('Comparer','قارن')+'</button></div>';
  wrap.append(recent,fav,compare);
  (bottom.parentElement).insertBefore(wrap,bottom);
  bottom.remove();
  const wide=()=>window.matchMedia('(min-width:900px)').matches;
  const select=k=>{if(k==='compare'&&wide()){compare.scrollIntoView({behavior:'smooth',block:'center'});return;}wrap.dataset.active=k;wrap.querySelectorAll('.nt-seg button').forEach((b,i)=>{const on=b.dataset.nt===k;b.setAttribute('aria-selected',on);if(on)wrap.style.setProperty('--nt-i',i);});};
  select('recent');
  wrap.querySelector('.nt-seg').addEventListener('click',e=>{const b=e.target.closest('[data-nt]');if(b)select(b.dataset.nt);});
  // existing "Comparer" entry points → open the Comparer tab
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-nutri-a],[data-nutri-b],#nutri-focus-compare')){select('compare');setTimeout(()=>wrap.scrollIntoView({behavior:'smooth',block:'center'}),120);}
  },true);
  // placeholder: one field for name OR barcode
  const q=$('#nutri-query');if(q)q.placeholder=L('Nom ou code-barres','سمية المنتوج أو الكود');
  const sb=$('#nutri-search-form button[type=submit]');if(sb)sb.textContent=L('Chercher','قلب');
}

/* ---------- Articles: swipe carousel with dots ---------- */
function setupCarousel(){
  const box=$('#nx-morocco-items');if(!box||box.dataset.ntCar)return;box.dataset.ntCar='1';
  const dots=document.createElement('div');dots.className='nt-dots';box.after(dots);
  const cards=()=>[...box.querySelectorAll('.nx-morocco-card')];
  const build=()=>{const n=cards().length;dots.hidden=n<2;dots.innerHTML='';
    for(let i=0;i<n;i++){const d=document.createElement('button');d.type='button';d.setAttribute('aria-label','Article '+(i+1));d.addEventListener('click',()=>{const c=cards()[i];c&&box.scrollTo({left:c.offsetLeft-box.offsetLeft-12,behavior:'smooth'});});dots.appendChild(d);}
    mark();};
  const mark=()=>{const cs=cards();if(!cs.length)return;let best=0,bd=1e9;cs.forEach((c,i)=>{const d=Math.abs(c.offsetLeft-box.offsetLeft-box.scrollLeft-12);if(d<bd){bd=d;best=i;}});[...dots.children].forEach((d,i)=>d.classList.toggle('on',i===best));};
  box.addEventListener('scroll',()=>requestAnimationFrame(mark),{passive:true});
  new MutationObserver(()=>build()).observe(box,{childList:true});
  build();
}


/* ---------- Accueil : mascotte "Marhaba" + visite des fonctions (écrans de téléphone) ---------- */
const MASCOT='<svg class="nt-mascot" viewBox="0 0 220 210" aria-hidden="true"><defs><linearGradient id="ntMH" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7ee8c4"/><stop offset="1" stop-color="#12a874"/></linearGradient><linearGradient id="ntMB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34d399"/><stop offset="1" stop-color="#0b7a55"/></linearGradient><radialGradient id="ntMF" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e6f7ee"/></radialGradient></defs>'+
'<ellipse cx="110" cy="203" rx="52" ry="6" fill="#000" opacity=".14"/>'+
'<g class="nt-m-float">'+
 '<g class="nt-m-ant"><path d="M110 40V22" stroke="#0b7a55" stroke-width="5" stroke-linecap="round"/><circle class="nt-m-bulb" cx="110" cy="16" r="9" fill="#c5d24b"/><circle cx="107" cy="13" r="3" fill="#fff" opacity=".7"/></g>'+
 '<rect x="46" y="116" width="128" height="78" rx="38" fill="url(#ntMB)"/>'+
 '<path d="M110 168c-14-9-22-17-22-26 0-8 6-13 13-13 4 0 7 2 9 5 2-3 5-5 9-5 7 0 13 5 13 13 0 9-8 17-22 26z" fill="#fff" opacity=".92"/>'+
 '<g class="nt-m-arm-l"><path d="M50 146c-16 8-22 22-18 34" stroke="#0b7a55" stroke-width="15" stroke-linecap="round" fill="none"/><circle cx="32" cy="182" r="11" fill="#7ee8c4"/></g>'+
 '<rect x="38" y="44" width="144" height="100" rx="44" fill="url(#ntMH)"/>'+
 '<rect x="52" y="58" width="116" height="72" rx="32" fill="url(#ntMF)"/>'+
 '<g class="nt-m-eyes"><ellipse cx="86" cy="92" rx="9" ry="12" fill="#10231b"/><ellipse cx="134" cy="92" rx="9" ry="12" fill="#10231b"/><circle cx="89" cy="87" r="3.4" fill="#fff"/><circle cx="137" cy="87" r="3.4" fill="#fff"/></g>'+
 '<ellipse cx="72" cy="108" rx="9" ry="6" fill="#ff8fa3" opacity=".55"/><ellipse cx="148" cy="108" rx="9" ry="6" fill="#ff8fa3" opacity=".55"/>'+
 '<path d="M95 106q15 18 30 0z" fill="#10231b"/><path d="M101 112q9 7 18 0" fill="#ff6f8a"/>'+
 '<g class="nt-m-arm-r"><path d="M170 140c20-2 32-18 30-40" stroke="#0b7a55" stroke-width="15" stroke-linecap="round" fill="none"/><circle cx="200" cy="92" r="12" fill="#7ee8c4"/><path d="M193 84l-2-9M200 82v-10M207 84l3-9" stroke="#7ee8c4" stroke-width="5" stroke-linecap="round"/></g>'+
'</g></svg>';
const TOUR=[
 {k:'scan',go:'nutri',fr:['Scanne','Un code-barres ou une photo, et tu sais tout de suite si c’est un bon choix.'],ar:['سكاني','كود-بار ولا تصويرة، وتعرف بسرعة واش المنتوج مزيان.'],
  scr:'<div class="nt-s-cam"><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i><div class="nt-s-bars"></div><div class="nt-s-laser"></div></div><div class="nt-s-chip">Code-barres détecté ✓</div>'},
 {k:'fiche',go:'nutri',fr:['Comprends','Un verdict simple, les additifs expliqués et leur niveau de risque.'],ar:['فهم','حكم بسيط، الإضافات متشرحة ودرجة الخطر ديالها.'],
  scr:'<div class="nt-s-h">Céréales choco</div><div class="nt-s-verdict">🟡 <b>Moyen</b></div><div class="nt-s-ns"><i style="--c:#038141">A</i><i style="--c:#85bb2f">B</i><i class="on" style="--c:#fecb02">C</i><i style="--c:#ee8100">D</i><i style="--c:#e63e11">E</i></div><div class="nt-s-sub">Additifs · 3</div><div class="nt-s-cap"><i style="--c:#1e9e5a">Sans</i><i style="--c:#8fbf2c">Faible</i><i class="on" style="--c:#f0a030">Modéré</i><i style="--c:#e0452f">Élevé</i></div><div class="nt-s-row"><u style="--c:#f0a030"></u><span>Caramel E150d</span></div><div class="nt-s-row"><u style="--c:#1e9e5a"></u><span>Lécithine E322</span></div>'},
 {k:'cmp',go:'nutri',fr:['Compare','Deux produits face à face : on te dit lequel choisir.'],ar:['قارن','جوج منتوجات مقابل بعضهم، وكنقولو ليك شكون الأحسن.'],
  scr:'<div class="nt-s-h">Comparer</div><div class="nt-s-vs"><div class="win"><em>🏆</em><b>78</b><small>Produit A</small></div><span>VS</span><div><b>41</b><small>Produit B</small></div></div><div class="nt-s-bar"><i style="width:78%"></i></div><div class="nt-s-bar b"><i style="width:41%"></i></div><div class="nt-s-sub">Moins de sucre · moins d’additifs</div>'},
 {k:'log',go:'health',fr:['Suis tes repas','Calories, protéines, glucides et lipides de ta journée, en un coup d’œil.'],ar:['تبع الماكلة','السعرات والماكرو ديال نهارك، فنظرة وحدة.'],
  scr:'<div class="nt-s-h big">Aujourd’hui</div><div class="nt-s-ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" class="bg"/><circle cx="50" cy="50" r="40" class="fg"/></svg><div><b>845</b><small>Restantes</small></div></div><div class="nt-s-mac"><span>Protéines<i style="--w:62%;--c:#4f8cff"></i></span><span>Glucides<i style="--w:45%;--c:#f0a030"></i></span><span>Lipides<i style="--w:30%;--c:#a06cf0"></i></span></div>'},
 {k:'ai',go:'ai',fr:['Demande au coach','Pose tes questions, le coach répond avec tes données.'],ar:['سول الكوتش','سول، والكوتش كيجاوبك على حساب المعطيات ديالك.'],
  scr:'<div class="nt-s-h">Coach</div><div class="nt-s-msg me">Je veux perdre 2 kg 💪</div><div class="nt-s-msg bot">Bon objectif ! Commence par un petit-déjeuner riche en protéines 🍳</div><div class="nt-s-msg me">Et le soir ?</div><div class="nt-s-typing"><i></i><i></i><i></i></div>'}
];
function setupTour(){
  const hero=$('#pulse-home .pulse-hero');if(!hero||$('#nt-tour'))return;
  const A=ar(),L=(fr,a)=>A?a:fr;
  const sec=document.createElement('section');sec.id='nt-tour';sec.className='nt-tour';sec.setAttribute('aria-label',L('Découvre Nutrix','اكتاشف Nutrix'));
  sec.innerHTML='<div class="nt-tour-top"><div class="nt-bubble"><b>'+L('Marhaba !','مرحبا بيك !')+' 👋</b><span>'+L('Voici ce que Nutrix fait pour toi.','هادشي لي كيدير ليك Nutrix.')+'</span></div>'+MASCOT+'</div>'+
   '<div class="nt-phones" id="nt-phones">'+TOUR.map((t,i)=>'<figure class="nt-fig'+(i===0?' on':'')+'" data-go="'+t.go+'" tabindex="0" role="button" aria-label="'+(A?t.ar[0]:t.fr[0])+'"><div class="nt-phone"><i class="nt-notch"></i><div class="nt-screen nt-k-'+t.k+'">'+t.scr+'</div></div><figcaption><b>'+(A?t.ar[0]:t.fr[0])+'</b><span>'+(A?t.ar[1]:t.fr[1])+'</span></figcaption></figure>').join('')+'</div>'+
   '<div class="nt-dots nt-tdots" id="nt-tdots"></div>';
  hero.insertAdjacentElement('afterend',sec);
  const box=$('#nt-phones'),figs=[...box.children],dots=$('#nt-tdots');
  figs.forEach((f,i)=>{const d=document.createElement('button');d.type='button';d.setAttribute('aria-label',String(i+1));d.addEventListener('click',()=>box.scrollTo({left:f.offsetLeft-(box.clientWidth-f.offsetWidth)/2,behavior:'smooth'}));dots.appendChild(d);});
  const mark=()=>{const c=box.scrollLeft+box.clientWidth/2;let best=0,bd=1e9;figs.forEach((f,i)=>{const d=Math.abs(f.offsetLeft+f.offsetWidth/2-c);if(d<bd){bd=d;best=i;}});figs.forEach((f,i)=>f.classList.toggle('on',i===best));[...dots.children].forEach((d,i)=>d.classList.toggle('on',i===best));};
  box.addEventListener('scroll',()=>requestAnimationFrame(mark),{passive:true});mark();
  const go=f=>{const t=f.dataset.go;document.querySelector('.tab[data-tab="'+t+'"]')?.click();};
  box.addEventListener('click',e=>{const f=e.target.closest('.nt-fig');if(f)go(f);});
  box.addEventListener('keydown',e=>{if(e.key==='Enter'){const f=e.target.closest('.nt-fig');if(f)go(f);}});
  // centre le premier écran au chargement
  requestAnimationFrame(()=>{const f=figs[0];box.scrollLeft=f.offsetLeft-(box.clientWidth-f.offsetWidth)/2;mark();});
}

/* ---------- Scanner : avatar qui scanne un produit ---------- */
function SCANBOT(T){
  // code-barres déterministe
  let bars='',x=270,seq=[2,1,1,3,1,2,1,1,2,3,1,1,2,1,3,1,2,2,1,1,3,1,2,1,1,2,1,3,2,1,1,2,1,1,3,1];let on=true;
  for(const w of seq){if(on)bars+=`<rect x="${x}" y="176" width="${w*.9}" height="26"/>`;x+=w*.9+.5;on=!on;}
  const spark=(cx,cy,s,d)=>`<g class="sb-spark" style="animation-delay:${d}s" transform="translate(${cx} ${cy})"><path d="M0 -${s}L${s*.28} -${s*.28}L${s} 0L${s*.28} ${s*.28}L0 ${s}L-${s*.28} ${s*.28}L-${s} 0L-${s*.28} -${s*.28}Z" fill="#fff"/></g>`;
  return `<svg class="nt-sb" viewBox="0 0 370 262" aria-hidden="true"><defs>
  <linearGradient id="sbWhite" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#eef3f0"/><stop offset="1" stop-color="#c9d5cf"/></linearGradient>
  <linearGradient id="sbWhiteV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfdad4"/></linearGradient>
  <radialGradient id="sbHead" cx=".32" cy=".25" r=".95"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#eef3f0"/><stop offset="1" stop-color="#bccac3"/></radialGradient>
  <linearGradient id="sbVisor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26352e"/><stop offset=".5" stop-color="#0d1713"/><stop offset="1" stop-color="#060d0a"/></linearGradient>
  <linearGradient id="sbGreen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5df0a6"/><stop offset="1" stop-color="#0c9a62"/></linearGradient>
  <linearGradient id="sbCard" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f3e6c8"/><stop offset="1" stop-color="#e4d1a6"/></linearGradient>
  <linearGradient id="sbSide" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cdb98c"/><stop offset="1" stop-color="#b79f6f"/></linearGradient>
  <linearGradient id="sbBeamV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5dffa6" stop-opacity=".05"/><stop offset="1" stop-color="#5dffa6" stop-opacity=".5"/></linearGradient><linearGradient id="sbBeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5dffa6" stop-opacity=".9"/><stop offset="1" stop-color="#5dffa6" stop-opacity=".08"/></linearGradient>
  <radialGradient id="sbFloor" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#0b3a26" stop-opacity=".32"/><stop offset="1" stop-color="#0b3a26" stop-opacity="0"/></radialGradient>
  <filter id="sbGlow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="sbSoft" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#0b3a26" flood-opacity=".28"/></filter>
  <clipPath id="sbVisorClip"><rect x="86" y="46" width="98" height="66" rx="30"/></clipPath></defs>
  <ellipse cx="136" cy="250" rx="96" ry="11" fill="url(#sbFloor)"/>
  <!-- robot -->
  <g class="sb-bot">
   <!-- torse -->
   <path d="M96 140h78c14 0 24 12 22 28l-6 36c-2 12-10 20-24 20h-62c-14 0-22-8-24-20l-6-36c-2-16 8-28 22-28z" fill="url(#sbWhite)" filter="url(#sbSoft)"/>
   <path d="M174 140c14 0 24 12 22 28l-6 36c-2 12-10 20-24 20h-12c14 0 22-8 24-20l6-36c2-12-2-22-10-28z" fill="#9fb2a9" opacity=".28"/>
   <rect x="102" y="196" width="66" height="9" rx="4.500" fill="#1d2b25"/><rect x="108" y="198.500" width="30" height="4" rx="2" fill="url(#sbGreen)"/>
   <circle cx="135" cy="168" r="19" fill="#e2ebe6"/><circle cx="135" cy="168" r="15.500" fill="#0f1f18"/><circle cx="135" cy="168" r="15.500" fill="none" stroke="url(#sbGreen)" stroke-width="2.200" filter="url(#sbGlow)"/>
   <path d="M135 177c-7-4-11-8-11-12.500a5.800 5.800 0 0 1 11-2.500 5.800 5.800 0 0 1 11 2.500c0 4.500-4 8.500-11 12.500z" fill="url(#sbGreen)"/><path d="M135 176v-12" stroke="#0f1f18" stroke-width="1.600" stroke-linecap="round"/>
   <!-- épaules -->
   <circle cx="98" cy="150" r="13.500" fill="url(#sbWhite)"/><circle cx="98" cy="150" r="13.500" fill="none" stroke="#2fd488" stroke-width="2.600"/>
   <circle cx="174" cy="150" r="13.500" fill="url(#sbWhite)"/><circle cx="174" cy="150" r="13.500" fill="none" stroke="#2fd488" stroke-width="2.600"/>
   <!-- cou -->
   <rect x="118" y="124" width="34" height="18" rx="7" fill="#1d2b25"/><path d="M124 131h22M124 136h22" stroke="#33473e" stroke-width="2" stroke-linecap="round"/>
   <!-- tête -->
   <g class="sb-head">
    <circle cx="66" cy="80" r="16" fill="#18271f"/><circle cx="66" cy="80" r="12" fill="url(#sbGreen)"/><circle cx="66" cy="80" r="5" fill="#0f1f18" opacity=".35"/>
    <circle cx="204" cy="80" r="16" fill="#18271f"/><circle cx="204" cy="80" r="12" fill="url(#sbGreen)"/><circle cx="204" cy="80" r="5" fill="#0f1f18" opacity=".35"/>
    <rect x="73" y="26" width="124" height="104" rx="48" fill="url(#sbHead)" filter="url(#sbSoft)"/>
    <path d="M92 38c14-9 34-12 52-8" stroke="#fff" stroke-width="4.500" stroke-linecap="round" fill="none" opacity=".8"/>
    <rect x="82" y="42" width="106" height="74" rx="34" fill="#c3d0c9" opacity=".55"/>
    <rect x="86" y="46" width="98" height="66" rx="30" fill="url(#sbVisor)"/>
    <g clip-path="url(#sbVisorClip)"><path d="M86 46h60l-34 66H86z" fill="#fff" opacity=".07"/><ellipse cx="112" cy="58" rx="22" ry="7" fill="#fff" opacity=".13" transform="rotate(-14 112 58)"/></g>
    <rect x="86" y="46" width="98" height="66" rx="30" fill="none" stroke="#2c3f36" stroke-width="1.600"/>
    <g class="sb-eyes">
     <g stroke="#26d97f" stroke-width="12" stroke-linecap="round" fill="none" opacity=".55" filter="url(#sbGlow)"><path d="M106 84q11-17 22 0"/><path d="M142 84q11-17 22 0"/></g>
     <g stroke="#9bffc6" stroke-width="6" stroke-linecap="round" fill="none"><path d="M106 84q11-17 22 0"/><path d="M142 84q11-17 22 0"/></g>
    </g>
    <ellipse cx="99" cy="96" rx="7" ry="4" fill="#5dffa6" opacity=".18"/><ellipse cx="171" cy="96" rx="7" ry="4" fill="#5dffa6" opacity=".18"/>
   </g>
   <!-- bras -->
   <path d="M98 156C78 178 82 204 100 216" stroke="url(#sbWhiteV)" stroke-width="17" stroke-linecap="round" fill="none"/>
   <path d="M174 156C194 178 190 204 172 216" stroke="url(#sbWhiteV)" stroke-width="17" stroke-linecap="round" fill="none"/>
   </g>
  <g class="sb-boxwrap"><!-- boîte -->
  <g class="sb-box" filter="url(#sbSoft)"><g transform="translate(135 134) scale(.74) translate(-303 -82)">
   <polygon points="258,82 348,82 362,70 272,70" fill="#fbf2db"/>
   <polygon points="348,82 362,70 362,214 348,226" fill="url(#sbSide)"/>
   <rect x="258" y="82" width="90" height="144" rx="3" fill="url(#sbCard)"/>
   <rect x="258" y="82" width="90" height="26" fill="#2f9e5f"/><path d="M258 108h90" stroke="#1f7a46" stroke-width="2"/>
   <circle cx="274" cy="95" r="8.5" fill="#fff" opacity=".95"/><path d="M269.500 98c.8-5 3.600-7 7.500-7.500-.3 4.500-2.600 7.200-7.500 7.500z" fill="#2f9e5f"/>
   <text x="318" y="99" font-family="Poppins,Inter,sans-serif" font-weight="800" font-size="8.500" fill="#fff" text-anchor="middle" letter-spacing=".6">100% NATUREL</text>
   <text x="303" y="130" font-family="Poppins,Inter,sans-serif" font-weight="800" font-size="16" fill="#5e3f14" text-anchor="middle">Flocons</text>
   <text x="303" y="146" font-family="Poppins,Inter,sans-serif" font-weight="700" font-size="13" fill="#5e3f14" text-anchor="middle">d’avoine</text>
   <g stroke="#b5832e" stroke-width="2" stroke-linecap="round" fill="none"><path d="M303 172v-18"/><path d="M303 160l-7-6M303 160l7-6M303 166l-7-6M303 166l7-6M303 154l-5-5M303 154l5-5"/></g>
   <rect x="266" y="172" width="74" height="40" rx="3" fill="#fff"/>
   <g fill="#161616">${bars}</g>
   <text x="303" y="209" font-family="Inter,sans-serif" font-size="5.500" fill="#333" text-anchor="middle" letter-spacing=".8">3 760164 290128</text>
   <g stroke="#34e08d" stroke-width="3" fill="none" stroke-linecap="round" filter="url(#sbGlow)"><path d="M262 180v-9h9M344 180v-9h-9M262 204v9h9M344 204v9h-9"/></g>
   <rect x="258" y="82" width="90" height="144" rx="3" fill="url(#sbWhite)" opacity=".08"/></g>
  </g>
  <!-- faisceau -->
  <g class="sb-beam"><polygon points="127,112 143,112 163,200 107,200" fill="url(#sbBeamV)" filter="url(#sbGlow)"/></g>
  <rect class="sb-laser" x="108" y="202" width="54" height="2" rx="1" fill="#7bffb8" filter="url(#sbGlow)"/>
  </g><g class="sb-hands"><g fill="url(#sbWhiteV)" stroke="#a9bab2" stroke-width="1"><circle cx="103" cy="216" r="11"/><circle cx="170" cy="216" r="11"/></g>
  <g stroke="#9fb0a8" stroke-width="1.500" stroke-linecap="round" fill="none"><path d="M97 217q6 5 12-1"/><path d="M164 217q6 5 12-1"/></g></g>
  <!-- bulle de dialogue -->
  <g class="sb-say"><path d="M214 24h118a12 12 0 0 1 12 12v18a12 12 0 0 1-12 12H246l-14 14 2-14h-20a12 12 0 0 1-12-12V36a12 12 0 0 1 12-12z" fill="#fff" stroke="#bfe6cf" stroke-width="1.500" filter="url(#sbSoft)"/>
  <text x="279" y="51" font-family="Poppins,Inter,sans-serif" font-weight="700" font-size="12" fill="#0f3d28" text-anchor="middle">${T}</text></g>
  ${spark(246,150,5,0)}${spark(352,150,4,.7)}${spark(60,40,4.500,1.2)}${spark(232,56,3.500,.4)}
  </svg>`;
}
function setupScanHero(){
  const grid=$('#page-nutri .nutri-top-grid');if(!grid||$('.nt-scanhero',grid))return;
  const A=ar(),L=(f,a)=>A?a:f;
  const h=document.createElement('div');h.className='nt-scanhero';
  h.innerHTML='<div class="nt-blob"></div>'+SCANBOT(L('Scanne un produit','سكاني منتوج'));
  grid.insertBefore(h,grid.firstChild);
}

/* ---------- Micro façon message vocal (Instagram) : enregistrement WAV + transcription Gemini ---------- */
const XSVG='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
function fixClose(){const c=document.getElementById('v11-ai-close');if(c&&!c.dataset.ntx){c.dataset.ntx='1';c.innerHTML=XSVG;c.setAttribute('aria-label','Fermer')}}
const REC={on:false};
function wavFrom(chunks,rate){let len=0;chunks.forEach(c=>len+=c.length);const all=new Float32Array(len);let o=0;chunks.forEach(c=>{all.set(c,o);o+=c.length});
 const R=16000,ratio=rate/R,n=Math.floor(len/ratio),pcm=new Int16Array(n);
 for(let i=0;i<n;i++){const a=Math.floor(i*ratio),b=Math.min(len,Math.floor((i+1)*ratio));let s=0,k=0;for(let x=a;x<b;x++){s+=all[x];k++}const v=Math.max(-1,Math.min(1,k?s/k:0));pcm[i]=v<0?v*0x8000:v*0x7fff}
 const buf=new ArrayBuffer(44+n*2),dv=new DataView(buf),w=(p,t)=>{for(let i=0;i<t.length;i++)dv.setUint8(p+i,t.charCodeAt(i))};
 w(0,'RIFF');dv.setUint32(4,36+n*2,true);w(8,'WAVEfmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);dv.setUint32(24,R,true);dv.setUint32(28,R*2,true);dv.setUint16(32,2,true);dv.setUint16(34,16,true);w(36,'data');dv.setUint32(40,n*2,true);
 for(let i=0;i<n;i++)dv.setInt16(44+i*2,pcm[i],true);
 let bin='';const u=new Uint8Array(buf);for(let i=0;i<u.length;i+=0x8000)bin+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return 'data:audio/wav;base64,'+btoa(bin)}
async function startVoice(){
 const form=document.getElementById('ai-form'),input=document.getElementById('ai-input');if(!form||REC.on)return;
 const A=ar(),L=(f,a)=>A?a:f;
 let stream;try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}})}
 catch{toast(L('Micro refusé : autorise-le dans le navigateur.','الميكرو مرفوض: عطيه الإذن فالمتصفح.'));return}
 const Ctx=window.AudioContext||window.webkitAudioContext,ac=new Ctx(),src=ac.createMediaStreamSource(stream),an=ac.createAnalyser();an.fftSize=512;
 const proc=ac.createScriptProcessor(4096,1,1),mute=ac.createGain();mute.gain.value=0;src.connect(an);src.connect(proc);proc.connect(mute);mute.connect(ac.destination);
 const chunks=[];proc.onaudioprocess=e=>{if(REC.on)chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)))};
 const bar=document.createElement('div');bar.className='nt-rec';const N=44;
 bar.innerHTML='<button type="button" class="nt-rec-x" aria-label="'+L('Annuler','إلغاء')+'"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg></button><span class="nt-rec-dot"></span><b class="nt-rec-t">0:00</b><div class="nt-rec-wave">'+'<i></i>'.repeat(N)+'</div><button type="button" class="nt-rec-ok" aria-label="'+L('Envoyer','سيفط')+'"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>';
 form.classList.add('nt-recording');form.appendChild(bar);REC.on=true;
 const bars=[...bar.querySelectorAll('.nt-rec-wave i')],levels=new Array(N).fill(.06),buf=new Uint8Array(an.fftSize),t0=Date.now(),tEl=bar.querySelector('.nt-rec-t');
 let raf,last=0;
 const loop=ts=>{an.getByteTimeDomainData(buf);if(ts-last>55){last=ts;let m=0;for(let i=0;i<buf.length;i++){const v=Math.abs(buf[i]-128)/128;if(v>m)m=v}levels.push(Math.min(1,Math.max(.06,m*2.2)));levels.shift();bars.forEach((b,i)=>b.style.height=Math.round(levels[i]*100)+'%')}
  const sec=Math.floor((Date.now()-t0)/1000);tEl.textContent=Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');if(sec>=60)finish(true);else raf=requestAnimationFrame(loop)};
 raf=requestAnimationFrame(loop);
 const cleanup=()=>{cancelAnimationFrame(raf);REC.on=false;try{proc.disconnect();src.disconnect()}catch{}stream.getTracks().forEach(t=>t.stop());try{ac.close()}catch{}};
 const done=()=>{bar.remove();form.classList.remove('nt-recording')};
 let finished=false;
 async function finish(send){if(finished)return;finished=true;const rate=ac.sampleRate;cleanup();
  if(!send||Date.now()-t0<700||!chunks.length){done();if(send)toast(L('Message trop court.','الرسالة قصيرة بزاف.'));return}
  bar.classList.add('busy');bar.innerHTML='<span class="nt-rec-spin"></span><b>'+L('Je transcris…','كنكتب ليك…')+'</b>';form.appendChild(bar);
  try{const audio=wavFrom(chunks,rate);
   const r=await fetch('/api/ai/transcribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({audio,language:A?'ary':'fr'})});
   let j={};try{j=await r.json()}catch{}
   if(!r.ok)throw new Error(j.error||'Transcription indisponible');
   done();const txt=(j.text||'').trim();
   if(!txt){toast(L('Je n’ai rien entendu, réessaie.','ما سمعت والو، عاود.'));return}
   input.value=txt;input.dispatchEvent(new Event('input',{bubbles:true}));form.requestSubmit?form.requestSubmit():form.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}));
  }catch(e){done();toast(e.message||L('Transcription impossible.','التحويل ما نجحش.'))}}
 bar.querySelector('.nt-rec-x').onclick=()=>finish(false);
 bar.querySelector('.nt-rec-ok').onclick=()=>finish(true);
}
function toast(t){let e=document.querySelector('.nt-toast');if(!e){e=document.createElement('div');e.className='nt-toast';document.body.appendChild(e)}e.textContent=t;e.classList.add('on');clearTimeout(e._t);e._t=setTimeout(()=>e.classList.remove('on'),3200)}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#ai-voice-btn');if(!b)return;
 if(document.body.classList.contains('ai-call-active'))return;
 if(!(window.AudioContext||window.webkitAudioContext)||!navigator.mediaDevices?.getUserMedia)return;
 e.stopImmediatePropagation();e.preventDefault();startVoice()},true);
new MutationObserver(fixClose).observe(document.documentElement,{childList:true,subtree:true});
/* ---------- Icône de la section : tajine ---------- */
const MR_ICON=(s=22,w=1.8)=>`<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="3.6" r="1.25"/><path d="M5.2 15.2C6.1 10.6 8.6 7 12 4.9c3.4 2.1 5.9 5.7 6.8 10.3"/><path d="M9.3 9.6c1.6-.6 3.8-.6 5.4 0"/><path d="M2.8 15.2h18.4"/><path d="M4.3 15.2c.7 2.6 3.8 4.3 7.7 4.3s7-1.7 7.7-4.3"/></svg>`;
const MR_TILE=s=>`<i class="mr-ico" style="--s:${s}px">${MR_ICON(Math.round(s*.6),2)}</i>`;

/* ---------- Robot Nutrix + tarbouch (léger : sans filtres) ---------- */
function siNutrix(){return `<svg viewBox="0 0 190 214" class="mr-bot" aria-hidden="true"><defs>
<linearGradient id="siW" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#cdd9d3"/></linearGradient>
<radialGradient id="siH" cx=".3" cy=".25" r=".95"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#eef3f0"/><stop offset="1" stop-color="#bccac3"/></radialGradient>
<linearGradient id="siV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26352e"/><stop offset="1" stop-color="#060d0a"/></linearGradient>
<linearGradient id="siG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5df0a6"/><stop offset="1" stop-color="#0c9a62"/></linearGradient>
<linearGradient id="siFez" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8483a"/><stop offset=".6" stop-color="#c02a22"/><stop offset="1" stop-color="#8f1a16"/></linearGradient>
<linearGradient id="siRobe" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset=".55" stop-color="#f1e2bd"/><stop offset="1" stop-color="#d8c18a"/></linearGradient>
<linearGradient id="siSleeve" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf3df"/><stop offset="1" stop-color="#e2cd98"/></linearGradient>
<linearGradient id="siGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f6d27a"/><stop offset="1" stop-color="#c98f25"/></linearGradient>
<linearGradient id="siTaj" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ec9466"/><stop offset="1" stop-color="#a84a28"/></linearGradient>
<linearGradient id="siTajB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8653a"/><stop offset="1" stop-color="#8c3b1e"/></linearGradient>
<linearGradient id="siSl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd35c"/><stop offset="1" stop-color="#e0a21d"/></linearGradient>
<filter id="siS" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000" flood-opacity=".25"/></filter></defs>
<ellipse cx="95" cy="206" rx="62" ry="6" fill="#000" opacity=".22"/>
<g class="mr-float">
<!-- babouches -->
<path d="M52 197c0-7 7-11 16-11h8c4 0 6 4 4 7-3 6-11 9-20 9-5 0-8-2-8-5z" fill="url(#siSl)" stroke="#b9801a" stroke-width="1"/>
<path d="M108 197c0-7 7-11 16-11h8c4 0 6 4 4 7-3 6-11 9-20 9-5 0-8-2-8-5z" fill="url(#siSl)" stroke="#b9801a" stroke-width="1"/>
<!-- capuche -->
<path d="M44 118c-6-14 4-34 24-36h54c20 2 30 22 24 36z" fill="#e6d3a2"/>
<!-- djellaba -->
<g filter="url(#siS)"><path d="M52 118c0-8 12-12 43-12s43 4 43 12l12 72c1 6-3 8-8 8H48c-5 0-9-2-8-8z" fill="url(#siRobe)"/></g>
<path d="M95 112v86" stroke="url(#siGold)" stroke-width="9"/>
<path d="M62 112 95 138 128 112" fill="none" stroke="url(#siGold)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M44 190h102" stroke="url(#siGold)" stroke-width="5" stroke-linecap="round"/>
<!-- tête -->
<g filter="url(#siS)"><rect x="48" y="50" width="94" height="70" rx="33" fill="url(#siH)"/></g>
<circle cx="45" cy="86" r="10" fill="#18271f"/><circle cx="45" cy="86" r="7" fill="url(#siG)"/><circle cx="145" cy="86" r="10" fill="#18271f"/><circle cx="145" cy="86" r="7" fill="url(#siG)"/>
<rect x="56" y="62" width="78" height="50" rx="24" fill="url(#siV)"/><ellipse cx="78" cy="71" rx="16" ry="4.500" fill="#fff" opacity=".14" transform="rotate(-12 78 71)"/>
<g class="mr-eyes" stroke="#9bffc6" stroke-width="5.500" stroke-linecap="round" fill="none"><path d="M72 94q8-13 16 0"/><path d="M102 94q8-13 16 0"/></g>
<ellipse cx="68" cy="103" rx="5.500" ry="3.200" fill="#5dffa6" opacity=".22"/><ellipse cx="122" cy="103" rx="5.500" ry="3.200" fill="#5dffa6" opacity=".22"/>
<!-- tarbouch -->
<g filter="url(#siS)"><path d="M62 56 66 24c0-6 8-10 29-10s29 4 29 10l4 32z" fill="url(#siFez)"/></g>
<path d="M66 28c8-6 40-6 58 0" stroke="#f2766a" stroke-width="3" stroke-linecap="round" fill="none" opacity=".5"/>
<rect x="60" y="50" width="70" height="9" rx="4.500" fill="#7d1612"/><rect x="60" y="50" width="70" height="3" rx="1.500" fill="#d94a3c" opacity=".6"/>
<circle cx="95" cy="13" r="3.500" fill="#111"/><path d="M95 14c16 0 28 8 30 22" stroke="#111" stroke-width="2.200" fill="none" stroke-linecap="round"/>
<g class="mr-tassel"><rect x="121" y="34" width="8" height="5" rx="2" fill="url(#siGold)"/><path d="M122 39l-3 16M125 39v18M128 39l3 16" stroke="#111" stroke-width="2.600" stroke-linecap="round"/></g>
<!-- manches : les deux bras descendent vers le tajine -->
<path d="M56 121c-11 7-16 22-13 38 2 8 7 12 13 13" stroke="#c9ad6c" stroke-width="19.500" stroke-linecap="round" fill="none"/><path d="M134 121c11 7 16 22 13 38-2 8-7 12-13 13" stroke="#c9ad6c" stroke-width="19.500" stroke-linecap="round" fill="none"/>
<path d="M56 121c-11 7-16 22-13 38 2 8 7 12 13 13" stroke="url(#siSleeve)" stroke-width="17" stroke-linecap="round" fill="none"/>
<path d="M134 121c11 7 16 22 13 38-2 8-7 12-13 13" stroke="url(#siSleeve)" stroke-width="17" stroke-linecap="round" fill="none"/>
<path d="M56 121c-11 7-16 22-13 38" stroke="#c9a95a" stroke-width="1.200" fill="none" opacity=".45"/><path d="M134 121c11 7 16 22 13 38" stroke="#c9a95a" stroke-width="1.200" fill="none" opacity=".45"/>
<!-- tajine tenu à deux mains -->
<g class="mr-taj">
 <g class="mr-steam" fill="none" stroke="#fff" stroke-width="2.200" stroke-linecap="round" opacity=".8"><path d="M82 140c-4-6 4-8 0-14"/><path d="M108 140c-4-6 4-8 0-14"/></g>
 <path d="M58 176c0 11 16 18 37 18s37-7 37-18z" fill="url(#siTajB)"/>
 <ellipse cx="95" cy="176" rx="38" ry="7" fill="#eaa77f"/>
 <path d="M60 176c0 3 15 6.500 35 6.500s35-3.500 35-6.500" fill="none" stroke="#7a3318" stroke-width="1.400"/>
 <path d="M66 174c1-11 13-18 29-18s28 7 29 18z" fill="#d9794c"/>
 <path d="M75 162c4-12 11-21 20-30 9 9 16 18 20 30z" fill="url(#siTaj)"/>
 <circle cx="95" cy="130" r="4.500" fill="#e8b04a"/>
 <g stroke="#f5d9bf" stroke-width="1.700" stroke-linecap="round" fill="none" opacity=".85"><path d="M70 186h50"/><path d="M84 161c7 2 15 2 22 0"/></g>
 <path d="M82 152c2-6 6-11 10-15" stroke="#fff" stroke-width="2.400" stroke-linecap="round" fill="none" opacity=".35"/>
</g>
<!-- poignets dorés + mains (moufles) agrippant le plat -->
<g class="mr-hands">
 <path d="M47.500 166.500 53 171.500" stroke="url(#siGold)" stroke-width="17" fill="none"/>
 <path d="M142.500 166.500 137 171.500" stroke="url(#siGold)" stroke-width="17" fill="none"/>
 <g fill="url(#siW)" stroke="#a9bab2" stroke-width="1.100">
  <path d="M51 172c0-6 5-9 11-9 7 0 11 4 11 10 0 5-4 9-11 9-6 0-11-4-11-10z"/>
  <path d="M139 172c0-6-5-9-11-9-7 0-11 4-11 10 0 5 4 9 11 9 6 0 11-4 11-10z"/>
  <ellipse cx="70" cy="168" rx="4.200" ry="3.200" transform="rotate(-30 70 168)"/>
  <ellipse cx="120" cy="168" rx="4.200" ry="3.200" transform="rotate(30 120 168)"/>
 </g>
 <g stroke="#a9bab2" stroke-width="1.100" stroke-linecap="round" fill="none"><path d="M60 177q4 2 8 0"/><path d="M122 177q4 2 8 0"/></g>
</g>
</g></svg>`}

/* ---------- Photos réelles : Wikimedia Commons, rotation quotidienne + photo perso ---------- */
const MR_Q={'Harira':'harira','Tajine poulet olives citron':'chicken tajine olives lemon|chicken tajine','Tajine kefta aux œufs':'kefta tagine eggs|kefta tajine','Tajine d’agneau aux pruneaux':'tajine prunes|lamb tajine','Tajine de poisson (chermoula)':'fish tajine|fish tagine','Tajine de légumes':'vegetable tajine|vegetable tagine','Couscous aux sept légumes':'couscous vegetables|moroccan couscous','Couscous tfaya':'couscous tfaya|couscous onions raisins','Seffa médiouiya':'seffa|seffa couscous','Pastilla au poulet':'pastilla|bastilla','Rfissa':'rfissa','Tanjia marrakchia':'tanjia|tangia','Méchoui d’agneau':'mechoui|méchoui','Brochettes de kefta (3)':'kefta brochette|kofta grill','Brochettes de poulet (3)':'chicken brochettes|chicken skewers grilled','Sardines grillées':'grilled sardines','Salade marocaine':'moroccan salad|tomato cucumber salad','Zaalouk':'zaalouk|eggplant salad moroccan','Taktouka':'taktouka|roasted pepper tomato salad','Bissara':'bissara','Lentilles (adas)':'lentil stew|lentil soup','Loubia (haricots blancs)':'loubia|white beans tomato stew','Msemen':'msemen','Baghrir (2 crêpes)':'baghrir','Harcha':'harcha','Batbout':'batbout|moroccan bread','Khobz (1/4 de pain)':'khobz|moroccan bread','Œufs au khlii':'khlii eggs|khlii','Sandwich kefta':'kefta sandwich|kofta sandwich','Chebakia':'chebakia','Cornes de gazelle':'cornes de gazelle|kaab el ghazal','Briouate aux amandes':'briouat|briouate','Sellou (sfouf)':'sellou|sfouf','Amlou':'amlou','Dattes (3)':'medjool dates|dates fruit','Thé à la menthe (sucré)':'moroccan mint tea|mint tea glass','Jus d’orange pressé':'orange juice glass','Avocat-amande (smoothie)':'avocado smoothie|avocado milkshake','Tajine de poulet aux légumes':'chicken vegetable tajine|chicken tajine','Tajine de bœuf aux carottes':'beef tajine|beef tagine','Tajine de sardines (boulettes)':'sardine tajine|sardine balls','Tajine de crevettes':'shrimp tajine|shrimp pil pil','Tajine de pois chiches (hmss)':'chickpea tajine|chickpea stew','Tajine de courge à l’agneau':'pumpkin tajine|squash tagine','Djej mqualli (poulet citron olives)':'mqualli|chicken preserved lemon olives','Poulet rôti à la chermoula':'chermoula chicken|roast chicken','Poulet m’hamer':'mhammer chicken|roast chicken spices','Foie à la chermoula':'liver chermoula|grilled liver','Boulettes de kefta sauce tomate':'kefta tomato sauce|meatballs tomato sauce','Merguez grillées (3)':'merguez','Mrouzia':'mrouzia','Lham lhalou':'lham lhalou|lamb prunes almonds','Berkoukes':'berkoukes|berkukes','Hergma':'hergma|cow feet stew','Couscous aux légumes (végétarien)':'vegetable couscous','Couscous d’orge (belboula)':'barley couscous|belboula','Couscous au poisson':'fish couscous','Soupe de légumes marocaine':'vegetable soup','Chorba (soupe de vermicelles)':'chorba|vermicelli soup','Soupe de poisson':'fish soup','Salade de betteraves':'beetroot salad','Salade de carottes au cumin':'carrot salad cumin|carrot salad','Salade d’aubergines grillées':'grilled eggplant salad|zaalouk','Salade de lentilles':'lentil salad','Salade de pois chiches':'chickpea salad','Salade d’orange à la cannelle':'orange cinnamon salad|orange salad cinnamon','Salade de poivrons grillés':'roasted pepper salad','Salade concombre menthe':'cucumber salad','Pastilla au poisson':'seafood pastilla|fish pastilla','Mlaoui':'mlaoui|meloui','Rghaif':'rghaif|msemen','Sfenj':'sfenj','Bsissa':'bsissa|bsisa','Lben (lait fermenté)':'buttermilk glass|lben','Fromage frais (jben)':'jben|fresh cheese','Mhancha':'m\'hanncha|mhancha','Ghoriba':'ghoriba|ghriba','Zlabia':'zlabia|jalebi','Fekkas':'fekkas|biscotti almonds','Pastilla au lait':'pastilla au lait|milk pastilla','Amandes (30 g)':'almonds nuts','Olives (10)':'moroccan olives|olives bowl','Figues fraîches (3)':'fresh figs','Grenade':'pomegranate fruit','Orange':'orange fruit'};
const MR_PH=(()=>{
 const KEY='nutrix-mr-pics-v3',MINE='nutrix-mr-mine',OFF='nutrix-mr-off';
 const rd=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return {}}},wr=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
 const mem=rd(KEY),mine=rd(MINE),off=rd(OFF),wait={},queue=[];let run=0;
 const day=()=>{const d=new Date();return Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()))/864e5)};
 const hash=s=>{let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h};
 const BAD=/\b(logo|maps?|carte|flags?|drapeau|diagram|stamps?|timbre|book|poster|menu|screenshot|portrait|signage|sign|label|packaging|recipe card)\b|\.(tiff?|gif)$/i;
const MR_W={'Harira':'en:Harira|fr:Harira','Couscous aux sept légumes':'en:Couscous|fr:Couscous','Couscous aux légumes (végétarien)':'fr:Couscous','Seffa médiouiya':'en:Seffa|fr:Seffa','Pastilla au poulet':'en:Pastilla|fr:Pastilla','Rfissa':'en:Rfissa|fr:Rfissa','Tanjia marrakchia':'en:Tangia|fr:Tanjia','Méchoui d’agneau':'en:Mechoui|fr:Méchoui','Brochettes de kefta (3)':'fr:Kefta','Salade marocaine':'fr:Salade marocaine','Zaalouk':'en:Zaalouk|fr:Zaalouk','Taktouka':'en:Taktouka|fr:Taktouka','Bissara':'en:Bissara|fr:Bissara','Loubia (haricots blancs)':'fr:Loubia','Msemen':'en:Msemen|fr:Msemen','Baghrir (2 crêpes)':'en:Baghrir|fr:Baghrir','Harcha':'en:Harcha|fr:Harcha','Batbout':'en:Batbout|fr:Batbout','Khobz (1/4 de pain)':'en:Khobz|fr:Khobz','Œufs au khlii':'en:Khlea|fr:Khlii','Chebakia':'en:Chebakia|fr:Chebakia','Cornes de gazelle':'en:Kaab el ghazal|fr:Corne de gazelle','Briouate aux amandes':'en:Briouat|fr:Briouate','Sellou (sfouf)':'en:Sellou|fr:Sellou','Amlou':'en:Amlou|fr:Amlou','Dattes (3)':'en:Medjool','Thé à la menthe (sucré)':'en:Maghrebi mint tea|fr:Thé à la menthe','Jus d’orange pressé':'en:Orange juice','Tajine de légumes':'en:Tajine|fr:Tajine','Merguez grillées (3)':'en:Merguez|fr:Merguez','Mrouzia':'en:Mrouzia|fr:Mrouzia','Berkoukes':'en:Berkoukes|fr:Berkoukes','Hergma':'fr:Hergma','Mlaoui':'fr:Mlaoui','Rghaif':'en:Rghaif','Sfenj':'en:Sfenj|fr:Sfenj','Bsissa':'en:Bsissa|fr:Bsissa','Fromage frais (jben)':'en:Jben|fr:Jben','Mhancha':'en:M\'hanncha|fr:M\'hanncha','Ghoriba':'en:Ghriba|fr:Ghribia','Zlabia':'fr:Zlabia','Fekkas':'fr:Fekkas','Figues fraîches (3)':'en:Common fig','Grenade':'en:Pomegranate','Orange':'en:Orange (fruit)','Amandes (30 g)':'en:Almond'};
 let wikiP=null;
 function wiki(){return wikiP||(wikiP=(async()=>{const out={},by={};Object.entries(MR_W).forEach(([n,ts])=>ts.split('|').forEach(t=>{const i=t.indexOf(':'),l=t.slice(0,i);(by[l]=by[l]||[]).push([n,t.slice(i+1)])}));
  await Promise.all(Object.entries(by).map(async([l,arr])=>{for(let i=0;i<arr.length;i+=45){const ch=arr.slice(i,i+45);
   try{const r=await fetch('https://'+l+'.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=thumbnail|name&pithumbsize=500&titles='+encodeURIComponent(ch.map(x=>x[1]).join('|')));const j=await r.json(),q=j.query||{},map={};
    (q.normalized||[]).forEach(x=>map[x.to]=x.from);(q.redirects||[]).forEach(x=>map[x.to]=map[x.from]||x.from);
    Object.values(q.pages||{}).forEach(pg=>{const t=pg.thumbnail;if(!t||t.height>t.width*1.6)return;const orig=map[pg.title]||pg.title;
     ch.filter(x=>x[1]===orig||x[1]===pg.title).forEach(([n])=>{const L=out[n]=out[n]||[];if(!L.some(y=>y.u===t.source))L.push({u:t.source,f:'https://'+l+'.wikipedia.org/wiki/File:'+encodeURIComponent(pg.pageimage||''),a:'',l:'Wikipedia'})})})}catch{}}}));
  return out})())}
 function imgUrl(name){const d=(window.NutrixMaroc&&window.NutrixMaroc.MAR||[]).find(x=>x.name===name);let code='';try{code=localStorage.getItem('nutrix-access-code')||''}catch{}
  return '/api/ai/image?'+new URLSearchParams({dish:name,ing:(d?d.ing:[]).slice(0,10).join('|'),raw:'1',v:'1',...(code?{code}:{})})}
 // Préchauffage : ouvre  ton-site/?warm=1  une seule fois — l'IA prépare les photos de TOUS les plats, puis Vercel les garde 30 jours pour tout le monde.
 async function warm(report){const names=(window.NutrixMaroc&&window.NutrixMaroc.MAR||[]).map(d=>d.name),w=await wiki(),q=names.slice();let done=0,gen=0,fail=0;
  const worker=async()=>{while(q.length){const n=q.shift();let ai=await viaAI(n);for(let k=0;ai==='wait'&&k<4;k++){await new Promise(r=>setTimeout(r,15000));ai=await viaAI(n)}
   if(!Array.isArray(ai))fail++;else if(!ai.length&&!(w[n]||[]).length){let ok=false;for(let k=0;k<6&&!ok;k++){try{const r=await fetch(imgUrl(n));if(r.ok){ok=true;gen++}else if(r.status===429)await new Promise(r=>setTimeout(r,12000));else break}catch{break}}if(!ok)fail++}
   done++;report(done,names.length,gen,fail)}};
  await Promise.all([worker(),worker(),worker()])}
 async function viaAI(name){const d=(window.NutrixMaroc&&window.NutrixMaroc.MAR||[]).find(x=>x.name===name);
  const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),58000);
  try{const qs=new URLSearchParams({name,ing:(d?d.ing:[]).slice(0,10).join('|'),hints:(MR_Q[name]||'').split('|').filter(Boolean).slice(0,3).join('|'),v:'1'});const r=await fetch('/api/ai/dishphoto?'+qs,{signal:ac.signal});
   if(r.status===429)return 'wait';if(!r.ok)return null;const j=await r.json();return j&&j.ai&&Array.isArray(j.photos)?j.photos.filter(x=>x&&x.u):null}catch{return null}finally{clearTimeout(tm)}}
 // 1) Wikipedia tout de suite (rapide)  2) l'IA enrichit en arrière-plan, sans bloquer l'affichage
 function refill(n){document.querySelectorAll('.mr-ph[data-ph]').forEach(el=>{if(el.dataset.ph===n)fill(el)})}
 async function enrich(name){let ai=await viaAI(name);for(let k=0;ai==='wait'&&k<3;k++){await new Promise(r=>setTimeout(r,12000));ai=await viaAI(name)}
  const c=mem[name]||{l:[]};const ok=Array.isArray(ai);const list=ok?ai.slice():[];(c.l||[]).forEach(x=>{if(!list.some(y=>y.u===x.u))list.push(x)});
  // aucune vraie photo trouvée : image dessinée par l'IA, une seule fois pour tout le monde (gardée 30 jours par Vercel)
  if(ok&&!list.length)list.push({u:imgUrl(name),f:'',a:'',l:'Image IA'})
  // en cas d'échec IA on garde Wikipedia et on réessaiera demain
  mem[name]={t:ok?Date.now():Date.now()-2*864e5,l:list.slice(0,10),ai:ok||!!c.ai};wr(KEY,mem);refill(name);return mem[name].l}
 function pump(){while(run<3&&queue.length){const [n,res]=queue.shift();run++;enrich(n).then(res,()=>res((mem[n]||{}).l||[])).finally(()=>{run--;pump()})}}
 function bg(name){return wait[name]||(wait[name]=new Promise(res=>{queue.push([name,res]);pump()}).finally(()=>delete wait[name]))}
 async function load(name){const c=mem[name],age=c?Date.now()-c.t:1e15;
  if(c&&c.l.length){if(age>(c.ai?30:3)*864e5)bg(name);return c.l}           // cache affiché immédiatement, rafraîchi en fond si vieux
  if(c&&!c.l.length&&age<864e5)return [];
  const w=((await wiki())[name]||[]).slice();
  if(w.length){mem[name]={t:Date.now(),l:w,ai:false};wr(KEY,mem);bg(name);return w}  // photo Wikipedia tout de suite, IA ensuite
  return bg(name)}                                                           // pas de photo Wikipedia : seule l'IA peut en trouver
 function pick(name){if(mine[name])return {u:mine[name],mine:true};const l=(mem[name]||{}).l||[];if(!l.length)return null;const x=l[(day()+hash(name)+(off[name]||0))%l.length];return x}
 const big=u=>/\/500px-/.test(u)?u.replace('/500px-','/960px-'):u;
 function html(d,cls=''){const p=pick(d.name);return `<span class="mr-ph ${cls} ${p?'':'wait'}" data-ph="${d.name.replace(/"/g,'&quot;')}"><b>${d.emoji}</b>${p?`<img src="${(cls.includes('big')?big(p.u):p.u).replace(/"/g,'&quot;')}" alt="" loading="lazy" decoding="async">`:''}</span>`}
 function fill(el){const n=el.dataset.ph,p=pick(n);if(!p){el.classList.add('none');return}el.classList.remove('wait','none');const src=el.classList.contains('big')?big(p.u):p.u;let img=el.querySelector('img');if(img&&img.getAttribute('src')===src)return;if(!img){img=document.createElement('img');img.alt='';img.decoding='async';el.appendChild(img)}img.classList.remove('ok');img.src=src}
 const io='IntersectionObserver' in window?new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);const n=e.target.dataset.ph;load(n).then(()=>document.querySelectorAll('.mr-ph[data-ph]').forEach(el=>{if(el.dataset.ph===n)fill(el)}))}),{rootMargin:'1200px 0px'}):null;
 function watch(root){root.querySelectorAll('.mr-ph.wait').forEach(el=>io?io.observe(el):load(el.dataset.ph).then(()=>fill(el)))}
 document.addEventListener('load',e=>{const t=e.target;if(t.tagName==='IMG'&&t.parentElement&&t.parentElement.classList.contains('mr-ph'))t.classList.add('ok')},true);
 document.addEventListener('error',e=>{const t=e.target;if(t.tagName!=='IMG'||!t.parentElement||!t.parentElement.classList.contains('mr-ph'))return;const n=t.parentElement.dataset.ph,c=mem[n];
  if(mine[n]||!c)return t.remove();const bad=c.l.findIndex(x=>t.src===x.u||t.src===big(x.u));if(bad>=0){c.l.splice(bad,1);wr(KEY,mem)}if(c.l.length)fill(t.parentElement);else{t.parentElement.classList.add('none');t.remove()}},true);
 return {html,watch,pick,load,fill,warm,prefetch:()=>wiki(),ai:n=>!!(mem[n]&&mem[n].ai),
  async gen(d){const r=await fetch('/api/ai/image?'+new URLSearchParams({dish:d.name,ing:d.ing.slice(0,10).join('|'),v:'1'}));const j=await r.json().catch(()=>({}));if(!r.ok||!j.image)throw new Error(j.error||'Génération indisponible');
   const blob=await (await fetch(j.image)).blob();return this.setMine(d.name,blob)},
  next(n){off[n]=(off[n]||0)+1;if(mine[n]){delete mine[n];wr(MINE,mine)}wr(OFF,off)},
  mine:n=>!!mine[n],
  reset(n){delete mine[n];wr(MINE,mine)},
  async setMine(n,file){const url=URL.createObjectURL(file);try{const img=await new Promise((ok,ko)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=ko;i.src=url});
   const M=720,s=Math.min(1,M/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*s);c.height=Math.round(img.height*s);c.getContext('2d').drawImage(img,0,0,c.width,c.height);
   mine[n]=c.toDataURL('image/jpeg',.8);if(!wr(MINE,mine)){delete mine[n];return false}return true}finally{URL.revokeObjectURL(url)}}}
})();
window.NutrixMarocPhotos=MR_PH;
// précharge la liste Wikipedia (3 requêtes) quand le téléphone est libre, pour que le menu marocain s'affiche direct
try{setTimeout(()=>(window.requestIdleCallback||(f=>f()))(()=>MR_PH.prefetch&&MR_PH.prefetch()),2500)}catch{}
try{if(/[?&]warm=1\b/.test(location.search)){const bar=document.createElement('div');bar.style.cssText='position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;background:#0a3d2f;color:#fff;padding:14px 16px;border-radius:14px;font:600 14px/1.4 system-ui;box-shadow:0 8px 30px rgba(0,0,0,.3)';bar.textContent='Préparation des photos… ne ferme pas cette page';
 const go=()=>{document.body.appendChild(bar);setTimeout(()=>MR_PH.warm((d,t,g,f)=>{bar.textContent=d<t?'Photos : '+d+' / '+t+' plats (images IA : '+g+(f?', erreurs : '+f:'')+') — ne ferme pas la page':'✅ Terminé : '+t+' plats prêts'+(f?' ('+f+' erreurs : relance cette page)':'')+'. Images IA créées : '+g}).catch(e=>{bar.textContent='Erreur : '+e.message}),3000)};
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',go):go()}}catch{}

/* ---------- Badges façon fiche produit ---------- */
const mrNS=s=>s>=80?'A':s>=65?'B':s>=50?'C':s>=35?'D':'E';
const mrNova=d=>/^(Dattes|Amandes|Figues|Grenade|Orange|Jus d’orange|Salade|Zaalouk|Taktouka|Sardines)/.test(d.name)?1:/^(Merguez|Sandwich)/.test(d.name)?4:/^(Khobz|Msemen|Mlaoui|Rghaif|Harcha|Batbout|Baghrir|Sfenj|Chebakia|Cornes|Briouate|Sellou|Amlou|Ghoriba|Zlabia|Mhancha|Fekkas|Pastilla au lait|Olives|Fromage|Lben|Thé|Bsissa)/.test(d.name)?3:2;
const mrEco=d=>{const s=(d.name+' '+d.ing.join(' ')).toLowerCase();return /agneau|bœuf|boeuf|méchoui|mechoui|tanjia|lham|mrouzia|hergma|merguez|kefta|viande|khlii/.test(s)?(/légume|legume|courge|carotte/.test(s)?'D':'E'):/poulet|djej|djaj|foie|dinde/.test(s)?'C':/poisson|sardine|crevette|hout/.test(s)?'B':/beurre|smen|lait|fromage|jben|lben|oeuf|œuf|miel|sucre|amande/.test(s)?'B':'A'};
const mrBadges=d=>{const n=mrNS(d.score),v=mrNova(d),e=mrEco(d);return `<span class="mr-bdg"><span class="mr-ns" title="Nutri-Score ${n} (estimé)"><small>NUTRI-SCORE</small><span>${'ABCDE'.split('').map(x=>`<i class="n${x}${x===n?' on':''}">${x}</i>`).join('')}</span></span><span class="mr-nova v${v}" title="NOVA ${v} (estimé)"><small>NOVA</small><b>${v}</b></span><span class="mr-eco e${e}" title="Impact environnemental ${e} (estimé)"><b>${e}</b><span>green<br>score</span></span></span>`};

/* ---------- Cuisine marocaine : section dédiée ---------- */
const MR_CATS=[['all','Tout'],['tajine','Tajines & plats'],['couscous','Couscous'],['soupe','Soupes'],['salade','Salades'],['grill','Grillades'],['petit','Petit-déj'],['douceur','Douceurs'],['fruit','Fruits & boissons']];
const mrCat=n=>/^(Pastilla|Mrouzia|Lham lhalou|Méchoui|Tanjia|Rfissa)/.test(n)?'tajine':/^(Brochettes|Merguez|Sardines|Poulet rôti|Foie|Boulettes|Sandwich)/.test(n)?'grill':/^(Tajine|Djej|Hergma|Poulet)/.test(n)?'tajine':/^(Couscous|Seffa|Berkoukes)/.test(n)?'couscous':/^(Harira|Soupe|Chorba|Bissara|Lentilles|Loubia)/.test(n)?'soupe':/^(Salade|Zaalouk|Taktouka)/.test(n)?'salade':/^(Msemen|Baghrir|Harcha|Batbout|Khobz|Œufs|Mlaoui|Rghaif|Lben|Fromage|Bsissa)/.test(n)?'petit':/^(Chebakia|Cornes|Briouate|Sellou|Amlou|Ghoriba|Zlabia|Mhancha|Fekkas|Sfenj)/.test(n)?'douceur':'fruit';
function setupMaroc(){
 const root=$('#mr-root');if(!root||root.dataset.ready)return;const V=window.NutrixMaroc;if(!V){setTimeout(setupMaroc,500);return}
 root.dataset.ready='1';
 const A=ar,L=(f,a)=>A()?a:f,esc=V.esc;
 const st={cat:'all',q:'',dish:null,recs:{},busy:false,err:'',open:0,done:{},dietOpen:false,lim:24};
 const DIETS=['Végétarien','Halal','Sans gluten','Sans lactose','Sans sucre ajouté','Sans arachides','Sans œufs','Sans fruits à coque','Sans poisson','Diabète','Hypertension'];
 const prefs=()=>{try{return JSON.parse(localStorage.getItem('nutrix-prefs')||'[]')}catch{return []}};
 const NAMES={b:['Petit-déjeuner','الفطور'],l:['Déjeuner','الغدا'],d:['Dîner','العشا']};
 const nameP=d=>`${esc(d.name)} – <span>${esc(d.portion)}</span>`;
 function heroHtml(){return `<header class="mr-hero"><div class="mr-zel"></div><i class="mr-arch"></i>
  <div class="mr-hero-t"><span class="mr-kick">المطبخ المغربي</span><h2>${L('Cuisine<br>marocaine','المطبخ<br>المغربي')}</h2><p>${L('Tes plats préférés, en version healthy et adaptés à ton régime.','أطباقك المفضلة، بنسخة صحية ومناسبة للريجيم ديالك.')}</p>
  <button type="button" class="mr-refresh" data-refresh><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/></svg>${L('Nouveau menu','منيو جديد')}</button></div>
  <div class="mr-hero-b"><div class="mr-say">${L('Marhba ! Chno ntiybo lyoum ?','مرحبا! شنو نطيبو اليوم؟')}</div>${siNutrix()}</div></header>`}
 function dietHtml(){const on=prefs();return `<section class="mr-diet ${st.dietOpen?'open':''}"><button type="button" class="mr-diet-h" data-dietx><b>${L('Mon régime','الريجيم ديالي')}</b><div>${on.length?on.slice(0,3).map(x=>`<em>${esc(x)}</em>`).join('')+(on.length>3?`<em>+${on.length-3}</em>`:''):`<small>${L('Aucun — touche pour choisir','ما كاين والو — ضغط باش تختار')}</small>`}</div><i></i></button><div class="mr-diet-b">${DIETS.map(k=>`<button type="button" class="${on.includes(k)?'on':''}" data-d="${esc(k)}">${esc(k)}</button>`).join('')}</div></section>`}
 function menuHtml(){const P=prefs(),picks=['b','l','d'].map(s=>[s,V.pick(s,P)]),tot=picks.reduce((a,[,d])=>a+(d?d.kcal:0),0);
  return `<section class="mr-sec"><div class="mr-sec-h"><h3>${L('Menu du jour','منيو اليوم')}</h3><span class="mr-tot">${tot} kcal</span></div><div class="mr-menu">${picks.map(([s,d],i)=>d?`<button type="button" class="mr-card mr-mc" data-dish="${esc(d.name)}" style="--i:${i}">${MR_PH.html(d)}<em class="mr-slot">${L(NAMES[s][0],NAMES[s][1])}</em><span class="mr-cb"><strong>${nameP(d)}</strong><small>${d.kcal} kcal · P ${d.p} g · G ${d.c} g · L ${d.f} g</small>${mrBadges(d)}<span class="mr-go">${L('Version healthy','نسخة صحية')} <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></span></button>`:`<div class="mr-card mr-mc empty"><em class="mr-slot">${L(NAMES[s][0],NAMES[s][1])}</em><small>${L('Aucun plat compatible avec ton régime','ما كاين حتى طبق مناسب')}</small></div>`).join('')}</div></section>`}
 function gridHtml(){const P=prefs();let list=V.MAR.filter(d=>st.cat==='all'||mrCat(d.name)===st.cat);
  if(st.q){const q=V.norm(st.q);list=list.filter(d=>d.keys.some(k=>k.includes(q))||V.norm(d.name).includes(q))}
  const shown=list.slice(0,st.lim);
  return `<section class="mr-sec"><div class="mr-sec-h"><h3>${L('Tous les plats','كل الأطباق')}</h3><span class="mr-tot soft">${list.length}</span></div>
  <div class="mr-search"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.500"/><path d="m16 16 4.500 4.500"/></svg><input type="search" id="mr-q" placeholder="${L('Chercher : harira, tajine, msemen…','قلب: حريرة، طاجين، مسمن…')}" value="${esc(st.q)}" autocomplete="off"></div>
  <div class="mr-cats">${MR_CATS.map(([k,n])=>`<button type="button" class="${st.cat===k?'on':''}" data-cat="${k}">${n}</button>`).join('')}</div>
  <div class="mr-grid">${shown.map(d=>{const ok=V.allowed(d,P);return `<button type="button" class="mr-card mr-dc ${ok?'':'no'}" data-dish="${esc(d.name)}">${MR_PH.html(d)}${ok?'':`<em class="mr-warn">${L('Pas pour ton régime','ماشي لريجيمك')}</em>`}<span class="mr-cb"><strong>${nameP(d)}</strong><small>${d.kcal} kcal</small>${mrBadges(d)}</span></button>`}).join('')||`<p class="mr-empty">${L('Aucun plat trouvé.','ما لقينا والو.')}</p>`}</div>
  ${list.length>shown.length?`<button type="button" class="mr-more" data-more>${L('Voir plus de plats','شوف أطباق أخرى')} (${list.length-shown.length})</button>`:''}</section>`}
 function recHtml(r,i){const ings=r.ingredients||[],steps=r.steps||[],open=st.open===i,miss=ings.filter(x=>!x.have);const fav=V.favGet().some(f=>f.name===r.name);
  return `<article class="mr-rc ${open?'open':''}"><button type="button" class="mr-rc-h" data-ropen="${i}"><b>${esc(r.emoji||'🍛')}</b><div><strong>${esc(String(r.name||'').slice(0,50))}</strong><small>${esc(String(r.why||'').slice(0,70))}</small><div class="mr-meta"><span>⏱ ${Math.round(r.minutes||0)} min</span><span>${Math.round(r.kcal||0)} kcal</span>${(r.kcal_trad||0)>(r.kcal||0)+20?`<span class="g">−${Math.round(r.kcal_trad-r.kcal)} kcal</span>`:''}</div></div><i></i></button>
  ${open?`<div class="mr-rc-b">${Array.isArray(r.changes)&&r.changes.length?`<div class="mr-chg"><h5>${L('Ce qu’on a allégé','شنو خففنا')}${r.kcal_trad?` <small>${Math.round(r.kcal_trad)} → ${Math.round(r.kcal)} kcal</small>`:''}</h5><ul>${r.changes.slice(0,4).map(c=>`<li>${esc(String(c).slice(0,130))}</li>`).join('')}</ul></div>`:''}
   <div class="mr-mac"><span><b>${Math.round(r.p||0)} g</b>${L('Protéines','بروتين')}</span><span><b>${Math.round(r.c||0)} g</b>${L('Glucides','كربوهيدرات')}</span><span><b>${Math.round(r.f||0)} g</b>${L('Lipides','دهون')}</span><span><b>${Math.round(r.prep||0)}′+${Math.round(r.cook||0)}′</b>${L('Prépa + cuisson','تحضير + طيب')}</span></div>
   <h5>${L('Ingrédients','المكونات')}</h5><ul class="mr-ing">${ings.map(x=>`<li class="${x.have?'':'miss'}"><span>${esc(String(x.name||'').slice(0,40))}</span><em>${esc(String(x.qty||'').slice(0,16))}</em></li>`).join('')}</ul>
   <h5>${L('Préparation','التحضير')}</h5><ol class="mr-steps">${steps.map((s,k)=>`<li class="${st.done[i+'-'+k]?'done':''}"><button type="button" class="mr-chk" data-sd="${i}-${k}" aria-label="ok"></button><div><p>${esc(String(s.t||'').slice(0,260))}</p>${s.min>0?`<button type="button" class="mr-timer" data-timer="mr-${i}-${k}" data-min="${Math.round(s.min)}">⏱ <span>${Math.round(s.min)}:00</span></button>`:''}</div></li>`).join('')}</ol>
   ${r.tip?`<p class="mr-tip">${esc(String(r.tip).slice(0,120))}</p>`:''}
   <div class="mr-acts"><button type="button" class="pri" data-cook="${i}">${L('Mode cuisine','وضع الطبخ')}</button>${miss.length?`<button type="button" data-shop="${i}">🛒 ${miss.length}</button>`:''}<button type="button" data-jr="${i}" ${r.added?'disabled':''}>${r.added?'✓':'＋'} ${L('Journal','اليومية')}</button><button type="button" data-fav="${i}" class="${fav?'on':''}" aria-label="Favori">${fav?'♥':'♡'}</button></div></div>`:''}</article>`}
 function sheetHtml(){const d=V.MAR.find(x=>x.name===st.dish);if(!d)return '';const P=prefs(),ok=V.allowed(d,P),f=V.flags(d),recs=st.recs[d.name]||[],p=MR_PH.pick(d.name),own=MR_PH.mine(d.name);
  const tags=[f.gluten&&'Gluten',f.lait&&'Lactose',f.oeuf&&'Œufs',f.noix&&'Fruits à coque',f.poisson&&'Poisson',f.sucre&&'Sucre élevé',f.sale&&'Salé'].filter(Boolean);
  return `<div class="mr-sheet-bg" data-close></div><div class="mr-sheet" role="dialog" aria-modal="true" aria-label="${esc(d.name)}"><button type="button" class="mr-x" data-close aria-label="Fermer">✕</button>
   <div class="mr-sh-ph">${MR_PH.html(d,'big')}<div class="mr-ph-tools"><button type="button" data-pnext title="${L('Autre photo','تصويرة أخرى')}"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 11a8 8 0 1 0-2.300 5.700M20 4v7h-7"/></svg>${L('Autre photo','أخرى')}</button><button type="button" data-pmine><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.500"/></svg>${L('Ma photo','تصويرتي')}</button><button type="button" data-pgen ${st.gen?'disabled':''}>${st.gen?'<span class="mr-spin"></span>':'<span>✨</span>'}${L('Photo IA','تصويرة IA')}</button>${own?`<button type="button" data-preset>${L('Auto','أوطو')}</button>`:''}</div><input type="file" accept="image/*" id="mr-file" hidden>
   ${p&&!p.mine&&p.f?`<a class="mr-credit" href="${esc(p.f)}" target="_blank" rel="noopener">${p.a?esc(p.a)+' · ':''}${esc(p.l||'Wikimedia Commons')}</a>`:own?`<span class="mr-credit">${L('Ta photo','تصويرتك')}</span>`:''}</div>
   <div class="mr-sh-top"><small>${esc(d.portion)} · ${d.kcal} kcal</small><h3>${esc(d.name)}</h3>${mrBadges(d)}</div>
   ${ok?'':`<p class="mr-alert">${L('Ce plat ne correspond pas à ton régime — la version healthy en tient compte.','هاد الطبق ماشي مناسب لريجيمك — النسخة الصحية كتحترمو.')}</p>`}
   <div class="mr-mac big"><span><b>${d.kcal}</b>kcal</span><span><b>${d.p} g</b>${L('Protéines','بروتين')}</span><span><b>${d.c} g</b>${L('Glucides','كربوهيدرات')}</span><span><b>${d.f} g</b>${L('Lipides','دهون')}</span></div>
   <div class="mr-tags">${d.ing.map(x=>`<em>${esc(x)}</em>`).join('')}${tags.map(x=>`<em class="w">${x}</em>`).join('')}</div>
   <p class="mr-tip">${esc(d.tip)}</p>
   <button type="button" class="mr-cta" data-heal ${st.busy?'disabled':''}>${st.busy?`<span class="mr-spin"></span>${L('Le chef prépare…','الشاف كيحضر…')}`:`${L('Version healthy (IA)','النسخة الصحية (IA)')}`}</button>
   ${st.err?`<p class="mr-err">${esc(st.err)} <button type="button" data-heal>${L('Réessayer','عاود')}</button></p>`:''}
   ${recs.length?`<div class="mr-recs">${recs.map(recHtml).join('')}</div>`:''}
   <button type="button" class="mr-add" data-addtrad>＋ ${L('Ajouter la version traditionnelle au journal','زيد النسخة التقليدية لليومية')}</button>
   <p class="mr-note">${L('Scores estimés à partir de la recette traditionnelle.','السكورات تقديرية على حساب الوصفة التقليدية.')}</p></div>`}
 const profile=V.profile;
 async function heal(){const d=V.MAR.find(x=>x.name===st.dish);if(!d||st.busy)return;st.busy=true;st.err='';paint();
  const body={tool:'chef',cuisine:'maroc',ref:{name:d.name,portion:d.portion,kcal:d.kcal,ing:d.ing},prefs:prefs(),profile:profile(),servings:2,goal:'equilibre',language:A()?'ary':'fr'};
  try{const j=await V.post('/api/ai/vision',body);const rec=(j.result&&j.result.recipes||[]).filter(r=>r&&r.name&&Array.isArray(r.steps)&&r.steps.length);if(!rec.length)throw new Error(L('Pas de recette reçue. Réessaie.','ما جات حتى وصفة. عاود.'));st.recs[d.name]=rec.slice(0,3);st.open=0;st.done={}}
  catch(e){st.err=e.message||'Erreur'}st.busy=false;paint()}
 function paint(){const keepQ=document.activeElement&&document.activeElement.id==='mr-q',pos=keepQ?document.activeElement.selectionStart:0;
  const sc=root.querySelector('.mr-sheet')?.scrollTop||0;
  root.innerHTML=`<div class="mr">${heroHtml()}${dietHtml()}${menuHtml()}${gridHtml()}</div>${st.dish?`<div class="mr-layer">${sheetHtml()}</div>`:''}`;
  if(st.dish){document.body.classList.add('mr-lock');const s=root.querySelector('.mr-sheet');if(s)s.scrollTop=sc}else document.body.classList.remove('mr-lock');
  if(keepQ){const q=root.querySelector('#mr-q');q&&(q.focus(),q.setSelectionRange(pos,pos))}MR_PH.watch(root);V.tick()}
 root.addEventListener('input',e=>{if(e.target.id==='mr-q'){st.q=e.target.value;st.lim=24;paint()}});
 root.addEventListener('change',async e=>{if(e.target.id!=='mr-file'||!st.dish)return;const f=e.target.files&&e.target.files[0];if(!f)return;
  const ok=await MR_PH.setMine(st.dish,f).catch(()=>false);if(!ok)toast(L('Photo trop lourde ou illisible.','التصويرة تقيلة بزاف.'));paint()});
 root.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;
  if(t.dataset.refresh!==undefined){['b','l','d'].forEach(s=>V.MENU.shift[s]++);paint()}
  else if(t.dataset.dietx!==undefined){st.dietOpen=!st.dietOpen;paint()}
  else if(t.dataset.d){const a=prefs(),k=t.dataset.d,i=a.indexOf(k);i>=0?a.splice(i,1):a.push(k);try{localStorage.setItem('nutrix-prefs',JSON.stringify(a))}catch{}paint()}
  else if(t.dataset.cat){st.cat=t.dataset.cat;st.lim=24;paint()}
  else if(t.dataset.more!==undefined){st.lim+=24;paint()}
  else if(t.dataset.dish){st.dish=t.dataset.dish;st.err='';st.open=0;paint()}
  else if(t.dataset.close!==undefined){st.dish=null;paint()}
  else if(t.dataset.pnext!==undefined){MR_PH.next(st.dish);MR_PH.load(st.dish).then(paint)}
  else if(t.dataset.pmine!==undefined){root.querySelector('#mr-file')?.click()}
  else if(t.dataset.pgen!==undefined){const d=V.MAR.find(x=>x.name===st.dish);if(!d||st.gen)return;st.gen=true;paint();MR_PH.gen(d).then(ok=>{if(!ok)toast(L('Photo trop lourde.','التصويرة تقيلة.'))},e=>toast(e.message||'Erreur')).finally(()=>{st.gen=false;paint()})}
  else if(t.dataset.preset!==undefined){MR_PH.reset(st.dish);MR_PH.load(st.dish).then(paint)}
  else if(t.dataset.heal!==undefined)heal();
  else if(t.dataset.ropen){const i=Number(t.dataset.ropen);st.open=st.open===i?-1:i;paint()}
  else if(t.dataset.sd){st.done[t.dataset.sd]=!st.done[t.dataset.sd];t.closest('li').classList.toggle('done',!!st.done[t.dataset.sd])}
  else if(t.dataset.timer)V.timer(t.dataset.timer,Number(t.dataset.min));
  else if(t.dataset.cook){V.cook((st.recs[st.dish]||[])[Number(t.dataset.cook)])}
  else if(t.dataset.shop){const r=(st.recs[st.dish]||[])[Number(t.dataset.shop)],l=V.shopGet();(r.ingredients||[]).filter(x=>!x.have).forEach(x=>{const n=String(x.name).slice(0,30);if(!l.some(y=>y.t.toLowerCase()===n.toLowerCase()))l.push({t:n,done:false})});V.shopSet(l);t.disabled=true;t.textContent='✓'}
  else if(t.dataset.jr){const r=(st.recs[st.dish]||[])[Number(t.dataset.jr)],o=V.journal({kcal:r.kcal,p:r.p,c:r.c,f:r.f});r.added=!!o.ok;paint()}
  else if(t.dataset.fav){const r=(st.recs[st.dish]||[])[Number(t.dataset.fav)],f=V.favGet(),k=f.findIndex(x=>x.name===r.name);k>=0?f.splice(k,1):f.unshift({...r,img:undefined,added:undefined});V.favSet(f);paint()}
  else if(t.dataset.addtrad!==undefined){const d=V.MAR.find(x=>x.name===st.dish);if(d){const o=V.journal({kcal:d.kcal,p:d.p,c:d.c,f:d.f});t.textContent=o.ok?'✓ '+L('Ajouté','تزاد'):'!'}}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&st.dish){st.dish=null;paint()}});
 paint();
 // icône dans la barre (PC) et le menu « Plus »
 const navT=document.querySelector('.tab[data-tab="maroc"] svg');if(navT)navT.outerHTML=MR_ICON(21,1.8);
 const plusFix=()=>{const b=document.querySelector('.nx-more-sheet [data-go="maroc"]');if(b&&!b.querySelector('.mr-ico')){if(b.firstChild&&b.firstChild.nodeType===3)b.firstChild.remove();b.insertAdjacentHTML('afterbegin',MR_TILE(40))}};plusFix();setTimeout(plusFix,800);
 // entrée depuis l'accueil
 const home=$('#page-home');if(home&&!$('.mr-promo',home)){const p=document.createElement('button');p.type='button';p.className='mr-promo';p.innerHTML='<span class="mr-pico">'+MR_ICON(24,2)+'</span><span class="mr-promo-t"><small>'+L('NOUVEAU','جديد')+'</small><b>'+L('Cuisine marocaine healthy','المطبخ المغربي الصحي')+'</b><em>'+L('85 plats · adaptés à ton régime · recettes IA','85 طبق · مناسبة للريجيم ديالك · وصفات IA')+'</em></span><i>›</i>';p.onclick=()=>{try{window.showTab('maroc')}catch{document.querySelector('.tab[data-tab="maroc"]')?.click()}window.scrollTo({top:0})};const anchor=$('.nt-tour',home)||home.firstElementChild;anchor?anchor.insertAdjacentElement('afterend',p):home.prepend(p)}
}

function init(){fixClose();setupMaroc();setupScanner();setupCarousel();setupTour();setupScanHero();setTimeout(()=>{setupMaroc();setupScanner();setupCarousel();setupTour();setupScanHero();},700);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
}catch(e){console.error("[Nutrix] nutrix-touch.js",e)}

/* ===== nutrix-additives.js ===== */
try{
/* NUTRIX additifs — fiche détaillée façon Yuka (échelle de risque, fonction, pourquoi il est utilisé)
   Lit les codes E déjà affichés dans la fiche produit et ajoute un bloc "Additifs".
   Niveaux indicatifs (EFSA / CIRC / réglementation UE) — ce n'est pas un avis médical. */
(function(){
'use strict';
/* risque : 0 sans risque · 1 faible · 2 modéré · 3 élevé · (absent) non évalué */
const RAW=`
E100|Curcumine|Colorant|0|Colorant jaune extrait du curcuma.
E101|Riboflavine (vitamine B2)|Colorant|0|Vitamine B2, sans risque connu.
E102|Tartrazine|Colorant|2|Peut affecter l’attention et l’activité de certains enfants : mention d’avertissement obligatoire dans l’UE.
E104|Jaune de quinoléine|Colorant|2|Même mise en garde que la tartrazine pour les enfants (étude de Southampton).
E110|Jaune orangé S|Colorant|2|Même mise en garde que la tartrazine pour les enfants (étude de Southampton).
E120|Carmin (cochenille)|Colorant|1|Colorant d’origine animale (insecte) ; des allergies sont possibles.
E122|Azorubine|Colorant|2|Mise en garde « activité et attention des enfants » dans l’UE.
E123|Amarante|Colorant|3|Colorant de synthèse très restreint en Europe, interdit dans plusieurs pays.
E124|Ponceau 4R|Colorant|2|Mise en garde « activité et attention des enfants » dans l’UE.
E127|Érythrosine|Colorant|3|Peut perturber la thyroïde à forte dose ; usage très limité.
E129|Rouge allura AC|Colorant|2|Mise en garde « activité et attention des enfants » dans l’UE.
E131|Bleu patenté V|Colorant|2|Colorant de synthèse, allergies rares.
E132|Indigotine|Colorant|1|Colorant de synthèse, bien toléré à dose habituelle.
E133|Bleu brillant FCF|Colorant|1|Colorant de synthèse, peu absorbé par l’organisme.
E140|Chlorophylles|Colorant|0|Pigment vert naturel des plantes.
E141|Complexes cuivre-chlorophylles|Colorant|1|Dérivé de la chlorophylle, sans risque notable.
E150a|Caramel ordinaire|Colorant|0|Caramel classique (sucre chauffé).
E150b|Caramel de sulfite caustique|Colorant|1|Colorant brun, peu de données de risque.
E150c|Caramel ammoniacal|Colorant|1|Colorant brun obtenu avec de l’ammoniac.
E150d|Caramel au sulfite d’ammonium|Colorant|2|Peut contenir du 4-MEI, classé « peut-être cancérogène » (CIRC) à faible teneur. Très courant dans les sodas.
E160a|Carotènes|Colorant|0|Pigment orange naturel (carotte).
E160b|Rocou (annatto)|Colorant|1|Colorant naturel ; des réactions allergiques sont possibles.
E160c|Extrait de paprika|Colorant|0|Colorant naturel rouge-orangé.
E160d|Lycopène|Colorant|0|Pigment rouge de la tomate.
E160e|Bêta-apo-8’-caroténal|Colorant|0|Dérivé de caroténoïde.
E161b|Lutéine|Colorant|0|Pigment jaune naturel, bon pour la vue.
E162|Rouge de betterave|Colorant|0|Colorant naturel de la betterave.
E163|Anthocyanes|Colorant|0|Pigments naturels des fruits rouges.
E170|Carbonate de calcium|Colorant|0|Craie alimentaire, aussi source de calcium.
E171|Dioxyde de titane|Colorant|3|Interdit comme additif alimentaire dans l’UE depuis 2022 : un risque génotoxique ne peut être exclu.
E172|Oxydes de fer|Colorant|1|Pigments minéraux, faiblement absorbés.
E173|Aluminium|Colorant|2|Métal : l’exposition à l’aluminium est à limiter. Réservé à certains décors.
E200|Acide sorbique|Conservateur|1|Bien toléré à dose habituelle, irritations rares.
E202|Sorbate de potassium|Conservateur|1|Bien toléré à dose habituelle.
E203|Sorbate de calcium|Conservateur|1|Bien toléré à dose habituelle.
E210|Acide benzoïque|Conservateur|2|Peut former du benzène en présence de vitamine C ; réactions chez les personnes sensibles.
E211|Benzoate de sodium|Conservateur|2|Mise en garde « enfants » avec certains colorants ; peut former du benzène avec la vitamine C.
E212|Benzoate de potassium|Conservateur|2|Mêmes réserves que le benzoate de sodium.
E213|Benzoate de calcium|Conservateur|2|Mêmes réserves que le benzoate de sodium.
E220|Dioxyde de soufre|Conservateur|2|Allergène à déclarer ; peut déclencher de l’asthme chez les personnes sensibles.
E221|Sulfite de sodium|Conservateur|2|Sulfite : allergène, asthme possible.
E222|Bisulfite de sodium|Conservateur|2|Sulfite : allergène, asthme possible.
E223|Métabisulfite de sodium|Conservateur|2|Sulfite : allergène, asthme possible.
E224|Métabisulfite de potassium|Conservateur|2|Sulfite : allergène, asthme possible.
E226|Sulfite de calcium|Conservateur|2|Sulfite : allergène, asthme possible.
E227|Bisulfite de calcium|Conservateur|2|Sulfite : allergène, asthme possible.
E228|Bisulfite de potassium|Conservateur|2|Sulfite : allergène, asthme possible.
E234|Nisine|Conservateur|0|Substance produite par des bactéries lactiques.
E235|Natamycine|Conservateur|1|Antifongique pour croûtes de fromage et saucissons.
E242|Dicarbonate de diméthyle|Conservateur|1|Utilisé dans certaines boissons, se décompose rapidement.
E249|Nitrite de potassium|Conservateur|3|Avec la viande transformée, les nitrites sont associés à un risque accru de cancer colorectal (CIRC).
E250|Nitrite de sodium|Conservateur|3|Avec la viande transformée, les nitrites sont associés à un risque accru de cancer colorectal (CIRC).
E251|Nitrate de sodium|Conservateur|2|Se transforme en partie en nitrites dans l’organisme.
E252|Nitrate de potassium|Conservateur|2|Se transforme en partie en nitrites dans l’organisme.
E260|Acide acétique|Acidifiant|0|Le vinaigre.
E261|Acétate de potassium|Conservateur|0|Sel du vinaigre.
E262|Acétates de sodium|Conservateur|0|Sel du vinaigre (goût vinaigre).
E263|Acétate de calcium|Conservateur|0|Sel du vinaigre.
E270|Acide lactique|Acidifiant|0|Produit naturellement par la fermentation (yaourt).
E280|Acide propionique|Conservateur|1|Anti-moisissure du pain ; peut gêner certaines personnes sensibles.
E281|Propionate de sodium|Conservateur|1|Anti-moisissure du pain.
E282|Propionate de calcium|Conservateur|1|Anti-moisissure du pain ; maux de tête rapportés chez des personnes sensibles.
E283|Propionate de potassium|Conservateur|1|Anti-moisissure du pain.
E290|Dioxyde de carbone|Gaz|0|Le gaz des boissons gazeuses.
E296|Acide malique|Acidifiant|0|Acide naturel de la pomme.
E297|Acide fumarique|Acidifiant|0|Acide naturel, goût acidulé.
E300|Acide ascorbique (vitamine C)|Antioxydant|0|La vitamine C.
E301|Ascorbate de sodium|Antioxydant|0|Forme de vitamine C.
E302|Ascorbate de calcium|Antioxydant|0|Forme de vitamine C.
E304|Palmitate d’ascorbyle|Antioxydant|0|Vitamine C liposoluble.
E306|Extraits riches en tocophérols|Antioxydant|0|Vitamine E naturelle.
E307|Alpha-tocophérol|Antioxydant|0|Vitamine E.
E308|Gamma-tocophérol|Antioxydant|0|Vitamine E.
E309|Delta-tocophérol|Antioxydant|0|Vitamine E.
E310|Gallate de propyle|Antioxydant|2|Antioxydant de synthèse : peu de données, irritations possibles.
E311|Gallate d’octyle|Antioxydant|2|Antioxydant de synthèse, allergies de contact possibles.
E312|Gallate de dodécyle|Antioxydant|2|Antioxydant de synthèse, allergies de contact possibles.
E315|Acide érythorbique|Antioxydant|0|Cousin de la vitamine C.
E316|Érythorbate de sodium|Antioxydant|0|Cousin de la vitamine C.
E319|TBHQ|Antioxydant|2|Antioxydant de synthèse, effets possibles à forte dose.
E320|BHA|Antioxydant|3|Classé « peut-être cancérogène » (CIRC 2B) et perturbateur endocrinien suspecté.
E321|BHT|Antioxydant|2|Antioxydant de synthèse, effets possibles à forte dose.
E322|Lécithines|Émulsifiant|0|Souvent issue du soja ou du tournesol (soja = allergène).
E325|Lactate de sodium|Régulateur d’acidité|0|Sel de l’acide lactique.
E326|Lactate de potassium|Régulateur d’acidité|0|Sel de l’acide lactique.
E327|Lactate de calcium|Régulateur d’acidité|0|Sel de l’acide lactique.
E330|Acide citrique|Acidifiant|0|Acide naturel du citron.
E331|Citrates de sodium|Régulateur d’acidité|0|Sels de l’acide citrique.
E332|Citrates de potassium|Régulateur d’acidité|0|Sels de l’acide citrique.
E333|Citrates de calcium|Régulateur d’acidité|0|Sels de l’acide citrique.
E334|Acide tartrique|Acidifiant|0|Acide naturel du raisin.
E335|Tartrates de sodium|Régulateur d’acidité|0|Sels de l’acide tartrique.
E336|Tartrates de potassium|Régulateur d’acidité|0|Crème de tartre.
E337|Tartrate double de sodium et potassium|Régulateur d’acidité|0|Sel de l’acide tartrique.
E338|Acide phosphorique|Acidifiant|2|Un excès de phosphates est lié à des risques pour les reins et les os. Présent dans les colas.
E339|Phosphates de sodium|Régulateur d’acidité|2|Un excès de phosphates est lié à des risques pour les reins et les os.
E340|Phosphates de potassium|Régulateur d’acidité|2|Un excès de phosphates est lié à des risques pour les reins et les os.
E341|Phosphates de calcium|Anti-agglomérant|2|Un excès de phosphates est lié à des risques pour les reins et les os.
E343|Phosphates de magnésium|Anti-agglomérant|1|Sel minéral, peu de données de risque.
E350|Malates de sodium|Régulateur d’acidité|0|Sel de l’acide malique.
E355|Acide adipique|Acidifiant|0|Acidifiant, bien toléré.
E375|Acide nicotinique (vitamine B3)|Vitamine|0|Vitamine B3.
E380|Citrate d’ammonium|Régulateur d’acidité|0|Sel de l’acide citrique.
E385|EDTA calcium disodique|Séquestrant|1|Capte les métaux pour éviter l’oxydation ; mal absorbé.
E400|Acide alginique|Épaississant|0|Extrait d’algues brunes.
E401|Alginate de sodium|Épaississant|0|Extrait d’algues brunes.
E402|Alginate de potassium|Épaississant|0|Extrait d’algues brunes.
E403|Alginate d’ammonium|Épaississant|0|Extrait d’algues brunes.
E404|Alginate de calcium|Épaississant|0|Extrait d’algues brunes.
E405|Alginate de propane-1,2-diol|Épaississant|1|Dérivé de l’alginate, tolérance correcte.
E406|Agar-agar|Gélifiant|0|Extrait d’algues rouges.
E407|Carraghénanes|Épaississant|2|Suspectés de favoriser l’inflammation intestinale ; données encore discutées.
E407a|Algues Eucheuma transformées|Épaississant|2|Proche des carraghénanes, mêmes réserves.
E410|Farine de graines de caroube|Épaississant|0|Extrait de graines de caroubier.
E412|Gomme de guar|Épaississant|0|Fibre extraite de graines de guar.
E413|Gomme adragante|Épaississant|0|Gomme végétale, allergies rares.
E414|Gomme arabique|Épaississant|0|Sève d’acacia.
E415|Gomme xanthane|Épaississant|0|Fibre produite par fermentation ; gêne digestive possible à forte dose.
E416|Gomme karaya|Épaississant|0|Gomme végétale.
E417|Gomme tara|Épaississant|0|Gomme végétale.
E418|Gomme gellane|Épaississant|0|Fibre produite par fermentation.
E420|Sorbitol|Édulcorant|1|Polyol : effet laxatif possible dès quelques dizaines de grammes.
E421|Mannitol|Édulcorant|1|Polyol : effet laxatif possible.
E422|Glycérol|Humectant|0|Maintient l’humidité des produits.
E425|Konjac|Épaississant|0|Fibre de la racine de konjac.
E432|Polysorbate 20|Émulsifiant|1|Émulsifiant de synthèse.
E433|Polysorbate 80|Émulsifiant|2|Des études animales suggèrent un effet sur le microbiote et la barrière intestinale.
E434|Polysorbate 40|Émulsifiant|1|Émulsifiant de synthèse.
E435|Polysorbate 60|Émulsifiant|1|Émulsifiant de synthèse.
E436|Polysorbate 65|Émulsifiant|1|Émulsifiant de synthèse.
E440|Pectines|Gélifiant|0|Fibre des fruits (pomme, agrumes).
E442|Phosphatides d’ammonium|Émulsifiant|1|Utilisé dans le chocolat.
E450|Diphosphates|Poudre à lever|2|Un excès de phosphates est lié à des risques pour les reins et les os.
E451|Triphosphates|Stabilisant|2|Un excès de phosphates est lié à des risques pour les reins et les os.
E452|Polyphosphates|Stabilisant|2|Un excès de phosphates est lié à des risques pour les reins et les os.
E460|Cellulose|Épaississant|0|Fibre végétale.
E461|Méthylcellulose|Épaississant|1|Fibre modifiée, effet laxatif possible.
E463|Hydroxypropylcellulose|Épaississant|1|Fibre modifiée.
E464|Hydroxypropylméthylcellulose|Épaississant|1|Fibre modifiée.
E465|Éthylméthylcellulose|Épaississant|1|Fibre modifiée.
E466|Carboxyméthylcellulose|Épaississant|1|Fibre modifiée ; suspectée d’affecter la flore intestinale à forte dose (études animales).
E468|Carboxyméthylcellulose réticulée|Épaississant|1|Fibre modifiée.
E469|Carboxyméthylcellulose hydrolysée|Épaississant|1|Fibre modifiée.
E470a|Sels d’acides gras|Anti-agglomérant|1|Dérivés d’acides gras.
E470b|Stéarate de magnésium|Anti-agglomérant|1|Dérivé d’acide gras.
E471|Mono- et diglycérides d’acides gras|Émulsifiant|1|Très courant (pain, biscuits). Marqueur d’aliment ultra-transformé.
E472|Esters d’acides gras (E472a à f)|Émulsifiant|1|Émulsifiants courants, marqueurs d’ultra-transformation.
E473|Sucroesters d’acides gras|Émulsifiant|1|Émulsifiant de synthèse.
E474|Sucroglycérides|Émulsifiant|1|Émulsifiant de synthèse.
E475|Esters polyglycériques|Émulsifiant|1|Émulsifiant de synthèse.
E476|Polyricinoléate de polyglycérol (PGPR)|Émulsifiant|1|Utilisé dans le chocolat pour le fluidifier.
E477|Esters de propane-1,2-diol|Émulsifiant|1|Émulsifiant de synthèse.
E481|Stéaroyl-2-lactylate de sodium|Émulsifiant|1|Améliore la texture du pain.
E482|Stéaroyl-2-lactylate de calcium|Émulsifiant|1|Améliore la texture du pain.
E491|Monostéarate de sorbitane|Émulsifiant|1|Émulsifiant de synthèse.
E492|Tristéarate de sorbitane|Émulsifiant|1|Émulsifiant de synthèse.
E493|Monolaurate de sorbitane|Émulsifiant|1|Émulsifiant de synthèse.
E494|Monooléate de sorbitane|Émulsifiant|1|Émulsifiant de synthèse.
E495|Monopalmitate de sorbitane|Émulsifiant|1|Émulsifiant de synthèse.
E500|Carbonates de sodium|Poudre à lever|0|Bicarbonate : levure chimique.
E501|Carbonates de potassium|Régulateur d’acidité|0|Sel minéral.
E503|Carbonates d’ammonium|Poudre à lever|0|Utilisé dans les biscuits secs.
E504|Carbonates de magnésium|Anti-agglomérant|0|Sel minéral.
E507|Acide chlorhydrique|Acidifiant|0|Disparaît pendant la fabrication.
E508|Chlorure de potassium|Succédané de sel|0|Substitut de sel.
E509|Chlorure de calcium|Affermissant|0|Garde les légumes fermes.
E510|Chlorure d’ammonium|Régulateur d’acidité|0|Sel minéral.
E513|Acide sulfurique|Acidifiant|0|Disparaît pendant la fabrication.
E516|Sulfate de calcium|Affermissant|0|Plâtre alimentaire (tofu).
E524|Hydroxyde de sodium|Régulateur d’acidité|1|Soude : utilisée en traitement, très peu en fin de produit.
E551|Dioxyde de silicium|Anti-agglomérant|1|Évite les grumeaux ; peu absorbé.
E552|Silicate de calcium|Anti-agglomérant|1|Évite les grumeaux.
E553b|Talc|Agent d’enrobage|2|Le talc peut contenir des traces de fibres indésirables ; usage restreint.
E554|Silicate d’aluminium et de sodium|Anti-agglomérant|1|Contient de l’aluminium.
E555|Silicate d’aluminium et de potassium|Anti-agglomérant|1|Contient de l’aluminium.
E559|Silicate d’aluminium (kaolin)|Anti-agglomérant|1|Contient de l’aluminium.
E570|Acide stéarique|Anti-agglomérant|0|Acide gras naturel.
E572|Stéarate de magnésium|Anti-agglomérant|0|Sel d’acide gras.
E575|Glucono-delta-lactone|Acidifiant|0|Acidifiant doux.
E577|Gluconate de potassium|Régulateur d’acidité|0|Sel minéral.
E579|Gluconate ferreux|Colorant|0|Source de fer.
E585|Lactate ferreux|Colorant|1|Source de fer.
E620|Acide glutamique|Exhausteur de goût|1|Renforce le goût ; sensibilité possible chez certaines personnes.
E621|Glutamate monosodique (MSG)|Exhausteur de goût|2|Donne envie d’en manger davantage ; maux de tête ou palpitations chez certaines personnes sensibles.
E622|Glutamate monopotassique|Exhausteur de goût|1|Renforce le goût.
E623|Diglutamate de calcium|Exhausteur de goût|1|Renforce le goût.
E624|Glutamate monoammonique|Exhausteur de goût|1|Renforce le goût.
E625|Diglutamate de magnésium|Exhausteur de goût|1|Renforce le goût.
E627|Guanylate disodique|Exhausteur de goût|2|À éviter en cas de goutte ou d’asthme.
E631|Inosinate disodique|Exhausteur de goût|2|À éviter en cas de goutte ou d’asthme.
E635|Ribonucléotides disodiques|Exhausteur de goût|2|À éviter en cas de goutte ou d’asthme.
E900|Diméthylpolysiloxane|Anti-mousse|1|Silicone alimentaire, non absorbé.
E901|Cire d’abeille|Agent d’enrobage|0|Cire naturelle.
E902|Cire de candelilla|Agent d’enrobage|0|Cire végétale.
E903|Cire de carnauba|Agent d’enrobage|0|Cire végétale.
E904|Gomme-laque|Agent d’enrobage|1|Sécrétion d’insecte ; glaçage de bonbons et fruits.
E905|Cire microcristalline|Agent d’enrobage|1|Cire dérivée du pétrole.
E920|L-cystéine|Agent de traitement de la farine|1|Acide aminé ; parfois d’origine animale.
E941|Azote|Gaz|0|Gaz d’emballage.
E948|Oxygène|Gaz|0|Gaz d’emballage.
E950|Acésulfame K|Édulcorant|2|Édulcorant intense ; certaines études s’interrogent sur le microbiote.
E951|Aspartame|Édulcorant|2|Classé « peut-être cancérogène » (CIRC 2B, 2023) ; la dose journalière admissible a été maintenue par l’OMS.
E952|Cyclamates|Édulcorant|2|Édulcorant intense, interdit aux États-Unis.
E953|Isomalt|Édulcorant|1|Polyol : effet laxatif possible.
E954|Saccharine|Édulcorant|2|Édulcorant intense, très controversé.
E955|Sucralose|Édulcorant|2|Édulcorant intense ; des études s’interrogent sur le microbiote et la chauffe.
E957|Thaumatine|Édulcorant|0|Protéine sucrante naturelle.
E959|Néohespéridine DC|Édulcorant|0|Édulcorant dérivé d’agrumes.
E960|Glycosides de stéviol (stévia)|Édulcorant|1|Édulcorant d’origine végétale ; bien toléré à dose habituelle.
E961|Néotame|Édulcorant|1|Édulcorant intense.
E962|Sel d’aspartame-acésulfame|Édulcorant|2|Mélange des deux édulcorants.
E965|Maltitol|Édulcorant|1|Polyol : effet laxatif possible.
E966|Lactitol|Édulcorant|1|Polyol : effet laxatif possible.
E967|Xylitol|Édulcorant|1|Polyol : effet laxatif ; toxique pour les chiens.
E968|Érythritol|Édulcorant|1|Polyol bien toléré ; des études récentes s’interrogent sur le risque cardiovasculaire.
E969|Advantame|Édulcorant|1|Édulcorant intense.
E999|Extrait de quillaia|Agent moussant|0|Extrait d’écorce d’arbre.
E1103|Invertase|Enzyme|0|Enzyme qui rend le sucre plus liquide.
E1200|Polydextrose|Agent de charge|1|Fibre de synthèse ; effet laxatif possible.
E1201|Polyvinylpyrrolidone|Stabilisant|1|Stabilisant de synthèse.
E1518|Triacétine|Humectant|1|Garde l’humidité.
E1520|Propylène glycol|Humectant|1|Humectant ; sans danger aux doses autorisées.
`;
const DB={};
RAW.trim().split('\n').forEach(l=>{const [c,n,f,r,t]=l.split('|');DB[c]={n,f,r:+r,t};});

const WHY={
 'Colorant':'Donne ou ravive la couleur pour rendre le produit plus appétissant.',
 'Conservateur':'Freine moisissures et bactéries : le produit se garde plus longtemps.',
 'Antioxydant':'Évite que les graisses rancissent ou que le produit noircisse à l’air.',
 'Acidifiant':'Ajoute de l’acidité : goût plus vif et meilleure conservation.',
 'Régulateur d’acidité':'Garde l’acidité stable pour la saveur et la conservation.',
 'Épaississant':'Donne de la texture : plus épais, plus onctueux.',
 'Gélifiant':'Fait « prendre » le produit en gel (confitures, desserts).',
 'Émulsifiant':'Mélange l’eau et la graisse et garde une texture lisse et homogène.',
 'Stabilisant':'Empêche le produit de se séparer ou de changer de texture.',
 'Exhausteur de goût':'Renforce la saveur avec peu d’ingrédients coûteux.',
 'Édulcorant':'Apporte un goût sucré avec peu ou pas de calories.',
 'Anti-agglomérant':'Empêche les poudres de faire des grumeaux.',
 'Agent d’enrobage':'Rend la surface brillante et protège le produit.',
 'Humectant':'Garde le produit moelleux et humide.',
 'Poudre à lever':'Fait gonfler la pâte à la cuisson.',
 'Séquestrant':'Capte les traces de métaux qui abîment le produit.',
 'Affermissant':'Garde les morceaux fermes.',
 'Gaz':'Gaz utilisé pour les bulles ou la protection du produit.',
 'Anti-mousse':'Évite la formation de mousse à la fabrication.',
 'Agent de charge':'Ajoute du volume en remplaçant du sucre ou de la graisse.',
 'Agent moussant':'Aide à former une mousse stable.',
 'Enzyme':'Aide à transformer un ingrédient pendant la fabrication.',
 'Vitamine':'Ajoutée pour enrichir le produit en vitamine.',
 'Succédané de sel':'Remplace une partie du sel.',
 'Agent de traitement de la farine':'Améliore la pâte et le pain industriel.'
};
const RANGE=[[100,199,'Colorant'],[200,299,'Conservateur'],[300,399,'Antioxydant / acidifiant'],[400,499,'Épaississant / émulsifiant'],[500,599,'Régulateur d’acidité / anti-agglomérant'],[600,699,'Exhausteur de goût'],[900,999,'Agent d’enrobage / édulcorant'],[1000,1599,'Autre additif']];
const LV=[{k:'Sans risque',c:'#1e9e5a'},{k:'Risque faible',c:'#8fbf2c'},{k:'Risque modéré',c:'#f0a030'},{k:'Risque élevé',c:'#e0452f'}];
const UNK={k:'Non évalué',c:'#8a9a92'};
const esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));

function lookup(num,suf){
  const n=+num,full='E'+num+suf,base='E'+num;
  let d=DB[full]||DB[base];
  if(d)return {code:full,...d};
  if(n>=1400&&n<=1452)return {code:full,n:'Amidon modifié',f:'Épaississant',r:0,t:'Amidon transformé : sans danger connu, mais marqueur d’aliment ultra-transformé.'};
  const g=RANGE.find(x=>n>=x[0]&&n<=x[1]);
  return {code:full,n:'Additif '+full,f:g?g[2]:'Additif',r:null,t:'Niveau de risque non évalué dans notre base : consulte l’étiquette ou l’EFSA.'};
}
function scan(box){
  const txt=box.textContent||'';const seen=new Map();
  const re=/(?<![\p{L}\d])E\s?(\d{3,4})([a-z]?)(?![\p{L}\d])/giu;let m;
  while((m=re.exec(txt))){const num=m[1],suf=m[2].toLowerCase();const k=num+suf;if(!seen.has(k))seen.set(k,lookup(num,suf));}
  return [...seen.values()];
}
function declared(box){ // nombre déclaré dans la mini-case "Additifs déclarés"
  const mb=[...box.querySelectorAll('.v8-minibox')].find(x=>/Additifs/.test(x.textContent));
  const v=mb&&mb.querySelector('b')?.textContent.trim();return v==null?null:(/^\d+$/.test(v)?+v:null);
}
function build(box){
  if(box.querySelector('.nx-add')||!box.querySelector('.nutri-feature-top'))return;
  const items=scan(box),dec=declared(box);
  const host=box.querySelector('.nx-verdict')||box.querySelector('.nutri-feature-top');
  const sec=document.createElement('section');sec.className='nx-add';
  if(!items.length){
    const none=dec===0;
    sec.innerHTML=`<header class="nx-add-head"><div><b>Additifs</b><small>${none?'Aucun additif déclaré':'Non renseignés dans la fiche'}</small></div><span class="nx-add-pill ${none?'ok':'na'}">${none?'Sans additif':'Inconnu'}</span></header>`;
    host.insertAdjacentElement('afterend',sec);return;
  }
  items.sort((a,b)=>(b.r??-0.5)-(a.r??-0.5));
  const worst=Math.max(...items.map(i=>i.r??-1));
  const lvl=worst<0?UNK:LV[worst];
  const counts=[0,1,2,3].map(r=>items.filter(i=>i.r===r).length);
  const SH=['Sans','Faible','Modéré','Élevé'];
  const scale=LV.map((l,i)=>`<i class="${i===worst?'on':''}" style="--c:${l.c}">${SH[i]}${counts[i]?`<sup>${counts[i]}</sup>`:''}</i>`).join('');
  const rows=items.map((a,i)=>{
    const L=a.r==null?UNK:LV[a.r];
    return `<details class="nx-add-row" style="--c:${L.c}"${i===0&&(a.r||0)>=2?' open':''}>
      <summary><span class="nx-add-dot"></span><span class="nx-add-main"><b>${esc(a.n)}</b><small>${esc(a.code)} · ${esc(a.f)}</small></span><em>${L.k.replace('Risque ','')}</em></summary>
      <div class="nx-add-body"><p><b>Pourquoi il est utilisé</b>${esc(WHY[a.f]||'Améliore l’aspect, la texture ou la conservation du produit.')}</p>
      <p><b>Ce qu’on en sait</b>${esc(a.t||'')}</p></div></details>`;}).join('');
  sec.innerHTML=`<header class="nx-add-head"><div><b>Additifs</b><small>${items.length} détecté${items.length>1?'s':''} · <u style="color:${lvl.c}">${lvl.k}</u></small></div>
    <div class="nx-add-scale" role="img" aria-label="Niveau de risque le plus élevé : ${lvl.k}" style="--lc:${lvl.c}">${scale}</div></header>
    <div class="nx-add-list">${rows}</div>
    <p class="nx-add-note">Niveaux indicatifs d’après les avis EFSA/CIRC et la réglementation UE. Un additif autorisé n’est pas dangereux à dose normale ; ce n’est pas un avis médical.</p>`;
  host.insertAdjacentElement('afterend',sec);
  box.querySelectorAll('.v8-expand').forEach(d=>{if(/additifs/i.test(d.querySelector('summary')?.textContent||''))d.classList.add('nx-add-dup');});
}

/* ---------- Carte "Score santé" : barre dégradée + curseur animé (façon NutriScan) ---------- */
const ZONES=[{to:42,c:'#e0452f',k:'À limiter',pill:'Produit à limiter',msg:'À consommer rarement : plusieurs points nutritionnels sont défavorables.'},
 {to:70,c:'#f0a030',k:'Moyen',pill:'Produit moyen',msg:'Ce produit a quelques aspects nutritionnels à surveiller.'},
 {to:85,c:'#8fbf2c',k:'Bon',pill:'Bon produit',msg:'Un bon produit : seulement quelques points à surveiller.'},
 {to:101,c:'#17b26a',k:'Excellent',pill:'Excellent produit',msg:'Excellent choix : ce produit est très bien placé nutritionnellement.'}];
const zoneOf=v=>ZONES.find(z=>v<z.to);
const NOVA={1:['Brut ou peu transformé','#038141'],2:['Ingrédient culinaire','#c9a400'],3:['Transformé','#ee8100'],4:['Ultra-transformé','#e63e11']};
const IC={
 sugar:'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>',
 fat:'<path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/>',
 heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.600-7 10-7 10z"/>',
 salt:'<path d="M9 3h6M10 3v5l-5 10a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-10V3"/>',
 prot:'<path d="M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12"/>',
 fiber:'<path d="M12 21V8M12 8c0-3 2-5 5-5 0 3-2 5-5 5zM12 13c0-3-2-5-5-5 0 3 2 5 5 5z"/>',
 warn:'<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17.500v.01"/>'};
const ic=n=>'<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[n]+'</svg>';
const nz=v=>{const x=Number(v);return v!=null&&v!==''&&Number.isFinite(x)?x:null;};
function cleanScore(items,dec){
  if(items.length){let s=100;items.forEach(i=>{s-=i.r===3?35:i.r===2?15:i.r===1?5:i.r==null?5:0;});return Math.max(0,s);}
  return dec===0?100:null;
}

const DIETK='nutrix-prefs';
function dietAlerts(p){let prefs=[];try{prefs=JSON.parse(localStorage.getItem(DIETK)||'[]')}catch{}if(!prefs.length)return [];
 const al=(p.allergens||[]).map(x=>String(x).replace(/^[a-z]{2}:/,'')),ing=String(p.ingredients||'').toLowerCase(),n=p.nutri||{},out=[];
 const hasIng=re=>re.test(ing),has=k=>al.includes(k);
 const sugar=nz(n.sugars_100g),salt=nz(n.salt_100g)??(nz(n.sodium_100g)==null?null:nz(n.sodium_100g)*2.5);
 const rule={'Sans gluten':()=>has('gluten')||hasIng(/gluten|bl[ée]|froment|orge|seigle|avoine|épeautre/),
  'Sans lactose':()=>has('milk')||hasIng(/lait|lactose|fromage|beurre|cr[eè]me|yaourt|whey|lactos[ée]rum/),
  'Sans arachides':()=>has('peanuts')||hasIng(/arachide|cacahu[eè]te|peanut/),
  'Sans œufs':()=>has('eggs')||hasIng(/œuf|oeuf|egg/),
  'Sans fruits à coque':()=>has('nuts')||hasIng(/noisette|amande|noix|pistache|cajou|pecan|pécan/),
  'Sans poisson':()=>has('fish')||hasIng(/poisson|thon|saumon|anchois|sardine/),
  'Végétarien':()=>hasIng(/viande|poulet|boeuf|bœuf|porc|jambon|saucisson|lardon|gélatine|gelatine|dinde|agneau|poisson|thon|saumon/),
  'Halal':()=>hasIng(/porc|jambon|lardon|saindoux|alcool|vin|rhum|bi[eè]re|gélatine de porc|\be120\b|carmin/),
  'Sans sucre ajouté':()=>sugar!=null&&sugar>10||hasIng(/sucre|sirop de glucose|sirop de fructose|glucose/),
  'Diabète':()=>sugar!=null&&sugar>10,
  'Hypertension':()=>salt!=null&&salt>1.5};
 const why={'Sans gluten':'contient du gluten','Sans lactose':'contient du lait / lactose','Sans arachides':'contient des arachides','Sans œufs':'contient des œufs','Sans fruits à coque':'contient des fruits à coque','Sans poisson':'contient du poisson','Végétarien':'contient des ingrédients d’origine animale','Halal':'ingrédient non halal possible (porc, alcool, gélatine)','Sans sucre ajouté':'sucre élevé / ajouté','Diabète':'riche en sucre ('+(sugar!=null?sugar.toFixed(1):'?')+' g/100 g)','Hypertension':'riche en sel ('+(salt!=null?salt.toFixed(1):'?')+' g/100 g)'};
 prefs.forEach(k=>{try{if(rule[k]&&rule[k]())out.push([k,why[k]])}catch{}});return out}
function buildScore(box){
  if(box.querySelector('.nx-sc')||!box.querySelector('.nutri-feature-top'))return;
  const F=window.NX_FEATURE;if(!F||!F.p)return;
  const {p,s}=F,n=p.nutri||{};
  const sugar=nz(n.sugars_100g),fat=nz(n.fat_100g),sat=nz(n['saturated-fat_100g']),prot=nz(n.proteins_100g),fib=nz(n.fiber_100g);
  const salt=nz(n.salt_100g)??(nz(n.sodium_100g)==null?null:nz(n.sodium_100g)*2.5);
  const items=scan(box),dec=declared(box);
  const good=[],bad=[];
  if(sugar!=null){if(sugar<=5)good.push(['sugar','Peu de sucre']);else if(sugar>12.5)bad.push(['sugar','Riche en sucre']);}
  if(fat!=null){if(fat<=3)good.push(['fat','Peu de matières grasses']);else if(fat>20)bad.push(['fat','Riche en matières grasses']);}
  if(sat!=null){if(sat<=1.5)good.push(['heart','Peu de graisses saturées']);else if(sat>5)bad.push(['heart','Riche en graisses saturées']);}
  if(salt!=null){if(salt<=0.3)good.push(['salt','Peu de sel']);else if(salt>1.5)bad.push(['salt','Riche en sel']);}
  if(prot!=null&&prot>=10)good.push(['prot','Bonnes protéines']);
  if(fib!=null&&fib>=6)good.push(['fiber','Riche en fibres']);
  if(items.some(i=>i.r===3))bad.push(['warn','Additif à risque élevé']);
  const hasScore=s&&s.score!=null,v=hasScore?s.score:0,z=hasScore?zoneOf(v):null;
  const cs=cleanScore(items,dec);
  const cl=cs==null?['—','Non renseigné','#8a9a92']:cs>=80?[cs,'Propre','#17b26a']:cs>=50?[cs,'Correct','#f0a030']:[cs,'À surveiller','#e0452f'];
  const nova=p.nova>=1&&p.nova<=4?NOVA[p.nova]:null;
  const chips=(arr,cls)=>arr.map(([i,t])=>`<span class="${cls}">${ic(i)}${esc(t)}</span>`).join('');
  const sec=document.createElement('section');sec.className='nx-sc';
  sec.innerHTML=`<header class="nx-sc-head"><i class="nx-sc-bot" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="7" width="14" height="11" rx="4"/><path d="M12 7V4M9.500 12v1M14.500 12v1"/></svg></i><b>Analyse Nutrix</b></header>
  <small class="nx-sc-lab">SCORE SANTÉ</small>
  ${hasScore?`<span class="nx-sc-pill" style="--c:${z.c}">${z.pill}</span>
  <div class="nx-sc-bar" data-v="${v}"><div class="nx-sc-track"></div>
   <div class="nx-sc-knob" style="--c:${z.c};left:0%"><b>0</b></div>
   <div class="nx-sc-ticks"><span style="left:0%">0</span><span style="left:42%">42</span><span style="left:70%">70</span><span style="left:85%">85</span><span style="left:100%">100</span></div></div>
  <p class="nx-sc-msg">${z.msg}</p>`:`<p class="nx-sc-msg">Données insuffisantes pour calculer un score fiable.</p>`}
  ${(()=>{const d=dietAlerts(p);return d.length?`<div class="nx-sc-diet"><b>⚠️ Attention avec ton profil</b>${d.map(([k,w])=>`<span><em>${esc(k)}</em> · ${esc(w)}</span>`).join('')}</div>`:(()=>{try{return JSON.parse(localStorage.getItem(DIETK)||'[]').length?`<div class="nx-sc-diet ok"><b>✓ Compatible avec ton profil</b></div>`:''}catch{return ''}})()})()}
  <div class="nx-sc-tiles">
   <div class="nx-sc-tile" style="--c:${cl[2]}"><small>QUALITÉ DES INGRÉDIENTS</small><b>${cl[0]}</b><em>${cl[1]}</em></div>
   <div class="nx-sc-tile" style="--c:${nova?nova[1]:'#8a9a92'}"><small>TRANSFORMATION</small><b>${nova?p.nova:'—'}</b><em>${nova?nova[0]:'Non renseigné'}</em></div>
  </div>
  ${good.length?`<div class="nx-sc-hl good"><b>★ Points forts nutritionnels</b><div>${chips(good,'ok')}</div></div>`:''}
  ${bad.length?`<div class="nx-sc-hl bad"><b>! À surveiller</b><div>${chips(bad,'ko')}</div></div>`:''}`;
  box.querySelector('.nutri-feature-top').insertAdjacentElement('afterend',sec);
  if(hasScore)animateScore(sec.querySelector('.nx-sc-bar'),v);
}
function animateScore(bar,target){
  const knob=bar.querySelector('.nx-sc-knob'),num=knob.querySelector('b');
  const set=x=>{knob.style.left=x+'%';num.textContent=Math.round(x);knob.style.setProperty('--c',zoneOf(x).c);};
  if(window.matchMedia('(prefers-reduced-motion:reduce)').matches){set(target);return;}
  let started=false;
  const run=()=>{if(started)return;started=true;const t0=performance.now(),D=1500;
    const ease=t=>1-Math.pow(1-t,3)+Math.sin(t*Math.PI)*0.03; // légère inertie
    const step=now=>{const t=Math.min(1,(now-t0)/D);set(Math.min(100,target*ease(t)));if(t<1)requestAnimationFrame(step);else{set(target);knob.classList.add('done');}};requestAnimationFrame(step);};
  if('IntersectionObserver' in window){const io=new IntersectionObserver(es=>{if(es.some(e=>e.isIntersecting)){io.disconnect();setTimeout(run,250);}},{threshold:.5});io.observe(bar);}else run();
}
function init(){
  const box=document.getElementById('nutri-feature');if(!box)return;
  let t=0;const run=()=>{clearTimeout(t);t=setTimeout(()=>{buildScore(box);build(box);},30);};
  new MutationObserver(run).observe(box,{childList:true});run();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
}catch(e){console.error("[Nutrix] nutrix-additives.js",e)}
