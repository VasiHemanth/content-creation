// usage: node qa.mjs [--style=name]
// Checks: every number in the storyboard is in facts.json; no banned names; per-style video loudness/duration/frame checks if present.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
const here = path.dirname(new URL(import.meta.url).pathname);
const sb = JSON.parse(fs.readFileSync(path.join(here, 'storyboard.json'), 'utf8'));
const facts = JSON.parse(fs.readFileSync(path.join(here, 'facts.json'), 'utf8')).numbers;
const results = []; const check = (ok, msg) => results.push([ok, msg]);

const stripIds = (s) => String(s).replace(/\b[A-Za-z]+(?:-[A-Za-z0-9.]+)+/g, ' ');
const nums = (s) => (stripIds(s).match(/\d[\d,]*(?:\.\d+)?/g) || []).map((n) => n.replace(/,$/, ''));
const LAYOUT = new Set(['at', 'footAt', 'step', 'aW', 'bW']);
const walk = (v, out) => { if (typeof v === 'number') out.push(String(v)); else if (typeof v === 'string') out.push(...nums(v)); else if (Array.isArray(v)) v.forEach((x) => walk(x, out)); else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!LAYOUT.has(k)) walk(x, out); return out; };
for (const l of sb.lines) {
  const shown = walk([l.text, l.data], []);
  for (const n of new Set(shown)) check(n in facts || n.replace(/\.0+$/, '') in facts, `${l.id}: number ${n} is in facts.json`);
}
const BANNED = [/hemanthvasi/i, /instagram/i, /youtube/i, /threads/i];
const allText = JSON.stringify(sb);
for (const b of BANNED) check(!b.test(allText), `storyboard has no ${b}`);
check(sb.lines.every((l) => !/[—]/.test(l.say + l.text)), 'no em-dashes in say/text');
{ const e = sb.lines.at(-1);   // this episode ends on a custom credit scene instead of the stock end card
  check(e.block === 'endcard' || (e.block === 'scene' && /arXiv \d/.test(e.data.credit || '') && e.data.handle === 'hemanth_with_ai'), 'last block is endcard, or an end scene with the handle and an arXiv credit'); }
check(sb.lines.every((l) => fs.existsSync(path.join(here, 'audio', `${l.id}.wav`))), 'all voice files exist');

const style = (process.argv.find((a) => a.startsWith('--style=')) || '').split('=')[1];
if (style) {
  const v = path.join(here, 'out', style, 'final.mp4');
  if (fs.existsSync(v)) {
    const p = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', v]).toString());
    const vs = p.streams.find((s) => s.codec_type === 'video'), as = p.streams.find((s) => s.codec_type === 'audio'), d = +vs.duration;
    check(vs.width === 1080 && vs.height === 1920, `${style}: 1080x1920`);
    check(vs.r_frame_rate === '30/1', `${style}: 30 fps`);
    check(!!as, `${style}: has audio`);
    check(d >= 45 && d <= 90, `${style}: duration ${d.toFixed(1)}s within 45..90`);
    const vol = spawnSync('ffmpeg', ['-i', v, '-af', 'volumedetect', '-vn', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
    const mean = +(vol.match(/mean_volume: (-?[\d.]+)/) || [])[1], peak = +(vol.match(/max_volume: (-?[\d.]+)/) || [])[1];
    check(mean > -30 && mean < -12, `${style}: mean volume ${mean} dB audible, not clipped`);
    check(peak <= -0.5, `${style}: peak ${peak} dB below clipping`);
  }
  check(fs.existsSync(path.join(here, 'out', style, 'thumb.png')), `${style}: thumb.png exists`);
}
let bad = 0; for (const [ok, msg] of results) { if (!ok) bad++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); }
console.log(`${results.length - bad}/${results.length} passed`); process.exit(bad ? 1 : 0);
