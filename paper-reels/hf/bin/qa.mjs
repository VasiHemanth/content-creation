// Episode QA for the HyperFrames renderer. bin/validate.mjs runs <episode>/qa.mjs, which calls runQa(<episode dir>).
// Checks: every number on screen (storyboard copy, paper receipts) is in facts.json; scenes carry no hard-coded copy
// (all text comes from the storyboard through data-bind or KIT.data); data-bind paths resolve; spoken text is clean;
// the end credit is present; voice, word timing and captions are complete; the rendered file is in spec.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { checkStoryboard } from './ste.mjs';
import { formatOf } from '../../formats/index.mjs';

export function runQa(DIR) {
  const style = (process.argv.find((a) => a.startsWith('--style=')) || '').split('=')[1] || 'hf';
  const read = (f) => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
  const sb = read('storyboard.json'), facts = read('facts.json'), known = { ...(facts.numbers || {}), ...(facts.evidence_incidental || {}) };
  const results = [], check = (ok, msg) => results.push([!!ok, msg]);

  // numbers: identifiers such as gpt-6-astra or claude-opus-5 are names, not figures
  const stripIds = (s) => String(s).replace(/\b[A-Za-z]+(?:-[A-Za-z0-9.]+)+/g, ' ');
  const nums = (s) => (stripIds(s).match(/\d[\d,]*(?:\.\d+)?/g) || []).map((n) => n.replace(/,$/, ''));
  const has = (n) => n in known || n.replace(/\.0+$/, '') in known;
  const walk = (v, out) => {
    if (typeof v === 'number') out.push(String(v));
    else if (typeof v === 'string') out.push(...nums(v));
    else if (Array.isArray(v)) v.forEach((x) => walk(x, out));
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!k.startsWith('_')) walk(x, out);
    return out;
  };
  for (const l of sb.lines) for (const n of new Set(walk([l.text, l.data || {}], []))) check(has(n), `${l.id}: number ${n} on screen is in facts.json`);

  // paper receipts: every number readable in a crop is a known fact (or listed as incidental with a reason)
  const man = path.join(DIR, 'evidence', 'manifest.json');
  if (fs.existsSync(man)) for (const [id, e] of Object.entries(JSON.parse(fs.readFileSync(man, 'utf8')))) {
    const found = new Set(nums(e.text));
    const bad = [...found].filter((n) => !has(n));
    check(bad.length === 0, `receipt ${id}: numbers in the crop are in facts.json${bad.length ? ` (missing: ${bad.join(', ')})` : ''}`);
  }

  // scenes: no copy typed into the HTML (digits in static text), and every data-bind resolves
  const sceneDir = path.join(DIR, 'scenes');
  const lineById = Object.fromEntries(sb.lines.map((l) => [l.id, l]));
  for (const f of fs.readdirSync(sceneDir).filter((x) => x.endsWith('.html'))) {
    const html = fs.readFileSync(path.join(sceneDir, f), 'utf8');
    const text = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
    const digits = text.match(/\d/g);
    check(!digits, `${f}: no hard-coded digits in visible text${digits ? ` (found ${digits.length})` : ''}`);
    const words = text.split(/\s+/).filter((w) => /[A-Za-z]{3,}/.test(w));
    check(words.length === 0, `${f}: no hard-coded words in visible text${words.length ? ` (${words.slice(0, 5).join(' ')})` : ''}`);
    for (const m of html.matchAll(/data-bind="([^"]+)"/g)) {
      const [id, ...p] = m[1].split('.'); let v = lineById[id] && lineById[id].data;
      for (const k of p) v = v == null ? v : v[k];
      check(v != null, `${f}: data-bind ${m[1]} resolves`);
    }
  }

  // spoken text and copy hygiene
  const BANNED = [/hemanthvasi/i, /instagram/i, /youtube/i, /threads/i];
  const all = JSON.stringify(sb.lines.map((l) => [l.say, l.text, l.data]));
  for (const b of BANNED) check(!b.test(all), `storyboard copy has no ${b}`);
  check(sb.lines.every((l) => !/[—–]/.test(l.say + l.text)), 'no em or en dashes in say/text');
  check(sb.lines.every((l) => !/\d/.test(l.say)), 'no digits in say (numbers are spelled out)');
  // line.tts (fish provider): the same words as say plus [direction] tags; the tags are never spoken
  const untag = (s) => String(s).replace(/\[[^\]]*\]/g, ' ').replace(/<\|[^|]*\|>/g, ' ').toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').split(/\s+/).filter(Boolean).join(' ');
  for (const l of sb.lines.filter((x) => x.tts)) check(untag(l.tts) === untag(l.say), `${l.id}: tts without its [tags] says the same words as say`);
  const last = sb.lines.at(-1).data || {};
  const isPaper = /^\d{4}\.\d{4,5}$/.test(sb.item);   // topic items have a slug id and no arXiv credit
  check(last.handle === 'hemanth_with_ai' && (!isPaper || /arXiv \d/.test(last.credit || '')), `last line carries the handle${isPaper ? ' and an arXiv credit' : ''}`);

  // format: system-design names its source article and declares where each technical term enters (paper-reels/formats/)
  if (formatOf(sb).name === 'system-design') {
    const src = facts.source_text && path.resolve(DIR, '..', '..', '..', facts.source_text);
    check(src && fs.existsSync(src), `facts.json source_text names the article text${facts.source_text ? ` (${facts.source_text})` : ''}`);
    check(Array.isArray(sb.ste && sb.ste.jargon) && sb.ste.jargon.length > 0, 'ste.jargon lists the technical terms and the line that introduces each');
  }

  // narration in the STE profile (hf/ste.json): hard findings fail; an episode may opt out only with a reason
  if (sb.ste && sb.ste.enforce === false) check(!!sb.ste.why, `STE profile not enforced${sb.ste.why ? ` (${sb.ste.why})` : ', and no reason given'}`);
  else {
    const ste = checkStoryboard(sb);
    for (const f of ste.findings.filter((x) => x.hard)) check(false, `STE ${f.line} ${f.rule}: ${f.msg}`);
    check(ste.hard === 0, `STE narration: ${ste.hard} hard, ${ste.soft} soft finding(s) (node hf/bin/ste.mjs <dir> for details)`);
  }

  // voice, words, captions
  const wordsF = path.join(DIR, 'audio', 'words.json'), words = fs.existsSync(wordsF) ? JSON.parse(fs.readFileSync(wordsF, 'utf8')) : {};
  check(sb.lines.every((l) => fs.existsSync(path.join(DIR, 'audio', `${l.id}.wav`))), 'all voice files exist');
  check(sb.lines.every((l) => words[l.id] && words[l.id].words.length === l.say.split(/\s+/).filter(Boolean).length), 'word timing covers every spoken word');
  const dataJs = path.join(DIR, 'out', 'hf', 'project', 'data.js');
  if (fs.existsSync(dataJs)) {
    const EP = JSON.parse(fs.readFileSync(dataJs, 'utf8').replace(/^window\.EP = /, '').replace(/;\s*$/, ''));
    const caps = Object.values(EP.lines).flatMap((l) => l.caps.map((c) => c.words.map((w) => w.t).join(' ')));
    check(caps.every((c) => c.length <= 34), `captions are short (longest ${Math.max(...caps.map((c) => c.length))} chars)`);
  } else check(false, 'built project exists (hf.mjs build)');

  // the rendered file
  const v = path.join(DIR, 'out', style, 'final.mp4');
  if (fs.existsSync(v)) {
    const p = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', v]).toString());
    const vs = p.streams.find((s) => s.codec_type === 'video'), as = p.streams.find((s) => s.codec_type === 'audio'), d = +vs.duration;
    check(vs.width === 1080 && vs.height === 1920, `${style}: 1080x1920`);
    check(vs.r_frame_rate === '30/1', `${style}: 30 fps`);
    check(!!as, `${style}: has audio`);
    const fmt = formatOf(sb);
    check(d >= fmt.minSeconds && d <= fmt.maxSeconds, `${style}: duration ${d.toFixed(1)}s within ${fmt.minSeconds}..${fmt.maxSeconds} (${fmt.name})`);
    const vol = spawnSync('ffmpeg', ['-i', v, '-af', 'volumedetect', '-vn', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
    const mean = +(vol.match(/mean_volume: (-?[\d.]+)/) || [])[1], peak = +(vol.match(/max_volume: (-?[\d.]+)/) || [])[1];
    check(mean > -30 && mean < -12, `${style}: mean volume ${mean} dB`);
    check(peak <= -0.5, `${style}: peak ${peak} dB below clipping`);
  }
  check(fs.existsSync(path.join(DIR, 'out', 'thumb.png')), 'out/thumb.png exists');

  let bad = 0; for (const [ok, msg] of results) { if (!ok) bad++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); }
  console.log(`${results.length - bad}/${results.length} passed`);
  process.exit(bad ? 1 : 0);
}
