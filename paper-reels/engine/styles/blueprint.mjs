// "blueprint" style: technical engineering drawing on a prussian-blue sheet.
import fs from 'node:fs';
import { cv } from '../core.mjs';
import { HANDLE } from '../brand.mjs';
import {
  ctx, P, drawBg, sched, pr, cl, seg, line, rect, path, hatchRect, arrowhead, leader, dim, text, textLines,
  layout, measure, badge, tagBox, heading, robot, polyline,
} from './blueprint-lib.mjs';

const X0 = 90, X1 = 930, CW = X1 - X0;
// vertical offset that centres a content span [a,b] inside y 160..1440
const off = (a, b) => Math.max(160 - a, Math.min(1440 - b, 800 - (a + b) / 2));
const atStart = (st, rows, dur) => st.map((s0, i) => Math.min(Math.max(s0, (rows[i] && rows[i].at != null ? rows[i].at * dur : 0)), Math.max(0.35, dur - 1.9)));

// ---------- hook ----------
function hook(t, d, dur) {
  const lines = d.lines, n = lines.length;
  let size = 190; for (const l of lines) size = Math.min(size, layout(l, 'Marker', 800, 190).size);
  const lh = size * 1.12, top = 470, st = sched(n + 1, dur, 0.3, 1.9, 0.8);
  const bottom = top + n * lh;
  // construction (extension) lines
  const ep = pr(t, 0.1, 0.8);
  line(140, top - 70, 140, bottom + 90, { col: P.dim, lw: 1.5, dash: [12, 8], p: ep, alpha: 0.8, noGhost: true });
  line(940, top - 70, 940, bottom + 90, { col: P.dim, lw: 1.5, dash: [12, 8], p: ep, alpha: 0.8, noGhost: true });
  lines.forEach((l, i) => {
    const p = pr(t, st[i], 0.6), last = i === n - 1;
    text(l, 540, top + size * 0.82 + i * lh, { font: 'Marker', size, col: last ? P.amber : P.white, align: 'center', reveal: p });
  });
  if (d.sub) {
    const p = pr(t, st[n], 0.7), y = bottom + 50;
    const ls = layout(d.sub, 'Mono', 700, 32);
    dim(140, y, 940, y, { p, col: P.cyan, label: ls.lines[0], size: ls.size });
  }
  robot(250, 1400, 14, { t, p: pr(t, 0.2, 0.9), wave: 1 });
}

// ---------- flow ----------
function flow(t, d, dur) {
  const steps = d.steps, n = steps.length, flags = d.flags || [];
  const hp = pr(t, 0.1, 0.7);
  const tl0 = d.title ? layout(d.title, 'Brush', 840, 80, 2) : null;
  const ry0 = tl0 ? 240 + (tl0.lines.length - 1) * tl0.size * 1.02 + 36 : 200;
  const bh = n > 3 ? 170 : 220, gap = n > 3 ? 100 : 140, y00 = ry0 + 60;
  const lastFlag = flags.some((f) => (f.step ?? f.at) === n - 1);
  const spanB = y00 + n * bh + (n - 1) * gap + (lastFlag ? 90 : 0);
  const dy = off(tl0 ? 170 : y00, spanB);
  ctx.save(); ctx.translate(0, dy);
  const ry = d.title ? heading(d.title, 240, hp, { maxSize: 80 }) : 200, y0 = ry + 60;
  const st = atStart(sched(n, dur, 0.8, 2.1, 1.6), steps, dur);
  steps.forEach((s, i) => {
    const y = y0 + i * (bh + gap), p = pr(t, st[i], 0.55), bx = X0 + 120, bw = X1 - bx;
    // number block
    badge(X0 + 50, y + bh / 2, 46, String(i + 1), { p, col: P.amber, size: 52 });
    // leader from number to block
    line(X0 + 96, y + bh / 2, bx, y + bh / 2, { col: P.cyan, lw: 2, p: cl(p * 2), noGhost: true });
    rect(bx, y, bw, bh, { col: P.white, lw: 3, p, fill: P.panel });
    const tw = bw - 56, lab = layout(s.label, 'Brush', tw, 76, 2);
    const sub = s.sub ? layout(s.sub, 'Mono', tw, 32, 2) : null;
    const lhL = lab.size * 1.0, hL = lab.lines.length * lhL, hS = sub ? sub.lines.length * sub.size * 1.25 + 8 : 0;
    let ty = y + (bh - hL - hS) / 2 + lab.size * 0.82;
    const ta = cl((p - 0.45) * 2.2);
    textLines(lab.lines, bx + 28, ty, lhL, { font: 'Brush', size: lab.size, col: P.white, alpha: ta });
    if (sub) textLines(sub.lines, bx + 28, ty + (lab.lines.length - 1) * lhL + 8 + sub.size * 1.15, sub.size * 1.25, { font: 'Mono', size: sub.size, col: P.cyan, alpha: ta });
    // arrow to the next block
    if (i < n - 1) {
      const ap = pr(t, st[i] + 0.4, 0.4), ax = X0 + 50;
      leader(ax, y + bh + 6, ax, y + bh + gap - 6, { p: ap, col: P.white, lw: 3, head: 18 });
    }
    // flags
    for (const f of flags.filter((f) => (f.step ?? f.at) === i)) {
      const fs0 = Math.min(Math.max(st[i] + 0.55, (f.step != null && f.at != null ? f.at * dur : 0)), Math.max(0.35, dur - 1.9)), fp = pr(t, fs0, 0.45), fy = y + bh + gap / 2;
      const fl = layout(f.text, 'Mono', 580, 32), fw = measure(fl.lines[0], 'Mono', fl.size) + 44, fx = X0 + 150;
      line(fx - 30, y + bh, fx + 10, fy - 20, { col: P.amber, lw: 2, p: cl(fp * 2), noGhost: true });
      rect(fx, fy - 30, fw, 60, { col: P.amber, lw: 2.5, p: fp, fill: P.panel, wob: 0.6 });
      text(fl.lines[0], fx + 22, fy + fl.size * 0.35, { font: 'Mono', size: fl.size, col: P.amber, alpha: cl((fp - 0.4) * 2) });
    }
  });
  ctx.restore();
}

// ---------- bigstat ----------
function bigstat(t, d, dur) {
  const items = d.items, n = items.length;
  const rowH = Math.min(360, 1000 / n), top = 230;
  const dy = off(top - 20, top + n * rowH + (d.foot ? 130 : 0));
  ctx.save(); ctx.translate(0, dy);
  const st = atStart(sched(n + (d.foot ? 1 : 0), dur, 0.35, 2.0, 1.4), [...items, { at: d.footAt }], dur);
  items.forEach((it, i) => {
    const y = top + i * rowH, p = pr(t, st[i], 0.6);
    const vs = layout(it.value, 'Marker', 640, Math.min(260, rowH * 0.78)), vh = vs.size * 0.72;
    const by = y + vh + 12;
    // vertical dimension of the numeral height
    dim(X0 + 6, by - vh, X0 + 6, by, { p: cl(p * 1.4), col: P.dim, tick: 10, lw: 1.8 });
    text(it.value, X0 + 60, by, { font: 'Marker', size: vs.size, col: P.amber, reveal: cl(p * 1.5) });
    const lb = layout(it.label, 'Mono', CW - 60, 40);
    const ly = by + 30 + lb.size * 0.7;
    line(X0 + 60, by + 18, X1, by + 18, { col: P.cyan, lw: 2, p: cl(p * 1.2 - 0.1), noGhost: true });
    text(lb.lines[0], X0 + 60, ly, { font: 'Mono', size: lb.size, col: P.white, alpha: cl((p - 0.4) * 2) });
  });
  if (d.foot) {
    const p = pr(t, st[n], 0.7), y = top + n * rowH + 20, fl = layout(d.foot, 'Mono', CW - 40, 32, 2);
    rect(X0, y, CW, 44 + fl.lines.length * fl.size * 1.3, { col: P.cyan, lw: 2, p, wob: 0.6, noGhost: true, fill: P.panel });
    textLines(fl.lines, X0 + 24, y + 22 + fl.size * 1.05, fl.size * 1.3, { font: 'Mono', size: fl.size, col: P.cyan, alpha: cl((p - 0.4) * 2) });
  }
  ctx.restore();
}

// ---------- versus ----------
function versus(t, d, dur) {
  const rows = d.rows, n = rows.length;
  const st = sched(n, dur, 0.9, 2.0, 1.5), lp = pr(t, 0.15, 0.6);
  const rowH0 = Math.min(560, 1080 / n);
  ctx.save(); ctx.translate(0, off(200, 330 + (n - 1) * rowH0 + 410));
  // legend
  const lay = (s, maxW) => layout(s, 'Brush', maxW, 54);
  const a = lay(d.aTitle, 360), b = lay(d.bTitle, 360), ly = 250;
  rect(X0, ly - 36, 40, 40, { col: P.cyan, lw: 2.5, p: lp });
  hatchRect(X0, ly - 36, 40, 40, { col: P.cyan, gap: 8, p: lp, alpha: 0.7 });
  text(d.aTitle, X0 + 56, ly, { font: 'Brush', size: a.size, col: P.white, alpha: lp });
  const bx = 520;
  rect(bx, ly - 36, 40, 40, { col: P.amber, lw: 2.5, p: lp, fill: P.amber, fillAlpha: 0.85 });
  text(d.bTitle, bx + 56, ly, { font: 'Brush', size: b.size, col: P.amber, alpha: lp });
  line(X0, ly + 34, X1, ly + 34, { col: P.cyan, lw: 1.8, p: lp, noGhost: true });
  const BX = X0 + 10, BW = 590, rowH = Math.min(560, 1080 / n), top = 330;
  rows.forEach((r, i) => {
    const y = top + i * rowH, p = pr(t, st[i], 0.55), bp = pr(t, st[i] + 0.25, 0.7);
    const lab = layout(r.label, 'Brush', CW, 72, 1);
    text(r.label, X0, y + lab.size * 0.8, { font: 'Brush', size: lab.size, col: P.white, alpha: p });
    const y1 = y + lab.size + 40, bh = 110, y2 = y1 + bh + 44;
    for (const [k, yy, w, val, col, hi] of [[0, y1, r.aW, r.a, P.cyan, false], [1, y2, r.bW, r.b, P.amber, true]]) {
      const len = BW * cl(w);
      rect(BX, yy, Math.max(4, len * bp), bh, { col, lw: 2.5, p: cl(bp * 3), fill: hi ? col : null, fillAlpha: 0.85 });
      if (!hi) hatchRect(BX, yy, len, bh, { col, gap: 10, alpha: 0.55, p: bp });
      const vs = layout(val, 'Mono', 940 - (BX + len + 18), 44);
      text(val, BX + len + 18, yy + bh / 2 + vs.size * 0.34, { font: 'Mono', size: vs.size, col: hi ? P.amber : P.white, alpha: cl((bp - 0.6) * 2.5) });
    }
    // scale under the bars
    const sy = y2 + bh + 28;
    line(BX, sy, BX + BW, sy, { col: P.dim, lw: 1.6, p, noGhost: true });
    for (let k = 0; k <= 4; k++) line(BX + (BW * k) / 4, sy - (k % 2 ? 6 : 11), BX + (BW * k) / 4, sy + (k % 2 ? 6 : 11), { col: P.dim, lw: 1.6, p, noGhost: true });
    line(BX, y1 - 14, BX, sy, { col: P.dim, lw: 1.8, p, noGhost: true, alpha: 0.9 });
  });
  ctx.restore();
}

// ---------- bars ----------
function bars(t, d, dur) {
  const rows = d.rows, n = rows.length, hp = pr(t, 0.1, 0.7);
  const tl = layout(d.title, 'Brush', CW, 76, 2);
  const sub = d.subtitle ? layout(d.subtitle, 'Mono', CW, 30, 5) : null;
  const subH = sub ? 16 + sub.lines.length * sub.size * 1.3 : 0, titleH = tl.lines.length * tl.size;
  const fixedH = titleH + subH + 24 + 34 + 70;
  const rowH = Math.min(320, (1250 - fixedH) / n), total = fixedH + n * rowH;
  const Y0 = 190 + Math.max(0, (1250 - total) / 2);
  let y = Y0 + tl.size * 0.8;
  tl.lines.forEach((s, i) => text(s, X0, y + i * tl.size, { font: 'Brush', size: tl.size, col: P.white, reveal: cl(hp * 1.6 - i * 0.5) }));
  y = Y0 + titleH;
  if (sub) { textLines(sub.lines, X0, y + 16 + sub.size, sub.size * 1.3, { font: 'Mono', size: sub.size, col: P.cyan, alpha: cl((hp - 0.2) * 1.6) }); y += subH; }
  const ry = y + 24;
  dim(X0, ry, X1, ry, { p: cl(hp * 1.3 - 0.2), col: P.cyan, tick: 9, lw: 1.8 });
  const top = ry + 34, axisY = top + n * rowH + 6;
  const BX = X0 + 10, BW = 640, sc = BW / d.axisMax;
  const base = n >= 5 ? rows.map((_, i) => 0.8 + i * 0.35) : sched(n, dur, 0.8, 2.0, 1.2);
  const st = atStart(base, rows, dur), ap = pr(t, 0.4, 0.8);
  const ticks = 4;
  for (let k = 0; k <= ticks; k++) {
    const x = BX + (BW * k) / ticks;
    line(x, top - 8, x, axisY, { col: P.faint, lw: 1.2, dash: [4, 8], p: ap, alpha: k ? 0.7 : 1, noGhost: true });
    line(x, axisY - 8, x, axisY + 10, { col: P.dim, lw: 1.8, p: ap, noGhost: true });
  }
  line(BX, axisY, BX + BW, axisY, { col: P.dim, lw: 2, p: ap, noGhost: true });
  text(`${d.axisMax}${d.unit || ''}`, BX + BW, axisY + 42, { font: 'Mono', size: 30, col: P.dim, align: 'center', alpha: ap });
  const fs = rowH >= 250 ? 46 : rowH >= 190 ? 38 : rowH >= 112 ? 31 : 28, barH = Math.min(90, Math.round(rowH * 0.27));
  const DIM = '#d8aa72';
  const tagSz = Math.max(26, Math.round(fs * 0.7));
  rows.forEach((r, i) => {
    const ry0 = top + i * rowH + (rowH - (fs + 16 + barH)) / 2 - 4, p = pr(t, st[i], 0.55), bp = pr(t, st[i] + 0.1, 0.65), hi = !!r.hi;
    if (t < st[i]) return;
    const ly = ry0 + fs;
    const lw = text(r.label, X0, ly, { font: 'Mono', size: fs, col: hi ? P.amber : P.white, alpha: p });
    if (r.tag) tagBox(X0 + lw + 18, ly - fs * 0.34, r.tag, { size: tagSz, col: hi ? P.amber : DIM, alpha: p, p });
    if (r.right) {
      const rs = layout(r.right, 'Mono', 230, fs).size;
      text(r.right, X1, ly, { font: 'Mono', size: rs, col: hi ? P.amber : DIM, align: 'right', alpha: p });
    }
    const by = ly + 16, len = r.value * sc * bp;
    rect(BX, by, Math.max(3, len), barH, { col: hi ? P.amber : DIM, lw: 2.4, p: cl(bp * 3), fill: hi ? P.amber : DIM, fillAlpha: hi ? 0.8 : 0.16 });
    if (!hi) hatchRect(BX, by, len, barH, { col: DIM, gap: 9, alpha: 0.5, p: 1 });
    const cy = by + barH / 2, vend = r.value * sc;
    let tx = BX + vend;
    if (r.err != null && bp > 0.85) {
      const e0 = (r.value - r.err) * sc, e1 = (r.value + r.err) * sc, wp = cl((bp - 0.85) * 6.7);
      for (const [col, lwd] of [[P.deep, 7], [P.white, 3]]) {
        path([[BX + e0, cy], [BX + e1, cy]], { col, lw: lwd, p: wp });
        path([[BX + e0, cy - barH * 0.42], [BX + e0, cy + barH * 0.42]], { col, lw: lwd, p: wp });
        path([[BX + e1, cy - barH * 0.42], [BX + e1, cy + barH * 0.42]], { col, lw: lwd, p: wp });
      }
      tx = BX + e1;
    }
    text(`${r.value}${d.unit || ''}`, tx + 18, cy + fs * 0.34, { font: 'Mono', size: fs, col: hi ? P.amber : P.white, alpha: cl((bp - 0.95) * 20) });
  });
}

// ---------- callout ----------
function callout(t, d, dur) {
  const warn = d.kind !== 'info', col = warn ? P.coral : P.cyan;
  const n = d.lines.length, st = sched(n, dur, 0.9, 1.9, 1.3), cp = pr(t, 0.1, 0.6);
  const cx = X0, hdr = 160, sz = 48, tw = CW - 140;
  const ls = d.lines.map((l) => layout(l, 'Mono', tw, sz, 2));
  const hs = ls.map((l) => 56 + l.lines.length * l.size * 1.3 + 40);
  const H = hdr + hs.reduce((a, b) => a + b, 0) + 20;
  const cy0 = 240, ry0 = cy0 + H + 380;
  const dy = off(cy0, Math.min(1440, ry0));
  const cy = cy0;
  ctx.save(); ctx.translate(0, dy);
  rect(cx, cy, CW, H, { col, lw: 3.5, p: cp, fill: P.panel });
  // hazard-hatch header
  hatchRect(cx + 3, cy + 3, CW - 6, hdr - 6, { col, gap: 16, lw: 5, alpha: 0.22, p: cp });
  line(cx, cy + hdr, cx + CW, cy + hdr, { col, lw: 3, p: cp, noGhost: true });
  // warning triangle
  const tp = pr(t, 0.2, 0.5);
  path([[cx + 62, cy + 36], [cx + 106, cy + 112], [cx + 18, cy + 112]], { col, lw: 4, p: tp, close: true });
  text(warn ? '!' : 'i', cx + 62, cy + 100, { font: 'Mono', size: 44, col, align: 'center', alpha: cl((tp - 0.5) * 2) });
  const tl = layout(d.title, 'Brush', CW - 190, 84, 1);
  ctx.save(); ctx.globalAlpha = cp * 0.9; ctx.fillStyle = P.panel; ctx.fillRect(cx + 138, cy + hdr / 2 - tl.size * 0.62, measure(d.title, 'Brush', tl.size) + 24, tl.size * 1.1); ctx.restore();
  text(d.title, cx + 150, cy + hdr / 2 + tl.size * 0.3, { font: 'Brush', size: tl.size, col: P.white, reveal: cl(cp * 1.5) });
  let y = cy + hdr + 20;
  d.lines.forEach((l, i) => {
    const p = pr(t, st[i], 0.5), L = ls[i];
    if (i) line(cx + 30, y, cx + CW - 30, y, { col: P.faint, lw: 1.5, dash: [6, 8], p, noGhost: true });
    rect(cx + 40, y + 56 + L.size * 0.1, 28, 28, { col, lw: 2.5, p, fill: warn ? '#3a2233' : P.panel });
    textLines(L.lines, cx + 100, y + 56 + L.size * 0.8, L.size * 1.3, { font: 'Mono', size: L.size, col: P.white, alpha: cl((p - 0.3) * 1.8) });
    y += hs[i];
  });
  robot(300, cy0 + H + 360, 11, { t, p: pr(t, 0.3, 0.8), mood: warn ? 'warn' : 'ok' });
  ctx.restore();
}

// ---------- checklist ----------
function checklist(t, d, dur) {
  const items = d.items, n = items.length, hp = pr(t, 0.1, 0.7);
  const tl0 = layout(d.title, 'Brush', 840, 80, 2), ryE = 240 + (tl0.lines.length - 1) * tl0.size * 1.02 + 36;
  const rowH = Math.min(260, (1380 - ryE - 90) / n), dy = off(170, ryE + 50 + n * rowH);
  ctx.save(); ctx.translate(0, dy);
  const ry = heading(d.title, 240, hp, { maxSize: 80 });
  const st = sched(n, dur, 0.8, 2.0, 1.2), top = ry + 50;
  items.forEach((it, i) => {
    const y = top + i * rowH, p = pr(t, st[i], 0.55), cy = y + rowH / 2 - 8, S = 64;
    const mc = it.mark === 'x' ? P.coral : it.mark === 'check' ? P.amber : P.dim;
    rect(X0 + 6, cy - S / 2, S, S, { col: mc, lw: 3, p, fill: P.panel });
    const mp = cl((p - 0.35) * 1.9), bx = X0 + 6, by = cy - S / 2;
    if (it.mark === 'x') { path([[bx + 14, by + 14], [bx + S - 14, by + S - 14]], { col: mc, lw: 6, p: cl(mp * 2) }); path([[bx + S - 14, by + 14], [bx + 14, by + S - 14]], { col: mc, lw: 6, p: cl(mp * 2 - 1) }); }
    else if (it.mark === 'check') path([[bx + 12, by + 34], [bx + 27, by + 49], [bx + S - 10, by + 14]], { col: mc, lw: 7, p: mp });
    else path([[bx + 16, cy], [bx + S - 16, cy]], { col: mc, lw: 6, p: mp });
    const L = layout(it.text, 'Mono', X1 - (X0 + 110), 42, 3);
    textLines(L.lines, X0 + 110, cy - ((L.lines.length - 1) * L.size * 1.3) / 2 + L.size * 0.34, L.size * 1.3, { font: 'Mono', size: L.size, col: P.white, alpha: cl((p - 0.25) * 1.8) });
    if (i < n - 1) line(X0, y + rowH - 10, X1, y + rowH - 10, { col: P.faint, lw: 1.5, dash: [6, 8], p, noGhost: true });
  });
  ctx.restore();
}

function authorLines(names, maxW, size) {
  const lines = []; let cur = '';
  names.forEach((nm, i) => {
    const piece = nm + (i < names.length - 1 ? ',' : ''), test = cur ? `${cur} ${piece}` : piece;
    if (!cur || measure(test, 'Mono', size) <= maxW) cur = test; else { lines.push(cur); cur = piece; }
  });
  if (cur) lines.push(cur);
  return { size, lines };
}

// ---------- endcard ----------
function endcard(t, d, dur) {
  const st = sched(5, dur, 0.3, 2.2, 0.55);
  const p0 = pr(t, st[0], 0.7), nm = layout(d.name, 'Marker', 800, 210);
  text(d.name, 540, 520, { font: 'Marker', size: nm.size, col: P.white, align: 'center', reveal: p0 });
  const nw = measure(d.name, 'Marker', nm.size);
  dim(540 - nw / 2, 575, 540 + nw / 2, 575, { p: pr(t, st[0] + 0.3, 0.6), col: P.amber, tick: 10 });
  const p1 = pr(t, st[1], 0.5), ax = layout(`arXiv ${d.arxivId}`, 'Mono', CW, 50);
  text(`arXiv ${d.arxivId}`, 540, 680, { font: 'Mono', size: ax.size, col: P.cyan, align: 'center', alpha: p1 });
  const p2 = pr(t, st[2], 0.5), au = authorLines(d.authors || [], 780, 38);
  line(150, 750, 930, 750, { col: P.faint, lw: 1.6, p: p2, noGhost: true });
  textLines(au.lines, 540, 805, au.size * 1.45, { font: 'Mono', size: au.size, col: P.white, align: 'center', alpha: p2 });
  const ay = 805 + (au.lines.length - 1) * au.size * 1.45 + 40;
  line(150, ay, 930, ay, { col: P.faint, lw: 1.6, p: p2, noGhost: true });
  if (d.tagline) { const p3 = pr(t, st[3], 0.5), tg = layout(d.tagline, 'Brush', 780, 72); text(d.tagline, 540, ay + 90, { font: 'Brush', size: tg.size, col: P.white, align: 'center', alpha: p3 }); }
  const p4 = pr(t, st[4], 0.6), hy = ay + 150, hl = layout(HANDLE, 'Mono', 700, 52);
  const hw = measure(HANDLE, 'Mono', hl.size) + 70;
  rect(540 - hw / 2, hy, hw, 96, { col: P.amber, lw: 3, p: p4, fill: P.panel });
  text(HANDLE, 540, hy + 48 + hl.size * 0.34, { font: 'Mono', size: hl.size, col: P.amber, align: 'center', alpha: cl((p4 - 0.4) * 2) });
  robot(540, 1400, 7.5, { t, p: pr(t, 0.2, 0.9), wave: 1 });
}

// ---------- caption ----------
function caption(s, alpha) {
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(7,29,53,0.92)'; ctx.fillRect(60, 1490, 960, 96);
  ctx.strokeStyle = P.cyan; ctx.lineWidth = 2.5; ctx.strokeRect(60, 1490, 960, 96);
  ctx.strokeStyle = P.amber; ctx.lineWidth = 4; ctx.beginPath();
  for (const [x, y, dx, dy] of [[60, 1490, 1, 1], [1020, 1490, -1, 1], [60, 1586, 1, -1], [1020, 1586, -1, -1]]) { ctx.moveTo(x + dx * 26, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * 26); }
  ctx.stroke();
  let l = layout(s, 'Mono', 900, 46, 1);
  if (l.size < 40) { l = layout(s, 'Mono', 900, 34, 2); }
  const lh = l.size * 1.12, y0 = 1538 - ((l.lines.length - 1) * lh) / 2;
  ctx.font = `${l.size}px Mono`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = P.white;
  l.lines.forEach((ln, i) => ctx.fillText(ln, 540, y0 + i * lh));
  ctx.restore();
}

export default {
  name: 'blueprint',
  bg: P.bg,
  background() { drawBg(); },
  caption,
  blocks: { hook, flow, bigstat, versus, bars, callout, checklist, endcard },
  async thumbnail({ name, hook: h, arxivId }, outPath) {
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, 1080, 1920); drawBg();
    const lines = String(h || '').split(/\\n|\n/).map((s) => s.trim()).filter(Boolean).slice(0, 4);
    let size = 170; for (const l of lines) size = Math.min(size, layout(l, 'Marker', 860, 170).size);
    const lh = size * 1.14, top = 470, bottom = top + lines.length * lh;
    line(110, top - 60, 110, bottom + 80, { col: P.dim, lw: 1.5, dash: [12, 8], alpha: 0.8, noGhost: true });
    line(970, top - 60, 970, bottom + 80, { col: P.dim, lw: 1.5, dash: [12, 8], alpha: 0.8, noGhost: true });
    lines.forEach((l, i) => text(l, 540, top + size * 0.82 + i * lh, { font: 'Marker', size, col: i === lines.length - 1 ? P.amber : P.white, align: 'center' }));
    dim(110, bottom + 44, 970, bottom + 44, { col: P.cyan });
    const ny = bottom + 210, nl = layout(name, 'Marker', 560, 110);
    const nw = measure(name, 'Marker', nl.size) + 70;
    rect(110, ny - nl.size * 0.95, nw, nl.size * 1.35, { col: P.amber, lw: 3.5, fill: P.panel });
    text(name, 145, ny, { font: 'Marker', size: nl.size, col: P.amber });
    text(`arXiv ${arxivId}`, 110, ny + nl.size * 0.4 + 56, { font: 'Mono', size: 38, col: P.cyan });
    robot(210, 1460, 9, { t: 0.4, wave: 1 });
    const hl = layout(HANDLE, 'Mono', 600, 46), hw = measure(HANDLE, 'Mono', hl.size) + 56;
    rect(360, 1380, hw, 84, { col: P.amber, lw: 3, fill: P.panel });
    text(HANDLE, 388, 1380 + 42 + hl.size * 0.34, { font: 'Mono', size: hl.size, col: P.amber });
    fs.writeFileSync(outPath, cv.toBuffer('image/png'));
  },
};
