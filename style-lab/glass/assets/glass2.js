/* glass2.js - the window builder, the nave (floor, pools, rays) and the colour flood. */
(function () {
  var W = window, G = W.Glass, C = G.C;
  var lighten = function (c, t) { return G.mix(c, "#fff4d8", t); }, darken = function (c, t) { return G.mix(c, "#04040a", t); };

  /* a window: stone frame + svg of dark glass, lit glass, glyphs, texture, lead came, specular, bloom */
  G.window = function (parent, o) {
    var P = G.panes["p" + o.pane], A = o.A, key = o.key, ID = function (s) { return key + "-" + s; };
    var box = G.div("position:absolute;left:" + (o.x || 0) + "px;top:" + (o.y || 0) + "px;width:760px;height:960px;transform-origin:50% 50%;", parent, "win");
    var fr = new Image(); fr.src = A.frame[o.pane]; fr.style.cssText = "position:absolute;left:-90px;top:-90px;width:940px;height:1140px;display:block;pointer-events:none"; box.appendChild(fr);
    var svg = G.svg("svg", { width: 760, height: 960, viewBox: "0 0 760 960", style: "position:absolute;left:0;top:0;overflow:visible" }, box);
    var defs = G.svg("defs", {}, svg);
    var cp = G.svg("clipPath", { id: ID("clip") }, defs); G.svg("path", { d: G.SHAPE[P.shape] }, cp);
    var bl = G.svg("filter", { id: ID("blur"), x: "-30%", y: "-30%", width: "160%", height: "160%" }, defs); G.svg("feGaussianBlur", { stdDeviation: o.bloomR || 15 }, bl);
    var bl2 = G.svg("filter", { id: ID("blur2"), x: "-30%", y: "-30%", width: "160%", height: "160%" }, defs); G.svg("feGaussianBlur", { stdDeviation: 3 }, bl2);
    var clipG = G.svg("g", { "clip-path": "url(#" + ID("clip") + ")" }, svg);
    G.svg("rect", { x: -20, y: -20, width: 800, height: 1000, fill: "#06070c" }, clipG);
    var backG = null;
    if (o.back) {
      var rf = G.svg("filter", { id: ID("refr"), x: "-10%", y: "-10%", width: "120%", height: "120%" }, defs);
      G.svg("feTurbulence", { type: "fractalNoise", baseFrequency: ".018 .03", numOctaves: 2, seed: 4, result: "n" }, rf);
      G.svg("feDisplacementMap", { in: "SourceGraphic", in2: "n", scale: 22, xChannelSelector: "R", yChannelSelector: "G", result: "d" }, rf);
      G.svg("feGaussianBlur", { in: "d", stdDeviation: 2.2 }, rf);
      backG = G.svg("g", { filter: "url(#" + ID("refr") + ")", opacity: 0, transform: "scale(" + G.K + ")" }, clipG);
      G.faceSvg(backG, "#ffe9bd", 8);
    }
    var baseG = G.svg("g", { opacity: o.back ? .86 : 1 }, clipG), litG = G.svg("g", { id: ID("lit") }, clipG), glyG = G.svg("g", { fill: "none", stroke: C.lead, "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }, clipG);
    var r = W.rngOf("win" + key), cells = [];
    P.cells.forEach(function (c, i) {
      var d = G.polyD(c.poly), base = c.lit ? darken(c.color, .84) : G.mix("#0b0c13", "#1a2036", r() * .7);
      var b = G.svg("path", { d: d, fill: base }, baseG), L = null;
      if (c.lit) {
        var gid = ID("g" + i), g = G.svg("radialGradient", { id: gid, cx: ".5", cy: ".5", r: ".72" }, defs);
        var core = c.pane4center ? "#fff6d2" : lighten(c.color, .16 + r() * .08);
        G.svg("stop", { offset: "0", "stop-color": core }, g); G.svg("stop", { offset: ".55", "stop-color": c.color }, g); G.svg("stop", { offset: "1", "stop-color": darken(c.color, .38) }, g);
        L = G.svg("path", { d: d, fill: "url(#" + gid + ")", opacity: o.lit0 ? 1 : 0 }, litG);
      }
      cells.push({ i: i, c: c, base: b, lit: L });
    });
    /* glyphs: lead lines drawn on the lit glass */
    var gl = [];
    if (o.pane === 2) cells.forEach(function (K) { var g = G.glyphFor(2, K.c); if (g && K.lit) { var p = G.svg("path", { d: g.d, transform: g.t, pathLength: 1, "stroke-dasharray": 1, "stroke-dashoffset": o.lit0 ? 0 : 1, "vector-effect": "non-scaling-stroke", "stroke-width": 5 }, glyG); gl.push({ K: K, el: p }); } });
    var partG = {};
    if (o.pane === 3) {
      var kk = G.K, F = G.FACE;
      var mk = function (name, list) {
        var gg = G.svg("g", { transform: "scale(" + kk + ")", "stroke-width": 4.6 }, glyG), els = [];
        list.forEach(function (it) { if (it.circle) els.push(G.svg("circle", { cx: it.circle[0], cy: it.circle[1], r: it.circle[2], fill: C.lead, stroke: "none", opacity: o.lit0 ? 1 : 0 }, gg)); else els.push(G.svg("path", { d: it, pathLength: 1, "stroke-dasharray": 1, "stroke-dashoffset": o.lit0 ? 0 : 1 }, gg)); });
        partG[name] = els;
      };
      mk("eyeL", [F.eyeL, { circle: F.irisL }]); mk("eyeR", [F.eyeR, { circle: F.irisR }]); mk("nose", [F.nose, F.nostrils]); mk("mouth", [F.mouthU, F.mouthL]); mk("browL", [F.browL]); mk("browR", [F.browR]);
    }
    var faceC = null;
    if (o.pane === 4) {
      var fg = G.svg("g", { transform: "translate(380 480) scale(.86) translate(-150 -205)", "stroke-width": 7 }, glyG); faceC = [];
      ["head", "browL", "browR", "eyeL", "eyeR", "nose", "nostrils", "mouthU", "mouthL"].forEach(function (k) { faceC.push(G.svg("path", { d: G.FACE[k], pathLength: 1, "stroke-dasharray": 1, "stroke-dashoffset": o.lit0 ? 0 : 1 }, fg)); });
      [G.FACE.irisL, G.FACE.irisR].forEach(function (cc) { faceC.push(G.svg("circle", { cx: cc[0], cy: cc[1], r: cc[2], fill: C.lead, stroke: "none", opacity: o.lit0 ? 1 : 0 }, fg)); });
    }
    /* glass quality: hammered/streaked texture multiplied in, specular glints screened on, colour already varies to each cell's edge */
    var tm = G.svg("image", { x: 0, y: 0, width: 760, height: 960, style: "mix-blend-mode:multiply", opacity: .7 }, clipG); tm.setAttribute("href", A.texMul);
    var ts = G.svg("image", { x: 0, y: 0, width: 760, height: 960, style: "mix-blend-mode:screen", opacity: .4 }, clipG); ts.setAttribute("href", A.texSpec);
    var ld = G.svg("image", { x: -14, y: -14, width: 788, height: 988 }, svg); ld.setAttribute("href", A.lead[o.pane]);
    /* bloom: the lit glass again, blurred, added over everything (halation spills past the lead) */
    var bloom = G.svg("use", { filter: "url(#" + ID("blur") + ")", style: "mix-blend-mode:screen", opacity: o.bloom == null ? .5 : o.bloom }, svg); bloom.setAttribute("href", "#" + ID("lit"));
    var bloom2 = G.svg("use", { filter: "url(#" + ID("blur2") + ")", style: "mix-blend-mode:screen", opacity: .25 }, svg); bloom2.setAttribute("href", "#" + ID("lit"));
    return { leadEl: ld, backG: backG, box: box, svg: svg, cells: cells, glyphs: gl, parts: partG, face: faceC, litId: ID("lit"), bloom: bloom, bloom2: bloom2, lit: litG, base: baseG, pane: o.pane, key: key, P: P, frame: fr, texMul: tm };
  };

  /* ---------- the nave: pillars, floor in perspective, a pool layer, rays ---------- */
  G.nave = function (root, A, o) {
    o = o || {};
    var cam = G.div("position:absolute;left:0;top:0;width:1080px;height:1920px;transform-origin:540px 760px;", root);
    var bg = G.div("position:absolute;left:0;top:0;width:1080px;height:1920px;background:linear-gradient(#050507 0%,#0d0b0a 55%,#181410 70%,#0c0a09 100%)", cam);
    // pillars: stone columns at both sides, a little lighter near the window light
    [[-30, 190], [920, 190]].forEach(function (p, i) {
      var col = G.div("position:absolute;left:" + p[0] + "px;top:0;width:" + p[1] + "px;height:1250px;background:url(" + A.stone + ");background-size:540px 960px;opacity:.9", cam);
      G.div("position:absolute;left:0;top:0;width:100%;height:100%;background:linear-gradient(" + (i ? "270deg" : "90deg") + ",rgba(0,0,0,.2),rgba(0,0,0,.88))", col);
    });
    // floor
    var floor = G.div("position:absolute;left:0;top:1195px;width:1080px;height:725px;overflow:hidden;background:url(" + A.stone + ");background-size:540px 960px;background-blend-mode:multiply", cam);
    G.div("position:absolute;left:0;top:0;width:100%;height:100%;background:linear-gradient(rgba(6,5,5,.55),rgba(6,5,5,.85) 60%,#050505)", floor);
    var grid = G.svg("svg", { width: 1080, height: 725, viewBox: "0 -1195 1080 725", style: "position:absolute;left:0;top:0" }, floor);
    grid.setAttribute("viewBox", "0 1195 1080 725");
    var gl = "";
    for (var i = -10; i <= 10; i++) gl += '<path d="M540 880 L' + (540 + i * 330) + ' 1920" stroke="#000" stroke-opacity=".6" stroke-width="3"/><path d="M540 880 L' + (540 + i * 330 + 4) + ' 1920" stroke="#8a7d6c" stroke-opacity=".12" stroke-width="1.5"/>';
    for (var k = 0; k < 14; k++) { var y = 1195 + Math.pow(k / 13, 1.7) * 700 + 6; gl += '<path d="M-20 ' + y + ' L1100 ' + y + '" stroke="#000" stroke-opacity=".65" stroke-width="3"/><path d="M-20 ' + (y + 3) + ' L1100 ' + (y + 3) + '" stroke="#8a7d6c" stroke-opacity=".12" stroke-width="1.5"/>'; }
    grid.innerHTML = gl;
    // sill line under the window
    G.div("position:absolute;left:0;top:1190px;width:1080px;height:10px;background:linear-gradient(#000,#241f1a)", cam);
    // light pools: projected colour of the window onto the floor (perspective), screen-blended, drifting
    var poolWrap = G.div("position:absolute;left:0;top:1195px;width:1080px;height:420px;overflow:hidden;-webkit-mask-image:linear-gradient(transparent 0,#000 18%,#000 70%,transparent 100%);mask-image:linear-gradient(transparent 0,#000 18%,#000 70%,transparent 100%)", cam);
    var pool = G.div("position:absolute;left:160px;top:0;width:760px;height:960px;transform-origin:50% 0%;transform:perspective(520px) rotateX(70deg);mix-blend-mode:screen;filter:blur(6px);opacity:" + (o.poolOp == null ? .6 : o.poolOp), poolWrap);
    var poolSvg = G.svg("svg", { width: 760, height: 960, viewBox: "0 0 760 960", style: "position:absolute;left:0;top:0;overflow:visible" }, pool);
    var poolIn = G.svg("g", {}, poolSvg);
    return { cam: cam, bg: bg, floor: floor, pool: pool, poolSvg: poolSvg, poolIn: poolIn, poolWrap: poolWrap };
  };
  /* static colour of earlier panes, thrown on the floor (their final state) */
  G.staticPool = function (target, panes, key) {
    var out = [];
    panes.forEach(function (pn, n) {
      var P = G.panes["p" + pn], g = G.svg("g", { style: "mix-blend-mode:screen", opacity: .8 }, target);
      g.setAttribute("transform", "translate(" + ((n - 1) * 70) + " " + (n * 30) + ")");
      P.cells.forEach(function (c) { if (c.lit) G.svg("path", { d: G.polyD(c.poly), fill: c.color }, g); });
      out.push(g);
    });
    return out;
  };
  /* god rays: soft trapezoids from the window toward the floor, tinted, screen-blended */
  G.rays = function (parent, o) {
    var r = W.rngOf("rays" + (o.seed || 1)), wrap = G.div("position:absolute;left:0;top:0;width:1080px;height:1920px;mix-blend-mode:screen;pointer-events:none", parent), rs = [];
    var tints = o.tints || ["#ffb04a", "#5a86ff", "#ff6a74", "#4fd69a", "#a77be0"];
    for (var i = 0; i < (o.n || 6); i++) {
      var x = 540 + (i - ((o.n || 6) - 1) / 2) * 130 + (r() - .5) * 40, w = 110 + r() * 80, h = 380 + r() * 120;
      var d = G.div("position:absolute;left:" + (x - w / 2) + "px;top:" + (o.top || 1196) + "px;width:" + w + "px;height:" + h + "px;transform-origin:50% 0%;filter:blur(16px);opacity:0", wrap);
      G.div("position:absolute;left:0;top:0;width:100%;height:100%;background:linear-gradient(" + tints[i % tints.length] + "88,rgba(255,240,210,0));clip-path:polygon(30% 0,70% 0,100% 100%,0 100%)", d);
      rs.push({ el: d, x: x, r: r() });
    }
    return { wrap: wrap, rays: rs };
  };
  /* the standard stage: nave + window + rays + flood overlays; prev = earlier panes whose colour is already on the floor */
  G.stage = function (root, A, o) {
    var nv = G.nave(root, A, o), win = G.window(nv.cam, { key: o.key, pane: o.pane, A: A, x: o.x == null ? 160 : o.x, y: o.y == null ? 230 : o.y, lit0: o.lit0, back: o.back, bloom: o.bloom });
    var use = G.svg("use", {}, nv.poolIn); use.setAttribute("href", "#" + win.litId);
    var stat = G.staticPool(nv.poolSvg, o.prev || [], o.key);
    var rays = G.rays(nv.cam, { seed: o.pane, n: 6, tints: o.tints });
    var fi = o.floodIn ? G.flood(root, o.floodIn) : null, fo = o.floodOut ? G.flood(root, o.floodOut) : null;
    if (fi) fi.style.opacity = 1;
    return { nave: nv, cam: nv.cam, win: win, use: use, stat: stat, rays: rays, fi: fi, fo: fo };
  };
  G.cast = function (win, pn, op) {
    var P = G.panes["p" + pn], wr = G.svg("g", { "clip-path": "url(#" + win.key + "-clip)" }, win.svg), g = G.svg("g", { style: "mix-blend-mode:screen", opacity: op == null ? .5 : op }, wr), f = G.svg("filter", { id: win.key + "-cf", x: "-20%", y: "-20%", width: "140%", height: "140%" }, win.svg.querySelector("defs"));
    G.svg("feGaussianBlur", { stdDeviation: 5 }, f); g.setAttribute("filter", "url(#" + win.key + "-cf)");
    P.cells.forEach(function (c) { if (c.lit) G.svg("path", { d: G.polyD(c.poly), fill: c.color }, g); });
    win.svg.insertBefore(wr, win.leadEl); win.castG = g; return g;
  };
  G.SEAM = ["#d9a65a", "#c9633f", "#2f9a74", "#c23a4a", "#e6b44a", "#f0d9a0"];
  /* camera drift, flood in/out (push through the glass), ray sway, pool drift: shared by every scene */
  G.common = function (tl, S, SC, o) {
    o = o || {}; var d = SC.dur, FL = o.floodDur || .95;
    tl.fromTo(S.cam, { scale: o.s0 || 1.1 }, { scale: o.s1 || 1.04, duration: d - (o.out === false ? 0 : FL), ease: "sine.out" }, 0);
    if (S.fi) tl.fromTo(S.fi, { opacity: 1 }, { opacity: 0, duration: FL, ease: "power2.in" }, 0);
    if (o.out !== false && S.fo) {
      tl.fromTo(S.fo, { opacity: 0 }, { opacity: 1, duration: FL, ease: "power2.in" }, d - FL);
      tl.fromTo(S.cam, { scale: o.s1 || 1.04 }, { scale: o.push || 2.6, duration: FL, ease: "power3.in", immediateRender: false }, d - FL);
    }
    S.rays.rays.forEach(function (R, i) {
      var sg = (i % 2 ? 1 : -1) * (2 + R.r * 2.5);
      tl.fromTo(R.el, { rotation: -sg }, { rotation: sg, duration: d, ease: "sine.inOut" }, 0);
    });
    tl.fromTo(S.nave.poolIn, { x: 30, y: 40 }, { x: -50, y: -60, duration: d, ease: "none" }, 0);
  };
  G.flood = function (parent, col) { return G.div("position:absolute;left:-40px;top:-40px;width:1160px;height:2000px;opacity:0;background:radial-gradient(circle at 50% 36%,#fff7e0 0%,#fff0cc 14%," + col + " 52%,#05050a 120%)", parent); };
})();
