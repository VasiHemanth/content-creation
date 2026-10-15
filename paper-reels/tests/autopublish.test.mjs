// node --test paper-reels/tests/autopublish.test.mjs
// Runs reels.mjs against a throwaway database (TRACKER_DB in a temp dir). Never touches data/content.sqlite,
// never calls an upload API: every autopublish here is --dry-run or a refusal, and publish is tested only under REELS_NO_PUBLISH.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const REELS = path.resolve(import.meta.dirname, '..', 'bin', 'reels.mjs');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'reels-autopublish-'));
const DB = path.join(tmp, 'content.sqlite');
const NOTIFY_LOG = path.join(tmp, 'notifications.log');
const ID = '2699.00001';
const vdir = path.join(tmp, 'episodes', 'testEp', 'out', 'paper');
const video = path.join(vdir, 'final.mp4'), thumb = path.join(vdir, 'thumb.png');
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const env = { ...process.env, TRACKER_DB: DB, NOTIFY_LOG, NOTIFY_OSASCRIPT: '0', WIKI_LOG: path.join(tmp, 'log.md') };
delete env.REELS_NO_PUBLISH;

const reels = (args, extra = {}) => {
  const r = spawnSync('node', [REELS, ...args], { encoding: 'utf8', env: { ...env, ...extra } });
  return { code: r.status, out: r.stdout + r.stderr };
};
const dry = () => reels(['autopublish', ID, '--dry-run']);
const sql = (q, ...p) => { const db = new DatabaseSync(DB); try { return db.prepare(q).run(...p); } finally { db.close(); } };
const writeValidation = () => fs.writeFileSync(path.join(vdir, 'validation.json'),
  JSON.stringify({ item: ID, verdict: 'PASS', video, video_sha256: sha(video), thumb, thumb_sha256: sha(thumb), checks: [] }));
const clearReviews = () => sql('DELETE FROM reviews');

before(() => {
  assert.ok(DB.startsWith(os.tmpdir()), 'test DB must be in the temp dir');
  fs.mkdirSync(vdir, { recursive: true });
  fs.writeFileSync(video, 'fake video v1'); fs.writeFileSync(thumb, 'fake thumb');
  assert.equal(reels(['settings']).code, 0);   // creates the schema at v2
  sql("INSERT INTO items (id, kind, title, source_url, tags) VALUES (?, 'paper', 'Test paper', 'https://arxiv.org/abs/2699.00001', '[]')", ID);
  sql("INSERT INTO episodes (item_id, format, video_path, thumb_path, duration_s) VALUES (?, '9x16', ?, ?, 60)", ID, video, thumb);
  sql("INSERT INTO post_texts (item_id, platform, title, body) VALUES (?, 'youtube', 'T', 'B'), (?, 'instagram', NULL, 'C')", ID, ID);
  sql("INSERT INTO queue (url, status, item_id, attempts) VALUES ('https://arxiv.org/abs/2699.00001', 'running', ?, 1)", ID);
  writeValidation();
});
after(() => fs.rmSync(tmp, { recursive: true, force: true }));

test('schema defaults: autopublish starts off', () => {
  assert.match(reels(['settings', 'get', 'autopublish']).out, /^off/);
});

test('refuses when autopublish setting is off, even with good reviews', () => {
  reels(['review', ID, '--kind', 'critic', '--verdict', 'PASS', '--score', '9']);
  reels(['review', ID, '--kind', 'facts', '--verdict', 'PASS']);
  const r = dry();
  assert.equal(r.code, 3); assert.match(r.out, /REFUSE/); assert.match(r.out, /setting autopublish is 'off'/);
  assert.equal(r.out.split('\n').filter((l) => l.startsWith('  - ')).length, 1, 'only the setting fails');
  // the real (non dry-run) refusal marks the queue row and notifies
  const live = reels(['autopublish', ID]);
  assert.equal(live.code, 3);
  const db = new DatabaseSync(DB); const q = db.prepare('SELECT status FROM queue WHERE item_id = ?').get(ID); db.close();
  assert.equal(q.status, 'needs_review');
  assert.match(fs.readFileSync(NOTIFY_LOG, 'utf8'), /ready for review/);
  clearReviews();
});

test('refuses on missing reviews', () => {
  assert.equal(reels(['settings', 'set', 'autopublish', 'on']).code, 0);
  const r = dry();
  assert.equal(r.code, 3); assert.match(r.out, /no critic review recorded/); assert.match(r.out, /no facts review recorded/);
});

test('refuses on a FAIL review', () => {
  reels(['review', ID, '--kind', 'critic', '--verdict', 'PASS', '--score', '8']);
  reels(['review', ID, '--kind', 'facts', '--verdict', 'FAIL', '--notes', 'baseline number not in paper']);
  const r = dry();
  assert.equal(r.code, 3); assert.match(r.out, /latest facts review #\d+ is FAIL/); assert.doesNotMatch(r.out, /critic/);
  clearReviews();
});

test('refuses when critic score is below min_critic_score', () => {
  reels(['review', ID, '--kind', 'critic', '--verdict', 'PASS', '--score', '6.5']);
  reels(['review', ID, '--kind', 'facts', '--verdict', 'PASS']);
  const r = dry();
  assert.equal(r.code, 3); assert.match(r.out, /critic score 6.5 is below min_critic_score 7/);
  clearReviews();
});

test('refuses when a critic review has no score', () => {
  reels(['review', ID, '--kind', 'critic', '--verdict', 'PASS']);
  reels(['review', ID, '--kind', 'facts', '--verdict', 'PASS']);
  assert.match(dry().out, /critic score missing/);
  clearReviews();
});

test('permits (dry run) only when everything holds', () => {
  reels(['review', ID, '--kind', 'critic', '--verdict', 'PASS', '--score', '7']);
  reels(['review', ID, '--kind', 'facts', '--verdict', 'PASS']);
  const r = dry();
  assert.equal(r.code, 0, r.out); assert.match(r.out, /WOULD PUBLISH to youtube,instagram/);
  // dry run has no side effects on the queue
  const db = new DatabaseSync(DB); const q = db.prepare('SELECT status FROM queue WHERE item_id = ?').get(ID); db.close();
  assert.equal(q.status, 'needs_review');
});

test('refuses when the reviewed video hash differs from the current file', () => {
  // reviews from the previous test judged "fake video v1"; re-render and re-validate, but do not re-review
  fs.writeFileSync(video, 'fake video v2');
  let r = dry();
  assert.equal(r.code, 3); assert.match(r.out, /validation gate: The video or thumbnail changed since validation/);
  writeValidation();   // validator passed the new file, reviews are still for the old one
  r = dry();
  assert.equal(r.code, 3);
  assert.doesNotMatch(r.out, /validation gate/);
  assert.match(r.out, /critic review #\d+ judged video \w{12}, current file is \w{12}/);
  assert.match(r.out, /facts review #\d+ judged video/);
  // fresh reviews of the new file make it pass again
  reels(['review', ID, '--kind', 'critic', '--verdict', 'PASS', '--score', '8']);
  reels(['review', ID, '--kind', 'facts', '--verdict', 'PASS']);
  assert.equal(dry().code, 0);
});

test('refuses on validation FAIL', () => {
  const f = path.join(vdir, 'validation.json');
  const rep = JSON.parse(fs.readFileSync(f, 'utf8')); fs.writeFileSync(f, JSON.stringify({ ...rep, verdict: 'FAIL' }));
  assert.match(dry().out, /Validation verdict is FAIL/);
  writeValidation();
});

test('refuses when already posted, allows after the post is marked DELETED', () => {
  sql("INSERT INTO posts (label, platform, status, url) VALUES (?, 'youtube', 'SUCCESS', 'https://youtube.com/shorts/x')", ID);
  assert.match(dry().out, /already posted to youtube/);
  assert.equal(reels(['mark-deleted', ID, 'youtube']).code, 0);
  assert.equal(dry().code, 0);
});

test('min_critic_score changes take effect; bad setting values are rejected', () => {
  assert.equal(reels(['settings', 'set', 'min_critic_score', '9']).code, 0);
  assert.match(dry().out, /below min_critic_score 9/);
  assert.equal(reels(['settings', 'set', 'min_critic_score', '7']).code, 0);
  assert.notEqual(reels(['settings', 'set', 'autopublish', 'yes']).code, 0, 'bad values are rejected');
});

test('publishing and settings changes are blocked inside an unattended producer run', () => {
  const p = reels(['publish', ID, '--platforms', 'youtube'], { REELS_NO_PUBLISH: '1' });
  assert.notEqual(p.code, 0); assert.match(p.out, /REELS_NO_PUBLISH/);
  const s = reels(['settings', 'set', 'autopublish', 'off'], { REELS_NO_PUBLISH: '1' });
  assert.notEqual(s.code, 0); assert.match(s.out, /REELS_NO_PUBLISH/);
});

test('queue: add, next claims and counts attempts, max_attempts is enforced', () => {
  reels(['queue', 'add', 'https://arxiv.org/abs/2699.00002']);
  assert.match(reels(['queue', 'add', 'https://arxiv.org/abs/2699.00002']).out, /already queued/);
  const n = JSON.parse(reels(['queue', 'next']).out);
  assert.equal(n.status, 'running'); assert.equal(n.attempts, 1);
  sql("UPDATE queue SET status = 'queued', attempts = 2 WHERE id = ?", n.id);
  assert.match(reels(['queue', 'next']).out, /queue empty/, 'rows at max_attempts are not claimed');
  assert.match(reels(['queue', 'retry', String(n.id)]).out, /attempts reset/);
  assert.equal(JSON.parse(reels(['queue', 'next']).out).id, n.id);
  assert.match(reels(['queue', 'fail', String(n.id), '--error', 'boom']).out, /failed/);
});

test('publish: refuses without a recorded approval, posts only what was approved, and approve refuses an unattended run', () => {
  const pub = (args = [], extra = {}) => reels(['publish', ID, '--dry-run', ...args], extra);
  const approval = path.join(vdir, 'approval.json');
  fs.rmSync(approval, { force: true });
  writeValidation();
  let r = pub(['--platforms', 'youtube,instagram']);
  assert.equal(r.code, 3); assert.match(r.out, /DRY RUN publish .*: REFUSE/);
  assert.match(r.out, /approval gate: No recorded approval\. .*approve 2699\.00001 --platforms youtube,instagram --quote/);
  assert.equal(r.out.split('\n').filter((l) => l.startsWith('  - ')).length, 1, 'only the approval fails');
  assert.equal(reels(['publish', ID, '--platforms', 'youtube']).code, 3, 'a real publish refuses before any upload');
  const a1 = reels(['approve', ID, '--platforms', 'youtube,instagram', '--quote', 'yes'], { REELS_NO_PUBLISH: '1' });
  assert.notEqual(a1.code, 0); assert.match(a1.out, /only the human can approve/);
  assert.notEqual(reels(['approve', ID, '--platforms', 'youtube']).code, 0, 'a quote is required');
  const a = reels(['approve', ID, '--platforms', 'youtube,instagram', '--quote', 'Looks good, post it']);
  assert.equal(a.code, 0, a.out);
  assert.equal(JSON.parse(fs.readFileSync(approval, 'utf8')).quote, 'Looks good, post it');
  r = pub(['--platforms', 'youtube,instagram']);
  assert.equal(r.code, 0, r.out); assert.match(r.out, /every gate holds, would post to youtube,instagram/);
  r = pub(['--platforms', 'youtube,threads']);
  assert.equal(r.code, 3); assert.match(r.out, /The approval covers youtube,instagram, not threads/);
  // a new render after the approval is stale even once it is validated again
  fs.writeFileSync(video, 'fake video v3'); writeValidation();
  r = pub(['--platforms', 'youtube']);
  assert.equal(r.code, 3); assert.match(r.out, /The files changed since the human approved them \(video_sha256\)/);
  // approve refuses files that did not pass validation
  fs.writeFileSync(video, 'fake video v4');
  r = reels(['approve', ID, '--platforms', 'youtube', '--quote', 'yes']);
  assert.notEqual(r.code, 0); assert.match(r.out, /cannot approve files that did not pass validation/);
  assert.match(fs.readFileSync(path.join(tmp, 'log.md'), 'utf8'), /approve \| 2699\.00001\n- reel for youtube,instagram: "Looks good, post it"/);
});
