/* Home, "Come funziona" in tre passi (#how-it-works).
   L'HTML contiene lo stato finale: senza JS o con prefers-reduced-motion resta cosi'.
   Qui lo riportiamo all'inizio e lo animiamo in loop solo mentre e' visibile.
   Tempi ricalcati dalla sezione how-it-works di skilltreeos.ai (note-design.md). */
(function(){
  var IT = document.documentElement.lang === 'it';
  var S = document.getElementById('how-it-works');
  if (!S || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var $$ = function(s, el){ return [].slice.call((el || S).querySelectorAll(s)); };
  var OK = '<svg class="pa-ok" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>';

  /* entrata: soglia 12%, margine basso -40px, una volta sola */
  S.classList.add('pa-js');
  var rv = new IntersectionObserver(function(es){
    es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); rv.unobserve(e.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -40px 0px' });
  $$('.pa-rv').forEach(function(e){ rv.observe(e); });

  /* parte quando la scheda entra, si ferma (e azzera i timer) quando esce */
  function watch(el, onIn, onOut){
    new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting ? onIn() : onOut(); }); },
      { rootMargin: '-40px' }).observe(el);
  }
  function loop(el, run){
    var tm = [], on = false;
    function at(fn, t){ tm.push(setTimeout(fn, t)); }
    function stop(){ tm.forEach(clearTimeout); tm = []; }
    function go(){ stop(); run(at, function(t){ at(function(){ if (on) go(); }, t); }); }
    watch(el, function(){ if (!on){ on = true; go(); } }, function(){ on = false; stop(); });
  }

  /* 1. mappa: i reparti si colorano uno alla volta (420 ms), pausa 2,6 s a mappa piena */
  var map = S.querySelector('.pa-gr').parentNode, deps = $$('.pa-d', map), count = map.querySelector('.pa-count');
  function show(k){
    deps.forEach(function(d, j){ d.classList.toggle('on', j < k); d.classList.toggle('cur', j === k - 1); });
    var n = k ? deps[k - 1].querySelector('text').textContent : ''; count.textContent = k ? (IT ? 'Reparto · ' : 'Department · ') + n.charAt(0) + n.slice(1).toLowerCase() : (IT ? 'Scegli un reparto' : 'Pick a department');
  }
  show(0);
  loop(map, function(at, again){
    var t = 120;
    for (var k = 1; k <= deps.length; k++){ at(show.bind(null, k), t); t += 420; }
    at(function(){ show(0); }, t + 2600 - 420);
    again(t + 2600 - 420 + 500);
  });

  /* 2. collegamenti: il cursore va su "Collega", preme, diventa "Collegato" e il logo entra nell'orbita */
  var oc = S.querySelector('.pa-oc'), rows = $$('.pa-row', oc), slots = $$('.pa-slot', oc), cur = oc.querySelector('.pa-cur');
  function setDone(k, on){
    rows[k].classList.toggle('done', on);
    rows[k].querySelector('.pa-btn span').textContent = on ? (IT ? 'Collegato' : 'Connected') : (IT ? 'Collega' : 'Connect');
    slots[k].classList.toggle('in', on);
  }
  function moveTo(k){
    var hb = oc.getBoundingClientRect(), bb = rows[k].querySelector('.pa-btn').getBoundingClientRect();
    cur.style.transform = 'translate(' + (bb.left - hb.left + bb.width * .55).toFixed(1) + 'px,' + (bb.top - hb.top + bb.height * .45).toFixed(1) + 'px)';
  }
  rows.forEach(function(_, k){ setDone(k, false); });
  loop(oc, function(at, again){
    rows.forEach(function(_, k){ setDone(k, false); });
    cur.style.transform = 'translate(' + (oc.clientWidth * .45).toFixed(1) + 'px,' + (oc.clientHeight - 24) + 'px)';
    cur.style.opacity = '1';
    var t = 500;
    rows.forEach(function(r, k){
      at(function(){ moveTo(k); }, t);
      at(function(){ r.classList.add('press'); }, t + 650);
      at(function(){ r.classList.remove('press'); setDone(k, true); }, t + 820);
      t += 1300;
    });
    at(function(){ cur.style.opacity = '0'; }, t);
    again(t + 2600);
  });

  /* 3. agenti: In coda -> Al lavoro (1,1 s) -> Fatto, uno ogni 750 ms */
  var aw = S.querySelector('.pa-aw'), ags = $$('.pa-ag', aw);
  function state(k, st){
    var a = ags[k];
    a.classList.toggle('act', st === 'act'); a.classList.toggle('done', st === 'done');
    a.querySelector('.pa-st').innerHTML = st === 'act' ? '<span class="pa-spin"></span>' + (IT ? 'Al lavoro' : 'Working') : st === 'done' ? OK + (IT ? 'Fatto' : 'Done') : (IT ? 'In coda' : 'Queued');
  }
  ags.forEach(function(_, k){ state(k, 'idle'); });
  loop(aw, function(at, again){
    ags.forEach(function(_, k){ state(k, 'idle'); });
    var t = 150;
    ags.forEach(function(_, k){ at(function(){ state(k, 'act'); }, t); at(function(){ state(k, 'done'); }, t + 1100); t += 750; });
    again(t + 2600);
  });
})();
