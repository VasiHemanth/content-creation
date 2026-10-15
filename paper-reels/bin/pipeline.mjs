#!/usr/bin/env node
// Headless runner: one queued link -> /make-reel in a non-interactive Claude Code session -> autopublish decision.
//   node paper-reels/bin/pipeline.mjs [--url <url>] [--dry-run] [--timeout-min 60] [--budget-usd N]
// Steps: health check (abort + notify if unhealthy), claim the next queued row (or queue --url and claim it),
// run claude with publishing blocked (REELS_NO_PUBLISH=1), find the item it made, then run `reels autopublish <id>`
// in a separate process. autopublish posts only if every condition holds and settings.autopublish is on;
// otherwise the row ends as needs_review and a notification goes out. Full log: <data>/logs/pipeline-<ts>.log
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { open, ROOT as CC, LOG_DIR, claimNext, getSetting } from '../../lib/db.mjs';
import { notify } from '../../lib/notify.mjs';
import { parseId } from '../src/arxiv.mjs';

const argv = process.argv.slice(2);
const opt = (f, d = null) => { const i = argv.indexOf(f); return i === -1 ? d : argv[i + 1]; };
const DRY = argv.includes('--dry-run');
const TIMEOUT_MIN = +opt('--timeout-min', 60);
const BUDGET = opt('--budget-usd');
const REELS = path.join(CC, 'paper-reels', 'bin', 'reels.mjs');
const HEALTH = path.join(CC, 'paper-reels', 'bin', 'health.mjs');

// Flags checked against `claude --help` and a smoke run of claude 2.1.288 (all parse; init reported permissionMode acceptEdits).
// The subagent tool is listed as `Task` in that version's init message and as `Agent` in newer docs, so both are allowed.
const ALLOWED = 'Bash Read Write Edit Grep Glob WebFetch WebSearch Agent Task Skill';
// Belt and braces only; the real guard is REELS_NO_PUBLISH in reels.mjs, which these patterns cannot be talked around.
const DENIED = 'Bash(*upload.js*) Bash(*reels.mjs publish*) Bash(*reels.mjs autopublish*) Bash(*reels.mjs settings set*)';
const UNATTENDED = [
  'This is an unattended scheduled run. No human will read or answer anything until it ends.',
  'Do not ask for approval and do not publish: publishing is disabled in this session and is decided afterwards by `reels autopublish`.',
  'Run the producer and validator as the make-reel skill says. Do not record reviews yourself; only the reviewing agents do that.',
  'Finish by printing one line `ITEM_ID: <item id>` and the final verdict.',
].join(' ');

const claudeArgs = (url) => {
  const a = ['-p', `/make-reel ${url}`, '--permission-mode', 'acceptEdits', '--permission-prompts', 'none',
    '--allowedTools', ALLOWED, '--disallowedTools', DENIED, '--append-system-prompt', UNATTENDED,
    '--output-format', 'stream-json', '--verbose'];
  if (BUDGET) a.push('--max-budget-usd', BUDGET);
  return a;
};
const shq = (s) => (/^[\w./:=,@-]+$/.test(s) ? s : `'${s.replace(/'/g, `'\\''`)}'`);

const db = open();

if (DRY) {
  const peek = opt('--url') || (db.prepare("SELECT url FROM queue WHERE status = 'queued' AND attempts < ? ORDER BY id LIMIT 1").get(+getSetting(db, 'max_attempts') || 2) || {}).url;
  console.log('DRY RUN. Nothing is claimed, run or posted.');
  console.log(`1. node ${HEALTH}`);
  if (!peek) { console.log('2. queue is empty: nothing to run'); process.exit(0); }
  console.log(`2. cd ${CC} && REELS_NO_PUBLISH=1 claude ${claudeArgs(peek).map(shq).join(' ')}`);
  console.log(`   (timeout ${TIMEOUT_MIN} min, log ${path.join(LOG_DIR, 'pipeline-<ts>.log')})`);
  console.log(`3. node ${REELS} autopublish <item id>   (autopublish is ${getSetting(db, 'autopublish')})`);
  process.exit(0);
}

fs.mkdirSync(LOG_DIR, { recursive: true });
const ts = new Date().toISOString().replace(/[:.]/g, '-');
const logPath = path.join(LOG_DIR, `pipeline-${ts}.log`);
const log = (s) => { const line = `[${new Date().toISOString()}] ${s}\n`; fs.appendFileSync(logPath, line); process.stdout.write(line); };

// One runner at a time.
const LOCK = path.join(LOG_DIR, 'pipeline.lock');
try { fs.writeFileSync(LOCK, String(process.pid), { flag: 'wx' }); }
catch {
  const pid = +fs.readFileSync(LOCK, 'utf8');
  let alive = false; try { process.kill(pid, 0); alive = true; } catch {}
  if (alive) { console.log(`another pipeline run (pid ${pid}) is in progress; exiting`); process.exit(0); }
  fs.writeFileSync(LOCK, String(process.pid));
}
const unlock = () => { try { if (+fs.readFileSync(LOCK, 'utf8') === process.pid) fs.rmSync(LOCK); } catch {} };
process.on('exit', unlock);

const runRow = (queueId) => db.prepare('INSERT INTO pipeline_runs (queue_id, log_path) VALUES (?, ?) RETURNING id').get(queueId, logPath).id;
const endRun = (id, outcome) => db.prepare('UPDATE pipeline_runs SET finished_at = CURRENT_TIMESTAMP, outcome = ? WHERE id = ?').run(outcome, id);

// ---- 1. health
const h = spawnSync('node', [HEALTH], { cwd: CC, encoding: 'utf8', timeout: 180000 });
fs.appendFileSync(logPath, h.stdout + h.stderr);
if (h.status !== 0) {
  endRun(runRow(null), 'unhealthy');
  const why = (h.stdout.match(/UNHEALTHY: (.*)/) || [])[1] || 'health check did not finish';
  log(`health check failed: ${why}`);
  notify('run aborted', `Health check failed: ${why}. Log: ${logPath}`, 'error');
  process.exit(1);
}
log('health OK');

// ---- 2. claim
// A row stuck in 'running' long after the timeout means a runner died; count it as a failed attempt.
db.prepare("UPDATE queue SET status = 'failed', error = 'runner died (stale running row)', finished_at = CURRENT_TIMESTAMP WHERE status = 'running' AND started_at < datetime('now', ?)").run(`-${TIMEOUT_MIN * 2} minutes`);
let q;
if (opt('--url')) {   // run exactly this link: reuse its open row or add one, then claim that row by id
  const u = opt('--url');
  const row = db.prepare("SELECT id, status FROM queue WHERE url = ? AND status IN ('queued','running') ORDER BY id LIMIT 1").get(u);
  if (row && row.status === 'running') { log(`${u} is already running as #${row.id}; exiting`); process.exit(0); }
  const id = row ? row.id : db.prepare('INSERT INTO queue (url) VALUES (?) RETURNING id').get(u).id;
  q = db.prepare("UPDATE queue SET status = 'running', started_at = CURRENT_TIMESTAMP, finished_at = NULL, attempts = attempts + 1 WHERE id = ? RETURNING *").get(id);
} else q = claimNext(db);
if (!q) { log('queue empty, nothing to do'); fs.rmSync(logPath, { force: true }); process.exit(0); }
const runId = runRow(q.id);
const max = +getSetting(db, 'max_attempts') || 2;
log(`queue #${q.id} ${q.url} attempt ${q.attempts}/${max}`);

const fail = (outcome, error) => {
  const retry = q.attempts < max;
  db.prepare('UPDATE queue SET status = ?, error = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?').run(retry ? 'queued' : 'failed', error, q.id);
  endRun(runId, outcome);
  log(`${outcome}: ${error}${retry ? ' (will retry next run)' : ' (no attempts left)'}`);
  notify(retry ? 'run failed, will retry' : 'run failed', `#${q.id} ${q.url}: ${error}. Log: ${logPath}`, 'error');
  process.exit(1);
};

// ---- 3. produce + validate, headless
const args = claudeArgs(q.url);
log(`cd ${CC} && REELS_NO_PUBLISH=1 claude ${args.map(shq).join(' ')}`);
const out = fs.openSync(logPath, 'a');
const child = spawn('claude', args, { cwd: CC, stdio: ['ignore', out, out], detached: true, env: { ...process.env, REELS_NO_PUBLISH: '1' } });
let timedOut = false;
const timer = setTimeout(() => {
  timedOut = true;
  try { process.kill(-child.pid, 'SIGTERM'); } catch {}
  setTimeout(() => { try { process.kill(-child.pid, 'SIGKILL'); } catch {} }, 15000).unref();   // whole group, so no render keeps the lock
}, TIMEOUT_MIN * 60e3);
const code = await new Promise((res) => { child.on('exit', (c, sig) => res(c ?? sig)); child.on('error', (e) => res(`spawn error: ${e.message}`)); });
clearTimeout(timer); fs.closeSync(out);
if (timedOut) fail('timeout', `claude run exceeded ${TIMEOUT_MIN} min`);
if (code !== 0) fail('failed', `claude exited with ${code}`);

// ---- 4. which item did it make?
const text = fs.readFileSync(logPath, 'utf8');
let itemId = null;
try { const id = parseId(q.url); if (db.prepare('SELECT 1 FROM items WHERE id = ?').get(id)) itemId = id; } catch {}
if (!itemId) itemId = (db.prepare('SELECT id FROM items WHERE source_url = ? ORDER BY added_at DESC LIMIT 1').get(q.url) || {}).id || null;
if (!itemId) { const m = [...text.matchAll(/ITEM_ID: ([\w.-]+)/g)].pop(); if (m && db.prepare('SELECT 1 FROM items WHERE id = ?').get(m[1])) itemId = m[1]; }
if (!itemId) fail('failed', 'could not find the item the run created');
db.prepare('UPDATE queue SET item_id = ? WHERE id = ?').run(itemId, q.id);
if (!db.prepare("SELECT 1 FROM episodes WHERE item_id = ? AND format = '9x16'").get(itemId)) fail('failed', `${itemId}: no 9x16 episode registered`);
log(`item ${itemId}`);

// ---- 5. publish decision, in its own process without REELS_NO_PUBLISH
const env = { ...process.env }; delete env.REELS_NO_PUBLISH;
const ap = spawnSync('node', [REELS, 'autopublish', itemId], { cwd: CC, encoding: 'utf8', env, timeout: 30 * 60e3 });
fs.appendFileSync(logPath, ap.stdout + ap.stderr);
if (ap.status === 0) {
  db.prepare("UPDATE queue SET status = 'done', error = NULL, finished_at = CURRENT_TIMESTAMP WHERE id = ?").run(q.id);
  endRun(runId, 'done'); log(`${itemId} posted`);   // autopublish already notified
} else if (ap.status === 3) {
  db.prepare("UPDATE queue SET status = 'needs_review', finished_at = CURRENT_TIMESTAMP WHERE id = ?").run(q.id);
  endRun(runId, 'needs_review'); log(`${itemId} needs review:\n${ap.stdout.trim()}`);   // autopublish already notified
} else {
  db.prepare("UPDATE queue SET status = 'needs_review', error = ?, finished_at = CURRENT_TIMESTAMP WHERE id = ?").run(`autopublish exited ${ap.status}`, q.id);
  endRun(runId, 'needs_review');
  log(`autopublish exited ${ap.status}`);
  notify('publish step failed', `${itemId}: autopublish exited ${ap.status}. Log: ${logPath}`, 'error');
  process.exit(1);
}
