// The only thing code writes into the wiki: append-only log lines.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './db.mjs';

// WIKI_LOG redirects the log (a sandbox run against a copied database sets it so the real wiki is not touched).
const LOG = process.env.WIKI_LOG || path.join(ROOT, 'llm-wiki', 'log.md');
export function wikilog(op, title, detail = '') {
  const day = new Date().toISOString().slice(0, 10);
  fs.appendFileSync(LOG, `\n## [${day}] ${op} | ${title}\n${detail ? detail + '\n' : ''}`);
}
