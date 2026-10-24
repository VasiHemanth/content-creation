import re
HEAD = '''<template>
<style>
/*@FONTS*/
#root{position:absolute;inset:0;overflow:hidden;background:transparent}
</style>
<div id="root" data-composition-id="%(id)s" data-width="1080" data-height="1920"></div>
<script>
(function () {
  var root = document.getElementById("root"), SC = TIMING.scenes.%(id)s, LN = TIMING.lines, D = RisoData, P = RisoPlots, B = P.BOX;
  var tw = function (l, i) { return LN[l].words[i].start - SC.start; }, te = function (l, i) { return LN[l].words[i].end - SC.start; };
  var ramp = function (t, a, b) { return Math.max(0, Math.min(1, (t - a) / (b - a))); };
  var ease = function (p) { return p * p * (3 - 2 * p); };
  var f1 = function (v) { return v.toFixed(1); }, f2 = function (v) { return v.toFixed(2); };
  Riso.ready("%(id)s", function () { return Riso.fontsReady().then(function () {
%(setup)s
    var sc = Riso.scene(root, { id: "%(id)s", dur: SC.dur, flip: %(flip)s, events: EVENTS, jolts: JOLTS%(extra)s });
    var tl = gsap.timeline({ paused: true }), an = { p: 0 };
    tl.to(an, { p: 1, duration: SC.dur, ease: "none", onUpdate: function () { sc.render(tl.time(), draw); } }, 0);
    window.__timelines["%(id)s"] = tl;
  }); });
})();
</script>
</template>
'''
S = {}
S['S1'] = dict(flip='false', extra='', setup='''
    var t0 = -.32, EVENTS = [t0 + 11 * .16 + .1], JOLTS = []; for (var q = 0; q < 12; q++) JOLTS.push(t0 + q * .16);
    function draw(ctx, t) {
      P.header(ctx, "p", "TWELVE DOTS", "12 PINK POINTS. EVERY ONE IS A MEASUREMENT.", "b");
      Riso.ink(ctx, "p", function (c) { Riso.rectTone(c, "p", B.x0 + 4, B.y0 - 8, B.x1 - B.x0 + 8, B.y1 - B.y0 + 16, .11, 10); });
      P.frame(ctx, B, 1, { x: "INPUT >", y: "OUTPUT" });
      var pink = D.train.xs.map(function (_, i) { return ramp(t, t0 + i * .16, t0 + i * .16 + .14); });
      // the pattern behind the dots: a dotted pink guess-line that appears with "a line that predicts"
      var pr = ramp(t, tw(0, 8), te(0, 10));
      if (pr > 0) Riso.ink(ctx, "p", function (c) { c.save(); c.beginPath(); c.rect(B.x0, B.y0 - 6, B.x1 - B.x0, B.y1 - B.y0 + 12); c.clip(); c.setLineDash([2, 13]); var pts = []; for (var i = 0; i <= 260 * pr; i++) { var x = i / 260; pts.push([P.mx(B, x), P.my(B, D.trend(x))]); } Riso.poly(c, pts, 6); c.restore(); });
      // three hollow marks: where would a NEW dot fall?
      [.27, .58, .83].forEach(function (x, k) {
        var a = ramp(t, tw(0, 11) + k * .22, tw(0, 11) + k * .22 + .2); if (a <= 0) return;
        Riso.ink(ctx, "b", function (c) { c.lineWidth = 4; c.setLineDash([6, 8]); c.beginPath(); c.arc(P.mx(B, x), P.my(B, D.trend(x)), 22 * (2 - a), 0, 6.2832); c.stroke(); c.setLineDash([]); Riso.text(c, "?", P.mx(B, x), P.my(B, D.trend(x)) + 13, 34, "Space Mono", "center", 700); });
      });
      P.scatter(ctx, B, { pink: pink });
    }''')
S['S2'] = dict(flip='true', extra='', setup='''
    var EVENTS = [tw(1, 9)], JOLTS = [tw(1, 9)];
    var all = D.train.xs.map(function () { return 1; });
    function draw(ctx, t) {
      P.header(ctx, "p", "ZERO ERROR", "ONE CURVE THROUGH ALL 12 POINTS (DEGREE 11).", "b");
      Riso.ink(ctx, "p", function (c) { Riso.rectTone(c, "p", B.x0 + 4, B.y0 - 8, B.x1 - B.x0 + 8, B.y1 - B.y0 + 16, .11, 10); });
      P.frame(ctx, B, 1, { x: "INPUT >", y: "OUTPUT" });
      var w = ease(ramp(t, tw(1, 1), te(1, 8)));
      P.scatter(ctx, B, { pink: all, wiggle: w });
      var c0 = ramp(t, tw(1, 9), tw(1, 9) + .15);
      if (c0 > 0) P.counter(ctx, "p", "TRAIN ERROR", f2(D.err.trainWiggle * (1 - ease(ramp(t, tw(1, 9), tw(1, 9) + .0)))), 110, 1412, 128 * (1 + (1 - c0) * .35));
    }''')
S['S3'] = dict(flip='true', extra='', setup='''
    var b0 = tw(2, 2), EVENTS = [b0, te(2, 13)], JOLTS = []; for (var q = 0; q < 8; q++) JOLTS.push(b0 + q * .13);
    var all = D.train.xs.map(function () { return 1; });
    function draw(ctx, t) {
      P.header(ctx, "b", "NEW DATA", "8 BLUE POINTS THE MODEL NEVER SAW.", "p");
      P.frame(ctx, B, 1, { x: "INPUT >", y: "OUTPUT" });
      var blue = D.test.xs.map(function (_, i) { return ramp(t, b0 + i * .13, b0 + i * .13 + .14); });
      var s0 = tw(2, 10), s1 = te(2, 13), bars = D.test.xs.map(function (_, i) { var a = s0 + (s1 - s0 - .4) * i / 8; return ease(ramp(t, a, a + .4)); });
      P.scatter(ctx, B, { pink: all, wiggle: 1, blue: blue, blueBars: bars });
      P.counter(ctx, "p", "TRAIN ERROR", f2(0), 110, 1412, 112);
      var v = D.err.testWiggle * ease(ramp(t, s0, s1));
      if (t >= s0) P.counter(ctx, "b", "TEST ERROR", f1(v), 970, 1412, 112, "right");
    }''')
S['S4'] = dict(flip='true', extra='', setup='''
    var EVENTS = [tw(3, 9)], JOLTS = [tw(3, 9)];
    var all = D.train.xs.map(function () { return 1; }), allb = D.test.xs.map(function () { return 1; });
    function draw(ctx, t) {
      P.header(ctx, "p", "MEMORIZED", "YELLOW = THE PATTERN.  PINK GAPS = THE NOISE.", "b");
      P.frame(ctx, B, 1, { x: "INPUT >", y: "OUTPUT" });
      var tr = ease(ramp(t, tw(3, 3), te(3, 5)));
      var res = D.train.xs.map(function (_, i) { return ease(ramp(t, tw(3, 7) + i * .07, tw(3, 7) + i * .07 + .25)); });
      P.scatter(ctx, B, { pink: all, wiggle: 1, trend: tr, blue: allb, dim: true });
      // the noise: pink bars from the trend to each dot, drawn to scale
      Riso.ink(ctx, "p", function (c) { c.save(); c.beginPath(); c.rect(B.x0, B.y0 - 6, B.x1 - B.x0, B.y1 - B.y0 + 12); c.clip(); c.lineWidth = 8; for (var i = 0; i < 12; i++) { if (res[i] <= 0) continue; var x = P.mx(B, D.train.xs[i]), y0 = P.my(B, D.trend(D.train.xs[i])), y1 = P.my(B, D.train.ys[i]); c.beginPath(); c.moveTo(x - 20, y0); c.lineTo(x + 20, y0); c.stroke(); c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y0 + (y1 - y0) * res[i]); c.stroke(); } c.restore(); });
      P.stamp(ctx, "p", "NOISE", 780, 590, 76, -.1, ramp(t, tw(3, 9), tw(3, 9) + .2));
    }''')
S['S5'] = dict(flip='true', extra='', setup='''
    var EVENTS = [tw(4, 9)], JOLTS = [];
    var all = D.train.xs.map(function () { return 1; }), allb = D.test.xs.map(function () { return 1; });
    function draw(ctx, t) {
      P.header(ctx, "p", "A SIMPLER LINE", "DEGREE 3. SMOOTH. IT IGNORES THE WIGGLES.", "b");
      P.frame(ctx, B, 1, { x: "INPUT >", y: "OUTPUT" });
      var sm = ease(ramp(t, tw(4, 1), te(4, 2) + .5)), a = tw(4, 3), z = te(4, 6);
      var pb = D.train.xs.map(function (_, i) { var s = a + (z - a - .3) * i / 12; return ease(ramp(t, s, s + .3)); });
      var a2 = tw(4, 9), z2 = te(4, 14), bb = D.test.xs.map(function (_, i) { var s = a2 + (z2 - a2 - .3) * i / 8; return ease(ramp(t, s, s + .3)); });
      P.scatter(ctx, B, { pink: all, blue: allb, ghost: .55, simple: sm, pinkBars: pb, blueBars: bb, blueFn: D.simple });
      if (t >= a) P.counter(ctx, "p", "TRAIN ERROR", f2(D.err.trainSimple * ease(ramp(t, a, z))), 110, 1412, 112);
      if (t >= a2) P.counter(ctx, "b", "TEST ERROR", f2(D.err.testSimple * ease(ramp(t, a2, z2))), 970, 1412, 112, "right");
    }''')
S['S6'] = dict(flip='true', extra='', setup='''
    var EVENTS = [tw(5, 19)], JOLTS = [], CB = { x0: 120, y0: 470, x1: 970, y1: 1250 };
    function draw(ctx, t) {
      P.header(ctx, "b", "MORE COMPLEX", "ERROR VS COMPLEXITY. AVERAGE OF 160 SEEDED RUNS.", "p");
      var s = { train: ease(ramp(t, tw(5, 6), te(5, 12))), test: ease(ramp(t, tw(5, 13), te(5, 20))), best: ease(ramp(t, tw(5, 19) + .1, tw(5, 19) + .9)) };
      P.chart(ctx, CB, s);
    }''')
S['S7'] = dict(flip='true', extra=', registerAfter: tw(6, 4)', setup='''
    var tB = tw(6, 4) - .1, EVENTS = [], JOLTS = [tw(6, 12) - .05];
    var CB = { x0: 120, y0: 470, x1: 970, y1: 1250 }, PC = { x0: 135, y0: 1010, x1: 960, y1: 1450 }, PS = { x0: 150, y0: 440, x1: 940, y1: 840 };
    var all = D.train.xs.map(function () { return 1; }), allb = D.test.xs.map(function () { return 1; });
    function lerpBox(a, b, p) { return { x0: a.x0 + (b.x0 - a.x0) * p, y0: a.y0 + (b.y0 - a.y0) * p, x1: a.x1 + (b.x1 - a.x1) * p, y1: a.y1 + (b.y1 - a.y1) * p }; }
    function draw(ctx, t) {
      var m = ease(ramp(t, tB, tB + .9));
      var title = t < tw(6, 3) ? "THE GAP" : "OVERFITTING";
      P.header(ctx, t < tw(6, 3) ? "b" : "p", title, t < tB ? "TRAIN ERROR KEEPS FALLING. TEST ERROR TURNS UP." : "JUDGE A MODEL ONLY ON DATA IT HAS NOT SEEN.", t < tB ? "p" : "b");
      var cb = lerpBox(CB, PC, m), k = 1 - .2 * m;
      P.chart(ctx, cb, { train: 1, test: 1, best: 1, gap: ease(ramp(t, tw(6, 1), tw(6, 1) + .6)), k: k });
      if (m > 0) P.scatter(ctx, PS, { pink: all.map(function (_, i) { return ramp(t, tB + .3 + i * .03, tB + .5 + i * .03); }), blue: allb.map(function (_, i) { return ramp(t, tB + .7 + i * .03, tB + .9 + i * .03); }), wiggle: ease(ramp(t, tB + .5, tB + 1.3)), simple: ease(ramp(t, tB + 1.0, tB + 1.7)), k: .78 });
      P.stamp(ctx, "p", "TEST ON UNSEEN DATA", 540, 905, 54, -.06, ramp(t, tw(6, 11), tw(6, 11) + .22));
    }''')
for k,v in S.items():
    open(f'src/scene{k}.html','w').write(HEAD % dict(id=k, setup=v['setup'], flip=v['flip'], extra=v['extra']))
print('wrote', list(S))
