// Chalk drawing toolkit for the "chalkboard" style. Draws on the shared core canvas.
import { createCanvas } from '@napi-rs/canvas';
import { ctx, W, H, j, cl, eo3, seg } from '../core.mjs';

export { ctx, W, H, cl, eo3, seg };
export const COL = {
  white: '#f3f1e8', yellow: '#f2d96a', pink: '#f29ac0', blue: '#8fd0ff',
  slate: '#1f2f28', slateDeep: '#16231d', bg: '#1c2b25',
};

// static hash (no boil): stable per-shape wobble
export const hr = (k) => {
  let a = (Math.imul(Math.round(k) | 0, 2654435761) + 0x9e3779b9) >>> 0;
  a ^= a >>> 15; a = Math.imul(a, 2246822519) >>> 0; a ^= a >>> 13; a = Math.imul(a, 3266489917) >>> 0; a ^= a >>> 16;
  return (a >>> 0) / 4294967296;
};
export const hs = (x, y) => (Math.round(x / 7) * 31 + Math.round(y / 7) * 17) & 0xffff;

// ---------- timing ----------
export function sched(n, dur, t0 = 0.5, tail = 2.2, maxStep = 1.6) {
  const last = Math.max(t0, dur - tail), step = n > 1 ? Math.min(maxStep, (last - t0) / (n - 1)) : 0;
  return Array.from({ length: n }, (_, i) => t0 + i * Math.max(0.25, step));
}
export const pr = (t, s, len = 0.5) => { const u = seg(t, s, s + len); return u * u * (3 - 2 * u) * 0.35 + u * 0.65; };

// ---------- text measure / layout ----------
export const setFont = (font, size) => { ctx.font = `${size}px ${font}`; };
export function measure(str, font, size) { setFont(font, size); return ctx.measureText(str).width; }
function wrap(str, font, size, maxW) {
  const words = String(str).split(' '), lines = []; let cur = '';
  for (const w of words) {
    const tr = cur ? `${cur} ${w}` : w;
    if (cur && measure(tr, font, size) > maxW) { lines.push(cur); cur = w; } else cur = tr;
  }
  if (cur) lines.push(cur);
  return lines;
}
export function layout(str, font, maxW, maxSize, maxLines = 1, minSize = 24) {
  const fits = (s, ml) => { const ls = wrap(str, font, s, maxW); return ls.length <= ml && ls.every((l) => measure(l, font, s) <= maxW) ? ls : null; };
  if (maxLines > 1) for (let s = maxSize; s >= Math.max(minSize, maxSize * 0.74); s -= 2) { const ls = fits(s, 1); if (ls) return { size: s, lines: ls }; }
  for (let s = maxSize; s >= minSize; s -= 2) { const ls = fits(s, maxLines); if (ls) return { size: s, lines: ls }; }
  return { size: minSize, lines: wrap(str, font, minSize, maxW) };
}

// ---------- chalk primitives ----------
function truncate(pts, p) {
  if (p >= 1) return pts;
  let tot = 0; const ls = [];
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); ls.push(l); tot += l; }
  let rem = tot * p; const out = [pts[0]];
  for (let i = 0; i < ls.length; i++) {
    if (rem >= ls[i]) { out.push(pts[i + 1]); rem -= ls[i]; }
    else { const u = ls[i] ? rem / ls[i] : 0; out.push([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u]); break; }
  }
  return out;
}
function trace(P) {
  ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]);
  if (P.length === 2) { ctx.lineTo(P[1][0], P[1][1]); return; }
  for (let i = 1; i < P.length - 1; i++) {
    const mx = (P[i][0] + P[i + 1][0]) / 2, my = (P[i][1] + P[i + 1][1]) / 2;
    ctx.quadraticCurveTo(P[i][0], P[i][1], mx, my);
  }
  const l = P[P.length - 1]; ctx.lineTo(l[0], l[1]);
}
// chalk stroke: 3 passes, grainy dashes on the lighter ones, boil jitter every 3 frames
export function chalk(pts, o = {}) {
  const { col = COL.white, lw = 5, alpha = 1, p = 1, seed = hs(pts[0][0], pts[0][1]), wob = 1.2, close = false } = o;
  if (p <= 0 || pts.length < 2) return;
  const src = close ? [...pts, pts[0]] : pts, T = truncate(src, p);
  if (T.length < 2) return;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = col;
  const passes = [[1, 0.8, null], [0.6, 0.5, [lw * 3.2, lw * 1.1, lw * 0.9, lw * 1.7]], [0.38, 0.4, [lw * 0.7, lw * 1.9]]];
  for (let k = 0; k < 3; k++) {
    const [wk, ak, dash] = passes[k], fx = (hr(seed * 3 + k) - 0.5) * lw * 0.7, fy = (hr(seed * 5 + k + 9) - 0.5) * lw * 0.7;
    ctx.lineWidth = lw * wk; ctx.globalAlpha = alpha * ak; ctx.setLineDash(dash || []);
    const P = T.map((q, i) => [q[0] + fx + j(seed * 131 + i * 7 + k * 1009, wob * 0.55), q[1] + fy + j(seed * 137 + i * 11 + k * 1013, wob * 0.55)]);
    trace(P); ctx.stroke();
  }
  ctx.restore();
}
export function linePts(x1, y1, x2, y2, seed = hs(x1, y1)) {
  const d = Math.hypot(x2 - x1, y2 - y1) || 1, n = Math.max(1, Math.round(d / 55)), nx = -(y2 - y1) / d, ny = (x2 - x1) / d;
  const bow = (hr(seed) - 0.5) * Math.min(d * 0.035, 10), pts = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, o = Math.sin(Math.PI * u) * bow + (i > 0 && i < n ? (hr(seed + i * 3) - 0.5) * 2.2 : 0);
    pts.push([x1 + (x2 - x1) * u + nx * o, y1 + (y2 - y1) * u + ny * o]);
  }
  return pts;
}
export const line = (x1, y1, x2, y2, o = {}) => chalk(linePts(x1, y1, x2, y2, o.seed ?? hs(x1, y1)), o);
export function rrPts(x, y, w, h, r = 22) {
  r = Math.min(r, w / 2, h / 2);
  const pts = [], seg4 = (cx, cy, a0) => { for (let i = 0; i <= 4; i++) { const a = a0 + (i / 4) * (Math.PI / 2); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  const edge = (x1, y1, x2, y2) => { const n = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / 90)); for (let i = 1; i < n; i++) pts.push([x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n]); };
  seg4(x + r, y + r, Math.PI); edge(x + r, y, x + w - r, y);
  seg4(x + w - r, y + r, -Math.PI / 2); edge(x + w, y + r, x + w, y + h - r);
  seg4(x + w - r, y + h - r, 0); edge(x + w - r, y + h, x + r, y + h);
  seg4(x + r, y + h - r, Math.PI / 2); edge(x, y + h - r, x, y + r);
  pts.push(pts[0], pts[1], pts[2]); // overshoot, like a hand closing the loop
  return pts;
}
export function rrect(x, y, w, h, o = {}) {
  const { r = 22, fill = null, fillAlpha = 0.1, p = 1 } = o;
  if (fill && p > 0) { ctx.save(); ctx.globalAlpha = fillAlpha * cl(p * 2); ctx.fillStyle = fill; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); ctx.restore(); }
  chalk(rrPts(x, y, w, h, r), { ...o, seed: o.seed ?? hs(x, y) });
}
export function ellipse(cx, cy, rx, ry, o = {}) {
  const pts = [], n = 44, s = o.seed ?? hs(cx, cy), a0 = hr(s) * 6.28;
  for (let i = 0; i <= n; i++) { const u = i / n, a = a0 + u * Math.PI * 2 * 1.1, g = 1 + 0.05 * u + (hr(s + i) - 0.5) * 0.02; pts.push([cx + Math.cos(a) * rx * g, cy + Math.sin(a) * ry * g]); }
  chalk(pts, { ...o, seed: s });
}
export function underline(x1, x2, y, o = {}) {
  const pts = [], n = Math.max(3, Math.round((x2 - x1) / 38)), s = o.seed ?? hs(x1, y);
  for (let i = 0; i <= n; i++) pts.push([x1 + ((x2 - x1) * i) / n, y + Math.sin(i * 1.3 + hr(s) * 6) * 3.5 + (hr(s + i) - 0.5) * 3]);
  chalk(pts, { lw: 5, ...o, seed: s });
}
export function arrow(x1, y1, x2, y2, o = {}) {
  const p = o.p ?? 1, ang = Math.atan2(y2 - y1, x2 - x1), hl = o.head ?? 30;
  chalk(linePts(x1, y1, x2, y2, o.seed), { ...o, p: cl(p / 0.85) });
  const hp = cl((p - 0.85) / 0.15);
  if (hp > 0) for (const s of [-1, 1]) {
    const a = ang + Math.PI + s * 0.5;
    chalk([[x2, y2], [x2 + Math.cos(a) * hl, y2 + Math.sin(a) * hl]], { ...o, p: hp, seed: (o.seed ?? hs(x1, y1)) + (s > 0 ? 3 : 4) });
  }
}
// diagonal chalk hatching clipped to a rect
export function hatch(x, y, w, h, o = {}) {
  const { col = COL.white, gap = 13, lw = 3.2, alpha = 0.55 } = o;
  if (w < 2) return;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); ctx.strokeStyle = col; ctx.lineCap = 'round';
  for (let pass = 0; pass < 2; pass++) {
    ctx.lineWidth = pass ? lw * 0.5 : lw; ctx.globalAlpha = alpha * (pass ? 0.6 : 1); ctx.setLineDash(pass ? [9, 5, 3, 6] : []);
    ctx.beginPath();
    for (let k = -h, i = 0; k < w + gap; k += gap, i++) {
      const o1 = (hr(i * 7 + pass * 3 + Math.round(x)) - 0.5) * 2.5 + j(i * 5 + pass * 77, 0.6);
      ctx.moveTo(x + k + o1, y + h + 4); ctx.lineTo(x + k + h + o1 + 3, y - 4);
    }
    ctx.stroke();
  }
  ctx.restore();
}
export function solidStroke(pts, col, lw) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
  pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.stroke(); ctx.restore();
}

// chalk text, optionally wiped in left to right
export function text(str, x, y, o = {}) {
  const { font = 'Brush', size = 48, col = COL.white, align = 'left', p = 1, alpha = 1 } = o;
  if (p <= 0 || !str) return 0;
  const w = measure(str, font, size), x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x, s = hs(x, y);
  const draw = (am) => {
    ctx.globalAlpha = alpha * 0.93 * am; ctx.fillText(str, x0 + j(s, 0.5), y + j(s + 1, 0.5));
    ctx.globalAlpha = alpha * 0.4 * am; ctx.fillText(str, x0 + 1 + j(s + 2, 0.9), y + 0.8 + j(s + 3, 0.9));
    ctx.globalAlpha = alpha * 0.28 * am; ctx.lineWidth = Math.max(1, size * 0.018); ctx.setLineDash([2, 3]); ctx.strokeText(str, x0 - 0.6, y - 0.5);
  };
  ctx.save(); setFont(font, size); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = col; ctx.strokeStyle = col;
  if (p < 1) {
    // feathered write-on edge: three nested clips, each adding a share of the alpha
    const e = (w + 24) * p - 12 + x0;
    for (const [off, am] of [[0, 0.4], [-9, 0.4], [-18, 0.5]]) {
      ctx.save(); ctx.beginPath(); ctx.rect(x0 - 12, y - size * 1.2, Math.max(0, e + off - (x0 - 12)), size * 1.8); ctx.clip(); draw(am); ctx.restore();
    }
  } else draw(1);
  ctx.restore();
  return w;
}
export function textLines(lines, x, y, lh, o = {}) {
  lines.forEach((l, i) => text(l, x, y + i * lh, { ...o, p: cl((o.p ?? 1) * lines.length - i) }));
}

// ---------- mascot: chalk-line robot ----------
// (x, gy) = ground centre. s = scale (1 ~ 240 px tall). arm = right arm angle in radians (0 = right, up is negative), or null for rest.
export function robot(x, gy, s, o = {}) {
  const { t = 0, p = 1, arm = null, wave = false, col = COL.white, accent = COL.yellow, side = COL.blue } = o;
  if (p <= 0) return;
  const ox = -(1 - eo3(p)) * (x + 160 * s), bob = Math.sin(t * 2.4) * 2.5 * s;
  const T = (px, py) => [x + ox + px * s, gy + py * s + bob], lw = Math.max(3.4, 3.6 * s);
  const fillBox = (px, py, w, h, r) => { ctx.save(); ctx.fillStyle = 'rgba(31,47,40,0.96)'; ctx.beginPath(); const a = T(px, py); ctx.roundRect(a[0], a[1], w * s, h * s, r * s); ctx.fill(); ctx.restore(); };
  // arms (behind body)
  const shR = T(40, -92), shL = T(-40, -92);
  let a = arm; if (wave) a = -1.15 + 0.45 * Math.sin(t * 7.5);
  const armR = a == null ? Math.PI * 0.38 : a, L = 64 * s;
  const hR = [shR[0] + Math.cos(armR) * L, shR[1] + Math.sin(armR) * L], hL = [shL[0] - 22 * s, shL[1] + 56 * s];
  chalk([shR, hR], { col, lw, seed: 11 }); chalk([shL, hL], { col, lw, seed: 12 });
  ctx.save(); ctx.fillStyle = accent; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.arc(hR[0], hR[1], 7 * s, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(hL[0], hL[1], 7 * s, 0, 7); ctx.fill(); ctx.restore();
  // wheels
  for (const dx of [-26, 26]) { const c = T(dx, -12); chalk(Array.from({ length: 13 }, (_, i) => [c[0] + Math.cos(i * 0.55) * 12 * s, c[1] + Math.sin(i * 0.55) * 12 * s]), { col: side, lw, seed: 20 + dx }); }
  // body
  fillBox(-42, -112, 84, 84, 14); chalk(rrPts(...T(-42, -112), 84 * s, 84 * s, 14 * s), { col, lw, seed: 31 });
  chalk(rrPts(...T(-20, -92), 40 * s, 26 * s, 6 * s), { col: side, lw: lw * 0.8, seed: 32 });
  chalk([T(-14, -56), T(14, -56)], { col: accent, lw: lw * 0.9, seed: 33 });
  // head
  fillBox(-54, -208, 108, 84, 20); chalk(rrPts(...T(-54, -208), 108 * s, 84 * s, 20 * s), { col, lw, seed: 41 });
  const blink = (t % 3.6) < 0.12;
  for (const dx of [-20, 20]) {
    const c = T(dx, -170);
    if (blink) chalk([[c[0] - 8 * s, c[1]], [c[0] + 8 * s, c[1]]], { col: accent, lw, seed: 50 + dx });
    else { ctx.save(); ctx.fillStyle = accent; ctx.globalAlpha = 0.95; ctx.beginPath(); ctx.arc(c[0], c[1], 8.5 * s, 0, 7); ctx.fill(); ctx.restore(); }
  }
  chalk([T(-14, -143), T(-6, -137), T(6, -137), T(14, -143)], { col, lw: lw * 0.8, seed: 60 });
  chalk([T(0, -208), T(0, -234)], { col, lw, seed: 61 });
  ctx.save(); ctx.fillStyle = COL.pink; ctx.globalAlpha = 0.95; const an = T(0, -240); ctx.beginPath(); ctx.arc(an[0], an[1], 7 * s, 0, 7); ctx.fill(); ctx.restore();
  return { hand: hR };
}

// ---------- background ----------
let BG = null;
function makeBg() {
  const c = createCanvas(W, H), g = c.getContext('2d');
  let sd = 90210; const r = () => ((sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296);
  const grad = g.createLinearGradient(0, 0, W * 0.4, H);
  grad.addColorStop(0, '#26382f'); grad.addColorStop(0.5, '#223329'); grad.addColorStop(1, '#1c2b25');
  g.fillStyle = grad; g.fillRect(0, 0, W, H);
  // eraser smears: wide soft arcs, stacked at falling alpha
  g.lineCap = 'round'; g.strokeStyle = '#e8efe6';
  for (let i = 0; i < 16; i++) {
    const cx = r() * W, cy = r() * 1750, rad = 160 + r() * 420, a0 = r() * 6.28, sw = 0.5 + r() * 0.8, wd = 70 + r() * 90;
    for (let k = 0; k < 6; k++) { g.globalAlpha = 0.006 + 0.004 * (6 - k) * 0.4; g.lineWidth = wd * (1 - k * 0.14); g.beginPath(); g.arc(cx, cy, rad, a0, a0 + sw); g.stroke(); }
  }
  // faint ghost scribbles (old erased chalk)
  g.lineWidth = 3; g.globalAlpha = 0.035;
  for (let i = 0; i < 12; i++) { let x = r() * W, y = 120 + r() * 1500; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 7; k++) { x += 40 + r() * 50; y += (r() - 0.5) * 36; g.lineTo(x, y); } g.stroke(); }
  // chalk dust
  g.fillStyle = '#f3f1e8';
  for (let i = 0; i < 4200; i++) { g.globalAlpha = 0.02 + r() * 0.07; g.fillRect(r() * W, r() * H, 1 + r() * 1.8, 1 + r() * 1.8); }
  for (let i = 0; i < 70; i++) {
    const x = r() * W, y = r() * 1750, rr = 14 + r() * 40, gr = g.createRadialGradient(x, y, 0, x, y, rr);
    gr.addColorStop(0, 'rgba(243,241,232,0.05)'); gr.addColorStop(1, 'rgba(243,241,232,0)'); g.globalAlpha = 1; g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  // vignette
  const vg = g.createRadialGradient(W / 2, H * 0.45, 380, W / 2, H * 0.5, 1250);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(4,10,7,0.62)'); g.globalAlpha = 1; g.fillStyle = vg; g.fillRect(0, 0, W, H);
  // chalk tray (below the caption band)
  const ty = 1790, wood = g.createLinearGradient(0, ty, 0, H);
  wood.addColorStop(0, '#7a6650'); wood.addColorStop(0.12, '#5c4a38'); wood.addColorStop(1, '#2e241b');
  g.fillStyle = wood; g.fillRect(0, ty, W, H - ty);
  g.fillStyle = 'rgba(255,240,210,0.28)'; g.fillRect(0, ty, W, 4); g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, ty + 4, W, 14);
  const stick = (x, y, w, col) => { g.fillStyle = col; g.beginPath(); g.roundRect(x, y, w, 15, 6); g.fill(); g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(x + 4, y + 11, w - 8, 3); };
  stick(120, ty - 12, 92, '#f3f1e8'); stick(250, ty - 10, 70, '#f2d96a'); stick(332, ty - 12, 84, '#f29ac0'); stick(700, ty - 11, 76, '#8fd0ff');
  g.fillStyle = '#2a2f2c'; g.beginPath(); g.roundRect(800, ty - 30, 150, 34, 6); g.fill(); g.fillStyle = '#6b5a3c'; g.fillRect(800, ty - 8, 150, 12);
  g.globalAlpha = 0.2; g.fillStyle = '#f3f1e8'; g.fillRect(812, ty - 26, 100, 5); g.globalAlpha = 1;
  return c;
}
export function drawBoard(t = 0, li = 0) {
  if (!BG) BG = makeBg();
  ctx.drawImage(BG, 0, 0);
  ctx.save(); ctx.fillStyle = '#f3f1e8';
  for (let k = 0; k < 16; k++) {
    const x = (hr(li * 31 + k) * W + t * (6 + k)) % W, y = (hr(li * 57 + k * 3) * 1700 - t * (5 + k % 5) + 1700) % 1700;
    ctx.globalAlpha = 0.05 + 0.05 * hr(k + 3); ctx.beginPath(); ctx.arc(x, y, 1.5 + hr(k + 9) * 2.2, 0, 7); ctx.fill();
  }
  ctx.restore();
}
