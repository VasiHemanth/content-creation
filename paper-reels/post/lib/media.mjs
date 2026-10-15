// ffmpeg, ffprobe, hashes, and the pixel measures the gates use. Plain functions, no state.
import crypto from 'node:crypto';
import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';

export function sha256File(file) {
  const h = crypto.createHash('sha256'), fd = fs.openSync(file, 'r'), buf = Buffer.alloc(1 << 20);
  try { for (let n; (n = fs.readSync(fd, buf, 0, buf.length, null)) > 0;) h.update(buf.subarray(0, n)); } finally { fs.closeSync(fd); }
  return h.digest('hex');
}
export const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

/** Run ffmpeg to completion; throws with ffmpeg's own message on failure. */
export function ffmpeg(args, { input } = {}) {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...args], { encoding: 'buffer', input, maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`ffmpeg ${args.slice(0, 8).join(' ')} ... exited ${r.status}\n${String(r.stderr || '')}`);
  return r.stdout;
}

/** ffprobe as parsed JSON. `extra` is for example ['-show_streams', '-show_format']. Returns null when ffprobe cannot read the file. */
export function probe(file, extra = ['-show_streams', '-show_format']) {
  const r = spawnSync('ffprobe', ['-v', 'error', ...extra, '-of', 'json', file], { encoding: 'utf8', maxBuffer: 1 << 26 });
  if (r.status !== 0) return null;
  try { return JSON.parse(r.stdout); } catch { return null; }
}

/** Decode a frame (or the first frame of an image) to raw 8-bit grey at w x h. `pre` goes before -i (for example -ss). */
export function gray(file, w, h, pre = []) {
  const out = ffmpeg([...pre, '-i', file, '-frames:v', '1', '-vf', `scale=${w}:${h}:flags=area,format=gray`, '-f', 'rawvideo', '-'], {});
  if (out.length !== w * h) throw new Error(`could not decode a frame of ${file}`);
  return out;
}
/** Full-resolution luma plane of an image. */
export function luma(file, w, h, pre = []) {
  return ffmpeg([...pre, '-i', file, '-frames:v', '1', '-vf', `scale=${w}:${h}:flags=bicubic,format=gray`, '-f', 'rawvideo', '-'], {});
}

/** Mean absolute difference of two equally sized grey buffers. */
export function mad(a, b) { let s = 0; for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]); return s / a.length; }
/** Fraction of pixels whose grey differs by more than `t` levels (a changed word moves thousands of pixels, noise moves almost none). */
export function changed(a, b, t = 40) { let n = 0; for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > t) n++; return n / a.length; }
/** Fraction of pixels brighter than `t` inside an inset box (the margin keeps the frame line of the sheet out of the count). */
export function brightShare(g, w, h, { t = 120, inset = 60 } = {}) {
  let n = 0, c = 0;
  for (let y = inset; y < h - inset; y++) for (let x = inset; x < w - inset; x++) { c++; if (g[y * w + x] >= t) n++; }
  return c ? n / c : 0;
}

/** Duration (seconds) of the container, from ffprobe. */
export const duration = (file) => { const p = probe(file, ['-show_format']); return p && p.format ? +p.format.duration : NaN; };

export function run(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 1 << 26, ...opts });
}
