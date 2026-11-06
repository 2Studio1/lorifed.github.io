/* Mega-menu "Agents": si apre al passaggio del mouse e con la freccia giu'; il click su "Agents" va al catalogo.
   Esc chiude e rimette il focus sul bottone; Tab fuori dal pannello o click fuori chiude. */
(function(){
  var mm=document.querySelector('[data-mm]'); if(!mm) return;
  var btn=mm.querySelector('.mm-a'), t, daHover=false;
  var mouse=matchMedia('(hover: hover) and (pointer: fine)');
  function aperto(){ return btn.getAttribute('aria-expanded')==='true' }
  function set(o){ clearTimeout(t); btn.setAttribute('aria-expanded',String(o)); mm.classList.toggle('is-open',o); if(!o) daHover=false }
  /* "Agents" e' un link al catalogo: il click naviga; il pannello si apre col mouse o con freccia giu' */
  mm.addEventListener('mouseenter',function(){ if(!mouse.matches) return; clearTimeout(t); t=setTimeout(function(){ if(!aperto()){ set(true); daHover=true } },60) });
  mm.addEventListener('mouseleave',function(){ if(!mouse.matches) return; clearTimeout(t); t=setTimeout(function(){ set(false) },200) });
  btn.addEventListener('keydown',function(e){
    if(e.key!=='ArrowDown') return;
    e.preventDefault(); set(true);
    var a=mm.querySelector('.mm-p a'), n=0;
    (function prova(){ a.focus(); if(document.activeElement!==a && n++<15) requestAnimationFrame(prova) })();   /* aspetta che visibility torni visible */
  });
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape' && aperto()){ var dentro=mm.contains(document.activeElement); set(false); if(dentro) btn.focus() }
  });
  mm.addEventListener('focusout',function(e){ if(e.relatedTarget && !mm.contains(e.relatedTarget)) set(false) });
  document.addEventListener('pointerdown',function(e){ if(aperto() && !mm.contains(e.target)) set(false) });
})();
