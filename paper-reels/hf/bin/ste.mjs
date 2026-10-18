#!/usr/bin/env node
// STE narration checker: the measurable ASD-STE100 writing rules, applied to the caption text (`text`) of every
// storyboard line. The spoken text (`say`) mirrors it with numbers and acronyms spelled out.
//   node hf/bin/ste.mjs <episodeDir> [--json]        exits 1 when a hard rule fails
// Profile: hf/ste.json. Per episode, storyboard.json may add:
//   "ste": { "terms": [ { "term": "replay simulator", "avoid": ["sandbox", "dream world"] } ],
//            "names": ["Dream-RSI", "dreaming"],                 technical names, allowed even with -ing
//            "allow": [ { "line": "l03", "rule": "passive", "why": "..." } ],
//            "jargon": [ { "term": "checkout", "line": "l07" } ] }   where each technical term is explained (formats/explain.md)
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { formatOf } from '../../formats/index.mjs';

const HF = path.resolve(import.meta.dirname, '..');
export const PROFILE = JSON.parse(fs.readFileSync(path.join(HF, 'ste.json'), 'utf8'));

const lower = (s) => s.toLowerCase();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const words = (s) => s.split(/\s+/).map((w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}%]+$/gu, '')).filter(Boolean);

/** Sentences of a line. Splits after . ? ! and after ":" when a capital follows (a label such as "Not measured:" stays). */
export function sentences(text) {
  return String(text).replace(/\s+/g, ' ').trim()
    .split(/(?<=[.?!])\s+(?=[A-Z0-9"'(])/).map((s) => s.trim()).filter(Boolean);
}

/** Check one line. Returns findings [{ rule, hard, msg, fix? }]. */
export function checkLine(text, { names = [], terms = [], free = false, profile = PROFILE } = {}) {
  const out = [], add = (rule, hard, msg, fix) => out.push({ rule, hard, msg, ...(fix != null ? { fix } : {}) });
  const nameWords = new Set(names.flatMap((n) => words(lower(n))));
  const body = lower(text);
  const sents = sentences(text);

  // sentence length and count
  sents.forEach((s, k) => {
    const n = words(s).length;
    if (n > profile.maxWords) add('length', true, `sentence ${k + 1} has ${n} words (max ${profile.maxWords}): "${s}"`, 'split it into two sentences');
    else if (n > profile.targetWords && !free) add('length', false, `sentence ${k + 1} has ${n} words (target ${profile.targetWords} or fewer)`);
  });
  if (sents.length > profile.maxSentencesPerLine) add('sentences', false, `${sents.length} sentences in one line (target ${profile.maxSentencesPerLine} or fewer); split the line`);

  // one idea per sentence: two or more clause joins in one sentence
  if (!free) sents.forEach((s, k) => {
    const joins = (s.match(/,\s+(and|but|so|which|while|because|although|or)\b|;/gi) || []).length;
    if (joins >= 2) add('one-idea', false, `sentence ${k + 1} joins ${joins + 1} clauses; one idea per sentence`);
  });

  // words to replace (hype, filler, idioms, long words with a plain equivalent)
  for (const [bad, good] of Object.entries(profile.replace)) {
    const re = new RegExp(`(^|[^\\p{L}])${esc(bad)}(?=$|[^\\p{L}])`, 'iu');
    if (re.test(body)) add('word', true, `"${bad}" is not plain English`, good ? `use "${good}"` : 'delete it');
  }
  // phrasal verbs
  for (const pv of profile.phrasal) {
    if (new RegExp(`\\b${esc(pv)}\\b`, 'i').test(body)) add('phrasal', true, `phrasal verb "${pv}"`, 'use one verb with one meaning');
  }
  // -ing forms, except technical names and allowed words
  const allow = new Set(profile.ingAllow);
  for (const w of words(text)) {
    const lw = lower(w);
    if (!/[a-z]{3,}ing$/.test(lw) || allow.has(lw) || nameWords.has(lw)) continue;
    add('ing', true, `"-ing" form "${w}"`, 'use a verb in a simple tense, or add it to ste.names if it is a technical name');
  }
  // passive voice: a form of "be" (or "get") + past participle
  const PART = `(?:\\w+ed|${profile.irregularParticiples.join('|')})`;
  const passive = body.match(new RegExp(`\\b(?:is|are|was|were|be|been|being|gets|got|get)\\s+(?:\\w+ly\\s+)?(${PART})\\b`, 'g')) || [];
  for (const p of passive) {
    const part = p.split(/\s+/).pop();
    if (nameWords.has(part)) continue;
    add('passive', true, `passive voice "${p}"`, 'name who does the action: "<who> <verb> <what>"');
  }
  // simple tenses only: no perfect forms
  const perfect = body.match(new RegExp(`\\b(?:has|have|had)\\s+(?:not\\s+)?(?:been\\s+)?(${PART})\\b`, 'g')) || [];
  for (const p of perfect) add('tense', true, `perfect tense "${p}"`, 'use the simple past or the simple present');
  // contractions: prefer the full form
  const contr = text.match(/\b\w+'(?:s|t|re|ve|ll|d|m)\b/gi) || [];
  for (const c of contr) if (!/'s$/i.test(c)) add('contraction', false, `contraction "${c}"`, 'write the full form');
  // noun clusters (STE: no more than three nouns in a row). Without a part-of-speech tagger this is a warning only:
  // five or more content words in one clause, with no function word and no common verb between them.
  if (!free) {
    const stop = new Set([...profile.functionWords, ...profile.commonVerbs]);
    for (const clause of String(text).split(/[,.;:?!()]/)) {
      let run = [];
      const flush = () => { if (run.length >= 5) add('noun-cluster', false, `possible noun cluster "${run.join(' ')}"`, 'use "of" or split the phrase'); run = []; };
      for (const w of words(clause)) { const lw = lower(w); if (stop.has(lw) || /^\d/.test(lw)) flush(); else run.push(w); }
      flush();
    }
  }
  // one term per concept
  for (const t of terms) for (const a of t.avoid || []) {
    if (new RegExp(`\\b${esc(lower(a))}\\b`).test(body)) add('term', true, `"${a}" is a second name for "${t.term}"`, `use "${t.term}"`);
  }
  // profile.enforce === false: the grammar and length rules become advice. "term" stays hard (one name per concept).
  return profile.enforce === false ? out.map((f) => (f.rule === 'term' ? f : { ...f, hard: false })) : out;
}

/** Where each technical term enters (paper-reels/formats/explain.md). `jargon` is [{ term, line }]: the line that
 *  describes the thing and gives its name. A term used before that line, or a line that brings in two terms, loses
 *  a viewer with no background. Returns findings [{ line, rule, hard, msg, fix }]. */
export function checkJargon(lines, jargon = [], { hard = false } = {}) {
  const out = [], idx = Object.fromEntries(lines.map((l, i) => [l.id, i]));
  const uses = (text, term) => new RegExp(`(^|[^\\p{L}\\p{N}])${esc(lower(term))}(?:s|es)?(?=$|[^\\p{L}\\p{N}])`, 'u').test(lower(String(text)));
  for (const j of jargon) {
    if (!(j.line in idx)) { out.push({ line: j.line || '?', rule: 'jargon', hard: true, msg: `ste.jargon "${j.term}" names a line that does not exist` }); continue; }
    const first = lines.findIndex((l) => uses(l.text, j.term));
    if (first === -1) out.push({ line: j.line, rule: 'jargon', hard: true, msg: `"${j.term}" is never said`, fix: 'remove it from ste.jargon or say it' });
    else if (first < idx[j.line]) out.push({ line: lines[first].id, rule: 'jargon', hard: true, msg: `"${j.term}" is used before ${j.line}, the line that explains it`, fix: 'explain it earlier, or say it later' });
    else if (!uses(lines[idx[j.line]].text, j.term)) out.push({ line: j.line, rule: 'jargon', hard: true, msg: `"${j.term}" is not in ${j.line}, the line declared to introduce it` });
  }
  const per = {};
  for (const j of jargon) (per[j.line] ||= []).push(j.term);
  for (const [line, ts] of Object.entries(per)) if (ts.length > 1)
    out.push({ line, rule: 'jargon-density', hard, msg: `${ts.length} new terms in one line (${ts.join(', ')}); one at a time`, fix: 'give each term its own line' });
  return out;
}

/** Check a storyboard. Returns { findings: [{ line, rule, hard, msg, fix }], hard: n, soft: n }. */
export function checkStoryboard(sb, profile = PROFILE) {
  const ste = sb.ste || {}, jargon = ste.jargon || [], terms = ste.terms || [];
  // declared jargon counts as a technical name, so "caching" or "sharding" pass the -ing rule
  const names = [sb.name, ...(ste.names || []), ...jargon.map((j) => j.term)].filter(Boolean);
  const allowed = new Set((ste.allow || []).filter((a) => a.why).map((a) => `${a.line}:${a.rule}`));
  const findings = [];
  sb.lines.forEach((l, i) => {
    const free = (profile.freeLines.includes('first') && i === 0) || (profile.freeLines.includes('last') && i === sb.lines.length - 1);
    for (const f of checkLine(l.text, { names, terms, free, profile })) {
      if (allowed.has(`${l.id}:${f.rule}`)) continue;
      findings.push({ line: l.id, ...f });
    }
  });
  for (const f of checkJargon(sb.lines, jargon, { hard: formatOf(sb).termIntroHard })) if (!allowed.has(`${f.line}:${f.rule}`)) findings.push(f);
  return { findings, hard: findings.filter((f) => f.hard).length, soft: findings.filter((f) => !f.hard).length };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: ste.mjs <episodeDir> [--json]'); process.exit(2); }
  const sb = JSON.parse(fs.readFileSync(path.join(path.resolve(dir), 'storyboard.json'), 'utf8'));
  const r = checkStoryboard(sb);
  if (process.argv.includes('--json')) console.log(JSON.stringify(r, null, 1));
  else {
    for (const f of r.findings) console.log(`${f.hard ? 'FAIL' : 'warn'}  ${f.line}  ${f.rule}: ${f.msg}${f.fix ? `  -> ${f.fix}` : ''}`);
    const words = sb.lines.reduce((a, l) => a + l.text.split(/\s+/).length, 0);
    console.log(`STE: ${r.hard} hard, ${r.soft} soft finding(s) in ${sb.lines.length} lines (${words} words)`);
  }
  process.exit(r.hard ? 1 : 0);
}
