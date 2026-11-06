// Ordito · hero a particelle guidato dallo scroll (WebGL1, nessuna libreria).
// Tre forme: A = sagoma della linea di produzione (vista di lato, controluce),
// B = gemello digitale in prospettiva (pavimento a griglia + macchine wireframe),
// C = flussi che convergono in un'unica linea. set({p}) con p in [0,2] fa il morph A→B→C.
(function () {
  const VS = `
attribute vec3 aA, aB, aC; attribute float aR;
uniform float uP, uT, uAsp, uRot, uTilt, uDpr;
varying float vS, vR;
vec3 flow(vec3 c){ // c = (indice flusso, u lungo il flusso, scarto)
  float u=fract(c.y+uT*.035*(.6+c.z*.8));
  float x=-2.4+4.8*u;
  float k=smoothstep(.05,.75,u);
  float y0=(c.x/6.-.5)*1.6;
  float y=mix(y0,0.,k)+sin(u*9.+c.x*1.7+uT*.6)*.05*(1.-k)+(c.z-.5)*.05*(1.-k*.85);
  return vec3(x,y,(c.z-.5)*.3*(1.-k));
}
void main(){
  float a=clamp(uP,0.,1.), b=clamp(uP-1.,0.,1.);
  float ea=a*a*(3.-2.*a), eb=b*b*(3.-2.*b);
  // ogni particella parte con un piccolo ritardo casuale: il morph "sciama"
  float da=clamp((uP-aR*.35)/(1.-.35),0.,1.); da=da*da*(3.-2.*da);
  float db=clamp((uP-1.-aR*.35)/(1.-.35),0.,1.); db=db*db*(3.-2.*db);
  vec3 p=mix(aA,aB,da);
  p=mix(p,flow(aC),db);
  p+=vec3(sin(uT*.7+aR*40.),cos(uT*.6+aR*31.),sin(uT*.5+aR*17.))*.012;
  float tilt=uTilt*(1.-eb);
  float cr=cos(uRot*(1.-eb)),sr=sin(uRot*(1.-eb));
  p.xz=mat2(cr,-sr,sr,cr)*p.xz;
  float ct=cos(tilt),st=sin(tilt);
  p.yz=mat2(ct,-st,st,ct)*p.yz;
  float z=p.z+4.2; float f=3.1;
  gl_Position=vec4(p.x*f/z/uAsp,(p.y-.05)*f/z,0.,1.);
  gl_PointSize=(1.6+aR*1.8)*uDpr*(4.2/z)*(1.+db*.6);
  vS=uP; vR=aR;
}`;
  const FS = `
precision mediump float; varying float vS, vR;
void main(){
  vec2 c=gl_PointCoord-.5; float d=length(c); if(d>.5)discard;
  float s=smoothstep(.5,.0,d);
  vec3 amber=vec3(1.,.69,.2), ice=vec3(.72,.95,1.), white=vec3(.95,.97,1.);
  vec3 col=mix(amber,ice,smoothstep(.3,.9,vS)); col=mix(col,white,smoothstep(1.2,1.8,vS));
  float a=mix(.85,.7,smoothstep(0.,1.,vS))*mix(1.,.45,smoothstep(1.,2.,vS));
  gl_FragColor=vec4(col*s*a*(.75+vR*.5),1.);
}`;

  function shapeA(n) {
    const W = 800, H = 300, c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); g.fillStyle = g.strokeStyle = '#fff'; g.lineCap = 'round'; g.lineJoin = 'round';
    g.fillRect(0, 268, W, 4); // pavimento
    g.fillRect(50, 206, 700, 18); // nastro
    for (let x = 70; x < 750; x += 34) { g.beginPath(); g.arc(x, 236, 8, 0, 7); g.fill(); }
    [70, 400, 730].forEach(x => g.fillRect(x - 4, 224, 8, 46));
    [[110, 46, 40], [230, 38, 34], [470, 52, 44], [650, 40, 36]].forEach(([x, w, h]) => g.fillRect(x, 206 - h, w, h));
    g.lineWidth = 15;
    const arm = (bx, dir) => { g.fillRect(bx - 34, 168, 68, 38); g.beginPath(); g.moveTo(bx, 170); g.lineTo(bx - 36 * dir, 92); g.lineTo(bx + 62 * dir, 58); g.lineTo(bx + 92 * dir, 112); g.stroke();
      g.lineWidth = 6; g.beginPath(); g.moveTo(bx + 82 * dir, 120); g.lineTo(bx + 82 * dir, 136); g.moveTo(bx + 102 * dir, 120); g.lineTo(bx + 102 * dir, 136); g.stroke(); g.lineWidth = 15; };
    arm(330, 1); arm(600, -1);
    g.fillRect(30, 18, 740, 6); g.fillRect(30, 18, 6, 252); g.fillRect(764, 18, 6, 252); // portale
    g.lineWidth = 2; for (let x = 60; x < 760; x += 60) { g.beginPath(); g.moveTo(x, 24); g.lineTo(x + 30, 50); g.lineTo(x + 60, 24); g.stroke(); }
    const d = g.getImageData(0, 0, W, H).data, px = [];
    for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) if (d[(y * W + x) * 4 + 3] > 128) px.push(x, y);
    const out = new Float32Array(n * 3), m = px.length / 2;
    for (let i = 0; i < n; i++) { const k = (Math.random() * m | 0) * 2;
      out[i * 3] = (px[k] / W - .5) * 3.9 + (Math.random() - .5) * .006; out[i * 3 + 1] = -(px[k + 1] / H - .5) * 1.46; out[i * 3 + 2] = (Math.random() - .5) * .12; }
    return out;
  }
  function shapeB(n) {
    const out = new Float32Array(n * 3), R = Math.random;
    const boxes = [[-1.3, -.7, .7, .5, .45], [-.2, -.8, .9, .4, .3], [1.1, -.6, .6, .7, .6], [-1.2, .6, .5, .5, .25], [0, .5, 1.2, .35, .35], [1.3, .7, .5, .4, .5], [-.6, -.05, 2.6, .12, .08]];
    const edges = [];
    boxes.forEach(([x, z, w, d, h]) => { const y0 = -.55, P = [[x - w / 2, y0, z - d / 2], [x + w / 2, y0, z - d / 2], [x + w / 2, y0, z + d / 2], [x - w / 2, y0, z + d / 2]].flatMap(p => [p, [p[0], y0 + h, p[2]]]);
      const E = [[0, 2], [2, 4], [4, 6], [6, 0], [1, 3], [3, 5], [5, 7], [7, 1], [0, 1], [2, 3], [4, 5], [6, 7]]; E.forEach(([a, b]) => edges.push([P[a], P[b]])); });
    for (let i = 0; i < n; i++) {
      const r = R(); let p;
      if (r < .4) { const t = (R() * 4 - 2), g = Math.round((R() * 4 - 2) * 4) / 4; p = R() < .5 ? [g, -.55, t] : [t, -.55, g]; }
      else if (r < .92) { const [a, b] = edges[R() * edges.length | 0], t = R(); p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
      else { p = [(R() - .5) * 4, -.55 + R() * 1.2, (R() - .5) * 4]; } // polvere di scansione
      out.set(p, i * 3);
    }
    return out;
  }
  function shapeC(n) { const out = new Float32Array(n * 3); for (let i = 0; i < n; i++) out.set([i % 7, Math.random(), Math.random()], i * 3); return out; }

  function Hero(canvas, o) {
    const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: false });
    if (!gl) return null;
    const n = o.count || 22000;
    const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
    const R = new Float32Array(n); for (let i = 0; i < n; i++) R[i] = Math.random();
    [['aA', shapeA(n), 3], ['aB', shapeB(n), 3], ['aC', shapeC(n), 3], ['aR', R, 1]].forEach(([k, d, s]) => {
      const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, d, gl.STATIC_DRAW);
      const l = gl.getAttribLocation(pr, k); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l, s, gl.FLOAT, false, 0, 0); });
    const U = {}; ['uP', 'uT', 'uAsp', 'uRot', 'uTilt', 'uDpr'].forEach(k => U[k] = gl.getUniformLocation(pr, k));
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE); // additivo: le particelle si sommano come luce
    const s = { p: 0, rot: 0, tilt: 0 }; const dpr = Math.min(devicePixelRatio || 1, 2); let raf = 0, run = false; const t0 = performance.now();
    function frame(t) {
      const w = canvas.clientWidth * dpr | 0, h = canvas.clientHeight * dpr | 0; if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      const asp = w / h, fit = Math.min(1, asp / 1.5); // su schermi stretti la scena si rimpicciolisce
      gl.uniform1f(U.uP, s.p); gl.uniform1f(U.uT, t); gl.uniform1f(U.uAsp, asp / fit); gl.uniform1f(U.uRot, s.rot); gl.uniform1f(U.uTilt, s.tilt); gl.uniform1f(U.uDpr, dpr * (o.size || 1));
      gl.drawArrays(gl.POINTS, 0, n);
    }
    function loop() { if (!run) return; frame((performance.now() - t0) / 1000); raf = requestAnimationFrame(loop); }
    return { state: s, frame, set(p) { Object.assign(s, p); if (!run) frame(3); }, start() { if (!run) { run = true; loop(); } }, stop() { run = false; cancelAnimationFrame(raf); } };
  }
  window.OrditoHero = Hero;
})();
