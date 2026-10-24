/* glass.js - stained-glass set. Everything is a pure function of (seed, time).
   Heavy textures (glass, stone, lead came) are baked ONCE (SVG filter -> canvas -> PNG) and reused. */
(function () {
  var W = window, G = W.Glass = {};
  /* ---------- seeded randomness ---------- */
  W.mulberry32 = function (a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  W.seedOf = function (s) { var h = 1779033703 ^ s.length; for (var i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^ (h >>> 16)) >>> 0; };
  W.rngOf = function (s) { return W.mulberry32(W.seedOf(s)); };
  W.hash01 = function (n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  G.C = { cobalt: "#1b3fa8", ruby: "#b3202e", emerald: "#1f8a5b", amber: "#e5a823", violet: "#5a2d8a", lead: "#15110f", stone: "#2a2724", warm: "#fff1d6" };
  G.WW = 760; G.WH = 960;
  var hex2 = function (h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; };
  var rgb = function (a) { return "#" + a.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? "0" : "") + v.toString(16); }).join(""); };
  G.mix = function (a, b, t) { var x = hex2(a), y = hex2(b); return rgb([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]); };
  G.svg = function (tag, attrs, parent) { var e = document.createElementNS("http://www.w3.org/2000/svg", tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  G.div = function (css, parent, cls) { var e = document.createElement("div"); e.style.cssText = css; if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; };
  G.ready = function (key, setup) { W.__hf = W.__hf || {}; W.__hf.buildReady = W.__hf.buildReady || {}; W.__hf.buildReady[key] = Promise.resolve().then(setup); };
  G.fontsReady = function () { return Promise.all(["700 40px Cinzel", "600 40px Cinzel", "800 40px Cinzel", "700 40px 'Cormorant Garamond'", "600 40px 'Cormorant Garamond'"].map(function (f) { return document.fonts.load(f, "Aa"); })).then(function () { return document.fonts.ready; }); };

  /* ---------- baking: svg -> canvas -> png dataURL, cached by key ---------- */
  W.__gbk = W.__gbk || {};
  G.bake = function (key, w, h, S, inner, defs) {
    if (W.__gbk[key]) return W.__gbk[key];
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w * S + '" height="' + h * S + '" viewBox="0 0 ' + w + " " + h + '"><defs>' + (defs || "") + "</defs>" + inner + "</svg>";
    W.__gbk[key] = new Promise(function (res) {
      var im = new Image();
      im.onload = function () { try { var c = document.createElement("canvas"); c.width = w * S; c.height = h * S; c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL("image/png")); } catch (e) { res(im.src); } };
      im.onerror = function () { res(""); };
      im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    });
    return W.__gbk[key];
  };

  /* ---------- seeded Voronoi by half-plane clipping ---------- */
  function clip(poly, a, b, c) {
    var out = [], n = poly.length;
    for (var i = 0; i < n; i++) {
      var p = poly[i], q = poly[(i + 1) % n], fp = a * p[0] + b * p[1] - c, fq = a * q[0] + b * q[1] - c;
      if (fp <= 0) out.push(p);
      if ((fp < 0 && fq > 0) || (fp > 0 && fq < 0)) { var t = fp / (fp - fq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
    }
    return out;
  }
  G.voronoi = function (sites, x0, y0, x1, y1, lim) {
    return sites.map(function (s, i) {
      var poly = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
      var order = sites.map(function (t, j) { return [j, (t[0] - s[0]) * (t[0] - s[0]) + (t[1] - s[1]) * (t[1] - s[1])]; }).filter(function (o) { return o[0] !== i; }).sort(function (a, b) { return a[1] - b[1]; }).slice(0, lim || 26);
      order.forEach(function (o) { var t = sites[o[0]]; poly = clip(poly, t[0] - s[0], t[1] - s[1], (t[0] * t[0] + t[1] * t[1] - s[0] * s[0] - s[1] * s[1]) / 2); });
      return poly;
    });
  };
  G.jitterGrid = function (cols, rows, w, h, seed, j) {
    var r = W.rngOf(seed), pts = [], cw = w / cols, ch = h / rows;
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) pts.push([(x + .5) * cw + (r() - .5) * cw * j, (y + .5) * ch + (r() - .5) * ch * j]);
    return pts;
  };
  var centroid = function (p) { var a = 0, cx = 0, cy = 0; for (var i = 0; i < p.length; i++) { var q = p[(i + 1) % p.length], f = p[i][0] * q[1] - q[0] * p[i][1]; a += f; cx += (p[i][0] + q[0]) * f; cy += (p[i][1] + q[1]) * f; } a /= 2; return { x: cx / (6 * a), y: cy / (6 * a), area: Math.abs(a) }; };
  G.centroid = centroid;
  G.polyD = function (p) { return "M" + p.map(function (q) { return q[0].toFixed(1) + " " + q[1].toFixed(1); }).join(" L") + "Z"; };

  /* ---------- the face: one original drawing, as SVG path strings in a 300 x 380 box ---------- */
  var FR = { w: 300, h: 380 }, K = G.WW / FR.w;          // raster -> window scale (2.533)
  G.K = K;
  var hair = (function () {
    var r = W.rngOf("hair"), d = "";
    for (var i = 0; i < 11; i++) { var t = i / 10, x = 60 + t * 180, y = 120 - Math.sin(t * Math.PI) * 74; d += "M" + (x + (r() - .5) * 6).toFixed(1) + " " + y.toFixed(1) + " q" + ((r() - .5) * 18).toFixed(1) + " " + (14 + r() * 14).toFixed(1) + " " + ((r() - .5) * 10).toFixed(1) + " " + (30 + r() * 12).toFixed(1) + " "; }
    return d;
  })();
  G.FACE = {
    head: "M42 205 A108 150 0 1 0 258 205 A108 150 0 1 0 42 205Z",
    hairCap: "M48 190 C40 92 100 36 150 36 C200 36 260 92 252 190", hair: hair,
    browL: "M68 158 Q105 138 138 156", browR: "M162 156 Q195 138 232 158",
    eyeL: "M66 186 Q105 160 144 186 Q105 212 66 186Z", eyeR: "M156 186 Q195 160 234 186 Q195 212 156 186Z",
    irisL: [105, 186, 11], irisR: [195, 186, 11],
    nose: "M146 196 Q138 232 128 252 Q150 270 172 252", nostrils: "M136 258 q6 6 12 0 M152 258 q6 6 12 0",
    mouthU: "M104 304 Q128 288 150 296 Q172 288 196 304", mouthL: "M104 304 Q150 346 196 304",
    earL: "M44 180 Q16 205 44 242", earR: "M256 180 Q284 205 256 242"
  };
  G.PARTS = { eyeL: [105, 186], eyeR: [195, 186], nose: [150, 240], mouth: [150, 312], browL: [103, 150], browR: [197, 150] };
  var strokes = ["head", "hairCap", "hair", "browL", "browR", "eyeL", "eyeR", "nose", "nostrils", "mouthU", "mouthL", "earL", "earR"];
  G.drawFace = function (g, lw) {
    g.fillStyle = "#fff"; g.fillRect(0, 0, FR.w, FR.h); g.strokeStyle = "#000"; g.fillStyle = "#000"; g.lineCap = "round"; g.lineJoin = "round";
    strokes.forEach(function (k) { g.lineWidth = k === "hair" ? 4 : lw; g.stroke(new Path2D(G.FACE[k])); });
    [G.FACE.irisL, G.FACE.irisR].forEach(function (c) { g.beginPath(); g.arc(c[0], c[1], c[2], 0, 6.2832); g.fill(); });
  };
  /* vector version for the projection screen / glyphs: returns an svg <g> */
  G.faceSvg = function (parent, color, sw, list) {
    var g = G.svg("g", { fill: "none", stroke: color, "stroke-width": sw, "stroke-linecap": "round", "stroke-linejoin": "round" }, parent), paths = [];
    (list || strokes).forEach(function (k) { paths.push(G.svg("path", { d: G.FACE[k] }, g)); });
    if (!list || list.indexOf("irisL") >= 0) [G.FACE.irisL, G.FACE.irisR].forEach(function (c) { paths.push(G.svg("circle", { cx: c[0], cy: c[1], r: c[2], fill: color, stroke: "none" }, g)); });
    return { g: g, paths: paths };
  };

  /* ---------- analysis: Sobel on the real raster; structure tensor per cell ---------- */
  var GX, GY, MAG;
  function analyse() {
    var c = document.createElement("canvas"); c.width = FR.w; c.height = FR.h; var g = c.getContext("2d");
    G.drawFace(g, 7);
    // a gentle blur so a 7 px stroke gives smooth gradients
    var b = document.createElement("canvas"); b.width = FR.w; b.height = FR.h; var bg = b.getContext("2d"); bg.filter = "blur(1.6px)"; bg.drawImage(c, 0, 0);
    var d = bg.getImageData(0, 0, FR.w, FR.h).data, L = new Float32Array(FR.w * FR.h);
    for (var i = 0; i < L.length; i++) L[i] = d[i * 4] / 255;
    GX = new Float32Array(L.length); GY = new Float32Array(L.length); MAG = new Float32Array(L.length);
    for (var y = 1; y < FR.h - 1; y++) for (var x = 1; x < FR.w - 1; x++) {
      var o = y * FR.w + x, a = L[o - FR.w - 1], b2 = L[o - FR.w], c2 = L[o - FR.w + 1], d2 = L[o - 1], f = L[o + 1], g2 = L[o + FR.w - 1], h = L[o + FR.w], i2 = L[o + FR.w + 1];
      var gx = (c2 + 2 * f + i2) - (a + 2 * d2 + g2), gy = (g2 + 2 * h + i2) - (a + 2 * b2 + c2);
      GX[o] = gx; GY[o] = gy; MAG[o] = Math.hypot(gx, gy);
    }
  }
  /* tensor sums over a disc (raster coords). bins = energy by gradient angle in 4 bins (0, 45, 90, 135 deg) */
  function tensor(cx, cy, r) {
    var sxx = 0, syy = 0, sxy = 0, n = 0, bins = [0, 0, 0, 0], r2 = r * r;
    for (var y = Math.max(1, Math.floor(cy - r)); y <= Math.min(FR.h - 2, Math.ceil(cy + r)); y++) for (var x = Math.max(1, Math.floor(cx - r)); x <= Math.min(FR.w - 2, Math.ceil(cx + r)); x++) {
      if ((x - cx) * (x - cx) + (y - cy) * (y - cy) > r2) continue;
      var o = y * FR.w + x, gx = GX[o], gy = GY[o]; n++; sxx += gx * gx; syy += gy * gy; sxy += gx * gy;
      var m = MAG[o]; if (m > .25) { var th = Math.atan2(gy, gx); if (th < 0) th += Math.PI; if (th >= Math.PI) th -= Math.PI; bins[Math.round(th / (Math.PI / 4)) % 4] += m; }
    }
    var tr = sxx + syy, th2 = .5 * Math.atan2(2 * sxy, sxx - syy);
    return { energy: n ? tr / n : 0, coh: tr ? Math.hypot(sxx - syy, 2 * sxy) / tr : 0, theta: th2, bins: bins, n: n };
  }
  G.edgeClass = function (theta) { var t = Math.abs(theta) * 180 / Math.PI; return t < 28 ? "v" : t > 62 ? "h" : "d"; };   // gradient angle -> edge direction
  G.EDGECOL = { h: "ruby", v: "cobalt", d: "amber" };

  /* ---------- the four panes ---------- */
  G.panes = {};
  var SHAPE = { arch: "M0 960 L0 350 A560 560 0 0 1 380 0 A560 560 0 0 1 760 350 L760 960Z", rose: "M380 100 A380 380 0 1 1 379.9 100Z" };
  G.SHAPE = SHAPE;
  function cellsFrom(polys, props) { return polys.map(function (p, i) { var c = centroid(p); return Object.assign({ i: i, poly: p, cx: c.x, cy: c.y, area: c.area }, props(i, p, c)); }); }
  G.compute = function () {
    if (G.panes.p1) return G.panes;
    analyse();
    /* PANE 1: a grid of tiny panes, each lit only for the edge direction it sees */
    var s1 = G.jitterGrid(15, 19, G.WW, G.WH, "p1", .34), v1 = G.voronoi(s1, 0, 0, G.WW, G.WH, 20), maxE = 0;
    var t1 = v1.map(function (p, i) { var c = centroid(p), t = tensor(c.x / K, c.y / K, Math.sqrt(c.area) / K * .62); if (t.energy > maxE) maxE = t.energy; return t; });
    G.panes.p1 = { shape: "arch", cells: cellsFrom(v1, function (i, p, c) {
      var t = t1[i], lit = t.energy > maxE * .22 && t.coh > .35, cls = lit ? G.edgeClass(t.theta) : null;
      return { lit: lit, cls: cls, color: cls ? G.C[G.EDGECOL[cls]] : "#0c0d14", theta: t.theta, energy: t.energy };
    }), glyphs: false };
    /* PANE 2: bigger cells; corners, curves, textures found from the spread of edge directions inside each cell */
    var s2 = G.jitterGrid(8, 10, G.WW, G.WH, "p2", .38), v2 = G.voronoi(s2, 0, 0, G.WW, G.WH, 20), maxE2 = 0;
    var t2 = v2.map(function (p) { var c = centroid(p), t = tensor(c.x / K, c.y / K, Math.sqrt(c.area) / K * .7); if (t.energy > maxE2) maxE2 = t.energy; return t; });
    G.panes.p2 = { shape: "arch", cells: cellsFrom(v2, function (i, p, c) {
      var t = t2[i], tot = t.bins.reduce(function (a, b) { return a + b; }, 0) || 1, sig = [];
      t.bins.forEach(function (b, k) { if (b / tot > .2) sig.push(k); });
      var cls = "none"; if (t.energy > maxE2 * .1 && tot > 4) {
        if (sig.length >= 3 || t.energy > maxE2 * .55 && sig.length >= 2 && t.coh < .25) cls = "texture";
        else if (sig.length === 2) cls = ((sig[1] - sig[0]) % 4 === 2) ? "corner" : (((sig[1] - sig[0]) % 3 === 0 || (sig[1] - sig[0]) === 1) ? "curve" : "corner");
        else cls = "straight";
      }
      var col = { corner: G.C.violet, curve: G.C.emerald, texture: G.C.amber, straight: G.C[G.EDGECOL[G.edgeClass(t.theta)]], none: "#0c0d14" }[cls];
      return { lit: cls !== "none", cls: cls, color: col, theta: t.theta, energy: t.energy, sig: sig };
    }), glyphs: true };
    /* PANE 3: large sections at the real positions of the face parts */
    var site = function (n, x, y, role, col) { return { n: n, p: [x * K, y * K], role: role, col: col }; };
    var S3 = [site("eyeL", 105, 186, "part", "emerald"), site("eyeR", 195, 186, "part", "emerald"), site("nose", 150, 242, "part", "amber"), site("mouth", 150, 312, "part", "ruby"),
      site("browL", 100, 144, "sup", "cobalt"), site("browR", 200, 144, "sup", "cobalt"), site("forehead", 150, 96, "sup", "violet"), site("hairL", 52, 92, "sup", "violet"), site("hairR", 248, 92, "sup", "violet"),
      site("cheekL", 62, 252, "sup", "cobalt"), site("cheekR", 238, 252, "sup", "cobalt"), site("chin", 150, 362, "sup", "violet"), site("earL", 14, 214, "sup", "violet"), site("earR", 286, 214, "sup", "violet"),
      site("tlc", 6, 6, "bg", "violet"), site("trc", 294, 6, "bg", "violet"), site("blc", 8, 372, "bg", "violet"), site("brc", 292, 372, "bg", "violet"), site("jawL", 70, 330, "bg", "cobalt"), site("jawR", 230, 330, "bg", "cobalt")];
    var v3 = G.voronoi(S3.map(function (s) { return s.p; }), 0, 0, G.WW, G.WH, 20);
    G.panes.p3 = { shape: "arch", cells: cellsFrom(v3, function (i) { var s = S3[i]; return { lit: true, cls: s.role, name: s.n, color: G.C[s.col], part: s.role === "part" }; }), glyphs: true };
    /* PANE 4: a rose window; the centre medallion is the assembled face */
    var cx = 380, cy = 480, rings = [[0, 150, 1, 0], [150, 236, 8, .5], [236, 310, 16, .25], [310, 380, 24, 0]], cells4 = [], pal = [["amber"], ["ruby", "cobalt"], ["emerald", "amber"], ["violet", "ruby", "cobalt"]];
    rings.forEach(function (rg, ri) {
      for (var k = 0; k < rg[2]; k++) {
        var a0 = (k + rg[3]) / rg[2] * Math.PI * 2, a1 = (k + 1 + rg[3]) / rg[2] * Math.PI * 2, p = [], st = Math.max(2, Math.ceil((a1 - a0) / .12));
        if (ri === 0) { for (var q = 0; q < 48; q++) p.push([cx + Math.cos(q / 48 * 6.2832) * rg[1], cy + Math.sin(q / 48 * 6.2832) * rg[1]]); }
        else { for (var q2 = 0; q2 <= st; q2++) { var a = a0 + (a1 - a0) * q2 / st; p.push([cx + Math.cos(a) * rg[1], cy + Math.sin(a) * rg[1]]); } for (var q3 = st; q3 >= 0; q3--) { var b = a0 + (a1 - a0) * q3 / st; p.push([cx + Math.cos(b) * rg[0], cy + Math.sin(b) * rg[0]]); } }
        cells4.push({ i: cells4.length, poly: p, ring: ri, k: k, n: rg[2], lit: true, pane4center: ri === 0, pane: 4, cls: "ring" + ri, color: G.C[pal[ri][k % pal[ri].length]], cx: cx, cy: cy, ang: (a0 + a1) / 2 });
      }
    });
    G.panes.p4 = { shape: "rose", cells: cells4, glyphs: true, center: [cx, cy] };
    return G.panes;
  };

  /* glyphs (lead lines) for a cell: path strings in window coords */
  G.glyphFor = function (pane, c) {
    var ang = c.theta == null ? 0 : c.theta, deg = ang * 57.2958, cx = c.cx, cy = c.cy, s = Math.sqrt(c.area) * .3, T = "translate(" + cx.toFixed(1) + " " + cy.toFixed(1) + ") rotate(" + (deg + 90).toFixed(0) + ") scale(" + s.toFixed(2) + ")";
    if (pane === 2) {
      if (c.cls === "corner") return { d: "M-1 -1.2 L-1 1 L1.3 1", t: T };                                   // an L
      if (c.cls === "curve") return { d: "M-1.2 .9 Q-1.2 -1.1 1.2 -1", t: T };                             // an arc
      if (c.cls === "texture") return { d: "M-1.2 -1 L1.2 -1 M-1.2 0 L1.2 0 M-1.2 1 L1.2 1", t: T };       // hatching
      if (c.cls === "straight") return { d: "M-1.3 0 L1.3 0", t: T };
    }
    return null;
  };

  /* ---------- textures (baked once) ---------- */
  G.assets = function (paneNames) {
    G.compute();
    var A = {}, jobs = [];
    var texInner = '<rect width="760" height="960" fill="#fff"/><rect width="760" height="960" filter="url(#streak)" opacity=".9"/><rect width="760" height="960" filter="url(#hammer)" opacity=".8"/>' + (function () { var r = W.rngOf("bubbles"), s = ""; for (var i = 0; i < 46; i++) { var x = r() * 760, y = r() * 960, rr = 2 + r() * 7; s += '<circle cx="' + x.toFixed(0) + '" cy="' + y.toFixed(0) + '" r="' + rr.toFixed(1) + '" fill="rgba(255,255,255,.55)" stroke="rgba(0,0,0,.45)" stroke-width="1.2"/>'; } return s; })();
    var texDefs = '<filter id="streak" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.004 0.045" numOctaves="3" seed="11"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 .62"/></filter>' +
      '<filter id="hammer" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="5" result="n"/><feDiffuseLighting in="n" surfaceScale="3" diffuseConstant="1.1" lighting-color="#fff" result="l"><feDistantLight azimuth="225" elevation="60"/></feDiffuseLighting><feComponentTransfer><feFuncR type="linear" slope=".5" intercept=".5"/><feFuncG type="linear" slope=".5" intercept=".5"/><feFuncB type="linear" slope=".5" intercept=".5"/></feComponentTransfer></filter>';
    jobs.push(G.bake("texMul", 760, 960, 1, texInner, texDefs).then(function (u) { A.texMul = u; }));
    var specDefs = '<filter id="sp" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="9" result="n"/><feSpecularLighting in="n" surfaceScale="4" specularConstant="1.1" specularExponent="22" lighting-color="#fff" result="s"><feDistantLight azimuth="235" elevation="38"/></feSpecularLighting><feComposite in="s" in2="SourceGraphic" operator="in"/></filter>';
    jobs.push(G.bake("texSpec", 760, 960, 1, '<rect width="760" height="960" fill="#fff" filter="url(#sp)"/>', specDefs).then(function (u) { A.texSpec = u; }));
    var stoneDefs = '<filter id="st" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.03 0.05" numOctaves="4" seed="3" result="n"/><feDiffuseLighting in="n" surfaceScale="2.2" diffuseConstant="1.15" lighting-color="#d8cdbb" result="l"><feDistantLight azimuth="225" elevation="55"/></feDiffuseLighting></filter>';
    jobs.push(G.bake("stone", 540, 960, 1, '<rect width="540" height="960" fill="#2a2724" filter="url(#st)"/><rect width="540" height="960" fill="#2a2724" opacity=".55"/>', stoneDefs).then(function (u) { A.stone = u; }));
    A.lead = {}; A.frame = {};
    paneNames.forEach(function (pn) { jobs.push(G.bakeLead(pn).then(function (u) { A.lead[pn] = u; })); jobs.push(G.bakeFrame(pn).then(function (u) { A.frame[pn] = u; })); });
    return Promise.all(jobs).then(function () { return A; });
  };
  /* lead came: every cell edge once, weight varies per edge (5 to 9 px), uneven (displaced), a light inner edge, solder dots at joints */
  G.bakeLead = function (pn) {
    var P = G.panes["p" + pn], seen = {}, d = "", dots = "", r = W.rngOf("lead" + pn), PAD = 14;
    var key = function (a, b) { var f = function (p) { return Math.round(p[0] / 2) + "," + Math.round(p[1] / 2); }, x = f(a), y = f(b); return x < y ? x + "|" + y : y + "|" + x; };
    var lines = "", hi = "";
    P.cells.forEach(function (c) {
      for (var i = 0; i < c.poly.length; i++) {
        var a = c.poly[i], b = c.poly[(i + 1) % c.poly.length], k = key(a, b); if (seen[k]) continue; seen[k] = 1;
        var w = 5 + r() * 4, seg = 'M' + (a[0] + PAD).toFixed(1) + " " + (a[1] + PAD).toFixed(1) + " L" + (b[0] + PAD).toFixed(1) + " " + (b[1] + PAD).toFixed(1);
        lines += '<path d="' + seg + '" stroke="#15110f" stroke-width="' + w.toFixed(1) + '" stroke-linecap="round"/>';
        hi += '<path d="' + seg + '" stroke="#5b4e43" stroke-opacity=".55" stroke-width="' + (w * .32).toFixed(1) + '" stroke-linecap="round" transform="translate(-1.2 -1.2)"/>';
        if (r() < .22) dots += '<circle cx="' + (a[0] + PAD).toFixed(1) + '" cy="' + (a[1] + PAD).toFixed(1) + '" r="' + (5 + r() * 4).toFixed(1) + '" fill="#2a2420"/><circle cx="' + (a[0] + PAD - 1.5).toFixed(1) + '" cy="' + (a[1] + PAD - 1.5).toFixed(1) + '" r="1.8" fill="#8f8478" fill-opacity=".7"/>';
      }
    });
    var outline = '<path d="' + SHAPE[P.shape] + '" transform="translate(' + PAD + " " + PAD + ')" fill="none" stroke="#15110f" stroke-width="13"/>';
    var defs = '<filter id="un" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="' + (7 + pn) + '" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G"/></filter>';
    defs += '<clipPath id="lc"><path transform="translate(' + PAD + " " + PAD + ')" d="' + SHAPE[P.shape] + '"/></clipPath>';
    return G.bake("lead" + pn, 760 + PAD * 2, 960 + PAD * 2, 1.25, '<g clip-path="url(#lc)"><g filter="url(#un)" fill="none">' + lines + "</g><g fill='none'>" + hi + "</g>" + dots + '</g><g filter="url(#un)" fill="none">' + outline + "</g>", defs);
  };
  /* stone tracery around the window opening */
  G.bakeFrame = function (pn) {
    var P = G.panes["p" + pn], PAD = 90, W2 = 760 + PAD * 2, H2 = 960 + PAD * 2, hole = SHAPE[P.shape];
    var outer = P.shape === "arch" ? "M0 " + H2 + " L0 330 A640 640 0 0 1 " + W2 / 2 + " 0 A640 640 0 0 1 " + W2 + " 330 L" + W2 + " " + H2 + "Z" : "M0 0 H" + W2 + " V" + H2 + " H0Z";
    var inner = '<path transform="translate(' + PAD + " " + PAD + ')" d="' + hole + '"/>';
    var defs = '<filter id="fs" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.04 0.06" numOctaves="4" seed="' + (21 + pn) + '" result="n"/><feDiffuseLighting in="n" surfaceScale="2.4" diffuseConstant="1.2" lighting-color="#7a7268" result="l"><feDistantLight azimuth="225" elevation="52"/></feDiffuseLighting><feColorMatrix in="l" type="matrix" values=".17 0 0 0 0  0 .16 0 0 0  0 0 .15 0 0  0 0 0 1 0" result="l2"/><feComposite in="l2" in2="SourceGraphic" operator="in"/></filter>' +
      '<mask id="mk"><rect width="' + W2 + '" height="' + H2 + '" fill="#fff"/><g fill="#000">' + inner + "</g></mask>";
    var shape = P.shape === "arch" ? '<path d="' + outer + '" fill="#2a2724"/>' : '<rect width="' + W2 + '" height="' + H2 + '" fill="#2a2724"/>';
    // mouldings: a lighter bevel line around the opening
    var bev = '<g transform="translate(' + PAD + " " + PAD + ')" fill="none"><path d="' + hole + '" stroke="#0b0a09" stroke-width="16"/><path d="' + hole + '" stroke="#6b6258" stroke-opacity=".55" stroke-width="3" transform="translate(-6 -6)"/></g>';
    return G.bake("frame" + pn, W2, H2, 1, '<g mask="url(#mk)"><g filter="url(#fs)">' + shape + "</g></g>" + bev, defs);
  };
})();
