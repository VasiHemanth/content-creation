const sqlite3 = require('sqlite3').verbose();
const { DB_PATH } = require('./config');

const db = new sqlite3.Database(DB_PATH);

const run = (sql, params = []) =>
  new Promise((res, rej) => db.run(sql, params, function (e) { e ? rej(e) : res(this.lastID); }));
const all = (sql, params = []) =>
  new Promise((res, rej) => db.all(sql, params, (e, rows) => (e ? rej(e) : res(rows))));
const get = (sql, params = []) =>
  new Promise((res, rej) => db.get(sql, params, (e, row) => (e ? rej(e) : res(row))));

async function init() {
  await run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label TEXT NOT NULL,          -- your own id for the video (slug, number, filename)
    platform TEXT NOT NULL,       -- youtube | instagram | threads
    status TEXT NOT NULL,         -- SUCCESS | FAILED | SKIPPED
    url TEXT,
    error TEXT,
    posted_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
}

const record = (label, platform, status, url = null, error = null) =>
  run('INSERT INTO posts (label, platform, status, url, error) VALUES (?, ?, ?, ?, ?)',
    [label, platform, status, url, error]);

const alreadyPosted = async (label, platform) =>
  !!(await get("SELECT id FROM posts WHERE label = ? AND platform = ? AND status = 'SUCCESS' LIMIT 1", [label, platform]));

const history = (limit = 30) =>
  all('SELECT label, platform, status, url, posted_at FROM posts ORDER BY id DESC LIMIT ?', [limit]);

module.exports = { init, record, alreadyPosted, history };
