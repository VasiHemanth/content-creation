#!/usr/bin/env node
/**
 * Post a Threads chain from a spec file.
 *
 *   node scripts/post_thread.js ../data/threads/<id>/thread.json [--ig-url URL] [--dry-run] [--force-repost]
 *
 * Spec: { paper, image?: "page1.png" (relative to the spec), topic_tag?: "AI Agents", posts: ["..."] }
 * The folder name is the item id. Post 1 carries the image. Every later post replies to the one before it.
 *
 * `{{IG_URL}}` in a post is replaced by --ig-url. Without --ig-url, the paragraph that holds
 * the placeholder is dropped. A post that ends up empty stops the run.
 *
 * Refuses to post when a threads_thread post already exists for the item (use --force-repost
 * only after the old thread is taken down and marked DELETED). Writes result.json next to the
 * spec and one row to data/content.sqlite (platform threads_thread). Never prints the token.
 */
require('../src/config');
const fs = require('fs');
const path = require('path');
const { hostFile } = require('../src/host');

const BASE = 'https://graph.threads.net/v1.0';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n) => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : undefined; };

async function call(method, url, params) {
  const body = new URLSearchParams({ ...params, access_token: process.env.THREADS_ACCESS_TOKEN });
  const res = method === 'GET' ? await fetch(`${url}?${body}`) : await fetch(url, { method, body });
  const json = await res.json();
  if (!res.ok) {
    const e = json.error || {};
    throw new Error(`Threads API ${res.status} code ${e.code}: ${e.message}`);
  }
  return json;
}

async function waitFinished(containerId) {
  for (let i = 0; i < 30; i++) {
    const s = await call('GET', `${BASE}/${containerId}`, { fields: 'status,error_message' });
    if (s.status === 'FINISHED') return;
    if (s.status === 'ERROR' || s.status === 'EXPIRED') throw new Error(`container ${containerId} ${s.status}: ${s.error_message || ''}`);
    await sleep(3000);
  }
  throw new Error(`container ${containerId} not FINISHED after 90 s`);
}

function fillPlaceholder(text, igUrl) {
  if (!text.includes('{{IG_URL}}')) return text;
  if (igUrl) return text.split('{{IG_URL}}').join(igUrl);
  return text.split(/\n{2,}/).filter((p) => !p.includes('{{IG_URL}}')).join('\n\n').trim();
}

function openDb() {
  try {
    const { DatabaseSync } = require('node:sqlite');
    return new DatabaseSync(process.env.TRACKER_DB || path.join(__dirname, '..', '..', 'data', 'content.sqlite'));
  } catch (e) { return null; }
}

async function main() {
  const specPath = path.resolve(argv.find((a) => !a.startsWith('--') && a !== opt('--ig-url')) || '');
  const dry = flag('--dry-run');
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const itemId = path.basename(path.dirname(specPath));
  const igUrl = opt('--ig-url');
  const uid = process.env.THREADS_USER_ID;
  if (!uid || !process.env.THREADS_ACCESS_TOKEN) throw new Error('Set THREADS_USER_ID and THREADS_ACCESS_TOKEN in .env');

  const exp = process.env.THREADS_TOKEN_EXPIRES_AT && Date.parse(process.env.THREADS_TOKEN_EXPIRES_AT);
  if (exp && exp - Date.now() < 7 * 864e5) console.warn(`warning: Threads token expires ${process.env.THREADS_TOKEN_EXPIRES_AT}; run scripts/threads_refresh.js`);

  const posts = spec.posts.map((p) => fillPlaceholder(p, igUrl));
  posts.forEach((p, i) => {
    const n = Buffer.byteLength(p, 'utf8');
    if (!p) throw new Error(`post ${i + 1} is empty after placeholder handling`);
    if (n > 500) throw new Error(`post ${i + 1} is ${n} bytes, limit 500`);
    if (p.includes('{{')) throw new Error(`post ${i + 1} still has a placeholder`);
  });
  if (spec.image && !fs.existsSync(path.resolve(path.dirname(specPath), spec.image))) throw new Error('image file missing');

  const db = openDb();
  if (db && !flag('--force-repost')) {
    const prev = db.prepare("SELECT url FROM posts WHERE label = ? AND platform = 'threads_thread' AND status = 'SUCCESS' LIMIT 1").get(itemId);
    if (prev) throw new Error(`a thread for ${itemId} is already live (${prev.url}); not posting again`);
  }
  if (dry) {
    console.log(`dry run ok: ${posts.length} posts, image ${spec.image || 'none'}, reel link ${igUrl ? 'yes' : 'no'}`);
    return;
  }

  let imageUrl;
  if (spec.image) {
    imageUrl = await hostFile(path.resolve(path.dirname(specPath), spec.image), { image: true });
    console.log('image hosted');
  }

  const results = [];
  let parent;
  for (let i = 0; i < posts.length; i++) {
    const params = { text: posts[i], media_type: 'TEXT' };
    if (i === 0 && imageUrl) { params.media_type = 'IMAGE'; params.image_url = imageUrl; }
    if (i === 0 && spec.topic_tag) params.topic_tag = spec.topic_tag;
    if (parent) params.reply_to_id = parent;

    const c = await call('POST', `${BASE}/${uid}/threads`, params);
    await waitFinished(c.id);
    const p = await call('POST', `${BASE}/${uid}/threads_publish`, { creation_id: c.id });
    const info = await call('GET', `${BASE}/${p.id}`, { fields: 'permalink,is_reply,replied_to' });
    if (i > 0 && !(info.is_reply && info.replied_to && info.replied_to.id === parent)) {
      throw new Error(`post ${i + 1} is live (${info.permalink}) but did not attach as a reply to post ${i}; stop and check by hand`);
    }
    results.push({ n: i + 1, id: p.id, permalink: info.permalink });
    console.log(`post ${i + 1}/${posts.length} live: ${info.permalink}`);
    fs.writeFileSync(path.join(path.dirname(specPath), 'result.json'), JSON.stringify(results, null, 2));
    parent = p.id;
    await sleep(2000);
  }

  if (db) {
    try {
      db.prepare("INSERT INTO posts (label, platform, status, url) VALUES (?, 'threads_thread', 'SUCCESS', ?)").run(itemId, results[0].permalink);
    } catch (e) { console.warn('could not record the thread in the database:', e.message); }
  }
  console.log(`done: ${results[0].permalink}`);
}

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
