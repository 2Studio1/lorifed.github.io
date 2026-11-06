// Nebbia — concept Brand & Portfolio di 21studio. Pattern ispirato a Exo Ape (Awwwards SOTM maggio 2022), codice e asset nostri.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(pointer: fine)').matches;
  const MOB = () => innerWidth < 860;
  gsap.registerPlugin(ScrollTrigger);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!RM) {
    lenis = new Lenis({ lerp: .09 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  const scrollToId = (id) => { const el = $(id); if (!el) return; lenis ? lenis.scrollTo(el, { duration: 1.6 }) : el.scrollIntoView(); };
  $$('a[href^="#"]:not([data-case])').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href'); if (id.length < 2) return; e.preventDefault();
    if (menuOpen) { closeMenu(); setTimeout(() => scrollToId(id), 650); } else scrollToId(id);
  }));

  /* ---------- nav ---------- */
  const nav = $('[data-nav]');
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 60);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- preloader + ingresso ---------- */
  const loader = $('.loader');
  const done = () => { document.body.classList.remove('is-loading'); lenis?.start(); };
  if (RM) { loader.remove(); done(); }
  else {
    const n = { v: 0 }, num = $('.loader-n');
    const img = $('.hero-media img');
    gsap.set('.hero .giant .row>span', { yPercent: 115 });
    gsap.set(['.hero-p', '.hero-foot', '.scroll-cue', '.nav'], { autoAlpha: 0, y: 24 });
    const ready = img.decode ? img.decode().catch(() => {}) : Promise.resolve();
    gsap.timeline()
      .to(n, { v: 100, duration: 1.3, ease: 'power2.inOut', onUpdate: () => { num.textContent = Math.round(n.v); } })
      .add(() => ready)
      .to('.loader-mark', { rotate: -90, duration: .6, ease: 'expo.inOut' }, '-=.3')
      .to(loader, { yPercent: -100, duration: 1.1, ease: 'expo.inOut' })
      .fromTo('.hero-media', { clipPath: 'inset(26% 30% 26% 30%)', rotate: 4 }, { clipPath: 'inset(0% 0% 0% 0%)', rotate: 0, duration: 1.6, ease: 'expo.inOut' }, '<.1')
      .fromTo(img, { scale: 1.5 }, { scale: 1, duration: 1.9, ease: 'expo.inOut' }, '<')
      .to('.hero .giant .row>span', { yPercent: 0, duration: 1.5, stagger: .1, ease: 'expo.out' }, '-=.75')
      .to(['.nav', '.hero-p', '.hero-foot', '.scroll-cue'], { autoAlpha: 1, y: 0, duration: 1.2, stagger: .08, ease: 'expo.out' }, '<.1')
      .add(() => { loader.remove(); done(); }, '<');
  }

  /* ---------- scroll: parallasse e rivelazioni ---------- */
  if (!RM) {
    gsap.to('.hero-media img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    $$('.lavori .giant, .diario .mid, .foot .mid').forEach((h) => gsap.from($$('.row>span', h), { yPercent: 115, duration: 1.5, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: h, start: 'top 85%' } }));
    $$('.work figure, .still, .fl').forEach((f) => {
      const st = { trigger: f, start: 'top 92%' };
      gsap.fromTo(f, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.out', scrollTrigger: st });
      gsap.fromTo($('img', f), { scale: 1.35 }, { scale: 1, duration: 1.9, ease: 'expo.out', scrollTrigger: st });
    });
    $$('[data-speed]').forEach((el) => {
      const s = +el.dataset.speed; if (!s) return;
      const d = () => s * innerHeight * (MOB() ? .15 : .45);
      gsap.fromTo(el, { y: () => -d() }, { y: () => d(), ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true } });
    });
    $$('.intro [data-lines], .diario-p, .notes li, .foot-p, .cap, .kick').forEach((p) => gsap.from(p, { y: 30, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 92%' } }));

    // showreel: la cornice cresce fino a tutto schermo e le parole si allontanano
    const frame = $('.reel-frame'), shots = $$('img', frame);
    let shown = 0;
    gsap.timeline({ scrollTrigger: { trigger: '.reel', start: 'top top', end: 'bottom bottom', scrub: 1,
      onUpdate: (st) => {
        const i = Math.min(shots.length - 1, Math.floor(Math.max(0, st.progress - .32) / .68 * shots.length));
        if (i !== shown) { shots[shown].style.opacity = 0; shots[i].style.opacity = 1; shown = i; }
      } } })
      .to(frame, { width: '100vw', height: '100svh', duration: 1, ease: 'power3.inOut' }, 0)
      .to('.rw-l', { xPercent: -40, duration: 1, ease: 'power3.inOut' }, 0)
      .to('.rw-r', { xPercent: 40, duration: 1, ease: 'power3.inOut' }, 0)
      .to('.reel-pin .kick', { autoAlpha: 0, duration: .3 }, 0)
      .to(shots, { scale: 1.12, duration: 2.2, ease: 'none' }, 0)
      .to({}, { duration: 1.2 });

    // anello e luna del footer
    const moon = $('.moon'); let a = 0;
    gsap.ticker.add((t, dt) => { a += dt * .0007; const s = Math.sin(a); moon.setAttribute('cx', 200 + 190 * Math.cos(a)); moon.setAttribute('cy', 100 + 34 * s); moon.style.opacity = s < 0 ? .25 : 1; });
    gsap.fromTo('.orb', { rotate: -8, y: 60 }, { rotate: 6, y: -40, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  }

  /* ---------- cursore ---------- */
  const cur = $('.cursor');
  if (FINE && !RM) {
    const xTo = gsap.quickTo(cur, 'x', { duration: .45, ease: 'power3' }), yTo = gsap.quickTo(cur, 'y', { duration: .45, ease: 'power3' });
    addEventListener('pointermove', (e) => { xTo(e.clientX); yTo(e.clientY); });
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('.work, .case-next');
      cur.classList.toggle('big', !!t);
      if (t) $('span', cur).textContent = t.classList.contains('case-next') ? 'Avanti' : 'Apri';
    });
  }

  /* ---------- menu ---------- */
  const menu = $('#menu'), menuBtn = $('[data-menu]');
  let menuOpen = false;
  function openMenu() {
    menuOpen = true; menu.hidden = false; nav.classList.add('menu-open'); menuBtn.setAttribute('aria-expanded', 'true'); $('span', menuBtn).textContent = 'Chiudi'; lenis?.stop();
    if (RM) { menu.style.clipPath = 'none'; return; }
    gsap.to(menu, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'expo.inOut' });
    gsap.fromTo('.menu nav a span', { yPercent: 110 }, { yPercent: 0, stagger: .06, duration: 1.2, ease: 'expo.out', delay: .35 });
  }
  function closeMenu() {
    menuOpen = false; nav.classList.remove('menu-open'); menuBtn.setAttribute('aria-expanded', 'false'); $('span', menuBtn).textContent = 'Menu';
    const end = () => { menu.hidden = true; lenis?.start(); };
    if (RM) return end();
    gsap.to(menu, { clipPath: 'inset(0% 0% 100% 0%)', duration: .8, ease: 'expo.inOut', onComplete: end });
  }
  menuBtn.addEventListener('click', () => (menuOpen ? closeMenu() : openMenu()));

  /* ---------- casi studio: transizione immagine → pagina ---------- */
  const CASES = [
    { slug: 'selvara', title: ['Tenuta', 'Selvàra'], client: 'Tenuta Selvàra, cantina di Langa', serv: 'Identità, etichette, sito e-commerce', year: '2026', cover: 'selvara-rosso', imgs: ['selvara-cantina', 'selvara-bianco', 'selvara-riserva'],
      lead: 'Un vino per schermata: il sito si legge come una carta dei vini, con calma.',
      text: 'Abbiamo fotografato le bottiglie come ritratti, disegnato un carattere per le etichette e costruito un negozio dove ogni vino ha la sua pagina e il suo racconto di vendemmia.' },
    { slug: 'velaro', title: ['Studio', 'Vélaro'], client: 'Studio Vélaro, architetti', serv: 'Portfolio, art direction fotografica', year: '2026', cover: 'velaro-casa', imgs: ['velaro-terme', 'velaro-biblioteca', 'velaro-loft'],
      lead: 'Gli edifici scorrono in orizzontale, come si attraversa una mostra.',
      text: 'Ogni progetto ha una tinta presa dai suoi materiali. Niente schede tecniche in apertura: prima lo spazio, poi i numeri per chi li cerca.' },
    { slug: 'tarvo', title: ['Officine', 'Tarvo'], client: 'Officine Tarvo, meccanica di precisione', serv: 'Marchio, catalogo tecnico, sito B2B', year: '2025', cover: 'tarvo-fresatura', imgs: ['tarvo-tornitura', 'tarvo-rettifica', 'tarvo-collaudo'],
      lead: 'Una manifattura precisa deve sembrare precisa, fino all\'ultimo decimo.',
      text: 'Un indice a righe per le lavorazioni, tolleranze sempre in vista e un catalogo che il commerciale può aggiornare da solo.' },
  ];
  const view = $('[data-case-view]'), sc = $('[data-case-scroll]'), veil = $('.veil');
  let ci = 0, caseOpen = false, lastFocus = null;
  const src = (n) => `img/${n}.webp`;
  function fill(i) {
    ci = i; const c = CASES[i], nx = CASES[(i + 1) % CASES.length];
    $('[data-c-hero]').src = src(c.cover);
    $('[data-c-title]').innerHTML = c.title.map((w) => `<span class="row"><span>${w}</span></span>`).join('');
    $('[data-c-client]').textContent = c.client; $('[data-c-serv]').textContent = c.serv; $('[data-c-year]').textContent = c.year;
    $('[data-c-lead]').textContent = c.lead; $('[data-c-text]').textContent = c.text;
    $('[data-c-imgs]').innerHTML = c.imgs.map((n) => `<figure><img src="${src(n)}" alt="" loading="lazy"></figure>`).join('');
    $('[data-c-next]').textContent = nx.title.join(' ');
    sc.scrollTop = 0;
    if (!RM) {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) return; io.unobserve(e.target);
        gsap.fromTo(e.target, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.out' });
        gsap.fromTo($('img', e.target), { scale: 1.3 }, { scale: 1, duration: 1.8, ease: 'expo.out' }); }), { root: sc, threshold: .1 });
      $$('[data-c-imgs] figure', view).forEach((f) => { f.style.clipPath = 'inset(100% 0% 0% 0%)'; io.observe(f); });
    }
  }
  function revealCase() {
    if (RM) return;
    gsap.fromTo($$('.case-t .row>span'), { yPercent: 115 }, { yPercent: 0, duration: 1.4, stagger: .1, ease: 'expo.out', delay: .1 });
    gsap.fromTo(['.case-meta', '.case-lead'], { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.2, stagger: .08, ease: 'expo.out', delay: .3 });
  }
  function showCase() { view.hidden = false; caseOpen = true; lenis?.stop(); $('[data-case-close]').focus({ preventScroll: true }); }
  function openCase(i, fromImg) {
    lastFocus = document.activeElement; fill(i);
    if (RM) { showCase(); return; }
    lenis?.stop();
    if (fromImg) {
      const r = fromImg.getBoundingClientRect(), clone = new Image();
      clone.src = fromImg.currentSrc || fromImg.src; clone.className = 'flip'; clone.alt = '';
      Object.assign(clone.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
      document.body.append(clone);
      gsap.timeline()
        .to(clone, { left: 0, top: 0, width: innerWidth, height: innerHeight, duration: 1.15, ease: 'expo.inOut' })
        .add(() => { showCase(); revealCase(); requestAnimationFrame(() => clone.remove()); });
    } else veilSwap(() => { showCase(); }, revealCase);
  }
  function veilSwap(mid, after) {
    gsap.timeline()
      .fromTo(veil, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: .75, ease: 'expo.inOut' })
      .add(mid)
      .to(veil, { clipPath: 'inset(0% 0% 100% 0%)', duration: .85, ease: 'expo.inOut' })
      .add(after, '-=.5');
  }
  function closeCase() {
    if (!caseOpen) return;
    const end = () => { view.hidden = true; caseOpen = false; lenis?.start(); lastFocus?.focus?.({ preventScroll: true }); };
    if (RM) return end();
    veilSwap(end, () => {});
  }
  $$('[data-case]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); openCase(+a.dataset.case, $('img', a)); }));
  $('[data-case-close]').addEventListener('click', closeCase);
  $('[data-case-next]').addEventListener('click', () => { const nx = (ci + 1) % CASES.length; if (RM) { fill(nx); return; } veilSwap(() => fill(nx), revealCase); });

  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (caseOpen) closeCase(); else if (menuOpen) closeMenu(); }
    if (e.key === 'Tab' && caseOpen) {
      const f = $$('button, a[href]', view); if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    }
  });
  addEventListener('load', () => ScrollTrigger.refresh());
})();
