/* press.js - the broadsheet engine: seeded paper, ink bleed, 45-degree halftone art, page shells, type helpers.
   Everything is a pure function of (seed, time). */
(function () {
  var W = window;
  W.mulberry32 = function (a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  W.seedOf = function (s) { var h = 1779033703 ^ s.length; for (var i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^ (h >>> 16)) >>> 0; };
  W.rngOf = function (s) { return W.mulberry32(W.seedOf(s)); };
  W.hash01 = function (n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  var P = W.Press = {};
  P.C = { paper: "#e9e2cf", ink: "#1b1a17", red: "#c1272d", desk: "#12110e" };
  P.PW = 1500; P.PH = 2100;
  P.div = function (css, parent, cls) { var e = document.createElement("div"); e.style.cssText = css; if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; };
  P.svg = function (tag, attrs, parent) { var e = document.createElementNS("http://www.w3.org/2000/svg", tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  P.ready = function (key, setup) { W.__hf = W.__hf || {}; W.__hf.buildReady = W.__hf.buildReady || {}; W.__hf.buildReady[key] = Promise.resolve().then(setup); };
  P.fontsReady = function () {
    var f = ["400 20px 'Libre Caslon Text'", "italic 400 20px 'Libre Caslon Text'", "700 20px 'Libre Caslon Text'", "900 100px 'Playfair Display'", "700 100px 'Playfair Display'", "700 100px UnifrakturCook", "400 40px 'Special Elite'", "400 40px 'Alfa Slab One'"];
    return Promise.all(f.map(function (x) { return document.fonts.load(x, "AaEx"); })).then(function () { return document.fonts.ready; });
  };

  /* ---------- easing: mechanical press, hard hits ---------- */
  P.E = {
    hit: function (p) { return 1 - Math.pow(1 - p, 4); },
    slam: function (p) { return p >= 1 ? 1 : 1 - Math.exp(-8 * p) * Math.cos(2 * Math.PI * 1.15 * p); },
    inout: function (p) { return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; },
    steps: function (n) { return function (p) { return Math.floor(p * n) / n; }; }
  };

  /* ---------- soft-hyphen hyphenation (Chrome headless has no dictionary) ---------- */
  var V = "aeiouy";
  P.hyph = function (txt) {
    return txt.replace(/[A-Za-z]{7,}/g, function (w) {
      var out = "", n = w.length;
      for (var i = 0; i < n; i++) {
        out += w[i];
        if (i >= 2 && i < n - 3) {
          var a = w[i].toLowerCase(), b = w[i + 1].toLowerCase(), c = (w[i + 2] || "").toLowerCase();
          var av = V.indexOf(a) >= 0, bv = V.indexOf(b) >= 0, cv = V.indexOf(c) >= 0;
          if (av && !bv && cv) out += "­";                        // VC|V -> V|CV handled below by shifting
          else if (!av && !bv && (V.indexOf(w[i - 1].toLowerCase()) >= 0) && cv) out += "­";   // VC|CV
        }
      }
      return out;
    });
  };

  P.hyphHTML = function (html) { return html.split(/(<[^>]+>)/).map(function (seg) { return seg[0] === "<" ? seg : P.hyph(seg); }).join(""); };
  /* ---------- paper: seeded newsprint, baked once into a data URL ---------- */
  P.paperTex = function (w, h, seed, flat) {
    W.__pt = W.__pt || {}; var key = w + "x" + h + ":" + seed + (flat ? "f" : ""); if (W.__pt[key]) return W.__pt[key];
    var c = document.createElement("canvas"); c.width = w; c.height = h; var g = c.getContext("2d"), r = rngOf("paper" + seed);
    var im = g.createImageData(w, h), d = im.data, i, j;
    function mk(bw) { var bh = Math.ceil(h / (w / bw)) + 2, gr = []; for (j = 0; j <= bh; j++) { gr[j] = []; for (i = 0; i <= bw; i++) gr[j][i] = r(); } return { g: gr, s: bw / w }; }
    function samp(o, x, y) { var fx = x * o.s, fy = y * o.s, ix = fx | 0, iy = fy | 0, tx = fx - ix, ty = fy - iy; tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty); return (o.g[iy][ix] * (1 - tx) + o.g[iy][ix + 1] * tx) * (1 - ty) + (o.g[iy + 1][ix] * (1 - tx) + o.g[iy + 1][ix + 1] * tx) * ty; }
    var o1 = mk(7), o2 = mk(19), o3 = mk(47);
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var v = samp(o1, x, y) * .5 + samp(o2, x, y) * .32 + samp(o3, x, y) * .18;
      var n = (r() - .5) * 8 + (v - .5) * 13;
      var ed = Math.min(x, y, w - x, h - y), wob = (Math.sin(x * .011 + seed) + Math.sin(y * .017 + seed * 2)) * 6;
      var yel = Math.exp(-(ed + wob) / (w * (flat ? .012 : .035))) * (.55 + v * .6) * (flat ? .35 : 1);
      var k = (y * w + x) * 4;
      d[k] = 233 + n - yel * 36; d[k + 1] = 226 + n - yel * 52; d[k + 2] = 207 + n - yel * 82; d[k + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    g.lineCap = "round";
    for (i = 0; i < w * h / 2600; i++) { var px = r() * w, py = r() * h, L = 14 + r() * 40, a = r() * 6.28; g.strokeStyle = r() < .6 ? "rgba(120,100,60,.07)" : "rgba(255,250,235,.10)"; g.lineWidth = .6; g.beginPath(); g.moveTo(px, py); g.quadraticCurveTo(px + Math.cos(a) * L * .6 + (r() - .5) * 8, py + Math.sin(a) * L * .6 + (r() - .5) * 8, px + Math.cos(a) * L, py + Math.sin(a) * L); g.stroke(); }
    for (i = 0; i < w * h / 9000; i++) { g.fillStyle = "rgba(27,26,23," + (.25 + r() * .5) + ")"; g.beginPath(); g.arc(r() * w, r() * h, .5 + r() * 1.3, 0, 6.28); g.fill(); }
    // folds: a vertical and a horizontal crease, light band + dark band + hairline, slightly wobbly
    function crease(vert) {
      var len = vert ? h : w, pos = vert ? w / 2 : h / 2;
      for (var s = 0; s < len; s += 3) {
        var o = Math.sin(s * .02 + seed) * 1.6, p = pos + o;
        var gr = vert ? g.createLinearGradient(p - 26, 0, p + 26, 0) : g.createLinearGradient(0, p - 26, 0, p + 26);
        gr.addColorStop(0, "rgba(255,250,235,0)"); gr.addColorStop(.42, "rgba(255,250,235,.22)"); gr.addColorStop(.5, "rgba(60,48,28,.30)"); gr.addColorStop(.58, "rgba(60,48,28,.10)"); gr.addColorStop(1, "rgba(60,48,28,0)");
        g.fillStyle = gr; if (vert) g.fillRect(p - 26, s, 52, 3); else g.fillRect(s, p - 26, 3, 52);
      }
    }
    if (!flat) { crease(true); crease(false); }
    return (W.__pt[key] = c.toDataURL("image/png"));
  };

  /* ---------- ink: letterpress bleed (dilate 0.3 px + blur), uneven density, broken letters ---------- */
  P.inkDefs = function (parent) {
    var s = P.svg("svg", { width: 0, height: 0, style: "position:absolute" }, parent);
    s.innerHTML = '<defs>' +
      '<filter id="ink" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">' +
      '<feMorphology in="SourceGraphic" operator="dilate" radius="0.3" result="d"/><feGaussianBlur in="d" stdDeviation="0.38" result="b"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="rn"/><feDisplacementMap in="b" in2="rn" scale="1.2" xChannelSelector="R" yChannelSelector="G" result="rough"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="9" result="dn"/><feColorMatrix in="dn" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 .55" result="dens"/>' +
      '<feComposite in="rough" in2="dens" operator="in" result="dd"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="21" result="sp"/><feColorMatrix in="sp" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -9 6.15" result="voids"/>' +
      '<feComposite in="dd" in2="voids" operator="in" result="out"/><feMerge><feMergeNode in="rough"/><feMergeNode in="out"/></feMerge></filter>' +
      '<filter id="stamp" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="5" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="3.5" xChannelSelector="R" yChannelSelector="G" result="r"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="13" result="sp"/><feColorMatrix in="sp" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -7 4.6" result="v"/><feComposite in="r" in2="v" operator="in"/></filter></defs>';
    return s;
  };

  /* ---------- halftone: 45 degree dot screen from code-drawn grayscale art ---------- */
  /* returns list of dots {x,y,r}; draw(g,w,h) paints grayscale on white */
  P.dots = function (w, h, draw, o) {
    o = o || {}; var cell = o.cell || 10, ang = (o.angle == null ? 45 : o.angle) * Math.PI / 180, out = [];
    var src = document.createElement("canvas"); src.width = w; src.height = h; var sg = src.getContext("2d"); sg.fillStyle = "#fff"; sg.fillRect(0, 0, w, h); draw(sg, w, h);
    var data = sg.getImageData(0, 0, w, h).data, diag = Math.hypot(w, h), ca = Math.cos(ang), sa = Math.sin(ang);
    for (var u = -diag; u < diag; u += cell) for (var v = -diag; v < diag; v += cell) {
      var x = w / 2 + u * ca - v * sa, y = h / 2 + u * sa + v * ca;
      if (x < 0 || y < 0 || x >= w || y >= h) continue;
      var i = ((y | 0) * w + (x | 0)) * 4;
      if (data[i] === 255 && data[i + 1] === 255 && data[i + 2] === 255) continue;
      var lum = (data[i] * .3 + data[i + 1] * .59 + data[i + 2] * .11) / 255, rad = (1 - lum) * cell * .62;
      if (rad > .35) out.push({ x: x, y: y, r: rad });
    }
    return out;
  };
  P.dotCanvas = function (w, h, dots, color) {
    var S = 2, c = document.createElement("canvas"); c.width = w * S; c.height = h * S; var g = c.getContext("2d"); g.scale(S, S); g.fillStyle = color || P.C.ink;
    dots.forEach(function (d) { g.beginPath(); g.arc(d.x, d.y, d.r, 0, 6.2832); g.fill(); });
    c.style.cssText = "display:block;width:" + w + "px;height:" + h + "px"; return c;
  };
  P.halftone = function (w, h, draw, o) { return P.dotCanvas(w, h, P.dots(w, h, draw, o), o && o.color); };

  /* ---------- code-drawn art (grayscale, dark = bigger dot) ---------- */
  var ball = function (g, x, y, rx, ry, lo, hi) { var gr = g.createRadialGradient(x - rx * .3, y - ry * .35, rx * .08, x, y, Math.max(rx, ry) * 1.05); gr.addColorStop(0, "hsl(0,0%," + hi + "%)"); gr.addColorStop(1, "hsl(0,0%," + lo + "%)"); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 6.2832); g.fill(); };
  var rbox = function (g, x, y, w, h, r, lo, hi, vert) { var gr = vert ? g.createLinearGradient(x, y, x, y + h) : g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, "hsl(0,0%," + hi + "%)"); gr.addColorStop(1, "hsl(0,0%," + lo + "%)"); g.fillStyle = gr; g.beginPath(); if (g.roundRect) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h); g.fill(); };
  var poly = function (g, pts, lo, hi) { var gr = g.createLinearGradient(pts[0][0], pts[0][1], pts[2][0], pts[2][1]); gr.addColorStop(0, "hsl(0,0%," + hi + "%)"); gr.addColorStop(1, "hsl(0,0%," + lo + "%)"); g.fillStyle = gr; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach(function (p) { g.lineTo(p[0], p[1]); }); g.closePath(); g.fill(); };
  P.art = {
    robot: function (g, w, h) {
      g.strokeStyle = "#333"; g.lineWidth = w * .02; g.beginPath(); g.moveTo(w * .5, h * .12); g.lineTo(w * .5, h * .04); g.stroke(); ball(g, w * .5, h * .035, w * .035, w * .035, 10, 50);
      rbox(g, w * .1, h * .46, w * .08, h * .16, 6, 20, 60); rbox(g, w * .82, h * .46, w * .08, h * .16, 6, 20, 60);
      rbox(g, w * .16, h * .12, w * .68, h * .56, w * .07, 18, 62);
      rbox(g, w * .24, h * .22, w * .52, h * .26, w * .04, 6, 22);
      ball(g, w * .38, h * .35, w * .075, w * .075, 70, 100); ball(g, w * .62, h * .35, w * .075, w * .075, 70, 100);
      g.fillStyle = "#222"; for (var i = 0; i < 5; i++) g.fillRect(w * (.33 + i * .085), h * .54, w * .05, h * .09);
      rbox(g, w * .4, h * .68, w * .2, h * .08, 4, 25, 55); rbox(g, w * .22, h * .76, w * .56, h * .22, w * .05, 20, 58);
    },
    book: function (g, w, h) {
      rbox(g, w * .08, h * .04, w * .84, h * .88, w * .02, 16, 48);               // cover
      g.fillStyle = "#555"; g.fillRect(w * .08, h * .04, w * .09, h * .88);            // spine band
      rbox(g, w * .22, h * .1, w * .6, h * .5, 4, 70, 94);                           // blank cover plate
      g.fillStyle = "#1a1a1a"; g.font = "900 " + (h * .44) + "px 'Playfair Display', serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("?", w * .52, h * .36);
      g.fillStyle = "#777"; g.fillRect(w * .26, h * .68, w * .52, h * .03); g.fillRect(w * .3, h * .76, w * .44, h * .025);
      rbox(g, w * .04, h * .9, w * .88, h * .06, 2, 62, 88);                         // page edges
    },
    bubble: function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#d0d0d0"); gr.addColorStop(1, "#444"); g.fillStyle = gr;
      g.beginPath(); if (g.roundRect) g.roundRect(w * .04, h * .04, w * .92, h * .66, w * .12); else g.rect(w * .04, h * .04, w * .92, h * .66); g.fill();
      g.beginPath(); g.moveTo(w * .2, h * .66); g.lineTo(w * .12, h * .96); g.lineTo(w * .45, h * .68); g.closePath(); g.fill();
      g.fillStyle = "#fff"; for (var i = 0; i < 3; i++) { g.beginPath(); g.arc(w * (.3 + i * .2), h * .38, w * .05, 0, 6.28); g.fill(); }
    },
    magnifier: function (g, w, h) {
      g.strokeStyle = "#222"; g.lineWidth = w * .09; g.lineCap = "round"; g.beginPath(); g.arc(w * .4, h * .4, w * .3, 0, 6.28); g.stroke();
      var gr = g.createRadialGradient(w * .3, h * .3, w * .02, w * .4, h * .4, w * .28); gr.addColorStop(0, "#f4f4f4"); gr.addColorStop(1, "#bbb"); g.fillStyle = gr; g.beginPath(); g.arc(w * .4, h * .4, w * .27, 0, 6.28); g.fill();
      g.strokeStyle = "#2a2a2a"; g.lineWidth = w * .1; g.beginPath(); g.moveTo(w * .62, h * .62); g.lineTo(w * .92, h * .94); g.stroke();
    },
    hand: function (g, w, h) {     // manicule: a pointing hand with a cuff
      rbox(g, w * .02, h * .38, w * .2, h * .26, 6, 14, 40);                                  // cuff
      rbox(g, w * .22, h * .34, w * .38, h * .34, w * .08, 25, 78);                          // palm
      rbox(g, w * .56, h * .4, w * .42, h * .1, h * .05, 25, 85);                            // index finger
      [0, 1, 2].forEach(function (i) { rbox(g, w * (.3 + i * .09), h * (.25 - i * .005), w * .075, h * .16, w * .035, 30, 82); }); // folded fingers
      rbox(g, w * .24, h * .62, w * .26, h * .08, 8, 30, 74);                                // thumb
    },
    shelf: function (g, w, h) {
      var x = w * .02, i = 0, r = rngOf("shelf" + w);
      while (x < w * .97) { var bw = w * (.045 + r() * .04), bh = h * (.55 + r() * .4); rbox(g, x, h * .94 - bh, bw, bh, 3, 12 + r() * 30, 40 + r() * 40, true); g.fillStyle = "#e8e8e8"; g.fillRect(x + bw * .15, h * .94 - bh + bh * .18, bw * .7, bh * .04); x += bw + 2; i++; }
      rbox(g, 0, h * .94, w, h * .06, 2, 14, 38);
    }
  };

  /* ---------- page shell: desk, paper (baked), ink layer, masthead ---------- */
  P.shell = function (root, o) {
    o = o || {}; var PW = P.PW, PH = o.ph || P.PH;
    var bg = P.div("position:absolute;inset:0;background:" + P.C.desk, root);
    P.inkDefs(root);
    var cam = P.div("position:absolute;left:0;top:0;width:1080px;height:1920px;", root);
    var world = P.div("position:absolute;left:0;top:0;width:" + PW + "px;height:" + PH + "px;transform-origin:" + (PW / 2) + "px " + (PH / 2) + "px;", cam);
    var shadow = P.div("position:absolute;left:10px;top:14px;width:" + PW + "px;height:" + PH + "px;background:#000;opacity:.5;filter:blur(14px)", world);
    var page = P.div("position:absolute;left:0;top:0;width:" + PW + "px;height:" + PH + "px;overflow:hidden;background:" + P.C.paper, world);
    var tex = new Image(); tex.src = P.paperTex(750, Math.round(750 * PH / PW), o.seed || 3); tex.style.cssText = "position:absolute;left:0;top:0;width:" + PW + "px;height:" + PH + "px"; page.appendChild(tex);
    var ink = P.div("position:absolute;left:0;top:0;width:" + PW + "px;height:" + PH + "px;filter:url(#ink);color:" + P.C.ink, page, "ink");
    var over = P.div("position:absolute;left:0;top:0;width:" + PW + "px;height:" + PH + "px", page);   // unfiltered: halftones, red marks
    return { bg: bg, cam: cam, world: world, page: page, ink: ink, over: over, shadow: shadow, PW: PW, PH: PH, texReady: tex.decode ? tex.decode().catch(function () {}) : Promise.resolve() };
  };
  P.F = { body: "'Libre Caslon Text',serif", head: "'Playfair Display',serif", black: "UnifrakturCook,serif", slab: "'Alfa Slab One',serif", type: "'Special Elite',monospace" };
  /* text block helper: absolutely placed, font shorthand given */
  P.t = function (parent, txt, o) {
    var d = P.div("position:absolute;left:" + o.x + "px;top:" + o.y + "px;" + (o.w ? "width:" + o.w + "px;" : "") + "font:" + o.font + ";color:" + (o.color || P.C.ink) + ";text-align:" + (o.align || "left") + ";" + (o.css || ""), parent);
    if (o.html) d.innerHTML = txt; else d.textContent = txt; return d;
  };
  P.rule = function (parent, x, y, w, h, color) { return P.div("position:absolute;left:" + x + "px;top:" + y + "px;width:" + w + "px;height:" + h + "px;background:" + (color || P.C.ink), parent); };
  /* masthead: full or compact */
  P.masthead = function (sh, compact) {
    var ink = sh.ink, PW = sh.PW, y = compact ? 20 : 34, els = {};
    els.ears = [P.t(ink, "VOL. 1, NO. 1", { x: 50, y: y, font: "400 15px " + P.F.type, css: "letter-spacing:2px" }), P.t(ink, "ALL THE TOKENS THAT FIT TO PRINT", { x: 0, y: y, w: PW, align: "center", font: "400 15px " + P.F.type, css: "letter-spacing:3px" }), P.t(ink, "PRICE: ONE TOKEN", { x: 0, y: y, w: PW - 50, align: "right", font: "400 15px " + P.F.type, css: "letter-spacing:2px" })];
    els.title = P.t(ink, "The Daily Token", { x: 0, y: compact ? y + 18 : y + 22, w: PW, align: "center", font: "700 " + (compact ? 96 : 176) + "px/1 " + P.F.black, css: "white-space:nowrap" });
    var ry = compact ? y + 120 : y + 214;
    P.rule(ink, 50, ry, PW - 100, 5); P.rule(ink, 50, ry + 9, PW - 100, 1.5);
    els.date = P.t(ink, "SPECIAL EDITION — PRINTED WHILE THE MACHINE WAS STILL TALKING", { x: 50, y: ry + 15, w: PW - 100, align: "center", font: "400 15px " + P.F.type, css: "letter-spacing:3px" });
    P.rule(ink, 50, ry + 40, PW - 100, 1.5);
    els.bottom = ry + 46; return els;
  };
  /* column of justified body copy with optional drop cap */
  P.body = function (parent, html, o) {
    var d = P.div("position:absolute;left:" + o.x + "px;top:" + o.y + "px;width:" + o.w + "px;font:" + (o.font || "400 19.5px/1.3 " + P.F.body) + ";text-align:justify;hyphens:manual;-webkit-hyphens:manual;word-spacing:-.4px;color:" + P.C.ink, parent);
    d.innerHTML = o.raw ? html : html.split("\n").map(function (p, i) { return "<p style='margin:0;text-indent:" + ((i && !o.noindent) ? "1.2em" : "0") + "'>" + P.hyphHTML(p) + "</p>"; }).join("");
    return d;
  };
  P.dropcap = function (el, letter) {
    var p = el.querySelector("p"); var txt = p.innerHTML; p.innerHTML = "<span style='float:left;font:900 74px/.82 " + P.F.head + ";padding:6px 7px 0 0'>" + letter + "</span>" + txt.slice(1);
  };
  P.colRule = function (parent, x, y, h) { return P.rule(parent, x, y, 1, h); };
  /* ad / sidebar box */
  P.box = function (parent, x, y, w, h, o) {
    var d = P.div("position:absolute;left:" + x + "px;top:" + y + "px;width:" + w + "px;height:" + h + "px;border:" + (o.bw || 2) + "px " + (o.style || "solid") + " " + (o.color || P.C.ink) + ";box-sizing:border-box;padding:" + (o.pad == null ? 10 : o.pad) + "px;text-align:center;" + (o.css || ""), parent);
    if (o.html) d.innerHTML = o.html; return d;
  };

  /* ---------- typewriter reveal: layout is stable (hidden remainder keeps its place) ---------- */
  P.typer = function (el, txt) {
    el.innerHTML = ""; var a = document.createElement("span"), b = document.createElement("span"); b.style.visibility = "hidden"; b.textContent = txt; el.appendChild(a); el.appendChild(b);
    return { set: function (n) { n = Math.max(0, Math.min(txt.length, Math.floor(n))); a.textContent = txt.slice(0, n); b.textContent = txt.slice(n); }, len: txt.length };
  };
  /* seek-safe: hook a typer to a tween on the timeline */
  P.typeTween = function (tl, ty, t, dur) { var o = { n: 0 }; tl.fromTo(o, { n: 0 }, { n: ty.len, duration: dur, ease: "none", onUpdate: function () { ty.set(o.n); } }, t); };

  /* ---------- red stamp (rough edge, voids), pre-built hidden ---------- */
  P.stamp = function (parent, txt, o) {
    var d = P.div("position:absolute;left:" + o.x + "px;top:" + o.y + "px;transform-origin:50% 50%;opacity:0;mix-blend-mode:multiply;filter:url(#stamp)", parent);
    var inner = P.div("border:" + (o.bw || 6) + "px double " + P.C.red + ";color:" + P.C.red + ";padding:" + (o.pad || "10px 22px") + ";font:400 " + (o.size || 64) + "px/1 " + P.F.slab + ";letter-spacing:3px;white-space:nowrap;text-align:center;background:rgba(193,39,45,.04)", d); inner.innerHTML = txt;
    gsap.set(d, { rotation: o.rot == null ? -7 : o.rot }); return d;
  };
  /* hit the page: a 2 px jolt for 3 frames (seeded) */
  P.jolt = function (tl, el, t, amp) { var r = rngOf("jolt" + t); amp = amp || 2; for (var k = 0; k < 3; k++) tl.set(el, { marginLeft: (r() - .5) * 2 * amp * (1 - k / 3), marginTop: (r() - .5) * 2 * amp * (1 - k / 3) }, t + k / 30); tl.set(el, { marginLeft: 0, marginTop: 0 }, t + 3 / 30); };
  /* camera: world scale s with point (px,py) of the page shown at screen (sx,sy) */
  P.view = function (s, px, py, sx, sy) { return { scale: s, x: sx - s * px, y: sy - s * py }; };
  P.pos = function (el, root) { var x = 0, y = 0, e = el; while (e && e !== root) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return { x: x, y: y, w: el.offsetWidth, h: el.offsetHeight }; };

  /* camera tween on the world (origin = page centre): view v from P.view */
  P.camTo = function (tl, sh, t, d, v, ease) { tl.to(sh.world, { scale: v.scale, x: v.x + (sh.PW / 2) * (v.scale - 1), y: v.y + (sh.PH / 2) * (v.scale - 1), rotation: 0, duration: d, ease: ease || "power2.inOut" }, t); };
  P.camSet = function (tl, sh, t, v) { tl.set(sh.world, { scale: v.scale, x: v.x + (sh.PW / 2) * (v.scale - 1), y: v.y + (sh.PH / 2) * (v.scale - 1), rotation: 0 }, t); };
  /* ---------- scene entrances ---------- */
  /* spinning stack of newspapers slams flat: lead = world; ghosts trail it, fading */
  P.spinIn = function (tl, sh, t0, finalView, o) {
    o = o || {}; var dur = o.dur || .62, ghosts = [], n = 4;
    for (var i = 0; i < n; i++) {
      var gh = P.div("position:absolute;left:0;top:0;width:" + sh.PW + "px;height:" + sh.PH + "px;transform-origin:0 0;background:" + P.C.paper + ";opacity:0;box-shadow:0 0 30px rgba(0,0,0,.6)", sh.cam);
      var lines = ""; for (var k = 0; k < 40; k++) lines += "<div style='position:absolute;left:" + (60 + (k % 5) * 280) + "px;top:" + (300 + Math.floor(k / 5) * 190) + "px;width:240px;height:150px;background:repeating-linear-gradient(#1b1a17 0 2px,transparent 2px 9px);opacity:.55'></div>";
      gh.innerHTML = "<div style='position:absolute;left:0;top:60px;width:100%;text-align:center;font:700 170px/1 " + P.F.black + ";color:#1b1a17'>The Daily Token</div>" + lines;
      sh.cam.insertBefore(gh, sh.world); ghosts.push(gh);
    }
    var v = finalView, cx = 540, cy = 900, cxp = sh.PW / 2, cyp = sh.PH / 2;
    var rot0 = o.rot0 == null ? 1080 : o.rot0;
    // the lead page and ghosts use the page-centre origin; final x,y are corrected to keep the same framing as the plain (0 0) origin
    var fx = v.x + (sh.PW / 2) * (v.scale - 1), fy = v.y + (sh.PH / 2) * (v.scale - 1);
    var all = [sh.world].concat(ghosts);
    all.forEach(function (el, i) {
      tl.set(el, { transformOrigin: sh.PW / 2 + "px " + sh.PH / 2 + "px" }, 0);
      tl.fromTo(el, { scale: o.s0 || .03, rotation: rot0, x: cx - sh.PW / 2, y: cy - sh.PH / 2, opacity: i ? 0 : 1 }, { scale: v.scale, rotation: 0, x: fx, y: fy, duration: dur, ease: "expo.out" }, t0 + i * .035);
      if (i) { tl.fromTo(el, { opacity: .85 - i * .15 }, { opacity: 0, duration: dur * .8, ease: "none" }, t0 + i * .035); tl.set(el, { opacity: 0 }, t0 + dur + .1); }
    });
    return ghosts;
  };
})();
