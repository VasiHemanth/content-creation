# ---------------- V1 ----------------
write("V1", GH + '''
    // ---- beat 1: cold open ----
    var b1 = V.beat(cam, tl, 0, L(1.45), C.k, 1, 180);
    var sz = V.fit("1958", 900, "Anton", 540), t58 = V.text(b1, "1958", { y: 360, size: sz, color: C.y });
    var gh = []; for (var i = 0; i < 4; i++) { var g = t58.cloneNode(true); b1.insertBefore(g, t58); gh.push(g); }
    tl.fromTo(t58, { scale: 1.22, y: -40, opacity: 1 }, { scale: 1, y: 0, duration: .2, ease: V.E.hit }, 0);
    gh.forEach(function (g, i) { tl.fromTo(g, { scale: 1.22 + i * .05, y: -40 - i * 36, opacity: .42 - i * .09 }, { scale: 1.08, y: -16, opacity: 0, duration: .1, ease: "none" }, 0); });
    V.shake(tl, cam, .18, 6, "v1a");
    var pill = V.div("position:absolute;left:650px;top:230px;width:380px;height:92px;border:5px solid " + C.y + ";display:flex;align-items:center;justify-content:center;font:800 54px/1 'Inter Tight',sans-serif;color:" + C.w, b1);
    V.count(tl, pill, .3, 1.05, 1958, 2020, function (v) { return v >= 2019.5 ? "NOW" : String(Math.round(v)); }, "power2.in");
    var sp1 = V.spine(b1, { x0: 80, x1: 1000, baseY: 1370, topY: 1200, color: C.y, w: 7, tickColor: C.w });
    sp1.reveal(tl, .35, 1.1, 0, .13, "power1.in");
    // ---- beat 2: the statement ----
    var b2 = V.beat(cam, tl, L(1.45), L(3.21), C.y, 2, 120);
    var lines = ["NEURAL", "NETWORKS", "ARE", "NOT NEW."], ts = [1.45, 1.83, 2.28, 2.56], size = 230, ys = [300, 520, 740, 960];
    var w4 = V.tw("NOT NEW.", size) + 10, H4 = V.hilite(b2, (1080 - w4) / 2, ys[3] + 22, w4, size * .78, C.p, "hl1", -1.5);
    var els = lines.map(function (s, i) { return V.text(b2, s, { y: ys[i], size: size, color: C.k }); });
    els.forEach(function (e, i) { whip(e, L(ts[i]), i % 2 ? 420 : -420); });
    V.hiliteWipe(tl, H4, L(2.56), .22);
    var sc = V.scribble(b2, (1080 - w4) / 2 + w4 * .42, ys[3] + size * .93, w4 * .55, C.k, "sc1", 14); V.draw(tl, sc, L(2.78), .35, "power1.inOut");
    // ---- beat 3: the first one ----
    var b3 = V.beat(cam, tl, L(3.21), null, C.w, 3, 40);
    var t1 = V.text(b3, "THE FIRST ONE", { y: 240, size: V.fit("THE FIRST ONE", 940, "Anton", 190), color: C.k }); whip(t1, L(3.21), 420);
    var net = V.cutout(b3, { x: 270, y: 470, w: 540, h: 440, draw: V.art.neuron, cell: 11, sx: 10, sy: 10 });
    tl.fromTo(net, { scale: .5, opacity: 0, rotation: -9 }, { scale: 1, opacity: 1, rotation: -2, duration: .26, ease: V.E.snap }, L(3.52));
    var t2 = V.text(b3, "BUILT IN", { y: 900, size: 130, color: C.k }); whip(t2, L(4.71), -420);
    var big = V.text(b3, "1958", { y: 1060, size: V.fit("1958", 980, "Anton", 400), color: C.b });
    V.slamIn(tl, big, L(5.38), -1.5, 1.6); V.shake(tl, cam, L(5.38) + .15, 6, "v1b");
    var sp3 = V.spine(b3, { x0: 80, x1: 1000, baseY: 1490, topY: 1300, color: C.k, w: 7 }); sp3.reveal(tl, 0, .01, .13, .13);
''', "1.06")

# ---------------- V2 ----------------
write("V2", GH + '''
    var tt = function (g) { return L(g); };
    // beat A: more than fifty years, the line crawls
    var a = V.beat(cam, tl, 0, tt(7.7), C.k, 4, 150);
    var h = V.hilite(a, 70, 580, 940, 190, C.y, "hl2", -1);
    var e1 = V.text(a, "MORE THAN", { y: 290, size: 200, color: C.w }); whip(e1, tt(6.18), -420);
    var e2 = V.text(a, "FIFTY YEARS", { y: 570, size: V.fit("FIFTY YEARS", 900, "Anton", 200), color: C.k }); whip(e2, tt(6.93), 420); V.hiliteWipe(tl, h, tt(6.93), .22);
    var lg = V.svg("svg", { width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: "position:absolute;left:0;top:0;overflow:visible" }, a);
    V.svg("path", { d: "M0 1130 L1080 1130", stroke: C.y, "stroke-width": 8 }, lg);
    var tk = V.svg("g", {}, lg); for (var i = -12; i < 40; i++) V.svg("path", { d: "M" + (i * 36) + " 1146 l0 " + (i % 5 ? 20 : 40), stroke: C.w, "stroke-opacity": .7, "stroke-width": 4 }, tk);
    tl.fromTo(tk, { x: 0 }, { x: -360, duration: SC.dur, ease: "none" }, 0);
    V.svg("circle", { cx: 880, cy: 1130, r: 18, fill: C.y, stroke: C.k, "stroke-width": 4 }, lg);
    // beat B: mostly did not work
    var b = V.beat(cam, tl, tt(7.7), tt(8.95), C.w, 5, 170);
    var m1 = V.text(b, "MOSTLY", { y: 330, size: 210, color: C.k }); whip(m1, tt(7.78), -420);
    var m2 = V.text(b, "DID NOT", { y: 560, size: 210, color: C.k }); whip(m2, tt(8.17), 420);
    var m3 = V.text(b, "WORK.", { y: 790, size: 260, color: C.k }); whip(m3, tt(8.57), -420);
    var x1 = V.svg("svg", { width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: "position:absolute;left:0;top:0;overflow:visible" }, b);
    var xr = rngOf("x2"), xa = { path: V.svg("path", { d: V.wobble(250, 760, 830, 1090, xr, 14, 6), stroke: C.p, "stroke-width": 26, fill: "none", "stroke-linecap": "round" }, x1) }, xb = { path: V.svg("path", { d: V.wobble(820, 770, 260, 1100, xr, 14, 6), stroke: C.p, "stroke-width": 26, fill: "none", "stroke-linecap": "round" }, x1) };
    [xa, xb].forEach(function (o) { o.len = o.path.getTotalLength(); o.path.setAttribute("stroke-dasharray", o.len); o.path.setAttribute("stroke-dashoffset", o.len); });
    V.draw(tl, xa, tt(8.75), .18, "power2.out"); V.draw(tl, xb, tt(8.9), .18, "power2.out");
    // beat C: three things were missing
    var c = V.beat(cam, tl, tt(8.95), null, C.b, 6, 150);
    var h1 = V.text(c, "THREE THINGS", { y: 250, size: V.fit("THREE THINGS", 940, "Anton", 210), color: C.w }); whip(h1, tt(9.06), -420);
    var h2 = V.text(c, "WERE MISSING", { y: 470, size: V.fit("WERE MISSING", 940, "Anton", 210), color: C.y }); whip(h2, tt(9.55), 420);
    [0, 1, 2].forEach(function (k) {
      var bx = V.div("position:absolute;left:" + (70 + k * 320) + "px;top:900px;width:280px;height:340px;border:8px dashed " + C.w + ";display:flex;align-items:center;justify-content:center;font:400 220px/1 Anton;color:" + C.y, c); bx.textContent = "?";
      tl.fromTo(bx, { scale: .3, opacity: 0, rotation: (k - 1) * 12 }, { scale: 1, opacity: 1, rotation: (k - 1) * 2, duration: .22, ease: V.E.snap }, tt(9.06 + k * .3));
    });
''', "1.07")

# ---------------- V3 ----------------
write("V3", GH + '''
    var tt = function (g) { return L(g); };
    // beat A: slab 1 DATA
    var a = V.beat(cam, tl, 0, tt(11.95), C.k, 7, 0);
    var slab = V.div("position:absolute;left:50px;top:360px;width:980px;height:800px;background:" + C.y + ";box-shadow:16px 16px 0 " + C.w, a);
    var disc = V.div("position:absolute;left:90px;top:400px;width:240px;height:240px;border-radius:50%;background:" + C.k + ";color:" + C.y + ";display:flex;align-items:center;justify-content:center;font:400 190px/1 Anton", slab); disc.textContent = "1"; disc.style.left = "40px"; disc.style.top = "40px";
    var dsz = V.fit("DATA", 900, "Anton", 460), dt = V.text(slab, "DATA", { x: 0, y: 330, w: 980, size: dsz, color: C.k });
    V.slamIn(tl, slab, tt(10.54), -1, 1.5); V.shake(tl, cam, tt(10.54) + .2, 6, "v3a");
    tl.set(dt, { opacity: 0 }, 0).set(dt, { opacity: 1 }, tt(11.2)); V.shake(tl, cam, tt(11.2), 6, "v3b");
    // beat B: 2009
    var b = V.beat(cam, tl, tt(11.95), tt(13.95), C.b, 8, 120);
    var yr = V.text(b, "2009", { y: 330, size: V.fit("2009", 900, "Anton", 520), color: C.w }); V.count(tl, yr, tt(12.0), .45, 0, 2009, null, "power3.out"); V.flash(tl, b, tt(12.45), C.y);
    tl.fromTo(yr, { scale: 1.12 }, { scale: 1, duration: .15, ease: V.E.hit }, tt(12.45));
    var r1 = V.text(b, "RESEARCHERS", { y: 960, size: V.fit("RESEARCHERS", 940, "Anton", 190), color: C.y }); whip(r1, tt(12.56), -420);
    var r2 = V.text(b, "RELEASED", { y: 1170, size: 190, color: C.w }); whip(r2, tt(13.31), 420);
    // beat C: the wall of images
    var c = V.beat(cam, tl, tt(13.95), null, C.k, 9, 0);
    var icons = ["cat", "car", "cup", "plane"], imgs = icons.map(function (n) { var cv = V.halftone(240, 240, V.art[n], { cell: 9, color: C.k }); return cv.toDataURL("image/png"); });
    var wall = V.div("position:absolute;left:25px;top:0;width:1030px;height:6400px;transform-origin:515px 960px", c), tilesL = [];
    for (var rI = 0; rI < 25; rI++) for (var cI = 0; cI < 4; cI++) {
      var k = (rI * 3 + cI * 5 + (rI >> 1)) % 4, tile = V.div("position:absolute;left:" + (cI * 260) + "px;top:" + (rI * 260) + "px;width:250px;height:250px;background:" + ((rI + cI) % 2 ? C.y : C.w) + ";overflow:hidden", wall);
      var im = document.createElement("img"); im.src = imgs[k]; im.style.cssText = "position:absolute;left:0;top:0;width:250px;height:250px;transform:scale(1.02)"; tile.appendChild(im);
      var lab = V.div("position:absolute;left:0;bottom:0;width:250px;height:40px;background:" + C.k + ";color:" + C.w + ";font:700 26px/40px 'Inter Tight';text-align:center;opacity:0", tile); lab.textContent = ["CAT", "CAR", "CUP", "PLANE"][k]; tilesL.push(lab);
    }
    tl.fromTo(wall, { y: 0 }, { y: -3900, duration: tt(16.1) - tt(13.95), ease: "power2.in" }, tt(13.95));
    tl.fromTo(wall, { scale: 2.3 }, { scale: 1, duration: .8, ease: "power3.inOut" }, tt(16.1));
    tl.set(tilesL, { opacity: 1 }, tt(16.11));
    var cnt = V.div("position:absolute;left:90px;top:760px;width:900px;height:260px;background:" + C.y + ";border:8px solid " + C.k + ";box-shadow:14px 14px 0 " + C.k + ";display:flex;align-items:center;justify-content:center;font:400 190px/1 Anton;color:" + C.k + ";opacity:0", c);
    tl.set(cnt, { opacity: 1 }, tt(14.83)); V.count(tl, cnt, tt(14.83), .8, 0, 1000000, function (v) { var n = Math.round(v), s = String(n).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ","); return n >= 1000000 ? "1,000,000+" : s; }, "power3.in");
    tl.fromTo(cnt, { scale: 1 }, { scale: 1.1, duration: .1, ease: "power2.out" }, tt(15.65)).to(cnt, { scale: 1, duration: .15 }, tt(15.75));
    var tag = V.div("position:absolute;left:60px;top:250px;background:" + C.p + ";color:" + C.w + ";padding:14px 30px;font:400 100px/1 Anton;box-shadow:10px 10px 0 " + C.k + ";transform:rotate(-2deg)", c); tag.textContent = "IMAGENET";
    V.slamIn(tl, tag, tt(13.95), -2, 1.5);
''', "1.05")

# ---------------- V4 ----------------
write("V4", GH + '''
    var tt = function (g) { return L(g); };
    var slabOf = function (parent, color, num, word, ink, numBg, numInk, tNum, tWord, sd) {
      var slab = V.div("position:absolute;left:50px;top:360px;width:980px;height:800px;background:" + color + ";box-shadow:16px 16px 0 " + C.w, parent);
      var d = V.div("position:absolute;left:40px;top:40px;width:240px;height:240px;border-radius:50%;background:" + numBg + ";color:" + numInk + ";display:flex;align-items:center;justify-content:center;font:400 190px/1 Anton", slab); d.textContent = num;
      var w = V.text(slab, word, { x: 0, y: 340, w: 980, size: V.fit(word, 900, "Anton", 330), color: ink });
      V.slamIn(tl, slab, tNum, -1, 1.5); V.shake(tl, cam, tNum + .2, 6, sd + "a");
      tl.set(w, { opacity: 0 }, 0).set(w, { opacity: 1 }, tWord); V.shake(tl, cam, tWord, 6, sd + "b"); return slab;
    };
    // A: slab 2 COMPUTE
    var a = V.beat(cam, tl, 0, tt(19.0), C.k, 10, 0);
    slabOf(a, C.p, "2", "COMPUTE", C.w, C.k, C.p, tt(17.54), tt(18.21), "v4a");
    // B: 2012
    var b = V.beat(cam, tl, tt(19.0), tt(20.85), C.y, 11, 170);
    var yr = V.text(b, "2012", { y: 330, size: V.fit("2012", 900, "Anton", 540), color: C.k }); V.count(tl, yr, tt(19.1), .4, 0, 2012, null, "power3.out"); V.flash(tl, b, tt(19.5), C.w);
    tl.fromTo(yr, { scale: 1.12 }, { scale: 1, duration: .15, ease: V.E.hit }, tt(19.5));
    var n1 = V.text(b, "A NETWORK CALLED", { y: 980, size: V.fit("A NETWORK CALLED", 940, "Anton", 150), color: C.k }); whip(n1, tt(19.89), -420);
    // C: ALEXNET
    var c = V.beat(cam, tl, tt(20.85), tt(22.2), C.k, 12, 80);
    var an = V.text(c, "ALEXNET", { y: 520, size: V.fit("ALEXNET", 960, "Anton", 330), color: C.w }); whip(an, tt(20.91), 420);
    var sc = V.scribble(c, 100, 880, 880, C.p, "sc4", 18); V.draw(tl, sc, tt(21.2), .4, "power1.inOut");
    var rect = V.cutout(c, { x: 360, y: 1030, w: 360, h: 360, draw: V.art.neuron, cell: 10, color: C.w, fill: "#2b59ff", sx: 10, sy: 10 });
    tl.fromTo(rect, { scale: .5, opacity: 0, rotation: 8 }, { scale: 1, opacity: 1, rotation: 2, duration: .25, ease: V.E.snap }, tt(21.3));
    // D: two chips
    var d = V.beat(cam, tl, tt(22.2), tt(23.95), C.w, 13, 40);
    var t1 = V.text(d, "TRAINED ON JUST", { y: 230, size: V.fit("TRAINED ON JUST", 940, "Anton", 130), color: C.k }); whip(t1, tt(22.1), -420);
    var chA = V.cutout(d, { x: 50, y: 390, w: 470, h: 470, draw: V.art.chip, cell: 10, sx: 12, sy: 12 }), chB = V.cutout(d, { x: 560, y: 430, w: 470, h: 470, draw: V.art.chip, cell: 10, sx: 12, sy: 12 });
    tl.fromTo(chA, { y: -700, rotation: -6, opacity: 1 }, { y: 0, rotation: -2, duration: .22, ease: V.E.hit }, tt(22.3)); tl.fromTo(chB, { y: -800, rotation: 6, opacity: 1 }, { y: 0, rotation: 2, duration: .22, ease: V.E.hit }, tt(22.55));
    tl.set([chA, chB], { opacity: 0 }, 0).set(chA, { opacity: 1 }, tt(22.3)).set(chB, { opacity: 1 }, tt(22.55));
    V.shake(tl, cam, tt(22.3) + .2, 6, "v4c"); V.shake(tl, cam, tt(22.55) + .2, 6, "v4d");
    var stamp = V.div("position:absolute;left:290px;top:860px;width:500px;height:260px;border:14px solid " + C.p + ";color:" + C.p + ";display:flex;align-items:center;justify-content:center;font:400 220px/1 Anton;transform:rotate(-8deg);background:" + C.w + ";opacity:0", d); stamp.textContent = "x2";
    tl.fromTo(stamp, { scale: 2.2, opacity: 0 }, { scale: 1, opacity: 1, duration: .16, ease: V.E.hit }, tt(22.62)); V.shake(tl, cam, tt(22.62) + .14, 6, "v4e");
    var g1 = V.text(d, "TWO GPUS", { y: 1160, size: V.fit("TWO GPUS", 940, "Anton", 230), color: C.k }); whip(g1, tt(22.6), 420);
    var g2 = V.text(d, "GRAPHICS CHIPS", { y: 1420, size: 70, font: "'Inter Tight'", weight: 800, color: C.k }); tl.set(g2, { opacity: 0 }, 0).set(g2, { opacity: 1 }, tt(22.84));
    // E: won
    var e = V.beat(cam, tl, tt(23.95), null, C.b, 14, 40);
    var w1 = V.text(e, "WON", { y: 250, size: 330, color: C.w }); whip(w1, tt(24.15), -420);
    var w2 = V.text(e, "IMAGENET", { y: 560, size: V.fit("IMAGENET", 960, "Anton", 260), color: C.y }); whip(w2, tt(24.64), 420);
    var tro = V.cutout(e, { x: 60, y: 900, w: 420, h: 520, draw: V.art.trophy, cell: 10, fill: C.y, sx: 12, sy: 12 });
    tl.fromTo(tro, { scale: .4, opacity: 0, rotation: -12 }, { scale: 1, opacity: 1, rotation: -3, duration: .25, ease: V.E.snap }, tt(24.9));
    var hm = V.hilite(e, 500, 1170, 470, 130, C.p, "hl5", 1.5);
    var bw = V.text(e, "BY A WIDE", { x: 500, w: 520, align: "left", y: 1030, size: 120, color: C.w }), mg = V.text(e, "MARGIN", { x: 500, w: 520, align: "left", y: 1170, size: 150, color: C.w });
    tl.set(bw, { opacity: 0 }, 0).set(bw, { opacity: 1 }, tt(25.99)); V.hiliteWipe(tl, hm, tt(26.35), .25); tl.set(mg, { opacity: 0 }, 0).set(mg, { opacity: 1 }, tt(26.35));
    var av = V.svg("svg", { width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: "position:absolute;left:0;top:0;overflow:visible" }, e);
    var ar = V.arrow(av, 560, 1480, 960, 1380, C.y, "ar4", 10); V.draw(tl, ar, tt(26.6), .3, "power2.out");
''', "1.06")

# ---------------- V5 ----------------
write("V5", GH + '''
    var tt = function (g) { return L(g); };
    var a = V.beat(cam, tl, 0, null, C.w, 15, 0);
    var h = V.text(a, "TOP-5 ERROR", { y: 220, size: V.fit("TOP-5 ERROR", 940, "Anton", 210), color: C.k }); whip(h, 0.02, 600);
    var sub = V.text(a, "LOWER IS BETTER", { y: 450, size: 58, font: "'Inter Tight'", weight: 800, color: C.k, css: "letter-spacing:4px" });
    var X0 = 80, SCL = 900 / 26.2;
    var mk = function (y, label, col, val, tStart, tDur, lblCol) {
      var wrap = V.div("position:absolute;left:0;top:" + y + "px;width:1080px;height:320px", a);
      var lb = V.text(wrap, label, { x: X0, w: 700, align: "left", y: 0, size: 84, color: C.k });
      var bar = V.div("position:absolute;left:" + X0 + "px;top:104px;width:" + (val * SCL) + "px;height:200px;background:" + col + ";border:8px solid " + C.k + ";box-shadow:14px 14px 0 " + C.k + ";transform-origin:0 50%", wrap);
      var num = V.text(wrap, "0.0%", { x: X0 + 20, w: 500, align: "left", y: 120, size: 160, color: lblCol || C.k });
      tl.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: tDur, ease: "power3.out" }, tStart);
      V.count(tl, num, tStart, tDur, 0, val, function (v) { return v.toFixed(1) + "%"; }, "power3.out");
      tl.set(wrap, { opacity: 0 }, 0).set(wrap, { opacity: 1 }, tStart - .05); return wrap;
    };
    mk(560, "ALEXNET", C.y, 15.3, tt(27.84), .9);
    mk(950, "RUNNER-UP", "#8a877f", 26.2, tt(29.6), 1.1, C.w);
    var ov = V.svg("svg", { width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: "position:absolute;left:0;top:0;overflow:visible" }, a);
    var x1 = X0 + 15.3 * SCL + 10, x2 = X0 + 26.2 * SCL + 4, yb = 905;
    var br = { path: V.svg("path", { d: "M" + x1 + " " + (yb - 36) + " L" + x1 + " " + yb + " L" + x2 + " " + yb + " L" + x2 + " " + (yb - 36), stroke: C.p, "stroke-width": 16, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, ov) };
    br.len = br.path.getTotalLength(); br.path.setAttribute("stroke-dasharray", br.len); br.path.setAttribute("stroke-dashoffset", br.len);
    V.draw(tl, br, tt(30.8), .3, "power2.out");
    var arr = V.arrow(ov, 300, 1400, 620, 940, C.p, "ar5", 14); V.draw(tl, arr, tt(30.95), .3, "power2.out");
    var gap = V.text(a, "WIDE MARGIN", { x: 80, w: 700, align: "left", y: 1360, size: 130, color: C.p }); tl.set(gap, { opacity: 0 }, 0).set(gap, { opacity: 1 }, tt(30.95));
''', "1.05")

# ---------------- V6 ----------------
write("V6", GH + '''
    var tt = function (g) { return L(g); };
    var slabOf = function (parent, color, num, word, ink, numBg, numInk, tNum, tWord, sd) {
      var slab = V.div("position:absolute;left:50px;top:360px;width:980px;height:800px;background:" + color + ";box-shadow:16px 16px 0 " + C.w, parent);
      var d = V.div("position:absolute;left:40px;top:40px;width:240px;height:240px;border-radius:50%;background:" + numBg + ";color:" + numInk + ";display:flex;align-items:center;justify-content:center;font:400 190px/1 Anton", slab); d.textContent = num;
      var w = V.text(slab, word, { x: 0, y: 340, w: 980, size: V.fit(word, 900, "Anton", 330), color: ink });
      V.slamIn(tl, slab, tNum, -1, 1.5); V.shake(tl, cam, tNum + .2, 6, sd + "a");
      tl.set(w, { opacity: 0 }, 0).set(w, { opacity: 1 }, tWord); V.shake(tl, cam, tWord, 6, sd + "b"); return slab;
    };
    var a = V.beat(cam, tl, 0, tt(32.2), C.k, 16, 0);
    slabOf(a, C.b, "3", "DESIGN", C.w, C.y, C.k, tt(31.54), tt(32.1), "v6a");
    var b = V.beat(cam, tl, tt(32.2), tt(33.6), C.y, 17, 60);
    var b1 = V.text(b, "A DESIGN", { y: 300, size: V.fit("A DESIGN", 940, "Anton", 300), color: C.k }); whip(b1, tt(32.27), -420);
    var b2 = V.text(b, "THAT", { y: 600, size: 240, color: C.k }); whip(b2, tt(32.78), 420);
    var hs = V.hilite(b, 150, 840, 780, 250, C.p, "hl6", -2);
    var b3 = V.text(b, "SCALES", { y: 830, size: V.fit("SCALES", 740, "Anton", 330), color: C.k }); whip(b3, tt(33.01), -420); V.hiliteWipe(tl, hs, tt(33.01), .2);
    tl.fromTo(b3, { scale: 1 }, { scale: 1.12, duration: .5, ease: "power2.out" }, tt(33.1));
    var up = V.arrow(b.querySelector("svg") || b, 200, 1500, 880, 1250, C.k, "ar6", 14); V.draw(tl, up, tt(33.1), .4, "power2.out");
    var c = V.beat(cam, tl, tt(33.6), tt(34.95), C.k, 18, 200);
    var yr = V.text(c, "2017", { y: 330, size: V.fit("2017", 900, "Anton", 540), color: C.y }); V.count(tl, yr, tt(33.7), .4, 0, 2017, null, "power3.out"); V.flash(tl, c, tt(34.1), C.w);
    tl.fromTo(yr, { scale: 1.12 }, { scale: 1, duration: .15, ease: V.E.hit }, tt(34.1));
    var d = V.beat(cam, tl, tt(34.95), tt(36.15), C.w, 19, 20);
    var doc = V.cutout(d, { x: 330, y: 300, w: 420, h: 540, draw: function (g, w, h) { var gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#fff"); gr.addColorStop(1, "#d8d8d8"); g.fillStyle = "#e8e8e8"; g.fillRect(w * .05, h * .03, w * .9, h * .94); for (var i = 0; i < 12; i++) { g.fillStyle = "#333"; g.fillRect(w * .15, h * (.12 + i * .068), w * (i % 5 === 4 ? .35 : .7), h * .022); } g.fillStyle = "#111"; g.fillRect(w * .15, h * .06, w * .5, h * .03); }, cell: 8, sx: 12, sy: 12 });
    tl.fromTo(doc, { scale: .5, opacity: 0, rotation: -10 }, { scale: 1, opacity: 1, rotation: -2, duration: .26, ease: V.E.snap }, tt(34.54) > tt(34.95) ? tt(34.95) : tt(34.95));
    var d1 = V.text(d, "A PAPER", { y: 900, size: 230, color: C.k }); whip(d1, tt(35.0), -420);
    var d2 = V.text(d, "INTRODUCED", { y: 1150, size: V.fit("INTRODUCED", 940, "Anton", 230), color: C.b }); whip(d2, tt(35.03), 420);
    var e = V.beat(cam, tl, tt(36.15), null, C.p, 20, 250);
    var e1 = V.text(e, "THE", { y: 500, size: 200, color: C.k }); whip(e1, tt(36.02), -420);
    var e2 = V.text(e, "TRANSFORMER", { y: 720, size: V.fit("TRANSFORMER", 960, "Anton", 330), color: C.w }); V.slamIn(tl, e2, tt(36.29), 0, 1.6); V.shake(tl, cam, tt(36.29) + .17, 6, "v6c");
''', "1.07")

# ---------------- V7 ----------------
write("V7", GH + '''
    var tt = function (g) { return L(g); };
    var a = V.beat(cam, tl, 0, tt(40.0), C.b, 21, 0);
    var blk = V.halftone(220, 120, V.art.block, { cell: 8, color: C.k }).toDataURL("image/png");
    var lanes = V.svg("svg", { width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: "position:absolute;left:0;top:0;overflow:visible" }, a);
    var laneLines = [0, 1, 2, 3].map(function (k) { var o = { path: V.svg("path", { d: "M" + (170 + k * 250) + " 500 L" + (170 + k * 250) + " 1290", stroke: C.w, "stroke-width": 5, "stroke-dasharray": "18 14", fill: "none", "stroke-opacity": .8 }, lanes) }; return o; });
    tl.set(laneLines.map(function (o) { return o.path; }), { opacity: 0 }, 0).set(laneLines.map(function (o) { return o.path; }), { opacity: 1 }, tt(39.1));
    var ttl = V.text(a, "TRANSFORMER", { y: 220, size: V.fit("TRANSFORMER", 940, "Anton", 170), color: C.w }); whip(ttl, tt(37.61), -420);
    var blocks = [];
    for (var i = 0; i < 12; i++) {
      var bd = V.div("position:absolute;left:0;top:0;width:220px;height:120px;background:" + C.y + " url(" + blk + ");background-size:220px 120px;border:6px solid " + C.w + ";box-shadow:10px 10px 0 " + C.k + ";box-sizing:content-box", a);
      var k = i % 4, r = Math.floor(i / 4), tx = 60 + k * 250 - 6, ty = 560 + r * 190, sx = 430 - 6, sy = 1170 - i * 56;
      tl.fromTo(bd, { x: sx, y: sy - 60, opacity: 0, rotation: (i % 2 ? 2 : -2) }, { x: sx, y: sy, opacity: 1, rotation: (i % 2 ? 1 : -1), duration: .18, ease: V.E.hit }, tt(37.8) + i * .08);
      tl.to(bd, { x: tx, y: ty, rotation: 0, duration: .32, ease: V.E.snap }, tt(38.76) + (k * .05) + r * .03);
      blocks.push(bd);
    }
    var an = V.hilite(a, 120, 1300, 830, 120, C.y, "hl7", 1);
    var ann = V.text(a, "AT ONCE", { y: 1300, size: 110, color: C.k, font: "Anton" }); whip(ann, tt(39.5), 420); V.hiliteWipe(tl, an, tt(39.5), .2);
    var cm = V.circleMark(lanes, 540, 900, 500, 400, C.p, "cm7", 12); V.draw(tl, cm, tt(39.3), .35, "power2.out");
    // beat C: more chips, more data
    var c = V.beat(cam, tl, tt(40.0), tt(42.17), C.y, 22, 0);
    var m1 = V.text(c, "MORE CHIPS", { y: 190, size: V.fit("MORE CHIPS", 940, "Anton", 190), color: C.k }); whip(m1, tt(40.3), -420);
    for (var j = 0; j < 6; j++) {
      var cp = V.cutout(c, { x: 90 + (j % 3) * 320, y: 420 + Math.floor(j / 3) * 270, w: 240, h: 240, draw: V.art.chip, cell: 8, sx: 9, sy: 9 });
      tl.set(cp, { opacity: 0 }, 0); tl.fromTo(cp, { scale: .3, opacity: 0, rotation: (j % 2 ? 8 : -8) }, { scale: 1, opacity: 1, rotation: (j % 2 ? 2 : -2), duration: .2, ease: V.E.snap }, tt(40.7) + j * .1);
    }
    var m2 = V.text(c, "MORE DATA", { y: 990, size: V.fit("MORE DATA", 940, "Anton", 190), color: C.k }); whip(m2, tt(41.52), 420);
    ["cat", "car", "cup", "plane"].forEach(function (n, q) {
      var dt = V.cutout(c, { x: 70 + q * 240, y: 1250, w: 200, h: 200, draw: V.art[n], cell: 8, sx: 8, sy: 8 });
      tl.fromTo(dt, { scale: .3, opacity: 0 }, { scale: 1, opacity: 1, duration: .2, ease: V.E.snap }, tt(41.6) + q * .08);
    });
    // beat D: keeps paying off
    var d = V.beat(cam, tl, tt(42.17), null, C.k, 23, 150);
    var k1 = V.text(d, "KEEPS", { y: 260, size: 300, color: C.w }); whip(k1, tt(42.19), -420);
    var k2 = V.text(d, "PAYING OFF", { y: 580, size: V.fit("PAYING OFF", 960, "Anton", 300), color: C.y }); V.slamIn(tl, k2, tt(42.47), 0, 1.6); V.shake(tl, cam, tt(42.47) + .17, 6, "v7d");
    var dv = V.svg("svg", { width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: "position:absolute;left:0;top:0;overflow:visible" }, d);
    var ra = V.arrow(dv, 160, 1450, 900, 980, C.p, "ra7", 20); V.draw(tl, ra, tt(42.5), .4, "power2.out"); V.flash(tl, d, tt(42.85), C.y);
''', "1.06")

# ---------------- V8 ----------------
write("V8", GH + '''
    var tt = function (g) { return L(g); };
    var a = V.beat(cam, tl, 0, tt(44.4), C.y, 24, 220);
    var yr = V.text(a, "2020", { y: 330, size: V.fit("2020", 900, "Anton", 540), color: C.k }); V.count(tl, yr, tt(43.55), .4, 0, 2020, null, "power3.out"); V.flash(tl, a, tt(43.98), C.w);
    tl.fromTo(yr, { scale: 1.12 }, { scale: 1, duration: .15, ease: V.E.hit }, tt(43.98));
    var b = V.beat(cam, tl, tt(44.4), null, C.k, 25, 0);
    var cx0 = 150, cx1 = 1000, cy0 = 1340, cy1 = 500;
    var sv = V.svg("svg", { width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: "position:absolute;left:0;top:0;overflow:visible" }, b);
    for (var g = 0; g < 6; g++) V.svg("path", { d: "M" + cx0 + " " + (cy0 - g * 150) + " L" + cx1 + " " + (cy0 - g * 150), stroke: C.w, "stroke-opacity": .22, "stroke-width": 3 }, sv);
    var ax = { path: V.svg("path", { d: "M" + cx0 + " " + (cy1 - 40) + " L" + cx0 + " " + cy0 + " L" + cx1 + " " + cy0, stroke: C.w, "stroke-width": 8, fill: "none", "stroke-linecap": "round" }, sv) };
    ax.len = ax.path.getTotalLength(); ax.path.setAttribute("stroke-dasharray", ax.len); ax.path.setAttribute("stroke-dashoffset", ax.len); V.draw(tl, ax, tt(44.45), .4, "power2.out");
    var ylab = V.text(b, "(LOG SCALE)", { x: 0, w: 1080, align: "center", y: 300, size: 50, font: "'Inter Tight'", weight: 800, color: "#8a877f", css: "letter-spacing:4px" }); tl.set(ylab, { opacity: 0 }, 0).set(ylab, { opacity: 1 }, tt(44.7));
    var pts = [[250, 1230, "1958", "PERCEPTRON", C.w, 18], [560, 960, "2012", "ALEXNET", C.w, 18], [830, 640, "2020", "GPT-3", C.y, 30]];
    var line = { path: V.svg("path", { d: "M" + pts[0][0] + " " + pts[0][1] + " L" + pts[1][0] + " " + pts[1][1] + " L" + pts[2][0] + " " + pts[2][1], stroke: C.y, "stroke-width": 8, fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, sv) };
    line.len = line.path.getTotalLength(); line.path.setAttribute("stroke-dasharray", line.len); line.path.setAttribute("stroke-dashoffset", line.len); V.draw(tl, line, tt(44.9), .9, "power1.inOut");
    pts.forEach(function (p, i) {
      var tm = [tt(44.8), tt(45.0), tt(44.95)][i] + (i === 2 ? .8 : 0);
      var dot = V.div("position:absolute;left:" + (p[0] - p[5]) + "px;top:" + (p[1] - p[5]) + "px;width:" + p[5] * 2 + "px;height:" + p[5] * 2 + "px;border-radius:50%;background:" + p[4] + ";border:5px solid " + C.k + ";opacity:0", b);
      tl.fromTo(dot, { scale: .2, opacity: 0 }, { scale: 1, opacity: 1, duration: .2, ease: V.E.snap }, tm);
      var yl = V.text(b, p[2], { x: p[0] - 110, w: 220, y: 1370, size: 54, font: "'Inter Tight'", weight: 800, color: C.w }); tl.set(yl, { opacity: 0 }, 0).set(yl, { opacity: 1 }, tm);
      var nm = V.text(b, p[3], i === 2 ? { x: p[0] + 44, w: 300, align: "left", y: p[1] - 24, size: 58, color: p[4] } : i === 0 ? { x: p[0] - 200, w: 400, align: "center", y: p[1] + 34, size: 58, color: p[4] } : { x: p[0] - 44 - 380, w: 380, align: "right", y: p[1] - 26, size: 58, color: p[4] }); tl.set(nm, { opacity: 0 }, 0).set(nm, { opacity: 1 }, tm);
    });
    var pill = V.div("position:absolute;left:230px;top:400px;width:720px;height:140px;background:" + C.p + ";border:7px solid " + C.k + ";box-shadow:12px 12px 0 " + C.k + ";display:flex;align-items:center;justify-content:center;font:400 112px/1 Anton;color:" + C.w + ";opacity:0", b);
    tl.set(pill, { opacity: 1 }, tt(45.45)); V.count(tl, pill, tt(45.45), .45, 0, 175, function (v) { return Math.round(v) + " BILLION"; }, "power2.out");
    tl.fromTo(pill, { scale: 1.2 }, { scale: 1, duration: .16, ease: V.E.hit }, tt(45.95)); V.flash(tl, b, tt(45.95), C.y);
    var pa = V.arrow(sv, 800, 548, 880, 600, C.y, "pa8", 9); V.draw(tl, pa, tt(46.1), .25, "power2.out");
    var ptxt = V.text(b, "PARAMETERS", { x: 0, w: 1080, y: 160, size: 130, color: C.w }); whip(ptxt, tt(46.84), -420);
''', "1.05")

# ---------------- V9 ----------------
write("V9", GH + '''
    var tt = function (g) { return L(g); };
    var a = V.beat(cam, tl, 0, tt(50.12), C.y, 26, 0);
    var s1 = V.text(a, "SAME", { y: 270, size: 400, color: C.k }); whip(s1, tt(48.95), -420);
    var s2 = V.text(a, "OLD", { y: 650, size: 400, color: C.k }); whip(s2, tt(49.31), 420);
    var s3 = V.text(a, "IDEA.", { y: 1030, size: V.fit("IDEA.", 900, "Anton", 400), color: C.k }); V.slamIn(tl, s3, tt(49.52), 0, 1.5); V.shake(tl, cam, tt(49.52) + .17, 6, "v9a");
    var b = V.beat(cam, tl, tt(50.12), tt(52.85), C.k, 27, 0);
    var sp = V.spine(b, { x0: 70, x1: 1010, baseY: 1380, topY: 440, color: C.y, w: 16, tickColor: C.w, tickW: 4 });
    sp.reveal(tl, tt(49.95), .1, 0, 0, "none");
    var seg = [[tt(50.0), tt(50.16), 0, sp.lenAt(2009)], [tt(50.16), tt(50.62), sp.lenAt(2009), sp.lenAt(2012)], [tt(50.62), tt(51.6), sp.lenAt(2012), sp.lenAt(2017)], [tt(51.6), tt(52.2), sp.lenAt(2017), 1]];
    sp.reveal(tl, tt(49.0), tt(50.0) - tt(49.0), 0, 0, "none");
    seg.forEach(function (s, i) { tl.to(sp.path, { attr: { "stroke-dashoffset": sp.len * (1 - s[3]) }, duration: Math.max(.05, s[1] - s[0]), ease: i === 0 ? "power3.out" : "none" }, s[0]); });
    var pins = [[2009, "DATA", C.p, 50.16, C.w], [2012, "COMPUTE", C.b, 50.62, C.w], [2017, "DESIGN", C.w, 51.6, C.k]];
    pins.forEach(function (p, i) {
      var g = sp.pin(p[0], p[1], p[2], { up: 80 + i * 130, ink: p[4] });
      tl.fromTo(g, { opacity: 0 }, { opacity: 1, duration: .01 }, tt(p[3]));
      tl.fromTo(g, { scale: 1.5, transformOrigin: sp.xOf(p[0]) + "px " + sp.yOf(p[0]) + "px" }, { scale: 1, duration: .2, ease: V.E.hit }, tt(p[3]));
    });
    var hl = V.text(b, "FLAT. THEN STEEP.", { y: 250, size: V.fit("FLAT. THEN STEEP.", 940, "Anton", 150), color: C.w }); whip(hl, tt(50.4), -420);
    var c = V.beat(cam, tl, tt(52.85), null, C.y, 28, 150);
    var f1 = V.text(c, "SAME IDEA.", { y: 330, size: V.fit("SAME IDEA.", 960, "Anton", 330), color: C.k }); V.slamIn(tl, f1, tt(52.9), 0, 1.6); V.shake(tl, cam, tt(52.9) + .17, 6, "v9b");
    var hn = V.hilite(c, 40, 690, 1000, 470, C.p, "hl9", -1.5);
    var f2 = V.text(c, "NEW", { y: 700, size: 200, color: C.w }); var f3 = V.text(c, "INGREDIENTS.", { y: 910, size: V.fit("INGREDIENTS.", 900, "Anton", 260), color: C.w });
    V.hiliteWipe(tl, hn, tt(53.45), .22); V.slamIn(tl, f2, tt(53.45), 0, 1.5); V.slamIn(tl, f3, tt(53.6), 0, 1.5); V.shake(tl, cam, tt(53.62) + .17, 6, "v9c");
    var hd = V.text(c, "@hemanth_with_ai", { y: 1230, size: 64, font: "'Inter Tight'", weight: 800, color: C.k }); tl.set(hd, { opacity: 0 }, 0).set(hd, { opacity: 1 }, tt(54.3));
''', "1.05")
