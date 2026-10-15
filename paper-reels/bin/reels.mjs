#!/usr/bin/env node
// usage: node bin/reels.mjs <command>
//   add <arxiv url|id> [--name N] [--topic slug] [--one-liner "..."] [--thumb-name N] [--thumb-hook "line1\nline2"]
//   add-topic <slug> --title "..." --url <https url> [--topic slug] [--name N] [--one-liner "..."] [--tags a,b] [--thumb-name N] [--thumb-hook "..."]
//                              creates (or updates) a kind=topic item with no arXiv fetch; the slug is kebab-case
//   set <id> --name|--topic|--one-liner|--thumb-name|--thumb-hook|--tags a,b  <value>   (any of these flags)
//   text <id> <youtube|instagram|threads|instagram_post|threads_post> --body "..." [--title "..."]      adds a new revision
//                              youtube, instagram, threads are the reel's text; instagram_post, threads_post are the post's (separate revisions)
//   episode <id> <9x16|16x9> <video file>
//   thumb <id>                 render episodes/<id>/out/thumb.png from the item's thumb_name / thumb_hook
//   approve <id> [--post] --platforms <list> --quote "<the human's words>"
//                              records the human's yes for the files as they are now (approval.json beside validation.json; with --post,
//                              <postDir>/out/approval.json). Only the session that talks to the human runs this. Refuses unless validation passed.
//   publish <id> [--platforms youtube,instagram,threads] [--privacy public|unlisted|private] [--force] [--dry-run]
//                              refuses unless validation.json says PASS for the files and approval.json covers the same files and platforms.
//                              --dry-run lists every refusal and uploads nothing.
//   notion-sync [--dry-run]    add every published paper missing from the public Notion vault page (publish does this itself)
//   show <id> | status | backup [dir]       show also prints the registered post (slides and hashes)
//   mark-deleted <id> <platform>   mark SUCCESS posts DELETED after taking them down (a later publish then reposts); platform may be instagram_post
// Posts (Instagram carousels from paper-reels/post, spec in paper-reels/post/SPEC.md):
//   post register <id> <postDir>   read <postDir>/out/manifest.json, check every file hash and the manifest hash, write post_assets and post_sets
//   publish-post <id> [--platforms instagram_post] [--dry-run] [--force]
//                              the only way to post a carousel; there is no bypass flag. Refuses unless REELS_NO_PUBLISH is unset, out/validation.json
//                              says PASS for exactly the registered files, out/approval.json covers those files, post text exists, and no SUCCESS
//                              post exists (--force skips only that one).
//                              --dry-run is local: it lists every refusal, then runs uploader/post.js --dry-run (checks and the API calls it would make).
// Unattended mode (see PIPELINE.md):
//   queue add <url> | queue list | queue next | queue done <qid> | queue fail <qid> [--error "..."] | queue retry <qid>
//   settings [get [key]] | settings set <key> <value>
//   review <id> --kind critic|validator|facts --verdict PASS|FAIL [--score N] [--notes "..."] [--post]
//                              --post attaches the verdict to the registered post (its manifest hash) instead of the reel's video
//   autopublish <id> [--dry-run]   publish only if every autopublish condition holds, else mark the queue row needs_review
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { open, ROOT as CC, DB_PATH, snapshot, getSetting, setSetting, claimNext, SETTINGS_DEFAULTS, REEL_PLATFORMS, POST_PLATFORMS } from '../../lib/db.mjs';
import { wikilog } from '../../lib/wikilog.mjs';
import { notify } from '../../lib/notify.mjs';
import { fetchPaper, parseId } from '../src/arxiv.mjs';
// Episode folders are named after the paper (camelCase) or the arXiv id; storyboard.json's "item" is the key.
function epDir(id) {
  const root = path.join(PROJECT, 'episodes');
  // scratch folders (leading "_") may reuse a real item id; check them last so they never shadow the real episode
  const dirs = fs.readdirSync(root).sort((a, b) => (a.startsWith('_') - b.startsWith('_')) || a.localeCompare(b));
  for (const d of dirs) {
    const f = path.join(root, d, 'storyboard.json');
    if (fs.existsSync(f) && JSON.parse(fs.readFileSync(f, 'utf8')).item === id) return path.join(root, d);
  }
  return path.join(root, id);
}

const PROJECT = path.join(CC, 'paper-reels');
const [cmd, ...rest] = process.argv.slice(2);
const VALUE_FLAGS = ['--name', '--topic', '--one-liner', '--thumb-name', '--thumb-hook', '--tags', '--body', '--title', '--platforms', '--privacy',
  '--error', '--kind', '--verdict', '--score', '--notes', '--url', '--quote'];
const opt = (f) => { const i = rest.indexOf(f); return i === -1 ? null : rest[i + 1]; };
const flag = (f) => rest.includes(f);
const pos = rest.filter((a, i) => !a.startsWith('--') && !VALUE_FLAGS.includes(rest[i - 1]));
const unescape = (s) => (s == null ? s : s.replace(/\\n/g, '\n'));
const db = open();
const item = (id) => { const r = db.prepare('SELECT * FROM items WHERE id = ?').get(id); if (!r) throw new Error(`Unknown item ${id}. Run add (a paper) or add-topic first.`); return r; };

const COLS = { '--name': 'short_name', '--topic': 'topic', '--one-liner': 'one_liner', '--thumb-name': 'thumb_name', '--thumb-hook': 'thumb_hook' };
function applyFlags(id) {
  for (const [f, col] of Object.entries(COLS)) if (opt(f) != null) db.prepare(`UPDATE items SET ${col} = ? WHERE id = ?`).run(unescape(opt(f)), id);
  if (opt('--tags') != null) db.prepare('UPDATE items SET tags = ? WHERE id = ?').run(JSON.stringify(opt('--tags').split(',').map((s) => s.trim()).filter(Boolean)), id);
}

const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const episode = (id) => db.prepare("SELECT * FROM episodes WHERE item_id = ? AND format = '9x16'").get(id);
// publish and autopublish upload the reel. The post keys (instagram_post, threads_post) share post_texts and posts with it, so refuse them here.
const reelPlatformProblem = (platforms) => {
  const wrong = platforms.filter((p) => !REEL_PLATFORMS.includes(p));
  return wrong.length ? `${wrong.join(',')}: not a reel platform (${REEL_PLATFORMS.join(', ')}).${wrong.some((p) => POST_PLATFORMS.includes(p)) ? ' A post goes through: publish-post <id>' : ''}` : null;
};

// The publish gate, shared by publish and autopublish: the exact bytes that bin/validate.mjs passed. Returns null or the reason.
function validationProblem(id, ep) {
  if (!ep) return 'No 9x16 episode registered';
  const vr = path.join(path.dirname(ep.video_path), 'validation.json');
  if (!fs.existsSync(vr)) return `Not validated. Run: node bin/validate.mjs ${id}`;
  const rep = JSON.parse(fs.readFileSync(vr, 'utf8'));
  if (rep.verdict !== 'PASS') return `Validation verdict is ${rep.verdict}. Fix and re-run: node bin/validate.mjs ${id}`;
  if (!fs.existsSync(ep.video_path) || rep.video !== ep.video_path || rep.video_sha256 !== sha(ep.video_path) || !ep.thumb_path || !fs.existsSync(ep.thumb_path) || rep.thumb_sha256 !== sha(ep.thumb_path))
    return `The video or thumbnail changed since validation. Re-run: node bin/validate.mjs ${id}`;
  return null;
}

// The human's approval, as recorded by 'reels approve' in the session that talks to the human. A spawned publisher never sees that chat, so
// it checks this file instead. The record holds the hashes of the files the human saw; it goes stale when any of them changes.
// want: { video_sha256, thumb_sha256 } for a reel, { manifest_sha256 } for a post. Returns null or the reason.
function approvalProblem(file, id, want, platforms, fix) {
  if (!fs.existsSync(file)) return `No recorded approval. After the human says yes in chat, the orchestrator runs: ${fix}`;
  let a;
  try { a = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { return `${path.basename(file)} is not valid JSON (${e.message}). ${fix}`; }
  if (a.item !== id) return `${path.basename(file)} is for item ${a.item ?? '(none)'}, not ${id}`;
  if (!String(a.quote || '').trim()) return `${path.basename(file)} has no quote of the human's words. ${fix}`;
  for (const [k, v] of Object.entries(want)) if (!v || a[k] !== v) return `The files changed since the human approved them (${k}). Show the human the new files, then: ${fix}`;
  const missing = platforms.filter((p) => !(a.platforms || []).includes(p));
  if (missing.length) return `The approval covers ${(a.platforms || []).join(',') || 'no platform'}, not ${missing.join(',')}. ${fix}`;
  return null;
}
const reelApprovalFile = (ep) => path.join(path.dirname(ep.video_path), 'approval.json');
const approveFix = (id, platforms, post = false) => `node paper-reels/bin/reels.mjs approve ${id}${post ? ' --post' : ''} --platforms ${platforms.join(',')} --quote "<the human's words>"`;

// Every condition 'reels publish' needs (autopublish has its own list and needs no approval). Returns the failed conditions.
function reelPublishDecision(id, platforms) {
  const fails = [];
  if (noPublish()) fails.push(`REELS_NO_PUBLISH=${process.env.REELS_NO_PUBLISH} is set: this process may not publish (unattended producer run)`);
  if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(id)) return [...fails, `unknown item ${id}`];
  const ep = episode(id);
  const gate = validationProblem(id, ep);
  if (gate) fails.push(`validation gate: ${gate}`);
  if (ep && !gate) {
    const ap = approvalProblem(reelApprovalFile(ep), id, { video_sha256: sha(ep.video_path), thumb_sha256: sha(ep.thumb_path) }, platforms, approveFix(id, platforms));
    if (ap) fails.push(`approval gate: ${ap}`);
  }
  for (const p of platforms) if (!db.prepare('SELECT 1 FROM latest_post_text WHERE item_id = ? AND platform = ?').get(id, p)) fails.push(`no post text for ${p}`);
  return fails;
}

// The one upload path. publish and autopublish both call this; nothing else spawns upload.js.
function publishItem(id, { platforms, privacy = null, force = false }) {
  // pipeline.mjs sets this on the headless claude run so the agents cannot post; the runner decides via autopublish afterwards.
  if (process.env.REELS_NO_PUBLISH === '1') throw new Error('Publishing is disabled in this process (REELS_NO_PUBLISH=1, unattended producer run). The runner calls autopublish afterwards.');
  const wrong = reelPlatformProblem(platforms); if (wrong) throw new Error(wrong);
  const it = item(id); const ep = episode(id);
  const problem = validationProblem(id, ep);   // no bypass flag on purpose
  if (problem) throw new Error(problem);
  const t = Object.fromEntries(db.prepare('SELECT * FROM latest_post_text WHERE item_id = ?').all(id).map((r) => [r.platform, r]));
  for (const p of platforms) if (!t[p]) throw new Error(`No post text for ${p}. Run text first.`);
  const before = db.prepare('SELECT COALESCE(MAX(id), 0) m FROM posts').get().m;
  // Text goes as argv (no shell, no temp JSON), so multi-line captions are safe.
  const args = ['upload.js', '--video', ep.video_path, '--label', id, '--tags', JSON.parse(it.tags || '[]').join(',')];
  if (t.youtube) args.push('--title', t.youtube.title, '--description', t.youtube.body);
  if (t.instagram) args.push('--caption', t.instagram.body);
  if (t.threads) args.push('--threads-text', t.threads.body);
  if (ep.thumb_path && fs.existsSync(ep.thumb_path)) args.push('--thumbnail', ep.thumb_path); else console.warn('no thumbnail registered, posting without one');
  args.push('--platforms', platforms.join(','));
  if (privacy) args.push('--privacy', privacy);
  if (force) args.push('--force');
  const r = spawnSync('node', args, { cwd: path.join(CC, 'uploader'), stdio: 'inherit', env: { ...process.env, TRACKER_DB: DB_PATH } });
  // Only this reel's rows: an item can also have instagram_post rows (see publish-post), and they must not be touched or counted here.
  const reel = `label = ? AND platform IN (${REEL_PLATFORMS.map(() => '?').join(',')})`;
  for (const row of db.prepare(`SELECT id, platform FROM posts WHERE id > ? AND status = 'SUCCESS' AND label = ? AND platform IN (${platforms.map(() => '?').join(',')})`).all(before, id, ...platforms))
    db.prepare('UPDATE posts SET text_revision = ? WHERE id = ?').run(t[row.platform].revision, row.id);
  const ok = db.prepare(`SELECT COUNT(DISTINCT platform) n FROM posts WHERE status = 'SUCCESS' AND ${reel}`).get(id, ...REEL_PLATFORMS).n;
  if (ok) db.prepare("UPDATE items SET status = 'published' WHERE id = ?").run(id);
  const live = db.prepare(`SELECT platform, url FROM posts WHERE id > ? AND status = 'SUCCESS' AND ${reel}`).all(before, id, ...REEL_PLATFORMS);
  if (live.length) wikilog('publish', id, live.map((l) => `- ${l.platform}`).join('\n'));
  if (live.some((l) => l.platform === 'instagram') && it.kind === 'paper') addToNotionVault(id);
  return { status: r.status, live };
}

// List the paper on the public Notion vault page. A failure here must never undo or hide a publish, so it only notifies.
// Retry later with: node bin/reels.mjs notion-sync
function addToNotionVault(id) {
  if (process.env.NOTION_VAULT === '0') return;
  const r = spawnSync('node', [path.join(CC, 'lib', 'notion-vault.mjs'), 'add', id], { encoding: 'utf8', env: process.env });
  const msg = `${r.stdout || ''}${r.stderr || ''}`.trim();
  console.log(r.status === 0 ? `notion vault: ${msg}` : `notion vault FAILED: ${msg}`);
  if (r.status !== 0) notify('Notion vault not updated', `${id}: ${msg.slice(0, 200)}. Retry: node paper-reels/bin/reels.mjs notion-sync`, 'warn');
}

// Every condition autopublish needs. Returns the list of failed conditions (empty = may publish).
function autopublishDecision(id) {
  const fails = [];
  if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(id)) return { fails: [`unknown item ${id}`], platforms: [] };
  const mode = getSetting(db, 'autopublish');
  if (mode !== 'on') fails.push(`setting autopublish is '${mode}', not 'on'`);
  const ep = episode(id);
  const gate = validationProblem(id, ep);
  if (gate) fails.push(`validation gate: ${gate}`);
  const cur = ep && fs.existsSync(ep.video_path) ? sha(ep.video_path) : null;
  const min = Number(getSetting(db, 'min_critic_score'));
  const latest = (kind) => db.prepare('SELECT * FROM reviews WHERE item_id = ? AND kind = ? ORDER BY id DESC LIMIT 1').get(id, kind);
  for (const kind of ['critic', 'facts']) {
    const r = latest(kind);
    if (!r) { fails.push(`no ${kind} review recorded`); continue; }
    if (r.verdict !== 'PASS') fails.push(`latest ${kind} review #${r.id} is ${r.verdict}`);
    if (kind === 'critic' && (r.score == null || !(r.score >= min))) fails.push(`critic score ${r.score ?? 'missing'} is below min_critic_score ${min}`);
    if (!cur || r.video_sha256 !== cur) fails.push(`${kind} review #${r.id} judged video ${String(r.video_sha256).slice(0, 12)}, current file is ${cur ? cur.slice(0, 12) : 'missing'}`);
  }
  const platforms = getSetting(db, 'publish_platforms').split(',').map((x) => x.trim()).filter(Boolean);
  if (!platforms.length) fails.push('publish_platforms is empty');
  for (const p of platforms) {
    if (!db.prepare('SELECT 1 FROM latest_post_text WHERE item_id = ? AND platform = ?').get(id, p)) fails.push(`no post text for ${p}`);
    const done = db.prepare("SELECT id FROM posts WHERE label = ? AND platform = ? AND status = 'SUCCESS' LIMIT 1").get(id, p);
    if (done) fails.push(`already posted to ${p} (posts #${done.id}); mark it DELETED first to repost`);
  }
  return { fails, platforms, sha: cur };
}

// ---- Posts: Instagram carousels made by paper-reels/post (spec: paper-reels/post/SPEC.md). The rows are post_assets and post_sets, the files
// are <post_sets.dir>/<post_assets.path>. The uploader's carousel module reads and hashes a post, so this gate and uploader/post.js agree.
const carousel = createRequire(import.meta.url)('../../uploader/src/carousel.js');
const POST_FORMAT = '4x5', POST_PLATFORM = 'instagram_post';   // threads_post is reserved for later
const postSet = (id) => db.prepare('SELECT * FROM post_sets WHERE item_id = ? AND format = ?').get(id, POST_FORMAT);
// pipeline.mjs sets REELS_NO_PUBLISH=1 on the unattended producer run. Here any value except empty or 0 counts.
const noPublish = () => !!process.env.REELS_NO_PUBLISH && !['', '0'].includes(process.env.REELS_NO_PUBLISH);

// The registered post as it is on disk now: { set, rows, hash, problems }. problems is empty only when the database rows, the files and
// out/manifest.json agree. hash is the manifest hash recomputed from the bytes of the files.
function postFiles(id) {
  const set = postSet(id);
  if (!set) return { set: null, rows: [], hash: null, problems: [`No post registered. Run: node paper-reels/bin/reels.mjs post register ${id} <postDir>`] };
  const rows = db.prepare('SELECT idx, kind, path, alt, sha256, duration_s FROM post_assets WHERE item_id = ? AND format = ? ORDER BY idx').all(id, POST_FORMAT);
  const v = carousel.verifyFiles({ postDir: set.dir, slides: rows.map((r) => ({ ...r, abs: path.join(set.dir, r.path) })), manifest: { manifest_sha256: set.manifest_sha256 } }, 'the registered post');
  const problems = [...v.problems];
  if (rows.length !== set.slide_count || rows.some((r, i) => r.idx !== i)) problems.push(`the database holds ${rows.length} slide rows, post_sets says ${set.slide_count}`);
  try {   // post.js uploads what out/manifest.json lists, so that file must still be the registered post
    const disk = carousel.readManifest(path.join(set.dir, 'out', 'manifest.json'));
    if (disk.manifest.manifest_sha256 !== set.manifest_sha256 || disk.slides.length !== rows.length || disk.slides.some((s, i) => s.kind !== rows[i].kind || s.path !== rows[i].path || s.sha256 !== rows[i].sha256))
      problems.push('out/manifest.json is not the registered post any more (rendered again since). Run: post register');
  } catch (e) { problems.push(e.message); }
  return { set, rows, hash: v.filesHash, problems };
}

// Every condition publish-post needs. Returns { fails, platforms, set, hash }; fails is empty when it may publish. There is no flag that skips one,
// except --force, which skips only the SUCCESS-post condition.
function postPublishDecision(id, platforms, { force = false } = {}) {
  const fails = [];
  if (noPublish()) fails.push(`REELS_NO_PUBLISH=${process.env.REELS_NO_PUBLISH} is set: this process may not publish (unattended producer run)`);
  if (!db.prepare('SELECT 1 FROM items WHERE id = ?').get(id)) return { fails: [...fails, `unknown item ${id}`], platforms };
  if (!platforms.length) fails.push('no platform given');
  for (const p of platforms) {
    if (p === 'threads_post') fails.push('threads_post is reserved: Threads posting is not in v1');
    else if (p !== POST_PLATFORM) fails.push(`${p}: not a post platform (a post uses ${POST_PLATFORM}; reels use publish)`);
  }
  const st = postFiles(id);
  fails.push(...st.problems);
  if (st.set) {
    const gate = carousel.validationProblem(st.set.dir, st.hash, id);
    if (gate) fails.push(`validation gate: ${gate}`);
    else {
      const ap = approvalProblem(path.join(st.set.dir, 'out', 'approval.json'), id, { manifest_sha256: st.hash }, platforms, approveFix(id, platforms, true));
      if (ap) fails.push(`approval gate: ${ap}`);
    }
  }
  for (const p of platforms.filter((x) => x === POST_PLATFORM)) {
    const t = db.prepare('SELECT * FROM latest_post_text WHERE item_id = ? AND platform = ?').get(id, p);
    if (!t || !String(t.body).trim()) fails.push(`no post text for ${p}. Run: node paper-reels/bin/reels.mjs text ${id} ${p} --body "..."`);
    const done = db.prepare("SELECT id FROM posts WHERE label = ? AND platform = ? AND status = 'SUCCESS' LIMIT 1").get(id, p);
    if (done && !force) fails.push(`already posted to ${p} (posts #${done.id}); mark it DELETED first (mark-deleted ${id} ${p}) to post again, or pass --force`);
  }
  return { fails, platforms, set: st.set, hash: st.hash };
}

// The one post upload path (publish-post only). Runs uploader/post.js with the caption as argv (no shell, no temp file); post.js repeats the file
// checks before it hosts anything and again hashes each file just before it uploads it. A dry run stops after post.js --dry-run.
function publishPost(id, d, { dry = false, force = false } = {}) {
  const platforms = d.platforms;
  const t = Object.fromEntries(platforms.map((p) => [p, db.prepare('SELECT * FROM latest_post_text WHERE item_id = ? AND platform = ?').get(id, p)]));
  const args = ['post.js', '--manifest', path.join(d.set.dir, 'out', 'manifest.json'), '--label', id, '--caption', t[POST_PLATFORM].body,
    '--platforms', platforms.join(','), '--manifest-sha256', d.hash];
  if (dry) args.push('--dry-run');
  if (force) args.push('--force');
  const run = () => spawnSync('node', args, { cwd: path.join(CC, 'uploader'), stdio: 'inherit', env: { ...process.env, TRACKER_DB: DB_PATH } });
  if (dry) {
    const rev = (kind) => { const r = db.prepare('SELECT id, verdict, score FROM reviews WHERE item_id = ? AND kind = ? AND video_sha256 = ? ORDER BY id DESC LIMIT 1').get(id, kind, d.hash); return `${kind} ${r ? `${r.verdict}${r.score != null ? ` ${r.score}` : ''} (#${r.id})` : 'none'}`; };
    console.log(`DRY RUN publish-post ${id}: every gate holds, would post to ${platforms.join(',')} with text revision ${t[POST_PLATFORM].revision}`);
    console.log(`  reviews of this manifest (information, not a gate): ${['validator', 'facts', 'critic'].map(rev).join(', ')}`);
    return { status: run().status };
  }
  const before = db.prepare('SELECT COALESCE(MAX(id), 0) m FROM posts').get().m;
  const r = run();
  const mine = `id > ? AND status = 'SUCCESS' AND label = ? AND platform IN (${platforms.map(() => '?').join(',')})`;
  for (const row of db.prepare(`SELECT id, platform FROM posts WHERE ${mine}`).all(before, id, ...platforms))
    db.prepare('UPDATE posts SET text_revision = ? WHERE id = ?').run(t[row.platform].revision, row.id);
  const live = db.prepare(`SELECT platform, url FROM posts WHERE ${mine}`).all(before, id, ...platforms);
  if (live.length) {
    db.prepare("UPDATE items SET status = 'published' WHERE id = ?").run(id);   // 'published' means something is live, reel or post
    wikilog('publish', id, live.map((l) => `- ${l.platform}`).join('\n'));
  }
  return { status: r.status, live };
}

// Queue row for an item: the newest one that is not finished.
function setQueueForItem(id, status, error = null) {
  const q = db.prepare("SELECT id FROM queue WHERE item_id = ? ORDER BY (status = 'done'), id DESC LIMIT 1").get(id);
  if (q) db.prepare('UPDATE queue SET status = ?, error = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, error, q.id);
  return q && q.id;
}

const SETTING_CHECK = {
  autopublish: (v) => ['on', 'off'].includes(v) || 'must be on or off',
  min_critic_score: (v) => (v !== '' && Number.isFinite(+v)) || 'must be a number',
  max_attempts: (v) => (/^\d+$/.test(v) && +v >= 1) || 'must be a whole number >= 1',
  publish_platforms: (v) => v.split(',').every((p) => ['youtube', 'instagram', 'threads'].includes(p.trim())) || 'comma list of youtube, instagram, threads',
};

if (cmd === 'add') {
  const id = parseId(pos[0]);
  const p = await fetchPaper(id);
  db.prepare("INSERT INTO items (id, kind, title, source_url) VALUES (?, 'paper', ?, ?) ON CONFLICT(id) DO UPDATE SET title = excluded.title").run(id, p.title, p.url);
  db.prepare(`INSERT INTO paper_meta (item_id, authors, abstract, primary_cat, published, arxiv_version) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(item_id) DO UPDATE SET authors = excluded.authors, abstract = excluded.abstract, arxiv_version = COALESCE(excluded.arxiv_version, arxiv_version)`)
    .run(id, JSON.stringify(p.authors), p.abstract, p.primary_cat, p.published, p.version);
  applyFlags(id);
  wikilog('add', `${id} ${p.title}`, 'Database item created. Dossier still to write: wiki/papers/' + id + '.md');
  console.log(`added ${id}: ${p.title} (${p.version || 'version unknown'}). Next: raw source record and wiki/papers/${id}.md`);
} else if (cmd === 'add-topic') {
  const id = pos[0], title = unescape(opt('--title')), url = opt('--url');
  if (!id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) throw new Error('usage: add-topic <slug> --title "..." --url <https url> [--topic slug] [--name N] ...   (the slug is kebab-case: a-z, 0-9 and single hyphens)');
  if (!title) throw new Error('--title required');
  if (!url || !/^https?:\/\/\S+$/.test(url)) throw new Error('--url required (an http or https link to the source)');
  if (opt('--topic') != null && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(opt('--topic'))) throw new Error('--topic must be a kebab-case slug, as in llm-wiki/wiki/topics/<topic>.md');
  const old = db.prepare('SELECT kind FROM items WHERE id = ?').get(id);
  if (old && old.kind !== 'topic') throw new Error(`${id} already exists as a ${old.kind}; add-topic only creates or updates topics`);
  db.prepare("INSERT INTO items (id, kind, title, source_url) VALUES (?, 'topic', ?, ?) ON CONFLICT(id) DO UPDATE SET title = excluded.title, source_url = excluded.source_url").run(id, title, url);
  applyFlags(id);
  if (!old) wikilog('add', `${id} ${title}`, 'Database item created (kind topic). Source records and the wiki page are still to write.');
  console.log(`${old ? 'updated' : 'added'} topic ${id}: ${title}`);
} else if (cmd === 'set') {
  const id = pos[0]; item(id); applyFlags(id); console.log('updated', id);
} else if (cmd === 'text') {
  const [id, platform] = pos; item(id);
  const known = [...REEL_PLATFORMS, ...POST_PLATFORMS];
  if (!known.includes(platform)) throw new Error(`platform must be one of ${known.join(', ')}`);
  if (opt('--body') == null) throw new Error('--body required');
  const rev = db.prepare('SELECT COALESCE(MAX(revision), 0) + 1 AS r FROM post_texts WHERE item_id = ? AND platform = ?').get(id, platform).r;
  db.prepare('INSERT INTO post_texts (item_id, platform, revision, title, body) VALUES (?, ?, ?, ?, ?)').run(id, platform, rev, unescape(opt('--title')), unescape(opt('--body')));
  db.prepare("UPDATE items SET status = CASE WHEN status = 'queued' THEN 'scripted' ELSE status END WHERE id = ?").run(id);
  console.log(`${id} ${platform} text saved as revision ${rev}`);
  if (platform === POST_PLATFORM)   // saved anyway (text is append-only); say so now, publish-post would refuse it later
    for (const c of carousel.checkCaption(unescape(opt('--body')))) if (c.level === 'fail') console.warn(`warning: ${c.msg} (${c.detail || 'failed'}). Add a corrected revision before publishing.`);
} else if (cmd === 'episode') {
  const [id, format, file] = pos; item(id);
  const f = path.resolve(file);
  const dur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString();
  db.prepare('INSERT INTO episodes (item_id, format, video_path, duration_s) VALUES (?, ?, ?, ?) ON CONFLICT(item_id, format) DO UPDATE SET video_path=excluded.video_path, duration_s=excluded.duration_s, rendered_at=CURRENT_TIMESTAMP').run(id, format, f, dur);
  db.prepare("UPDATE items SET status = CASE WHEN status IN ('queued','scripted') THEN 'rendered' ELSE status END WHERE id = ?").run(id);
  wikilog('render', `${id} ${format}`, `${dur.toFixed(1)}s, ${f}`);
  console.log(`episode ${id} ${format} registered (${dur.toFixed(1)}s)`);
} else if (cmd === 'thumb') {
  const id = pos[0]; const it = item(id);
  if (!it.thumb_name || !it.thumb_hook) throw new Error('Set --thumb-name and --thumb-hook first (reels.mjs set)');
  const outPath = path.join(epDir(id), 'out', 'thumb.png'), epThumb = path.join(epDir(id), 'thumbnail.mjs');
  let out;
  if (fs.existsSync(epThumb)) out = await (await import(pathToFileURL(epThumb).href)).default(outPath, { item: it });   // episode's own thumbnail (validate.mjs uses the same one)
  else { const { renderThumbnail } = await import('../engine/thumbnail.mjs'); out = renderThumbnail({ name: it.thumb_name, hook: it.thumb_hook, arxivId: id }, outPath); }   // lazy: only this command needs the engine
  db.prepare("UPDATE episodes SET thumb_path = ? WHERE item_id = ? AND format = '9x16'").run(out, id);
  console.log('thumbnail', out);
} else if (cmd === 'publish') {
  const id = pos[0];
  const platforms = (opt('--platforms') || 'youtube,instagram,threads').split(',');
  const wrong = reelPlatformProblem(platforms); if (wrong) throw new Error(wrong);
  const dry = flag('--dry-run');
  const fails = reelPublishDecision(id, platforms);   // no bypass flag on purpose
  if (fails.length) {
    console.log(`${dry ? 'DRY RUN ' : ''}publish ${id}: ${dry ? 'REFUSE' : 'REFUSED'}`);
    for (const f of fails) console.log(`  - ${f}`);
    process.exit(3);
  }
  if (dry) { console.log(`DRY RUN publish ${id}: every gate holds, would post to ${platforms.join(',')}`); process.exit(0); }
  const r = publishItem(id, { platforms, privacy: opt('--privacy'), force: flag('--force') });
  process.exit(r.status || 0);
} else if (cmd === 'approve') {
  const id = pos[0], quote = unescape(opt('--quote')), post = flag('--post');
  const platforms = [...new Set((opt('--platforms') || '').split(',').map((p) => p.trim()).filter(Boolean))];
  if (!id || !platforms.length || !String(quote || '').trim()) throw new Error('usage: approve <id> [--post] --platforms <list> --quote "<the human\'s words>"');
  if (noPublish()) throw new Error('approve cannot run in an unattended producer run (REELS_NO_PUBLISH is set): only the human can approve');
  item(id);
  let file, hashes;
  if (post) {
    const bad = platforms.filter((p) => p !== POST_PLATFORM); if (bad.length) throw new Error(`${bad.join(',')}: a post approval takes only ${POST_PLATFORM}`);
    const st = postFiles(id);
    if (st.problems.length) throw new Error(`${id}: the registered post does not match its files:\n  - ${st.problems.join('\n  - ')}`);
    const gate = carousel.validationProblem(st.set.dir, st.hash, id); if (gate) throw new Error(`${id}: cannot approve files that did not pass validation. ${gate}`);
    file = path.join(st.set.dir, 'out', 'approval.json'); hashes = { manifest_sha256: st.hash };
  } else {
    const wrong = reelPlatformProblem(platforms); if (wrong) throw new Error(wrong);
    const ep = episode(id);
    const gate = validationProblem(id, ep); if (gate) throw new Error(`${id}: cannot approve files that did not pass validation. ${gate}`);
    file = reelApprovalFile(ep); hashes = { video_sha256: sha(ep.video_path), thumb_sha256: sha(ep.thumb_path) };
  }
  const rec = { item: id, kind: post ? 'post' : 'reel', platforms, quote, approved_at: new Date().toISOString(), ...hashes };
  fs.writeFileSync(file, JSON.stringify(rec, null, 2) + '\n');
  wikilog('approve', id, `- ${rec.kind} for ${platforms.join(',')}: "${quote}"`);
  console.log(`approved ${id} ${rec.kind} for ${platforms.join(',')} (${Object.values(hashes).map((h) => h.slice(0, 12)).join(', ')}) -> ${file}`);
} else if (cmd === 'publish-post') {
  const id = pos[0]; if (!id) throw new Error('usage: publish-post <id> [--platforms instagram_post] [--dry-run] [--force]');
  const dry = flag('--dry-run');
  const d = postPublishDecision(id, [...new Set((opt('--platforms') || POST_PLATFORM).split(',').map((p) => p.trim()).filter(Boolean))], { force: flag('--force') });
  if (d.fails.length) {
    console.log(`${dry ? 'DRY RUN ' : ''}publish-post ${id}: ${dry ? 'REFUSE' : 'REFUSED'}`);
    for (const f of d.fails) console.log(`  - ${f}`);
    process.exit(3);
  }
  const r = publishPost(id, d, { dry, force: flag('--force') });
  if (!dry && !r.live.length) console.log(`publish-post ${id}: no live post was recorded. See the output above and the posts table.`);
  process.exit(r.status || (!dry && !r.live.length ? 1 : 0));
} else if (cmd === 'autopublish') {
  const id = pos[0]; if (!id) throw new Error('usage: autopublish <id> [--dry-run]');
  const d = autopublishDecision(id);
  if (flag('--dry-run')) {
    console.log(`DRY RUN autopublish ${id}: ${d.fails.length ? 'REFUSE' : `WOULD PUBLISH to ${d.platforms.join(',')}`}`);
    for (const f of d.fails) console.log(`  - ${f}`);
    process.exit(d.fails.length ? 3 : 0);
  }
  if (d.fails.length) {
    setQueueForItem(id, 'needs_review', d.fails.join('; '));
    console.log(`autopublish ${id}: REFUSED, marked needs_review`);
    for (const f of d.fails) console.log(`  - ${f}`);
    const off = d.fails.length === 1 && d.fails[0].startsWith('setting autopublish');
    notify(off ? 'ready for review' : 'needs review', off ? `${id} passed every check; autopublish is off, so it waits for you.` : `${id}: ${d.fails.join('; ')}`, off ? 'info' : 'warn');
    process.exit(3);
  }
  const r = publishItem(id, { platforms: d.platforms });   // never --force
  const missing = d.platforms.filter((p) => !db.prepare("SELECT 1 FROM posts WHERE label = ? AND platform = ? AND status = 'SUCCESS'").get(id, p));
  if (missing.length) {
    setQueueForItem(id, 'needs_review', `upload did not succeed for ${missing.join(',')}`);
    notify('upload failed', `${id}: no live post on ${missing.join(',')}. See posts table.`, 'error');
    process.exit(r.status || 1);
  }
  setQueueForItem(id, 'done');
  notify('posted', `${id} is live on ${d.platforms.join(', ')}`);
  console.log(`autopublish ${id}: posted to ${d.platforms.join(',')}`);
} else if (cmd === 'review') {
  const id = pos[0]; item(id);
  const kind = opt('--kind'), verdict = opt('--verdict'), score = opt('--score');
  if (!['critic', 'validator', 'facts'].includes(kind)) throw new Error('--kind must be critic, validator or facts');
  if (!['PASS', 'FAIL'].includes(verdict)) throw new Error('--verdict must be PASS or FAIL');
  if (score != null && !Number.isFinite(+score)) throw new Error('--score must be a number');
  // reviews.video_sha256 is the sha256 the verdict applies to: the registered 9x16 video, or with --post the registered post's manifest_sha256
  // (recomputed from the files, which must still be the registered ones). One table holds both. autopublish takes the newest review per kind
  // without telling them apart, so a post review recorded after the reel's makes autopublish refuse (hash differs) until the reel is reviewed again.
  let h;
  if (flag('--post')) {
    const st = postFiles(id);
    if (st.problems.length) throw new Error(`${id}: the registered post does not match its files, so a review cannot attach to it:\n  - ${st.problems.join('\n  - ')}`);
    h = st.hash;
  } else {
    const ep = episode(id);
    if (!ep || !fs.existsSync(ep.video_path)) throw new Error(`${id}: no registered 9x16 video on disk to attach the review to`);
    h = sha(ep.video_path);
  }
  const r = db.prepare('INSERT INTO reviews (item_id, kind, verdict, score, notes, video_sha256) VALUES (?, ?, ?, ?, ?, ?) RETURNING id')
    .get(id, kind, verdict, score == null ? null : +score, unescape(opt('--notes')), h);
  console.log(`review #${r.id} ${id} ${kind} ${verdict}${score != null ? ` score ${score}` : ''} for ${flag('--post') ? 'post manifest' : 'video'} ${h.slice(0, 12)}`);
} else if (cmd === 'post') {
  const [sub, id, dirArg] = pos;
  if (sub !== 'register' || !id || !dirArg) throw new Error('usage: post register <id> <postDir>');
  item(id);
  const dir = path.resolve(dirArg);
  const m = carousel.readManifest(path.join(dir, 'out', 'manifest.json'));   // throws on a manifest it cannot read as an ordered slide list
  if (m.manifest.item !== id) throw new Error(`${m.file} is for item ${m.manifest.item ?? '(none)'}, not ${id}`);
  if (m.manifest.format !== POST_FORMAT) throw new Error(`${m.file}: format is ${m.manifest.format ?? '(none)'}; only ${POST_FORMAT} can be registered in v1`);
  const v = carousel.verifyFiles(m);
  if (v.problems.length) throw new Error(`Not registered. The files do not match the manifest:\n  - ${v.problems.join('\n  - ')}`);
  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare('DELETE FROM post_assets WHERE item_id = ? AND format = ?').run(id, POST_FORMAT);   // a render with fewer slides must not leave old rows
    for (const s of m.slides)
      db.prepare('INSERT INTO post_assets (item_id, format, idx, kind, path, alt, sha256, duration_s) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(id, POST_FORMAT, s.idx, s.kind, s.path, s.alt, s.sha256, s.duration_s);
    db.prepare(`INSERT INTO post_sets (item_id, format, dir, manifest_sha256, slide_count) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(item_id, format) DO UPDATE SET dir = excluded.dir, manifest_sha256 = excluded.manifest_sha256, slide_count = excluded.slide_count, rendered_at = CURRENT_TIMESTAMP`)
      .run(id, POST_FORMAT, dir, m.manifest.manifest_sha256, m.slides.length);
    db.exec('COMMIT');
  } catch (e) { db.exec('ROLLBACK'); throw e; }
  db.prepare("UPDATE items SET status = CASE WHEN status IN ('queued','scripted') THEN 'rendered' ELSE status END WHERE id = ?").run(id);
  wikilog('render', `${id} post ${POST_FORMAT}`, `${m.slides.length} slides, ${dir}, manifest ${m.manifest.manifest_sha256.slice(0, 12)}`);
  console.log(`post ${id} ${POST_FORMAT} registered (${m.slides.length} slides, manifest ${m.manifest.manifest_sha256.slice(0, 12)})`);
} else if (cmd === 'queue') {
  const [sub, arg] = pos;
  if (sub === 'add') {
    if (!arg) throw new Error('usage: queue add <url>');
    const dup = db.prepare("SELECT id, status FROM queue WHERE url = ? AND status IN ('queued','running')").get(arg);
    if (dup) console.log(`already queued as #${dup.id} (${dup.status})`);
    else console.log(`queued #${db.prepare('INSERT INTO queue (url) VALUES (?) RETURNING id').get(arg).id} ${arg}`);
  } else if (sub === 'list') {
    console.table(db.prepare('SELECT id, url, status, item_id, attempts, added_at, started_at, finished_at, substr(error,1,80) AS error FROM queue ORDER BY id DESC LIMIT 50').all());
  } else if (sub === 'next') {
    const row = claimNext(db);
    console.log(row ? JSON.stringify(row) : 'queue empty');
  } else if (sub === 'done' || sub === 'fail') {
    const q = db.prepare('SELECT id FROM queue WHERE id = ?').get(+arg); if (!q) throw new Error(`no queue row ${arg}`);
    db.prepare('UPDATE queue SET status = ?, error = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?').run(sub === 'done' ? 'done' : 'failed', opt('--error'), q.id);
    console.log(`queue #${q.id} ${sub === 'done' ? 'done' : 'failed'}`);
  } else if (sub === 'retry') {
    const r = db.prepare("UPDATE queue SET status = 'queued', attempts = 0, error = NULL, started_at = NULL, finished_at = NULL WHERE id = ? RETURNING id").get(+arg);
    if (!r) throw new Error(`no queue row ${arg}`);
    console.log(`queue #${r.id} back in the queue with attempts reset`);
  } else throw new Error('queue add <url> | list | next | done <id> | fail <id> [--error ...] | retry <id>');
} else if (cmd === 'settings') {
  const [sub, key, value] = pos;
  if (!sub || (sub === 'get' && !key)) console.table(db.prepare('SELECT key, value FROM settings ORDER BY key').all());
  else if (sub === 'get') console.log(getSetting(db, key) ?? '(unset)');
  else if (sub === 'set') {
    if (process.env.REELS_NO_PUBLISH === '1') throw new Error('settings cannot be changed from an unattended producer run (REELS_NO_PUBLISH=1)');
    if (!(key in SETTINGS_DEFAULTS)) throw new Error(`unknown setting ${key}. Known: ${Object.keys(SETTINGS_DEFAULTS).join(', ')}`);
    const v = String(value ?? '').trim(); const ok = SETTING_CHECK[key](v);
    if (ok !== true) throw new Error(`${key} ${ok}`);
    setSetting(db, key, v);
    console.log(`${key} = ${v}`);
    if (key === 'autopublish' && v === 'on') console.log('Autopublish is ON: scheduled runs will post items that pass every check without asking. Also update the Publishing rule in llm-wiki/AGENTS.md.');
  } else throw new Error('settings [get [key]] | settings set <key> <value>');
} else if (cmd === 'notion-sync') {
  const r = spawnSync('node', [path.join(CC, 'lib', 'notion-vault.mjs'), 'sync', ...(flag('--dry-run') ? ['--dry-run'] : [])], { stdio: 'inherit', env: process.env });
  process.exitCode = r.status ?? 1;
} else if (cmd === 'mark-deleted') {
  const [id, platform] = pos; item(id);
  const n = db.prepare("UPDATE posts SET status = 'DELETED' WHERE label = ? AND platform = ? AND status = 'SUCCESS'").run(id, platform).changes;
  console.log(`${n} ${platform} post(s) for ${id} marked DELETED. A later publish will post again.`);
} else if (cmd === 'show') {
  const id = pos[0]; console.log(item(id));
  console.table(db.prepare('SELECT platform, revision, title, substr(body,1,60) AS body FROM post_texts WHERE item_id = ? ORDER BY platform, revision').all(id));
  console.table(db.prepare('SELECT platform, status, url, text_revision, posted_at FROM posts WHERE label = ? ORDER BY id').all(id));
  for (const s of db.prepare('SELECT * FROM post_sets WHERE item_id = ? ORDER BY format').all(id)) {
    console.log(`post ${s.format}: ${s.slide_count} slides, manifest ${s.manifest_sha256}, registered ${s.rendered_at}\n  folder ${s.dir}`);
    console.table(db.prepare('SELECT idx, kind, path, substr(alt,1,40) AS alt, sha256, duration_s FROM post_assets WHERE item_id = ? AND format = ? ORDER BY idx').all(id, s.format));
  }
} else if (cmd === 'status') {
  console.table(db.prepare('SELECT id, kind, short_name, topic, status FROM items ORDER BY added_at').all());
  console.table(db.prepare('SELECT label, platform, status, url, text_revision, posted_at FROM posts ORDER BY id DESC LIMIT 20').all());
  console.log('queue:');
  console.table(db.prepare("SELECT id, url, status, item_id, attempts, finished_at, substr(error,1,60) AS error FROM queue ORDER BY id DESC LIMIT 15").all());
  console.log('settings:');
  console.table(db.prepare('SELECT key, value FROM settings ORDER BY key').all());
} else if (cmd === 'backup') {
  const dir = pos[0] || path.join(CC, 'data', 'backups');
  fs.mkdirSync(dir, { recursive: true });
  console.log('snapshot', snapshot(db, path.join(dir, `content-${new Date().toISOString().slice(0, 10)}.sqlite`)));
} else { console.error('commands: add, add-topic, set, text, episode, thumb, approve, publish, autopublish, review, post, publish-post, queue, settings, mark-deleted, show, status, backup'); process.exit(1); }
