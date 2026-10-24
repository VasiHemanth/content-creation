/* plots.js - the scatter plot and the complexity chart, drawn into the ink channels from the REAL data in data.js. */
(function () {
  var W = window, R = W.Riso, D = W.RisoData, P = W.RisoPlots = {};
  P.BOX = { x0: 110, y0: 470, x1: 970, y1: 1300 };
  var mx = function (b, x) { return b.x0 + (b.x1 - b.x0) * x; };
  var my = function (b, y) { return b.y1 - (b.y1 - b.y0) * y; };
  P.mx = mx; P.my = my;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* thud-in for a dot: progress p 0..1 */
  function dotPose(p) { var q = clamp(p, 0, 1); return { r: 1 + (1 - q) * (1 - q) * .9, tone: .3 + .42 * q, on: p > 0 }; }
  P.dotPose = dotPose;

  P.frame = function (ctx, b, k, labels) {
    R.ink(ctx, "b", function (c) {
      c.lineWidth = 3.5 * k; c.lineCap = "square";
      c.beginPath(); c.moveTo(b.x0, b.y0 - 10); c.lineTo(b.x0, b.y1); c.lineTo(b.x1 + 10, b.y1); c.stroke();
      c.lineWidth = 2 * k;
      for (var i = 0; i <= 10; i++) { var x = mx(b, i / 10); c.beginPath(); c.moveTo(x, b.y1); c.lineTo(x, b.y1 + 10 * k); c.stroke(); }
      for (i = 1; i <= 5; i++) { var y = my(b, i / 5); c.beginPath(); c.moveTo(b.x0, y); c.lineTo(b.x0 - 10 * k, y); c.stroke(); c.save(); c.setLineDash([2, 12]); c.lineWidth = 2 * k; c.globalAlpha = .55; c.beginPath(); c.moveTo(b.x0 + 4, y); c.lineTo(b.x1, y); c.stroke(); c.restore(); }
      if (labels) { c.font = "700 " + Math.round(25 * k) + "px 'Space Mono'"; c.textAlign = "right"; c.fillText(labels.x, b.x1, b.y1 + 52 * k); c.textAlign = "left"; c.fillText(labels.y, b.x0 + 14, b.y0 - 24 * k); }
    });
  };

  /* s: {pink:[p..], blue:[p..], wiggle, ghost, trend, simple, pinkBars, blueBars, barFn, dim, k} */
  P.scatter = function (ctx, b, s) {
    var k = s.k || 1, i, N = 300;
    ctx.save(); ctx.beginPath(); ctx.rect(b.x0 - 2, b.y0 - 6, b.x1 - b.x0 + 12, b.y1 - b.y0 + 12); ctx.clip();
    // the pattern underneath (true trend): yellow
    if (s.trend > 0) R.ink(ctx, "y", function (c) { c.lineWidth = 9 * k; var pts = []; for (i = 0; i <= N * s.trend; i++) { var x = i / N; pts.push([mx(b, x), my(b, D.trend(x))]); } R.poly(c, pts, 9 * k); });
    // simple (degree 3) fit: yellow
    if (s.simple > 0) R.ink(ctx, "y", function (c) { var pts = []; for (i = 0; i <= N * s.simple; i++) { var x = i / N; pts.push([mx(b, x), my(b, D.simple(x))]); } R.poly(c, pts, 10 * k); });
    // wiggly interpolating curve: pink; ghost = faint dotted version
    var wig = function (upto) { var pts = [], steps = 700; for (i = 0; i <= steps * upto; i++) { var x = i / steps; pts.push([mx(b, x), my(b, clamp(D.wiggle(x), -.6, 1.6))]); } return pts; };
    if (s.wiggle > 0) R.ink(ctx, "p", function (c) { R.poly(c, wig(s.wiggle), 6.5 * k); });
    if (s.ghost > 0) R.ink(ctx, "p", function (c) { c.save(); c.globalAlpha = s.ghost; c.setLineDash([3, 10]); R.poly(c, wig(1), 5 * k); c.restore(); });
    // error bars: vertical, to scale
    var bars = function (ink, xs, ys, prog, fn) {
      if (!prog) return;
      R.ink(ctx, ink, function (c) {
        c.lineCap = "butt";
        for (var j = 0; j < xs.length; j++) {
          var pj = clamp(prog[j] == null ? 0 : prog[j], 0, 1); if (pj <= 0) continue;
          var y0 = my(b, ys[j]), y1 = my(b, clamp(fn(xs[j]), -.6, 1.6)), x = mx(b, xs[j]), yy = y0 + (y1 - y0) * pj;
          c.lineWidth = 4.5 * k; c.beginPath(); c.moveTo(x, y0); c.lineTo(x, yy); c.stroke();
          c.beginPath(); c.moveTo(x - 9 * k, yy); c.lineTo(x + 9 * k, yy); c.stroke();
        }
      });
    };
    if (s.pinkBars) bars("p", D.train.xs, D.train.ys, s.pinkBars, s.pinkFn || D.simple);
    if (s.blueBars) bars("b", D.test.xs, D.test.ys, s.blueBars, s.blueFn || D.wiggle);
    ctx.restore();
    // off-chart markers where a bar leaves the plot
    if (s.blueBars && (s.blueFn || D.wiggle) === D.wiggle) R.ink(ctx, "b", function (c) {
      for (var j = 0; j < D.test.xs.length; j++) { if ((s.blueBars[j] || 0) < 1) continue; var yv = D.wiggle(D.test.xs[j]); if (yv > 1.0 || yv < 0) { var x = mx(b, D.test.xs[j]), up = yv > 1, y = up ? b.y0 - 2 : b.y1 + 2; c.beginPath(); c.moveTo(x - 11 * k, y + (up ? 18 : -18) * k); c.lineTo(x, y); c.lineTo(x + 11 * k, y + (up ? 18 : -18) * k); c.closePath(); c.fill(); } }
    });
    // dots (halftone discs)
    var dr = 19 * k;
    if (s.pink) R.ink(ctx, "p", function (c) { for (i = 0; i < D.train.xs.length; i++) { var q = dotPose(s.pink[i] == null ? 0 : s.pink[i]); if (!q.on) continue; R.disc(c, "p", mx(b, D.train.xs[i]), my(b, D.train.ys[i]), dr * q.r, q.tone, Math.max(4, 6.5 * k)); } });
    if (s.blue) R.ink(ctx, "b", function (c) { for (i = 0; i < D.test.xs.length; i++) { var q = dotPose(s.blue[i] == null ? 0 : s.blue[i]); if (!q.on) continue; R.disc(c, "b", mx(b, D.test.xs[i]), my(b, D.test.ys[i]), dr * q.r, (s.dim ? .4 : 1) * q.tone, Math.max(4, 6.5 * k)); } });
  };

  /* the complexity chart. y axis 0..YMAX (real values; anything above leaves the chart with an arrow and its true value) */
  var YMAX = .42; P.YMAX = YMAX;
  P.chart = function (ctx, b, s) {
    var k = s.k || 1, d, i;
    var cx = function (deg) { return b.x0 + (b.x1 - b.x0) * (deg - .5) / 11; }, cy = function (v) { return b.y1 - (b.y1 - b.y0) * v / YMAX; };
    P.frame(ctx, { x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1 }, k, { x: "", y: "ERROR" });
    R.ink(ctx, "b", function (c) { c.font = "700 " + Math.round(25 * k) + "px 'Space Mono'"; c.textAlign = "right"; c.fillText("COMPLEXITY (DEGREE) >", b.x1, b.y1 + 70 * k); });
    R.ink(ctx, "b", function (c) { c.font = "700 " + Math.round(22 * k) + "px 'Space Mono'"; c.textAlign = "center"; for (d = 1; d <= 11; d += 2) c.fillText(String(d), cx(d), b.y1 + 34 * k); });
    ctx.save(); ctx.beginPath(); ctx.rect(b.x0 - 4, b.y0 - 14, b.x1 - b.x0 + 14, b.y1 - b.y0 + 14); ctx.clip();
    var line = function (ink, vals, prog, w) {
      R.ink(ctx, ink, function (c) {
        var pts = [], n = prog * 10;
        for (var q = 0; q <= n + 1e-6; q += .1) { var di = Math.min(10, q), lo = Math.floor(di), hi = Math.min(10, lo + 1), f = di - lo, v = vals[lo] + (vals[hi] - vals[lo]) * f; pts.push([cx(1 + di), cy(Math.min(v, YMAX * 1.15))]); }
        R.poly(c, pts, w * k);
        for (var j = 0; j <= Math.min(10, Math.floor(n + 1e-6)); j++) { if (vals[j] > YMAX) continue; c.beginPath(); c.arc(cx(j + 1), cy(vals[j]), 7.5 * k, 0, 6.2832); c.fill(); }
      });
    };
    if (s.train > 0) line("p", D.sim.train, s.train, 6.5);
    if (s.test > 0) line("b", D.sim.test, s.test, 6.5);
    ctx.restore();
    // off-chart arrows with the true values
    if (s.test > 0) R.ink(ctx, "b", function (c) {
      c.font = "700 " + Math.round(23 * k) + "px 'Space Mono'"; c.textAlign = "center";
      for (var j = 0; j < 11; j++) if (D.sim.test[j] > YMAX && s.test * 10 >= j - .05) { var x = cx(j + 1); c.beginPath(); c.moveTo(x - 12 * k, b.y0 + 16 * k); c.lineTo(x, b.y0 - 6 * k); c.lineTo(x + 12 * k, b.y0 + 16 * k); c.closePath(); c.fill(); c.fillText(D.sim.test[j].toFixed(2), x, b.y0 + 46 * k + (j === 9 ? 0 : 0)); }
    });
    // gap bracket and the best-complexity circle: yellow
    if (s.gap > 0) R.ink(ctx, "y", function (c) {
      var x = cx(9) + 22 * k, y0 = cy(D.sim.train[8]), y1 = cy(D.sim.test[8]), yy = y0 + (y1 - y0) * s.gap;
      c.lineWidth = 7 * k; c.lineCap = "round"; c.beginPath(); c.moveTo(x - 12 * k, y0); c.lineTo(x, y0); c.lineTo(x, yy); c.lineTo(x - 12 * k, yy); c.stroke();
      
    });
    if (s.best > 0) R.ink(ctx, "y", function (c) {
      var bx = cx(D.sim.best), by = cy(D.sim.test[D.sim.best - 1]); c.lineWidth = 8 * k; c.beginPath(); c.arc(bx, by, 26 * k, -1.2, -1.2 + 6.2832 * s.best); c.stroke();
      
    });
    if (s.gap > .9) R.ink(ctx, "b", function (c) { var x = cx(9) + 22 * k, y0 = cy(D.sim.train[8]), y1 = cy(D.sim.test[8]); c.font = "400 " + Math.round(40 * k) + "px 'Archivo Black'"; c.textAlign = "left"; c.fillText("GAP", x + 16 * k, (y0 + y1) / 2 + 12 * k); });
    if (s.best > .95) R.ink(ctx, "b", function (c) { var bx = cx(D.sim.best), by = cy(D.sim.test[D.sim.best - 1]); c.font = "400 " + Math.round(34 * k) + "px 'Archivo Black'"; c.textAlign = "center"; c.fillText("BEST", bx + 10 * k, by - 44 * k); });
    // legend (pink/blue)
    R.ink(ctx, "p", function (c) { c.font = "700 " + Math.round(24 * k) + "px 'Space Mono'"; c.textAlign = "left"; c.fillText("PINK DOTS (SEEN)", b.x0 + 24 * k, b.y0 + 34 * k); });
    R.ink(ctx, "b", function (c) { c.font = "700 " + Math.round(24 * k) + "px 'Space Mono'"; c.textAlign = "left"; c.fillText("BLUE DOTS (NEW)", b.x0 + 24 * k, b.y0 + 64 * k); });
  };

  /* big counter: label in mono, value in heavy type, single ink */
  P.counter = function (ctx, ink, label, val, x, y, size, align) {
    R.ink(ctx, ink, function (c) { c.textAlign = align || "left"; R.text(c, label, x, y, 30, "Space Mono", align || "left", 700); R.text(c, val, x, y + size * .95, size, "Archivo Black", align || "left"); });
  };
  /* heading in a single ink, auto fit to width */
  P.title = function (ctx, ink, txt, x, y, maxW, size) {
    var sz = size || 118; while (R.measure(ctx, txt, sz, "Archivo Black") > maxW && sz > 40) sz -= 2;
    R.ink(ctx, ink, function (c) { R.text(c, txt, x, y + sz * .8, sz, "Archivo Black", "left"); });
    return sz;
  };
  /* rubber stamp: bordered caps, rotated, rough edges come from the compositor */
  P.stamp = function (ctx, ink, txt, cx, cy, size, rot, p) {
    if (p <= 0) return;
    var sc = 1 + (1 - Math.min(1, p)) * .5;
    R.ink(ctx, ink, function (c) {
      c.save(); c.translate(cx, cy); c.rotate(rot); c.scale(sc, sc);
      var w = R.measure(c, txt, size, "Archivo Black") + size * .9, h = size * 1.55;
      c.lineWidth = size * .09; c.strokeRect(-w / 2, -h / 2, w, h); c.lineWidth = size * .035; c.strokeRect(-w / 2 + size * .18, -h / 2 + size * .18, w - size * .36, h - size * .36);
      c.textAlign = "center"; c.font = "400 " + size + "px 'Archivo Black'"; c.fillText(txt, 0, size * .34);
      c.restore();
    });
  };

  P.header = function (ctx, ink, title, sub, subInk) {
    R.marks(ctx);
    R.ink(ctx, "b", function (c) { R.text(c, "MEMORIZING VS LEARNING", 110, 156, 26, "Space Mono", "left", 700); });
    var sz = P.title(ctx, ink, title, 110, 188, 860);
    if (sub) R.ink(ctx, subInk || "b", function (c) { R.text(c, sub, 110, 188 + sz * .8 + 58, 26, "Space Mono", "left", 700); });
    return sz;
  };
})();
