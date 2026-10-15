// Ten calm, voice-paced scenes for the SkillSeek explainer. Each: (t, d) -> draws a full frame. t = local seconds, d = scene duration.
import { W, H, C, ctx, bg, txt, tw, line, stroke, rectS, rrect, circle, poly, marker, hatch, arrow, scribble, robot, IDdy, burst,
  rn, j, cl, lerp, eo3, ei3, eio, eob, seg, hop } from '../../engine/core.mjs';

const hash = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const A = (a) => { ctx.globalAlpha = cl(a); };
const done = () => { ctx.globalAlpha = 1; };

// small "skill" card centred at (x,y). hi: 0..1 green highlight. label: optional mono text.
function skill(x, y, w, h, { rot = 0, hi = 0, label = null, alpha = 1, sc = 1, seed = 1 } = {}) {
  if (alpha <= 0 || sc <= 0) return;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
  rrect(-w / 2 + 5, -h / 2 + 5, w, h, 8, { fill: C.ink, col: null, lw: 0, seed: seed + 1, alpha: 0.9 });
  rrect(-w / 2, -h / 2, w, h, 8, { fill: hi > 0.5 ? C.green : C.paper, col: C.ink, lw: 4, seed });
  const ink = hi > 0.5 ? C.paper : C.ink;
  circle(-w * 0.28, -h * 0.18, h * 0.14, { col: ink, lw: 3, seed: seed + 2 });
  line(-w * 0.08, -h * 0.2, w * 0.36, -h * 0.2, { col: ink, lw: 4, wob: 0.5, seed: seed + 3 });
  line(-w * 0.38, h * 0.12, w * 0.36, h * 0.12, { col: ink, lw: 3, wob: 0.5, seed: seed + 4, alpha: 0.6 });
  line(-w * 0.38, h * 0.3, w * 0.12, h * 0.3, { col: ink, lw: 3, wob: 0.5, seed: seed + 5, alpha: 0.6 });
  if (label) txt(label, 0, h * 0.06, { font: 'Mono', size: h * 0.3, col: ink });
  ctx.restore();
}
const check = (x, y, s, col = C.green, p = 1) => { if (p <= 0) return; const a = seg(p, 0, 0.45), b = seg(p, 0.45, 1);
  line(x - s * 0.5, y, lerp(x - s * 0.5, x - s * 0.1, a), lerp(y, y + s * 0.4, a), { col, lw: s * 0.18, wob: 0.5, seed: 700 });
  if (b > 0) line(x - s * 0.1, y + s * 0.4, lerp(x - s * 0.1, x + s * 0.6, b), lerp(y + s * 0.4, y - s * 0.5, b), { col, lw: s * 0.18, wob: 0.5, seed: 701 }); };
const panel = (cx, cy, w, h, o = {}) => { rectS(cx - w / 2 + 8, cy - h / 2 + 8, w, h, { fill: C.ink, col: null, lw: 0, seed: 811 });
  rectS(cx - w / 2, cy - h / 2, w, h, { fill: o.fill ?? C.paper, col: C.ink, lw: 6, seed: o.seed ?? 812 }); };


// ---------- 1: title ----------
export function s1(t, d) {
  bg('paper');
  const sc = eob(seg(t, 0.4, 1.3));
  marker(210, 870, 462, 56, eio(seg(t, 1.4, 2.6)), C.green, 0.5);
  txt('SkillSeek', 540, 430, { font: 'Marker', size: 190, sc, alpha: cl(sc * 2) });
  txt('Revisiting Agent Skill Retrieval', 540, 580, { font: 'Mono', size: 36, reveal: seg(t, 2.2, 3.4) });
  txt('at Marketplace Scale', 540, 630, { font: 'Mono', size: 36, reveal: seg(t, 3.0, 4.0) });
  for (let i = 0; i < 7; i++) { const a = eo3(seg(t, 1.5 + i * 0.25, 2.5 + i * 0.25)); const x = 150 + i * 130, y = 900 + Math.sin(t * 1.4 + i) * 14 - (1 - a) * 160;
    const grab = i === 0 && t > 5.2 ? eio(seg(t, 5.2, 6.4)) : 0;
    skill(lerp(x, 380, grab), lerp(y, 1150, grab), 150, 100, { rot: Math.sin(t + i) * 0.06 + (i - 3) * 0.03, alpha: a, hi: i === 0 && t > 6.0 ? 1 : 0, seed: 10 + i * 7 }); }
  const ax = lerp(-200, 260, eio(seg(t, 0.8, 4.0)));
  robot(ax, 1400 - (t < 4 ? hop(t, 0.35, 12) : 0), 17, { label: 'AGENT', eye: t > 6.0 ? 'happy' : 'open', up: eio(seg(t, 4.6, 5.4)) * (t < 6.8 ? 1 : 0.3), t });
}

// ---------- 2: 230,000+ ----------
export function s2(t, d) {
  bg('paper');
  const cols = 10, rows = 16, cx0 = -20 - Math.min(t, 6) * 5, cy0 = -20 - Math.min(t, 6) * 12;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const i = r * cols + c, a = eob(seg(t, 0.2 + hash(i) * 2.2, 0.9 + hash(i) * 2.2));
    skill(cx0 + c * 125 + (r % 2) * 40, cy0 + r * 125, 112, 80, { alpha: 0.9 * a, sc: a, rot: (hash(i + 9) - 0.5) * 0.12, seed: 20 + (i % 40) }); }
  const p = eob(seg(t, 1.2, 1.9));
  ctx.save(); ctx.translate(540, 760); ctx.scale(p, p);
  panel(0, 0, 900, 380, { seed: 830 });
  const n = Math.floor(230000 * eo3(seg(t, 1.5, 3.9)));
  txt(fmt(n) + (n >= 230000 ? '+' : ''), 0, 40, { font: 'Mono', size: 120, col: C.ink });
  txt('open-source skills', 0, 140, { font: 'Brush', size: 72, col: C.red });
  ctx.restore();
}

// ---------- 3: selection is the bottleneck ----------
export function s3(t, d) {
  bg('paper');
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { const i = r * 5 + c, a = eo3(seg(t, 0.1 + i * 0.03, 0.7 + i * 0.03));
    skill(170 + c * 185, 200 + r * 120, 150, 98, { alpha: 0.85 * a, rot: (hash(i) - 0.5) * 0.1, seed: 40 + i }); }
  robot(540, 1400, 17, { eye: 'sad', rot: Math.sin(t * 2) * 0.03, label: 'AGENT', t });
  for (let i = 0; i < 3; i++) { const a = eob(seg(t, 0.8 + i * 0.35, 1.3 + i * 0.35)); txt('?', 410 + i * 130, 1120 - Math.abs(Math.sin(t * 2 + i)) * 24 - (i === 1 ? 40 : 0), { font: 'Marker', size: 100, col: C.red, sc: a, rot: -0.2 + i * 0.2 }); }
  const w1 = tw('Writing a skill', 'Brush', 80);
  txt('Writing a skill', 540, 770, { font: 'Brush', size: 80, alpha: eo3(seg(t, 1.6, 2.2)) });
  scribble(540 - w1 / 2, 540 + w1 / 2, 752, eio(seg(t, 2.3, 2.9)), C.red, 9, 6);
  marker(540 - 380, 540 + 380, 885, 90, eio(seg(t, 3.5, 4.4)), C.green, 0.5);
  txt('Choosing the right one', 540, 905, { font: 'Brush', size: 84, alpha: eo3(seg(t, 3.4, 4.0)) });
}

// ---------- 4: the LLM loop and its cost ----------
export function s4(t, d) {
  bg('paper');
  txt('The LLM loop', 540, 250, { font: 'Marker', size: 90, alpha: eo3(seg(t, 0.1, 0.7)) });
  const cx = 540, cy = 640, R = 250, nodes = [['search', -90], ['LLM refines', 30], ['search again', 150]];
  const pos = nodes.map(([, a]) => [cx + Math.cos(a * Math.PI / 180) * R, cy + Math.sin(a * Math.PI / 180) * R]);
  const appear = eo3(seg(t, 0.3, 1.2));
  for (let i = 0; i < 3; i++) { const a0 = nodes[i][1] + 24, a1 = nodes[(i + 1) % 3][1] + (i === 2 ? 360 : 0) - 24, pts = [];
    for (let k = 0; k <= 12 * appear; k++) { const a = (lerp(a0, a1, k / 12)) * Math.PI / 180; pts.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]); }
    if (pts.length > 1) stroke(pts, { lw: 6, col: C.ink, seed: 60 + i, amp: 1 }); }
  nodes.forEach(([label], i) => { ctx.save(); A(appear); panel(pos[i][0], pos[i][1], 290, 96, { fill: i === 1 ? C.red : C.paper, seed: 840 + i }); txt(label, pos[i][0], pos[i][1] + 13, { font: 'Mono', size: 34, col: i === 1 ? C.paper : C.ink }); done(); ctx.restore(); });
  const ph = ((t - 1.3) * 0.28) % 1, ang = (-90 + 360 * Math.max(0, ph)) * Math.PI / 180;
  if (t > 1.3) circle(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R, 16, { fill: C.green, col: C.ink, lw: 4 });
  const loops = t > 1.3 ? Math.min(10, 1 + Math.floor((t - 1.3) * 0.28 * 3)) : 0;
  txt('cost per task', 540, 1060, { font: 'Brush', size: 76, col: C.red, alpha: eo3(seg(t, 1.2, 1.9)) });
  for (let k = 0; k < loops; k++) { const a = eob(seg(t, 1.3 + k / (0.28 * 3), 1.3 + k / (0.28 * 3) + 0.4)); const x = 110 + k * 95;
    ctx.save(); ctx.translate(x, 1170 + (k % 2 ? 10 : -10)); ctx.scale(a, a); circle(0, 0, 54, { fill: C.red, col: C.ink, lw: 5, seed: 90 + k }); txt('$', 0, 18, { font: 'Mono', size: 52, col: C.paper }); ctx.restore(); }
  txt('Every task pays.', 540, 1330, { font: 'Brush', size: 70, alpha: eo3(seg(t, 4.3, 5.0)) });
}

// ---------- 5: SkillSeek two-stage retrieval (top to bottom) ----------
export function s5(t, d) {
  bg('paper');
  for (let i = 0; i < 14; i++) skill(540 + (hash(i) - 0.5) * 520, 300 + (hash(i + 3) - 0.5) * 120, 130, 86, { alpha: eo3(seg(t, 0.1 + i * 0.04, 0.6 + i * 0.04)) * (t > 3.6 ? 0.5 : 1), rot: (hash(i + 1) - 0.5) * 0.4, seed: 100 + i });
  const f1 = eob(seg(t, 0.8, 1.5));
  ctx.save(); ctx.translate(540, 620); ctx.scale(f1, f1);
  poly([[-150, -190], [150, -190], [150, -150], [30, 40], [30, 190], [-30, 190], [-30, 40], [-150, -150]], { fill: C.paper, col: C.ink, lw: 6, seed: 860 });
  hatch(-140, -180, 280, 40, { col: C.ink, gap: 12, alpha: 0.5 });
  ctx.restore();
  txt('bi-encoder', 830, 540, { font: 'Mono', size: 38, alpha: f1 });
  txt('fast shortlist', 540, 872, { font: 'Brush', size: 54, col: C.green, alpha: eo3(seg(t, 2.4, 3.0)) });
  for (let i = 0; i < 10; i++) { const t0 = 2.6 + i * 0.22, p = seg(t, t0, t0 + 1.4); if (p <= 0) continue;
    if (i < 5) { const sx = 340 + i * 100, x = p < 0.5 ? lerp(540 + (i - 2) * 60, 540, eio(p * 2)) : lerp(540, sx, eio((p - 0.5) * 2)), y = p < 0.5 ? lerp(330, 500, p * 2) : lerp(500, 950, eio((p - 0.5) * 2));
      skill(x, y, 110, 74, { sc: 0.9, seed: 130 + i }); }
    else { const x = lerp(540 + (i - 7) * 60, 540 + (i - 7) * 20, eio(Math.min(1, p * 1.4))), y = lerp(330, 560, Math.min(1, p * 1.2)) + Math.max(0, p - 0.55) * 900; skill(x, y, 100, 68, { sc: 0.9, rot: p * 3, alpha: 1 - seg(p, 0.6, 1), seed: 140 + i }); } }
  const f2 = eob(seg(t, 5.0, 5.8));
  ctx.save(); ctx.translate(540, 1130); ctx.scale(f2, f2); panel(0, 0, 640, 140, { seed: 870 });
  txt('cross-encoder', -130, 14, { font: 'Mono', size: 38 }); txt('re-rank', 190, 18, { font: 'Brush', size: 60, col: C.green }); ctx.restore();
  if (f2 > 0.5) arrow(540, 1010, 540, 1050, C.ink, 6, eo3(seg(t, 5.2, 5.7)));
  for (let k = 0; k < 3; k++) { const a = eob(seg(t, 6.2 + k * 0.3, 6.8 + k * 0.3));
    skill(300 + k * 240, 1340, 200, 120, { sc: a, hi: k === 0 ? 1 : 0, seed: 160 + k }); txt('#' + (k + 1), 300 + k * 240, 1250, { font: 'Marker', size: 54, col: k === 0 ? C.green : C.ink, alpha: a }); }
  if (t > 5.9) arrow(540, 1205, 540, 1240, C.ink, 6, eo3(seg(t, 5.9, 6.3)));
}

// ---------- 6: parity on SkillsBench ----------
export function s6(t, d) {
  bg('paper');
  txt('SkillsBench', 540, 360, { font: 'Marker', size: 120, alpha: eo3(seg(t, 0.2, 0.8)) });
  txt('89 tasks', 540, 450, { font: 'Mono', size: 54, col: C.red, alpha: eo3(seg(t, 0.5, 1.1)) });
  const rows = [['LLM-mediated', 640, C.red, 1.4], ['SkillSeek', 900, C.green, 3.2]];
  for (const [lab, y, col, t0] of rows) { const g = eio(seg(t, t0, t0 + 1.4));
    txt(lab, 100, y, { font: 'Brush', size: 68, align: 'left', alpha: eo3(seg(t, t0 - 0.3, t0 + 0.3)) });
    if (g > 0) { rectS(100, y + 30, 880 * g, 110, { fill: col, col: C.ink, lw: 6, seed: 880 + y }); hatch(100, y + 30, 880 * g, 110, { col: C.paper, alpha: 0.35, gap: 18, seed: 400 + y }); } }
  const e = eob(seg(t, 4.8, 5.5)); ctx.save(); ctx.translate(540, 1200); ctx.scale(e, e);
  line(-70, -22, 70, -22, { col: C.green, lw: 18, wob: 1 }); line(-70, 22, 70, 22, { col: C.green, lw: 18, wob: 1 }); txt('parity', 0, 130, { font: 'Brush', size: 80, col: C.green }); ctx.restore();
}

// ---------- 7: BM25 alone ----------
export function s7(t, d) {
  bg('paper');
  const p = eob(seg(t, 0.3, 1.1));
  ctx.save(); ctx.translate(540, 380); ctx.scale(p, p); panel(0, 0, 640, 320, { seed: 890 });
  txt('BM25', 0, 20, { font: 'Mono', size: 150 }); txt('plain keyword search', 0, 105, { font: 'Brush', size: 56, col: C.red }); ctx.restore();
  const tiles = [3.0, 3.7, 4.4, 5.1];
  for (let k = 0; k < 4; k++) { const x = 400 + (k % 2) * 280, y = 780 + Math.floor(k / 2) * 290, a = eob(seg(t, 2.2 + k * 0.15, 2.8 + k * 0.15)), ok = k < 3;
    ctx.save(); ctx.translate(x, y); ctx.scale(a, a); panel(0, 0, 230, 230, { seed: 900 + k }); txt('setting ' + (k + 1), 0, -135, { font: 'Mono', size: 30 }); ctx.restore();
    const cp = seg(t, tiles[k], tiles[k] + 0.5);
    if (ok) check(x, y + 10, 110, C.green, cp); else if (cp > 0) line(x - 45, y + 10, x - 45 + 90 * cp, y + 10, { col: C.ink, lw: 16, wob: 0.5, alpha: 0.5 }); }
  marker(540 - 400, 540 + 400, 1340, 100, eio(seg(t, 3.2, 4.4)), C.green, 0.5);
  txt('matches in 3 of 4 settings', 540, 1362, { font: 'Brush', size: 78, alpha: eo3(seg(t, 3.0, 3.8)) });
}

// ---------- 8: cost per trial ----------
export function s8(t, d) {
  bg('paper');
  const base = 1180, k = 620 / 51.3;
  const bars = [['LLM-mediated', 51.3, C.red, 0.8, 220], ['SkillSeek', 27.54, C.green, 3.2, 540], ['No skills', 27, null, 5.6, 860]];
  txt('cost per trial', 540, 330, { font: 'Brush', size: 100, alpha: eo3(seg(t, 0.2, 0.8)) });
  line(90, base, 990, base, { col: C.ink, lw: 6, wob: 1 });
  for (const [lab, val, col, t0, x] of bars) { const g = eio(seg(t, t0, t0 + 1.2)), h = val * k * g;
    txt(lab, x, base + 62, { font: 'Brush', size: 42, alpha: eo3(seg(t, t0 - 0.2, t0 + 0.3)) });
    if (g > 0) { if (col) { rectS(x - 100, base - h, 200, h, { fill: col, col: C.ink, lw: 6, seed: 910 + x }); hatch(x - 100, base - h, 200, h, { col: C.paper, alpha: 0.3, gap: 20, seed: 500 + x }); }
      else { rectS(x - 100, base - h, 200, h, { fill: null, col: C.ink, lw: 5, seed: 913 }); hatch(x - 100, base - h, 200, h, { col: C.ink, alpha: 0.35, gap: 20, seed: 520 }); }
      const shown = (val * g).toFixed(2); txt(col ? '$' + shown : '~$27', x, base - h - 24, { font: 'Mono', size: 46 }); } }
  if (t > 5.0) { const a = eio(seg(t, 5.0, 5.8)); line(90, base - 27 * k, 90 + 900 * a, base - 27 * k, { col: C.red, lw: 4, wob: 0.5, alpha: 0.7 }); }
}

// ---------- 9: takeaway ----------
export function s9(t, d) {
  bg('ink');
  txt('Takeaway', 540, 330, { font: 'Marker', size: 120, col: C.red, alpha: eo3(seg(t, 0.2, 0.8)) });
  const a = eob(seg(t, 0.9, 1.6)); ctx.save(); ctx.translate(540, 620); ctx.scale(a, a);
  rrect(-350, -95, 700, 190, 18, { fill: C.green, col: C.paper, lw: 6, seed: 920 }); txt('Retrieval first', 0, 24, { font: 'Brush', size: 90, col: C.paper }); ctx.restore();
  arrow(540, 740, 540, 860, C.paper, 8, eo3(seg(t, 1.8, 2.4)));
  const b = eob(seg(t, 2.4, 3.0)); ctx.save(); ctx.translate(540, 980); ctx.scale(b, b);
  rrect(-300, -85, 600, 170, 18, { fill: C.paper, col: C.paper, lw: 6, seed: 921 }); txt('Skill picked', 0, 22, { font: 'Brush', size: 80, col: C.ink }); ctx.restore();
  check(900, 980, 100, C.green, eio(seg(t, 3.0, 3.6)));
  const dp = eo3(seg(t, 3.4, 4.2)); if (dp > 0) line(250, 725, 250, 725 + 465 * dp, { col: C.paper, lw: 6, wob: 1, alpha: 0.8 });
  if (t > 4.0) { const c = eob(seg(t, 4.0, 4.6)); ctx.save(); ctx.translate(540, 1270); ctx.scale(c, c);
    rrect(-380, -75, 760, 150, 18, { fill: C.red, col: C.paper, lw: 6, seed: 922 }); txt('LLM, if it falls short', 0, 22, { font: 'Brush', size: 66, col: C.paper }); ctx.restore(); }
}

// ---------- 10: end card ----------
export function s10(t, d) {
  bg('paper');
  const sc = eob(seg(t, 0.2, 1.0));
  marker(200, 880, 552, 56, eio(seg(t, 0.8, 1.8)), C.green, 0.5);
  txt('SkillSeek', 540, 520, { font: 'Marker', size: 180, sc, alpha: cl(sc * 2) });
  txt('arXiv 2609.38822', 540, 660, { font: 'Mono', size: 56, alpha: eo3(seg(t, 1.0, 1.6)) });
  txt('Guanqun Yang · Wenlong Zhang', 540, 740, { font: 'Mono', size: 30, alpha: eo3(seg(t, 1.3, 1.9)) * 0.8 });
  txt('Tian Shi · Ping Wang', 540, 785, { font: 'Mono', size: 30, alpha: eo3(seg(t, 1.3, 1.9)) * 0.8 });
  txt('hemanthvasi', 540, 1010, { font: 'Brush', size: 150, rot: -0.03, reveal: eo3(seg(t, 1.6, 2.6)), shadow: { col: C.red, dx: 5, dy: 5 } });
  [['YouTube', '@hemanth_with_ai'], ['Instagram', '@hemanth.with.ai'], ['Threads', '@hemanth.with.ai']].forEach(([k, v], r) => {
    const a = eo3(seg(t, 2.3 + r * 0.25, 2.9 + r * 0.25)), y = 1120 + r * 70;
    txt(k, 250, y, { font: 'Mono', size: 34, align: 'left', alpha: a * 0.65 });
    txt(v, 500, y, { font: 'Mono', size: 40, align: 'left', alpha: a });
  });
  robot(540, 1640, 13, { eye: 'happy', up: Math.abs(Math.sin(t * 5)) * seg(t, 2.6, 3), t });
}
