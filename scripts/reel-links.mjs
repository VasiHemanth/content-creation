#!/usr/bin/env node
// Print the live post URLs of one item as JSON: node scripts/reel-links.mjs <item id>
// Reads data/content.sqlite read-only. Output: {"id":"...","instagram":"url|null","youtube":"url|null","threads_thread":"url|null"}
import { DatabaseSync } from 'node:sqlite';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const id = process.argv[2];
if (!id) { console.error('usage: reel-links.mjs <item id>'); process.exit(2); }
const db = new DatabaseSync(process.env.TRACKER_DB || join(root, 'data', 'content.sqlite'), { readOnly: true });
const out = { id, instagram: null, youtube: null, threads_thread: null };
for (const p of Object.keys(out).filter((k) => k !== 'id')) {
  const r = db.prepare("SELECT url FROM posts WHERE label = ? AND platform = ? AND status = 'SUCCESS' ORDER BY id DESC LIMIT 1").get(id, p);
  if (r?.url) out[p] = r.url;
}
console.log(JSON.stringify(out));
