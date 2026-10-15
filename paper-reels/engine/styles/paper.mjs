// "paper" style: cream paper, ink strokes, marker highlights, robot. Built on core.mjs and motion.mjs.
// v2: kinetic. Every block schedules a visible change at least every ~2.5 s. Items land with slams, pops and
// stamps; a "focus" plate (green tint, ink inversion or grey band, depending on the block) moves to the item
// the voice is on, and secondary beats move it again when a line has long gaps. Beats add no text or numbers.
import { W, C, ctx, cl, lerp, eo3, eob, eio, seg, txt, tw, line, rectS, circle, marker, arrow, stroke, hatch, robot, burst, bg, hop } from '../core.mjs';
import { popIn, countStr, typeOn, slideIn, pulse, slam, stamp, jolt, gate, atTime, beats, lastHit, wiggle } from '../motion.mjs';
import { renderThumbnail } from '../thumbnail.mjs';
import { HANDLE } from '../brand.mjs';

const X0 = 80, X1 = 920, TOP = 170, BOT = 1430, CX = 500;

// ---------- helpers ----------
const fit = (s, font, size, maxW) => Math.min(size, size * maxW / tw(s, font, size));
function wrap(s, font, size, maxW) {
  const out = []; let cur = '';
  for (const w of String(s).split(' ')) { const t = cur ? `${cur} ${w}` : w; if (tw(t, font, size) > maxW && cur) { out.push(cur); cur = w; } else cur = t; }
  if (cur) out.push(cur); return out;
}
// start times: honor optional `at` (fraction of dur), clamped so the item keeps >= 1.9 s on screen
function times(items, dur, firstAt = 0.4) {
  const n = items.length, last = Math.max(firstAt, dur - 2.6), step = n > 1 ? (last - firstAt) / (n - 1) : 0;
  return items.map((it, i) => atTime(it && it.at, dur, firstAt + i * step));
}
// Focus schedule: an item takes focus when it appears; each extra beat moves focus to the next visible item
// (or toggles it when only one is visible). Returns [{t, i}], i = -1 means nothing focused.
function focusSched(appear, extra) {
  const ev = [...appear.map((t, i) => ({ t, i, item: true })), ...extra.map((t) => ({ t }))].sort((a, b) => a.t - b.t);
  const out = []; let cur = -1;
  for (const e of ev) {
    if (e.item) cur = e.i;
    else { const vis = appear.filter((x) => x <= e.t).length; if (!vis) continue; cur = vis === 1 ? (cur === -1 ? 0 : -1) : (cur + 1) % vis; }
    out.push({ t: e.t, i: cur });
  }
  return out;
}
function focusAmt(t, sched, i, d = 0.14) {
  let a = 0; for (let k = 0; k < sched.length; k++) if (sched[k].i === i) a = Math.max(a, gate(t, sched[k].t, sched[k + 1] ? sched[k + 1].t : Infinity, d));
  return a;
}
const beatTimes = (sched) => sched.map((s) => s.t);
function title(t, text, y, size = 84) {
  const s = fit(text, 'Brush', size, X1 - X0), w = tw(text, 'Brush', s), p = popIn(t, 0.05, 0.3);
  if (p <= 0) return y + s * 0.3 + 40;
  marker(CX - w / 2 - 12, CX + w / 2 + 12, y + 8, s * 0.6, eo3(seg(t, 0.3, 0.55)), C.green, 0.45);
  txt(text, CX, y + s * 0.3, { font: 'Brush', size: s, alpha: cl(p * 3), sc: 0.7 + 0.3 * p, rot: -0.01 });
  return y + s * 0.3 + 40;
}
// little robot that hops at every hit time and raises its arm (points) for a moment after each one
function mascot(t, x, y, s, hits, { enter = 0, from = -160, eye = 'open' } = {}) {
  const ep = eo3(seg(t, enter, enter + 0.35)); if (ep <= 0) return;
  const { since } = lastHit(t, hits), jump = since < 0.45 ? Math.sin(Math.PI * since / 0.45) * 70 : 0;
  const up = since < 1.2 ? 1 - seg(since, 0.8, 1.2) : 0;
  robot(lerp(from, x, ep), y - jump - hop(t, 0.9, 6), s, { eye: since < 1.2 ? 'happy' : eye, up, t, rot: wiggle(t, 0.03, 0.7, 3) });
}

// ---------- hook ----------
// Every word slams in (all landed by ~1 s), the last line gets a marker swipe, the robot jumps in, then
// beats drop an ink plate behind one line at a time (text inverts to paper).
function hook(t, d, dur) {
  const ls = d.lines, n = ls.length, size = Math.min(210, ...ls.map((l) => fit(l, 'Brush', 210, 860)));
  const lh = size * 1.04, subH = d.sub ? 100 : 0, total = n * lh + subH, top = TOP + 30 + Math.max(0, (1150 - TOP - 30 - total) / 2);
  const words = []; ls.forEach((l, li) => { const ws = l.split(' '), sp = tw(' ', 'Brush', size), lw = tw(l, 'Brush', size); let x = CX - lw / 2;
    ws.forEach((w) => { const ww = tw(w, 'Brush', size); words.push({ w, li, x: x + ww / 2, ww }); x += ww + sp; }); });
  const gap = Math.min(0.12, 0.72 / Math.max(1, words.length)), slams = words.map((_, k) => slam(t, 0.04 + k * gap, { d: 0.15, from: 2.3, amp: 0 }));
  const lands = slams.map((s, k) => 0.04 + k * gap + 0.15), done = lands[lands.length - 1];
  const robotIn = done + 0.45, bt = beats([...lands, done + 0.15, robotIn + 0.35], dur, { maxGap: 2.4, gap: 2.0 });
  const plates = bt.map((b, k) => ({ t: b, li: (n - 1 - (k % n)) }));      // last line first, then upward
  const [jx, jy] = jolt(t, [...lands, ...bt], 9, 0.28);
  ctx.save(); ctx.translate(jx, jy);
  ls.forEach((l, li) => {
    const base = top + size * 0.8 + li * lh, lw = tw(l, 'Brush', size);
    if (li === n - 1) marker(CX - lw / 2 - 16, CX + lw / 2 + 16, base - size * 0.22, size * 0.62, eo3(seg(t, done + 0.05, done + 0.25)), C.green, 0.5);
    let f = 0; plates.forEach((p, k) => { if (p.li === li) f = Math.max(f, gate(t, p.t, plates[k + 1] ? plates[k + 1].t : Infinity, 0.12)); });
    if (f > 0) { const pc = pulse(t, plates.find((p) => p.li === li && p.t <= t)?.t ?? -9, 0.06, 0.25);
      ctx.save(); ctx.translate(CX, base - size * 0.3); ctx.scale(f * pc, f * pc); ctx.rotate(-0.02 + li * 0.015);
      rectS(-lw / 2 - 36 + 10, -size * 0.55 + 10, lw + 72, size * 1.0, { fill: C.green, col: null, lw: 0, seed: 50 + li });
      rectS(-lw / 2 - 36, -size * 0.55, lw + 72, size * 1.0, { fill: C.ink, col: C.ink, lw: 6, seed: 60 + li }); ctx.restore(); }
    words.forEach((wd, k) => { if (wd.li !== li) return; const s = slams[k]; if (s.alpha <= 0) return;
      ctx.save(); ctx.translate(wd.x, base - size * 0.3); ctx.scale(s.sc, s.sc);
      txt(wd.w, 0, size * 0.3, { font: 'Brush', size, alpha: s.alpha, col: f > 0.5 ? C.paper : C.ink, rot: -0.015 + li * 0.01 }); ctx.restore(); });
  });
  if (d.sub) { const st = robotIn + 0.2, s = fit(d.sub, 'Mono', 40, 840), sy = top + n * lh + 74;
    const p = eob(seg(t, st, st + 0.25)); if (p > 0) txt(typeOn(d.sub, t, st, 40), CX - tw(d.sub, 'Mono', s) / 2, sy, { font: 'Mono', size: s, align: 'left', alpha: cl(p * 2) }); }
  ctx.restore();
  // robot: runs in, jumps on each plate and points up at the text
  if (t > robotIn + 0.3) burst(220, 1240, robotIn + 0.3, t, 9, C.green, 260, 22);
  for (const b of bt) if (t > b) burst(CX, top + lh * 1.5, b, t, 10, C.green, 380, 22);
  mascot(t, 220, 1420, 14, [robotIn + 0.3, ...bt], { enter: robotIn, from: -180 });
}

// ---------- flow ----------
// Steps pop in with a bounce, arrows draw themselves, a token runs down each arrow before the next step,
// the active step fills green, flags stamp on with a small shake.
function flow(t, d, dur) {
  const steps = d.steps, n = steps.length, flags = d.flags || [], st = times(steps, dur, 0.3);
  const fts = flags.map((f) => Math.max(st[f.step] + 0.3, atTime(f.at, dur, st[f.step] + 0.8)));
  const bt = beats([...st, ...fts], dur), sched = focusSched(st, bt);
  const [jx, jy] = jolt(t, [...st.map((x) => x + 0.2), ...fts.map((x) => x + 0.12)], 6, 0.25);
  ctx.save(); ctx.translate(jx, jy);
  let y = TOP;
  if (d.title) y = title(t, d.title, y + 40, 84) + 10;
  const lastFlag = flags.some((f) => f.step === n - 1), extra = lastFlag ? 80 : 0;
  const bh = n > 3 ? 190 : 220, gap = Math.min(150, (BOT - y - n * bh - extra) / Math.max(1, n - 1));
  const y0 = y + Math.max(0, (BOT - y - n * bh - (n - 1) * gap - extra) / 2), byOf = (i) => y0 + i * (bh + gap);
  steps.forEach((s, i) => {
    const by = byOf(i), p = popIn(t, st[i], 0.28);
    if (i < n - 1) { const ap = eo3(seg(t, st[i] + 0.2, st[i] + 0.45)); if (ap > 0) arrow(X0 + 56, by + bh + 8, X0 + 56, by + bh + gap - 8, C.ink, 8, ap); }
    if (p <= 0) return;
    const f = focusAmt(t, sched, i), sc = (0.55 + 0.45 * p) * pulse(t, st[i] + 0.28, 0.04, 0.2);
    ctx.save(); ctx.globalAlpha = cl(p * 3); ctx.translate(CX, by + bh / 2); ctx.scale(sc, sc); ctx.rotate((1 - cl(p)) * (i % 2 ? 0.08 : -0.08)); ctx.translate(-CX, -(by + bh / 2));
    rectS(X0 + 8, by + 8, X1 - X0, bh, { fill: C.ink, col: null, lw: 0, seed: 20 + i });
    rectS(X0, by, X1 - X0, bh, { fill: C.paper, col: C.ink, lw: 6, seed: 30 + i });
    if (f > 0) rectS(X0 + 6, by + 6, (X1 - X0 - 12) * f, bh - 12, { fill: C.green, col: null, lw: 0, seed: 35 + i, alpha: 0.8 });
    circle(X0 + 56, by + bh / 2, 36, { fill: f > 0.5 ? C.ink : C.green, col: C.ink, lw: 5, seed: 40 + i, alpha: 0.95 });
    txt(String(i + 1), X0 + 56, by + bh / 2 + 17, { font: 'Marker', size: 48, col: f > 0.5 ? C.paper : C.ink });
    const tx = X0 + 120, mw = X1 - tx - 24, hasSub = !!s.sub;
    const ls = wrap(s.label, 'Brush', 62, mw), lsz = ls.length > 1 ? 54 : fit(s.label, 'Brush', 62, mw);
    const lines = ls.length > 1 ? wrap(s.label, 'Brush', lsz, mw) : [s.label];
    const blockH = lines.length * lsz * 0.95 + (hasSub ? 44 : 0), ty = by + (bh - blockH) / 2 + lsz * 0.8;
    lines.forEach((l, k) => txt(l, tx, ty + k * lsz * 0.95, { font: 'Brush', size: lsz, align: 'left' }));
    if (hasSub) txt(s.sub, tx, ty + (lines.length - 1) * lsz * 0.95 + 44, { font: 'Mono', size: Math.max(28, fit(s.sub, 'Mono', 30, mw)), align: 'left', alpha: 0.9 });
    ctx.restore();
  });
  // token: runs down the arrow whenever focus moves from step k to step k+1
  for (let k = 1; k < sched.length; k++) {
    const a = sched[k - 1].i, b = sched[k].i; if (a < 0 || b !== a + 1) continue;
    const u = seg(t, sched[k].t - 0.3, sched[k].t); if (u <= 0 || u >= 1) continue;
    const yA = byOf(a) + bh / 2, yB = byOf(b) + bh / 2, yy = lerp(yA, yB, eio(u));
    circle(X0 + 56, yy, 22, { fill: C.green, col: C.ink, lw: 5, seed: 45 });
  }
  steps.forEach((s, i) => {
    flags.forEach((f, fi) => {
      if (f.step !== i) return;
      const sp = stamp(t, fts[fi]); if (sp.alpha <= 0) return;
      const fs = Math.max(28, fit(f.text, 'Mono', 30, 600)), fw = tw(f.text, 'Mono', fs) + 40, fx = X1 - fw, by = byOf(i);
      const fy = i < n - 1 ? by + bh + gap / 2 - 26 : by + bh + 20;
      ctx.save(); ctx.globalAlpha = sp.alpha; ctx.translate(fx + fw / 2 + sp.dx, fy + 28 + sp.dy); ctx.rotate(-0.025); ctx.scale(sp.sc, sp.sc);
      rectS(-fw / 2 + 6, -28 + 6, fw, 58, { fill: C.ink, col: null, lw: 0, seed: 75 + i });
      rectS(-fw / 2, -28, fw, 58, { fill: C.paper, col: C.ink, lw: 5, seed: 70 + i });
      marker(-fw / 2 + 8, -fw / 2 + 8 + (fw - 16) * eo3(seg(t, fts[fi] + 0.15, fts[fi] + 0.4)), 18, 12, 1, C.green, 0.7);
      txt(f.text, 0, 11, { font: 'Mono', size: fs });
      ctx.restore();
    });
  });
  ctx.restore();
}

// ---------- bigstat ----------
// Each value counts up from 0 inside a plate, lands with a punch, burst and shake, then its label slides in.
// The plate of the item in focus is inked (value in paper colour).
function bigstat(t, d, dur) {
  const items = d.items, n = items.length, st = times(items, dur, 0.3), CNT = 0.7, land = st.map((x) => x + CNT);
  const footLs = d.foot ? wrap(d.foot, 'Mono', 32, X1 - X0 - 40) : [], footH = footLs.length ? footLs.length * 44 + 60 : 0;
  const ft = d.foot ? (d.footAt != null ? atTime(d.footAt, dur, 0) : Math.max(...land) + 0.6) : null;
  const bt = beats([...st, ...land], dur), sched = focusSched(st, bt);
  const areaH = (BOT - TOP - footH) / n, vsz0 = n === 1 ? 280 : n === 2 ? 230 : 180;
  const [jx, jy] = jolt(t, [...land, ...(ft != null ? [ft + 0.12] : [])], 12, 0.3);
  ctx.save(); ctx.translate(jx, jy);
  items.forEach((it, i) => {
    const cy = TOP + areaH * i + areaH / 2, vsz = fit(it.value, 'Marker', vsz0, 680), lsz = 56;
    const ls = wrap(it.label, 'Brush', lsz, X1 - X0 - 20), lh = 58, ph = vsz * 0.95, blockH = ph + 30 + ls.length * lh;
    const top = cy - blockH / 2, pw = tw(it.value, 'Marker', vsz) + 90, pcy = top + ph / 2, f = focusAmt(t, sched, i);
    const p = popIn(t, st[i], 0.25);
    if (p <= 0) {   // empty slot waits for the voice: pops in, hatched, no text
      const e = popIn(t, 0.08 + i * 0.14, 0.25); if (e <= 0) return;
      ctx.save(); ctx.translate(CX, pcy); ctx.rotate(i % 2 ? 0.015 : -0.015); ctx.scale(e * 0.92, e * 0.92);
      rectS(-pw / 2, -ph / 2, pw, ph, { fill: C.paper, col: C.ink, lw: 5, seed: 86 + i, alpha: 1 });
      hatch(-pw / 2 + 6, -ph / 2 + 6, pw - 12, ph - 12, { gap: 22, alpha: 0.3, seed: 88 + i });
      ctx.restore(); return;
    }
    const { since } = lastHit(t, bt.filter((b) => sched.find((s) => s.t === b && s.i === i)));
    const sc = (0.4 + 0.6 * p) * pulse(t, land[i], 0.14, 0.3) * (since < 0.3 ? pulse(since, 0, 0.08, 0.3) : 1);
    ctx.save(); ctx.translate(CX, pcy); ctx.rotate(i % 2 ? 0.015 : -0.015); ctx.scale(sc, sc);
    rectS(-pw / 2 + 12, -ph / 2 + 12, pw, ph, { fill: C.ink, col: null, lw: 0, seed: 80 + i });
    rectS(-pw / 2, -ph / 2, pw, ph, { fill: C.paper, col: C.ink, lw: 7, seed: 82 + i });
    if (f > 0) rectS(-pw / 2 + 4, -ph / 2 + 4, pw - 8, (ph - 8) * f, { fill: C.ink, col: null, lw: 0, seed: 84 + i });
    txt(countStr(it.value, t, st[i] + 0.05, CNT - 0.05), 0, vsz * 0.33, { font: 'Marker', size: vsz, col: f > 0.5 ? C.paper : C.ink });
    ctx.restore();
    if (t > land[i]) burst(CX, pcy, land[i], t, 10, C.green, pw * 0.55 + 60, 22);
    const lt = land[i] + 0.05, lp = eo3(seg(t, lt, lt + 0.3));
    if (lp > 0) ls.forEach((l, k) => txt(l, CX + slideIn(t, lt + k * 0.06, k % 2 ? 320 : -320, 0.3), top + ph + 30 + lh * (k + 1) - 12, { font: 'Brush', size: lsz, alpha: lp }));
    if (i < n - 1) { const dp = eo3(seg(t, st[i + 1] - 0.2, st[i + 1])); if (dp > 0) line(CX - 300 * dp, TOP + areaH * (i + 1), CX + 300 * dp, TOP + areaH * (i + 1), { col: C.ink, lw: 4, alpha: 0.4, wob: 3, seed: 90 + i }); }
  });
  if (footLs.length && t > ft) {
    const fs = stamp(t, ft), fy = BOT - footH + 64, fw = Math.max(...footLs.map((l) => tw(l, 'Mono', 32)));
    ctx.save(); ctx.globalAlpha = fs.alpha; ctx.translate(CX, fy - 20); ctx.scale(fs.sc, fs.sc); ctx.translate(-CX, -(fy - 20));
    rectS(CX - fw / 2 - 30, fy - 46, fw + 60, footLs.length * 44 + 30, { fill: C.paper, col: C.ink, lw: 4, seed: 95, rot: -0.01 });
    footLs.forEach((l, k) => txt(l, CX, fy + k * 44, { font: 'Mono', size: 32 }));
    ctx.restore();
  }
  ctx.restore();
}

// ---------- versus ----------
// Both bars of a row grow together with overshoot while their values count up. A grey band marks the row
// the voice is on; both series get identical treatment, so nothing reads as a winner.
function versus(t, d, dur) {
  const rows = d.rows, n = rows.length, st = times(rows, dur, 0.9);
  const bt = beats([...st, ...st.map((x) => x + 0.6)], dur), sched = focusSched(st, bt);
  const lp = popIn(t, 0.1, 0.3);
  const [jx, jy] = jolt(t, st.map((x) => x + 0.55), 7, 0.25);
  ctx.save(); ctx.translate(jx, jy);
  if (lp > 0) [[d.aTitle, 0], [d.bTitle, 1]].forEach(([nm, k]) => {
    const x = X0 + k * 430, s = fit(nm, 'Brush', 52, 380);
    ctx.save(); ctx.translate(x + 22, TOP + 28); ctx.scale(lp, lp); ctx.translate(-x - 22, -TOP - 28);
    rectS(x, TOP + 6, 44, 44, { fill: k ? C.ink : C.paper, col: C.ink, lw: 5, seed: 110 + k, alpha: k ? 0.7 : 1 });
    if (!k) hatch(x + 4, TOP + 10, 36, 36, { gap: 10, alpha: 0.5, seed: 112 });
    txt(nm, x + 62, TOP + 44, { font: 'Brush', size: s, align: 'left' }); ctx.restore();
  });
  const y0 = TOP + 110, rh = (BOT - y0) / n, BW = X1 - X0 - 20;
  rows.forEach((r, i) => {
    const ry = y0 + i * rh, p = popIn(t, st[i], 0.25); if (p <= 0) return;
    const f = focusAmt(t, sched, i);
    if (f > 0) { ctx.save(); ctx.globalAlpha = f; rectS(X0 - 30, ry + 4, X1 - X0 + 50, rh - 28, { fill: 'rgba(26,26,26,0.13)', col: C.ink, lw: 5, seed: 105 + i, rot: (i % 2 ? 0.006 : -0.006) }); ctx.restore(); }
    ctx.save(); ctx.globalAlpha = cl(p * 2);
    const ls = wrap(r.label, 'Brush', 62, X1 - X0), lsz = ls.length > 1 ? 52 : fit(r.label, 'Brush', 62, X1 - X0);
    ls.forEach((l, k) => txt(l, X0 + slideIn(t, st[i], -120, 0.25), ry + 66 + k * 54, { font: 'Brush', size: lsz, align: 'left' }));
    const by = ry + 66 + (ls.length - 1) * 54 + 40, room = Math.min(200, (rh - (by - ry) - 40) / 2);
    [[r.a, r.aW, 0, d.aTitle], [r.b, r.bW, 1, d.bTitle]].forEach(([val, wd, k, nm]) => {
      const g0 = st[i] + 0.1 + k * 0.08, g = eob(seg(t, g0, g0 + 0.45)), yy = by + k * room, bw = Math.max(30, (BW - 230) * wd * g), bhh = Math.min(96, room - 50);
      txt(nm, X0, yy, { font: 'Mono', size: 30, align: 'left', alpha: 0.85 });
      rectS(X0, yy + 14, bw, bhh, { fill: k ? C.ink : C.paper, col: C.ink, lw: 5, seed: 120 + i * 4 + k, alpha: k ? 0.7 : 1 });
      if (!k) hatch(X0 + 4, yy + 18, Math.max(10, bw - 8), bhh - 8, { gap: 16, alpha: 0.45, seed: 130 + i, p: 1 });
      const vs = String(val), vsz = fit(vs, 'Marker', 72, X1 - X0 - (BW - 230) * wd - 30);
      txt(countStr(vs, t, g0, 0.6), X0 + bw + 20, yy + 14 + bhh * 0.78, { font: 'Marker', size: vsz, align: 'left', alpha: cl(g * 2) });
    });
    ctx.restore();
  });
  ctx.restore();
}

// ---------- bars ----------
// Bars grow with overshoot while values count up; a grey band follows the row being read. `hi` rows get a
// heavier ink outline and hatching (no red/green judgment on data marks).
function bars(t, d, dur) {
  const rows = d.rows, n = rows.length, st = times(rows, dur, 0.7);
  const bt = beats([...st, ...st.map((x) => x + 0.5)], dur), sched = focusSched(st, bt);
  const [jx, jy] = jolt(t, st.map((x) => x + 0.5), 5, 0.22);
  ctx.save(); ctx.translate(jx, jy);
  let y = TOP + 20;
  y = title(t, d.title, y + 20, 76) + 4;
  if (d.subtitle) { const sl = wrap(d.subtitle, 'Mono', 30, X1 - X0); sl.forEach((l, k) => txt(typeOn(l, t, 0.35 + k * 0.4, 60), X0, y + 30 + k * 38, { font: 'Mono', size: 30, align: 'left', alpha: 0.9 })); y += sl.length * 38 + 20; }
  const rh = Math.min(170, (BOT - y) / n), LW = 300, BWm = X1 - X0 - LW - 150;
  rows.forEach((r, i) => {
    const ry = y + i * rh, p = popIn(t, st[i], 0.25); if (p <= 0) return;
    const f = focusAmt(t, sched, i);
    if (f > 0) { ctx.save(); ctx.globalAlpha = f; rectS(X0 - 30, ry + 4, X1 - X0 + 50, rh - 8, { fill: 'rgba(26,26,26,0.2)', col: C.ink, lw: 4, seed: 140 + i }); ctx.restore(); }
    ctx.save(); ctx.globalAlpha = cl(p * 2);
    txt(r.label, X0 + slideIn(t, st[i], -100, 0.25), ry + rh * 0.5, { font: 'Brush', size: Math.max(28, fit(r.label, 'Brush', 50, LW - 10)), align: 'left' });
    if (r.tag) txt(r.tag, X0, ry + rh * 0.5 + 34, { font: 'Mono', size: 26, align: 'left', alpha: 0.85 });
    const g = eob(seg(t, st[i] + 0.05, st[i] + 0.5)), bw = Math.max(4, BWm * (r.value / d.axisMax) * g), bx = X0 + LW;
    rectS(bx, ry + rh * 0.22, bw, rh * 0.5, { fill: C.green, col: C.ink, lw: r.hi ? 10 : 5, seed: 150 + i, alpha: 0.85 });
    if (r.hi) hatch(bx + 4, ry + rh * 0.22 + 4, Math.max(8, bw - 8), rh * 0.5 - 8, { gap: 14, alpha: 0.5, seed: 155 + i });
    if (r.err && g > 0.9) { const ex = BWm / d.axisMax * r.err, cx = bx + bw, cy = ry + rh * 0.47; line(cx - ex, cy, cx + ex, cy, { col: C.ink, lw: 4, wob: 0.5 }); line(cx - ex, cy - 14, cx - ex, cy + 14, { col: C.ink, lw: 4, wob: 0.5 }); line(cx + ex, cy - 14, cx + ex, cy + 14, { col: C.ink, lw: 4, wob: 0.5 }); }
    txt(countStr(`${r.value}${d.unit}`, t, st[i] + 0.05, 0.6), bx + bw + 14 + (r.err ? BWm / d.axisMax * r.err + 14 : 0), ry + rh * 0.58, { font: 'Marker', size: 44, align: 'left' });
    if (r.right) txt(r.right, X1, ry + rh * 0.5 + 34, { font: 'Mono', size: 26, align: 'right', alpha: 0.85 });
    ctx.restore();
  });
  ctx.restore();
}

// ---------- callout ----------
// The card slams in with a shake; each line types on inside an ink plate that follows the voice.
function callout(t, d, dur) {
  const warn = d.kind === 'warn', col = warn ? C.red : C.green, st = times(d.lines, dur, 0.9);
  const bt = beats(st, dur, { maxGap: 2.4, gap: 2.0 }), sched = focusSched(st, bt);
  const lsz = 42, wrapped = d.lines.map((l) => wrap(l, 'Mono', lsz, X1 - X0 - 150));
  const tsz = fit(d.title, 'Brush', 100, X1 - X0 - 170), nl = wrapped.reduce((a, w) => a + w.length, 0);
  const h = 190 + nl * 54 + d.lines.length * 40, y0 = Math.max(TOP, TOP + (BOT - TOP - h - 280) / 2), s = slam(t, 0.05, { d: 0.18, from: 1.5, amp: 16 });
  if (s.alpha <= 0) return;
  const [jx, jy] = jolt(t, st, 5, 0.2);
  ctx.save(); ctx.globalAlpha = s.alpha; ctx.translate(CX + s.dx + jx, y0 + h / 2 + s.dy + jy); ctx.scale(s.sc, s.sc); ctx.rotate(-0.008); ctx.translate(-CX, -(y0 + h / 2));
  rectS(X0 + 12, y0 + 12, X1 - X0, h, { fill: C.ink, col: null, lw: 0, seed: 160 });
  rectS(X0, y0, X1 - X0, h, { fill: C.paper, col, lw: 9, seed: 161 });
  const ip = pulse(t, lastHit(t, beatTimes(sched)).since < 0.3 ? t - lastHit(t, beatTimes(sched)).since : -9, 0.25, 0.3);
  ctx.save(); ctx.translate(X0 + 70, y0 + 85); ctx.scale(ip, ip); ctx.rotate(wiggle(t, 0.06, 0.8));
  circle(0, 0, 42, { fill: col, col: C.ink, lw: 5, seed: 162 });
  txt(warn ? '!' : 'i', 0, 21, { font: 'Marker', size: 62, col: C.paper }); ctx.restore();
  txt(d.title, X0 + 140, y0 + 100, { font: 'Brush', size: tsz, align: 'left' });
  let yy = y0 + 190;
  d.lines.forEach((ln, i) => {
    const ls = wrapped[i], bh = ls.length * 54 + 14;
    if (t >= st[i]) {
      const f = focusAmt(t, sched, i, 0.12);
      if (f > 0) rectS(X0 + 28, yy - 44, (X1 - X0 - 56) * f, bh, { fill: C.ink, col: null, lw: 0, seed: 165 + i, rot: -0.004 });
      const tc = f > 0.5 ? C.paper : C.ink;
      circle(X0 + 56, yy - 12, 9, { fill: tc, col: null, lw: 0, seed: 170 + i });
      let left = Math.max(0, Math.floor((t - st[i]) * 45));
      ls.forEach((l, k) => { const sh = l.slice(0, left); left = Math.max(0, left - l.length - 1); if (sh) txt(sh, X0 + 85, yy + k * 54, { font: 'Mono', size: lsz, align: 'left', col: tc }); });
    }
    yy += ls.length * 54 + 40;
  });
  ctx.restore();
  const ry = Math.min(1425, y0 + h + 270);
  if (ry - 250 > y0 + h) mascot(t, 240, ry, 13, [...st, ...bt], { enter: 0.3, from: -160, eye: warn ? 'sad' : 'open' });
}

// ---------- checklist ----------
// Each mark stamps into its box with a pop and a tiny shake; a green band follows the item being read.
function checklist(t, d, dur) {
  const items = d.items, n = items.length, st = times(items, dur, 0.9);
  const bt = beats(st, dur), sched = focusSched(st, bt), stampT = st.map((x) => x + 0.12);
  const [jx, jy] = jolt(t, stampT.map((x) => x + 0.12), 6, 0.22);
  ctx.save(); ctx.translate(jx, jy);
  const y = title(t, d.title, TOP + 60, 84) + 20;
  const sz = 64, wr = items.map((it) => wrap(it.text, 'Brush', sz, X1 - X0 - 150)), tot = wr.reduce((a, w) => a + w.length, 0);
  const gap = Math.min(170, (BOT - 300 - y - tot * 66) / Math.max(1, n)), y0 = y + Math.max(10, gap / 2);
  let yy = y0, bottom = y0;
  items.forEach((it, i) => {
    const ls = wr[i], cy = yy + ls.length * 27, p = popIn(t, st[i], 0.25);
    if (p > 0) {
      const f = focusAmt(t, sched, i);
      if (f > 0) rectS(X0 - 24, yy - 20, (X1 - X0 + 40) * f, ls.length * 66 + 44, { fill: C.green, col: null, lw: 0, seed: 175 + i, alpha: 0.6 });
      ctx.save(); ctx.globalAlpha = cl(p * 2);
      ctx.save(); ctx.translate(X0 + 34, cy); ctx.scale(p, p);
      rectS(-34 + 5, -34 + 5, 68, 68, { fill: C.ink, col: null, lw: 0, seed: 179 + i });
      rectS(-34, -34, 68, 68, { fill: C.paper, col: C.ink, lw: 5, seed: 180 + i }); ctx.restore();
      const sp = stamp(t, stampT[i]);
      if (sp.alpha > 0) { ctx.save(); ctx.translate(X0 + 34, cy); ctx.scale(sp.sc, sp.sc); ctx.globalAlpha = sp.alpha; ctx.translate(-X0 - 34, -cy);
        if (it.mark === 'x') { line(X0 + 12, cy - 18, X0 + 56, cy + 22, { col: C.red, lw: 9, wob: 0 }); line(X0 + 56, cy - 18, X0 + 12, cy + 22, { col: C.red, lw: 9, wob: 0 }); }
        else if (it.mark === 'check') stroke([[X0 + 10, cy], [X0 + 28, cy + 20], [X0 + 60, cy - 26]], { lw: 10, col: C.green, seed: 190 + i });
        else line(X0 + 12, cy, X0 + 56, cy, { col: C.ink, lw: 10, wob: 0 });
        ctx.restore(); }
      ls.forEach((l, k) => txt(l, X0 + 100 + slideIn(t, st[i], 200, 0.25), yy + 46 + k * 66, { font: 'Brush', size: sz, align: 'left' }));
      ctx.restore();
    }
    yy += ls.length * 66 + gap; bottom = yy;
  });
  ctx.restore();
  if (bottom + 250 < BOT) mascot(t, 260, 1420, 13, [...stampT, ...bt], { enter: 0.4, from: -160 });
}

// ---------- endcard ----------
// Branding is fixed: name, arXiv id, authors, optional tagline, handle. Robot stays above the caption band.
function endcard(t, d) {
  const name = d.name, s = slam(t, 0.15, { d: 0.2, from: 2.2, amp: 14 }), nsz = fit(name, 'Marker', 180, 860), nw = tw(name, 'Marker', nsz);
  if (d.tagline) { const tp = popIn(t, 1.4, 0.3); if (tp > 0) txt(d.tagline, 540, 330, { font: 'Brush', size: Math.max(28, fit(d.tagline, 'Brush', 64, 900)), sc: tp, alpha: cl(tp * 2) }); }
  marker(540 - nw / 2 - 20, 540 - nw / 2 - 20 + (nw + 40) * eo3(seg(t, 0.45, 0.7)), 552, 60, 1, C.green, 0.5);
  if (s.alpha > 0) { ctx.save(); ctx.translate(540 + s.dx, 460 + s.dy); ctx.scale(s.sc, s.sc); txt(name, 0, 60, { font: 'Marker', size: nsz, alpha: s.alpha }); ctx.restore(); }
  const ax = `arXiv ${d.arxivId}`; txt(typeOn(ax, t, 0.75, 30), 540 - tw(ax, 'Mono', 56) / 2, 660, { font: 'Mono', size: 56, align: 'left' });
  const au = d.authors || [], rows = [];
  for (let i = 0; i < au.length; i += 2) rows.push(au.slice(i, i + 2).join(' · '));
  rows.forEach((r, k) => { const at = 1.1 + k * 0.08, p = eo3(seg(t, at, at + 0.3)); if (p > 0) txt(r, 540 + slideIn(t, at, k % 2 ? 300 : -300, 0.3), 740 + k * 45, { font: 'Mono', size: 30, alpha: p * 0.85 }); });
  const hy = 1130, hs = slam(t, 1.8, { d: 0.18, from: 2.0, amp: 12 }), hw = tw(HANDLE, 'Brush', 130);
  marker(540 - hw / 2 - 20, 540 + hw / 2 + 20, hy - 36, 130, eo3(seg(t, 3.0, 3.15)), C.green, 0.55);
  if (hs.alpha > 0) { ctx.save(); ctx.translate(540 + hs.dx, hy - 40 + hs.dy); ctx.scale(hs.sc, hs.sc); txt(HANDLE, 0, 40, { font: 'Brush', size: 130, rot: -0.03, alpha: hs.alpha, shadow: { col: C.red, dx: 5, dy: 5 } }); ctx.restore(); }
  const rIn = eo3(seg(t, 2.4, 2.9)), rx = lerp(-150, 540, rIn), jump = t > 2.9 ? hop(t - 2.9, 0.6, 34) : 0;
  if (rIn > 0) robot(rx, 1440 - jump - (rIn < 1 ? hop(t, 0.18, 14) : 0), 12, { eye: 'happy', up: t > 2.9 ? Math.abs(Math.sin((t - 2.9) * 5)) : 0, t });
  if (t > 2.9) burst(540, 1250, 2.9, t, 12, C.green, 320, 26);
  if (t > 1.98) burst(540, hy - 40, 1.98, t, 10, C.red, 420, 22);
  if (t > 0.35) burst(540, 470, 0.35, t, 12, C.green, 420, 24);
}

// ---------- caption ----------
// Words laid out at a fixed size (>= 40 px), wrapping to two lines instead of shrinking. The spoken word sits on
// a green marker swipe and is drawn slightly larger. Works with (text, alpha) alone.
function caption(text, a, o) {
  if (a <= 0) return;
  const raw = o && Array.isArray(o.words) && o.words.length ? o.words : String(text).split(/\s+/).filter(Boolean);
  const words = raw.map((w) => (typeof w === 'string' ? w : String(w.word ?? w.text ?? w.w ?? ''))), active = o && Number.isInteger(o.active) ? o.active : -1;
  const MAXW = 860, sp = (sz) => tw(' ', 'Mono', sz);
  const layout = (sz) => { const ls = [[]]; let w = 0; words.forEach((wd, i) => { const ww = tw(wd, 'Mono', sz); if (w && w + sp(sz) + ww > MAXW) { ls.push([]); w = 0; } ls[ls.length - 1].push(i); w += (w ? sp(sz) : 0) + ww; }); return ls; };
  let sz = 44, ls = layout(sz); if (ls.length > 1) { sz = 40; ls = layout(sz); }
  ctx.save(); ctx.globalAlpha = a;
  rectS(66, 1491, 948, 94, { fill: C.paper, col: C.ink, lw: 5, seed: 210 });
  const base = ls.length > 1 ? [1527, 1567] : [1553];
  ls.slice(0, 2).forEach((idx, li) => {
    const lw = idx.reduce((s, i, k) => s + tw(words[i], 'Mono', sz) + (k ? sp(sz) : 0), 0); let x = 540 - lw / 2;
    idx.forEach((i) => { const ww = tw(words[i], 'Mono', sz), y = base[li];
      if (i === active) { marker(x - 6, x + ww + 6, y - sz * 0.32, sz * (ls.length > 1 ? 0.95 : 1.05), 1, C.green, 0.6);
        ctx.save(); ctx.translate(x + ww / 2, y - sz * 0.35); ctx.scale(1.06, 1.06); txt(words[i], 0, sz * 0.35, { font: 'Mono', size: sz }); ctx.restore(); }
      else txt(words[i], x + ww / 2, y, { font: 'Mono', size: sz, alpha: active >= 0 && i > active ? 0.75 : 1 });
      x += ww + sp(sz); });
  });
  ctx.restore();
}

export default {
  name: 'paper',
  bg: '#F5F1E8',
  background() { bg('paper'); },
  caption,
  blocks: { hook, flow, bigstat, versus, bars, callout, checklist, endcard },
  async thumbnail(p, out) { renderThumbnail(p, out); },
};
