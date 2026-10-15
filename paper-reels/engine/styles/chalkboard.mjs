// "chalkboard" style: classroom blackboard, everything drawn in chalk.
import fs from 'node:fs';
import { cv } from '../core.mjs';
import { HANDLE } from '../brand.mjs';
import {
  ctx, COL, cl, sched, pr, seg, layout, measure, text, textLines, chalk, line, rrect, rrPts, ellipse, underline,
  arrow, hatch, solidStroke, robot, drawBoard, hr, setFont,
} from './chalkboard-lib.mjs';

const X0 = 90, X1 = 930, CW = X1 - X0, TOP = 170, BOT = 1430;

// start times honoring optional per-item `at` (fraction of dur), clamped so the item has >= 1.9 s
function times(items, dur, def) {
  return items.map((it, i) => (it && it.at != null ? Math.max(0.1, Math.min(it.at * dur, dur - 1.9)) : def[i]));
}

// ---------- hook ----------
function hook(t, d, dur) {
  const lines = d.lines, n = lines.length;
  let size = 200; for (const l of lines) size = Math.min(size, layout(l, 'Marker', 840, 200, 1, 60).size);
  const lh = size * 1.08, subL = d.sub ? layout(d.sub, 'Brush', 840, 56, 2, 34) : null;
  const subH = subL ? 50 + subL.lines.length * subL.size * 1.05 : 0;
  const total = n * lh + subH, top = TOP + (BOT - TOP - 330 - total) / 2 + 80;
  const st = sched(n + 1, dur, 0.4, 2.4, 1.2);
  lines.forEach((l, i) => {
    const p = pr(t, st[i], 0.7), last = i === n - 1, base = top + size * 0.85 + i * lh;
    const col = last ? COL.yellow : i === 0 ? COL.white : COL.blue;
    const w = text(l, 540, base, { font: 'Marker', size, col, align: 'center', p });
    if (last) underline(540 - w / 2, 540 + w / 2, base + 28, { col: COL.yellow, p: pr(t, st[i] + 0.55, 0.5) });
  });
  if (subL) {
    const sp = pr(t, st[n], 0.7), y = top + n * lh + 70;
    textLines(subL.lines, 540, y + subL.size * 0.6, subL.size * 1.1, { font: 'Brush', size: subL.size, col: COL.blue, align: 'center', p: sp });
  }
  // sparkles
  const sp = pr(t, 0.3, 0.8);
  for (const [x, y, r] of [[960, top - 40, 26], [120, top - 20, 20]]) {
    chalk([[x - r, y], [x + r, y]], { col: COL.yellow, lw: 4, p: sp }); chalk([[x, y - r], [x, y + r]], { col: COL.yellow, lw: 4, p: sp });
  }
  robot(200, 1420, 1.15, { t, p: pr(t, 0.3, 0.9), wave: true });
}

// ---------- flow ----------
function tally(x, cy, k, o) {
  for (let i = 0; i < Math.min(k, 4); i++) chalk([[x + i * 17, cy - 24], [x + i * 17 + 2, cy + 24]], { ...o, lw: 5, seed: 300 + i });
}
function flow(t, d, dur) {
  const steps = d.steps, n = steps.length, flags = d.flags || [];
  let y = TOP;
  if (d.title) {
    const tl = layout(d.title, 'Brush', 840, 96, 2, 50), hp = pr(t, 0.1, 0.7);
    const base = y + tl.size * 0.8;
    const w = Math.max(...tl.lines.map((l) => measure(l, 'Brush', tl.size)));
    textLines(tl.lines, 540, base, tl.size * 1.0, { font: 'Brush', size: tl.size, col: COL.yellow, align: 'center', p: hp });
    const ub = base + (tl.lines.length - 1) * tl.size + 22;
    underline(540 - w / 2, 540 + w / 2, ub, { col: COL.yellow, p: pr(t, 0.5, 0.5) });
    y = ub + 40;
  }
  const lastFlag = flags.some((f) => f.step === n - 1), gapCount = n - 1 + (lastFlag ? 1 : 0);
  const bh = n > 3 ? 196 : 236, gap = Math.min(200, (BOT - y - n * bh) / gapCount);
  const total = n * bh + gapCount * gap, y0 = y + Math.max(0, (BOT - y - total) / 2);
  const st = times(steps, dur, sched(n, dur, 0.9, 2.5, 3.0)), bx = X0, bw = CW, tx = bx + 150, tw = bx + bw - 30 - tx;
  steps.forEach((s, i) => {
    const by = y0 + i * (bh + gap), p = pr(t, st[i], 0.65);
    rrect(bx, by, bw, bh, { col: COL.white, lw: 5, p, fill: COL.white, fillAlpha: 0.05, seed: 100 + i });
    tally(bx + 36, by + bh / 2, i + 1, { col: COL.yellow, p: pr(t, st[i] + 0.3, 0.4) });
    let k = 1, lab, sub, hL, hS;
    for (;;) {
      lab = layout(s.label, 'Brush', tw, 72 * k, 2, 34); sub = s.sub ? layout(s.sub, 'Brush', tw, 44 * k, 2, 28) : null;
      hL = lab.lines.length * lab.size * 0.98; hS = sub ? sub.lines.length * sub.size * 0.98 + 10 : 0;
      if (hL + hS <= bh - 40 || k < 0.6) break; k -= 0.06;
    }
    const ty = by + (bh - hL - hS) / 2 + lab.size * 0.8, ta = cl((p - 0.2) * 1.6);
    textLines(lab.lines, tx, ty, lab.size * 0.98, { font: 'Brush', size: lab.size, col: COL.white, p: ta });
    if (sub) textLines(sub.lines, tx, ty + (lab.lines.length - 1) * lab.size * 0.98 + 10 + sub.size * 0.85, sub.size * 0.98, { font: 'Brush', size: sub.size, col: COL.blue, p: ta });
    if (i < n - 1) arrow(bx + 70, by + bh + 8, bx + 70, by + bh + gap - 8, { col: COL.white, lw: 5, p: pr(t, st[i] + 0.5, 0.5), seed: 200 + i, head: 28 });
    for (const f of flags.filter((f) => f.step === i)) {
      const fT = f.at != null ? Math.max(st[i] + 0.3, Math.min(f.at * dur, dur - 1.9)) : st[i] + 0.6, fp = pr(t, fT, 0.5), gy = by + bh + gap / 2;
      const fl = layout(f.text, 'Brush', 560, 46, 2, 30), fw = Math.max(...fl.lines.map((l) => measure(l, 'Brush', fl.size))) + 50;
      const fh = fl.lines.length * fl.size * 0.98 + 30, fx = X1 - fw, fy = gy - fh / 2;
      chalk([[fx + 56, fy + 3], [fx + 30, by + bh + 4], [fx + 100, fy + 3]], { col: COL.white, lw: 4.5, p: cl(fp * 1.6), seed: 400 + i });
      rrect(fx, fy, fw, fh, { col: COL.white, lw: 4.5, p: fp, r: 26, fill: COL.white, fillAlpha: 0.07, seed: 410 + i });
      textLines(fl.lines, fx + 25, fy + 15 + fl.size * 0.8, fl.size * 0.98, { font: 'Brush', size: fl.size, col: COL.white, p: cl((fp - 0.3) * 1.6) });
    }
  });
}

// ---------- bigstat ----------
function bigstat(t, d, dur) {
  const items = d.items, n = items.length;
  const footL = d.foot ? layout(d.foot, 'Brush', 740, 54, 2, 34) : null, footH = footL ? footL.lines.length * footL.size * 0.98 + 56 : 0;
  const area = BOT - TOP - (footH ? footH + 30 : 0), rowH = Math.min(380, area / n), top = TOP + (area - rowH * n) / 2 + 10;
  const st0 = sched(n + (d.foot ? 1 : 0), dur, 0.4, 2.5, 2.6), st = [...times(items, dur, st0.slice(0, n))];
  if (d.foot) st.push(d.footAt != null ? Math.max(0.1, Math.min(d.footAt * dur, dur - 1.9)) : st0[n]);
  let size = rowH * 0.8; for (const it of items) size = Math.min(size, layout(it.value, 'Brush', 360, size, 1, 80).size);
  items.forEach((it, i) => {
    const y = top + i * rowH, mid = y + rowH / 2, p = pr(t, st[i], 0.7), cx = X0 + 195;
    const w = measure(it.value, 'Brush', size);
    text(it.value, cx, mid + size * 0.3, { font: 'Brush', size, col: COL.yellow, align: 'center', p: cl(p * 1.4) });
    ellipse(cx, mid, Math.max(w / 2 + 50, 110), size * 0.5, { col: COL.white, lw: 5, p: pr(t, st[i] + 0.4, 0.6), alpha: 0.85 });
    const lb = layout(it.label, 'Brush', 400, 72, 3, 40), lh = lb.size * 0.98, ly = mid - ((lb.lines.length - 1) * lh) / 2 + lb.size * 0.3;
    const lp = cl((p - 0.3) * 1.6);
    textLines(lb.lines, X0 + 440, ly, lh, { font: 'Brush', size: lb.size, col: COL.white, p: lp });
    const lw = Math.max(...lb.lines.map((l) => measure(l, 'Brush', lb.size)));
    underline(X0 + 440, X0 + 440 + lw, ly + (lb.lines.length - 1) * lh + 18, { col: COL.blue, lw: 4, p: cl(lp * 1.2 - 0.2) });
    if (i < n - 1) line(X0 + 20, y + rowH, X1 - 20, y + rowH, { col: COL.white, lw: 3, alpha: 0.35, p: cl(p * 1.2), seed: 500 + i });
  });
  if (footL) {
    const p = pr(t, st[n], 0.7), fy = BOT - footH;
    rrect(X0, fy, CW, footH, { col: COL.blue, lw: 4.5, p, r: 24, fill: COL.blue, fillAlpha: 0.07 });
    textLines(footL.lines, 540, fy + 28 + footL.size * 0.8, footL.size * 0.98, { font: 'Brush', size: footL.size, col: COL.white, align: 'center', p: cl((p - 0.2) * 1.5) });
  }
}

// ---------- versus ----------
function versus(t, d, dur) {
  const rows = d.rows, n = rows.length, lp = pr(t, 0.2, 0.7);
  const a = layout(d.aTitle, 'Brush', 330, 58, 1, 34), b = layout(d.bTitle, 'Brush', 330, 58, 1, 34), ly = TOP + 60;
  rrect(X0, ly - 38, 50, 50, { col: COL.blue, lw: 4, p: lp, r: 8, seed: 601 }); hatch(X0 + 4, ly - 34, 42 * lp, 42, { col: COL.blue, gap: 9, lw: 3 });
  text(d.aTitle, X0 + 66, ly + 4, { font: 'Brush', size: a.size, col: COL.blue, p: lp });
  const bx = 520;
  rrect(bx, ly - 38, 50, 50, { col: COL.yellow, lw: 4, p: lp, r: 8, fill: COL.yellow, fillAlpha: 0.45, seed: 602 });
  text(d.bTitle, bx + 66, ly + 4, { font: 'Brush', size: b.size, col: COL.yellow, p: lp });
  line(X0, ly + 40, X1, ly + 40, { col: COL.white, lw: 4, p: lp, alpha: 0.7 });
  const st = sched(n, dur, 0.8, 3.0, 3.0), area0 = ly + 70, rowH = Math.min(560, (BOT - area0) / n), BX = X0 + 14, BW = 560;
  rows.forEach((r, i) => {
    const y = area0 + i * rowH, rs = st[i], p = pr(t, rs, 0.5);
    const lab = layout(r.label, 'Brush', CW, 70, 1, 40);
    text(r.label, X0, y + lab.size * 0.85 + 6, { font: 'Brush', size: lab.size, col: COL.white, p });
    const barH = Math.min(120, (rowH - 200) / 2.2), y1 = y + lab.size + 40, y2 = y1 + barH + 36, sy = y2 + barH + 30;
    [[r.aW, r.a, y1, COL.blue, false, rs + 0.15], [r.bW, r.b, y2, COL.yellow, true, rs + 0.55]].forEach(([wf, val, yy, col, hi, s0]) => {
      const bp = pr(t, s0, 0.7), len = Math.max(6, BW * cl(wf)) * bp;
      if (len > 7) {
        rrect(BX, yy, len, barH, { col, lw: 4.5, r: 8, p: 1, fill: col, fillAlpha: hi ? 0.4 : 0.08, seed: 700 + i * 3 + (hi ? 1 : 0) });
        hatch(BX + 3, yy + 3, len - 6, barH - 6, { col, gap: hi ? 12 : 15, alpha: hi ? 0.5 : 0.55 });
      }
      const vs = layout(val, 'Brush', X1 - (BX + BW * cl(wf) + 24), 70, 1, 40), vp = pr(t, s0 + 0.6, 0.4);
      const vx = BX + BW * cl(wf) * bp + 22, vb = yy + barH / 2 + vs.size * 0.3;
      const vw = text(val, vx, vb, { font: 'Brush', size: vs.size, col: hi ? COL.yellow : COL.white, p: vp });
      if (hi) ellipse(vx + vw / 2, vb - vs.size * 0.3, vw / 2 + 28, vs.size * 0.62, { col: COL.white, lw: 4.5, p: pr(t, s0 + 0.95, 0.5) });
    });
    line(BX, y1 - 14, BX, sy, { col: COL.white, lw: 4, p, alpha: 0.8 });
    line(BX, sy, BX + BW, sy, { col: COL.white, lw: 3.5, p, alpha: 0.8 });
    for (let k = 0; k <= 4; k++) line(BX + (BW * k) / 4, sy - 9, BX + (BW * k) / 4, sy + 9, { col: COL.white, lw: 3.5, p, alpha: 0.8, seed: 800 + k });
    if (i < n - 1) line(X0, y + rowH - 10, X1, y + rowH - 10, { col: COL.white, lw: 3, p, alpha: 0.3, seed: 900 + i });
  });
}

// ---------- bars ----------
function bars(t0, d, dur) {
  const t = t0, neutral = d.rows.length > 3;
  const rows = d.rows, n = rows.length, hp = pr(t, 0.1, 0.7), unit = d.unit || '';
  const tl = layout(d.title, 'Brush', CW, 92, 2, 54);
  let y = TOP;
  textLines(tl.lines, X0, y + tl.size * 0.8, tl.size * 0.98, { font: 'Brush', size: tl.size, col: COL.yellow, p: hp });
  const tw = Math.max(...tl.lines.map((l) => measure(l, 'Brush', tl.size)));
  const ub = y + tl.size * 0.8 + (tl.lines.length - 1) * tl.size * 0.98 + 18;
  underline(X0, X0 + tw, ub, { col: COL.yellow, p: pr(t, 0.4, 0.5) });
  y = ub + 14;
  if (d.subtitle) {
    const sub = layout(d.subtitle, 'Brush', CW, 38, 5, 32), lh = sub.size * 1.0;
    textLines(sub.lines, X0, y + sub.size * 0.85, lh, { font: 'Brush', size: sub.size, col: COL.blue, p: cl((hp - 0.1) * 1.4) });
    y += sub.lines.length * lh + 10;
  }
  const areaTop = y + 26, axisY = 1380, area = axisY - 24 - areaTop, rowH = Math.min(440, area / n);
  const gTop = areaTop + (area - rowH * n) / 2;
  const BX = X0 - 10, BW = 700, sc = BW / d.axisMax, ap = pr(t, 0.4, 0.9);
  for (let k = 0; k <= 4; k++) {
    const x = BX + (BW * k) / 4;
    if (k) line(x, areaTop - 4, x, axisY, { col: COL.white, lw: 2.5, alpha: 0.2, p: ap, seed: 1000 + k });
    line(x, axisY - 10, x, axisY + 12, { col: COL.white, lw: 4, alpha: 0.85, p: ap, seed: 1010 + k });
  }
  line(BX, areaTop - 4, BX, axisY, { col: COL.white, lw: 5, alpha: 0.9, p: ap, seed: 1020 });
  line(BX, axisY, BX + BW + 10, axisY, { col: COL.white, lw: 5, alpha: 0.9, p: ap, seed: 1021 });
  text(`${d.axisMax}${unit}`, BX + BW, axisY + 48, { font: 'Brush', size: 34, col: COL.blue, align: 'center', p: ap });
  const st = sched(n, dur, 0.9, 2.8, 1.4);
  const fs0 = Math.max(38, Math.min(66, rowH * 0.3)), barH = Math.max(50, Math.min(210, rowH * 0.46));
  rows.forEach((r, i) => {
    const rs = r.at != null ? Math.min(r.at * dur, dur - 1.9) : st[i], kk = Math.min(1, Math.max(0.3, (dur - 1.6 - rs) / 1.9)), t = rs + (t0 - rs) / kk, p = pr(t, rs, 0.5), bp = pr(t, rs + 0.1, 0.9), hi = !!r.hi, col = hi ? COL.yellow : neutral ? COL.white : COL.blue;
    const early = n <= 3 && r.at != null, lp0 = early ? pr(t0, 0.3 + i * 0.25, 0.6) : p;
    let fs = fs0, tagFs, lw, tgw, rw;
    for (;;) {
      tagFs = Math.max(28, fs * 0.62); lw = measure(r.label, 'Brush', fs); tgw = r.tag ? measure(r.tag, 'Mono', tagFs) + 26 : 0;
      rw = r.right ? measure(r.right, 'Mono', Math.max(28, fs * 0.72)) : 0;
      if (lw + tgw + rw + 50 <= CW || fs <= 28) break; fs -= 2;
    }
    const cH = fs + 16 + barH, ry0 = gTop + i * rowH + (rowH - cH) / 2, ly = ry0 + fs * 0.82, lc = hi ? COL.yellow : COL.white;
    text(r.label, X0, ly, { font: 'Brush', size: fs, col: lc, p: lp0 });
    if (early) rrect(BX + 2, ry0 + fs + 16, BW, barH, { col: COL.white, lw: 3, r: 6, alpha: 0.28, p: lp0, seed: 1250 + i });
    if (r.tag) {
      const cx = X0 + lw + 20, ch = tagFs * 1.0 + 10;
      rrect(cx, ly - tagFs * 0.78 - 2, tgw, ch, { col: neutral ? COL.white : COL.blue, lw: 3.5, p, r: 12, seed: 1100 + i });
      text(r.tag, cx + 13, ly - 4, { font: 'Mono', size: tagFs, col: neutral ? COL.white : COL.blue, p });
    }
    if (r.right) text(r.right, X1, ly, { font: 'Mono', size: Math.max(28, fs * 0.72), col: lc, align: 'right', p });
    const by = ry0 + fs + 16, cy = by + barH / 2, len = Math.max(0, r.value * sc * bp);
    if (len > 6) {
      rrect(BX + 2, by, len, barH, { col, lw: 4.5, r: 6, p: 1, fill: col, fillAlpha: hi ? 0.32 : 0.08, seed: 1200 + i });
      hatch(BX + 6, by + 3, len - 8, barH - 6, { col, gap: barH > 100 ? 16 : 12, lw: barH > 100 ? 4 : 3.2, alpha: hi ? 0.55 : 0.5 });
    }
    let tx = BX + r.value * sc;
    if (r.err != null) {
      const e0 = BX + (r.value - r.err) * sc, e1 = BX + (r.value + r.err) * sc, wp = seg(t, rs + 0.95, rs + 1.3), cap = barH * 0.4;
      if (wp > 0) {
        const mx = e0 + (e1 - e0) * wp;
        for (const [c, w] of [[COL.slateDeep, 11], [COL.white, 4.5]]) {
          solidStroke([[e0, cy], [mx, cy]], c, w); solidStroke([[e0, cy - cap], [e0, cy + cap]], c, w);
          if (wp >= 1) solidStroke([[e1, cy - cap], [e1, cy + cap]], c, w);
        }
      }
      tx = e1;
    }
    const vs = Math.round(fs * 1.02), vp = cl((bp - 0.6) * 2.5);
    const vw = text(`${r.value}${unit}`, tx + 22, cy + vs * 0.3, { font: 'Brush', size: vs, col: lc, p: vp });
    if (hi && n <= 3) ellipse(tx + 22 + vw / 2 + 16, cy, vw / 2 + 24, vs * 0.62, { col: COL.white, lw: 5, p: pr(t, rs + 1.3, 0.5) });
  });
}

// ---------- callout ----------
function callout(t, d, dur) {
  const warn = d.kind !== 'info', col = warn ? COL.pink : COL.blue, n = d.lines.length;
  const st = sched(n, dur, 0.9, 2.3, 1.7), cp = pr(t, 0.1, 0.8);
  const pad = 40, tw = CW - pad * 2 - 80, ls = d.lines.map((l) => layout(l, 'Brush', tw, 72, 3, 40));
  const tl = layout(d.title, 'Brush', CW - 2 * pad - 150, 110, 1, 54), hdr = 190;
  const hs = ls.map((l) => l.lines.length * l.size * 0.98 + 64), cH = hdr + hs.reduce((a, b) => a + b, 0) + 30;
  const rs = 1.2, grp = cH + 40 + 245 * rs, cy = TOP + Math.max(0, (BOT - TOP - grp) / 2), cx = X0;
  rrect(cx, cy, CW, cH, { col, lw: 6, p: cp, r: 30, fill: col, fillAlpha: 0.06, seed: 1300 });
  rrect(cx + 7, cy + 7, CW - 14, cH - 14, { col, lw: 2.5, p: cp, r: 26, alpha: 0.5, seed: 1301 });
  const tp = pr(t, 0.2, 0.5), ix = cx + pad + 52, iy = cy + hdr / 2;
  { const A = [ix, iy - 50], B = [ix + 58, iy + 44], C = [ix - 58, iy + 44], tri = []; for (const [u, v] of [[A, B], [B, C], [C, A]]) for (let k = 0; k < 6; k++) tri.push([u[0] + (v[0] - u[0]) * k / 6, u[1] + (v[1] - u[1]) * k / 6]); chalk(tri, { col, lw: 6, close: true, p: tp, seed: 1310 }); }
  text(warn ? '!' : 'i', ix, iy + 28, { font: 'Marker', size: 62, col, align: 'center', p: cl((tp - 0.5) * 2) });
  text(d.title, cx + pad + 140, iy + tl.size * 0.3, { font: 'Brush', size: tl.size, col: COL.white, p: cl(cp * 1.4) });
  line(cx + 24, cy + hdr, cx + CW - 24, cy + hdr, { col, lw: 4, p: cp, seed: 1320 });
  let y = cy + hdr + 22;
  d.lines.forEach((l, i) => {
    const p = pr(t, st[i], 0.6), L = ls[i], my = y + L.size * 0.5 + 8;
    chalk([[cx + pad, my], [cx + pad + 34, my - 2]], { col, lw: 8, p: cl(p * 2), seed: 1400 + i });
    textLines(L.lines, cx + pad + 80, y + L.size * 0.85, L.size * 0.98, { font: 'Brush', size: L.size, col: COL.white, p: cl((p - 0.15) * 1.5) });
    y += hs[i];
  });
  robot(200, cy + cH + 40 + 245 * rs, rs, { t, p: pr(t, 0.3, 0.9), arm: -0.75 });
}

// ---------- checklist ----------
function checklist(t, d, dur) {
  const items = d.items, n = items.length, hp = pr(t, 0.1, 0.7);
  const tl = layout(d.title, 'Brush', CW, 98, 2, 54), base = TOP + tl.size * 0.8;
  textLines(tl.lines, 540, base, tl.size * 0.98, { font: 'Brush', size: tl.size, col: COL.yellow, align: 'center', p: hp });
  const tw = Math.max(...tl.lines.map((l) => measure(l, 'Brush', tl.size))), ub = base + (tl.lines.length - 1) * tl.size * 0.98 + 22;
  underline(540 - tw / 2, 540 + tw / 2, ub, { col: COL.yellow, p: pr(t, 0.4, 0.5) });
  const top = ub + 40, rowH = Math.min(290, (BOT - top) / n), st = sched(n, dur, 0.9, 2.3, 1.6), S = 78;
  items.forEach((it, i) => {
    const y = top + i * rowH, cy = y + rowH / 2, p = pr(t, st[i], 0.6), bx = X0 + 8, by = cy - S / 2;
    const mc = it.mark === 'x' ? COL.white : it.mark === 'check' ? COL.yellow : COL.blue, mp = pr(t, st[i] + 0.3, 0.4);
    rrect(bx, by, S, S, { col: COL.white, lw: 5, r: 10, p, seed: 1500 + i });
    if (it.mark === 'x') {
      chalk([[bx + 14, by + 14], [bx + S - 12, by + S - 12]], { col: mc, lw: 9, p: cl(mp * 2), seed: 1510 + i });
      chalk([[bx + S - 12, by + 14], [bx + 14, by + S - 12]], { col: mc, lw: 9, p: cl(mp * 2 - 1), seed: 1520 + i });
    } else if (it.mark === 'check') chalk([[bx + 12, by + S * 0.5], [bx + S * 0.38, by + S - 8], [bx + S + 14, by - 18]], { col: mc, lw: 10, p: mp, seed: 1530 + i });
    else chalk([[bx + 16, cy], [bx + S - 16, cy]], { col: mc, lw: 9, p: mp, seed: 1540 + i });
    const L = layout(it.text, 'Brush', X1 - (X0 + 140), 64, 3, 40), lh = L.size * 0.98;
    textLines(L.lines, X0 + 140, cy - ((L.lines.length - 1) * lh) / 2 + L.size * 0.3, lh, { font: 'Brush', size: L.size, col: it.mark === 'check' ? COL.yellow : COL.white, p: cl((p - 0.15) * 1.5) });
    if (i < n - 1) line(X0, y + rowH, X1, y + rowH, { col: COL.white, lw: 3, alpha: 0.3, p, seed: 1550 + i });
  });
}

// ---------- endcard ----------
function endcard(t, d, dur) {
  const st = [0.3, 0.75, 1.2, 1.65, 2.1];
  const nm = layout(d.name, 'Marker', 840, 190, 1, 80), p0 = pr(t, st[0], 0.8), nb = 300 + nm.size * 0.85;
  const w0 = text(d.name, 540, nb, { font: 'Marker', size: nm.size, col: COL.yellow, align: 'center', p: p0 });
  const nby = nb;
  underline(540 - w0 / 2, 540 + w0 / 2, nby + 34, { col: COL.yellow, p: pr(t, st[0] + 0.5, 0.5) });
  const p1 = pr(t, st[1], 0.6), ay = nby + 130, ax = layout(`arXiv ${d.arxivId}`, 'Mono', 840, 54, 1, 30);
  text(`arXiv ${d.arxivId}`, 540, ay, { font: 'Mono', size: ax.size, col: COL.blue, align: 'center', p: p1 });
  // authors: pack whole names per line
  const names = d.authors || [], au = [];
  let cur = '';
  for (const nme of names) { const tr = cur ? `${cur}, ${nme}` : nme; if (cur && measure(tr, 'Brush', 58) > 800) { au.push(`${cur},`); cur = nme; } else cur = tr; }
  if (cur) au.push(cur);
  const p2 = pr(t, st[2], 0.7), auY = ay + 90;
  textLines(au, 540, auY, 66, { font: 'Brush', size: 58, col: COL.white, align: 'center', p: p2 });
  let y = auY + (au.length - 1) * 66 + 60;
  if (d.tagline) {
    const p3 = pr(t, st[3], 0.6), tg = layout(d.tagline, 'Brush', 700, 68, 1, 36), tww = measure(d.tagline, 'Brush', tg.size) + 70;
    rrect(540 - tww / 2, y, tww, tg.size + 38, { col: COL.yellow, lw: 4.5, r: 22, p: p3 });
    text(d.tagline, 540, y + 19 + tg.size * 0.8, { font: 'Brush', size: tg.size, col: COL.yellow, align: 'center', p: cl((p3 - 0.2) * 1.5) });
    y += tg.size + 38 + 50;
  }
  const p4 = pr(t, st[4], 0.7), hl = layout(HANDLE, 'Mono', 680, 52, 1, 30), hw = measure(HANDLE, 'Mono', hl.size) + 70;
  rrect(540 - hw / 2, y, hw, 96, { col: COL.yellow, lw: 5, r: 18, p: p4, fill: COL.yellow, fillAlpha: 0.08 });
  text(HANDLE, 540, y + 48 + hl.size * 0.34, { font: 'Mono', size: hl.size, col: COL.yellow, align: 'center', p: cl((p4 - 0.3) * 1.6) });
  const gy = BOT, sc = Math.min(1.1, Math.max(0.6, (gy - (y + 130)) / 250));
  robot(190, gy, sc, { t, p: pr(t, 0.3, 0.9), wave: true });
}

// ---------- caption ----------
function caption(s, alpha) {
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(14,24,19,0.9)'; ctx.beginPath(); ctx.roundRect(60, 1490, 960, 96, 16); ctx.fill();
  ctx.restore();
  ctx.save(); ctx.globalAlpha = alpha;
  chalk(rrPts(64, 1494, 952, 88, 14), { col: COL.white, lw: 3.5, alpha: 0.75, seed: 77 });
  const l = layout(s, 'Brush', 900, 62, 1, 40); setFont('Brush', l.size);
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = COL.white;
  ctx.fillText(l.lines.join(' '), 540, 1538 + l.size * 0.3);
  ctx.restore();
}

export default {
  name: 'chalkboard',
  bg: COL.bg,
  background(t, li) { drawBoard(t, li); },
  caption,
  blocks: { hook, flow, bigstat, versus, bars, callout, checklist, endcard },
  async thumbnail({ name, hook: h, arxivId }, outPath) {
    drawBoard(0, 0);
    const lines = String(h || '').split(/\\n|\n/).map((s) => s.trim()).filter(Boolean).slice(0, 4);
    let size = 180; for (const l of lines) size = Math.min(size, layout(l, 'Marker', 880, 180, 1, 70).size);
    const lh = size * 1.1, top = 450;
    lines.forEach((l, i) => {
      const last = i === lines.length - 1, base = top + size * 0.85 + i * lh;
      const w = text(l, 540, base, { font: 'Marker', size, col: last ? COL.yellow : i % 2 ? COL.blue : COL.white, align: 'center' });
      if (last) underline(540 - w / 2, 540 + w / 2, base + 28, { col: COL.yellow });
    });
    const ny = top + lines.length * lh + 150, nl = layout(name, 'Marker', 600, 120, 1, 60), nw = measure(name, 'Marker', nl.size) + 80;
    rrect(540 - nw / 2, ny - nl.size * 0.95, nw, nl.size * 1.45, { col: COL.yellow, lw: 6, r: 24 });
    text(name, 540, ny + 4, { font: 'Marker', size: nl.size, col: COL.yellow, align: 'center' });
    text(`arXiv ${arxivId}`, 540, ny + nl.size * 0.5 + 70, { font: 'Mono', size: 40, col: COL.blue, align: 'center' });
    robot(190, 1450, 1.25, { t: 0.4, wave: true });
    const hl = layout(HANDLE, 'Mono', 600, 46, 1, 30), hw = measure(HANDLE, 'Mono', hl.size) + 60;
    rrect(400, 1380, hw, 80, { col: COL.yellow, lw: 4.5, r: 16 });
    text(HANDLE, 430, 1380 + 40 + hl.size * 0.34, { font: 'Mono', size: hl.size, col: COL.yellow });
    fs.writeFileSync(outPath, cv.toBuffer('image/png'));
  },
};
