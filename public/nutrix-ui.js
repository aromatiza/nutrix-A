/* NutriX UI — améliorations d'interface (v1)
   1. Photos : compression automatique avant l'envoi à l'IA (plus rapide, plus d'échec « image trop grande »)
   2. Thème clair/sombre : 1 clic = 1 changement, transition fluide, icône soleil/lune animée
   3. Langue FR / Darija : pastille qui glisse, préchargement, rechargement en fondu
   4. Scanner : mini-guide animé « comment scanner »
   5. Studio : robot guide qui explique chaque outil
   Ne supprime aucune fonctionnalité : tout passe par des classes et des éléments ajoutés. */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const ARY = (() => { try { return localStorage.getItem('sd-v111-language') === 'ary'; } catch (e) { return false; } })();
  const L = (fr, ar) => (ARY ? ar : fr);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ======================================================================
     1. Compression des photos
     ====================================================================== */
  const MAX_SIDE = 1280, QUALITY = 0.82, BIG = 900 * 1024;

  const loadImage = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  async function shrinkToDataUrl(src) {
    const img = await loadImage(src);
    const k = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
    const w = Math.max(1, Math.round(img.naturalWidth * k)), h = Math.max(1, Math.round(img.naturalHeight * k));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.drawImage(img, 0, 0, w, h);
    return c.toDataURL('image/jpeg', QUALITY);
  }
  const dataUrlToFile = (url, name) => {
    const [head, b64] = url.split(','); const bin = atob(b64); const u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return new File([u], name.replace(/\.\w+$/, '') + '.jpg', { type: (/data:([^;]+)/.exec(head) || [])[1] || 'image/jpeg' });
  };

  // a) champs « choisir une photo » : on remplace le fichier par une version légère AVANT que l'app le lise
  const done = new WeakSet();
  document.addEventListener('change', async e => {
    const inp = e.target;
    if (!(inp instanceof HTMLInputElement) || inp.type !== 'file' || done.has(inp)) return;
    const f = inp.files && inp.files[0];
    if (!f || !/^image\//.test(f.type || 'image/') || (f.size <= BIG && /jpe?g|png|webp/.test(f.type))) return;
    if (typeof DataTransfer !== 'function') return;
    e.stopImmediatePropagation();
    let out = f;
    try {
      const url = URL.createObjectURL(f);
      try { out = dataUrlToFile(await shrinkToDataUrl(url), f.name || 'photo'); } finally { URL.revokeObjectURL(url); }
      const dt = new DataTransfer(); dt.items.add(out); inp.files = dt.files;
    } catch (err) { /* image illisible : on laisse l'app gérer l'original */ }
    done.add(inp);
    inp.dispatchEvent(new Event('change', { bubbles: true }));
    setTimeout(() => done.delete(inp), 0);
  }, true);

  // b) filet de sécurité : toute image trop lourde envoyée à /api/ai/* est réduite avant l'envoi
  const nativeFetch = window.fetch.bind(window);
  async function lighten(v) {
    if (typeof v === 'string') return (v.length > BIG * 1.37 && /^data:image\//.test(v)) ? shrinkToDataUrl(v).catch(() => v) : v;
    if (Array.isArray(v)) return Promise.all(v.map(lighten));
    if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) o[k] = await lighten(v[k]); return o; }
    return v;
  }
  window.fetch = async function (input, init) {
    try {
      const url = typeof input === 'string' ? input : (input && input.url) || '';
      if (/\/api\/ai\//.test(url) && init && typeof init.body === 'string' && init.body.length > BIG * 1.37 && init.body.includes('"data:image/')) {
        const body = JSON.stringify(await lighten(JSON.parse(init.body)));
        init = Object.assign({}, init, { body });
      }
    } catch (e) { /* corps non JSON : envoi tel quel */ }
    const res = await nativeFetch(input, init);
    try {
      const url = typeof input === 'string' ? input : (input && input.url) || '';
      if (/\/api\/ai\/(photo|vision)/.test(url) && !res.ok) {
        res.clone().json().then(j => toast((j && j.error) || L('Analyse photo indisponible, réessaie.', 'تحليل الصورة ما خدامش دابا، عاود جرب.'))).catch(() => toast(L('Analyse photo indisponible, réessaie.', 'تحليل الصورة ما خدامش دابا، عاود جرب.')));
      }
    } catch (e) { /* rien */ }
    return res;
  };
  // petit message en bas de l'écran (erreurs IA qui étaient silencieuses)
  let toastEl = null, toastT = 0;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div'); toastEl.className = 'nxu-toast';
      toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = String(msg).slice(0, 160);
    toastEl.classList.add('on'); clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('on'), 4200);
  }

  /* ======================================================================
     2. Thème clair / sombre
     ====================================================================== */
  const SUN_MOON = '<svg class="nxu-sm" viewBox="0 0 24 24" aria-hidden="true">' +
    '<mask id="nxu-moon-m"><rect x="0" y="0" width="24" height="24" fill="#fff"/><circle class="nxu-sm-cut" cx="17" cy="7" r="6" fill="#000"/></mask>' +
    '<circle class="nxu-sm-core" cx="12" cy="12" r="5" mask="url(#nxu-moon-m)" fill="currentColor"/>' +
    '<g class="nxu-sm-rays" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
    '<path d="M12 1.5v2M12 20.5v2M1.5 12h2M20.5 12h2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M4.6 19.4 6 18M18 6l1.4-1.4"/></g></svg>';

  function setupTheme() {
    const btn = $('#dark-btn');
    if (!btn || btn.dataset.nxu) return;
    btn.dataset.nxu = '1';
    btn.innerHTML = SUN_MOON;
    const sync = () => {
      const dark = document.body.classList.contains('dark');
      btn.setAttribute('aria-label', dark ? L('Passer en mode clair', 'دوز للوضع الفاتح') : L('Passer en mode sombre', 'دوز للوضع الغامق'));
      btn.title = dark ? L('Mode sombre', 'الوضع الغامق') : L('Mode clair', 'الوضع الفاتح');
      const meta = $('meta[name="theme-color"]'); if (meta) meta.setAttribute('content', dark ? '#0e1211' : '#f6f1e7');
    };
    sync();
    btn.addEventListener('click', e => {
      // 1 clic = clair ↔ sombre (l'ancien cycle auto → clair → sombre donnait l'impression que rien ne se passait)
      e.stopImmediatePropagation(); e.preventDefault();
      const next = document.body.classList.contains('dark') ? 'light' : 'dark';
      try { localStorage.setItem('space-v9-theme', next); } catch (err) { /* stockage plein */ }
      const apply = () => {
        document.body.classList.add('nxu-switching');
        if (typeof window.applyTheme === 'function') { try { window.applyTheme(); } catch (err) { document.body.classList.toggle('dark', next === 'dark'); } }
        else document.body.classList.toggle('dark', next === 'dark');
        sync();
        requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove('nxu-switching')));
      };
      btn.classList.remove('nxu-spin'); void btn.offsetWidth; btn.classList.add('nxu-spin');
      if (document.startViewTransition && !reduce.matches) {
        const r = btn.getBoundingClientRect();
        document.documentElement.style.setProperty('--nxu-x', (r.left + r.width / 2) + 'px');
        document.documentElement.style.setProperty('--nxu-y', (r.top + r.height / 2) + 'px');
        document.startViewTransition(apply);
      } else apply();
    }, true);
    new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  /* ======================================================================
     3. Langue FR / Darija
     ====================================================================== */
  function setupLang() {
    const sw = $('.nx-language-switch');
    if (!sw || sw.dataset.nxu) return;
    sw.dataset.nxu = '1';
    sw.classList.add('nxu-lang');
    if (ARY) sw.classList.add('is-ary');
    const pre = () => {
      if (document.querySelector('link[data-nxu-pre]')) return;
      const l = document.createElement('link'); l.rel = 'prefetch'; l.href = 'nutrix-darija.js'; l.dataset.nxuPre = '1'; document.head.appendChild(l);
    };
    sw.addEventListener('pointerenter', pre, { passive: true });
    sw.addEventListener('touchstart', pre, { passive: true });
    sw.addEventListener('click', e => {
      const b = e.target.closest('[data-nx-lang]'); if (!b) return;
      const toAry = b.dataset.nxLang === 'ary';
      if (toAry === ARY) return;
      sw.classList.toggle('is-ary', toAry);       // la pastille glisse tout de suite
      document.documentElement.classList.add('nxu-leaving');
    }, true);
  }

  /* ======================================================================
     4. Scanner : mini-guide animé
     ====================================================================== */
  const HOWTO = () => `
  <div class="nxu-howto" role="list" aria-label="${esc(L('Comment scanner', 'كيفاش تسكاني'))}">
    <div class="nxu-step" role="listitem">
      <div class="nxu-art nxu-art-aim" aria-hidden="true">
        <svg viewBox="0 0 120 90"><rect x="34" y="6" width="52" height="78" rx="10" class="ph"/><rect x="39" y="15" width="42" height="60" rx="5" class="scr"/>
        <g class="bc">${[0,4,7,10,15,18,22,26,29,33].map((x,i)=>`<rect x="${43+x}" y="34" width="${i%3?2:3}" height="22"/>`).join('')}</g>
        <path class="br" d="M42 26v-5h6M78 26v-5h-6M42 64v5h6M78 64v5h-6"/><rect class="laser" x="42" y="44" width="36" height="2" rx="1"/></svg>
      </div>
      <b><i class="nxu-n">1</i> ${esc(L('Vise le code-barres', 'صوّب على الكود-بار'))}</b>
      <span>${esc(L('Mets-le au centre du cadre.', 'خليه فالوسط ديال الإطار.'))}</span>
    </div>
    <div class="nxu-step" role="listitem">
      <div class="nxu-art nxu-art-light" aria-hidden="true">
        <svg viewBox="0 0 120 90"><g class="sun"><circle cx="30" cy="26" r="9"/><path d="M30 10v-4M30 46v-4M14 26h-4M50 26h-4M19 15l-3-3M44 40l-3-3M19 37l-3 3M44 12l-3 3"/></g>
        <rect x="66" y="22" width="34" height="56" rx="8" class="ph"/><rect x="70" y="30" width="26" height="40" rx="4" class="scr"/>
        <path class="dist" d="M20 70h38M20 70l5-4M20 70l5 4M58 70l-5-4M58 70l-5 4"/><text x="39" y="84" text-anchor="middle">10–15 cm</text></svg>
      </div>
      <b><i class="nxu-n">2</i> ${esc(L('Bonne lumière, sans bouger', 'ضو مزيان، وما تحركش'))}</b>
      <span>${esc(L('À 10–15 cm, l’image bien nette.', 'على 10–15 سم، والتصويرة واضحة.'))}</span>
    </div>
    <div class="nxu-step" role="listitem">
      <div class="nxu-art nxu-art-score" aria-hidden="true">
        <svg viewBox="0 0 120 90"><g class="ns">${['#038141','#85bb2f','#fecb02','#ee8100','#e63e11'].map((c,i)=>`<rect x="${14+i*19}" y="30" width="17" height="26" rx="6" fill="${c}" class="g g${i}"/><text x="${22.5+i*19}" y="48" text-anchor="middle">${'ABCDE'[i]}</text>`).join('')}</g>
        <circle class="ok" cx="98" cy="20" r="11"/><path class="okp" d="M93 20l4 4 7-8"/></svg>
      </div>
      <b><i class="nxu-n">3</i> ${esc(L('Ton verdict en 1 seconde', 'النتيجة فثانية'))}</b>
      <span>${esc(L('Nutri-Score, NOVA et additifs expliqués.', 'نوتري سكور، نوفا والإضافات مشروحين.'))}</span>
    </div>
  </div>
  <p class="nxu-tip">💡 ${esc(L('Pas de code-barres ? Prends l’étiquette en photo, l’IA la lit pour toi.', 'ما كاينش الكود-بار؟ صوّر الإتيكيت، والذكاء الاصطناعي يقراها ليك.'))}</p>`;

  function setupScanner() {
    const page = $('#page-nutri'); if (!page || page.querySelector('.nxu-howto')) return;
    const anchor = page.querySelector('.nt-scanhero') || page.querySelector('.nutri-top-grid') || page.querySelector('.nutri-shell');
    if (!anchor) return;
    const box = document.createElement('section');
    box.className = 'nxu-howto-wrap';
    box.innerHTML = HOWTO();
    if (anchor.classList.contains('nt-scanhero')) anchor.after(box); else anchor.prepend(box);
    const btn = $('#nutri-scan-btn');
    if (btn && !btn.querySelector('.nxu-scan-ico')) {
      btn.classList.add('nxu-scan-btn');
      const ico = document.createElement('span');
      ico.className = 'nxu-scan-ico'; ico.setAttribute('aria-hidden', 'true');
      ico.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M4 16v3a1 1 0 0 0 1 1h3M16 20h3a1 1 0 0 0 1-1v-3"/><path d="M8 9v6M11 9v6M13.5 9v6M16 9v6" stroke-width="1.6"/></svg><i></i>';
      btn.prepend(ico);
      // même violet en clair et en sombre (style en ligne : passe devant les anciennes règles !important)
      btn.style.setProperty('background', 'linear-gradient(120deg,#6a3dff,#9b6bff)', 'important');
      btn.style.setProperty('color', '#fff', 'important');
      btn.style.setProperty('box-shadow', '0 12px 28px -12px rgba(124,77,255,.75)', 'important');
    }
  }

  /* ======================================================================
     5. Studio : robot guide
     ====================================================================== */
  const ROBOT = '<svg class="nxu-bot" viewBox="0 0 64 64" aria-hidden="true">' +
    '<line x1="32" y1="6" x2="32" y2="13" class="ant"/><circle cx="32" cy="5" r="3" class="bulb"/>' +
    '<rect x="12" y="13" width="40" height="30" rx="12" class="head"/><rect x="18" y="20" width="28" height="16" rx="8" class="face"/>' +
    '<g class="eyes"><circle cx="26" cy="28" r="3"/><circle cx="38" cy="28" r="3"/></g>' +
    '<path d="M22 47h20a6 6 0 0 1 6 6v5H16v-5a6 6 0 0 1 6-6z" class="body"/><path d="M28 52l4 3 4-3" class="heart"/></svg>';
  const TIPS = {
    plate: [L('Prends ton assiette bien de face, avec tout visible. Je calcule les calories et les macros.', 'صوّر الصحن من الفوق، وكلشي باين. نحسب ليك السعرات والماكرو.'), L('Assiette', 'الصحن')],
    fridge: [L('Photographie l’intérieur de ton frigo : je te propose des repas avec ce que tu as.', 'صوّر داخل الفريجيدير: نقترح عليك ماكلة بداكشي لي عندك.'), L('Frigo', 'الفريجيدير')],
    swap: [L('Choisis deux produits : je te dis lequel est le meilleur pour toi.', 'ختار جوج منتوجات: نقول ليك شكون الأحسن ليك.'), L('Comparer', 'قارن')],
    intelligence: [L('Prends l’étiquette ou les ingrédients en photo, bien nets : je t’explique tout.', 'صوّر الإتيكيت ولا المكونات واضحين: نشرح ليك كلشي.'), L('Analyser', 'حلّل')],
    restaurant: [L('Photographie le menu du restaurant : je te conseille le plat le plus sain.', 'صوّر المنيو ديال الريسطو: ننصحك بالطبق الصحي.'), L('Restaurant', 'الريسطو')]
  };
  let typeTimer = 0;
  function typeText(el, text) {
    clearInterval(typeTimer);
    if (reduce.matches) { el.textContent = text; return; }
    el.textContent = ''; let i = 0;
    typeTimer = setInterval(() => { i += 2; el.textContent = text.slice(0, i); if (i >= text.length) clearInterval(typeTimer); }, 18);
  }
  function setupStudio() {
    const page = $('#page-studio'); if (!page) return;
    let g = page.querySelector('.nxu-guide');
    if (!g) {
      const ws = $('#ns-workspace', page); if (!ws) return;
      g = document.createElement('div');
      g.className = 'nxu-guide';
      g.setAttribute('role', 'status');
      g.innerHTML = ROBOT + '<div class="nxu-say"><small></small><p></p></div>';
      ws.before(g);
      const tabs = $('#ns-tabs', page);
      if (tabs) tabs.addEventListener('click', () => setTimeout(updateStudio, 60));
    }
    updateStudio();
  }
  let lastTool = '';
  function updateStudio() {
    const g = $('#page-studio .nxu-guide'); if (!g) return;
    const on = $('#ns-tabs button.on'); const tool = (on && on.dataset.tool) || 'plate';
    if (tool === lastTool) return; lastTool = tool;
    const t = TIPS[tool] || TIPS.plate;
    g.querySelector('small').textContent = 'Nutrix · ' + t[1];
    g.classList.remove('nxu-pop'); void g.offsetWidth; g.classList.add('nxu-pop');
    typeText(g.querySelector('p'), t[0]);
  }

  /* ---------------- démarrage ---------------- */
  const boot = () => {
    setupTheme(); setupLang(); setupScanner(); setupStudio();
    // les onglets sont rendus à la demande : on réessaie quand une page devient active
    new MutationObserver(muts => {
      for (const m of muts) {
        const t = m.target;
        if (t.classList && t.classList.contains('page') && t.classList.contains('active')) {
          if (t.id === 'page-nutri') setTimeout(setupScanner, 50);
          if (t.id === 'page-studio') { lastTool = ''; setTimeout(setupStudio, 80); }
        }
      }
    }).observe($('main') || document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
  };
  if (document.readyState === 'complete') setTimeout(boot, 30);
  else addEventListener('load', () => setTimeout(boot, 30), { once: true });
})();
