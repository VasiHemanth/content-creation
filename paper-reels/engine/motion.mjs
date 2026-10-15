// Motion kit (BLOCKS v2). Style-agnostic, pure functions of time: no canvas, no Math.random, no wall clock.
// t and t0 are seconds since the line started. Every helper returns 0 / "nothing yet" before its start time.
import { cl, lerp, eo3, eob, seg } from './core.mjs';

export { cl, lerp, eo3, eob, seg };

// 0 before t0, then rises to 1 with an overshoot (peaks near 1.1) over d seconds. Use as a scale.
export const popIn = (t, t0, d = 0.3) => { const p = seg(t, t0, t0 + d); return p <= 0 ? 0 : eob(p); };

// Number eased from `from` to `to` over [t0, t0+dur], passed through fmt (default: rounded integer string).
export function countUp(t, t0, dur, from, to, fmt = (v) => String(Math.round(v))) {
  return fmt(lerp(from, to, eo3(seg(t, t0, t0 + dur))));
}

// "59.4%" -> { prefix: '', num: 59.4, dec: 1, suffix: '%', ok: true }. Values it cannot count (two numbers,
// thousands separators, no digits) come back ok: false and should be shown whole.
export function parseValue(s) {
  const m = String(s).match(/^([^\d]*?)(\d+(?:\.\d+)?)(.*)$/);
  if (!m || /\d/.test(m[3]) || /^[.,]/.test(m[3])) return { prefix: '', num: 0, dec: 0, suffix: '', ok: false };
  return { prefix: m[1], num: +m[2], dec: (m[2].split('.')[1] || '').length, suffix: m[3], ok: true };
}

// Count a value string up from 0. Ends on the exact input string, so "67.0" stays "67.0".
export function countStr(s, t, t0, dur) {
  const v = parseValue(s);
  if (!v.ok || t >= t0 + dur) return String(s);
  return countUp(t, t0, dur, 0, v.num, (x) => `${v.prefix}${x.toFixed(v.dec)}${v.suffix}`);
}

// Characters of str shown at time t, typed at cps characters per second.
export const typeOn = (str, t, t0, cps = 30) => String(str).slice(0, Math.max(0, Math.floor((t - t0) * cps)));

// Smooth deterministic wobble in [-amp, amp]. seed shifts the phase so neighbours do not move in step.
export const wiggle = (t, amp = 1, hz = 1, seed = 0) =>
  amp * (0.6 * Math.sin(2 * Math.PI * hz * t + seed * 1.7) + 0.4 * Math.sin(2 * Math.PI * hz * 2.3 * t + seed * 3.1));

// 1 outside [t0, t0+d], swells to 1+amp in the middle. Multiply a scale by it.
export const pulse = (t, t0, amp = 0.1, d = 0.3) => { const p = seg(t, t0, t0 + d); return p <= 0 || p >= 1 ? 1 : 1 + amp * Math.sin(p * Math.PI); };

// Offset that starts at `from` (px) and settles to 0 over d seconds. Before t0 it is `from`.
export const slideIn = (t, t0, from, d = 0.4) => from * (1 - eo3(seg(t, t0, t0 + d)));

// Start time of item i in a staggered sequence.
export const stagger = (i, gap = 0.12, base = 0) => base + i * gap;

// Shake offset [dx, dy] that decays over d seconds after t0.
export function shakeAt(t, t0, amp = 12, d = 0.3) {
  const p = seg(t, t0, t0 + d); if (p <= 0 || p >= 1) return [0, 0];
  const k = (1 - p) * amp; return [Math.sin(t * 90) * k, Math.cos(t * 77) * k];
}
// Sum of shakes for several hit times (e.g. every landing in a block). Apply with ctx.translate.
export function jolt(t, times, amp = 10, d = 0.3) {
  let x = 0, y = 0; for (const t0 of times) { const [a, b] = shakeAt(t, t0, amp, d); x += a; y += b; } return [x, y];
}

// Headline drop: scale falls from `from` to 1 in d seconds, squashes on landing, shakes.
// Returns { sc, alpha, dx, dy, land } where land = time of impact (use it for bursts and sfx).
export function slam(t, t0, { d = 0.16, from = 2.2, amp = 12 } = {}) {
  const land = t0 + d, p = seg(t, t0, land);
  if (p <= 0) return { sc: 0, alpha: 0, dx: 0, dy: 0, land };
  const squash = 1 - 0.07 * Math.sin(Math.PI * seg(t, land, land + 0.18));
  const [dx, dy] = shakeAt(t, land, amp, 0.28);
  return { sc: lerp(from, 1, eo3(p)) * squash, alpha: cl(p * 3), dx, dy, land };
}

// Stamp: like slam but smaller and quicker, for marks and flags.
export const stamp = (t, t0, opts = {}) => slam(t, t0, { d: 0.12, from: 1.7, amp: 6, ...opts });

// A 0..1 envelope that switches on at `on` and off at `off`, each edge taking d seconds. Short edges make
// the whole change land inside one 0.25 s sample, which is what the engagement gate counts.
export const gate = (t, on, off = Infinity, d = 0.14) => eo3(seg(t, on, on + d)) * (Number.isFinite(off) ? 1 - eo3(seg(t, off, off + d)) : 1);

// Item start time honoring an optional `at` fraction, clamped so the item still has >= 1.9 s on screen.
export const atTime = (at, dur, fallback) => (typeof at === 'number' ? Math.max(0.1, Math.min(at * dur, dur - 1.9)) : fallback);

// Secondary beats: given the times at which a block already does something visible, return extra times
// that fill every gap longer than `maxGap` with beats about `gap` apart. The line start (0) and end (dur)
// count as events because the renderer changes scene there.
export function beats(primary, dur, { maxGap = 2.4, gap = 2.1, end = dur } = {}) {
  const pts = [0, ...primary.filter((x) => x > 0 && x < end), end].sort((a, b) => a - b), out = [];
  for (let k = 1; k < pts.length; k++) {
    const g = pts[k] - pts[k - 1]; if (g <= maxGap) continue;
    const n = Math.ceil(g / gap) - 1; for (let i = 1; i <= n; i++) out.push(pts[k - 1] + (g * i) / (n + 1));
  }
  return out;
}

// Index of the last time in a sorted list that is <= t (or -1), and seconds since it.
export function lastHit(t, times) {
  let i = -1; for (let k = 0; k < times.length; k++) if (times[k] <= t) i = k;
  return { i, since: i < 0 ? Infinity : t - times[i] };
}
