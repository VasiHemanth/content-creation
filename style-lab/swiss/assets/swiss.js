/* swiss.js - the grid, type and drawing helpers. 12 columns, 24 px gutters, 20 px baseline unit.
   Everything is a pure function of (constants, time). No random except a seeded target index. */
(function () {
  var W = window;
  W.mulberry32 = function (a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  var G = W.G = { W: 1080, H: 1920, M: 60, COL: 58, GUT: 24, PITCH: 82, BASE: 20 };
  G.x = function (i) { return G.M + G.PITCH * i; };               // left edge of column i (0..11)
  G.span = function (n) { return G.PITCH * n - G.GUT; };          // width of n columns
  G.C = { bg: "#f2efe8", k: "#111111", r: "#e30613", b: "#0050a0", y: "#ffd100" };
  G.FONT = "Inter Tight";
  G.fontsReady = function () { return Promise.all(["500 40px 'Inter Tight'", "800 40px 'Inter Tight'"].map(function (f) { return document.fonts.load(f, "0123456789Aa"); })).then(function () { return document.fonts.ready; }); };
  var mc = document.createElement("canvas").getContext("2d");
  /* width of text at a size; tracking in px per character */
  G.tw = function (txt, size, weight, track) { mc.font = weight + " " + size + "px '" + G.FONT + "'"; return mc.measureText(txt).width + (track || 0) * txt.length; };
  /* the size at which txt is exactly w px wide */
  G.fit = function (txt, w, weight) { var s = 100, k = G.tw(txt, s, weight, 0); return s * w / k; };
  G.ready = function (key, setup) { W.__hf = W.__hf || {}; W.__hf.buildReady = W.__hf.buildReady || {}; W.__hf.buildReady[key] = Promise.resolve().then(setup); };
  G.svg = function (tag, attrs, parent) { var e = document.createElementNS("http://www.w3.org/2000/svg", tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  G.root = function (el) { var s = G.svg("svg", { width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: "position:absolute;left:0;top:0;overflow:visible" }); el.appendChild(s); return s; };
  G.bgRect = function (parent, color) { return G.svg("rect", { x: -10, y: -10, width: 1100, height: 1940, fill: color || G.C.bg }, parent); };
  /* text with an exact baseline y and flush-left x. weight 500 | 800 only. caps labels get tracking. */
  G.text = function (parent, str, o) {
    var xx = o.x;
    if (!o.anchor || o.anchor === "start") { mc.font = (o.weight || 800) + " " + o.size + "px '" + G.FONT + "'"; xx = o.x + mc.measureText(str).actualBoundingBoxLeft; }   // optical: the ink, not the advance box, sits on the grid line
    var t = G.svg("text", { x: xx, y: o.y, "font-family": "'" + G.FONT + "', sans-serif", "font-weight": o.weight || 800, "font-size": o.size, fill: o.fill || G.C.k, "text-anchor": o.anchor || "start", "letter-spacing": o.track || 0, "style": "font-kerning:normal" }, parent);
    t.setAttribute("data-gx", o.x); t.textContent = str; return t;
  };
  G.label = function (parent, str, x, y, fill, size) { return G.text(parent, str.toUpperCase(), { x: x, y: y, size: size || 24, weight: 500, track: 3, fill: fill || G.C.k }); };
  G.rect = function (parent, x, y, w, h, fill) { return G.svg("rect", { x: x, y: y, width: w, height: h, fill: fill }, parent); };
  G.fmt = function (n) { return Math.round(n).toLocaleString("en-US"); };
  /* grid lines (flash on, then off) */
  G.gridLines = function (parent) {
    var g = G.svg("g", { opacity: 0 }, parent), i;
    for (i = 0; i < 12; i++) { G.rect(g, G.x(i), 0, 1, 1920, G.C.k); G.rect(g, G.x(i) + G.COL - 1, 0, 1, 1920, G.C.k); }
    for (i = 0; i <= 96; i++) G.rect(g, 0, i * 20, 1080, 1, G.C.k);
    return g;
  };
  G.flash = function (tl, g, t, d) { tl.set(g, { opacity: .16 }, t).set(g, { opacity: 0 }, t + (d || .2)); };
  /* the 1,000-square field: 40 x 25, pitch 24, square 16, at (60, y0) */
  G.field = function (parent, y0) {
    var cv = document.createElement("canvas"); cv.width = 960; cv.height = 600; cv.style.cssText = "position:absolute;left:60px;top:" + y0 + "px;width:960px;height:600px";
    parent.appendChild(cv); var g = cv.getContext("2d");
    return { cv: cv, y0: y0, draw: function (colorOf) { g.clearRect(0, 0, 960, 600); for (var i = 0; i < 1000; i++) { var c = colorOf(i); if (!c) continue; g.fillStyle = c; g.fillRect((i % 40) * 24, Math.floor(i / 40) * 24, 16, 16); } } };
  };
  G.TARGET = 874;                      // the name we are looking for: row 21, column 34
  G.mono = function (p) { return p; };
})();

(function(){
  var G=window.G;
  /* bars: n regions of width `pitch` starting at x0; each bar is 2/3 of its region, centred, so the region boundary is the middle of the gap */
  G.bars = function (parent, n, pitch, x0, y, h, target, colorBar, colorTarget) {
    var gp = G.svg("g", {}, parent), out = [], bw = pitch * 2 / 3, off = pitch / 6;
    for (var k = 0; k < n; k++) out.push(G.rect(gp, x0 + k * pitch + off, y, bw, h, k === target ? colorTarget : colorBar));
    return { g: gp, bars: out };
  };
  G.circle = function (parent, cx, cy, r, fill) { return G.svg("circle", { cx: cx, cy: cy, r: r, fill: fill }, parent); };
})();
