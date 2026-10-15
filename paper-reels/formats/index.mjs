// Video formats: which limits a storyboard is held to. The prose rules live in <format>.md beside this file.
// A storyboard without a `format` field is a paper, so every episode made before formats keeps its old verdict.
import fs from 'node:fs';
import path from 'node:path';

const ALL = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'formats.json'), 'utf8'));
export const MAX_VIDEO_BYTES = ALL.maxVideoBytes;
export const FORMATS = Object.keys(ALL).filter((k) => !k.startsWith('_') && typeof ALL[k] === 'object');

/** The format of a storyboard: { name, minSeconds, maxSeconds, targetSeconds, termIntroHard, status }. Throws on an unknown name. */
export function formatOf(sb) {
  const name = (sb && sb.format) || 'paper';
  if (!FORMATS.includes(name)) throw new Error(`storyboard.format "${name}" is not one of: ${FORMATS.join(', ')}`);
  return { name, ...ALL[name] };
}
