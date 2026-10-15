// Bespoke scenes for "Context Language Models" (arXiv 2609.37725), paper style.
// Metaphor: the robot's context is a stack of pages on its desk. A gloved "harness" hand cuts it with scissors at a
// fixed line; in this paper the robot gets the pencil and eraser instead. Drawings add no numbers or claims; every
// word drawn comes from `d`. Every scene is a pure function of (t, d, dur): no module state, no randomness.
import { C, ctx, cl, lerp, eo3, ei3, eio, eob, seg, txt, tw, line, rectS, rrect, circle, marker, stroke, hatch, burst, bg, poly, star4 } from '../../engine/core.mjs';
import { popIn, slam, stamp, jolt, wiggle, typeOn, gate, pulse } from '../../engine/motion.mjs';

const YEL = '#F2C94C', PINK = '#F29BB0', MINT = '#9FD8B0', GLOVE = '#FFFFFF', BIN = '#BDB4A0', WOOD = '#D8C29A', SHADE = '#E4DCCB';

// ---------- shared layout (snip, eraser, habits and loop use the same desk so the loop cut is seamless) ----------
const DESK = { y: 1160, x0: 90, x1: 900 };
const RB = { x: 250, y: 1205, s: 25 };              // robot feet (lower legs hidden behind the desk)
const STK = { cx: 690, w: 300, h: 22 };
const N0 = 21, NFULL = 24, CUTN = 13, STAR = 22;       // sheets at frame 0, after the drops, below the cut; starred sheet
const CUTY = DESK.y - CUTN * STK.h;                     // 874
const BINP = { cx: 560, top: 1262, bot: 1432, w: 190 };

// ---------- small helpers ----------
const wrap = (s, font, size, maxW) => { const out = []; let cur = ''; for (const w of String(s).split(' ')) { const tt = cur ? `${cur} ${w}` : w; if (tw(tt, font, size) > maxW && cur) { out.push(cur); cur = w; } else cur = tt; } if (cur) out.push(cur); return out; };
const eb = (p) => (p <= 0 ? 0 : eob(p));
const fit = (s, font, size, maxW) => Math.min(size, size * maxW / tw(s, font, size));
// camera: list of [t0, z, cx, cy]; each key is reached in 0.16 s (a snap, so the change lands inside one gate sample)
function cam(t, keys) {
  let z = 1, cx = 540, cy = 800;
  for (const [t0, z1, x1, y1] of keys) { const p = eo3(seg(t, t0, t0 + 0.16)); if (p <= 0) break; z = lerp(z, z1, p); cx = lerp(cx, x1, p); cy = lerp(cy, y1, p); }
  ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy);
}
const at = (t0, t1, t) => seg(t, t0, t1);
// quadratic arrow drawn up to progress p
function qArrow(x1, y1, qx, qy, x2, y2, p, { col = C.ink, lw = 10 } = {}) {
  if (p <= 0) return; const pts = [], n = 24, m = Math.max(1, Math.round(n * cl(p)));
  for (let i = 0; i <= m; i++) { const u = i / n, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u; pts.push([a * x1 + b * qx + c * x2, a * y1 + b * qy + c * y2]); }
  stroke(pts, { lw, col, seed: 610, amp: 2 });
  if (p > 0.97) { const [ex, ey] = pts[pts.length - 1], [px, py] = pts[pts.length - 3], ang = Math.atan2(ey - py, ex - px);
    for (const s of [-0.5, 0.5]) line(ex, ey, ex - Math.cos(ang + s) * 46, ey - Math.sin(ang + s) * 46, { col, lw, wob: 1, seed: 620 }); }
}
function dashed(x1, x2, y, { col = C.red, lw = 8, dash = 30, gap = 18, p = 1, alpha = 1 } = {}) {
  ctx.save(); ctx.globalAlpha = alpha;
  const end = lerp(x1, x2, cl(p)); for (let x = x1, k = 0; x < end; x += dash + gap, k++) line(x, y, Math.min(x + dash, end), y, { col, lw, wob: 0.8, seed: 630 + k, alpha });
  ctx.restore();
}
function plate(cx, cy, text, { font = 'Mono', size = 36, sc = 1, rot = -0.02, alpha = 1, fill = C.ink, tcol = C.paper, pad = 28 } = {}) {
  const w = tw(text, font, size) + pad * 2, h = size * 1.7;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc);
  rectS(-w / 2 + 9, -h / 2 + 9, w, h, { fill: C.ink, col: null, lw: 0, seed: 640, alpha });
  if (alpha >= 0.99) rectS(-w / 2, -h / 2, w, h, { fill, col: C.ink, lw: 5, seed: 641 });
  else rectS(-w / 2, -h / 2, w, h, { fill, col: null, lw: 0, seed: 641, alpha });
  txt(text, 0, size * 0.36, { font, size, col: tcol, alpha }); ctx.restore();
}
function star5(cx, cy, r, { fill = YEL, col = C.ink, rot = 0, lw = 5 } = {}) {
  const pts = []; for (let i = 0; i < 10; i++) { const a = rot - Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  poly(pts, { fill, col, lw, seed: 650, amp: 1 });
}
// "text" on a page: rounded ink bars (no words, so no claims)
function bars(x, y, w, n, gap, { alpha = 1, seed = 0, lens = null, h = 22 } = {}) {
  for (let i = 0; i < n; i++) { const L = lens ? lens[i] : 0.55 + 0.4 * (((i + seed) * 37) % 10) / 10; rrect(x, y + i * gap, w * L, h, h / 2, { fill: C.ink, col: null, lw: 0, seed: 660 + i + seed, alpha }); }
}

// ---------- robot (same parts and proportions as core.robot, plus posable arms, eyes and head) ----------
// (x,y) = feet. arms: angle from straight down (rad), positive = outward; len in units of s. hold(hx, hy, ang) draws a held item.
function bot(x, y, s, o = {}) {
  const { rot = 0, sx = 1, sy = 1, eye = 'open', look = 0, lookY = 0, armL = 0.3, armR = 0.3, lenL = 3.8, lenR = 3.8, holdL = null, holdR = null, tilt = 0, t = 0, mouth = null, alpha = 1, shadow = true } = o;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y);
  if (shadow) { ctx.fillStyle = 'rgba(26,26,26,.14)'; ctx.beginPath(); ctx.ellipse(0, 4, 6 * s, 1 * s, 0, 0, 7); ctx.fill(); }
  ctx.rotate(rot); ctx.scale(sx, sy);
  rectS(-3.4 * s, -3 * s, 1.8 * s, 3 * s, { fill: C.ink, col: null, lw: 0, seed: 101 }); rectS(1.6 * s, -3 * s, 1.8 * s, 3 * s, { fill: C.ink, col: null, lw: 0, seed: 102 });
  rectS(-4.5 * s, -10 * s, 9 * s, 7.4 * s, { fill: C.paper, col: C.ink, lw: 6, seed: 103 });
  ctx.save(); ctx.translate(0, -10 * s); ctx.rotate(tilt); ctx.translate(0, 10 * s);
  rectS(-3.4 * s, -15.6 * s, 6.8 * s, 5.4 * s, { fill: C.paper, col: C.ink, lw: 6, seed: 104 });
  line(0, -15.6 * s, 0, -17.6 * s, { col: C.ink, lw: 5, wob: 0 }); circle(0, -18 * s, 0.55 * s, { fill: C.red, col: C.ink, lw: 3 });
  const ex = look * 0.55 * s, ey = lookY * 0.35 * s, blink = eye === 'open' && ((Math.floor(t * 1000) + 700) % 1900) < 120;
  for (const c of [-1.3, 1.3]) {
    const cx = c * s + ex;
    if (eye === 'happy') stroke([[cx - 0.6 * s, -12.6 * s], [cx, -13.5 * s], [cx + 0.6 * s, -12.6 * s]], { lw: 6, col: C.ink, seed: 105 });
    else if (eye === 'sad') line(cx - 0.6 * s, -13.6 * s + (c < 0 ? 0 : 1) * s, cx + 0.6 * s, -13.6 * s + (c < 0 ? 1 : 0) * s, { col: C.ink, lw: 6, wob: 0 });
    else if (blink || eye === 'closed') line(cx - 0.55 * s, -13.3 * s, cx + 0.55 * s, -13.3 * s, { col: C.ink, lw: 6, wob: 0 });
    else if (eye === 'wow') rectS(cx - 0.7 * s, -14.5 * s + ey, 1.4 * s, 1.9 * s, { fill: C.ink, col: null, lw: 0, seed: 106 });
    else rectS(cx - 0.5 * s, -14 * s + ey, 1 * s, 1.3 * s, { fill: C.ink, col: null, lw: 0, seed: 106 });
  }
  if (mouth === 'o') circle(ex * 0.6, -11.4 * s, 0.5 * s, { fill: C.ink, col: null, lw: 0, seed: 107 });
  if (mouth === 'smile') stroke([[-1 * s + ex, -11.6 * s], [ex, -11.0 * s], [1 * s + ex, -11.6 * s]], { lw: 5, col: C.ink, seed: 108 });
  ctx.restore();
  const lw = Math.max(6, 0.42 * s);
  for (const side of [-1, 1]) {
    const a = side < 0 ? armL : armR, L = (side < 0 ? lenL : lenR) * s, shx = side * 4.5 * s, shy = -8.6 * s;
    const hx = shx + side * Math.sin(a) * L, hy = shy + Math.cos(a) * L;
    line(shx, shy, hx, hy, { col: C.ink, lw, wob: 0.6, seed: 109 + side });
    circle(hx, hy, 0.6 * s, { fill: C.ink, col: null, lw: 0, seed: 111 });
    const h = side < 0 ? holdL : holdR; if (h) { ctx.save(); h(hx, hy, a, side); ctx.restore(); }
  }
  ctx.restore();
}

// ---------- props ----------
function eraserProp(x, y, sc = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  rectS(-70 + 8, -38 + 8, 140, 76, { fill: C.ink, col: null, lw: 0, seed: 700 });
  rectS(-70, -38, 140, 76, { fill: PINK, col: C.ink, lw: 6, seed: 701 });
  rectS(10, -38, 60, 76, { fill: '#5B7FD9', col: C.ink, lw: 6, seed: 702 });
  ctx.restore();
}
function pencilProp(x, y, sc = 1, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  rectS(-90, -16, 150, 32, { fill: YEL, col: C.ink, lw: 5, seed: 710 });
  rectS(-112, -16, 26, 32, { fill: PINK, col: C.ink, lw: 5, seed: 711 });
  poly([[60, -16], [104, 0], [60, 16]], { fill: WOOD, col: C.ink, lw: 5, seed: 712 });
  poly([[90, -5], [104, 0], [90, 5]], { fill: C.ink, col: null, lw: 0, seed: 713 });
  ctx.restore();
}
// scissors: pivot (x,y), blades point along angle `dir`, open = half-angle in radians
function scissors(x, y, len, open, dir = Math.PI) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(dir);
  for (const sgn of [-1, 1]) {
    ctx.save(); ctx.rotate(sgn * open);
    poly([[0, -9], [len, -2], [len, 2], [0, 9]], { fill: '#8C8C8C', col: C.ink, lw: 5, seed: 720 + sgn });
    ctx.restore();
    ctx.save(); ctx.rotate(Math.PI + sgn * open * 0.8);
    line(0, 0, len * 0.33, sgn * 6, { col: C.ink, lw: 9, wob: 0, seed: 722 });
    circle(len * 0.48, sgn * 10, len * 0.16, { fill: C.red, col: C.ink, lw: 6, seed: 723 + sgn });
    circle(len * 0.48, sgn * 10, len * 0.07, { fill: C.paper, col: C.ink, lw: 4, seed: 725 });
    ctx.restore();
  }
  circle(0, 0, 9, { fill: C.ink, col: null, lw: 0, seed: 726 });
  ctx.restore();
}
// big cartoon glove gripping at (x,y), arm coming in from the right; cuff label from d
function glove(x, y, label, { sc = 1, rot = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  rectS(150, -58, 560, 116, { fill: C.ink, col: C.ink, lw: 5, seed: 730 });                 // sleeve
  rectS(96, -78, 120, 156, { fill: C.ink, col: C.ink, lw: 5, seed: 731 });                 // cuff
  rrect(-46, -70, 160, 140, 46, { fill: GLOVE, col: C.ink, lw: 7, seed: 732 });            // palm
  for (let k = 0; k < 3; k++) rrect(-74, -52 + k * 38, 70, 40, 18, { fill: GLOVE, col: C.ink, lw: 6, seed: 733 + k }); // knuckles
  rrect(-30, -104, 96, 52, 24, { fill: GLOVE, col: C.ink, lw: 6, seed: 737, rot: -0.3 });   // thumb
  for (let k = 0; k < 3; k++) line(30, -30 + k * 30, 80, -30 + k * 30, { col: C.ink, lw: 4, wob: 1, seed: 738 + k });
  const fs = fit(label, 'Brush', 52, 380); txt(label, 400, 16, { font: 'Brush', size: fs, col: C.paper });
  ctx.restore();
}
function bin(t, hitT = Infinity, front = true) {
  const { cx, top, bot: b, w } = BINP, [jx, jy] = jolt(t, [hitT], 10, 0.3), sq = 1 - 0.08 * Math.sin(Math.PI * seg(t, hitT, hitT + 0.22));
  ctx.save(); ctx.translate(cx + jx, b + jy); ctx.scale(2 - sq, sq); ctx.translate(-cx, -b);
  if (front) {
    poly([[cx - w / 2, top], [cx + w / 2, top], [cx + w / 2 - 26, b], [cx - w / 2 + 26, b]], { fill: BIN, col: C.ink, lw: 6, seed: 740 });
    for (let k = 1; k < 5; k++) { const u = k / 5; line(lerp(cx - w / 2, cx + w / 2, u), top + 24, lerp(cx - w / 2 + 26, cx + w / 2 - 26, u), b - 12, { col: C.ink, lw: 4, wob: 1, seed: 741 + k }); }
    rectS(cx - w / 2 - 12, top - 10, w + 24, 26, { fill: C.ink, col: C.ink, lw: 4, seed: 747 });
  }
  ctx.restore();
}
function desk() {
  rectS(DESK.x0 + 40, DESK.y + 30, 34, 1430 - DESK.y - 30, { fill: WOOD, col: C.ink, lw: 6, seed: 750 });
  rectS(DESK.x1 - 74, DESK.y + 30, 34, 1430 - DESK.y - 30, { fill: WOOD, col: C.ink, lw: 6, seed: 751 });
  rectS(DESK.x0, DESK.y, DESK.x1 - DESK.x0, 42, { fill: WOOD, col: C.ink, lw: 6, seed: 752 });
  hatch(DESK.x0 + 6, DESK.y + 6, DESK.x1 - DESK.x0 - 12, 30, { gap: 26, alpha: 0.25, seed: 753 });
}
// one sheet in the side-view stack, index i from the bottom
const sheetX = (i) => STK.cx + (((i * 37) % 11) - 5) * 2.6;
const sheetY = (i) => DESK.y - (i + 1) * STK.h;
function sheet(cx, y, i, { rot = 0, sc = 1, alpha = 1 } = {}) {
  const w = STK.w, h = STK.h, star = i === STAR;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(cx, y + h / 2); ctx.rotate(rot); ctx.scale(sc, sc);
  rectS(-w / 2, -h / 2, w, h, { fill: star ? YEL : i % 3 === 0 ? SHADE : C.paper, col: C.ink, lw: 4, seed: 760 + (i % 7) });
  if (star) star5(-w / 2 + 50, -2, 30, { rot: 0.1 });
  ctx.restore();
}
function stack(n, { skip = () => false, squash = 1 } = {}) {
  ctx.save(); ctx.translate(STK.cx, DESK.y); ctx.scale(1 + (1 - squash) * 0.5, squash); ctx.translate(-STK.cx, -DESK.y);
  for (let i = 0; i < n; i++) if (!skip(i)) sheet(sheetX(i), sheetY(i), i);
  ctx.restore();
}
function qmark(x, y, q, p, t) {
  if (p <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(p, p); ctx.rotate(wiggle(t, 0.12, 1.2, 4));
  poly([[-26, 54], [0, 98], [14, 52]], { fill: C.ink, col: null, lw: 0, seed: 770 });
  circle(0, 0, 74, { fill: C.ink, col: C.ink, lw: 5, seed: 771 });
  txt(q, 0, 38, { font: 'Marker', size: 112, col: C.paper }); ctx.restore();
}
// idle breathing for the robot
const breathe = (t) => 1 + 0.012 * Math.sin(t * 4.2);

// =====================================================================================================
// n1 snip: the harness cuts the stack at a fixed line; the starred page goes into the bin.
// =====================================================================================================
export function snip(t, d, dur) {
  const k = dur / 4.355, T = (x) => x * k;
  const DROPS = [T(0.02), T(0.5), T(0.95)], tRule = T(0.35), tGlove = T(1.1), tS0 = T(1.45), tS1 = T(2.55), tCut = T(2.6), tBin = T(3.15), tQ = T(3.22);
  bg('paper');
  ctx.save();
  cam(t, [[tCut, 1.06, 700, 820], [tQ, 1.12, 420, 1060]]);
  const [jx, jy] = jolt(t, [tRule + 0.12, ...DROPS.map((x) => x + 0.22), tBin], 9, 0.28);
  ctx.translate(jx, jy);
  // robot: flinches at the rule, looks at the glove, then turns to the bin in shock
  const react = eb(seg(t, tQ - 0.06, tQ + 0.24)), wind = Math.sin(Math.PI * seg(t, tQ - 0.32, tQ - 0.06));
  const flinch = Math.sin(Math.PI * seg(t, tRule + 0.1, tRule + 0.4));
  const lookG = eo3(seg(t, tGlove, tGlove + 0.25)), lookB = eo3(seg(t, tCut, tCut + 0.2));
  bot(RB.x + react * 26, RB.y, RB.s, {
    t, rot: -0.06 * wind + 0.12 * react, sy: breathe(t) * (1 - 0.08 * flinch - 0.06 * wind) + 0.05 * react * (1 - seg(t, tQ + 0.3, tQ + 0.6)), sx: 1 + 0.05 * flinch,
    eye: t > tQ - 0.05 ? 'wow' : flinch > 0.3 ? 'closed' : 'open', mouth: t > tQ - 0.05 ? 'o' : null,
    look: lerp(lerp(0, 1, lookG), 0.8, lookB), lookY: lerp(0, 1, react), tilt: 0.16 * react + 0.05 * wiggle(t, 1, 2),
    armL: lerp(0.3, 2.5, react) - 0.2 * wind, armR: lerp(0.3, 2.3, react) - 0.2 * wind,
  });
  qmark(RB.x + 70, 590, d.q, popIn(t, tQ, 0.3), t);
  // stack: drops land, then the cut part flies off
  const n = t < DROPS[0] ? N0 : N0 + DROPS.filter((x) => t >= x + 0.22).length;
  const sq = 1 - 0.035 * Math.max(...DROPS.map((x) => Math.sin(Math.PI * seg(t, x + 0.22, x + 0.4))));
  stack(Math.min(n, NFULL), { skip: (i) => t >= tCut && i >= CUTN, squash: sq });
  DROPS.forEach((x, q) => { const p = seg(t, x, x + 0.22); if (p > 0 && p < 1) { const i = N0 + q; sheet(sheetX(i) + (1 - p) * 60, sheetY(i) - 360 * (1 - p * p), i, { rot: (1 - p) * 0.25 }); } });
  // rule line and its label
  const rs = slam(t, tRule, { d: 0.14, from: 1.8, amp: 0 }), cutP = seg(t, tS0, tS1);
  if (rs.alpha > 0) {
    dashed(470, 905, CUTY, { p: 1, alpha: t >= tCut ? 0.35 : 1 });
    if (cutP > 0 && t < tCut) line(lerp(905, 545, cutP), CUTY, 905, CUTY, { col: C.ink, lw: 7, wob: 0.5, seed: 780 });
    line(900, CUTY - 4, 900, 560, { col: C.ink, lw: 4, wob: 1, alpha: 0.7, seed: 781 });
    plate(680, 520, d.rule, { size: 38, sc: rs.sc, alpha: rs.alpha });
  }
  // flying sheets after the cut (all but the starred one fly up and right; the starred one arcs into the bin)
  if (t >= tCut) for (let i = CUTN; i < NFULL; i++) {
    const tau = t - tCut - (NFULL - 1 - i) * 0.02; if (tau < 0) { sheet(sheetX(i), sheetY(i), i); continue; }
    if (i === STAR) {
      const p = seg(t, tCut + 0.03, tBin); if (p >= 1) continue;
      const x = lerp(sheetX(i), BINP.cx, eio(p)), y = lerp(sheetY(i), BINP.top - 10, p) - 300 * Math.sin(Math.PI * p);
      sheet(x, y, i, { rot: p * 5.6, sc: lerp(1, 0.62, p) * (1 + 0.25 * Math.sin(Math.PI * p)) }); continue;
    }
    const m = i - CUTN, vx = 520 + 120 * (m % 4), vy = -720 - 90 * (m % 5), x = sheetX(i) + vx * tau, y = sheetY(i) + vy * tau + 1500 * tau * tau;
    if (y < 2200) sheet(x, y, i, { rot: (m % 2 ? 1 : -1) * (2.5 + (m % 3)) * tau });
  }
  // starred page resting in the bin (behind the bin front)
  if (t >= tBin) sheet(BINP.cx + 8, BINP.top - 30, STAR, { rot: -0.5 + 0.08 * Math.sin((t - tBin) * 9) * Math.exp(-(t - tBin) * 4), sc: 0.62 });
  desk();
  bin(t, tBin);
  if (t > tBin) burst(BINP.cx, BINP.top, tBin, t, 9, C.red, 220, 20);
  // glove with scissors: swoops in, snips along the line in three bites, lifts away
  if (t >= tGlove) {
    const pin = eb(seg(t, tGlove, tGlove + 0.32)), bite = (u) => { const q = u * 3, f = q - Math.floor(q); return Math.floor(q) + eio(f); };
    let gx = lerp(1300, 905, pin), gy = CUTY, open = 0.32;
    if (t >= tS0) { gx = lerp(905, 545, bite(cutP) / 3); const f = (cutP * 3) % 1; open = cutP >= 1 ? 0.04 : 0.36 * Math.abs(Math.cos(Math.PI * f)) + 0.03; }
    if (t >= tS1) { const lp = eo3(seg(t, tS1 + 0.05, tS1 + 0.35)); gx = lerp(545, 690, lp); gy = lerp(CUTY, CUTY - 210, lp); }
    const [sx, sy] = jolt(t, [tS0 + 0.33 * (tS1 - tS0), tS0 + 0.66 * (tS1 - tS0), tS1], 6, 0.18);
    scissors(gx + sx, gy + sy, 190, open);
    glove(gx + 120 + sx, gy + sy, d.hand, { sc: 0.9, rot: t >= tS1 ? -0.12 * eo3(seg(t, tS1, tS1 + 0.3)) : 0 });
    if (t < tGlove + 0.35) for (let q = 0; q < 4; q++) line(gx + 300 + q * 40, gy - 90 + q * 60, gx + 520 + q * 40, gy - 90 + q * 60, { col: C.ink, lw: 6, alpha: 1 - seg(t, tGlove + 0.15, tGlove + 0.35), seed: 790 + q });
  }
  ctx.restore();
}

// =====================================================================================================
// n2 eraser: the glove pulls out with the scissors; the robot takes the pencil and eraser, erases a stale page,
// puts the starred page back on top and circles it.
// =====================================================================================================
export function eraser(t, d, dur) {
  // first O seconds: the harness glove stays and is explained in plain words; then the old eraser beats run
  const O = Math.max(0, dur - 3.566), T = (x) => x + O;
  const tExp = 0.3, SNIPS = [0.95, 1.55], tOut = T(0.12), tSquat = T(0.7), tTool = T(1.0), tPage = T(1.3), tScrub = T(1.55), tScrubEnd = T(2.15), tToss = T(2.2), tCirc = T(2.45);
  bg('paper');
  ctx.save();
  cam(t, [[tScrub, 1.1, 560, 760], [tCirc, 1.0, 540, 800]]);
  const [jx, jy] = jolt(t, [tTool, tToss + 0.35], 10, 0.28); ctx.translate(jx, jy);
  // robot: squat (anticipation), spring up with tools, telescoping arm to erase
  const squat = Math.sin(Math.PI * 0.5 * seg(t, tSquat - 0.3, tTool)) * (1 - seg(t, tTool, tTool + 0.08));
  const spring = Math.sin(Math.PI * seg(t, tTool, tTool + 0.4));
  const tool = popIn(t, tTool, 0.3), reach = eo3(seg(t, tScrub - 0.2, tScrub)) * (1 - eo3(seg(t, tScrubEnd, tScrubEnd + 0.25)));
  const scrubX = Math.sin((t - tScrub) * 2 * Math.PI * 3.2);
  // erasing target sweeps across the page rows; the arm telescopes to reach it
  const er0 = seg(t, tScrub, tScrubEnd), px = 600 + 110 * scrubX, py = 470 + 330 * er0, shx = RB.x + 4.5 * RB.s, shy = RB.y - 8.6 * RB.s;
  const aim = Math.atan2(px - shx, py - shy), far = Math.hypot(px - shx, py - shy) / RB.s;
  const armR = lerp(lerp(0.3, 2.6, tool), aim, reach), lenR = lerp(3.8, far, reach);
  const circ = popIn(t, tCirc, 0.3);
  const drawBot = () => bot(RB.x, RB.y - 70 * spring, RB.s, {
    t, sy: breathe(t) * (1 - 0.12 * squat + 0.1 * spring), sx: 1 + 0.08 * squat - 0.05 * spring,
    eye: t > tOut - 0.1 && t < tOut + 0.3 ? 'wow' : t > tTool - 0.05 && t < tPage ? 'happy' : t > tCirc ? 'happy' : 'open', mouth: t > tCirc ? 'smile' : null,
    look: t < tTool ? 1 : 0.8, lookY: t < O ? -0.6 * eo3(seg(t, tExp, tExp + 0.3)) : reach * 0.6, armL: lerp(0.3, 2.2, tool) - 0.4 * squat, armR: armR - 0.4 * squat, lenR, tilt: 0.06 * Math.sin(t * 3),
    holdR: tool > 0 ? (hx, hy, a) => eraserProp(hx, hy - 10, tool * 0.9, -a + Math.PI / 2) : null,
    holdL: tool > 0 ? (hx, hy) => pencilProp(hx, hy - 20, tool * 0.85, -1.2) : null,
  });
  // stack: cut stack; the starred page returns from the bin to the top
  stack(CUTN, {});
  const back = seg(t, tToss, tToss + 0.38);
  if (back > 0) {
    const i = STAR, x = lerp(BINP.cx, STK.cx, eio(back)), y = lerp(BINP.top - 30, sheetY(CUTN), back) - 280 * Math.sin(Math.PI * back);
    sheet(x, y, i, { rot: (1 - back) * -5, sc: lerp(0.62, 1, back) });
    if (circ > 0) { ctx.save(); ctx.translate(STK.cx, sheetY(CUTN) + 10); ctx.scale(circ, circ); ctx.lineWidth = 1;
      const pts = []; for (let q = 0; q <= 44; q++) { const a = -0.3 + q / 40 * Math.PI * 2; pts.push([Math.cos(a) * 200, Math.sin(a) * 70]); }
      stroke(pts, { lw: 12, col: C.green, seed: 800, amp: 3 }); ctx.restore(); }
  } else sheet(BINP.cx + 8, BINP.top - 30, STAR, { rot: -0.5, sc: 0.62 });
  // stale page: pops forward face-on, gets erased, then is tossed
  const pg = eb(seg(t, tPage, tPage + 0.3)), toss = ei3(seg(t, tToss, tToss + 0.3));
  if (pg > 0 && toss < 1) {
    const cx = lerp(STK.cx, 640, cl(pg)) + toss * 300, cy = lerp(CUTY - 20, 640, cl(pg)) - toss * 500, sc = lerp(0.3, 1, pg) * (1 - toss * 0.7);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.04 + toss * 2); ctx.scale(sc, sc);
    rectS(-180 + 12, -230 + 12, 360, 460, { fill: C.ink, col: null, lw: 0, seed: 810 });
    rectS(-180, -230, 360, 460, { fill: SHADE, col: C.ink, lw: 6, seed: 811 });
    const er = seg(t, tScrub, tScrubEnd);
    for (let r = 0; r < 6; r++) { const gone = cl(er * 6 - r); rrect(-140, -180 + r * 66, 260 * (0.6 + 0.35 * ((r * 37) % 10) / 10), 26, 13, { fill: C.ink, col: null, lw: 0, seed: 812 + r, alpha: 1 - gone }); }
    ctx.restore();
    if (t > tScrub && t < tScrubEnd + 0.3) for (let q = 0; q < 10; q++) { const tt = ((t - tScrub) * 2.2 + q * 0.1) % 1; circle(560 + ((q * 53) % 180), 600 + tt * 380, 7, { fill: PINK, col: C.ink, lw: 2, seed: 820 + q, alpha: 1 - tt }); }
  }
  drawBot();
  if (t > tTool) burst(RB.x, 640, tTool, t, 10, C.green, 260, 22);
  desk(); bin(t, tToss + 0.3);
  // glove leaves with the scissors (wind-up left, then gone to the right)
  if (t < tOut + 0.5) {
    const wind = Math.sin(Math.PI * seg(t, tOut - 0.3, tOut)) * 40, go = ei3(seg(t, tOut, tOut + 0.32)), bob = SNIPS.reduce((a, s0) => a + Math.sin(Math.PI * seg(t, s0, s0 + 0.3)), 0);
    const gx = 690 - wind + go * 900, gy = CUTY - 210 - go * 120 - 30 * bob, open = 0.04 + 0.3 * bob;
    scissors(gx, gy, 190, open); glove(gx + 120, gy, d.hand, { sc: 0.9, rot: -0.12 });
    if (go > 0) for (let q = 0; q < 5; q++) line(gx - 360 + q * 30, gy - 80 + q * 40, gx - 120 + q * 30, gy - 80 + q * 40, { col: C.ink, lw: 7, alpha: 1 - go * 0.6, seed: 830 + q });
  }
  if (d.explain && t < tOut + 0.2) {
    const es = stamp(t, tExp, { d: 0.12, from: 1.8, amp: 0 }), ex = 1 - ei3(seg(t, tOut - 0.05, tOut + 0.15));
    if (es.alpha > 0 && ex > 0) {
      qArrow(760, 470, 860, 470, 860, 560, eo3(seg(t, tExp + 0.15, tExp + 0.4)) * ex, { lw: 9 });
      ctx.save(); ctx.translate(500, 420); ctx.scale(es.sc * ex, es.sc * ex);
      const ls = wrap(d.explain, 'Brush', 64, 640), h = 30 + ls.length * 66;
      rectS(-360 + 12, -h / 2 + 12, 720, h, { fill: C.ink, col: null, lw: 0, seed: 1001 });
      rectS(-360, -h / 2, 720, h, { fill: YEL, col: C.ink, lw: 6, seed: 1002 });
      ls.forEach((l, i) => txt(l, 0, -h / 2 + 15 + (i + 0.8) * 66, { font: 'Brush', size: 64, alpha: es.alpha }));
      ctx.restore();
    }
  }
  ctx.restore();
}

// =====================================================================================================
// n5 file: the stack folds into one page, a terminal types the command, lines are struck and rewritten,
// an arrow carries the page back into the robot's head for the next turn.
// =====================================================================================================
export function file(t, d, dur) {
  const k = dur / 5.977, T = (x) => x * k;
  const tFold = T(0.3), tTab = T(0.85), tTerm = T(1.45), tType = T(1.8), tEnter = T(2.5), tStrike = T(2.85), tStrike2 = T(3.5), tWrite = T(3.9), tArrow = T(4.55), tNod = T(4.85);
  const PX = 330, PY = 240, PW = 560, PH = 700;
  bg('paper');
  ctx.save();
  cam(t, [[tStrike, 1.1, 600, 400], [tArrow - 0.1, 1.0, 540, 800], [tNod, 1.06, 560, 420]]);
  const [jx, jy] = jolt(t, [tFold + 0.25, tTab + 0.12, tStrike + 0.1, tStrike2 + 0.1, tNod], 9, 0.26); ctx.translate(jx, jy);
  // terminal strip (slides up from below)
  const tp = eb(seg(t, tTerm, tTerm + 0.35));
  if (tp > 0) {
    const ty = lerp(1500, 1050, tp);
    rrect(90 + 10, ty + 10, 810, 230, 24, { fill: C.ink, col: null, lw: 0, seed: 840, alpha: 0.5 });
    rrect(90, ty, 810, 230, 24, { fill: '#22252B', col: C.ink, lw: 6, seed: 841 });
    [C.red, YEL, C.green].forEach((c, q) => circle(130 + q * 40, ty + 34, 12, { fill: c, col: null, lw: 0, seed: 842 + q }));
    const typed = typeOn(d.cmd, t, tType, 20), flash = 1 - seg(t, tEnter, tEnter + 0.35);
    if (t > tEnter && flash > 0) rectS(100, ty + 74, 790, 80, { fill: C.green, col: null, lw: 0, seed: 845, alpha: 0.7 * flash });
    txt(typed, 130, ty + 132, { font: 'Mono', size: 58, col: C.paper, align: 'left' });
    if (Math.floor(t * 2.5) % 2 === 0 || t < tEnter) rectS(130 + tw(typed, 'Mono', 58) + 10, ty + 86, 30, 56, { fill: C.green, col: null, lw: 0, seed: 846 });
  }
  // stack folding into one page
  const fold = eo3(seg(t, tFold, tFold + 0.3));
  if (fold < 1) for (let i = 0; i < 12; i++) {
    const y0 = 990 - (i + 1) * 30, x0 = 610 + (((i * 37) % 11) - 5) * 3;
    const y = lerp(y0, PY + PH / 2, fold), sc = lerp(1, 0.4, fold);
    ctx.save(); ctx.translate(x0, y); ctx.scale(sc, sc); rectS(-170, -15, 340, 30, { fill: i % 3 ? C.paper : SHADE, col: C.ink, lw: 4, seed: 850 + (i % 5) }); ctx.restore();
  }
  const pp = eb(seg(t, tFold + 0.18, tFold + 0.45));
  if (pp > 0) {
    ctx.save(); ctx.translate(PX + PW / 2, PY + PH / 2); ctx.scale(pp, pp); ctx.rotate(-0.015 + wiggle(t, 0.006, 0.5)); ctx.translate(-(PX + PW / 2), -(PY + PH / 2));
    poly([[PX + 14, PY + 14], [PX + PW - 90 + 14, PY + 14], [PX + PW + 14, PY + 90 + 14], [PX + PW + 14, PY + PH + 14], [PX + 14, PY + PH + 14]], { fill: C.ink, col: null, lw: 0, seed: 860 });
    poly([[PX, PY], [PX + PW - 90, PY], [PX + PW, PY + 90], [PX + PW, PY + PH], [PX, PY + PH]], { fill: '#FFFDF7', col: C.ink, lw: 7, seed: 861 });
    poly([[PX + PW - 90, PY], [PX + PW - 90, PY + 90], [PX + PW, PY + 90]], { fill: SHADE, col: C.ink, lw: 6, seed: 862 });
    // lines of "text"
    const L = [0.82, 0.64, 0.9, 0.58, 0.76, 0.7], gy = 92, y0 = PY + 150, st = [1, 3];
    L.forEach((w, r) => {
      const y = y0 + r * gy, isNew = r === 5;
      if (isNew) { const wp = eo3(seg(t, tWrite, tWrite + 0.5)); if (wp > 0) rrect(PX + 50, y, (PW - 110) * w * wp, 30, 15, { fill: '#2E5AAC', col: null, lw: 0, seed: 870 + r });
        if (wp > 0 && wp < 1) pencilProp(PX + 50 + (PW - 110) * w * wp + 60, y - 30, 1, 2.0); return; }
      const si = st.indexOf(r), ts = si === 0 ? tStrike : tStrike2;
      rrect(PX + 50, y, (PW - 110) * w, 30, 15, { fill: C.ink, col: null, lw: 0, seed: 870 + r, alpha: si >= 0 && t > ts ? 0.35 : 1 });
      if (si >= 0 && t > ts) {
        hatch(PX + 40, y - 14, (PW - 90) * w + 20, 58, { gap: 12, alpha: 0.5, seed: 880 + r, p: eo3(seg(t, ts, ts + 0.15)) });
        const sp = stamp(t, ts); ctx.save(); ctx.translate(PX + PW / 2, y + 15); ctx.scale(sp.sc, sp.sc); ctx.translate(-(PX + PW / 2), -(y + 15));
        line(PX + 30, y + 15, PX + 60 + (PW - 110) * w, y + 15, { col: C.red, lw: 16, wob: 2, seed: 890 + r }); ctx.restore();
      }
    });
    ctx.restore();
    // label tab
    const ts = stamp(t, tTab); if (ts.alpha > 0) plate(PX + 200, PY - 6, d.page, { font: 'Brush', size: 58, sc: ts.sc, alpha: ts.alpha, rot: -0.03 });
  }
  // robot: stands on the terminal ledge at left; nods when the page comes back to it
  const nod = Math.sin(Math.PI * 2 * seg(t, tNod, tNod + 0.5)), hopA = Math.sin(Math.PI * seg(t, tNod, tNod + 0.35));
  const rIn = eb(seg(t, 0.05, 0.4)), typing = t > tType && t < tEnter ? Math.sin(t * 30) : 0, poke = Math.sin(Math.PI * seg(t, tEnter - 0.1, tEnter + 0.2));
  const fy = tp > 0 ? lerp(1500, 1050, tp) : 1050;
  bot(lerp(-120, 185, rIn), Math.min(1050, fy) - 40 * hopA, 18, {
    t, sy: breathe(t), eye: t > tNod ? 'happy' : t > tStrike - 0.1 && t < tWrite + 0.5 ? 'wow' : 'open', look: t < tArrow ? 1 : 0.4, lookY: t > tTerm && t < tStrike ? 1 : 0,
    tilt: 0.22 * nod, armR: lerp(0.4, 1.0, cl(Math.abs(typing))) + 0.6 * poke, armL: 0.3 + 0.4 * hopA,
  });
  // arrow loops from the page back into the robot's head
  const ap = eo3(seg(t, tArrow, tArrow + 0.35));
  if (ap > 0) {
    qArrow(PX - 10, PY + 400, 110, 330, 175, 640, ap, { col: C.green, lw: 14 });
    const ls = popIn(t, tArrow + 0.25, 0.3); if (ls > 0) plate(215, 280, d.loop, { font: 'Brush', size: 60, sc: ls, rot: -0.06, fill: C.paper, tcol: C.ink });
  }
  if (t > tNod) burst(180, 760, tNod, t, 9, C.green, 220, 20);
  ctx.restore();
}

// =====================================================================================================
// n6 habits: three sticky notes slap onto the wall over the desk; the robot points at each.
// =====================================================================================================
export function habits(t, d, dur) {
  const k = dur / 6.553, T = (x) => x * k;
  const tBulb = T(0.45), hits = [0.2, 0.45, 0.7].map((f) => f * dur);
  const NOTES = [{ cx: 420, cy: 330, w: 420, rot: -0.05, fill: YEL }, { cx: 620, cy: 590, w: 470, rot: 0.04, fill: PINK }, { cx: 590, cy: 850, w: 470, rot: -0.03, fill: MINT }];
  bg('paper');
  ctx.save();
  cam(t, [[hits[0] + 0.85, 1.07, 480, 420], [hits[1] - 0.05, 1.0, 540, 800], [hits[1] + 0.85, 1.07, 600, 700], [hits[2] - 0.05, 1.0, 540, 800], [hits[2] + 0.9, 1.08, 480, 760]]);
  const [jx, jy] = jolt(t, hits.map((h) => h + 0.12), 12, 0.3); ctx.translate(jx, jy);
  // small neat stack on the desk (the robot's own pages)
  stack(8, {});
  // robot: pencil tapping, then points at each note as it lands
  const { i: last, since } = (() => { let i = -1; hits.forEach((h, q) => { if (t >= h) i = q; }); return { i, since: i < 0 ? 9 : t - hits[i] }; })();
  const pointA = since < 1.0 ? eb(seg(since, 0, 0.2)) * (1 - seg(since, 0.75, 1.0)) : 0, jump = since < 0.4 ? Math.sin(Math.PI * since / 0.4) : 0;
  const tap = Math.max(0, Math.sin(t * 9)) * (1 - pointA);
  const tgt = last >= 0 ? NOTES[last] : NOTES[0], aim = Math.atan2(tgt.cx - (RB.x + 4.5 * RB.s), tgt.cy - (RB.y - 8.6 * RB.s));
  bot(RB.x, RB.y - 60 * jump, RB.s, {
    t, sy: breathe(t) * (1 + 0.06 * jump), eye: since < 1.0 ? 'happy' : 'open', look: last >= 0 ? 0.8 : 0.3, lookY: -0.6 * pointA,
    armR: lerp(0.9 + 0.25 * tap, aim, pointA), lenR: lerp(3.8, 7, pointA), armL: 0.3 + 0.15 * jump, tilt: -0.08 * pointA + 0.04 * Math.sin(t * 2),
    holdL: (hx, hy) => pencilProp(hx + 10, hy - 14, 0.8, -1.1 + 0.25 * tap),
  });
  // light bulb idea
  const bp = popIn(t, tBulb, 0.3), bout = 1 - seg(t, hits[0] - 0.2, hits[0]);
  if (bp > 0 && bout > 0) { ctx.save(); ctx.translate(RB.x + 30, 700); ctx.scale(bp * bout, bp * bout);
    circle(0, 0, 58, { fill: YEL, col: C.ink, lw: 6, seed: 900 }); rectS(-24, 50, 48, 34, { fill: C.ink, col: null, lw: 0, seed: 901 });
    for (let q = 0; q < 6; q++) { const a = -Math.PI / 2 + (q - 2.5) * 0.45; line(Math.cos(a) * 76, Math.sin(a) * 76, Math.cos(a) * 104, Math.sin(a) * 104, { col: C.ink, lw: 6, seed: 902 + q }); }
    ctx.restore(); }
  desk();
  // the sticky notes
  NOTES.forEach((n, q) => {
    const s = slam(t, hits[q] - 0.02, { d: 0.14, from: 1.9, amp: 0 }); if (s.alpha <= 0) return;
    const text = d.notes[q], ls = wrap(text, 'Brush', 66, n.w - 70), fsz = 66, h = 90 + ls.length * fsz * 0.95;
    ctx.save(); ctx.globalAlpha = s.alpha; ctx.translate(n.cx, n.cy); ctx.rotate(n.rot + wiggle(t, 0.01, 0.6, q)); ctx.scale(s.sc, s.sc);
    rectS(-n.w / 2 + 12, -h / 2 + 14, n.w, h, { fill: C.ink, col: null, lw: 0, seed: 910 + q });
    rectS(-n.w / 2, -h / 2, n.w, h, { fill: n.fill, col: C.ink, lw: 6, seed: 915 + q });
    rectS(-n.w / 2, -h / 2, n.w, 26, { fill: C.ink, col: null, lw: 0, seed: 918 + q, alpha: 0.15 });
    circle(0, -h / 2 + 10, 16, { fill: C.red, col: C.ink, lw: 4, seed: 920 + q });
    ls.forEach((l, r) => txt(l, 0, -h / 2 + 50 + (r + 0.8) * fsz * 0.95, { font: 'Brush', size: fsz }));
    ctx.restore();
    if (t > hits[q] + 0.12) burst(n.cx, n.cy, hits[q] + 0.12, t, 10, C.green, n.w * 0.6, 22);
  });
  ctx.restore();
}

// =====================================================================================================
// n10 inject: three turns; a "prompt injection" sticky lands on the first page and gets copied forward.
// =====================================================================================================
export function inject(t, d, dur) {
  const k = dur / 5.294, T = (x) => x * k;
  const tTitle = T(0.08), pIn = [T(0.3), T(0.5), T(0.7)], tArr = T(0.95), hits = [0.25, 0.45, 0.72].map((f) => f * dur), tZoom = T(4.15);
  const PG = [{ cx: 215 }, { cx: 540 }, { cx: 865 }], PY = 420, PW = 280, PH = 500;
  bg('paper');
  ctx.save();
  cam(t, [[T(2.0), 1.08, 300, 600], [hits[1] - 0.1, 1.0, 540, 800], [T(3.25), 1.08, 700, 600], [hits[2] - 0.1, 1.0, 540, 800], [tZoom, 1.07, 560, 700]]);
  const [jx, jy] = jolt(t, hits.map((h) => h + 0.14), 12, 0.3); ctx.translate(jx, jy);
  // title plate
  const ts = slam(t, tTitle, { d: 0.14, from: 2.0, amp: 0 }); if (ts.alpha > 0) plate(540, 290, d.title, { font: 'Marker', size: 72, sc: ts.sc, alpha: ts.alpha, fill: C.red });
  // arrows between turns
  const ap = eo3(seg(t, tArr, tArr + 0.3));
  for (let q = 0; q < 2; q++) if (ap > 0) qArrow(PG[q].cx, PY + PH + 30, (PG[q].cx + PG[q + 1].cx) / 2, PY + PH + 170, PG[q + 1].cx - 20, PY + PH + 40, ap, { lw: 10 });
  // pages
  PG.forEach((p, q) => {
    const sp = eb(seg(t, pIn[q], pIn[q] + 0.3)); if (sp <= 0) return;
    const x = p.cx + (1 - cl(sp)) * -500, infected = t > hits[q] + 0.1;
    ctx.save(); ctx.translate(x, PY + PH / 2); ctx.rotate((q - 1) * 0.03 + (1 - cl(sp)) * -0.3);
    rectS(-PW / 2 + 12, -PH / 2 + 12, PW, PH, { fill: C.ink, col: null, lw: 0, seed: 930 + q });
    rectS(-PW / 2, -PH / 2, PW, PH, { fill: infected ? '#F6D9D6' : '#FFFDF7', col: C.ink, lw: 6, seed: 933 + q });
    bars(-PW / 2 + 30, -PH / 2 + 110, PW - 60, 6, 62, { seed: q * 3 });
    if (infected) hatch(-PW / 2 + 6, -PH / 2 + 6, PW - 12, PH - 12, { col: C.red, gap: 18, alpha: 0.35, seed: 936 + q, p: eo3(seg(t, hits[q] + 0.1, hits[q] + 0.4)) });
    plate(0, -PH / 2 - 4, d.turn, { font: 'Brush', size: 50, rot: 0.02, fill: C.paper, tcol: C.ink, pad: 22 });
    ctx.restore();
  });
  // the sticky: lands on page 1, then copies fly forward to pages 2 and 3
  const sticky = (x, y, sc, rot, alpha = 1) => {
    const ls = wrap(d.sticky, 'Brush', 52, 190), w = 230, h = 60 + ls.length * 50;
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
    rectS(-w / 2 + 10, -h / 2 + 10, w, h, { fill: C.ink, col: null, lw: 0, seed: 940 });
    rectS(-w / 2, -h / 2, w, h, { fill: C.red, col: C.ink, lw: 6, seed: 941 });
    for (let q = 0; q < 3; q++) line(-w / 2 + 16, -h / 2 + 18 + q * 8, -w / 2 + 70, -h / 2 + 30 + q * 6, { col: C.ink, lw: 3, alpha: 0.5, seed: 942 + q });
    ls.forEach((l, r) => txt(l, 0, -h / 2 + 30 + (r + 0.8) * 50, { font: 'Brush', size: 52, col: C.paper }));
    ctx.restore();
  };
  const SY = PY + 170;
  hits.forEach((h, q) => {
    if (q === 0) { const s = slam(t, h - 0.14, { d: 0.14, from: 2.2, amp: 0 }); if (s.alpha > 0) sticky(PG[0].cx, SY, s.sc, -0.08, s.alpha); return; }
    const p = seg(t, h - 0.35, h); if (p <= 0) return;
    const x = lerp(PG[q - 1].cx, PG[q].cx, eio(p)), y = SY - 220 * Math.sin(Math.PI * p), sq = p >= 1 ? 1 - 0.1 * Math.sin(Math.PI * seg(t, h, h + 0.2)) : 1 + 0.25 * Math.sin(Math.PI * p);
    sticky(x, y, sq, -0.08 + (q % 2 ? 0.1 : -0.02) * p);
  });
  hits.forEach((h) => { if (t > h) burst(PG[hits.indexOf(h)].cx, SY, h, t, 9, C.red, 200, 18); });
  // robot below: eyes follow the sticky, flinches at every copy
  const fl = Math.max(...hits.map((h) => Math.sin(Math.PI * seg(t, h, h + 0.35)))), cur = hits.filter((h) => t >= h - 0.35).length - 1;
  const lookX = cur < 0 ? 0 : (cur - 1) * 1.0, shiver = 0;
  bot(540 + shiver, 1430, 22, { t, sy: breathe(t) * (1 - 0.1 * fl), sx: 1 + 0.06 * fl, eye: fl > 0.2 ? 'closed' : cur >= 0 ? 'sad' : 'open', look: lookX, lookY: -1, armL: 0.3 + 2.2 * fl, armR: 0.3 + 2.2 * fl, tilt: -0.1 * fl });
  if (cur >= 1) { const dp = seg(t, hits[1], hits[1] + 0.8) % 1; ctx.save(); ctx.globalAlpha = 1 - dp; poly([[690, 1060 + dp * 60], [676, 1094 + dp * 60], [704, 1094 + dp * 60]], { fill: '#5B9BD5', col: C.ink, lw: 3 }); circle(690, 1096 + dp * 60, 15, { fill: '#5B9BD5', col: C.ink, lw: 3 }); ctx.restore(); }
  ctx.restore();
}

// =====================================================================================================
// n11 loop: the n1 desk again; scissors lie on the desk, the rule line is faded, the robot holds the eraser.
// =====================================================================================================
export function loop(t, d, dur) {
  // the harness glove reaches in with the scissors, the robot guards with the eraser, the glove leaves, the robot
  // puts the eraser away and settles into exactly the frame-0 pose of `snip` (same desk, stack, bin, robot).
  const tPeek = 0.35, tGuard = 0.95, tCirc = 1.45, tLeave = 2.15, tTuck = 2.65, settle = eo3(seg(t, tTuck, tTuck + 0.6));
  bg('paper');
  ctx.save();
  cam(t, [[tCirc, 1.08, 700, 860], [tLeave, 1.0, 540, 800]]);
  const [jx, jy] = jolt(t, [tGuard + 0.1], 10, 0.28); ctx.translate(jx, jy);
  const wind = Math.sin(Math.PI * seg(t, tGuard - 0.3, tGuard)), lift = eb(seg(t, tGuard, tGuard + 0.3)), tuck = popIn(t, tTuck, 0.25);
  const hold = t < tTuck ? 1 : 1 - eo3(seg(t, tTuck, tTuck + 0.2)), look = eo3(seg(t, tPeek, tPeek + 0.2)) * (1 - settle);
  const calm = 1 - seg(t, dur - 1.2, dur - 0.5);           // breathing eases to the frame-0 value
  bot(RB.x, RB.y - 40 * Math.sin(Math.PI * seg(t, tGuard, tGuard + 0.35)), RB.s, {
    t: t < dur - 1 ? t : 0, sy: (1 + (breathe(t) - 1) * calm) * (1 - 0.1 * wind), sx: 1 + 0.06 * wind,
    eye: t > tPeek && t < tLeave ? 'wow' : t >= tLeave && t < tTuck + 0.4 ? 'happy' : 'open',
    look, armR: lerp(lerp(0.5, 2.8, lift) - 0.3 * wind, 0.3, settle), armL: lerp(0.3 + 0.3 * lift, 0.3, settle),
    holdR: hold > 0 ? (hx, hy, a) => eraserProp(hx, hy - 10, 0.9 * hold, -a + Math.PI / 2) : null,
  });
  if (t > tTuck) burst(RB.x + 120, 900, tTuck, t, 8, C.green, 160, 18);
  stack(N0, {});
  desk(); bin(t, 1e9);
  // glove with scissors: reaches for the stack, recoils from the eraser, leaves
  const pk = eb(seg(t, tPeek, tPeek + 0.35)), go = ei3(seg(t, tLeave, tLeave + 0.35));
  if (pk > 0 && go < 1) {
    const rec = Math.sin(Math.PI * seg(t, tGuard + 0.05, tGuard + 0.45)), gx = lerp(1300, 800, pk) + 70 * rec + go * 800, gy = 820 - go * 150;
    scissors(gx, gy, 190, 0.3 - 0.25 * rec); glove(gx + 120, gy, d.hand, { sc: 0.9, rot: -0.05 });
    const cp = eo3(seg(t, tCirc, tCirc + 0.3));
    if (cp > 0 && go < 0.02) { const pts = []; for (let q = 0; q <= 44 * cp; q++) { const a = 0.4 + q / 40 * Math.PI * 2; pts.push([gx - 60 + Math.cos(a) * 170, gy + Math.sin(a) * 80]); } stroke(pts, { lw: 12, col: C.green, seed: 950, amp: 3 }); }
  }
  ctx.restore();
  // small corner credit, fades out well before the end so the last frames equal frame 0
  const ca = gate(t, 0.3, dur - 1.0, 0.3);
  if (ca > 0 && d.handle) {
    txt(d.handle, 80, 228, { font: 'Brush', size: 50, align: 'left', alpha: ca });
    txt(d.credit, 80, 272, { font: 'Mono', size: 28, align: 'left', alpha: ca * 0.9 });
  }
}

// =====================================================================================================
// n9 duel: one coding test, two columns. Heights come from the values themselves (0..100 scale); both columns
// get the same neutral ink treatment, and the robot looks from one to the other (no winner mark).
// =====================================================================================================
export function duel(t, d, dur) {
  const k = dur / 5.23, T = (x) => x * k;
  const tA = 0.15 * dur, tB = 0.5 * dur, GROW = 0.5, tBot = 0.78 * dur;
  const BASE = 1170, MAXH = 860, COLS = [{ x: 290, it: d.a, t0: tA, hatch: true }, { x: 690, it: d.b, t0: tB, hatch: false }], BW = 240;
  bg('paper');
  ctx.save();
  cam(t, [[tA + GROW, 1.06, 290, 800], [tB + GROW, 1.06, 690, 800], [tB + GROW + 0.9, 1.0, 540, 800]]);
  const [jx, jy] = jolt(t, COLS.map((c) => c.t0 + GROW), 12, 0.3); ctx.translate(jx, jy);
  const ts = slam(t, T(0.08), { d: 0.14, from: 2.0, amp: 0 });
  if (ts.alpha > 0) plate(540, 270, d.title, { font: 'Brush', size: 72, sc: ts.sc, alpha: ts.alpha, rot: -0.02 });
  line(110, BASE, 900, BASE, { col: C.ink, lw: 8, wob: 2, seed: 960 });
  COLS.forEach((c, q) => {
    const v = parseFloat(String(c.it.value)) || 0, g = eb(seg(t, c.t0, c.t0 + GROW)), h = MAXH * cl(v / 100) * g;
    // label under the column (visible from the start so the viewer knows what is coming)
    const lp = eb(seg(t, T(0.25) + q * 0.12, T(0.25) + q * 0.12 + 0.3));
    if (lp > 0) wrap(c.it.label, 'Brush', 54, 330).forEach((l, r) => txt(l, c.x, BASE + 70 + r * 56, { font: 'Brush', size: 54, alpha: cl(lp), sc: lp }));
    if (g <= 0) { rectS(c.x - BW / 2, BASE - 60, BW, 60, { fill: C.paper, col: C.ink, lw: 5, seed: 961 + q }); hatch(c.x - BW / 2 + 4, BASE - 56, BW - 8, 52, { gap: 18, alpha: 0.3, seed: 963 + q }); return; }
    rectS(c.x - BW / 2 + 12, BASE - h + 12, BW, h - 12, { fill: C.ink, col: null, lw: 0, seed: 965 + q });
    rectS(c.x - BW / 2, BASE - h, BW, h, { fill: c.hatch ? C.paper : '#5A5752', col: C.ink, lw: 7, seed: 967 + q });
    if (c.hatch) hatch(c.x - BW / 2 + 5, BASE - h + 5, BW - 10, h - 10, { gap: 18, alpha: 0.55, seed: 969 + q });
    const land = c.t0 + GROW, vs = slam(t, land - 0.12, { d: 0.12, from: 1.6, amp: 0 });
    if (vs.alpha > 0) { ctx.save(); ctx.translate(c.x, BASE - h - 70); ctx.scale(vs.sc, vs.sc);
      txt(countStrSafe(c.it.value, t, c.t0, GROW), 0, 34, { font: 'Marker', size: 104, alpha: vs.alpha }); ctx.restore(); }
    if (t > land) burst(c.x, BASE - h * 0.45, land, t, 8, C.green, 110, 18);
  });
  // robot slides in between the columns and looks left, right, left
  const rp = eb(seg(t, tBot, tBot + 0.3));
  if (rp > 0) {
    const sw = Math.sin((t - tBot) * 4.5), lk = sw > 0 ? -1 : 1;
    bot(lerp(-140, 490, cl(rp)), BASE, 11, { t, look: lk, tilt: 0.12 * lk, eye: 'open', armL: 0.3 + 0.5 * (lk < 0 ? 1 : 0), armR: 0.3 + 0.5 * (lk > 0 ? 1 : 0), sy: 1 + 0.06 * Math.sin(Math.PI * seg(t, tBot + 0.3, tBot + 0.5)) });
  }
  ctx.restore();
}
// count a value string up while its column grows; ends on the exact string
function countStrSafe(s, t, t0, d) {
  const m = String(s).match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/); if (!m || t >= t0 + d) return String(s);
  const dec = (m[2].split('.')[1] || '').length; return `${m[1]}${(parseFloat(m[2]) * eo3(seg(t, t0, t0 + d))).toFixed(dec)}${m[3]}`;
}


// =====================================================================================================
// r3 keep: the harness comes back for the stack; the robot snatches the starred page so the scissors bite air,
// then rips the FIXED RULE line off the stack. The claim shows as an overlay for under 3 s.
// =====================================================================================================
export function keep(t, d, dur) {
  const k = dur / 6.105, T = (x) => x * k;
  const tRule = T(0.08), tGlove = T(0.55), tYank = T(1.05), tSnap = T(1.4), tTear = T(1.95), tAway = T(2.4), tOver = T(2.75), tOver2 = T(2.95), tSub = T(3.1), tHop = T(4.3), tOff = T(5.55);
  bg('paper');
  ctx.save();
  const [jx, jy] = jolt(t, [tRule + 0.12, tSnap, tTear + 0.05], 10, 0.28); ctx.translate(jx, jy);
  // stack (cut) with the starred page on top until the robot takes it
  stack(CUTN, {});
  const yank = seg(t, tYank, tYank + 0.3);
  if (yank <= 0) sheet(STK.cx, sheetY(CUTN), STAR);
  // rule line and plate: slam back in, then torn in two and falling
  const rs = slam(t, tRule, { d: 0.14, from: 1.8, amp: 0 }), tau = Math.max(0, t - tTear - 0.12);
  if (rs.alpha > 0) {
    if (t < tTear + 0.12) { dashed(470, 905, CUTY); line(900, CUTY - 4, 900, 560, { col: C.ink, lw: 4, wob: 1, alpha: 0.7, seed: 781 }); plate(680, 520, d.rule, { size: 38, sc: rs.sc, alpha: rs.alpha }); }
    else if (tau < 1.2) {
      const fall = 1700 * tau * tau;
      ctx.save(); ctx.translate(470, CUTY + fall * 0.8); ctx.rotate(0.9 * tau + 0.2); dashed(0, 215, 0); stroke([[215, -10], [205, 0], [218, 8], [208, 16]], { lw: 5, col: C.red, seed: 970 }); ctx.restore();
      ctx.save(); ctx.translate(905, CUTY + fall); ctx.rotate(-1.4 * tau - 0.15); dashed(-215, 0, 0); ctx.restore();
      ctx.save(); ctx.translate(680, 520 + fall * 1.1); ctx.rotate(-2.2 * tau); plate(0, 0, d.rule, { size: 38 }); ctx.restore();
    }
  }
  // robot: right arm telescopes to snatch the starred page, left arm (eraser) rips the rule line
  const shx = RB.x + 4.5 * RB.s, shy = RB.y - 8.6 * RB.s, slx = RB.x - 4.5 * RB.s;
  const grab = Math.sin(Math.PI * seg(t, tYank - 0.15, tYank + 0.3)), held = yank > 0;
  const aimR = Math.atan2(STK.cx - shx, sheetY(CUTN) - shy), farR = Math.hypot(STK.cx - shx, sheetY(CUTN) - shy) / RB.s;
  const rip = Math.sin(Math.PI * seg(t, tTear - 0.25, tTear + 0.25));
  const aimL = -Math.atan2(560 - slx, CUTY - shy), farL = Math.hypot(560 - slx, CUTY - shy) / RB.s;
  const hop = Math.sin(Math.PI * seg(t, tHop, tHop + 0.4)), cheer = held ? eb(seg(t, tYank + 0.25, tYank + 0.5)) : 0;
  bot(RB.x, RB.y - 70 * hop, RB.s, {
    t, sy: breathe(t) * (1 + 0.08 * hop), eye: t > tSnap && t < tTear ? 'wow' : t > tAway ? 'happy' : 'open', mouth: t > tAway ? 'smile' : null,
    look: t < tYank ? 0.9 : t < tTear ? 1 : 0.3, armR: grab > 0.01 ? lerp(0.6, aimR, grab) : lerp(0.6, 2.95, cheer), lenR: lerp(3.8, farR, grab),
    armL: lerp(0.3, aimL, rip), lenL: lerp(3.8, farL, rip), tilt: 0.05 * Math.sin(t * 3),
    holdR: held ? (hx, hy) => sheet(hx + 20, hy - 24, STAR, { sc: 0.75, rot: -0.25 + 0.1 * Math.sin(t * 5) }) : null,
    holdL: (hx, hy, a) => eraserProp(hx, hy - 6, 0.8, a - Math.PI / 2),
  });
  // the page in flight from the stack to the robot's hand
  if (yank > 0 && yank < 1) { const hx = shx + Math.sin(2.95) * 3.8 * RB.s + 20, hy = shy + Math.cos(2.95) * 3.8 * RB.s;
    sheet(lerp(STK.cx, hx, eio(yank)), lerp(sheetY(CUTN), hy - 30, eio(yank)) - 160 * Math.sin(Math.PI * yank), STAR, { sc: lerp(1, 0.75, yank), rot: -2 * yank }); }
  desk(); bin(t, 1e9);
  // glove: swoops at the stack top, bites air, shakes, leaves
  if (t >= tGlove && t < tAway + 0.5) {
    const pin = eb(seg(t, tGlove, tGlove + 0.3)), out = ei3(seg(t, tAway, tAway + 0.35)), gy = sheetY(CUTN) + 10;
    const shake = t > tSnap ? Math.sin(t * 40) * 10 * (1 - seg(t, tSnap + 0.2, tAway)) : 0;
    const gx = lerp(1300, STK.cx + 40, pin) + out * 800 + shake, open = t < tSnap ? 0.34 : 0.03 + 0.31 * (1 - eb(seg(t, tSnap - 0.08, tSnap)));
    scissors(gx, gy, 190, open); glove(gx + 120, gy, d.hand, { sc: 0.9, rot: -0.05 });
    if (t > tSnap && t < tSnap + 0.5) for (let q = 0; q < 3; q++) { const a = Math.PI + (q - 1) * 0.6; line(gx - 200 + Math.cos(a) * 20, gy + Math.sin(a) * 60, gx - 200 + Math.cos(a) * 80, gy + Math.sin(a) * 130, { col: C.ink, lw: 7, seed: 975 + q }); }
  }
  ctx.restore();
  // claim overlay (at most 3 s): ink card, lines slam in
  const ov = eb(seg(t, tOver, tOver + 0.16)) * (1 - ei3(seg(t, tOff, tOff + 0.15)));
  if (ov > 0) {
    const [ox, oy] = jolt(t, [tOver + 0.16, tOver2 + 0.14], 10, 0.25);
    ctx.save(); ctx.translate(540 + ox, 430 + oy); ctx.scale(ov, ov); ctx.rotate(-0.02);
    rectS(-440 + 14, -230 + 14, 880, 470, { fill: C.green, col: null, lw: 0, seed: 980 });
    rectS(-440, -230, 880, 470, { fill: C.ink, col: C.ink, lw: 6, seed: 981 });
    const sz = Math.min(110, ...d.claim.map((l) => fit(l, 'Brush', 110, 800)));
    d.claim.forEach((l, i) => { const s0 = i === 0 ? tOver + 0.02 : tOver2 + (i - 1) * 0.06, sl = slam(t, s0, { d: 0.12, from: 1.6, amp: 0 }); if (sl.alpha <= 0) return;
      ctx.save(); ctx.translate(0, -140 + i * sz * 0.92); ctx.scale(sl.sc, sl.sc); txt(l, 0, sz * 0.3, { font: 'Brush', size: sz, col: i === 0 ? YEL : C.paper, alpha: sl.alpha }); ctx.restore(); });
    const sp = eb(seg(t, tSub, tSub + 0.2)); if (sp > 0) wrap(d.sub, 'Mono', 34, 800).forEach((l, i) => txt(l, 0, 150 + i * 44, { font: 'Mono', size: 34, col: C.paper, alpha: cl(sp) }));
    ctx.restore();
  }
}

// =====================================================================================================
// r7 stat: one research-test number counts up, then the relative gain stamps beside it.
// =====================================================================================================
export function stat(t, d, dur) {
  // the robot, at its desk, lifts a big page with the one number; the number counts up quickly and lands
  const k = dur / 6.723, T = (x) => x * k;
  const tLift = T(0.3), tTag = T(1.2), tZoom = T(2.4), tCount = T(3.9), land = tCount + 0.14, tMark = T(4.6), tBack = T(5.0), tNod = T(5.4);
  const PCX = 540, PCY = 500, PW = 640, PH = 420;
  bg('paper');
  ctx.save();
  cam(t, [[tZoom, 1.08, 540, 600], [tBack, 1.0, 540, 800]]);
  const [jx, jy] = jolt(t, [land, tLift + 0.3], 12, 0.3); ctx.translate(jx, jy);
  const squat = Math.sin(Math.PI * seg(t, tLift - 0.3, tLift)), lp = eb(seg(t, tLift, tLift + 0.35));
  const hop = Math.sin(Math.PI * seg(t, land, land + 0.35)) + 0.6 * Math.sin(Math.PI * seg(t, tNod, tNod + 0.3));
  const RX = 540, RY = DESK.y + 45 - 50 * hop, s = RB.s, py = lerp(DESK.y - 120, PCY, cl(lp));
  // page held overhead
  ctx.save(); ctx.translate(PCX, py - 50 * hop); ctx.rotate(-0.02 + 0.03 * Math.sin(t * 2)); ctx.scale(lerp(0.4, 1, cl(lp)), lerp(0.4, 1, cl(lp)));
  rectS(-PW / 2 + 14, -PH / 2 + 14, PW, PH, { fill: C.ink, col: null, lw: 0, seed: 1010 });
  rectS(-PW / 2, -PH / 2, PW, PH, { fill: '#FFFDF7', col: C.ink, lw: 7, seed: 1011 });
  txt(d.title, 0, -PH / 2 + 70, { font: 'Brush', size: 60 });
  const vsz = fit(d.value, 'Marker', 210, PW - 80);
  const vs = slam(t, tCount, { d: 0.14, from: 2.0, amp: 0 }); if (vs.alpha > 0) { ctx.save(); ctx.scale(vs.sc, vs.sc); txt(d.value, 0, 70, { font: 'Marker', size: vsz, alpha: vs.alpha }); ctx.restore(); }
  if (t < land) hatch(-PW / 2 + 60, -60, PW - 120, 150, { gap: 22, alpha: 0.3, seed: 1012 });
  marker(-PW / 2 + 60, PW / 2 - 60, 120, 22, eo3(seg(t, tMark, tMark + 0.3)), C.green, 0.75);
  if (t > tTag) txt(typeOn(d.tag, t, tTag, 40), 0, PH / 2 - 34, { font: 'Mono', size: 30, alpha: 0.85 });
  ctx.restore();
  // robot behind the desk, arms up to the page corners
  const shy = RY - 8.6 * s, cy = py - 50 * hop + PH / 2 - 30, aR = Math.atan2(PCX + 220 - (RX + 4.5 * s), cy - shy), aL = -Math.atan2(PCX - 220 - (RX - 4.5 * s), cy - shy);
  const lenR = Math.hypot(PCX + 220 - (RX + 4.5 * s), cy - shy) / s, lenL = Math.hypot(PCX - 220 - (RX - 4.5 * s), cy - shy) / s;
  const up = cl(lp);
  bot(RX, RY, s, { t, sy: breathe(t) * (1 - 0.1 * squat), sx: 1 + 0.06 * squat, eye: t > land && t < land + 1.2 ? 'happy' : t > tNod ? 'happy' : 'open', mouth: t > tNod ? 'smile' : null,
    lookY: -1 * up, armR: lerp(0.3, aR, up), lenR: lerp(3.8, lenR, up), armL: lerp(0.3, aL, up), lenL: lerp(3.8, lenL, up), tilt: 0.05 * Math.sin(t * 3) });
  if (t > land) burst(PCX - PW / 2 - 10, PCY + PH / 2, land, t, 8, C.green, 160, 18);
  desk(); bin(t, 1e9);
  ctx.restore();
}

// =====================================================================================================
// r12 outro: the loop desk at rest (robot with the eraser), handle and one credit line overlaid.
// =====================================================================================================

export default { snip, eraser, file, habits, inject, loop, duel, keep, stat };
