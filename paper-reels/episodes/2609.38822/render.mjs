// usage: node render.mjs stills <seconds...> [--w=960]  |  node render.mjs video  |  node render.mjs audio  |  node render.mjs mux  |  node render.mjs all
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { createCanvas } from '@napi-rs/canvas';
import { W, H, FPS, ctx, cv, setBoil, C, txt, tw, rrect, cl, eo3, seg } from '../../engine/core.mjs';
import * as S from './scenes.mjs';

const script = JSON.parse(fs.readFileSync('script.json', 'utf8'));
const FNS = [S.s1, S.s2, S.s3, S.s4, S.s5, S.s6, S.s7, S.s8, S.s9, S.s10];
const LEAD = 0.3, TAIL = 0.6;
let cur = 0; const TL = script.map((l, i) => {
  const vd = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', `audio/${l.id}.wav`]).toString();
  const dur = LEAD + vd + (i === script.length - 1 ? 1.4 : TAIL), r = { ...l, fn: FNS[i], start: cur, dur, vd }; cur += dur; return r; });
const TOTAL = cur, N = Math.round(TOTAL * FPS);
console.error(`total ${TOTAL.toFixed(2)}s, ${N} frames`);

// caption chunks: split at punctuation, share the voice span by character count
function chunks(text) { const parts = text.split(/(?<=[.,:])\s+/).filter(Boolean); const out = [];
  for (const p of parts) { const w = p.split(/\s+/); if (w.length > 6) { const m = Math.ceil(w.length / 2); out.push(w.slice(0, m).join(' '), w.slice(m).join(' ')); } else out.push(p); } return out; }
for (const s of TL) { const cs = chunks(s.text), tot = cs.reduce((a, c) => a + c.length + 6, 0); let t = LEAD; s.caps = cs.map((c) => { const span = (c.length + 6) / tot * s.vd; const r = { c, a: t, b: t + span }; t += span; return r; }); }

function drawFrame(gf) {
  setBoil(gf); const T = gf / FPS; let i = TL.findIndex((s) => T >= s.start && T < s.start + s.dur); if (i < 0) i = TL.length - 1;
  const s = TL[i], t = T - s.start;
  ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H); s.fn(t, s.dur);
  const cap = s.caps.find((c) => t >= c.a && t < c.b + 0.15);
  if (cap && i !== TL.length - 1) { let sz = 56; const need = tw(cap.c, 'Brush', sz) + 80; if (need > 960) sz = Math.floor(sz * 960 / need); const w = Math.min(960, tw(cap.c, 'Brush', sz) + 80), p = eo3(seg(t, cap.a, cap.a + 0.15));
    ctx.save(); ctx.globalAlpha = p; rrect(540 - w / 2, 1490, w, 96, 16, { fill: C.paper, col: C.ink, lw: 4, seed: 33 }); txt(cap.c, 540, 1558, { font: 'Brush', size: sz, col: C.ink }); ctx.restore(); }
  if (i !== TL.length - 1) txt('hemanthvasi', 540, 1650, { font: 'Brush', size: 44, col: i === 8 ? C.paper : C.ink, alpha: 0.6, rot: -0.02 });
  const fade = Math.max(1 - seg(t, 0, 0.35), i < TL.length - 1 ? seg(t, s.dur - 0.35, s.dur) : 0);
  if (fade > 0) { ctx.save(); ctx.globalAlpha = fade; ctx.fillStyle = i === 8 && t < 1 ? C.ink : C.paper; ctx.fillRect(0, 0, W, H); ctx.restore(); }
}

const mode = process.argv[2];
if (mode === 'stills') {
  const wArg = process.argv.find((x) => x.startsWith('--w=')); const outW = wArg ? +wArg.slice(4) : 960;
  fs.mkdirSync('out/stills', { recursive: true }); const small = createCanvas(outW, Math.round(outW * H / W)), sg = small.getContext('2d');
  for (const sec of process.argv.slice(3).filter((x) => !x.startsWith('--')).map(Number)) { drawFrame(Math.round(sec * FPS)); sg.drawImage(cv, 0, 0, small.width, small.height); fs.writeFileSync(`out/stills/t${sec.toFixed(1).padStart(5, '0')}.png`, small.toBuffer('image/png')); }
  console.error(TL.map((s) => `${s.id}@${s.start.toFixed(1)}`).join(' '));
} else if (mode === 'video') {
  const ff = spawn('ffmpeg', ['-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', process.env.CRF || '26',
    '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', 'out/silent.mp4'], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = 0; f < N; f++) { drawFrame(f); if (!ff.stdin.write(cv.data())) await new Promise((r) => ff.stdin.once('drain', r)); if (f % 300 === 0) console.error('frame', f); }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r));
} else if (mode === 'audio') {
  // voice at scene start + LEAD, plus a very quiet synthesized pad as a bed (ducked under the voice via low gain)
  const args = ['-y']; TL.forEach((s) => args.push('-i', `audio/${s.id}.wav`));
  args.push('-f', 'lavfi', '-i', `aevalsrc='0.5*(sin(2*PI*110*t)+0.7*sin(2*PI*164.81*t)+0.5*sin(2*PI*220*t)+0.4*sin(2*PI*277.18*t))*(0.75+0.25*sin(2*PI*0.1*t))':d=${TOTAL.toFixed(2)}:s=44100`);
  const f = TL.map((s, i) => `[${i}:a]aformat=sample_rates=44100:channel_layouts=mono,volume=1.6,adelay=${Math.round((s.start + LEAD) * 1000)}:all=1[v${i}]`);
  f.push(`[${TL.length}:a]volume=0.05,afade=t=in:d=2,afade=t=out:st=${(TOTAL - 2.5).toFixed(2)}:d=2.5[bed]`);
  f.push(`${TL.map((_, i) => `[v${i}]`).join('')}[bed]amix=inputs=${TL.length + 1}:normalize=0:dropout_transition=0,alimiter=limit=0.92,apad=whole_dur=${TOTAL.toFixed(2)},atrim=0:${TOTAL.toFixed(2)}[out]`);
  fs.writeFileSync('out/filter.txt', f.join(';')); args.push('-filter_complex_script', 'out/filter.txt', '-map', '[out]', '-c:a', 'aac', '-b:a', '160k', 'out/audio.m4a');
  execFileSync('ffmpeg', args, { stdio: 'inherit' });
} else if (mode === 'mux') {
  execFileSync('ffmpeg', ['-y', '-i', 'out/silent.mp4', '-i', 'out/audio.m4a', '-c:v', 'copy', '-c:a', 'copy', '-shortest', '-movflags', '+faststart', 'out/final.mp4'], { stdio: 'inherit' });
}
