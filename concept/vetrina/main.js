// Avòrio — concept di 21studio. Pattern da LPAS (Awwwards SOTD 10/10/2026), codice e asset nostri.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const HAS_GSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';

// --- divide i titoli in parole mascherate (per l'ingresso dal basso)
$$('[data-split]').forEach((el) => {
  el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w"><span>${w}</span></span>`).join(' ');
});

// --- smooth scroll
let lenis = null;
if (HAS_GSAP) gsap.registerPlugin(ScrollTrigger, ...(typeof Flip !== 'undefined' ? [Flip] : []));
if (HAS_GSAP && !RM && typeof Lenis !== 'undefined') {
  lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const goTo = (target) => (lenis ? lenis.scrollTo(target, { offset: 0, duration: 1.4 }) : $(target)?.scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }));

// --- loader: lettere verticali, poi il sipario sale
const loader = $('.loader');
function intro() {
  if (!HAS_GSAP || RM) { loader.remove(); return; }
  const tl = gsap.timeline({ onComplete: () => loader.remove() });
  tl.to('.loader span', { opacity: 1, duration: 0.05, stagger: 0.11, ease: 'none' })
    .to(loader, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.inOut' }, '+=0.25')
    .from('.hero-img img', { scale: 1.18, duration: 1.8, ease: 'expo.out' }, '<0.15')
    .from('.hero-h .w>span', { yPercent: 110, duration: 1.2, stagger: 0.035, ease: 'expo.out' }, '<0.35')
    .from('.hero-meta>*', { opacity: 0, y: 12, duration: 0.8, stagger: 0.08, ease: 'power2.out' }, '<0.2');
  loader.style.clipPath = 'inset(0 0 0% 0)';
}
intro();

// --- nav: si aggancia in alto dopo la barra concept
const nav = $('.nav');
const setCb = () => root.style.setProperty('--cb', $('.cbar').offsetHeight + 'px');
setCb(); addEventListener('resize', setCb);
const onScroll = () => {
  nav.classList.toggle('stuck', scrollY > $('.cbar').offsetHeight);
  // logo chiaro sulle sezioni scure, scuro su quelle chiare
  const under = document.elementsFromPoint(40, nav.getBoundingClientRect().bottom - 20).find((el) => !nav.contains(el));
  nav.classList.toggle('on-light', !!under && !under.closest('.areas, .pre, .foot, .cbar'));
};
addEventListener('scroll', onScroll, { passive: true }); onScroll();

// --- menu a tutta pagina
const menu = $('#menu'), mBtn = $('.menu-btn');
function setMenu(open) {
  mBtn.setAttribute('aria-expanded', open);
  $('.mb-t').textContent = open ? 'Chiudi' : 'Menu';
  root.classList.toggle('menu-open', open);
  if (open) {
    menu.hidden = false; lenis?.stop();
    if (HAS_GSAP && !RM) {
      gsap.fromTo(menu, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'expo.inOut' });
      gsap.fromTo('.menu-big li, .menu-mid li, .menu-addr p, .menu .lab', { y: 30, opacity: 0, filter: 'blur(8px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, stagger: 0.04, ease: 'expo.out', delay: 0.35 });
    }
    $('.menu-big a').focus({ preventScroll: true });
  } else {
    lenis?.start();
    if (HAS_GSAP && !RM) gsap.to(menu, { clipPath: 'inset(0 0 100% 0)', duration: 0.7, ease: 'expo.inOut', onComplete: () => (menu.hidden = true) });
    else menu.hidden = true;
  }
}
mBtn.addEventListener('click', () => setMenu(mBtn.getAttribute('aria-expanded') !== 'true'));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); mBtn.focus(); } });

// --- ancore: chiudono il menu e scorrono con Lenis
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href'); if (id.length < 2 || !$(id)) return;
  e.preventDefault();
  if (!menu.hidden) setMenu(false);
  if (more.open) more.close();
  // i pannelli in orizzontale vivono dentro il pin: si scorre fino alla loro posizione nel tragitto
  const st = id.startsWith('#area-') && HAS_GSAP && ScrollTrigger.getById('hz');
  if (st) { const i = +id.slice(6) - 1; const y = st.start + (st.end - st.start) * Math.min(1, (i + 1) / 5); lenis ? lenis.scrollTo(y, { duration: 1.4 }) : scrollTo(0, y); return; }
  goTo(id);
}));

// --- dialog di approfondimento dei pannelli
const more = $('#more');
$$('[data-more]').forEach((b) => b.addEventListener('click', () => {
  $('.more-c', more).innerHTML = $('#' + b.dataset.more).innerHTML;
  $('.more-c h3', more).id = 'more-t';
  more.showModal(); lenis?.stop();
}));
more.addEventListener('close', () => lenis?.start());
$('.more-x').addEventListener('click', () => more.close());
more.addEventListener('click', (e) => { if (e.target === more) more.close(); });

// --- domande (fisarmonica)
$$('.row button').forEach((b) => b.addEventListener('click', () => {
  const open = b.getAttribute('aria-expanded') !== 'true';
  b.setAttribute('aria-expanded', open); b.closest('.row').classList.toggle('open', open);
}));

// --- filtro spazi (con Flip se disponibile)
$$('.sp-f button').forEach((b) => b.addEventListener('click', () => {
  $$('.sp-f button').forEach((x) => x.setAttribute('aria-pressed', x === b));
  const f = b.dataset.f, items = $$('.sp');
  const state = HAS_GSAP && !RM && typeof Flip !== 'undefined' ? Flip.getState(items) : null;
  items.forEach((it) => it.classList.toggle('off', f !== 'tutti' && it.dataset.s !== f));
  if (state) Flip.from(state, { duration: 0.8, ease: 'expo.out', absolute: true, onEnter: (el) => gsap.fromTo(el, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }), onLeave: (el) => gsap.to(el, { opacity: 0, duration: 0.3 }), onComplete: () => ScrollTrigger.refresh() });
}));

// --- sedi sulla mappa
$$('.sede-t button').forEach((b) => b.addEventListener('click', () => {
  $$('.sede-t button').forEach((x) => { x.setAttribute('aria-selected', x === b); $('#' + x.getAttribute('aria-controls')).hidden = x !== b; });
}));

// --- modulo (non invia dati)
$('#bf').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target, bad = $$('input[required]', f).find((i) => !(i.type === 'checkbox' ? i.checked : i.value.trim()));
  $('#ok').textContent = bad ? 'Completa nome, telefono e consenso per continuare.' : 'Questo è un concept: nessun dato è stato inviato. In un sito vero qui arriverebbe la conferma della richiesta.';
  bad?.focus();
});

// --- animazioni a scorrimento
if (HAS_GSAP && !RM) {
  // pannelli orizzontali sopra l'hero (solo desktop)
  const mm = gsap.matchMedia();
  mm.add('(min-width: 901px)', () => {
    root.classList.add('hz');
    const track = $('.track'), panels = $$('.panel'), W = () => track.scrollWidth;
    gsap.set(track, { x: () => innerWidth });
    const setP = () => panels.forEach((p) => {
      const l = p.getBoundingClientRect().left;
      p.style.setProperty('--p', Math.max(0, Math.min(1, 1 - l / (innerWidth * 0.55))).toFixed(3));
    });
    const tl = gsap.timeline({
      scrollTrigger: { id: 'hz', trigger: '.areas', start: 'top top', end: () => '+=' + W() * 1.1, pin: true, scrub: 1, invalidateOnRefresh: true, onUpdate: setP },
    });
    tl.to(track, { x: () => -(W() - innerWidth), ease: 'none', duration: 1 }, 0)
      .to('.hero-dim', { opacity: 0.78, ease: 'none', duration: 0.3 }, 0)
      .to('.hero-h', { yPercent: -18, opacity: 0.2, filter: 'blur(6px)', ease: 'none', duration: 0.3 }, 0);
    setP();
    return () => { root.classList.remove('hz'); panels.forEach((p) => p.style.removeProperty('--p')); };
  });
  mm.add('(max-width: 900px)', () => { root.classList.remove('hz'); });

  // titoli a parole
  $$('[data-split]').filter((el) => !el.closest('.hero')).forEach((el) => {
    gsap.from($$('.w>span', el), { yPercent: 110, duration: 1.2, stagger: 0.03, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
  });
  // comparse morbide
  ScrollTrigger.batch('[data-r]', { start: 'top 90%', once: true, onEnter: (els) => gsap.from(els, { y: 40, opacity: 0, duration: 1.2, stagger: 0.08, ease: 'expo.out' }) });
  // parallasse leggero nelle immagini degli spazi e nel pre-footer
  $$('.sp-i img').forEach((img) => gsap.fromTo(img, { yPercent: -8 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  gsap.fromTo('.pre img', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.pre', start: 'top bottom', end: 'bottom top', scrub: true } });
  addEventListener('load', () => ScrollTrigger.refresh());
} else {
  root.classList.remove('hz');
}
