/* model.js - the whole cache story as pure functions of time t (seconds).
   No accumulated state anywhere: the 3D world and the HUD both ask this file what is true at time t.
   Works in the browser (window.ISO) and in node (globalThis.ISO) so build.mjs can list events for audio. */
(function (g) {
  var ISO = (g.ISO = g.ISO || {});
  var T = g.TIMING;
  var Wd = function (l, w) { return T.lines[l].words[w].start; };
  var We = function (l, w) { return T.lines[l].words[w].end; };

  /* ---------- seeded randomness ---------- */
  function mulberry32(a) { return function () { a |= 0; a = (a + 0x6d2b79f5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  ISO.mulberry32 = mulberry32;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (p) { p = clamp(p, 0, 1); return p * p * (3 - 2 * p); };
  var outBack = function (p, s) { p = clamp(p, 0, 1); s = s == null ? 1.7 : s; var q = p - 1; return 1 + q * q * ((s + 1) * q + s); };
  var outCubic = function (p) { p = clamp(p, 0, 1); return 1 - Math.pow(1 - p, 3); };
  var spring = function (p, decay, cyc) { p = clamp(p, 0, 1); return p >= 1 ? 1 : 1 - Math.exp(-decay * p) * Math.cos(2 * Math.PI * cyc * p); };
  ISO.u = { clamp: clamp, smooth: smooth, outBack: outBack, outCubic: outCubic, spring: spring };

  /* ---------- constants (world units; +x runs toward the crowd, tile top is y=0) ---------- */
  var C = (ISO.C = {
    N: 1000, V: 4,                      // belt speed, units per second, constant
    CUBE: 0.22, BELT_Y: 0.12,
    GATE_X: 2.0, X0: 7.9,
    ZIN: -0.9, ZOUT: 0.9,
    CX0: -2.4, CX1: -0.2,               // cache west/east faces
    TABLE_X: -1.2, LAT_X: -0.5,         // shelf position, and where hits cross from the in lane to the out lane
    DB_X: -5.6, DB_DOOR: -4.4,
    OUT_X: 0.9, BIN_Z: 2.35,
    HITS_TOTAL: 900, MISS_TOTAL: 100
  });

  /* ---------- beat times, taken from the voice ---------- */
  var B = (ISO.B = {
    flood0: 0.12, floodDur: 4.4,
    cacheDrop: Wd(2, 0) + 0.25, cacheLand: Wd(2, 0) + 0.25 + 0.55,
    labelCache: Wd(2, 9) - 0.1,
    gateOpen: Wd(3, 0) - 0.25,
    R0: Wd(3, 1) - 0.1,
    hits0: Wd(4, 1) + 0.0,
    recolor0: Wd(5, 1), recolor1: Wd(5, 7),
    dial0: Wd(5, 8), dial1: We(5, 15),
    sink0: Wd(6, 0) + 0.1, sink1: Wd(6, 0) + 1.1,
    ringOn: Wd(6, 9) - 0.6, ringRun0: Wd(6, 10) + 0.1, ringRun1: Wd(6, 10) + 0.1 + 2.1,
    staleSeen: Wd(6, 4),
    pull0: Wd(7, 0) - 0.1, pull1: Wd(7, 0) + 1.7
  });

  /* ---------- camera: true isometric elevation, azimuth drifts at most 4.5 degrees ---------- */
  var EL = Math.atan(1 / Math.SQRT2);                    // 35.264 degrees: axes land at 30 degrees on screen
  ISO.cam = function (t) {
    var drift = Math.sin(t * 0.34 + 0.6) * (4.5 * Math.PI / 180) * smooth(t / 2.5);
    var aS = smooth((t - B.sink0) / 1.2);                          // the crowd slab is gone: re-centre on what is left
    var p7 = smooth((t - B.sink1) / 0.9), p8 = smooth((t - B.pull0) / (B.pull1 - B.pull0)), push = p7 * (1 - p8);
    var az = Math.PI / 4 + drift;
    return { az: az, el: EL, k: 70 + 22 * aS + 16 * push, tx: -2.4 * aS + 1.2 * push, ty: 0.7 * push, tz: 0.35 * push, sx: 540, sy: 850 + 50 * p8 };
  };
  /* orthographic projection of a world point to frame pixels */
  ISO.proj = function (x, y, z, t) {
    var c = ISO.cam(t), ca = Math.cos(c.az), sa = Math.sin(c.az), ce = Math.cos(c.el), se = Math.sin(c.el);
    var dx = x - c.tx, dy = y - c.ty, dz = z - c.tz;
    // camera sits at (+sin az, ., +cos az) looking at the target: right = (cos az, 0, -sin az), up tilted by elevation
    var r = dx * ca - dz * sa;
    var d = dx * sa + dz * ca;                          // distance toward the camera along the ground
    var u = dy * ce - d * se;
    return { x: c.sx + c.k * r, y: c.sy + c.k * u * -1 * -1 * 1 - 0, depth: d * ce + dy * se };
  };
  // screen y grows downward: points nearer the camera (larger d) are lower on screen, higher y is higher
  ISO.proj = function (x, y, z, t) {
    var c = ISO.cam(t), ca = Math.cos(c.az), sa = Math.sin(c.az), ce = Math.cos(c.el), se = Math.sin(c.el);
    var dx = x - c.tx, dy = y - c.ty, dz = z - c.tz;
    var r = dx * ca - dz * sa, d = dx * sa + dz * ca;
    return { x: c.sx + c.k * r, y: c.sy + c.k * (d * se - dy * ce) };
  };

  /* ---------- the crowd: 1,000 request cubes ---------- */
  var ROWW = 54, ACROSS = 18, LAYER_H = 0.235;
  var slotX = function (i) { return 2.45 + Math.floor(i / ROWW) * 0.26; };
  var slotZ = function (i) { return -2.52 + ((i % ROWW) % ACROSS) * 0.2965; };
  var slotY = function (i) { return C.BELT_Y + C.CUBE / 2 + Math.floor((i % ROWW) / ACROSS) * LAYER_H; };
  ISO.slot = function (i) { return { x: slotX(i), y: slotY(i), z: slotZ(i) }; };
  var spawn = function (i) { return B.flood0 + (i / C.N) * B.floodDur; };
  var arrive = function (i) { return spawn(i) + (C.X0 - slotX(i)) / C.V; };
  ISO.spawnT = spawn; ISO.arriveT = arrive;

  /* a request is a miss or a hit; exactly 100 of the 1,000 are misses; cube 0 is the first (cold cache) miss */
  var status = new Array(C.N), perm = [], pr = mulberry32(20201);
  (function () {
    var k; for (k = 1; k < C.N; k++) perm.push(k);
    for (k = perm.length - 1; k > 0; k--) { var j = Math.floor(pr() * (k + 1)), tmp = perm[k]; perm[k] = perm[j]; perm[j] = tmp; }
    for (k = 0; k < C.N; k++) status[k] = 1;            // 1 = hit
    status[0] = 0;
    for (k = 0; k < C.MISS_TOTAL - 1; k++) status[perm[k]] = 0;
  })();
  ISO.status = status;

  /* released cubes: cube 0 runs the miss story; cubes 1.. stream through as hits (beat 5) */
  var rel = [];                                           // release time per cube (index order)
  (function () {
    rel[0] = B.R0;
    var t = B.hits0, m = 0;
    while (t < Wd(5, 0) + 0.2 && rel.length < 600) { rel.push(t); var d = Math.max(0.035, 0.16 * Math.pow(0.95, m)); t += d; m++; }
  })();
  ISO.releaseCount = rel.length;
  var hold = function (arr, pts, speed, holdsAt) { return arr; };

  /* path builder: points {x,y,z,hold,arc,hide,gem}; walking at constant V; returns keyframes */
  function walk(t0, pts) {
    var kf = [], t = t0, i, p = pts[0];
    kf.push({ t: t, x: p.x, y: p.y, z: p.z, flag: p.flag || 0, vis: 1 });
    for (i = 1; i < pts.length; i++) {
      var q = pts[i], dx = q.x - p.x, dz = q.z - p.z, dist = Math.sqrt(dx * dx + dz * dz), dt = dist / C.V;
      if (q.dur != null) dt = q.dur;
      t += dt; kf.push({ t: t, x: q.x, y: q.y, z: q.z, arc: q.arc || 0, flag: q.flag != null ? q.flag : kf[kf.length - 1].flag, vis: q.vis == null ? 1 : q.vis, hold: 0 });
      if (q.hold) { t += q.hold; kf.push({ t: t, x: q.x, y: q.y, z: q.z, arc: 0, flag: q.flag2 != null ? q.flag2 : kf[kf.length - 1].flag, vis: q.vis2 == null ? kf[kf.length - 1].vis : q.vis2, hold: 1 }); }
      p = q;
    }
    return kf;
  }
  var YC = C.BELT_Y + C.CUBE / 2;
  var paths = {};
  function pathFor(i) {
    if (paths[i]) return paths[i];
    var s = ISO.slot(i), r = rel[i], off = [-0.3, 0, 0.3][i % 3], zi = C.ZIN + off, zo = C.ZOUT + off, pts, kf;
    if (i === 0) {
      /* the cold miss: gate, cache, empty shelf, database, answer comes back with a golden core, a copy is shelved */
      pts = [
        { x: s.x, y: s.y, z: s.z },
        { x: C.GATE_X + 0.15, y: YC, z: zi, arc: 0.6 },
        { x: C.CX1, y: YC, z: zi },
        { x: C.TABLE_X - 0.2, y: YC, z: zi, hold: 0.55 },
        { x: C.CX0, y: YC, z: zi },
        { x: C.DB_DOOR + 0.15, y: YC, z: zi, hold: 0.0, vis2: 0 },
        { x: C.DB_DOOR + 0.15, y: YC, z: zo, dur: 0.75, vis: 0, flag: 1 },       // inside the database: asked, answered
        { x: C.DB_DOOR + 0.15, y: YC, z: zo, dur: 0.01, vis: 1, flag: 1 },
        { x: C.CX0, y: YC, z: zo },
        { x: C.TABLE_X - 0.2, y: YC, z: zo, hold: 0.0 },
        { x: C.CX1, y: YC, z: zo },
        { x: C.OUT_X, y: YC, z: zo },
        { x: C.OUT_X, y: YC, z: C.BIN_Z - 0.1 },
        { x: C.OUT_X, y: YC - 0.25, z: C.BIN_Z + 0.2, vis: 0, dur: 0.12 }
      ];
    } else {
      pts = [
        { x: s.x, y: s.y, z: s.z },
        { x: C.GATE_X + 0.15, y: YC, z: zi, arc: 0.55 },
        { x: C.CX1, y: YC, z: zi },
        { x: C.LAT_X, y: YC, z: zi },
        { x: C.LAT_X, y: YC, z: zo, flag: 1 },               // crosses the shelf: picks up the answer
        { x: C.CX1, y: YC, z: zo },
        { x: C.OUT_X + off * 0.5, y: YC, z: zo },
        { x: C.OUT_X + off * 0.5, y: YC, z: C.BIN_Z - 0.1 },
        { x: C.OUT_X + off * 0.5, y: YC - 0.25, z: C.BIN_Z + 0.2, vis: 0, dur: 0.12 }
      ];
    }
    kf = walk(r, pts);
    return (paths[i] = kf);
  }
  ISO.path0 = function () { return pathFor(0); };
  /* key moments of the cold miss, read from the real path */
  (function () {
    var k = pathFor(0), E = ISO.E = {};
    E.enter = k[2].t; E.check0 = k[3].t; E.check1 = k[4].t; E.dbIn = k[5].t; E.dbOut = k[7].t;
    E.copy = k[9].t; E.binned = k[k.length - 1].t;
  })();

  function evalKF(kf, t) {
    var n = kf.length, lo = 0, hi = n - 1;
    if (t <= kf[0].t) return null;
    if (t >= kf[hi].t) return { x: kf[hi].x, y: kf[hi].y, z: kf[hi].z, flag: kf[hi].flag, vis: kf[hi].vis, done: true };
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (kf[mid].t <= t) lo = mid; else hi = mid; }
    var a = kf[lo], b = kf[hi], p = (t - a.t) / Math.max(1e-6, b.t - a.t), arc = b.arc || 0;
    return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p + arc * 4 * p * (1 - p), z: a.z + (b.z - a.z) * p, flag: p >= 1 ? b.flag : a.flag, vis: p > .5 ? b.vis : a.vis, done: false };
  }

  /* ---------- the sink: the crowd slab drops into the ground (beat 7) ---------- */
  ISO.sink = function (t) { return smooth((t - B.sink0) / (B.sink1 - B.sink0)); };

  /* ---------- state of request cube i at time t ---------- */
  var gate0 = B.gateOpen;
  ISO.cube = function (i, t) {
    var s = ISO.slot(i), sp = spawn(i), ar = arrive(i), out = { x: 0, y: 0, z: 0, sc: 1, vis: 1, flag: 0, col: 0 };
    if (t < sp) { out.vis = 0; return out; }
    var hitCol = (t >= B.recolor0 + (i / C.N) * (B.recolor1 - B.recolor0)) && status[i] === 1 ? 1 : 0;
    out.col = hitCol;
    if (i < rel.length && t >= rel[i]) {
      var r = evalKF(pathFor(i), t);
      if (!r) { out.x = s.x; out.y = s.y; out.z = s.z; return out; }
      out.x = r.x; out.y = r.y; out.z = r.z; out.flag = r.flag; out.vis = r.vis ? 1 : 0; out.col = 0;
      if (r.done && r.vis === 0) out.vis = 0;
      // vanish into the bin: squash
      return out;
    }
    if (t < ar) { out.x = Math.max(s.x, C.X0 - C.V * (t - sp)); out.y = s.y; out.z = s.z; }
    else { out.x = s.x; out.y = s.y; out.z = s.z; var q = (t - ar); if (q < 0.18) out.y += Math.abs(Math.sin(q / .18 * Math.PI)) * 0.06; }
    // a cube that has been released leaves its slot empty
    return out;
  };

  /* ---------- counters ---------- */
  var arrSorted = null;
  ISO.arrived = function (t) {
    var n = 0, i; for (i = 0; i < C.N; i++) if (arrive(i) <= t) n++; return n;
  };
  ISO.waiting = function (t) {
    var n = ISO.arrived(t), gone = 0, i;
    for (i = 0; i < rel.length; i++) if (t >= rel[i]) gone++;
    return n - gone;
  };
  ISO.served = function (t) {      // answered and binned
    var n = 0, i; for (i = 0; i < rel.length; i++) { var k = pathFor(i); if (t >= k[k.length - 1].t) n++; } return n;
  };
  ISO.dbHits = function (t) { return (t >= E_dbIn() ? 1 : 0) + (t >= storyFresh().dbIn ? 1 : 0); };
  function E_dbIn() { return ISO.E.dbIn; }

  /* tally for the 1,000-request picture: exact, computed from the status table */
  ISO.tally = function () { var h = 0, m = 0, i; for (i = 0; i < C.N; i++) { if (status[i]) h++; else m++; } return { hits: h, misses: m }; };
  ISO.dbLoad = function (t) {          // percent of the no-cache load that still reaches the database
    var tl = ISO.tally(), end = tl.misses / C.N * 100;
    if (t < B.dial0) return 100;
    return 100 + (end - 100) * smooth((t - B.dial0) / (B.dial1 - B.dial0));
  };
  ISO.boardCount = function (t) { return Math.round(C.N * smooth((t - B.recolor0 + 0.3) / 0.6)); };

  /* ---------- story cubes for the cache time limit (beat 7) ---------- */
  var SC = null;
  function storyBuild() {
    if (SC) return SC;
    var yc = YC, zi = C.ZIN, zo = C.ZOUT;
    var tB = B.ringRun1 - 1.15;             // arrives at the cache while the copy is brown: served stale
    var A = walk(tB, [
      { x: C.GATE_X + 0.1, y: yc, z: zi },
      { x: C.CX1, y: yc, z: zi }, { x: C.LAT_X, y: yc, z: zi },
      { x: C.LAT_X, y: yc, z: zo, flag: 2 },
      { x: C.CX1, y: yc, z: zo }, { x: C.OUT_X, y: yc, z: zo }, { x: C.OUT_X, y: yc, z: C.BIN_Z - 0.1 },
      { x: C.OUT_X, y: yc - 0.25, z: C.BIN_Z + 0.2, vis: 0, dur: 0.12 }
    ]);
    var tC = B.ringRun1 + 0.35;             // after the copy is discarded: a fresh fetch
    var F = walk(tC, [
      { x: C.GATE_X + 0.1, y: yc, z: zi },
      { x: C.CX1, y: yc, z: zi },
      { x: C.TABLE_X - 0.2, y: yc, z: zi, hold: 0.55 },
      { x: C.CX0, y: yc, z: zi },
      { x: C.DB_DOOR + 0.15, y: yc, z: zi, vis2: 0 },
      { x: C.DB_DOOR + 0.15, y: yc, z: zo, dur: 0.75, vis: 0, flag: 1 },
      { x: C.DB_DOOR + 0.15, y: yc, z: zo, dur: 0.01, vis: 1, flag: 1 },
      { x: C.CX0, y: yc, z: zo }, { x: C.TABLE_X - 0.2, y: yc, z: zo },
      { x: C.CX1, y: yc, z: zo }, { x: C.OUT_X, y: yc, z: zo }, { x: C.OUT_X, y: yc, z: C.BIN_Z - 0.1 },
      { x: C.OUT_X, y: yc - 0.25, z: C.BIN_Z + 0.2, vis: 0, dur: 0.12 }
    ]);
    SC = { A: A, F: F, tA: A[0].t, tF: F[0].t, staleAt: A[3].t, dbIn: F[5].t, freshAt: F[8].t, flagAt: A[4].t };
    return SC;
  }
  function storyFresh() { return storyBuild(); }
  ISO.story = storyBuild;
  ISO.storyCube = function (which, t) {
    var S = storyBuild(), kf = which === 0 ? S.A : S.F, st = kf[0].t - 0.3;
    if (t < st) return { vis: 0 };
    if (t < kf[0].t) { var p = (t - st) / 0.3; return { vis: 1, x: kf[0].x, y: kf[0].y, z: kf[0].z, sc: spring(p, 6, 1.1), flag: 0 }; }
    var r = evalKF(kf, t); if (!r) return { vis: 0 };
    return { vis: r.vis ? 1 : 0, x: r.x, y: r.y, z: r.z, sc: 1, flag: r.flag };
  };

  /* ---------- the shelf copy: age, colour and timer ring ---------- */
  ISO.copy = function (t) {
    // returns {vis, pop, brown 0..1, ring 0..1 (remaining), flagged}
    var S = storyBuild(), out = { vis: 0, pop: 0, brown: 0, ring: 0, discard: 0 };
    var made = ISO.E.copy;
    if (t < made) return out;
    out.vis = 1; out.pop = spring((t - made) / 0.5, 6, 1.3);
    if (t >= B.ringOn) out.ring = t < B.ringRun0 ? smooth((t - B.ringOn) / 0.5) : 1 - clamp((t - B.ringRun0) / (B.ringRun1 - B.ringRun0), 0, 1) * 1;
    if (t >= B.ringRun0) out.brown = smooth((t - (B.ringRun0 + 0.5)) / (B.ringRun1 - B.ringRun0 - 0.5));
    if (t >= B.ringRun1) { out.discard = clamp((t - B.ringRun1) / 0.35, 0, 1); if (t >= S.freshAt) { out.vis = 1; out.discard = 0; out.brown = 0; out.pop = spring((t - S.freshAt) / 0.5, 6, 1.3); } }
    return out;
  };

  /* ---------- the database: LED colour and roof shake ---------- */
  ISO.db = function (t) {
    var S = storyBuild(), over = t < B.hits0 + 0.9;   // overloaded until the cache shields it
    var busy = (t >= ISO.E.dbIn && t < ISO.E.dbOut) || (t >= S.dbIn && t < S.dbIn + 0.76);
    var shake = 0;
    if (t > 0.9 && t < B.cacheLand + 2.0) shake = 1;
    else if (busy) shake = 0.6;
    var led = t < B.hits0 + 0.9 ? 0 : 1;               // 0 red, 1 green
    if (t >= B.gateOpen && t < B.hits0 + 0.9) led = busy ? 0 : 0;
    return { led: led, shake: shake, busy: busy };
  };

  /* ---------- the cache building drops in ---------- */
  ISO.cacheY = function (t) {
    if (t < B.cacheDrop) return 9;
    var p = (t - B.cacheDrop) / (B.cacheLand - B.cacheDrop);
    if (p < 1) return 9 * (1 - p * p);
    var q = (t - B.cacheLand) / 0.6;
    return q < 1 ? Math.exp(-q * 5) * Math.sin(q * Math.PI * 2.4) * 0.35 : 0;
  };
  ISO.gateOpenAmt = function (t) { return smooth((t - B.gateOpen) / 0.45); };

  /* ---------- audio event list ---------- */
  ISO.events = function () {
    var ev = [], S = storyBuild(), i;
    ev.push({ n: "rise", t: 0.05 }); ev.push({ n: "hum", t: 0 });
    for (i = 0; i < 40; i++) ev.push({ n: "tick", t: spawn(Math.round(i * 25)), v: 0.4 });
    ev.push({ n: "drop", t: B.cacheLand }); ev.push({ n: "gate", t: B.gateOpen + 0.25 });
    ev.push({ n: "miss", t: ISO.E.check0 + 0.1 }); ev.push({ n: "db", t: ISO.E.dbIn }); ev.push({ n: "copy", t: ISO.E.copy });
    for (i = 1; i < rel.length; i += 2) ev.push({ n: "hit", t: pathFor(i)[4].t, v: 0.3 });
    ev.push({ n: "green", t: B.hits0 + 0.9 });
    ev.push({ n: "recolor", t: B.recolor0 }); ev.push({ n: "dial", t: B.dial0 });
    ev.push({ n: "sink", t: B.sink0 });
    ev.push({ n: "ring", t: B.ringOn }); ev.push({ n: "stale", t: S.flagAt }); ev.push({ n: "discard", t: B.ringRun1 });
    ev.push({ n: "db", t: S.dbIn }); ev.push({ n: "copy", t: S.freshAt });
    ev.push({ n: "sign", t: Wd(7, 0) + 0.4 }); ev.push({ n: "sign", t: Wd(7, 3) }); ev.push({ n: "sign", t: Wd(7, 5) });
    ev.sort(function (a, b) { return a.t - b.t; });
    return ev;
  };
})(typeof window !== "undefined" ? window : globalThis);
