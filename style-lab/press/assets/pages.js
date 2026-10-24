/* pages.js - the four page layouts of THE DAILY TOKEN. All copy is original. */
(function () {
  var W = window, P = W.Press, C = P.C, F = P.F;
  var COLX = function (i) { return 50 + i * 286; }, CW = 256, COLTOP = 892, COLBOT = 2034;

  /* shrink a font so the widest of several lines fits */
  P.fit = function (lines, font, weight, maxW, size0) {
    var m = document.createElement("canvas").getContext("2d"), s = size0;
    for (; s > 20; s -= 2) { m.font = weight + " " + s + "px " + font; var w = Math.max.apply(null, lines.map(function (l) { return m.measureText(l).width; })); if (w <= maxW) break; }
    return s;
  };
  /* append a flexible ad box so every column ends on the same line */
  P.fillCol = function (parent, x, bottom, title, sub, seed) {
    var h = COLBOT - bottom - 14;
    if (h < 56) return null;
    return P.box(parent, x, bottom + 14, CW, h, { bw: 2, style: seed % 2 ? "solid" : "dashed", pad: 6, css: "display:flex;flex-direction:column;justify-content:center;align-items:center;gap:4px",
      html: "<div style='font:900 " + Math.min(34, 14 + h / 7) + "px/1 " + F.head + ";letter-spacing:1px'>" + title + "</div><div style='font:italic 400 13px/1.25 " + F.body + "'>" + sub + "</div>" });
  };
  P.colBottom = function (el) { return el.offsetTop + el.offsetHeight; };

  var PIC = { robot: [250, 250], book: [300, 330], bubble: [360, 300], magnifier: [200, 200], hand: [230, 150], shelf: [440, 190] };
  P.pic = function (parent, kind, x, y, w, h, o) {
    var c = P.halftone(w, h, function (g, ww, hh) { P.art[kind](g, ww, hh); }, { cell: (o && o.cell) || 10, angle: 45 });
    var d = P.div("position:absolute;left:" + x + "px;top:" + y + "px;width:" + w + "px;height:" + h + "px", parent); d.appendChild(c); return d;
  };
  var shadeFrame = function (parent, x, y, w, h) { return P.div("position:absolute;left:" + (x - 3) + "px;top:" + (y - 3) + "px;width:" + (w + 6) + "px;height:" + (h + 6) + "px;border:1.5px solid " + C.ink + ";box-sizing:border-box", parent); };

  /* ---------- FRONT PAGE (scenes A and E) ---------- */
  P.buildFront = function (root, o) {
    o = o || {}; var sh = P.shell(root, { seed: 3 }), ink = sh.ink, over = sh.over, R = { sh: sh };
    var mh = P.masthead(sh, false); R.mast = mh;
    var y0 = mh.bottom + 22;                                                   // kicker line
    R.kicker = P.t(over, "EXTRA", { x: 50, y: y0, font: "400 40px/1 " + F.slab, color: C.red, css: "letter-spacing:10px;transform-origin:0 50%;" });
    R.kickRule = P.rule(over, 330, y0 + 20, 1120, 5, C.red); P.rule(over, 330, y0 + 30, 1120, 1.5, C.red);
    var hl = ["MODEL SPEAKS", "WITH CONFIDENCE.", "IT WAS WRONG."];
    var fs = P.fit(hl, "'Playfair Display'", 900, 1390, 130);
    R.head = hl.map(function (t, i) { return P.t(ink, t, { x: 50, y: y0 + 60 + i * fs * 1.0, font: "900 " + fs + "px/1 " + F.head, css: "white-space:nowrap;letter-spacing:-1px" }); });
    var dy = y0 + 60 + 3 * fs + 12;
    R.deck = P.t(ink, "A chatbot answered a simple question with a calm, certain and entirely invented reply. Researchers say the machine did precisely what it was built to do.", { x: 50, y: dy, w: 1400, font: "italic 400 30px/1.3 " + F.body });
    P.rule(ink, 50, COLTOP - 14, 1400, 2.5); P.rule(ink, 50, COLTOP - 9, 1400, 1);
    for (var i = 1; i < 5; i++) P.colRule(ink, COLX(i) - 15, COLTOP, COLBOT - COLTOP);
    var cols = [];
    // column 1: lead story with drop cap
    var t1 = "On Tuesday morning a language model told a reader something that was not true. It did not hesitate. It did not hedge. The answer arrived in smooth, well formed sentences, with the easy tone of a clerk who has seen everything, and each word sat comfortably beside the next.\nThe reader had asked a plain question. The machine gave a plain, confident answer. Only the answer was wrong, and nothing in its manner said so.\nThis newspaper put the matter to people who build such systems. Their reply was calm, almost weary. Nothing broke, they said. The program had done exactly what it was trained to do, and that, they added, is the whole story.\nNobody at the company was alarmed. A spokesperson, speaking from a quiet office, said the product had \u201Cbehaved as designed.\u201D She would not say whether that was a comfort.\nReaders who wrote to this paper described the same experience. The answers were polite. They were detailed. They were, on closer reading, made up. One reader said it felt like being misled by a very good waiter.";
    var b1 = P.body(ink, t1, { x: COLX(0), y: COLTOP, w: CW }); P.dropcap(b1, "O"); cols.push(b1);
    P.byline = P.t(ink, "BY THE TOKEN DESK", { x: COLX(0), y: P.colBottom(b1) + 12, font: "400 12.5px " + F.type, css: "letter-spacing:2px" });
    // column 2: robot picture + caption + text
    var pr = P.pic(over, "robot", COLX(1), COLTOP, 256, 250); shadeFrame(over, COLX(1), COLTOP, 256, 250);
    var cap2 = P.t(ink, "The machine, as our artist imagines it. It does not know when it is wrong.", { x: COLX(1), y: COLTOP + 262, w: CW, font: "italic 400 12.5px/1.25 " + F.body, css: "text-align:left" });
    var t2 = "A language model learns from a vast library of text. In training it plays one game over and over: given the words so far, guess the next one. When its guess is close to what a real writer wrote, it is rewarded. When it is far, it is nudged.\nNowhere in that game is there a column marked true. There is only a column marked likely, and the machine is very good at filling it in.\nSo it does. Page after page, in the same even voice, whether the page happens to be right or not.\nEngineers call the fluent, confident style of these systems a side effect of training. A machine rewarded for sounding right will learn to sound right, and sounding right is a different skill from being right.\nThe distinction is easy to state and hard to feel. When a paragraph reads well, the reader\u2019s instinct is to believe it.";
    var b2 = P.body(ink, t2, { x: COLX(1), y: COLTOP + 306, w: CW }); cols.push(b2);
    // column 3: pull quote + the sentence the video keeps returning to
    P.rule(over, COLX(2), COLTOP, CW, 2.5, C.red);
    var pq = P.t(ink, "“Likely is not the same as true.”", { x: COLX(2), y: COLTOP + 14, w: CW, font: "italic 700 34px/1.12 " + F.head, align: "center" });
    P.rule(over, COLX(2), COLTOP + 14 + 34 * 1.12 * 3 + 20, CW, 1.2, C.red);
    var key = "A language model is trained to pick a likely next word.".split(" ").map(function (w, k) { return "<span class='sw'>" + w + "</span>"; }).join(" ");
    var t3 = key + " Likely means the word fits the pattern of the words before it. It does not mean the claim was checked, or that anyone, anywhere, ever wrote it down.\nFluent writing is cheap for the machine. A false sentence and a true sentence cost it about the same effort, and both arrive in the same steady voice. The listener is left to decide which sentence is <span class='tw'>true</span>.\nThat is a hard job to do alone, at speed, at midnight.\nSome readers hold that a confident tone should count as a warning. A person who is sure of everything is rarely right about everything, and the same may be said of machines.\nCases like this one are multiplying. Lawyers, students and clerks have all trusted a smooth answer and paid for it. The machines are not lying, exactly; a liar knows the truth. These systems are better described as improvising.\nFor now the advice is old and plain: trust, but check.";
    var b3 = P.body(ink, t3, { x: COLX(2), y: COLTOP + 14 + 34 * 1.12 * 3 + 40, w: CW }); cols.push(b3);
    R.sw = [].slice.call(b3.querySelectorAll(".sw")); R.tw = b3.querySelector(".tw");
    // column 4: ad + advice
    var ad = P.box(ink, COLX(3), COLTOP, CW, 134, { bw: 3, pad: 8, html: "<div style='font:400 11.5px " + F.type + ";letter-spacing:3px'>NOW AT YOUR PRINTER</div><div style='font:900 38px/1 " + F.head + ";margin:6px 0 4px'>TYPE-O-<br>MATIC</div><div style='font:italic 400 14px/1.25 " + F.body + "'>Letters set while you wait. Tell your printer you saw it here.</div>" });
    var t4 = "WHAT TO DO\nReaders are advised to treat a smooth answer as a draft and not a verdict. Ask where a claim comes from. Ask whether the source exists. Ask again in different words and see whether the story holds.\nSeveral labs now let their models look things up and show their sources. Our reporters found that this helps, though it is no cure.\nOUR FIELD GUIDE\nA hedge such as \u201CI think\u201D or \u201Cit may be\u201D is welcome in an answer. Its absence is not proof of truth. A confident tone costs nothing to produce. Ask for the source, then open the source.\nIf the source cannot be found, treat the claim as a story.\nTHE PRINTER\u2019S NOTE\nTo set this page the compositor needed four hours and a great deal of ink. The machine wrote its false answer in about four seconds. That is the whole difficulty in a sentence: speed makes carelessness cheap, and checking is still slow work.\nContinued on page 3.";
    var b4 = P.body(ink, t4.replace(/^WHAT TO DO/, "<b style='font:700 13px " + F.type + ";letter-spacing:3px'>WHAT TO DO</b>").replace(/\n/, "\n"), { x: COLX(3), y: COLTOP + 150, w: CW }); cols.push(b4);
    // column 5: sidebar + markets + small ads
    var sb = P.box(ink, COLX(4), COLTOP, CW, 228, { bw: 3, style: "double", pad: 12, html: "<div style='font:400 12px " + F.type + ";letter-spacing:3px'>WORD OF THE DAY</div><div style='font:900 40px/1.05 " + F.head + ";margin:8px 0'>confidence</div><div style='font:italic 400 14.5px/1.3 " + F.body + ";text-align:left'><b>n.</b> The manner of someone who is sure. Not a measure of whether they are right.</div>" });
    var mk = P.body(ink, "<div style='font:700 13px " + F.type + ";letter-spacing:3px;margin-bottom:6px'>MARKETS</div><div style='font:400 14px/1.35 " + F.body + "'>Tokens steady. Certainty overpriced. Doubt in short supply, with buyers expected on Monday.</div>", { x: COLX(4), y: COLTOP + 246, w: CW, raw: true }); cols.push(mk);
    var mk2y = P.colBottom(mk) + 18, mk2 = P.box(ink, COLX(4), mk2y, CW, 120, { bw: 1.5, pad: 8, html: "<div style='font:900 26px/1 " + F.head + "'>LAMPS &amp; LENSES</div><div style='font:italic 400 13px/1.25 " + F.body + ";margin-top:6px'>Everything for the careful reader. Magnifiers a speciality.</div>" });
    var lt = P.body(ink, "<div style='font:700 13px " + F.type + ";letter-spacing:3px;margin-bottom:6px'>LETTERS</div><div style='font:italic 400 17px/1.3 " + F.body + ";text-align:justify'>Sir, I asked the machine for the date of a famous battle and it gave me three. Yours, A Puzzled Reader.<br><br>Sir, I asked for a recipe and was given a very fine one for a dish that cannot exist. It was delicious in my imagination. Yours, A Hungry Reader.</div>", { x: COLX(4), y: mk2y + 120 + 20, w: CW, raw: true });
    var sp = P.body(ink, "<div style='font:700 13px " + F.type + ";letter-spacing:3px;margin-bottom:6px'>SPORTS</div><div style='font:400 17px/1.3 " + F.body + ";text-align:justify'>The Careful Models beat the Confident Models by a narrow margin on Saturday. Both sides claimed a larger score.</div>", { x: COLX(4), y: P.colBottom(lt) + 20, w: CW, raw: true });
    var wt = P.body(ink, "<div style='font:700 13px " + F.type + ";letter-spacing:3px;margin-bottom:6px'>WEATHER</div><div style='font:400 14px/1.35 " + F.body + "'>Fair and fluent, with a chance of nonsense after dark.</div>", { x: COLX(4), y: P.colBottom(sp) + 20, w: CW, raw: true });
    // fill every column to the same baseline
    [b1, b2, b3, b4].forEach(function (b, i) { var bt = P.colBottom(b); if (i === 0) bt = Math.max(bt, parseFloat(P.byline.style.top) + 18); P.fillCol(ink, COLX(i), bt, ["ERRATA", "BOOKS", "NOTICE", "WANTED"][i], ["Mistakes will be printed here when found.", "Reviews of volumes that do exist.", "This paper is set by hand.", "A reader with a good eye for sources."][i], i); });
    P.fillCol(ink, COLX(4), P.colBottom(wt), "PUZZLE", "Find the true sentence.", 5);
    // colophon
    P.rule(ink, 50, 2040, 1400, 2); P.t(ink, "THE DAILY TOKEN IS SET BY HAND AND CHECKED BY HAND.  @hemanth_with_ai", { x: 50, y: 2052, w: 1400, align: "center", font: "400 14px " + F.type, css: "letter-spacing:3px" });
    window.__front = cols.map(function (c) { return P.colBottom(c); }).concat([P.colBottom(wt)]); R.cols = cols; R.b3 = b3; R.deckEl = R.deck; R.fs = fs; R.y0 = y0;
    return R;
  };

  /* a generic compact page: masthead, kicker, headline; returns y of the first free line */
  function compactTop(sh, kick, lines, deck) {
    var ink = sh.ink, over = sh.over, R = {}, mh = P.masthead(sh, true), y0 = mh.bottom + 20;
    R.kicker = P.t(over, kick, { x: 50, y: y0, font: "400 34px/1 " + F.slab, color: C.red, css: "letter-spacing:8px;transform-origin:0 50%" });
    R.kickRule = P.rule(over, 50 + kick.length * 29 + 40, y0 + 17, 1400 - kick.length * 29 - 40, 4, C.red);
    var fs = P.fit(lines, "'Playfair Display'", 900, 1390, 150);
    R.head = lines.map(function (t, i) { return P.t(ink, t, { x: 50, y: y0 + 54 + i * fs * 1.0, font: "900 " + fs + "px/1 " + F.head, css: "white-space:nowrap;letter-spacing:-1px" }); });
    R.fs = fs; R.y = y0 + 54 + lines.length * fs + 8;
    if (deck) { R.deck = P.t(ink, deck, { x: 50, y: R.y + 6, w: 1400, font: "italic 400 28px/1.3 " + F.body }); R.y += 80; }
    P.rule(ink, 50, R.y + 8, 1400, 2.5); P.rule(ink, 50, R.y + 13, 1400, 1);
    R.y += 28; return R;
  }
  function columns(sh, y, bottom, texts, n, opts) {
    var ink = sh.ink, w = (1400 - (n - 1) * 30) / n, out = [];
    for (var i = 0; i < n; i++) { if (i) P.colRule(ink, 50 + i * (w + 30) - 15, y, bottom - y); }
    return { w: w, x: function (i) { return 50 + i * (w + 30); } };
  }

  /* ---------- BOOK PAGE (scene B) ---------- */
  P.buildBook = function (root) {
    var CB = 1650, sh = P.shell(root, { seed: 5, ph: 1700 }), ink = sh.ink, over = sh.over, R = { sh: sh };
    var T = compactTop(sh, "SPECIAL REPORT", ["THE BOOK THAT", "WAS NEVER WRITTEN"], "Asked for a book on a quiet subject, the model produced a title, an author and a year. All three were invented.");
    R.top = T; var y = T.y + 14;
    R.bookPic = P.pic(over, "book", 80, y, 400, 440, { cell: 11 }); shadeFrame(over, 80, y, 400, 440);
    P.t(ink, "A book that exists only in the machine’s imagination.", { x: 80, y: y + 450, w: 400, font: "italic 400 14px/1.25 " + F.body });
    // catalog card
    var cx = 560, cy = y + 10, cw = 560, ch = 400;
    var card = P.div("position:absolute;left:" + cx + "px;top:" + cy + "px;width:" + cw + "px;height:" + ch + "px;background:#f1ebda;border:2px solid " + C.ink + ";box-shadow:6px 8px 0 rgba(27,26,23,.35);transform:rotate(-1.2deg)", over);
    P.rule(card, 0, 54, cw, 3, C.red);
    var lines = ""; for (var k = 0; k < 7; k++) lines += "<div style='position:absolute;left:0;top:" + (96 + k * 38) + "px;width:100%;height:1px;background:rgba(27,26,23,.28)'></div>";
    card.insertAdjacentHTML("beforeend", lines + "<div style='position:absolute;left:" + (cw / 2 - 11) + "px;bottom:14px;width:22px;height:22px;border-radius:50%;background:#12110e;box-shadow:inset 1px 2px 3px rgba(0,0,0,.7)'></div>");
    P.t(card, "CATALOG CARD", { x: 22, y: 14, font: "400 22px " + F.type, css: "letter-spacing:6px" });
    R.cardEls = [["TITLE", "The Lanterns of Marrowfen"], ["AUTHOR", "Quist, Ondrel V."], ["YEAR", "1971"], ["NOTE", "does not exist"]].map(function (r, i) {
      var row = P.div("position:absolute;left:22px;top:" + (70 + i * 48) + "px;width:" + (cw - 44) + "px;font:400 27px/1.4 " + F.type + ";white-space:nowrap", card);
      var lab = P.div("display:inline-block;width:140px;letter-spacing:2px;font-size:22px", row); lab.textContent = r[0];
      var val = P.div("display:inline-block", row); var ty = P.typer(val, r[1]); ty.set(0); return { ty: ty, row: row };
    });
    R.card = card; R.cardPos = { x: cx, y: cy, w: cw, h: ch };
    R.hand = P.pic(over, "hand", 1150, y + 190, 290, 190, { cell: 10 }); R.hand.style.transform = "scaleX(-1)";
    R.stamp = P.stamp(over, "NOT A REAL BOOK", { x: cx - 30, y: cy + 150, size: 50, rot: -9, bw: 6 });
    // four text columns below the pictures
    var yb = y + 520, cols = [];
    var tx = [
      "The reporters asked for a book about lighthouse keepers. The machine named a volume, gave it an author and a year, and described the plot in two tidy sentences. A librarian searched every shelf. There was no such book.\nThe reporters tried again with a different subject, then another. Each time a title appeared, complete with a year and a publisher’s confidence. Each time the shelves were empty.",
      "Why do the invented details sound right? Because the model has read thousands of real titles and knows what a title looks like: a place, a plain noun, a hint of mystery. It can build another in the same shape.\nIt sounds right, so it gets picked. The model is not searching a catalog. It is continuing a pattern, one word at a time, and a made-up title continues the pattern just as well as a real one.",
      "A librarian who spoke to us said the experience was strange. “The title was lovely,” she said. “I wanted it to exist.” That is exactly the trap. The invented answer is often more pleasing than the true one.\nThe names on the card in this report were invented by this newspaper for illustration. No such person is known to us, and no such book exists.",
      "<b style='font:700 13px " + F.type + ";letter-spacing:3px'>HOW TO TELL</b>\nAsk for the publisher and the place of printing. Ask for a page number. Look in a catalog you trust. If nothing turns up, the book is probably a story the machine told.\nA real book leaves traces: a spine on a shelf, an entry in a record, a reader who remembers it. Fluent prose leaves none of these."];
    var g = columns(sh, yb, CB, tx, 4);
    tx.forEach(function (t, i) { var b = P.body(ink, t, { x: g.x(i), y: yb + (i === 2 ? 118 : 0), w: g.w, font: "400 21px/1.3 " + F.body }); cols.push(b); });
    P.t(ink, "“It sounds right, so it gets picked.”", { x: g.x(2), y: yb, w: g.w, font: "italic 700 36px/1.1 " + F.head, align: "center" });
    P.rule(over, g.x(2), yb - 4, g.w, 2.5, C.red); P.rule(over, g.x(2), yb + 106, g.w, 1.2, C.red);
    cols.forEach(function (b, i) { P.fillCol2(ink, g.x(i), g.w, P.colBottom(b), ["ERRATA", "BOOKS", "NOTICE", "WANTED"][i], ["Corrections appear here when found.", "Reviews of volumes that do exist.", "This paper is set by hand.", "A reader with a good eye for sources."][i], i, CB); });
    P.rule(ink, 50, 1666, 1400, 2); window.__front = cols.map(function (c) { return P.colBottom(c); });
    R.cols = cols; return R;
  };
  P.fillCol2 = function (parent, x, w, bottom, title, sub, seed, tgt) {
    var h = (tgt || COLBOT) - bottom - 16; if (h < 50) return null;
    return P.box(parent, x, bottom + 16, w, h, { bw: 2, style: seed % 2 ? "solid" : "dashed", pad: 6, css: "display:flex;flex-direction:column;justify-content:center;align-items:center;gap:4px", html: "<div style='font:900 " + Math.min(34, 14 + h / 7) + "px/1 " + F.head + ";letter-spacing:1px'>" + title + "</div><div style='font:italic 400 13px/1.25 " + F.body + "'>" + sub + "</div>" });
  };

  /* ---------- HALLUCINATION PAGE (scene C) ---------- */
  P.buildHalluc = function (root) {
    var CB = 1500, sh = P.shell(root, { seed: 7, ph: 1560 }), ink = sh.ink, over = sh.over, R = { sh: sh };
    var mh = P.masthead(sh, true), y0 = mh.bottom + 20;
    R.kicker = P.t(over, "SPECIAL REPORT", { x: 50, y: y0, font: "400 34px/1 " + F.slab, color: C.red, css: "letter-spacing:8px" });
    P.rule(over, 460, y0 + 17, 990, 4, C.red);
    var fs = P.fit(["HALLUCINATION"], "'Playfair Display'", 900, 1400, 240);
    R.head = P.t(ink, "HALLUCINATION", { x: 50, y: y0 + 50, font: "900 " + fs + "px/1 " + F.head, css: "white-space:nowrap;letter-spacing:-2px;transform-origin:50% 50%" });
    var y = y0 + 50 + fs + 20; P.rule(ink, 50, y, 1400, 2.5); P.rule(ink, 50, y + 5, 1400, 1); y += 30;
    // halftone speech bubble whose dots drift apart
    var bw = 520, bh = 430, bx = 60, by = y;
    var dots = P.dots(bw, bh, function (g, w, h) { P.art.bubble(g, w, h); }, { cell: 10 });
    var svg = P.svg("svg", { width: bw, height: bh, viewBox: "0 0 " + bw + " " + bh, style: "position:absolute;left:" + bx + "px;top:" + by + "px;overflow:visible" }, over);
    var rr = rngOf("drift"), els = dots.map(function (d) { var c = P.svg("circle", { cx: d.x, cy: d.y, r: d.r, fill: C.ink }, svg); return { el: c, d: d, ax: (rr() - .5) * 2, ay: (rr() - .5) * 2, sp: .5 + rr() }; });
    R.dotsSvg = svg; R.dotEls = els; R.bubbleBox = { x: bx, y: by, w: bw, h: bh };
    P.t(ink, "Words that sound right, coming apart.", { x: bx, y: by + bh + 8, w: bw, font: "italic 400 14px " + F.body });
    // boxed definition
    var dx = 640, dw = 810;
    R.def = P.box(ink, dx, by, dw, 430, { bw: 3, style: "double", pad: 22, css: "text-align:left" });
    R.def.innerHTML = "<div style='font:400 16px " + F.type + ";letter-spacing:4px'>FROM THE MACHINE-AGE DICTIONARY</div><div style='font:900 56px/1.05 " + F.head + ";margin:8px 0 10px'>hallucination</div><div id='defTxt' style='font:italic 400 36px/1.32 " + F.body + "'></div>";
    R.defTxt = R.def.querySelector("#defTxt");
    R.defTy = P.typer(R.defTxt, "n. Text a model produces that is fluent and confident but not grounded in any fact.");
    // text columns
    var yb = by + bh + 70, g = columns(sh, yb, CB, [], 3), cols = [];
    var tx = ["Researchers have a word for this. When a model produces text that is fluent and confident but not grounded in any fact, they call it a hallucination. The word is a metaphor, and an imperfect one: the machine sees nothing. It simply continues the pattern.\nThe false book in our last report is a typical case. The title, the author and the year were all produced the same way as true ones, and nothing marked them as different.\nLawyers have cited cases that never existed. Students have footnoted articles nobody wrote. The pattern is always the same: a confident voice, a plausible shape, and nothing behind it.",
      "Why does it happen? A language model is built to produce likely text, and likely text is not checked against the world. When the model has no good answer, it does not stop. It writes the most plausible thing it can, in the same calm voice, and the voice gives no warning.\nBigger models hallucinate less often, but they still do. A rare error in a fluent voice is hard to catch.\nResearchers measure the problem by asking many questions with known answers and counting the misses. The count falls with each new model, but it has not reached zero.",
      "Does the model know it is wrong? Not in the way a person would. There is no moment of doubt inside the machine and no private ledger of true and false. There is only the next word, and the one after.\nThat is why the remedy cannot be left to the model alone. Someone has to check, and the checking has to begin outside the text.\nA sensible reader keeps one rule close: the more fluent the answer, the more reason to ask where it came from."];
    tx.forEach(function (t, i) { var b = P.body(ink, t, { x: g.x(i), y: yb, w: g.w, font: "400 22px/1.3 " + F.body }); cols.push(b); });
    // wrap each column's pieces for the strip entrance
    R.cols = cols; R.g = g; R.yb = yb;
    var grp = []; for (var i = 0; i < 3; i++) { var gd = P.div("position:absolute;left:0;top:0;width:1500px;height:2100px", ink); gd.appendChild(cols[i]); grp.push(gd); }
    R.grp = grp;
    cols.forEach(function (b, i) { P.fillCol2(grp[i], g.x(i), g.w, P.colBottom(b), ["NOTICE", "WANTED", "ERRATA"][i], ["Mind the confident voice.", "Sources. Apply within.", "None found. Yet."][i], i + 1, CB); });
    P.rule(ink, 50, 1516, 1400, 2); window.__front = cols.map(function (c) { return P.colBottom(c); });
    return R;
  };

  /* ---------- LOOK IT UP PAGE (scene D) ---------- */
  P.buildLookup = function (root) {
    var CB = 1500, sh = P.shell(root, { seed: 9, ph: 1560 }), ink = sh.ink, over = sh.over, R = { sh: sh };
    var mh = P.masthead(sh, true), y0 = mh.bottom + 20;
    R.kicker = P.t(over, "THE FIX", { x: 50, y: y0, font: "400 34px/1 " + F.slab, color: C.red, css: "letter-spacing:8px" });
    P.rule(over, 280, y0 + 17, 1170, 4, C.red);
    var fs = P.fit(["LOOK IT UP"], "'Playfair Display'", 900, 1400, 250);
    R.head = P.t(ink, "LOOK IT UP", { x: 50, y: y0 + 50, font: "900 " + fs + "px/1 " + F.head, css: "white-space:nowrap;letter-spacing:-2px" });
    var y = y0 + 50 + fs + 20; P.rule(ink, 50, y, 1400, 2.5); P.rule(ink, 50, y + 5, 1400, 1); y += 26;
    // halftone robot head, a reference shelf, a magnifying glass
    R.robot = P.pic(over, "robot", 70, y, 330, 330, { cell: 11 }); shadeFrame(over, 70, y, 330, 330);
    R.shelf = P.pic(over, "shelf", 470, y + 70, 560, 240, { cell: 9 }); shadeFrame(over, 470, y + 70, 560, 240);
    R.mag = P.pic(over, "magnifier", 700, y - 30, 260, 260, { cell: 9 });
    R.magPos = { x: 700, y: y - 30 };
    P.t(ink, "A reference shelf. Every claim should lead back to one.", { x: 470, y: y + 322, w: 560, font: "italic 400 14px " + F.body });
    // text with footnote numerals
    var tx = "One remedy is to let the model look things up before it answers.<sup class='fn' data-n='1'>1</sup> The system searches a library of documents, reads the best matches, and writes its reply from them.<sup class='fn' data-n='2'>2</sup> It then shows its sources, so a reader can follow each claim back to the page it came from.<sup class='fn' data-n='3'>3</sup>";
    R.txt = P.body(ink, tx, { x: 1090, y: y, w: 360, font: "400 21px/1.32 " + F.body });
    R.fns = [].slice.call(R.txt.querySelectorAll(".fn")); R.fns.forEach(function (f) { f.style.cssText = "font:700 17px " + F.type + ";vertical-align:super;line-height:0;padding:0 2px"; });
    var yb = y + 360, srcY = yb + 30;
    R.src = ["A published report, with a date and a page number you can find.", "A record kept by an archive, open to anyone who asks.", "A reference work that names its own sources in turn."].map(function (s, i) {
      return P.box(ink, 50 + i * 480, srcY, 440, 150, { bw: 2.5, pad: 12, css: "text-align:left", html: "<div style='font:400 15px " + F.type + ";letter-spacing:3px'>SOURCE " + (i + 1) + "</div><div style='font:italic 400 24px/1.28 " + F.body + ";margin-top:8px'>" + s + "</div>" });
    });
    var yc = srcY + 190, g = columns(sh, yc, CB, [], 3), cols = [];
    var t2 = ["Retrieval, as engineers call it, does not make a model honest. It gives the model something to stand on. If the right page is found, the answer can be right. If the wrong page is found, the answer can be wrong in a new and better-referenced way.\nThis is why the sources matter. They are not decoration. They are the handle by which a reader can pull on a claim and see whether anything is attached.",
      "Look at what happens when the model is asked about our invented book. A system that can search will find no record of it. It can say so. A system that cannot search will often supply the record itself.\nThe difference is not intelligence. It is whether the machine is allowed to say that it could not find anything.",
      "Readers are urged to prefer answers that carry their sources, and to open them. A footnote that leads nowhere is a warning. A footnote that leads to a real page is the beginning of evidence, not the end of it.\nThe reference shelf in this newsroom has not changed in a hundred years. It is still the quickest way to catch a confident mistake."];
    t2.forEach(function (t, i) { var b = P.body(ink, t, { x: g.x(i), y: yc, w: g.w, font: "400 19.5px/1.3 " + F.body }); cols.push(b); P.fillCol2(ink, g.x(i), g.w, P.colBottom(b), ["NOTICE", "WANTED", "ERRATA"][i], ["Mind the confident voice.", "Sources. Apply within.", "None found. Yet."][i], i + 1, CB); });
    P.rule(ink, 50, 1516, 1400, 2); window.__front = cols.map(function (c) { return P.colBottom(c); });
    R.cols = cols; R.srcY = srcY; return R;
  };
})();
