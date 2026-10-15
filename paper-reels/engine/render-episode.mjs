#!/usr/bin/env node
// usage: node engine/render-episode.mjs <episodeDir> <mode> [--style=name] [--w=540] [secs...]
// modes: voice | stills <secs...> | sheet | video | audio | mux | thumb | all
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, FPS, ctx, cv, setBoil, hlines, lerp, eo3, ei3, eio } from './core.mjs';
import { sfxEvents, mixAudio } from './audio.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const [dirArg, mode, ...rest] = process.argv.slice(2);
const DIR = path.resolve(dirArg);
const flag = (n, d) => (rest.find((a) => a.startsWith(`--${n}=`)) || `--${n}=${d}`).split('=')[1];
const STYLE = flag('style', 'stub');
const sb = JSON.parse(fs.readFileSync(path.join(DIR, 'storyboard.json'), 'utf8'));
const OUT = path.join(DIR, 'out', STYLE), SHARED = path.join(DIR, 'out');
fs.mkdirSync(OUT, { recursive: true });
import { LEAD, lineDur } from './timing.mjs';
const dur = (f) => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString();
const wav = (id) => path.join(DIR, 'audio', `${id}.wav`);

if (mode === 'voice') {
  const py = path.join(HERE, '..', '.venv', 'bin', 'python');
  for (const l of sb.lines) {
    const f = wav(l.id);
    if (fs.existsSync(f) && fs.statSync(f).mtimeMs > fs.statSync(path.join(DIR, 'storyboard.json')).mtimeMs && !rest.includes('--force')) continue;
    execFileSync('npx', ['--yes', 'hyperframes', 'tts', l.say, '-o', f, '--speed', flag('speed', '1.1')], { env: { ...process.env, HYPERFRAMES_PYTHON: py }, stdio: 'inherit' });
  }
  process.exit(0);
}

const style = (await import(pathToFileURL(path.join(HERE, 'styles', `${STYLE}.mjs`)).href)).default;
let cur = 0;
const TL = sb.lines.map((l, i) => {
  const vd = dur(wav(l.id)), d = lineDur(vd, i === sb.lines.length - 1), r = { ...l, i, start: cur, dur: d, vd }; cur += d; return r;
});
const TOTAL = cur, N = Math.round(TOTAL * FPS);
// Frame ownership: frame f belongs to the last line whose start <= f/FPS (same predicate drawFrame always used).
const firstFrame = (start) => { let f = Math.ceil(start * FPS - 1e-6); while (f > 0 && (f - 1) / FPS >= start) f--; while (f / FPS < start) f++; return f; };
TL.forEach((s) => { s.f0 = firstFrame(s.start); });
TL.forEach((s, i) => { s.f1 = i < TL.length - 1 ? TL[i + 1].f0 : N; });
// Effective transition out of line i: anything into or out of the end card is a dip; otherwise the line's field (default cut).
const TRANS = new Set(['whip', 'punch', 'cut']);
for (const s of TL) if (s.transition != null && !TRANS.has(s.transition)) throw new Error(`line ${s.id}: transition must be whip|punch|cut, got "${s.transition}"`);
const trans = (i) => (i >= TL.length - 1 ? null : TL[i].block === 'endcard' || TL[i + 1].block === 'endcard' ? 'dip' : TL[i].transition || 'cut');

// `scene` blocks: <episodeDir>/scenes.mjs, default export object of functions or named exports. Loaded and checked before frame 0.
let SCENES = null;
if (TL.some((s) => s.block === 'scene')) {
  const f = path.join(DIR, 'scenes.mjs');
  if (!fs.existsSync(f)) throw new Error(`storyboard uses block "scene" but ${f} does not exist`);
  const m = await import(pathToFileURL(f).href);
  SCENES = m.default && typeof m.default === 'object' ? { ...m, ...m.default } : m;
  for (const s of TL) if (s.block === 'scene') {
    const name = s.data && s.data.scene;
    if (typeof SCENES[name] !== 'function') throw new Error(`line ${s.id}: scene "${name}" not found in ${f} (available: ${Object.keys(SCENES).filter((k) => typeof SCENES[k] === 'function').join(', ') || 'none'})`);
  }
}
for (const s of TL) if (s.block !== 'scene' && typeof style.blocks[s.block] !== 'function') throw new Error(`line ${s.id}: style ${STYLE} has no block "${s.block}"`);

// Whip streak colour: ink on light backgrounds, paper on dark ones.
const lum = (hex) => { const n = parseInt(String(hex).replace('#', '').slice(0, 6), 16); return ((n >> 16 & 255) * 0.299 + (n >> 8 & 255) * 0.587 + (n & 255) * 0.114) / 255; };
const STREAK = lum(style.bg) > 0.5 ? '#1A1A1A' : '#F5F1E8';
console.error(`${STYLE}: total ${TOTAL.toFixed(2)}s, ${N} frames`);

// Captions: split at punctuation, then into balanced pieces of at most MAXC characters. Only regular spaces break (use U+00A0 to keep words together).
const MAXC = 30;
function balance(p) {
  if (p.length <= MAXC) return [p];
  const sp = [...p].map((c, i) => (c === ' ' ? i : -1)).filter((i) => i > 0);
  if (!sp.length) return [p];
  const mid = p.length / 2, cut = sp.reduce((a, b) => (Math.abs(b - mid) < Math.abs(a - mid) ? b : a));
  return [...balance(p.slice(0, cut)), ...balance(p.slice(cut + 1))];
}
function chunks(text) { return text.split(/(?<=[.,:;?])\s+/).filter(Boolean).flatMap(balance); }
const last = TL.length - 1;
for (const s of TL) { const cs = chunks(s.text), tot = cs.reduce((a, c) => a + c.length + 6, 0); let t = LEAD; s.caps = cs.map((c) => { const span = (c.length + 6) / tot * s.vd; const r = { c, a: t, b: t + span }; t += span; return r; }); }
// Word timing inside a chunk, by character share of the chunk's span (the +6 padding is the pause after the chunk).
for (const s of TL) for (const cap of s.caps) {
  cap.words = cap.c.split(' ').filter(Boolean); let k = 0;
  cap.wa = cap.words.map((w) => { const a = cap.a + (k / (cap.c.length + 6)) * (cap.b - cap.a); k += w.length + 1; return a; });
}

const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
function drawFrame(gf) {
  setBoil(gf);
  let i = TL.findIndex((s) => gf >= s.f0 && gf < s.f1); if (i < 0) i = last;
  const s = TL[i], t = gf / FPS - s.start, lf = gf - s.f0, left = s.f1 - gf;
  const out = trans(i), inn = i > 0 ? trans(i - 1) : null;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.fillStyle = style.bg; ctx.fillRect(0, 0, W, H);
  // transitions (ported from auction-video/render.mjs): whip = slide left ~5 frames, punch = zoom 1 -> 1.8 -> 1 over ~6 frames each side
  let ox = 0, z = 1;
  if (out === 'whip' && left <= 4) ox = -ei3((5 - left) / 5) * W * 0.55;
  if (inn === 'whip' && lf < 4) ox = (1 - eo3((lf + 1) / 5)) * W * 0.55;
  if (out === 'punch' && left <= 5) z = lerp(1, 1.8, ei3((6 - left) / 6));
  if (inn === 'punch' && lf < 6) z = lerp(1.8, 1, eo3((lf + 1) / 6));
  const cam = s.camera === false ? 1 : 1 + 0.04 * eio(t / s.dur);
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2 + ox, -H / 2);
  const data = s.block === 'endcard' ? { ...s.data, authors: sb.authors } : s.data;
  if (s.block !== 'scene') { ctx.save(); style.background(t, i); ctx.restore(); }
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(cam, cam); ctx.translate(-W / 2, -H / 2);
  if (s.block === 'scene') SCENES[s.data.scene](t, data, s.dur); else style.blocks[s.block](t, data, s.dur);
  ctx.restore(); ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  if ((out === 'whip' && left <= 4) || (inn === 'whip' && lf < 4)) { ctx.save(); hlines(0, W, 40, H - 40, 16, STREAK, 9); ctx.restore(); }
  const cap = s.caps.find((c) => t >= c.a && t < c.b + 0.15);
  if (cap) {
    let active = 0; cap.wa.forEach((a, k) => { if (t >= a) active = k; });
    ctx.save(); style.caption(cap.c, seg(t, cap.a, cap.a + 0.15), { words: cap.words, active }); ctx.restore();
  }
  // dip to background only into and out of the end card
  const fade = Math.max(inn === 'dip' ? 1 - seg(t, 0, 0.3) : 0, out === 'dip' || (i === last && s.block === 'endcard') ? seg(t, s.dur - 0.3, s.dur) : 0);
  if (fade > 0) { ctx.save(); ctx.globalAlpha = fade; ctx.fillStyle = style.bg; ctx.fillRect(0, 0, W, H); ctx.restore(); }
}

function stills(secs, outW, dir) {
  fs.mkdirSync(dir, { recursive: true });
  const small = createCanvas(outW, Math.round(outW * H / W)), sg = small.getContext('2d'), files = [];
  for (const sec of secs) { drawFrame(Math.round(sec * FPS)); sg.drawImage(cv, 0, 0, small.width, small.height); const f = path.join(dir, `t${sec.toFixed(1).padStart(5, '0')}.png`); fs.writeFileSync(f, small.toBuffer('image/png')); files.push(f); }
  return files;
}

// One render per style at a time: a second process writing the same file corrupts it (happened once, 2026-10-04).
function lock() {
  const f = path.join(OUT, '.render.lock');
  if (fs.existsSync(f)) {
    const pid = +fs.readFileSync(f, 'utf8');
    try { process.kill(pid, 0); console.error(`another render (pid ${pid}) is running for ${STYLE}; refusing to start`); process.exit(3); } catch (e) { if (e.code === 'EPERM') process.exit(3); }
  }
  fs.writeFileSync(f, String(process.pid));
  process.on('exit', () => { try { fs.unlinkSync(f); } catch {} });
}

async function video() {
  lock();
  const TMP = path.join(OUT, 'silent.partial.mp4');
  const ff = spawn('ffmpeg', ['-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', process.env.CRF || '19',
    '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', TMP], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < N; f++) { drawFrame(f); if (!ff.stdin.write(cv.data())) await new Promise((r) => ff.stdin.once('drain', r)); if (f % 300 === 0) console.error('frame', f); }
  ff.stdin.end(); const code = await new Promise((r) => ff.on('close', r));
  if (code !== 0) { console.error('ffmpeg failed, silent.mp4 not replaced'); process.exit(1); }
  fs.renameSync(TMP, path.join(OUT, 'silent.mp4'));
}

function audio() {
  const r = mixAudio({ voices: TL.map((s) => ({ file: wav(s.id), at: s.start + LEAD })), events: sfxEvents(TL, trans), total: TOTAL, outFile: path.join(SHARED, 'audio.m4a'), workDir: SHARED });
  console.error(`audio: voice mean ${r.voiceDb.toFixed(1)} dB, bed gain ${r.bedGain} dB, ${r.events} sfx`);
}

function mux() {
  const tmp = path.join(OUT, 'final.partial.mp4');
  execFileSync('ffmpeg', ['-y', '-i', path.join(OUT, 'silent.mp4'), '-i', path.join(SHARED, 'audio.m4a'), '-c:v', 'copy', '-c:a', 'copy', '-shortest', '-movflags', '+faststart', tmp], { stdio: 'inherit' });
  fs.renameSync(tmp, path.join(OUT, 'final.mp4'));
}

async function thumb(item) {
  await style.thumbnail({ name: sb.name, hook: item.thumb_hook, arxivId: sb.item }, path.join(OUT, 'thumb.png'));
}

const secs = rest.filter((a) => !a.startsWith('--')).map(Number);
const outW = +flag('w', '540');
if (mode === 'stills') { console.log(stills(secs, outW, path.join(OUT, 'stills')).join('\n')); }
else if (mode === 'sheet') {
  fs.rmSync(path.join(OUT, 'sheet'), { recursive: true, force: true });
  const picks = [...TL.flatMap((s) => [s.start + 0.8, s.start + s.dur * 0.55, s.start + s.dur - 0.5])].map((x) => Math.min(x, TOTAL - 0.1));
  const files = stills(picks, 270, path.join(OUT, 'sheet'));
  execFileSync('ffmpeg', ['-y', '-pattern_type', 'glob', '-i', path.join(OUT, 'sheet', 't*.png'), '-vf', `tile=11x3:padding=6:color=gray`, '-frames:v', '1', path.join(OUT, 'sheet.png')], { stdio: 'ignore' });
  console.log(path.join(OUT, 'sheet.png'), files.length, 'frames');
} else if (mode === 'video') await video();
else if (mode === 'audio') audio();
else if (mode === 'mux') mux();
else if (mode === 'thumb') await thumb({ thumb_hook: flag('hook', (sb.lines[0].data?.lines || []).join('\n')) });
else if (mode === 'all') { audio(); await video(); mux(); }
else { console.error('modes: voice stills sheet video audio mux thumb all'); process.exit(1); }
