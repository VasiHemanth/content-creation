#!/usr/bin/env node
// HyperFrames renderer for paper-reels episodes whose storyboard.json says "renderer": "hyperframes".
//   node hf/bin/hf.mjs <episodeDir> <step> [args]
// Steps, in order (each one in the foreground; `all` runs voice..mux):
//   voice [--force]        one wav per line in audio/ (voice preset from storyboard.voice, see hf/voices.json)
//   words [--force]        word timing per line (ASR anchors + script words) -> audio/words.json
//   evidence               crop the paper passages listed in evidence.json -> evidence/*.png + manifest.json
//   build                  assemble out/hf/project/ (index.html, scenes, kit, data.js)
//   check                  npx hyperframes check on the project (lint, runtime, layout, contrast)
//   snap <secs...>         snapshots of the project at those times -> out/hf/snaps/
//   render                 out/hf/silent.mp4 (locked, written through a temp file)
//   audio                  out/hf/audio.m4a (voices + ducked bed + sfx, same mixer as the canvas renderer)
//   mux                    out/hf/final.mp4
//   thumb                  out/thumb.png from <episode>/thumbnail.mjs
//   stills <secs...> [--w=540]   reference frames for bin/validate.mjs; prints one path per line
//   audition [preset...]   every voice preset reading the first line -> out/hf/voices/<preset>.wav
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { synth, words, registry } from '../lib/voice.mjs';
import { build, projectDir } from '../lib/project.mjs';
import { buildTimeline, loadStoryboard, sfxEvents } from '../lib/timeline.mjs';
import { hfRun, hfCapture } from '../lib/hfcli.mjs';
import { mixAudio } from '../../engine/audio.mjs';
import { LEAD } from '../../engine/timing.mjs';
import { formatOf } from '../../formats/index.mjs';

const HF = path.resolve(import.meta.dirname, '..');
const [dirArg, step, ...rest] = process.argv.slice(2);
if (!dirArg || !step) { console.error('usage: hf.mjs <episodeDir> voice|words|evidence|build|check|snap|render|audio|mux|thumb|stills|audition|all'); process.exit(2); }
const DIR = path.resolve(dirArg);
const OUT = path.join(DIR, 'out', 'hf');
fs.mkdirSync(OUT, { recursive: true });
const flag = (n, d) => (rest.find((a) => a.startsWith(`--${n}=`)) || `--${n}=${d}`).split('=')[1];
const has = (n) => rest.includes(`--${n}`);
const nums = rest.filter((a) => !a.startsWith('--')).map(Number);
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));

// One writer per episode at a time: render, audio and mux all take the lock (two writers corrupted a video once).
function lock(name) {
  const f = path.join(OUT, '.lock');
  if (fs.existsSync(f)) {
    const [pid, what] = fs.readFileSync(f, 'utf8').split(' ');
    if (+pid === process.pid) { fs.writeFileSync(f, `${process.pid} ${name}`); return; }
    try { process.kill(+pid, 0); console.error(`another hf step (${what}, pid ${pid}) is running for this episode; refusing to start`); process.exit(3); } catch (e) { if (e.code === 'EPERM') process.exit(3); }
  }
  fs.writeFileSync(f, `${process.pid} ${name}`);
  process.on('exit', () => { try { fs.unlinkSync(f); } catch {} });
}
const words_ = () => readJson(path.join(DIR, 'audio', 'words.json'));
const timeline = () => buildTimeline(DIR, loadStoryboard(DIR), words_());

async function doEvidence() {
  const f = path.join(DIR, 'evidence.json'); if (!fs.existsSync(f)) { console.error('evidence: no evidence.json, skipped'); return; }
  const e = readJson(f), job = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'hf-ev-')), 'job.json');
  fs.writeFileSync(job, JSON.stringify({ pdf: path.resolve(DIR, e.pdf), out_dir: path.join(DIR, 'evidence'), items: e.items }));
  const r = spawnSync(path.join(HF, '..', '.venv', 'bin', 'python'), [path.join(HF, 'py', 'evidence.py'), job], { encoding: 'utf8', maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error(`evidence failed: ${r.stderr || r.stdout}`);
  const m = JSON.parse(r.stdout);
  for (const v of Object.values(m)) v.img = path.relative(DIR, v.img);
  fs.writeFileSync(path.join(DIR, 'evidence', 'manifest.json'), JSON.stringify(m, null, 1));
  console.error(`evidence: ${Object.keys(m).length} crop(s): ${Object.entries(m).map(([k, v]) => `${k} ${v.w}x${v.h}`).join(', ')}`);
}

function doRender() {
  lock('render');
  const P = projectDir(DIR); if (!fs.existsSync(path.join(P, 'index.html'))) throw new Error('run build first');
  const tmp = path.join(OUT, 'silent.partial.mp4');
  fs.rmSync(tmp, { force: true });
  // CRF per format (formats.json): a 75 s paper short at CRF 20 lands around 40-60 MB; a 170 s system-design reel
  // needs CRF 23 to stay under the 100 MB upload limit. The platforms re-encode anyway. --crf=N overrides.
  const crf = flag('crf', String(formatOf(loadStoryboard(DIR)).crf ?? 20));
  hfRun(['render', '--quality', flag('quality', 'delivery'), '--crf', crf, '--fps', '30', '--strict', '--output', tmp], { cwd: P });
  const p = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-of', 'json', tmp]).toString());
  const v = p.streams.find((s) => s.codec_type === 'video');
  if (!v || v.width !== 1080 || v.height !== 1920) throw new Error('render produced an unexpected stream; silent.mp4 not replaced');
  fs.renameSync(tmp, path.join(OUT, 'silent.mp4'));
  console.error(`render: ${path.join(OUT, 'silent.mp4')} (${v.nb_frames} frames)`);
}

function doAudio() {
  lock('audio');
  const tlx = timeline();
  const voices = tlx.lines.map((l) => ({ file: path.join(DIR, 'audio', `${l.id}.wav`), at: l.start + LEAD }));
  const r = mixAudio({ voices, events: sfxEvents(tlx), total: tlx.total, outFile: path.join(OUT, 'audio.m4a'), workDir: OUT });
  console.error(`audio: voice mean ${r.voiceDb.toFixed(1)} dB, bed gain ${r.bedGain} dB, ${r.events} sfx -> ${path.join(OUT, 'audio.m4a')}`);
}

function doMux() {
  lock('mux');
  const tmp = path.join(OUT, 'final.partial.mp4');
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(OUT, 'silent.mp4'), '-i', path.join(OUT, 'audio.m4a'), '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'copy', '-shortest', '-movflags', '+faststart', tmp], { stdio: 'inherit' });
  fs.renameSync(tmp, path.join(OUT, 'final.mp4'));
  console.error(`mux: ${path.join(OUT, 'final.mp4')}`);
}

/** Snapshots of the built project at exact times. Returns PNG paths in the order given. */
function snapshot(secs, outDir) {
  const P = projectDir(DIR); if (!fs.existsSync(path.join(P, 'index.html'))) throw new Error('run build first');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hf-snap-'));
  hfRun(['snapshot', '--at', secs.map((s) => s.toFixed(4)).join(','), '--no-end', '--describe', 'false', '-o', tmp], { cwd: P, quiet: true });
  const files = fs.readdirSync(tmp).filter((f) => /^frame-\d+-at-.*\.png$/.test(f)).sort();
  if (files.length !== secs.length) throw new Error(`snapshot returned ${files.length} frames for ${secs.length} times`);
  fs.mkdirSync(outDir, { recursive: true });
  return files.map((f, k) => { const d = path.join(outDir, `t${secs[k].toFixed(2).padStart(6, '0')}.png`); fs.renameSync(path.join(tmp, f), d); return d; });
}

if (step === 'voice') synth(DIR, loadStoryboard(DIR), { force: has('force') });
else if (step === 'words') await words(DIR, loadStoryboard(DIR), { force: has('force') });
else if (step === 'evidence') await doEvidence();
else if (step === 'build') { const { P, tlx } = build(DIR); console.error(`build: ${P}\n  ${tlx.lines.length} lines, ${tlx.scenes.length} scenes, ${tlx.total.toFixed(2)} s, ${tlx.frames} frames`); }
else if (step === 'check') { const r = hfCapture(['check', ...rest], { cwd: projectDir(DIR) }); console.log(r.out); process.exit(r.status || 0); }
else if (step === 'snap') {
  const dir = path.join(OUT, 'snaps'); fs.rmSync(dir, { recursive: true, force: true });
  const files = snapshot(nums, dir), cols = +flag('cols', String(Math.min(7, files.length)));
  const sheet = path.join(OUT, `${flag('name', 'sheet')}.png`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-pattern_type', 'glob', '-i', path.join(dir, 't*.png'), '-vf', `scale=270:-1,tile=${cols}x${Math.ceil(files.length / cols)}:padding=6:color=gray`, '-frames:v', '1', sheet]);
  console.log(sheet);
}
else if (step === 'stills') {
  const w = +flag('w', '540'), dir = path.join(OUT, 'stills'); fs.rmSync(dir, { recursive: true, force: true });
  const files = snapshot(nums, dir);
  for (const f of files) execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', f, '-vf', `scale=${w}:-1`, f + '.s.png']), fs.renameSync(f + '.s.png', f);
  console.log(files.join('\n'));
}
else if (step === 'render') doRender();
else if (step === 'audio') doAudio();
else if (step === 'mux') doMux();
else if (step === 'thumb') {
  const t = path.join(DIR, 'thumbnail.mjs'); if (!fs.existsSync(t)) throw new Error(`${t} missing`);
  const { open } = await import('../../../lib/db.mjs');
  const sb = loadStoryboard(DIR), item = open().prepare('SELECT * FROM items WHERE id = ?').get(sb.item);
  const out = await (await import(pathToFileURL(t).href)).default(path.join(DIR, 'out', 'thumb.png'), { item });
  console.log(out);
}
else if (step === 'audition') {
  const sb = loadStoryboard(DIR), reg = registry(), names = rest.filter((a) => !a.startsWith('--'));
  const pick = names.length ? names : Object.keys(reg.presets), text = flag('text', sb.lines[0].say);
  const dir = path.join(OUT, 'voices'); fs.mkdirSync(dir, { recursive: true });
  const sp = rest.find((a) => a.startsWith('--speed=')), fake = { ...sb, lines: pick.map((p) => ({ id: p, say: text, voice: sp ? { preset: p, speed: +sp.slice(8) } : p })) };
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hf-aud-'));
  fs.mkdirSync(path.join(tmpDir, 'audio'));
  synth(tmpDir, fake, { force: true });
  for (const p of pick) fs.renameSync(path.join(tmpDir, 'audio', `${p}.wav`), path.join(dir, `${p}.wav`));
  const rows = fs.readdirSync(dir).filter((f) => f.endsWith('.wav')).map((f) => f.slice(0, -4)).filter((p) => reg.presets[p]);
  fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html><meta charset="utf-8"><title>Voice auditions</title>
<style>body{font:16px/1.4 system-ui;background:#0b2a4a;color:#f2f8ff;max-width:760px;margin:32px auto;padding:0 16px}
.r{display:flex;gap:16px;align-items:center;padding:10px 0;border-bottom:1px solid #3d78a6}.n{width:90px;font-weight:700;color:#ffb454}
.l{flex:1}audio{width:300px}p{color:#a8dcf2}</style>
<h1>Voice auditions</h1><p>Same two lines, every preset in hf/voices.json. Set the winner in storyboard.json as "voice": "name".</p>
${rows.map((p) => `<div class="r"><div class="n">${p}</div><div class="l">${reg.presets[p].label}</div><audio controls src="${p}.wav"></audio></div>`).join('\n')}`);
  console.log(pick.map((p) => `${path.join(dir, p + '.wav')}  ${reg.presets[p].label}`).join('\n'));
  console.log(path.join(dir, 'index.html'));
}
else if (step === 'all') {
  synth(DIR, loadStoryboard(DIR));
  await words(DIR, loadStoryboard(DIR));
  await doEvidence();
  build(DIR);
  doRender(); doAudio(); doMux();
}
else { console.error(`unknown step "${step}"`); process.exit(2); }
