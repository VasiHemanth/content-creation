/* print.js - the whole ukiyo-e print, built ONCE in code (canvas + SVG-filter textures), then reused by every scene.
   Deterministic: seeded mulberry32 everywhere, no Math.random, no clock. */
(function () {
  var W = window;
  W.mulberry32 = function (a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  W.seedOf = function (s) { var h = 1779033703 ^ s.length; for (var i = 0; i < s.length; i++) { h = Math.imul(h ^ s.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); } h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^ (h >>> 16)) >>> 0; };
  W.rngOf = function (s) { return W.mulberry32(W.seedOf(s)); };
  W.hash01 = function (n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  var P = W.Print = { W: 1080, H: 1920 };
  var C = P.C = { paper: "#efe3c6", prus: "#0f3057", ind: "#5b86a8", pale: "#b9cbd6", ochre: "#d9a441", verm: "#c8402a", key: "#1a1410" };
  var FW = 1080, FH = 1920;
  function rgb(hex) { return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)]; }
  P.rgb = rgb;
  function mk(w, h) { var c = document.createElement("canvas"); c.width = w || FW; c.height = h || FH; return c; }
  P.mk = mk;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  /* ---------- SVG-filter textures, rasterised once ---------- */
  function svgNoise(freq, oct, seed, w, h) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '"><filter id="n" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="' + freq + '" numOctaves="' + oct + '" seed="' + seed + '"/><feColorMatrix type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1"/></filter><rect width="' + w + '" height="' + h + '" filter="url(#n)"/></svg>';
    return new Promise(function (res) {
      var im = new Image();
      im.onload = function () { var c = mk(w, h), g = c.getContext("2d"); g.drawImage(im, 0, 0, w, h); var d = g.getImageData(0, 0, w, h).data, o = new Uint8Array(w * h); for (var i = 0; i < w * h; i++) o[i] = d[i * 4]; res(o); };
      im.onerror = function () { res(null); };
      im.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    });
  }
  /* fallback value-noise if the filter image fails */
  function jsNoise(fx, fy, seed, w, h) {
    var r = rngOf("jsn" + seed), gw = Math.ceil(w * fx) + 3, gh = Math.ceil(h * fy) + 3, g = new Float32Array(gw * gh), o = new Uint8Array(w * h), i, x, y;
    for (i = 0; i < g.length; i++) g[i] = r();
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) { var u = x * fx, v = y * fy, iu = u | 0, iv = v | 0, a = u - iu, b = v - iv; a = a * a * (3 - 2 * a); b = b * b * (3 - 2 * b); var q = g[iv * gw + iu] * (1 - a) * (1 - b) + g[iv * gw + iu + 1] * a * (1 - b) + g[(iv + 1) * gw + iu] * (1 - a) * b + g[(iv + 1) * gw + iu + 1] * a * b; o[y * w + x] = 255 * clamp(.5 + (q - .5) * 1.3, 0, 1); }
    return o;
  }

  /* ---------- geometry ---------- */
  function spline(pts, per) {
    per = per || 10; var out = [];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (var k = 0; k < per; k++) { var t = k / per, t2 = t * t, t3 = t2 * t; out.push([.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3), .5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]); }
    }
    out.push(pts[pts.length - 1]); return out;
  }
  function normals(poly) { /* body is on the side n = (hy, -hx) */
    var n = []; for (var i = 0; i < poly.length; i++) { var a = poly[Math.max(0, i - 1)], b = poly[Math.min(poly.length - 1, i + 1)], hx = b[0] - a[0], hy = b[1] - a[1], L = Math.hypot(hx, hy) || 1; n.push([hy / L, -hx / L]); }
    return n;
  }
  function offsetPoly(poly, nrm, d) { return poly.map(function (p, i) { var dd = typeof d === "function" ? d(i / (poly.length - 1)) : d; return [p[0] + nrm[i][0] * dd, p[1] + nrm[i][1] * dd]; }); }
  function ribbonPoints(a, b) { return a.concat(b.slice().reverse()); }
  /* variable width stroke as a filled polygon from a centerline: width = wfn(u) */
  function strokePoly(poly, wfn) {
    var nr = normals(poly), L = [], R = [];
    for (var i = 0; i < poly.length; i++) { var w = wfn(i / (poly.length - 1)) / 2; L.push([poly[i][0] + nr[i][0] * w, poly[i][1] + nr[i][1] * w]); R.push([poly[i][0] - nr[i][0] * w, poly[i][1] - nr[i][1] * w]); }
    return L.concat(R.reverse());
  }
  /* brush stroke: swell-and-taper width profile (+ seeded wobble) */
  function brushWidth(w0, wmax, rng, peak) { peak = peak == null ? .4 : peak; var ph = rng() * 6; return function (u) { var s = u < peak ? Math.sin(u / peak * Math.PI / 2) : Math.cos((u - peak) / (1 - peak) * Math.PI / 2); return Math.max(.9, w0 + (wmax - w0) * Math.pow(s, .8) * (.92 + .08 * Math.sin(u * 23 + ph))); }; }
  function fillPoly(g, pts, color) { g.fillStyle = color; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); g.fill(); }
  function strokeLine(g, pts, color, w) { g.strokeStyle = color; g.lineWidth = w; g.lineJoin = "round"; g.lineCap = "round"; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.stroke(); }
  P.geo = { spline: spline, normals: normals, offsetPoly: offsetPoly, strokePoly: strokePoly, brushWidth: brushWidth, fillPoly: fillPoly, strokeLine: strokeLine };

  /* recursive claw: a foam finger that curls and forks. returns [{poly, w}] */
  function claw(out, x, y, ang, len, w, depth, rng, curl) {
    var n = 12, poly = [[x, y]], a = ang, px = x, py = y;
    for (var i = 1; i <= n; i++) { var u = i / n; a += curl * (.4 + u * 1.3) / n; px += Math.cos(a) * len / n; py += Math.sin(a) * len / n; poly.push([px, py]); }
    out.push({ poly: poly, w: w });
    if (depth > 0) {
      var kids = 1 + (rng() < .65 ? 1 : 0) + (rng() < .25 ? 1 : 0);
      for (var k = 0; k < kids; k++) {
        var t = .35 + rng() * .45, idx = Math.floor(t * n), bp = poly[idx], side = rng() < .5 ? -1 : 1, aa = a - curl * (1 - t) * .8;
        claw(out, bp[0], bp[1], aa + side * (.45 + rng() * .5), len * (.5 + rng() * .15), w * .6, depth - 1, rng, curl * (.8 + rng() * .5));
      }
    }
  }

  /* ---------- build everything ---------- */
  P.ready = function () { return P._p || (P._p = build()); };

  async function build() {
    var t0 = 0, i, x, y;
    /* anisotropic wood grain (strong in x, fast in y) and a soft paper mottle */
    var grain = await svgNoise("0.004 0.35", 3, 11, FW, FH); if (!grain) grain = jsNoise(.004, .35, 11, FW, FH);
    var mottle = await svgNoise("0.004 0.006", 3, 23, FW, FH); if (!mottle) mottle = jsNoise(.006, .006, 23, FW, FH);
    var grain2 = await svgNoise("0.003 0.22", 2, 37, FW, FH); if (!grain2) grain2 = jsNoise(.003, .22, 37, FW, FH);
    P.grain = grain; P.grain2 = grain2;

    /* ---- washi paper ---- */
    var paper = mk(), pg = paper.getContext("2d"), pimg = pg.createImageData(FW, FH), pd = pimg.data, pc = rgb(C.paper), pr = rngOf("paper");
    for (y = 0; y < FH; y++) for (x = 0; x < FW; x++) {
      var j = y * FW + x, m = (mottle[j] - 128) / 128, ed = Math.min(x, y, FW - 1 - x, FH - 1 - y), edge = Math.pow(Math.max(0, 1 - ed / 110), 2) * 15, spk = (pr() - .5) * 5;
      var dk = m * 9 + edge + spk;
      pd[j * 4] = clamp(pc[0] - dk, 0, 255); pd[j * 4 + 1] = clamp(pc[1] - dk * 1.04, 0, 255); pd[j * 4 + 2] = clamp(pc[2] - dk * 1.15, 0, 255); pd[j * 4 + 3] = 255;
    }
    pg.putImageData(pimg, 0, 0);
    var fr = rngOf("fibres"); pg.lineCap = "round";
    for (i = 0; i < 1700; i++) {                                    // long thin curved fibres, very low opacity
      var fx = fr() * FW, fy = fr() * FH, a = fr() * 6.283, len = 50 + fr() * 190, cv = (fr() - .5) * 1.6, lite = fr() < .5;
      pg.strokeStyle = lite ? "rgba(255,248,228,0.10)" : "rgba(118,96,62,0.055)"; pg.lineWidth = .5 + fr() * .9;
      pg.beginPath(); pg.moveTo(fx, fy); pg.quadraticCurveTo(fx + Math.cos(a + cv) * len * .5, fy + Math.sin(a + cv) * len * .5, fx + Math.cos(a) * len, fy + Math.sin(a) * len); pg.stroke();
    }
    P.paper = paper;

    /* ---- wave geometry: an original great-wave-style composition ---- */
    var top = spline([[1130, 1030], [1040, 985], [950, 915], [860, 822], [770, 726], [690, 656], [610, 604], [530, 572], [440, 563], [362, 583], [302, 622], [266, 684], [257, 746], [279, 790], [326, 804], [382, 790], [432, 792], [468, 800]], 9);
    var front = spline([[468, 800], [462, 868], [420, 950], [352, 1030], [262, 1110], [160, 1185], [50, 1252], [-50, 1305]], 12);
    var wave = top.concat(front.slice(1));
    var nTop = normals(top), nFront = normals(front);
    var bodyPoly = wave.concat([[-50, 1760], [1130, 1760]]);
    var R = {};                                                     // shape records: {color layer, level}
    function ctxOf() { var c = mk(); return { c: c, g: c.getContext("2d") }; }
    var Lsky = ctxOf(), Lmt = ctxOf(), Lind = ctxOf(), Lpale = ctxOf(), Locre = ctxOf(), Lprus = ctxOf(), Lverm = ctxOf(), Lkey = ctxOf(), Lvl = ctxOf();
    Lvl.g.fillStyle = "rgb(26,26,26)"; Lvl.g.fillRect(0, 0, FW, FH);
    var lvl = function (shapeFn, v) { Lvl.g.fillStyle = "rgb(" + v + "," + v + "," + v + ")"; shapeFn(Lvl.g); };
    var polyPath = function (pts) { return function (g) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (var k = 1; k < pts.length; k++) g.lineTo(pts[k][0], pts[k][1]); g.closePath(); g.fill(); }; };
    var rnd = rngOf("wave");

    /* sky: light-indigo bokashi, density graded from the top (pixel pass below) */
    Lsky.g.fillStyle = C.ind; Lsky.g.fillRect(0, 0, FW, 700);
    lvl(function (g) { g.fillRect(0, 0, FW, 700); }, 40);

    /* clouds: pale grey-blue ribbons with scalloped lower edges */
    var cloudDefs = [[-60, 300, 640, 34], [380, 352, 720, 30], [-80, 452, 520, 36], [520, 506, 620, 32], [110, 566, 420, 26]];
    var cloudShapes = [];
    cloudDefs.forEach(function (c, k) {
      var r = rngOf("cloud" + k), x0 = c[0], y0 = c[1], w = c[2], h = c[3], pts = [], seg = 16, s2, nS = Math.round(w / 74), st = w / nS;
      pts.push([x0, y0 + h * .35]);
      for (s2 = 1; s2 < seg; s2++) { var u = s2 / seg; pts.push([x0 + w * u, y0 - Math.sin(u * Math.PI) * 9 + Math.sin(u * 9 + k) * 2.2]); }
      pts.push([x0 + w, y0 + h * .35]);
      for (var q = nS - 1; q >= 0; q--) { var xe = x0 + st * (q + 1), xs = x0 + st * q, yb = y0 + h * (.62 + .1 * Math.sin(q * 1.9 + k)); for (var m = 1; m <= 7; m++) { var tt = m / 7, xx2 = xe - (xe - xs) * tt; pts.push([xx2, yb + Math.sin(tt * Math.PI) * h * .42 * (.8 + .3 * ((q + k) % 3) / 2)]); } }
      cloudShapes.push(pts); fillPoly(Lpale.g, pts, C.pale); lvl(polyPath(pts), 58);
    });
    /* sun: ochre disc now; the prompt scene overprints it in vermilion */
    var SUN = { x: 238, y: 438, r: 106 };
    Locre.g.fillStyle = C.ochre; Locre.g.beginPath(); Locre.g.arc(SUN.x, SUN.y, SUN.r, 0, 6.2832); Locre.g.fill();
    lvl(function (g) { g.beginPath(); g.arc(SUN.x, SUN.y, SUN.r, 0, 6.2832); g.fill(); }, 66);
    Lverm.g.fillStyle = C.verm; Lverm.g.beginPath(); Lverm.g.arc(SUN.x, SUN.y, SUN.r - 2, 0, 6.2832); Lverm.g.fill();   // vermilion sun, revealed only in the last beats
    P.SUN = SUN; P.vermSun = Lverm.c;
    Lverm.g.clearRect(0, 0, FW, FH);                                // printed layer keeps only the seal/cartouche accents until the finale draws the sun
    /* distant mountain (pale), shaded flank (light indigo), snow cap knocked out */
    var mt = spline([[610, 800], [690, 742], [760, 676], [812, 626], [842, 604], [872, 626], [915, 676], [985, 742], [1090, 810]], 8);
    var mtPoly = mt.concat([[1090, 900], [610, 900]]);
    fillPoly(Lmt.g, mtPoly, C.pale); lvl(polyPath(mtPoly), 74);
    var flank = spline([[842, 604], [826, 650], [792, 700], [740, 752], [690, 800]], 6); fillPoly(Lind.g, flank.concat([[800, 740], [830, 650]]), C.ind);
    var snow = [[842, 604], [872, 626], [888, 648], [866, 646], [852, 664], [836, 646], [815, 660], [810, 640], [826, 628]];
    Lmt.g.globalCompositeOperation = "destination-out"; fillPoly(Lmt.g, snow, "#000"); Lind.g.globalCompositeOperation = "destination-out"; fillPoly(Lind.g, snow, "#000");
    Lmt.g.globalCompositeOperation = "source-over"; Lind.g.globalCompositeOperation = "source-over";
    /* title cartouche (pale block, drawn with the key block below) */
    var CART = { x: 828, y: 238, w: 182, h: 360 }; P.CART = CART;
    var cpoly = [[CART.x, CART.y], [CART.x + CART.w, CART.y + 2], [CART.x + CART.w + 1, CART.y + CART.h], [CART.x + 1, CART.y + CART.h - 2]];
    Lsky.g.globalCompositeOperation = "destination-out"; fillPoly(Lsky.g, cpoly, "#000"); Lsky.g.globalCompositeOperation = "source-over";
    fillPoly(Lpale.g, cpoly, C.pale); lvl(polyPath(cpoly), 78);

    /* knock the wave body out of everything behind it (each block is cut to register with the next) */
    [Lsky, Lmt, Lind, Lpale, Locre].forEach(function (L) { L.g.globalCompositeOperation = "destination-out"; fillPoly(L.g, bodyPoly, "#000"); L.g.globalCompositeOperation = "source-over"; });

    /* wave body: Prussian blue */
    fillPoly(Lprus.g, bodyPoly, C.prus); lvl(polyPath(bodyPoly), 12);

    /* light-indigo bands that follow the crest and the front face */
    var bands = [[34, 92], [150, 176], [222, 238]];
    [Lind, Lpale].forEach(function (L) { L.g.save(); L.g.beginPath(); L.g.moveTo(bodyPoly[0][0], bodyPoly[0][1]); for (var kk = 1; kk < bodyPoly.length; kk++) L.g.lineTo(bodyPoly[kk][0], bodyPoly[kk][1]); L.g.closePath(); L.g.clip(); });
    var topFull = top, frontFull = front;
    [[topFull, nTop], [frontFull, nFront]].forEach(function (pair) {
      var pl = pair[0], nr = pair[1];
      bands.forEach(function (b, bi) {
        var a = offsetPoly(pl, nr, function (u) { return b[0] + Math.sin(u * 9 + bi) * 5; }), c = offsetPoly(pl, nr, function (u) { return b[1] + Math.sin(u * 7 + bi * 2) * 6; });
        // the first band stays off the thin lip; start the ribbon where the body is thick enough
        var rb = ribbonPoints(a, c); fillPoly(Lind.g, rb, C.ind); Lprus.g.globalCompositeOperation = "destination-out"; fillPoly(Lprus.g, rb, "#000"); Lprus.g.globalCompositeOperation = "source-over"; lvl(polyPath(rb), 96 + bi * 8);
      });
      // thin pale striations: curved lines following the swell
      for (var s = 0; s < 9; s++) {
        var d0 = 112 + s * 17 + (rnd() - .5) * 6, w0 = 2 + rnd() * 3, su = rnd() * .3, eu = .55 + rnd() * .45;
        var seg = [], segN = []; for (var q = Math.floor(su * (pl.length - 1)); q <= Math.floor(eu * (pl.length - 1)); q++) { seg.push(pl[q]); segN.push(nr[q]); }
        if (seg.length < 6) continue;
        var cl = offsetPoly(seg, segN, d0), sp = strokePoly(cl, brushWidth(.6, w0, rnd, .5));
        fillPoly(Lpale.g, sp, C.pale); [Lprus, Lind].forEach(function (L2) { L2.g.globalCompositeOperation = "destination-out"; fillPoly(L2.g, sp, "#000"); L2.g.globalCompositeOperation = "source-over"; }); lvl(polyPath(sp), 116);
      }
    });

    [Lind, Lpale].forEach(function (L) { L.g.restore(); });
    /* foreground sea: swells in front of the wave */
    var sea = [];
    for (i = 0; i < 7; i++) {
      var sy = 1310 + i * 46, pts = [], amp = 16 + i * 2.5, ph = i * 1.3;
      for (x = -40; x <= FW + 40; x += 30) pts.push([x, sy + Math.sin(x * .011 + ph) * amp + Math.sin(x * .027 + ph * 2) * amp * .35 - (x < 420 ? (420 - x) * .03 : 0)]);
      var bot = pts.map(function (p) { return [p[0], p[1] + 20 + (i % 2) * 8]; });
      var rb2 = ribbonPoints(pts, bot); fillPoly(i % 2 ? Lpale.g : Lind.g, rb2, i % 2 ? C.pale : C.ind); Lprus.g.globalCompositeOperation = "destination-out"; fillPoly(Lprus.g, rb2, "#000"); Lprus.g.globalCompositeOperation = "source-over"; lvl(polyPath(rb2), 100 + i * 6); sea.push(pts);
    }

    /* foam: knocked out of the blues, then outlined by the key block */
    var foamShapes = [], claws = [], fr2 = rngOf("foam");
    function addClaws(pl, nr, u0, u1, count, lenA, lenB, wA, outward, curlSign) {
      for (var k = 0; k < count; k++) {
        var u = u0 + (u1 - u0) * (k + fr2() * .6) / count, idx = Math.floor(u * (pl.length - 1)), p = pl[idx], n = nr[idx];
        var ang = Math.atan2(-n[1] * outward, -n[0] * outward) + (fr2() - .5) * .7;
        claw(claws, p[0], p[1], ang, lenA + fr2() * (lenB - lenA), wA * (.85 + fr2() * .4), 1, fr2, curlSign * (.7 + fr2() * .8));
      }
    }
    addClaws(top, nTop, .14, .56, 8, 90, 165, 38, 1, -1);          // along the back slope and crest, hooking forward
    addClaws(top, nTop, .56, .80, 5, 80, 140, 34, 1, 1.0);          // around the curling lip
    // the lip's underside carries a shorter fringe
    addClaws(top, nTop, .80, .97, 3, 40, 80, 20, 1, 1.2);
    // spray on the front face and the troughs
    addClaws(front, nFront, .08, .55, 3, 44, 84, 18, -1, -1);
    var i0 = Math.floor(top.length * .13), i1 = Math.floor(top.length * .8), lr = rngOf("lace");
    var outerE = [], innerE = []; for (i = i0; i <= i1; i++) { var uu = (i - i0) / (i1 - i0), tp = Math.sin(uu * Math.PI), wob = (10 + 8 * Math.sin(uu * 37) * Math.sin(uu * 11 + 1) + lr() * 3) * (.25 + .75 * tp); outerE.push([top[i][0] - nTop[i][0] * wob, top[i][1] - nTop[i][1] * wob]); innerE.push([top[i][0] + nTop[i][0] * (16 + 6 * Math.sin(uu * 23)) * (.3 + .7 * tp), top[i][1] + nTop[i][1] * (16 + 6 * Math.sin(uu * 23)) * (.3 + .7 * tp)]); }
    foamShapes.push(ribbonPoints(outerE, innerE));
    claws.forEach(function (c) { foamShapes.push(strokePoly(c.poly, function (u) { return Math.max(2.2, c.w * (1 - Math.pow(u, 2.1))); })); });
    [Lprus, Lind].forEach(function (L) { L.g.globalCompositeOperation = "destination-out"; foamShapes.forEach(function (s) { fillPoly(L.g, s, "#000"); }); L.g.globalCompositeOperation = "source-over"; });
    var spr = rngOf("spray");
    [Lprus, Lind].forEach(function (L) { L.g.globalCompositeOperation = "destination-out"; L.g.fillStyle = "#000"; });
    for (i = 0; i < 260; i++) { var ui = .12 + spr() * .7, ii = Math.floor(ui * (top.length - 1)), dep = Math.pow(spr(), 1.8) * 120 + 18, dp = [top[ii][0] + nTop[ii][0] * dep, top[ii][1] + nTop[ii][1] * dep], dr = 1.4 + spr() * (4.2 - dep / 45);
      if (dr < 1.2) continue; [Lprus, Lind].forEach(function (L) { L.g.beginPath(); L.g.arc(dp[0], dp[1], dr, 0, 6.2832); L.g.fill(); }); }
    [Lprus, Lind].forEach(function (L) { L.g.globalCompositeOperation = "source-over"; });
    foamShapes.forEach(function (s) { lvl(polyPath(s), 150); });
    // pale grey-blue shading under the foam, offset a few px down-left
    foamShapes.forEach(function (s, k) { if (k % 2) fillPoly(Lpale.g, s.map(function (p) { return [p[0] - 4, p[1] + 6]; }), C.pale); });
    Lpale.g.globalCompositeOperation = "destination-out"; foamShapes.forEach(function (s) { fillPoly(Lpale.g, s, "#000"); }); Lpale.g.globalCompositeOperation = "source-over";

    /* the small boat riding the swell: ochre hull, three rowers */
    var BOAT = { x: 238, y: 1372, rot: -.2 };
    function boatPts(sc) { var hull = spline([[-104, -10], [-60, 16], [10, 22], [70, 14], [112, -18], [118, -34], [100, -20], [40, -4], [-50, -6], [-98, -22]], 6); return hull.map(function (p) { var c = Math.cos(BOAT.rot), s = Math.sin(BOAT.rot); return [BOAT.x + (p[0] * c - p[1] * s) * sc, BOAT.y + (p[0] * s + p[1] * c) * sc]; }); }
    var hull = boatPts(1.18);
    Lprus.g.globalCompositeOperation = "destination-out"; fillPoly(Lprus.g, hull, "#000"); Lprus.g.globalCompositeOperation = "source-over";
    [Lind, Lpale].forEach(function (L) { L.g.globalCompositeOperation = "destination-out"; fillPoly(L.g, hull, "#000"); L.g.globalCompositeOperation = "source-over"; });
    fillPoly(Locre.g, hull, C.ochre); lvl(polyPath(hull), 196);
    var rowers = [];
    for (i = 0; i < 3; i++) { var bx = BOAT.x + (-40 + i * 42) * 1.18 * Math.cos(BOAT.rot), by = BOAT.y + (-40 + i * 42) * 1.18 * Math.sin(BOAT.rot) - 26; rowers.push([bx, by]); }

    /* bottom bokashi: Prussian density rising toward the foot of the sheet (pixel pass) */
    /* ---- key block: variable-width brush outlines ---- */
    var K = Lkey.g, kr = rngOf("key");
    var keyShapes = [];
    function keyLine(poly, w0, wmax, peak) { var sp = strokePoly(poly, brushWidth(w0, wmax, kr, peak)); fillPoly(K, sp, C.key); keyShapes.push(sp); lvl(polyPath(sp), 238); }
    keyLine(top, 3, 11, .45); keyLine(front, 3, 10, .35);
    // hatching along the swell
    [topFull, frontFull].forEach(function (pl, pi) {
      var nr = pi ? nFront : nTop;
      for (var s = 0; s < 11; s++) {
        var su = .06 + kr() * .3, eu = su + .25 + kr() * .45, d0 = 16 + s * 22 + kr() * 8; if (eu > 1) eu = 1;
        var seg = [], segN = []; for (var q = Math.floor(su * (pl.length - 1)); q <= Math.floor(eu * (pl.length - 1)); q++) { seg.push(pl[q]); segN.push(nr[q]); }
        if (seg.length < 5) continue; keyLine(offsetPoly(seg, segN, d0), .8, 3.2 + kr() * 2, .5);
      }
    });
    // foam outlines
    var foamPath = function (g, s) { g.beginPath(); g.moveTo(s[0][0], s[0][1]); for (var k = 1; k < s.length; k++) g.lineTo(s[k][0], s[k][1]); g.closePath(); };
    var foamUnion = function () {                       // outline the UNION of all foam shapes: stroke wide, then punch the inside out
      K.strokeStyle = C.key; K.lineJoin = "round"; K.lineWidth = 8; foamShapes.forEach(function (s) { foamPath(K, s); K.stroke(); });
      K.globalCompositeOperation = "destination-out"; K.fillStyle = "#000"; foamShapes.forEach(function (s) { foamPath(K, s); K.fill(); }); K.globalCompositeOperation = "source-over";
    };
    foamShapes.forEach(function (s) { lvl(function (g) { g.strokeStyle = "rgb(235,235,235)"; g.lineWidth = 3; g.beginPath(); g.moveTo(s[0][0], s[0][1]); for (var k = 1; k < s.length; k++) g.lineTo(s[k][0], s[k][1]); g.closePath(); g.stroke(); }, 235); });
    // mountain, cloud, sun, boat, sea, cartouche, border
    keyLine(mt, 2.5, 6.5, .5); keyLine(flank, 1.2, 3.4, .5);
    cloudShapes.forEach(function (c, ci) { var half = Math.floor(c.length * .55); keyLine(c.slice(Math.floor(c.length * .5), c.length - 1), 1.2, 3.2, .45); });
    var ring = []; for (i = 0; i <= 64; i++) { var aa = i / 64 * 6.2832 + .5; ring.push([SUN.x + Math.cos(aa) * SUN.r, SUN.y + Math.sin(aa) * SUN.r]); } keyLine(ring, 2, 5, .5);
    keyLine(hull.concat([hull[0]]), 2.4, 5.6, .5); rowers.forEach(function (p) { K.fillStyle = C.key; K.beginPath(); K.arc(p[0], p[1], 7.5, 0, 6.2832); K.fill(); K.fillRect(p[0] - 7, p[1] + 5, 14, 14); });
    sea.forEach(function (pl, k) { keyLine(pl.slice(Math.floor(pl.length * .05), Math.floor(pl.length * (.5 + .1 * (k % 4)))), .9, 3.4, .5); });
    foamUnion();
    // cartouche frame + the thin printed border with one deliberate imperfection
    var cb = [[CART.x, CART.y], [CART.x + CART.w, CART.y + 2], [CART.x + CART.w + 1, CART.y + CART.h], [CART.x + 1, CART.y + CART.h - 2], [CART.x, CART.y - 1]];
    keyLine(cb, 4, 6, .5);
    var inner = [[CART.x + 9, CART.y + 9], [CART.x + CART.w - 9, CART.y + 10], [CART.x + CART.w - 8, CART.y + CART.h - 9], [CART.x + 9, CART.y + CART.h - 10], [CART.x + 9, CART.y + 8]]; keyLine(inner, 1.4, 2, .5);
    var B0 = 44, B1x = FW - 44, B1y = FH - 44;
    K.strokeStyle = C.key; K.lineCap = "butt"; K.lineWidth = 7; K.strokeRect(B0, B0, B1x - B0, B1y - B0); K.lineWidth = 2.4; K.strokeRect(B0 + 15, B0 + 15, B1x - B0 - 30, B1y - B0 - 30);
    K.fillStyle = C.paper; K.globalCompositeOperation = "destination-out"; K.fillRect(B1x - 70, B0 - 6, 52, 17); K.globalCompositeOperation = "source-over";   // the missed corner of the border
    K.lineWidth = 7; K.beginPath(); K.moveTo(B1x - 90, B0); K.lineTo(B1x - 60, B0 + 2); K.stroke();
    lvl(function (g) { g.strokeStyle = "rgb(235,235,235)"; g.lineWidth = 8; g.strokeRect(B0, B0, B1x - B0, B1y - B0); }, 235);

    /* ---- per-layer pixel passes: bokashi density + wood grain (uneven ink along the grain, small voids) ---- */
    function pixelPass(L, opts) {
      var img = L.g.getImageData(0, 0, FW, FH), d = img.data, gr = opts.grain === 2 ? grain2 : grain, ox = opts.ox || 0, oy = opts.oy || 0, strength = opts.strength == null ? .6 : opts.strength, dens = opts.density, vr = rngOf("void" + (opts.seed || 1));
      for (var yy = 0; yy < FH; yy++) for (var xx = 0; xx < FW; xx++) {
        var k = (yy * FW + xx) * 4, a = d[k + 3]; if (!a) continue;
        var yi = (yy + oy) % (2 * FH); if (yi >= FH) yi = 2 * FH - 1 - yi; var xi = (xx + ox) % (2 * FW); if (xi >= FW) xi = 2 * FW - 1 - xi; var gg = gr[yi * FW + xi] / 255, f = clamp((gg - .26) / .5, 0, 1);
        var mm = mottle[yy * FW + xx] / 255, stl = strength * (.55 + .95 * mm), am = 1 - stl + stl * f;                                   // ink density follows the grain
        if (gg < .22 && vr() < .6) am *= .12;                                   // voids: paper shows through
        if (dens) am *= dens(xx, yy);
        d[k + 3] = a * clamp(am, 0, 1);
      }
      L.g.putImageData(img, 0, 0);
    }
    var skyDens = function (x, y) {            // bokashi: density steps with wavy, noisy band edges
      var warp = Math.sin(x * .009 + 1) * 16 + Math.sin(x * .031) * 6 + (grain2[(y % FH) * FW + x] - 128) * .12;
      var dd = clamp(1 - (y + warp) / 610, 0, 1); dd = Math.pow(dd, 1.15);
      var q = Math.floor(dd * 8) / 8 * .78 + dd * .22;                          // visible banding
      return clamp(q * 1.05, 0, 1);
    };
    pixelPass(Lsky, { seed: 1, strength: .24, grain: 2, ox: 120, oy: 40, density: skyDens });
    pixelPass(Lind, { seed: 7, strength: .5, ox: 90, oy: 500 });
    pixelPass(Lmt, { seed: 8, strength: .45, grain: 2, ox: 260, oy: 90, density: function (x, y) { return 1 - smooth(770, 880, y) * .95; } });
    pixelPass(Lpale, { seed: 2, strength: .5, ox: 330, oy: 710 });
    pixelPass(Locre, { seed: 3, strength: .45, ox: 550, oy: 1100 });
    pixelPass(Lprus, { seed: 4, strength: .62, ox: 20, oy: 900, density: function (x, y) { var b = y > 1500 ? 1 : 1; var warp = Math.sin(x * .013) * 10 + (grain2[(y % FH) * FW + x] - 128) * .1; return 1 - (y < 1500 ? 0 : 0) * b + 0 * warp; } });
    // bottom bokashi: a separate Prussian layer that deepens toward the foot (banded, noisy edges)
    var Lbot = ctxOf(); Lbot.g.fillStyle = C.prus; Lbot.g.fillRect(0, 1420, FW, FH - 1420);
    pixelPass(Lbot, { seed: 5, strength: .55, ox: 700, oy: 300, density: function (x, y) { var warp = Math.sin(x * .012 + 2) * 14 + (grain2[(y % FH) * FW + x] - 128) * .14; var d2 = clamp((y + warp - 1440) / 380, 0, 1); d2 = Math.pow(d2, .9); return Math.floor(d2 * 7) / 7 * .8 + d2 * .2; } });
    pixelPass(Lkey, { seed: 6, strength: .22, ox: 400, oy: 200 });

    /* ---- the finished sheet: layers overprinted on washi with seeded 1-3 px misregistration ---- */
    var mr = rngOf("misreg"), off = function (m) { return [(mr() * 2 - 1) * m, (mr() * 2 - 1) * m]; };
    var offs = { ind: [1.6, -1.2], pale: [-2.1, 1.4], ochre: [-1.3, -2.2], prus: [1.1, 2.4], bot: [1.1, 2.4], verm: [2.5, -1.0], key: [0, 0] }; P.offs = offs;
    var print = mk(), prg = print.getContext("2d"); prg.drawImage(paper, 0, 0);
    prg.globalCompositeOperation = "multiply";
    [["ind", Lsky], ["ind", Lind], ["pale", Lmt], ["pale", Lpale], ["ochre", Locre], ["prus", Lprus], ["bot", Lbot], ["key", Lkey]].forEach(function (e) { prg.drawImage(e[1].c, offs[e[0]][0], offs[e[0]][1]); });
    prg.globalCompositeOperation = "source-over";
    P.print = print; P.layers = { sky: Lsky.c, mt: Lmt.c, ind: Lind.c, pale: Lpale.c, ochre: Locre.c, prus: Lprus.c, bot: Lbot.c, key: Lkey.c };
    P.keyCanvas = Lkey.c;
    P.BOAT = BOAT; P.hull = hull; P.crest = top; P.front = front; P.foam = foamShapes; P.rowers = rowers;
    P.claws = claws;

    /* vermilion sun layer as its own (misregistered) plate for the prompt scene */
    var sunL = mk(), sg = sunL.getContext("2d"); sg.fillStyle = C.verm; sg.beginPath(); sg.arc(SUN.x, SUN.y, SUN.r - 1, 0, 6.2832); sg.fill();
    (function () { var im = sg.getImageData(0, 0, FW, FH), dd = im.data, vv = rngOf("sunvoid"); for (var yy = Math.max(0, SUN.y - SUN.r - 4); yy < SUN.y + SUN.r + 4; yy++) for (var xx = Math.max(0, SUN.x - SUN.r - 4); xx < SUN.x + SUN.r + 4; xx++) { var k = (yy * FW + xx) * 4; if (!dd[k + 3]) continue; var gg = grain[((yy + 300) % FH) * FW + ((xx + 700) % FW)] / 255, f = clamp((gg - .24) / .5, 0, 1), am = .5 + .5 * f; if (gg < .2 && vv() < .6) am *= .15; dd[k + 3] = 255 * clamp(am * .96, 0, 1); } sg.putImageData(im, 0, 0); })();
    P.sunPlate = sunL;

    /* ---- dither engine data (2 px cells): a seeded ordered-dither threshold texture + static banks ---- */
    var CW = FW / 2, CH = FH / 2, NC = CW * CH, bayer = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21];
    var nr2 = rngOf("dither"), N = new Uint8Array(NC), banks = [], D = new Uint8Array(NC), lv = Lvl.g.getImageData(0, 0, FW, FH).data;
    for (y = 0; y < CH; y++) for (x = 0; x < CW; x++) { var q2 = y * CW + x; N[q2] = clamp(Math.floor((bayer[(y & 7) * 8 + (x & 7)] / 64 * .5 + nr2() * .5) * 256), 0, 255); D[q2] = lv[((y * 2) * FW + x * 2) * 4]; }
    for (var b = 0; b < 4; b++) { var sr = rngOf("static" + b), S = new Uint8Array(NC); for (i = 0; i < NC; i++) S[i] = sr() < .5 ? 1 : 0; banks.push(S); }
    P.N = N; P.D = D; P.banks = banks; P.CW = CW; P.CH = CH;
    var pimg2 = prg.getImageData(0, 0, FW, FH); P.p32 = new Uint32Array(pimg2.data.buffer.slice(0));
    var kc = rgb(C.key), pcol = rgb(C.paper); P.stK = (255 << 24) | (kc[2] << 16) | (kc[1] << 8) | kc[0]; P.stP = (255 << 24) | (pcol[2] << 16) | (pcol[1] << 8) | pcol[0];

    /* guessed-noise speckle: faint indigo cells (drawn once, then drifted) */
    var sp = mk(FW + 200, FH + 200), spg = sp.getContext("2d"), spr = rngOf("guess"), ic = rgb(C.ind), pc2 = rgb(C.prus);
    var spd = spg.createImageData(FW + 200, FH + 200), sd32 = new Uint32Array(spd.data.buffer);
    for (y = 0; y < (FH + 200) / 3; y++) for (x = 0; x < (FW + 200) / 3; x++) { var rr = spr(); if (rr < .42) { var col = rr < .12 ? pc2 : ic, v = (255 << 24) | (col[2] << 16) | (col[1] << 8) | col[0]; for (var yy2 = 0; yy2 < 3; yy2++) for (var xx2 = 0; xx2 < 3; xx2++) sd32[(y * 3 + yy2) * (FW + 200) + x * 3 + xx2] = v; } }
    spg.putImageData(spd, 0, 0); P.guess = sp;
    return P;
  }

  /* ---------- the dither engine: threshold-masked mix of print and static, drawn from time alone ---------- */
  /* opts: mode "fwd" (thr 0..1 = share of cells already static) or "rev" (t 0..1: coarse shapes first, key lines last) */
  P.engine = function (canvas) {
    var g = canvas.getContext("2d"), img = g.createImageData(FW, FH), o32 = new Uint32Array(img.data.buffer), last = "";
    return {
      canvas: canvas,
      draw: function (opts) {
        var key = opts.mode + "|" + (opts.thr == null ? opts.t : opts.thr).toFixed(4) + "|" + opts.bank + "|" + (opts.src || ""); if (key === last) return; last = key;
        var CW = P.CW, CH = P.CH, N = P.N, D = P.D, S = P.banks[opts.bank | 0], p32 = opts.src32 || P.p32, stK = P.stK, stP = P.stP, fwd = opts.mode === "fwd", thr = (opts.thr || 0) * 256, t = opts.t || 0;
        for (var cy = 0; cy < CH; cy++) for (var cx = 0; cx < CW; cx++) {
          var q = cy * CW + cx, n = N[q], show;
          if (fwd) show = n >= thr; else { var c = clamp((t - D[q] / 255 * .78) / .22, 0, 1); show = n < c * 256 - 0.0001 && c > 0; }
          var x = cx * 2, y = cy * 2, i0 = y * FW + x;
          if (show) { o32[i0] = p32[i0]; o32[i0 + 1] = p32[i0 + 1]; o32[i0 + FW] = p32[i0 + FW]; o32[i0 + FW + 1] = p32[i0 + FW + 1]; }
          else { var v = S[q] ? stK : stP; o32[i0] = v; o32[i0 + 1] = v; o32[i0 + FW] = v; o32[i0 + FW + 1] = v; }
        }
        g.putImageData(img, 0, 0);
      }
    };
  };

  /* ---------- scene registration: wait for the one shared build ---------- */
  P.sceneReady = function (key, setup) { W.__hf = W.__hf || {}; W.__hf.buildReady = W.__hf.buildReady || {}; W.__hf.buildReady[key] = P.ready().then(setup); };
  P.div = function (css, parent, cls) { var e = document.createElement("div"); e.style.cssText = css; if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; };
  P.svg = function (tag, attrs, parent) { var e = document.createElementNS("http://www.w3.org/2000/svg", tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  /* eases */
  P.E = {
    thud: function (p) { return p < .35 ? Math.pow(p / .35, 3) : 1 + Math.sin((p - .35) / .65 * Math.PI * 2) * Math.exp(-(p - .35) * 6) * .08; },
    stepN: function (n) { return function (p) { return p >= 1 ? 1 : Math.floor(p * n) / n; }; },
    slow: function (p) { return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
  };

  /* the finished sheet including the vermilion sun overprint (misregistered 2.5, -1) */
  P.finalCanvas = function () {
    if (P._final) return P._final; var c = mk(), g = c.getContext("2d"); g.drawImage(P.print, 0, 0); g.drawImage(P.sunPlate, P.offs.verm[0], P.offs.verm[1]); P._final = c; return c;
  };
  /* wood block surface: ochre darkened with key-block black, grain drives the colour (derived only from palette inks) */
  P.makeWood = function (w, h, seed, pale) {
    var c = mk(w, h), g = c.getContext("2d"), im = g.createImageData(w, h), d = im.data, o = rgb(C.ochre), k = rgb(C.key), p = rgb(C.paper), r = rngOf("wood" + seed), gr = P.grain, g2 = P.grain2, ox = (seed * 97) % 200, oy = (seed * 131) % 400;
    for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
      var i = (y * w + x) * 4, a = gr[((y + oy) % FH) * FW + ((x + ox) % FW)] / 255, b = g2[((y + oy * 2) % FH) * FW + ((x + ox) % FW)] / 255;
      var t = pale ? .05 + .16 * (1 - a) : .46 + .30 * (1 - a) + (b - .5) * .25;       // share of key black
      var base = pale ? [p[0] * .7 + o[0] * .3, p[1] * .7 + o[1] * .3, p[2] * .7 + o[2] * .3] : o;
      d[i] = base[0] * (1 - t) + k[0] * t; d[i + 1] = base[1] * (1 - t) + k[1] * t; d[i + 2] = base[2] * (1 - t) + k[2] * t; d[i + 3] = 255;
      if (r() < .004) { d[i] *= .7; d[i + 1] *= .7; d[i + 2] *= .7; }
    }
    g.putImageData(im, 0, 0); return c;
  };
  /* paper peeling from the top-left corner. d = fold distance (0 = flat). Draws at the current transform. */
  P.drawPeel = function (g, sheet, w, h, d, shadowK) {
    if (d <= .5) { g.drawImage(sheet, 0, 0, w, h); return; }
    var A = [d, 0], B = [0, d], k = shadowK == null ? 1 : shadowK;
    // shadow cast by the lifted flap (offset away from the light, which is upper left)
    g.save(); g.shadowColor = "rgba(10,6,2," + (.5 * k) + ")"; g.shadowBlur = 26; g.shadowOffsetX = 12; g.shadowOffsetY = 16; g.fillStyle = "#000";
    g.beginPath(); g.moveTo(d, d); g.lineTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.closePath(); g.fill(); g.restore();
    // the sheet, minus the lifted corner
    g.save(); g.beginPath(); g.rect(0, 0, w, h); g.moveTo(0, 0); g.lineTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.closePath(); g.clip("evenodd"); g.drawImage(sheet, 0, 0, w, h);
    var gr1 = g.createLinearGradient(d / 2, d / 2, d / 2 + 60, d / 2 + 60); gr1.addColorStop(0, "rgba(20,12,4,.32)"); gr1.addColorStop(1, "rgba(20,12,4,0)"); g.fillStyle = gr1; g.fillRect(0, 0, w, h); g.restore();
    // the flap: back of the paper (reflected across the fold), faint show-through, curl shading
    g.save(); g.beginPath(); g.moveTo(d, d); g.lineTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.closePath(); g.clip();
    g.fillStyle = C.paper; g.fillRect(0, 0, w, h);
    g.save(); g.globalAlpha = .13; g.transform(0, -1, -1, 0, d, d); g.drawImage(sheet, 0, 0, w, h); g.restore();
    var gr2 = g.createLinearGradient(d / 2, d / 2, d, d); gr2.addColorStop(0, "rgba(60,40,15,.38)"); gr2.addColorStop(.35, "rgba(60,40,15,0)"); gr2.addColorStop(1, "rgba(255,250,235,.25)"); g.fillStyle = gr2; g.fillRect(0, 0, w, h);
    g.restore();
    g.save(); g.strokeStyle = "rgba(255,250,235,.55)"; g.lineWidth = 1.6; g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.stroke(); g.restore();
  };
  /* seeded roughness filter (carved / brushed edges); inject once into the page */
  P.roughDefs = function (parent, id, freq, scale, seed) {
    var s = P.svg("svg", { width: 0, height: 0, style: "position:absolute" }, parent), f = P.svg("filter", { id: id, x: "-10%", y: "-10%", width: "120%", height: "120%" }, s);
    P.svg("feTurbulence", { type: "fractalNoise", baseFrequency: freq, numOctaves: 2, seed: seed || 3, result: "t" }, f); P.svg("feDisplacementMap", { in: "SourceGraphic", in2: "t", scale: scale, xChannelSelector: "R", yChannelSelector: "G" }, f);
    return s;
  };
  P.smooth = smooth; P.clamp = clamp;
})();
