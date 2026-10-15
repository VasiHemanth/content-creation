#!/usr/bin/env node
// Preflight for unattended runs. Prints a table; exits 1 if any critical check FAILs.
//   node paper-reels/bin/health.mjs [--backup] [--offline]
//   --backup   VACUUM INTO <data>/backups/content-YYYY-MM-DD.sqlite, keep the newest 14 of those
//   --offline  skip the network checks (YouTube whoami, Meta debug_token)
// Never prints tokens or secrets. Token checks are critical only while autopublish is on;
// with autopublish off a run only produces and validates, so a dead token is a warning.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { open, ROOT as CC, BACKUP_DIR, snapshot, getSetting } from '../../lib/db.mjs';

const args = process.argv.slice(2);
const UPLOADER = path.join(CC, 'uploader');
const DAY = 86400e3;
const rows = [];
const add = (check, status, detail = '') => rows.push({ check, status, detail: String(detail) });
const days = (ms) => Math.max(0, ms / DAY).toFixed(1);

// ---- database
let db = null;
try {
  db = open();
  const ic = db.prepare('PRAGMA integrity_check').get().integrity_check;
  add('sqlite integrity', ic === 'ok' ? 'OK' : 'FAIL', ic);
} catch (e) { add('sqlite opens', 'FAIL', e.message); }
const autopublish = db ? getSetting(db, 'autopublish') : 'off';
const platforms = db ? getSetting(db, 'publish_platforms').split(',').map((s) => s.trim()) : [];
const tokenFail = autopublish === 'on' ? 'FAIL' : 'WARN';

// ---- tools
for (const [bin, a] of [['ffmpeg', ['-version']], ['ffprobe', ['-version']], ['claude', ['--version']], ['node', ['--version']]]) {
  const r = spawnSync(bin, a, { encoding: 'utf8', timeout: 20000 });
  add(`${bin} present`, r.status === 0 ? 'OK' : 'FAIL', r.status === 0 ? r.stdout.split('\n')[0].slice(0, 60) : (r.error ? r.error.code : r.stderr.slice(0, 80)));
}

// ---- disk
try {
  const s = fs.statfsSync(CC); const free = s.bavail * s.bsize;
  add('disk free > 5 GB', free > 5 * 2 ** 30 ? 'OK' : 'FAIL', `${(free / 2 ** 30).toFixed(1)} GB free`);
} catch (e) { add('disk free > 5 GB', 'FAIL', e.message); }

// ---- secrets file (parsed here so nothing gets printed; values are never logged)
const env = {};
try {
  for (const line of fs.readFileSync(path.join(UPLOADER, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
} catch { add('uploader/.env', 'FAIL', 'missing or unreadable'); }

// ---- YouTube
// While the OAuth consent screen is in Testing, Google kills the refresh token 7 days after consent.
// The stored file carries refresh_token_expires_in (seconds left when the file was last written), so
// expiry ~ mtime + refresh_token_expires_in. The file is rewritten on every access-token refresh, so read it before whoami.
const tokFile = path.join(UPLOADER, 'youtube_tokens.json');
if (!fs.existsSync(tokFile)) add('youtube token', tokenFail, 'youtube_tokens.json missing; run: node uploader/scripts/youtube_auth.js');
else {
  const st = fs.statSync(tokFile); let tok = {};
  try { tok = JSON.parse(fs.readFileSync(tokFile, 'utf8')); } catch { add('youtube token file', 'FAIL', 'not valid JSON'); }
  if (tok.refresh_token_expires_in) {
    const left = st.mtimeMs + tok.refresh_token_expires_in * 1000 - Date.now();
    add('youtube refresh token expiry', left <= 0 ? tokenFail : left < 2 * DAY ? 'WARN' : 'OK',
      left <= 0 ? 'expired (consent screen in Testing); re-run uploader/scripts/youtube_auth.js' : `about ${days(left)} days left (Testing mode: 7-day refresh tokens)`);
  } else if (!tok.refresh_token) add('youtube refresh token', tokenFail, 'no refresh_token in file');
  const age = Date.now() - st.mtimeMs;
  if (age > 6 * DAY) add('youtube token file age', 'WARN', `${days(age)} days old; in Testing mode the refresh token dies at 7 days`);
  if (!args.includes('--offline') && tok.refresh_token) {
    const r = spawnSync('node', ['-e', "require('./src/youtube.js').whoami().then((c) => console.log(`${c.title} ${c.handle || ''}`)).catch((e) => { console.error(String(e.message || e).slice(0, 160)); process.exit(1); })"],
      { cwd: UPLOADER, encoding: 'utf8', timeout: 45000 });
    add('youtube whoami', r.status === 0 ? 'OK' : tokenFail, r.status === 0 ? `channel: ${r.stdout.trim()}` : (r.error ? 'timed out' : r.stderr.trim().split('\n').pop()));
  }
}

// ---- Meta (Instagram / Threads)
if (!env.META_ACCESS_TOKEN) add('meta token', platforms.includes('instagram') ? tokenFail : 'WARN', 'META_ACCESS_TOKEN not set');
else if (args.includes('--offline')) add('meta token', 'WARN', 'skipped (--offline)');
else {
  try {
    const t = encodeURIComponent(env.META_ACCESS_TOKEN);
    const res = await fetch(`https://graph.facebook.com/${env.META_GRAPH_VERSION || 'v21.0'}/debug_token?input_token=${t}&access_token=${t}`, { signal: AbortSignal.timeout(20000) });
    const j = await res.json().catch(() => ({}));
    const d = j.data;
    if (!d) add('meta token', tokenFail, `debug_token failed: ${(j.error && j.error.message) || res.status}`);   // message only; the URL holds the token
    else if (!d.is_valid) add('meta token', tokenFail, 'token is not valid; run: node uploader/scripts/meta_token.js refresh');
    else if (!d.expires_at) {
      const da = d.data_access_expires_at ? d.data_access_expires_at * 1000 - Date.now() : null;   // Meta's 90-day data-access window
      add('meta token', da != null && da < 7 * DAY ? 'WARN' : 'OK', `valid, no expiry${da != null ? `; data access until ${new Date(d.data_access_expires_at * 1000).toISOString().slice(0, 10)}` : ''}`);
    } else {
      const left = d.expires_at * 1000 - Date.now();
      add('meta token', left < 7 * DAY ? 'WARN' : 'OK', `valid, expires ${new Date(d.expires_at * 1000).toISOString().slice(0, 10)} (${days(left)} days)`);
    }
  } catch (e) { add('meta token', 'WARN', `debug_token unreachable: ${e.name}`); }
}

// ---- Cloudinary (config only; Instagram needs it to host the video)
const cld = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].filter((k) => !env[k]);
add('cloudinary config', cld.length ? (platforms.includes('instagram') ? tokenFail : 'WARN') : 'OK', cld.length ? `missing ${cld.join(', ')}` : 'present');

// ---- backups
const DAILY = /^content-\d{4}-\d{2}-\d{2}\.sqlite$/;
if (args.includes('--backup') && db) {
  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const dest = snapshot(db, path.join(BACKUP_DIR, `content-${new Date().toISOString().slice(0, 10)}.sqlite`));
    const old = fs.readdirSync(BACKUP_DIR).filter((f) => DAILY.test(f)).sort().reverse().slice(14);
    for (const f of old) fs.rmSync(path.join(BACKUP_DIR, f));
    add('backup written', 'OK', `${path.basename(dest)}${old.length ? `, pruned ${old.length}` : ''}`);
  } catch (e) { add('backup written', 'FAIL', e.message); }
}
try {
  const files = fs.existsSync(BACKUP_DIR) ? fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith('.sqlite')).map((f) => fs.statSync(path.join(BACKUP_DIR, f)).mtimeMs) : [];
  const newest = Math.max(0, ...files);
  add('last backup < 2 days', !newest ? 'WARN' : Date.now() - newest > 2 * DAY ? 'WARN' : 'OK', newest ? `${days(Date.now() - newest)} days ago` : 'none in data/backups');
} catch (e) { add('last backup < 2 days', 'WARN', e.message); }

add('autopublish', 'OK', `${autopublish} (platforms ${platforms.join(',')})`);
console.table(rows);
const failed = rows.filter((r) => r.status === 'FAIL');
console.log(failed.length ? `UNHEALTHY: ${failed.map((r) => r.check).join(', ')}` : 'HEALTHY');
process.exit(failed.length ? 1 : 0);
