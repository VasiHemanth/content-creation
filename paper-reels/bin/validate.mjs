#!/usr/bin/env node
// Validates the exact files that publish will upload (the paths in the `episodes` row), decoded from disk.
//   node bin/validate.mjs <item_id> [--keep]
// Writes <video dir>/validation.json (verdict + sha256 of video and thumbnail) and validation-sheet.png (frames decoded from the MP4).
// `reels publish` refuses unless that report says PASS and the hashes still match.
import { execFileSync, spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { open } from '../../lib/db.mjs';
import { LEAD, FPS, lineDur } from '../engine/timing.mjs';
import { renderThumbnail } from '../engine/thumbnail.mjs';
import { formatOf, MAX_VIDEO_BYTES } from '../formats/index.mjs';

const id = process.argv[2];
if (!id) { console.error('usage: validate.mjs <item_id>'); process.exit(2); }
const db = open();
const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
const ep = db.prepare("SELECT * FROM episodes WHERE item_id = ? AND format = '9x16'").get(id);
if (!item || !ep) { console.error(`${id}: no item or no registered 9x16 episode`); process.exit(2); }

const override = (process.argv.find((a) => a.startsWith('--video=')) || '').slice(8); // test only: validate another file, never writes a report
const video = override ? path.resolve(override) : ep.video_path, thumb = ep.thumb_path;
const vdir = path.dirname(override ? ep.video_path : video), style = path.basename(vdir), epDir = path.resolve(vdir, '..', '..');
const sb = JSON.parse(fs.readFileSync(path.join(epDir, 'storyboard.json'), 'utf8'));
const ENGINE = path.resolve(import.meta.dirname, '..', 'engine');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'validate-'));
const checks = []; const check = (ok, msg, detail = '') => { checks.push({ ok: !!ok, msg, detail: String(detail) }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}${detail ? `  (${detail})` : ''}`); return !!ok; };
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const ff = (args, opts = {}) => spawnSync('ffmpeg', ['-v', 'error', ...args], { encoding: 'utf8', maxBuffer: 1 << 28, ...opts });
const probe = (f, extra) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', ...extra, '-of', 'json', f]).toString());

// ---- files exist, are the registered paths
if (!check(fs.existsSync(video), 'video file exists', video) || !check(thumb && fs.existsSync(thumb), 'thumbnail file exists', thumb)) finish();

// ---- streams and frame count (the check the corrupt render would have failed: 596 frames vs 2545)
const p = probe(video, ['-count_frames', '-show_streams']);
const vs = p.streams.find((s) => s.codec_type === 'video'), as = p.streams.find((s) => s.codec_type === 'audio');
check(vs && vs.width === 1080 && vs.height === 1920, 'video is 1080x1920', vs && `${vs.width}x${vs.height}`);
check(vs && vs.r_frame_rate === `${FPS}/1`, `video is ${FPS} fps`, vs && vs.r_frame_rate);
check(!!as, 'has an audio stream');
const wavDur = (l) => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(epDir, 'audio', `${l.id}.wav`)]).toString();
const total = sb.lines.reduce((a, l, i) => a + lineDur(wavDur(l), i === sb.lines.length - 1), 0);
const expectFrames = Math.round(total * FPS), gotFrames = +vs.nb_read_frames;
check(Math.abs(gotFrames - expectFrames) <= 2, 'video frame count matches the storyboard timeline', `${gotFrames} frames, expected ${expectFrames} (${total.toFixed(2)} s)`);
check(Math.abs(+vs.duration - +as.duration) <= 0.15, 'video and audio streams have the same length', `video ${(+vs.duration).toFixed(2)} s, audio ${(+as.duration).toFixed(2)} s`);
const fmt = formatOf(sb);
check(+vs.duration >= fmt.minSeconds && +vs.duration <= fmt.maxSeconds, `video length within ${fmt.minSeconds}..${fmt.maxSeconds} s (format ${fmt.name})`, (+vs.duration).toFixed(1));
// uploader/src/host.js sends the file to Cloudinary with a plain upload, which is limited to 100 MB
const bytes = fs.statSync(video).size;
check(bytes <= MAX_VIDEO_BYTES, `video file is at most ${MAX_VIDEO_BYTES / 1e6} MB (upload limit)`, `${(bytes / 1e6).toFixed(1)} MB`);

// ---- decode the whole file, look for errors and long frozen stretches
const dec = ff(['-i', video, '-f', 'null', '-']);
check(!dec.stderr.trim(), 'whole file decodes with no errors', dec.stderr.trim().split('\n')[0] || '');
const fz = spawnSync('ffmpeg', ['-i', video, '-vf', 'freezedetect=n=0.0005:d=5', '-an', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 1 << 26 }).stderr;
const freezes = [...fz.matchAll(/freeze_duration: ([\d.]+)/g)].map((m) => +m[1]);
check(freezes.length === 0, 'no frozen stretch longer than 5 s', freezes.map((x) => x.toFixed(1)).join(', '));

// ---- audio level
const vol = spawnSync('ffmpeg', ['-i', video, '-af', 'volumedetect', '-vn', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
const mean = +(vol.match(/mean_volume: (-?[\d.]+)/) || [])[1], peak = +(vol.match(/max_volume: (-?[\d.]+)/) || [])[1];
check(mean > -30 && mean < -10, 'audio is audible', `mean ${mean} dB`);
check(peak <= -0.5, 'audio does not clip', `peak ${peak} dB`);
const sil = spawnSync('ffmpeg', ['-i', video, '-af', 'silencedetect=n=-45dB:d=6', '-vn', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
check(!/silence_duration/.test(sil), 'no silence longer than 6 s');

// ---- frames decoded from the MP4 vs the same frames drawn by the engine
const gray = (f, w, h, pre = []) => { const r = spawnSync('ffmpeg', ['-v', 'error', ...pre, '-i', f, '-frames:v', '1', '-vf', `scale=${w}:${h}`, '-pix_fmt', 'gray', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 24 }); return r.stdout; };
const mad = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]); return s / a.length; };
const dark = (a) => a.reduce((n, v) => n + (v < 120 ? 1 : 0), 0) / a.length;
let cur = 0; const picks = [];
sb.lines.forEach((l, i) => { const d = lineDur(wavDur(l), i === sb.lines.length - 1); picks.push({ line: l.id, f: Math.round((cur + d * 0.55) * FPS) }, { line: l.id, f: Math.round((cur + d - 0.7) * FPS) }); cur += d; });
const sec = picks.map((x) => (x.f / FPS).toFixed(4));
// Reference frames come from the renderer that made the video: the canvas engine, or HyperFrames snapshots of the
// built project (storyboard "renderer": "hyperframes"). Same thresholds and negative control either way.
const HF = sb.renderer === 'hyperframes';
const st = HF
  ? spawnSync('node', [path.resolve(ENGINE, '..', 'hf', 'bin', 'hf.mjs'), epDir, 'stills', ...sec, '--w=540'], { encoding: 'utf8', maxBuffer: 1 << 26 })
  : spawnSync('node', [path.join(ENGINE, 'render-episode.mjs'), epDir, 'stills', ...sec, `--style=${style}`, '--w=540'], { encoding: 'utf8' });
if (st.status !== 0) console.error(st.stderr);
const refFiles = st.stdout.trim().split('\n').filter(Boolean);
const W2 = 135, H2 = 240; const vids = [], refs = [];
picks.forEach((x, k) => {
  const png = path.join(tmp, `v${k}.png`);
  ff(['-ss', ((x.f - 0.5) / FPS).toFixed(4), "-i", video, '-frames:v', '1', png]);
  vids.push({ ...x, png, g: gray(png, W2, H2) });
  refs.push(gray(refFiles[k], W2, H2));
});
let worst = 0, blank = [];
vids.forEach((v, k) => {
  const m = mad(v.g, refs[k]); worst = Math.max(worst, m);
  if (dark(v.g) < 0.004) blank.push(v.line);
});
// negative control: a frame must not match the reference of a different line as well as it matches its own
const neg = vids.map((v, k) => mad(v.g, refs[(k + 6) % refs.length]));
const own = vids.map((v, k) => mad(v.g, refs[k]));
const wins = own.filter((o, k) => o < neg[k]).length;
check(blank.length === 0, 'every sampled frame has drawn content (none blank)', blank.join(','));
check(worst <= 6, 'every sampled frame matches what the engine draws at that time', `worst mean abs diff ${worst.toFixed(2)} (limit 6)`);
check(wins === vids.length, 'comparison discriminates: each frame matches its own reference better than another line\'s', `${wins}/${vids.length}`);

// contact sheet from the decoded MP4 frames, for a human or agent to look at
const sheet = path.join(vdir, 'validation-sheet.png');
const tiles = vids.map((v, k) => { const t = path.join(tmp, `s${k}.png`); ff(['-i', v.png, '-vf', 'scale=216:-1', '-y', t]); return t; });
const cols = 10, rows = Math.ceil(tiles.length / cols);
ff(['-y', ...tiles.flatMap((t) => ['-i', t]), '-filter_complex', `${tiles.map((_, i) => `[${i}:v]`).join('')}xstack=inputs=${tiles.length}:layout=${tiles.map((_, i) => `${(i % cols) * 216}_${Math.floor(i / cols) * 384}`).join('|')}:fill=gray`, '-frames:v', '1', sheet]);
console.log('decoded-frame sheet:', sheet);


// ---- engagement gate: the deterministic version of "does this hold attention"
// An event is a 0.25 s change of > 3.0 mean grey levels outside the caption band. Thresholds are in engine/BLOCKS.md (v2).
{
  const EW = 108, EH = 192, EF = 4, TH = 3.0, c0 = Math.floor(1490 / 1920 * EH), c1 = Math.ceil(1590 / 1920 * EH);
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', video, '-vf', `fps=${EF},scale=${EW}:${EH}`, '-pix_fmt', 'gray', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 29 });
  const b = r.stdout, n = Math.floor(b.length / (EW * EH)), dur = n / EF, ev = [];
  for (let k = 1; k < n; k++) { let sum = 0, c = 0; for (let y = 0; y < EH; y++) { if (y >= c0 && y <= c1) continue; for (let x = 0; x < EW; x++) { const i = y * EW + x; sum += Math.abs(b[k * EW * EH + i] - b[(k - 1) * EW * EH + i]); c++; } } if (sum / c > TH) ev.push(k / EF); }
  const cut = dur - 5; let gap = 0, at = 0, prev = 0;
  for (const t of [...ev, cut]) { if (t > cut) { if (cut - prev > gap) { gap = cut - prev; at = prev; } break; } if (t - prev > gap) { gap = t - prev; at = prev; } prev = t; }
  const perMin = ev.length / dur * 60;
  check(ev.length > 0 && ev[0] <= 1.5, 'engagement: a visual event in the first 1.5 s', ev[0] != null ? `${ev[0].toFixed(2)} s` : 'none');
  check(gap <= 3.5, 'engagement: no gap over 3.5 s without a visual event', `longest ${gap.toFixed(1)} s starting at ${at.toFixed(0)} s`);
  check(perMin >= 30, 'engagement: at least 30 visual events per minute', `${perMin.toFixed(0)}/min`);
}

// ---- thumbnail: right size, and identical to what the current DB hook/name would render
const tp = probe(thumb, ['-show_streams']).streams[0];
check(tp.width === 1080 && tp.height === 1920, 'thumbnail is 1080x1920', `${tp.width}x${tp.height}`);
const fresh = path.join(tmp, 'thumb-fresh.png');
// an episode may ship its own thumbnail.mjs (default export async (outPath, {item})); `reels thumb` uses the same one
const epThumb = path.join(epDir, 'thumbnail.mjs');
if (fs.existsSync(epThumb)) await (await import(pathToFileURL(epThumb).href)).default(fresh, { item });
else renderThumbnail({ name: item.thumb_name, hook: item.thumb_hook, arxivId: id }, fresh);
const tm = mad(gray(thumb, W2, H2), gray(fresh, W2, H2));
check(tm < 1, 'thumbnail matches the current thumb name and hook in the database', `diff ${tm.toFixed(2)}`);

// ---- storyboard facts and branding
const qa = path.join(epDir, 'qa.mjs');
if (fs.existsSync(qa)) { const r = spawnSync('node', [qa, `--style=${style}`], { encoding: 'utf8' }); check(r.status === 0, 'episode QA (facts, branding, captions)', r.stdout.trim().split('\n').pop()); }
else check(false, 'episode qa.mjs exists');

finish();
function finish() {
  const ok = checks.every((c) => c.ok);
  const report = { item: id, verdict: ok ? 'PASS' : 'FAIL', at: new Date().toISOString(), video, video_sha256: fs.existsSync(video) ? sha(video) : null, thumb, thumb_sha256: thumb && fs.existsSync(thumb) ? sha(thumb) : null, checks };
  if (!override) fs.writeFileSync(path.join(vdir, 'validation.json'), JSON.stringify(report, null, 1));
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`\n${report.verdict}: ${checks.filter((c) => c.ok).length}/${checks.length} checks. Report: ${path.join(vdir, 'validation.json')}`);
  process.exit(ok ? 0 : 1);
}
