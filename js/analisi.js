/* analisi.js: normalizza il sito inserito (home + report.html) e gestisce la sezione #first-agent della home. */
(function(){
  /* "acme.it", "https://www.acme.it/chi-siamo" -> "acme.it"; null se non sembra un dominio */
  function sito(v){
    v = (v || '').trim(); if (!v) return null;
    if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
    try { var h = new URL(v).hostname.toLowerCase().replace(/^www\./, ''); } catch (e) { return null; }
    return /^([a-z0-9](-?[a-z0-9])*\.)+[a-z]{2,}$/.test(h) ? h : null;
  }
  window.__sito = sito;
  console.assert(sito(' https://www.Acme.it/x ') === 'acme.it' && sito('acme') === null && sito('a b.com') === null, 'sito()');

  var IT = document.documentElement.lang === 'it';
  var sec = document.getElementById('first-agent'); if (!sec) return;
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = [].slice.call(sec.querySelectorAll('.ds-item')), cur = 0, touched = false, timer = null, vis = false;
  function open(i){
    cur = i;
    items.forEach(function(it, n){
      var on = n === i; it.classList.toggle('on', on);
      it.querySelector('.ds-btn').setAttribute('aria-expanded', on ? 'true' : 'false');
      it.querySelector('.ds-desc').hidden = !on;
    });
  }
  items.forEach(function(it, i){ it.querySelector('.ds-btn').addEventListener('click', function(){ touched = true; open(i); }); });
  /* avanza da solo finche' la sezione e' visibile e nessuno ha cliccato */
  function sync(){
    var run = vis && !document.hidden && !RM && !touched;
    if (run && !timer) timer = setInterval(function(){ open((cur + 1) % items.length); }, 4500);
    if (!run && timer) { clearInterval(timer); timer = null; }
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function(es){ vis = es[0].isIntersecting; sync(); }, { threshold: .3 }).observe(sec);
  document.addEventListener('visibilitychange', sync);
  open(0);

  var f = document.getElementById('faForm'), inp = document.getElementById('faSite'), err = document.getElementById('faErr');
  inp.addEventListener('input', function(){ err.textContent = ''; inp.removeAttribute('aria-invalid'); touched = true; sync(); });
  f.addEventListener('submit', function(e){
    e.preventDefault();
    var h = sito(inp.value);
    if (!h) { err.textContent = IT ? 'Scrivi un sito come tuaazienda.it' : 'Enter a website like yourbusiness.com'; inp.setAttribute('aria-invalid', 'true'); inp.focus(); return; }
    location.href = 'report.html?site=' + encodeURIComponent(h);
  });
})();
