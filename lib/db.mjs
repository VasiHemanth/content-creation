// Shared operational database for every content project (paper-reels, future topic shorts).
// Lives outside any git repo: content-creation/data/content.sqlite. Knowledge lives in llm-wiki/ (Markdown).
// Back it up with `VACUUM INTO`, never by copying the live WAL file.
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DB_PATH = process.env.TRACKER_DB || path.join(ROOT, 'data', 'content.sqlite');

const V1 = `
CREATE TABLE IF NOT EXISTS items (          -- one row per piece of content subject (a paper, a topic)
  id TEXT PRIMARY KEY,                      -- arXiv id for papers, kebab-case slug for topics. Also the posts.label.
  kind TEXT NOT NULL,                       -- paper | topic
  title TEXT NOT NULL,
  short_name TEXT,                          -- on-screen name, e.g. SkillSeek
  source_url TEXT NOT NULL,
  topic TEXT,                               -- category slug, matches llm-wiki/wiki/topics/<topic>.md
  one_liner TEXT,                           -- one plain sentence stating the result
  tags TEXT,                                -- JSON array
  thumb_name TEXT, thumb_hook TEXT,         -- thumbnail text; hook may contain \\n
  status TEXT NOT NULL DEFAULT 'queued',    -- queued | scripted | rendered | published
  added_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS paper_meta (
  item_id TEXT PRIMARY KEY REFERENCES items(id),
  authors TEXT NOT NULL,                    -- JSON array
  abstract TEXT NOT NULL,
  primary_cat TEXT, published TEXT,
  arxiv_version TEXT                        -- version the video was made from, e.g. v1
);
CREATE TABLE IF NOT EXISTS episodes (
  item_id TEXT NOT NULL REFERENCES items(id),
  format TEXT NOT NULL,                     -- 9x16 | 16x9
  video_path TEXT NOT NULL, thumb_path TEXT, duration_s REAL,
  rendered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (item_id, format)
);
CREATE TABLE IF NOT EXISTS post_texts (     -- append-only: editing text adds a revision
  item_id TEXT NOT NULL REFERENCES items(id),
  platform TEXT NOT NULL,                   -- youtube | instagram | threads
  revision INTEGER NOT NULL DEFAULT 1,
  title TEXT, body TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (item_id, platform, revision)
);
CREATE TABLE IF NOT EXISTS posts (          -- uploader writes here; label = items.id
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL, platform TEXT NOT NULL, status TEXT NOT NULL,   -- SUCCESS | FAILED | SKIPPED | DELETED (set by hand when a live post is taken down; a repost is then allowed because the uploader's alreadyPosted only looks at SUCCESS)
  url TEXT, error TEXT,
  posted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  text_revision INTEGER                     -- which post_texts revision went live
);
CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id TEXT REFERENCES items(id), platform TEXT NOT NULL, target_url TEXT,
  text TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft',            -- draft | posted | failed
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE VIEW IF NOT EXISTS latest_post_text AS
  SELECT t.* FROM post_texts t WHERE t.revision = (SELECT MAX(revision) FROM post_texts WHERE item_id = t.item_id AND platform = t.platform);
`;

function migrateLegacy(db) {   // reels.sqlite (papers / old post_texts / old episodes) -> v1
  const has = (t) => !!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?").get(t);
  if (!has('papers')) return;
  db.exec(`ALTER TABLE post_texts RENAME TO post_texts_old; ALTER TABLE episodes RENAME TO episodes_old; ALTER TABLE comments RENAME TO comments_old;`);
  db.exec(V1);
  db.exec(`
    INSERT INTO items (id, kind, title, short_name, source_url, topic, one_liner, tags, status, added_at)
      SELECT arxiv_id, 'paper', title, short_name, url, topic, one_liner, tags, status, added_at FROM papers;
    INSERT INTO paper_meta (item_id, authors, abstract, primary_cat, published) SELECT arxiv_id, authors, abstract, primary_cat, published FROM papers;
    INSERT INTO episodes (item_id, format, video_path, duration_s, rendered_at) SELECT arxiv_id, format, video_path, duration_s, rendered_at FROM episodes_old;
    INSERT INTO post_texts (item_id, platform, revision, title, body) SELECT arxiv_id, platform, 1, title, body FROM post_texts_old;
    INSERT INTO comments (item_id, platform, target_url, text, status, created_at) SELECT arxiv_id, platform, target_url, text, status, created_at FROM comments_old;
    DROP TABLE post_texts_old; DROP TABLE episodes_old; DROP TABLE comments_old; DROP TABLE papers;`);
}

// v2: unattended mode. queue of links, settings (autopublish is off until the human turns it on),
// reviews (critic / validator / facts verdicts tied to the sha256 of the video they judged), pipeline runs.
const V2 = `
CREATE TABLE IF NOT EXISTS queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT NOT NULL,
  added_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','done','failed','needs_review')),
  item_id TEXT,                             -- filled once the producer has created the item
  started_at TEXT, finished_at TEXT, error TEXT,
  attempts INTEGER NOT NULL DEFAULT 0       -- incremented each time a run claims the row
);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('autopublish', 'off'), ('min_critic_score', '7'), ('max_attempts', '2'), ('publish_platforms', 'youtube,instagram');
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  item_id TEXT NOT NULL REFERENCES items(id),
  kind TEXT NOT NULL CHECK (kind IN ('critic','validator','facts')),
  verdict TEXT NOT NULL CHECK (verdict IN ('PASS','FAIL')),
  score REAL, notes TEXT,
  video_sha256 TEXT,                        -- sha256 the verdict applies to: the registered 9x16 video, or with 'reels review --post' the post's manifest_sha256 (post_sets)
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS reviews_item ON reviews (item_id, kind, id);
CREATE TABLE IF NOT EXISTS pipeline_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  queue_id INTEGER REFERENCES queue(id),
  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, finished_at TEXT,
  outcome TEXT,                             -- done | needs_review | failed | timeout | unhealthy
  log_path TEXT
);
`;
// v3: posts engine (paper-reels/post/, spec in paper-reels/post/SPEC.md). A post is a set of slides (JPEG images and MP4 clips)
// registered from <post folder>/out/manifest.json. Additive only: two new tables, no change to the tables above.
// Platform keys: post_texts.platform and posts.platform also hold instagram_post and threads_post. They are separate keys on purpose,
// so a post for an item that also has a reel never reuses the reel's caption (latest_post_text is per item and platform)
// and never collides with the reel's posts rows (alreadyPosted and autopublish look up item and platform).
const V3 = `
CREATE TABLE IF NOT EXISTS post_assets (    -- one row per slide of a registered post, written by 'reels post register'
  item_id TEXT NOT NULL REFERENCES items(id),
  format TEXT NOT NULL,                     -- 4x5
  idx INTEGER NOT NULL,                     -- slide order, 0-based. This is the carousel order.
  kind TEXT NOT NULL CHECK (kind IN ('image','video')),
  path TEXT NOT NULL,                       -- relative to post_sets.dir, exactly as in out/manifest.json
  alt TEXT,
  sha256 TEXT NOT NULL,                     -- of the file
  duration_s REAL,                          -- video slides only
  PRIMARY KEY (item_id, format, idx)
);
CREATE TABLE IF NOT EXISTS post_sets (      -- one row per registered post
  item_id TEXT NOT NULL REFERENCES items(id),
  format TEXT NOT NULL,
  dir TEXT NOT NULL,                        -- absolute path of the post folder
  manifest_sha256 TEXT NOT NULL,            -- sha256 of JSON.stringify(slides.map(s => [s.idx, s.kind, s.sha256]))
  slide_count INTEGER NOT NULL,
  rendered_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,   -- set again on every register
  PRIMARY KEY (item_id, format)
);
`;
export const SETTINGS_DEFAULTS = { autopublish: 'off', min_critic_score: '7', max_attempts: '2', publish_platforms: 'youtube,instagram' };
export const REEL_PLATFORMS = ['youtube', 'instagram', 'threads'];   // post_texts.platform / posts.platform of a reel
export const POST_PLATFORMS = ['instagram_post', 'threads_post'];    // the same columns for a post (threads_post is reserved, not published in v1)
export const BACKUP_DIR = path.join(path.dirname(DB_PATH), 'backups');
export const LOG_DIR = path.join(path.dirname(DB_PATH), 'logs');
const COUNTED = ['items', 'posts', 'post_texts', 'episodes', 'comments'];
const counts = (db) => Object.fromEntries(COUNTED.map((t) => [t, db.prepare(`SELECT COUNT(*) n FROM ${t}`).get().n]));

export function open() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA busy_timeout = 10000; PRAGMA journal_mode = WAL; PRAGMA foreign_keys = OFF;');
  const v = db.prepare('PRAGMA user_version').get().user_version;
  if (v < 1) {
    db.exec('BEGIN');
    try {
      const hasPosts = db.prepare("SELECT 1 FROM sqlite_master WHERE name='posts'").get();
      migrateLegacy(db);
      db.exec(V1);
      if (hasPosts && !db.prepare("SELECT 1 FROM pragma_table_info('posts') WHERE name='text_revision'").get()) db.exec('ALTER TABLE posts ADD COLUMN text_revision INTEGER');
      db.exec('PRAGMA user_version = 1; COMMIT');
    } catch (e) { db.exec('ROLLBACK'); throw e; }
  }
  if (v < 2) {
    // Backup first (VACUUM INTO cannot run inside a transaction), only when there is data to protect.
    let before = null;
    if (v >= 1) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      snapshot(db, path.join(BACKUP_DIR, `pre-v2-${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`));
      before = counts(db);
    }
    db.exec('BEGIN IMMEDIATE');
    try {
      if (db.prepare('PRAGMA user_version').get().user_version < 2) {   // another process may have migrated meanwhile
        db.exec(V2);
        if (before) {
          const after = counts(db);
          for (const t of COUNTED) if (after[t] !== before[t]) throw new Error(`v2 migration changed ${t} row count ${before[t]} -> ${after[t]}`);
        }
        db.exec('PRAGMA user_version = 2');
      }
      db.exec('COMMIT');
    } catch (e) { db.exec('ROLLBACK'); throw e; }
  }
  if (v < 3) {
    // Only CREATE TABLE IF NOT EXISTS, so no row can change and no row-count check is needed. A snapshot is still cheap, so v2's rule holds:
    // back up first (VACUUM INTO cannot run inside a transaction), only when there is data to protect.
    if (v >= 2) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      snapshot(db, path.join(BACKUP_DIR, `pre-v3-${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`));
    }
    db.exec('BEGIN IMMEDIATE');
    try {
      if (db.prepare('PRAGMA user_version').get().user_version < 3) {   // another process may have migrated meanwhile
        db.exec(V3);
        db.exec('PRAGMA user_version = 3');
      }
      db.exec('COMMIT');
    } catch (e) { db.exec('ROLLBACK'); throw e; }
  }
  db.exec('PRAGMA foreign_keys = ON;');
  return db;
}

export function getSetting(db, key) {
  const r = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return r ? r.value : SETTINGS_DEFAULTS[key] ?? null;
}
export function setSetting(db, key, value) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, String(value));
}

/** Atomically claim the oldest queued row that still has attempts left. Returns the row or undefined. */
export function claimNext(db) {
  const max = +getSetting(db, 'max_attempts') || 2;
  return db.prepare(`UPDATE queue SET status = 'running', started_at = CURRENT_TIMESTAMP, finished_at = NULL, attempts = attempts + 1
    WHERE id = (SELECT id FROM queue WHERE status = 'queued' AND attempts < ? ORDER BY id LIMIT 1) RETURNING *`).get(max);
}

/** Consistent snapshot for backups (Drive etc.). */
export function snapshot(db, dest) { fs.rmSync(dest, { force: true }); db.exec(`VACUUM INTO '${dest.replace(/'/g, "''")}'`); return dest; }
