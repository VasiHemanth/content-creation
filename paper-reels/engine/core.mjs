// Shared hand-drawn toolkit for "The 100-Millisecond Auction".
// Every scene imports from here. Palette is locked to 4 colours (tints via alpha only).
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const W = 1080, H = 1920, FPS = 30;
GlobalFonts.registerFromPath(path.join(HERE, 'assets/caveat.ttf'), 'Brush');   // headlines (Caveat Brush)
GlobalFonts.registerFromPath(path.join(HERE, 'assets/marker.ttf'), 'Marker');  // punchy display (Permanent Marker)
GlobalFonts.registerFromPath(path.join(HERE, 'assets/mono.ttf'), 'Mono');      // IDs, code, numbers (JetBrains Mono)

export const C = { paper: '#F5F1E8', ink: '#1A1A1A', red: '#E5484D', green: '#30A46C' };

export const cv = createCanvas(W, H);
export const ctx = cv.getContext('2d');
let boil = 0;
export const setBoil = (frame) => { boil = Math.floor(frame / 3); }; // lines re-jitter every 3 frames

// ---------- deterministic jitter ----------
export const rn = (k) => {
  let a = ((boil * 2654435761) ^ (k * 40503 + 7)) >>> 0;
  a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const j = (k, a) => (rn(k) - 0.5) * 2 * a;
export const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const eo3 = (t) => 1 - Math.pow(1 - cl(t), 3);
export const ei3 = (t) => Math.pow(cl(t), 3);
export const eio = (t) => { t = cl(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const eob = (t) => { t = cl(t); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
export const seg = (t, a, b) => cl((t - a) / (b - a));
export const bounce = (t) => { t = cl(t); const n1 = 7.5625, d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t; if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375; return n1 * (t -= 2.625 / d1) * t + 0.984375; };
export const shake = (t, t0, amp, dur = 0.35) => { const p = seg(t, t0, t0 + dur); if (p <= 0 || p >= 1) return [0, 0];
  const d = (1 - p) * amp; return [Math.sin(t * 90) * d, Math.cos(t * 77) * d]; };
export const pulse = (t, t0, amp = 0.1, dur = 0.3) => { const p = seg(t, t0, t0 + dur); return p <= 0 || p >= 1 ? 1 : 1 + amp * Math.sin(p * Math.PI); };
export const hop = (t, period, h) => Math.abs(Math.sin((t * Math.PI) / period)) * h;

// ---------- paper ----------
function makePaper(base, speck, n, seedv) {
  const c = createCanvas(W, H), g = c.getContext('2d'); g.fillStyle = base; g.fillRect(0, 0, W, H);
  let s = seedv; const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < n; i++) { g.fillStyle = speck; g.globalAlpha = 0.04 + r() * 0.08; g.fillRect(r() * W, r() * H, 1 + r() * 2.5, 1 + r() * 2.5); }
  g.globalAlpha = 0.05; g.strokeStyle = speck;
  for (let i = 0; i < 70; i++) { g.beginPath(); const x = r() * W, y = r() * H; g.moveTo(x, y); g.lineTo(x + (r() - .5) * 60, y + (r() - .5) * 20); g.stroke(); }
  return c;
}
const PAPER = makePaper(C.paper, C.ink, 5200, 12345), INKBG = makePaper(C.ink, C.paper, 3200, 777);
export const bg = (kind = 'paper') => {
  if (kind === 'ink') ctx.drawImage(INKBG, 0, 0);
  else if (kind === 'red') { ctx.fillStyle = C.red; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 0.12; ctx.drawImage(PAPER, 0, 0); ctx.globalAlpha = 1; }
  else if (kind === 'green') { ctx.fillStyle = C.green; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 0.12; ctx.drawImage(PAPER, 0, 0); ctx.globalAlpha = 1; }
  else ctx.drawImage(PAPER, 0, 0);
};

// ---------- hand-drawn primitives ----------
export function stroke(pts, { lw = 6, col = C.ink, seed = 1, amp = 1.5, alpha = 1, close = false } = {}) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let pass = 0; pass < 2; pass++) {
    ctx.lineWidth = pass ? lw * 0.5 : lw * (0.9 + rn(seed + 99) * 0.25); ctx.globalAlpha = alpha * (pass ? 0.5 : 1);
    ctx.beginPath();
    pts.forEach((p, i) => { const x = p[0] + j(seed + i * 2 + pass * 500, amp), y = p[1] + j(seed + i * 2 + 1 + pass * 500, amp); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    if (close) ctx.closePath(); ctx.stroke();
  }
  ctx.restore();
}
export const hs = (x, y) => (((x / 40) | 0) * 31 + ((y / 40) | 0) * 17) & 4095;
function linePts(x1, y1, x2, y2, seed, w = 3) {
  const d = Math.hypot(x2 - x1, y2 - y1) || 1, n = Math.max(1, Math.round(d / 70)), nx = -(y2 - y1) / d, ny = (x2 - x1) / d, pts = [];
  for (let i = 0; i <= n; i++) { const u = i / n, o = i > 0 && i < n ? j(seed * 13 + i, w) : 0; pts.push([lerp(x1, x2, u) + nx * o, lerp(y1, y2, u) + ny * o]); }
  return pts;
}
export function line(x1, y1, x2, y2, o = {}) { const seed = o.seed ?? hs(x1, y1); stroke(linePts(x1, y1, x2, y2, seed, o.wob ?? 3), { ...o, seed }); }
export function poly(pts, { fill, col = C.ink, lw = 6, seed = 5, amp = 2, alpha = 1 } = {}) {
  if (fill) { ctx.save(); ctx.fillStyle = fill; ctx.globalAlpha = alpha; ctx.beginPath();
    pts.forEach((p, i) => { const x = p[0] + j(seed + i * 2, amp), y = p[1] + j(seed + i * 2 + 1, amp); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
    ctx.closePath(); ctx.fill(); ctx.restore(); }
  if (col && lw) stroke(pts, { lw, col, seed, amp: 1.3, close: true });
}
// x,y = top-left. opts: fill, col, lw, rot (about centre), seed, alpha
export function rectS(x, y, w, h, o = {}) {
  const { rot = 0, seed = hs(x, y) } = o; ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot);
  poly([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], { ...o, seed }); ctx.restore();
}
// rounded rect with wobbly outline. r = corner radius
export function rrect(x, y, w, h, r, o = {}) {
  const pts = [], n = 5;
  const corner = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * Math.PI / 2; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  corner(x + w - r, y + r, -Math.PI / 2); corner(x + w - r, y + h - r, 0); corner(x + r, y + h - r, Math.PI / 2); corner(x + r, y + r, Math.PI);
  poly(pts, { seed: hs(x, y), ...o });
}
export function circle(cx, cy, r, { fill, col = C.ink, lw = 6, seed = 9, arc = 1, alpha = 1 } = {}) {
  const n = 30, pts = []; for (let i = 0; i <= n * arc; i++) { const a = -Math.PI / 2 + (i / n) * Math.PI * 2, rr = r + j(seed + i, r * 0.03); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  if (fill) { ctx.save(); ctx.fillStyle = fill; ctx.globalAlpha = alpha; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); ctx.fill(); ctx.restore(); }
  if (col && lw) stroke(pts, { lw, col, seed, amp: 1.2 });
}
export function star4(x, y, r, rot, col) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, rr = i % 2 ? r * 0.28 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill(); ctx.restore();
}
export function burst(cx, cy, t0, t, n, col, rad = 420, size = 30) {
  const p = (t - t0) / 0.9; if (p < 0 || p > 1) return;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + i * 0.3, d = rad * eo3(p) * (0.55 + 0.45 * (((i * 37) % 10) / 10));
    star4(cx + Math.cos(a) * d, cy + Math.sin(a) * d + p * p * 160, size * (1 - p) + 4, p * 6 + i, col); }
}
// radial speed lines (comic burst) around (cx,cy)
export function rays(cx, cy, col, n = 34, r0 = 320, r1 = 1700, lw = 9) {
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + rn(500 + i) * 0.18, s = r0 + (r1 - r0) * rn(700 + i) * 0.45, e = s + (r1 - s) * (0.45 + rn(600 + i) * 0.55);
    line(cx + Math.cos(a) * s, cy + Math.sin(a) * s, cx + Math.cos(a) * e, cy + Math.sin(a) * e, { col, lw, seed: 40 + i, wob: 1 }); }
}
// horizontal speed lines in a box
export function hlines(x0, x1, y0, y1, n, col, lw = 7) {
  for (let i = 0; i < n; i++) { const y = lerp(y0, y1, rn(900 + i)), a = lerp(x0, x1, rn(800 + i) * 0.5), b = a + (x1 - x0) * (0.25 + rn(850 + i) * 0.4);
    line(a, y, Math.min(b, x1), y, { col, lw, seed: 70 + i, wob: 1 }); }
}
// pencil hatching inside an axis-aligned box (diagonal strokes)
export function hatch(x, y, w, h, { col = C.ink, gap = 14, lw = 2.5, alpha = 0.55, seed = 300, p = 1 } = {}) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  const n = Math.ceil((w + h) / gap), shown = Math.floor(n * cl(p));
  for (let i = 0; i < shown; i++) { const o = i * gap; line(x + o, y, x + o - h, y + h, { col, lw, alpha, seed: seed + i, wob: 1.5 }); }
  ctx.restore();
}
export const tw = (s, font, size) => { ctx.font = `${size}px ${font}`; return ctx.measureText(s).width; };
export function txt(s, x, y, { font = 'Brush', size = 100, col = C.ink, align = 'center', rot = 0, reveal = 1, shadow = null, sc = 1, alpha = 1 } = {}) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot + j(77, 0.004)); ctx.scale(sc, sc); ctx.globalAlpha = alpha;
  ctx.font = `${size}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  const w = ctx.measureText(s).width;
  if (reveal < 1) { const x0 = align === 'center' ? -w / 2 : align === 'right' ? -w : 0; ctx.beginPath(); ctx.rect(x0 - 30, -size * 1.3, w * reveal + 30, size * 1.8); ctx.clip(); }
  if (shadow) { ctx.fillStyle = shadow.col; ctx.fillText(s, shadow.dx + j(78, 1.5), shadow.dy + j(79, 1.5)); }
  ctx.fillStyle = col; ctx.fillText(s, j(80, 1.2), j(81, 1.2)); ctx.restore(); return w;
}
// marker highlight swipe behind text: draws a translucent band from x1..x2, p = progress 0..1
export function marker(x1, x2, y, h, p, col = C.green, alpha = 0.55) {
  if (p <= 0) return; ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = col; ctx.beginPath();
  const xe = lerp(x1, x2, cl(p));
  ctx.moveTo(x1, y - h / 2 + j(401, 4)); ctx.lineTo(xe, y - h / 2 + j(402, 4)); ctx.lineTo(xe + j(403, 6), y + h / 2 + j(404, 4)); ctx.lineTo(x1 + j(405, 6), y + h / 2 + j(406, 4)); ctx.closePath(); ctx.fill(); ctx.restore();
}
export function scribble(x1, x2, y, p, col, lw = 12, amp = 14) {
  if (p <= 0) return; const pts = [], n = 14; for (let i = 0; i <= n * p; i++) pts.push([lerp(x1, x2, i / n), y + (i % 2 ? amp : -amp)]);
  stroke(pts, { lw, col, seed: 200, amp: 3 });
}
export function arrow(x1, y1, x2, y2, col, lw = 8, p = 1) {
  const ex = lerp(x1, x2, p), ey = lerp(y1, y2, p); line(x1, y1, ex, ey, { col, lw, wob: 6 });
  if (p > 0.95) { const a = Math.atan2(y2 - y1, x2 - x1); for (const s of [-0.5, 0.5]) line(x2, y2, x2 - Math.cos(a + s) * 42, y2 - Math.sin(a + s) * 42, { col, lw, wob: 1 }); }
}
// big red X slash across a box
export function bigX(cx, cy, size, p, col = C.red, lw = 26) {
  const a = seg(p, 0, 0.5), b = seg(p, 0.5, 1), s = size / 2;
  if (a > 0) line(cx - s, cy - s, lerp(cx - s, cx + s, a), lerp(cy - s, cy + s, a), { col, lw, wob: 4, seed: 61 });
  if (b > 0) line(cx + s, cy - s, lerp(cx + s, cx - s, b), lerp(cy - s, cy + s, b), { col, lw, wob: 4, seed: 62 });
}
// comic impact frame: spiky starburst polygon with text inside
export function impact(cx, cy, r, { text, fill = C.red, col = C.ink, tcol = C.paper, size = 120, font = 'Marker', rot = -0.06, sc = 1, spikes = 14 } = {}) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc);
  const pts = []; for (let i = 0; i < spikes * 2; i++) { const a = (i / (spikes * 2)) * Math.PI * 2, rr = i % 2 ? r * 0.72 : r * (0.95 + rn(600 + i) * 0.12); pts.push([Math.cos(a) * rr, Math.sin(a) * rr * 0.8]); }
  poly(pts.map(([x, y]) => [x + 10, y + 12]), { fill: C.ink, col: null, lw: 0, seed: 3 });
  poly(pts, { fill, col, lw: 8, seed: 7 });
  if (text) txt(text, 0, size * 0.32, { font, size, col: tcol });
  ctx.restore();
}
// speech/caption card (short text, <= ~6 words): returns nothing
export function card(cx, cy, w, h, text, { fill = C.paper, col = C.ink, tcol = C.ink, size = 64, font = 'Brush', rot = 0, sc = 1, alpha = 1 } = {}) {
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha = alpha;
  rectS(-w / 2 + 8, -h / 2 + 8, w, h, { fill: C.ink, col: null, lw: 0, seed: 11 });
  rectS(-w / 2, -h / 2, w, h, { fill, col, lw: 6, seed: 13 });
  txt(text, 0, size * 0.3, { font, size, col: tcol }); ctx.restore();
}

// ---------- barcode ----------
const BARS = [3, 1, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2]; // relative bar widths
// draws barcode bars filling box (x,y,w,h). zeros: 0..1 morph from bars to a row of "0" glyphs
export function barcode(x, y, w, h, { col = C.ink, zeros = 0, seed = 500 } = {}) {
  if (zeros > 0.5) { const n = 7; for (let i = 0; i < n; i++) txt('0', x + (i + 0.5) * w / n, y + h * 0.72, { font: 'Mono', size: h * 0.62, col, alpha: seg(zeros, 0.5, 0.9) }); return; }
  const tot = BARS.reduce((a, b) => a + b * 2, 0); let cx = x;
  ctx.save(); ctx.globalAlpha = 1 - seg(zeros, 0, 0.5);
  BARS.forEach((b, i) => { const bw = (b / tot) * w * 2; if (i % 2 === 0) rectS(cx + 0.5, y + j(seed + i, 1.5), Math.max(2, bw - 1), h, { fill: col, col: null, lw: 0, seed: seed + i, amp: 0.8 }); cx += bw; });
  ctx.restore();
}

// ---------- IDdy: the 8-bit walking barcode tag (the hero) ----------
// (x,y) = ground point under feet. s = scale (s=10 -> ~110px tall). Hero colour: ink body on paper tag w/ red lanyard hole.
// opts: sx,sy (squash/stretch), rot, flip, run (phase for leg cycle, 0 = standing), eye: 'open'|'happy'|'wow'|'squint'|'x'|'dot',
//       zeros (0..1 barcode->0000000 morph), armL/armR (0..1 wave), t (for blink), look (-1..1 pupil shift), shadow
export function IDdy(x, y, s, o = {}) {
  s *= 1.6;
  const { sx = 1, sy = 1, rot = 0, flip = 1, run = 0, eye = 'open', zeros = 0, armL = 0, armR = 0, t = 0, look = 0, shadow = true, fill = C.paper, ln = C.ink, lw = 5, alpha = 1 } = o;
  ctx.save(); ctx.globalAlpha = alpha;
  if (shadow) { ctx.fillStyle = 'rgba(26,26,26,.16)'; ctx.beginPath(); ctx.ellipse(x, y + 4, 6.5 * s * sx, 1.0 * s, 0, 0, 7); ctx.fill(); }
  ctx.translate(x, y); ctx.rotate(rot); ctx.scale(flip * sx, sy);
  const ox = -6 * s, oy = -13 * s, P = (c, r, w, h, dy = 0) => [ox + c * s, oy + r * s + dy, w * s, h * s];
  // legs (stubby, pixel)
  [3, 8].forEach((c, i) => { const lift = run ? Math.max(0, Math.sin(run + i * Math.PI)) * s * 1.4 : 0; rectS(...P(c, 10.2, 1.7, 2.8, -lift), { fill: ln, col: ln, lw: 3, seed: 21 + i }); rectS(...P(c - 0.6, 12.4, 2.9, 0.8, -lift), { fill: ln, col: ln, lw: 3, seed: 25 + i }); });
  // arms
  rectS(...P(-0.8, 6, 1.3, 2.2, -armL * s * 2.6), { fill: ln, col: ln, lw: 3, seed: 31 });
  rectS(...P(11.5, 6, 1.3, 2.2, -armR * s * 2.6), { fill: ln, col: ln, lw: 3, seed: 32 });
  // tag body
  rectS(...P(0, 0, 12, 10.6), { fill, col: ln, lw, seed: 41 });
  // lanyard hole
  circle(ox + 6 * s, oy + 0.9 * s, 0.45 * s, { fill: C.ink, col: null, lw: 0, seed: 42 });
  // barcode strip (bottom half)
  barcode(ox + 1.2 * s, oy + 5.6 * s, 9.6 * s, 3.9 * s, { col: ln, zeros });
  // eyes (pixel squares)
  const blink = (Math.floor(t * 30) % 100) < 4, lx = look * 0.35;
  const ex = [3.2, 7.4];
  if (eye === 'happy') { for (const c of ex) stroke([[ox + (c - 0.2) * s, oy + 3.6 * s], [ox + (c + 0.7) * s, oy + 2.6 * s], [ox + (c + 1.6) * s, oy + 3.6 * s]], { lw: lw * 1.3, col: ln, seed: 51 }); }
  else if (eye === 'x') { for (const c of ex) { line(ox + c * s, oy + 2.3 * s, ox + (c + 1.4) * s, oy + 3.7 * s, { col: C.red, lw: 5, wob: 0 }); line(ox + (c + 1.4) * s, oy + 2.3 * s, ox + c * s, oy + 3.7 * s, { col: C.red, lw: 5, wob: 0 }); } }
  else if (blink || eye === 'squint') { for (const c of ex) rectS(...P(c, 3.1, 1.4, 0.4), { fill: ln, col: ln, lw: 2, seed: 52 }); }
  else { const h = eye === 'wow' ? 2.4 : eye === 'dot' ? 1.1 : 1.7, w = eye === 'wow' ? 1.8 : eye === 'dot' ? 1.1 : 1.4;
    for (const c of ex) { rectS(...P(c, 2.2 - (h - 1.7) / 2, w, h), { fill: ln, col: ln, lw: 2, seed: 53 + c });
      rectS(ox + (c + 0.15 + lx) * s, oy + 2.3 * s, 0.45 * s, 0.45 * s, { fill: C.paper, col: null, lw: 0, seed: 1 }); } }
  ctx.restore();
}

// ---------- phone ----------
// Draws a portrait phone with top-left (x,y), width w (height = w*2.05). Returns inner screen rect {x,y,w,h}.
export function phone(x, y, w, { fill = C.paper, screen = C.paper, rot = 0, lw = 8 } = {}) {
  const h = w * 2.05; ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(rot);
  rrect(-w / 2 + 10, -h / 2 + 10, w, h, w * 0.12, { fill: C.ink, col: null, lw: 0, seed: 71 });
  rrect(-w / 2, -h / 2, w, h, w * 0.12, { fill, col: C.ink, lw, seed: 72 });
  const m = w * 0.06, sx = -w / 2 + m, sy = -h / 2 + m * 2.4, sw = w - 2 * m, sh = h - m * 4.4;
  rrect(sx, sy, sw, sh, w * 0.06, { fill: screen, col: C.ink, lw: 4, seed: 73 });
  rectS(-w * 0.12, -h / 2 + m * 0.9, w * 0.24, m * 0.6, { fill: C.ink, col: null, lw: 0, seed: 74 });
  ctx.restore();
  return { x: x + w / 2 + sx, y: y + h / 2 + sy, w: sw, h: sh };   // valid only for rot = 0
}

// ---------- stopwatch ----------
// big hand-drawn stopwatch centred at (cx,cy), radius r. sec = elapsed value to show in the readout (e.g. 0.1), hand = 0..1 sweep angle fraction.
// label: string shown in the face (mono). red = true draws the face accent red
export function stopwatch(cx, cy, r, { hand = 0, label = null, ring = C.ink, face = C.paper, accent = C.red, running = true, t = 0 } = {}) {
  ctx.save(); ctx.translate(cx, cy);
  rectS(-r * 0.18, -r * 1.32, r * 0.36, r * 0.3, { fill: C.ink, col: null, lw: 0, seed: 81 });
  rectS(-r * 0.3, -r * 1.42, r * 0.6, r * 0.14, { fill: C.ink, col: null, lw: 0, seed: 82 });
  circle(7, 9, r, { fill: C.ink, col: null, lw: 0, seed: 83 });
  circle(0, 0, r, { fill: face, col: ring, lw: r * 0.07, seed: 84 });
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 - Math.PI / 2; line(Math.cos(a) * r * 0.82, Math.sin(a) * r * 0.82, Math.cos(a) * r * 0.93, Math.sin(a) * r * 0.93, { col: C.ink, lw: r * 0.04, wob: 0.5, seed: 85 + i }); }
  // swept wedge
  if (hand > 0) { ctx.save(); ctx.globalAlpha = 0.25; ctx.fillStyle = accent; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r * 0.8, -Math.PI / 2, -Math.PI / 2 + hand * Math.PI * 2); ctx.closePath(); ctx.fill(); ctx.restore(); }
  const a = -Math.PI / 2 + hand * Math.PI * 2 + (running ? j(90, 0.01) : 0);
  line(0, 0, Math.cos(a) * r * 0.78, Math.sin(a) * r * 0.78, { col: accent, lw: r * 0.06, wob: 0.5, seed: 90 });
  circle(0, 0, r * 0.07, { fill: C.ink, col: null, lw: 0, seed: 91 });
  if (label) txt(label, 0, r * 0.52, { font: 'Mono', size: r * 0.3, col: C.ink });
  ctx.restore();
}

// ---------- bidder robot (boxy, with paddle) ----------
// (x,y)=feet. opts: paddle: null | number text, up (0..1 raise), col fill, eye, sc, sx, sy, flip, t
export function robot(x, y, s, o = {}) {
  const { paddle = null, up = 0, fill = C.paper, accent = C.red, pcol = C.green, eye = 'open', flip = 1, sx = 1, sy = 1, rot = 0, label = null, alpha = 1, t = 0 } = o;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(flip * sx, sy);
  ctx.fillStyle = 'rgba(26,26,26,.14)'; ctx.beginPath(); ctx.ellipse(0, 4, 6 * s, 1 * s, 0, 0, 7); ctx.fill();
  rectS(-3.4 * s, -3 * s, 1.8 * s, 3 * s, { fill: C.ink, col: null, lw: 0, seed: 101 }); rectS(1.6 * s, -3 * s, 1.8 * s, 3 * s, { fill: C.ink, col: null, lw: 0, seed: 102 });
  rectS(-4.5 * s, -10 * s, 9 * s, 7.4 * s, { fill, col: C.ink, lw: 5, seed: 103 });                    // torso
  rectS(-3.4 * s, -15.6 * s, 6.8 * s, 5.4 * s, { fill, col: C.ink, lw: 5, seed: 104 });                // head
  line(0, -15.6 * s, 0, -17.6 * s, { col: C.ink, lw: 4, wob: 0 }); circle(0, -18 * s, 0.55 * s, { fill: accent, col: C.ink, lw: 3 });
  if (eye === 'happy') { for (const c of [-1.3, 1.3]) stroke([[(c - 0.6) * s, -12.6 * s], [c * s, -13.5 * s], [(c + 0.6) * s, -12.6 * s]], { lw: 5, col: C.ink, seed: 105 }); }
  else if (eye === 'sad') { for (const c of [-1.3, 1.3]) { line((c - 0.6) * s, -13.4 * s, (c + 0.6) * s, -12.4 * s, { col: C.ink, lw: 5, wob: 0 }); } }
  else for (const c of [-1.3, 1.3]) rectS((c - 0.5) * s, -14 * s, 1 * s, 1.3 * s, { fill: C.ink, col: null, lw: 0, seed: 106 });
  if (label) txt(label, 0, -5.4 * s, { font: 'Mono', size: 2.1 * s, col: C.ink });
  // arms: left idle, right holds paddle
  line(-4.5 * s, -8.6 * s, -6.2 * s, -5.5 * s, { col: C.ink, lw: 6, wob: 0.5, seed: 107 });
  const ay = lerp(-4.8 * s, -17 * s, eo3(up)); line(4.5 * s, -8.6 * s, 6.2 * s, ay, { col: C.ink, lw: 6, wob: 0.5, seed: 108 });
  if (paddle !== null && up > 0.05) { ctx.save(); ctx.translate(6.2 * s, ay); line(0, 0, 0, -3 * s, { col: C.ink, lw: 6, wob: 0.5 });
    circle(0, -6 * s, 3.6 * s, { fill: pcol, col: C.ink, lw: 5, seed: 109 }); txt(String(paddle), 0, -4.9 * s, { font: 'Mono', size: 2.9 * s, col: C.paper }); ctx.restore(); }
  ctx.restore();
}

// ---------- envelope (bid request) ----------
export function envelope(cx, cy, w, { open = 0, fill = C.paper, sc = 1, rot = 0, label = 'BID REQ' } = {}) {
  const h = w * 0.68; ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc);
  rectS(-w / 2 + 8, -h / 2 + 8, w, h, { fill: C.ink, col: null, lw: 0, seed: 111 });
  rectS(-w / 2, -h / 2, w, h, { fill, col: C.ink, lw: 6, seed: 112 });
  if (open < 0.5) poly([[-w / 2, -h / 2], [0, h * 0.08], [w / 2, -h / 2]], { fill, col: C.ink, lw: 5, seed: 113 });
  else poly([[-w / 2, -h / 2], [0, -h * 0.9], [w / 2, -h / 2]], { fill, col: C.ink, lw: 5, seed: 114 });
  line(-w / 2, h / 2, -w * 0.12, h * 0.06, { col: C.ink, lw: 4, wob: 1 }); line(w / 2, h / 2, w * 0.12, h * 0.06, { col: C.ink, lw: 4, wob: 1 });
  txt(label, 0, h * 0.34, { font: 'Mono', size: w * 0.11, col: C.red });
  ctx.restore();
}

// ---------- signature (bottom-right) ----------
export function signature(alpha = 1) { txt('hemanthvasi', W - 52, H - 44, { font: 'Brush', size: 46, col: C.ink, align: 'right', alpha: 0.75 * alpha, rot: -0.02 }); }

// ---------- vignette / cut helpers ----------
export function flash(a, col = C.paper) { if (a <= 0) return; ctx.save(); ctx.globalAlpha = cl(a); ctx.fillStyle = col; ctx.fillRect(0, 0, W, H); ctx.restore(); }
// zoom about a point (call ctx.save() before; ctx.restore() after)
export function zoomAbout(cx, cy, z) { ctx.translate(cx, cy); ctx.scale(z, z); ctx.translate(-cx, -cy); }
