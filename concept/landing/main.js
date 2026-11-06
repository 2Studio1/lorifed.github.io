(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* campo di numeri (illustrativi) */
  const vals = ['€ 0,00 in rete', '3,2 kWh', '94 %', '€ 41 / mese', '0,0 kW', '6,8 kWh', '21:40', '€ 0,00 in rete', '1,4 kW', '88 %', '5,1 kWh', '€ 37 / mese', '02:15', '0,3 kW', '79 %', '4,6 kWh', '€ 0,00 in rete', '19:05'];
  const fill = (el, off) => { for (let i = 0; i < 34; i++) el.insertAdjacentHTML('beforeend', `<b>${vals[(i + off) % vals.length]}</b>`); };
  fill($('.c1'), 0); fill($('.c2'), 7);

  /* telemetria d'esempio, ora di Roma */
  const tk = $('#tk');
  const fmt = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/Rome' });
  const tick = () => {
    const t = fmt.format(new Date());
    const items = [`${t} · Batteria 82%`, 'Casa 1,4 kW', 'Sole 0,0 kW', 'Rete 0,0 kW', `${t} · Autonomia 7 h 20 min`, 'Temperatura 24 °C', 'Stato: tutto regolare'];
    tk.innerHTML = [...items, ...items].map(s => `<span>${s}</span>`).join('');
  };
  tick(); if (!reduce) setInterval(tick, 1000);

  /* elenco con stato attivo + anteprima che segue il cursore */
  const ul = $$('#ulist li'), peek = $('.peek'), pimg = $('.peek img');
  const act = li => ul.forEach(x => x.classList.toggle('on', x === li));
  act(ul[0]);
  ul.forEach(li => {
    li.addEventListener('mouseenter', () => { act(li); if (fine) { pimg.src = li.dataset.img; peek.style.opacity = 1; peek.style.scale = 1; } });
    li.addEventListener('mouseleave', () => { peek.style.opacity = 0; peek.style.scale = .85; });
  });
  if (fine) addEventListener('mousemove', e => { peek.style.left = e.clientX + 'px'; peek.style.top = e.clientY + 'px'; }, { passive: true });

  /* FAQ: una risposta aperta per gruppo */
  $$('.facc').forEach(g => g.addEventListener('toggle', e => { if (e.target.open) $$('details', g).forEach(d => d !== e.target && (d.open = false)); }, true));

  /* modulo: validazione, nessun invio */
  const f = $('#lf');
  const rules = {
    nome: [v => v.trim().length >= 2, 'Scrivi il tuo nome.'],
    cap: [v => /^\d{5}$/.test(v), 'Il CAP ha 5 cifre.'],
    tel: [v => /^\+?[0-9 ]{8,16}$/.test(v.trim()), 'Controlla il numero: solo cifre, almeno 8.'],
  };
  const check = n => {
    const el = f.elements[n], [ok, msg] = rules[n], good = ok(el.value);
    el.setAttribute('aria-invalid', !good); el.setAttribute('aria-describedby', 'e-' + n);
    $('#e-' + n).textContent = good ? '' : msg; return good;
  };
  Object.keys(rules).forEach(n => f.elements[n].addEventListener('blur', () => f.elements[n].value && check(n)));
  f.addEventListener('submit', e => {
    e.preventDefault();
    const res = Object.keys(rules).map(check);
    const okBox = $('#f-ok').checked; $('#e-ok').textContent = okBox ? '' : 'Serve il consenso per richiamarti.';
    const first = Object.keys(rules).find((n, i) => !res[i]);
    if (first) return f.elements[first].focus();
    if (!okBox) return $('#f-ok').focus();
    $('#lf-ok').textContent = 'Concept: nessun dato inviato. In un sito vero qui arriverebbe la conferma con il giorno del sopralluogo.';
    f.querySelector('button').disabled = true;
  });

  /* barra CTA mobile: visibile dopo l'hero, nascosta vicino al modulo */
  const dock = $('#dock'), lead = $('#richiesta'), hero = $('.hero');
  const end = $('.end'), nav = $('#nav'), cbar = $('.cbar');
  const setCb = () => document.documentElement.style.setProperty('--cb', cbar.offsetHeight + 'px');
  setCb(); addEventListener('resize', setCb);
  const seen = el => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };
  const onScroll = () => { dock.classList.toggle('show', hero.getBoundingClientRect().bottom < 0 && !seen(lead) && !seen(end)); nav.classList.toggle('up', scrollY > 30); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  if (reduce || !window.gsap) return;

  gsap.registerPlugin(ScrollTrigger);
  const lenis = new Lenis({ lerp: .1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = a.getAttribute('href'); if (t.length < 2) return;
    e.preventDefault(); lenis.scrollTo(t, { offset: t === '#richiesta' ? -40 : 0, duration: 1.4 });
  }));

  /* titoli che salgono da una maschera, parola per parola */
  $$('.split').forEach(h => {
    const walk = n => [...n.childNodes].forEach(c => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(w => {
          if (!w.trim()) return frag.append(w);
          const s = document.createElement('span'); s.className = 'w'; s.innerHTML = `<i>${w}</i>`; frag.append(s);
        });
        c.replaceWith(frag);
      } else walk(c);
    });
    walk(h);
  });
  const inWords = (h, delay = 0) => gsap.from($$('.w>i', h), { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: .06, delay });

  /* hero: ingresso */
  inWords($('#h1'), .15);
  gsap.from('.hero-bg', { scale: 1.18, filter: 'blur(14px)', opacity: 0, duration: 2, ease: 'expo.out' });
  gsap.from('.hero .rise', { y: 24, opacity: 0, duration: 1, ease: 'expo.out', stagger: .12, delay: .6 });
  gsap.from('.nav', { y: -20, opacity: 0, duration: 1, ease: 'expo.out', delay: .4 });
  gsap.to('.hero-bg', { yPercent: 10, scale: 1.06, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-in', { opacity: 0, y: -60, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: '90% top', scrub: true } });

  /* titoli split e blocchi .rise fuori dall'hero */
  gsap.set($$('.split:not(#h1) .w>i'), { yPercent: 110 });
  $$('.split:not(#h1)').forEach(h => ScrollTrigger.create({ trigger: h, start: 'top 85%', once: true, onEnter: () => gsap.to($$('.w>i', h), { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: .06 }) }));
  $$('main .rise').filter(el => !el.closest('.hero')).forEach(el => gsap.from(el, { y: 30, opacity: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));

  /* il disco della casa sale, le notifiche compaiono una per volta */
  gsap.fromTo('.orb-disc', { xPercent: -50, x: 0, yPercent: 30, scale: .8 }, { xPercent: -50, x: 0, yPercent: 0, scale: 1, ease: 'none', scrollTrigger: { trigger: '.orb-stage', start: 'top bottom', end: 'top 25%', scrub: true } });
  gsap.from('.toast', { y: 20, opacity: 0, scale: .9, duration: .8, ease: 'back.out(1.6)', stagger: .35, scrollTrigger: { trigger: '.orb-stage', start: 'top 55%', once: true } });

  /* oggetto 3D: rotazione, riflesso, carica del LED; stanze che vengono verso la camera */
  const tl = gsap.timeline({ scrollTrigger: { trigger: '.spin', start: 'top top', end: 'bottom bottom', scrub: 1 } });
  tl.fromTo('.unit', { rotateY: -28, rotateX: -6, scale: .9 }, { rotateY: 332, rotateX: 4, scale: 1.05, ease: 'none' }, 0)
    .fromTo('.unit .fr', { '--sh': '120%' }, { '--sh': '-40%', ease: 'none' }, 0)
    .fromTo('.led', { '--lv': .08 }, { '--lv': 1, ease: 'power1.inOut' }, 0)
    .from('.spin-copy', { opacity: 0, y: 40, duration: .25 }, .62);
  $$('.gal img').forEach((img, i) => {
    const t = i * .09;
    tl.fromTo(img, { '--z': '-2600px' }, { '--z': '500px', ease: 'none', duration: .45 }, t)
      .fromTo(img, { opacity: 0 }, { opacity: .65, duration: .12 }, t)
      .to(img, { opacity: 0, duration: .1 }, t + .35);
  });

  /* colonne di numeri a velocità diverse */
  gsap.fromTo('.c1', { yPercent: 0 }, { yPercent: -45, ease: 'none', scrollTrigger: { trigger: '.nums', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.fromTo('.c2', { yPercent: -45 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.nums', start: 'top bottom', end: 'bottom top', scrub: true } });
  $$('.nums .col b').forEach((b, i) => { if (i % 3 === 0) ScrollTrigger.create({ trigger: b, start: 'top 55%', end: 'bottom 45%', toggleClass: 'on' }); });

  /* assistenza: parallasse e voci che si accendono */
  gsap.to('.care-bg', { yPercent: -10, ease: 'none', scrollTrigger: { trigger: '.care', start: 'top bottom', end: 'bottom top', scrub: true } });
  $$('.care-list li').forEach(li => ScrollTrigger.create({ trigger: li, start: 'top 70%', end: 'bottom 40%', toggleClass: 'on' }));

  /* elenco usi: su touch lo stato attivo segue lo scroll */
  if (!fine) ul.forEach(li => ScrollTrigger.create({ trigger: li, start: 'top 60%', end: 'bottom 60%', onToggle: s => s.isActive && act(li) }));

  /* offerta: zoom lento dello sfondo, prezzo che conta */
  gsap.fromTo('.offer-bg', { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.offer', start: 'top bottom', end: 'bottom top', scrub: true } });
  const pr = $('.price strong'), o = { v: 0 };
  gsap.to(o, { v: 89, duration: 1.6, ease: 'power3.out', scrollTrigger: { trigger: pr, start: 'top 85%', once: true }, onUpdate: () => pr.textContent = Math.round(o.v) + ' €' });

  gsap.from('.v', { y: 40, opacity: 0, duration: 1, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '.vgrid', start: 'top 85%', once: true } });
  gsap.from('.form', { y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.form', start: 'top 88%', once: true } });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
