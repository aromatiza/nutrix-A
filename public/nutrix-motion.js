/* =====================================================================
   NutriX Motion — GSAP + Lenis + effets inspirés de React Bits (nov. 2026)
   - Lenis : défilement fluide (PC)
   - GSAP  : apparitions douces des cartes, hero, ouverture du Scanner
   - Effets « React Bits » réécrits en JS simple (le site n'utilise pas React) :
       BlurText (hero), SpotlightCard (lumière qui suit la souris),
       Magnet (boutons attirés par la souris), ClickSpark (étincelles au clic),
       ShinyText (reflet sur les sur-titres, en CSS)
   - Scanner plein écran avec effet « blast » à l'ouverture
   Si les CDN ne répondent pas, le site marche exactement comme avant.
   Ne supprime ni ne remplace aucune fonctionnalité existante.
   ===================================================================== */
(function () {
  'use strict';
  if (window.__nxMotion) return;
  window.__nxMotion = true;

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var CDN = {
    gsap: 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js',
    lenis: 'https://cdn.jsdelivr.net/npm/lenis@1.3.4/dist/lenis.min.js'
  };

  function load(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.async = true; s.crossOrigin = 'anonymous';
      s.onload = res; s.onerror = function () { rej(new Error('CDN: ' + src)); };
      document.head.appendChild(s);
    });
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ------------------------------------------------------------------
     1. Scanner plein écran + effet blast (marche même sans GSAP)
     ------------------------------------------------------------------ */
  function setupScanner() {
    var box = document.getElementById('nutri-scan-box');
    if (!box || box.dataset.nxFull) return;
    box.dataset.nxFull = '1';
    box.classList.add('nx-scan-full');

    var laser = document.createElement('div'); laser.className = 'nx-scan-laser'; laser.setAttribute('aria-hidden', 'true');
    var blast = document.createElement('div'); blast.className = 'nx-scan-blast'; blast.setAttribute('aria-hidden', 'true');
    var corners = document.createElement('div'); corners.className = 'nx-scan-corners'; corners.setAttribute('aria-hidden', 'true');
    corners.innerHTML = '<i></i><i></i><i></i><i></i>';
    var close = document.createElement('button');
    close.type = 'button'; close.className = 'nx-scan-close';
    close.setAttribute('aria-label', 'Fermer la caméra'); close.title = 'Fermer la caméra';
    close.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
    close.addEventListener('click', function () {
      var stop = document.getElementById('nutri-scan-stop');
      if (stop) stop.click(); else box.hidden = true;
    });
    box.appendChild(corners); box.appendChild(laser); box.appendChild(blast); box.appendChild(close);

    // Un parent avec transform/filtre empêche position:fixed de couvrir l'écran :
    // à l'ouverture on place la boîte directement dans <body>, puis on la remet à sa place.
    var home = document.createComment('nx-scan-box-home');
    box.parentNode.insertBefore(home, box);
    function onToggle() {
      var open = !box.hidden;
      if (open && box.parentNode !== document.body) document.body.appendChild(box);
      if (!open && home.parentNode && box.previousSibling !== home) home.parentNode.insertBefore(box, home.nextSibling);
      document.documentElement.classList.toggle('nx-scan-open', open);
      if (window.__nxLenis) { open ? window.__nxLenis.stop() : window.__nxLenis.start(); }
      if (open) {
        blast.classList.remove('go'); void blast.offsetWidth; blast.classList.add('go');
        if (window.gsap && !reduce) {
          gsap.fromTo(box, { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: .45, ease: 'power3.out' });
          gsap.fromTo(corners.children, { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 1, duration: .55, ease: 'back.out(2)', stagger: .05, delay: .1 });
        }
      }
    }
    new MutationObserver(onToggle).observe(box, { attributes: true, attributeFilter: ['hidden'] });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) close.click(); });
    onToggle();
  }

  /* ------------------------------------------------------------------
     2. ClickSpark (React Bits) — petites étincelles purple au clic
     ------------------------------------------------------------------ */
  function setupClickSpark() {
    if (reduce) return;
    var cv = document.createElement('canvas');
    cv.className = 'nx-spark-canvas'; cv.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cv);
    var ctx = cv.getContext('2d'), sparks = [], dpr = Math.min(2, window.devicePixelRatio || 1), running = false;
    function size() { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
    size(); addEventListener('resize', size, { passive: true });
    function tick(t) {
      ctx.clearRect(0, 0, cv.width, cv.height);
      sparks = sparks.filter(function (s) {
        var p = (t - s.t0) / 420; if (p >= 1) return false;
        var e = 1 - Math.pow(1 - p, 3), d = 6 + e * 22, len = 9 * (1 - e);
        ctx.strokeStyle = s.c; ctx.lineWidth = 2 * dpr; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo((s.x + Math.cos(s.a) * d) * dpr, (s.y + Math.sin(s.a) * d) * dpr);
        ctx.lineTo((s.x + Math.cos(s.a) * (d + len)) * dpr, (s.y + Math.sin(s.a) * (d + len)) * dpr);
        ctx.stroke(); return true;
      });
      if (sparks.length) requestAnimationFrame(tick); else { running = false; ctx.clearRect(0, 0, cv.width, cv.height); }
    }
    document.addEventListener('pointerdown', function (e) {
      if (!e.target.closest('button,.btn,[role=button],a,summary')) return;
      var now = performance.now();
      for (var i = 0; i < 8; i++) sparks.push({ x: e.clientX, y: e.clientY, a: (Math.PI * 2 * i) / 8, t0: now, c: i % 2 ? '#A874FF' : '#EADFC8' });
      if (!running) { running = true; requestAnimationFrame(tick); }
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     3. SpotlightCard (React Bits) — halo qui suit la souris sur les cartes
     ------------------------------------------------------------------ */
  function setupSpotlight() {
    if (!finePointer || reduce) return;
    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest && e.target.closest('.main .card, .main .nt-card, .main .nh-card');
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--nx-mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--nx-my', (e.clientY - r.top) + 'px');
      card.classList.add('nx-spot');
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     4. Magnet (React Bits) — boutons principaux attirés par la souris
     ------------------------------------------------------------------ */
  function setupMagnet() {
    if (!finePointer || reduce || !window.gsap) return;
    var sel = '.nx-big, #nutri-scan-btn, .main .btn:not(.small)';
    document.addEventListener('pointermove', function (e) {
      var b = e.target.closest && e.target.closest(sel);
      if (!b) return;
      var r = b.getBoundingClientRect();
      var x = (e.clientX - (r.left + r.width / 2)) * 0.12, y = (e.clientY - (r.top + r.height / 2)) * 0.18;
      gsap.to(b, { x: x, y: y, duration: .35, ease: 'power3.out', overwrite: 'auto' });
      if (!b.__nxMag) {
        b.__nxMag = true;
        b.addEventListener('pointerleave', function () { gsap.to(b, { x: 0, y: 0, duration: .6, ease: 'elastic.out(1,.45)' }); });
      }
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
     5. Apparitions GSAP (BlurText + cartes) — sans découper le texte,
        pour ne pas gêner la traduction Darija qui lit le DOM.
     ------------------------------------------------------------------ */
  function setupReveals() {
    if (reduce || !window.gsap) return;
    var hero = $('.pulse-hero-inner');
    if (hero) {
      gsap.from(hero.children, { y: 26, opacity: 0, filter: 'blur(10px)', duration: .9, ease: 'power3.out', stagger: .09, delay: .1, clearProps: 'filter,transform,opacity' });
    }
    var seen = new WeakSet();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        gsap.to(en.target, { y: 0, opacity: 1, filter: 'blur(0px)', duration: .7, ease: 'power3.out', clearProps: 'filter,transform,opacity' });
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    function scan() {
      $$('.page.active .card, .page.active .nt-card, .page.active .nh-card, .page.active .nx-banner').forEach(function (el) {
        if (seen.has(el) || el.closest('#nutri-scan-box')) return;
        seen.add(el);
        var r = el.getBoundingClientRect();
        if (r.height === 0 || r.top < innerHeight * 0.92) return; // déjà visible : on ne cache rien
        gsap.set(el, { y: 34, opacity: 0, filter: 'blur(6px)' });
        io.observe(el);
      });
    }
    scan();
    // à chaque changement d'onglet
    document.addEventListener('click', function (e) {
      if (e.target.closest('.tab,[data-tab],[data-go]')) setTimeout(scan, 120);
    });
  }

  /* ------------------------------------------------------------------
     6. Lenis — défilement fluide (PC). Mis en pause dès qu'une fenêtre
        bloque le défilement (chat IA, menus, scanner…).
     ------------------------------------------------------------------ */
  function setupLenis() {
    if (reduce || !window.Lenis) return;
    var lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      autoRaf: true,
      prevent: function (node) {
        return !!(node.closest && node.closest('textarea,select,[role=dialog],[aria-modal=true],.nx-more-sheet,#nutri-scan-box,[data-lenis-prevent]')) ||
          (function (n) { // laisse défiler les zones qui ont leur propre barre de défilement
            while (n && n !== document.body) {
              var s = getComputedStyle(n);
              if (/(auto|scroll)/.test(s.overflowY) && n.scrollHeight > n.clientHeight + 2) return true;
              n = n.parentElement;
            }
            return false;
          })(node);
      }
    });
    window.__nxLenis = lenis;
    setInterval(function () {
      var locked = getComputedStyle(document.body).overflow === 'hidden' || getComputedStyle(document.documentElement).overflow === 'hidden' || document.documentElement.classList.contains('nx-scan-open');
      if (locked && !lenis.isStopped) lenis.stop();
      else if (!locked && lenis.isStopped) lenis.start();
    }, 300);
  }

  function boot() {
    setupScanner();
    setupClickSpark();
    setupSpotlight();
    document.documentElement.classList.add('nx-motion');
    if (reduce) return;
    load(CDN.gsap).then(function () {
      setupReveals();
      setupMagnet();
    }).catch(function () { /* CDN indisponible : le site reste normal */ });
    if (finePointer) load(CDN.lenis).then(setupLenis).catch(function () {});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
