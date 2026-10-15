// Bespoke blueprint scenes for "DeepSWE" (arXiv 2607.07946), v2 rebuild.
// Drawn with the blueprint style's helpers (prussian-blue sheet, white linework, amber accents). Every word and
// number drawn comes from `d`; drawings add no numbers or claims. Data marks (bars) stay neutral white; amber is used
// for headline values and decoration. Pure functions of (t, d, dur): no module state, no randomness.
import { ctx, P, drawBg, line, rect, path, hatchRect, leader, dim, text, layout, measure, robot, cl, eo3, seg } from '../../engine/styles/blueprint-lib.mjs';
import { lerp, eio, eob, ei3 } from '../../engine/core.mjs';
import { popIn, slam, jolt, wiggle, typeOn, pulse } from '../../engine/motion.mjs';

const eb = (p) => (p <= 0 ? 0 : eob(p));
// camera snaps (0.16 s each) with the sheet drawn inside the transform, so a zoom moves the whole grid
function cam(t, keys, init = [1, 540, 800]) {
  let [z, cx, cy] = init;
  for (const [t0, z1, x1, y1] of keys) { const p = eo3(seg(t, t0, t0 + 0.16)); if (p <= 0) break; z = lerp(z, z1, p); cx = lerp(cx, x1, p); cy = lerp(cy, y1, p); }
  ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy);
}
const fitS = (s, font, size, maxW) => Math.min(size, size * maxW / measure(s, font, size));
function fillR(x, y, w, h, fill, alpha = 1) { ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); ctx.restore(); }
// solid plate with a white outline; text centred
function plate(cx, cy, s, { font = 'Mono', size = 40, fill = P.white, tcol = P.deep, col = P.white, sc = 1, alpha = 1, rot = 0, pad = 26, maxW = 900 } = {}) {
  const fs = fitS(s, font, size, maxW - pad * 2), w = measure(s, font, fs) + pad * 2, h = fs * 1.6;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc);
  fillR(-w / 2 + 8, -h / 2 + 8, w, h, '#020c18', 0.6 * alpha);
  fillR(-w / 2, -h / 2, w, h, fill, alpha);
  rect(-w / 2, -h / 2, w, h, { col, lw: 3, noGhost: true, wob: 0.5 });
  text(s, 0, fs * 0.35, { font, size: fs, col: tcol, align: 'center', alpha });
  ctx.restore(); return w;
}
function slamPlate(t, t0, cx, cy, s, o = {}) { const k = slam(t, t0, { d: 0.14, from: 1.9, amp: 0 }); if (k.alpha > 0) plate(cx, cy, s, { ...o, sc: k.sc * (o.sc || 1), alpha: k.alpha }); }
// opaque stamp: deep fill, double border, Marker letters
function stampB(cx, cy, s, { col = P.coral, size = 130, sc = 1, alpha = 1, rot = -0.1, maxW = 860 } = {}) {
  const fs = fitS(s, 'Marker', size, maxW - 80), w = measure(s, 'Marker', fs) + 80, h = fs * 1.4;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc);
  fillR(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12, P.deep, alpha);
  ctx.strokeStyle = col; ctx.lineWidth = 10; ctx.strokeRect(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12);
  ctx.lineWidth = 4; ctx.strokeRect(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20);
  text(s, 0, fs * 0.36, { font: 'Marker', size: fs, col, align: 'center', alpha });
  ctx.restore();
}
// sparks (amber crosses) bursting from a point, 0.8 s
function sparks(cx, cy, t0, t, n = 10, r = 260, col = P.amber) {
  const p = (t - t0) / 0.8; if (p < 0 || p > 1) return;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + i * 0.4, d = r * eo3(p) * (0.6 + 0.4 * ((i * 37) % 10) / 10), x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, s = 16 * (1 - p) + 3;
    line(x - s, y, x + s, y, { col, lw: 4, noGhost: true }); line(x, y - s, x, y + s, { col, lw: 4, noGhost: true }); }
}
// semicircle gauge, centre (cx,cy), radius r, value v in 0..1 drawn as a filled amber band and a needle
function gauge(cx, cy, r, v, { ticks = 1, alpha = 1 } = {}) {
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.lineCap = 'butt'; ctx.lineWidth = 70; ctx.strokeStyle = '#123d66'; ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 2 * Math.PI); ctx.stroke();
  if (v > 0) { ctx.strokeStyle = P.amber; ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, Math.PI + Math.PI * cl(v)); ctx.stroke(); }
  ctx.restore();
  const pts = []; for (let i = 0; i <= 40; i++) { const a = Math.PI + Math.PI * i / 40; pts.push([cx + Math.cos(a) * (r + 40), cy + Math.sin(a) * (r + 40)]); }
  path(pts, { col: P.white, lw: 3, p: ticks, alpha }); const pi = []; for (let i = 0; i <= 40; i++) { const a = Math.PI + Math.PI * i / 40; pi.push([cx + Math.cos(a) * (r - 40), cy + Math.sin(a) * (r - 40)]); }
  path(pi, { col: P.white, lw: 3, p: ticks, alpha });
  for (let k = 0; k <= 10; k++) { const a = Math.PI + Math.PI * k / 10, L = k % 5 ? 18 : 34; if (k / 10 <= ticks) line(cx + Math.cos(a) * (r + 40), cy + Math.sin(a) * (r + 40), cx + Math.cos(a) * (r + 40 + L), cy + Math.sin(a) * (r + 40 + L), { col: P.cyan, lw: 3, noGhost: true, alpha }); }
  const a = Math.PI + Math.PI * cl(v);
  line(cx, cy, cx + Math.cos(a) * (r - 10), cy + Math.sin(a) * (r - 10), { col: P.white, lw: 10, noGhost: true, alpha });
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = P.white; ctx.beginPath(); ctx.arc(cx, cy, 26, 0, 7); ctx.fill(); ctx.fillStyle = P.amber; ctx.beginPath(); ctx.arc(cx, cy, 11, 0, 7); ctx.fill(); ctx.restore();
}
const pct = (s) => (parseFloat(String(s)) || 0) / 100;
// a white sheet of paper with ink rows
function sheet(cx, cy, w, h, { rows = 5, sc = 1, rot = 0, alpha = 1, fill = P.white } = {}) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc);
  fillR(-w / 2 + 8, -h / 2 + 8, w, h, '#020c18', 0.6); fillR(-w / 2, -h / 2, w, h, fill);
  for (let r = 0; r < rows; r++) fillR(-w / 2 + 24, -h / 2 + 30 + r * (h - 50) / rows, (w - 48) * (0.55 + 0.4 * ((r * 37) % 10) / 10), 12, P.faint);
  ctx.restore();
}

// =====================================================================================================
// s1 gauge: the board's best pass@1 sweeps onto a big gauge; 74% slams in; a pencil drafts task sheets.
// =====================================================================================================
const G = { cx: 540, cy: 900, r: 340 };
export function gauge_(t, d, dur, { still = false } = {}) {
  const k = dur / 6.894, T = (x) => x * k;
  const tTitle = 0.05, tSweep = 0.35, tVal = 0.18 * dur - 0.1, tLbl = T(1.7), tZoom = T(2.3), tBack = T(3.6), tSheets = [3.9, 4.35, 4.8].map(T), tScratch = T(4.4), tRob = T(0.25);
  const v = pct(d.value) * eio(seg(t, tSweep, tVal + 0.1));
  ctx.save();
  if (!still) { cam(t, [[tZoom, 1.14, 540, 980], [tBack, 1.0, 540, 800], [T(5.6), 1.06, 700, 1150]]); drawBg(); }
  const [jx, jy] = jolt(t, [tVal + 0.14], 14, 0.3); ctx.translate(jx, jy);
  const ts = slam(t, tTitle, { d: 0.14, from: 1.8, amp: 0 });
  if (ts.alpha > 0) { ctx.save(); ctx.translate(540, 300); ctx.scale(ts.sc, ts.sc); text(d.title, 0, 50, { font: 'Marker', size: 150, col: P.white, align: 'center', alpha: ts.alpha }); ctx.restore(); }
  dim(140, 380, 940, 380, { p: eo3(seg(t, 0.2, 0.7)), col: P.cyan });
  gauge(G.cx, G.cy, G.r, v, { ticks: eo3(seg(t, 0.1, 0.6)) });
  const vs = slam(t, tVal, { d: 0.14, from: 2.2, amp: 0 });
  if (vs.alpha > 0) { if (t > tVal + 0.14) sparks(G.cx, G.cy + 120, tVal + 0.14, t, 12, 380);
    ctx.save(); ctx.translate(G.cx, G.cy + 170); ctx.scale(vs.sc * pulse(t, T(5.2), 0.06, 0.3), vs.sc * pulse(t, T(5.2), 0.06, 0.3)); text(d.value, 0, 80, { font: 'Marker', size: 230, col: P.amber, align: 'center', alpha: vs.alpha }); ctx.restore(); }
  const lp = eo3(seg(t, tLbl, tLbl + 0.3)); if (lp > 0) { text(d.label, 540, 1210, { font: 'Mono', size: 40, col: P.white, align: 'center', reveal: lp }); }
  slamPlate(t, tLbl + 0.35, 540, 1270, d.src, { font: 'Mono', size: 36, fill: P.amber, tcol: P.deep, rot: -0.02 });
  // task sheets drafted at the lower right
  if (d.scratch) slamPlate(t, tScratch, 560, 1370, d.scratch, { font: 'Brush', size: 44, fill: P.deep, tcol: P.amber, col: P.amber, rot: 0.03 });
  robot(150, 1440, 7, { t, p: eo3(seg(t, tRob, tRob + 0.6)), wave: t > tVal ? 1 : 0, look: 1 });
  ctx.restore();
}

// =====================================================================================================
// s2 recipe: a merged GitHub fix; an eye wonders if it was seen in pretraining; the shipped tests are a lock cut
// for one key; another working fix (a different key) is rejected.
// =====================================================================================================
export function recipe(t, d, dur) {
  const k = dur / 7.406, T = (x) => x * k;
  const tCard = 0.05, tEye = T(2.3), tLock = T(3.4), tKeyA = T(3.9), tKeyB = T(4.7), tNo = 0.72 * dur - 0.12;
  ctx.save();
  cam(t, [[T(1.1), 1.12, 360, 520], [tEye, 1.0, 540, 800], [tLock, 1.1, 620, 980], [tNo + 0.05, 1.0, 540, 800]]);
  drawBg();
  const [jx, jy] = jolt(t, [tCard + 0.2, tNo + 0.14], 12, 0.3); ctx.translate(jx, jy);
  // merged fix card
  const cp = eb(seg(t, tCard, tCard + 0.35));
  if (cp > 0) { ctx.save(); ctx.translate(lerp(-400, 330, cl(cp)), 500);
    fillR(-230 + 10, -170 + 10, 460, 340, '#020c18', 0.6); fillR(-230, -170, 460, 340, P.white);
    // merge glyph
    ctx.strokeStyle = P.deep; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(-150, 110); ctx.lineTo(-150, -110); ctx.moveTo(-150, -20); ctx.quadraticCurveTo(-150, 30, -70, 50); ctx.stroke();
    for (const [x, y] of [[-150, -110], [-150, 110], [-70, 50]]) { ctx.fillStyle = P.amber; ctx.beginPath(); ctx.arc(x, y, 22, 0, 7); ctx.fill(); ctx.stroke(); }
    text(d.pr, 70, 20, { font: 'Marker', size: fitS(d.pr, 'Marker', 66, 260), col: P.deep, align: 'center' });
    ctx.restore(); }
  // eye + question (seen in pretraining?)
  const ep = eb(seg(t, tEye, tEye + 0.3));
  if (ep > 0) {
    ctx.save(); ctx.translate(800, 480); ctx.scale(ep, ep);
    ctx.fillStyle = P.white; ctx.beginPath(); ctx.ellipse(0, 0, 130, 75, 0, 0, 7); ctx.fill();
    ctx.fillStyle = P.deep; ctx.beginPath(); ctx.arc(-20 + 30 * Math.sin(t * 2), 0, 46, 0, 7); ctx.fill(); ctx.fillStyle = P.amber; ctx.beginPath(); ctx.arc(-20 + 30 * Math.sin(t * 2), 0, 16, 0, 7); ctx.fill();
    ctx.restore();
    line(670, 480, 570, 500, { col: P.amber, lw: 4, dash: [14, 10], p: eo3(seg(t, tEye + 0.2, tEye + 0.5)) });
    slamPlate(t, tEye + 0.3, 800, 640, d.seen, { font: 'Brush', size: 48, fill: P.deep, tcol: P.amber, col: P.amber, rot: 0.03, maxW: 520 });
  }
  // lock: the shipped tests, cut for one key
  const lp = eb(seg(t, tLock, tLock + 0.3));
  if (lp > 0) {
    ctx.save(); ctx.translate(700, 1000); ctx.scale(lp, lp);
    ctx.strokeStyle = P.white; ctx.lineWidth = 22; ctx.beginPath(); ctx.arc(0, -120, 90, Math.PI, 2 * Math.PI); ctx.stroke();
    fillR(-150, -120, 300, 240, P.white); rect(-150, -120, 300, 240, { col: P.cyan, lw: 4, noGhost: true });
    // keyhole shaped like key A: a square notch
    fillR(-22, -40, 44, 44, P.deep); fillR(-10, 0, 20, 70, P.deep);
    text(d.test, 0, 175, { font: 'Mono', size: 38, col: P.white, align: 'center' });
    ctx.restore();
  }
  // key A (the original fix) slides in and fits; then backs out
  const ka = seg(t, tKeyA, tKeyA + 0.4), kaOut = seg(t, tKeyB - 0.3, tKeyB);
  if (ka > 0 && kaOut < 1) { const x = lerp(200, 540, eio(ka)) - 500 * ei3(kaOut); keyShape(x, 980, 'sq', P.amber, 1 - kaOut); }
  // key B (another working fix, different shape) jams and is rejected
  const kb = seg(t, tKeyB, tKeyB + 0.4);
  if (kb > 0) { const jam = t > tNo ? Math.sin(t * 40) * 8 * (1 - seg(t, tNo, tNo + 0.5)) : 0; keyShape(lerp(150, 470, eio(kb)) + jam, 980, 'tri', P.cyan, 1);
    if (kb > 0.5) text(d.alt, 300, 1150, { font: 'Brush', size: 50, col: P.cyan, align: 'center', alpha: cl((kb - 0.5) * 3) }); }
  const ns = slam(t, tNo, { d: 0.14, from: 2.3, amp: 0 });
  if (ns.alpha > 0) { if (t > tNo + 0.14) sparks(600, 1320, tNo + 0.14, t, 10, 300, P.coral); stampB(600, 1340, d.no, { size: 110, sc: ns.sc, alpha: ns.alpha, rot: -0.08 }); }
  ctx.restore();
}
function keyShape(x, y, kind, col, alpha) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.fillStyle = col;
  ctx.beginPath(); ctx.arc(-170, 0, 60, 0, 7); ctx.fill(); ctx.fillStyle = P.deep; ctx.beginPath(); ctx.arc(-170, 0, 22, 0, 7); ctx.fill(); ctx.fillStyle = col;
  ctx.fillRect(-120, -16, 240, 32);
  if (kind === 'sq') { ctx.fillRect(60, 16, 40, 44); ctx.fillRect(140, 16, 30, 30); }
  else { ctx.beginPath(); ctx.moveTo(50, 16); ctx.lineTo(100, 80); ctx.lineTo(120, 16); ctx.fill(); ctx.beginPath(); ctx.moveTo(140, 16); ctx.lineTo(170, 60); ctx.lineTo(190, 16); ctx.fill(); }
  ctx.restore();
}

// =====================================================================================================
// s3 build: repo boxes pop across the sheet; 113 slams; the note plate; five language tags drop in.
// =====================================================================================================
export function build(t, d, dur) {
  const k = dur / 6.787, T = (x) => x * k;
  const tVal = 0.25 * dur - 0.1, tNote = T(2.6), tLang = d.langs.map((_, i) => T(3.5) + i * 0.32);
  ctx.save();
  cam(t, [[T(1.0), 1.06, 540, 700], [tVal + 0.1, 1.12, 540, 560], [tNote + 0.05, 1.0, 540, 800], [T(5.4), 1.08, 540, 1150]]);
  drawBg();
  const [jx, jy] = jolt(t, [tVal + 0.14], 14, 0.3); ctx.translate(jx, jy);
  // repo boxes (illustrative grid, no count implied)
  for (let i = 0; i < 18; i++) {
    const p = eb(seg(t, 0.05 + i * 0.06, 0.35 + i * 0.06)); if (p <= 0) continue;
    const cx = 150 + (i % 6) * 156, cy = 250 + Math.floor(i / 6) * 110 + (i % 2) * 10;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(p, p); fillR(-60, -38, 120, 76, '#1d5a8a'); rect(-60, -38, 120, 76, { col: P.cyan, lw: 3, noGhost: true }); fillR(-60, -38, 44, 14, P.cyan); ctx.restore();
  }
  const vs = slam(t, tVal, { d: 0.14, from: 2.4, amp: 0 });
  if (vs.alpha > 0) { if (t > tVal + 0.14) sparks(540, 620, tVal + 0.14, t, 12, 400);
    fillR(170, 470, 740, 300, P.deep, vs.alpha * 0.85);
    ctx.save(); ctx.translate(540, 640); ctx.scale(vs.sc, vs.sc); text(d.value, 0, 90, { font: 'Marker', size: 280, col: P.amber, align: 'center', alpha: vs.alpha }); ctx.restore();
    text(d.label, 540, 840, { font: 'Brush', size: 72, col: P.white, align: 'center', alpha: cl((t - tVal - 0.1) * 4) }); }
  slamPlate(t, tNote, 540, 950, d.note, { font: 'Mono', size: 34, fill: P.white, tcol: P.deep, rot: -0.015, maxW: 900 });
  const POS = [[290, 1110], [660, 1110], [210, 1260], [520, 1270], [800, 1260]];
  d.langs.forEach((l, i) => slamPlate(t, tLang[i], POS[i][0], POS[i][1], l, { font: 'Marker', size: 58, fill: i % 2 ? P.amber : P.white, tcol: P.deep, rot: (i % 3 - 1) * 0.05, maxW: 360 }));
  robot(150, 1440, 7, { t, p: 1, look: 1, wave: t > tLang[4] ? 1 : 0 });
  ctx.restore();
}

// =====================================================================================================
// s4 anatomy: an exploded view of one task: prompt sheet, repo pinned at the base commit, git history crossed out
// (shallow clone), and the single bash tool shared by every agent.
// =====================================================================================================
export function anatomy(t, d, dur) {
  const k = dur / 6.766, T = (x) => x * k;
  const tCrate = 0.05, tPrompt = T(0.55), tRepo = T(1.5), tGit = T(2.5), tX = T(3.0), tTool = T(4.0), tBots = T(4.8);
  ctx.save();
  cam(t, [[T(1.1), 1.1, 330, 500], [tRepo + 0.1, 1.08, 700, 600], [tX + 0.1, 1.1, 700, 820], [tTool, 1.0, 540, 800], [T(5.7), 1.08, 540, 1200]]);
  drawBg();
  const [jx, jy] = jolt(t, [tX + 0.12, tTool + 0.2], 12, 0.3); ctx.translate(jx, jy);
  // central task crate (drawn as an exploded-view frame)
  const cr = eb(seg(t, tCrate, tCrate + 0.3));
  if (cr > 0) { ctx.save(); ctx.translate(540, 800); ctx.scale(cr, cr); rect(-130, -90, 260, 180, { col: P.white, lw: 5, fill: '#123d66', fillAlpha: 1 }); hatchRect(-130, -90, 260, 180, { col: P.cyan, gap: 22, alpha: 0.4 }); ctx.restore();
    for (const [x, y] of [[330, 500], [760, 520], [760, 820]]) line(540, 800, x, y, { col: P.dim, lw: 2, dash: [10, 8], p: eo3(seg(t, tPrompt, tPrompt + 0.6)) }); }
  // prompt sheet (top left)
  const pp = eb(seg(t, tPrompt, tPrompt + 0.3));
  if (pp > 0) { sheet(lerp(540, 330, cl(pp)), lerp(800, 470, cl(pp)), 300, 220, { rows: 5, rot: -0.04 }); text(d.prompt, 330, 630, { font: 'Marker', size: 60, col: P.white, align: 'center', alpha: cl(pp) }); }
  // repo pinned at the base commit (top right)
  const rp = eb(seg(t, tRepo, tRepo + 0.3));
  if (rp > 0) { ctx.save(); ctx.translate(lerp(540, 760, cl(rp)), lerp(800, 480, cl(rp)));
    fillR(-150, -100, 300, 200, P.amber); rect(-150, -100, 300, 200, { col: P.white, lw: 4, noGhost: true }); fillR(-150, -100, 110, 30, P.white);
    // pin
    ctx.fillStyle = P.coral; ctx.beginPath(); ctx.arc(110, -100, 26, 0, 7); ctx.fill(); line(110, -76, 110, -30, { col: P.white, lw: 6, noGhost: true });
    text(d.repo, 0, 150, { font: 'Mono', size: 36, col: P.white, align: 'center' }); ctx.restore(); }
  // git history chain (right, below the repo): commit dots, then crossed out
  const gp = eo3(seg(t, tGit, tGit + 0.4));
  if (gp > 0) {
    for (let i = 0; i < 5; i++) { const x = 620 + i * 70; if (i / 5 > gp) break; line(x, 800, x + 70, 800, { col: P.white, lw: 5, noGhost: true }); ctx.fillStyle = P.white; ctx.beginPath(); ctx.arc(x, 800, 18, 0, 7); ctx.fill(); }
    text(d.git, 760, 760, { font: 'Mono', size: 34, col: P.cyan, align: 'center', alpha: gp });
    const xp = eo3(seg(t, tX, tX + 0.25));
    if (xp > 0) { line(600, 730, lerp(600, 960, xp), lerp(730, 870, xp), { col: P.coral, lw: 16, noGhost: true }); line(960, 730, lerp(960, 600, xp), lerp(730, 870, xp), { col: P.coral, lw: 16, noGhost: true }); }
    slamPlate(t, tX + 0.2, 780, 930, d.clone, { font: 'Mono', size: 40, fill: P.white, tcol: P.deep, rot: 0.03 });
  }
  // the single bash tool, shared by three identical agent rigs
  const tp = eb(seg(t, tTool, tTool + 0.35));
  if (tp > 0) { const y = lerp(1700, 1080, cl(tp));
    fillR(240, y - 60, 600, 120, '#020c18'); rect(240, y - 60, 600, 120, { col: P.amber, lw: 5, noGhost: true });
    text('$', 290, y + 22, { font: 'Mono', size: 64, col: P.amber }); text(d.tool, 350, y + 22, { font: 'Mono', size: 64, col: P.white });
    if (Math.floor(t * 2.5) % 2 === 0) fillR(350 + measure(d.tool, 'Mono', 64) + 12, y - 28, 30, 52, P.white); }
  [200, 540, 880].forEach((x, q) => { const p = eo3(seg(t, tBots + q * 0.15, tBots + q * 0.15 + 0.4)); if (p > 0) { robot(x - (q === 2 ? 60 : 0), 1420, 6.5, { t: t + q, p, look: q - 1 }); line(x - (q === 2 ? 60 : 0), 1290, 540, 1140, { col: P.amber, lw: 3, dash: [10, 8], p }); } });
  slamPlate(t, tBots + 0.5, 540, 1220, d.harness, { font: 'Mono', size: 36, fill: P.amber, tcol: P.deep, maxW: 820 });
  ctx.restore();
}

// =====================================================================================================
// s5 verifier: the verifier is a gauge block; two differently shaped working solutions both pass; a broken build is
// caught by the regression scan and fails.
// =====================================================================================================
export function verifier(t, d, dur) {
  const k = dur / 6.659, T = (x) => x * k;
  const tBox = 0.05, tA = T(1.0), tPassA = T(1.5), tB = T(2.1), tPassB = T(2.6), tC = T(3.6), tScan = T(4.4), tFail = 0.8 * dur - 0.12;
  const VX = 540, VY = 560;
  ctx.save();
  cam(t, [[T(0.6), 1.06, 540, 600], [tPassB + 0.1, 1.1, 540, 700], [tC, 1.0, 540, 800], [tFail + 0.05, 1.1, 540, 900]]);
  drawBg();
  const [jx, jy] = jolt(t, [tPassA + 0.12, tPassB + 0.12, tFail + 0.14], 12, 0.3); ctx.translate(jx, jy);
  // verifier block
  const bp = eb(seg(t, tBox, tBox + 0.3));
  if (bp > 0) { ctx.save(); ctx.translate(VX, VY); ctx.scale(bp, bp);
    fillR(-330, -180, 660, 360, P.white); rect(-330, -180, 660, 360, { col: P.cyan, lw: 5, noGhost: true });
    fillR(-140, 120, 280, 70, P.deep); // intake slot
    text(d.title, 0, -60, { font: 'Marker', size: 110, col: P.deep, align: 'center' });
    ctx.restore(); }
  // three solutions drop into the slot one by one
  const sol = (s0, kind, label, col) => {
    const p = seg(t, s0, s0 + 0.45), out = seg(t, s0 + 0.9, s0 + 1.2); if (p <= 0 || out >= 1) return;
    const y = lerp(1400, VY + 260, eio(p)) + 600 * ei3(out), x = VX;
    ctx.save(); ctx.translate(x, y); ctx.rotate(kind === 'gear' ? t * 2 : 0); ctx.fillStyle = col;
    if (kind === 'gear') { ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = i % 2 ? 70 : 95; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.fill(); ctx.fillStyle = P.deep; ctx.beginPath(); ctx.arc(0, 0, 26, 0, 7); ctx.fill(); }
    else if (kind === 'hex') { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; ctx.lineTo(Math.cos(a) * 95, Math.sin(a) * 95); } ctx.fill(); }
    else { ctx.fillRect(-90, -70, 180, 140); ctx.strokeStyle = P.deep; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-60, -70); ctx.lineTo(0, 0); ctx.lineTo(-30, 70); ctx.moveTo(0, 0); ctx.lineTo(70, -30); ctx.stroke(); }
    ctx.restore();
    text(label, x, y + 150, { font: 'Mono', size: 40, col: P.white, align: 'center', alpha: cl(p * 2) * (1 - out) });
  };
  sol(tA, 'gear', d.a, P.amber); sol(tB, 'hex', d.b, P.cyan); sol(tC, 'broken', d.c, '#7d97ad');
  // pass marks stack on the right of the block, fail on the left
  [[tPassA, 0], [tPassB, 1]].forEach(([s0, q]) => slamPlate(t, s0, 820, 860 + q * 110, d.pass, { font: 'Marker', size: 60, fill: P.amber, tcol: P.deep, rot: -0.04 }));
  // regression scan over the broken build
  const sp = seg(t, tScan, tScan + 0.6);
  if (sp > 0 && sp < 1) { const y = lerp(VY + 120, VY + 420, sp); fillR(300, y - 6, 480, 12, P.amber, 0.9); }
  if (t > tScan) text(d.reg, 540, 1250, { font: 'Mono', size: 40, col: P.amber, align: 'center', alpha: cl((t - tScan) * 3) });
  const fs = slam(t, tFail, { d: 0.14, from: 2.2, amp: 0 });
  if (fs.alpha > 0) { if (t > tFail + 0.14) sparks(300, 1000, tFail + 0.14, t, 10, 260, P.coral); stampB(280, 960, d.fail, { size: 110, sc: fs.sc, alpha: fs.alpha, rot: -0.1, maxW: 380 }); }
  robot(160, 1440, 7, { t, p: 1, look: 1, mood: t > tFail ? 'warn' : 'ok' });
  ctx.restore();
}

// =====================================================================================================
// s6 audit: a judge robot with a magnifier re-reads graded runs; two neutral bars for the disagreement rates
// (axis 0..40%), the source tag and the three caveats.
// =====================================================================================================
export function audit(t, d, dur) {
  const k = dur / 9.71, T = (x) => x * k;
  const tTitle = 0.05, tJudge = T(0.7), tBar = [T(3.4), T(7.1)], tSrc = T(4.6), tCav = [T(5.2), T(5.8), T(6.4)];
  const AX = 90, AW = 600, AMAX = 0.40, BY = [860, 1060];
  ctx.save();
  cam(t, [[T(1.8), 1.1, 540, 520], [tBar[0] - 0.1, 1.0, 540, 800], [T(4.9), 1.06, 540, 1150], [tBar[1] - 0.1, 1.0, 540, 800], [T(8.4), 1.08, 540, 1000]]);
  drawBg();
  const [jx, jy] = jolt(t, tBar.map((x) => x + 0.5), 12, 0.3); ctx.translate(jx, jy);
  const hp = eo3(seg(t, tTitle, tTitle + 0.5));
  text(d.title, AX, 250, { font: 'Brush', size: fitS(d.title, 'Brush', 74, 840), col: P.white, reveal: hp });
  dim(AX, 300, AX + AW, 300, { p: hp, col: P.cyan });
  // judge: robot with a magnifier over a stack of graded runs
  const jp = eb(seg(t, tJudge, tJudge + 0.35));
  if (jp > 0) {
    for (let i = 0; i < 4; i++) sheet(620 + i * 18, 520 - i * 16, 260, 150, { rows: 3, sc: jp, rot: -0.05 + i * 0.03 });
    const mx = 640 + 110 * Math.sin(t * 2.2), my = 500 + 30 * Math.cos(t * 3);
    ctx.save(); ctx.globalAlpha = cl(jp); ctx.strokeStyle = P.amber; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(mx, my, 70, 0, 7); ctx.stroke(); ctx.fillStyle = 'rgba(255,180,84,0.18)'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(mx + 50, my + 50); ctx.lineTo(mx + 130, my + 130); ctx.lineWidth = 20; ctx.stroke(); ctx.restore();
    robot(250, 690, 11, { t, p: cl(jp), look: 1 });
  }
  // axis
  const axp = eo3(seg(t, T(2.8), T(3.3)));
  line(AX, 1180, AX + 840, 1180, { col: P.cyan, lw: 2, p: axp, noGhost: true });
  // bars
  d.rows.forEach((r, q) => {
    const g = eo3(seg(t, tBar[q], tBar[q] + 0.5)); if (g <= 0) { if (axp > 0) text(r.label, AX, BY[q] - 30, { font: 'Mono', size: 40, col: P.white, alpha: axp }); return; }
    const w = Math.max(14, AW * cl(pct(r.value) / AMAX) * g);
    text(r.label, AX, BY[q] - 30, { font: 'Mono', size: 40, col: P.white });
    fillR(AX, BY[q], w, 90, P.white); rect(AX, BY[q], w, 90, { col: P.cyan, lw: 3, noGhost: true });
    const vs = slam(t, tBar[q] + 0.45, { d: 0.14, from: 1.9, amp: 0 });
    if (vs.alpha > 0) { ctx.save(); ctx.translate(AX + w + 30, BY[q] + 45); ctx.scale(vs.sc, vs.sc); text(r.value, 0, 38, { font: 'Marker', size: 110, col: P.amber, alpha: vs.alpha }); ctx.restore(); }
  });
  slamPlate(t, tSrc, 760, 370, d.src, { font: 'Mono', size: 34, fill: P.amber, tcol: P.deep, rot: 0.02 });
  d.caveats.forEach((c, i) => slamPlate(t, tCav[i], 500, 1250 + i * 68, c, { font: 'Mono', size: 34, fill: P.deep, tcol: P.white, col: P.cyan, rot: 0, sc: 1, maxW: 760 }));
  ctx.restore();
}

// =====================================================================================================
// s7 board: three agent setups, effort tags, neutral bars to the same pass@1; the shared value slams under a tie
// bracket; cost-per-task coin stacks of low / mid / high height (no figures).
// =====================================================================================================
export function board(t, d, dur) {
  const k = dur / 6.446, T = (x) => x * k;
  const tHead = 0.05, tRows = [T(0.6), T(0.95), T(1.3)], tVal = 0.55 * dur - 0.12, tCost = T(4.4), tOv = T(4.0);
  const AX = 90, AW = 840, RY = [560, 700, 840], H = { low: 2, mid: 4, high: 10 };
  ctx.save();
  cam(t, [[T(1.9), 1.08, 540, 700], [tVal + 0.05, 1.12, 540, 900], [tCost, 1.0, 540, 800], [T(5.5), 1.08, 540, 1200]]);
  drawBg();
  const [jx, jy] = jolt(t, [tVal + 0.14, ...tRows.map((x) => x + 0.4)], 10, 0.28); ctx.translate(jx, jy);
  slamPlate(t, tHead, 540, 240, d.title, { font: 'Marker', size: 72, fill: P.white, tcol: P.deep });
  const sp = eo3(seg(t, tHead + 0.3, tHead + 0.7));
  layout(d.src, 'Mono', 860, 30, 2).lines.forEach((l, i) => text(l, 540, 330 + i * 40, { font: 'Mono', size: 30, col: P.cyan, align: 'center', alpha: sp }));
  d.rows.forEach((r, q) => {
    const g = eo3(seg(t, tRows[q], tRows[q] + 0.45)); if (g <= 0) return;
    text(r.name, AX, RY[q] - 18, { font: 'Mono', size: 40, col: P.white });
    text(`[${r.tag}]`, AX + measure(r.name, 'Mono', 40) + 16, RY[q] - 18, { font: 'Mono', size: 34, col: P.cyan });
    const w = AW * pct(d.value) * g; fillR(AX, RY[q], w, 70, P.white); rect(AX, RY[q], w, 70, { col: P.cyan, lw: 3, noGhost: true });
  });
  // tie bracket and the shared value
  const bx = AX + AW * pct(d.value) + 20, bp = eo3(seg(t, tVal - 0.3, tVal));
  if (bp > 0) { line(bx, RY[0], bx + 30, RY[0], { col: P.amber, lw: 6, noGhost: true, p: bp }); line(bx + 30, RY[0], bx + 30, RY[2] + 70, { col: P.amber, lw: 6, noGhost: true, p: bp }); line(bx + 30, RY[2] + 70, bx, RY[2] + 70, { col: P.amber, lw: 6, noGhost: true, p: bp }); }
  const vs = slam(t, tVal, { d: 0.14, from: 2.2, amp: 0 });
  if (vs.alpha > 0) { if (t > tVal + 0.14) sparks(540, 1010, tVal + 0.14, t, 10, 300); ctx.save(); ctx.translate(430, 1010); ctx.scale(vs.sc, vs.sc); text(d.value, 0, 60, { font: 'Marker', size: 170, col: P.amber, align: 'center', alpha: vs.alpha }); ctx.restore(); }
  slamPlate(t, tOv, 760, 465, d.overlap, { font: 'Mono', size: 30, fill: P.deep, tcol: P.cyan, col: P.cyan, rot: 0.03, maxW: 460 });
  // cost stacks
  const cp = eo3(seg(t, tCost, tCost + 0.4));
  if (cp > 0) {
    text(d.costLabel, 540, 1150, { font: 'Brush', size: 56, col: P.white, align: 'center', alpha: cp });
    d.rows.forEach((r, q) => { const x = 270 + q * 270, n = Math.round(H[r.cost] * cp);
      for (let c = 0; c < n; c++) { const y = 1400 - c * 22; ctx.fillStyle = P.amber; ctx.beginPath(); ctx.ellipse(x, y, 60, 16, 0, 0, 7); ctx.fill(); ctx.strokeStyle = P.deep; ctx.lineWidth = 3; ctx.stroke(); }
      text(r.name, x, 1440, { font: 'Mono', size: 28, col: P.cyan, align: 'center', alpha: cp }); });
  }
  ctx.restore();
}

// =====================================================================================================
// s8 scope: what the score shows (top panel) and what it does not measure (bottom panel).
// =====================================================================================================
export function scope(t, d, dur) {
  const k = dur / 7.705, T = (x) => x * k;
  const tYes = [0.35, 0.95, 1.55].map(T), tNoHead = T(3.1), tNo = [3.6, 4.3, 5.0, 5.6].map(T);
  ctx.save();
  cam(t, [[T(2.2), 1.06, 540, 500], [tNoHead, 1.0, 540, 800], [T(4.6), 1.07, 540, 1100], [T(6.4), 1.0, 540, 800]]);
  drawBg();
  const [jx, jy] = jolt(t, [0.2, tNoHead + 0.14], 10, 0.28); ctx.translate(jx, jy);
  slamPlate(t, 0.05, 260, 240, d.shows, { font: 'Marker', size: 72, fill: P.amber, tcol: P.deep, rot: -0.03 });
  d.yes.forEach((s, i) => { const p = eb(seg(t, tYes[i], tYes[i] + 0.3)); if (p <= 0) return; const y = 380 + i * 120;
    ctx.save(); ctx.translate(lerp(-600, 0, cl(p)), 0); fillR(90, y - 50, 840, 96, P.white); text('+', 130, y + 18, { font: 'Marker', size: 70, col: P.deep }); text(s, 200, y + 14, { font: 'Mono', size: fitS(s, 'Mono', 44, 700), col: P.deep }); ctx.restore(); });
  slamPlate(t, tNoHead, 330, 790, d.not, { font: 'Marker', size: 72, fill: P.coral, tcol: P.deep, rot: 0.02 });
  d.no.forEach((s, i) => { const p = eb(seg(t, tNo[i], tNo[i] + 0.3)); if (p <= 0) return; const y = 930 + i * 120;
    ctx.save(); ctx.translate(lerp(1200, 0, cl(p)), 0); fillR(90, y - 50, 840, 96, '#123d66'); rect(90, y - 50, 840, 96, { col: P.coral, lw: 4, noGhost: true, dash: [16, 10] }); text('–', 130, y + 18, { font: 'Marker', size: 70, col: P.coral }); text(s, 200, y + 14, { font: 'Mono', size: fitS(s, 'Mono', 44, 700), col: P.white }); ctx.restore(); });
  ctx.restore();
}

// =====================================================================================================
// s9 close: back to the gauge; the line plate, the credit and the handle; the needle returns to zero so the last
// frame matches the first frame of s1.
// =====================================================================================================
export function close(t, d, dur) {
  const tLine = 1.3, tHandle = 2.0, tReset = dur - 1.0;
  const reset = eio(seg(t, tReset, tReset + 0.6)), gone = ei3(seg(t, tReset, tReset + 0.35));
  ctx.save();
  drawBg();
  text(d.title, 540, 350, { font: 'Marker', size: 150, col: P.white, align: 'center', alpha: reset });
  dim(140, 380, 940, 380, { p: reset, col: P.cyan });
  gauge(G.cx, G.cy, G.r, pct(d.value) * (1 - reset));
  if (gone < 1) {
    ctx.save(); ctx.translate(0, 900 * gone);
    // magnifier sweeps the gauge
    const mx = 540 + 260 * Math.sin(t * 1.8), my = 760;
    ctx.save(); ctx.strokeStyle = P.amber; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(mx, my, 90, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(mx + 64, my + 64); ctx.lineTo(mx + 160, my + 160); ctx.lineWidth = 24; ctx.stroke(); ctx.restore();
    slamPlate(t, 0.1, 540, 300, d.value, { font: 'Marker', size: 90, fill: P.amber, tcol: P.deep });
    slamPlate(t, tLine, 540, 1130, d.line, { font: 'Marker', size: 78, fill: P.white, tcol: P.deep, rot: -0.02 });
    const hp = eo3(seg(t, tHandle, tHandle + 0.5));
    if (hp > 0) { const hw = measure(d.handle, 'Mono', 52) + 70; fillR(540 - hw / 2, 1240, hw, 92, P.deep); rect(540 - hw / 2, 1240, hw, 92, { col: P.amber, lw: 4, p: hp, noGhost: true });
      text(d.handle, 540, 1304, { font: 'Mono', size: 52, col: P.amber, align: 'center', reveal: hp });
      text(d.credit, 540, 1400, { font: 'Mono', size: fitS(d.credit, 'Mono', 34, 860), col: P.cyan, align: 'center', alpha: hp }); }
    ctx.restore();
  }
  ctx.restore();
}

export default { gauge: (t, d, dur) => gauge_(t, d, dur), recipe, build, anatomy, verifier, audit, board, scope, close };
