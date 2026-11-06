/* contenuti-esempi.js: i reel d'esempio partono muti in loop quando sono visibili e si fermano fuori schermo.
   Con prefers-reduced-motion non partono da soli. Una pausa scelta dall'utente resta finché non preme play. */
(function(){
  var figs=[].slice.call(document.querySelectorAll('.esempio'));
  if(!figs.length) return;
  var RID=matchMedia('(prefers-reduced-motion: reduce)').matches;

  function stato(f){
    var v=f.querySelector('video'), b=f.querySelector('.tel-btn'), nome=f.dataset.nome;
    var inPausa=v.paused;
    b.dataset.stato=inPausa?'pausa':'play';
    b.setAttribute('aria-label',(inPausa?'Riproduci il reel ':'Metti in pausa il reel ')+nome);
  }
  function play(v){ var p=v.play(); if(p&&p.catch) p.catch(function(){}); }

  figs.forEach(function(f){
    var v=f.querySelector('video'), b=f.querySelector('.tel-btn');
    v.muted=true;
    v.addEventListener('play',function(){stato(f)});
    v.addEventListener('pause',function(){stato(f)});
    b.addEventListener('click',function(){
      if(v.paused){ f.dataset.utente=''; play(v); }
      else { f.dataset.utente='pausa'; v.pause(); }
      stato(f);
    });
    stato(f);
  });

  if(RID || !('IntersectionObserver' in window)) return;
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){
      var f=e.target, v=f.querySelector('video');
      if(e.isIntersecting){ if(f.dataset.utente!=='pausa') play(v); }
      else if(!v.paused) v.pause();
    });
  },{threshold:.5});
  figs.forEach(function(f){ io.observe(f) });
})();
