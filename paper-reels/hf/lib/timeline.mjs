// Episode timeline for the HyperFrames renderer. Line timing comes from engine/timing.mjs (the same function the
// validator uses for its frame-count check), so the two can never disagree.
//
// storyboard.json (renderer "hyperframes"):
//   { item, name, authors, renderer: "hyperframes", voice: "heart" | {preset, speed},
//     scenes: { <name>: { transition?: "whip"|"punch"|"zoom"|"rise"|"blur"|"iris"|"glitch"|"cut", tdur?: seconds } },
//     lines: [ { id, scene, say, text, data?, sfx?: [{ cue: "<spoken word>" | t: seconds, nth?, kind }] } ] }
// Consecutive lines with the same `scene` play inside one sub-composition (episodes/<dir>/scenes/<scene>.html).
import fs from 'node:fs';
import path from 'node:path';
import { LEAD, FPS, lineDur } from '../../engine/timing.mjs';
import { alignWords, norm } from './align.mjs';
import { wavDuration } from './voice.mjs';

export const TRANSITIONS = { whip: 0.32, punch: 0.36, zoom: 0.45, rise: 0.4, blur: 0.55, iris: 0.5, glitch: 0.3, cut: 0 };
const MAXC = 30;

// Caption chunks: split at punctuation, then into balanced pieces of at most MAXC characters (same rule as the
// canvas renderer, so captions read the same in both).
function balance(p) {
  if (p.length <= MAXC) return [p];
  const sp = [...p].map((c, i) => (c === ' ' ? i : -1)).filter((i) => i > 0);
  if (!sp.length) return [p];
  const mid = p.length / 2, cut = sp.reduce((a, b) => (Math.abs(b - mid) < Math.abs(a - mid) ? b : a));
  return [...balance(p.slice(0, cut)), ...balance(p.slice(cut + 1))];
}
const chunks = (text) => text.split(/(?<=[.,:;?])\s+/).filter(Boolean).flatMap(balance);

export function loadStoryboard(DIR) {
  const sb = JSON.parse(fs.readFileSync(path.join(DIR, 'storyboard.json'), 'utf8'));
  if (sb.renderer !== 'hyperframes') throw new Error(`${DIR}/storyboard.json: "renderer" must be "hyperframes"`);
  for (const l of sb.lines) { l.scene = l.scene || l.id; if (!l.say || !l.text) throw new Error(`line ${l.id}: say and text are required`); }
  return sb;
}

/** Full timeline. words = audio/words.json contents (from voice.words). */
export function buildTimeline(DIR, sb, words) {
  let cur = 0;
  const lines = sb.lines.map((l, i) => {
    const vd = wavDuration(path.join(DIR, 'audio', `${l.id}.wav`)), dur = lineDur(vd, i === sb.lines.length - 1);
    const r = { ...l, i, start: cur, dur, vd, lead: LEAD }; cur += dur; return r;
  });
  const total = cur, frames = Math.round(total * FPS);
  // scenes, in order of first appearance; a scene must be one contiguous run of lines
  const scenes = [];
  for (const l of lines) {
    const last = scenes[scenes.length - 1];
    if (last && last.name === l.scene) { last.lines.push(l.id); last.dur += l.dur; continue; }
    if (scenes.some((s) => s.name === l.scene)) throw new Error(`scene "${l.scene}" is not contiguous (line ${l.id})`);
    const cfg = (sb.scenes || {})[l.scene] || {};
    scenes.push({ name: l.scene, start: l.start, dur: l.dur, lines: [l.id], transition: cfg.transition || 'cut', tdur: cfg.tdur ?? TRANSITIONS[cfg.transition || 'cut'] });
  }
  for (const s of scenes) if (!(s.transition in TRANSITIONS)) throw new Error(`scene ${s.name}: unknown transition "${s.transition}"`);
  scenes[scenes.length - 1].transition = 'cut'; scenes[scenes.length - 1].tdur = 0;
  // offsets of each line inside its scene
  for (const s of scenes) { let t = 0; for (const id of s.lines) { const l = lines.find((x) => x.id === id); l.t0 = t; t += l.dur; } }
  // spoken word times (relative to the wav) and caption chunks (absolute)
  for (const l of lines) {
    const w = words[l.id]; if (!w) throw new Error(`no word timing for ${l.id}; run: hf.mjs <dir> words`);
    l.words = w.words;
    const tokens = l.words.map((x) => ({ text: x.w, start: x.a, end: x.b }));
    const capWords = String(l.text).split(/\s+/).filter(Boolean);
    const cw = alignWords(capWords, tokens, l.vd);                    // caption word -> time (relative to wav)
    let k = 0;
    l.caps = chunks(l.text).map((c) => {
      const ws = c.split(' ').filter(Boolean).map((t) => { const x = cw[k++]; return { t, a: +(l.start + l.lead + x.a).toFixed(3) }; });
      return { c, words: ws, two: c.length > 26 };
    });
    l.caps.forEach((c, ci) => {
      c.a = +(Math.max(l.start, c.words[0].a - 0.08)).toFixed(3);
      const nxt = l.caps[ci + 1];
      c.b = +(nxt ? Math.max(c.a + 0.3, nxt.words[0].a - 0.08) : l.start + l.dur - (l.i === lines.length - 1 ? 0.4 : 0.02)).toFixed(3);
    });
  }
  return { lines, scenes, total, frames, fps: FPS };
}

/** Spoken-word cue, seconds from the scene start. Throws if the word is not in the line. */
export function cueAt(tlx, lineId, spec, nth = 0) {
  const l = tlx.lines.find((x) => x.id === lineId); if (!l) throw new Error(`no line ${lineId}`);
  if (typeof spec === 'number') return l.t0 + spec;
  const key = norm(spec); let n = nth;
  for (const w of l.words) if (norm(w.w) === key && n-- === 0) return l.t0 + l.lead + w.a;
  throw new Error(`line ${lineId}: word "${spec}" not in "${l.say}"`);
}

/** Sound events in absolute seconds: transition sounds plus each line's `sfx` list. */
export function sfxEvents(tlx) {
  const ev = [];
  const sceneOf = (name) => tlx.scenes.find((s) => s.name === name);
  tlx.scenes.forEach((s, i) => {
    if (i === tlx.scenes.length - 1) return;
    const T = s.start + s.dur;
    const kind = { whip: 'whoosh', zoom: 'whoosh', rise: 'whoosh', iris: 'whoosh', blur: 'whoosh', punch: 'thud', glitch: 'glitch' }[s.transition];
    if (kind) ev.push({ t: Math.max(0, T - (kind === 'whoosh' ? 0.22 : 0.04)), kind });
  });
  for (const l of tlx.lines) for (const x of l.sfx || []) {
    const sc = sceneOf(l.scene), rel = x.cue != null ? cueAt(tlx, l.id, x.cue, x.nth || 0) : l.t0 + (+x.t || 0);
    ev.push({ t: sc.start + rel + (+x.offset || 0), kind: x.kind });
  }
  return ev.filter((e) => e.t >= 0 && e.t < tlx.total).sort((a, b) => a.t - b.t);
}
