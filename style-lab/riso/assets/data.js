/* data.js - the real numbers behind every chart. Seeded, deterministic, computed at load (no Math.random). */
(function () {
  var W = typeof window !== "undefined" ? window : globalThis;
  var mulberry32 = function (a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  var D = {};
  D.trend = function (x) { return 0.5 + 0.24 * Math.sin(1.6 * Math.PI * x + 0.5) + 0.06 * x; };
  function gauss(r) { var u = Math.max(1e-9, r()), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  var SIG = 0.07;
  function sample(r, n, jitter, noiseClip) {
    var xs = [], ys = [];
    for (var i = 0; i < n; i++) {
      var x = 0.04 + 0.92 * (i + (jitter == null ? .15 + .7 * r() : jitter + (1 - 2 * jitter) * r())) / n;
      var e = Math.max(-2 * SIG, Math.min(2 * SIG, gauss(r) * SIG));
      xs.push(x); ys.push(D.trend(x) + e);
    }
    return { xs: xs, ys: ys };
  }
  /* least squares polynomial fit in the Chebyshev basis on u = 2x - 1 (well conditioned up to degree 11) */
  function cheb(u, k) { var t0 = 1, t1 = u; if (k === 0) return 1; if (k === 1) return u; for (var i = 2; i <= k; i++) { var t2 = 2 * u * t1 - t0; t0 = t1; t1 = t2; } return t1; }
  function solve(A, b) {
    var n = b.length, M = A.map(function (r, i) { return r.concat([b[i]]); });
    for (var c = 0; c < n; c++) {
      var p = c; for (var r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      var tmp = M[c]; M[c] = M[p]; M[p] = tmp;
      for (var r2 = c + 1; r2 < n; r2++) { var f = M[r2][c] / M[c][c]; for (var k = c; k <= n; k++) M[r2][k] -= f * M[c][k]; }
    }
    var x = new Array(n); for (var i = n - 1; i >= 0; i--) { var s = M[i][n]; for (var j = i + 1; j < n; j++) s -= M[i][j] * x[j]; x[i] = s / M[i][i]; }
    return x;
  }
  D.fit = function (xs, ys, deg) {
    var m = deg + 1, A = [], b = [], i, j, k;
    for (j = 0; j < m; j++) { A.push(new Array(m).fill(0)); b.push(0); }
    for (i = 0; i < xs.length; i++) { var u = 2 * xs[i] - 1, row = []; for (j = 0; j < m; j++) row.push(cheb(u, j)); for (j = 0; j < m; j++) { b[j] += row[j] * ys[i]; for (k = 0; k < m; k++) A[j][k] += row[j] * row[k]; } }
    for (j = 0; j < m; j++) A[j][j] += 1e-12;
    var c = solve(A, b);
    return function (x) { var u = 2 * x - 1, s = 0; for (var q = 0; q < m; q++) s += c[q] * cheb(u, q); return s; };
  };
  /* the interpolating polynomial through every point, in barycentric form (stable for 12 points) */
  D.interp = function (xs, ys) {
    var n = xs.length, w = [], i, j;
    for (i = 0; i < n; i++) { var p = 1; for (j = 0; j < n; j++) if (j !== i) p *= (xs[i] - xs[j]); w.push(1 / p); }
    return function (x) {
      var num = 0, den = 0;
      for (i = 0; i < n; i++) { var d = x - xs[i]; if (Math.abs(d) < 1e-12) return ys[i]; var t = w[i] / d; num += t * ys[i]; den += t; }
      return num / den;
    };
  };
  function rmse(fn, xs, ys) { var s = 0; for (var i = 0; i < xs.length; i++) { var e = fn(xs[i]) - ys[i]; s += e * e; } return Math.sqrt(s / xs.length); }
  function mae(fn, xs, ys) { var s = 0; for (var i = 0; i < xs.length; i++) s += Math.abs(fn(xs[i]) - ys[i]); return s / xs.length; }
  var r = mulberry32(90210);
  D.train = sample(r, 12);
  D.test = sample(mulberry32(31337), 8, 0.1);
  D.wiggle = D.interp(D.train.xs, D.train.ys);
  D.simple = D.fit(D.train.xs, D.train.ys, 3);
  D.err = {
    trainWiggle: mae(D.wiggle, D.train.xs, D.train.ys) * 100,
    testWiggle: mae(D.wiggle, D.test.xs, D.test.ys) * 100,
    trainSimple: mae(D.simple, D.train.xs, D.train.ys) * 100,
    testSimple: mae(D.simple, D.test.xs, D.test.ys) * 100
  };
  /* the complexity chart: degrees 1..11, fits to 12 seeded points, averaged over 160 seeded datasets, tested on 60 fresh points each */
  D.sim = (function () {
    var RUNS = 160, tr = new Array(12).fill(0), te = new Array(12).fill(0);
    for (var run = 0; run < RUNS; run++) {
      var rr = mulberry32(5000 + run), a = sample(rr, 12), tx = [], ty = [];
      for (var q = 0; q < 60; q++) { var x = 0.03 + 0.94 * (q + .5) / 60, e = Math.max(-2 * SIG, Math.min(2 * SIG, gauss(rr) * SIG)); tx.push(x); ty.push(D.trend(x) + e); }
      for (var d = 1; d <= 11; d++) { var f = d === 11 ? D.interp(a.xs, a.ys) : D.fit(a.xs, a.ys, d); tr[d] += rmse(f, a.xs, a.ys); te[d] += rmse(f, tx, ty); }
    }
    var out = { train: [], test: [] }; for (var d2 = 1; d2 <= 11; d2++) { out.train.push(tr[d2] / RUNS); out.test.push(te[d2] / RUNS); }
    var mi = 0; out.test.forEach(function (v, i) { if (v < out.test[mi]) mi = i; }); out.best = mi + 1;
    return out;
  })();
  W.RisoData = D;
  if (typeof module !== "undefined") module.exports = D;
})();
