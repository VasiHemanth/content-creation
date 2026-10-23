/* paper.js - shared helpers for the papercut video. Everything here is a pure function of
   (seed, time): no Math.random, no wall clock. */
(function () {
  var W = window;

  /* ---------- seeded randomness ---------- */
  W.mulberry32 = function (a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  W.seedOf = function (str) {            // xmur3-style string -> uint32
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
    h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^ (h >>> 16)) >>> 0;
  };
  W.rngOf = function (str) { return W.mulberry32(W.seedOf(str)); };
  /* stateless hash for per-frame jitter: n (int) -> [0,1) */
  W.hash01 = function (n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  /* ---------- palette ---------- */
  W.PAL = { deep: "#1d2a5b", blue: "#2b3a8c", coral: "#e8505b", saffron: "#f9b44c", teal: "#3fa796", cream: "#f6e8c8", ink: "#1a1a2e" };

  /* ---------- eases (different materials, different timing) ---------- */
  var E = W.PE = {};
  /* damped spring: reaches exactly 1 at p=1 */
  E.spring = function (decay, cycles) {
    return function (p) { if (p >= 1) return 1; return 1 - Math.exp(-decay * p) * Math.cos(2 * Math.PI * cycles * p); };
  };
  E.card = E.spring(7, 1.25);     // stiff cardboard: quick, one visible overshoot
  E.paper = E.spring(5, 0.9);     // thin paper: soft, small overshoot
  E.strip = E.spring(9, 1.5);     // strip snapping: tiny overshoot, quick settle
  E.hinge = function (p) { return p < .12 ? -0.06 * Math.sin(p / .12 * Math.PI) : 1 - Math.pow(1 - (p - .12) / .88, 3); }; // anticipation then swing
  E.anticip = function (p) { var s = 1.9; return p * p * ((s + 1) * p - s); }; // back.in
  E.slow = function (p) { return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
  E.cam = function (p) { return p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; };
  /* stop-motion: hold each pose for 2.5 frames (12 fps steps), time measured from tween start */
  E.stepped = function (base, dur) {
    var n = Math.max(1, Math.round(dur * 12));
    return function (p) { if (p >= 1) return 1; var q = Math.ceil(p * n - 1e-9) / n; return base(Math.min(1, q)); };
  };
  W.snap12 = function (t) { return Math.round(t * 12) / 12; };

  /* ---------- paper baking: SVG filters rasterised ONCE, then reused as bitmaps ---------- */
  var P = 8;                          // padding around every piece (room for the cut displacement and shadows)
  W.PAPER_PAD = P;
  var bakeQueue = [];
  W.bakeAll = function () { return Promise.all(bakeQueue); };

  /* spec: {w,h,shape,seed,S,grain,cut,edge,defs,overlay}
     shape  : SVG markup in local coords (0..w,0..h), already carrying fill/stroke
     overlay: SVG markup drawn after lighting (printed marks on the paper: glyphs, stripes) - not displaced */
  W.bake = function (spec) {
    var w = spec.w, h = spec.h, S = spec.S || 2, seed = spec.seed >>> 0, pad = spec.pad == null ? P : spec.pad;
    var grain = spec.grain == null ? 0.42 : spec.grain, cut = spec.cut == null ? 2.6 : spec.cut;
    var fx = -pad, fy = -pad, fw = w + 2 * pad, fh = h + 2 * pad;
    var k = grain, ic = (1 - k * 0.02).toFixed(3);
    var edge = spec.edge === false ? "" :
      '<feOffset in="cut" dx="1" dy="1" result="s1"/><feComposite in="cut" in2="s1" operator="out" result="rimUL"/>' +
      '<feFlood flood-color="#fff" flood-opacity="0.42"/><feComposite in2="rimUL" operator="in" result="edgeL"/>' +
      '<feOffset in="cut" dx="-1" dy="-1" result="s2"/><feComposite in="cut" in2="s2" operator="out" result="rimLR"/>' +
      '<feFlood flood-color="#0a0b1e" flood-opacity="0.34"/><feComposite in2="rimLR" operator="in" result="edgeD"/>';
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + fw * S + '" height="' + fh * S + '" viewBox="' + fx + ' ' + fy + ' ' + fw + ' ' + fh + '">' +
      '<defs>' + (spec.defs || "") +
      '<filter id="f" filterUnits="userSpaceOnUse" x="' + fx + '" y="' + fy + '" width="' + fw + '" height="' + fh + '" color-interpolation-filters="sRGB">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="2" seed="' + (seed % 9973) + '" result="warp"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="warp" scale="' + cut + '" xChannelSelector="R" yChannelSelector="G" result="cut"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="' + ((seed >>> 4) % 9973) + '" result="fib"/>' +
      '<feDiffuseLighting in="fib" surfaceScale="1.8" diffuseConstant="1.15" lighting-color="#ffffff" result="lit"><feDistantLight azimuth="225" elevation="48"/></feDiffuseLighting>' +
      '<feComponentTransfer in="lit" result="litS"><feFuncR type="linear" slope="' + k + '" intercept="' + ic + '"/><feFuncG type="linear" slope="' + k + '" intercept="' + ic + '"/><feFuncB type="linear" slope="' + k + '" intercept="' + ic + '"/></feComponentTransfer>' +
      '<feBlend in="litS" in2="cut" mode="multiply" result="gr"/><feComposite in="gr" in2="cut" operator="in" result="body"/>' +
      edge +
      '<feMerge><feMergeNode in="body"/>' + (spec.edge === false ? "" : '<feMergeNode in="edgeL"/><feMergeNode in="edgeD"/>') + '</feMerge>' +
      '</filter></defs>' +
      '<g filter="url(#f)">' + spec.shape + '</g>' + (spec.overlay || "") + '</svg>';
    var img = new Image();
    img.width = fw; img.height = fh;
    img.style.cssText = "position:absolute;left:" + fx + "px;top:" + fy + "px;width:" + fw + "px;height:" + fh + "px;display:block;pointer-events:none";
    W.__bk = W.__bk || {};
    var srcP;
    if (spec.key && W.__bk[spec.key]) srcP = W.__bk[spec.key];
    else {
      srcP = new Promise(function (res) {
        var src = new Image();
        src.onload = function () {
          try {
            var c = document.createElement("canvas"); c.width = fw * S; c.height = fh * S;
            c.getContext("2d").drawImage(src, 0, 0, c.width, c.height);
            res(c.toDataURL("image/png"));
          } catch (e) { res(src.src); }
        };
        src.onerror = function () { res(""); };
        src.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      });
      if (spec.key) W.__bk[spec.key] = srcP;
    }
    var p = srcP.then(function (u) { img.src = u; return img.decode ? img.decode().catch(function () {}) : null; });
    bakeQueue.push(p);
    return img;
  };

  /* ---------- tidy hand-cut polygon: rectangle with seeded wobble, rounded corners ---------- */
  W.cutRect = function (w, h, r, rng, wob) {
    wob = wob == null ? 1.6 : wob; r = Math.min(r, h / 2, w / 2);
    var pts = [], n = Math.max(2, Math.round(w / 46)), m = Math.max(2, Math.round(h / 46));
    function j() { return (rng() - 0.5) * 2 * wob; }
    var d = "M" + (r + j()) + " " + j();
    for (var i = 1; i < n; i++) d += " L" + (r + (w - 2 * r) * i / n) + " " + j();
    d += " L" + (w - r) + " " + j() + " Q" + (w + j()) + " " + j() + " " + (w + j()) + " " + (r + j());
    for (var i2 = 1; i2 < m; i2++) d += " L" + (w + j()) + " " + (r + (h - 2 * r) * i2 / m);
    d += " L" + (w + j()) + " " + (h - r) + " Q" + (w + j()) + " " + (h + j()) + " " + (w - r) + " " + (h + j());
    for (var i3 = n - 1; i3 > 0; i3--) d += " L" + (r + (w - 2 * r) * i3 / n) + " " + (h + j());
    d += " L" + (r + j()) + " " + (h + j()) + " Q" + j() + " " + (h + j()) + " " + j() + " " + (h - r);
    for (var i4 = m - 1; i4 > 0; i4--) d += " L" + j() + " " + (r + (h - 2 * r) * i4 / m);
    d += " L" + j() + " " + r + " Q" + j() + " " + j() + " " + (r + j()) + " " + j() + "Z";
    return d;
  };

  /* ---------- piece: shadow wrapper > move wrapper > bitmap ----------
     the drop-shadow lives on the un-rotated outer box so the light always falls to the lower right. */
  W.piece = function (o) {
    var sh = document.createElement("div"), mv = document.createElement("div");
    sh.className = "pc-sh"; mv.className = "pc-mv";
    sh.style.cssText = "position:absolute;left:" + (o.x || 0) + "px;top:" + (o.y || 0) + "px;width:" + o.w + "px;height:" + o.h + "px;--h:" + (o.lift || 0) + ";" +
      "filter:drop-shadow(calc(1px + var(--h)*3px) calc(2px + var(--h)*4px) calc(1px + var(--h)*2px) rgba(14,16,40,.35)) drop-shadow(calc(3px + var(--h)*14px) calc(5px + var(--h)*20px) calc(var(--sb,6px) + var(--h)*18px) rgba(14,16,40,.22));";
    mv.style.cssText = "position:absolute;left:0;top:0;width:" + o.w + "px;height:" + o.h + "px;transform-origin:" + (o.ox == null ? "50% 50%" : o.ox) + " " + (o.oy == null ? "50% " : o.oy) + ";";
    sh.style.setProperty("--sb", (o.blur == null ? 6 : o.blur) + "px");
    if (o.rot) gsap.set(mv, { rotation: o.rot });
    if (o.img) mv.appendChild(o.img);
    sh.appendChild(mv);
    if (o.parent) o.parent.appendChild(sh);
    return { sh: sh, mv: mv };
  };

  /* ---------- camera: every layer moves by depth * camera offset ---------- */
  /* keys: [{t, x, y, s, ease}] ; layers: [{el, d}] ; the camera look-at point is the frame centre */
  W.cameraTween = function (tl, layers, keys, cx, cy) {
    layers.forEach(function (L) {
      var o = { x: 0, y: 0, scale: 1 };
      for (var i = 0; i < keys.length; i++) {
        var k = keys[i], nx = -k.x * L.d, ny = -k.y * L.d, ns = 1 + (k.s - 1) * L.d;
        if (i === 0) { tl.set(L.el, { x: nx, y: ny, scale: ns, transformOrigin: cx + "px " + cy + "px" }, k.t); continue; }
        var pk = keys[i - 1];
        tl.to(L.el, { x: nx, y: ny, scale: ns, duration: k.t - pk.t, ease: k.ease || "power2.inOut" }, pk.t);
      }
    });
  };

  /* ---------- helpers ---------- */
  W.svgEl = function (tag, attrs, parent) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  W.divEl = function (css, parent, cls) {
    var e = document.createElement("div"); e.style.cssText = css; if (cls) e.className = cls; if (parent) parent.appendChild(e); return e;
  };
  /* register the scene build promise so the render waits for the baked bitmaps */
  W.sceneReady = function (key, build) {
    W.__hf = W.__hf || {}; W.__hf.buildReady = W.__hf.buildReady || {};
    W.__hf.buildReady[key] = Promise.resolve().then(build);
    return W.__hf.buildReady[key];
  };
})();
