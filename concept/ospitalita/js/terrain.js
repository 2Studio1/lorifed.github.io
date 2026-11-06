// Sassòra · paesaggio procedurale (WebGL1, nessuna dipendenza, nessuna immagine).
// Sette quinte di montagne "dolomitiche" con prospettiva aerea, nebbia regolabile (fog = whiteout), stelle e neve che cade.
// Uso: const t = Terrain(canvas,{scale:.6}); t.set({fog:0,tod:0,yaw:0,lift:0,pitch:0}); t.start() / t.stop() / t.frame(time)
(function () {
  const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS = `
precision highp float;
uniform vec2 uRes; uniform float uTime,uFog,uTod,uYaw,uPitch,uLift,uFlakes,uSeed;
float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),u.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x),u.y);}
float n1(float x){float i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(h21(vec2(i,1.7)),h21(vec2(i+1.,1.7)),f);}
float fb1(float x){float a=.5,h=0.;for(int i=0;i<4;i++){h+=a*n1(x);x=x*2.03+11.3;a*=.5;}return h;}
float towm(float x,float k){return smoothstep(.56,.6,n1(x*.9+k*5.3+uSeed))*smoothstep(.3,.45,n1(x*.21+k*2.1+uSeed));}
// profilo: altopiano + torri a pareti verticali (dolomie)
float ridge(float x,float k,float tow){
  float n=fb1(x+k*17.+uSeed);
  float t=towm(x,k)*tow;
  float spire=pow(n1(x*7.+k*3.),3.)*.09+pow(n1(x*23.+k),4.)*.035;
  return n*.2+t*(.06+.12*n1(x*2.1+k)+.08*n1(x*5.3+k)+spire);
}
struct Pal{vec3 skyT,skyB,sunC,fog,amb;float sunI,stars,sx,rose;};
Pal pal(float k){Pal a;
  // 0 sera blu, 1 giorno, 2 notte, 3 alba rosa (enrosadira), 4 coperto
  if(k<.5){a.skyT=vec3(.15,.21,.31);a.skyB=vec3(.6,.64,.7);a.sunC=vec3(1.,.74,.55);a.fog=vec3(.55,.6,.67);a.amb=vec3(.48,.55,.66);a.sunI=.8;a.stars=.25;a.sx=-1.;a.rose=.25;}
  else if(k<1.5){a.skyT=vec3(.17,.39,.7);a.skyB=vec3(.74,.84,.93);a.sunC=vec3(1.,.97,.9);a.fog=vec3(.76,.84,.92);a.amb=vec3(.58,.66,.8);a.sunI=1.15;a.stars=0.;a.sx=1.;a.rose=0.;}
  else if(k<2.5){a.skyT=vec3(.01,.02,.06);a.skyB=vec3(.07,.1,.19);a.sunC=vec3(.5,.6,.85);a.fog=vec3(.07,.09,.16);a.amb=vec3(.16,.2,.32);a.sunI=.35;a.stars=1.;a.sx=1.;a.rose=0.;}
  else if(k<3.5){a.skyT=vec3(.33,.4,.6);a.skyB=vec3(.99,.77,.66);a.sunC=vec3(1.,.62,.48);a.fog=vec3(.88,.74,.72);a.amb=vec3(.58,.54,.66);a.sunI=1.05;a.stars=0.;a.sx=1.;a.rose=1.;}
  else {a.skyT=vec3(.64,.68,.72);a.skyB=vec3(.87,.89,.91);a.sunC=vec3(.92,.93,.96);a.fog=vec3(.85,.87,.9);a.amb=vec3(.74,.77,.83);a.sunI=.5;a.stars=0.;a.sx=1.;a.rose=0.;}
  return a;}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;
  if(uRes.x<uRes.y) uv.x*=.62; // verticale: catena meno compressa
  Pal P=pal(uTod);
  float gy=uv.y-uPitch;
  vec3 col=mix(P.skyB,P.skyT,pow(clamp(gy*1.5+.35,0.,1.),.8));
  col+=P.sunC*.22*P.sunI*exp(-length(vec2(uv.x-P.sx*.55,gy+.05))*2.5);
  if(P.stars>0.){vec2 g=uv*260.;float s=h21(floor(g));
    col+=step(.995,s)*smoothstep(-.1,.3,gy)*vec3(.9,.95,1.)*(.55+.45*sin(uTime*1.7+s*90.))*P.stars;
    col+=vec3(.1,.11,.2)*P.stars*smoothstep(.22,0.,abs(uv.x*.55-gy+.05))*smoothstep(-.1,.4,gy)*(.5+vn(uv*14.));}
  if(gy>-.1){vec2 cp=vec2(uv.x*1.2+uTime*.006,gy*4.);float c=smoothstep(.5,.85,vn(cp*3.)*.6+vn(cp*7.)*.4)*smoothstep(-.05,.25,gy);
    col=mix(col,mix(P.fog,vec3(1.),.35),c*.3*(1.-P.stars*.8));}
  for(int i=0;i<7;i++){
    float fi=float(i), dep=1.-fi/6.; // 1 lontano, 0 vicino
    float par=.12+fi*.2;
    float x=(uv.x+uYaw*par)*(1.05+fi*.33)+fi*7.3;
    float base=.02-fi*.072 - uLift*par*.55 + uPitch;
    float tow=(i>=1&&i<=4)?1.:0.;
    float y=base+ridge(x,fi,tow)*(1.15-fi*.05);
    if(uv.y<y){
      float d=y-uv.y, e=.025;
      float sl=(ridge(x+e,fi,tow)-ridge(x-e,fi,tow))/(2.*e);
      float side=clamp(-sl*P.sx*.18+.45,0.,1.);
      float wall=towm(x,fi)*tow*(1.-smoothstep(.13,.2,d));
      // stile manifesto: facce piatte, luce/ombra a fasce verticali nette sulle torri
      float facet=step(.5,n1(x*7.3+fi*2.))*.6+step(.55,n1(x*19.+fi))*.4;
      float lit=mix(side>.5?1.:0.,facet,.75);
      vec3 rockL=mix(vec3(.9,.84,.75),vec3(.98,.7,.58),P.rose*.85), rockS=vec3(.47,.45,.47);
      vec3 snowL=vec3(.96,.97,.99), snowS=vec3(.7,.76,.86);
      vec3 c=mix(mix(snowS,snowL,side>.5?.85:.35),mix(rockS,rockL,lit),wall);
      c*=mix(P.amb*1.15,P.sunC*P.sunI*1.05+P.amb*.3,mix(.55,lit,wall));
      c*=1.-smoothstep(0.,.4,d)*.12;
      c=mix(c,P.fog,clamp(dep*.8+uFog*.55,0.,1.));
      c=mix(c,mix(P.fog,vec3(1.),.22),smoothstep(.015,.2,d)*(.5+uFog*.45)); // nebbia ai piedi delle quinte
      col=c;
    }
  }
  col=mix(col,vec3(.965,.97,.975),smoothstep(0.,1.,uFog)); // whiteout
  for(int k=0;k<3;k++){float fk=float(k);vec2 q=uv*(5.+fk*5.)+vec2(sin(uTime*.3+fk)*.4,uTime*(.3+fk*.16));
    vec2 id=floor(q),f=fract(q)-.5;float r=h21(id+fk*7.);vec2 o=vec2(h21(id+3.),h21(id+9.))-.5;
    col+=uFlakes*smoothstep(.07-fk*.015,0.,length(f-o*.7))*step(.6,r)*(.45-fk*.1)*(1.-uFog);}
  col+=(h21(gl_FragCoord.xy+fract(uTime)*91.)-.5)*.03; // grana
  vec2 vq=gl_FragCoord.xy/uRes; col*=.88+.12*pow(16.*vq.x*vq.y*(1.-vq.x)*(1.-vq.y),.25);
  gl_FragColor=vec4(col,1.);
}`;
  function Terrain(canvas, o) {
    o = o || {};
    const gl = canvas.getContext('webgl', { antialias: false, preserveDrawingBuffer: !!o.keep });
    if (!gl) return null;
    const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = {}; ['uRes', 'uTime', 'uFog', 'uTod', 'uYaw', 'uPitch', 'uLift', 'uFlakes', 'uSeed'].forEach(k => U[k] = gl.getUniformLocation(pr, k));
    const s = Object.assign({ fog: 0, tod: 0, yaw: 0, pitch: 0, lift: 0, flakes: .6, seed: 0, time: 3 }, o.params || {});
    const scale = o.scale || .6; let raf = 0, running = false; const t0 = performance.now();
    function frame(time) {
      const w = Math.max(1, Math.round(canvas.clientWidth * scale)), h = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h); gl.uniform2f(U.uRes, w, h); gl.uniform1f(U.uTime, time == null ? s.time : time);
      gl.uniform1f(U.uFog, s.fog); gl.uniform1f(U.uTod, s.tod); gl.uniform1f(U.uYaw, s.yaw); gl.uniform1f(U.uPitch, s.pitch);
      gl.uniform1f(U.uLift, s.lift); gl.uniform1f(U.uFlakes, s.flakes); gl.uniform1f(U.uSeed, s.seed); gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function loop() { if (!running) return; frame((performance.now() - t0) / 1000); raf = requestAnimationFrame(loop); }
    return {
      state: s, frame,
      set(p) { Object.assign(s, p); if (!running) frame(); },
      start() { if (!running) { running = true; loop(); } }, stop() { running = false; cancelAnimationFrame(raf); }
    };
  }
  window.Terrain = Terrain;
})();
