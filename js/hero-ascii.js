/* Sfondo della hero: matrice di caratteri che si accende a onde lente (pattern founderos.sh, codice nostro).
   Densa ai bordi, quasi vuota al centro dove c'e' il titolo. Un solo canvas, glifi pre-disegnati in un atlante
   (drawImage per cella), si ferma fuori viewport e a scheda nascosta; con movimento ridotto disegna un solo frame. */
(function(){
  var cv=document.querySelector('#hero .hx-ascii'); if(!cv) return;
  var hero=cv.closest('#hero'), ctx=cv.getContext('2d'); if(!ctx) return;
  var GL=' .·-~=+x*'.split(''), N=GL.length;          // dal piu' leggero al piu' pieno
  var COL=['#3D4A1C','#2F6B62'];                      // oliva; teal per i punti piu' accesi
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W,H,cols,rows,cell,dpr,mask,atlas,AW,mobile,raf=0,visible=true,t0=performance.now(),frame=0;

  function build(){
    var r=hero.getBoundingClientRect(); W=Math.round(r.width); H=Math.round(r.height);
    mobile=W<700; cell=mobile?18:15; dpr=Math.min(window.devicePixelRatio||1,mobile?1.5:2);
    cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr);
    cols=Math.ceil(W/cell); rows=Math.ceil(H/cell);
    // atlante: una riga per colore, una colonna per glifo
    AW=Math.ceil(cell*dpr); atlas=document.createElement('canvas'); atlas.width=AW*N; atlas.height=AW*2;
    var a=atlas.getContext('2d'); a.font=Math.round(cell*.8*dpr)+'px "JetBrains Mono",ui-monospace,Menlo,monospace';
    a.textAlign='center'; a.textBaseline='middle';
    for(var c=0;c<2;c++){a.fillStyle=COL[c];for(var g=0;g<N;g++)a.fillText(GL[g],g*AW+AW/2,c*AW+AW/2)}
    // maschera: 0 nell'ellisse del titolo, sale verso i bordi (su mobile solo in alto e in basso)
    mask=new Float32Array(cols*rows);
    for(var y=0;y<rows;y++)for(var x=0;x<cols;x++){
      var dx=(x*cell/W-.5)*2, dy=(y*cell/H-.42)*2, d;
      d=mobile?Math.abs(dy)*1.15:Math.sqrt(dx*dx*.85+dy*dy*1.1);
      var m=(d-.42)/(1.05-.42); m=m<0?0:m>1?1:m; mask[y*cols+x]=m*m*(3-2*m);
    }
  }

  function draw(now){
    var t=(now-t0)/1000;
    ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,cv.width,cv.height);
    var s=cell*dpr;
    for(var y=0;y<rows;y++){
      for(var x=0;x<cols;x++){
        var m=mask[y*cols+x]; if(m<.04) continue;
        // campo: due onde lente che si incrociano + un'onda diagonale che "accende" le celle al passaggio
        var f=.5+.25*Math.sin(x*.16+t*.55)*Math.cos(y*.21-t*.4)+.25*Math.sin((x+y)*.07-t*.9);
        var v=m*(.25+.75*f); if(v<.14) continue;
        var g=Math.min(N-1,1+((v-.14)/.86*(N-1))|0), hot=v>.78;
        ctx.globalAlpha=hot?.5:.12+.3*v;
        ctx.drawImage(atlas,g*AW,hot?AW:0,AW,AW,x*s,y*s,AW,AW);
      }
    }
    ctx.globalAlpha=1;
  }

  function loop(now){
    raf=0; if(!visible||document.hidden) return;
    if(!mobile||(frame++&1)===0) draw(now);            // su mobile mezzo frame-rate: basta e risparmia batteria
    raf=requestAnimationFrame(loop);
  }
  function start(){ if(reduce){draw(t0+4000);return} if(!raf) raf=requestAnimationFrame(loop) }

  build(); start();
  var rt; new ResizeObserver(function(){clearTimeout(rt);rt=setTimeout(function(){build();if(reduce||!raf)draw(performance.now())},120)}).observe(hero);
  new IntersectionObserver(function(e){visible=e[0].isIntersecting; if(visible) start()}).observe(hero);
  document.addEventListener('visibilitychange',function(){ if(!document.hidden) start() });
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(function(){build();draw(performance.now())});
})();
