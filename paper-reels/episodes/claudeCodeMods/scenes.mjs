// Bespoke scenes for "Claude Code mods: Blast Radius", paper style.
// Metaphor: the agent (the boxy robot) swings a hammer at a folder called `build`; the Blast Radius mod is a gloved
// hand that grabs the risky Bash call off a conveyor and holds it until someone presses a button.
// Drawings add no numbers or claims; every word drawn comes from `d`. File names in the pane are scenery and are
// labelled with d.example. Every scene is a pure function of (t, d, dur): no module state, no randomness.
// The robot, glove, plate, qArrow, wrap/fit/cam helpers are copied from episodes/contextLanguageModels/scenes.mjs.
import { C, ctx, cl, lerp, eo3, ei3, eio, eob, seg, txt, tw, line, rectS, rrect, circle, marker, stroke, hatch, burst, bg, poly, star4 } from '../../engine/core.mjs';
import { popIn, slam, stamp, jolt, wiggle, typeOn, gate, pulse } from '../../engine/motion.mjs';

const YEL = '#F2C94C', PINK = '#F29BB0', MINT = '#9FD8B0', GLOVE = '#FFFFFF', WOOD = '#D8C29A', SHADE = '#E4DCCB';
const TERM = '#22252B', MANILA = '#F2C76E', MANILA2 = '#D9A94A', STEEL = '#9AA0A8', SAND = '#EAD9A8';

// ---------- small helpers ----------
const wrap = (s, font, size, maxW) => { const out = []; let cur = ''; for (const w of String(s).split(' ')) { const tt = cur ? `${cur} ${w}` : w; if (tw(tt, font, size) > maxW && cur) { out.push(cur); cur = w; } else cur = tt; } if (cur) out.push(cur); return out; };
const eb = (p) => (p <= 0 ? 0 : eob(p));
const fit = (s, font, size, maxW) => Math.min(size, size * maxW / tw(s, font, size));
// camera: list of [t0, z, cx, cy]; each key is reached in 0.16 s (a snap, so the change lands inside one gate sample).
// init = the camera before the first key.
function cam(t, keys, init = [1, 540, 800]) {
  let [z, cx, cy] = init;
  for (const [t0, z1, x1, y1] of keys) { const p = eo3(seg(t, t0, t0 + 0.16)); if (p <= 0) break; z = lerp(z, z1, p); cx = lerp(cx, x1, p); cy = lerp(cy, y1, p); }
  ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy);
}
function qArrow(x1, y1, qx, qy, x2, y2, p, { col = C.ink, lw = 10 } = {}) {
  if (p <= 0) return; const pts = [], n = 24, m = Math.max(1, Math.round(n * cl(p)));
  for (let i = 0; i <= m; i++) { const u = i / n, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u; pts.push([a * x1 + b * qx + c * x2, a * y1 + b * qy + c * y2]); }
  stroke(pts, { lw, col, seed: 610, amp: 2 });
  if (p > 0.97) { const [ex, ey] = pts[pts.length - 1], [px, py] = pts[pts.length - 3], ang = Math.atan2(ey - py, ex - px);
    for (const s of [-0.5, 0.5]) line(ex, ey, ex - Math.cos(ang + s) * 46, ey - Math.sin(ang + s) * 46, { col, lw, wob: 1, seed: 620 }); }
}
function plate(cx, cy, text, { font = 'Mono', size = 36, sc = 1, rot = -0.02, alpha = 1, fill = C.ink, tcol = C.paper, pad = 28 } = {}) {
  const w = tw(text, font, size) + pad * 2, h = size * 1.7;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc);
  rectS(-w / 2 + 9, -h / 2 + 9, w, h, { fill: C.ink, col: null, lw: 0, seed: 640, alpha });
  if (alpha >= 0.99) rectS(-w / 2, -h / 2, w, h, { fill, col: C.ink, lw: 5, seed: 641 });
  else rectS(-w / 2, -h / 2, w, h, { fill, col: null, lw: 0, seed: 641, alpha });
  txt(text, 0, size * 0.36, { font, size, col: tcol, alpha }); ctx.restore();
}
// slammed plate helper: plate that drops in at t0 (scale from 1.9, no shake)
function slamPlate(t, t0, cx, cy, text, o = {}) { const s = slam(t, t0, { d: 0.14, from: 1.9, amp: 0 }); if (s.alpha > 0) plate(cx, cy, text, { ...o, sc: s.sc * (o.sc || 1), alpha: s.alpha }); }
// a red rubber stamp: double border, Marker letters, slight rotation
function rubber(cx, cy, text, { size = 200, sc = 1, alpha = 1, rot = -0.12, col = C.red, maxW = 900 } = {}) {
  const fs = fit(text, 'Marker', size, maxW - 80), w = tw(text, 'Marker', fs) + 80, h = fs * 1.35;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc);
  rectS(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12, { fill: '#F5F1E8', col, lw: 12, seed: 1101 });
  rectS(-w / 2 + 12, -h / 2 + 12, w - 24, h - 24, { col, lw: 5, seed: 1102 });
  txt(text, 0, fs * 0.36, { font: 'Marker', size: fs, col, alpha });
  ctx.restore();
}
const breathe = (t) => 1 + 0.012 * Math.sin(t * 4.2);

// ---------- robot (same parts and proportions as core.robot, plus posable arms, eyes and head) ----------
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
  if (mouth === 'flat') line(-0.9 * s + ex, -11.3 * s, 0.9 * s + ex, -11.3 * s, { col: C.ink, lw: 5, wob: 0 });
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
// gloved hand gripping at (x,y), arm from the right; cuff label from d
function glove(x, y, label, { sc = 1, rot = 0 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  rectS(150, -58, 560, 116, { fill: C.ink, col: C.ink, lw: 5, seed: 730 });
  rectS(96, -78, 120, 156, { fill: C.red, col: C.ink, lw: 5, seed: 731 });
  rrect(-46, -70, 160, 140, 46, { fill: GLOVE, col: C.ink, lw: 7, seed: 732 });
  for (let k = 0; k < 3; k++) rrect(-74, -52 + k * 38, 70, 40, 18, { fill: GLOVE, col: C.ink, lw: 6, seed: 733 + k });
  rrect(-30, -104, 96, 52, 24, { fill: GLOVE, col: C.ink, lw: 6, seed: 737, rot: -0.3 });
  for (let k = 0; k < 3; k++) line(30, -30 + k * 30, 80, -30 + k * 30, { col: C.ink, lw: 4, wob: 1, seed: 738 + k });
  const fs = fit(label, 'Brush', 56, 400); txt(label, 440, 18, { font: 'Brush', size: fs, col: C.paper });
  ctx.restore();
}
// terminal window: dark rounded box with three dots; returns nothing
function term(x, y, w, h, { alpha = 1, title = null } = {}) {
  ctx.save(); ctx.globalAlpha = alpha;
  rrect(x + 12, y + 12, w, h, 26, { fill: C.ink, col: null, lw: 0, seed: 1201, alpha: 0.45 * alpha });
  rrect(x, y, w, h, 26, { fill: TERM, col: C.ink, lw: 7, seed: 1202 });
  [C.red, YEL, C.green].forEach((c, q) => circle(x + 44 + q * 42, y + 38, 13, { fill: c, col: null, lw: 0, seed: 1203 + q }));
  if (title) txt(title, x + w / 2, y + 50, { font: 'Mono', size: 32, col: '#E8A0A0', alpha });
  ctx.restore();
}
// manila folder, centre (cx,cy), width w
function folder(cx, cy, w, label, { sc = 1, rot = 0, alpha = 1, papers = 3, shake = 0 } = {}) {
  const h = w * 0.72;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc);
  rectS(-w / 2 + 12, -h / 2 + 12, w, h, { fill: C.ink, col: null, lw: 0, seed: 1210 });
  poly([[-w / 2, -h / 2], [-w / 2 + w * 0.36, -h / 2], [-w / 2 + w * 0.42, -h / 2 - h * 0.14], [-w / 2 + w * 0.06, -h / 2 - h * 0.14]], { fill: MANILA2, col: C.ink, lw: 6, seed: 1211 });
  rectS(-w / 2, -h / 2, w, h, { fill: MANILA2, col: C.ink, lw: 6, seed: 1212 });
  for (let k = 0; k < papers; k++) { const dx = -w * 0.32 + k * w * 0.2, sh = wiggle(shake, 4, 3, k);
    rectS(dx, -h / 2 - h * 0.1 + k * 8 + sh, w * 0.5, h * 0.5, { fill: k % 2 ? '#FFFDF7' : SHADE, col: C.ink, lw: 4, seed: 1213 + k }); }
  poly([[-w / 2, -h / 2 + h * 0.22], [w / 2, -h / 2 + h * 0.22], [w / 2 - 10, h / 2], [-w / 2 + 10, h / 2]], { fill: MANILA, col: C.ink, lw: 6, seed: 1217 });
  const fs = fit(label, 'Marker', w * 0.22, w * 0.8); txt(label, 0, h * 0.25, { font: 'Marker', size: fs, alpha });
  ctx.restore();
}
// hammer held at the grip, pointing along the arm (a = arm angle from straight down, side = +1 right arm)
function hammer(hx, hy, a, side, sc = 1) {
  const dir = Math.atan2(Math.cos(a), side * Math.sin(a));
  ctx.save(); ctx.translate(hx, hy); ctx.rotate(dir); ctx.scale(sc, sc);
  rectS(-40, -15, 290, 30, { fill: WOOD, col: C.ink, lw: 6, seed: 1220 });
  rectS(232 + 8, -92 + 8, 96, 184, { fill: C.ink, col: null, lw: 0, seed: 1221 });
  rectS(232, -92, 96, 184, { fill: STEEL, col: C.ink, lw: 7, seed: 1222 });
  rectS(232, -92, 96, 34, { fill: '#C3C8CF', col: C.ink, lw: 5, seed: 1223 });
  ctx.restore();
}
// a tool-call ticket: header strip with the tool name, body with the command in Mono
function ticket(cx, cy, text, { head = 'Bash', sc = 1, rot = 0, alpha = 1, risky = false, size = 42, wrapped = false } = {}) {
  const w = Math.max(250, tw(text, 'Mono', size) + 64), h = 150;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc);
  rectS(-w / 2 + 10, -h / 2 + 10, w, h, { fill: C.ink, col: null, lw: 0, seed: 1230 });
  rectS(-w / 2, -h / 2, w, h, { fill: wrapped ? '#D2B48C' : risky ? '#F6D9D6' : '#FFFDF7', col: C.ink, lw: 6, seed: 1231 });
  rectS(-w / 2, -h / 2, w, 50, { fill: C.ink, col: C.ink, lw: 4, seed: 1232 });
  txt(head, -w / 2 + 22, -h / 2 + 37, { font: 'Mono', size: 30, col: C.paper, align: 'left', alpha });
  if (wrapped) { for (let k = 0; k < 4; k++) line(-w / 2 + 20 + k * (w / 4), -h / 2 + 52, -w / 2 + 60 + k * (w / 4), h / 2, { col: '#8B6B43', lw: 5, seed: 1233 + k }); }
  txt(text, 0, 44, { font: 'Mono', size, col: C.ink, alpha });
  ctx.restore();
  return w;
}
function keycap(cx, cy, label, { w = 150, h = 140, press = 0, sc = 1, alpha = 1, size = 90, font = 'Marker' } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(cx, cy); ctx.scale(sc, sc);
  const dz = 14 * press;
  rrect(-w / 2, -h / 2 + 18, w, h, 22, { fill: C.ink, col: C.ink, lw: 6, seed: 1240 });
  rrect(-w / 2, -h / 2 + dz, w, h, 22, { fill: '#FFFDF7', col: C.ink, lw: 7, seed: 1241 });
  rrect(-w / 2 + 16, -h / 2 + 12 + dz, w - 32, h - 40, 16, { fill: SHADE, col: null, lw: 0, seed: 1242, alpha: 0.6 });
  txt(label, 0, dz + size * 0.3, { font, size, alpha });
  ctx.restore();
}
// big arrow cursor (tip at x,y)
function cursor(x, y, sc = 1, press = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sc * (1 - 0.12 * press), sc * (1 - 0.12 * press));
  const P = [[0, 0], [0, 120], [30, 92], [54, 146], [78, 136], [54, 84], [94, 84]];
  poly(P.map(([a, b]) => [a + 8, b + 8]), { fill: C.ink, col: null, lw: 0, seed: 1250 });
  poly(P, { fill: '#FFFFFF', col: C.ink, lw: 7, seed: 1251 });
  ctx.restore();
}
// desk under the robot (same proportions as the CLM desk)
const DESK = { y: 1160, x0: 90, x1: 900 };
function desk() {
  rectS(DESK.x0 + 40, DESK.y + 30, 34, 1430 - DESK.y - 30, { fill: WOOD, col: C.ink, lw: 6, seed: 750 });
  rectS(DESK.x1 - 74, DESK.y + 30, 34, 1430 - DESK.y - 30, { fill: WOOD, col: C.ink, lw: 6, seed: 751 });
  rectS(DESK.x0, DESK.y, DESK.x1 - DESK.x0, 42, { fill: WOOD, col: C.ink, lw: 6, seed: 752 });
  hatch(DESK.x0 + 6, DESK.y + 6, DESK.x1 - DESK.x0 - 12, 30, { gap: 26, alpha: 0.25, seed: 753 });
}
// speed lines behind a moving thing
function streaks(x, y, n, len, alpha, { dx = 1, gap = 34, seed = 1260 } = {}) {
  for (let q = 0; q < n; q++) line(x, y + (q - (n - 1) / 2) * gap, x - dx * len, y + (q - (n - 1) / 2) * gap, { col: C.ink, lw: 6, alpha, seed: seed + q });
}

// =====================================================================================================
// h1 hammer: a huge terminal types `rm -rf build`; the robot raises a hammer over the `build` folder;
// everything freezes and a red HELD stamp slams down.
// =====================================================================================================
const H1 = { RX: 300, RY: 1420, S: 26, FX: 690, FY: 1150, FW: 400 };
function hammerPose(t, k) {
  const T = (x) => x * k, tEnter = T(1.25), tRaise = T(1.3), tWind = T(1.75), tSwing = T(2.95), tFreeze = T(3.25);
  const raise = eo3(seg(t, tRaise, tRaise + 0.35)), wind = eio(seg(t, tWind, tWind + 0.9)), swing = ei3(seg(t, tSwing, tFreeze));
  let a = lerp(0.3, 2.45, raise); a = lerp(a, 3.05, wind); a = lerp(a, 2.35, swing);
  if (t > tFreeze) a = 2.35 + 0.012 * Math.sin(t * 40) * (1 - seg(t, tFreeze, tFreeze + 0.6));
  return { a, raise, tEnter, tRaise, tWind, tSwing, tFreeze, squash: Math.sin(Math.PI * seg(t, tWind, tWind + 0.9)) };
}
export function hammer_(t, d, dur, { thumb = false } = {}) {
  const k = dur / 6.105, T = (x) => x * k;
  const tTerm = 0.03, tType = T(0.3), P = hammerPose(t, k), tStamp = 0.62 * dur - 0.12, tPulse = T(4.75);
  bg('paper');
  ctx.save();
  if (!thumb) cam(t, [[P.tRaise + 0.1, 1.1, 560, 1050], [T(2.55), 1.2, 600, 980], [tStamp, 1.0, 540, 800], [tPulse, 1.07, 560, 760]]);
  const [jx, jy] = jolt(t, [tStamp + 0.12, P.tEnter], 14, 0.32); ctx.translate(jx, jy);
  // terminal
  const ts = slam(t, tTerm, { d: 0.14, from: 1.5, amp: 0 });
  if (ts.alpha > 0) {
    ctx.save(); ctx.translate(540, 360); ctx.scale(ts.sc, ts.sc); ctx.translate(-540, -360);
    term(70, 190, 940, 340, { alpha: ts.alpha });
    const fs = fit(`${d.prompt} ${d.cmd}`, 'Mono', 96, 840);
    const typed = typeOn(d.cmd, t, tType, 15);
    txt(d.prompt, 120, 420, { font: 'Mono', size: fs, col: C.green, align: 'left' });
    const x0 = 120 + tw(`${d.prompt} `, 'Mono', fs);
    if (t > P.tEnter) { const fl = 1 - seg(t, P.tEnter, P.tEnter + 0.4); if (fl > 0) rectS(100, 340, 880, 110, { fill: C.red, col: null, lw: 0, seed: 1301, alpha: 0.6 * fl }); }
    txt(typed, x0, 420, { font: 'Mono', size: fs, col: '#FF8A8A', align: 'left' });
    if (Math.floor(t * 2.5) % 2 === 0 || (t > tType && t < P.tEnter)) rectS(x0 + tw(typed, 'Mono', fs) + 8, 345, fs * 0.55, fs * 0.85, { fill: C.paper, col: null, lw: 0, seed: 1302 });
    ctx.restore();
  }
  // folder (shudders when the hammer is overhead)
  const shiver = t > P.tWind && t < P.tFreeze ? Math.sin(t * 50) * 4 : 0;
  folder(H1.FX + shiver, H1.FY, H1.FW, d.folder, { shake: t });
  // swing arc (frozen in place after the stop)
  if (t > P.tSwing) {
    const p = seg(t, P.tSwing, P.tFreeze), pts = [];
    for (let q = 0; q <= 20; q++) { const a = lerp(3.05, lerp(3.05, 2.35, p), q / 20); pts.push([H1.RX + 4.5 * H1.S + Math.sin(a) * 430, H1.RY - 8.6 * H1.S + Math.cos(a) * 430]); }
    stroke(pts, { lw: 8, col: C.ink, seed: 1303, alpha: 0.5 });
  }
  // robot with the hammer
  bot(H1.RX, H1.RY, H1.S, {
    t, sy: breathe(t) * (1 - 0.08 * P.squash), sx: 1 + 0.05 * P.squash,
    eye: t > tStamp ? 'wow' : t > P.tRaise ? 'closed' : 'open', mouth: t > tStamp ? 'o' : null, look: 0.8, lookY: t > tStamp ? -1 : 0,
    armR: P.a, lenR: 3.8, armL: 0.3 + 0.5 * P.raise, tilt: -0.06 * P.squash,
    holdR: P.raise > 0 ? (hx, hy, a, side) => hammer(hx, hy, a, side, lerp(0.3, 1, P.raise)) : null,
  });
  // frozen: two pause bars beside the hammer, then the stamp
  if (t > P.tFreeze && t < tStamp + 0.1) {
    const fp = popIn(t, P.tFreeze, 0.2);
    ctx.save(); ctx.translate(880, 700); ctx.scale(fp, fp);
    rectS(-60, -70, 44, 140, { fill: C.ink, col: null, lw: 0, seed: 1304 }); rectS(16, -70, 44, 140, { fill: C.ink, col: null, lw: 0, seed: 1305 });
    ctx.restore();
  }
  const st = slam(t, tStamp, { d: 0.14, from: 2.4, amp: 0 });
  if (st.alpha > 0) { if (t > tStamp + 0.14) burst(560, 790, tStamp + 0.14, t, 12, C.red, 520, 26); rubber(560, 790, d.stamp, { size: 250, sc: st.sc * pulse(t, tPulse, 0.08, 0.35), alpha: st.alpha, rot: -0.12 }); }
  ctx.restore();
}

// =====================================================================================================
// m2 plug: a code card types the docs hook shape, a wire plugs it into a Claude Code box, events ride up the
// wire, and three verbs stamp in.
// =====================================================================================================
export function plug(t, d, dur) {
  const k = dur / 7.875, T = (x) => x * k;
  const tCard = 0.05, tLabel = T(0.5), tType = T(0.35), tZoom = T(1.9), tBox = T(0.55), tWire = T(0.85), tClick = T(1.25), tBack = T(2.9), EV = [4.1, 4.65, 5.2].map(T), VB = [5.75, 6.15, 6.55].map(T);
  const BOX = { x: 170, y: 1030, w: 740, h: 230 }, WX = 540, WY0 = 640;
  bg('paper');
  ctx.save();
  cam(t, [[tZoom, 1.12, 540, 400], [tBack, 1.0, 540, 800], [EV[0] + 0.1, 1.07, 540, 860], [VB[0] - 0.05, 1.0, 540, 800], [VB[2] + 0.35, 1.05, 540, 980]]);
  const [jx, jy] = jolt(t, [tClick, ...EV.map((e) => e + 0.45)], 10, 0.26); ctx.translate(jx, jy);
  // code card
  const cx = slideIn(t, tCard, -1100, 0.32);
  ctx.save(); ctx.translate(cx, 0);
  rectS(80 + 12, 190 + 12, 920, 440, { fill: C.ink, col: null, lw: 0, seed: 1310 });
  rectS(80, 190, 920, 440, { fill: '#FFFDF7', col: C.ink, lw: 7, seed: 1311 });
  let budget = Math.max(0, Math.floor((t - tType) * 30));
  d.code.forEach((ln, r) => {
    const shown = ln.slice(0, Math.max(0, Math.min(ln.length, budget))); budget -= ln.length;
    const y = 290 + r * 74;
    if (r === 0 && shown.length >= ln.length) marker(150 + tw("on('", 'Mono', 54), 150 + tw("on('tool.call'", 'Mono', 54), y - 18, 52, eo3(seg(t, T(1.2), T(1.5))), YEL, 0.7);
    txt(shown, 150, y, { font: 'Mono', size: 54, align: 'left', col: C.ink });
  });
  ctx.restore();
  slamPlate(t, tLabel, 200, 190, d.label, { font: 'Marker', size: 64, fill: C.red, rot: -0.06 });
  // Claude Code box rising
  const bp = eb(seg(t, tBox, tBox + 0.35));
  if (bp > 0) {
    const by = lerp(1700, BOX.y, cl(bp));
    rectS(BOX.x + 14, by + 14, BOX.w, BOX.h, { fill: C.ink, col: null, lw: 0, seed: 1312 });
    rectS(BOX.x, by, BOX.w, BOX.h, { fill: C.ink, col: C.ink, lw: 7, seed: 1313 });
    hatch(BOX.x + 8, by + 8, BOX.w - 16, BOX.h - 16, { col: C.paper, gap: 30, alpha: 0.12, seed: 1314 });
    txt(d.box, 540, by + BOX.h / 2 + 34, { font: 'Marker', size: fit(d.box, 'Marker', 104, BOX.w - 80), col: C.paper });
  }
  // wire with a plug in the middle: the two halves meet at tClick
  const wp = eo3(seg(t, tWire, tWire + 0.3));
  if (wp > 0) {
    const mid = 835, gapPx = 120 * (1 - eo3(seg(t, tClick - 0.25, tClick)));
    line(WX, WY0, WX, lerp(WY0, mid - 50 - gapPx / 2, wp), { col: C.ink, lw: 12, wob: 2, seed: 1315 });
    line(WX, BOX.y, WX, lerp(BOX.y, mid + 50 + gapPx / 2, wp), { col: C.ink, lw: 12, wob: 2, seed: 1316 });
    if (wp > 0.9) {
      rectS(WX - 50, mid - 90 - gapPx / 2, 100, 60, { fill: C.ink, col: C.ink, lw: 5, seed: 1317 });
      line(WX - 22, mid - 30 - gapPx / 2, WX - 22, mid - gapPx / 2 + 6, { col: STEEL, lw: 12, wob: 0 }); line(WX + 22, mid - 30 - gapPx / 2, WX + 22, mid - gapPx / 2 + 6, { col: STEEL, lw: 12, wob: 0 });
      rectS(WX - 60, mid + gapPx / 2, 120, 70, { fill: '#5A5752', col: C.ink, lw: 5, seed: 1318 });
    }
    if (t > tClick) burst(WX, mid, tClick, t, 10, YEL, 220, 24);
  }
  // events ride up the wire from Claude Code to the mod
  EV.forEach((e0, q) => {
    const p = seg(t, e0, e0 + 0.45); if (p <= 0 || p >= 1.6) return;
    const y = lerp(BOX.y - 20, WY0 + 40, eio(p)), a = 1 - seg(t, e0 + 0.45, e0 + 0.6);
    if (a > 0) plate(WX + (q - 1) * 250, y, d.events[q], { font: 'Brush', size: 58, fill: YEL, tcol: C.ink, rot: (q - 1) * 0.05, alpha: a, sc: 1 + 0.2 * (1 - a) });
  });
  // verbs
  VB.forEach((v0, q) => slamPlate(t, v0, 220 + q * 300, 1370, d.verbs[q], { font: 'Marker', size: 60, fill: [C.paper, YEL, C.red][q], tcol: q === 2 ? C.paper : C.ink, rot: (q - 1) * 0.04 }));
  ctx.restore();
}
const slideIn = (t, t0, from, d = 0.4) => from * (1 - eo3(seg(t, t0, t0 + d)));

// =====================================================================================================
// b3 conveyor: Bash tool calls ride a belt; the Blast Radius glove grabs only the risky one and stamps HOLD.
// =====================================================================================================
export function conveyor(t, d, dur) {
  const k = dur / 6.403, T = (x) => x * k;
  const tTitle = 0.05, tTag = T(0.8), tGlove = T(3.2), tGrab = T(3.7), tLift = T(3.75), tHold = 0.66 * dur - 0.1;
  const BY = 930, V = 260, R = d.calls.indexOf(d.risky);
  bg('paper');
  ctx.save();
  cam(t, [[T(1.65), 1.1, 540, 1000], [T(2.85), 1.0, 540, 800], [tHold + 0.05, 1.12, 600, 700], [T(5.4), 1.0, 540, 800]]);
  const [jx, jy] = jolt(t, [tGrab, tHold + 0.14], 12, 0.3); ctx.translate(jx, jy);
  // title and tag
  const ts = slam(t, tTitle, { d: 0.14, from: 2.0, amp: 0 });
  if (ts.alpha > 0) { ctx.save(); ctx.translate(540, 300); ctx.scale(ts.sc, ts.sc); marker(-360, 360, 20, 70, eo3(seg(t, 0.3, 0.6)), YEL, 0.6); txt(d.name, 0, 44, { font: 'Marker', size: fit(d.name, 'Marker', 132, 880), alpha: ts.alpha }); ctx.restore(); }
  slamPlate(t, tTag, 540, 440, d.tag, { font: 'Mono', size: 38, fill: C.paper, tcol: C.ink, rot: 0.025 });
  // belt
  const off = (t * V) % 80;
  rrect(30, BY + 75, 1020, 70, 35, { fill: '#5A5752', col: C.ink, lw: 7, seed: 1320 });
  for (let x = 30 - 80 + off; x < 1050; x += 80) if (x > 50 && x < 1020) line(x, BY + 85, x + 20, BY + 135, { col: C.paper, lw: 5, alpha: 0.5, seed: 1321 });
  for (let q = 0; q < 7; q++) { const cx = 80 + q * 153; circle(cx, BY + 110, 22, { fill: STEEL, col: C.ink, lw: 5, seed: 1322 + q }); line(cx, BY + 110, cx + Math.cos(t * 6 + q) * 18, BY + 110 + Math.sin(t * 6 + q) * 18, { col: C.ink, lw: 4, wob: 0 }); }
  rectS(120, BY + 145, 34, 1430 - BY - 145, { fill: WOOD, col: C.ink, lw: 6, seed: 1330 }); rectS(926, BY + 145, 34, 1430 - BY - 145, { fill: WOOD, col: C.ink, lw: 6, seed: 1331 });
  // tickets
  const lift = eo3(seg(t, tLift, tLift + 0.4));
  d.calls.forEach((c, i) => {
    let x = 540 + V * (t - tGrab) + (R - i) * 500, y = BY;
    if (i === R && t >= tGrab) { x = 540; y = lerp(BY, 700, lift); }
    if (x < -250 || x > 1330) return;
    ticket(x, y, c, { head: d.tool, risky: i === R, sc: 1.12, rot: i === R && t >= tGrab ? -0.05 * lift : 0 });
  });
  // the glove grabs the risky ticket and lifts it
  if (t >= tGlove) {
    const pin = eb(seg(t, tGlove, tGrab)), gx = lerp(1350, 540 + 230, pin) + (t < tGrab ? V * (t - tGrab) * 0 : 0), gy = t < tGrab ? BY : lerp(BY, 700, lift);
    glove(gx, gy, d.name, { sc: 0.9, rot: t >= tGrab ? -0.04 : 0 });
    if (t < tGlove + 0.4) streaks(gx + 700, gy, 4, 220, 1 - seg(t, tGlove + 0.2, tGlove + 0.4), { dx: -1 });
  }
  const hs = slam(t, tHold, { d: 0.14, from: 2.2, amp: 0 });
  if (hs.alpha > 0) { if (t > tHold + 0.14) burst(330, 590, tHold + 0.14, t, 10, C.red, 300, 22); rubber(330, 590, d.grab, { size: 115, sc: hs.sc, alpha: hs.alpha, rot: -0.1, maxW: 560 }); }
  // small robot watching from the left, eyes follow the risky ticket
  const lk = t > tGrab ? -0.4 : 1;
  bot(540, 1430, 15, { t, eye: t > tGrab && t < tGrab + 1.2 ? 'wow' : 'open', look: lk, lookY: -1, armR: t > tHold ? 2.6 : 0.4, armL: t > tHold ? 2.6 : 0.4, sy: breathe(t) });
  ctx.restore();
}

// =====================================================================================================
// p4 pane: the blast radius ring expands around the folder; the pane opens; file rows draw in one at a time
// with strike marks; labels for the list and the count and size.
// =====================================================================================================
export function pane(t, d, dur) {
  const k = dur / 7.257, T = (x) => x * k;
  const tRing = 0.1, tRingLbl = T(0.95), tPane = T(1.65), tRows = d.rows.map((_, i) => T(1.65) + 0.3 + 0.45 * i), tLabel = T(4.45), tMeta = T(5.55), tOut = T(6.05);
  const PX = 70, PY = 170, PW = 940, PH = 720, FX = 540, FY = 1235;
  bg('paper');
  ctx.save();
  cam(t, [[tPane, 1.0, 540, 800], [T(2.6), 1.12, 540, 540], [T(4.0), 1.12, 540, 760], [tOut, 1.0, 540, 800]], [1.18, 540, 1100]);
  const [jx, jy] = jolt(t, [tPane + 0.15, tMeta + 0.12], 12, 0.3); ctx.translate(jx, jy);
  // ring around the folder
  const rp = eob(seg(t, tRing, tRing + 0.7)), pulseR = 1 + 0.04 * Math.sin(t * 5);
  if (rp > 0) {
    const rx = 420 * rp * pulseR, ry = 195 * rp * pulseR, pts = [];
    ctx.save(); ctx.globalAlpha = 0.14; ctx.fillStyle = C.red; ctx.beginPath(); ctx.ellipse(FX, FY, rx, ry, 0, 0, 7); ctx.fill(); ctx.restore();
    for (let q = 0; q <= 46; q++) { const a = -0.4 + q / 42 * Math.PI * 2; pts.push([FX + Math.cos(a) * rx, FY + Math.sin(a) * ry]); }
    stroke(pts, { lw: 14, col: C.red, seed: 1340, amp: 4 });
    for (let q = 0; q < 10; q++) { const a = q / 10 * Math.PI * 2 + 0.2; line(FX + Math.cos(a) * rx * 1.05, FY + Math.sin(a) * ry * 1.05, FX + Math.cos(a) * rx * 1.16, FY + Math.sin(a) * ry * 1.16, { col: C.red, lw: 7, seed: 1341 + q }); }
  }
  folder(FX, FY, 300, d.folder, { shake: t });
  const rl = popIn(t, tRingLbl, 0.3); if (rl > 0) plate(FX, FY + 115, d.ring, { font: 'Marker', size: 54, fill: C.red, sc: rl, rot: 0.06 });
  // the pane drops open from the top
  const pp = eb(seg(t, tPane, tPane + 0.3));
  if (pp > 0) {
    const py = lerp(-900, PY, cl(pp));
    term(PX, py, PW, PH, { title: d.cmd });
    txt(d.example, PX + PW - 30, py + 54, { font: 'Mono', size: 28, col: C.paper, align: 'right', alpha: 0.7 });
    line(PX + 20, py + 84, PX + PW - 20, py + 84, { col: '#555B66', lw: 3, wob: 0 });
    d.rows.forEach((r, i) => {
      const r0 = tRows[i], rp2 = eb(seg(t, r0, r0 + 0.22)); if (rp2 <= 0) return;
      const y = py + 158 + i * 92, x = PX + 60 + (1 - cl(rp2)) * 300;
      ctx.save(); ctx.globalAlpha = cl(rp2);
      rectS(x, y - 40, 36, 46, { fill: '#FFFDF7', col: '#888', lw: 3, seed: 1350 + i });
      txt(r, x + 62, y, { font: 'Mono', size: 50, col: C.paper, align: 'left' });
      ctx.restore();
      const sp = eo3(seg(t, r0 + 0.2, r0 + 0.4));
      if (sp > 0) { const w = tw(r, 'Mono', 50) + 16; line(x + 54, y - 16, x + 54 + w * sp, y - 20, { col: C.red, lw: 10, wob: 2, seed: 1355 + i }); }
    });
    // footer: count and total size
    const ms = slam(t, tMeta, { d: 0.14, from: 1.8, amp: 0 });
    if (ms.alpha > 0) { ctx.save(); ctx.translate(540, py + PH - 70); ctx.scale(ms.sc, ms.sc); rectS(-400, -44, 800, 88, { fill: YEL, col: C.ink, lw: 5, seed: 1360 }); txt(d.meta, 0, 18, { font: 'Marker', size: fit(d.meta, 'Marker', 60, 740), alpha: ms.alpha }); ctx.restore(); }
  }
  // annotation: the list label with an arrow into the rows
  const la = popIn(t, tLabel, 0.3);
  if (la > 0) {
    qArrow(600, 950, 1010, 930, 930, 600, eo3(seg(t, tLabel + 0.1, tLabel + 0.4)), { col: C.ink, lw: 9 });
    plate(330, 950, d.label, { font: 'Brush', size: 60, fill: '#FFFDF7', tcol: C.ink, sc: la, rot: -0.04 });
  }
  ctx.restore();
}

// =====================================================================================================
// k5 buttons: Proceed and Cancel slam in, keys 1 and 2 are sketched under them, focus glows on Cancel,
// the cursor taps Enter and Cancel goes down.
// =====================================================================================================
export function buttons(t, d, dur) {
  const k = dur / 6.574, T = (x) => x * k;
  const tP = 0.08, tC = T(0.45), tK1 = T(1.45), tK2 = T(2.45), tFocus = T(3.25), tEnter = T(4.25), tTap = 0.82 * dur - 0.25, tPress = tTap + 0.12;
  const B = [{ x: 290, y: 500 }, { x: 790, y: 500 }], BW = 400, BH = 180;
  bg('paper');
  ctx.save();
  cam(t, [[T(1.9), 1.06, 400, 700], [tFocus, 1.14, 760, 600], [tEnter, 1.0, 540, 800], [tPress + 0.05, 1.1, 640, 760]]);
  const [jx, jy] = jolt(t, [tTap, tPress], 12, 0.3); ctx.translate(jx, jy);
  const press = Math.sin(Math.PI * seg(t, tPress, tPress + 0.5)) * 0.6 + (t > tPress ? 0.4 : 0);
  // focus ring (behind Cancel)
  const fo = eb(seg(t, tFocus, tFocus + 0.3));
  if (fo > 0) {
    const g = 1 + 0.05 * Math.sin(t * 7);
    ctx.save(); ctx.translate(B[1].x, B[1].y); ctx.scale(fo * g, fo * g);
    rrect(-BW / 2 - 34, -BH / 2 - 34, BW + 68, BH + 68, 40, { fill: YEL, col: C.ink, lw: 6, seed: 1370, alpha: 0.85 });
    ctx.restore();
    slamPlate(t, tFocus + 0.1, B[1].x + 60, B[1].y - 170, d.focus, { font: 'Marker', size: 56, fill: C.ink, rot: 0.05 });
  }
  [[d.proceed, tP, 0], [d.cancel, tC, 1]].forEach(([label, t0, q]) => {
    const s = slam(t, t0, { d: 0.14, from: 2.0, amp: 0 }); if (s.alpha <= 0) return;
    const pr = q === 1 ? press : 0;
    ctx.save(); ctx.translate(B[q].x, B[q].y); ctx.scale(s.sc, s.sc); ctx.globalAlpha = s.alpha;
    rrect(-BW / 2, -BH / 2 + 20, BW, BH, 30, { fill: C.ink, col: C.ink, lw: 6, seed: 1371 + q });
    rrect(-BW / 2, -BH / 2 + 20 * pr, BW, BH, 30, { fill: q === 1 && pr > 0.3 ? SHADE : '#FFFDF7', col: C.ink, lw: 8, seed: 1373 + q });
    txt(label, 0, 26 + 20 * pr, { font: 'Marker', size: fit(label, 'Marker', 82, BW - 60), alpha: s.alpha });
    ctx.restore();
  });
  // keys
  [[d.k1, tK1, d.runs], [d.k2, tK2, d.refuses]].forEach(([lab, t0, note], q) => {
    const p = popIn(t, t0, 0.3); if (p <= 0) return;
    const kp = q === 1 ? Math.sin(Math.PI * seg(t, t0 + 0.35, t0 + 0.6)) : Math.sin(Math.PI * seg(t, t0 + 0.35, t0 + 0.6));
    keycap(B[q].x, 790, lab, { sc: p, press: kp, font: 'Mono', size: 96 });
    qArrow(B[q].x, 700, B[q].x + 10, 660, B[q].x, 618, eo3(seg(t, t0 + 0.1, t0 + 0.35)), { lw: 7 });
    const np = popIn(t, t0 + 0.25, 0.3); if (np > 0) txt(note, B[q].x, 945, { font: 'Brush', size: 66, sc: np });
  });
  // Enter key
  const ek = popIn(t, tEnter, 0.3);
  if (ek > 0) keycap(540, 1200, d.enter, { w: 380, h: 170, sc: ek, press: Math.sin(Math.PI * seg(t, tTap, tTap + 0.35)), size: 84 });
  if (t > tPress) burst(B[1].x, B[1].y, tPress, t, 12, YEL, 300, 24);
  // cursor path: Proceed key, Cancel key, Cancel, Enter
  const path = [[0, 560, 1360], [tK1 - 0.3, 330, 830], [tK2 - 0.3, 830, 830], [tFocus - 0.1, 830, 560], [tTap - 0.35, 560, 1210]];
  let cx = path[0][1], cy = path[0][2];
  for (let q = 1; q < path.length; q++) { const p = eio(seg(t, path[q][0], path[q][0] + 0.35)); cx = lerp(cx, path[q][1], p); cy = lerp(cy, path[q][2], p); }
  cursor(cx, cy + 6 * Math.sin(t * 3), 1, Math.sin(Math.PI * seg(t, tTap, tTap + 0.3)));
  ctx.restore();
}

// =====================================================================================================
// r6 refusal: a note arrives at the robot's desk ("refused" + the reason); the robot reads it and shrugs; the
// folder stays; other commands zip across the top as normal.
// =====================================================================================================
export function refusal(t, d, dur) {
  const k = dur / 6.574, T = (x) => x * k;
  const tNote = 0.06, tStamp = T(0.85), tReason = T(1.35), tRead = T(1.95), tShrug = T(2.85), tKept = T(3.4), tRun = [4.25, 4.75, 5.25].map(T), tNormal = T(4.35);
  const RX = 250, RY = 1205, S = 25, NX = 560, NY = 640;
  bg('paper');
  ctx.save();
  cam(t, [[tRead, 1.14, 540, 640], [tShrug, 1.0, 540, 800], [tRun[0] - 0.05, 1.08, 540, 560], [T(5.75), 1.0, 540, 800]]);
  const [jx, jy] = jolt(t, [tStamp + 0.12, tKept + 0.1], 10, 0.28); ctx.translate(jx, jy);
  desk();
  // folder stays on the desk
  folder(720, 1010, 300, d.folder, { shake: t, rot: wiggle(t, 0.006, 0.5) });
  const kp = popIn(t, tKept, 0.3);
  if (kp > 0) { line(720, 840, 760, 900, { col: C.ink, lw: 4 }); plate(720, 820, d.kept, { font: 'Brush', size: 54, fill: '#FFFDF7', tcol: C.ink, sc: kp, rot: 0.08 * Math.sin(t * 3) }); }
  // robot: reads, then shrugs
  const sh = Math.sin(Math.PI * seg(t, tShrug, tShrug + 0.6)), hold = 1 - eo3(seg(t, tShrug - 0.1, tShrug + 0.1));
  bot(RX, RY - 30 * sh, S, {
    t, sy: breathe(t) * (1 + 0.04 * sh), eye: t > tRead && t < tShrug ? 'open' : t >= tShrug && t < tShrug + 0.8 ? 'closed' : 'open', mouth: t > tShrug ? 'flat' : null,
    look: t > tRead && t < tShrug ? 0.6 + 0.4 * Math.sin(t * 6) : 0.5, lookY: t < tShrug ? -0.8 : 0,
    armR: lerp(lerp(0.3, 2.1, eo3(seg(t, tNote, tNote + 0.4))) * hold + (1 - hold) * 2.4, 2.4, sh), armL: lerp(0.3, 2.4, sh), tilt: 0.16 * sh,
  });
  // the note
  const np = eb(seg(t, tNote, tNote + 0.35)), drop = ei3(seg(t, tShrug, tShrug + 0.45));
  if (np > 0 && drop < 1) {
    ctx.save(); ctx.translate(lerp(1300, NX, cl(np)) + drop * 120, NY + drop * 380); ctx.rotate(-0.05 + drop * 0.8 + (1 - cl(np)) * 0.4); ctx.scale(1 - drop * 0.5, 1 - drop * 0.5);
    rectS(-260 + 12, -170 + 12, 520, 340, { fill: C.ink, col: null, lw: 0, seed: 1380 });
    rectS(-260, -170, 520, 340, { fill: '#FFFDF7', col: C.ink, lw: 6, seed: 1381 });
    for (let q = 0; q < 4; q++) line(-230, -100 + q * 70, 230, -100 + q * 70, { col: '#9FC3E8', lw: 3, wob: 0.5, seed: 1382 + q });
    const ss = stamp(t, tStamp); if (ss.alpha > 0) rubber(0, -40, d.note, { size: 110, sc: ss.sc, alpha: ss.alpha, rot: -0.08, maxW: 460 });
    const rr = typeOn(d.reason, t, tReason, 22); txt(rr, 0, 110, { font: 'Brush', size: 70 });
    ctx.restore();
  }
  // other commands run as normal across the top
  tRun.forEach((r0, q) => {
    const p = eb(seg(t, r0, r0 + 0.35)); if (p <= 0) return;
    const X = [210, 520, 830][q], x = lerp(-300, X, cl(p));
    ticket(x, 380, d.others[q], { head: d.tool, sc: 0.8, rot: (q - 1) * 0.04 });
    if (p < 1) streaks(x - 150, 380, 3, 200, 0.6 * (1 - p));
  });
  slamPlate(t, tNormal, 540, 215, d.normal, { font: 'Marker', size: 56, fill: C.paper, tcol: C.ink, rot: -0.03 });
  ctx.restore();
}

// =====================================================================================================
// l7 limits: a net catches a plain rm ticket; wrapped tickets (bash -c, alias, eval) slip through the holes;
// a red stamp lands: SAFETY NET, NOT A LOCK; the permission-rules note follows.
// =====================================================================================================
function net(t, sag, holes, x0 = 90, x1 = 990, y0 = 720, cell = 75) {
  const n = Math.round((x1 - x0) / cell);
  line(x0 - 20, y0, x0 - 20, y0 + 40, { col: C.ink, lw: 10 }); line(x1 + 20, y0, x1 + 20, y0 + 40, { col: C.ink, lw: 10 });
  const Y = (x) => y0 + 20 + sag * Math.sin(Math.PI * (x - x0) / (x1 - x0)) + wiggle(t, 2, 1.3, x / 50);
  for (let r = 0; r < 3; r++) { const pts = []; for (let x = x0; x <= x1; x += 15) pts.push([x, Y(x) + r * cell * 0.6]); stroke(pts, { lw: 5, col: '#6B5B3E', seed: 1390 + r, amp: 1 }); }
  for (let c = 0; c <= n; c++) { const x = x0 + c * cell; let skip = false; for (const h of holes) if (Math.abs(x - h.x) < cell && h.p > 0) skip = true;
    if (!skip) line(x, Y(x), x + cell * 0.3, Y(x) + cell * 1.2, { col: '#6B5B3E', lw: 5, wob: 1, seed: 1395 + c }); }
}
export function limits(t, d, dur) {
  const k = dur / 8.515, T = (x) => x * k;
  const tTitle = 0.05, tNetLbl = T(0.7), tCatch = T(1.35), tSn = [2.9, 3.6, 4.3].map(T), tStamp = 0.72 * dur - 0.12, tHard = T(7.0);
  const SX = [240, 470, 330];
  bg('paper');
  ctx.save();
  cam(t, [[T(2.6), 1.1, 540, 900], [T(4.9), 1.0, 540, 800], [tStamp + 0.05, 1.08, 540, 560], [tHard, 1.0, 540, 800]]);
  const [jx, jy] = jolt(t, [tCatch + 0.4, tStamp + 0.14], 12, 0.3); ctx.translate(jx, jy);
  // plain rm ticket: falls, caught, sits on the net
  const cp = seg(t, tCatch, tCatch + 0.4), sag = 40 * Math.sin(Math.PI * seg(t, tCatch + 0.35, tCatch + 0.9)) * Math.exp(-2 * Math.max(0, t - tCatch - 0.35)) + (t > tCatch + 0.4 ? 18 : 0);
  const holes = tSn.map((s, q) => ({ x: SX[q], p: Math.sin(Math.PI * seg(t, s + 0.25, s + 0.6)) }));
  net(t, sag, holes);
  if (cp > 0) ticket(780, lerp(250, 690 + sag * 0.8, ei3(cp)), d.caught, { head: d.tool, risky: true, sc: 0.9, rot: 0.03 });
  // sneaky tickets slip through
  tSn.forEach((s, q) => {
    const p = seg(t, s, s + 1.0); if (p <= 0) return;
    const y = lerp(-150, 1300, ei3(p) * 0.6 + p * 0.4), sq = Math.abs(y - 760) < 80 ? 0.75 : 1;
    const settle = p >= 1 ? 1300 - 0 : y;
    ctx.save(); const PILE = [205, 480, 735], land = eio(seg(p, 0.55, 1)), psc = lerp(1, 0.8, land);
    ctx.translate(lerp(SX[q], PILE[q], land), Math.min(settle, 1300)); ctx.scale(sq * psc, psc / sq); ctx.rotate((q - 1) * 0.15 + wiggle(t, 0.04, 2, q));
    ticket(0, 0, d.sneaky[q], { head: d.tool, wrapped: true, size: fit(d.sneaky[q], 'Mono', 42, 360) });
    // disguise: sunglasses over the header
    rectS(-70, -96, 60, 30, { fill: C.ink, col: null, lw: 0, seed: 1400 + q }); rectS(10, -96, 60, 30, { fill: C.ink, col: null, lw: 0, seed: 1403 + q }); line(-10, -84, 10, -84, { col: C.ink, lw: 5 });
    ctx.restore();
  });
  // robot at lower left: eyes follow the ones that slip past
  const cur = tSn.filter((s) => t > s).length - 1;
  const st = slam(t, tStamp, { d: 0.14, from: 2.3, amp: 0 });
  // labels drawn after the falling tickets so nothing covers the title or the net label
  slamPlate(t, tTitle, 540, 250, d.title, { font: 'Marker', size: 76, fill: C.red });
  slamPlate(t, tNetLbl, 540, 920, d.net, { font: 'Brush', size: 54, fill: YEL, tcol: C.ink, rot: -0.03 });
  if (st.alpha > 0) { if (t > tStamp + 0.14) burst(540, 465, tStamp + 0.14, t, 12, C.red, 520, 24); rubber(540, 465, d.stamp, { size: 130, sc: st.sc, alpha: st.alpha, rot: -0.08, maxW: 940 }); }
  slamPlate(t, tHard, 540, 1060, d.hard, { font: 'Mono', size: 38, fill: C.ink, tcol: C.paper, rot: 0.02 });
  ctx.restore();
}

// =====================================================================================================
// t8 trust: a sandbox box sits empty; the mod box is outside it; NOT SANDBOXED stamps; arrows reach files, a
// terminal and the network; the rule plate lands.
// =====================================================================================================
export function trust(t, d, dur) {
  const k = dur / 6.339, T = (x) => x * k;
  const tBox = 0.05, tMod = T(0.35), tStamp = 0.2 * dur - 0.12, tArr = T(2.35), tIc = [2.45, 2.85, 3.25].map(T), tPerm = T(3.5), tRule = T(4.45);
  const MX = 720, MY = 870, IY = 1230, IX = [230, 540, 830];
  bg('paper');
  ctx.save();
  cam(t, [[T(2.2), 1.08, 540, 1080], [tRule, 1.0, 540, 800], [T(5.4), 1.05, 540, 600]]);
  const [jx, jy] = jolt(t, [tStamp + 0.14, tRule + 0.14], 12, 0.3); ctx.translate(jx, jy);
  // sandbox
  const bp = eo3(seg(t, tBox, tBox + 0.4));
  if (bp > 0) {
    rectS(90, 700, 370 * bp, 330, { fill: SAND, col: C.ink, lw: 7, seed: 1410 });
    for (let q = 0; q < 26 * bp; q++) circle(110 + ((q * 53) % 330), 730 + ((q * 97) % 280), 4, { fill: '#B89B5E', col: null, lw: 0, seed: 1411 });
    txt(d.sandbox, 275, 680, { font: 'Brush', size: 62, alpha: cl(bp) });
  }
  // the mod box, outside the sandbox
  const mp = popIn(t, tMod, 0.3);
  if (mp > 0) { ctx.save(); ctx.translate(MX, MY); ctx.scale(mp, mp); ctx.rotate(wiggle(t, 0.02, 0.7));
    rectS(-150 + 12, -110 + 12, 300, 220, { fill: C.ink, col: null, lw: 0, seed: 1412 }); rectS(-150, -110, 300, 220, { fill: C.ink, col: C.ink, lw: 6, seed: 1413 });
    txt(d.mod, 0, 30, { font: 'Marker', size: 96, col: YEL }); ctx.restore(); }
  // arrows to what it can reach (drawings only: files, a terminal, the network)
  const ap = eo3(seg(t, tArr, tArr + 0.35));
  IX.forEach((x, q) => { if (ap > 0) qArrow(MX, MY + 120, (MX + x) / 2, MY + 200, x, IY - 110, ap, { lw: 8 }); });
  const ic = tIc.map((s) => popIn(t, s, 0.3));
  if (ic[0] > 0) folder(IX[0], IY, 200, '', { sc: ic[0], papers: 2 });
  if (ic[1] > 0) { ctx.save(); ctx.translate(IX[1], IY); ctx.scale(ic[1], ic[1]); term(-110, -80, 220, 160); txt(d.shell, -50, 50, { font: 'Mono', size: 56, col: C.green, align: 'left' }); ctx.restore(); }
  if (ic[2] > 0) { ctx.save(); ctx.translate(IX[2], IY); ctx.scale(ic[2], ic[2]); circle(0, 0, 80, { fill: '#9FC3E8', col: C.ink, lw: 6, seed: 1414 });
    ctx.beginPath(); ctx.ellipse(0, 0, 36, 80, 0, 0, 7); ctx.strokeStyle = C.ink; ctx.lineWidth = 5; ctx.stroke(); line(-80, 0, 80, 0, { col: C.ink, lw: 5 }); ctx.restore(); }
  slamPlate(t, tPerm, 540, 1395, d.perms, { font: 'Brush', size: 58, fill: '#FFFDF7', tcol: C.ink, rot: -0.02 });
  const st = slam(t, tStamp, { d: 0.14, from: 2.3, amp: 0 });
  if (st.alpha > 0) { if (t > tStamp + 0.14) burst(540, 500, tStamp + 0.14, t, 10, C.red, 480, 22); rubber(540, 500, d.stamp, { size: 130, sc: st.sc, alpha: st.alpha, rot: -0.1, maxW: 900 }); }
  const rs = slam(t, tRule, { d: 0.14, from: 2.0, amp: 0 });
  if (rs.alpha > 0) { ctx.save(); ctx.translate(540, 270); ctx.scale(rs.sc, rs.sc); ctx.rotate(-0.02);
    const ls = wrap(d.rule, 'Brush', 74, 820), h = 40 + ls.length * 78;
    rectS(-450 + 12, -h / 2 + 12, 900, h, { fill: C.red, col: null, lw: 0, seed: 1415 }); rectS(-450, -h / 2, 900, h, { fill: C.ink, col: C.ink, lw: 6, seed: 1416 });
    ls.forEach((l, i) => txt(l, 0, -h / 2 + 20 + (i + 0.8) * 78, { font: 'Brush', size: 74, col: i === ls.length - 1 ? YEL : C.paper, alpha: rs.alpha }));
    ctx.restore(); }
  ctx.restore();
}

// =====================================================================================================
// c9 close: the robot describes a mod in a speech bubble, a page writes itself, a terminal types the load
// command, then the handle and the docs credit.
// =====================================================================================================
export function close(t, d, dur) {
  const k = dur / 10.938, T = (x) => x * k;
  const tBub = 0.06, tPage = T(1.0), tWrites = T(1.6), tSwap = T(3.0), tClone = T(3.15), tTerm = T(3.4), tType1 = T(3.7), tType2 = T(5.6), tHandle = T(7.3), tCredit = T(7.7), tLoop = dur - 1.15;
  const RX = 250, RY = 900, S = 18, PX = 560, PY = 520, PW = 340, PH = 400;
  bg('paper');
  ctx.save();
  cam(t, [[T(1.9), 1.08, 640, 700], [tSwap, 1.0, 540, 800], [T(4.4), 1.08, 540, 500], [T(5.6), 1.0, 540, 800], [T(6.4), 1.06, 540, 560], [tHandle, 1.0, 540, 800]]);
  const [jx, jy] = jolt(t, [tWrites + 0.12, tSwap + 0.35, tClone + 0.14], 10, 0.26); ctx.translate(jx, jy);
  // phase 1: describe a mod, a page writes itself; slides up and away at tSwap
  const out1 = ei3(seg(t, tSwap, tSwap + 0.35));
  if (out1 < 1) {
    ctx.save(); ctx.translate(0, -1400 * out1);
    const bs = slam(t, tBub, { d: 0.14, from: 1.8, amp: 0 });
    if (bs.alpha > 0) { ctx.save(); ctx.translate(540, 300); ctx.scale(bs.sc, bs.sc);
      const fs = fit(d.line1, 'Brush', 80, 800);
      ctx.fillStyle = '#FFFDF7'; ctx.strokeStyle = C.ink; ctx.lineWidth = 7; ctx.beginPath(); ctx.ellipse(0, 0, 470, 120, 0, 0, 7); ctx.fill(); ctx.stroke();
      poly([[-260, 90], [-330, 210], [-180, 105]], { fill: '#FFFDF7', col: C.ink, lw: 7, seed: 1420 });
      txt(d.line1, 0, fs * 0.33, { font: 'Brush', size: fs }); ctx.restore(); }
    const talk = t < tPage ? Math.abs(Math.sin(t * 14)) : 0, point = eo3(seg(t, tPage, tPage + 0.3));
    bot(RX, RY, S, { t, sy: breathe(t), eye: t > tWrites ? 'happy' : 'open', mouth: talk > 0.5 ? 'o' : t > tWrites ? 'smile' : null, look: 0.8, lookY: -0.5, armR: lerp(0.3, 1.9, point), lenR: lerp(3.8, 6, point), armL: 0.3 + 0.3 * talk });
    const pp = eb(seg(t, tPage, tPage + 0.3));
    if (pp > 0) {
      ctx.save(); ctx.translate(PX + PW / 2, PY + PH / 2); ctx.scale(pp, pp); ctx.rotate(0.03); ctx.translate(-(PX + PW / 2), -(PY + PH / 2));
      rectS(PX + 12, PY + 12, PW, PH, { fill: C.ink, col: null, lw: 0, seed: 1421 }); rectS(PX, PY, PW, PH, { fill: '#FFFDF7', col: C.ink, lw: 6, seed: 1422 });
      for (let r = 0; r < 6; r++) { const w = (PW - 80) * (0.5 + 0.45 * ((r * 37) % 10) / 10), wp = eo3(seg(t, tWrites + r * 0.12, tWrites + r * 0.12 + 0.25)); if (wp > 0) rrect(PX + 40 + (r % 3 === 1 ? 30 : 0), PY + 60 + r * 52, w * wp, 22, 11, { fill: '#2E5AAC', col: null, lw: 0, seed: 1423 + r }); }
      ctx.restore();
      slamPlate(t, tWrites, PX + PW / 2 + 20, PY - 20, d.line2, { font: 'Marker', size: 60, fill: YEL, tcol: C.ink, rot: 0.04 });
    }
    ctx.restore();
  }
  // phase 2 base: the opening composition (robot and build folder, exactly as h1 at t = 0) rises into place
  const up = eo3(seg(t, tSwap + 0.05, tSwap + 0.4));
  if (up > 0) {
    ctx.save(); ctx.translate(0, 900 * (1 - up));
    folder(H1.FX, H1.FY, H1.FW, d.loop.folder, { shake: t >= tLoop ? 0 : t });
    bot(H1.RX, H1.RY, H1.S, { t: t >= tLoop ? 0 : t, sy: t >= tLoop ? 1 : breathe(t), look: 0.8, armR: 0.3, armL: 0.3 });
    ctx.restore();
  }
  // phase 2 top: clone plate, terminal with the README steps, handle, credit; all leave at tLoop
  const gone = ei3(seg(t, tLoop, tLoop + 0.3));
  if (t > tClone && gone < 1) {
    ctx.save(); ctx.translate(0, -1000 * gone);
    slamPlate(t, tClone, 540, 250, d.clone, { font: 'Mono', size: 44, fill: C.ink, tcol: C.paper, rot: -0.02 });
    const tp = eb(seg(t, tTerm, tTerm + 0.35));
    if (tp > 0) {
      const tx = lerp(1300, 60, cl(tp));
      term(tx, 330, 960, 370);
      const fs = Math.min(...d.term.map((l) => fit(l, 'Mono', 52, 860)));
      d.term.forEach((ln, r) => {
        const t0 = r < 2 ? tType1 : tType2, before = r % 2 ? d.term[r - 1].length : 0;
        const s = ln.slice(0, Math.max(0, Math.min(ln.length, Math.floor((t - t0) * 30) - before)));
        const y = 330 + 112 + r * 74;
        if (s.startsWith('$')) { txt('$', tx + 40, y, { font: 'Mono', size: fs, col: C.green, align: 'left' }); txt(s.slice(1), tx + 40 + tw('$', 'Mono', fs), y, { font: 'Mono', size: fs, col: C.paper, align: 'left' }); }
        else txt(s, tx + 40, y, { font: 'Mono', size: fs, col: C.paper, align: 'left' });
      });
    }
    if (t > tHandle) {
      txt(d.handle, 540, 800, { font: 'Brush', size: 96, rot: -0.03, reveal: eo3(seg(t, tHandle, tHandle + 0.6)), shadow: { col: C.red, dx: 5, dy: 5 } });
      marker(240, 840, 818, 18, eo3(seg(t, tHandle + 0.4, tHandle + 0.8)), YEL, 0.7);
    }
    const ca = eo3(seg(t, tCredit, tCredit + 0.35)); if (ca > 0) txt(d.credit, 540, 870, { font: 'Mono', size: fit(d.credit, 'Mono', 40, 880), alpha: ca * 0.9 });
    ctx.restore();
  }
  ctx.restore();
}

export const hammerScene = (t, d, dur) => hammer_(t, d, dur);
export default { hammer: hammerScene, plug, conveyor, pane, buttons, refusal, limits, trust, close };
