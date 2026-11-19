/* NutriX Motion — effets animés (v1). Ne supprime rien, n'ajoute que des classes
   et des calques décoratifs (aria-hidden). Coupé si l'utilisateur préfère moins
   de mouvement ou si localStorage 'nutrix-motion' === 'off'. */
(() => {
  'use strict';
  try { if (localStorage.getItem('nutrix-motion') === 'off') return; } catch (e) { /* stockage indisponible : on continue */ }

  const body = document.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  body.classList.add('nxm');

  const CARD_SEL = [
    '.card', '.pulse-metric-card', '.pulse-diet-card', '.nxs-card', '.v10-panel',
    '.explore-panel', '.nutri-scan-card', '.nutri-search-card', '.nutri-results-card',
    '.explore-results-card', '.nx-postscan-card', '.nx-fast-card', '.nx-premium-macro-card',
    '.pro-ai-panel', '.ai-nutrition-panel'
  ].join(',');
  const REVEAL_SEL = CARD_SEL + ',.pulse-section-head,.nt-fig,.section-title';

  /* ---- barre de scroll ---- */
  const bar = document.createElement('div');
  bar.className = 'nxm-progress';
  bar.setAttribute('aria-hidden', 'true');
  body.appendChild(bar);

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.setProperty('--nxm-p', h > 0 ? Math.min(1, scrollY / h).toFixed(4) : 0);
      ticking = false;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });

  /* ---- mot en couleur dans le titre du hero ---- */
  const highlightHero = () => {
    const h = document.querySelector('.pulse-hero h2, .pulse-hero h1');
    if (!h || h.querySelector('.nxm-hl')) return;
    const texts = [...h.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim());
    const last = texts[texts.length - 1];
    if (!last) return;
    const m = last.textContent.match(/^(.*?)(\S+)(\s*)$/s);
    if (!m) return;
    const span = document.createElement('span');
    span.className = 'nxm-hl';
    span.textContent = m[2];
    last.textContent = m[1];
    last.after(span, document.createTextNode(m[3]));
  };

  /* ---- cartes : calque lumière + inclinaison 3D ---- */
  const prepared = new WeakSet();
  const prepCard = el => {
    if (prepared.has(el)) return;
    prepared.add(el);
    el.classList.add('nxm-card');
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    const g = document.createElement('span');
    g.className = 'nxm-glow';
    g.setAttribute('aria-hidden', 'true');
    el.appendChild(g);
  };

  let tiltEl = null, raf = 0, lastEv = null;
  const applyTilt = () => {
    raf = 0;
    if (!tiltEl || !lastEv) return;
    const r = tiltEl.getBoundingClientRect();
    const x = (lastEv.clientX - r.left) / r.width, y = (lastEv.clientY - r.top) / r.height;
    tiltEl.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
    tiltEl.style.setProperty('--my', (y * 100).toFixed(1) + '%');
  };
  const onMove = e => {
    if (!fine.matches || reduce.matches) return;
    const c = e.target.closest && e.target.closest('.nxm-card');
    tiltEl = c;
    lastEv = e;
    if (c && !raf) raf = requestAnimationFrame(applyTilt);
  };
  document.addEventListener('pointermove', onMove, { passive: true });

  /* ---- boutons : onde au clic ---- */
  document.addEventListener('pointerdown', e => {
    if (reduce.matches) return;
    const b = e.target.closest && e.target.closest('.nx-big, .pulse-btn, .btn');
    if (!b) return;
    const r = b.getBoundingClientRect();
    const s = document.createElement('span');
    s.className = 'nxm-ripple';
    s.setAttribute('aria-hidden', 'true');
    s.style.left = (e.clientX - r.left) + 'px';
    s.style.top = (e.clientY - r.top) + 'px';
    s.style.setProperty('--nxm-r', Math.ceil(Math.max(r.width, r.height) / 5));
    b.appendChild(s);
    s.addEventListener('animationend', () => s.remove(), { once: true });
    setTimeout(() => s.remove(), 900);
  }, { passive: true });

  /* ---- apparition au scroll (seulement ce qui est sous l'écran) ---- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      const el = en.target;
      el.classList.add('nxm-in');
      io.unobserve(el);
      setTimeout(() => el.classList.add('nxm-done'), 800);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }) : null;

  const seen = new WeakSet();
  const prepReveal = el => {
    if (seen.has(el) || !io || reduce.matches) return;
    seen.add(el);
    if (el.closest('.pulse-hero, dialog, [role="dialog"], .ob-root, .nx-modal')) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.top < innerHeight * 0.92) return; // déjà visible ou caché : on ne touche pas
    const sibs = el.parentElement ? [...el.parentElement.children].filter(c => c.matches(REVEAL_SEL)) : [];
    const i = Math.max(0, sibs.indexOf(el));
    el.style.setProperty('--nxm-d', Math.min(i, 4) * 60 + 'ms');
    el.classList.add('nxm-reveal');
    io.observe(el);
  };

  const scan = root => {
    (root.querySelectorAll ? root : document).querySelectorAll(CARD_SEL).forEach(prepCard);
    (root.querySelectorAll ? root : document).querySelectorAll(REVEAL_SEL).forEach(prepReveal);
  };


  /* ---- visite de l'accueil : animer seulement les écrans visibles + compteurs ---- */
  const countUp = (el, to, ms) => {
    const t0 = performance.now();
    const step = t => {
      const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * e);
      if (k < 1 && el.isConnected) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const runCounters = fig => {
    fig.querySelectorAll('.nt-s-vs b, .nt-s-ring b').forEach(b => {
      if (!b.dataset.nxmTo) { const n = parseInt(b.textContent, 10); if (!n) return; b.dataset.nxmTo = n; }
      countUp(b, +b.dataset.nxmTo, 1600);
    });
  };
  const figTimers = new WeakMap();
  const figIO = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const en of entries) {
      const f = en.target;
      if (en.isIntersecting && !reduce.matches) {
        f.classList.add('nxm-play');
        if (!figTimers.has(f)) { runCounters(f); figTimers.set(f, setInterval(() => runCounters(f), 5000)); }
      } else {
        f.classList.remove('nxm-play');
        clearInterval(figTimers.get(f)); figTimers.delete(f);
      }
    }
  }, { threshold: 0.35 }) : null;
  const seenFig = new WeakSet();
  const prepTour = () => {
    if (!figIO) return;
    document.querySelectorAll('.nt-fig').forEach(f => { if (!seenFig.has(f)) { seenFig.add(f); figIO.observe(f); } });
  };

  /* ---- changement d'onglet + nouveaux contenus ---- */
  const enterPage = p => {
    if (reduce.matches) return;
    p.classList.remove('nxm-enter');
    void p.offsetWidth;
    p.classList.add('nxm-enter');
    p.addEventListener('animationend', () => p.classList.remove('nxm-enter'), { once: true });
    requestAnimationFrame(() => scan(p));
  };

  let pending = false;
  const mo = new MutationObserver(muts => {
    let added = false;
    for (const m of muts) {
      if (m.type === 'childList' && m.addedNodes.length && ![...m.addedNodes].every(n => n.classList && n.classList.contains('nxm-ripple'))) added = true;
      if (m.type === 'attributes') {
        const t = m.target;
        if (t.classList.contains('page') && t.classList.contains('active') && !(m.oldValue || '').includes('active')) enterPage(t);
        if (t.classList.contains('tab') && t.classList.contains('active') && !(m.oldValue || '').includes('active') && t.closest('.pulse-nav-links')) {
          t.classList.remove('nxm-pop'); void t.offsetWidth; t.classList.add('nxm-pop');
          setTimeout(() => t.classList.remove('nxm-pop'), 600);
        }
      }
    }
    if (added && !pending) {
      pending = true;
      setTimeout(() => { pending = false; scan(document); highlightHero(); prepTour(); }, 400);
    }
  });

  const start = () => {
    highlightHero();
    scan(document);
    prepTour();
    onScroll();
    mo.observe(body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
  };
  // après les scripts de l'app (tous en defer) et leur premier rendu
  if (document.readyState === 'complete') setTimeout(start, 60);
  else addEventListener('load', () => setTimeout(start, 60), { once: true });
})();
