/* world.js - the clay table: set, cast, timeline of the backpropagation story, and the tilt-shift post pass.
   frame(t) is a pure function of t. Characters/props read ts (12 fps stepped), camera + post read t (smooth). */
(function () {
  var W = window, T3 = THREE, lump = W.lumpMesh, cmat = W.clayMat, rngOf = W.rngOf, hash01 = W.hash01;
  var PW = 648, PH = 1152;
  var TL = TIMING.lines, w = function (l, i) { return TL[l - 1].words[i].start; }, we = function (l, i) { return TL[l - 1].words[i].end; };
  var TOT = TIMING.total;
  var COL = { mustard: 0xe0a526, tomato: 0xd9503c, lilac: 0x9b7fc4, judge: 0xf1ead8, teal: 0x4d8c8a, sand: 0xd8b98c, brass: 0xb5892f, red: 0xb02a1a, glow: 0xffa94d, peach: 0xe2a98b, brown: 0xb98b5a, plank: 0xc99f6a };
  var PI = Math.PI;
  /* ---------- easing + keyframes ---------- */
  var EZ = {
    l: function (p) { return p; }, o: function (p) { return 1 - Math.pow(1 - p, 3); }, i: function (p) { return p * p * p; },
    io: function (p) { return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; },
    b: function (p) { var c = 1.9; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); },
    s: function (p) { return p >= 1 ? 1 : 1 - Math.exp(-6.5 * p) * Math.cos(2 * PI * 1.35 * p); },
    h: function (p) { return p >= 1 ? 1 : 0; },
    ant: function (p) { return p < .22 ? -.14 * Math.sin(p / .22 * PI / 2) : -.14 * (1 - (p - .22) / .78) * 0 + (EZ.o((p - .22) / .78) * 1.14 - .14 * (1 - EZ.o((p - .22) / .78))); }
  };
  function kf(t, k) {
    if (t <= k[0][0]) return k[0][1];
    for (var i = 1; i < k.length; i++) if (t <= k[i][0]) { var a = k[i - 1], b = k[i], p = (t - a[0]) / Math.max(1e-6, b[0] - a[0]); return a[1] + (b[1] - a[1]) * EZ[b[2] || "io"](p); }
    return k[k.length - 1][1];
  }
  function kfv(t, k) { // keys [[t,[x,y,z],ease]]
    var o = [0, 0, 0]; for (var c = 0; c < 3; c++) o[c] = kf(t, k.map(function (q) { return [q[0], q[1][c], q[2]]; })); return o;
  }
  function seg(t, t0, t1, a, b, e) { if (t <= t0) return a; if (t >= t1) return b; return a + (b - a) * EZ[e || "io"]((t - t0) / (t1 - t0)); }
  function bell(t, t0, t1) { if (t <= t0 || t >= t1) return 0; return Math.sin((t - t0) / (t1 - t0) * PI); }

  /* ---------- the story's numbers ---------- */
  var R0 = .30, TRUTH = .30, M0 = [1.35, .8, 1.4];
  function outR(r0, m) { return r0 * m[0] * m[1] * m[2]; }
  var OUT0 = outR(R0, M0), DIFF0 = OUT0 - TRUTH;
  var SH = M0.map(function (m) { return OUT0 / m; }); var SHS = SH.reduce(function (a, b) { return a + b; }, 0); SH = SH.map(function (s) { return s / SHS; }); // share of blame per worker (influence of its dial)
  var M1 = M0.map(function (m, i) { return m - .30 * SH[i]; });          // dial nudge proportional to share
  var OUT1 = outR(R0, M1);
  var RW = .38;                                                          // radius of the whole blame lump
  /* montage: other examples, dials creeping toward the sweet spot */
  var LOOPS = [{ r0: .24, m: M1 }, { r0: .36, m: [1.2, .72, 1.22] }, { r0: .28, m: [1.13, .78, 1.16] }, { r0: .33, m: [1.08, .86, 1.07] }];
  var LOSSN = [DIFF0 / DIFF0, (OUT1 - TRUTH) / DIFF0].concat(LOOPS.map(function (L, i) { var nm = L.m; return Math.abs(outR(L.r0, nm) - L.r0) / DIFF0; }));
  W.STORY = { OUT0: OUT0, DIFF0: DIFF0, SH: SH, M1: M1, OUT1: OUT1, LOSSN: LOSSN };

  /* ---------- paint helpers (canvas textures) ---------- */
  function cvs(w, h) { var c = document.createElement("canvas"); c.width = w; c.height = h; return c; }
  function paintBackdrop() {
    var c = cvs(1024, 1024), g = c.getContext("2d"), r = rngOf("backdrop");
    var gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, "#3f7a79"); gr.addColorStop(.7, "#5a9a96"); gr.addColorStop(1, "#7db3a8"); g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
    for (var i = 0; i < 160; i++) { g.strokeStyle = "rgba(" + (r() < .5 ? "255,255,255" : "20,60,60") + "," + (.02 + r() * .05) + ")"; g.lineWidth = 8 + r() * 26; g.beginPath(); var y = r() * 1024, x = r() * 1024; g.moveTo(x, y); g.lineTo(x + 140 + r() * 380, y + (r() - .5) * 20); g.stroke(); }
    g.fillStyle = "#e0a526"; g.beginPath(); g.arc(740, 330, 96, 0, 6.3); g.fill(); g.fillStyle = "rgba(255,230,160,.35)"; g.beginPath(); g.arc(740, 330, 130, 0, 6.3); g.fill();
    g.fillStyle = "#f1ead8"; [[180, 250, 1], [420, 170, .8], [560, 380, .7]].forEach(function (q) { g.beginPath(); for (var k = 0; k < 4; k++) g.arc(q[0] + k * 46 * q[2], q[1] - (k % 2) * 16, 46 * q[2], 0, 6.3); g.fill(); });
    g.fillStyle = "#3d7371"; g.beginPath(); g.moveTo(0, 700); for (var x2 = 0; x2 <= 1024; x2 += 64) g.lineTo(x2, 640 + Math.sin(x2 * .011) * 70); g.lineTo(1024, 1024); g.lineTo(0, 1024); g.fill();
    g.fillStyle = "#336664"; g.beginPath(); g.moveTo(0, 820); for (x2 = 0; x2 <= 1024; x2 += 64) g.lineTo(x2, 780 + Math.sin(x2 * .017 + 2) * 60); g.lineTo(1024, 1024); g.lineTo(0, 1024); g.fill();
    var t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; return t;
  }
  function tableTex() {
    var c = cvs(512, 512), g = c.getContext("2d"), im = g.createImageData(512, 512), r = rngOf("table");
    for (var i = 0; i < 512 * 512; i++) { var v = 128 + (r() - .5) * 40; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
    g.putImageData(im, 0, 0); for (var k = 0; k < 40; k++) { g.fillStyle = "rgba(255,255,255,.12)"; g.beginPath(); g.arc(r() * 512, r() * 512, 2 + r() * 6, 0, 6.3); g.fill(); }
    var t = new T3.CanvasTexture(c); t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(5, 5); return t;
  }
  function decal(text, w, h, ink, font, bg) {
    var c = cvs(512, Math.round(512 * h / w)), g = c.getContext("2d");
    if (bg) { g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height); }
    g.fillStyle = ink; g.textAlign = "center"; g.textBaseline = "middle"; g.font = (font || "700 150px") + " Fredoka, sans-serif";
    var size = parseInt(font || "150", 10) || 150; g.fillText(text, c.width / 2, c.height / 2 + 6);
    var t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; return t;
  }
  function roundedSlab(w, h, d, r) {
    var s = new T3.Shape(); s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return new T3.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: d * .35, bevelSize: d * .35, bevelSegments: 3, curveSegments: 6 });
  }
  function mkTag(text, w, h, hex, seed, ink, font) {
    var g = new T3.Group(), geo = roundedSlab(w, h, .08, .09); W.lumpify(geo, seed, .012, 3);
    var m = new T3.Mesh(geo, cmat(hex, seed, { bump: .8 })); m.castShadow = true; m.receiveShadow = true; g.add(m);
    var dm = new T3.Mesh(new T3.PlaneGeometry(w * .86, h * .8), new T3.MeshStandardMaterial({ map: decal(text, w, h, ink || "#2a1a10", font), transparent: true, roughness: .8, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
    dm.position.z = .125; g.add(dm); return g;
  }
  /* font shapes for extruded lumpy title letters */
  function glyphShapes(ch, size) {
    var gl = HELV.glyphs[ch]; if (!gl) return { shapes: [], adv: size * .6 };
    var sc = size / HELV.resolution, o = gl.o.split(" "), path = new T3.ShapePath(), i = 0;
    while (i < o.length) {
      var a = o[i++];
      if (a === "m") { path.moveTo(+o[i++] * sc, +o[i++] * sc); }
      else if (a === "l") { path.lineTo(+o[i++] * sc, +o[i++] * sc); }
      else if (a === "q") { var cx = +o[i++] * sc, cy = +o[i++] * sc, c1x = +o[i++] * sc, c1y = +o[i++] * sc; path.quadraticCurveTo(c1x, c1y, cx, cy); }
      else if (a === "b") { var bx = +o[i++] * sc, by = +o[i++] * sc, b1x = +o[i++] * sc, b1y = +o[i++] * sc, b2x = +o[i++] * sc, b2y = +o[i++] * sc; path.bezierCurveTo(b1x, b1y, b2x, b2y, bx, by); }
    }
    return { shapes: path.toShapes(false), adv: gl.ha * sc };
  }

  /* ================= build ================= */
  W.buildWorld = function (canvas) {
    var R = new T3.WebGLRenderer({ canvas: canvas, antialias: false, powerPreference: "high-performance", preserveDrawingBuffer: true });
    R.setPixelRatio(1); R.setSize(PW, PH, false); R.shadowMap.enabled = true; R.shadowMap.type = T3.PCFSoftShadowMap; R.outputColorSpace = T3.SRGBColorSpace;
    var rt = new T3.WebGLRenderTarget(PW, PH, { samples: 4, depthTexture: new T3.DepthTexture(PW, PH), colorSpace: T3.LinearSRGBColorSpace });
    var sc = new T3.Scene(), cam = new T3.PerspectiveCamera(34, PW / PH, .5, 60);
    sc.background = new T3.Color(0x4d8c8a);
    /* lights: warm key upper left (soft shadow), cool fill, warm rim */
    var key = new T3.DirectionalLight(0xffe2b8, 3.1); key.position.set(-5.5, 8.5, 5.5); key.castShadow = true;
    key.shadow.mapSize.set(1536, 1536); var sc2 = key.shadow.camera; sc2.left = -7.5; sc2.right = 7.5; sc2.top = 9; sc2.bottom = -9; sc2.near = 2; sc2.far = 30; key.shadow.bias = -.0004; key.shadow.normalBias = .03; key.shadow.radius = 5;
    sc.add(key); var fill = new T3.DirectionalLight(0x9db8ff, .85); fill.position.set(6, 3.5, 6); sc.add(fill);
    var rim = new T3.DirectionalLight(0xffc68a, 1.9); rim.position.set(3, 5, -9); sc.add(rim);
    sc.add(new T3.HemisphereLight(0x9fd0cc, 0x8a6a48, .75));
    /* table + painted backdrop */
    var tabm = new T3.MeshStandardMaterial({ color: COL.sand, roughness: .95, bumpMap: tableTex(), bumpScale: 1.2 });
    var table = new T3.Mesh(new T3.BoxGeometry(16, .4, 16), tabm); table.position.set(0, -.2, -1); table.receiveShadow = true; sc.add(table);
    var bd = new T3.Mesh(new T3.PlaneGeometry(34, 24), new T3.MeshBasicMaterial({ map: paintBackdrop() })); bd.position.set(0, 7, -9.2); sc.add(bd);
    /* contact blobs */
    var blobTex = (function () { var c = cvs(128, 128), g = c.getContext("2d"), gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, "rgba(40,22,10,.62)"); gr.addColorStop(.6, "rgba(40,22,10,.25)"); gr.addColorStop(1, "rgba(40,22,10,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return new T3.CanvasTexture(c); })();
    function blob(sz) { var m = new T3.Mesh(new T3.PlaneGeometry(1, 1), new T3.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false })); m.rotation.x = -PI / 2; m.position.y = .004; m.scale.set(sz, sz, 1); sc.add(m); return m; }

    /* ---------- characters ---------- */
    function mkChar(hex, seed, hs, name) {
      var g = new T3.Group(), mat = cmat(hex, seed), r = rngOf("char" + seed), cy = .2 + .62 * 1.28 * hs;
      var body = lump(new T3.SphereGeometry(.62, 40, 28), mat, seed, .05, 1.6); body.scale.set(1, 1.28 * hs, .95); body.position.y = cy; g.add(body);
      var legs = [-1, 1].map(function (s) { var l = lump(new T3.SphereGeometry(.22, 20, 14), mat, seed + s * 7, .02, 3); l.scale.set(1, .8, 1.25); l.position.set(s * .27, .19, .1); g.add(l); return l; });
      var arms = [-1, 1].map(function (s, k) {
        var piv = new T3.Group(); piv.position.set(s * .6, cy + .22 * hs, 0); var a = lump(new T3.CapsuleGeometry(.14, .5, 6, 12), mat, seed + 20 + k, .018, 3); a.position.y = -.34; piv.add(a);
        var hand = lump(new T3.SphereGeometry(.17, 16, 12), mat, seed + 30 + k, .02, 3); hand.position.y = -.68; piv.add(hand); g.add(piv); return { piv: piv, rest: s * .22 };
      });
      var eyeM = new T3.MeshPhysicalMaterial({ color: 0x15100c, roughness: .18, clearcoat: 1, clearcoatRoughness: .1 });
      var eyes = [-1, 1].map(function (s) { var e = new T3.Mesh(new T3.SphereGeometry(.088, 14, 12), eyeM); e.position.set(s * .2, cy + .3 * hs, .5); g.add(e); return e; });
      var mouthM = new T3.MeshStandardMaterial({ color: 0x3a1a12, roughness: .6 });
      var mouth = new T3.Mesh(new T3.TorusGeometry(.11, .042, 8, 16, PI), mouthM); mouth.position.set(0, cy + .0, .55); g.add(mouth);
      var mO = new T3.Mesh(new T3.SphereGeometry(.07, 12, 10), mouthM); mO.position.set(0, cy - .02, .55); mO.scale.set(1, 1.2, .5); g.add(mO);
      var browM = new T3.MeshStandardMaterial({ color: 0x3a2418, roughness: .7 });
      var brows = [-1, 1].map(function (s) { var b = new T3.Mesh(new T3.CapsuleGeometry(.024, .11, 4, 8), browM); b.rotation.z = PI / 2; b.position.set(s * .2, cy + .42 * hs, .47); g.add(b); return { m: b, s: s, y: cy + .42 * hs }; });
      var dialY = cy - .3 * hs, dial = new T3.Group(); dial.position.set(0, dialY, .6); g.add(dial);
      var brass = new T3.MeshStandardMaterial({ color: COL.brass, metalness: .75, roughness: .34 });
      var ring = new T3.Mesh(new T3.TorusGeometry(.14, .032, 10, 28), brass); dial.add(ring);
      var face = new T3.Mesh(new T3.CylinderGeometry(.15, .15, .03, 24), new T3.MeshStandardMaterial({ color: 0xf1ead8, roughness: .7 })); face.rotation.x = PI / 2; face.position.z = -.01; dial.add(face);
      for (var k = 0; k < 9; k++) { var tk = new T3.Mesh(new T3.BoxGeometry(.012, .035, .01), brass); var ang = -2.2 + k * .55; tk.position.set(Math.sin(ang) * .125, Math.cos(ang) * .125, .02); tk.rotation.z = -ang; dial.add(tk); }
      var pivot = new T3.Group(); pivot.position.z = .03; dial.add(pivot); var needle = new T3.Mesh(new T3.BoxGeometry(.022, .12, .02), new T3.MeshStandardMaterial({ color: 0xb02a1a, roughness: .5 })); needle.position.y = .05; pivot.add(needle);
      var hub = new T3.Mesh(new T3.SphereGeometry(.03, 8, 8), brass); hub.position.z = .03; dial.add(hub);
      var seam = new T3.Mesh(new T3.TorusGeometry(.6, .012, 6, 44), new T3.MeshStandardMaterial({ color: new T3.Color(hex).multiplyScalar(.55), roughness: .8 })); seam.rotation.x = PI / 2; seam.scale.y = .95; seam.position.y = cy - .12 * hs; g.add(seam);
      for (k = 0; k < 4; k++) { var d = new T3.Mesh(new T3.SphereGeometry(.016, 6, 5), new T3.MeshStandardMaterial({ color: 0xd8d0be, roughness: 1 })); var th = r() * 6.28, ph = .9 + r() * 1.1; d.position.set(Math.sin(ph) * Math.cos(th) * .6, cy + Math.cos(ph) * .62 * 1.28 * hs, Math.sin(ph) * Math.sin(th) * .58); if (d.position.z < 0) d.position.z *= -1; g.add(d); }
      sc.add(g);
      return { g: g, body: body, cy: cy, hs: hs, legs: legs, arms: arms, eyes: eyes, mouth: mouth, mO: mO, brows: brows, pivot: pivot, dial: dial, shadow: blob(1.9), name: name };
    }
    var P = [[-.9, 0, 3.0], [.25, 0, .8], [1.05, 0, -1.5]], JP = [.35, 0, -4.35];
    var wk = [mkChar(COL.lilac, 11, 1, "w1"), mkChar(COL.mustard, 23, 1, "w2"), mkChar(COL.tomato, 37, 1, "w3")];
    wk.forEach(function (c, i) { c.g.position.set(P[i][0], 0, P[i][2]); c.g.rotation.y = .14; c.sh0 = P[i]; });
    var judge = mkChar(COL.judge, 53, 1.32, "judge"); judge.g.position.set(JP[0], .42, JP[2]); sc.add(judge.g);
    judge.dial.visible = false;
    var podium = lump(new T3.CylinderGeometry(.9, 1.0, .42, 36, 2), cmat(COL.brown, 61), 61, .03, 1.6); podium.position.set(JP[0], .21, JP[2]); sc.add(podium);
    var plank = lump(new T3.BoxGeometry(2.4, .14, .8, 12, 2, 6), cmat(COL.plank, 67), 67, .02, 2); plank.position.set(.45, .07, -3.1); sc.add(plank);
    /* ruler */
    var ruler = (function () { var c = cvs(512, 64), g = c.getContext("2d"); g.fillStyle = "#e9c46a"; g.fillRect(0, 0, 512, 64); g.fillStyle = "#6b4a22"; for (var i = 0; i <= 24; i++) g.fillRect(i * 21, 0, 3, i % 4 ? 16 : 30); var t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; var m = cmat(0xe9c46a, 71); m.map = t; return lump(new T3.BoxGeometry(2.0, .07, .22, 20, 1, 2), m, 71, .01, 2); })();
    sc.add(ruler);

    /* ---------- the number ball, the answer ball, the truth ball, the blame lumps, the wedge ---------- */
    var ballMat = cmat(COL.glow, 81, { emissive: 0xff8a2a, ei: .28 });
    function ball(mat, seed) { var m = lump(new T3.SphereGeometry(1, 28, 20), mat, seed, .04, 1.3); sc.add(m); return m; }
    var ballM = ball(ballMat, 81), ansM = ball(cmat(COL.glow, 82, { emissive: 0xff8a2a, ei: .2 }), 82), truthM = ball(cmat(COL.judge, 83), 83);
    var redMat = cmat(COL.red, 91, { emissive: 0x7a1608, ei: .22 });
    var lumpM = ball(redMat, 91), pieces = [ball(redMat, 92), ball(redMat, 93), ball(redMat, 94)];
    var wShape = new T3.Shape(); wShape.moveTo(0, 0); wShape.lineTo(1, 0); wShape.lineTo(1, 1); wShape.lineTo(0, 0);
    var wg = new T3.ExtrudeGeometry(wShape, { depth: .5, bevelEnabled: true, bevelThickness: .03, bevelSize: .03, bevelSegments: 2 }); wg.translate(0, 0, -.25); W.lumpify(wg, 95, .02, 3);
    var wedge = new T3.Mesh(wg, cmat(COL.glow, 96)); wedge.castShadow = true; wedge.receiveShadow = true; sc.add(wedge);
    var blobN = blob(1), blobA = blob(1), blobT = blob(1);
    /* tags */
    var lossTag = mkTag("LOSS", 1.0, .46, COL.mustard, 101, "#3a2410", "700 170px"); sc.add(lossTag);
    var truthTag = mkTag("truth", .72, .3, COL.teal, 102, "#f1ead8", "600 150px"); sc.add(truthTag);
    var faultTag = mkTag("my fault?", 1.3, .46, COL.judge, 103, "#3a2410", "700 130px"); sc.add(faultTag);
    var numTag = mkTag("number", .8, .3, COL.judge, 104, "#3a2410", "600 140px"); sc.add(numTag);
    /* nudge arrows: length shows the share */
    function mkArrow(seed) { var g = new T3.Group(), mat = cmat(COL.mustard, seed), sh = lump(new T3.CylinderGeometry(.09, .09, 1, 12, 4), mat, seed, .015, 3), hd = lump(new T3.ConeGeometry(.2, .36, 14, 2), mat, seed + 1, .015, 3); g.add(sh); g.add(hd); g.userData = { sh: sh, hd: hd }; sc.add(g); return g; }
    var arrows = [mkArrow(111), mkArrow(112), mkArrow(113)];
    /* hands (intro + transitions) */
    function mkHand(hex, seed) {
      var g = new T3.Group(), mat = cmat(hex, seed); var palm = lump(new T3.SphereGeometry(.5, 24, 18), mat, seed, .04, 1.8); palm.scale.set(1, .38, 1.1); g.add(palm);
      for (var k = 0; k < 4; k++) { var f = lump(new T3.CapsuleGeometry(.1, .52, 6, 10), mat, seed + k + 1, .02, 3); f.rotation.x = PI / 2; f.position.set(-.34 + k * .23, 0, -.78 - (k === 1 || k === 2 ? .08 : 0)); g.add(f); }
      var th = lump(new T3.CapsuleGeometry(.11, .4, 6, 10), mat, seed + 9, .02, 3); th.rotation.z = -1.1; th.rotation.x = 1.0; th.position.set(.62, 0, -.1); g.add(th); sc.add(g); return g;
    }
    var hand = mkHand(COL.peach, 121), bigHand = mkHand(COL.lilac, 131);
    bigHand.scale.setScalar(3.6);
    /* certificate + stamp */
    var cert = mkTag("CERTIFIED", 1.5, 1.0, COL.judge, 141, "#3a2410", "700 110px"); sc.add(cert);
    var stampDecal = (function () { var c = cvs(256, 256), g = c.getContext("2d"); for (var k = 2; k < 28; k++) { g.beginPath(); for (var a = 0; a < 6.4; a += .08) { var rr = k * 4 + Math.sin(a * 3 + k) * 1.5 + a * .5; g.lineTo(128 + Math.cos(a) * rr * 1.0, 128 + Math.sin(a) * rr * .9); } g.strokeStyle = "rgba(176,42,26,.9)"; g.lineWidth = 3; g.stroke(); } var t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; return t; })();
    var stampM = new T3.Mesh(new T3.PlaneGeometry(.62, .62), new T3.MeshBasicMaterial({ map: stampDecal, transparent: true, depthWrite: false, opacity: 0, polygonOffset: true, polygonOffsetFactor: -3 })); stampM.position.z = .13; cert.add(stampM);
    var thumb = lump(new T3.CapsuleGeometry(.16, .5, 6, 10), cmat(COL.judge, 151), 151, .02, 3); sc.add(thumb);
    /* loss bar for the montage + the title */
    var barM = lump(new T3.BoxGeometry(.8, 1, .8, 6, 6, 6), cmat(COL.tomato, 161), 161, .03, 2); sc.add(barM);
    var barTag = mkTag("loss", .8, .3, COL.mustard, 162, "#3a2410", "700 150px"); sc.add(barTag);
    var title = new T3.Group(); sc.add(title); var letters = [];
    (function () {
      var lines = ["BACKPROP", "AGATION"], cols = [COL.mustard, COL.tomato, COL.lilac, COL.teal], size = .92, k = 0;
      lines.forEach(function (ln, li) {
        var adv = [], tot = 0; ln.split("").forEach(function (ch) { var gs = glyphShapes(ch, size); adv.push(gs); tot += gs.adv + .06; });
        var x = -tot / 2;
        ln.split("").forEach(function (ch, ci) {
          var gs = adv[ci], geo = new T3.ExtrudeGeometry(gs.shapes, { depth: .5, bevelEnabled: true, bevelThickness: .1, bevelSize: .075, bevelSegments: 4, curveSegments: 8 });
          geo.computeBoundingBox(); geo.translate(0, 0, -.25); W.lumpify(geo, 200 + k, .04, 2.2);
          var m = new T3.Mesh(geo, cmat(cols[k % 3], 210 + k)); m.castShadow = true; m.receiveShadow = true; m.position.set(x, 0, 0); var hold = new T3.Group(); hold.position.set(0, 0, 0); hold.add(m); title.add(hold);
          letters.push({ g: hold, m: m, li: li, ci: ci, x: x }); x += gs.adv + .06; k++;
        });
      });
    })();
    title.position.set(.2, .42, 4.6); title.rotation.x = -PI / 2 + .5; title.scale.setScalar(.5);                     // laid on the table, tipped toward camera

    /* ---------- post pass: depth based DOF + tilt-shift + vignette ---------- */
    var postMat = new T3.ShaderMaterial({
      uniforms: { tColor: { value: rt.texture }, tDepth: { value: rt.depthTexture }, res: { value: new T3.Vector2(PW, PH) }, near: { value: cam.near }, far: { value: cam.far }, focus: { value: 9 }, sx: { value: 0 }, sy: { value: 0 }, maxR: { value: 9 } },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }",
      fragmentShader: "#include <common>\n#include <packing>\nvarying vec2 vUv; uniform sampler2D tColor, tDepth; uniform vec2 res; uniform float near, far, focus, sx, sy, maxR;\n" +
        "void main(){ vec2 uv = vUv + vec2(sx, sy) / res; float d = texture2D(tDepth, uv).x; float z = -perspectiveDepthToViewZ(d, near, far);\n" +
        " float coc = clamp(abs(z - focus) / focus * 2.4, 0., 1.); float tilt = smoothstep(.2, .5, abs(uv.y - .5)); float c = clamp(coc * .85 + tilt * .8, 0., 1.); float Rr = c * maxR;\n" +
        " vec3 acc = texture2D(tColor, uv).rgb; float ws = 1.; for (int i = 0; i < 24; i++) { float fi = float(i) + 1.; float a = fi * 2.39996; float r = sqrt(fi / 24.) * Rr; vec2 o = vec2(cos(a), sin(a)) * r / res; vec3 s = texture2D(tColor, uv + o).rgb; float sz = -perspectiveDepthToViewZ(texture2D(tDepth, uv + o).x, near, far); float sc = clamp(abs(sz - focus) / focus * 2.4, 0., 1.); float wgt = mix(.35, 1., step(abs(sz - z), 1.5) + sc); acc += s * wgt; ws += wgt; }\n" +
        " vec3 col = acc / ws; float vg = length(vUv - .5) * 1.3; col *= 1. - .34 * pow(vg, 2.4); gl_FragColor = vec4(col, 1.);\n#include <colorspace_fragment>\n}",
      depthTest: false, depthWrite: false
    });
    var quad = new T3.Mesh(new T3.PlaneGeometry(2, 2), postMat), qsc = new T3.Scene(); qsc.add(quad); var qcam = new T3.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    return { R: R, rt: rt, sc: sc, cam: cam, qsc: qsc, qcam: qcam, postMat: postMat, key: key, wk: wk, judge: judge, P: P, JP: JP, podium: podium, plank: plank, ruler: ruler, ballM: ballM, ansM: ansM, truthM: truthM, lumpM: lumpM, pieces: pieces, wedge: wedge, blobN: blobN, blobA: blobA, blobT: blobT, lossTag: lossTag, truthTag: truthTag, faultTag: faultTag, numTag: numTag, arrows: arrows, hand: hand, bigHand: bigHand, cert: cert, stampM: stampM, thumb: thumb, barM: barM, barTag: barTag, title: title, letters: letters, mkTag: mkTag };
  };
  W.CLAYC = { COL: COL, EZ: EZ, kf: kf, kfv: kfv, seg: seg, bell: bell, w: w, we: we, R0: R0, TRUTH: TRUTH, M0: M0, RW: RW, LOOPS: LOOPS, outR: outR, PW: PW, PH: PH };
})();
