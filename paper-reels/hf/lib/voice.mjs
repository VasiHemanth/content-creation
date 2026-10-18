// Narration for an episode: pick a voice preset, synthesize one wav per line, then time every spoken word.
//   audio/<id>.wav     one file per line (the validator's frame count and the mixer both use these)
//   audio/voice.json   sidecar: hash of what each wav was made from, so unchanged lines are not redone
//   audio/words.json   per line: spoken words with start/end seconds from the start of the wav
// Changing the voice or the text changes the hash; `voice` then redoes only what changed and `build` re-times the video.
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { alignWords } from './align.mjs';
import { hfCaptureAsync } from './hfcli.mjs';

const HF = path.resolve(import.meta.dirname, '..');
const PR = path.resolve(HF, '..');
const PY = path.join(PR, '.venv', 'bin', 'python');
const KOKORO = { model: path.join(os.homedir(), '.cache/hyperframes/tts/models/kokoro-v1.0.onnx'), voices: path.join(os.homedir(), '.cache/hyperframes/tts/voices/voices-v1.0.bin') };
const sha = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 16);
const readJson = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return d; } };
const writeJson = (f, v) => { const t = f + '.partial'; fs.writeFileSync(t, JSON.stringify(v, null, 1)); fs.renameSync(t, f); };

export const registry = () => readJson(path.join(HF, 'voices.json'));

/** storyboard.voice and line.voice may be "preset" or { preset?, voice?, speed?, lang? }. */
export function resolveVoice(sb, line) {
  const reg = registry(), as = (v) => (typeof v === 'string' ? { preset: v } : v || {});
  const a = as(sb.voice), b = as(line && line.voice), name = b.preset || a.preset || reg.default, p = reg.presets[name];
  if (!p) throw new Error(`unknown voice preset "${name}" (have: ${Object.keys(reg.presets).join(', ')})`);
  const { preset: _a, ...ra } = a, { preset: _b, ...rb } = b;
  return { preset: name, ...p, ...ra, ...rb };
}

export const wavDuration = (f) => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString();

/** One wav per line. Returns the ids that were (re)made.
 *  Providers: kokoro (tts_kokoro.py in .venv), qwen3 and chatterbox (tts_mlx.py in .venv-qwen, Apple MLX),
 *  fish (Fish Audio S2-Pro through tts_fish.py, in the verified fish-tts-demo environment; Apple MLX).
 *  For the MLX and fish providers `speed` is applied afterwards with ffmpeg atempo (pitch stays the same). */
const PY_MLX = path.join(PR, '.venv-qwen', 'bin', 'python');
const FISH_HOME = process.env.FISH_HOME || path.join(os.homedir(), 'Documents/Developer/experiments/fish-tts-demo');
const PY_FISH = process.env.FISH_PYTHON || path.join(FISH_HOME, '.venv', 'bin', 'python');

/** The fish provider needs a locked voice. Without ref_audio the model casts a new random voice on every run,
 *  and this pipeline makes one wav per line. ref_audio paths are relative to paper-reels/hf/ (see hf/README.md). */
function normalizeFish(cfg) {
  cfg.model = cfg.model || process.env.FISH_MODEL || path.join(FISH_HOME, 'models', 'fish-audio-s2-pro-8bit');
  if (!cfg.ref_audio) throw new Error(`voice preset "${cfg.preset}": the fish provider needs ref_audio (a 10-30 s clip) and ref_text; without a reference the voice changes every run (see hf/README.md)`);
  cfg.ref_audio = path.isAbsolute(cfg.ref_audio) ? cfg.ref_audio : path.resolve(HF, cfg.ref_audio);
  if (!fs.existsSync(cfg.ref_audio)) throw new Error(`voice preset "${cfg.preset}": ref_audio not found: ${cfg.ref_audio}`);
  if (!cfg.ref_text) throw new Error(`voice preset "${cfg.preset}": the fish provider needs ref_text, the exact transcript of ref_audio (see hf/voices/README.md)`);
}
export function synth(DIR, sb, { force = false } = {}) {
  const side = path.join(DIR, 'audio', 'voice.json'), have = readJson(side, {}), todo = [];
  fs.mkdirSync(path.join(DIR, 'audio'), { recursive: true });
  for (const l of sb.lines) {
    const cfg = resolveVoice(sb, l), out = path.join(DIR, 'audio', `${l.id}.wav`);
    if (cfg.provider === 'fish') normalizeFish(cfg);
    // Provider-specific inputs. undefined values are dropped by JSON.stringify, so recipes for providers
    // that use none of these keep the hash they had before these fields were added (fish resolves its
    // sampling defaults here so the hash does not depend on whether a preset spells them out).
    const fish = cfg.provider === 'fish';
    // line.tts: the text the fish provider reads, with S2-Pro direction tags ([warm], [emphasis], [short pause]).
    // `say` stays tag-free: word timing and captions align against it. Other providers would read the tags aloud.
    if (l.tts && cfg.provider !== 'fish') throw new Error(`line ${l.id}: "tts" (tagged text) is only for the fish provider; preset ${cfg.preset} is ${cfg.provider}`);
    const spoken = l.tts || l.say;
    const recipe = { say: spoken, provider: cfg.provider, model: cfg.model || '', voice: cfg.voice || '', speaker: cfg.speaker || '', instruct: cfg.instruct || '',
      ref: cfg.ref_audio || '', speed: cfg.speed, lang: cfg.lang || '', seed: cfg.seed ?? 1234,
      ref_text: cfg.ref_text, temperature: fish ? (cfg.temperature ?? 0.7) : cfg.temperature,
      top_p: fish ? (cfg.top_p ?? 0.7) : cfg.top_p, top_k: fish ? (cfg.top_k ?? 30) : cfg.top_k, tags: cfg.tags };
    const h = sha(JSON.stringify(recipe));
    if (!force && fs.existsSync(out) && have[l.id] === h) continue;
    if (!['kokoro', 'qwen3', 'chatterbox', 'fish'].includes(cfg.provider)) throw new Error(`voice provider "${cfg.provider}" is not implemented (see hf/README.md)`);
    todo.push({ id: l.id, text: spoken, out, cfg, hash: h });
  }
  if (!todo.length) { console.error('voice: all lines up to date'); return []; }
  const tempo = (out, speed) => { const tmp = out + '.tempo.wav'; execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', out, '-filter:a', `atempo=${speed}`, tmp]); fs.renameSync(tmp, out); };
  const groups = new Map();
  for (const t of todo) { const k = `${t.cfg.provider}|${t.cfg.model || ''}`; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(t); }
  for (const [k, list] of groups) {
    const provider = k.split('|')[0], job = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'hf-voice-')), 'job.json');
    if (provider === 'kokoro') {
      writeJson(job, { ...KOKORO, lines: list.map((t) => ({ id: t.id, text: t.text, out: t.out, voice: t.cfg.voice, speed: t.cfg.speed, lang: t.cfg.lang })) });
      const r = spawnSync(PY, [path.join(HF, 'py', 'tts_kokoro.py'), job], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
      if (r.status !== 0) throw new Error('kokoro synthesis failed');
    } else if (provider === 'fish') {
      if (!fs.existsSync(PY_FISH)) throw new Error(`${PY_FISH} missing: the fish provider runs in the fish-tts-demo environment; set FISH_HOME or FISH_PYTHON to point elsewhere (see hf/README.md)`);
      writeJson(job, { model: list[0].cfg.model, lines: list.map((t) => ({ id: t.id, text: t.text, out: t.out, seed: t.cfg.seed ?? 1234,
        ref_audio: t.cfg.ref_audio, ref_text: t.cfg.ref_text, temperature: t.cfg.temperature, top_p: t.cfg.top_p, top_k: t.cfg.top_k, tags: t.cfg.tags })) });
      const r = spawnSync(PY_FISH, [path.join(HF, 'py', 'tts_fish.py'), job], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], env: { ...process.env, TOKENIZERS_PARALLELISM: 'false' } });
      if (r.status !== 0) throw new Error('fish (S2-Pro) synthesis failed');
      for (const t of list) if (t.cfg.speed && Math.abs(t.cfg.speed - 1) > 1e-3) tempo(t.out, t.cfg.speed);
    } else {
      if (!fs.existsSync(PY_MLX)) throw new Error(`${PY_MLX} missing: create it with uv venv --python 3.12 .venv-qwen && uv pip install --python .venv-qwen/bin/python -r requirements-mlx.txt`);
      writeJson(job, { provider, model: list[0].cfg.model, lines: list.map((t) => ({ id: t.id, text: t.text, out: t.out, seed: t.cfg.seed ?? 1234,
        speaker: t.cfg.speaker, instruct: t.cfg.instruct, language: t.cfg.language || 'English', ref_audio: t.cfg.ref_audio, temperature: t.cfg.temperature })) });
      const r = spawnSync(PY_MLX, [path.join(HF, 'py', 'tts_mlx.py'), job], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], env: { ...process.env, TOKENIZERS_PARALLELISM: 'false' } });
      if (r.status !== 0) throw new Error(`${provider} synthesis failed`);
      for (const t of list) if (t.cfg.speed && Math.abs(t.cfg.speed - 1) > 1e-3) tempo(t.out, t.cfg.speed);
    }
    for (const t of list) have[t.id] = t.hash;
    writeJson(side, have);
  }
  console.error(`voice: made ${todo.length} line(s): ${todo.map((t) => `${t.id}=${t.cfg.preset}`).join(' ')}`);
  return todo.map((t) => t.id);
}

/** Word times for every line (ASR anchors + script words). Cached by the hash of the wav and the spoken text. */
export async function words(DIR, sb, { force = false, concurrency = 3 } = {}) {
  const f = path.join(DIR, 'audio', 'words.json'), have = readJson(f, {}), jobs = [];
  for (const l of sb.lines) {
    const wav = path.join(DIR, 'audio', `${l.id}.wav`); if (!fs.existsSync(wav)) throw new Error(`missing ${wav}; run the voice step first`);
    const h = sha(fs.readFileSync(wav).toString('base64').slice(0, 200000) + '|' + l.say + '|' + fs.statSync(wav).size);
    if (!force && have[l.id] && have[l.id].hash === h) continue;
    jobs.push({ l, wav, h });
  }
  let k = 0;
  const worker = async () => {
    while (k < jobs.length) {
      const { l, wav, h } = jobs[k++], tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'hf-asr-'));
      const r = await hfCaptureAsync(['transcribe', wav, '--json', '-d', tmp]);
      const tr = path.join(tmp, 'transcript.json');
      if (!fs.existsSync(tr)) throw new Error(`transcription failed for ${l.id}:\n${r.out.slice(-600)}`);
      const asr = JSON.parse(fs.readFileSync(tr, 'utf8')), dur = wavDuration(wav);
      const say = String(l.say).split(/\s+/).filter(Boolean);
      const ws = alignWords(say, asr, dur);
      const anchored = ws.filter((w) => w.anchor).length;
      have[l.id] = { hash: h, dur, anchored: `${anchored}/${ws.length}`, words: ws.map((w) => ({ i: w.i, w: w.w, a: +w.a.toFixed(3), b: +w.b.toFixed(3) })) };
      fs.rmSync(tmp, { recursive: true, force: true });
      console.error(`words: ${l.id} ${anchored}/${ws.length} anchored`);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, worker));
  writeJson(f, have);
  return have;
}
