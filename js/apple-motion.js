/* Home v5 · movimento "pagina prodotto Apple" sopra la v4, senza toccare i contenuti.
   Usa GSAP + ScrollTrigger gia' in pagina. Con prefers-reduced-motion o senza GSAP non fa nulla:
   la pagina resta statica e visibile (lo stato finale e' sempre quello dell'HTML).
   Desktop: hero, dashboard, #problema e #how-it-works guidati dallo scroll.
   Mobile (<=760px): solo hero e dashboard, piu' corti; il resto entra con reveal semplici.
   Non anima nulla che gia' animano gli script inline (.up, .rv, .pa-rv fuori dal pin, .duo, .quad...). */
(function(){
  if (!window.gsap || !window.ScrollTrigger || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.registerPlugin(ScrollTrigger);
  var $ = function(s, el){ return (el || document).querySelector(s); };
  var $$ = function(s, el){ return [].slice.call((el || document).querySelectorAll(s)); };
  var EASE = 'power3.out';
  document.documentElement.classList.add('am-js');

  /* ---- frase di #problema divisa in parole (una volta sola, vale per EN e IT) ---- */
  var frase = $('#problema .pc-h2'), parole = [];
  if (frase){
    frase.setAttribute('aria-label', frase.textContent.replace(/\s+/g, ' ').trim()); /* lo screen reader legge la frase intera */
    $$('span', frase).forEach(function(sp){
      sp.innerHTML = sp.textContent.split(/(\s+)/).map(function(w){
        return w.trim() ? '<span class="am-w" aria-hidden="true">' + w + '</span>' : w;
      }).join('');
    });
    parole = $$('.am-w', frase);
  }

  var mm = gsap.matchMedia();

  /* ===== 1. HERO: resta ferma, il titolo si rimpicciolisce e svanisce, lo sfondo si spegne, la fascia dopo la copre ===== */
  mm.add('(min-width: 0px)', function(){
    var hero = $('#hero'); if (!hero) return;
    var piccolo = innerWidth <= 760;
    gsap.timeline({ scrollTrigger: {
        trigger: hero, start: 'bottom bottom', end: 'bottom top', scrub: .6,
        pin: true, pinSpacing: false, refreshPriority: 3 /* niente spazio in piu': le fasce successive scorrono sopra */ } })
      .to('#hero h1', { scale: piccolo ? .92 : .86, y: piccolo ? -20 : -40, ease: 'none' }, 0)
      .to('#hero .inner', { opacity: 0, ease: 'power1.in' }, 0)
      .to('#hero .hx-bg', { opacity: .15, ease: 'none' }, 0);
  });

  /* ===== 2. DASHBOARD: arriva piccola e inclinata, si raddrizza a misura piena ===== */
  mm.add({ d: '(min-width: 761px)', m: '(max-width: 760px)' }, function(c){
    var dx = $('#dx'); if (!dx) return;
    var d = c.conditions.d;
    gsap.fromTo(dx,
      { scale: d ? .8 : .9, rotateX: d ? 16 : 8, y: d ? 40 : 20, transformPerspective: 1400 },
      { scale: 1, rotateX: 0, y: 0, ease: 'none',
        scrollTrigger: { trigger: dx, start: d ? 'top 95%' : 'top 98%', end: d ? 'top 18%' : 'top 50%', scrub: .6,
          /* a fine corsa niente transform: la dashboard resta un elemento normale, schede cliccabili */
          onLeave: function(){ gsap.delayedCall(.8, function(){ gsap.set(dx, { clearProps: 'transform' }); }); } } });
  });

  /* ===== 3. #PROBLEMA: la frase si accende parola per parola (desktop: blocco fermo mentre succede) ===== */
  mm.add({ d: '(min-width: 761px)', m: '(max-width: 760px)' }, function(c){
    if (!parole.length) return;
    var pc = $('#problema .pc');
    var pin = c.conditions.d && pc.offsetHeight < innerHeight - 120
      ? ScrollTrigger.create({ trigger: pc, start: 'center 54%', end: '+=55%', pin: true, refreshPriority: 2 }) : null;
    gsap.fromTo(parole, { opacity: .14 }, { opacity: 1, ease: 'none', stagger: .1,
      scrollTrigger: { trigger: frase, start: 'top 72%', scrub: .5,
        end: pin ? function(){ return pin.end - innerHeight * .1; } : 'top 32%' } });
  });

  /* ===== 4. #HOW-IT-WORKS (solo desktop): sezione ferma, i tre passi entrano uno alla volta ===== */
  mm.add('(min-width: 761px)', function(){
    var sec = $('#how-it-works'), wrap = sec && $('.wrap', sec), steps = wrap ? $$('.pa-step', wrap) : [];
    if (steps.length !== 3) return;
    sec.classList.add('am-pin-steps'); /* i passi li guida lo scroll, non l'IntersectionObserver di home-passi.js */
    var alto = wrap.offsetHeight > innerHeight - 90;
    var pin = ScrollTrigger.create({ trigger: wrap, pin: true, end: '+=140%', refreshPriority: 1,
      start: alto ? 'bottom bottom-=16' : 'center center+=40' });
    var tl = gsap.timeline({ scrollTrigger: { trigger: wrap, start: 'top 45%', scrub: .6,
      end: function(){ return pin.end - innerHeight * .15; } } });
    steps.forEach(function(s, i){
      tl.fromTo(s, { opacity: 0, y: 70, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: 1, ease: EASE }, i * .9);
    });
    return function(){ sec.classList.remove('am-pin-steps'); gsap.set(steps, { clearProps: 'opacity,transform' }); };
  });

  /* ===== 5. #GARANZIA: il titolo entra con un piccolo zoom, da sfocato a nitido ===== */
  mm.add({ d: '(min-width: 761px)', m: '(max-width: 760px)' }, function(c){
    var h = $('#garanzia .gar h2'); if (!h) return;
    var da = { opacity: 0, scale: 1.14, filter: 'blur(10px)' }, a = { opacity: 1, scale: 1, filter: 'blur(0px)' };
    if (c.conditions.d){
      a.ease = 'none';
      a.scrollTrigger = { trigger: h, start: 'top 92%', end: 'top 52%', scrub: .6,
        onLeave: function(){ gsap.delayedCall(.8, function(){ gsap.set(h, { clearProps: 'filter' }); }); } };
    } else {
      a.duration = 1.1; a.ease = 'expo.out'; a.clearProps = 'filter';
      a.scrollTrigger = { trigger: h, start: 'top 88%', once: true };
    }
    gsap.fromTo(h, da, a);
  });

  /* ===== 6. reveal semplici dove gli script inline non animano nulla ===== */
  /* titoli di fascia: salgono da sfocati a nitidi (la sfocatura c'e' solo durante l'entrata) */
  $$('.ox .ox-head, #fine .end').forEach(function(head){
    var kids = $$(':scope > :not(.hx-glow):not(.end-card)', head);
    gsap.from(kids, { opacity: 0, y: 26, filter: 'blur(6px)', duration: 1, stagger: .08, ease: EASE, clearProps: 'filter',
      scrollTrigger: { trigger: head, start: 'top 86%', once: true } });
  });
  /* schede: entrano a cascata */
  [['#first-agent .ds', ':scope > *'], ['#why .why', '.ox-card'], ['#trust .tr', '.ox-card'],
   ['#facts .fx-stats', '.ox-card'], ['#facts', '.fx-own'], ['#compare', '.cmp-wrap'], ['#busywork', '.bw'],
   ['#control .mc', '.mc-feed, .mc-side > .ox-card'], ['#where-it-runs', '.wr'], ['#fine', '.end-card'], ['#domande', '.fq']
  ].forEach(function(p){
    var box = $(p[0]); if (!box) return;
    var cards = $$(p[1], box); if (!cards.length) return;
    gsap.from(cards, { opacity: 0, y: 40, duration: 1, stagger: .08, ease: EASE,
      scrollTrigger: { trigger: cards[0], start: 'top 88%', once: true } });
  });

  /* numeri di #facts: contano fino al valore che c'e' nell'HTML, stesso formato (100+, 1.490, 1,490) */
  $$('#facts .fx-stats b').forEach(function(b){
    var orig = b.textContent, m = orig.match(/^(\D*)(\d[\d.,]*)(\D*)$/); if (!m) return;
    var sep = (m[2].match(/[.,](?=\d{3}(\D|$))/) || [''])[0], fin = +m[2].replace(/[.,]/g, ''), o = { v: 0 };
    function fmt(n){ var s = String(Math.round(n)); return sep ? s.replace(/\B(?=(\d{3})+(?!\d))/g, sep) : s; }
    gsap.to(o, { v: fin, duration: 1.6, ease: 'expo.out',
      onStart: function(){ b.textContent = m[1] + '0' + m[3]; },
      onUpdate: function(){ b.textContent = m[1] + fmt(o.v) + m[3]; },
      onComplete: function(){ b.textContent = orig; },
      scrollTrigger: { trigger: b, start: 'top 90%', once: true } });
  });

  /* mock: parallasse leggera sul contenitore (le schede dentro hanno gia' il loro reveal; solo desktop) */
  mm.add('(min-width: 761px)', function(){
    $$('#control .mc').forEach(function(el){
      gsap.fromTo(el, { y: 24 }, { y: -24, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: .6 } });
    });
  });

  /* le posizioni cambiano quando font, iframe e dashboard finiscono di caricare */
  addEventListener('load', function(){ ScrollTrigger.refresh(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ ScrollTrigger.refresh(); });
})();
