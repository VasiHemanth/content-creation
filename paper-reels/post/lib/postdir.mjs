// Reading a post folder (paper-reels/posts/<slug>/) and checking its structure. Nothing here renders or measures:
// it answers "is post.json a well formed storyboard" with a list of plain-language problems, never a stack trace.
import fs from 'node:fs';
import path from 'node:path';
import { FORMAT, MAX_SLIDES, MAX_VIDEO_S, MIN_SLIDES, SLIDE_ID } from './constants.mjs';
import { describeData } from './data.mjs';

export class PostError extends Error {
  constructor(problems, where = 'post folder') {
    super(`${where}: ${problems.length} problem(s)\n  - ${problems.join('\n  - ')}`);
    this.problems = problems;
  }
}

export const files = (dir) => ({
  dir,
  post: path.join(dir, 'post.json'),
  slides: path.join(dir, 'slides'),
  assets: path.join(dir, 'slides', 'assets'),
  facts: path.join(dir, 'facts.json'),
  sources: path.join(dir, 'sources.json'),
  out: path.join(dir, 'out'),
  project: path.join(dir, 'out', 'project'),
  outSlides: path.join(dir, 'out', 'slides'),
  manifest: path.join(dir, 'out', 'manifest.json'),
  validation: path.join(dir, 'out', 'validation.json'),
  sheet: path.join(dir, 'out', 'sheet.png'),
  slideHtml: (id) => path.join(dir, 'slides', `${id}.html`),
  png: (id) => path.join(dir, 'out', 'slides', `${id}.png`),
  jpg: (id) => path.join(dir, 'out', `${id}.jpg`),
  mp4: (id) => path.join(dir, 'out', `${id}.mp4`),
});

export function readJson(file) {
  try { return { value: JSON.parse(fs.readFileSync(file, 'utf8')) }; }
  catch (e) { return { error: e.code === 'ENOENT' ? `${path.basename(file)} is missing` : `${path.basename(file)} is not valid JSON (${e.message})` }; }
}

const isStr = (v) => typeof v === 'string' && v.trim() !== '';
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** Read and check post.json. Returns { dir, post, problems, warnings }. `post` is null when the file cannot be read. */
export function readPost(dirArg) {
  const dir = path.resolve(dirArg);
  const F = files(dir), problems = [], warnings = [];
  if (!fs.existsSync(dir)) return { dir, post: null, problems: [`${dir} does not exist`], warnings };
  const r = readJson(F.post);
  if (r.error) return { dir, post: null, problems: [r.error], warnings };
  const post = r.value;
  if (!isObj(post)) return { dir, post: null, problems: ['post.json must be an object'], warnings };

  if (post.kind !== 'post') problems.push(`post.json: "kind" must be "post" (got ${JSON.stringify(post.kind)})`);
  if (post.format !== FORMAT) problems.push(`post.json: "format" must be "${FORMAT}" (got ${JSON.stringify(post.format)})`);
  if (!isStr(post.item)) problems.push('post.json: "item" must be the item id (the slug or arXiv id the post belongs to)');
  if (!isStr(post.name)) problems.push('post.json: "name" must be a short name for the post');
  if (!Array.isArray(post.slides)) { problems.push('post.json: "slides" must be an array'); return { dir, post, problems, warnings }; }
  if (post.slides.length < MIN_SLIDES || post.slides.length > MAX_SLIDES) problems.push(`post.json: ${post.slides.length} slide(s); a carousel has ${MIN_SLIDES} to ${MAX_SLIDES}`);

  const ids = new Set();
  post.slides.forEach((s, i) => {
    const at = `slide ${i + 1}${isObj(s) && s.id ? ` (${s.id})` : ''}`;
    if (!isObj(s)) { problems.push(`${at}: must be an object`); return; }
    if (typeof s.id !== 'string' || !SLIDE_ID.test(s.id)) problems.push(`${at}: "id" must match ${SLIDE_ID} (lower case letters, digits, "-" or "_", starting with a letter)`);
    else if (ids.has(s.id)) problems.push(`${at}: duplicate slide id "${s.id}"`);
    else ids.add(s.id);
    if (s.kind !== 'image' && s.kind !== 'video') problems.push(`${at}: "kind" must be "image" or "video"`);
    if (!isStr(s.alt)) problems.push(`${at}: "alt" must describe the slide in plain words (the caption carries the key text, so this is also the record of what the slide shows)`);
    if (s.data === undefined) problems.push(`${at}: "data" is missing (every word and number on the slide lives there)`);
    else problems.push(...describeData(s.data, s.id || at).problems);
    if (s.kind === 'image') {
      if (!fs.existsSync(F.slideHtml(s.id))) problems.push(`${at}: slides/${s.id}.html is missing (one bare <template> per image slide)`);
    }
    if (s.kind === 'video') {
      const src = s.source;
      if (!isObj(src) || !isStr(src.item) || typeof src.from !== 'number' || typeof src.to !== 'number') problems.push(`${at}: a video slide needs "source": { "item": "<item id>", "from": <seconds>, "to": <seconds> }`);
      else {
        if (!(src.from >= 0) || !(src.to > src.from)) problems.push(`${at}: source needs 0 <= from < to (got from ${src.from}, to ${src.to})`);
        else if (src.to - src.from > MAX_VIDEO_S + 1e-9) problems.push(`${at}: the excerpt is ${(src.to - src.from).toFixed(2)} s; the limit is ${MAX_VIDEO_S} s`);
      }
    }
  });
  if (post.slides[0] && post.slides[0].kind === 'video') problems.push('slide 1 must be an image: it is the cover, and the platform crops every other item to its ratio');

  // ste block: shape only. What each entry means is decided in ste-post.mjs.
  const ste = post.ste;
  if (ste !== undefined) {
    if (!isObj(ste)) problems.push('post.json: "ste" must be an object');
    else {
      if (ste.names !== undefined && !(Array.isArray(ste.names) && ste.names.every(isStr))) problems.push('ste.names must be an array of strings');
      if (ste.terms !== undefined && !(Array.isArray(ste.terms) && ste.terms.every((t) => isObj(t) && isStr(t.term) && (t.avoid === undefined || (Array.isArray(t.avoid) && t.avoid.every(isStr)))))) problems.push('ste.terms must be an array of { "term": "...", "avoid": ["..."] }');
      for (const k of ['allow', 'examples']) if (ste[k] !== undefined && !(Array.isArray(ste[k]) && ste[k].every(isObj))) problems.push(`ste.${k} must be an array of objects`);
    }
  }

  // slide files nobody uses
  if (fs.existsSync(F.slides)) {
    const used = new Set(post.slides.filter(isObj).map((s) => `${s.id}.html`));
    for (const f of fs.readdirSync(F.slides)) if (f.endsWith('.html') && !used.has(f)) warnings.push(`slides/${f} is not used by any slide in post.json`);
  }
  return { dir, post, problems, warnings };
}

/** Same as readPost, but throws a PostError listing every problem. */
export function loadPost(dirArg) {
  const r = readPost(dirArg);
  if (r.problems.length) throw new PostError(r.problems, `${r.dir}/post.json`);
  return r;
}

/** facts.json: { numbers: { "74": "where it comes from" }, evidence_incidental?: { ... } }. */
export function readFacts(dir) {
  const r = readJson(files(dir).facts);
  if (r.error) return { facts: null, known: {}, problems: [r.error] };
  const f = r.value, problems = [];
  if (!isObj(f)) return { facts: null, known: {}, problems: ['facts.json must be an object'] };
  if (!isObj(f.numbers)) problems.push('facts.json: "numbers" must be an object { "<number as printed>": "source or how it was computed" } (an empty object when the post prints no number)');
  const known = { ...(isObj(f.numbers) ? f.numbers : {}), ...(isObj(f.evidence_incidental) ? f.evidence_incidental : {}) };
  for (const [n, why] of Object.entries(known)) if (!isStr(why)) problems.push(`facts.json: number "${n}" has no source or computation (give a non-empty string)`);
  return { facts: f, known, problems };
}

/** sources.json: an array, or { sources: [...] }. Each entry { url, supports, accessed: "YYYY-MM-DD" }. */
export function readSources(dir) {
  const r = readJson(files(dir).sources);
  if (r.error) return { sources: [], problems: [r.error] };
  const list = Array.isArray(r.value) ? r.value : (isObj(r.value) && Array.isArray(r.value.sources) ? r.value.sources : null);
  if (!list) return { sources: [], problems: ['sources.json must be an array of sources (or { "sources": [...] })'] };
  const problems = [];
  list.forEach((s, i) => {
    const at = `sources.json entry ${i + 1}`;
    if (!isObj(s)) { problems.push(`${at}: must be an object`); return; }
    if (!isStr(s.url) || !/^https?:\/\/[^\s]+$/.test(s.url)) problems.push(`${at}: "url" must be an http(s) link`);
    if (!isStr(s.supports)) problems.push(`${at}: "supports" must say what the source backs`);
    const date = s.accessed ?? s.access_date;
    if (!isStr(date) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) problems.push(`${at}: "accessed" must be the access date, YYYY-MM-DD`);
  });
  return { sources: list, problems };
}
