// Adds a published paper to the public Notion "Research Paper Vault" page.
//   node lib/notion-vault.mjs add <item id> [--dry-run]
//   node lib/notion-vault.mjs sync [--dry-run]     every published paper that is not on the page yet
// Token: NOTION_TOKEN in the environment or in uploader/.env. Page and category headings: lib/notion-vault.json.
// A paper is added once. The page itself is checked for the arXiv link, so entries made by hand count.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { open, ROOT } from './db.mjs';

const cfg = JSON.parse(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'notion-vault.json'), 'utf8'));
const API = process.env.NOTION_API_BASE || 'https://api.notion.com/v1';   // override only in tests

function token() {
  if (process.env.NOTION_TOKEN) return process.env.NOTION_TOKEN;
  try {
    const m = fs.readFileSync(path.join(ROOT, 'uploader', '.env'), 'utf8').match(/^NOTION_TOKEN=(.+)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  } catch {}
  throw new Error('NOTION_TOKEN is not set (environment or uploader/.env)');
}

async function api(method, url, body) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const r = await fetch(API + url, {
      method,
      headers: { Authorization: `Bearer ${token()}`, 'Notion-Version': cfg.notionVersion, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (r.status === 429) { await new Promise((s) => setTimeout(s, (Number(r.headers.get('retry-after')) || 1) * 1000)); continue; }
    if (!r.ok) throw new Error(`Notion ${method} ${url} -> ${r.status}: ${(await r.text()).slice(0, 300)}`);
    return r.json();
  }
  throw new Error(`Notion ${method} ${url}: still rate limited after 5 tries`);
}

async function pageBlocks() {
  const out = []; let cursor;
  do {
    const r = await api('GET', `/blocks/${cfg.pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`);
    out.push(...r.results); cursor = r.has_more ? r.next_cursor : null;
  } while (cursor);
  return out;
}

const text = (b) => (b[b.type]?.rich_text || []).map((t) => t.plain_text).join('');
// A section title is any block that is not a bullet: the page uses plain paragraphs for the first three, a heading_2 for later ones.
const isTitle = (b) => b.type !== 'bulleted_list_item' && text(b).trim() !== '';
const links = (b) => (b[b.type]?.rich_text || []).map((t) => t.href || t.text?.link?.url).filter(Boolean);

function entry(it) {
  const rt = [
    { type: 'text', text: { content: it.title }, annotations: { bold: true } },
    { type: 'text', text: { content: '\nLink: ' } },
    { type: 'text', text: { content: it.source_url, link: { url: it.source_url } } },
  ];
  if (it.one_liner) rt.push({ type: 'text', text: { content: `\nFocus: ${it.one_liner}` } });
  return { object: 'block', type: 'bulleted_list_item', bulleted_list_item: { rich_text: rt } };
}

const headingFor = (topic) => cfg.categories[topic] || String(topic || 'More papers').replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

// Returns 'added' | 'present' | 'dry-run'.
export async function addToVault(db, id, { dry = false } = {}) {
  const it = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  if (!it) throw new Error(`Unknown item ${id}`);
  if (it.kind !== 'paper') throw new Error(`${id} is a ${it.kind}, the vault lists papers only`);
  const blocks = await pageBlocks();
  const have = new Set(blocks.flatMap(links));
  if (have.has(it.source_url)) { record(db, id); return 'present'; }
  const heading = headingFor(it.topic);
  const hi = blocks.findIndex((b) => isTitle(b) && text(b).trim() === heading);
  if (dry) return `dry-run: would add under "${heading}" (${hi < 0 ? 'new heading at the end' : 'existing heading'})`;
  if (hi < 0) {
    const h = { object: 'block', type: 'heading_2', heading_2: { rich_text: [{ type: 'text', text: { content: heading } }] } };
    await api('PATCH', `/blocks/${cfg.pageId}/children`, { children: [h, entry(it)] });
  } else {
    let last = hi;
    for (let i = hi + 1; i < blocks.length && blocks[i].type === 'bulleted_list_item'; i++) last = i;
    await api('PATCH', `/blocks/${cfg.pageId}/children`, { children: [entry(it)], after: blocks[last].id });
  }
  record(db, id);
  return 'added';
}

function record(db, id) {
  db.exec('CREATE TABLE IF NOT EXISTS notion_vault (item_id TEXT PRIMARY KEY, added_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)');
  db.prepare('INSERT OR IGNORE INTO notion_vault (item_id) VALUES (?)').run(id);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [cmd, arg] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const dry = process.argv.includes('--dry-run');
  const db = open();
  try {
    if (cmd === 'add' && arg) console.log(`${arg}: ${await addToVault(db, arg, { dry })}`);
    else if (cmd === 'sync') {
      for (const r of db.prepare("SELECT id FROM items WHERE kind = 'paper' AND status = 'published' ORDER BY added_at").all())
        console.log(`${r.id}: ${await addToVault(db, r.id, { dry })}`);
    } else { console.error('usage: notion-vault.mjs add <id> [--dry-run] | sync [--dry-run]'); process.exit(2); }
  } catch (e) { console.error(`notion-vault: ${e.message}`); process.exit(1); }
}
