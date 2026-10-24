/* riso.js - the print engine. Three spot inks are drawn as coverage into the R, G and B channels of one
   canvas (pink = R, blue = G, yellow = B, additive), then a compositor turns coverage into ink on paper:
   soft uneven edges, blue-noise-like voids, roller streaks, a per-pixel overprint lookup (true multiply
   of translucent coverage), paper fibres. Every random choice is seeded; every frame is a function of time. */
(function () {
  var W = window, WID = 1080, HEI = 1920;
  W.mulberry32 = function (a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  W.seedOf = function (s) { var h = 1779033703 ^ s.length; for (var i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^ (h >>> 16)) >>> 0; };
  W.rngOf = function (s) { return W.mulberry32(W.seedOf(s)); };
  W.hash01 = function (n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  var R = W.Riso = { W: WID, H: HEI };
  R.SW = { p: [255, 72, 176], b: [0, 120, 191], y: [255, 232, 0], paper: [244, 239, 225] };
  R.ANG = { p: 15, b: 75, y: 0 };
  /* overprint colours on paper: pink+blue purple, pink+yellow orange, blue+yellow green */
  var OVER = { pb: [107, 63, 160], py: [255, 118, 24], by: [38, 150, 70], pby: [52, 36, 70] };
  var CHF = { p: "rgb(255,0,0)", b: "rgb(0,255,0)", y: "rgb(0,0,255)" };
  var IDX = { p: 0, b: 1, y: 2 };

  /* ---------- paper: computed once ---------- */
  var paperData = null;
  function makePaper() {
    var c = document.createElement("canvas"); c.width = WID; c.height = HEI; var g = c.getContext("2d"), r = rngOf("paper");
    g.fillStyle = "rgb(244,239,225)"; g.fillRect(0, 0, WID, HEI);
    var i;
    for (i = 0; i < 70; i++) { var x = r() * WID, y = r() * HEI, rad = 120 + r() * 380, gr = g.createRadialGradient(x, y, 0, x, y, rad); var warm = r() < .5; gr.addColorStop(0, warm ? "rgba(235,215,170,.16)" : "rgba(255,252,240,.18)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
    g.lineCap = "round";
    for (i = 0; i < 2600; i++) { var fx = r() * WID, fy = r() * HEI, a = r() * 6.283, l = 4 + r() * 20, dark = r() < .55; g.strokeStyle = dark ? "rgba(150,125,85," + (.05 + r() * .09) + ")" : "rgba(255,255,250," + (.12 + r() * .18) + ")"; g.lineWidth = .5 + r() * .8; g.beginPath(); g.moveTo(fx, fy); g.quadraticCurveTo(fx + Math.cos(a + .6) * l * .5, fy + Math.sin(a + .6) * l * .5, fx + Math.cos(a) * l, fy + Math.sin(a) * l); g.stroke(); }
    for (i = 0; i < 380; i++) { g.fillStyle = "rgba(110,90,60," + (.08 + r() * .22) + ")"; g.beginPath(); g.arc(r() * WID, r() * HEI, .5 + r() * 1.2, 0, 6.283); g.fill(); }
    var e = 90, sides = [[0, 0, WID, e, 0, 0, 0, e], [0, HEI - e, WID, e, 0, HEI, 0, HEI - e], [0, 0, e, HEI, 0, 0, e, 0], [WID - e, 0, e, HEI, WID, 0, WID - e, 0]];
    sides.forEach(function (s) { var gr2 = g.createLinearGradient(s[4], s[5], s[6], s[7]); gr2.addColorStop(0, "rgba(190,160,100,.34)"); gr2.addColorStop(1, "rgba(190,160,100,0)"); g.fillStyle = gr2; g.fillRect(s[0], s[1], s[2], s[3]); });
    paperData = g.getImageData(0, 0, WID, HEI).data;
  }
  /* ---------- noise tiles: edge roughness, voids, density, roller streaks ---------- */
  var EDGE = [], VOID = [], STREAK = [];
  function makeNoise() {
    var r = rngOf("riso-noise"), n = 256, k, i, j;
    for (k = 0; k < 3; k++) {            // smooth-ish value noise for edge roughness (two octaves)
      var big = new Float32Array(32 * 32), t = new Float32Array(n * n);
      for (i = 0; i < big.length; i++) big[i] = r();
      for (j = 0; j < n; j++) for (i = 0; i < n; i++) {
        var u = i / 8, v = j / 8, x0 = Math.floor(u) & 31, y0 = Math.floor(v) & 31, fu = u - Math.floor(u), fv = v - Math.floor(v);
        var a = big[y0 * 32 + x0], b = big[y0 * 32 + ((x0 + 1) & 31)], c = big[((y0 + 1) & 31) * 32 + x0], d = big[((y0 + 1) & 31) * 32 + ((x0 + 1) & 31)];
        fu = fu * fu * (3 - 2 * fu); fv = fv * fv * (3 - 2 * fv);
        t[j * n + i] = (a * (1 - fu) + b * fu) * (1 - fv) + (c * (1 - fu) + d * fu) * fv;
      }
      for (i = 0; i < t.length; i++) t[i] = t[i] * .6 + r() * .4;
      EDGE.push(t);
      // voids: jittered grid keeps them evenly spread (blue-noise-like), plus a few random pits
      var vm = new Uint8Array(512 * 512).fill(255), cell = 9;
      for (j = 0; j < 512 / cell; j++) for (i = 0; i < 512 / cell; i++) {
        if (r() < .13) { var cx = (i + r()) * cell, cy = (j + r()) * cell, rad = .6 + r() * 1.5; for (var yy = -2; yy <= 2; yy++) for (var xx = -2; xx <= 2; xx++) { if (xx * xx + yy * yy <= rad * rad) vm[(((cy + yy) | 0) & 511) * 512 + (((cx + xx) | 0) & 511)] = 40; } }
      }
      for (i = 0; i < 700; i++) vm[((r() * 512) | 0) * 512 + ((r() * 512) | 0)] = 90;
      VOID.push(vm);
      var st = new Float32Array(WID + 8), ph = r() * 6.28; for (i = 0; i < st.length; i++) st[i] = .5 + .5 * Math.sin(i * .021 + ph) * Math.sin(i * .0071 + ph * 2) + (r() - .5) * .3;
      STREAK.push(st);
    }
  }
  var work = null, wctx = null, blurC = null, bctx = null;
  R.init = function () {
    if (paperData) return;
    makePaper(); makeNoise();
    work = document.createElement("canvas"); work.width = WID; work.height = HEI; wctx = work.getContext("2d", { willReadFrequently: true });
    blurC = document.createElement("canvas"); blurC.width = WID; blurC.height = HEI; bctx = blurC.getContext("2d", { willReadFrequently: true });
  };

  /* ---------- drawing helpers (all take the main ctx) ---------- */
  var S = {};  // per-frame state: offsets
  R.state = S;
  function sm(a, b, x) { var t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  R.sm = sm;
  /* run fn with ink k active: translated by its misregistration offset, additive */
  R.ink = function (ctx, k, fn) {
    var o = S.off[k], j = S.jolt || [0, 0];
    ctx.save(); ctx.setTransform(1, 0, 0, 1, o[0] + j[0], o[1] + j[1]); ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = CHF[k]; ctx.strokeStyle = CHF[k]; fn(ctx); ctx.restore();
  };
  /* halftone dot grid clipped to the current path; tone 0..1 area coverage, screen angle from the ink */
  R.dots = function (ctx, k, bbox, tone, cell, angOverride) {
    if (tone <= 0.01) return;
    var ang = (angOverride == null ? R.ANG[k] : angOverride) * Math.PI / 180, ca = Math.cos(ang), sa = Math.sin(ang);
    var rr = Math.sqrt(tone * cell * cell / Math.PI) * (tone > .5 ? 1.0 : 1.0), cx = (bbox[0] + bbox[2]) / 2, cy = (bbox[1] + bbox[3]) / 2, half = Math.hypot(bbox[2] - bbox[0], bbox[3] - bbox[1]) / 2 + cell;
    ctx.beginPath();
    for (var u = -half; u <= half; u += cell) for (var v = -half; v <= half; v += cell) {
      var x = cx + u * ca - v * sa, y = cy + u * sa + v * ca;
      if (x < bbox[0] - rr || x > bbox[2] + rr || y < bbox[1] - rr || y > bbox[3] + rr) continue;
      ctx.moveTo(x + rr, y); ctx.arc(x, y, rr, 0, 6.2832);
    }
    ctx.fill();
  };
  /* a halftone disc (the "dots" of the story): clipped dot screen inside a circle plus a thin solid ring */
  R.disc = function (ctx, k, x, y, rad, tone, cell) {
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.2832); ctx.clip();
    R.dots(ctx, k, [x - rad, y - rad, x + rad, y + rad], tone == null ? .7 : tone, cell || 6.5);
    ctx.restore();
    ctx.lineWidth = Math.max(1.5, rad * .13); ctx.beginPath(); ctx.arc(x, y, rad - ctx.lineWidth / 2, 0, 6.2832); ctx.stroke();
  };
  R.rectTone = function (ctx, k, x, y, w, h, tone, cell) { ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); R.dots(ctx, k, [x, y, x + w, y + h], tone, cell || 8); ctx.restore(); };
  R.poly = function (ctx, pts, w) { ctx.lineWidth = w; ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.beginPath(); pts.forEach(function (p, i) { if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); }); ctx.stroke(); };
  R.text = function (ctx, txt, x, y, size, font, align, weight) { ctx.font = (weight || 400) + " " + size + "px " + (font || "Archivo Black"); ctx.textAlign = align || "left"; ctx.textBaseline = "alphabetic"; ctx.fillText(txt, x, y); };
  R.measure = function (ctx, txt, size, font, weight) { ctx.font = (weight || 400) + " " + size + "px " + (font || "Archivo Black"); return ctx.measureText(txt).width; };

  /* registration marks: crop marks, registration targets in ALL inks (so misregistration is visible), colour bars */
  R.marks = function (ctx, t) {
    var m = 40, L = 36;
    R.ink(ctx, "p", function (c) { c.lineWidth = 3; [[m, m, 1, 1], [WID - m, m, -1, 1], [m, HEI - m, 1, -1], [WID - m, HEI - m, -1, -1]].forEach(function (q) { c.beginPath(); c.moveTo(q[0], q[1] + q[3] * L); c.lineTo(q[0], q[1]); c.lineTo(q[0] + q[2] * L, q[1]); c.stroke(); }); });
    ["p", "b", "y"].forEach(function (k) {
      R.ink(ctx, k, function (c) {
        c.lineWidth = 2.2;
        [[WID / 2, 70], [WID / 2, HEI - 70], [64, HEI / 2], [WID - 64, HEI / 2]].forEach(function (q) { c.beginPath(); c.arc(q[0], q[1], 13, 0, 6.2832); c.stroke(); c.beginPath(); c.moveTo(q[0] - 22, q[1]); c.lineTo(q[0] + 22, q[1]); c.moveTo(q[0], q[1] - 22); c.lineTo(q[0], q[1] + 22); c.stroke(); });
      });
    });
    // colour bars: solid steps of each ink, then overprint chips
    var bx = 130, by = 60, s = 26, steps = [1, .7, .45, .25];
    ["p", "b", "y"].forEach(function (k, ki) { steps.forEach(function (tn, si) { R.ink(ctx, k, function (c) { c.save(); c.beginPath(); c.rect(bx + (ki * 4 + si) * (s + 4), by, s, s); c.clip(); if (tn === 1) c.fillRect(bx + (ki * 4 + si) * (s + 4), by, s, s); else R.dots(c, k, [bx + (ki * 4 + si) * (s + 4), by, bx + (ki * 4 + si) * (s + 4) + s, by + s], tn, 6); c.restore(); }); }); });
    [["p", "b"], ["p", "y"], ["b", "y"]].forEach(function (pair, i) { pair.forEach(function (k) { R.ink(ctx, k, function (c) { c.fillRect(bx + (12 + i) * (s + 4) + 20, by, s, s); }); }); });
  };

  /* ---------- the compositor ---------- */
  function lerp(a, b, t) { return a + (b - a) * t; }
  var CORN = null;
  function corners() {
    var pb = R.SW.paper, tr = function (c) { return [c[0] / pb[0], c[1] / pb[1], c[2] / pb[2]]; };
    // index bits: p=1, b=2, y=4
    CORN = [[1, 1, 1], tr(R.SW.p), tr(R.SW.b), tr(OVER.pb), tr(R.SW.y), tr(OVER.py), tr(OVER.by), tr(OVER.pby)];
  }
  /* composite the work canvas into out canvas. show = {p,b,y} 0..1 multipliers (page-print-in) */
  R.composite = function (out, show) {
    if (!CORN) corners();
    bctx.clearRect(0, 0, WID, HEI); bctx.filter = "blur(.9px)"; bctx.drawImage(work, 0, 0); bctx.filter = "none";
    var src = bctx.getImageData(0, 0, WID, HEI).data, octx = out.getContext("2d"), od = octx.createImageData(WID, HEI), o = od.data, pd = paperData;
    var C = CORN, sh0 = show.p, sh1 = show.b, sh2 = show.y, E0 = EDGE[0], E1 = EDGE[1], E2 = EDGE[2], V0 = VOID[0], V1 = VOID[1], V2 = VOID[2], ST0 = STREAK[0], ST1 = STREAK[1], ST2 = STREAK[2];
    for (var y = 0; y < HEI; y++) {
      var row = y * WID;
      for (var x = 0; x < WID; x++) {
        var i = (row + x) * 4, r0 = src[i], g0 = src[i + 1], b0 = src[i + 2];
        if ((r0 | g0 | b0) < 6) { o[i] = pd[i]; o[i + 1] = pd[i + 1]; o[i + 2] = pd[i + 2]; o[i + 3] = 255; continue; }
        var pa = 0, ba = 0, ya = 0, a, e, th, vd, dens;
        if (r0 > 5 && sh0) { a = r0 / 255; e = E0[((y + 0) & 255) * 256 + ((x + 0) & 255)]; th = .5 + (e - .5) * .42; a = sm(th - .2, th + .2, a); vd = V0[((y + 131) & 511) * 512 + ((x + 211) & 511)] / 255; dens = .90 + .10 * ST0[x] - .04 * (1 - E0[((y >> 1) & 255) * 256 + ((x >> 1) & 255)]); pa = a * vd * dens; }
        if (g0 > 5 && sh1) { a = g0 / 255; e = E1[((y + 53) & 255) * 256 + ((x + 91) & 255)]; th = .5 + (e - .5) * .42; a = sm(th - .2, th + .2, a); vd = V1[((y + 262) & 511) * 512 + ((x + 422) & 511)] / 255; dens = .90 + .10 * ST1[x] - .04 * (1 - E1[((y >> 1) & 255) * 256 + (((x >> 1) + 77) & 255)]); ba = a * vd * dens; }
        if (b0 > 5 && sh2) { a = b0 / 255; e = E2[((y + 106) & 255) * 256 + ((x + 182) & 255)]; th = .5 + (e - .5) * .42; a = sm(th - .2, th + .2, a); vd = V2[((y + 393) & 511) * 512 + ((x + 633) & 511)] / 255; dens = .90 + .10 * ST2[x] - .04 * (1 - E2[((y >> 1) & 255) * 256 + (((x >> 1) + 154) & 255)]); ya = a * vd * dens; }
        // trilinear blend of the eight ink combinations
        var c0r = lerp(lerp(C[0][0], C[1][0], pa), lerp(C[2][0], C[3][0], pa), ba), c0g = lerp(lerp(C[0][1], C[1][1], pa), lerp(C[2][1], C[3][1], pa), ba), c0b = lerp(lerp(C[0][2], C[1][2], pa), lerp(C[2][2], C[3][2], pa), ba);
        var c1r = lerp(lerp(C[4][0], C[5][0], pa), lerp(C[6][0], C[7][0], pa), ba), c1g = lerp(lerp(C[4][1], C[5][1], pa), lerp(C[6][1], C[7][1], pa), ba), c1b = lerp(lerp(C[4][2], C[5][2], pa), lerp(C[6][2], C[7][2], pa), ba);
        o[i] = pd[i] * lerp(c0r, c1r, ya); o[i + 1] = pd[i + 1] * lerp(c0g, c1g, ya); o[i + 2] = pd[i + 2] * lerp(c0b, c1b, ya); o[i + 3] = 255;
      }
    }
    octx.putImageData(od, 0, 0);
  };

  /* ---------- scene factory ---------- */
  /* opts: {root, dur, events:[times where the print snaps into register], intro:true => page-flip print-in}
     draw(ctx, t, D) paints coverage; D = {show...}. Returns {canvas, render(t)} */
  R.scene = function (root, opts) {
    var canvas = document.createElement("canvas"); canvas.width = WID; canvas.height = HEI;
    canvas.style.cssText = "position:absolute;left:0;top:0;width:1080px;height:1920px";
    root.appendChild(canvas);
    var base = { p: [0, 0], b: [2.4, -1.7], y: [-2.0, 2.6] };
    var ph = { p: rngOf("ph" + opts.id)() * 6.28, b: rngOf("pb" + opts.id)() * 6.28, y: rngOf("py" + opts.id)() * 6.28 };
    var last = -1;
    var sc = {
      canvas: canvas,
      render: function (t, draw) {
        if (t < -0.02 || t > opts.dur + 0.2) return;
        var q = Math.floor(t * 30 + 1e-6) / 30;
        if (q === last) return; last = q;
        R.init();
        // misregistration: its own drift per ink, snapping shut around emphasis events, large while a page is flipping in
        var snap = 0, ev = opts.events || [];
        for (var i = 0; i < ev.length; i++) { var d = q - ev[i]; if (d >= 0 && d < .9) snap = Math.max(snap, d < .1 ? 1 - d / .1 * .0 : 1 - sm(.55, .9, d)); }
        if (opts.registerAfter != null && q >= opts.registerAfter) snap = Math.max(snap, sm(0, .5, q - opts.registerAfter));
        var flip = opts.flip ? Math.max(0, 1 - q / .7) : 0;
        var kreg = (1 - snap * .93) * (1 + flip * 3.2);
        S.off = {}; ["p", "b", "y"].forEach(function (k) {
          var d1 = Math.sin(q * .9 + ph[k]) * 1.1, d2 = Math.cos(q * .63 + ph[k] * 1.7) * 1.0;
          S.off[k] = [(base[k][0] + d1) * kreg, (base[k][1] + d2) * kreg];
        });
        S.jolt = (opts.jolts || []).reduce(function (a, j) { var d = q - j; return d >= 0 && d < 3 / 30 ? [(hash01(Math.round(j * 100)) - .5) * 4, 2.2] : a; }, [0, 0]);
        var show = { p: 1, b: 1, y: 1 };
        if (opts.flip) { show.y = q < 0 ? 0 : 1; show.p = q >= 6 / 30 ? 1 : 0; show.b = q >= 12 / 30 ? 1 : 0; }
        wctx.setTransform(1, 0, 0, 1, 0, 0); wctx.globalCompositeOperation = "source-over"; wctx.fillStyle = "#000"; wctx.fillRect(0, 0, WID, HEI);
        draw(wctx, q);
        R.composite(canvas, show);
      }
    };
    return sc;
  };
  R.fontsReady = function () {
    return Promise.all(["400 80px 'Archivo Black'", "400 30px 'Space Mono'", "700 30px 'Space Mono'"].map(function (f) { return document.fonts.load(f, "Aa0"); })).then(function () { return document.fonts.ready; });
  };
  R.ready = function (key, setup) { W.__hf = W.__hf || {}; W.__hf.buildReady = W.__hf.buildReady || {}; W.__hf.buildReady[key] = Promise.resolve().then(setup); };
})();
