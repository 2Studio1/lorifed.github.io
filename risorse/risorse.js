/* risorse.js: nota di acquisto in anteprima, barra prezzo su mobile, inclinazione delle confezioni 3D. */
(function(){
  /* ---- acquisto: in anteprima mostra una nota discreta ---- */
  document.addEventListener('click', function(e){
    var b = e.target.closest('.js-acq'); if (!b) return;
    var n = b.parentNode.querySelector('.acq-nota'); if (n) n.hidden = false;
  });

  /* ---- barra prezzo su mobile: compare quando il box d'acquisto non è in vista ---- */
  var barra = document.getElementById('barra'), ordine = document.getElementById('ordine'), pp = document.querySelector('.pp');
  if (barra && ordine && pp && 'IntersectionObserver' in window) {
    var vis = { o: false, h: true };
    function agg(){ var su = !vis.o && !vis.h; barra.classList.toggle('su', su); barra.setAttribute('aria-hidden', String(!su)); barra.querySelector('a').tabIndex = su ? 0 : -1; }
    new IntersectionObserver(function(es){ es.forEach(function(x){ vis[x.target === ordine ? 'o' : 'h'] = x.isIntersecting; }); agg(); }).observe(ordine);
    new IntersectionObserver(function(es){ vis.h = es[0].isIntersecting; agg(); }).observe(pp);
  }

  /* ---- confezione 3D: segue il mouse (solo puntatore fine, mai con riduzione movimento) ---- */
  if (matchMedia('(hover:hover) and (pointer:fine)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(function(el){
      el.addEventListener('pointermove', function(e){
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.setProperty('--mx', (x * 18).toFixed(2) + 'deg'); el.style.setProperty('--my', (y * -10).toFixed(2) + 'deg');
      });
      el.addEventListener('pointerleave', function(){ el.style.removeProperty('--mx'); el.style.removeProperty('--my'); });
    });
  }
})();
