/* servizi.js: header a pillola (copiato da piano-di-mantenimento.html) + comparsa allo scroll + vetrina progetti. */
/* Header a pillola — giro 5. Stato allo scroll, fasce scure, menu mobile accessibile. */
(function(){
  var mh=document.getElementById('mh');
  if(!mh) return;
  var tog=document.getElementById('mhTog');
  var menu=document.getElementById('mhMenu');
  var RID=matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. scroll: pillola più stretta + bordo acceso sopra le fasce nere */
  /* nella versione bianca le sole fasce nere sono #sistema e #trio */
  var SCURE='#sistema,section#trio.ccp,[data-scuro]';
  var scure=[].slice.call(document.querySelectorAll(SCURE));
  var tick=false;
  function aggiorna(){
    tick=false;
    mh.classList.toggle('is-scrolled', scrollY>24);
    var y=mh.querySelector('.mh-shell').getBoundingClientRect();
    var mid=y.top+y.height/2;
    mh.classList.toggle('su-scuro', scure.some(function(s){var r=s.getBoundingClientRect();return r.top<=mid && r.bottom>=mid}));
  }
  function suScroll(){ if(!tick){tick=true;requestAnimationFrame(aggiorna)} }
  aggiorna();
  addEventListener('scroll',suScroll,{passive:true});
  addEventListener('resize',suScroll,{passive:true});

  /* 2. menu mobile */
  var chiudiTimer;
  function apri(){
    clearTimeout(chiudiTimer);
    menu.hidden=false;
    tog.setAttribute('aria-expanded','true');
    tog.setAttribute('aria-label','Chiudi il menu');
    requestAnimationFrame(function(){ mh.classList.add('is-open') });
    var primo=menu.querySelector('a');
    if(primo) primo.focus({preventScroll:true});
  }
  function chiudi(rimettiFocus){
    if(tog.getAttribute('aria-expanded')!=='true') return;
    mh.classList.remove('is-open');
    tog.setAttribute('aria-expanded','false');
    tog.setAttribute('aria-label','Apri il menu');
    chiudiTimer=setTimeout(function(){ menu.hidden=true }, RID?0:450);
    if(rimettiFocus) tog.focus({preventScroll:true});
  }
  tog.addEventListener('click',function(){
    tog.getAttribute('aria-expanded')==='true' ? chiudi(false) : apri();
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape' && tog.getAttribute('aria-expanded')==='true'){ e.preventDefault(); chiudi(true); }
  });
  /* clic su un link del menu o fuori dalla pillola: chiude */
  menu.addEventListener('click',function(e){ if(e.target.closest('a')) chiudi(false) });
  document.addEventListener('pointerdown',function(e){ if(!mh.contains(e.target)) chiudi(false) });
  /* il focus esce dalla pillola con Tab: chiude */
  mh.addEventListener('focusout',function(e){ if(e.relatedTarget && !mh.contains(e.relatedTarget)) chiudi(false) });
  /* tornando a desktop il menu non resta aperto */
  matchMedia('(min-width: 901px)').addEventListener('change',function(m){ if(m.matches) chiudi(false) });
})();

/* comparsa allo scroll */
(function(){
  var els=[].slice.call(document.querySelectorAll('[data-rv]'));
  if(!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches){ els.forEach(function(e){e.classList.add('in')}); return; }
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); },{rootMargin:'0px 0px -10% 0px'});
  els.forEach(function(e,i){ e.style.transitionDelay=(e.dataset.rv||0)+'ms'; io.observe(e); });
})();

/* vetrina progetti (Siti web): filtri per categoria + cursore "Apri il sito" che segue il puntatore */
(function(){
  var g=document.querySelector('.vt-griglia'); if(!g) return;
  var casi=[].slice.call(g.children), bott=[].slice.call(document.querySelectorAll('.vt-filtri button'));
  var RID=matchMedia('(prefers-reduced-motion: reduce)');
  function filtra(cat){
    bott.forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.cat===cat)) });
    casi.forEach(function(c){ c.hidden = cat!=='tutti' && c.dataset.cat!==cat; if(!c.hidden) c.classList.add('in') });
    g.classList.toggle('solo', cat!=='tutti');
  }
  bott.forEach(function(b){
    b.addEventListener('click',function(){
      if(document.startViewTransition && !RID.matches) document.startViewTransition(function(){ filtra(b.dataset.cat) });
      else filtra(b.dataset.cat);
    });
  });

  var fine=matchMedia('(hover: hover) and (pointer: fine)');
  if(!fine.matches || RID.matches) return;
  var cur=document.createElement('div'); cur.className='vt-cursore'; cur.setAttribute('aria-hidden','true'); cur.innerHTML='<span>Apri il sito</span>';
  document.body.appendChild(cur); g.classList.add('vt-attivo');
  var x=0,y=0,cx=0,cy=0,raf=0;
  function segui(){
    cx+=(x-cx)*.18; cy+=(y-cy)*.18;
    cur.style.setProperty('--x',cx+'px'); cur.style.setProperty('--y',cy+'px');
    raf = Math.abs(x-cx)+Math.abs(y-cy)>.3 ? requestAnimationFrame(segui) : 0;
  }
  g.addEventListener('pointermove',function(e){
    var su=e.target.closest('.caso-ant');
    x=e.clientX; y=e.clientY;
    if(su && !cur.classList.contains('on')){ cx=x; cy=y; segui(); cur.classList.add('on'); }
    if(!su) cur.classList.remove('on');
    if(!raf) raf=requestAnimationFrame(segui);
  });
  g.addEventListener('pointerleave',function(){ cur.classList.remove('on') });
  addEventListener('scroll',function(){ cur.classList.remove('on') },{passive:true});
})();
