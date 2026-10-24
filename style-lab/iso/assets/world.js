/* world.js - builds the isometric diorama in Three.js (orthographic camera) and draws it as a pure function of t. */
(function (g) {
  var ISO = g.ISO, C = ISO.C, B = ISO.B, U = ISO.u;
  var P = { ground: "#f3f6fa", side: "#c9d3e0", bg: "#dfe6f0", server: "#3b6cff", cache: "#ff9f1c", db: "#35405a", cyan: "#18c8d4", stale: "#a47c54", gold: "#ffc83d", belt: "#4a556e", white: "#ffffff", ink: "#26304a" };

  var geoCache = {};
  /* rounded box centred on the origin: shape + bevel, so every edge is softened by r */
  function rbox(w, h, d, r) {
    var key = [w, h, d, r].join(",");
    if (geoCache[key]) return geoCache[key];
    r = Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001);
    var sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(w - 2 * r, 0); sh.lineTo(w - 2 * r, h - 2 * r); sh.lineTo(0, h - 2 * r); sh.lineTo(0, 0);
    var geo = new THREE.ExtrudeGeometry(sh, { depth: d - 2 * r, bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: 2, curveSegments: 2 });
    geo.translate(-(w - 2 * r) / 2, -(h - 2 * r) / 2, -(d - 2 * r) / 2);
    return (geoCache[key] = geo);
  }
  var matCache = {};
  function mat(color, o) {
    o = o || {}; var key = color + JSON.stringify(o);
    if (matCache[key]) return matCache[key];
    var m = new THREE.MeshStandardMaterial({ color: color, roughness: o.rough == null ? 0.62 : o.rough, metalness: o.metal || 0, flatShading: false, emissive: o.emissive || 0x000000, emissiveIntensity: o.ei || 0, transparent: !!o.opacity, opacity: o.opacity == null ? 1 : o.opacity });
    return (matCache[key] = m);
  }
  function box(parent, w, h, d, color, x, y, z, o) {
    o = o || {}; var m = new THREE.Mesh(rbox(w, h, d, o.r == null ? Math.min(w, h, d) * 0.04 + 0.01 : o.r), o.material || mat(color, o));
    m.position.set(x, y, z); m.castShadow = o.cast !== false; m.receiveShadow = o.recv !== false; parent.add(m); return m;
  }
  function blob(parent, x, z, w, d, a) {      // baked-looking contact shadow
    if (!blob.tex) { var c = document.createElement("canvas"); c.width = c.height = 128; var cx = c.getContext("2d"), gr = cx.createRadialGradient(64, 64, 8, 64, 64, 64); gr.addColorStop(0, "rgba(40,55,90,.55)"); gr.addColorStop(1, "rgba(40,55,90,0)"); cx.fillStyle = gr; cx.fillRect(0, 0, 128, 128); blob.tex = new THREE.CanvasTexture(c); }
    var m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: blob.tex, transparent: true, depthWrite: false, opacity: a || 1 }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.012, z); parent.add(m); return m;
  }
  function chevronTex() {
    var c = document.createElement("canvas"); c.width = 128; c.height = 64; var x = c.getContext("2d");
    x.fillStyle = "#4a556e"; x.fillRect(0, 0, 128, 64); x.strokeStyle = "#9fb0d6"; x.lineWidth = 9; x.lineJoin = "miter";
    x.beginPath(); x.moveTo(30, 8); x.lineTo(70, 32); x.lineTo(30, 56); x.stroke();
    x.strokeStyle = "#566280"; x.lineWidth = 3; x.beginPath(); x.moveTo(0, 2); x.lineTo(128, 2); x.moveTo(0, 62); x.lineTo(128, 62); x.stroke();
    var t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t;
  }

  var W = (ISO.world = {});
  /* ---- build ---- */
  W.build = function (canvas) {
    var rr = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, preserveDrawingBuffer: true });
    rr.setPixelRatio(1); rr.setSize(1080, 1920, false);
    rr.shadowMap.enabled = true; rr.shadowMap.type = THREE.PCFSoftShadowMap;
    rr.outputEncoding = THREE.sRGBEncoding;
    var scene = new THREE.Scene(); scene.background = new THREE.Color(P.bg);
    var cam = new THREE.OrthographicCamera(-10, 10, 10, -10, 1, 200);
    var key = new THREE.DirectionalLight(0xffffff, 2.1); key.position.set(-6, 13, 9); key.target.position.set(0, 0, 0);
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.radius = 4; key.shadow.bias = -0.0005; key.shadow.normalBias = 0.02;
    var sc = key.shadow.camera; sc.left = -10; sc.right = 10; sc.top = 8; sc.bottom = -8; sc.near = 1; sc.far = 40;
    scene.add(key); scene.add(key.target);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb4c2d8, 1.25));
    var fill = new THREE.DirectionalLight(0xdfe8ff, 1.0); fill.position.set(10, 6, 2); scene.add(fill);
    var world = new THREE.Group(); scene.add(world);
    var S = { rr: rr, scene: scene, cam: cam, world: world, belts: [], leds: [] };

    /* tile + crowd slab (the slab sinks in beat 7) */
    var main = new THREE.Group(); world.add(main);
    box(main, 9.6, 0.6, 5.5, P.ground, -2.7, -0.3, 0, { r: 0.07, recv: true, cast: false });
    // side shading strip so the tile reads as a slab with thickness
    var sideM = new THREE.Mesh(rbox(9.62, 0.34, 5.52, 0.05), mat(P.side)); sideM.position.set(-2.7, -0.34, 0); main.add(sideM);
    var pad = (S.pad = new THREE.Group()); world.add(pad);
    box(pad, 5.5, 0.6, 5.5, P.ground, 4.75, -0.3, 0, { r: 0.07, cast: false });
    var sideP = new THREE.Mesh(rbox(5.52, 0.34, 5.52, 0.05), mat(P.side)); sideP.position.set(4.75, -0.34, 0); pad.add(sideP);
    // faint grid on the ground
    var gc = document.createElement("canvas"); gc.width = 1536; gc.height = 550; var gx = gc.getContext("2d"); gx.strokeStyle = "rgba(120,140,175,.20)"; gx.lineWidth = 2;
    for (var gi = 0; gi <= 30; gi++) { gx.beginPath(); gx.moveTo(gi * 51.2, 0); gx.lineTo(gi * 51.2, 550); gx.stroke(); }
    for (gi = 0; gi <= 11; gi++) { gx.beginPath(); gx.moveTo(0, gi * 50); gx.lineTo(1536, gi * 50); gx.stroke(); }
    var gt = new THREE.CanvasTexture(gc); gt.anisotropy = 4;
    var gp = new THREE.Mesh(new THREE.PlaneGeometry(15, 5.4), new THREE.MeshBasicMaterial({ map: gt, transparent: true, depthWrite: false })); gp.rotation.x = -Math.PI / 2; gp.position.set(0, 0.004, 0); world.add(gp); S.gridPlane = gp;
    // the grid also lives on the sinking slab: split the plane
    gp.visible = false;
    var gtA = gt.clone(); gtA.repeat.set(9.6 / 15, 1); gtA.offset.set(0, 0); gtA.needsUpdate = true;
    var gpA = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 5.4), new THREE.MeshBasicMaterial({ map: gtA, transparent: true, depthWrite: false })); gpA.rotation.x = -Math.PI / 2; gpA.position.set(-2.7, 0.004, 0); main.add(gpA);
    var gtB = gt.clone(); gtB.repeat.set(5.4 / 15, 1); gtB.offset.set(9.6 / 15, 0); gtB.needsUpdate = true;
    var gpB = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 5.4), new THREE.MeshBasicMaterial({ map: gtB, transparent: true, depthWrite: false })); gpB.rotation.x = -Math.PI / 2; gpB.position.set(4.8, 0.004, 0); pad.add(gpB);

    /* belts */
    var tex = chevronTex();
    function belt(parent, x0, z0, x1, z1, w, sign, name) {
      var horiz = Math.abs(x1 - x0) >= Math.abs(z1 - z0), len = horiz ? Math.abs(x1 - x0) : Math.abs(z1 - z0), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      var t = tex.clone(); t.needsUpdate = true; t.repeat.set(len / 0.5 * sign, 1);
      var m = new THREE.Mesh(new THREE.PlaneGeometry(len, w), new THREE.MeshStandardMaterial({ map: t, roughness: 0.8 }));
      m.rotation.x = -Math.PI / 2; if (!horiz) m.rotation.z = Math.PI / 2; m.position.set(cx, C.BELT_Y + 0.001, cz); m.receiveShadow = true; parent.add(m);
      var base = horiz ? rbox(len, 0.12, w + 0.16, 0.03) : rbox(w + 0.16, 0.12, len, 0.03);
      var b = new THREE.Mesh(base, mat("#39435c")); b.position.set(cx, 0.06, cz); b.castShadow = true; b.receiveShadow = true; parent.add(b);
      S.belts.push({ tex: t, len: len, sign: sign, dir: sign, horiz: horiz });
      return m;
    }
    belt(pad, 2.1, -1.9, 7.5, -1.9, 1.7, -1); belt(pad, 2.1, 0, 7.5, 0, 1.7, -1); belt(pad, 2.1, 1.9, 7.5, 1.9, 1.7, -1);
    belt(main, -4.4, C.ZIN, 2.0, C.ZIN, 1.2, -1);                       // in lane, flows toward the database
    belt(main, -4.4, C.ZOUT, C.OUT_X, C.ZOUT, 1.2, 1);                  // answers flow back out
    belt(main, C.OUT_X, C.ZOUT, C.OUT_X, 2.3, 1.2, 1);                  // and turn toward the bin
    // belt side rails (white) on the crowd belts
    [-1.05, 0.85, 2.75].forEach(function (z) { box(pad, 5.4, 0.1, 0.08, P.white, 4.8, 0.17, z, { r: 0.02 }); });

    /* gate in front of the lane */
    var gate = (S.gate = new THREE.Group()); world.add(gate);
    box(gate, 0.15, 0.5, 4.0, P.white, 2.0, 0.25, 0.75, { r: 0.04 });      // low wall z -2.75 .. 1.25 ... drawn in two pieces below
    gate.children[0].visible = false;
    box(gate, 0.18, 0.55, 1.3, P.white, 2.0, 0.28, -2.1, { r: 0.04 });     // wall z -2.75..-1.45
    box(gate, 0.18, 0.55, 3.3, P.white, 2.0, 0.28, 1.35, { r: 0.04 });     // wall z -0.3..3.0 (clipped by the tile)
    box(gate, 0.22, 1.5, 0.22, P.white, 2.0, 0.75, -1.5, { r: 0.05 }); box(gate, 0.22, 1.5, 0.22, P.white, 2.0, 0.75, -0.3, { r: 0.05 });
    box(gate, 0.26, 0.22, 1.5, P.white, 2.0, 1.55, -0.9, { r: 0.05 });
    box(gate, 0.28, 0.1, 0.9, P.cache, 2.0, 1.55, -0.9, { r: 0.02, emissive: P.cache, ei: 0.0 });
    var arm = (S.arm = new THREE.Group()); arm.position.set(2.0, 0.78, -1.45); gate.add(arm);
    box(arm, 0.1, 0.1, 1.15, "#e8edf5", 0, 0, 0.58, { r: 0.03 });
    box(arm, 0.11, 0.11, 0.28, "#ff6b3d", 0, 0, 0.3, { r: 0.03 }); box(arm, 0.11, 0.11, 0.28, "#ff6b3d", 0, 0, 0.86, { r: 0.03 });

    /* web servers (blue) with blinking LEDs and vents */
    function server(x, z, h, seed) {
      var gr = new THREE.Group(); gr.position.set(x, 0, z); world.add(gr);
      blob(gr, 0.05, 0.05, 2.0, 2.0, 0.8);
      box(gr, 1.1, h, 1.1, P.server, 0, h / 2, 0, { r: 0.07 });
      for (var k = 0; k < 4; k++) { box(gr, 0.9, 0.07, 0.02, "#2447b8", 0.0, 0.3 + k * (h - 0.5) / 4, 0.56, { r: 0.01, cast: false }); box(gr, 0.02, 0.07, 0.9, "#2447b8", 0.56, 0.3 + k * (h - 0.5) / 4, 0.0, { r: 0.01, cast: false }); }
      for (k = 0; k < 3; k++) { var led = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.02), new THREE.MeshBasicMaterial({ color: "#7dffb0" })); led.position.set(-0.38 + k * 0.16, h - 0.2, 0.57); gr.add(led); S.leds.push({ m: led, seed: seed + k, on: "#7dffb0", off: "#2b5a45" }); }
      return gr;
    }
    server(1.1, -2.05, 1.7, 1); server(-3.3, 2.1, 1.3, 7);
    // cables on the ground
    function cable(x, z, w, d) { box(world, w, 0.04, d, "#7b88a6", x, 0.03, z, { r: 0.015, cast: false }); }
    cable(-3.3, 1.3, 0.07, 1.6); cable(-2.5, 0.55 + 0.0, 0.07, 0.01); cable(1.1, -1.4, 0.07, 1.0); cable(-6.0, 2.3, 2.7, 0.07); cable(-7.3, 1.2, 0.07, 2.2);
    cable(-4.5, -2.4, 6.0, 0.07); cable(-1.5, -2.3, 0.07, 0.4);

    /* database tower */
    var db = (S.db = new THREE.Group()); db.position.set(C.DB_X, 0, 0); world.add(db);
    blob(db, 0, 0, 4.2, 4.2, 0.9);
    box(db, 2.4, 0.95, 2.4, P.db, 0, 0.475, 0, { r: 0.09 });
    box(db, 2.2, 0.9, 2.2, "#3d4966", 0, 1.48, 0, { r: 0.09 });
    var top = (S.dbTop = new THREE.Group()); top.position.set(0, 0, 0); db.add(top);
    box(top, 2.2, 0.9, 2.2, P.db, 0, 2.46, 0, { r: 0.09 }); box(top, 2.35, 0.14, 2.35, "#2a3349", 0, 3.0, 0, { r: 0.05 });
    // vents and slits on the +x and +z faces
    for (var vi = 0; vi < 5; vi++) { box(db, 0.02, 0.05, 1.6, "#242c40", 1.21, 0.2 + vi * 0.14, 0, { cast: false, r: 0.005 }); box(db, 1.6, 0.05, 0.02, "#242c40", 0, 0.2 + vi * 0.14, 1.21, { cast: false, r: 0.005 }); }
    box(db, 0.03, 0.04, 1.8, "#8793b3", 1.12, 1.48, 0, { cast: false, r: 0.005 }); box(db, 1.8, 0.04, 0.03, "#8793b3", 0, 1.48, 1.12, { cast: false, r: 0.005 });
    box(db, 0.1, 0.6, 0.75, "#161c2c", 1.2, 0.42, C.ZIN, { r: 0.04, cast: false }); box(db, 0.1, 0.6, 0.75, "#161c2c", 1.2, 0.42, C.ZOUT, { r: 0.04, cast: false });
    var ledM = (S.dbLed = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.04), new THREE.MeshBasicMaterial({ color: "#ff4d4d" }))); ledM.position.set(1.12, 2.5, 0.0); ledM.rotation.y = Math.PI / 2; top.add(ledM);
    var ledZ = (S.dbLedZ = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.04), new THREE.MeshBasicMaterial({ color: "#ff4d4d" }))); ledZ.position.set(0.0, 2.5, 1.12); top.add(ledZ);
    var ledGlow = (S.dbGlow = new THREE.PointLight(0xff4d4d, 0.0, 4)); ledGlow.position.set(1.4, 2.5, 0.0); top.add(ledGlow);

    /* the cache: a cutaway building (open at the front and the top) so the shelf is visible; drops in at beat 3 */
    var cache = (S.cache = new THREE.Group()); world.add(cache);
    var cx0 = C.CX0, cx1 = C.CX1, cxm = (cx0 + cx1) / 2, cw = cx1 - cx0, TZ = 0.45;
    S.cacheShadow = blob(world, cxm, 0, 4.4, 5.4, 0.9);
    box(cache, cw + 0.3, 0.14, 4.1, "#ffcf8a", cxm, 0.07, 0, { r: 0.04 });
    // west wall (tall, with the two arches) and east wall (low, so the camera can see over it)
    (function () {
      var x = cx0, wt = 0.16;
      box(cache, wt, 2.2, 0.75, P.cache, x, 1.2, -1.69, { r: 0.04 }); box(cache, wt, 2.2, 0.9, P.cache, x, 1.2, 0.0, { r: 0.04 }); box(cache, wt, 2.2, 0.75, P.cache, x, 1.2, 1.69, { r: 0.04 });
      box(cache, wt, 1.2, 0.9, P.cache, x, 1.7, C.ZIN, { r: 0.04 }); box(cache, wt, 1.2, 0.9, P.cache, x, 1.7, C.ZOUT, { r: 0.04 });
      var xe = cx1, h = 1.3;
      box(cache, wt, h, 0.75, P.cache, xe, 0.12 + h / 2, -1.69, { r: 0.04 }); box(cache, wt, h, 0.9, P.cache, xe, 0.12 + h / 2, 0.0, { r: 0.04 }); box(cache, wt, h, 0.75, P.cache, xe, 0.12 + h / 2, 1.69, { r: 0.04 });
      box(cache, wt, 0.38, 0.9, P.cache, xe, 1.1, C.ZIN, { r: 0.04 }); box(cache, wt, 0.38, 0.9, P.cache, xe, 1.1, C.ZOUT, { r: 0.04 });
      box(cache, wt + 0.04, 0.07, 0.95, "#fff1d6", xe, 0.93, C.ZIN, { r: 0.02, cast: false }); box(cache, wt + 0.04, 0.07, 0.95, "#fff1d6", xe, 0.93, C.ZOUT, { r: 0.02, cast: false });
    })();
    box(cache, cw, 2.2, 0.14, "#f08a00", cxm, 1.2, -2.0, { r: 0.04 });                     // far wall
    // low glass wall on the +z side with an orange frame
    var glass = new THREE.Mesh(new THREE.BoxGeometry(cw - 0.1, 0.95, 0.04), new THREE.MeshPhysicalMaterial({ color: "#cfe6ff", transparent: true, opacity: 0.22, roughness: 0.08, metalness: 0, clearcoat: 1, depthWrite: false }));
    glass.position.set(cxm, 0.82, 2.0); cache.add(glass);
    box(cache, cw + 0.02, 0.26, 0.16, P.cache, cxm, 0.25, 2.0, { r: 0.04 }); box(cache, 0.14, 1.4, 0.16, P.cache, cx0, 0.82, 2.0, { r: 0.04 }); box(cache, 0.14, 1.4, 0.16, P.cache, cx1, 0.82, 2.0, { r: 0.04 });
    box(cache, cw + 0.02, 0.16, 0.16, P.cache, cxm, 1.42, 2.0, { r: 0.04 });
    // roof covers the back half only
    box(cache, cw + 0.5, 0.26, 2.35, "#ffb347", cxm, 2.43, -1.0, { r: 0.1 }); box(cache, cw + 0.52, 0.06, 0.5, P.white, cxm, 2.58, -1.0, { r: 0.02, cast: false });
    // the shelf (table) with the copy and the timer ring
    box(cache, 0.8, 0.12, 0.7, P.white, C.TABLE_X, 0.6, TZ, { r: 0.03 });
    [[-0.3, -0.25], [0.3, -0.25], [-0.3, 0.25], [0.3, 0.25]].forEach(function (l) { box(cache, 0.1, 0.55, 0.1, "#dbe3ef", C.TABLE_X + l[0], 0.33, TZ + l[1], { r: 0.02 }); });
    var copy = (S.copy = new THREE.Mesh(rbox(0.36, 0.36, 0.36, 0.05), new THREE.MeshStandardMaterial({ color: P.gold, roughness: 0.45, emissive: "#ffb100", emissiveIntensity: 0.25 }))); copy.position.set(C.TABLE_X, 0.84, TZ); copy.castShadow = true; cache.add(copy);
    var ringG = new THREE.RingGeometry(0.34, 0.43, 64, 1);
    var ring = (S.ring = new THREE.Mesh(ringG, new THREE.MeshBasicMaterial({ color: "#ff5a36", side: THREE.DoubleSide }))); ring.rotation.x = -Math.PI / 2; ring.position.set(C.TABLE_X, 0.68, TZ); cache.add(ring);
    var ringBg = new THREE.Mesh(new THREE.RingGeometry(0.34, 0.43, 64, 1), new THREE.MeshBasicMaterial({ color: "#ffe6bf", side: THREE.DoubleSide })); ringBg.rotation.x = -Math.PI / 2; ringBg.position.set(C.TABLE_X, 0.675, TZ); cache.add(ringBg); S.ringBg = ringBg;
    // stale warning flag (follows the stale cube)
    var flag = (S.flag = new THREE.Group()); var pole = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.55, 0.03), new THREE.MeshStandardMaterial({ color: "#ffffff" })); pole.position.y = 0.28; flag.add(pole);
    var tri = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.3, 3), new THREE.MeshStandardMaterial({ color: "#ff6b3d", roughness: 0.5 })); tri.rotation.z = -Math.PI / 2; tri.position.set(0.15, 0.45, 0); flag.add(tri);
    var bang = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.12, 0.04), new THREE.MeshBasicMaterial({ color: "#ffffff" })); bang.position.set(0.12, 0.47, 0.0); flag.add(bang);
    world.add(flag); flag.visible = false;

    /* the bin where answered cubes land */
    var bin = new THREE.Group(); bin.position.set(C.OUT_X, 0, 2.45); world.add(bin); blob(bin, 0, 0, 2.0, 1.6, 0.8);
    box(bin, 1.5, 0.12, 0.9, P.white, 0, 0.06, 0, { r: 0.03 }); box(bin, 1.5, 0.5, 0.1, P.white, 0, 0.3, 0.43, { r: 0.03 }); box(bin, 0.1, 0.5, 0.9, P.white, 0.7, 0.3, 0, { r: 0.03 }); box(bin, 0.1, 0.5, 0.9, P.white, -0.7, 0.3, 0, { r: 0.03 });
    var fill1 = (S.binFill = new THREE.Mesh(rbox(1.3, 0.4, 0.7, 0.04), new THREE.MeshStandardMaterial({ color: P.gold, roughness: 0.5, emissive: "#ffb100", emissiveIntensity: 0.15 }))); fill1.position.set(0, 0.12, 0); fill1.scale.y = 0.001; bin.add(fill1); S.binGroup = bin;

    /* request cubes (1000) + story cubes (2) + gems */
    var cg = rbox(C.CUBE, C.CUBE, C.CUBE, 0.035), N = C.N + 2;
    var inst = (S.inst = new THREE.InstancedMesh(cg, new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.5 }), N)); inst.castShadow = true; inst.receiveShadow = true; inst.frustumCulled = false;
    inst.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3); world.add(inst);
    var gem = (S.gem = new THREE.InstancedMesh(rbox(0.12, 0.1, 0.12, 0.02), new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.4, emissive: "#ffb100", emissiveIntensity: 0.2 }), N)); gem.castShadow = true; gem.frustumCulled = false;
    gem.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3); world.add(gem);
    S.cols = { cyan: new THREE.Color(P.cyan), orange: new THREE.Color(P.cache), gold: new THREE.Color(P.gold), stale: new THREE.Color(P.stale), gold2: new THREE.Color("#ffc83d"), brown: new THREE.Color(P.stale) };
    S.m4 = new THREE.Matrix4(); S.q = new THREE.Quaternion(); S.p = new THREE.Vector3(); S.s = new THREE.Vector3(); S.col = new THREE.Color();
    return S;
  };

  /* ---- draw ---- */
  var hash = function (n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  W.draw = function (S, t) {
    var c = ISO.cam(t), d = 40, cs = Math.cos(c.el), ss = Math.sin(c.el);
    S.cam.position.set(c.tx + d * Math.sin(c.az) * cs, c.ty + d * ss, c.tz + d * Math.cos(c.az) * cs);
    S.cam.up.set(0, 1, 0); S.cam.lookAt(c.tx, c.ty, c.tz);
    S.cam.left = -c.sx / c.k; S.cam.right = (1080 - c.sx) / c.k; S.cam.top = c.sy / c.k; S.cam.bottom = -(1920 - c.sy) / c.k; S.cam.updateProjectionMatrix();
    // belts: constant speed chevrons
    S.belts.forEach(function (b) { b.tex.offset.x = -((t * C.V / 0.5) * b.sign * (b.sign < 0 ? -1 : 1) * -1) % 1; b.tex.offset.x = ((t * C.V / 0.5) * (b.sign < 0 ? 1 : -1)) % 1; });
    // slab sink
    var sk = ISO.sink(t); S.pad.position.y = -2.6 * sk; S.pad.visible = sk < 0.995;
    // gate arm
    S.arm.rotation.x = -ISO.gateOpenAmt(t) * 1.35;
    // database: extrusion in the first second, shake, LEDs
    var rise = t < 1.0 ? U.outBack(t / 1.0, 1.5) : 1; S.db.scale.y = Math.max(0.001, 0.5 + 0.5 * rise); S.db.visible = true;
    var dbs = ISO.db(t), step = Math.floor(t * 12), shk = dbs.shake;
    S.dbTop.position.x = (hash(step * 3 + 1) - 0.5) * 0.09 * shk; S.dbTop.position.z = (hash(step * 3 + 2) - 0.5) * 0.09 * shk; S.dbTop.position.y = Math.abs(hash(step * 3 + 5) - 0.5) * 0.06 * shk;
    var blink = Math.floor(t * 4) % 2, red = dbs.led === 0;
    S.dbLed.material.color.set(red ? (blink || dbs.busy ? "#ff4d4d" : "#a02d2d") : "#3ddc84"); S.dbLedZ.material.color.copy(S.dbLed.material.color);
    S.dbGlow.color.set(red ? "#ff4d4d" : "#3ddc84"); S.dbGlow.intensity = 0.8;
    S.leds.forEach(function (l) { l.m.material.color.set(hash(Math.floor(t * 5) + l.seed * 13) > 0.45 ? l.on : l.off); });
    // cache drops in
    var cy = ISO.cacheY(t); S.cache.position.y = Math.max(cy, -0.0) + (cy < 0 ? cy : 0); S.cache.visible = t >= B.cacheDrop - 0.05;
    S.cacheShadow.visible = S.cache.visible; S.cacheShadow.material.opacity = Math.max(0, 0.9 - Math.max(0, S.cache.position.y) * 0.1);
    // the copy on the shelf, with its ring and colour
    var cp = ISO.copy(t);
    S.copy.visible = cp.vis > 0 && !(cp.discard >= 1);
    var csz = Math.max(0.001, cp.pop) * (1 - cp.discard);
    S.copy.scale.setScalar(csz); S.copy.position.y = 0.84 + (cp.discard > 0 ? -cp.discard * 0.3 : 0);
    S.copy.material.color.set(P.gold).lerp(S.cols.brown, cp.brown); S.copy.material.emissiveIntensity = 0.25 * (1 - cp.brown);
    var rs = Math.round(cp.ring * 64); S.ring.visible = rs > 0; S.ringBg.visible = cp.ring > 0.001; S.ring.geometry.setDrawRange(0, Math.max(0, rs) * 6);
    S.ring.material.color.set(cp.brown > 0.5 ? "#c4501f" : "#ff5a36");
    // request cubes
    var i, m = S.m4, q = S.q, p = S.p, sc = S.s, inst = S.inst, gem = S.gem, col = S.col, N = C.N, sinkOff = -2.6 * sk;
    var rc = ISO.releaseCount;
    for (i = 0; i < N + 2; i++) {
      var s = i < N ? ISO.cube(i, t) : ISO.storyCube(i - N, t), vis = s.vis, scl = s.sc == null ? 1 : s.sc;
      if (i < N && i >= rc) { s.y += sinkOff; if (sk > 0.97) vis = 0; }
      if (!vis) { sc.set(0.0001, 0.0001, 0.0001); p.set(0, -5, 0); }
      else { p.set(s.x, s.y, s.z); sc.set(scl, scl, scl); }
      m.compose(p, q, sc); inst.setMatrixAt(i, m);
      var colr = (i < N ? (s.col === 1 ? S.cols.orange : S.cols.cyan) : S.cols.cyan); inst.setColorAt(i, colr);
      // gem: golden core carried by answered cubes (brown when the copy was stale)
      var gv = vis && s.flag >= 1;
      if (gv) { p.set(s.x, s.y + C.CUBE / 2 + 0.045, s.z); sc.set(scl, scl, scl); } else { p.set(0, -5, 0); sc.set(0.0001, 0.0001, 0.0001); }
      m.compose(p, q, sc); gem.setMatrixAt(i, m); gem.setColorAt(i, s.flag === 2 ? S.cols.brown : S.cols.gold);
    }
    inst.instanceMatrix.needsUpdate = true; inst.instanceColor.needsUpdate = true; gem.instanceMatrix.needsUpdate = true; gem.instanceColor.needsUpdate = true;
    // warning flag follows the stale-served cube
    var sa = ISO.storyCube(0, t), st = ISO.story();
    S.flag.visible = t >= st.flagAt && t < st.flagAt + 1.6 && sa.vis;
    if (S.flag.visible) { S.flag.position.set(sa.x, sa.y + 0.15, sa.z); var fp = U.spring((t - st.flagAt) / 0.4, 7, 1.2); S.flag.scale.setScalar(Math.max(0.001, fp)); }
    // bin fill = answered so far
    var served = ISO.served(t) + (t >= st.flagAt + 0.9 ? 1 : 0); S.binFill.scale.y = Math.min(1, served / 130 + 0.001);
    S.binFill.position.y = 0.12 + 0.2 * Math.min(1, served / 130);
    S.rr.render(S.scene, S.cam);
  };
})(window);
