// The source gates: everything that can be decided from the post folder alone (no render, no manifest). `post.mjs qa`
// prints them; validate-post.mjs runs the same function again on its own copy of the project, so a producer's claim that
// the QA passed is never what the verdict rests on.
//
// A check that cannot run is reported as skipped and counts as a failure: this file never turns "did not run" into PASS.
import fs from 'node:fs';
import path from 'node:path';
import { BANNED_IDENTITY, HANDLE, UNOFFICIAL_LABEL } from './constants.mjs';
import { measureSlides, judgeAudit } from './audit.mjs';
import { printed } from './data.mjs';
import { registeredEpisode, reelTimeline, linesOnScreen } from './episode.mjs';
import { build } from './build.mjs';
import { checkFacts, known as knownNumber, numbersIn } from './facts.mjs';
import { sourceInfo } from './video.mjs';
import { PostError, files, readFacts, readPost, readSources } from './postdir.mjs';
import { checkPost } from './ste-post.mjs';

const list = (a, n = 4) => `${a.slice(0, n).join('; ')}${a.length > n ? `; and ${a.length - n} more` : ''}`;
export const CHECKS = ['post.structure', 'files.facts', 'files.sources', 'build.static', 'copy.ste', 'copy.examples', 'copy.facts', 'audit.load', 'copy.typed', 'copy.unused', 'copy.labels',
  'text.visible', 'text.size', 'text.margin', 'content.margin', 'cover.grid', 'assets.images', 'audit.root', 'brand.identity', 'brand.label', 'video.source'];
const AUDIT = ['audit.load', 'copy.typed', 'copy.unused', 'copy.labels', 'text.visible', 'text.size', 'text.margin', 'content.margin', 'cover.grid', 'assets.images', 'audit.root'];
const TITLES = {
  'post.structure': 'post.json is a well formed storyboard', 'files.facts': 'facts.json is well formed', 'files.sources': 'sources.json is well formed',
  'build.static': 'slide templates follow the static rules', 'copy.ste': 'STE: no hard finding in any printed string', 'copy.examples': 'x_ counter-examples are declared with a why and really break a rule',
  'copy.facts': 'every number printed on a slide is in facts.json', 'audit.load': 'every slide loads and binds its copy', 'copy.typed': 'no copy typed into slide HTML',
  'copy.unused': 'every printed data key is shown on its slide', 'copy.labels': 'every x_ counter-example is visibly labelled', 'text.visible': 'every printed string is visible',
  'text.size': 'text size: body 38 px, headings 72 px', 'text.margin': 'text stays inside the 70 px margin', 'content.margin': 'boxes and drawings stay inside the 70 px margin and the page does not overflow', 'cover.grid': 'slide 1 key text sits inside the central 3:4 area',
  'assets.images': 'images are local and load', 'audit.root': 'slide roots are 1080x1350', 'brand.identity': 'the only identity is hemanth_with_ai, on the last slide',
  'brand.label': 'an "unofficial guide" label appears', 'video.source': 'video excerpts: registered reel, inside its length, numbers and identity of what it shows',
};

/** Branding: only the handle, only on the last slide, no other identity or mention. Pure. */
export function checkBrand(post) {
  const strings = printed(post), last = post.slides.length - 1, problems = [];
  for (const p of strings) {
    for (const re of BANNED_IDENTITY) if (re.test(p.text)) problems.push(`${p.slide}.${p.key} contains ${re}`);
    for (const m of p.text.matchAll(/(^|[^\w])@([A-Za-z0-9_.]+)/g)) if (m[2] !== HANDLE) problems.push(`${p.slide}.${p.key} mentions @${m[2]}`);
  }
  const onLast = strings.filter((p) => p.idx === last && p.text.includes(HANDLE));
  if (!onLast.length) problems.push(`the last slide (${post.slides[last].id}) must print ${HANDLE}`);
  for (const p of strings) if (p.idx !== last && p.text.toLowerCase().includes(HANDLE)) problems.push(`${p.slide}.${p.key} prints the handle; it belongs on the last slide only`);
  return problems;
}

/**
 * Video slides: the reel is registered, the excerpt lies inside it, and what the excerpt shows is covered by the gates.
 * `episode` and `timeline` are injectable for tests.
 */
export function checkVideoSources(post, table, { episode = registeredEpisode, timeline = reelTimeline, info = sourceInfo } = {}) {
  const problems = [], last = post.slides.length - 1, shown = [];
  post.slides.forEach((s, i) => {
    if (s.kind !== 'video') return;
    const at = `slide ${s.id}`, { item, from, to } = s.source;
    let ep;
    try { ep = episode(item); } catch (e) { problems.push(`${at}: ${e.message}`); return; }
    if (!ep) { problems.push(`${at}: item ${item} has no registered 9x16 episode in the database`); return; }
    if (!fs.existsSync(ep.video_path)) { problems.push(`${at}: the registered video ${ep.video_path} does not exist`); return; }
    let dur;
    try { dur = info(ep.video_path).duration; } catch (e) { problems.push(`${at}: ${e.message}`); return; }
    if (to > dur + 0.05) { problems.push(`${at}: the excerpt ends at ${to} s, the reel is ${dur.toFixed(2)} s long`); return; }
    const tl = timeline(ep.video_path);
    if (!tl) { problems.push(`${at}: cannot tell what the excerpt shows: ${path.join(path.dirname(ep.video_path), 'project', 'data.js')} is missing (only a HyperFrames reel built with hf/bin/hf.mjs can be excerpted; run its build step)`); return; }
    for (const l of linesOnScreen(tl, from, to)) {
      const text = `${l.text} ${JSON.stringify(l.data || {}, (k, v) => (k.startsWith('_') ? undefined : v))}`;
      for (const re of BANNED_IDENTITY) if (re.test(text)) problems.push(`${at}: the excerpt shows line ${l.id}, which contains ${re}`);
      if (text.includes(HANDLE) && i !== last) problems.push(`${at}: the excerpt shows line ${l.id} with the handle ${HANDLE}; the handle belongs on the last slide only (end the excerpt before the reel's last scene)`);
      for (const n of new Set(numbersIn(text))) { shown.push(`${l.id}:${n}`); if (!knownNumber(table, n)) problems.push(`${at}: the excerpt shows number ${n} (line ${l.id}) and facts.json does not list it`); }
    }
  });
  return problems;
}

/**
 * Run the source gates. Returns { results: [{ id, ok, msg, detail, skipped? }], post }.
 * opts: projectDir (where to build; default out/project), measure / episode / timeline / info (injectable for tests).
 */
export function runQa(dirArg, opts = {}) {
  const results = [], dir = path.resolve(dirArg), F = files(dir);
  const add = (id, ok, msg = TITLES[id], detail = '') => results.push({ id, ok: !!ok, msg, detail });
  const skip = (id, why) => results.push({ id, ok: false, skipped: true, msg: TITLES[id], detail: `skipped: ${why}` });
  const skipFrom = (ids, why) => { for (const id of ids) if (!results.some((r) => r.id === id)) skip(id, why); };

  const rp = readPost(dir);
  add('post.structure', rp.problems.length === 0, TITLES['post.structure'], list(rp.problems, 6));
  if (!rp.post || rp.problems.length) { skipFrom(CHECKS, 'post.json is not valid'); return { results, post: rp.post }; }
  const post = rp.post;

  const f = readFacts(dir), s = readSources(dir);
  add('files.facts', f.problems.length === 0, TITLES['files.facts'], list(f.problems));
  add('files.sources', s.problems.length === 0, TITLES['files.sources'], list(s.problems));

  const ste = checkPost(post);
  const rule = ste.findings.filter((x) => x.kind === 'rule'), decl = ste.findings.filter((x) => x.kind === 'declaration');
  const fmt = (x) => `${x.slide}.${x.key} ${x.rule}: ${x.msg}`;
  add('copy.ste', rule.filter((x) => x.hard).length === 0, TITLES['copy.ste'], `${rule.filter((x) => x.hard).length} hard, ${rule.filter((x) => !x.hard).length} soft finding(s) in ${ste.strings.filter((x) => !x.exempt).length} string(s)${rule.some((x) => x.hard) ? `: ${list(rule.filter((x) => x.hard).map(fmt))}` : ''}`);
  add('copy.examples', decl.filter((x) => x.hard).length === 0, TITLES['copy.examples'], `${ste.exempt.length} counter-example(s) exempt${decl.some((x) => x.hard) ? `: ${list(decl.filter((x) => x.hard).map(fmt))}` : ''}`);
  const fc = checkFacts(post, f.known);
  add('copy.facts', fc.missing.length === 0 && !f.problems.length, TITLES['copy.facts'], fc.missing.length ? `not in facts.json: ${list(fc.missing.map((m) => `${m.slide}.${m.key}: ${m.n}`))}` : `${fc.checked} number(s) checked`);

  // build the project (static rules) and measure it
  let built = null;
  try { built = build(dir, opts.projectDir || F.project); add('build.static', true, TITLES['build.static'], `${built.slides.length} slide(s)`); }
  catch (e) { if (!(e instanceof PostError)) throw e; add('build.static', false, TITLES['build.static'], list(e.problems, 6)); }
  if (built) {
    try {
      const audit = judgeAudit(post, (opts.measure || measureSlides)(built.P, post));
      for (const a of audit) add(a.id, a.ok, a.msg, a.detail);
    } catch (e) { skipFrom(AUDIT, `the page audit could not run (${e.message})`); }
  } else skipFrom(AUDIT, 'the project did not build');

  const brand = checkBrand(post);
  add('brand.identity', brand.length === 0, TITLES['brand.identity'], list(brand));
  const labelled = printed(post).some((p) => UNOFFICIAL_LABEL.test(p.text));
  add('brand.label', labelled, TITLES['brand.label'], labelled ? '' : 'no printed string says "unofficial guide"');

  const vids = post.slides.filter((x) => x.kind === 'video');
  if (!vids.length) add('video.source', true, TITLES['video.source'], 'no video slide');
  else { const v = checkVideoSources(post, f.known, opts); add('video.source', v.length === 0, TITLES['video.source'], list(v)); }

  // stable order
  results.sort((a, b) => CHECKS.indexOf(a.id) - CHECKS.indexOf(b.id));
  return { results, post };
}

export function cliQa(dir) {
  const { results } = runQa(dir);
  let bad = 0;
  for (const r of results) { if (!r.ok) bad++; console.log(`${r.skipped ? 'SKIP' : r.ok ? 'PASS' : 'FAIL'}  ${r.id.padEnd(16)} ${r.msg}${r.detail ? `\n      ${r.detail}` : ''}`); }
  console.log(`qa: ${results.length - bad}/${results.length} passed`);
  return bad ? 1 : 0;
}
