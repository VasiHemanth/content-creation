// Notifications for unattended runs: a macOS banner plus a line in <data>/logs/notifications.log.
// Never throws. A failed notification must not take a run down with it.
//   NOTIFY_LOG=<file>   write the log line somewhere else (tests)
//   NOTIFY_OSASCRIPT=0  skip the macOS banner (tests, headless machines)
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { LOG_DIR } from './db.mjs';

export const NOTIFY_LOG = process.env.NOTIFY_LOG || path.join(LOG_DIR, 'notifications.log');
const q = (s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ')}"`;

export function notify(title, message, level = 'info') {
  try {
    fs.mkdirSync(path.dirname(NOTIFY_LOG), { recursive: true });
    fs.appendFileSync(NOTIFY_LOG, `${new Date().toISOString()} [${level}] ${title}: ${String(message).replace(/\n/g, ' | ')}\n`);
  } catch (e) { try { console.error('notify: could not write log:', e.message); } catch {} }
  if (process.env.NOTIFY_OSASCRIPT === '0') return;
  try {
    execFileSync('osascript', ['-e', `display notification ${q(String(message).slice(0, 240))} with title ${q('Reels: ' + title)}`], { stdio: 'ignore', timeout: 10000 });
  } catch {}
}
