// The facts gate: every number a slide prints is in facts.json with its source or how it was computed.
// Same rule as the reels' QA (hf/bin/qa.mjs): identifiers such as gpt-6-astra or ASD-STE100 are names, not figures; so are the
// technical names the post declares in ste.names. Numbers inside x_ counter-examples are printed too, so they count.
import { printed } from './data.mjs';

// hf/bin/qa.mjs stripIds: a word joined to more parts by hyphens is an identifier
const stripIds = (s) => String(s).replace(/\b[A-Za-z]+(?:-[A-Za-z0-9.]+)+/g, ' ');

/** The numbers printed in one string, as written ("74", "2.43", "1,200"). `names` are removed first. */
export function numbersIn(text, names = []) {
  let s = String(text);
  for (const n of names) if (n) s = s.split(n).join(' ');
  return (stripIds(s).match(/\d[\d,]*(?:\.\d+)?/g) || []).map((n) => n.replace(/,$/, ''));
}

/** Is `n` a key of the facts table? "1,000" matches "1000", "7.0" matches "7". */
export function known(table, n) {
  const forms = [n, n.replace(/,/g, ''), n.replace(/\.0+$/, ''), n.replace(/,/g, '').replace(/\.0+$/, '')];
  return forms.some((f) => Object.prototype.hasOwnProperty.call(table, f));
}

/** Check a post. `table` is facts.numbers merged with evidence_incidental. Returns { missing: [{ slide, key, n }], checked }. */
export function checkFacts(post, table) {
  const names = (post.ste && Array.isArray(post.ste.names)) ? post.ste.names : [];
  const missing = []; let checked = 0;
  for (const p of printed(post)) for (const n of new Set(numbersIn(p.text, names))) {
    checked++;
    if (!known(table, n)) missing.push({ slide: p.slide, key: p.key, n });
  }
  return { missing, checked };
}
