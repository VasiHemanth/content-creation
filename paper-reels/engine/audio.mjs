// Sound design for the generic renderer: synthesized sfx, a synthesized music bed, and the final mix.
// Everything is generated with ffmpeg lavfi (no downloads). Assets are written once into engine/assets/sfx/
// and committed; ensureAssets() regenerates any that are missing.
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const SFX_DIR = path.join(HERE, 'assets', 'sfx');
export const SFX_KINDS = ['whoosh', 'thud', 'pop', 'tick', 'chime', 'riser', 'impact', 'glitch', 'click', 'type', 'stamp'];
const SR = 44100;

// Each sfx: [lavfi source, extra filters]. Expressions are single-quoted so ',' and ';' stay inside them.
const SFX = {
  // pink noise swelling in, band-limited, then cut short: an air swish
  whoosh: [`anoisesrc=d=0.42:c=pink:a=0.6:r=${SR}:seed=7`, 'highpass=f=500,lowpass=f=5000,afade=t=in:d=0.3:curve=exp,afade=t=out:st=0.3:d=0.12'],
  // sine with a fast downward pitch sweep (180 -> 55 Hz), short decay
  thud: [`aevalsrc='0.9*sin(2*PI*(55*t+125/22*(1-exp(-22*t))))*exp(-9*t)*min(1,t/0.004)':d=0.5:s=${SR}`, 'lowpass=f=900'],
  // soft blip, 1150 -> 520 Hz
  pop: [`aevalsrc='0.8*sin(2*PI*(520*t+630/60*(1-exp(-60*t))))*exp(-38*t)*min(1,t/0.003)':d=0.16:s=${SR}`, 'lowpass=f=3000'],
  tick: [`aevalsrc='0.7*sin(2*PI*2200*t)*exp(-110*t)*min(1,t/0.001)':d=0.06:s=${SR}`, 'highpass=f=800'],
  chime: [`aevalsrc='0.35*(sin(2*PI*880*t)+0.6*sin(2*PI*1318.5*t)+0.35*sin(2*PI*1760*t))*exp(-3.2*t)*min(1,t/0.004)':d=1.3:s=${SR}`, 'lowpass=f=6000'],
  // added for the HyperFrames renderer (hf/). Noise comes from random(0), which ffmpeg seeds the same way each run.
  // rising sweep with noise, ends at its loudest: place it so it ends on the hit
  riser: [`aevalsrc='(0.45*sin(2*PI*(160*t+480*t*t))+0.3*(2*random(0)-1))*pow(t/1.1,2.2)':d=1.1:s=${SR}`, 'highpass=f=180,lowpass=f=7000,afade=t=out:st=1.06:d=0.04'],
  // low boom plus a noise crack: the big landing
  impact: [`aevalsrc='0.9*sin(2*PI*(40*t+90/16*(1-exp(-16*t))))*exp(-4*t)*min(1,t/0.003)+0.45*(2*random(0)-1)*exp(-28*t)':d=1.3:s=${SR}`, 'lowpass=f=3200'],
  // stuttered digital noise
  glitch: [`aevalsrc='0.6*(2*random(0)-1)*lt(mod(t,0.055),0.028)*exp(-4*t)+0.25*sin(2*PI*1800*t)*lt(mod(t,0.11),0.02)':d=0.36:s=${SR}`, 'highpass=f=600,lowpass=f=9000'],
  // one dry keyboard click
  click: [`aevalsrc='0.7*(2*random(0)-1)*exp(-420*t)+0.3*sin(2*PI*3200*t)*exp(-260*t)':d=0.04:s=${SR}`, 'highpass=f=1500'],
  // a short run of typing clicks (8 keys)
  type: [`aevalsrc='0.55*(2*random(0)-1)*exp(-380*mod(t,0.072))*lt(t,0.576)':d=0.62:s=${SR}`, 'highpass=f=1400,lowpass=f=9000'],
  // rubber stamp: dull thump with a paper slap
  stamp: [`aevalsrc='0.8*sin(2*PI*(70*t+60/30*(1-exp(-30*t))))*exp(-14*t)+0.5*(2*random(0)-1)*exp(-60*t)':d=0.4:s=${SR}`, 'lowpass=f=4200'],
};

// Music bed: a 4-chord pad (C, Am, F, G) and a soft bass pluck on every beat at 100 bpm.
// One chord = 2 bars = 4.8 s, loop = 19.2 s. The pad envelope is zero at every chord edge and the
// pluck restarts on the beat, so the loop is seamless when repeated.
const CHORDS = [[130.81, 164.81, 196.0], [110.0, 130.81, 164.81], [87.31, 110.0, 130.81], [98.0, 123.47, 146.83]];
const pick = (vals) => vals.reduceRight((acc, v, k) => `if(eq(ld(0),${k}),${v},${acc})`, '0');
const BED_EXPR = [
  'st(0,floor(mod(t,19.2)/4.8))', 'st(1,mod(t,4.8))', 'st(4,mod(t,0.6))',
  `st(2,${pick(CHORDS.map((c) => c[0]))})`, `st(3,${pick(CHORDS.map((c) => c[1]))})`, `st(5,${pick(CHORDS.map((c) => c[2]))})`,
  // pad: each chord tone plus a slightly detuned copy, with a soft fade at both chord edges
  'st(6,min(1,min(ld(1)/0.6,(4.8-ld(1))/0.6)))',
  'st(7,(sin(2*PI*ld(2)*t)+sin(2*PI*ld(2)*1.004*t)+0.8*sin(2*PI*ld(3)*t)+0.8*sin(2*PI*ld(3)*0.996*t)+0.7*sin(2*PI*ld(5)*t)+0.35*sin(2*PI*ld(2)*2*t))*ld(6)*0.11)',
  // pulse: root an octave down, plucked on each beat (0.6 s)
  'st(8,sin(2*PI*ld(2)/2*ld(4))*exp(-7*ld(4))*min(1,ld(4)/0.01)*0.28)',
  'ld(7)+ld(8)',
].join(';');

const run = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: ['ignore', 'ignore', 'inherit'] });
export function meanDb(file, filter = '') {
  const r = spawnSync('ffmpeg', ['-i', file, '-af', `${filter ? filter + ',' : ''}volumedetect`, '-vn', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
  return { mean: +(r.match(/mean_volume: (-?[\d.]+)/) || [])[1], peak: +(r.match(/max_volume: (-?[\d.]+)/) || [])[1] };
}

/** Generate any missing sfx and the bed into engine/assets/sfx/. Each sfx is peak-normalized to -1 dBFS; the bed to -20 dB mean. */
export function ensureAssets() {
  fs.mkdirSync(SFX_DIR, { recursive: true });
  for (const k of SFX_KINDS) {
    const out = path.join(SFX_DIR, `${k}.wav`);
    if (fs.existsSync(out)) continue;
    const [src, fx] = SFX[k], tmp = out + '.raw.wav';
    run(['-f', 'lavfi', '-i', src, '-af', `${fx},aformat=sample_rates=${SR}:channel_layouts=mono`, '-c:a', 'pcm_s16le', tmp]);
    const { peak } = meanDb(tmp);
    run(['-i', tmp, '-af', `volume=${(-1 - peak).toFixed(2)}dB`, '-c:a', 'pcm_s16le', out]);
    fs.unlinkSync(tmp);
    console.error(`sfx: generated ${out}`);
  }
  const bed = path.join(SFX_DIR, 'bed.wav');
  if (!fs.existsSync(bed)) {
    const tmp = bed + '.raw.wav';
    run(['-f', 'lavfi', '-i', `aevalsrc='${BED_EXPR}':d=19.2:s=${SR}`, '-af', 'lowpass=f=2200,aformat=channel_layouts=mono', '-c:a', 'pcm_s16le', tmp]);
    const { mean } = meanDb(tmp);
    run(['-i', tmp, '-af', `volume=${(-20 - mean).toFixed(2)}dB`, '-c:a', 'pcm_s16le', bed]);
    fs.unlinkSync(tmp);
    console.error(`sfx: generated ${bed}`);
  }
}

/** Collect every numeric `at` / `...At` field anywhere inside a line's data. */
function atFields(v, out = []) {
  if (Array.isArray(v)) v.forEach((x) => atFields(x, out));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) {
    if ((k === 'at' || /At$/.test(k)) && typeof x === 'number') out.push(x); else atFields(x, out);
  }
  return out;
}

/**
 * Sound events for a timeline. TL items: {block, transition, sfx, data, start, dur}. `trans(i)` returns the
 * effective transition out of line i ('whip'|'punch'|'cut'|'dip'). Returns [{t, kind}] in absolute seconds.
 *  - whoosh centred on every whip boundary, thud just before every punch peak
 *  - a pop at start + min(dur*at, dur-1.9) for every numeric at/footAt in data (same clamp the styles use)
 *  - explicit line.sfx [{at, kind}] at start + dur*at
 */
export function sfxEvents(TL, trans) {
  const ev = [];
  TL.forEach((s, i) => {
    const end = s.start + s.dur, tr = trans(i);
    if (tr === 'whip') ev.push({ t: end - 0.3, kind: 'whoosh' });
    if (tr === 'punch') ev.push({ t: end - 0.08, kind: 'thud' });
    for (const a of atFields(s.data)) ev.push({ t: s.start + Math.max(0.1, Math.min(s.dur * a, s.dur - 1.9)), kind: 'pop' });
    for (const x of s.sfx || []) {
      if (!SFX_KINDS.includes(x.kind)) throw new Error(`line ${s.id}: unknown sfx kind "${x.kind}" (use ${SFX_KINDS.join('|')})`);
      ev.push({ t: s.start + s.dur * (+x.at || 0), kind: x.kind });
    }
  });
  return ev.filter((e) => e.t >= 0).sort((a, b) => a.t - b.t);
}

/**
 * Final mix: voices + ducked bed + sfx -> loudnorm -> limiter -> AAC, written through a temp file.
 * voices: [{file, at}] (at = absolute start seconds). Levels are relative to the voice's measured mean:
 * bed mean sits BED_DB under it before ducking (about -19.5 dB after ducking), each sfx's mean (over its own length) SFX_DB under it.
 */
export const BED_DB = -13, SFX_DB = -18;
export function mixAudio({ voices, events, total, outFile, workDir }) {
  ensureAssets();
  const T = total.toFixed(3);
  // voice level: power-average of each wav's mean (volumedetect), after the same +1.5x gain used in the mix
  const vm = voices.map((v) => meanDb(v.file).mean);
  const voiceDb = 10 * Math.log10(vm.reduce((a, m) => a + 10 ** (m / 10), 0) / vm.length) + 20 * Math.log10(1.5);
  const bedDb = meanDb(path.join(SFX_DIR, 'bed.wav')).mean;
  const sfxDb = Object.fromEntries([...new Set(events.map((e) => e.kind))].map((k) => [k, meanDb(path.join(SFX_DIR, `${k}.wav`)).mean]));

  const args = ['-y'], f = [];
  voices.forEach((v) => args.push('-i', v.file));
  const bedIn = voices.length; args.push('-stream_loop', '-1', '-i', path.join(SFX_DIR, 'bed.wav'));
  const kinds = Object.keys(sfxDb), kIn = {};
  kinds.forEach((k, j) => { kIn[k] = bedIn + 1 + j; args.push('-i', path.join(SFX_DIR, `${k}.wav`)); });

  const fmt = `aformat=sample_rates=${SR}:channel_layouts=mono`;
  voices.forEach((v, i) => f.push(`[${i}:a]${fmt},volume=1.5,adelay=${Math.round(v.at * 1000)}:all=1[v${i}]`));
  f.push(`${voices.map((_, i) => `[v${i}]`).join('')}amix=inputs=${voices.length}:normalize=0:dropout_transition=0,apad=whole_dur=${T},atrim=0:${T},asplit=2[voice][key]`);
  const bedGain = (voiceDb + BED_DB - bedDb).toFixed(2);
  f.push(`[${bedIn}:a]${fmt},atrim=0:${T},asetpts=N/SR/TB,volume=${bedGain}dB,afade=t=in:d=1.5,afade=t=out:st=${(total - 2.5).toFixed(3)}:d=2.5[bedv]`);
  // ducking: bed drops ~6 dB while the voice is above threshold
  f.push(`[bedv][key]sidechaincompress=threshold=0.03:ratio=4:attack=30:release=450:makeup=1[bed]`);
  const mixIns = ['[voice]', '[bed]'];
  for (const k of kinds) {
    const evs = events.filter((e) => e.kind === k), g = (voiceDb + SFX_DB - sfxDb[k]).toFixed(2);
    f.push(`[${kIn[k]}:a]${fmt},volume=${g}dB,asplit=${evs.length}${evs.map((_, n) => `[${k}${n}]`).join('')}`);
    evs.forEach((e, n) => { f.push(`[${k}${n}]adelay=${Math.round(e.t * 1000)}:all=1[${k}d${n}]`); mixIns.push(`[${k}d${n}]`); });
  }
  f.push(`${mixIns.join('')}amix=inputs=${mixIns.length}:normalize=0:dropout_transition=0,loudnorm=I=-14:TP=-1.5:LRA=7,alimiter=limit=0.85:level=disabled,aresample=44100,apad=whole_dur=${T},atrim=0:${T}[out]`);
  const script = path.join(workDir, 'filter.txt');
  fs.writeFileSync(script, f.join(';\n'));
  const tmp = outFile.replace(/(\.\w+)$/, '.partial$1');
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', ...args, '-filter_complex_script', script, '-map', '[out]', '-c:a', 'aac', '-b:a', '160k', tmp], { stdio: ['ignore', 'ignore', 'inherit'] });
  fs.renameSync(tmp, outFile);
  return { voiceDb, bedGain: +bedGain, events: events.length };
}
