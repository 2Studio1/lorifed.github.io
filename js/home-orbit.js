/* Home v4c: animazioni riprese come pattern da orbitagents.com, codice nostro.
   Senza JS l'HTML mostra lo stato finale (prima scheda, risultati visibili).
   prefers-reduced-motion: niente rotazioni automatiche, niente contatori. */
(function(){
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IT = document.documentElement.lang === 'it';
  function $(s, r){ return (r || document).querySelector(s); }
  function $$(s, r){ return [].slice.call((r || document).querySelectorAll(s)); }
  // esegue fn(visibile) quando l'elemento entra/esce dallo schermo
  function onView(el, fn, th){
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(true); return; }
    new IntersectionObserver(function(es){ fn(es[0].isIntersecting); }, { threshold: th || .25 }).observe(el);
  }
  // tablist accessibile: frecce, Home/End, tabindex mobile
  function tablist(tabs, select){
    tabs.forEach(function(t, i){
      t.addEventListener('click', function(){ select(i, true); });
      t.addEventListener('keydown', function(e){
        var j = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (j === undefined) return;
        e.preventDefault(); j = (j + tabs.length) % tabs.length; select(j, true); tabs[j].focus();
      });
    });
  }
  function markTabs(tabs, i){
    tabs.forEach(function(t, n){ t.setAttribute('aria-selected', n === i ? 'true' : 'false'); t.tabIndex = n === i ? 0 : -1; });
  }

  /* ---------- 1. hero: lo strumento cambia ogni 1,8 s, entra in dissolvenza di 0,5 s (come il riferimento) ---------- */
  (function(){
    var box = $('#hxTool'); if (!box) return;
    var list = JSON.parse(box.getAttribute('data-tools')), i = 0, timer = null, vis = true;
    function show(){
      var t = list[i];
      box.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#lg-' + t[0] + '"/></svg>' + t[1];
      box.classList.remove('in'); void box.offsetWidth; box.classList.add('in');
    }
    function sync(){
      var run = vis && !document.hidden && !RM;
      if (run && !timer) timer = setInterval(function(){ i = (i + 1) % list.length; show(); }, 1800);
      if (!run && timer) { clearInterval(timer); timer = null; }
    }
    onView($('#hero'), function(v){ vis = v; sync(); }, 0);
    document.addEventListener('visibilitychange', sync);
  })();

  /* ---------- 2. dashboard a schede: didascalia per scheda, hotspot numerati, giro automatico finché non la tocchi ---------- */
  (function(){
    var db = $('#db'); if (!db) return;
    var tabs = $$('.db-tab', db), panes = $$('.db-pane', db), cap = $('#dbCap', db), win = $('.db-win', db),
        list = $('#dbList', db), side = $$('.db-side span[data-i]', db), pop = $('#dbPop', db),
        cur = 0, touched = false, vis = false, t0 = 0, raf = 0, DUR = 9000, openHs = null;
    function closePop(focus){
      if (!openHs) return;
      openHs.setAttribute('aria-expanded', 'false'); pop.hidden = true; win.classList.remove('is-pop');
      if (focus) openHs.focus(); openHs = null;
    }
    function openPop(hs){
      if (openHs === hs) { closePop(true); return; }
      closePop(false); openHs = hs; touched = true;
      hs.setAttribute('aria-expanded', 'true');
      pop.querySelector('b').textContent = hs.getAttribute('data-t');
      pop.querySelector('p').textContent = hs.getAttribute('data-d');
      pop.hidden = false; win.classList.add('is-pop');
      var w = win.getBoundingClientRect(), h = hs.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight;
      var x = Math.min(Math.max(10, h.left - w.left - pw / 2 + 11), w.width - pw - 10);
      var y = h.bottom - w.top + 8; if (y + ph > w.height - 10) y = h.top - w.top - ph - 8;
      pop.style.left = x + 'px'; pop.style.top = Math.max(10, y) + 'px';
      pop.querySelector('button').focus({ preventScroll: true });
    }
    function select(i, user){
      if (user) touched = true;
      closePop(false); cur = i; markTabs(tabs, i);
      panes.forEach(function(p, n){ p.classList.toggle('on', n === i); p.hidden = n !== i; });
      side.forEach(function(s){ s.classList.toggle('on', +s.getAttribute('data-i') === i); });
      cap.innerHTML = tabs[i].getAttribute('data-cap') + ' <span>' + (IT ? 'Clicca i numeri per vedere a cosa serve ogni parte.' : 'Click the numbers to see what each part does.') + '</span>';
      list.innerHTML = $$('.db-hs', panes[i]).map(function(h){ return '<li><b>' + h.getAttribute('data-t') + '.</b> ' + h.getAttribute('data-d') + '</li>'; }).join('');
      tabs.forEach(function(t){ t.style.setProperty('--p', 0); });
      t0 = performance.now();
    }
    function tick(now){
      raf = 0;
      if (touched || !vis || document.hidden || RM) { tabs[cur].style.setProperty('--p', touched ? 0 : 0); return; }
      var p = (now - t0) / DUR;
      if (p >= 1) { select((cur + 1) % tabs.length, false); p = 0; }
      tabs[cur].style.setProperty('--p', p.toFixed(3));
      raf = requestAnimationFrame(tick);
    }
    function sync(){ if (!raf && vis && !touched && !RM && !document.hidden) { t0 = performance.now() - (parseFloat(tabs[cur].style.getPropertyValue('--p')) || 0) * DUR; raf = requestAnimationFrame(tick); } }
    tablist(tabs, select);
    $$('.db-hs', db).forEach(function(h){ h.addEventListener('click', function(e){ e.stopPropagation(); openPop(h); }); });
    pop.querySelector('button').addEventListener('click', function(){ closePop(true); });
    win.addEventListener('click', function(e){ if (openHs && !pop.contains(e.target)) closePop(false); });
    db.addEventListener('keydown', function(e){ if (e.key === 'Escape' && openHs) { e.preventDefault(); closePop(true); } });
    db.addEventListener('pointerdown', function(e){ if (e.target.closest('.db-win,.db-tabs')) touched = true; });
    select(0, false);
    onView(db, function(v){ vis = v; sync(); }, .35);
    document.addEventListener('visibilitychange', sync);
  })();

  /* ---------- A. cosa costruiscono: passo 1 → contatore 0→N in ~2 s → risultato ---------- */
  (function(){
    var sec = $('#built'); if (!sec) return;
    var tabs = $$('.ox-tab', sec), panes = $$('.uc-win', sec), timers = [], raf = 0, seen = false;
    function clear(){ timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf); }
    function play(p){
      clear();
      var steps = $$('.uc-steps li', p), st = $('.uc-st', p), res = $('.uc-res', p), n = +st.getAttribute('data-n'),
          run = st.getAttribute('data-run'), done = st.getAttribute('data-done');
      function setDone(){ steps.forEach(function(s){ s.classList.add('on'); }); st.className = 'uc-st ok'; st.textContent = '✓ ' + done.replace('#', n); res.classList.add('on'); }
      if (RM) { setDone(); return; }
      steps.forEach(function(s){ s.classList.remove('on'); }); res.classList.remove('on');
      st.className = 'uc-st'; st.innerHTML = '<span class="sp"></span>' + (IT ? 'Si parte' : 'Getting started');
      timers.push(setTimeout(function(){ steps[0].classList.add('on'); }, 300));
      timers.push(setTimeout(function(){
        steps[1].classList.add('on');
        var t1 = performance.now();
        (function count(now){
          var k = Math.min(1, (now - t1) / 2000);
          st.innerHTML = '<span class="sp"></span>' + run.replace('#', Math.round(n * (1 - Math.pow(1 - k, 3))));
          if (k < 1) raf = requestAnimationFrame(count); else timers.push(setTimeout(setDone, 250));
        })(t1);
      }, 900));
    }
    function select(i, user){
      markTabs(tabs, i);
      panes.forEach(function(p, n){ p.hidden = n !== i; });
      if (seen || user) play(panes[i]);
    }
    tablist(tabs, select);
    panes.forEach(function(p){ p.hidden = true; });
    select(0, false);
    onView($('.uc-panel', sec), function(v){ if (v && !seen) { seen = true; play(panes[tabs.findIndex(function(t){ return t.getAttribute('aria-selected') === 'true'; })]); } }, .4);
  })();

  /* ---------- B. scegli o descrivi: accordion che avanza da solo + frase che si scrive ---------- */
  (function(){
    var sec = $('#describe'); if (!sec) return;
    var items = $$('.ds-item', sec), cur = 0, touched = false, vis = false, timer = null;
    function open(i){
      cur = i;
      items.forEach(function(it, n){
        var on = n === i; it.classList.toggle('on', on);
        it.querySelector('.ds-btn').setAttribute('aria-expanded', on ? 'true' : 'false');
        it.querySelector('.ds-desc').hidden = !on;
      });
    }
    items.forEach(function(it, i){ it.querySelector('.ds-btn').addEventListener('click', function(){ touched = true; open(i); }); });
    var out = $('.ds-type', sec), ex = JSON.parse(out.getAttribute('data-ex')), e = 0, c = ex[0].length, dir = -1, tt = null;
    function type(){
      tt = null;
      if (!vis || RM || document.hidden) return;
      var s = ex[e]; c += dir; out.textContent = s.slice(0, Math.max(0, c));
      var wait = dir > 0 ? 45 : 22;
      if (dir > 0 && c >= s.length) { dir = -1; wait = 2200; }
      else if (dir < 0 && c <= 0) { dir = 1; e = (e + 1) % ex.length; wait = 350; }
      tt = setTimeout(type, wait);
    }
    function sync(){
      var run = vis && !document.hidden && !RM;
      if (run && !timer && !touched) timer = setInterval(function(){ if (touched) { clearInterval(timer); timer = null; return; } open((cur + 1) % items.length); }, 4500);
      if (!run && timer) { clearInterval(timer); timer = null; }
      if (run && !tt) tt = setTimeout(type, 1600);
    }
    open(0);
    onView(sec, function(v){ vis = v; sync(); }, .3);
    document.addEventListener('visibilitychange', sync);
  })();

  /* ---------- C. per chi: schede ---------- */
  (function(){
    var sec = $('#for-you'); if (!sec) return;
    var tabs = $$('.ox-tab', sec), panes = $$('.pp-pane', sec);
    function select(i){ markTabs(tabs, i); panes.forEach(function(p, n){ p.hidden = n !== i; }); }
    tablist(tabs, select); select(0);
  })();

  /* ---------- I. mission control: una riga nuova ogni 2,2 s, un giro solo e poi ferma (niente finto live) ---------- */
  (function(){
    var ul = $('#mcRows'); if (!ul || RM) return;
    var rows = $$('li', ul), times = rows.map(function(r){ return r.querySelector('time').textContent; }), played = false;
    onView(ul, function(v){
      if (!v || played) return; played = true;
      rows.forEach(function(r){ r.hidden = true; });
      rows.slice().reverse().forEach(function(r, k){
        setTimeout(function(){
          r.hidden = false; ul.insertBefore(r, ul.firstChild);
          r.classList.remove('new'); void r.offsetWidth; r.classList.add('new');
          setTimeout(function(){ r.classList.remove('new'); }, 1400);
        }, 300 + k * 2200);
      });
    }, .4);
  })();
  /* ---------- percorso (#journey): la linea tra il primo e l'ultimo cerchio si riempie con lo scroll e la scheda attiva si evidenzia.
     Desktop (cerchi in riga): avanzamento da "cima a 72%" a "fondo a 62%" come la v3. Mobile (in colonna): segue la metà schermo.
     Movimento ridotto: solo la posizione della linea, tutto resta acceso ---------- */
  (function(){
    var jr = $('#jr'); if (!jr) return;
    var line = $('.jr-line', jr), steps = $$('.jr-s', jr), dots = $$('.jr-d', jr), n = dots.length, queued = false;
    if (!RM) jr.classList.add('on');
    function update(){
      queued = false;
      var r = jr.getBoundingClientRect(), a = dots[0].getBoundingClientRect(), b = dots[n - 1].getBoundingClientRect(),
          row = Math.abs(a.top - b.top) < 2, H = innerHeight, p, cur = -1;
      line.style.cssText = row
        ? 'left:' + (a.left + a.width / 2 - r.left).toFixed(1) + 'px;right:auto;width:' + (b.left - a.left).toFixed(1) + 'px'
        : 'top:' + (a.top + a.height / 2 - r.top).toFixed(1) + 'px;bottom:auto;height:' + (b.top - a.top).toFixed(1) + 'px';
      if (RM) return;
      if (row) {
        p = (H * .72 - r.top) / (r.height + H * .1);
        if (p > 0) cur = Math.min(n - 1, Math.floor(p * n * 1.02));
      } else {
        var mid = H * .55;
        p = (mid - a.top - a.height / 2) / (b.top - a.top);
        dots.forEach(function(d, k){ if (d.getBoundingClientRect().top < mid) cur = k; });
      }
      jr.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
      steps.forEach(function(s, k){ s.classList.toggle('done', k <= cur); s.classList.toggle('cur', k === cur); });
    }
    function ask(){ if (!queued) { queued = true; requestAnimationFrame(update); } }
    if (!RM) addEventListener('scroll', ask, { passive: true });
    addEventListener('resize', ask); update();
  })();
})();
