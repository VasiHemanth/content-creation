/* clay.js - plasticine set for the backpropagation video (Three.js r160 classic build).
   Everything is a pure function of the time handed to frame(t): no accumulated physics, no rAF,
   no Math.random. Characters read a 12 fps stepped clock, the camera and post pass read the real clock. */
(function () {
  var W = window, T3 = W.THREE;
  /* ---------------- seeded randomness ---------------- */
  W.mulberry32 = function (a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  W.seedOf = function (s) { var h = 1779033703 ^ s.length; for (var i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^ (h >>> 16)) >>> 0; };
  W.rngOf = function (s) { return W.mulberry32(W.seedOf(s)); };
  var hash01 = W.hash01 = function (n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  /* ---------------- 3D value noise ---------------- */
  function h3(x, y, z, s) { var n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + s * 19.19) * 43758.5453; return (n - Math.floor(n)) * 2 - 1; }
  function sm(t) { return t * t * (3 - 2 * t); }
  function vn(x, y, z, s) {
    var xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = sm(x - xi), yf = sm(y - yi), zf = sm(z - zi), a = [];
    for (var k = 0; k < 2; k++) for (var j = 0; j < 2; j++) for (var i = 0; i < 2; i++) a.push(h3(xi + i, yi + j, zi + k, s));
    var x00 = a[0] + (a[1] - a[0]) * xf, x10 = a[2] + (a[3] - a[2]) * xf, x01 = a[4] + (a[5] - a[4]) * xf, x11 = a[6] + (a[7] - a[6]) * xf;
    var y0 = x00 + (x10 - x00) * yf, y1 = x01 + (x11 - x01) * yf; return y0 + (y1 - y0) * zf;
  }
  /* weld-aware smooth normals (works for indexed seams and non-indexed geometry) */
  function smoothNormals(g) {
    var pos = g.attributes.position, idx = g.index, n = pos.count, map = {}, keys = new Array(n), acc = [];
    for (var i = 0; i < n; i++) { var k = Math.round(pos.getX(i) * 2e3) + "," + Math.round(pos.getY(i) * 2e3) + "," + Math.round(pos.getZ(i) * 2e3); keys[i] = k; if (!map[k]) map[k] = [0, 0, 0]; }
    var tri = idx ? idx.count / 3 : n / 3, a = new T3.Vector3(), b = new T3.Vector3(), c = new T3.Vector3(), e1 = new T3.Vector3(), e2 = new T3.Vector3();
    for (var t = 0; t < tri; t++) {
      var ia = idx ? idx.getX(t * 3) : t * 3, ib = idx ? idx.getX(t * 3 + 1) : t * 3 + 1, ic = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
      a.fromBufferAttribute(pos, ia); b.fromBufferAttribute(pos, ib); c.fromBufferAttribute(pos, ic);
      e1.subVectors(b, a); e2.subVectors(c, a); e1.cross(e2);
      [ia, ib, ic].forEach(function (q) { var m = map[keys[q]]; m[0] += e1.x; m[1] += e1.y; m[2] += e1.z; });
    }
    var nor = new Float32Array(n * 3);
    for (i = 0; i < n; i++) { var m = map[keys[i]], l = Math.hypot(m[0], m[1], m[2]) || 1; nor[i * 3] = m[0] / l; nor[i * 3 + 1] = m[1] / l; nor[i * 3 + 2] = m[2] / l; }
    g.setAttribute("normal", new T3.BufferAttribute(nor, 3));
  }
  /* slightly lumpy primitives: low-frequency seeded noise along the normal */
  function lumpify(g, seed, amp, freq) {
    var pos = g.attributes.position, nor = g.attributes.normal, s = seed % 997;
    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      var n = vn(x * freq, y * freq, z * freq, s) * .65 + vn(x * freq * 2.3, y * freq * 2.3, z * freq * 2.3, s + 5) * .35;
      var nx = nor ? nor.getX(i) : x, ny = nor ? nor.getY(i) : y, nz = nor ? nor.getZ(i) : z, l = Math.hypot(nx, ny, nz) || 1;
      pos.setXYZ(i, x + nx / l * n * amp, y + ny / l * n * amp, z + nz / l * n * amp);
    }
    pos.needsUpdate = true; smoothNormals(g); return g;
  }
  W.lumpify = lumpify;
  /* ---------------- fingerprint / tool-mark bump texture, one per seed ---------------- */
  var bumpCache = {};
  function bumpTex(seed) {
    if (bumpCache[seed]) return bumpCache[seed];
    var S = 256, c = document.createElement("canvas"); c.width = c.height = S; var g = c.getContext("2d"), im = g.createImageData(S, S), r = W.mulberry32(seed + 17), s = seed % 997;
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var n = vn(x / 22, y / 22, 0, s) * .5 + vn(x / 7, y / 7, 3, s + 1) * .3 + vn(x / 2.4, y / 2.4, 9, s + 2) * .2;
      var v = 128 + n * 46; var o = (y * S + x) * 4; im.data[o] = im.data[o + 1] = im.data[o + 2] = v; im.data[o + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    // swirl fingerprint ridges
    for (var f = 0; f < 3; f++) {
      var cx = r() * S, cy = r() * S, rot = r() * 6, sx = 1 + r() * .4;
      g.save(); g.translate(cx, cy); g.rotate(rot); g.scale(sx, 1);
      for (var k = 2; k < 15; k++) { g.beginPath(); for (var a = 0; a <= 6.4; a += .08) { var rr = k * 3.6 + Math.sin(a * 3 + k) * 1.2 + a * .6; g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr * .85); } g.strokeStyle = "rgba(190,190,190,.5)"; g.lineWidth = 1.7; g.stroke(); g.strokeStyle = "rgba(60,60,60,.35)"; g.lineWidth = 1; g.translate(.8, .8); g.stroke(); g.translate(-.8, -.8); }
      g.restore();
    }
    // thumb dents and a couple of tool nicks
    for (var d = 0; d < 7; d++) { var dx = r() * S, dy = r() * S, dr = 8 + r() * 16, gr = g.createRadialGradient(dx, dy, 0, dx, dy, dr); gr.addColorStop(0, "rgba(40,40,40,.85)"); gr.addColorStop(.7, "rgba(90,90,90,.35)"); gr.addColorStop(1, "rgba(128,128,128,0)"); g.fillStyle = gr; g.fillRect(dx - dr, dy - dr, dr * 2, dr * 2); }
    for (var q = 0; q < 6; q++) { g.strokeStyle = "rgba(30,30,30,.7)"; g.lineWidth = 1.4; g.beginPath(); var qx = r() * S, qy = r() * S, ang = r() * 6.28; g.moveTo(qx, qy); g.lineTo(qx + Math.cos(ang) * (12 + r() * 16), qy + Math.sin(ang) * (12 + r() * 16)); g.stroke(); }
    var t = new T3.CanvasTexture(c); t.wrapS = t.wrapT = T3.RepeatWrapping; bumpCache[seed] = t; return t;
  }
  /* plasticine: rough, a little sheen, a fresnel rim that is brighter and more saturated than the body (fake SSS) */
  function clayMat(hex, seed, o) {
    o = o || {}; var col = new T3.Color(hex), hsl = {}; col.getHSL(hsl);
    var sss = new T3.Color().setHSL(hsl.h, Math.min(1, hsl.s * 1.25 + .1), Math.min(.78, hsl.l * 1.18 + .05));
    var m = new T3.MeshPhysicalMaterial({ color: col, roughness: o.rough == null ? .56 : o.rough, metalness: 0, sheen: .55, sheenRoughness: .55, sheenColor: col.clone().lerp(new T3.Color(0xffffff), .35), clearcoat: .07, clearcoatRoughness: .65, bumpMap: bumpTex(seed || 3), bumpScale: o.bump == null ? 1.1 : o.bump, emissive: o.emissive ? new T3.Color(o.emissive) : new T3.Color(0), emissiveIntensity: o.ei || 0 });
    m.onBeforeCompile = function (sh) {
      sh.uniforms.sssCol = { value: sss.clone() };
      sh.fragmentShader = sh.fragmentShader.replace("void main() {", "uniform vec3 sssCol;\nvoid main() {").replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\n float sssF = pow(1.0 - saturate(dot(normalize(vNormal), normalize(vViewPosition))), 2.2);\n totalEmissiveRadiance += sssCol * sssF * 0.42;");
    };
    return m;
  }
  W.clayMat = clayMat;
  function lump(geo, mat, seed, amp, freq, shadow) {
    lumpify(geo, seed, amp, freq); var m = new T3.Mesh(geo, mat); m.castShadow = shadow !== false; m.receiveShadow = true; return m;
  }
  W.lumpMesh = lump;
  W.T3 = T3;
})();
