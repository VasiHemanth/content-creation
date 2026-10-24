/* story.js - the backpropagation story as pure functions of time */
(function () {
  var W = window, C = W.CLAYC, T3 = THREE, kf = C.kf, kfv = C.kfv, seg = C.seg, bell = C.bell, EZ = C.EZ, w = C.w, we = C.we, COL = C.COL, hash01 = W.hash01;
  var PI = Math.PI, RW = C.RW, S = W.STORY;
  function lerp(a, b, p) { return a + (b - a) * p; }
  function cb(x) { return Math.cbrt(x); }

  W.makeStory = function (wd) {
    var P = wd.P, JP = wd.JP, wk = wd.wk, judge = wd.judge, cam = wd.cam;
    var truthR = C.TRUTH;
    /* ---- key times (seconds), all tied to spoken words ---- */
    var T = {
      press: 1.25, handOut: 2.5, worry: w(1, 6),
      hop: [w(2, 0), w(2, 1), w(2, 2)], take: w(2, 9), sq0: w(2, 12) - .1,
      tossJ: w(3, 0) + .15, toTruth: w(3, 10) - .25, ruler0: w(3, 5) - .1, ruler1: w(3, 12) + .2, wedge0: w(3, 12), tag: w(3, 20) - .35,
      peel: w(4, 2) - .35, lumpToss: w(4, 4) + .3, ask3: w(4, 8), fault: w(4, 15) - .1,
      pinch3: w(5, 1) + .35, toss3: w(5, 5) + .1, ask2: w(5, 8), pinch2: w(5, 10) + .4, toss2: w(5, 12) + .1, pinch1: w(5, 15) + .6,
      merge: w(6, 0) + .4, big: w(6, 8) - .1, small: w(6, 12) - .1,
      dial: [w(7, 0) + .5, w(7, 0) + .85, w(7, 0) + 1.1], replay: w(7, 11) - .8, loops: [w(8, 0) + .4, w(8, 0) + 1.7, w(8, 7) + .0, w(8, 12) - .1],
      five: we(8, 16)
    };
    T.stamp = T.five + 1.35; T.title = T.five + 2.15;

    /* ---- ball passes ---- */
    var passes = [
      { app: 1.3, t0: T.sq0, sq: .5, td: .4, r0: C.R0, truth: C.TRUTH, m: C.M0, last: T.tossJ, ld: .5 },
      { app: T.replay - .3, t0: T.replay, sq: .32, td: .3, r0: C.R0, truth: C.TRUTH, m: S.M1, last: T.replay + 1.8, ld: .4 }
    ];
    var lt = [.4, .33, .26, .2];
    C.LOOPS.forEach(function (L, i) { var t0 = T.loops[i]; passes.push({ app: t0 - .1, t0: t0, sq: lt[i] * .45, td: lt[i] * .4, r0: L.r0, truth: L.r0, m: L.m, last: t0 + 3 * lt[i] * .85 + .05, ld: lt[i] * .45 }); });
    passes.forEach(function (p) { p.rout = []; var r = p.r0; for (var i = 0; i < 3; i++) { p.rin = p.rin || []; p.rin.push(r); r = r * p.m[i]; p.rout.push(r); } p.arrive = p.last + p.ld; p.res = r; p.tS = [0, 1, 2].map(function (i) { return p.t0 + i * (p.sq + p.td); }); });
    var hand = function (i) { var p = P[i]; return [p[0] + .3, 1.12, p[2] + .68]; };
    var ansSpot = function (r) { return [-.12, .14 + r, -3.1]; }, truthSpot = function (r) { return [1.08, .14 + r, -3.1]; };
    var jhand = [JP[0] - .35, 2.1, JP[2] + .75];
    function arc(a, b, p, h) { return [lerp(a[0], b[0], p), lerp(a[1], b[1], p) + h * 4 * p * (1 - p), lerp(a[2], b[2], p)]; }

    /* ---- ball state ---- */
    function ballState(ts) {
      for (var k = 0; k < passes.length; k++) {
        var p = passes[k]; if (ts < p.app || ts > p.arrive + .001) continue;
        var pos, r, sq = 0, appear = Math.min(1, (ts - p.app) / .25);
        if (ts < p.tS[0]) { pos = hand(0); r = p.r0; pos = [pos[0], pos[1] + .08 * bell(ts, p.t0 - .8, p.t0 - .1), pos[2]]; }
        else {
          pos = null;
          for (var i = 0; i < 3; i++) {
            var s0 = p.tS[i], s1 = s0 + p.sq, s2 = i < 2 ? s1 + p.td : p.last, s3 = i < 2 ? s2 : p.last + p.ld;
            if (ts >= s0 && ts < s1) { var u = (ts - s0) / p.sq; r = lerp(p.rin[i], p.rout[i], EZ.io(u)); pos = hand(i); sq = .38 * Math.sin(u * PI * 3) * (1 - u * .4); break; }
            if (i < 2 && ts >= s1 && ts < s1 + p.td) { var u2 = (ts - s1) / p.td; pos = arc(hand(i), hand(i + 1), u2, 1.0); r = p.rout[i]; sq = -.12 * Math.sin(u2 * PI); break; }
            if (i === 2 && ts >= s1 && ts < p.last) { pos = hand(2); r = p.rout[2]; break; }
            if (i === 2 && ts >= p.last) { var u3 = (ts - p.last) / p.ld; pos = arc(hand(2), ansSpot(p.rout[2]), EZ.io(u3), 1.6); r = p.rout[2]; sq = -.1 * Math.sin(u3 * PI); break; }
          }
          if (!pos) { pos = hand(2); r = p.rout[2]; }
        }
        return { vis: true, pos: pos, r: r * appear, sq: sq, k: k };
      }
      return { vis: false };
    }
    function ansState(ts) { var r = 0, k = -1; passes.forEach(function (p, i) { if (ts >= p.arrive) { r = p.res; k = i; } }); return { r: r, k: k }; }
    function truthState(ts) { var r = 0, t0 = T.toTruth, k = 0; if (ts < t0) return 0; var rr = C.TRUTH; passes.forEach(function (p, i) { if (i > 0 && ts >= p.app) rr = p.truth; }); return rr * Math.min(1, (ts - t0) / .3); }

    /* ---- moods ---- */
    function moodC(i, ts) {
      var ask = [T.ask3, T.ask2, T.pinch1 - .9][2 - i], res = [T.pinch3, T.pinch2, T.pinch1][2 - i];
      return kf(ts, [[0, .35], [T.worry, .35, "o"], [T.worry + .35, -.7, "o"], [ask - .1, -.7], [ask, 0], [res, 0], [res + .3, .95, "o"], [T.dial[0], .95], [T.dial[0] + .5, .5], [T.five - .2, .5], [T.five, 1]]);
    }
    function qMouth(i, ts) { var ask = [T.ask3, T.ask2, T.pinch1 - .9][2 - i], res = [T.pinch3, T.pinch2, T.pinch1][2 - i]; return ts >= ask && ts < res + .15 ? 1 : 0; }

    function setFace(c, cu, o, brow) {
      c.mouth.visible = !o; c.mO.visible = !!o; var a = Math.max(.1, Math.abs(cu));
      c.mouth.scale.set(1, a, 1); c.mouth.rotation.z = cu >= 0 ? PI : 0; c.mouth.position.y = c.cy + (cu >= 0 ? .035 * a : -.01 - .045 * a * 0) - (cu >= 0 ? 0 : .0);
      c.brows.forEach(function (b) { var tilt = brow; b.m.rotation.z = PI / 2 - b.s * tilt * .5; b.m.position.y = b.y + (o ? .05 : 0) + Math.abs(tilt) * .01; });
    }

    /* ---- hops / squash ---- */
    function hopS(list, ts) { var y = 0, sq = 0; list.forEach(function (e) { var t = e[0], h = e[1], d = e[2] || .5; if (ts >= t - .14 && ts < t) sq += .2 * EZ.o((ts - t + .14) / .14); else if (ts >= t && ts < t + d) { var u = (ts - t) / d; y += h * 4 * u * (1 - u); if (u < .12) sq += .2 * (1 - u / .12); } else if (ts >= t + d && ts < t + d + .18) { sq += .22 * (1 - (ts - t - d) / .18); } }); return { y: y, sq: sq }; }
    var hops = [[], [], []];
    [0, 1, 2].forEach(function (i) { hops[i].push([T.hop[i], .38, .5]); });
    // receiving the number ball: a small hop; pinching: a squash
    passes.forEach(function (p, k) { for (var i = 1; i < 3; i++) hops[i].push([p.tS[i] - .05, k < 2 ? .12 : .06, .26]); hops[0].push([p.tS[0], k < 2 ? .1 : .05, .24]); });
    hops[2].push([T.pinch3 - .1, .12, .3], [T.pinch3 + .5, .0, .1]); hops[1].push([T.pinch2 - .1, .14, .3]); hops[0].push([T.pinch1 - .1, .12, .3]);
    [0, 1, 2].forEach(function (i) { hops[i].push([T.five + .1, .55, .6]); });
    var wdial = [function (ts) { return 0; }];
    /* ---- dials: stepped ticks ---- */
    function mAt(i, ts) {
      var k = [[0, C.M0[i]], [T.dial[2 - i], C.M0[i]], [T.dial[2 - i] + .8, S.M1[i], "l"]];
      var prev = S.M1[i]; C.LOOPS.forEach(function (L, j) { var t = T.loops[j] - .35; k.push([t, prev], [t + .3, L.m[i], "l"]); prev = L.m[i]; });
      var m = kf(ts, k); return m;
    }
    var dialAng = function (m) { return (m - 1) * 1.7; };
    var lastTickT = {};

    /* ---- camera ---- */
    var CAMK = [
      [0, [-2.7, 2.1, 9.0], [-.5, 1.0, 2.2], 32, [-.9, 1, 3.0]],
      [T.press, [-2.3, 2.0, 8.2], [-.5, 1.1, 2.4], 32, [-.9, 1, 3.0]],
      [3.5, [2.8, 5.0, 10.6], [.3, .6, -.7], 34, [.25, 1, .8]],
      [T.hop[0] - .1, [-3.6, 3.4, 9.0], [.1, 1.0, 1.2], 34, [-.9, 1, 3.0]],
      [T.hop[2] + .8, [3.8, 3.8, 6.6], [.4, 1.0, .4], 34, [.25, 1, .8]],
      [T.take + .3, [-1.6, 3.2, 8.0], [-.3, 1.1, 2.4], 34, [-.9, 1, 3.0]],
      [T.sq0 + 1.9, [3.8, 3.6, 4.6], [.6, 1.1, -.4], 34, [.9, 1, -.5]],
      [T.tossJ - .4, [-4.2, 4.6, 2.8], [.3, 1.1, -2.4], 34, [.4, 1.2, -3.0]],
      [T.toTruth, [-4.4, 4.4, 1.6], [.45, .8, -3.1], 34, [.45, 1, -3.1]],
      [T.tag + .6, [-4.0, 4.0, 1.0], [.45, .8, -3.1], 34, [.45, 1, -3.1]],
      [T.lumpToss + .5, [-3.8, 3.9, 3.4], [.5, 1.2, -1.0], 34, [1.0, 1.2, -1.4]],
      [T.ask3 + .3, [-3.0, 3.2, 2.4], [.7, 1.3, -1.1], 34, [1.05, 1.3, -1.5]],
      [T.pinch3 - .2, [-3.4, 3.6, 2.8], [.5, 1.1, -.6], 34, [1.05, 1, -1.5]],
      [T.toss2, [-4.6, 4.4, 4.0], [.2, 1.0, .4], 34, [.25, 1, .8]],
      [T.pinch1 + .2, [1.8, 3.6, 7.6], [-.5, .9, 2.4], 34, [-.9, 1, 3.0]],
      [T.merge, [3.8, 5.6, 9.4], [.2, 1.0, .6], 34, [.25, 1, .8]],
      [T.dial[0] - .35, [P[2][0] + 2.3, 1.7, P[2][2] + 3.5], [P[2][0] + .05, .85, P[2][2] + .6], 34, [P[2][0], .85, P[2][2] + .6]],
      [T.dial[1] - .05, [P[1][0] + 2.3, 1.7, P[1][2] + 3.5], [P[1][0] + .05, .85, P[1][2] + .6], 34, [P[1][0], .85, P[1][2] + .6]],
      [T.dial[2] - .05, [P[0][0] + 2.3, 1.7, P[0][2] + 3.5], [P[0][0] + .05, .85, P[0][2] + .6], 34, [P[0][0], .85, P[0][2] + .6]],
      [T.replay - .2, [3.8, 5.2, 8.6], [.3, 1.0, -.4], 34, [.3, 1, -.4]],
      [T.loops[0], [3.4, 6.6, 11.0], [.3, .7, -.7], 34, [.3, 1, -.7]],
      [T.five - .4, [3.2, 5.6, 9.2], [.25, 1.0, -.2], 34, [.25, 1, -.2]],
      [T.stamp - .8, [3.8, 4.9, 1.6], [1.0, .9, -3.2], 34, [1.7, .3, -2.6]],
      [T.stamp + .9, [3.8, 4.9, 1.6], [1.0, .9, -3.2], 34, [1.7, .3, -2.6]],
      [T.title + .3, [.3, 9.6, 13.4], [.1, .1, 4.8], 34, [.1, .3, 4.4]],
      [TIMING.total, [.3, 9.8, 13.3], [.1, .1, 4.8], 34, [.1, .3, 4.4]]
    ];

    function camAt(t) {
      var ks = CAMK; if (t <= ks[0][0]) return ks[0];
      for (var i = 1; i < ks.length; i++) if (t <= ks[i][0]) { var a = ks[i - 1], b = ks[i], p = EZ.io((t - a[0]) / (b[0] - a[0])); return [t, [0, 1, 2].map(function (c) { return lerp(a[1][c], b[1][c], p); }), [0, 1, 2].map(function (c) { return lerp(a[2][c], b[2][c], p); }), lerp(a[3], b[3], p), [0, 1, 2].map(function (c) { return lerp(a[4][c], b[4][c], p); })]; }
      return ks[ks.length - 1];
    }

    /* =============== frame =============== */
    var vtmp = new T3.Vector3();
    function setArm(c, side, amt, swing, tx) {
      var a = c.arms[side]; a.piv.rotation.set(-amt * 1.05 + swing, 0, a.rest * (1 - amt * .6) + (tx || 0)); a.piv.scale.y = 1;
    }
    function frame(t) {
      var ts = Math.floor(t * 12 + 1e-6) / 12, step = Math.floor(t * 12 + 1e-6);
      /* camera (smooth) */
      var ck = camAt(t); cam.fov = ck[3]; cam.position.set(ck[1][0], ck[1][1], ck[1][2]); cam.lookAt(ck[2][0], ck[2][1], ck[2][2]); cam.updateProjectionMatrix(); cam.updateMatrixWorld(true);
      var fd = Math.hypot(ck[4][0] - ck[1][0], ck[4][1] - ck[1][1], ck[4][2] - ck[1][2]);
      wd.postMat.uniforms.focus.value = fd; wd.postMat.uniforms.sx.value = (hash01(step * 3 + 1) - .5) * .6; wd.postMat.uniforms.sy.value = (hash01(step * 3 + 2) - .5) * .6;
      /* workers */
      var bs = ballState(ts), holding = [0, 0, 0];
      passes.forEach(function (p) { for (var i = 0; i < 3; i++) { var a = p.tS[i] - .3, b = i < 2 ? p.tS[i] + p.sq + p.td : p.last + p.ld * .5; if (ts > a && ts < b) holding[i] = Math.max(holding[i], Math.min(1, (ts - a) / .3) * (ts > b - .15 ? 0 : 1)); } });
      holding[2] = Math.max(holding[2], seg(ts, T.lumpToss + .4, T.lumpToss + .8, 0, 1) * (1 - seg(ts, T.toss3 - .2, T.toss3 + .1, 0, 1)));
      holding[1] = Math.max(holding[1], seg(ts, T.toss3 + .3, T.toss3 + .6, 0, 1) * (1 - seg(ts, T.toss2 - .2, T.toss2 + .1, 0, 1)));
      holding[0] = Math.max(holding[0], seg(ts, T.toss2 + .3, T.toss2 + .6, 0, 1) * (1 - seg(ts, T.pinch1 + .3, T.pinch1 + .6, 0, 1)));
      holding[0] = Math.max(holding[0], seg(ts, T.press - .2, T.press + .2, 0, 1) * (1 - seg(ts, passes[0].tS[0] + passes[0].sq + passes[0].td - .15, passes[0].tS[0] + passes[0].sq + passes[0].td, 0, 1)));
      for (var i = 0; i < 3; i++) {
        var c = wk[i], h = hopS(hops[i], ts), jx = (hash01(step * 17 + i * 5) - .5) * .02, jr = (hash01(step * 29 + i * 7) - .5) * .035;
        var wob = (ts > T.worry && ts < T.worry + 1.1) ? Math.sin((ts - T.worry) * 30) * .06 * (1 - (ts - T.worry) / 1.1) : 0;
        c.g.position.set(P[i][0] + jx, h.y, P[i][2]); c.g.rotation.set(0, .14, jr + wob);
        var sy = 1 - h.sq, sxz = 1 / Math.sqrt(sy); c.g.scale.set(sxz, sy, sxz);
        var pinch = i === 2 ? bell(ts, T.pinch3 - .15, T.pinch3 + .3) : i === 1 ? bell(ts, T.pinch2 - .15, T.pinch2 + .3) : bell(ts, T.pinch1 - .15, T.pinch1 + .3);
        c.body.scale.x = 1 + pinch * .12; c.body.scale.y = 1.28 * (1 - pinch * .1);
        var hl = holding[i], hp = hl * (1 - 0);
        setArm(c, 0, hp * .85, 0); setArm(c, 1, hp * .85, 0);
        var five = seg(ts, T.five - .3, T.five + .3, 0, 1) * (i < 3 ? 1 : 0);
        if (five > 0) {
          var tgt = i === 0 ? [(P[0][0] + P[1][0]) / 2 + .15, 2.1, (P[0][2] + P[1][2]) / 2] : i === 1 ? [(P[0][0] + P[1][0]) / 2 + .15, 2.1, (P[0][2] + P[1][2]) / 2] : [(P[1][0] + P[2][0]) / 2 + .2, 2.1, (P[1][2] + P[2][2]) / 2];
          var tgt2 = i === 1 ? [(P[1][0] + P[2][0]) / 2 + .2, 2.1, (P[1][2] + P[2][2]) / 2] : tgt;
          var armIdx = i === 0 ? 1 : i === 1 ? 0 : 1, armIdx2 = 1;
          [[armIdx, tgt], i === 1 ? [1, tgt2] : null].forEach(function (q) {
            if (!q) return; var a = c.arms[q[0]]; c.g.updateMatrixWorld(true); vtmp.set(q[1][0], q[1][1] + (h.y ? 0 : 0), q[1][2]); c.g.worldToLocal(vtmp); vtmp.sub(a.piv.position); var L = vtmp.length(); vtmp.normalize();
            var qq = new T3.Quaternion().setFromUnitVectors(new T3.Vector3(0, -1, 0), vtmp); var cur = new T3.Quaternion().setFromEuler(a.piv.rotation); cur.slerp(qq, five); a.piv.quaternion.copy(cur); a.piv.scale.y = lerp(1, Math.max(1, L / .88), five);
          });
        }
        var mc = moodC(i, ts); setFace(c, mc, qMouth(i, ts) > 0, mc < -.2 ? 1 : qMouth(i, ts) ? .55 : 0);
        // dial (stepped ticks, brass click pulse)
        var m = mAt(i, ts), ang = dialAng(m), q = Math.round(ang * 6) / 6; c.pivot.rotation.z = -q;
        var prevM = mAt(i, ts - 1 / 12), pq = Math.round(dialAng(prevM) * 6) / 6, ticked = pq !== q;
        c.dial.scale.setScalar(ticked ? 1.18 : 1); c.dial.position.z = ticked ? .64 : .6;
        c.shadow.position.set(P[i][0] + .1, .004, P[i][2] + .05); c.shadow.material.opacity = 1 - Math.min(.7, h.y * 1.1); c.shadow.scale.set(1.9 - h.y * .5, 1.9 - h.y * .5, 1);
        // legs squash
        c.legs.forEach(function (l, k) { l.scale.set(1, .8 * (1 - h.sq * .3), 1.25); });
      }
      /* judge */
      var jc = judge, jh = hopS([[T.toTruth - .05, .08, .3], [T.wedge0 + 1.1, .1, .3], [T.peel + .1, .12, .3], [T.stamp, .1, .3], [T.five + .2, .35, .5]], ts), rulerAmt = seg(ts, T.ruler0, T.ruler0 + .5, 0, 1) * (1 - seg(ts, T.ruler1, T.ruler1 + .5, 0, 1));
      jc.g.position.set(JP[0] + (hash01(step * 13 + 3) - .5) * .015, .42 + jh.y, JP[2]); jc.g.rotation.set(0, -.12, 0); var jsy = 1 - jh.sq; jc.g.scale.set(1 / Math.sqrt(jsy), jsy, 1 / Math.sqrt(jsy));
      var jr = Math.max(rulerAmt, seg(ts, T.tossJ - .2, T.tossJ + .1, 0, 1) * (1 - seg(ts, T.tossJ + .5, T.tossJ + .8, 0, 1)), bell(ts, T.peel - .1, T.lumpToss + .5), bell(ts, T.stamp - .2, T.stamp + .7));
      setArm(jc, 0, jr * .9, 0); setArm(jc, 1, jr * .9, 0);
      setFace(jc, kf(ts, [[0, .3], [T.wedge0, .3], [T.wedge0 + .5, -.5], [T.peel, -.5], [T.pinch1, .1], [T.stamp, .9]]), false, rulerAmt > .3 ? .8 : -.1);
      jc.shadow.position.set(JP[0] + .1, .43, JP[2] + .05); jc.shadow.scale.set(1.5, 1.5, 1);
      /* ball, answer ball, truth ball */
      var bm = wd.ballM; bm.visible = bs.vis;
      if (bs.vis) { var sqv = bs.sq, a = 1 + sqv; bm.position.set(bs.pos[0], bs.pos[1], bs.pos[2]); bm.scale.set(bs.r * a, bs.r / (a * a) * 1, bs.r * a); }
      var an = ansState(ts), am = wd.ansM; am.visible = an.r > 0; if (an.r > 0) { var pop = 1 + .25 * bell(ts, passes[an.k].arrive, passes[an.k].arrive + .3); var sp = ansSpot(an.r); am.position.set(sp[0], sp[1], sp[2]); am.scale.setScalar(an.r * pop); }
      var tr = truthState(ts), tm = wd.truthM; tm.visible = tr > 0; if (tr > 0) { var tsp = truthSpot(tr); tm.position.set(tsp[0], tsp[1] + (ts < T.toTruth + .4 ? .5 * (1 - (ts - T.toTruth) / .4) * (ts > T.toTruth ? 1 : 0) : 0), tsp[2]); tm.scale.setScalar(tr); }
      wd.truthTag.visible = tr > 0 && ts < T.peel + 3.5; wd.truthTag.position.set(1.08, .14 + tr * 2 + .32, -3.0); wd.truthTag.rotation.set(-.2, .1, 0); wd.truthTag.scale.setScalar(seg(ts, T.toTruth + .2, T.toTruth + .6, 0, 1, "b"));
      /* wedge (the loss): grows when measured, shrinks as the answer improves */
      var diff = Math.max(0, (an.r || 0) - truthR); var wmeas = seg(ts, T.wedge0, T.wedge0 + 1.1, 0, 1, "o");
      var diffNow = an.k >= 0 ? Math.max(0, an.r - (an.k === 0 ? C.TRUTH : passes[an.k].truth)) : 0, hK = 2.4;
      var peel = seg(ts, T.peel, T.peel + .9, 0, 1);
      var wv = (ts >= T.wedge0 && peel < 1) || (ts > T.replay + 2.3 && ts < T.loops[0] + 2.4 && an.k >= 1);
      var wscale = ts < T.peel + 1 ? wmeas * (1 - peel) : seg(ts, T.replay + 2.1, T.replay + 2.7, 0, 1, "b");
      var dd = ts < T.peel + 1 ? S.DIFF0 : diffNow;
      wd.wedge.visible = wv && wscale > .01 && dd > .001; var wg = wd.wedge; wg.scale.set(.75 * wscale, Math.max(.02, dd * hK) * wscale + .001, .7); wg.position.set(.5 + .37, .14, -3.1); wg.rotation.set(0, PI, 0);
      wd.lossTag.visible = (ts > T.tag && ts < T.peel + 2.2) || (ts > T.replay + 2.4 && ts < T.loops[0] + 2.2);
      var tagDrop = seg(ts, T.tag, T.tag + .45, 1, 0, "i"), tg = ts < T.peel + 2 ? 1 : seg(ts, T.replay + 2.4, T.replay + 2.8, 0, 1, "b");
      wd.lossTag.position.set(.5, 1.25 + tagDrop * 1.6, -3.0); wd.lossTag.rotation.set(-.15, 0, -.06); wd.lossTag.scale.setScalar(tg * (ts < T.peel + 2 ? 1 : .6) * Math.max(.01, (ts < T.peel + 2 ? 1 : 1)));
      /* the blame lump: peeled off the wedge, red, carried backwards, pinched into shares */
      var lm = wd.lumpM, pcs = wd.pieces, sh = S.SH, rem3 = 1 - sh[2], rem32 = 1 - sh[2] - sh[1];
      var lpos, lr = 0;
      if (ts >= T.peel && ts < T.lumpToss) { var up = seg(ts, T.peel, T.peel + .9, 0, 1); lpos = [.62, .14 + RW * .7 + .5 * Math.sin(up * PI) * .6 + up * .8, -3.0]; lr = RW * up; }
      else if (ts >= T.lumpToss && ts < T.lumpToss + .6) { lpos = arc([.62, .94, -3.0], hand(2), EZ.io((ts - T.lumpToss) / .6), 1.8); var hh = [wk[2].g.position.x, 0, 0]; lr = RW; }
      else if (ts >= T.lumpToss + .6 && ts < T.toss3) { lpos = hand(2); lr = RW; }
      else if (ts >= T.toss3 && ts < T.toss3 + .45) { lpos = arc(hand(2), hand(1), EZ.io((ts - T.toss3) / .45), 1.1); lr = RW * cb(rem3); }
      else if (ts >= T.toss3 + .45 && ts < T.toss2) { lpos = hand(1); lr = RW * cb(rem3); }
      else if (ts >= T.toss2 && ts < T.toss2 + .5) { lpos = arc(hand(1), hand(0), EZ.io((ts - T.toss2) / .5), 1.1); lr = RW * cb(rem32); }
      else if (ts >= T.toss2 + .5 && ts < T.pinch1 + .5) { lpos = hand(0); lr = RW * cb(rem32); }
      else { lpos = hand(0); lr = 0; }
      if (ts >= T.pinch3 && ts < T.toss3) lr = RW * lerp(1, cb(rem3), seg(ts, T.pinch3, T.pinch3 + .4, 0, 1, "o"));
      if (ts >= T.toss3 + .45 && ts < T.pinch2 + .5 && ts >= T.pinch2) lr = RW * lerp(cb(rem3), cb(rem32), seg(ts, T.pinch2, T.pinch2 + .4, 0, 1, "o"));
      if (ts >= T.pinch1 && ts < T.pinch1 + .6) lr = RW * cb(rem32) * (1 - seg(ts, T.pinch1, T.pinch1 + .6, 0, 1));
      var mg = seg(ts, T.merge, T.merge + .7, 0, 1) * (1 - seg(ts, T.merge + 1.6, T.merge + 2.3, 0, 1));
      var lsq = (ts >= T.pinch3 && ts < T.pinch3 + .4) ? .2 * Math.sin(seg(ts, T.pinch3, T.pinch3 + .4, 0, 1) * PI) : 0;
      lm.visible = (lr > .002) || mg > .5; if (mg > .5) { lpos = [.28, 2.5, .9]; lr = RW * (mg > .85 ? 1 : mg); }
      lm.position.set(lpos[0], lpos[1] + (lr > 0 ? 0 : 0), lpos[2]); lm.scale.set(lr * (1 + lsq), lr * (1 - lsq * 1.5), lr * (1 + lsq));
      var foot = function (i) { return [P[i][0] + .5, 0, P[i][2] + 1.05]; }, pt = [T.pinch3, T.pinch2, T.pinch1 + .15];
      [2, 1, 0].forEach(function (wi, k) {
        var pm = pcs[wi], pr = RW * cb(sh[wi]), appear = seg(ts, pt[k], pt[k] + .5, 0, 1, "b"), f = foot(wi);
        var home = mg < .5 && appear > 0;
        var gather = seg(ts, T.merge, T.merge + .6, 0, 1) * (1 - seg(ts, T.merge + 1.7, T.merge + 2.3, 0, 1));
        pm.visible = appear > .01 && gather < .98 && ts < T.dial[0] + 2.2;
        var px = lerp(f[0], .28 + (wi - 1) * .3, gather), py = lerp(pr, 2.5, gather), pz = lerp(f[2], .9, gather);
        pm.position.set(px, py, pz); pm.scale.setScalar(pr * Math.max(.01, appear) * (1 - gather * .4));
      });
      /* nudge arrows: bigger share, bigger nudge */
      wd.arrows.forEach(function (ar, wi) {
        var big = wi === 1, t0 = big ? T.big : T.small, ap = seg(ts, t0, t0 + .5, 0, 1, "b") * (1 - seg(ts, T.dial[0] + 1.6, T.dial[0] + 2.1, 0, 1)), len = 3.4 * sh[wi];
        ar.visible = ap > .01; var shf = ar.userData.sh, hd = ar.userData.hd; shf.scale.set(1, len, 1); shf.position.y = len / 2; hd.position.y = len + .18; ar.position.set(P[wi][0] - .1, 2.5 + (wi === 1 ? .1 : 0), P[wi][2] + .5); ar.rotation.set(0, 0, -PI / 2 + .25); ar.scale.setScalar(ap);
        ar.position.x += 0;
      });
      /* tags */
      var ft = wd.faultTag; ft.visible = ts > T.fault && ts < T.pinch3 - .1; ft.position.set(P[2][0] + .1, 2.8, P[2][2] + .4); ft.rotation.set(-.15, -.1, .05); ft.scale.setScalar(seg(ts, T.fault, T.fault + .4, 0, 1, "b"));
      /* intro hand + number blob */
      var hd = wd.hand, hin = seg(ts, 0, T.press, 1, 0, "o"), hout = seg(ts, T.press + .5, T.handOut, 0, 1, "io"), hp0 = hand(0);
      hd.visible = ts < T.handOut + .1; hd.position.set(hp0[0] + .75, hp0[1] + .3 + hin * 1.25 + hout * 3.2, hp0[2] + .35); hd.rotation.set(.35, -.5, -.2); hd.scale.setScalar(.95);
      wd.numTag.visible = ts < T.sq0 - .3 && ts > .3; wd.numTag.position.set(hp0[0] - .55, 2.3, hp0[2] + .1); wd.numTag.rotation.set(-.25, .15, 0); wd.numTag.scale.setScalar(seg(ts, .3, .7, 0, 1, "b") * (1 - seg(ts, T.take + .8, T.take + 1.1, 0, 1)));
      /* the transition hands slide across the lens (camera space) */
      var sw = [[T.ruler0 - 2.2, 1.0], [T.replay - 1.4, 1.0]], bh = wd.bigHand, hv = false;
      sw.forEach(function (s) { if (t >= s[0] && t < s[0] + s[1]) { hv = true; var p = (t - s[0]) / s[1], x = lerp(-4.2, 4.4, EZ.io(p)); vtmp.set(x, -.3 + Math.sin(p * PI) * .5, -2.6).applyMatrix4(cam.matrixWorld); bh.position.copy(vtmp); bh.quaternion.copy(cam.quaternion); bh.rotateX(-PI / 2); bh.rotateZ(.3 - p * .5); } });
      bh.visible = hv; cam.updateMatrixWorld(true);
      /* the ruler: judge lifts it over the two balls */
      var rl = wd.ruler; rl.visible = rulerAmt > .01; var rp = rulerAmt; rl.position.set(lerp(JP[0] - .2, .5, rp), lerp(1.2, .14 + .8 * 1 + .1, rp), lerp(JP[2] + .9, -3.1, rp)); rl.rotation.set(0, lerp(.3, 0, rp), lerp(.2, 0, rp));
      /* certificate, stamp, loss bar, title */
      var ce = wd.cert, cap = seg(ts, T.stamp - .8, T.stamp - .3, 0, 1, "b"); ce.visible = cap > .01; ce.position.set(1.7, .26, -2.6); ce.rotation.set(-PI / 2 + .05, 0, -.06); ce.scale.setScalar(cap * 1.05);
      var th = wd.thumb, stp = seg(ts, T.stamp, T.stamp + .25, 0, 1, "i") * (1 - seg(ts, T.stamp + .4, T.stamp + .8, 0, 1)); th.visible = ts > T.stamp - .1 && ts < T.stamp + .9; th.position.set(1.7, .26 + .25 + (1 - stp) * 1.4 * (ts < T.stamp + .3 ? 1 : 0) + (ts >= T.stamp + .3 ? (seg(ts, T.stamp + .4, T.stamp + .9, 0, 1)) * 1.4 : 0), -2.6); th.rotation.set(0, 0, 0);
      wd.stampM.material.opacity = seg(ts, T.stamp + .22, T.stamp + .3, 0, .9, "h");
      var bar = wd.barM, barTag = wd.barTag, lossK = [[T.replay - 3, 1], [T.replay + 2.4, 1], [T.replay + 3.0, S.LOSSN[1]]]; S.LOSSN.slice(2).forEach(function (v, j) { lossK.push([T.loops[j] + 3 * lt[j] * .85 + .25, v === undefined ? 0 : v]); });
      var loopBefore = [[0, 1]]; var bh2 = kf(ts, lossK.map(function (q, ix) { return [q[0], q[1], ix === 0 ? "l" : "io"]; }));
      var barVis = ts > T.replay + 2.2 && ts < T.five + .4; bar.visible = barVis; barTag.visible = barVis; var bhh = Math.max(.05, bh2 * 1.8);
      bar.scale.set(1, bhh, 1); bar.position.set(2.0, bhh / 2, -1.3); bar.rotation.y = .3; barTag.position.set(2.0, bhh + .35, -1.0); barTag.rotation.set(-.2, .0, 0);
      // clay puff when the bar shrinks
      var ti = wd.title, tgrow = seg(ts, T.title, T.title + .1, 0, 1); ti.visible = ts >= T.title - .05;
      wd.letters.forEach(function (L, k) { var u = seg(ts, T.title + k * .075, T.title + k * .075 + .55, 0, 1, "b"); L.g.scale.set(1 + (1 - Math.min(1, u)) * .0, 1, Math.max(.001, u)); L.g.visible = u > .01; L.g.position.set(0, -L.li * 1.15, 0); var sx = 1 - .12 * bell(ts, T.title + k * .075 + .2, T.title + k * .075 + .55); L.g.scale.x = sx; });
      /* blobs under moving things */
      wd.blobA.visible = an.r > 0; wd.blobA.position.set(ansSpot(an.r || .1)[0] + .05, .152, -3.07); wd.blobA.scale.set(an.r * 3, an.r * 3, 1); wd.blobT.visible = tr > 0; wd.blobT.position.set(truthSpot(tr || .1)[0] + .05, .152, -3.07); wd.blobT.scale.set(tr * 3, tr * 3, 1);
      wd.blobN.visible = bs.vis && bs.pos[1] < 3; if (bs.vis) { wd.blobN.position.set(bs.pos[0] + .06, .006 + (bs.pos[2] < -2.5 ? .15 : 0), bs.pos[2] + .06); wd.blobN.scale.set(bs.r * 3 * Math.max(.4, 1 - bs.pos[1] * .25), bs.r * 3 * Math.max(.4, 1 - bs.pos[1] * .25), 1); wd.blobN.material.opacity = Math.max(.1, .8 - bs.pos[1] * .25); }
      /* render: scene to the multisampled target, then the DOF / tilt-shift / vignette pass */
      wd.R.setRenderTarget(wd.rt); wd.R.render(wd.sc, cam); wd.R.setRenderTarget(null); wd.R.render(wd.qsc, wd.qcam);
    }
    return { frame: frame, T: T, passes: passes };
  };
})();
