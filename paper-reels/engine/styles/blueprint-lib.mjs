// Drawing helpers for the "blueprint" style. Everything draws on the shared core canvas.
import { createCanvas } from '@napi-rs/canvas';
import { ctx, W, H, j, rn, cl, eo3, seg } from '../core.mjs';

export { ctx, W, H, cl, eo3, seg };
export const P = {
  bg: '#0b2a4a', deep: '#071d35', panel: '#0a2340', white: '#f2f8ff', cyan: '#a8dcf2',
  dim: '#6aa9d0', faint: '#3d78a6', amber: '#ffb454', coral: '#ff6b6b',
};

const hs = (...a) => { let h = 17; for (const v of a) h = (Math.imul(h, 31) + Math.round(v)) | 0; return (h >>> 0) % 4000; };

// ---------- static background (grid, grain, sheet furniture) ----------
let BG = null;
function makeBg() {
  const c = createCanvas(W, H), g = c.getContext('2d');
  const grad = g.createRadialGradient(W / 2, H * 0.42, 120, W / 2, H / 2, 1250);
  grad.addColorStop(0, '#0f3a63'); grad.addColorStop(0.6, '#0b2a4a'); grad.addColorStop(1, '#061a30');
  g.fillStyle = grad; g.fillRect(0, 0, W, H);
  // grid
  const grid = (step, col, a, lw) => {
    g.strokeStyle = col; g.globalAlpha = a; g.lineWidth = lw; g.beginPath();
    for (let x = 0; x <= W; x += step) { g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); }
    for (let y = 0; y <= H; y += step) { g.moveTo(0, y + 0.5); g.lineTo(W, y + 0.5); }
    g.stroke();
  };
  grid(40, '#7fc4ee', 0.10, 1); grid(200, '#9fd8f4', 0.22, 1.4);
  g.globalAlpha = 1;
  // grain
  let s = 4242; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 9000; i++) { g.fillStyle = r() > 0.5 ? '#cfeaff' : '#02101f'; g.globalAlpha = 0.03 + r() * 0.05; g.fillRect(r() * W, r() * H, 1 + r() * 1.6, 1 + r() * 1.6); }
  g.globalAlpha = 1;
  // sheet border (double) and edge ruler ticks
  g.strokeStyle = '#a8dcf2'; g.globalAlpha = 0.55; g.lineWidth = 2; g.strokeRect(34, 34, W - 68, H - 68);
  g.globalAlpha = 0.3; g.lineWidth = 1; g.strokeRect(46, 46, W - 92, H - 92);
  g.globalAlpha = 0.35; g.lineWidth = 1.2; g.beginPath();
  for (let x = 80; x < W - 60; x += 40) { g.moveTo(x, 46); g.lineTo(x, x % 200 === 0 ? 66 : 56); g.moveTo(x, H - 46); g.lineTo(x, x % 200 === 0 ? H - 66 : H - 56); }
  for (let y = 80; y < H - 60; y += 40) { g.moveTo(46, y); g.lineTo(y % 200 === 0 ? 66 : 56, y); g.moveTo(W - 46, y); g.lineTo(y % 200 === 0 ? W - 66 : W - 56, y); }
  g.stroke();
  // registration marks at corners
  g.globalAlpha = 0.75; g.strokeStyle = '#d6efff'; g.lineWidth = 2;
  for (const [cx, cy] of [[96, 96], [W - 96, 96], [96, H - 96], [W - 96, H - 96]]) {
    g.beginPath(); g.arc(cx, cy, 15, 0, Math.PI * 2); g.moveTo(cx - 28, cy); g.lineTo(cx + 28, cy); g.moveTo(cx, cy - 28); g.lineTo(cx, cy + 28); g.stroke();
  }
  // empty title block, lower right (no text by design)
  g.globalAlpha = 0.5; g.strokeStyle = '#a8dcf2'; g.lineWidth = 2;
  const bx = 570, by = 1738, bw = 360, bh = 116;
  g.strokeRect(bx, by, bw, bh);
  g.lineWidth = 1.2; g.beginPath();
  g.moveTo(bx, by + 58); g.lineTo(bx + bw, by + 58); g.moveTo(bx + 220, by); g.lineTo(bx + 220, by + bh); g.moveTo(bx + 220, by + 58); g.lineTo(bx + 220, by + 58);
  g.stroke();
  g.globalAlpha = 0.25; g.lineWidth = 3; g.beginPath();
  g.moveTo(bx + 16, by + 20); g.lineTo(bx + 150, by + 20); g.moveTo(bx + 16, by + 40); g.lineTo(bx + 100, by + 40);
  g.moveTo(bx + 16, by + 80); g.lineTo(bx + 170, by + 80); g.moveTo(bx + 236, by + 30); g.lineTo(bx + 330, by + 30); g.moveTo(bx + 236, by + 88); g.lineTo(bx + 300, by + 88);
  g.stroke();
  g.globalAlpha = 1;
  return c;
}
export function drawBg() { if (!BG) BG = makeBg(); ctx.drawImage(BG, 0, 0); }

// ---------- timing ----------
// start times for n items; the last item starts `tail` s before the line ends
export function sched(n, dur, t0 = 0.35, tail = 1.9, maxStep = 1.15) {
  const last = Math.max(t0, dur - tail), step = n > 1 ? Math.min(maxStep, (last - t0) / (n - 1)) : 0;
  return Array.from({ length: n }, (_, i) => t0 + i * Math.max(0.25, step));
}
export const pr = (t, s, len = 0.5) => eo3(seg(t, s, s + len));

// ---------- strokes ----------
function lpts(x1, y1, x2, y2, seed, wob = 1.1) {
  const d = Math.hypot(x2 - x1, y2 - y1) || 1, n = Math.max(1, Math.round(d / 55)), nx = -(y2 - y1) / d, ny = (x2 - x1) / d, out = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, o = j(seed * 7 + i, i > 0 && i < n ? wob : wob * 0.35);
    out.push([x1 + (x2 - x1) * u + nx * o, y1 + (y2 - y1) * u + ny * o]);
  }
  return out;
}
export function path(pts, o = {}) {
  const { col = P.white, lw = 2.5, alpha = 1, p = 1, dash = null, close = false, cap = 'round' } = o;
  if (p <= 0 || pts.length < 2) return;
  const q = close ? [...pts, pts[0]] : pts;
  let total = 0; for (let i = 1; i < q.length; i++) total += Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]);
  let left = total * cl(p);
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = cap; ctx.lineJoin = 'round'; ctx.globalAlpha = alpha;
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]);
  for (let i = 1; i < q.length && left > 0; i++) {
    const L = Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]);
    if (L <= left) { ctx.lineTo(q[i][0], q[i][1]); left -= L; }
    else { const u = left / L; ctx.lineTo(q[i - 1][0] + (q[i][0] - q[i - 1][0]) * u, q[i - 1][1] + (q[i][1] - q[i - 1][1]) * u); left = 0; }
  }
  ctx.stroke(); ctx.restore();
}
export function line(x1, y1, x2, y2, o = {}) {
  const seed = hs(x1, y1, x2, y2), wob = o.wob ?? 1.1;
  path(lpts(x1, y1, x2, y2, seed, wob), o);
  if ((o.lw ?? 2.5) >= 2 && !o.dash && !o.noGhost) path(lpts(x1, y1, x2, y2, seed + 9, wob * 1.2), { ...o, lw: (o.lw ?? 2.5) * 0.5, alpha: (o.alpha ?? 1) * 0.35 });
}
export function polyline(pts, o = {}) {
  const out = [];
  for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; const seg2 = lpts(a[0], a[1], b[0], b[1], hs(a[0], a[1], b[0], b[1]), o.wob ?? 1.1); out.push(...(i > 1 ? seg2.slice(1) : seg2)); }
  path(out, o);
}
export function rect(x, y, w, h, o = {}) {
  const { fill = null, fillAlpha = 0.9, p = 1 } = o;
  if (fill && p > 0) { ctx.save(); ctx.globalAlpha = fillAlpha * cl(p * 1.5); ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); ctx.restore(); }
  const s = hs(x, y, w, h), pts = [];
  const edges = [[x, y, x + w, y], [x + w, y, x + w, y + h], [x + w, y + h, x, y + h], [x, y + h, x, y]];
  edges.forEach((e, i) => { const a = lpts(e[0], e[1], e[2], e[3], s + i, o.wob ?? 0.9); pts.push(...(i ? a.slice(1) : a)); });
  pts[pts.length - 1] = pts[0];
  path(pts, o);
}
export function hatchRect(x, y, w, h, o = {}) {
  const { col = P.cyan, gap = 14, lw = 1.6, alpha = 0.5, p = 1 } = o;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w * cl(p), h); ctx.clip();
  ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.globalAlpha = alpha; ctx.beginPath();
  for (let k = -h; k < w; k += gap) { ctx.moveTo(x + k, y + h); ctx.lineTo(x + k + h, y); }
  ctx.stroke(); ctx.restore();
}
export function arrowhead(x, y, ang, size = 16, col = P.white, alpha = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = col; ctx.globalAlpha = alpha;
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-size, -size * 0.3); ctx.lineTo(-size, size * 0.3); ctx.closePath(); ctx.fill(); ctx.restore();
}
// line with arrowhead at the end (leader arrow)
export function leader(x1, y1, x2, y2, o = {}) {
  const { p = 1, col = P.white, lw = 3, head = 18 } = o, a = Math.atan2(y2 - y1, x2 - x1), d = Math.hypot(x2 - x1, y2 - y1);
  const bx = x2 - Math.cos(a) * head * 0.6, by = y2 - Math.sin(a) * head * 0.6;
  line(x1, y1, bx, by, { ...o, lw, col, p: p * (d / Math.max(1, d - head * 0.6)) > 1 ? 1 : p });
  if (p >= 0.95) arrowhead(x2, y2, a, head, col, o.alpha ?? 1);
}
// dimension line between two points with arrowheads at both ends, end ticks and optional centred label
export function dim(x1, y1, x2, y2, o = {}) {
  const { p = 1, col = P.cyan, label = null, size = 28, tick = 14, lw = 2, labelCol = P.cyan } = o;
  if (p <= 0) return;
  const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a), ny = Math.cos(a);
  line(x1, y1, x2, y2, { col, lw, p, noGhost: true });
  if (p > 0.15) { arrowhead(x1, y1, a + Math.PI, 15, col, cl(p * 2)); arrowhead(x2, y2, a, 15, col, p > 0.9 ? 1 : 0); }
  line(x1 + nx * tick, y1 + ny * tick, x1 - nx * tick, y1 - ny * tick, { col, lw: lw * 0.8, p: cl(p * 3), noGhost: true });
  line(x2 + nx * tick, y2 + ny * tick, x2 - nx * tick, y2 - ny * tick, { col, lw: lw * 0.8, p: cl(p * 3), noGhost: true });
  if (label && p > 0.6) {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    ctx.font = `${size}px Mono`; const w = ctx.measureText(label).width;
    ctx.save(); ctx.globalAlpha = cl((p - 0.6) * 3); ctx.fillStyle = '#0b2a4a'; ctx.fillRect(mx - w / 2 - 12, my - size * 0.75, w + 24, size * 1.5); ctx.restore();
    text(label, mx, my + size * 0.33, { font: 'Mono', size, col: labelCol, align: 'center', alpha: cl((p - 0.6) * 3) });
  }
}

// ---------- text ----------
export function measure(s, font, size) { ctx.font = `${size}px ${font}`; return ctx.measureText(s).width; }
export function wrap(s, font, size, maxW) {
  ctx.font = `${size}px ${font}`;
  const words = String(s).split(/\s+/).filter(Boolean), lines = []; let cur = '';
  for (const w of words) { const test = cur ? `${cur} ${w}` : w; if (!cur || ctx.measureText(test).width <= maxW) cur = test; else { lines.push(cur); cur = w; } }
  if (cur) lines.push(cur); return lines;
}
// largest size <= maxSize whose wrapped text fits maxLines lines and maxW
export function layout(s, font, maxW, maxSize, maxLines = 1) {
  for (let sz = maxSize; sz >= 12; sz -= 2) {
    const lines = wrap(s, font, sz, maxW);
    if (lines.length <= maxLines && lines.every((l) => measure(l, font, sz) <= maxW + 0.5)) return { size: sz, lines };
  }
  return { size: 12, lines: wrap(s, font, 12, maxW) };
}
export function text(s, x, y, o = {}) {
  const { font = 'Mono', size = 32, col = P.white, align = 'left', alpha = 1, reveal = 1, base = 'alphabetic' } = o;
  if (alpha <= 0 || reveal <= 0) return 0;
  ctx.save(); ctx.font = `${size}px ${font}`; ctx.textAlign = align; ctx.textBaseline = base; ctx.globalAlpha = alpha;
  const w = ctx.measureText(s).width;
  if (reveal < 1) { const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x; ctx.beginPath(); ctx.rect(x0 - 8, y - size * 1.3, w * reveal + 8, size * 1.9); ctx.clip(); }
  ctx.fillStyle = col; ctx.fillText(s, x + j(hs(x, y, s.length), 0.45), y + j(hs(y, x, s.length) + 1, 0.45));
  ctx.restore(); return w;
}
export function textLines(lines, x, y, lh, o = {}) { lines.forEach((l, i) => text(l, x, y + i * lh, o)); }

// ---------- small parts ----------
export function badge(cx, cy, r, label, o = {}) {
  const { p = 1, col = P.amber, size = r * 1.1 } = o;
  rect(cx - r, cy - r, r * 2, r * 2, { col, lw: 3, p, fill: P.panel });
  if (p > 0.6) text(label, cx, cy + size * 0.36, { font: 'Mono', size, col, align: 'center', alpha: cl((p - 0.6) * 2.5) });
}
export function tagBox(x, y, s, o = {}) { // small boxed tag, left aligned at x, baseline-centred on y; returns width
  const { size = 22, col = P.cyan, alpha = 1, p = 1 } = o, w = measure(s, 'Mono', size) + 20, h = size + 14;
  if (p > 0) { rect(x, y - h / 2, w, h, { col, lw: 1.8, p, alpha, wob: 0.5, noGhost: true }); text(s, x + 10, y + size * 0.34, { font: 'Mono', size, col, alpha: alpha * cl(p * 1.5) }); }
  return w;
}
// section heading: Brush title, underlined by a dimension rule. Returns y of rule.
export function heading(title, y, p, o = {}) {
  const { x = 90, maxW = 840, maxSize = 84, col = P.white } = o;
  const l = layout(title, 'Brush', maxW, maxSize, 2), lh = l.size * 1.02;
  l.lines.forEach((s, i) => text(s, x, y + i * lh, { font: 'Brush', size: l.size, col, reveal: cl(p * 1.6 - i * 0.5), alpha: 1 }));
  const ry = y + (l.lines.length - 1) * lh + 36;
  dim(x, ry, x + maxW, ry, { p: cl(p * 1.3 - 0.2), col: P.cyan, tick: 10, lw: 1.8 });
  return ry;
}

// ---------- the robot: boxy, white linework, amber antenna light ----------
export function robot(x, y, s, o = {}) {
  const { t = 0, p = 1, wave = 0, look = 0, alpha = 1, mood = 'ok' } = o;
  if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y);
  const lw = Math.max(2, s * 0.32), c = P.white;
  const R = (rx, ry, rw, rh, f, op = {}) => rect(rx * s, ry * s, rw * s, rh * s, { col: c, lw, p, wob: 0.6, noGhost: true, fill: f, fillAlpha: 1, ...op });
  const L = (a, b, c2, d2, op = {}) => line(a * s, b * s, c2 * s, d2 * s, { col: c, lw, p, wob: 0.5, noGhost: true, ...op });
  // centre line (drafting)
  line(0, -23 * s, 0, -19.5 * s, { col: P.dim, lw: 1.5, dash: [10, 6, 2, 6], p, alpha: 0.7 }); line(0, 1.5 * s, 0, 5 * s, { col: P.dim, lw: 1.5, dash: [10, 6, 2, 6], p, alpha: 0.7 });
  // ground
  line(-8 * s, 0, 8 * s, 0, { col: P.dim, lw: 1.6, p, alpha: 0.8, noGhost: true });
  // legs
  R(-3.2, -3, 1.9, 3, P.panel); R(1.3, -3, 1.9, 3, P.panel);
  // arms
  const wv = Math.sin(t * 7) * 0.35 * wave;
  L(-4.5, -8.6, -6.6, -4.6);
  const ax = 4.5, ay = -8.6, ang = wave ? -1.1 + wv : 0.62, al = wave ? 4.8 : 3.8;
  L(ax, ay, ax + Math.cos(ang) * al, ay + Math.sin(ang) * al);
  // torso
  R(-4.5, -10.2, 9, 7.2, P.panel);
  R(-2.4, -8.7, 4.8, 3.2, null, { lw: lw * 0.6, col: P.cyan });
  L(-1.4, -4.4, 1.4, -4.4, { col: P.cyan, lw: lw * 0.6 });
  // head
  R(-3.6, -16, 7.2, 5.4, P.panel);
  const ex = look * 0.35;
  if (mood === 'warn') { L(-2.3, -14.6, -0.9, -13.4, { col: P.coral }); L(2.3, -14.6, 0.9, -13.4, { col: P.coral }); }
  else { R(-2.3 + ex, -14.5, 1.3, 1.5, P.cyan, { col: P.cyan, lw: lw * 0.5 }); R(1.0 + ex, -14.5, 1.3, 1.5, P.cyan, { col: P.cyan, lw: lw * 0.5 }); }
  L(-1.2, -12.1, 1.2, -12.1, { col: P.cyan, lw: lw * 0.6 });
  // antenna + amber light
  L(0, -16, 0, -18.2);
  const pulse = 0.65 + 0.35 * Math.sin(t * 4);
  ctx.save(); ctx.globalAlpha = alpha * cl(p) * 0.45 * pulse; const g = ctx.createRadialGradient(0, -19.1 * s, 0, 0, -19.1 * s, 2.6 * s);
  g.addColorStop(0, P.amber); g.addColorStop(1, 'rgba(255,180,84,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -19.1 * s, 2.6 * s, 0, 7); ctx.fill(); ctx.restore();
  ctx.save(); ctx.globalAlpha = alpha * cl(p * 2); ctx.fillStyle = P.amber; ctx.beginPath(); ctx.arc(0, -19.1 * s, 0.85 * s, 0, 7); ctx.fill(); ctx.restore();
  ctx.restore();
}
