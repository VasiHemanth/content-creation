// "terminal" style: dark developer terminal / code-review look.
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { ctx, cv, W, H, FPS } from '../core.mjs';
import { HANDLE } from '../brand.mjs';

const P = {
  bg: '#0d1117', panel: '#161b22', bar: '#1c2128', line: '#30363d', green: '#3fb950', red: '#f85149',
  amber: '#d29922', cyan: '#58a6ff', dim: '#8b949e', white: '#e6edf3',
};
const PX = 60, PW = 920, IX0 = 100, IX1 = 940, IW = IX1 - IX0, CY = 845;

// ---------- small utils ----------
const cl = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ez = (x) => 1 - Math.pow(1 - cl(x), 3);
const pr = (t, s, l = 0.5) => cl((t - s) / l);
const hash = (n) => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
function sched(n, dur, t0 = 0.5, tail = 2.0, maxStep = 1.1) {
  const last = Math.max(t0, dur - tail), step = n > 1 ? Math.min(maxStep, (last - t0) / (n - 1)) : 0;
  return Array.from({ length: n }, (_, i) => t0 + i * step);
}
const measure = (s, size) => { ctx.font = `${size}px Mono`; return ctx.measureText(s).width; };
function wrap(s, size, maxW) {
  const words = s.split(' '), out = []; let cur = '';
  for (const w of words) {
    const tryS = cur ? `${cur} ${w}` : w;
    if (measure(tryS, size) <= maxW) { cur = tryS; continue; }
    if (cur) out.push(cur);
    if (measure(w, size) <= maxW) { cur = w; continue; }
    let part = ''; for (const ch of w) { if (measure(part + ch, size) > maxW) { out.push(part); part = ch; } else part += ch; }
    cur = part;
  }
  if (cur) out.push(cur);
  return out;
}
function fit(s, maxW, maxSize, minSize = 28, maxLines = 1) {
  for (let sz = maxSize; sz >= minSize; sz -= 2) { const lines = wrap(s, sz, maxW); if (lines.length <= maxLines) return { size: sz, lines }; }
  return { size: minSize, lines: wrap(s, minSize, maxW) };
}
function T(s, x, y, { size = 32, col = P.white, align = 'left', alpha = 1, bold = false } = {}) {
  if (alpha <= 0 || !s) return;
  ctx.save(); ctx.font = `${size}px Mono`; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.globalAlpha = alpha; ctx.fillStyle = col;
  ctx.fillText(s, x, y);
  if (bold) { ctx.strokeStyle = col; ctx.lineWidth = size * 0.055; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
  ctx.restore();
}
function rr(x, y, w, h, r, fill, stroke, lw = 2, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
  ctx.restore();
}
function rect(x, y, w, h, col, alpha = 1) { if (w <= 0 || h <= 0) return; ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = col; ctx.fillRect(x, y, w, h); ctx.restore(); }
function cursor(x, y, size, t, solid = false, col = P.green) {
  if (!solid && Math.floor(t / 0.5) % 2 === 1) return;
  rect(x + 2, y - size * 0.8, size * 0.56, size * 1.0, col, 0.95);
}

// ---------- background, CRT ----------
const base = createCanvas(W, H), bg0 = base.getContext('2d');
bg0.fillStyle = P.bg; bg0.fillRect(0, 0, W, H);
const glow = bg0.createRadialGradient(540, 860, 100, 540, 860, 1150);
glow.addColorStop(0, 'rgba(88,166,255,0.07)'); glow.addColorStop(1, 'rgba(0,0,0,0.0)');
bg0.fillStyle = glow; bg0.fillRect(0, 0, W, H);
bg0.fillStyle = 'rgba(139,148,158,0.16)';
for (let y = 40; y < H; y += 48) for (let x = 40; x < W; x += 48) bg0.fillRect(x, y, 2, 2);
const vig = bg0.createRadialGradient(540, 960, 600, 540, 960, 1250);
vig.addColorStop(0, 'rgba(0,0,0,0)'); vig.addColorStop(1, 'rgba(0,0,0,0.55)');
bg0.fillStyle = vig; bg0.fillRect(0, 0, W, H);
const scan = createCanvas(W, H), sg = scan.getContext('2d');
sg.fillStyle = 'rgba(0,0,0,0.16)'; for (let y = 0; y < H; y += 4) sg.fillRect(0, y, W, 2);

function crt(t) {
  const f = Math.floor(Math.round(t * FPS) / 3), fl = hash(f);
  ctx.drawImage(scan, 0, 0);
  rect(0, 0, W, H, '#9fc4ff', 0.008 + 0.018 * fl);
  const by = ((t * 170) % 2600) - 300;
  const g = ctx.createLinearGradient(0, by, 0, by + 260);
  g.addColorStop(0, 'rgba(160,200,255,0)'); g.addColorStop(0.5, 'rgba(160,200,255,0.035)'); g.addColorStop(1, 'rgba(160,200,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, by, W, 260);
}
function withCrt(fn) {
  return (t, d, dur) => {
    fn(t, d, dur);
    crt(t);
  };
}

// ---------- pixel robot ----------
const BOT = [
  '.....a......', '.....w......', '..bbbbbbbb..', '..bvvvvvvb..', '..bveevveb..'.replace('veevve', 'veevve'), '..bvvvvvvb..', '..bbbbbbbb..',
  '.sbbbbbbbbs.', 'ssbbcccbbbss', '.sbbbbbbbbs.', '..kk....kk..',
];
function bot(x, footY, s, t) {
  const blink = (t % 3.1) > 2.98, ant = Math.floor(t / 0.5) % 2 === 0;
  const cols = { b: '#c9d1d9', v: '#0d1117', e: P.cyan, a: ant ? P.green : '#238636', w: '#8b949e', s: '#8b949e', c: P.green, k: '#6e7681' };
  const top = footY - BOT.length * s;
  BOT.forEach((row, r) => [...row].forEach((ch, c) => {
    if (ch === '.') return;
    let col = cols[ch]; if (ch === 'e' && blink) col = cols.v;
    rect(x + c * s, top + r * s, s, s, col);
  }));
}

// ---------- panel ----------
function place(Hc, pad = 36, minH = 0) {
  const h = Math.max(minH, Hc + 64 + pad * 2), y0 = Math.max(250, Math.min(CY - h / 2, 1430 - h));
  return { y0, h, top: y0 + 64 + (h - 64 - Hc) / 2 };
}
function panel(y0, h, label, t, mascot = true, ms = 7) {
  const p = ez(pr(t, 0, 0.3));
  ctx.save(); ctx.globalAlpha = p;
  rr(PX, y0, PW, h, 18, P.panel, P.line, 2);
  ctx.save(); ctx.beginPath(); ctx.roundRect(PX, y0, PW, h, 18); ctx.clip(); rect(PX, y0, PW, 64, P.bar); ctx.restore();
  rect(PX + 1, y0 + 64, PW - 2, 2, P.line);
  [[P.red, 0], [P.amber, 1], [P.green, 2]].forEach(([c, i]) => { ctx.beginPath(); ctx.fillStyle = c; ctx.arc(PX + 38 + i * 38, y0 + 32, 10, 0, 7); ctx.fill(); });
  if (label) {
    const f = fit(label, PW - 240, 28, 24, 1), lw = measure(f.lines[0], f.size);
    rr(PX + 150, y0 + 14, lw + 44, 50, 10, P.panel);
    rect(PX + 150, y0 + 14, lw + 44, 3, P.cyan);
    T(f.lines[0], PX + 172, y0 + 48, { size: f.size, col: P.white });
  }
  ctx.restore();
  if (mascot) bot(PX + PW - 130, y0 + 2, ms, t);
}

// =====================================================================
function hook(t, d, dur) {
  const lines = d.lines, n = lines.length;
  const longest = lines.reduce((a, b) => (b.length > a.length ? b : a), '');
  let size = 150; while (size > 60 && measure(`$ ${longest}`, size) > IW) size -= 2;
  const lh = size * 1.28, sub = d.sub ? fit(`# ${d.sub}`, IW, 40, 30, 3) : null;
  const subLh = sub ? sub.size * 1.4 : 0;
  const Hc = n * lh + (sub ? 50 + sub.lines.length * subLh : 0);
  const pl = place(Hc, 70, 1000);
  panel(pl.y0, pl.h, null, t);
  const total = lines.reduce((a, l) => a + l.length, 0), t0 = 0.12, cps = 26;
  let cnt = Math.max(0, (t - t0) * cps), cx = IX0, cyy = 0, solid = false;
  lines.forEach((l, i) => {
    const y = pl.top + i * lh + size * 0.88, k = Math.min(l.length, Math.max(0, Math.floor(cnt))); cnt -= l.length;
    if (cnt + l.length <= 0 && i > 0) return;
    const lastLine = i === n - 1;
    T(i === 0 ? '$' : '>', IX0, y, { size, col: i === 0 ? P.green : P.dim, bold: true });
    const pw = measure('$ ', size);
    const s = l.slice(0, k);
    T(s, IX0 + pw, y, { size, col: lastLine ? P.amber : P.white, bold: true });
    cx = IX0 + pw + measure(s, size); cyy = y; if (k > 0 && k < l.length) solid = true;
  });
  const doneAt = t0 + total / cps;
  if (t - doneAt < 0.3) solid = true;
  cursor(cx, cyy, size, t, solid || t < doneAt);
  if (sub) {
    const sp = pr(t, doneAt + 0.3, 0.9), sc = Math.floor(sp * 60);
    let rem = sc;
    sub.lines.forEach((l, i) => { const s = l.slice(0, Math.max(0, rem)); rem -= l.length; T(s, IX0, pl.top + n * lh + 50 + i * subLh + sub.size, { size: sub.size, col: P.dim }); });
  }
}

// ---------- flow ----------
const atT = (frac, dur) => Math.min(dur * frac, dur - 1.9);
function startTimes(items, dur, t0 = 0.5, tail = 2.2, maxStep = 1.5) {
  const auto = sched(items.length, dur, t0, tail, maxStep);
  return items.map((it, i) => (it.at != null ? atT(it.at, dur) : auto[i]));
}

function flow(t, d, dur) {
  const steps = d.steps, n = steps.length, flags = d.flags || [];
  const cardX = IX0, cardW = IW, lx = cardX + 62, lw = cardW - 62 - 24;
  const cards = steps.map((s) => {
    const lab = fit(s.label, lw, 44, 34, 2), sub = s.sub ? fit(`# ${s.sub}`, lw, 32, 30, 2) : null;
    const h = 26 + lab.lines.length * lab.size * 1.22 + (sub ? 10 + sub.lines.length * sub.size * 1.3 : 0) + 24;
    return { lab, sub, h };
  });
  const flagLay = steps.map((_, i) => {
    const f = flags.filter((x) => (x.step ?? x.at) === i && x.step != null).map((x) => ({ ...x, fit: fit(x.text, IW - 80, 32, 30, 2) }));
    return { f, h: f.reduce((acc, x) => acc + x.fit.lines.length * x.fit.size * 1.3 + 10, 0) };
  });
  const cardsH = cards.reduce((acc, c) => acc + c.h, 0);
  let gaps = steps.map((_, i) => (i < n - 1 ? Math.max(86, flagLay[i].h + 44) : flagLay[i].h ? flagLay[i].h + 30 : 0));
  const natural = cardsH + gaps.reduce((x, y) => x + y, 0);
  const share = Math.max(0, 1000 - natural) / Math.max(1, n - 1);
  gaps = gaps.map((g, i) => (i < n - 1 ? g + Math.min(60, share) : g));
  const Hc = cardsH + gaps.reduce((x, y) => x + y, 0);
  const pl = place(Hc, 40, 0);
  panel(pl.y0, pl.h, d.title, t);
  const st = startTimes(steps, dur, 0.5, 2.2, 1.9);
  let y = pl.top;
  steps.forEach((s, i) => {
    const c = cards[i], p = ez(pr(t, st[i], 0.5));
    ctx.save(); ctx.globalAlpha = p;
    rr(cardX, y, cardW, c.h, 12, P.bg, P.line, 2);
    rect(cardX, y + 8, 6, c.h - 16, P.green);
    ctx.restore();
    const tp = pr(t, st[i] + 0.1, 0.6), chars = Math.floor(tp * 40);
    T('$', cardX + 22, y + 26 + c.lab.size * 0.9, { size: c.lab.size, col: P.green, bold: true, alpha: p });
    let rem = chars, yy = y + 26;
    c.lab.lines.forEach((l) => { yy += c.lab.size * 1.22; T(l.slice(0, Math.max(0, rem)), lx, yy - c.lab.size * 0.3, { size: c.lab.size, col: P.white, bold: true }); rem -= l.length; });
    if (c.sub) {
      yy += 10;
      const sa = ez(pr(t, st[i] + 0.35, 0.4));
      c.sub.lines.forEach((l) => { yy += c.sub.size * 1.3; T(l, lx, yy - c.sub.size * 0.28, { size: c.sub.size, col: P.dim, alpha: sa }); });
    }
    if (tp < 1 && tp > 0) { const lastL = c.lab.lines[0]; cursor(lx + measure(lastL.slice(0, Math.min(lastL.length, chars)), c.lab.size), y + 26 + c.lab.size * 0.92, c.lab.size, t, true); }
    const gap = gaps[i], yb = y + c.h;
    if (i < n - 1) {
      const cs = Math.max(st[i] + 0.4, st[i + 1] - 0.35), cp = ez(pr(t, cs, 0.35)), cx = cardX + 38;
      rect(cx - 2, yb + 4, 4, (gap - 22) * cp, P.dim);
      if (cp > 0.95) { ctx.save(); ctx.fillStyle = P.dim; ctx.beginPath(); ctx.moveTo(cx - 12, yb + gap - 24); ctx.lineTo(cx + 12, yb + gap - 24); ctx.lineTo(cx, yb + gap - 4); ctx.fill(); ctx.restore(); }
    }
    let fy = yb + (i < n - 1 ? (gap - flagLay[i].h) / 2 : 14);
    flagLay[i].f.forEach((f) => {
      const ft = Math.max(f.at != null ? atT(f.at, dur) : 0, st[i] + 0.3), fp = ez(pr(t, ft, 0.5));
      rect(cardX + 70, fy + 4, 5, f.fit.lines.length * f.fit.size * 1.3 - 6, P.cyan, fp);
      let rem = Math.floor(pr(t, ft, 0.7) * 80);
      f.fit.lines.forEach((l) => { fy += f.fit.size * 1.3; T(l.slice(0, Math.max(0, rem)), cardX + 92, fy - f.fit.size * 0.3, { size: f.fit.size, col: P.cyan, alpha: fp }); rem -= l.length; });
      fy += 10;
    });
    y += c.h + gap;
  });
}

// ---------- bigstat ----------
function bigstat(t, d, dur) {
  const items = d.items, n = items.length, foot = d.foot;
  const wmax = Math.max(...items.map((i) => i.value.length));
  let vs = Math.min(210, Math.floor((IW - 20) / (wmax * 0.6)));
  const rowH = vs * 0.78 + 20 + 46 + 40;
  const ft = foot ? fit(`# ${foot}`, IW, 36, 30, 1) : null;
  const Hc = n * rowH + (ft ? 20 + ft.lines.length * ft.size * 1.4 : 0);
  const pl = place(Hc, 44, 1000);
  panel(pl.y0, pl.h, null, t);
  const st = startTimes(items, dur, 0.5, 2.2, 1.7), cols = [P.green, P.cyan, P.amber];
  const footT = d.footAt != null ? atT(d.footAt, dur) : Math.min(dur - 2.2, st[n - 1] + 1.2);
  let y = pl.top;
  items.forEach((it, i) => {
    const p = pr(t, st[i], 0.7), k = Math.floor(p * (it.value.length + 0.99)), s = it.value.slice(0, k);
    const by = y + vs * 0.78;
    T('>', IX0, by - vs * 0.12, { size: Math.min(60, vs * 0.4), col: P.dim, alpha: ez(p * 3) });
    const vx = IX0 + 52;
    T(s, vx, by, { size: vs, col: cols[i % 3], bold: true });
    if (p < 1 && p > 0) cursor(vx + measure(s, vs), by, vs, t, true, cols[i % 3]);
    const la = ez(pr(t, st[i] + 0.55, 0.4)), lf = fit(`# ${it.label}`, IW - 52, 46, 30, 1);
    T(lf.lines[0], vx, by + 20 + lf.size, { size: lf.size, col: P.dim, alpha: la });
    y += rowH;
  });
  if (ft) {
    const fp = pr(t, footT, 0.8); let rem = Math.floor(fp * 60);
    ft.lines.forEach((l, i) => { T(l.slice(0, Math.max(0, rem)), IX0, y + 20 + (i + 1) * ft.size * 1.4 - 12, { size: ft.size, col: P.white }); rem -= l.length; });
  }
}

// ---------- versus (two neutral series) ----------
function pixBar(x, y, w, h, frac, col, p = 1) {
  const bw = Math.max(10, Math.round(h * 0.5)), gap = 5, pitch = bw + gap, fw = w * frac * ez(p);
  for (let xx = 0; xx < fw - 1; xx += pitch) rect(x + xx, y, Math.min(bw, fw - xx), h, col);
}
function versus(t, d, dur) {
  const rows = d.rows, n = rows.length, A = P.cyan, B = P.amber;
  const hdr = 66, rowGap = 40, lineH = 112, labelH = 70;
  const rowH = labelH + lineH * 2;
  const Hc = hdr * 2 + 36 + n * rowH + (n - 1) * rowGap;
  const pl = place(Hc, 40, 880);
  panel(pl.y0, pl.h, null, t);
  const hp = ez(pr(t, 0.4, 0.5)), x0 = IX0;
  const hf = Math.min(fit(d.aTitle, IW - 70, 42, 30).size, fit(d.bTitle, IW - 70, 42, 30).size);
  [[d.aTitle, A], [d.bTitle, B]].forEach(([nm, c], i) => {
    const y = pl.top + i * hdr;
    rect(x0 - 10, y, IW + 20, hdr - 6, c, 0.13 * hp);
    rect(x0, y + 15, 30, 30, c, hp);
    T(nm, x0 + 50, y + hdr * 0.68, { size: hf, col: P.white, alpha: hp, bold: true });
  });
  const st = startTimes(rows, dur, 1.1, 2.2, 1.6), maxBar = 500, vs = 42;
  rows.forEach((r, i) => {
    const y = pl.top + hdr * 2 + 36 + i * (rowH + rowGap), p = pr(t, st[i], 0.5);
    const lf = fit(r.label, IW, 40, 30, 1);
    T(r.label, x0, y + 44, { size: lf.size, col: P.dim, alpha: ez(p * 2) });
    [['a', A, r.aW], ['b', B, r.bW]].forEach(([k, col, wv], j) => {
      const ly = y + labelH + j * lineH, lp = pr(t, st[i] + 0.25 + j * 0.45, 0.6);
      rect(x0 - 10, ly, IW + 20, lineH - 10, col, 0.1 * ez(lp * 2));
      rect(x0, ly + 28, 26, 26, col, ez(lp * 2));
      pixBar(x0 + 56, ly + 20, maxBar, lineH - 50, wv, col, lp);
      const vx = x0 + 56 + maxBar * wv + 22;
      T(r[k], Math.min(vx, IX1 - measure(r[k], vs)), ly + 64, { size: vs, col: P.white, bold: true, alpha: ez((lp - 0.4) * 2.5) });
    });
  });
}


// ---------- bars ----------
function bars(t, d, dur) {
  const rows = d.rows, n = rows.length, unit = d.unit || '';
  const sub = d.subtitle ? fit(`# ${d.subtitle}`, IW, 32, 30, 5) : null;
  const subLh = sub ? sub.size * 1.36 : 0, subH = sub ? sub.lines.length * subLh + 26 : 0;
  const avail = 1180 - 64 - 56 - subH - 30;
  const k = Math.min(2.7, avail / (n * 124)), ks = Math.min(1.55, k), kb = Math.min(2.7, k);
  const labS = Math.round(34 * ks), tagS = Math.max(26, Math.round(26 * ks)), valS = Math.round(34 * ks), rightS = Math.round(36 * ks);
  const barH = Math.round(40 * kb), rowH = 124 * k, line1 = labS + 8;
  const Hc = subH + n * rowH;
  const pl = place(Hc, 30, 0);
  panel(pl.y0, pl.h, d.title, t);
  if (sub) {
    const sa = pr(t, 0.3, 1.0); let rem = Math.floor(sa * 400);
    sub.lines.forEach((l, i) => { T(l.slice(0, Math.max(0, rem)), IX0, pl.top + (i + 1) * subLh - 8, { size: sub.size, col: P.dim }); rem -= l.length; });
  }
  const auto = sched(n, dur, 0.9, 2.2, 1.0);
  const track = IW;
  rows.forEach((r, i) => {
    const s0 = r.at != null ? atT(r.at, dur) : auto[i], lt = 0.5 + i * 0.18;
    const y = pl.top + subH + i * rowH, base = y + line1 - 6;
    const hi = !!r.hi, col = hi ? P.green : '#2a7a3a';
    const la = ez(pr(t, lt, 0.35)); let lx = IX0;
    T(r.label, lx, base, { size: labS, col: P.white, bold: hi, alpha: la });
    if (r.tag) {
      const tx = lx + measure(r.label, labS) + 18, tw = measure(r.tag, tagS) + 22;
      rr(tx, base - tagS * 0.95 - 2, tw, tagS + 14, 8, null, hi ? P.green : P.dim, 2, la);
      T(r.tag, tx + 11, base + 2, { size: tagS, col: hi ? P.green : P.dim, alpha: la });
    }
    if (r.right) T(r.right, IX1, base, { size: rightS, col: P.amber, align: 'right', alpha: ez(pr(t, s0 + 0.4, 0.4)) });
    const by = base + 16 + 4 * ks, frac = r.value / d.axisMax;
    for (let xx = 0; la > 0.01 && xx < track; xx += Math.round(barH * 0.5) + 5) rect(IX0 + xx, by, Math.min(Math.round(barH * 0.5), track - xx), barH, P.white, 0.07 * la);
    const bp = pr(t, s0 + 0.1, 0.7);
    pixBar(IX0, by, track, barH, frac, col, bp);
    const endX = IX0 + track * frac * ez(bp), errPx = (r.err || 0) / d.axisMax * track;
    let txtX = endX + 14;
    if (r.err && bp >= 1) {
      const wa = ez(pr(t, s0 + 0.8, 0.3)), x1 = IX0 + track * frac - errPx, x2 = IX0 + track * frac + errPx, cy = by + barH / 2, ch = barH * 0.95;
      ctx.save(); ctx.globalAlpha = wa; ctx.lineCap = 'butt';
      for (const [c, lw] of [[P.bg, 9], [P.white, 4]]) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(x1, cy); ctx.lineTo(x2, cy); ctx.moveTo(x1, cy - ch / 2); ctx.lineTo(x1, cy + ch / 2); ctx.moveTo(x2, cy - ch / 2); ctx.lineTo(x2, cy + ch / 2); ctx.stroke(); }
      ctx.restore();
      txtX = x2 + 16;
    } else if (r.err) txtX = endX + 16;
    const vt = `${r.value}${unit}`, va = ez(pr(t, s0 + 0.6, 0.3));
    let vz = valS; while (vz > 30 && txtX + measure(vt, vz) + 24 > IX1) vz -= 2;
    const cw = measure(vt, vz) + 24, chh = vz + 18;
    if (va > 0) {
      ctx.save(); ctx.globalAlpha = va;
      rr(txtX, by + barH / 2 - chh / 2, cw, chh, 8, P.panel, P.line, 2);
      ctx.restore();
      T(vt, txtX + 12, by + barH / 2 + vz * 0.34, { size: vz, col: P.white, bold: true, alpha: va });
    }
  });
}

// ---------- callout ----------
function callout(t, d, dur) {
  const warn = d.kind !== 'info', col = warn ? P.amber : P.cyan, rule = warn ? P.red : P.cyan;
  const tf = fit(d.title, IW - 20, 56, 40, 2);
  const lw = IW - 60 - 20, ls = d.lines.map((l) => fit(l, lw, 42, 34, 3));
  const rows = ls.map((f) => ({ f, h: f.lines.length * f.size * 1.3 + 44 }));
  const titleH = tf.lines.length * tf.size * 1.25 + 44;
  const Hc = titleH + rows.reduce((a, r) => a + r.h + 14, 0);
  const pl = place(Hc, 44, 820);
  panel(pl.y0, pl.h, null, t);
  const rp = ez(pr(t, 0.3, 0.8)), top = pl.top, bot0 = pl.top + Hc;
  rect(IX0 - 6, top, 10, (bot0 - top) * rp, rule);
  const tp = pr(t, 0.45, 0.7); let rem = Math.floor(tp * 40);
  tf.lines.forEach((l, i) => { T(l.slice(0, Math.max(0, rem)), IX0 + 30, top + 18 + (i + 1) * tf.size * 1.25 - 10, { size: tf.size, col, bold: true }); rem -= l.length; });
  const st = sched(rows.length, dur, 1.2, 2.3, 1.7);
  let y = top + titleH;
  rows.forEach((r, i) => {
    const p = pr(t, st[i], 0.5), a = ez(p * 2);
    rect(IX0 + 14, y, IW - 14, r.h, rule, (i % 2 ? 0.1 : 0.16) * a);
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = col; ctx.beginPath();
    const ty = y + r.h / 2 - 15; ctx.moveTo(IX0 + 48, ty); ctx.lineTo(IX0 + 68, ty + 32); ctx.lineTo(IX0 + 28, ty + 32); ctx.closePath(); ctx.fill();
    ctx.fillStyle = P.panel; ctx.fillRect(IX0 + 46, ty + 12, 4, 11); ctx.fillRect(IX0 + 46, ty + 25, 4, 4); ctx.restore();
    let rem2 = Math.floor(p * 70), yy = y + 22;
    r.f.lines.forEach((l) => { yy += r.f.size * 1.3; T(l.slice(0, Math.max(0, rem2)), IX0 + 84, yy - r.f.size * 0.3, { size: r.f.size, col: P.white }); rem2 -= l.length; });
    y += r.h + 14;
  });
}

// ---------- checklist ----------
function glyph(kind, cx, cy, s, p) {
  const col = kind === 'check' ? P.green : kind === 'x' ? P.red : P.amber;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(0.6 + 0.4 * ez(p), 0.6 + 0.4 * ez(p)); ctx.globalAlpha = ez(p * 2);
  ctx.beginPath(); ctx.roundRect(-s / 2, -s / 2, s, s, 12); ctx.fillStyle = col + '2a'; ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = s * 0.12; ctx.beginPath();
  if (kind === 'check') { ctx.moveTo(-s * 0.26, 0); ctx.lineTo(-s * 0.06, s * 0.22); ctx.lineTo(s * 0.28, -s * 0.2); }
  else if (kind === 'x') { ctx.moveTo(-s * 0.22, -s * 0.22); ctx.lineTo(s * 0.22, s * 0.22); ctx.moveTo(s * 0.22, -s * 0.22); ctx.lineTo(-s * 0.22, s * 0.22); }
  else { ctx.moveTo(-s * 0.24, 0); ctx.lineTo(s * 0.24, 0); }
  ctx.stroke(); ctx.restore();
}
function checklist(t, d, dur) {
  const items = d.items, n = items.length, gs = 76, tw = IW - gs - 40;
  const tf = fit(d.title, IW, 54, 36, 2);
  const lay = items.map((it) => { const f = fit(it.text, tw, 42, 34, 3); return { f, h: Math.max(130, f.lines.length * f.size * 1.3 + 56) }; });
  const titleH = tf.lines.length * tf.size * 1.25 + 40 + 30;
  const Hc = titleH + lay.reduce((a, r) => a + r.h + 14, 0);
  const pl = place(Hc, 36, 880);
  panel(pl.y0, pl.h, null, t);
  const tp = pr(t, 0.4, 0.7); let rem = Math.floor(tp * 50);
  tf.lines.forEach((l, i) => { T(l.slice(0, Math.max(0, rem)), IX0, pl.top + (i + 1) * tf.size * 1.25 - 10, { size: tf.size, col: P.white, bold: true }); rem -= l.length; });
  const ly = pl.top + tf.lines.length * tf.size * 1.25 + 8;
  rect(IX0, ly, IW * ez(pr(t, 0.5, 0.6)), 4, P.line);
  const st = sched(n, dur, 1.1, 2.2, 1.2);
  let y = pl.top + titleH;
  items.forEach((it, i) => {
    const r = lay[i], p = pr(t, st[i], 0.55), col = it.mark === 'check' ? P.green : it.mark === 'x' ? P.red : P.amber;
    rect(IX0 - 10, y, IW + 20, r.h, col, 0.09 * ez(p * 2));
    rect(IX0 - 10, y, 6, r.h * ez(p * 2), col);
    glyph(it.mark, IX0 + 20 + gs / 2, y + r.h / 2, gs, pr(t, st[i] + 0.15, 0.4));
    let rem2 = Math.floor(p * 80), yy = y + (r.h - r.f.lines.length * r.f.size * 1.3) / 2;
    r.f.lines.forEach((l) => { yy += r.f.size * 1.3; T(l.slice(0, Math.max(0, rem2)), IX0 + gs + 40, yy - r.f.size * 0.3, { size: r.f.size, col: P.white }); rem2 -= l.length; });
    y += r.h + 14;
  });
}

// ---------- endcard ----------
function packNames(names, size, maxW) {
  const out = []; let cur = '';
  names.forEach((nm, i) => {
    const piece = nm + (i < names.length - 1 ? ',' : ''), tryS = cur ? `${cur} ${piece}` : piece;
    if (cur && measure(tryS, size) > maxW) { out.push(cur); cur = piece; } else cur = tryS;
  });
  if (cur) out.push(cur); return out;
}
function endcard(t, d, dur) {
  let ns = 150; while (ns > 60 && measure(d.name, ns) > IW) ns -= 2;
  const as = 40, al = packNames(d.authors || [], as, IW);
  const tag = d.tagline ? fit(`# ${d.tagline}`, IW, 42, 30, 2) : null;
  const hs = Math.min(60, Math.floor(IW / (`$ ${HANDLE}`.length * 0.6)));
  const secs = [ns * 1.05 + 20, 70, al.length * as * 1.4 + 20, tag ? tag.lines.length * tag.size * 1.4 + 20 : 0, 110];
  const Hc = secs.reduce((a, b) => a + b, 0) + 24;
  const pl = place(Hc, 44, 900);
  panel(pl.y0, pl.h, d.name, t, true, 9);
  const st = [0.2, 0.5, 0.8, 1.1, 1.4];
  let y = pl.top;
  const p0 = pr(t, st[0], 0.7);
  // check badge
  T(d.name.slice(0, Math.floor(p0 * (d.name.length + 0.99))), IX0, y + ns * 0.9, { size: ns, col: P.white, bold: true });
  y += secs[0];
  T(`arXiv ${d.arxivId}`, IX0, y + 40, { size: 50, col: P.cyan, bold: true, alpha: ez(pr(t, st[1], 0.4)) });
  y += secs[1];
  const aa = ez(pr(t, st[2], 0.5));
  al.forEach((l, i) => T(l, IX0, y + (i + 1) * as * 1.4 - 10, { size: as, col: P.white, alpha: aa }));
  y += secs[2];
  if (tag) { const ta = ez(pr(t, st[3], 0.5)); tag.lines.forEach((l, i) => T(l, IX0, y + (i + 1) * tag.size * 1.4 - 10, { size: tag.size, col: P.dim, alpha: ta })); }
  y += secs[3];
  rect(IX0, y, IW, 3, P.line, ez(pr(t, st[4], 0.4)));
  const hp = pr(t, st[4] + 0.1, 0.5), hy = y + 24 + hs * 1.0;
  const hstr = `$ ${HANDLE}`, k = Math.floor(hp * (hstr.length + 0.99));
  T(hstr.slice(0, k), IX0, hy, { size: hs, col: P.white, bold: true });
  T('$', IX0, hy, { size: hs, col: P.green, bold: true, alpha: k > 0 ? 1 : 0 });
  cursor(IX0 + measure(hstr.slice(0, k), hs), hy, hs, t, hp < 1);
}

// ---------- caption ----------
function caption(text, alpha) {
  const bx = 60, by = 1490, bw = 960, bh = 96;
  ctx.save(); ctx.globalAlpha = alpha;
  rr(bx, by, bw, bh, 14, 'rgba(13,17,23,0.92)', P.line, 2);
  rect(bx + 1, by + 12, 5, bh - 24, P.green);
  const avail = bw - 2 * 24 - 40;
  const f = fit(text, avail, 44, 40, 2), two = f.lines.length > 1;
  const size = f.size, lh = size * 1.12, tot = f.lines.length * lh;
  let sz = size; if (!two) { while (sz > 40 && measure(f.lines[0], sz) > avail) sz -= 1; }
  const y0 = by + (bh - tot) / 2;
  f.lines.forEach((l, i) => T(l, bx + 28 + 20 + avail / 2, y0 + (i + 1) * lh - size * 0.2, { size: sz, col: P.white, align: 'center' }));
  ctx.restore();
}

function background(t) {
  ctx.drawImage(base, 0, 0);
}

async function thumbnail({ name, hook: hk, arxivId }, outPath) {
  ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H); ctx.drawImage(base, 0, 0);
  const lines = (hk || '').split('\n').filter(Boolean);
  const longest = lines.reduce((a, b) => (b.length > a.length ? b : a), '');
  let size = 150; while (size > 60 && measure(longest, size) + size * 0.9 > IW) size -= 2;
  const lh = size * 1.28;
  const Hc = lines.length * lh + 60 + 150 + 70 + 90;
  const h = Math.max(Hc + 64 + 100, 900), y0 = 960 - h / 2;
  ctx.save(); ctx.translate(520, 960); ctx.scale(1.06, 1.06); ctx.translate(-520, -960);
  panel(y0, h, name, 1, true, 8);
  let y = y0 + 64 + (h - 64 - Hc) / 2;
  lines.forEach((l, i) => {
    const by = y + i * lh + size * 0.88;
    T(i === 0 ? '$' : '>', IX0, by, { size, col: i === 0 ? P.green : P.dim, bold: true });
    T(l, IX0 + size * 0.9, by, { size, col: i === lines.length - 1 ? P.amber : P.white, bold: true });
  });
  y += lines.length * lh + 60;
  let ns = 130; while (ns > 50 && measure(name, ns) > IW) ns -= 2;
  T(name, IX0, y + ns * 0.85, { size: ns, col: P.green, bold: true });
  y += 150;
  T(`arXiv ${arxivId}`, IX0, y + 40, { size: 46, col: P.cyan });
  y += 70;
  const hs = Math.min(56, Math.floor(IW / (`$ ${HANDLE}`.length * 0.6)));
  rect(IX0, y + 10, IW, 3, P.line);
  T(`$ ${HANDLE}`, IX0, y + 20 + hs, { size: hs, col: P.white, bold: true });
  T('$', IX0, y + 20 + hs, { size: hs, col: P.green, bold: true });
  ctx.restore();
  crt(0.3);
  fs.writeFileSync(outPath, cv.toBuffer('image/png'));
}

export default {
  name: 'terminal',
  bg: P.bg,
  background,
  caption,
  blocks: Object.fromEntries(Object.entries({ hook, flow, bigstat, versus, bars, callout, checklist, endcard }).map(([k, f]) => [k, withCrt(f)])),
  thumbnail,
};
