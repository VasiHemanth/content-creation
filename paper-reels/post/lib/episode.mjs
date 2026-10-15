// The registered 9x16 episode of an item, read from the shared database READ ONLY.
//
// This does not use lib/db.mjs: its open() runs the CREATE TABLE migrations, which are writes, and another worker owns
// that file. node:sqlite opened with readOnly can only read; query_only is a second belt. TRACKER_DB overrides the path
// (tests point it at a scratch database), as in lib/db.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { ROOT_DIR } from './constants.mjs';

export const dbPath = () => process.env.TRACKER_DB || path.join(ROOT_DIR, 'data', 'content.sqlite');

/** { item_id, format, video_path, duration_s } or null. Throws when the database file is missing. */
export function registeredEpisode(item, format = '9x16') {
  const file = dbPath();
  if (!fs.existsSync(file)) throw new Error(`database not found: ${file}`);
  const db = new DatabaseSync(file, { readOnly: true });
  try {
    db.exec('PRAGMA query_only = ON');
    return db.prepare('SELECT item_id, format, video_path, duration_s FROM episodes WHERE item_id = ? AND format = ?').get(item, format) || null;
  } finally { db.close(); }
}

/**
 * What the reel shows between `from` and `to`: its lines and scenes from the HyperFrames project the video was rendered
 * from (<episode>/out/hf/project/data.js). Returns null when that file is not there (a canvas episode, or a cleaned folder).
 * A scene is on screen from its start until the end of its last line plus the transition out (the outgoing scene holds).
 */
export function reelTimeline(videoPath) {
  const epDir = path.resolve(path.dirname(videoPath), '..', '..');
  const f = path.join(epDir, 'out', 'hf', 'project', 'data.js');
  if (!fs.existsSync(f)) return null;
  const EP = JSON.parse(fs.readFileSync(f, 'utf8').replace(/^window\.EP = /, '').replace(/;\s*$/, ''));
  return { epDir, total: EP.total, lines: EP.lines, scenes: EP.scenes, order: EP.order };
}

/** Lines of every scene that is visible during [from, to). */
export function linesOnScreen(timeline, from, to) {
  const names = Object.keys(timeline.scenes), out = [];
  names.forEach((name, i) => {
    const s = timeline.scenes[name], end = s.start + s.dur + (i < names.length - 1 ? s.tdur || 0 : 0);
    if (s.start < to && end > from) for (const id of s.lines) out.push({ id, scene: name, ...timeline.lines[id] });
  });
  return out;
}
