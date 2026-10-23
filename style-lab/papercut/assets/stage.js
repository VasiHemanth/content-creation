/* stage.js - the paper-theatre set shared by every papercut scene.
   World = 1080x1920 frame. Layers have a depth d: a layer moves d * camera offset. */
(function () {
  var W = window, PAL = W.PAL;
  var S = W.Stage = { W: 1080, H: 1920 };

  var WORDS = ["The", "animal", "did", "not", "cross", "the", "street,", "because", "it", "was", "too", "tired."];
  S.WORDS = WORDS;
  var ROWS = [[0, 1, 2, 3], [4, 5, 6], [7, 8, 9, 10], [11]];
  var ROW_Y = [590, 835, 1080, 1325];          // shelf top (tag bottom sits on it)
  var ROW_DX = [0, 26, 0, -230];               // row offsets from centred (row 3 is placed so "it" is dead centre)
  S.TAG_H = 116; S.GAP = 40; S.FONT = 64;
  S.IT = 8; S.ANIMAL = 1; S.STREET = 6;
  /* attention scores: the strips together are one full strip */
  S.SCORE = { 0: .03, 1: .70, 2: .02, 3: .03, 4: .03, 5: .02, 6: .07, 7: .03, 9: .02, 10: .02, 11: .03 };
  S.FULL = 120;                                // thickness of one full strip, px
  /* tiny printed fingerprints: question = triangle + circle; the better a label matches, the thicker the strip */
  S.GLYPH = { Q: "tc", 1: "tc", 6: "ts", 0: "ss", 2: "cc", 3: "sc", 4: "cs", 5: "ct", 7: "ss", 9: "cc", 10: "st", 11: "sc" };

  S.fontsReady = function () {
    var f = ["700 64px Fredoka", "600 40px Fredoka", "500 30px Fredoka", "400 40px 'Bagel Fat One'"];
    return Promise.all(f.map(function (x) { return document.fonts.load(x, "Aa"); })).then(function () { return document.fonts.ready; });
  };
  var mctx = document.createElement("canvas").getContext("2d");
  S.measure = function (txt, size, weight) { mctx.font = (weight || 700) + " " + size + "px Fredoka"; return mctx.measureText(txt).width; };

  /* ---------- geometry (all hand-cut look comes from seeded wobble + the displacement filter) ---------- */
  var G = S.geo = {};
  G.star4 = function (cx, cy, r, rng) {
    var d = ""; for (var i = 0; i < 8; i++) { var a = i * Math.PI / 4 - Math.PI / 2, rr = i % 2 ? r * .36 : r * (.92 + rng() * .16); d += (i ? "L" : "M") + (cx + Math.cos(a) * rr) + " " + (cy + Math.sin(a) * rr); } return d + "Z";
  };
  G.blob = function (cx, cy, rx, ry, rng, n) {
    n = n || 9; var d = "";
    for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2, k = .93 + rng() * .14; d += (i ? "L" : "M") + (cx + Math.cos(a) * rx * k) + " " + (cy + Math.sin(a) * ry * k); } return d + "Z";
  };
  G.hill = function (w, h, rng, amp) {
    var d = "M0 " + h, n = 12, y0 = h * .45;
    d += " L0 " + y0;
    for (var i = 1; i <= n; i++) { var x = w * i / n, y = y0 + Math.sin(i * .62 + rng() * .5) * amp + (rng() - .5) * amp * .6; d += " L" + x + " " + y; }
    return d + " L" + w + " " + h + "Z";
  };
  G.scallop = function (w, h, n, r) {   // valance with scalloped bottom edge
    var d = "M0 0 L" + w + " 0 L" + w + " " + (h - r), step = w / n;
    for (var i = n; i > 0; i--) d += " Q" + (step * (i - .5)) + " " + (h + r * .9) + " " + (step * (i - 1)) + " " + (h - r);
    return d + "Z";
  };
  G.gear = function (cx, cy, ro, ri, teeth, rng) {
    var d = ""; for (var i = 0; i < teeth * 4; i++) {
      var a = (i / (teeth * 4)) * Math.PI * 2, ph = i % 4, r = (ph === 1 || ph === 2) ? ro : ri;
      a += (ph === 1 || ph === 2) ? 0 : 0; d += (i ? "L" : "M") + (cx + Math.cos(a) * r) + " " + (cy + Math.sin(a) * r);
    } return d + "Z";
  };
  G.leaf = function (len, wid, rng) {
    var j = function () { return (rng() - .5) * 4; };
    return "M0 0 C" + (wid * .9 + j()) + " " + (-len * .25) + " " + (wid * .8 + j()) + " " + (-len * .8) + " " + (j()) + " " + (-len) + " C" + (-wid * .8 + j()) + " " + (-len * .8) + " " + (-wid * .9 + j()) + " " + (-len * .25) + " 0 0Z";
  };

  /* ---------- printed glyph marks ---------- */
  S.glyphMarks = function (code, cx, cy, size, col) {
    var out = "", g = [code[0], code[1]];
    g.forEach(function (c, i) {
      var x = cx + (i ? 1 : -1) * size * .75, y = cy, r = size * .5;
      if (c === "c") out += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + col + '"/>';
      if (c === "s") out += '<rect x="' + (x - r) + '" y="' + (y - r) + '" width="' + 2 * r + '" height="' + 2 * r + '" rx="2" fill="' + col + '"/>';
      if (c === "t") out += '<path d="M' + x + " " + (y - r * 1.1) + " L" + (x + r * 1.15) + " " + (y + r * .9) + " L" + (x - r * 1.15) + " " + (y + r * .9) + 'Z" fill="' + col + '"/>';
    });
    return out;
  };

  /* ---------- small paper props (return a piece) ---------- */
  S.bakeCached = function (key, spec) { spec.key = key; return W.bake(spec); };

  /* question bubble (coral speech bubble) */
  S.mkBubble = function (parent, o) {
    var w = o.w, h = o.h, r = W.rngOf(o.id || "bub"), tw = 34;
    var body = W.cutRect(w, h, 34, r, 1.5);
    var tail = "M" + (w * .22) + " " + (h - 4) + " L" + (w * .22 - 10) + " " + (h + 44) + " L" + (w * .22 + 56) + " " + (h - 4) + "Z";
    var img = W.bake({ w: w, h: h + 48, seed: W.seedOf(o.id || "bub"), shape: '<path d="' + body + '" fill="' + (o.fill || PAL.coral) + '"/><path d="' + tail + '" fill="' + (o.fill || PAL.coral) + '"/>',
      overlay: o.glyph ? S.glyphMarks("tc", w / 2, h * .5, 20, PAL.cream) : "" });
    return W.piece({ x: o.x, y: o.y, w: w, h: h + 48, img: img, rot: o.rot || 0, lift: o.lift == null ? .6 : o.lift, parent: parent, ox: "22% ", oy: "100%" });
  };
  /* label (teal luggage tag with eyelet) */
  S.mkLabel = function (parent, o) {
    var w = o.w || 112, h = o.h || 74, r = W.rngOf(o.id || "lab");
    var d = "M" + 14 + " 0 L" + (w - 8) + " " + (0 + (r() - .5) * 2) + " L" + (w + (r() - .5) * 2) + " " + (h - 4) + " L" + (w - 12) + " " + h + " L" + 4 + " " + (h + (r() - .5) * 2) + " L" + (0) + " 18 Z";
    var hole = '<circle cx="' + 17 + '" cy="' + (h / 2 + 2) + '" r="5.5" fill="' + PAL.deep + '"/>';
    var img = W.bake({ w: w, h: h, seed: W.seedOf(o.id || "lab"), shape: '<path d="' + d + '" fill="' + PAL.teal + '"/>',
      overlay: hole + S.glyphMarks(o.glyph || "tc", w * .6, h * .5 + 2, 15, PAL.cream), cut: 2 });
    return W.piece({ x: o.x, y: o.y, w: w, h: h, img: img, rot: o.rot || 0, lift: o.lift == null ? .35 : o.lift, parent: parent });
  };
  /* value (saffron ticket with notches) */
  S.mkTicket = function (parent, o) {
    var w = o.w || 100, h = o.h || 62, r = W.rngOf(o.id || "tik");
    var d = "M0 0 L" + w + " 0 L" + w + " " + (h / 2 - 9) + " A9 9 0 0 0 " + w + " " + (h / 2 + 9) + " L" + w + " " + h + " L0 " + h + " L0 " + (h / 2 + 9) + " A9 9 0 0 0 0 " + (h / 2 - 9) + "Z";
    var perf = ""; for (var i = 0; i < 6; i++) perf += '<circle cx="' + (w * .3) + '" cy="' + (8 + i * (h - 16) / 5) + '" r="1.6" fill="' + PAL.ink + '" fill-opacity=".55"/>';
    var img = W.bake({ w: w, h: h, seed: W.seedOf(o.id || "tik"), shape: '<path d="' + d + '" fill="' + PAL.saffron + '"/>',
      overlay: perf + '<path d="M' + (w * .5) + " " + (h * .3) + " l8 8 l-8 8 l-8 -8z\" fill=\"" + PAL.ink + '" fill-opacity=".8"/>', cut: 2 });
    return W.piece({ x: o.x, y: o.y, w: w, h: h, img: img, rot: o.rot || 0, lift: o.lift == null ? .3 : o.lift, parent: parent });
  };

  /* ---------- the set ---------- */
  /* o: {id, layers:{wall,hills,stage,tags,strips,fg}, shelves:true, curtains:true} - returns handles.
     Every layer is a div with transform-origin at the frame centre so camera scale pivots there. */
  S.build = function (root, o) {
    o = o || {};
    var H = { layers: [], tags: {}, shelves: [], P: o.id || "s" };
    function layer(name, d, z, blur) {
      var el = W.divEl("position:absolute;left:0;top:0;width:1080px;height:1920px;z-index:" + Math.round(z * 10) + ";" + (blur ? "filter:blur(" + blur + "px);" : ""), root, "layer");
      H[name] = el; H.layers.push({ el: el, d: d, name: name }); return el;
    }
    H.addLayer = layer;

    /* --- back wall + stars + moon (d .10, softened) --- */
    var wallL = layer("wall", 0.10, 1, 1.4);
    var wallImg = S.bakeCached("wall", { w: 1500, h: 2300, S: 1.25, seed: 7001, grain: .5, cut: 0, edge: false, pad: 0,
      shape: '<rect x="0" y="0" width="1500" height="2300" fill="' + PAL.deep + '"/>' });
    wallImg.style.left = "-210px"; wallImg.style.top = "-190px"; wallL.appendChild(wallImg);
    var sr = W.rngOf("stars-" + (o.starSeed || 1));
    for (var i = 0; i < 26; i++) {
      var sx = sr() * 1080, sy = 40 + sr() * 760, big = sr() < .3, col = sr() < .35 ? PAL.saffron : PAL.cream, rr = big ? 14 + sr() * 8 : 5 + sr() * 5;
      var simg = W.bake({ w: rr * 2.4, h: rr * 2.4, S: 2, seed: W.seedOf("st" + i), shape: '<path d="' + (big ? G.star4(rr * 1.2, rr * 1.2, rr, sr) : G.blob(rr * 1.2, rr * 1.2, rr * .7, rr * .7, sr, 6)) + '" fill="' + col + '"/>', cut: 1.2 });
      var sp = W.piece({ x: sx - rr, y: sy - rr, w: rr * 2.4, h: rr * 2.4, img: simg, lift: 0, blur: 3, parent: wallL, rot: (sr() - .5) * 30 });
      sp.sh.style.filter = "drop-shadow(1px 2px 2px rgba(10,12,35,.4))";
      (H.stars = H.stars || []).push(sp);
    }
    var moonImg = W.bake({ w: 190, h: 190, S: 2, seed: 4242, shape: '<path d="M120 12 A92 92 0 1 0 178 120 A74 74 0 1 1 120 12Z" fill="' + PAL.cream + '"/>', cut: 2.2 });
    H.moon = W.piece({ x: 760, y: 250, w: 190, h: 190, img: moonImg, lift: .15, blur: 6, parent: wallL, rot: 8 });

    /* --- hills (d .24 / .38) --- */
    var hillL = layer("hills", 0.30, 2, 0);
    [[1500, 640, 1160, "#2b3a8c", 24, 11], [1500, 620, 1290, "#232f6f", 30, 12]].forEach(function (c, k) {
      var r = W.rngOf("hill" + k);
      var im = S.bakeCached("hill" + k, { w: c[0], h: c[1], S: 1, seed: 900 + k, shape: '<path d="' + G.hill(c[0], c[1], r, c[4]) + '" fill="' + c[3] + '"/>', cut: 3 });
      var p = W.piece({ x: -210, y: c[2] - 640 + 60, w: c[0], h: c[1], img: im, lift: .5, blur: 10 + k * 6, parent: hillL });
      (H.hillPieces = H.hillPieces || []).push(p);
    });

    /* --- stage: curtains, valance, apron (d .9) --- */
    var stg = layer("stage", 0.9, 3, 0);
    var apron = S.bakeCached("apron", { w: 1500, h: 420, S: 1, seed: 3131, grain: .5, cut: 2, shape: '<rect x="0" y="0" width="1500" height="420" fill="#2b3a8c"/>' });
    var apronP = W.piece({ x: -210, y: 1540, w: 1500, h: 420, img: apron, lift: .9, blur: 14, parent: stg });
    // floorboard seams on the apron (printed lines)
    var seam = W.svgEl("svg", { width: 1500, height: 420, viewBox: "0 0 1500 420", style: "position:absolute;left:0;top:0;pointer-events:none" }, apronP.mv);
    var sr2 = W.rngOf("seams");
    for (var j = 1; j < 9; j++) { var xx = j * 166 + (sr2() - .5) * 20; W.svgEl("path", { d: "M" + xx + " 0 L" + (xx + (j - 4.5) * 14) + " 420", stroke: PAL.ink, "stroke-opacity": ".22", "stroke-width": 2, fill: "none" }, seam); }
    var lipImg = W.bake({ w: 1500, h: 22, S: 1, seed: 3232, shape: '<rect width="1500" height="22" rx="6" fill="' + PAL.cream + '"/>', cut: 1.6 });
    W.piece({ x: -210, y: 1528, w: 1500, h: 22, img: lipImg, lift: .5, parent: stg });
    H.apron = apronP;
    if (o.curtains !== false) {
      [[-60, 1], [1000, -1]].forEach(function (cc, ci) {
        var cw = 190, ch = 1780, r = W.rngOf("curtain" + ci), d = "M0 0 L" + cw + " 0";
        d += " Q" + (cw + 20 * cc[1]) + " " + ch * .5 + " " + (cw - 10 + cc[1] * 26) + " " + ch + " L0 " + ch + "Z";
        var pleats = ""; for (var k = 0; k < 6; k++) pleats += '<path d="M' + (20 + k * 30) + ' 0 L' + (14 + k * 30 + (r() - .5) * 12) + " " + ch + '" stroke="' + (k % 2 ? "#1d2a5b" : "#4a5cc0") + '" stroke-width="' + (10 + r() * 6) + '" stroke-opacity=".5" fill="none"/>';
        var im = W.bake({ w: cw + 40, h: ch, S: 1, seed: 5100 + ci, shape: '<path d="' + d + '" fill="#2b3a8c" transform="translate(' + (ci ? 0 : 0) + ' 0)"/>', overlay: ci ? '<g transform="scale(1)">' + pleats + "</g>" : pleats, cut: 3.4 });
        var cp = W.piece({ x: cc[0] + (ci ? 0 : 0), y: -40, w: cw + 40, h: ch, img: im, lift: 1, blur: 22, parent: stg });
        if (ci) gsap.set(cp.mv, { scaleX: -1 });
        (H.curtains = H.curtains || []).push(cp);
      });
      var vw = 1360, vh = 150;
      var vimg = W.bake({ w: vw, h: vh + 40, S: 1, seed: 5300, shape: '<path d="' + G.scallop(vw, vh, 12, 26) + '" fill="#1d2a5b"/><path d="' + G.scallop(vw, vh - 28, 12, 20) + '" fill="#2b3a8c" transform="translate(0 0)"/>', cut: 3 });
      H.valance = W.piece({ x: -140, y: -50, w: vw, h: vh + 40, img: vimg, lift: 1, blur: 20, parent: stg });
    }

    /* --- backing panel: a lighter sheet behind the words so their shadows have something to fall on (d .62) --- */
    var panL = layer("panel", 0.62, 2.5, 0);
    var pw = 880, ph = 1130, pr = W.rngOf("panel");
    var pd = "M0 " + ph + " L0 150 Q0 0 150 0 L" + (pw - 150) + " 0 Q" + pw + " 0 " + pw + " 150 L" + pw + " " + ph + "Z";
    var pimg = W.bake({ key: "panel", w: pw, h: ph, S: 1.5, seed: 8181, cut: 3, grain: .5, shape: '<path d="' + pd + '" fill="#2b3a8c"/>' });
    H.panel = W.piece({ x: 100, y: 380, w: pw, h: ph, img: pimg, lift: .7, blur: 18, parent: panL });
    var pimg2 = W.bake({ key: "panel2", w: pw - 70, h: ph - 60, S: 1.5, seed: 8282, cut: 2.6, grain: .5, shape: '<path d="M0 ' + (ph - 60) + ' L0 130 Q0 0 130 0 L' + (pw - 200) + " 0 Q" + (pw - 70) + " 0 " + (pw - 70) + " 130 L" + (pw - 70) + " " + (ph - 60) + 'Z" fill="#344aa8"/>' });
    H.panel2 = W.piece({ x: 135, y: 410, w: pw - 70, h: ph - 60, img: pimg2, lift: .4, blur: 8, parent: panL });
    var cr = W.rngOf("clouds");
    [[60, 300, 120, 44], [520, 345, 80, 30]].forEach(function (c, ci) {
      var cw = c[2] * 2.4, chh = c[3] * 2.4, d = "M0 " + chh * .85, k;
      for (k = 0; k < 6; k++) d += " Q" + (cw * (k + .5) / 6) + " " + (chh * (.1 + cr() * .3)) + " " + (cw * (k + 1) / 6) + " " + (chh * .6);
      d += " L" + cw + " " + chh + " L0 " + chh + "Z";
      var cim = W.bake({ w: cw, h: chh, S: 2, seed: 8400 + ci, cut: 2.4, shape: '<path d="' + d + '" fill="' + PAL.cream + '" fill-opacity=".92"/>' });
      (H.clouds = H.clouds || []).push(W.piece({ x: c[0], y: c[1], w: cw, h: chh, img: cim, lift: .5, blur: 6, parent: hillL }));
    });
    /* --- shelves + tags (d 1.0) --- */
    var tagL = layer("tags", 1.0, 4, 0);
    var tagFont = S.FONT, TH = S.TAG_H;
    var wd = WORDS.map(function (t) { return Math.ceil(S.measure(t, tagFont, 700)) + 52; });
    (o.tags === false ? [] : ROWS).forEach(function (row, ri) {
      var total = row.reduce(function (a, i) { return a + wd[i]; }, 0) + S.GAP * (row.length - 1);
      var x = (1080 - total) / 2 + ROW_DX[ri];
      if (ri === 2) { var left = wd[7] + S.GAP + wd[8] / 2; x = 540 - left; }
      if (ri === 1) {
        var r1tot = [0, 1, 2, 3].reduce(function (a, i) { return a + wd[i]; }, 0) + S.GAP * 3, r1x = (1080 - r1tot) / 2;
        var acx = r1x + wd[0] + S.GAP + wd[1] / 2, y3 = ROW_Y[2] - S.TAG_H / 2 + 3, y1 = ROW_Y[0] - S.TAG_H / 2 + 3, y2 = ROW_Y[1] - S.TAG_H / 2 + 3;
        var xc = 540 + (acx - 540) * (y3 - y2) / (y3 - y1);
        x = xc - (wd[4] + S.GAP + wd[5] + S.GAP / 2);
        S.gapX = xc;
      }
      var shW = total + 120, sr3 = W.rngOf("shelf" + ri);
      if (o.shelves !== false) {
        var simg = W.bake({ w: shW, h: 30, S: 2, seed: 7700 + ri, shape: '<path d="' + W.cutRect(shW, 30, 9, sr3, 1.2) + '" fill="' + PAL.cream + '"/>', cut: 2.2 });
        var sp = W.piece({ x: x - 60, y: ROW_Y[ri], w: shW, h: 30, img: simg, lift: .45, blur: 8, parent: tagL, rot: (sr3() - .5) * 1.2 });
        H.shelves.push(sp);
      }
      row.forEach(function (wi, k) {
        var r = W.rngOf("tag" + wi), w = wd[wi], isIt = wi === S.IT;
        var col = isIt ? PAL.coral : PAL.cream;
        var img = W.bake({ w: w, h: TH, S: 2, seed: W.seedOf("tg" + wi), shape: '<path d="' + W.cutRect(w, TH, 18, r, 1.8) + '" fill="' + col + '"/>' });
        var rot = (r() - .5) * 5;
        var pc = W.piece({ x: x, y: ROW_Y[ri] - TH + 3, w: w, h: TH, img: img, rot: 0, lift: .3, blur: 5, parent: tagL, ox: "50%", oy: "100%" });
        var jt = document.createElement("div"); jt.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%"; jt.appendChild(img); pc.mv.appendChild(jt);
        var t = document.createElement("div"); t.textContent = WORDS[wi];
        t.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;font:700 " + tagFont + "px/1 Fredoka,sans-serif;color:" + (isIt ? PAL.cream : PAL.ink) + ";padding-bottom:4px;letter-spacing:.2px";
        jt.appendChild(t);
        pc.rot0 = rot; gsap.set(pc.mv, { rotation: rot });
        H.tags[wi] = { sh: pc.sh, mv: pc.mv, txt: t, wi: wi, x: x, y: ROW_Y[ri] - TH + 3, w: w, h: TH, cx: x + w / 2, cy: ROW_Y[ri] - TH / 2 + 3, rot: rot, row: ri, img: img, jt: jt };
        x += w + S.GAP;
      });
    });
    H.tagL = tagL;
    layer("strips", 1.0, 6);

    var grassL = layer("grass", 1.2, 8, 0), gr2 = W.rngOf("grass"), gd = "M0 120", gx;
    for (gx = 0; gx <= 1500; gx += 38) gd += " L" + gx + " " + (50 + gr2() * 50) + " L" + (gx + 19) + " " + (96 + gr2() * 20);
    gd += " L1500 120Z";
    var gim = W.bake({ key: "grass", w: 1500, h: 120, S: 1.25, seed: 8800, cut: 2.6, shape: '<path d="' + gd + '" fill="#141b3d"/>' });
    H.grass = W.piece({ x: -210, y: 1500, w: 1500, h: 120, img: gim, lift: 1, blur: 14, parent: grassL });
    /* --- foreground plants (d 1.6), only when asked --- */
    if (o.fg !== false) {
      var fg = layer("fg", 1.55, 9, 0);
      var fr = W.rngOf("fg");
      [[-30, 1760, 1], [1110, 1790, -1]].forEach(function (c, ci) {
        for (var k = 0; k < 5; k++) {
          var len = 300 + fr() * 260, wid = 52 + fr() * 36, ang = (c[2] > 0 ? -18 : 18) + (k - 2) * 20 + (fr() - .5) * 10;
          var lim = W.bake({ w: wid * 2 + 20, h: len + 20, S: 1, seed: 6000 + ci * 10 + k, shape: '<g transform="translate(' + (wid + 10) + " " + (len + 10) + ')"><path d="' + G.leaf(len, wid, fr) + '" fill="' + (k % 2 ? "#141b3d" : "#1a1a2e") + '"/></g>', overlay: '<path d="M' + (wid + 10) + " " + (len + 8) + " L" + (wid + 10) + ' 20" stroke="#f6e8c8" stroke-opacity=".12" stroke-width="2"/>', cut: 3 });
          var lp = W.piece({ x: c[0] - wid - 10, y: c[1] - len - 10, w: wid * 2 + 20, h: len + 20, img: lim, lift: 1.1, blur: 24, parent: fg, ox: "50%", oy: "100%" });
          gsap.set(lp.mv, { rotation: ang });
          lp.ang = ang; (H.leaves = H.leaves || []).push(lp);
        }
      });
    }
    return H;
  };

  /* ---------- strips between words ---------- */
  /* returns {d, L, tip, ...} geometry of a ribbon from a to b; straight if bend==0 */
  S.ribbonPath = function (a, b, bend) {
    var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
    var nx = -dy / len, ny = dx / len, cx = mx + nx * bend, cy = my + ny * bend;
    return { d: "M" + a.x + " " + a.y + " Q" + cx + " " + cy + " " + b.x + " " + b.y, c: { x: cx, y: cy }, len: len };
  };
  S.quadAt = function (a, c, b, t) { var u = 1 - t; return { x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y }; };
  S.quadTan = function (a, c, b, t) { var u = 1 - t; return Math.atan2(2 * u * (c.y - a.y) + 2 * t * (b.y - c.y), 2 * u * (c.x - a.x) + 2 * t * (b.x - c.x)); };

  /* ---------- ribbons: a strip of cut paper that unrolls along a curve ----------
     phase 1 (before bakeAll): S.ribbon() bakes the strip.  phase 2 (after): r.mount() builds svg+mask.
     r.apply(p) shows p of the strip (p may overshoot 1: the roll tip runs on a little past the end). */
  S.ribbon = function (parent, o) {
    var a = o.a, b = o.b, rp = S.ribbonPath(a, b, o.bend || 0), w = o.w, pad = Math.max(14, w / 2 + 10);
    var xs = [a.x, b.x, rp.c.x, (a.x + rp.c.x) / 2, (b.x + rp.c.x) / 2], ys = [a.y, b.y, rp.c.y, (a.y + rp.c.y) / 2, (b.y + rp.c.y) / 2];
    var bx = Math.min.apply(null, xs) - pad, by = Math.min.apply(null, ys) - pad;
    var bw = Math.max.apply(null, xs) + pad - bx, bh = Math.max.apply(null, ys) + pad - by;
    var d = "M" + (a.x - bx) + " " + (a.y - by) + " Q" + (rp.c.x - bx) + " " + (rp.c.y - by) + " " + (b.x - bx) + " " + (b.y - by);
    var img = W.bake({ w: bw, h: bh, S: o.S || 1.25, seed: W.seedOf(o.id), cut: Math.min(2.6, 1 + w / 20), pad: 6,
      shape: '<path d="' + d + '" stroke="' + o.fill + '" stroke-width="' + w + '" fill="none" stroke-linecap="butt"/>' });
    var capR = Math.min(24, Math.max(7, w * .5)), cap = null;
    if (o.cap !== false) {
      var spiral = ""; for (var i = 1; i <= 3; i++) spiral += '<circle cx="' + capR + '" cy="' + capR + '" r="' + (capR * i / 3.4) + '" fill="none" stroke="#0a0b1e" stroke-opacity=".28" stroke-width="1.4"/>';
      cap = W.bake({ w: capR * 2, h: capR * 2, S: 2, seed: W.seedOf(o.id + "cap"), cut: 1.2, pad: 4,
        shape: '<circle cx="' + capR + '" cy="' + capR + '" r="' + capR + '" fill="' + o.fill + '"/>', overlay: spiral });
    }
    var R = { id: o.id, a: a, b: b, c: rp.c, w: w, img: img, capImg: cap, capR: capR, bx: bx, by: by, bw: bw, bh: bh, d: d, len: 0, path: null, box: null };
    R.mount = function () {
      var box = W.divEl("position:absolute;left:" + bx + "px;top:" + by + "px;width:" + bw + "px;height:" + bh + "px;--h:" + (o.lift == null ? .35 : o.lift) + ";filter:drop-shadow(calc(1px + var(--h)*2px) calc(2px + var(--h)*3px) 1px rgba(14,16,40,.35)) drop-shadow(calc(3px + var(--h)*8px) calc(5px + var(--h)*12px) calc(5px + var(--h)*10px) rgba(14,16,40,.24));", parent);
      var svg = W.svgEl("svg", { width: bw, height: bh, viewBox: "0 0 " + bw + " " + bh, style: "position:absolute;left:0;top:0;overflow:visible" }, box);
      var defs = W.svgEl("defs", {}, svg), mk = W.svgEl("mask", { id: "mk-" + o.id, maskUnits: "userSpaceOnUse", x: -20, y: -20, width: bw + 40, height: bh + 40 }, defs);
      var mp = W.svgEl("path", { d: d, stroke: "#fff", "stroke-width": w + 30, fill: "none" }, mk);
      var L = mp.getTotalLength(); mp.setAttribute("stroke-dasharray", L + " " + (L + 50)); mp.setAttribute("stroke-dashoffset", L);
      var im = W.svgEl("image", { x: -6, y: -6, width: bw + 12, height: bh + 12, mask: "url(#mk-" + o.id + ")" }, svg);
      im.setAttributeNS("http://www.w3.org/1999/xlink", "href", img.src); im.setAttribute("href", img.src);
      var capEl = null;
      if (cap) { capEl = cap; capEl.style.cssText = "position:absolute;left:" + (-capR) + "px;top:" + (-capR) + "px;width:" + (capR * 2 + 8) + "px;height:" + (capR * 2 + 8) + "px;opacity:0;transform-origin:50% 50%"; box.appendChild(capEl); }
      R.box = box; R.len = L; R.mp = mp; R.capEl = capEl; R.svg = svg;
      R.apply = function (p) {
        var q = Math.max(0, Math.min(1, p));
        mp.setAttribute("stroke-dashoffset", L * (1 - q));
        box.style.visibility = p <= 0 ? "hidden" : "visible";
        if (capEl) {
          var t = Math.max(0, p), pt = S.quadAt({ x: a.x - bx, y: a.y - by }, { x: rp.c.x - bx, y: rp.c.y - by }, { x: b.x - bx, y: b.y - by }, Math.min(t, 1));
          var ang = S.quadTan({ x: 0, y: 0 }, { x: rp.c.x - a.x, y: rp.c.y - a.y }, { x: b.x - a.x, y: b.y - a.y }, Math.min(t, 1));
          var ov = t > 1 ? (t - 1) * L * .6 : 0;
          capEl.style.opacity = p > 0 && p < 1.35 ? 1 : 0;
          capEl.style.transform = "translate(" + (pt.x + Math.cos(ang) * ov) + "px," + (pt.y + Math.sin(ang) * ov) + "px) rotate(" + (t * L / capR * 57.3) + "deg)";
        }
      };
      R.apply(0);
      return R;
    };
    return R;
  };
})();

(function(){
  var W=window,S=W.Stage;
  /* 12 fps stop-motion boil: every paper piece gets a tiny seeded offset that changes only on 12 fps steps */
  S.boil = function (H, t, list) {
    var step = Math.floor(t * 12 + 1e-6);
    var items = list || Object.keys(H.tags).map(function (k) { return H.tags[k]; });
    items.forEach(function (T, i) {
      var n = step * 31 + (T.wi == null ? i : T.wi) * 17;
      gsap.set(T.jt, { x: (W.hash01(n) - .5) * 1.8, y: (W.hash01(n + 7) - .5) * 1.6, rotation: (W.hash01(n + 13) - .5) * .9 });
    });
  };
})();
