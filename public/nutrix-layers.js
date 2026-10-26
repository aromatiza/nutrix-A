/* Nutrix — nutrix-layers.js : design-v9.js, design-v10.js, design-v11.js, design-v11-1.js, nutrix-v11-2.js, nutrix-v11-3.js, nutrix-v11-4.js, nutrix-v11-5.js, nutrix-v12-5.js, nutrix-v12-6.js, nutrix-atelier-v12-3.js, nutrix-v12-10.js, nutrix-v12-12.js, nutrix-v12-14.js, nutrix-v12-15.js, nutrix-v12-16.js, nutrix-v13-core.js, nutrix-v13.js, nutrix-v13-2.js, nutrix-v13-3.js (ordre d’origine conservé). */

/* ===== design-v9.js ===== */
try{
/* V9 orchestration: original features remain handled by V5 modules. */
(()=>{'use strict';
function navigate(tab){document.querySelector(`.tab[data-tab="${tab}"]`)?.click();window.scrollTo({top:0,behavior:'smooth'});}
function summary(){try {const date=typeof current!=='undefined'?current:new Date().toISOString().slice(0,10);const t=typeof totals==='function'?totals(date):null;for(const [id,key] of [['v9-today-kcal','kcal'],['v9-today-p','p'],['v9-today-f','f']]) {const node=document.getElementById(id);if(node)node.textContent=t?Math.round(Number(t[key]||0)).toLocaleString('fr-FR'):'—';}}catch(e){/* state not yet available */}}
document.querySelectorAll('[data-v9-action]').forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.v9Action;if(a==='health')navigate('health');else if(a==='ai')navigate('ai');else if(a==='lab'){navigate('journal');document.getElementById('v5-laboratoire')?.scrollIntoView({behavior:'smooth',block:'start'});}else if(a==='search'){navigate('nutri');document.getElementById('nutri-query')?.focus();}else if(a==='scan'){navigate('nutri');document.getElementById('nutri-scan-btn')?.click();}else if(a==='photo'){navigate('health');document.getElementById('ai-product-photo')?.scrollIntoView({behavior:'smooth',block:'center'});document.getElementById('ai-product-photo')?.click();}}));
document.querySelectorAll('.tab').forEach(tab=>tab.addEventListener('click',()=>{if(tab.dataset.tab==='home')summary();}));summary();document.addEventListener('visibilitychange',()=>{if(!document.hidden)summary();});
})();
}catch(e){console.error("[Nutrix] design-v9.js",e)}

/* ===== design-v10.js ===== */
try{
/* Reference-led dashboard widgets; original nutrition and AI handlers remain unchanged. */
(()=>{'use strict';const byId=id=>document.getElementById(id);const fr=new Intl.NumberFormat('fr-FR');function getDate(offset){const d=new Date();d.setDate(d.getDate()+offset);return d.toLocaleDateString('en-CA');}function getTotals(date){try{return typeof totals==='function'?totals(date):null}catch{return null}}function safe(n){const x=Number(n);return Number.isFinite(x)&&x>=0?x:0}function text(id,n){const el=byId(id);if(el)el.textContent=fr.format(Math.round(safe(n)))}function render(){const today=new Date();const label=byId('v10-date');if(label)label.textContent=today.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'});const t=getTotals(getDate(0));if(t){text('v9-today-kcal',t.kcal);text('v9-today-p',t.p);text('v10-today-c',t.c);text('v9-today-f',t.f);const target=(typeof state!=='undefined'&&state.settings)?safe(state.settings.target)||2000:2000;byId('v10-ring')?.style.setProperty('--p',Math.max(0,Math.min(100,safe(t.kcal)/target*100)).toFixed(1));[['p',110],['c',250],['f',75]].forEach(([k,m])=>{const node=byId('v10-bar-'+k);if(node)node.style.width=Math.min(100,safe(t[k])/m*100)+'%'})}const chart=byId('v10-week-chart');if(!chart)return;const points=Array.from({length:7},(_,i)=>{const day=new Date();day.setDate(day.getDate()-6+i);const val=getTotals(getDate(i-6));return {label:day.toLocaleDateString('fr-FR',{weekday:'short'}),kcal:val?safe(val.kcal):0}});if(!points.some(x=>x.kcal)){chart.innerHTML='<div class="v10-empty">Ajoutez des repas pour voir votre évolution.</div>';return}const max=Math.max(100, ...points.map(x=>x.kcal));chart.innerHTML='';for(const p of points){const c=document.createElement('div');c.className='v10-chartcol';const bar=document.createElement('div');bar.className='v10-chartbar';bar.style.height=Math.max(3,Math.round(p.kcal/max*125))+'px';bar.title=p.kcal+' kcal';const cap=document.createElement('small');cap.textContent=p.label;const value=document.createElement('em');value.textContent=p.kcal?fr.format(Math.round(p.kcal)): '—';c.append(bar,value,cap);chart.append(c)}}document.querySelectorAll('.tab').forEach(x=>x.addEventListener('click',()=>{if(x.dataset.tab==='home')render()}));window.addEventListener('storage',render);document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});setTimeout(render,50);setTimeout(render,400);
})();
}catch(e){console.error("[Nutrix] design-v10.js",e)}

/* ===== design-v11.js ===== */
try{
/* V11: global assistant reuses the real Gemini chat DOM and handlers. */
(()=>{'use strict';function init(){const shell=document.querySelector('#page-ai .ai-shell');const holder=document.getElementById('v11-ai-body');const drawer=document.getElementById('v11-ai-drawer');const launch=document.getElementById('v11-ai-launch');const cover=document.getElementById('v11-ai-backdrop');const close=document.getElementById('v11-ai-close');if(!shell||!holder||!drawer||!launch||!close)return;holder.append(shell);let previous=null;function toggle(open){if(open){previous=document.activeElement;drawer.classList.add('open');drawer.setAttribute('aria-hidden','false');launch.setAttribute('aria-expanded','true');cover.hidden=false;setTimeout(()=>document.getElementById('ai-input')?.focus(),20);}else{drawer.classList.remove('open');drawer.setAttribute('aria-hidden','true');launch.setAttribute('aria-expanded','false');cover.hidden=true;(previous instanceof HTMLElement?previous:launch).focus();}}launch.addEventListener('click',()=>toggle(!drawer.classList.contains('open')));close.addEventListener('click',()=>toggle(false));cover.addEventListener('click',()=>toggle(false));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drawer.classList.contains('open'))toggle(false);});document.querySelectorAll('[data-v9-action="ai"]').forEach(el=>el.addEventListener('click',e=>{e.stopImmediatePropagation();e.preventDefault();toggle(true)},true));document.querySelectorAll('[data-v11-action]').forEach(el=>el.addEventListener('click',()=>{const a=el.dataset.v11Action;if(a==='health')document.querySelector('.tab[data-tab="health"]')?.click();else if(a==='lab'){document.querySelector('.tab[data-tab="journal"]')?.click();document.getElementById('v5-laboratoire')?.scrollIntoView({behavior:'smooth',block:'start'});}else if(a==='compare'){document.querySelector('.tab[data-tab="nutri"]')?.click();document.getElementById('nutri-focus-compare')?.click();}}));const oldAiNav=document.querySelector('.tab[data-tab="ai"]');if(oldAiNav)oldAiNav.addEventListener('click',e=>{e.stopImmediatePropagation();e.preventDefault();toggle(true)},true);const brand=document.querySelector('.sidebar .brand-name');if(brand)brand.textContent='Space Daily';}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();})();
}catch(e){console.error("[Nutrix] design-v11.js",e)}

/* ===== design-v11-1.js ===== */
try{
/* V11.1 – optional Moroccan Darija interface hints; no automated medical translation */
(()=>{'use strict';
const translations={
 'Accueil':'الرئيسية','Santé':'الصحة','Scanner':'سكان','Labo':'المختبر','Projet':'المشروع','Comparer':'قارن','Caméra':'الكاميرا','Importer une photo':'زيد صورة','Rechercher':'قلب','Rechercher un produit':'قلب على منتوج','Tableau de bord':'لوحة المعلومات','Space Nutri':'سبايس نوتري','Voir mon suivi':'شوف التتبع','Aujourd’hui':'اليوم','Apports nutritionnels':'العناصر الغذائية','Analyser un produit':'حلّل منتوج','Évolution sur 7 jours':'تطور 7 أيام','Derniers produits':'آخر المنتوجات','Cette semaine':'هاد السيمانة','Protéines':'البروتينات','Glucides':'النشويات','Lipides':'الدهون','Scanner un code-barres':'سكان الكود بار','Centrez le code-barres dans le cadre':'حط الباركود وسط الإطار','Ouvrir la caméra':'حل الكاميرا','Chercher':'قلب','Calories du jour':'سعرات اليوم','Ajouter un aliment':'زيد ماكلة','Déjeuner':'الغدا','Dîner':'العشا','Petit-déjeuner':'الفطور','Ajouter':'زيد','Récents':'اللي تحلّلو مؤخراً','Favoris':'المفضلة','Comparaison':'المقارنة','Résultats':'النتائج','Détails':'التفاصيل','Voir les ingrédients':'شوف المكونات','Voir les additifs':'شوف الإضافات','Valeurs nutritionnelles':'القيم الغذائية','Nutri-Score':'نوتري سكور','Réglages':'الإعدادات','Prendre photo':'صور','Galerie':'الصور','Comparer deux produits':'قارن جوج منتوجات','Protéines (g)':'بروتينات (غ)','Glucides (g)':'نشويات (غ)','Lipides (g)':'دهون (غ)','Calories (kcal)':'سعرات حرارية','Ajouter un repas':'زيد وجبة','Laboratoire nutritionnel':'المختبر الغذائي','Analyser':'حلّل','Enregistrer':'حفظ','Voir détails':'شوف التفاصيل','Score santé':'نقطة الصحة','Score nutritionnel':'النقطة الغذائية','Projet universitaire':'مشروع جامعي','Technologies & sources':'التقنيات والمصادر','Scanner un produit':'سكان المنتوج','Suivi de ta journée':'تتبع اليوم','Présentation et méthodologie':'تقديم المشروع والمنهجية','Votre nutrition, simplifiée':'تغذيتك بطريقة سهلة','Bonjour':'السلام','Votre nutrition, en un regard.':'تغذيتك بنظرة وحدة.','ANALYSE ALIMENTAIRE':'تحليل الأغذية','BILAN DU JOUR':'ملخص اليوم','STATISTIQUES':'الإحصائيات','ANALYSES':'التحاليل','Pour 100 g · valeurs déclarées':'لكل 100غ · قيم مصرّح بها',
 "Tableau de bord":"لوحة التتبع",
 "Votre espace nutritionnel, en un coup d’œil":"تتبع التغذية ديالك بنظرة وحدة",
 "Votre espace nutritionnel":"فضاء التغذية ديالك",
 "Nutrition du jour":"تغذية اليوم",
 "Votre nutrition au quotidien":"تغذيتك كل نهار",
 "Vos données nutritionnelles":"المعطيات الغذائية ديالك",
 "Un meilleur choix commence ici.":"الاختيار المزيان كيبدا من هنا",
 "Scanner un produit":"سكان منتوج",
 "Rechercher un aliment":"قلب على ماكلة",
 "Rechercher un produit":"قلب على منتوج",
 "Rechercher":"قلب",
 "Rechercher par nom":"قلب بالاسم",
 "Recherche":"البحث",
 "Historique":"السجل",
 "Derniers produits":"آخر المنتوجات",
 "Aucun produit sélectionné.":"مازال ما اخترتي حتى منتوج.",
 "Ajoute deux produits à comparer.":"زيد جوج منتوجات باش تقارنهم.",
 "Ouvrir le scanner":"حل السكانير",
 "Ouvrir la caméra":"حل الكاميرا",
 "Arrêter le scan":"حبس السكان",
 "Stop":"حبس",
 "Code-barres":"الباركود",
 "Scan rapide":"سكان سريع",
 "Scanner un code-barres":"سكان الباركود",
 "Importer une photo":"دخل صورة",
 "Analyser la photo":"حلل الصورة",
 "Analyse photo du produit":"تحليل صورة المنتوج",
 "Identifier le produit":"تعرف على المنتوج",
 "Lire une étiquette":"قرا المعلومات على العلبة",
 "Vérification des valeurs lues":"تأكد من القيم اللي تقرات",
 "Photo du produit":"صورة المنتوج",
 "Choisis un produit pour voir le détail":"اختار منتوج باش تشوف التفاصيل",
 "Valeurs nutritionnelles":"القيم الغذائية",
 "Résultat du scan":"نتيجة السكان",
 "Voir détails":"شوف التفاصيل",
 "Comparer les produits":"قارن المنتوجات",
 "Comparaison":"المقارنة",
 "Analyser avec Gemini":"حلّل بمساعدة جيميني",
 "Analyse intelligente du produit":"تحليل ذكي للمنتوج",
 "Nutrition personnelle":"تتبّع التغذية",
 "Ajouter un repas":"زيد وجبة",
 "Mes repas":"الوجبات ديالي",
 "Aujourd’hui":"اليوم",
 "Cette semaine":"هاد السيمانة",
 "Évolution sur 7 jours":"تطور سبعة أيام",
 "Protéines":"البروتينات",
 "Glucides":"النشويات",
 "Lipides":"الدهون",
 "Sucres":"السكريات",
 "Sel":"الملح",
 "Énergie":"الطاقة",
 "Graisses saturées":"الدهون المشبعة",
 "Fibres":"الألياف",
 "Additifs":"الإضافات الغذائية",
 "Ingrédients":"المكونات",
 "Calories consommées":"السعرات اللي كلّيتي",
 "Calories":"السعرات",
 "Objectif":"الهدف",
 "Graphiques":"الرسوم البيانية",
 "Bilan du jour":"ملخص اليوم",
 "Laboratoire nutritionnel":"المختبر الغذائي",
 "Données et méthode":"المعطيات والمنهجية",
 "Sources & méthodologie":"المصادر والمنهجية",
 "Comprendre":"فهم",
 "Comparer":"قارن",
 "Suivre":"تتبع",
 "Projet universitaire":"مشروع جامعي",
 "Technologies & sources":"التقنيات والمصادر",
 "Réglages":"الإعدادات",
 "Couleur":"اللون",
 "Fond":"الخلفية",
 "Clair":"فاتح",
 "Sombre":"غامق",
 "Automatique":"تلقائي",
 "Effacer le chat":"مسح المحادثة",
 "Posez votre question":"سول سؤالك",
 "Votre message":"الرسالة ديالك",
 "Envoyer":"صيفط",
 "Assistant nutritionnel":"مساعد التغذية",
 "Nutrix Assistant":"مساعد نوتريكس",
 "Information indisponible":"المعلومة ما متوفراش",
 "Non renseigné":"ما متسجلش",
 "Voir tout":"شوف الكل",
 "Retour":"رجوع",
 "Fermer":"سد",
 "Enregistrer":"حفظ",
 "Annuler":"إلغاء",
 "Confirmer":"أكد",
 "Ajouter":"زيد",
 "Supprimer":"حيد",
 "Modifier":"بدل",
 "Profil":"الملف الشخصي",
 "Accueil":"الرئيسية",
 "Santé":"الصحة",
 "Scanner":"سكان",
 "Labo":"المختبر",
 "Projet":"المشروع",
 "Coach":"المساعد",
 "Langue":"اللغة",
 "Français":"الفرنسية",
 "Darija":"الدارجة",
 "Dernière analyse":"آخر تحليل",
 "Analyse alimentaire":"تحليل غذائي",
 "Recherche de produits":"البحث على المنتوجات",
 "Saisir un code":"دخل الكود",
 "Déjeuner":"الغدا",
 "Petit déjeuner":"الفطور",
 "Dîner":"العشا",
 "Petit-déjeuner":"الفطور",
 "Collation":"تصبيرة",
 "Aucune donnée disponible":"ما كايناش المعطيات",
 "NOVA":"نوفا",
 "Nutri-Score":"نوتري سكور"
};
let mode='fr';try{mode=localStorage.getItem('sd-v111-language')==='ary'?'ary':'fr';}catch{}
const select=document.getElementById('v111-language');if(!select)return;
const cache=new WeakMap();
function convertText(node){if(!node||!node.parentElement||node.parentElement.closest('script,style,textarea,pre,code,option'))return;let source=cache.get(node);if(source===undefined){source=node.nodeValue;cache.set(node,source);}const trim=source.trim();if(!trim)return;const result=mode==='ary'&&translations[trim]||trim;const spaces=/^(\s*)/.exec(source)?.[1]||'';const end=/\s*$/.exec(source)?.[0]||'';const updated=spaces+result+end;if(node.nodeValue!==updated)node.nodeValue=updated;}
function convert(root){if(!root||!document.body)return;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while((n=walker.nextNode()))convertText(n);if(root.nodeType===Node.TEXT_NODE)convertText(root);document.querySelectorAll('input[placeholder],textarea[placeholder],button[title],a[title],[aria-label]').forEach(el=>{for(const a of ['placeholder','title','aria-label']){if(!el.hasAttribute(a))continue;const key='nxI18n'+a.replace(/-/g,'');const original=el.dataset[key]||el.getAttribute(a);if(!el.dataset[key])el.dataset[key]=original;const trans=translations[original];if(trans)el.setAttribute(a,mode==='ary'?trans:original);}});}
let scheduled=false;const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;observer.disconnect();convert(document.body);observer.observe(document.body,{childList:true,subtree:true});});});
function apply(){document.documentElement.dataset.sdLang=mode;document.documentElement.lang=mode==='ary'?'ary':'fr';select.value=mode;observer.disconnect();convert(document.body);observer.observe(document.body,{childList:true,subtree:true});}
select.addEventListener('change',()=>{mode=select.value;try{localStorage.setItem('sd-v111-language',mode)}catch{}apply();});apply();
})();
}catch(e){console.error("[Nutrix] design-v11-1.js",e)}

/* ===== nutrix-v11-2.js ===== */
try{
/* Nutrix V11.2: accessibility + clean branding; all legacy business logic untouched. */
(()=>{'use strict';
const name='Nutrix';
document.title=document.title.replace(/Space Daily/gi,name).replace(/V11\.1/i,'V11.2');
const themeMeta=document.querySelector('meta[name="theme-color"]');
function syncTheme(){if(!themeMeta)return;const mode=document.documentElement.getAttribute('data-theme')||document.body.getAttribute('data-theme')||document.documentElement.getAttribute('data-mode');const dark=mode==='dark'||(!mode||mode==='auto')&&matchMedia('(prefers-color-scheme: dark)').matches;themeMeta.content=dark?'#10241D':'#126B52';}
syncTheme();new MutationObserver(syncTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme','data-mode']});
const launch=document.getElementById('v11-ai-launch');if(launch){launch.title='Assistant Nutrix';launch.setAttribute('aria-label','Ouvrir l’assistant Nutrix');}
const languages=document.getElementById('v111-language');if(languages){languages.title='Langue / اللغة';}
})();
}catch(e){console.error("[Nutrix] nutrix-v11-2.js",e)}

/* ===== nutrix-v11-3.js ===== */
try{
/* Nutrix V11.3: compact FR/Darija switch. Original localization owns translations. */
(()=>{'use strict';
const select=document.getElementById('v111-language');const choices=[...document.querySelectorAll('[data-nx-lang]')];
if(!select||choices.length!==2)return;
function sync(){choices.forEach(button=>{const selected=button.dataset.nxLang===select.value;button.setAttribute('aria-pressed',String(selected));});}
choices.forEach(button=>button.addEventListener('click',()=>{if(select.value!==button.dataset.nxLang){select.value=button.dataset.nxLang;select.dispatchEvent(new Event('change',{bubbles:true}));}sync();}));
select.addEventListener('change',sync);sync();
})();
}catch(e){console.error("[Nutrix] nutrix-v11-3.js",e)}

/* ===== nutrix-v11-4.js ===== */
try{
(()=>{'use strict';
const button=document.querySelector('.tab[data-tab="nutri"]');
if(button)button.addEventListener('click',()=>{setTimeout(()=>{const scan=document.getElementById('nutri-scan-btn');if(scan&&!document.getElementById('nutri-scan-box')?.hidden)return;if(scan)scan.click();},120);},true);
const dialog=document.getElementById('nx-postscan');let last='';const getLang=()=>document.getElementById('v111-language')?.value==='ary';
const update=()=>{const ar=getLang();document.getElementById('nx-postscan-title').textContent=ar?'تسالا تحليل المنتوج':'Analyse terminée';document.getElementById('nx-postscan-info').textContent=ar?'شنو بغيتي تدير دابا؟':'Que souhaitez-vous faire ?';document.getElementById('nx-to-score').textContent=ar?'📊 شوف نقطة المنتوج':'📊 Voir le score';document.getElementById('nx-to-health').textContent=ar?'♡ زيد للصحة':'♡ Ajouter à Santé';document.getElementById('nx-postscan-close').textContent=ar?'سد':'Fermer';};
function close(){dialog.hidden=true;}document.getElementById('nx-postscan-close')?.addEventListener('click',close);
dialog?.addEventListener('click',e=>{if(e.target===dialog)close()});
document.getElementById('nx-to-score')?.addEventListener('click',()=>{close();document.querySelector('.tab[data-tab="nutri"]')?.click();document.getElementById('nutri-feature')?.scrollIntoView({block:'start',behavior:'smooth'});});
document.getElementById('nx-to-health')?.addEventListener('click',()=>{close();document.querySelector('.tab[data-tab="health"]')?.click();document.getElementById('custom-name')?.scrollIntoView({block:'center',behavior:'smooth'});});
// Open options after a product has actually been identified and rendered; never fabricate successful scans.
const feature=document.getElementById('nutri-feature');if(feature){new MutationObserver(()=>{const text=feature.textContent||'';const img=feature.querySelector('img');const sig=(img?.src||'')+'|'+text.slice(0,120);if(sig&&sig!==last&&!/Aucun produit sélectionné|Choisis un produit/i.test(text)&&feature.querySelector('.nutri-product|.nutri-product-head|.v8-product-overview,.nutri-feature-header,img')){last=sig;update();dialog.hidden=false;}}).observe(feature,{childList:true,subtree:true});}
})();
}catch(e){console.error("[Nutrix] nutrix-v11-4.js",e)}

/* ===== nutrix-v11-5.js ===== */
try{
(()=>{'use strict';
const lang=()=>document.getElementById('v111-language')?.value==='ary';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Rotation daily, no fabricated publication dates, products or reviews.
const categories=['couscous','huile olive maroc','sardines','harissa','amlou','the vert menthe','lentilles','dattes maroc','lait maroc'];
const day=Math.floor(Date.now()/86400000);
const q=categories[((day%categories.length)+categories.length)%categories.length];
const holder=document.getElementById('nx-morocco-items');
const label=document.getElementById('nx-today-label');
if(label)label.textContent=new Date().toLocaleDateString('fr-MA',{day:'numeric',month:'short'});
if(holder){fetch('/api/off/search?q='+encodeURIComponent(q)).then(r=>{if(!r.ok)throw Error('OFF '+r.status);return r.json()}).then(j=>{
 const products=(Array.isArray(j.products)?j.products:[]).filter(p=>p&&String(p.product_name_fr||p.product_name||'').trim()).slice(0,3);
 if(!products.length)throw Error('empty');
 holder.innerHTML=products.map(p=>{const name=String(p.product_name_fr||p.product_name).slice(0,90),brand=String(p.brands||'').slice(0,50),grade=String(p.nutriscore_grade||p.nutrition_grades||'').toUpperCase();const valid=/^[A-E]$/.test(grade);const image=p.image_front_small_url||p.image_front_url||p.image_small_url||p.image_url||'';
 return `<article class="nx-morocco-card"><div class="nx-morocco-image">${image?`<img loading="lazy" src="${esc(image)}" alt="${esc(name)}">`:'<span aria-hidden="true">▤</span>'}</div><h4>${esc(name)}</h4><p>${esc(brand)}</p><div class="nx-grade ${valid?'nx-grade-'+grade.toLowerCase():''}">${valid?'Nutri-Score '+grade:(lang()?'النقطة ما متوفراش':'Note indisponible')}</div></article>`;}).join('');
 }).catch(()=>{});}
function updateLang(){const ar=lang();document.querySelectorAll('[data-nx115-fr][data-nx115-ary]').forEach(el=>{el.textContent=ar?el.dataset.nx115Ary:el.dataset.nx115Fr;});}
document.getElementById('v111-language')?.addEventListener('change',()=>{updateLang();document.getElementById('nutri-compare-a')?.dispatchEvent(new Event('change'));});updateLang();
})();
}catch(e){console.error("[Nutrix] nutrix-v11-5.js",e)}

/* ===== nutrix-v12-5.js ===== */
try{
(()=>{
'use strict';
function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn,{once:true});else fn();}
ready(()=>{
  const compareFocus = document.getElementById('nutri-focus-compare');
  compareFocus?.addEventListener('click',()=>setTimeout(()=>document.getElementById('nutri-compare-card')?.scrollIntoView({behavior:'smooth',block:'center'}),160));
  const launcher = document.getElementById('v11-ai-launch');
  if(launcher) launcher.title = 'Assistant vocal & visuel';
  const top = document.querySelector('.v11-ai-top strong');
  if(top) top.textContent = 'Nutrix Voice Assistant';
  const sub = document.querySelector('.v11-ai-top small');
  if(sub) sub.textContent = 'Voice · Image · Texte';
  const drawer = document.getElementById('v11-ai-drawer');
  if(drawer) drawer.classList.add('v12-ai-fullscreen');
});
})();
}catch(e){console.error("[Nutrix] nutrix-v12-5.js",e)}

/* ===== nutrix-v12-6.js ===== */
try{
(()=>{
  'use strict';
  function ready(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn,{once:true});else fn();}
  ready(()=>{
    const drawer = document.getElementById('v11-ai-drawer');
    const backdrop = document.getElementById('v11-ai-backdrop');
    const closeBtn = document.getElementById('v11-ai-close');
    const launch = document.getElementById('v11-ai-launch');
    if(!drawer || !backdrop || !closeBtn || !launch) return;

    launch.title = 'Assistant Nutrix';
    launch.setAttribute('aria-label','Ouvrir l’assistant Nutrix');

    function ensureCallButton(){
      const actions = document.querySelector('.nx-ai-actions');
      if(!actions || document.getElementById('ai-call-btn')) return false;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'ai-call-btn';
      btn.className = 'nx-ai-circle';
      btn.title = 'Appel vocal avec Nutrix';
      btn.setAttribute('aria-label','Appel vocal avec Nutrix');
      btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24c1.02.34 2.1.52 3.22.52a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.3 21 3 13.7 3 4a1 1 0 0 1 1-1h3.54a1 1 0 0 1 1 1c0 1.12.18 2.2.52 3.22a1 1 0 0 1-.24 1L6.6 10.8Z"/></svg>';
      actions.append(btn);
      return true;
    }

    function leaveCallMode(){
      document.body.classList.remove('ai-call-active');
      document.getElementById('ai-call-btn')?.classList.remove('is-active');
    }
    function enterCallMode(){
      const isOpen = drawer.classList.contains('open');
      if(!isOpen) launch.click();
      setTimeout(()=>{
        document.body.classList.add('ai-call-active');
        document.getElementById('ai-call-btn')?.classList.add('is-active');
        const voiceBtn = document.getElementById('ai-voice-btn');
        if(voiceBtn && !voiceBtn.classList.contains('is-active')) voiceBtn.click();
      }, isOpen ? 0 : 160);
    }

    const boot = ()=>{
      ensureCallButton();
      const callBtn = document.getElementById('ai-call-btn');
      callBtn?.addEventListener('click', ()=>{
        if(document.body.classList.contains('ai-call-active')) leaveCallMode();
        else enterCallMode();
      });
    };
    boot();
    const obs = new MutationObserver(()=>ensureCallButton());
    const body = document.getElementById('v11-ai-body');
    if(body) obs.observe(body, {childList:true, subtree:true});

    closeBtn.addEventListener('click', leaveCallMode, true);
    backdrop.addEventListener('click', leaveCallMode, true);
    document.addEventListener('keydown', e=>{if(e.key==='Escape') leaveCallMode();});

    document.querySelectorAll('[data-v11-action],[data-v9-action="ai"],.sidebar .tab[data-tab="ai"]').forEach(el=>{
      el.addEventListener('click', ()=>leaveCallMode(), true);
    });
  });
})();
}catch(e){console.error("[Nutrix] nutrix-v12-6.js",e)}

/* ===== nutrix-atelier-v12-3.js ===== */
try{
(function(){
  const heroMap = {
    'page-home': {
      kicker: 'TABLEAU DE BORD',
      title: 'Ton espace nutritionnel, simple et motivant.',
      text: 'Retrouve rapidement tes calories, tes macros, ton historique et les produits à découvrir dans une interface plus claire, vivante et agréable à utiliser.',
      points: ['Vue rapide', 'Calories & macros', 'Découverte'],
      badgeTitle: 'Dashboard', badgeText: 'Fresh overview',
      img: 'assets/sections/home-photo.webp', alt: 'Photo réaliste d’un bowl healthy avec saumon, avocat et légumes frais.'
    },
    'page-health': {
      kicker: 'SUIVI SANTÉ',
      title: 'Suivi personnel plus lisible, plus humain.',
      text: 'Calories, humeur, énergie, poids, sommeil et sport : chaque information importante reste visible sans surcharger la page.',
      points: ['Humeur', 'Sommeil', 'Progression'],
      badgeTitle: 'Health', badgeText: 'Daily tracking',
      img: 'assets/sections/health-photo.webp', alt: 'Photo lifestyle bien-être avec smoothie, yoga mat, eau citronnée et montre connectée.'
    },
    'page-journal': {
      kicker: 'LABO & DÉCOUVERTE',
      title: 'Explorer les produits devient plus intuitif.',
      text: 'Recherche, scan et outils d’exploration sont rassemblés dans un espace plus fluide pour comprendre rapidement ce que tu consommes.',
      points: ['Recherche', 'Découverte', 'Outils'],
      badgeTitle: 'Labo', badgeText: 'Explore & compare',
      img: 'assets/sections/journal-photo.webp', alt: 'Photo éditoriale de produits sains, carnet et loupe pour la découverte nutritionnelle.'
    },
    'page-ai': {
      kicker: 'COACH INTELLIGENT',
      title: 'Un assistant plus premium et rassurant.',
      text: 'Le module Coach bénéficie d’un look plus moderne pour poser des questions, relire tes données et obtenir des réponses plus confortablement.',
      points: ['Assistant', 'Bilan', 'Conseils'],
      badgeTitle: 'Coach', badgeText: 'Nutrix AI',
      img: 'assets/sections/coach-photo.webp', alt: 'Photo premium d’un espace de travail bien-être avec laptop et ambiance coach nutritionnel.'
    },
    'page-faq': {
      kicker: 'À PROPOS DU PROJET',
      title: 'Présenter Nutrix avec une identité plus professionnelle.',
      text: 'La partie projet devient plus claire pour expliquer la vision, les fonctionnalités et les sources avec une présentation plus crédible.',
      points: ['Projet', 'Fonctions', 'Sources'],
      badgeTitle: 'Projet', badgeText: 'About Nutrix',
      img: 'assets/sections/project-photo.webp', alt: 'Photo de présentation créative du projet Nutrix avec tablette, croquis et repas sain.'
    }
  };

  function createHero(cfg){
    const wrap = document.createElement('section');
    wrap.className = 'nx-section-hero reveal-up';
    wrap.innerHTML = `
      <div class="nx-hero-copy">
        <span class="nx-hero-kicker">${cfg.kicker}</span>
        <h2 class="nx-hero-title">${cfg.title}</h2>
        <p class="nx-hero-text">${cfg.text}</p>
        <div class="nx-hero-points">${cfg.points.map(p => `<span class="nx-hero-point"><i></i>${p}</span>`).join('')}</div>
      </div>
      <div class="nx-hero-media" aria-hidden="false">
        <span class="nx-hero-orb nx-hero-orb--one"></span>
        <span class="nx-hero-orb nx-hero-orb--two"></span>
        <span class="nx-hero-orb nx-hero-orb--three"></span>
        <div class="nx-hero-photo-shell">
          <img class="nx-hero-photo" src="${cfg.img}" loading="lazy" decoding="async" width="900" height="675" alt="${cfg.alt}">
          <div class="nx-hero-badge"><div>${cfg.badgeTitle}<span>${cfg.badgeText}</span></div></div>
        </div>
      </div>`;
    return wrap;
  }

  function injectHeroes(){
    Object.entries(heroMap).forEach(([id, cfg]) => {
      const page = document.getElementById(id);
      if (!page || page.querySelector('.nx-section-hero')) return;
      const hero = createHero(cfg);
      page.insertBefore(hero, page.firstElementChild);
    });
  }

  function addRevealClasses(){
    const selectors = [
      '.v10-panel','.card','.explore-panel','.nx-morocco','.space-module','.v111-about article','.ai-chip','.v11-shortcuts button','.explore-hero','.nutri-hero','.ai-heading','.v111-about','.hero.card'
    ];
    document.querySelectorAll(selectors.join(','))
      .forEach(el => el.classList.add('reveal-up'));
  }

  function observeReveals(){
    const targets = document.querySelectorAll('.reveal-up');
    if (!('IntersectionObserver' in window)) {
      targets.forEach(t => t.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, {threshold: .12, rootMargin: '0px 0px -40px 0px'});
    targets.forEach(t => io.observe(t));
  }

  function addHeroMotion(){
    document.querySelectorAll('.nx-hero-photo-shell').forEach(shell => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) return;
      shell.addEventListener('mousemove', e => {
        const rect = shell.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - .5;
        const y = (e.clientY - rect.top) / rect.height - .5;
        shell.style.setProperty('--mx', `${x * 8}px`);
        shell.style.setProperty('--my', `${y * 8}px`);
      });
      shell.addEventListener('mouseleave', () => {
        shell.style.setProperty('--mx', '0px');
        shell.style.setProperty('--my', '0px');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.body.classList.add('has-js-motion');
    injectHeroes();
    addRevealClasses();
    observeReveals();
    addHeroMotion();
  });
})();
}catch(e){console.error("[Nutrix] nutrix-atelier-v12-3.js",e)}

/* ===== nutrix-v12-10.js ===== */
try{
/* Nutrix v12.10 — inline barcode/photo nutrition and direct meal logging. */
(() => {
 'use strict';
 const $ = id => document.getElementById(id);
 const area = $('nx-fast-workspace'); if(!area) return;
 const msg = $('nx-fast-message'), result = $('nx-fast-result'), camera = $('nx-fast-camera'), video=$('nx-fast-video');
 let stream=null, detector=null, scanning=false, selected=null, imageURL='';
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const n=v=>(v===null||v===undefined||v===''||!Number.isFinite(Number(v)))?null:Number(v);
 const f=v=>v==null?'—':Number(v).toLocaleString('fr-FR',{maximumFractionDigits:1});
 const say=t=>{msg.textContent=t;};
 function stop(){scanning=false;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}video.srcObject=null;camera.hidden=true;}
 function show(mode){stop();area.hidden=false;result.hidden=true;selected=null;$('nx-fast-code').parentElement.hidden=mode==='photo';say(mode==='photo'?'Choisis une photo nette de ton repas. L’IA affichera uniquement les données confirmées.':'Scanne le code-barres ou saisis-le ci-dessous.');}
 function metrics(p){return [['Énergie',p.kcal,'kcal'],['Protéines',p.proteins,'g'],['Glucides',p.carbs,'g'],['Lipides',p.fat,'g'],['Sucres',p.sugars,'g'],['Sel',p.salt,'g']].map(([name,v,unit])=>`<div class="nx-fast-metric"><span>${name}</span><b>${f(v)}${v===null?'':' '+unit}</b></div>`).join('');}
 function display(p){selected=p;result.hidden=false;result.innerHTML=`<div class="nx-result-top">${p.image?`<img class="nx-result-img" src="${esc(p.image)}" alt="${esc(p.name)}">`:'<div class="nx-result-img nx-result-placeholder">✦</div>'}<div class="nx-result-id"><span class="nx-data-chip">${esc(p.source)}</span><h3>${esc(p.name)}</h3><small>${esc(p.brand||'')} · ${esc(p.base||'pour 100 g')}</small></div></div><div class="nx-fast-metrics">${metrics(p)}</div>${p.source==='Nutrix Vision AI'?'<div class="nx-v131-ai-edit"><p>Estimation IA : corrige les valeurs pour 100 g avant ajout.</p>'+[['kcal','Calories'],['proteins','Protéines'],['carbs','Glucides'],['fat','Lipides']].map(([k,label])=>'<label>'+label+'<input type="number" data-nx-ai-field="'+k+'" value="'+(p[k]??'')+'" min="0" max="9999" step="0.1"></label>').join('')+'</div>':''}<p class="nx-fast-caveat">${esc(p.notice||'Valeurs déclarées pour 100 g. Vérifie l’emballage avant utilisation.')}</p><div class="nx-add-controls"><label>Quantité (g)<input id="nx-fast-grams" type="number" value="100" min="1" max="3000" step="1"></label><label>Repas<select id="nx-fast-meal"><option value="b">Petit-déjeuner</option><option value="l">Déjeuner</option><option value="d">Dîner</option></select></label><button id="nx-fast-add" type="button" class="nx-fast-primary" ${p.source!=='Nutrix Vision AI'&&[p.kcal,p.proteins,p.carbs,p.fat].some(v=>v===null)?'disabled title="Valeurs nutritionnelles incomplètes"':''}>+ Ajouter</button></div>`;
 const hour=new Date().getHours(); $('nx-fast-meal').value=hour<11?'b':hour<16?'l':'d'; say('Analyse affichée. Choisis ton repas et la quantité.');}
 async function lookup(code){const normalized=String(code||'').trim();if(!/^\d{8,14}$/.test(normalized)){say('Entre un code-barres de 8 à 14 chiffres.');return;}stop();say('Recherche du produit…');result.hidden=true;try{const r=await fetch('/api/off/product/'+normalized);const data=await r.json();if(!r.ok)throw Error(data.error||'Service indisponible');const o=data.product;if(!o||data.status===0)throw Error('Produit non trouvé dans Open Food Facts.');const nut=o.nutriments||{};const kj=n(nut['energy-kj_100g']);display({name:o.product_name_fr||o.product_name||o.brands||'Produit sans nom',brand:o.brands||'',image:o.image_front_url||o.image_url||'',source:'Open Food Facts',base:'pour 100 g',kcal:n(nut['energy-kcal_100g'])??(kj===null?null:kj/4.184),proteins:n(nut.proteins_100g),carbs:n(nut.carbohydrates_100g),fat:n(nut.fat_100g),sugars:n(nut.sugars_100g),salt:n(nut.salt_100g),notice:'Données communautaires Open Food Facts, susceptibles d’être incomplètes.'});}catch(e){say(e.message||'Erreur réseau');}}
 $('nx-fast-scan').addEventListener('click',async()=>{show('scan');if(!navigator.mediaDevices?.getUserMedia||!('BarcodeDetector' in window)){say('Lecture caméra non disponible ici. Saisis le code-barres manuellement.');return;}try{detector=new BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e','code_128']});stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false});video.srcObject=stream;camera.hidden=false;scanning=true;const loop=async()=>{if(!scanning)return;try{if(video.readyState>=2){const matches=await detector.detect(video);if(matches.length){const code=matches[0].rawValue;$('nx-fast-code').value=code;await lookup(code);return;}}}catch{}if(scanning)setTimeout(loop,260);};loop();}catch{stop();say('Caméra refusée ou indisponible. Entre le code-barres manuellement.');}});
 $('nx-fast-stop').addEventListener('click',stop);
 $('nx-fast-lookup').addEventListener('click',()=>lookup($('nx-fast-code').value));
 $('nx-fast-code').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();lookup(e.currentTarget.value);}});
 $('nx-fast-photo').addEventListener('click',()=>{show('photo');$('nx-fast-image').click();});
 $('nx-fast-image').addEventListener('change',async e=>{const file=e.target.files?.[0];if(!file)return;show('photo');if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>4*1024*1024){say('Choisis une image JPEG, PNG ou WebP de moins de 4 Mo.');return;}say('✦ Analyse du repas par Nutrix AI…');if(imageURL)URL.revokeObjectURL(imageURL);imageURL=URL.createObjectURL(file);try{const image=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});const res=await fetch('/api/ai/photo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image,mode:'meal'})});const data=await res.json();if(!res.ok)throw Error(data.error||'Analyse indisponible');if(!data.label){say(data.answer||'Valeurs non détectées.');return;}const d=data.label;const is100=/100\s*(g|ml)/i.test(d.portion||'');display({name:d.name||'Repas photographié',brand:'Valeurs à vérifier',image:imageURL,source:'Nutrix Vision AI',base:d.portion||'base inconnue',kcal:is100?n(d.kcal):null,proteins:is100?n(d.proteins):null,carbs:is100?n(d.carbs):null,fat:is100?n(d.fat):null,sugars:is100?n(d.sugars):null,salt:is100?n(d.salt):null,notice:is100?'Photo interprétée par IA : confirme les chiffres, la portion et les ingrédients avant l’ajout.': 'Aucune base 100 g vérifiée : ajout désactivé pour éviter des calories inventées.'});}catch(err){say(err.message||'Analyse impossible');}finally{e.target.value='';}});
 result.addEventListener('click',e=>{if(!e.target.closest('#nx-fast-add')||!selected)return;if(e.target.closest('#nx-fast-add').disabled)return;const grams=n($('nx-fast-grams').value),meal=$('nx-fast-meal').value;if(selected.source==='Nutrix Vision AI'){for(const input of result.querySelectorAll('[data-nx-ai-field]')){const value=Number(input.value);if(!input.value.trim()||!Number.isFinite(value)||value<0||value>9999){say('Corrige les valeurs nutritionnelles avant ajout.');return;}selected[input.dataset.nxAiField]=value;}}if(grams===null||grams<=0||grams>3000){say('Entre une quantité valide de 1 à 3000 g.');return;}if([selected.kcal,selected.proteins,selected.carbs,selected.fat].some(v=>v===null)){say('Valeurs manquantes : impossible d’enregistrer sans vérification.');return;}if(typeof addValues!=='function'){say('Module des repas indisponible.');return;}const scale=grams/100;addValues(meal,selected.kcal*scale,selected.proteins*scale,selected.carbs*scale,selected.fat*scale);if(selected.image){try{const key='sd-meal-images-v111', all=JSON.parse(localStorage.getItem(key)||'{}'),id=`${current}:${meal}`;all[id]=[...(all[id]||[]),{name:selected.name,image:selected.image.startsWith('blob:')?'':selected.image}].slice(-4);localStorage.setItem(key,JSON.stringify(all));}catch{}}say('✓ '+selected.name+' ajouté au repas !');e.target.textContent='✓ Ajouté';e.target.disabled=true;});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
})();
}catch(e){console.error("[Nutrix] nutrix-v12-10.js",e)}

/* ===== nutrix-v12-12.js ===== */
try{
/* Nutrix V12.12: Goal-centered score and calorie home; macros only in Santé */
(()=>{'use strict';
 const el=id=>document.getElementById(id);
 const fmt=n=>Math.round(Math.max(0,Number(n)||0)).toLocaleString('fr-FR');
 const safe=n=>Math.max(0,Number(n)||0);
 const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
 const historyKey='nutrix-motivation-score-v1212';
 function update(){
  if(typeof totals!=='function')return;
  const date=today();let t;try{t=totals(date)}catch{return}if(!t)return;
  let goal=2000,macros={p:100,f:70,c:250};
  try{goal=safe(state.settings.target)||2000;if(typeof macroGoals==='function')macros=macroGoals()}catch{}
  [['cal','kcal',goal,' kcal'],['pro','p',macros.p||100,' g'],['fat','f',macros.f||70,' g'],['carb','c',macros.c||250,' g']].forEach(([name,key,target,unit])=>{
   const value=safe(t[key]);if(el('nx-fit-'+name))el('nx-fit-'+name).textContent=fmt(value);
   if(el('nx-fit-'+name+'-goal'))el('nx-fit-'+name+'-goal').textContent=(name==='cal'?'sur ':'/ ')+fmt(target)+unit;
   if(el('nx-fit-'+name+'-line'))el('nx-fit-'+name+'-line').style.width=Math.min(100,value/Math.max(1,target)*100)+'%';
  });
  if(el('nx-cal-remaining'))el('nx-cal-remaining').textContent=t.kcal>goal?'Objectif dépassé de '+fmt(t.kcal-goal)+' kcal':'Il reste '+fmt(goal-t.kcal)+' kcal';
  let result=null;try{if(typeof computeScore==='function')result=computeScore(date)}catch{}
  const value=result?Math.min(100,Math.max(0,Math.round(result.score))):null;
  const target=85;
  if(el('nx-fit-score'))el('nx-fit-score').innerHTML=(value===null?'0':fmt(value))+'<small>/100</small>';
  if(el('nx-fit-score-line'))el('nx-fit-score-line').style.width=(value===null?0:Math.min(100,value/target*100))+'%';
  if(el('nx-fit-score-foot'))el('nx-fit-score-foot').textContent=value===null?'Ajoute un repas pour démarrer 🌱':value>=target?'🎉 Objectif atteint ! Continue comme ça !':value>=65?'Super progrès ! Encore '+(target-value)+' points pour ton objectif ✨':'Continue, chaque effort te rapproche de ton objectif 💪';
  // Keep a durable daily score record, recomputed from locally saved meals whenever the day changes.
  try{
   const data=JSON.parse(localStorage.getItem(historyKey)||'{}');
   if(value!==null && data[date]!==value){data[date]=value;const keys=Object.keys(data).sort();keys.slice(0,-90).forEach(k=>delete data[k]);localStorage.setItem(historyKey,JSON.stringify(data));}
   const best=Math.max(0,...Object.values(data).filter(v=>Number.isFinite(v)));
   if(el('nx-score-best'))el('nx-score-best').textContent=best?'Meilleur score enregistré : '+best+'/100':'Ton premier score t’attend';
  }catch{}
 }
 document.addEventListener('DOMContentLoaded',()=>{update();setInterval(()=>{if(!document.hidden)update()},1500)});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)update()});
})();
}catch(e){console.error("[Nutrix] nutrix-v12-12.js",e)}

/* ===== nutrix-v12-14.js ===== */
try{
/* Dashboard display patch: robust initial render; core scoring remains in nutrix-v12-12.js. */
(()=>{'use strict';
 const boot=()=>{
  const score=document.getElementById('nx-fit-score');
  if(score && (!score.textContent.trim() || score.textContent.includes('—')))score.innerHTML='0<small>/100</small>';
  const launcher=document.getElementById('health-launchers');
  if(launcher&&!launcher.textContent.trim()&&!launcher.querySelector('button,a'))launcher.hidden=true;
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
}catch(e){console.error("[Nutrix] nutrix-v12-14.js",e)}

/* ===== nutrix-v12-15.js ===== */
try{
/* V12.15 — circular calories card on home with Prot/Fat/Carbs */
(()=>{'use strict';
 const el=id=>document.getElementById(id);
 const fmt=n=>Math.round(Math.max(0,Number(n)||0)).toLocaleString('fr-FR');
 const drawRing=(pct,color='#2f855a',size=178,stroke=14)=>{
   const p=Math.max(0,Math.min(1,Number(pct)||0));
   const r=(size-stroke)/2, c=2*Math.PI*r, off=c*(1-p), h=size/2;
   return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${h}" cy="${h}" r="${r}" fill="none" stroke="rgba(23,59,44,.09)" stroke-width="${stroke}"/><circle cx="${h}" cy="${h}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 ${h} ${h})"/></svg>`;
 };
 const sync=()=>{
   if(typeof totals!=='function') return;
   let t,goal=2000,mac={p:100,f:70,c:250};
   try{t=totals(typeof current==='string'?current:(new Date()).toISOString().slice(0,10));}catch(e){return;}
   try{goal=Math.max(1,Number(state?.settings?.target)||2000); if(typeof macroGoals==='function') mac=macroGoals()||mac;}catch(e){}
   const kcal=Math.max(0,Number(t?.kcal)||0), p=Math.max(0,Number(t?.p)||0), f=Math.max(0,Number(t?.f)||0), c=Math.max(0,Number(t?.c)||0);
   const color=kcal===0?'#d7e2da':(kcal<goal*0.9?'#3b82f6':(kcal<=goal*1.1?'#2f855a':'#e28a22'));
   if(el('nx-home-cal-ring')) el('nx-home-cal-ring').innerHTML=drawRing(kcal/goal,color,178,14);
   if(el('nx-fit-cal')) el('nx-fit-cal').textContent=fmt(kcal);
   if(el('nx-fit-cal-goal')) el('nx-fit-cal-goal').textContent='sur '+fmt(goal)+' kcal';
   if(el('nx-cal-remaining')) el('nx-cal-remaining').textContent = kcal>goal ? 'Objectif dépassé de '+fmt(kcal-goal)+' kcal' : 'Il reste '+fmt(goal-kcal)+' kcal';
   const map=[['pro',p,mac.p||100],['fat',f,mac.f||70],['carb',c,mac.c||250]];
   map.forEach(([name,val,target])=>{
      if(el('nx-home-'+name)) el('nx-home-'+name).textContent=fmt(val)+'g';
      if(el('nx-home-'+name+'-goal')) el('nx-home-'+name+'-goal').textContent='/'+fmt(target)+'g';
      if(el('nx-home-'+name+'-line')) el('nx-home-'+name+'-line').style.backgroundSize=Math.min(100,val/Math.max(1,target)*100)+'% 100%, auto';
   });
 };
 document.addEventListener('DOMContentLoaded',()=>{sync();setInterval(()=>{if(!document.hidden)sync();},1500);});
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync();});
})();
}catch(e){console.error("[Nutrix] nutrix-v12-15.js",e)}

/* ===== nutrix-v12-16.js ===== */
try{
/* V12.16 safeguard against the duplicate health calories module */
(()=>{'use strict';const init=()=>{const legacy=document.querySelector('#page-health .nx-legacy-health-calories');if(legacy){legacy.hidden=true;legacy.setAttribute('aria-hidden','true');}};document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();})();
}catch(e){console.error("[Nutrix] nutrix-v12-16.js",e)}

/* ===== nutrix-v13-core.js ===== */
try{
/* Functional helpers for Nutrix Premium; Node-testable and browser-compatible. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.NutrixV13Core=api;})(typeof globalThis!=='undefined'?globalThis:this,()=>{'use strict';
 const valid=n=>{const v=Number(n);return Number.isFinite(v)&&v>0?v:0;};
 const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
 function dailyScore(input={}){const kcal=valid(input.kcal),goal=valid(input.target)||2000,logged=Number(input.loggedMeals)||0,days=clamp(Number(input.daysLoggedWeek)||0,0,7),protein=valid(input.p),pgoal=valid(input.pGoal)||100;
  if(!kcal&&!logged)return null;
  const consistency=clamp(days/7*100,0,100);
  const logScore=clamp(logged/3*100,0,100);
  const ratio=kcal/goal;
  const balance=clamp(100-Math.abs(ratio-1)*65,35,100);
  const proteinScore=protein?clamp(protein/pgoal*100,25,100):40;
  return {score:Math.round(.35*consistency+.30*logScore+.25*balance+.10*proteinScore),parts:[{label:'Régularité',w:35,s:consistency},{label:'Repas suivis',w:30,s:logScore},{label:'Équilibre',w:25,s:balance},{label:'Protéines',w:10,s:proteinScore}]};
 }
 function aggregate(items){return items.reduce((a,x)=>{for(const k of ['kcal','p','c','f'])a[k]+=valid(x[k]);return a;},{kcal:0,p:0,c:0,f:0});}
 function serving(product,grams){const f=valid(grams)/100;return Object.fromEntries(['kcal','p','c','f'].map(k=>[k,Math.round(valid(product[k])*f*10)/10]));}
 return {dailyScore,aggregate,serving,clamp};
});
}catch(e){console.error("[Nutrix] nutrix-v13-core.js",e)}

/* ===== nutrix-v13.js ===== */
try{
/* V13 incremental UX and journal integration. Never deletes legacy stored totals. */
(()=>{'use strict';
 const $=id=>document.getElementById(id),core=window.NutrixV13Core;
 const ledgerKey='nutrix-premium-food-journal-v13';
 let ledger={};try{const raw=JSON.parse(localStorage.getItem(ledgerKey)||'{}');if(raw&&typeof raw==='object'&&!Array.isArray(raw))ledger=raw;}catch{}
 const saveLedger=()=>{try{localStorage.setItem(ledgerKey,JSON.stringify(ledger));}catch{}};
 const escape=s=>String(s||'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
 const val=n=>{let v=Number(n);return Number.isFinite(v)&&v>=0?v:0};
 const today=()=>typeof current==='string'?current:new Date().toISOString().slice(0,10);
 function goalUI(){const target=document.getElementById('nx-score-target');if(!target)return;const prev=document.getElementById('nx-v13-goal');if(prev)return;
  const row=document.createElement('label');row.className='nx-v13-settings';row.textContent='Objectif du score';const input=document.createElement('input');input.id='nx-v13-goal';input.type='number';input.min='40';input.max='100';input.step='1';input.value=String(Math.max(40,Math.min(100,Number(localStorage.getItem('nutrix-v13-score-goal'))||85)));input.setAttribute('aria-label','Objectif du score');row.append(input);row.append(' /100');target.parentElement?.parentElement?.append(row);
  input.addEventListener('change',()=>{input.value=String(Math.max(40,Math.min(100,Number(input.value)||85)));localStorage.setItem('nutrix-v13-score-goal',input.value);scoreUI();});
 }
 function scoreUI(){if(typeof totals!=='function'||typeof state==='undefined')return;let totalsToday;try{totalsToday=totals(today());}catch{return;}
 const week=typeof weekOf==='function'?weekOf(today()):[today()];const daysLogged=week.filter(d=>totals(d).kcal>0).length;
 const logged=(Object.values(dayData(today()).meals||{})).filter(m=>val(m.kcal)>0).length;
 const result=core.dailyScore({...totalsToday,target:state.settings.target,pGoal:typeof macroGoals==='function'?macroGoals().p:100,loggedMeals:logged,daysLoggedWeek:daysLogged});
 const goal=Math.max(40,Math.min(100,Number(localStorage.getItem('nutrix-v13-score-goal'))||85));
 if($('nx-score-target'))$('nx-score-target').textContent=String(goal);
 if($('nx-fit-score'))$('nx-fit-score').innerHTML=String(result?.score??0)+'<small>/100</small>';
 if($('nx-fit-score-line'))$('nx-fit-score-line').style.width=String(result?Math.min(100,result.score/goal*100):0)+'%';
 if($('nx-fit-score-foot'))$('nx-fit-score-foot').textContent=!result?'Ajoute ton premier repas pour commencer 🌱':result.score>=goal?'🎉 Objectif atteint !':result.score>=goal-15?'Excellent progrès ! Continue ✨':'Chaque repas suivi te rapproche de ton objectif';
 const scoresKey='nutrix-v13-score-history';try{const history=JSON.parse(localStorage.getItem(scoresKey)||'{}');if(result){history[today()]=result.score;localStorage.setItem(scoresKey,JSON.stringify(history));}const best=Math.max(0,...Object.values(history).map(Number).filter(Number.isFinite));if($('nx-score-best'))$('nx-score-best').textContent=best?'Record personnel : '+best+'/100':'Ton premier score t’attend';}catch{}
 }
 function entries(){return ledger[today()]||[];}
 function logAdded(meal,item){const date=today(),list=ledger[date]||(ledger[date]=[]);const id=Date.now().toString(36)+Math.random().toString(36).slice(2,7);list.push({id,meal,name:String(item.name||'Aliment').slice(0,120),grams:val(item.grams)||100,kcal:val(item.kcal),p:val(item.p),c:val(item.c),f:val(item.f),time:Date.now()});saveLedger();renderJournal();}
 function adjustMeal(meal,item,factor){if(typeof writeDay!=='function')return;const m=writeDay(today()).meals;const target=m[meal]||(m[meal]={});for(const k of ['kcal','p','c','f'])target[k]=String(Math.round(Math.max(0,val(target[k])+val(item[k])*factor)*10)/10);save();renderMeals();updateSummary();renderJournal();}
 function renderJournal(){const cards=document.getElementById('meals');if(!cards)return;
  cards.querySelectorAll('.nx-v13-journal').forEach(n=>n.remove());const list=entries();const groups=[['b','Petit-déjeuner'],['l','Déjeuner'],['d','Dîner'],['s','Collation']];const mealCards=[...cards.children];
  groups.forEach(([id,label],index)=>{const data=list.filter(item=>item.meal===id);if(!data.length)return;let host=mealCards[index];if(!host){host=document.createElement('div');host.className='card';host.innerHTML='<h3>'+label+'</h3>';cards.append(host);}
  const section=document.createElement('section');section.className='nx-v13-journal';section.innerHTML='<div class="nx-v13-journal-heading">Aliments enregistrés · '+escape(label)+'</div>'+data.map(x=>'<div class="nx-v13-item"><div><strong>'+escape(x.name)+'</strong><small>'+Math.round(x.grams)+' g · '+Math.round(x.kcal)+' kcal</small></div><button type="button" data-nx-v13-edit="'+escape(x.id)+'" aria-label="Modifier '+escape(x.name)+'">Modifier</button><button type="button" data-nx-v13-duplicate="'+escape(x.id)+'" aria-label="Dupliquer '+escape(x.name)+'">Dupliquer</button><button type="button" data-nx-v13-delete="'+escape(x.id)+'" aria-label="Supprimer '+escape(x.name)+'">Supprimer</button></div>').join('');host.append(section);
  });
 }
 function listenJournal(){document.addEventListener('click',event=>{const del=event.target.closest('[data-nx-v13-delete]'),edit=event.target.closest('[data-nx-v13-edit]'),dup=event.target.closest('[data-nx-v13-duplicate]');const btn=del||edit||dup;if(!btn)return;const list=entries(),id=btn.dataset.nxV13Delete||btn.dataset.nxV13Edit||btn.dataset.nxV13Duplicate,idx=list.findIndex(x=>x.id===id);if(idx<0)return;const old=list[idx];
  if(dup){const copy={...old,id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),time:Date.now()};list.push(copy);saveLedger();adjustMeal(copy.meal,copy,1);return;}
  if(del){if(!confirm('Supprimer cet aliment du repas ?'))return;list.splice(idx,1);saveLedger();adjustMeal(old.meal,old,-1);return;}
  const raw=prompt('Nouvelle quantité en grammes',String(old.grams));if(raw===null)return;const newGrams=Number(String(raw).replace(',','.'));if(!Number.isFinite(newGrams)||newGrams<=0||newGrams>10000){alert('Quantité invalide');return;}
  const updated={...old,grams:newGrams};const ratio=newGrams/old.grams;for(const k of ['kcal','p','c','f'])updated[k]=Math.round(val(old[k])*ratio*10)/10;
  adjustMeal(old.meal,old,-1);list[idx]=updated;saveLedger();adjustMeal(old.meal,updated,1);
 });}
 // Hook into existing validated addFood; legacy totals stay the source of truth.
 function installHooks(){if(typeof addFood==='function' && !addFood.__v13){const existing=addFood;window.addFood=function(food){const grams=val($('food-grams')?.value)||100,meal=$('food-meal')?.value||'l';const d=core.serving(food,grams);existing(food);logAdded(meal,{...d,name:food.name,grams});};window.addFood.__v13=true;}
  if(typeof addValues==='function'&&!addValues.__v13){const existing=addValues;window.addValues=function(meal,kcal,p,c,f){existing(meal,kcal,p,c,f);logAdded(meal,{name:'Produit ou repas analysé',grams:100,kcal,p,c,f});};window.addValues.__v13=true;}
  if(typeof renderMeals==='function'&&!renderMeals.__v13){const original=renderMeals;window.renderMeals=function(...args){const out=original(...args);renderJournal();return out};window.renderMeals.__v13=true;}
 }
 document.addEventListener('DOMContentLoaded',()=>{goalUI();installHooks();listenJournal();renderJournal();scoreUI();document.addEventListener('change',e=>{if(e.target.matches('[data-meal],[data-setting],#s-target'))scoreUI()});document.querySelectorAll('[data-shift]').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>{renderJournal();scoreUI()},100)));setInterval(()=>{if(!document.hidden)scoreUI()},3000);});
})();
}catch(e){console.error("[Nutrix] nutrix-v13.js",e)}

/* ===== nutrix-v13-2.js ===== */
try{
/* Nutrix V13.2 — progressive enhancement of existing metrics. */
(()=>{'use strict';const $=id=>document.getElementById(id);const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));const value=n=>Math.max(0,Number(n)||0);const format=n=>Math.round(value(n)).toLocaleString('fr-FR');
 function refresh(){if(typeof totals!=='function'||typeof state==='undefined')return;const date=typeof current==='string'?current:new Date().toISOString().slice(0,10);let t,g;try{t=totals(date);g=macroGoals()}catch{return}
 for(const [key,field] of [['pro','p'],['carb','c'],['fat','f']]){const n=value(t[field]),target=value(g[field])||1,pct=clamp(n/target*100,0,100);const ring=document.querySelector('.nx-premium-macro[data-macro="'+key+'"] .nx-premium-macro-ring');if(ring)ring.style.setProperty('--percent',pct+'%');if($('nx-premium-'+key+'-pct'))$('nx-premium-'+key+'-pct').textContent=Math.round(n/target*100)+' %';if($('nx-premium-'+key+'-sum'))$('nx-premium-'+key+'-sum').textContent=format(n)+' / '+format(target)+' g';}
 let result=null;try{const days=weekOf(date).filter(d=>totals(d).kcal>0).length,logged=Object.values(dayData(date).meals||{}).filter(m=>value(m.kcal)>0).length;result=window.NutrixV13Core?.dailyScore({...t,target:state.settings.target,pGoal:g.p,loggedMeals:logged,daysLoggedWeek:days});}catch{}
 const score=value(result?.score),ring=$('nx-premium-score-ring'),thresholds=[{min:0,name:'Départ'},{min:25,name:'Régulier'},{min:55,name:'Champion'},{min:85,name:'Légende'}];const tier=thresholds.filter(x=>score>=x.min).at(-1),next=thresholds.find(x=>x.min>score);if(ring){ring.style.setProperty('--score-percent',score+'%');ring.style.setProperty('--score-color',score>=85?'#21a17b':score>=55?'#32aeb6':score>=25?'#9069d5':'#a7b5b0')}
 if($('nx-premium-level'))$('nx-premium-level').textContent=tier.name;
 if($('nx-premium-next'))$('nx-premium-next').textContent=next?'Prochain palier : '+next.name+' ('+next.min+'/100)':'Dernier palier atteint';
 if($('nx-premium-streak'))$('nx-premium-streak').textContent=(typeof streak==='function'?streak():0)+' jour(s) de suivi consécutifs';
 if($('nx-premium-challenge'))$('nx-premium-challenge').textContent=t.kcal>0?'Défi : compléter ton suivi alimentaire':'Défi : enregistrer ton premier repas';
 }
 function initAI(){const button=$('nx-inline-ai-button'),panel=$('nx-inline-ai-panel'),message=$('nx-inline-ai-message'),close=$('nx-inline-ai-close');if(!button||!panel)return;
 const toggle=open=>{panel.hidden=!open;button.setAttribute('aria-expanded',String(open));if(open){if(typeof totals!=='function'){message.textContent='Conseil indisponible pour le moment.';return}let t,goal;try{t=totals(typeof current==='string'?current:new Date().toISOString().slice(0,10));goal=value(state.settings.target)||2000}catch{message.textContent='Conseil indisponible pour le moment.';return}
 // Informative local suggestion based only on recorded figures; no fabricated AI response.
 message.textContent=!t.kcal?'Commence par enregistrer un repas : ton suivi te permettra ensuite de recevoir un conseil adapté.':t.kcal>goal?'Tu as dépassé ton objectif indicatif aujourd’hui. Continue ton suivi sans te culpabiliser et adapte tes prochains repas à ta faim.':'Tu as enregistré '+format(t.kcal)+' kcal sur '+format(goal)+' kcal. Continue à noter tes repas pour mieux comprendre tes habitudes.';
 }};button.addEventListener('click',()=>toggle(panel.hidden));close?.addEventListener('click',()=>toggle(false));}
 document.addEventListener('DOMContentLoaded',()=>{initAI();refresh();document.addEventListener('change',refresh);document.addEventListener('click',e=>{if(e.target.closest('[data-shift],#food-search-btn,[data-nx-v13-delete],[data-nx-v13-duplicate],[data-nx-v13-edit]'))setTimeout(refresh,100)});setInterval(()=>{if(!document.hidden)refresh()},2000)});
})();
}catch(e){console.error("[Nutrix] nutrix-v13-2.js",e)}

/* ===== nutrix-v13-3.js ===== */
try{
/* Nutrix 13.3 — source-grounded discovery and bilingual UI extensions */
(()=>{'use strict';
const $=id=>document.getElementById(id), lang=()=> $('v111-language')?.value==='ary', safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const L=(fr,ary)=>lang()?ary:fr;
// This dictionary covers existing fixed labels. Product names, ingredient labels and user-generated content retain their original wording.
const words={
'Bonjour':'سلام','Mangez mieux, vivez pleinement.':'كول مزيان وعيش بصحة.','MON SCORE MOTIVATION':'نقطتي التحفيزية','CALORIES DU JOUR':'سعرات اليوم','Macronutriments · Santé':'المغذيات الكبرى · الصحة','Protéines':'البروتينات','Glucides':'الكاربوهيدرات','Lipides':'الدهون','PROTÉINES':'البروتينات','GLUCIDES':'الكاربوهيدرات','LIPIDES':'الدهون','Ajouter un aliment':'زيد مأكول','Rechercher par nom':'قلب على المأكول بالاسم','Chercher':'قلب','Rechercher':'قلب','Code-barres':'الباركود','Scanner':'سكانير','Analyser':'حلّل','Analyse':'التحليل','Quantité (g)':'الكمية (غ)','Repas':'الوجبة','Petit-déjeuner':'الفطور','Déjeuner':'الغدا','Dîner':'العشا','Collation':'وجبة خفيفة','Objectif':'الهدف','Objectifs':'الأهداف','Aujourd’hui':'اليوم','Cette semaine':'هاد السيمانة','Accueil':'الرئيسية','Santé':'الصحة','Labo':'المختبر','Projet':'المشروع','Coach':'المساعد','Réglages':'الإعدادات','Fermer':'سد','Enregistrer':'سجل','Ajouter':'زيد','Supprimer':'حيد','Modifier':'بدّل','Dupliquer':'كرر','Annuler':'إلغاء','Calories':'السعرات','Poids':'الوزن','Humeur':'المزاج','Énergie':'الطاقة','Poids du jour (kg)':'وزن اليوم (كلغ)','ANALYSE ALIMENTAIRE':'تحليل الماكلة','Analyser un produit':'حلل منتوج','Caméra':'الكاميرا','Importer une photo':'رفع صورة','STATISTIQUES':'الإحصائيات','Évolution sur 7 jours':'التطور فـ7 أيام','ANALYSES':'التحاليل','Derniers produits':'آخر المنتوجات','Explorer':'اكتشف','Nutrition · actions rapides':'التغذية · إجراءات سريعة','Scan produit':'سكانير المنتوج','Photo repas':'تصويرة الوجبة','Analyse IA':'تحليل بالذكاء الاصطناعي','Prêt':'واجد','Analyse terminée':'سالينا التحليل','Informations nutritionnelles':'معلومات غذائية','Journal alimentaire':'دفتر الماكلة','Historique':'السجل','Favoris':'المفضلة','Gras':'الدهون','Protéines g':'البروتينات غ','Glucides g':'الكاربوهيدرات غ','Lipides g':'الدهون غ','Score du jour':'نقطة اليوم','Conseil IA':'نصيحة الذكاء الاصطناعي','Ajouter à mon repas':'زيد لوجبتي','Sauvegarder':'حفظ','Mon objectif':'الهدف ديالي','Maintenir mon poids':'نحافظ على الوزن','Perdre du poids (−500 kcal)':'ننقص فالوزن (−500 سعرة)','Prendre du muscle (+300 kcal)':'نزيد العضلات (+300 سعرة)','Calculer':'احسب','Poids (kg)':'الوزن (كلغ)','Taille (cm)':'الطول (سم)','Âge':'العمر','Sexe':'الجنس','Homme':'راجل','Femme':'مرا','Niveau d’activité':'مستوى النشاط','Thème sombre automatique':'المظهر الداكن تلقائياً','Choisir une photo':'اختار تصويرة','Rappels':'التذكيرات','Activer les rappels':'فعل التذكيرات','Activité':'النشاط','Sélection':'الاختيار','Données et méthode':'المعطيات والمنهجية','Laboratoire nutritionnel':'مختبر التغذية','Consommées':'المستهلكة','Il reste':'باقي','Retour':'رجوع'
};
const reverse=Object.fromEntries(Object.entries(words).map(([k,v])=>[v,k]));
const attrNodes=new WeakMap();
function applyTranslations(){const ar=lang();document.documentElement.lang=ar?'ary':'fr';document.documentElement.dir='ltr';document.querySelectorAll('button,input,select,option,label,span,p,h1,h2,h3,h4,small,strong,div,a').forEach(el=>{if(el.closest('#nx-morocco-items'))return;
 if(el.childNodes.length===1&&el.firstChild.nodeType===3){const v=el.textContent.trim();const mapped=ar?words[v]:reverse[v];if(mapped)el.textContent=el.textContent.replace(v,mapped);}
 if(el.matches('input[placeholder]')){const v=el.getAttribute('placeholder');if(!attrNodes.has(el))attrNodes.set(el,v);const base=attrNodes.get(el);const dict={'ex. poulet grillé, lben, pain':'مثلاً دجاج مشوي، لبن، خبز','Rechercher':'قلب','Votre question':'السؤال ديالك'};el.placeholder=ar?(dict[base]||base):base;}
 });}
const categories=['couscous','sardines','dattes','lentilles','huile olive','flocons avoine','yaourt','harissa','the vert','pois chiches','amandes','riz complet'];
const day=Math.floor((new Date().setHours(0,0,0,0))/86400000),seed=((day%categories.length)+categories.length)%categories.length;
const sources=[categories[seed],categories[(seed+3)%categories.length],categories[(seed+7)%categories.length]];
const holder=$('nx-morocco-items');
const describe=p=>{const n=p.nutriments||{},vals=[['Énergie','الطاقة',n['energy-kcal_100g'],'kcal'],['Protéines','البروتينات',n.proteins_100g,'g'],['Glucides','الكاربوهيدرات',n.carbohydrates_100g,'g'],['Lipides','الدهون',n.fat_100g,'g'],['Sucres','السكر',n.sugars_100g,'g'],['Sel','الملح',n.salt_100g,'g']];return vals.filter(x=>typeof x[2]==='number'&&Number.isFinite(x[2])).map(([fr,ar,val,unit])=>`<span><b>${safe(L(fr,ar))}</b> ${Number(val.toFixed(1))} ${unit}</span>`).join('');};
const NSC={A:'#038141',B:'#85bb2f',C:'#fecb02',D:'#ee8100',E:'#e63e11'};
function nsBadge(g){if(!/^[A-E]$/.test(g))return '';return '<span class="nt-ns" role="img" aria-label="Nutri-Score '+g+'"><small>NUTRI-SCORE</small><span class="nt-ns-row">'+'ABCDE'.split('').map(l=>'<i class="'+(l===g?'on':'')+'" style="--c:'+NSC[l]+'">'+l+'</i>').join('')+'</span></span>';}
function novaBadge(n){if(!(n>=1&&n<=4))return '';const c=['','#038141','#fecb02','#ee8100','#e63e11'][n];return '<span class="nt-nova" role="img" aria-label="NOVA '+n+'"><small>NOVA</small><b style="--c:'+c+';color:'+(n===2?'#222':'#fff')+'">'+n+'</b></span>';}
function greenBadge(e){const m={'a-plus':['A+','#00793f'],a:['A','#038141'],b:['B','#85bb2f'],c:['C','#fecb02'],d:['D','#ee8100'],e:['E','#e63e11']}[e];if(!m)return '';return '<span class="nt-green" role="img" aria-label="Green-Score '+m[0]+'" style="--c:'+m[1]+'"><b>'+m[0]+'</b><span>green<br>score</span></span>';}
function card(p){const name=String(p.product_name_fr||p.product_name||'').slice(0,110),image=p.image_front_small_url||p.image_front_url||p.image_small_url||p.image_url||'',brand=String(p.brands||'').slice(0,85),ingredients=String(p.ingredients_text_fr||p.ingredients_text||'').slice(0,500),grade=String(p.nutriscore_grade||p.nutrition_grades||'').toUpperCase(),code=String(p.code||'').replace(/[^0-9]/g,'');const nov=Number(p.nova_group)||null,all=Array.isArray(p.allergens_tags)?p.allergens_tags.map(x=>String(x).split(':').pop()).slice(0,5).join(', '):'';
 const eco=String(p.ecoscore_grade||p.environmental_score_grade||'').toLowerCase();
 return `<article class="nx-morocco-card nx133-product nt-card"><div class="nx-morocco-image">${image?`<img loading="lazy" src="${safe(image)}" alt="${safe(name)}">`:'<span aria-hidden="true">▤</span>'}</div><div class="nt-card-body"><h4>${safe(name)}</h4><p class="nt-brand">${safe(brand||L('Marque non renseignée','الماركة ما متوفراش'))}</p><div class="nt-badges">${nsBadge(grade)}${novaBadge(nov)}${greenBadge(eco)}</div><details><summary>${safe(L('Valeurs et informations +','القيم والمعلومات +'))}</summary><p class="nx133-section-title">${safe(L('Valeurs pour 100 g · si renseignées','القيم لكل 100غ · إلا كانت متوفرة'))}</p><div class="nx133-values">${describe(p)||safe(L('Valeurs indisponibles','القيم ما متوفراش'))}</div><p><b>${safe(L('Ingrédients :','المكونات:'))}</b> ${safe(ingredients||L('Non renseignés','ما متوفرينش'))}</p>${all?`<p><b>${safe(L('Allergènes déclarés :','المواد المسببة للحساسية المصرح بها:'))}</b> ${safe(all)}</p>`:''}<p><b>${safe(L('Quantité :','الكمية:'))}</b> ${safe(p.quantity||p.serving_size||L('Non indiquée','ما مذكوراش'))}</p>${code?`<a href="https://world.openfoodfacts.org/product/${encodeURIComponent(code)}" target="_blank" rel="noopener noreferrer">${safe(L('Fiche source Open Food Facts ↗','المصدر Open Food Facts ↗'))}</a>`:''}</details></div></article>`;
}
let products=[];
function paint(){if(!holder)return;holder.innerHTML=products.length?products.map(card).join(''):`<p>${L('Aucun produit vérifié disponible pour le moment.','ما كاين حتى منتوج متأكد من معلوماتو دابا.')}</p>`;}
async function load(){if(!holder)return;holder.innerHTML=`<p>${L('Chargement des fiches produits…','كنحملو معلومات المنتوجات…')}</p>`;
const KEY='nx133b-products-'+day;
const pick=r=>{let seen=new Set();return r.flatMap(x=>x.status==='fulfilled'&&Array.isArray(x.value.products)?x.value.products:[]).filter(p=>{const n=String(p?.product_name_fr||p?.product_name||'').trim();const code=String(p?.code||'');if(!n||!code||seen.has(code))return false;seen.add(code);return true;}).slice(0,15);};
const fetchOne=async q=>{for(let i=0;i<2;i++){try{const x=await fetch('/api/off/search?q='+encodeURIComponent(q));if(x.ok)return await x.json();if(x.status!==429&&x.status<500)break;}catch{}await new Promise(r=>setTimeout(r,700));}throw new Error('fail');};
let cached=null;try{cached=JSON.parse(localStorage.getItem(KEY)||'null');}catch{}
if(Array.isArray(cached)&&cached.length){products=cached;paint();}
const r=await Promise.allSettled(sources.map(fetchOne));
const fresh=pick(r);
if(fresh.length){products=fresh;try{localStorage.setItem(KEY,JSON.stringify(fresh));}catch{}}
paint();
if(!products.length){holder.innerHTML=`<div class="nx-empty-state"><svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M17.5 17.5H7a4.5 4.5 0 0 1-.9-8.9M9.2 5.3A6 6 0 0 1 17.9 9.9 4 4 0 0 1 20 13.3"/></svg><strong>${L('Produits indisponibles pour le moment','المنتوجات ما متوفراش دابا')}</strong><span>${L('Vérifie ta connexion puis réessaie.','تأكد من الإنترنت وعاود جرب.')}</span><button type="button" class="nx-retry" id="nx133-retry">${L('Réessayer','عاود جرب')}</button></div>`;document.getElementById('nx133-retry')?.addEventListener('click',()=>load());}}
// Only enrich the existing user-facing discovery section. No invented product data.
document.addEventListener('DOMContentLoaded',()=>{applyTranslations();load();$('v111-language')?.addEventListener('change',()=>{setTimeout(()=>{applyTranslations();paint();},30)});document.querySelectorAll('[data-nx-lang]').forEach(b=>b.addEventListener('click',()=>setTimeout(()=>{applyTranslations();paint();},60)));});
})();
}catch(e){console.error("[Nutrix] nutrix-v13-3.js",e)}
