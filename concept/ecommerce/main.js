// Fiorìa — concept e-commerce di 21studio. Pattern ispirato a Mana Yerba Mate (Awwwards SOTD 8.03), codice e asset nostri.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(pointer: fine)').matches;
const root = document.documentElement;
const eur = (v) => v.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' });

const F = [
  { id: 'limone', name: 'Limone & Basilico', bg: '#F2D75C', label: '#FFF3C9', word: '#1F4D22', ink: '#1F4D22', pill: '#1F4D22', c1: '#F7C61B', c2: '#3E8E41', c3: '#FF8A3D', c4: '#FFFFFF',
    syms: ['lemon', 'leaf', 'slice', 'flower', 'sprig', 'cloud', 'leaf', 'sun'],
    desc: 'Limoni di Ribera spremuti a freddo e basilico genovese in infusione. Acida, verde, rinfrescante come un pomeriggio all\'ombra.',
    ingr: 'Acqua gassata, succo di limone 18% (Sicilia), zucchero di canna bio, infuso di basilico 1%, acidificante: acido citrico.' },
  { id: 'arancia', name: 'Arancia rossa & Zenzero', bg: '#F59874', label: '#B3232A', word: '#FFE3C2', ink: '#5A0E12', pill: '#7A1518', c1: '#E8452C', c2: '#2F7D3B', c3: '#FFD08A', c4: '#FFC233',
    syms: ['slice', 'flower', 'lemon', 'leaf', 'sun', 'slice', 'sprig', 'flower'],
    desc: 'Tarocco dell\'Etna e una radice di zenzero fresco: dolce all\'inizio, piccante alla fine. Da bere ghiacciata.',
    ingr: 'Acqua gassata, succo di arancia rossa 18% (Sicilia), zucchero di canna bio, estratto di zenzero 0,5%, acidificante: acido citrico.' },
  { id: 'chinotto', name: 'Chinotto & Rosmarino', bg: '#A9C49A', label: '#24412C', word: '#F3E3B5', ink: '#16291B', pill: '#24412C', c1: '#E07B2E', c2: '#5E9A55', c3: '#F3E3B5', c4: '#FFFFFF',
    syms: ['sprig', 'lemon', 'leaf', 'cloud', 'sprig', 'flower', 'lemon', 'leaf'],
    desc: 'Chinotto amaro della costa e rosmarino di campo. La più adulta delle quattro: amara, resinosa, lunga.',
    ingr: 'Acqua gassata, succo di chinotto 12% (Sicilia), zucchero di canna bio, infuso di rosmarino 1%, caramello, acidificante: acido citrico.' },
  { id: 'bergamotto', name: 'Bergamotto & Menta', bg: '#A6D2EA', label: '#E9F3DA', word: '#123E5A', ink: '#123E5A', pill: '#123E5A', c1: '#C7D94A', c2: '#2F8F6B', c3: '#7FB6E0', c4: '#FFE36B',
    syms: ['leaf', 'cloud', 'lemon', 'sun', 'leaf', 'slice', 'cloud', 'sprig'],
    desc: 'Bergamotto di Reggio e menta piperita. Floreale e fresca, la più leggera: 3,8 g di zuccheri ogni 100 ml.',
    ingr: 'Acqua gassata, succo di bergamotto 10% (Calabria), zucchero di canna bio, infuso di menta 1%, acidificante: acido citrico.' },
];
const SIZES = [{ n: 6, p: 15 }, { n: 12, p: 28 }, { n: 24, p: 52 }];
const SHIP_FREE = 35;
let cur = 0;

// posizioni delle illustrazioni nell'hero (x/y in %, s in vmin, r in gradi), lontane dal centro dove sta la lattina
const SLOTS = [
  { x: 6, y: 18, s: 26, r: -14 }, { x: 72, y: 12, s: 16, r: 20 }, { x: 15, y: 62, s: 18, r: 10 }, { x: 78, y: 52, s: 22, r: -30 },
  { x: 34, y: 14, s: 10, r: 30 }, { x: 86, y: 28, s: 14, r: 0 }, { x: 62, y: 74, s: 13, r: 40 }, { x: 2, y: 80, s: 14, r: -20 },
];
const SLOTS_M = [
  { x: -8, y: 14, s: 34, r: -14 }, { x: 70, y: 13, s: 24, r: 20 }, { x: -6, y: 58, s: 26, r: 10 }, { x: 74, y: 56, s: 30, r: -30 },
  { x: 40, y: 72, s: 0, r: 0 }, { x: 80, y: 36, s: 18, r: 0 }, { x: 64, y: 76, s: 0, r: 0 }, { x: 4, y: 82, s: 0, r: 0 },
];

function setTheme(f, el = root) {
  for (const k of ['bg', 'ink', 'pill', 'c1', 'c2', 'c3', 'c4']) el.style.setProperty('--' + k, f[k]);
  if (el === root) $('meta[name=theme-color]').setAttribute('content', f.bg);
}
function decoHTML(f, slots, n = slots.length) {
  return slots.slice(0, n).filter((s) => s.s > 0).map((s, i) =>
    `<svg viewBox="0 0 100 100" style="--x:${s.x}%;--y:${s.y}%;--s:${s.s}vmin;--r:${s.r}deg"><g class="it" style="--d:${5 + (i % 3)}s;transform-origin:50% 50%"><use href="#i-${f.syms[i % f.syms.length]}"/></g></svg>`).join('');
}

/* ---------- hero: illustrazioni ---------- */
const deco = $('[data-deco]');
const mobile = () => innerWidth < 700;
function paintDeco(f) { deco.innerHTML = decoHTML(f, mobile() ? SLOTS_M : SLOTS); }
setTheme(F[0]);
paintDeco(F[0]);

/* ---------- etichetta della lattina (canvas 2D) ---------- */
const symbolDefs = $('svg defs').outerHTML;
async function drawLabel(f) {
  const W = 2048, H = 1024;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  g.fillStyle = f.label; g.fillRect(0, 0, W, H);
  // illustrazioni: SVG con i nostri simboli, colori risolti
  const defs = symbolDefs.replaceAll('var(--c1)', f.c1).replaceAll('var(--c2)', f.c2).replaceAll('var(--c3)', f.c3).replaceAll('var(--c4)', f.c4);
  const spots = [[60, 70, 340, -20], [680, 520, 380, 25], [330, 600, 300, 60], [860, 60, 300, -40], [1150, 560, 360, 10], [1470, 40, 320, 35], [1760, 520, 340, -25], [1240, 230, 260, 70], [1860, 180, 260, 0], [-120, 560, 320, 15], [640, 140, 220, 120], [1000, 330, 200, -80], [1640, 330, 220, 45], [150, 380, 200, -60]];
  const uses = spots.map(([x, y, s, r], i) => `<use href="#i-${f.syms[i % f.syms.length]}" x="${x}" y="${y}" width="${s}" height="${s}" transform="rotate(${r} ${x + s / 2} ${y + s / 2})"/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}${uses}</svg>`;
  const img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  await img.decode().catch(() => {});
  g.drawImage(img, 0, 0);
  // fasce e testi
  g.fillStyle = f.word; g.fillRect(0, 0, W, 54); g.fillRect(0, H - 54, W, 54);
  g.fillStyle = f.label; g.font = '600 30px "Instrument Sans"'; g.textBaseline = 'middle';
  // il testo delle fasce si ripete un numero intero di volte, così la cucitura della lattina non si vede
  const band = 'BIBITA BOTANICA BIO  ·  SICILIA  ·  330 ML  ·  ';
  const bw = g.measureText(band).width, reps = Math.round(W / bw);
  g.save(); g.scale(W / (bw * reps), 1);
  for (let k = 0; k < reps; k++) { g.fillText(band, k * bw, 28); g.fillText(band, k * bw + bw / 2, H - 26); }
  g.restore();
  for (const cx of [512, 1536]) {
    g.save(); g.translate(cx, H / 2); g.rotate(-Math.PI / 2);
    g.font = '800 330px "Bricolage Grotesque"'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 26; g.strokeStyle = f.label; g.lineJoin = 'round'; g.strokeText('FIORÌA', 0, 6);
    g.fillStyle = f.word; g.fillText('FIORÌA', 0, 6);
    g.restore();
    g.save(); g.translate(cx + 210, H / 2); g.rotate(-Math.PI / 2);
    g.font = '600 46px "Bricolage Grotesque"'; g.textAlign = 'center';
    g.lineWidth = 12; g.strokeStyle = f.label; g.strokeText(f.name.toUpperCase(), 0, 0);
    g.fillStyle = f.word; g.fillText(f.name.toUpperCase(), 0, 0);
    g.restore();
  }
  return cv;
}

/* ---------- lattina 3D ---------- */
function buildCan(labelTex) {
  const R = .62, H = 2.2, grp = new THREE.Group();
  const label = new THREE.MeshStandardMaterial({ map: labelTex, roughness: .36, metalness: .2 });
  const metal = new THREE.MeshStandardMaterial({ color: 0xe6e9ed, metalness: .9, roughness: .3, side: THREE.DoubleSide });
  grp.add(new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 96, 1, true), label));
  const v = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  grp.add(new THREE.Mesh(new THREE.LatheGeometry(v([[R, H / 2], [R * .995, H / 2 + .05], [R * .86, H / 2 + .2], [R * .845, H / 2 + .25], [R * .87, H / 2 + .27], [R * .83, H / 2 + .29], [R * .8, H / 2 + .26], [R * .79, H / 2 + .21]]), 96), metal));
  grp.add(new THREE.Mesh(new THREE.LatheGeometry(v([[R * .66, -H / 2 - .17], [R * .82, -H / 2 - .16], [R * .97, -H / 2 - .07], [R, -H / 2]]), 96), metal));
  const lid = new THREE.Mesh(new THREE.CircleGeometry(R * .79, 64), metal); lid.rotation.x = -Math.PI / 2; lid.position.y = H / 2 + .21; grp.add(lid);
  const base = new THREE.Mesh(new THREE.CircleGeometry(R * .66, 48), metal); base.rotation.x = Math.PI / 2; base.position.y = -H / 2 - .17; grp.add(base);
  const tab = new THREE.Mesh(new THREE.TorusGeometry(.13, .035, 12, 32), metal); tab.rotation.x = -Math.PI / 2; tab.scale.set(1, 1.5, 1); tab.position.set(0, H / 2 + .235, .14); grp.add(tab);
  grp.userData.label = label;
  return grp;
}
function makeEnv(renderer) {
  const pm = new THREE.PMREMGenerator(renderer);
  const t = pm.fromScene(new RoomEnvironment(), .04).texture; pm.dispose(); return t;
}
const texOf = (cv) => { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.offset.x = .25; t.wrapS = THREE.RepeatWrapping; return t; };

function snapshotCans(labels) {
  const c = document.createElement('canvas');
  const r = new THREE.WebGLRenderer({ canvas: c, alpha: true, antialias: true, preserveDrawingBuffer: true });
  r.setSize(480, 760, false); r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.ACESFilmicToneMapping;
  const sc = new THREE.Scene(); sc.environment = makeEnv(r);
  const l = new THREE.DirectionalLight(0xffffff, 1.4); l.position.set(3, 4, 5); sc.add(l);
  const cam = new THREE.PerspectiveCamera(24, 480 / 760, .1, 50); cam.position.set(0, .15, 7.6);
  const shots = labels.map((cv) => {
    const can = buildCan(texOf(cv)); can.rotation.set(.14, -.25, -.06); sc.add(can);
    r.render(sc, cam); const url = c.toDataURL('image/png'); sc.remove(can); return url;
  });
  r.dispose(); r.forceContextLoss?.();
  return shots;
}
function fallbackShot(cv) {
  const c = document.createElement('canvas'); c.width = 300; c.height = 560; const g = c.getContext('2d');
  g.fillStyle = '#d9dde2'; g.beginPath(); g.roundRect(40, 10, 220, 540, 40); g.fill();
  g.save(); g.beginPath(); g.roundRect(46, 60, 208, 440, 12); g.clip(); g.drawImage(cv, 300, 0, 600, 1024, 46, 60, 208, 440); g.restore();
  return c.toDataURL();
}

let shots = [];
const S = { y: 0, rx: 0, rz: -.22, s: 1, spin: 0, jump: 0, intro: RM ? 0 : -1.4 };
let labelMat, can, renderer, scene, cam, visH = 5, visW = 5, live = true;
const tex = [];

async function initStage() {
  await document.fonts.load('800 100px "Bricolage Grotesque"').catch(() => {});
  await document.fonts.load('600 30px "Instrument Sans"').catch(() => {});
  const labels = await Promise.all(F.map(drawLabel));
  const stage = $('.stage');
  try {
    renderer = new THREE.WebGLRenderer({ canvas: stage, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (e) { renderer = null; }
  if (!renderer) {
    root.classList.add('no-webgl');
    shots = labels.map(fallbackShot);
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping;
  scene = new THREE.Scene(); scene.environment = makeEnv(renderer);
  const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(3, 4, 5); scene.add(key);
  cam = new THREE.PerspectiveCamera(28, 1, .1, 100); cam.position.z = 10;
  labels.forEach((cv) => tex.push(texOf(cv)));
  can = buildCan(tex[0]); labelMat = can.userData.label; scene.add(can);
  const resize = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix();
    visH = 2 * Math.tan(THREE.MathUtils.degToRad(14)) * 10; visW = visH * cam.aspect;
  };
  resize(); addEventListener('resize', resize);
  shots = snapshotCans(labels);

  let idle = 0, mx = 0, my = 0, tx = 0, ty = 0;
  if (FINE && !RM) addEventListener('pointermove', (e) => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; });
  gsap.ticker.add((time, dt) => {
    if (!live || S.y > 1.9) return;
    if (!RM) idle += dt * .00035;
    mx += (tx - mx) * .06; my += (ty - my) * .06;
    const k = Math.min(1.14, visW / 2.9); // lattina più piccola su schermi stretti
    can.position.set(mx * .5, -(S.y + S.intro + S.jump) * visH, 0);
    can.rotation.set(S.rx + my * .3, idle + S.spin + mx * .6, S.rz - mx * .1);
    can.scale.setScalar(S.s * k);
    renderer.render(scene, cam);
  });
  if (!RM) gsap.to(S, { intro: 0, duration: 1.6, ease: 'back.out(1.1)', delay: .15 });
}

/* ---------- cambio gusto ---------- */
const nameEl = $('[data-flav-name]'), numEl = $('[data-flav-num]');
let busy = false;
function go(i, dir = 1) {
  if (busy) return; busy = true;
  cur = (i + F.length) % F.length; const f = F[cur];
  setTheme(f);
  nameEl.textContent = f.name; numEl.textContent = String(cur + 1).padStart(2, '0');
  const items = $$('svg', deco);
  const done = () => { busy = false; };
  if (RM) { paintDeco(f); if (labelMat) labelMat.map = tex[cur]; return done(); }
  gsap.to(items, { scale: 0, rotate: '+=40', duration: .28, stagger: .02, ease: 'back.in(2)', transformOrigin: '50% 50%', onComplete: () => {
    paintDeco(f);
    gsap.from($$('svg', deco), { scale: 0, rotate: -60, duration: .9, stagger: .04, ease: 'back.out(2.2)', transformOrigin: '50% 50%' });
  } });
  gsap.to(S, { spin: S.spin + Math.PI * 2 * dir, duration: 1.2, ease: 'back.out(1.3)', onComplete: done });
  gsap.timeline().to(S, { jump: -.05, duration: .3, ease: 'power2.out' }).to(S, { jump: 0, duration: .7, ease: 'bounce.out' });
  if (labelMat) gsap.delayedCall(.24, () => { labelMat.map = tex[cur]; });
  gsap.fromTo('.flav', { scale: .85 }, { scale: 1, duration: .6, ease: 'back.out(3)', clearProps: 'scale' });
}
$('[data-next]').addEventListener('click', () => go(cur + 1, 1));
$('[data-prev]').addEventListener('click', () => go(cur - 1, -1));
addEventListener('keydown', (e) => {
  if (pdpOpen || cartOpen || /INPUT|TEXTAREA/.test(document.activeElement?.tagName)) return;
  if (scrollY > innerHeight * .6) return;
  if (e.key === 'ArrowRight') go(cur + 1, 1);
  if (e.key === 'ArrowLeft') go(cur - 1, -1);
});

/* ---------- smooth scroll + scroll-driven ---------- */
let lenis = null;
function initScroll() {
  gsap.registerPlugin(ScrollTrigger);
  if (!RM) {
    lenis = new Lenis({ lerp: .1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => { const id = a.getAttribute('href'); if (id.length > 1) { e.preventDefault(); lenis.scrollTo(id, { offset: 0, duration: 1.4 }); } }));
  }
  // nav che si nasconde scendendo
  let last = 0; const nav = $('.nav');
  addEventListener('scroll', () => { const y = scrollY; nav.classList.toggle('is-hidden', y > last && y > 200); last = y; }, { passive: true });

  // bollicine
  $('.bubbles').innerHTML = Array.from({ length: 18 }, () => `<i style="--b:${6 + Math.random() * 18}px;left:${Math.random() * 100}%;--d:${7 + Math.random() * 8}s;--w:-${Math.random() * 10}s;--dx:${(Math.random() - .5) * 80}px"></i>`).join('');

  // la lattina smette di renderizzare fuori da hero+storia
  const zone = RM ? '.hero' : '.hero,.storia'; // senza animazioni la lattina resta solo nell'hero
  const watch = new IntersectionObserver(() => { live = $$(zone).some((el) => { const r = el.getBoundingClientRect(); return r.bottom > innerHeight * (RM ? .5 : 0) && r.top < innerHeight; }); $('.stage').style.visibility = live ? 'visible' : 'hidden'; }, { threshold: [0, .5, 1] });
  $$(zone).forEach((el) => watch.observe(el));

  if (RM) return;
  const cards = $$('.card');
  gsap.set(cards, { autoAlpha: 0, y: '28svh', scale: .6, rotate: -8 });
  const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: '.hero', start: 'top top', endTrigger: '.storia', end: 'bottom bottom', scrub: 1 } });
  // 0→1: la lattina ruzzola e scende nella sezione successiva; 1→3: le card escono dalla lattina
  tl.to(S, { y: .63, rx: .32, rz: 0, spin: '+=' + Math.PI * 2, s: 1.04, duration: 1, ease: 'power1.inOut' }, 0)
    .to('[data-deco]', { yPercent: -30, duration: 1 }, 0)
    .to('.hero-ui,.hint', { autoAlpha: 0, y: -40, duration: .3 }, 0);
  cards.forEach((c, i) => {
    const t = 1.05 + i * .62, side = i % 2 ? 1 : -1;
    tl.to(c, { autoAlpha: 1, y: 0, scale: 1, rotate: side * 3, duration: .3, ease: 'back.out(1.6)' }, t);
    if (i < cards.length - 1) tl.to(c, { y: '-60svh', x: side * 30 + 'vw', rotate: side * 24, autoAlpha: 0, duration: .32, ease: 'power2.in' }, t + .42);
  });
  tl.to({}, { duration: .2 });
  // uscita: la lattina cade fuori schermo quando arriva il testo curvo
  gsap.to(S, { y: 2, rx: .9, ease: 'power2.in', scrollTrigger: { trigger: '.curve', start: 'top 95%', end: 'top 35%', scrub: .6 } });
  gsap.fromTo('[data-curve]', { attr: { startOffset: '12%' } }, { attr: { startOffset: '-58%' }, ease: 'none', scrollTrigger: { trigger: '.curve', start: 'top bottom', end: 'bottom top', scrub: 1 } });
  gsap.to('.badge svg:first-child', { rotate: 360, ease: 'none', transformOrigin: '50% 50%', scrollTrigger: { trigger: '.abbo', start: 'top bottom', end: 'bottom top', scrub: 1 } });
  gsap.from('.abbo-h .w', { yPercent: 70, rotate: 8, autoAlpha: 0, stagger: .06, duration: .9, ease: 'back.out(1.8)', scrollTrigger: { trigger: '.abbo-h', start: 'top 80%' } });
  gsap.from('.gusti-head h2', { yPercent: 40, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.gusti', start: 'top 75%' } });
}

/* ---------- tile dei gusti ---------- */
function renderTiles() {
  $('[data-tiles]').innerHTML = F.map((f, i) => `<li class="tile" style="--t:${f.bg};--ti:${f.ink};--c1:${f.c1};--c2:${f.c2};--c3:${f.c3};--c4:${f.c4}">
    <div class="deco" aria-hidden="true">${decoHTML(f, [{ x: -10, y: 8, s: 22, r: -10 }, { x: 70, y: 60, s: 18, r: 30 }, { x: 64, y: 4, s: 10, r: 0 }])}</div>
    <button type="button" data-open-product data-i="${i}"><h3>${f.name}</h3><img src="${shots[i]}" alt="Lattina Fiorìa ${f.name}" width="480" height="760"><span class="tile-f"><b>da ${eur(SIZES[0].p)}</b><span>Scopri</span></span></button></li>`).join('');
  if (!RM) gsap.from('.tile', { yPercent: 18, autoAlpha: 0, stagger: .08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.tiles', start: 'top 85%' } });
}

/* ---------- pagina prodotto ---------- */
const pdp = $('[data-pdp]'), wipe = $('.bubble-wipe');
let pdpOpen = false, pI = 0, lastFocus = null;
const pdpState = { size: 1, mode: 'una', q: 1 };
$('[data-sizes]').innerHTML = SIZES.map((s, i) => `<label><input type="radio" name="size" value="${i}" ${i === 1 ? 'checked' : ''}><span>${s.n} lattine<small>${eur(s.p)}</small></span></label>`).join('');
$('[data-sw]').innerHTML = F.map((f, i) => `<button type="button" style="--t:${f.bg}" data-sw-i="${i}" aria-label="${f.name}" aria-pressed="false"></button>`).join('');
const unit = () => SIZES[pdpState.size].p * (pdpState.mode === 'abbo' ? .9 : 1);
function paintPdp(i, animate) {
  pI = i; const f = F[i];
  setTheme(f, pdp); pdp.style.setProperty('--bg', f.bg);
  $('[data-pdp-name]').textContent = f.name; $('[data-pdp-desc]').textContent = f.desc; $('[data-pdp-ingr]').textContent = f.ingr;
  const img = $('[data-pdp-img]'); img.src = shots[i]; img.alt = 'Lattina Fiorìa ' + f.name;
  $('.pdp-deco').innerHTML = decoHTML(f, [{ x: 4, y: 8, s: 20, r: -10 }, { x: 70, y: 66, s: 22, r: 30 }, { x: 74, y: 6, s: 12, r: 0 }, { x: 8, y: 70, s: 14, r: 20 }]);
  $$('[data-sw-i]').forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.swI === i)));
  if (animate && !RM) gsap.fromTo(img, { rotate: -30, scale: .7, autoAlpha: 0 }, { rotate: -5, scale: 1, autoAlpha: 1, duration: .9, ease: 'back.out(1.7)' });
  price();
}
function price() { $('[data-qty]').textContent = pdpState.q; $('[data-pdp-price]').textContent = eur(unit() * pdpState.q); }
function openPdp(i, e, sub) {
  lastFocus = document.activeElement; pdpOpen = true; lenis?.stop();
  pdpState.q = 1; pdpState.mode = sub ? 'abbo' : 'una'; $(`input[name=mode][value=${pdpState.mode}]`).checked = true;
  paintPdp(i, false);
  const x = e?.clientX || innerWidth / 2, y = e?.clientY || innerHeight / 2;
  wipe.style.setProperty('--cx', x + 'px'); wipe.style.setProperty('--cy', y + 'px'); wipe.style.background = F[i].bg;
  const show = () => { pdp.hidden = false; $('[data-close-pdp]').focus({ preventScroll: true }); };
  if (RM) return show();
  gsap.timeline()
    .fromTo(wipe, { clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(150vmax at ${x}px ${y}px)`, duration: .7, ease: 'power3.inOut' })
    .add(() => { show(); gsap.fromTo('.pdp-info > *', { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: .04, duration: .7, ease: 'expo.out' }); gsap.fromTo('[data-pdp-img]', { yPercent: 30, rotate: -40, scale: .6 }, { yPercent: 0, rotate: 0, scale: 1, duration: 1.1, ease: 'back.out(1.5)' }); })
    .to(wipe, { clipPath: `circle(0px at ${innerWidth - 40}px 40px)`, duration: .6, ease: 'power3.inOut' });
}
function closePdp() {
  if (!pdpOpen) return; pdpOpen = false;
  const end = () => { pdp.hidden = true; lenis?.start(); lastFocus?.focus?.({ preventScroll: true }); };
  if (RM) return end();
  gsap.to(pdp, { clipPath: 'circle(0% at 50% 50%)', duration: .6, ease: 'power3.in', onComplete: () => { end(); gsap.set(pdp, { clearProps: 'clipPath' }); } });
}
document.addEventListener('click', (e) => {
  const o = e.target.closest('[data-open-product]');
  if (o) { const i = o.dataset.i != null ? +o.dataset.i : cur; openPdp(i, e, o.hasAttribute('data-sub')); }
  const sw = e.target.closest('[data-sw-i]'); if (sw) paintPdp(+sw.dataset.swI, true);
  const q = e.target.closest('[data-q]'); if (q) { pdpState.q = Math.max(1, Math.min(20, pdpState.q + +q.dataset.q)); price(); }
});
$('[data-close-pdp]').addEventListener('click', closePdp);
pdp.addEventListener('change', (e) => { if (e.target.name === 'size') pdpState.size = +e.target.value; if (e.target.name === 'mode') pdpState.mode = e.target.value; price(); });

/* ---------- carrello (solo in memoria, nessun dato inviato) ---------- */
const cart = [];
const cartEl = $('[data-cart]'), scrim = $('[data-scrim]');
let cartOpen = false, cartFocus = null;
function renderCart() {
  const n = cart.reduce((a, l) => a + l.q, 0), tot = cart.reduce((a, l) => a + l.unit * l.q, 0);
  $$('[data-count]').forEach((b) => { b.textContent = n; });
  $('.cart-btn').setAttribute('aria-label', `Apri il carrello, ${n} articoli`);
  $('[data-lines]').innerHTML = cart.map((l, i) => { const f = F[l.f]; return `<li class="line"><div class="th" style="--t:${f.bg}"><img src="${shots[l.f]}" alt=""></div><div><h3>${f.name}</h3><p>Box da ${SIZES[l.size].n} · ${l.mode === 'abbo' ? 'abbonamento −10%' : 'una volta'}</p><div class="lq"><button type="button" data-l="${i}" data-d="-1" aria-label="Togli una confezione">−</button><span>${l.q}</span><button type="button" data-l="${i}" data-d="1" aria-label="Aggiungi una confezione">+</button><button type="button" class="rm" data-rm="${i}">Rimuovi</button></div></div><b>${eur(l.unit * l.q)}</b></li>`; }).join('');
  $('[data-empty]').hidden = cart.length > 0;
  $('[data-total]').textContent = eur(tot);
  const miss = Math.max(0, SHIP_FREE - tot);
  $('[data-ship]').textContent = miss > 0 ? `Ti mancano ${eur(miss)} per la spedizione gratuita` : 'Spedizione gratuita sbloccata';
  $('[data-ship-bar]').style.width = Math.min(100, tot / SHIP_FREE * 100) + '%';
  $('[data-checkout]').disabled = !cart.length;
}
function openCart() {
  if (cartOpen) return; cartOpen = true; cartFocus = document.activeElement; lenis?.stop();
  scrim.hidden = false; cartEl.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => { scrim.classList.add('on'); cartEl.classList.add('on'); }));
  $('[data-close-cart]').focus({ preventScroll: true });
}
function closeCart() {
  if (!cartOpen) return; cartOpen = false;
  scrim.classList.remove('on'); cartEl.classList.remove('on');
  setTimeout(() => { scrim.hidden = true; cartEl.hidden = true; if (!pdpOpen) lenis?.start(); cartFocus?.focus?.({ preventScroll: true }); }, RM ? 0 : 500);
}
$$('[data-open-cart]').forEach((b) => b.addEventListener('click', openCart));
$('[data-close-cart]').addEventListener('click', closeCart);
scrim.addEventListener('click', closeCart);
cartEl.addEventListener('click', (e) => {
  const d = e.target.closest('[data-d]'); if (d) { const l = cart[+d.dataset.l]; l.q += +d.dataset.d; if (l.q < 1) cart.splice(+d.dataset.l, 1); renderCart(); }
  const r = e.target.closest('[data-rm]'); if (r) { cart.splice(+r.dataset.rm, 1); renderCart(); }
});
$('[data-checkout]').addEventListener('click', () => {
  const n = $('[data-note]'); n.textContent = 'Questa è una demo: nessun pagamento e nessun dato inviato.';
  if (!RM) gsap.fromTo(n, { x: -8 }, { x: 0, duration: .5, ease: 'elastic.out(1,.3)' });
});
$('[data-add]').addEventListener('click', () => {
  const key = `${pI}-${pdpState.size}-${pdpState.mode}`;
  const ex = cart.find((l) => l.key === key);
  if (ex) ex.q += pdpState.q; else cart.push({ key, f: pI, size: pdpState.size, mode: pdpState.mode, q: pdpState.q, unit: unit() });
  const btn = $('.cart-btn');
  const after = () => { renderCart(); btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop'); setTimeout(openCart, RM ? 0 : 250); };
  if (RM) return after();
  // la lattina vola nel carrello
  const from = $('[data-pdp-img]').getBoundingClientRect(), to = btn.getBoundingClientRect();
  const fly = document.createElement('img'); fly.src = shots[pI]; fly.className = 'flyer'; fly.alt = ''; document.body.append(fly);
  gsap.set(fly, { x: from.left + from.width / 2 - 35, y: from.top + from.height / 2 - 55 });
  gsap.timeline({ onComplete: () => { fly.remove(); after(); } })
    .to(fly, { x: to.left + to.width / 2 - 35, duration: .8, ease: 'power1.inOut' }, 0)
    .to(fly, { y: from.top - 120, duration: .35, ease: 'power2.out' }, 0)
    .to(fly, { y: to.top - 40, duration: .45, ease: 'power2.in' }, .35)
    .to(fly, { rotate: 360, scale: .3, duration: .8, ease: 'power1.in' }, 0);
});
addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (cartOpen) closeCart(); else if (pdpOpen) closePdp(); } });
// focus contenuto nei pannelli aperti
addEventListener('keydown', (e) => {
  if (e.key !== 'Tab') return; const box = cartOpen ? cartEl : pdpOpen ? pdp : null; if (!box) return;
  const f = $$('button:not([disabled]),input,summary,a[href]', box).filter((el) => el.offsetParent); if (!f.length) return;
  if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
  else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
});

/* ---------- bottoni magnetici ---------- */
if (FINE && !RM) $$('.mag').forEach((el) => {
  el.style.transition += ', translate .35s cubic-bezier(.65,0,.09,1.38)';
  el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); el.style.translate = `${(e.clientX - r.left - r.width / 2) * .25}px ${(e.clientY - r.top - r.height / 2) * .3}px`; });
  el.addEventListener('pointerleave', () => { el.style.translate = '0 0'; });
});

/* ---------- avvio ---------- */
renderCart();
initScroll();
await initStage();
renderTiles();
ScrollTrigger?.refresh();
if (!RM) {
  gsap.from('[data-deco] svg', { scale: 0, rotate: -50, duration: 1.1, stagger: .05, ease: 'back.out(2)', delay: .5, transformOrigin: '50% 50%' });
  gsap.from('.hero-ui > *', { y: 60, autoAlpha: 0, duration: .9, stagger: .07, ease: 'back.out(1.7)', delay: .9 });
  gsap.from('.nav > *', { y: -30, autoAlpha: 0, duration: .8, stagger: .06, ease: 'expo.out', delay: .3 });
}
let rT; addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => { paintDeco(F[cur]); ScrollTrigger.refresh(); }, 200); });
