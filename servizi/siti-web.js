/* siti-web.js: vetrina progetti. Filtri per categoria (riga in alto + dock flottante), hash condivisibile (#cat=...). */
(function(){
  var g=document.querySelector('.pf-griglia'); if(!g) return;
  var casi=[].slice.call(g.children);
  var riga=[].slice.call(document.querySelectorAll('.pf-filtri button'));
  var dock=document.querySelector('.pf-dock'), dockB=[].slice.call(dock.querySelectorAll('button'));
  var RID=matchMedia('(prefers-reduced-motion: reduce)');
  var cats=riga.map(function(b){ return b.dataset.cat });

  function filtra(cat){
    riga.forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.cat===cat)) });
    dockB.forEach(function(b){ b.classList.toggle('on', b.dataset.cat===cat) });
    casi.forEach(function(c){ c.hidden = cat!=='tutti' && c.dataset.cat!==cat });
  }
  function scegli(cat, daDock){
    var fai=function(){ filtra(cat) };
    if(document.startViewTransition && !RID.matches) document.startViewTransition(fai); else fai();
    history.replaceState(null,'', cat==='tutti' ? location.pathname+location.search : '#cat='+cat);
    if(daDock) document.getElementById('progetti').scrollIntoView({behavior: RID.matches?'auto':'smooth'});
  }
  riga.forEach(function(b){ b.addEventListener('click',function(){ scegli(b.dataset.cat,false) }) });
  dockB.forEach(function(b){ b.addEventListener('click',function(){ scegli(b.dataset.cat,true) }) });

  var m=/^#cat=(\w+)$/.exec(location.hash);
  filtra(m && cats.indexOf(m[1])>-1 ? m[1] : 'tutti');

  /* dock visibile solo dentro la vetrina e quando la riga dei filtri è fuori schermo */
  if(!('IntersectionObserver' in window)) return;
  var dentro=false, rigaVista=true;
  function aggiorna(){ dock.classList.toggle('on', dentro && !rigaVista) }
  new IntersectionObserver(function(es){ dentro=es[0].isIntersecting; aggiorna() },{rootMargin:'0px 0px -40% 0px'}).observe(g);
  new IntersectionObserver(function(es){ rigaVista=es[0].isIntersecting; aggiorna() }).observe(document.querySelector('.pf-filtri'));
})();
