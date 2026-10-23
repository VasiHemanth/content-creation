/* vox.js - helpers for the explainer-journalism video. Everything is a pure function of (seed, time). */
(function () {
  var W = window;
  W.mulberry32 = function (a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  W.seedOf = function (s) { var h = 1779033703 ^ s.length; for (var i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^ (h >>> 16)) >>> 0; };
  W.rngOf = function (s) { return W.mulberry32(W.seedOf(s)); };
  W.hash01 = function (n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  var V = W.V = {};
  V.C = { y: "#ffd400", k: "#0b0b0b", w: "#f4f1ea", p: "#ff3d81", b: "#2b59ff", g: "#8a877f" };
  var fr = V.F = 30;
  V.div = function (css, parent, cls) { var e = document.createElement("div"); e.style.cssText = css; if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; };
  V.svg = function (tag, attrs, parent) { var e = document.createElementNS("http://www.w3.org/2000/svg", tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  V.fontsReady = function () { return Promise.all(["400 100px Anton", "400 60px 'Archivo Black'", "700 40px 'Inter Tight'", "500 40px 'Inter Tight'", "800 40px 'Inter Tight'"].map(function (f) { return document.fonts.load(f, "Aa0"); })).then(function () { return document.fonts.ready; }); };
  V.ready = function (key, setup) { W.__hf = W.__hf || {}; W.__hf.buildReady = W.__hf.buildReady || {}; W.__hf.buildReady[key] = Promise.resolve().then(setup); };

  /* ---------- eases: hits, not polite curves ---------- */
  V.E = {
    slam: function (p) { return p < .55 ? Math.pow(p / .55, 4) * 1.0 : 1 + Math.sin((p - .55) / .45 * Math.PI * 2.2) * Math.exp(-(p - .55) * 9) * .05; },
    hit: function (p) { return 1 - Math.pow(1 - p, 5); },
    snap: function (p) { return p >= 1 ? 1 : 1 - Math.exp(-9 * p) * Math.cos(2 * Math.PI * 1.1 * p); },
    stepN: function (n) { return function (p) { return Math.floor(p * n) / n; }; }
  };

  /* ---------- wobbly seeded hand lines ---------- */
  V.wobble = function (x0, y0, x1, y1, rng, amp, segs) {
    segs = segs || 8; var d = "M" + x0 + " " + y0, dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    for (var i = 1; i <= segs; i++) { var t = i / segs, o = (rng() - .5) * amp * (i === segs ? .3 : 1); d += " L" + (x0 + dx * t + nx * o) + " " + (y0 + dy * t + ny * o); }
    return d;
  };
  /* scribble underline: a zig-zag marker stroke, varying width via two passes */
  V.scribble = function (parent, x, y, w, color, seed, sw) {
    var r = rngOf(seed), g = V.svg("g", {}, parent), d1 = V.wobble(x, y, x + w, y + (r() - .5) * 8, r, 7, 10), d2 = V.wobble(x + w, y + 10 + r() * 6, x + w * .04, y + 14 + r() * 8, r, 8, 10);
    var a = V.svg("path", { d: d1 + " " + d2.replace(/^M/, "L"), stroke: color, "stroke-width": sw || 10, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, g);
    var L = a.getTotalLength(); a.setAttribute("stroke-dasharray", L); a.setAttribute("stroke-dashoffset", L); return { g: g, path: a, len: L };
  };
  V.circleMark = function (parent, cx, cy, rx, ry, color, seed, sw) {
    var r = rngOf(seed), d = "", n = 22, a0 = r() * 6;
    for (var i = 0; i <= n + 3; i++) { var a = a0 + i / n * Math.PI * 2 * 1.08, k = 1 + (r() - .5) * .08 + i * .004; d += (i ? " L" : "M") + (cx + Math.cos(a) * rx * k) + " " + (cy + Math.sin(a) * ry * k); }
    var p = V.svg("path", { d: d, stroke: color, "stroke-width": sw || 9, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, parent);
    var L = p.getTotalLength(); p.setAttribute("stroke-dasharray", L); p.setAttribute("stroke-dashoffset", L); return { path: p, len: L };
  };
  V.arrow = function (parent, x0, y0, x1, y1, color, seed, sw) {
    var r = rngOf(seed), mx = (x0 + x1) / 2 + (r() - .5) * 60, my = (y0 + y1) / 2 + (r() - .5) * 60;
    var ang = Math.atan2(y1 - my, x1 - mx), h = 38;
    var shaft = V.svg("path", { d: "M" + x0 + " " + y0 + " Q" + mx + " " + my + " " + x1 + " " + y1, stroke: color, "stroke-width": sw || 9, fill: "none", "stroke-linecap": "round" }, parent);
    var head = V.svg("path", { d: "M" + (x1 - Math.cos(ang - .5) * h) + " " + (y1 - Math.sin(ang - .5) * h) + " L" + x1 + " " + y1 + " L" + (x1 - Math.cos(ang + .5) * h) + " " + (y1 - Math.sin(ang + .5) * h), stroke: color, "stroke-width": sw || 9, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, parent);
    var L = shaft.getTotalLength(), HL = head.getTotalLength();
    shaft.setAttribute("stroke-dasharray", L); shaft.setAttribute("stroke-dashoffset", L); head.setAttribute("stroke-dasharray", HL); head.setAttribute("stroke-dashoffset", HL);
    return { path: shaft, len: L, head: head, hlen: HL };
  };
  V.draw = function (tl, o, t, d, ease) {
    tl.to(o.path, { attr: { "stroke-dashoffset": 0 }, duration: d, ease: ease || "power2.out" }, t);
    if (o.head) tl.to(o.head, { attr: { "stroke-dashoffset": 0 }, duration: d * .35, ease: "power2.out" }, t + d * .8);
  };

  /* highlighter box with ragged ends, slightly tilted, behind a word; wipes in left to right */
  V.hilite = function (parent, x, y, w, h, color, seed, tilt) {
    var r = rngOf(seed), j = function () { return (r() - .5) * 10; };
    var pts = [[x - 8 + j(), y + j()], [x + w * .5, y - 3 + j()], [x + w + 10 + j(), y + 4 + j()], [x + w + 14 + j(), y + h * .5 + j()], [x + w + 6 + j(), y + h + j()], [x + w * .5, y + h + 3 + j()], [x - 10 + j(), y + h - 2 + j()], [x - 14 + j(), y + h * .45 + j()]];
    var svg = V.svg("svg", { width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: "position:absolute;left:0;top:0;overflow:visible;pointer-events:none" }, parent);
    var g = V.svg("g", { transform: "rotate(" + (tilt == null ? -1.2 : tilt) + " " + (x + w / 2) + " " + (y + h / 2) + ")" }, svg);
    var p = V.svg("path", { d: "M" + pts.map(function (q) { return q[0] + " " + q[1]; }).join(" L") + "Z", fill: color }, g);
    return { svg: svg, g: g, p: p, x: x, y: y, w: w, h: h };
  };
  V.hiliteWipe = function (tl, H, t, d) {
    tl.fromTo(H.p, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 -4% 0 -4%)", duration: d || .25, ease: "power3.out" }, t);
    tl.set(H.svg, { opacity: 0 }, 0).set(H.svg, { opacity: 1 }, t);
  };

  /* ---------- title whip-in with a 3-4 copy ghost trail that fades in 3 frames ---------- */
  V.ghostTitle = function (tl, el, opts, t) {
    // el: positioned text node; copies are clones inserted before it
    var n = opts.copies || 3, dx = opts.dx || 0, dy = opts.dy || 0, fr3 = 3 / 30, ghosts = [];
    for (var i = 0; i < n; i++) { var g = el.cloneNode(true); g.removeAttribute("id"); g.style.opacity = 0; g.style.zIndex = (parseInt(el.style.zIndex || 0, 10) || 0) - 1 - i; el.parentNode.insertBefore(g, el); ghosts.push(g); }
    tl.fromTo(el, { x: dx, y: dy, opacity: 0, scale: opts.scale0 || 1 }, { x: 0, y: 0, opacity: 1, scale: 1, duration: opts.dur || .22, ease: opts.ease || "expo.out" }, t);
    ghosts.forEach(function (g, i) {
      var f = (i + 1) / (n + 1);
      tl.fromTo(g, { x: dx, y: dy, opacity: .55 - i * .12, scale: opts.scale0 || 1 }, { x: dx * f * .6, y: dy * f * .6, opacity: 0, duration: fr3, ease: "none" }, t + .02 * i);
      tl.set(g, { opacity: 0 }, t + fr3 + .04);
    });
    return ghosts;
  };
  /* 6 px camera shake for 4 frames, seeded */
  V.shake = function (tl, el, t, amp, seed) {
    var r = rngOf(seed || "shake"); amp = amp || 6;
    for (var i = 0; i < 4; i++) tl.set(el, { x: (r() - .5) * 2 * amp * (1 - i / 5), y: (r() - .5) * 2 * amp * (1 - i / 5) }, t + i / 30);
    tl.set(el, { x: 0, y: 0 }, t + 4 / 30);
  };
  /* slow push-in 1.0 -> 1.08 over the scene */
  V.push = function (tl, el, dur, s1, ox, oy) { tl.fromTo(el, { scale: 1, transformOrigin: (ox || 540) + "px " + (oy || 900) + "px" }, { scale: s1 || 1.08, duration: dur, ease: "none" }, 0); };

  /* ---------- paper noise: computed once (seeded value noise) and reused as an image ---------- */
  V.noiseTile = function (seed, size, alpha, dark) {
    var c = document.createElement("canvas"); c.width = c.height = size; var g = c.getContext("2d"), im = g.createImageData(size, size), r = rngOf("noise" + seed);
    for (var i = 0; i < size * size; i++) { var v = (r() + r() + r()) / 3, a = Math.abs(v - .5) * 2 * alpha * 255; im.data[i * 4] = dark ? 0 : 255; im.data[i * 4 + 1] = dark ? 0 : 255; im.data[i * 4 + 2] = dark ? 0 : 255; im.data[i * 4 + 3] = a; }
    g.putImageData(im, 0, 0); return c.toDataURL("image/png");
  };
  V.paper = function (parent, bg, seed, strength) {
    var d = V.div("position:absolute;left:0;top:0;width:1080px;height:1920px;background:" + bg, parent, "bgpaper");
    var n = V.div("position:absolute;left:0;top:0;width:1080px;height:1920px;background-image:url(" + V.noiseTile(seed || 1, 256, strength == null ? .09 : strength, bg === V.C.k ? false : true) + ");background-size:256px 256px;opacity:1", d);
    return d;
  };

  /* ---------- halftone: luminance from code-drawn geometry -> rotated dot grid, drawn once ---------- */
  /* draw(g,w,h): paints grayscale (white background = no dot, dark = big dot) */
  V.halftone = function (w, h, draw, o) {
    o = o || {}; var cell = o.cell || 12, ang = (o.angle == null ? 45 : o.angle) * Math.PI / 180, col = o.color || V.C.k, S = 2;
    var src = document.createElement("canvas"); src.width = w; src.height = h; var sg = src.getContext("2d"); sg.fillStyle = "#fff"; sg.fillRect(0, 0, w, h); draw(sg, w, h);
    var data = sg.getImageData(0, 0, w, h).data;
    var out = document.createElement("canvas"); out.width = w * S; out.height = h * S; var g = out.getContext("2d"); g.scale(S, S); g.fillStyle = col;
    var diag = Math.hypot(w, h), ca = Math.cos(ang), sa = Math.sin(ang);
    for (var u = -diag; u < diag; u += cell) for (var v = -diag; v < diag; v += cell) {
      var x = w / 2 + u * ca - v * sa, y = h / 2 + u * sa + v * ca;
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      var i = ((y | 0) * w + (x | 0)) * 4, lum = (data[i] * .3 + data[i + 1] * .59 + data[i + 2] * .11) / 255, a = data[i + 3] / 255;
      var d = (1 - lum) * cell * .78;
      if (data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255) continue;
      if (d > .4) { g.beginPath(); g.arc(x, y, d / 2 + .25, 0, 6.2832); g.fill(); }
    }
    out.style.cssText = "display:block;width:" + w + "px;height:" + h + "px";
    return out;
  };
  /* cut-out sticker: halftone art + thin offset white outline + hard offset shadow, 1-2 deg rotation */
  V.cutout = function (parent, o) {
    var w = o.w, h = o.h, wrap = V.div("position:absolute;left:" + o.x + "px;top:" + o.y + "px;width:" + w + "px;height:" + h + "px;", parent);
    var art = V.halftone(w, h, o.draw, { cell: o.cell, color: o.color || V.C.k, angle: o.angle });
    var plate = document.createElement("canvas"); plate.width = w; plate.height = h; var pg = plate.getContext("2d");
    // silhouette = all non-white pixels of the art
    var tmp = document.createElement("canvas"); tmp.width = w; tmp.height = h; var tg = tmp.getContext("2d"); tg.fillStyle = "#fff"; tg.fillRect(0, 0, w, h); o.draw(tg, w, h);
    var td = tg.getImageData(0, 0, w, h), sil = pg.createImageData(w, h);
    for (var i = 0; i < w * h; i++) { var on = !(td.data[i * 4] === 255 && td.data[i * 4 + 1] === 255 && td.data[i * 4 + 2] === 255); sil.data[i * 4] = o.fill ? parseInt(o.fill.slice(1, 3), 16) : 244; sil.data[i * 4 + 1] = o.fill ? parseInt(o.fill.slice(3, 5), 16) : 241; sil.data[i * 4 + 2] = o.fill ? parseInt(o.fill.slice(5, 7), 16) : 234; sil.data[i * 4 + 3] = on ? 255 : 0; }
    pg.putImageData(sil, 0, 0);
    // dilate for the white outline: draw silhouette offset in a ring
    var ol = document.createElement("canvas"); ol.width = w + 24; ol.height = h + 24; var og = ol.getContext("2d");
    for (var a = 0; a < 16; a++) og.drawImage(plate, 12 + Math.cos(a / 16 * 6.2832) * 7, 12 + Math.sin(a / 16 * 6.2832) * 7);
    og.globalCompositeOperation = "source-in"; og.fillStyle = "#f4f1ea"; og.fillRect(0, 0, w + 24, h + 24);
    var sh = document.createElement("canvas"); sh.width = w + 24; sh.height = h + 24; var shg = sh.getContext("2d"); shg.drawImage(ol, 0, 0); shg.globalCompositeOperation = "source-in"; shg.fillStyle = V.C.k; shg.fillRect(0, 0, w + 24, h + 24);
    [sh, ol].forEach(function (c, k) { c.style.cssText = "position:absolute;left:" + (-12 + (k ? 0 : o.sx || 9)) + "px;top:" + (-12 + (k ? 0 : o.sy || 9)) + "px;width:" + (w + 24) + "px;height:" + (h + 24) + "px"; wrap.appendChild(c); });
    plate.style.cssText = "position:absolute;left:0;top:0;width:" + w + "px;height:" + h + "px"; wrap.appendChild(plate);
    art.style.cssText += ";position:absolute;left:0;top:0"; wrap.appendChild(art);
    return wrap;
  };

  /* ---------- text + layout helpers ---------- */
  V.text = function (parent, txt, o) {
    var d = V.div("position:absolute;left:" + (o.x == null ? 0 : o.x) + "px;top:" + o.y + "px;width:" + (o.w || 1080) + "px;text-align:" + (o.align || "center") + ";font:" + (o.weight || 400) + " " + o.size + "px/" + (o.lh || 1) + " " + (o.font || "Anton") + ",sans-serif;color:" + (o.color || V.C.w) + ";white-space:nowrap;" + (o.css || ""), parent);
    d.textContent = txt; if (o.id) d.id = o.id; return d;
  };
  var mc = document.createElement("canvas").getContext("2d");
  V.tw = function (txt, size, font, weight) { mc.font = (weight || 400) + " " + size + "px " + (font || "Anton"); return mc.measureText(txt).width; };
  V.bg = function (parent, color, seed) { return V.paper(parent, color, seed || 3, color === V.C.k ? .06 : .07); };

  /* ---------- the spine: a timeline that is nearly flat until 2009, then climbs ---------- */
  V.spine = function (parent, o) {
    var Y0 = 1958, Y1 = 2020, x0 = o.x0, x1 = o.x1, base = o.baseY, top = o.topY, H = base - top;
    var xOf = function (y) { return x0 + (y - Y0) / (Y1 - Y0) * (x1 - x0); };
    var rise = function (y) { return y <= 2009 ? H * .035 * (y - Y0) / (2009 - Y0) : H * (.035 + .965 * Math.pow((y - 2009) / (Y1 - 2009), 2.3)); };
    var yOf = function (y) { return base - rise(y); };
    var svg = V.svg("svg", { width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: "position:absolute;left:0;top:0;overflow:visible" }, parent);
    var d = ""; for (var y = Y0; y <= Y1 + .01; y += .5) d += (y === Y0 ? "M" : " L") + xOf(y).toFixed(1) + " " + yOf(y).toFixed(1);
    var ticks = V.svg("g", {}, svg);
    if (o.ticks !== false) for (var t = Y0; t <= Y1; t++) { var tx = xOf(t); V.svg("path", { d: "M" + tx + " " + (base + 10) + " l0 " + (t % 10 === 8 || t % 5 === 0 ? 22 : 12), stroke: o.tickColor || o.color, "stroke-opacity": .6, "stroke-width": o.tickW || 3 }, ticks); }
    var path = V.svg("path", { d: d, stroke: o.color, "stroke-width": o.w || 8, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, svg);
    var L = path.getTotalLength(); path.setAttribute("stroke-dasharray", L); path.setAttribute("stroke-dashoffset", L);
    var pins = V.svg("g", {}, svg);
    var S = { svg: svg, path: path, len: L, xOf: xOf, yOf: yOf, ticks: ticks, pins: pins, base: base };
    S.reveal = function (tl, t, dur, p0, p1, ease) { tl.fromTo(path, { attr: { "stroke-dashoffset": L * (1 - (p0 || 0)) } }, { attr: { "stroke-dashoffset": L * (1 - (p1 == null ? 1 : p1)) }, duration: dur, ease: ease || "none" }, t); };
    S.lenAt = function (yr) { return Math.min(1, Math.max(0, (yr - Y0) / (Y1 - Y0))); };
    S.pin = function (year, label, color, o2) {
      o2 = o2 || {}; var px = xOf(year), py = yOf(year), g = V.svg("g", { opacity: 0 }, pins), up = o2.up == null ? 60 : o2.up;
      V.svg("path", { d: "M" + px + " " + py + " L" + px + " " + (py - up), stroke: color, "stroke-width": 4 }, g);
      V.svg("circle", { cx: px, cy: py, r: 11, fill: color, stroke: V.C.k, "stroke-width": 3 }, g);
      var w = (o2.w || V.tw(label, 38, "Anton") + 30), bx = Math.max(60, Math.min(1020 - w, px - w / 2));
      V.svg("rect", { x: bx, y: py - up - 52, width: w, height: 52, fill: color }, g);
      var tx = V.svg("text", { x: bx + w / 2, y: py - up - 14, "text-anchor": "middle", "font-family": "Anton", "font-size": 38, fill: o2.ink || V.C.k }, g); tx.textContent = label;
      return g;
    };
    return S;
  };

  /* ---------- code-drawn art for the halftone cut-outs (grayscale: dark = big dot) ---------- */
  var ball = function (g, x, y, rx, ry, lo, hi) { var gr = g.createRadialGradient(x - rx * .3, y - ry * .35, rx * .08, x, y, Math.max(rx, ry) * 1.05); gr.addColorStop(0, "hsl(0,0%," + hi + "%)"); gr.addColorStop(1, "hsl(0,0%," + lo + "%)"); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 6.2832); g.fill(); };
  var box = function (g, x, y, w, h, r, lo, hi, vert) { var gr = vert ? g.createLinearGradient(x, y, x, y + h) : g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, "hsl(0,0%," + hi + "%)"); gr.addColorStop(1, "hsl(0,0%," + lo + "%)"); g.fillStyle = gr; g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); g.fill(); };
  var poly = function (g, pts, lo, hi) { var gr = g.createLinearGradient(pts[0][0], pts[0][1], pts[2][0], pts[2][1]); gr.addColorStop(0, "hsl(0,0%," + hi + "%)"); gr.addColorStop(1, "hsl(0,0%," + lo + "%)"); g.fillStyle = gr; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach(function (p) { g.lineTo(p[0], p[1]); }); g.closePath(); g.fill(); };
  V.art = {
    cat: function (g, w, h) { poly(g, [[w * .2, h * .42], [w * .2, h * .08], [w * .42, h * .28]], 30, 55); poly(g, [[w * .8, h * .42], [w * .8, h * .08], [w * .58, h * .28]], 30, 55); ball(g, w * .5, h * .78, w * .34, h * .22, 25, 60); ball(g, w * .5, h * .46, w * .31, h * .3, 22, 62); g.fillStyle = "#f4f4f4"; g.beginPath(); g.ellipse(w * .39, h * .44, w * .05, h * .04, 0, 0, 6.28); g.ellipse(w * .61, h * .44, w * .05, h * .04, 0, 0, 6.28); g.fill(); g.fillStyle = "#222"; g.beginPath(); g.arc(w * .39, h * .44, w * .02, 0, 6.28); g.arc(w * .61, h * .44, w * .02, 0, 6.28); g.fill(); },
    car: function (g, w, h) { box(g, w * .08, h * .5, w * .84, h * .26, h * .08, 22, 55); poly(g, [[w * .24, h * .5], [w * .34, h * .28], [w * .66, h * .28], [w * .78, h * .5]], 28, 62); poly(g, [[w * .3, h * .48], [w * .37, h * .33], [w * .48, h * .33], [w * .48, h * .48]], 80, 95); poly(g, [[w * .52, h * .48], [w * .52, h * .33], [w * .63, h * .33], [w * .72, h * .48]], 80, 95); ball(g, w * .27, h * .76, h * .12, h * .12, 8, 38); ball(g, w * .73, h * .76, h * .12, h * .12, 8, 38); },
    cup: function (g, w, h) { g.strokeStyle = "#444"; g.lineWidth = w * .07; g.beginPath(); g.arc(w * .8, h * .5, w * .13, -1.2, 1.4); g.stroke(); poly(g, [[w * .18, h * .22], [w * .82, h * .22], [w * .72, h * .82], [w * .28, h * .82]], 20, 70); ball(g, w * .5, h * .22, w * .32, h * .06, 35, 75); },
    plane: function (g, w, h) { poly(g, [[w * .08, h * .5], [w * .3, h * .45], [w * .55, h * .08], [w * .65, h * .1], [w * .52, h * .46]], 30, 70); poly(g, [[w * .08, h * .56], [w * .3, h * .6], [w * .55, h * .92], [w * .65, h * .9], [w * .52, h * .56]], 40, 80); ball(g, w * .5, h * .5, w * .42, h * .07, 22, 62); poly(g, [[w * .12, h * .46], [w * .06, h * .22], [w * .2, h * .22], [w * .26, h * .46]], 25, 55); },
    chip: function (g, w, h) { var pins = 9, i; g.fillStyle = "#5a5a5a"; for (i = 0; i < pins; i++) { var p = w * .16 + i * (w * .68 / (pins - 1)); g.fillRect(p - w * .014, h * .04, w * .028, h * .14); g.fillRect(p - w * .014, h * .82, w * .028, h * .14); g.fillRect(w * .04, p - h * .014, w * .14, h * .028); g.fillRect(w * .82, p - h * .014, w * .14, h * .028); } box(g, w * .16, h * .16, w * .68, h * .68, w * .04, 18, 55); box(g, w * .26, h * .26, w * .48, h * .48, w * .02, 70, 92); for (i = 0; i < 4; i++) for (var j = 0; j < 4; j++) box(g, w * .29 + i * w * .115, h * .29 + j * h * .115, w * .095, h * .095, 3, 30 + ((i + j) % 2) * 25, 55 + ((i + j) % 2) * 20); },
    trophy: function (g, w, h) { g.strokeStyle = "#555"; g.lineWidth = w * .06; g.beginPath(); g.arc(w * .2, h * .3, w * .12, 1.6, 4.7); g.stroke(); g.beginPath(); g.arc(w * .8, h * .3, w * .12, -1.6, 1.5); g.stroke(); poly(g, [[w * .24, h * .1], [w * .76, h * .1], [w * .66, h * .55], [w * .34, h * .55]], 25, 78); box(g, w * .44, h * .55, w * .12, h * .22, 2, 25, 60); box(g, w * .28, h * .77, w * .44, h * .14, 6, 18, 55); },
    neuron: function (g, w, h) { var P = [[.15, .22], [.15, .5], [.15, .78], [.5, .12], [.5, .38], [.5, .62], [.5, .88], [.86, .35], [.86, .65]], Ls = [[0, 3], [0, 4], [0, 5], [1, 3], [1, 4], [1, 5], [1, 6], [2, 4], [2, 5], [2, 6], [3, 7], [4, 7], [4, 8], [5, 7], [5, 8], [6, 8]]; g.strokeStyle = "#666"; g.lineWidth = w * .016; Ls.forEach(function (l) { g.beginPath(); g.moveTo(P[l[0]][0] * w, P[l[0]][1] * h); g.lineTo(P[l[1]][0] * w, P[l[1]][1] * h); g.stroke(); }); P.forEach(function (p) { ball(g, p[0] * w, p[1] * h, w * .075, w * .075, 15, 60); }); },
    block: function (g, w, h) { box(g, 0, h * .12, w, h * .76, h * .12, 20, 62); box(g, w * .06, h * .22, w * .88, h * .12, 3, 55, 80); box(g, w * .06, h * .5, w * .88, h * .12, 3, 55, 80); },
    brain: function (g, w, h) { ball(g, w * .5, h * .5, w * .42, h * .38, 25, 68); ball(g, w * .32, h * .42, w * .16, h * .16, 40, 78); ball(g, w * .62, h * .4, w * .17, h * .15, 40, 78); ball(g, w * .5, h * .66, w * .2, h * .12, 40, 78); }
  };

  /* ---------- beat groups, flashes, count-ups ---------- */
  V.fit = function (txt, maxW, font, max, weight) { var s = max; while (s > 20 && V.tw(txt, s, font, weight) > maxW) s -= 4; return s; };
  /* a full-frame beat: flat colour + paper noise, hard cut in at t0 and out at t1 */
  V.beat = function (cam, tl, t0, t1, color, seed, dy) {
    var g = V.div("position:absolute;left:0;top:0;width:1080px;height:1920px;visibility:hidden;overflow:hidden", cam);
    V.bg(g, color, seed);
    tl.set(g, { visibility: "visible" }, t0); if (t1 != null) tl.set(g, { visibility: "hidden" }, t1 - .001);
    var inner = V.div("position:absolute;left:0;top:" + (dy || 0) + "px;width:1080px;height:1920px", g); inner.__g = g; return inner;
  };
  V.flash = function (tl, parent, t, color) {
    var f = V.div("position:absolute;left:0;top:0;width:1080px;height:1920px;background:" + (color || "#f4f1ea") + ";opacity:0;z-index:99", parent.__g || parent);
    tl.set(f, { opacity: .85 }, t).set(f, { opacity: .35 }, t + 1 / 30).set(f, { opacity: 0 }, t + 3 / 30); return f;
  };
  V.count = function (tl, el, t, dur, from, to, fmt, ease) {
    var o = { v: from }; fmt = fmt || function (v) { return String(Math.round(v)); };
    el.textContent = fmt(from);
    tl.to(o, { v: to, duration: dur, ease: ease || "power3.out", onUpdate: function () { el.textContent = fmt(o.v); } }, t);
  };
  /* hard-offset block shadow for type: duplicate behind */
  V.shadowText = function (parent, txt, o, sc, dx, dy) {
    var b = V.text(parent, txt, Object.assign({}, o, { color: sc || V.C.k })); b.style.left = (o.x || 0) + dx + "px"; b.style.top = (o.y + dy) + "px";
    var f = V.text(parent, txt, o); return { f: f, b: b };
  };
  /* pop-in for cut-outs and slabs: slams from big, tiny settle */
  V.slamIn = function (tl, el, t, rot, from) {
    var d = .15, s = Math.max(.02, t - d);
    tl.set(el, { opacity: 0 }, 0).set(el, { opacity: 1 }, s);
    tl.fromTo(el, { scale: from || 1.7, rotation: (rot || 0) * 3 }, { scale: 1, rotation: rot || 0, duration: Math.max(.05, t - s), ease: "power3.in" }, s);
    tl.to(el, { scale: 1.035, duration: .05, ease: "power1.out" }, t).to(el, { scale: 1, duration: .09, ease: "power1.in" }, t + .05);
  };
  V.hide = function (tl, el, t) { tl.set(el, { opacity: 0 }, 0).set(el, { opacity: 1 }, t); };
})();
