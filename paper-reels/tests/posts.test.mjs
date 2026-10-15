// node --test paper-reels/tests/posts.test.mjs
// The posts engine's registry: schema v3, add-topic, text for instagram_post, post register, review --post, show, and every refusal of publish-post.
// Runs reels.mjs against throwaway databases (TRACKER_DB in a temp dir), with the wiki log redirected, dummy credentials and every network
// connection blocked in each child process (helpers/no-network.cjs). publish-post is only ever run with --dry-run: it must never post from a test.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { hasFfmpeg, makePost, makeJpeg, manifestHash, safeEnv, tmpdir } from './helpers/postfx.mjs';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const REELS = path.join(ROOT, 'paper-reels', 'bin', 'reels.mjs');
const LIVE_DB = path.join(ROOT, 'data', 'content.sqlite');
const REAL_WIKI_LOG = path.join(ROOT, 'llm-wiki', 'log.md');
const tmp = tmpdir('reels-posts-');
const env = safeEnv(tmp);
const DB = env.TRACKER_DB;
const wikiLogSize = fs.existsSync(REAL_WIKI_LOG) ? fs.statSync(REAL_WIKI_LOG).size : 0;
const fx = { skip: hasFfmpeg ? false : 'ffmpeg and ffprobe are needed to build slide fixtures' };

const reels = (args, extra = {}) => {
  const r = spawnSync('node', [REELS, ...args], { encoding: 'utf8', env: { ...env, ...extra } });
  return { code: r.status, out: r.stdout + r.stderr };
};
const withDb = (file, f) => { const db = new DatabaseSync(file); try { return f(db); } finally { db.close(); } };
const sql = (q, ...p) => withDb(DB, (db) => db.prepare(q).run(...p));
const rows = (q, ...p) => withDb(DB, (db) => db.prepare(q).all(...p));
const addItem = (id, kind = 'topic') => sql("INSERT INTO items (id, kind, title, source_url, tags) VALUES (?, ?, ?, 'https://example.test/source', '[]')", id, kind, `Title of ${id}`);
let seq = 0;
const newPost = (item, slides) => makePost(path.join(tmp, 'posts', `${item}-${++seq}`), { item, slides });
/** An item with a registered, validated post and instagram_post text: ready for publish-post --dry-run. */
function readyPost(id, { slides = ['image', 'image', 'video', 'image'], text = 'Post caption for the carousel.', kind = 'topic' } = {}) {
  addItem(id, kind);
  const p = newPost(id, slides);
  const reg = reels(['post', 'register', id, p.dir]);
  assert.equal(reg.code, 0, reg.out);
  if (text) { const t = reels(['text', id, 'instagram_post', '--body', text]); assert.equal(t.code, 0, t.out); }
  const a = reels(['approve', id, '--post', '--platforms', 'instagram_post', '--quote', 'yes, post it']); assert.equal(a.code, 0, a.out);
  return p;
}
const dry = (id, args = [], extra = {}) => reels(['publish-post', id, '--dry-run', ...args], extra);

before(() => {
  assert.ok(DB.startsWith(os.tmpdir()) && path.resolve(DB) !== path.resolve(LIVE_DB), 'the test database must be a temp file, never data/content.sqlite');
  assert.equal(reels(['settings']).code, 0);   // creates the schema
});
after(() => {
  // WIKI_LOG points at the temp dir: the commands logged there, and nothing of these tests reached the real wiki log
  // (other workers may append to it meanwhile, so look only for this test's own markers in what was added).
  const redirected = fs.existsSync(env.WIKI_LOG) ? fs.readFileSync(env.WIKI_LOG, 'utf8') : '';
  const added = fs.existsSync(REAL_WIKI_LOG) ? fs.readFileSync(REAL_WIKI_LOG).subarray(wikiLogSize).toString() : '';
  fs.rmSync(tmp, { recursive: true, force: true });
  assert.match(redirected, /\] render \| .* post 4x5/);
  assert.doesNotMatch(added, /reels-posts-|asd-test-guide|\| (reg|pp|rev|show|col)[-\d]/);
});

// ---- schema

test('schema: a v2 database gets post_assets and post_sets once, and no row of any other table changes', () => {
  const dir = tmpdir('reels-posts-schema-');
  const e = safeEnv(dir);
  const file = e.TRACKER_DB;
  const open = () => assert.equal(spawnSync('node', [REELS, 'settings'], { encoding: 'utf8', env: e }).status, 0);
  const q = (s, ...p) => withDb(file, (db) => db.prepare(s).all(...p));
  const x = (s) => withDb(file, (db) => db.exec(s));
  const counts = () => Object.fromEntries(['items', 'posts', 'post_texts', 'episodes', 'comments', 'reviews', 'queue', 'settings'].map((t) => [t, q(`SELECT COUNT(*) n FROM ${t}`)[0].n]));
  try {
    open();   // a new database is created at v3 directly, with nothing to back up
    assert.equal(q('PRAGMA user_version')[0].user_version, 3);
    assert.equal(fs.existsSync(path.join(dir, 'backups')), false);
    // make it look like the live database before this change: v2, no post tables, rows in the tables a reel uses
    x(`DROP TABLE post_assets; DROP TABLE post_sets; PRAGMA user_version = 2;
       INSERT INTO items (id, kind, title, source_url) VALUES ('2699.00001', 'paper', 'P', 'u');
       INSERT INTO post_texts (item_id, platform, body) VALUES ('2699.00001', 'instagram', 'reel caption');
       INSERT INTO posts (label, platform, status, url) VALUES ('2699.00001', 'instagram', 'SUCCESS', 'https://x');
       INSERT INTO reviews (item_id, kind, verdict, video_sha256) VALUES ('2699.00001', 'facts', 'PASS', 'abc');`);
    const before = counts();
    open();
    assert.equal(q('PRAGMA user_version')[0].user_version, 3);
    assert.deepEqual(counts(), before, 'no row count may change');
    assert.deepEqual(q("SELECT name FROM pragma_table_info('post_assets') ORDER BY cid").map((c) => c.name), ['item_id', 'format', 'idx', 'kind', 'path', 'alt', 'sha256', 'duration_s']);
    assert.deepEqual(q("SELECT name FROM pragma_table_info('post_assets') WHERE pk > 0 ORDER BY pk").map((c) => c.name), ['item_id', 'format', 'idx']);
    assert.deepEqual(q("SELECT name FROM pragma_table_info('post_sets') ORDER BY cid").map((c) => c.name), ['item_id', 'format', 'dir', 'manifest_sha256', 'slide_count', 'rendered_at']);
    assert.deepEqual(q("SELECT name FROM pragma_table_info('post_sets') WHERE pk > 0 ORDER BY pk").map((c) => c.name), ['item_id', 'format']);
    assert.equal(fs.readdirSync(path.join(dir, 'backups')).filter((f) => f.startsWith('pre-v3-')).length, 1, 'one snapshot before the migration');
    const schema = JSON.stringify(q("SELECT type, name, sql FROM sqlite_master ORDER BY type, name"));
    open();   // idempotent: no change, no second snapshot
    assert.equal(JSON.stringify(q("SELECT type, name, sql FROM sqlite_master ORDER BY type, name")), schema);
    assert.equal(fs.readdirSync(path.join(dir, 'backups')).length, 1);
    assert.equal(q('PRAGMA integrity_check')[0].integrity_check, 'ok');
    assert.equal(q('PRAGMA foreign_key_check').length, 0);
    // tables that already exist at v2 (a process migrated halfway, or a hand-made copy) keep their rows
    x(`INSERT INTO post_sets (item_id, format, dir, manifest_sha256, slide_count) VALUES ('2699.00001', '4x5', '/d', 'h', 2); PRAGMA user_version = 2;`);
    open();
    assert.equal(q('SELECT COUNT(*) n FROM post_sets')[0].n, 1);
    assert.equal(q('PRAGMA user_version')[0].user_version, 3);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

// ---- add-topic

test('add-topic creates a topic without any network fetch, updates it, and refuses what it must', () => {
  const r = reels(['add-topic', 'asd-test-guide', '--title', 'A test guide', '--url', 'https://www.asd-ste100.org/', '--topic', 'technical-writing', '--name', 'STE guide']);
  assert.equal(r.code, 0, r.out); assert.match(r.out, /added topic asd-test-guide/);
  const it = rows("SELECT * FROM items WHERE id = 'asd-test-guide'")[0];
  assert.equal(it.kind, 'topic'); assert.equal(it.title, 'A test guide'); assert.equal(it.source_url, 'https://www.asd-ste100.org/');
  assert.equal(it.topic, 'technical-writing'); assert.equal(it.short_name, 'STE guide'); assert.equal(it.status, 'queued');
  assert.equal(rows("SELECT COUNT(*) n FROM paper_meta WHERE item_id = 'asd-test-guide'")[0].n, 0, 'no arXiv metadata');
  // again: an update, not a second row, and the wiki log gets no second "add" line
  const again = reels(['add-topic', 'asd-test-guide', '--title', 'A better title', '--url', 'https://www.asd-ste100.org/']);
  assert.equal(again.code, 0, again.out); assert.match(again.out, /updated topic/);
  assert.equal(rows("SELECT title FROM items WHERE id = 'asd-test-guide'")[0].title, 'A better title');
  assert.equal(rows("SELECT COUNT(*) n FROM items WHERE id = 'asd-test-guide'")[0].n, 1);
  assert.equal(fs.readFileSync(env.WIKI_LOG, 'utf8').split('## [').filter((l) => /add \| asd-test-guide/.test(l)).length, 1);
  // refusals
  sql("INSERT INTO items (id, kind, title, source_url) VALUES ('some-paper', 'paper', 'P', 'u')");
  assert.match(reels(['add-topic', 'some-paper', '--title', 'T', '--url', 'https://x.test']).out, /already exists as a paper/);
  assert.equal(rows("SELECT kind FROM items WHERE id = 'some-paper'")[0].kind, 'paper', 'a paper is never turned into a topic');
  for (const slug of ['Bad Slug', '2699.00001', 'a--b', '-lead', 'trail-']) assert.notEqual(reels(['add-topic', slug, '--title', 'T', '--url', 'https://x.test']).code, 0, slug);
  assert.notEqual(reels(['add-topic', 'no-url', '--title', 'T']).code, 0);
  assert.notEqual(reels(['add-topic', 'no-title', '--url', 'https://x.test']).code, 0);
  assert.notEqual(reels(['add-topic', 'bad-url', '--title', 'T', '--url', 'ftp://x.test']).code, 0);
  assert.notEqual(reels(['add-topic', 'bad-topic', '--title', 'T', '--url', 'https://x.test', '--topic', 'Not A Slug']).code, 0);
  assert.equal(rows("SELECT COUNT(*) n FROM items WHERE id IN ('no-url','no-title','bad-url','bad-topic','Bad Slug')")[0].n, 0);
});

// ---- text

test('text: instagram_post and threads_post revisions never touch the reel text of the same item', () => {
  addItem('both', 'paper');
  sql("INSERT INTO post_texts (item_id, platform, revision, title, body) VALUES ('both', 'youtube', 1, 'YT', 'yt body'), ('both', 'instagram', 1, NULL, 'reel caption'), ('both', 'threads', 1, NULL, 'reel threads')");
  assert.match(reels(['text', 'both', 'instagram_post', '--body', 'post caption one']).out, /instagram_post text saved as revision 1/);
  assert.match(reels(['text', 'both', 'instagram_post', '--body', 'post caption two\\nline two']).out, /revision 2/);
  assert.match(reels(['text', 'both', 'threads_post', '--body', 'post threads']).out, /threads_post text saved as revision 1/);
  const latest = Object.fromEntries(rows("SELECT platform, revision, body FROM latest_post_text WHERE item_id = 'both'").map((r) => [r.platform, r]));
  assert.deepEqual([latest.instagram.revision, latest.instagram.body], [1, 'reel caption'], 'the reel caption is untouched');
  assert.deepEqual([latest.threads.revision, latest.threads.body], [1, 'reel threads']);
  assert.deepEqual([latest.youtube.revision, latest.youtube.body], [1, 'yt body']);
  assert.deepEqual([latest.instagram_post.revision, latest.instagram_post.body], [2, 'post caption two\nline two'], 'revisions count per platform key, and \\n becomes a newline');
  assert.deepEqual(rows("SELECT revision FROM post_texts WHERE item_id = 'both' AND platform = 'instagram' ORDER BY revision").map((r) => r.revision), [1]);
  assert.equal(rows("SELECT COUNT(*) n FROM post_texts WHERE item_id = 'both' AND platform = 'instagram_post'")[0].n, 2, 'append-only');
  const bad = reels(['text', 'both', 'instagram_reel', '--body', 'x']);
  assert.notEqual(bad.code, 0); assert.match(bad.out, /instagram_post/);
  // a caption over the limit is saved (append-only) but flagged at once
  const long = reels(['text', 'both', 'instagram_post', '--body', 'a'.repeat(2201)]);
  assert.equal(long.code, 0); assert.match(long.out, /warning: caption at most 2200 characters \(2201 characters\)/);
  // the same words for a reel platform get no caption warning (those limits are not enforced here)
  assert.doesNotMatch(reels(['text', 'both', 'instagram', '--body', 'a'.repeat(2201)]).out, /warning/);
});

// ---- post register

test('post register refuses a hash mismatch and writes nothing', fx, () => {
  addItem('reg-hash');
  const p = newPost('reg-hash', ['image', 'image', 'image']);
  fs.appendFileSync(path.join(p.dir, 'out', 's02.jpg'), 'x');   // changed after the manifest was written
  const r = reels(['post', 'register', 'reg-hash', p.dir]);
  assert.notEqual(r.code, 0);
  assert.match(r.out, /slide 2 \(out\/s02\.jpg\): sha256 \w{12} differs from the manifest/);
  assert.equal(rows("SELECT COUNT(*) n FROM post_assets WHERE item_id = 'reg-hash'")[0].n, 0);
  assert.equal(rows("SELECT COUNT(*) n FROM post_sets WHERE item_id = 'reg-hash'")[0].n, 0);
  assert.equal(rows("SELECT status FROM items WHERE id = 'reg-hash'")[0].status, 'queued');
  fs.rmSync(path.join(p.dir, 'out', 's03.jpg'));   // a file that is gone is refused too
  assert.match(reels(['post', 'register', 'reg-hash', p.dir]).out, /slide 3 \(out\/s03\.jpg\): file is missing/);
});

test('post register refuses a wrong manifest hash, another item, another format and paths outside the folder', fx, () => {
  addItem('reg-bad');
  const p = newPost('reg-bad', ['image', 'image']);
  const write = (patch) => fs.writeFileSync(p.manifestPath, JSON.stringify({ ...p.manifest, ...patch }));
  const reg = () => reels(['post', 'register', 'reg-bad', p.dir]);
  write({ manifest_sha256: '0'.repeat(64) });
  assert.match(reg().out, /manifest_sha256 000000000000 is not the hash of its slide list/);
  write({ item: 'someone-else' });
  assert.match(reg().out, /is for item someone-else, not reg-bad/);
  write({ format: '1x1' });
  assert.match(reg().out, /only 4x5 can be registered/);
  // a path that leaves the post folder (the file exists and its hash is right) must not be accepted
  fs.writeFileSync(path.join(p.dir, '..', 'outside.jpg'), fs.readFileSync(path.join(p.dir, 'out', 's01.jpg')));
  for (const evil of ['../outside.jpg', '/etc/hosts', 'out/../../outside.jpg']) {
    const slides = p.slides.map((s, i) => (i === 0 ? { ...s, path: evil } : s));
    write({ slides });
    assert.match(reg().out, /relative path inside the post folder/, evil);
  }
  write({ slides: [{ ...p.slides[1], idx: 0 }, { ...p.slides[0], idx: 1 }].reverse() });   // not in idx order
  assert.match(reg().out, /listed in order with idx 0 to n-1/);
  assert.equal(rows("SELECT COUNT(*) n FROM post_assets WHERE item_id = 'reg-bad'")[0].n, 0);
  fs.symlinkSync(path.join(p.dir, '..', 'outside.jpg'), path.join(p.dir, 'out', 'link.jpg'));   // a symlink that points outside is refused as well
  write({ slides: p.slides.map((s, i) => (i === 0 ? { ...s, path: 'out/link.jpg' } : s)) });
  assert.match(reg().out, /resolves outside the post folder/);
});

test('post register writes the rows, bumps the item status, and a smaller re-render leaves no stale rows', fx, () => {
  addItem('reg-ok');
  const p = newPost('reg-ok', ['image', 'image', 'video']);
  const r = reels(['post', 'register', 'reg-ok', p.dir], { REELS_NO_PUBLISH: '1' });   // registering is not publishing, so it works in an unattended producer run
  assert.equal(r.code, 0, r.out); assert.match(r.out, /registered \(3 slides, manifest \w{12}\)/);
  const set = rows("SELECT * FROM post_sets WHERE item_id = 'reg-ok'")[0];
  assert.deepEqual([set.format, set.dir, set.manifest_sha256, set.slide_count], ['4x5', path.resolve(p.dir), manifestHash(p.slides), 3]);
  assert.ok(set.rendered_at);
  const a = rows("SELECT * FROM post_assets WHERE item_id = 'reg-ok' ORDER BY idx");
  assert.deepEqual(a.map((x) => [x.idx, x.kind, x.path, x.alt, x.sha256, x.duration_s]), p.slides.map((s) => [s.idx, s.kind, s.path, s.alt, s.sha256, s.duration_s ?? null]));
  assert.equal(rows("SELECT status FROM items WHERE id = 'reg-ok'")[0].status, 'rendered');
  assert.equal(reels(['post', 'register', 'reg-ok', p.dir]).code, 0, 'registering the same post again is fine');
  assert.equal(rows("SELECT COUNT(*) n FROM post_assets WHERE item_id = 'reg-ok'")[0].n, 3);
  const q = newPost('reg-ok', ['image', 'image']);   // the post is rendered again with fewer slides, in another folder
  assert.equal(reels(['post', 'register', 'reg-ok', q.dir]).code, 0);
  assert.equal(rows("SELECT COUNT(*) n FROM post_assets WHERE item_id = 'reg-ok'")[0].n, 2);
  const set2 = rows("SELECT * FROM post_sets WHERE item_id = 'reg-ok'")[0];
  assert.deepEqual([set2.dir, set2.slide_count, set2.manifest_sha256], [path.resolve(q.dir), 2, manifestHash(q.slides)]);
  assert.equal(rows("SELECT COUNT(*) n FROM post_sets WHERE item_id = 'reg-ok'")[0].n, 1);
  assert.notEqual(reels(['post', 'register', 'no-such-item', q.dir]).code, 0);
  assert.notEqual(reels(['post', 'register', 'reg-ok', path.join(tmp, 'no-such-dir')]).code, 0);
  assert.notEqual(reels(['post', 'unregister', 'reg-ok', q.dir]).code, 0);
});

// ---- review --post, show

test('review --post stores the manifest hash in reviews.video_sha256; the reel review path is unchanged', fx, () => {
  const p = readyPost('rev-1', { slides: ['image', 'image'] });
  const hash = manifestHash(p.slides);
  const r = reels(['review', 'rev-1', '--kind', 'validator', '--post', '--verdict', 'PASS', '--notes', 'looked at every slide']);
  assert.equal(r.code, 0, r.out); assert.match(r.out, new RegExp(`review #\\d+ rev-1 validator PASS for post manifest ${hash.slice(0, 12)}`));
  assert.equal(reels(['review', 'rev-1', '--kind', 'facts', '--verdict', 'FAIL', '--post', '--notes', 'a number is not in the source']).code, 0);
  const saved = rows("SELECT kind, verdict, video_sha256, notes FROM reviews WHERE item_id = 'rev-1' ORDER BY id");
  assert.deepEqual(saved.map((x) => [x.kind, x.verdict, x.video_sha256]), [['validator', 'PASS', hash], ['facts', 'FAIL', hash]]);
  // without --post a review is about the reel's video, and this item has none
  const reel = reels(['review', 'rev-1', '--kind', 'facts', '--verdict', 'PASS']);
  assert.notEqual(reel.code, 0); assert.match(reel.out, /no registered 9x16 video/);
  assert.equal(rows("SELECT COUNT(*) n FROM reviews WHERE item_id = 'rev-1'")[0].n, 2);
  // a file changed since registration: the review cannot attach to files nobody registered
  fs.appendFileSync(path.join(p.dir, 'out', 's02.jpg'), 'x');
  const stale = reels(['review', 'rev-1', '--kind', 'critic', '--post', '--verdict', 'PASS', '--score', '9']);
  assert.notEqual(stale.code, 0); assert.match(stale.out, /does not match its files/);
  assert.equal(rows("SELECT COUNT(*) n FROM reviews WHERE item_id = 'rev-1'")[0].n, 2);
  assert.notEqual(reels(['review', 'no-post-here', '--kind', 'facts', '--post', '--verdict', 'PASS']).code, 0);
  addItem('rev-none');   // an item with no registered post
  assert.match(reels(['review', 'rev-none', '--kind', 'facts', '--post', '--verdict', 'PASS']).out, /No post registered/);
});

test('show prints the registered post: set line, folder, and every slide with its full hash', fx, () => {
  const p = readyPost('show-1', { slides: ['image', 'video'] });
  const r = reels(['show', 'show-1']);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, new RegExp(`post 4x5: 2 slides, manifest ${manifestHash(p.slides)}`));
  assert.ok(r.out.includes(path.resolve(p.dir)));
  for (const s of p.slides) { assert.ok(r.out.includes(s.sha256), `hash of ${s.path}`); assert.ok(r.out.includes(s.path)); }
  assert.match(r.out, /instagram_post/);
  addItem('show-2');
  assert.doesNotMatch(reels(['show', 'show-2']).out, /post 4x5/, 'an item without a post prints nothing extra');
});

// ---- publish-post: every refusal (always --dry-run, which lists them all and exits 3)

test('publish-post --dry-run: all gates hold, nothing is written, and the uploader dry run follows', fx, () => {
  const p = readyPost('pp-ok');
  reels(['review', 'pp-ok', '--kind', 'validator', '--post', '--verdict', 'PASS']);
  const snapshot = () => JSON.stringify([rows('SELECT * FROM posts'), rows('SELECT * FROM reviews'), rows('SELECT id, status FROM items ORDER BY id'), rows('SELECT * FROM post_assets ORDER BY item_id, idx')]);
  const before = snapshot();
  const r = dry('pp-ok');
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /DRY RUN publish-post pp-ok: every gate holds, would post to instagram_post with text revision 1/);
  assert.match(r.out, /reviews of this manifest .*: validator PASS \(#\d+\), facts none, critic none/);
  assert.match(r.out, /DRY RUN post\.js pp-ok -> instagram_post: 4 slides, manifest /);
  assert.match(r.out, /\| Post caption for the carousel\./, 'the caption is printed exactly as it would be sent');
  assert.equal(r.out.split('\n').filter((l) => /is_carousel_item=true/.test(l)).length, 4);
  assert.match(r.out, /media_type=CAROUSEL children=<container 1>,<container 2>,<container 3>,<container 4>/);
  assert.match(r.out, /media_publish/);
  assert.equal(snapshot(), before, 'a dry run changes nothing in the database');
  assert.ok(p.dir);
});

test('publish-post refuses without a PASS in out/validation.json, with a hash that no longer matches, or with no validation file', fx, () => {
  const p = readyPost('pp-val');
  fs.rmSync(path.join(p.out, 'validation.json'));
  let r = dry('pp-val');
  assert.equal(r.code, 3); assert.match(r.out, /DRY RUN publish-post pp-val: REFUSE/); assert.match(r.out, /validation gate: Not validated/);
  assert.doesNotMatch(r.out, /every gate holds/);
  p.validate('FAIL');
  r = dry('pp-val');
  assert.equal(r.code, 3); assert.match(r.out, /validation gate: Validation verdict is FAIL/);
  p.validate('PASS', 'f'.repeat(64));   // a PASS for some other render
  r = dry('pp-val');
  assert.equal(r.code, 3); assert.match(r.out, /validation gate: The files changed since validation/);
  fs.writeFileSync(path.join(p.out, 'validation.json'), '{ not json');
  assert.match(dry('pp-val').out, /validation gate: out\/validation\.json is not valid JSON/);
  fs.writeFileSync(path.join(p.out, 'validation.json'), JSON.stringify({ item: 'pp-val', verdict: 'PASS' }));   // no hash at all
  assert.match(dry('pp-val').out, /validation gate: out\/validation\.json has no manifest_sha256/);
  fs.writeFileSync(path.join(p.out, 'validation.json'), JSON.stringify({ item: 'another-item', verdict: 'PASS', manifest_sha256: p.manifest.manifest_sha256 }));
  assert.match(dry('pp-val').out, /validation gate: out\/validation\.json is for item another-item/);
  p.validate();   // the real PASS again
  assert.equal(dry('pp-val').code, 0);
});

test('publish-post refuses when a file changed after validation and registration, and when the post was rendered again but not registered', fx, () => {
  const p = readyPost('pp-hash');
  assert.equal(dry('pp-hash').code, 0);
  const s02 = path.join(p.dir, 'out', 's02.jpg'), original = fs.readFileSync(s02);
  fs.appendFileSync(s02, 'x');   // one byte
  let r = dry('pp-hash');
  assert.equal(r.code, 3);
  assert.match(r.out, /slide 2 \(out\/s02\.jpg\): sha256 \w{12} differs from the registered post/);
  assert.match(r.out, /validation gate: The files changed since validation/);
  fs.rmSync(s02);
  assert.match(dry('pp-hash').out, /slide 2 \(out\/s02\.jpg\): file is missing/);
  fs.writeFileSync(s02, original);
  assert.equal(dry('pp-hash').code, 0, 'restoring the file restores the gate');
  // the same files, listed in another order in out/manifest.json (with a matching hash) while validation.json is untouched:
  // post.js uploads in the order of that file, so it must still be the registered post
  const saved = fs.readFileSync(p.manifestPath);
  const swapped = [p.slides[1], p.slides[0], ...p.slides.slice(2)].map((s, i) => ({ ...s, idx: i }));
  fs.writeFileSync(p.manifestPath, JSON.stringify({ ...p.manifest, slides: swapped, manifest_sha256: manifestHash(swapped) }));
  r = dry('pp-hash');
  assert.equal(r.code, 3); assert.match(r.out, /out\/manifest\.json is not the registered post any more/);
  assert.doesNotMatch(r.out, /differs from the registered post/, 'the files themselves are unchanged');
  fs.writeFileSync(p.manifestPath, saved);
  assert.equal(dry('pp-hash').code, 0);
  // re-rendered and re-validated, but post register was not run again: the registered rows are what was approved
  makeJpeg(s02, { color: '0xff0000' });
  p.rewrite(); p.validate();
  r = dry('pp-hash');
  assert.equal(r.code, 3);
  assert.match(r.out, /differs from the registered post/);
  assert.match(r.out, /out\/manifest\.json is not the registered post any more/);
  assert.equal(reels(['post', 'register', 'pp-hash', p.dir]).code, 0);
  r = dry('pp-hash');
  assert.equal(r.code, 3); assert.match(r.out, /approval gate: The files changed since the human approved them/, 'the human has not seen the new files');
  assert.equal(reels(['approve', 'pp-hash', '--post', '--platforms', 'instagram_post', '--quote', 'yes, the new one']).code, 0);
  assert.equal(dry('pp-hash').code, 0, 'registering the new files again and a new approval open the gate');
  const only = new Set(rows("SELECT sha256 FROM post_assets WHERE item_id = 'pp-hash'").map((x) => x.sha256));
  assert.equal(only.size, 4);
});

test('publish-post refuses without post text, and a reel caption is no substitute', fx, () => {
  addItem('pp-text', 'paper');
  sql("INSERT INTO post_texts (item_id, platform, body) VALUES ('pp-text', 'instagram', 'this is the reel caption')");
  const p = newPost('pp-text', ['image', 'image']);
  assert.equal(reels(['post', 'register', 'pp-text', p.dir]).code, 0);
  assert.equal(reels(['approve', 'pp-text', '--post', '--platforms', 'instagram_post', '--quote', 'yes']).code, 0);
  const r = dry('pp-text');
  assert.equal(r.code, 3); assert.match(r.out, /no post text for instagram_post\. Run: .*text pp-text instagram_post/);
  assert.doesNotMatch(r.out, /every gate holds/);
  assert.equal(reels(['text', 'pp-text', 'instagram_post', '--body', '   ']).code, 0);
  assert.match(dry('pp-text').out, /no post text for instagram_post/, 'a blank caption is no caption');
  reels(['text', 'pp-text', 'instagram_post', '--body', 'the post caption']);
  const ok = dry('pp-text');
  assert.equal(ok.code, 0, ok.out);
  assert.match(ok.out, /\| the post caption/); assert.doesNotMatch(ok.out, /reel caption/);
});

test('publish-post refuses while an instagram_post SUCCESS exists; --force skips only that, mark-deleted reopens it', fx, () => {
  const p = readyPost('pp-done');
  sql("INSERT INTO posts (label, platform, status, url, text_revision) VALUES ('pp-done', 'instagram_post', 'SUCCESS', 'https://www.instagram.com/p/x/', 1)");
  let r = dry('pp-done');
  assert.equal(r.code, 3); assert.match(r.out, /already posted to instagram_post \(posts #\d+\); mark it DELETED first/);
  assert.equal(dry('pp-done', ['--force']).code, 0, '--force skips the SUCCESS condition');
  p.validate('FAIL');   // but --force never skips the validation gate
  r = dry('pp-done', ['--force']);
  assert.equal(r.code, 3); assert.match(r.out, /validation gate/); assert.doesNotMatch(r.out, /already posted/);
  p.validate();
  const m = reels(['mark-deleted', 'pp-done', 'instagram_post']);
  assert.match(m.out, /1 instagram_post post\(s\) for pp-done marked DELETED/);
  assert.equal(dry('pp-done').code, 0);
  // a FAILED attempt does not block a retry
  sql("INSERT INTO posts (label, platform, status, error) VALUES ('pp-done', 'instagram_post', 'FAILED', 'boom')");
  assert.equal(dry('pp-done').code, 0);
});

test('publish-post honours REELS_NO_PUBLISH and no flag bypasses a gate', fx, () => {
  readyPost('pp-env');
  for (const v of ['1', 'true', 'yes']) {
    const r = dry('pp-env', [], { REELS_NO_PUBLISH: v });
    assert.equal(r.code, 3, v); assert.match(r.out, new RegExp(`REELS_NO_PUBLISH=${v} is set: this process may not publish`));
    assert.doesNotMatch(r.out, /every gate holds/);
  }
  for (const v of ['0', '']) assert.equal(dry('pp-env', [], { REELS_NO_PUBLISH: v }).code, 0, `REELS_NO_PUBLISH='${v}' counts as unset`);
  // refusals pile up: all of them are listed at once
  addItem('pp-many');
  const p = newPost('pp-many', ['image', 'image']);
  reels(['post', 'register', 'pp-many', p.dir]);
  fs.rmSync(path.join(p.out, 'validation.json'));
  const r = dry('pp-many', ['--skip-validation', '--no-gate', '--bypass', '--yes', '--unsafe'], { REELS_NO_PUBLISH: '1' });
  assert.equal(r.code, 3);
  assert.match(r.out, /REELS_NO_PUBLISH=1/); assert.match(r.out, /validation gate: Not validated/); assert.match(r.out, /no post text for instagram_post/);
  assert.equal(r.out.split('\n').filter((l) => l.startsWith('  - ')).length, 3);
  const src = fs.readFileSync(REELS, 'utf8');
  assert.doesNotMatch(src.slice(src.indexOf("cmd === 'publish-post'"), src.indexOf("cmd === 'autopublish'")), /bypass|skip-validation|no-gate/i, 'publish-post has no bypass flag');
});

test('publish-post refuses without a recorded approval, with one for other files, and approve itself refuses unvalidated files or an unattended run', fx, () => {
  addItem('pp-appr');
  const p = newPost('pp-appr', ['image', 'image']);
  assert.equal(reels(['post', 'register', 'pp-appr', p.dir]).code, 0);
  reels(['text', 'pp-appr', 'instagram_post', '--body', 'caption']);
  let r = dry('pp-appr');
  assert.equal(r.code, 3); assert.match(r.out, /approval gate: No recorded approval\. .*approve pp-appr --post --platforms instagram_post --quote/);
  assert.equal(r.out.split('\n').filter((l) => l.startsWith('  - ')).length, 1, 'only the approval fails');
  for (const v of ['1', 'yes']) {
    const a = reels(['approve', 'pp-appr', '--post', '--platforms', 'instagram_post', '--quote', 'yes'], { REELS_NO_PUBLISH: v });
    assert.notEqual(a.code, 0); assert.match(a.out, /only the human can approve/);
  }
  assert.notEqual(reels(['approve', 'pp-appr', '--post', '--platforms', 'instagram_post']).code, 0, 'a quote is required');
  assert.match(reels(['approve', 'pp-appr', '--post', '--platforms', 'instagram', '--quote', 'yes']).out, /a post approval takes only instagram_post/);
  p.validate('FAIL');
  r = reels(['approve', 'pp-appr', '--post', '--platforms', 'instagram_post', '--quote', 'yes']);
  assert.notEqual(r.code, 0); assert.match(r.out, /cannot approve files that did not pass validation/);
  assert.ok(!fs.existsSync(path.join(p.out, 'approval.json')));
  p.validate();
  r = reels(['approve', 'pp-appr', '--post', '--platforms', 'instagram_post', '--quote', 'Yes, post this one']);
  assert.equal(r.code, 0, r.out);
  const rec = JSON.parse(fs.readFileSync(path.join(p.out, 'approval.json'), 'utf8'));
  assert.equal(rec.quote, 'Yes, post this one'); assert.equal(rec.manifest_sha256, p.manifest.manifest_sha256); assert.deepEqual(rec.platforms, ['instagram_post']);
  assert.equal(dry('pp-appr').code, 0);
  // an approval of other files (a new render the human has not seen) is stale
  fs.writeFileSync(path.join(p.out, 'approval.json'), JSON.stringify({ ...rec, manifest_sha256: 'e'.repeat(64) }));
  r = dry('pp-appr');
  assert.equal(r.code, 3); assert.match(r.out, /approval gate: The files changed since the human approved them/);
  fs.writeFileSync(path.join(p.out, 'approval.json'), JSON.stringify({ ...rec, item: 'other' }));
  assert.match(dry('pp-appr').out, /approval gate: approval\.json is for item other/);
  fs.writeFileSync(path.join(p.out, 'approval.json'), JSON.stringify({ ...rec, quote: ' ' }));
  assert.match(dry('pp-appr').out, /approval gate: approval\.json has no quote/);
});

test('publish-post takes only instagram_post: reel keys and the reserved threads_post are refused, an unknown item and an unregistered post too', fx, () => {
  readyPost('pp-plat');
  let r = dry('pp-plat', ['--platforms', 'instagram']);
  assert.equal(r.code, 3); assert.match(r.out, /instagram: not a post platform/);
  r = dry('pp-plat', ['--platforms', 'instagram_post,threads_post']);
  assert.equal(r.code, 3); assert.match(r.out, /threads_post is reserved/);
  assert.equal(dry('pp-plat', ['--platforms', 'instagram_post,instagram_post']).code, 0, 'a repeated platform counts once');
  r = dry('pp-plat', ['--platforms', 'youtube']);
  assert.equal(r.code, 3);
  r = dry('no-such-item');
  assert.equal(r.code, 3); assert.match(r.out, /unknown item no-such-item/);
  addItem('pp-unreg');
  reels(['text', 'pp-unreg', 'instagram_post', '--body', 'caption']);
  r = dry('pp-unreg');
  assert.equal(r.code, 3); assert.match(r.out, /No post registered\. Run: .*post register pp-unreg/);
  assert.notEqual(reels(['publish-post']).code, 0, 'an id is required');
});

// ---- an item that has a reel and a post: the two never collide

test('a post and a reel on one item stay apart: texts, posts rows, status checks and the reel publish path', fx, () => {
  addItem('col', 'paper');
  sql(`INSERT INTO post_texts (item_id, platform, revision, title, body) VALUES ('col', 'youtube', 1, 'YT', 'yt'), ('col', 'instagram', 1, NULL, 'THE REEL CAPTION');
       INSERT INTO posts (label, platform, status, url, text_revision) VALUES ('col', 'youtube', 'SUCCESS', 'https://youtube.com/shorts/x', 1), ('col', 'instagram', 'SUCCESS', 'https://www.instagram.com/reel/x/', 1);`);
  const p = newPost('col', ['image', 'image']);
  assert.equal(reels(['post', 'register', 'col', p.dir]).code, 0);
  assert.equal(reels(['approve', 'col', '--post', '--platforms', 'instagram_post', '--quote', 'yes']).code, 0);
  reels(['text', 'col', 'instagram_post', '--body', 'THE POST CAPTION']);
  // the reel's SUCCESS rows do not block the post, and the post sends its own caption
  const r = dry('col');
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /\| THE POST CAPTION/); assert.doesNotMatch(r.out, /THE REEL CAPTION/);
  // a SUCCESS on instagram_post blocks the post, but autopublish of the reel does not see it as "already posted"
  addItem('col2', 'paper');
  sql("INSERT INTO post_texts (item_id, platform, body) VALUES ('col2', 'youtube', 'yt'), ('col2', 'instagram', 'reel caption')");
  const q = newPost('col2', ['image', 'image']);
  reels(['post', 'register', 'col2', q.dir]); reels(['text', 'col2', 'instagram_post', '--body', 'post caption']);
  sql("INSERT INTO posts (label, platform, status, url) VALUES ('col2', 'instagram_post', 'SUCCESS', 'https://www.instagram.com/p/x/')");
  assert.match(dry('col2').out, /already posted to instagram_post/);
  const ap = reels(['autopublish', 'col2', '--dry-run']);
  assert.doesNotMatch(ap.out, /already posted/, 'the reel has not been posted; the post must not make it look posted');
  // and the other way: mark-deleted on the reel key leaves the post's SUCCESS alone
  assert.match(reels(['mark-deleted', 'col2', 'instagram']).out, /^0 instagram post\(s\)/);
  assert.match(dry('col2').out, /already posted to instagram_post/);
  // the reel publish command refuses post keys (REELS_NO_PUBLISH=1 as well, so nothing could be uploaded even if it did not)
  const pub = reels(['publish', 'col', '--platforms', 'instagram_post'], { REELS_NO_PUBLISH: '1' });
  assert.notEqual(pub.code, 0); assert.match(pub.out, /instagram_post: not a reel platform/); assert.match(pub.out, /publish-post/);
  assert.match(reels(['publish', 'col', '--platforms', 'youtube,threads_post'], { REELS_NO_PUBLISH: '1' }).out, /threads_post: not a reel platform/);
  // the settings check for autopublish still allows only reel platforms
  assert.notEqual(reels(['settings', 'set', 'publish_platforms', 'youtube,instagram_post']).code, 0);
  assert.equal(rows("SELECT value FROM settings WHERE key = 'publish_platforms'")[0].value, 'youtube,instagram');
});
