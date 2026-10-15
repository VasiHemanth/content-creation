// The STE gate for posts. The text rules are the narration profile of the reels (hf/ste.json, checked by checkLine from
// hf/bin/ste.mjs, which this file imports and never edits). What is new here is where the text comes from and how an
// exemption works.
//
//   Every printed string of every slide is checked on its own: slide.data leaves, one at a time, at any depth.
//   A key starting with "_" is drawing only. It is never printed and never checked.
//   The first and the last slide skip the soft rules (the hook and the end slide need some freedom). Hard rules always apply.
//
// Exemptions are explicit, have a reason, and can be refused:
//   x_ keys     a deliberate counter-example (text that breaks the rules on purpose). Exempt only when post.json
//               ste.examples declares { slide, key, why } for it, the slide and the key exist, and the text really breaks
//               a rule (otherwise the label "counter-example" would be false). Anything else is checked like normal copy
//               and the refused declaration is itself a hard finding. The slide must also label it visibly; audit.mjs
//               checks that in the rendered page.
//   ste.allow   { slide, rule, why[, key] } lets one rule pass on one slide. Without a why it is ignored (findings stay).
//               The rule must be a real rule name; there is no wildcard. A post cannot switch the gate off:
//               ste.enforce = false is refused, unlike the episode checker, which lets an old episode opt out with a reason.
import { checkLine, PROFILE } from '../../hf/bin/ste.mjs';
import { describeData } from './data.mjs';
import { loadPost } from './postdir.mjs';

export const RULES = ['length', 'sentences', 'one-idea', 'word', 'phrasal', 'ing', 'passive', 'tense', 'contraction', 'noun-cluster', 'term'];
const MIN_WHY = 10;                                              // a reason is a sentence, not "n/a"
const okWhy = (w) => typeof w === 'string' && w.trim().length >= MIN_WHY;

/**
 * Check every printed string of a post.
 * Returns { strings, findings, hard, soft, exempt }.
 *   strings   [{ slide, idx, key, text, exempt, free }] every printed leaf, in order
 *   findings  [{ slide, key, rule, hard, msg, fix?, kind }]   kind is "rule" (the profile) or "declaration" (a refused or broken exemption)
 */
export function checkPost(post, { profile = PROFILE } = {}) {
  const ste = (post && post.ste) || {};
  const names = [...(Array.isArray(ste.names) ? ste.names : [])].filter(Boolean);
  const terms = Array.isArray(ste.terms) ? ste.terms : [];
  const slides = (post && post.slides) || [];
  const byId = new Map(slides.map((s, i) => [s.id, { s, i }]));
  const findings = [], strings = [];
  const add = (slide, key, rule, hard, msg, fix, kind = 'rule') => findings.push({ slide, key, rule, hard, msg, ...(fix ? { fix } : {}), kind });

  if (ste.enforce === false) add('-', '-', 'enforce', true, 'a post cannot switch the STE gate off (ste.enforce is false); remove it', null, 'declaration');

  // what every slide prints, and which x_ keys exist
  const leaves = slides.map((s) => describeData(s.data || {}, s.id).leaves.filter((l) => !l.draw));
  const exampleKeys = slides.map((s, i) => new Set(leaves[i].filter((l) => l.example).map((l) => l.exampleKey)));

  // examples: valid declarations, keyed "slide:key"
  const examples = new Map(), declared = Array.isArray(ste.examples) ? ste.examples : [];
  declared.forEach((e, n) => {
    const at = `ste.examples[${n}]`, slide = e && e.slide, key = e && e.key;
    if (!e || typeof slide !== 'string' || typeof key !== 'string') { add('-', at, 'example', true, `${at} needs { "slide", "key", "why" }`, null, 'declaration'); return; }
    const hit = byId.get(slide);
    if (!hit) { add(slide, key, 'example', true, `${at} names slide "${slide}", which is not in post.json`, null, 'declaration'); return; }
    if (!exampleKeys[hit.i].has(key)) { add(slide, key, 'example', true, `${at}: slide ${slide} has no printed x_ key "${key}" (a counter-example is a key that starts with x_)`, null, 'declaration'); return; }
    if (!okWhy(e.why)) { add(slide, key, 'example', true, `${at}: the exemption for ${slide}.${key} has no why (write the reason in a sentence); it is refused`, null, 'declaration'); return; }
    if (examples.has(`${slide}:${key}`)) { add(slide, key, 'example', false, `${at} repeats an earlier declaration for ${slide}.${key}`, null, 'declaration'); return; }
    examples.set(`${slide}:${key}`, { slide, key, why: e.why, broke: null });
  });

  // allow entries: valid ones suppress findings of one rule on one slide
  const allow = [];
  (Array.isArray(ste.allow) ? ste.allow : []).forEach((a, n) => {
    const at = `ste.allow[${n}]`;
    if (!a || !byId.has(a.slide)) { add(a && a.slide || '-', '-', 'allow', false, `${at} is ignored: slide "${a && a.slide}" is not in post.json`, null, 'declaration'); return; }
    if (!RULES.includes(a.rule)) { add(a.slide, '-', 'allow', false, `${at} is ignored: "${a.rule}" is not a rule name (${RULES.join(', ')}); there is no wildcard`, null, 'declaration'); return; }
    if (!okWhy(a.why)) { add(a.slide, '-', 'allow', false, `${at} is ignored: no why (write the reason in a sentence), so the ${a.rule} findings on ${a.slide} stay`, null, 'declaration'); return; }
    allow.push({ ...a, used: false });
  });
  const allowed = (slide, key, rule) => {
    const hit = allow.find((a) => a.slide === slide && a.rule === rule && (a.key == null || a.key === key));
    if (hit) hit.used = true;
    return !!hit;
  };

  // every printed string, one at a time
  slides.forEach((s, idx) => {
    const free = idx === 0 || idx === slides.length - 1;
    for (const l of leaves[idx]) {
      const text = String(l.value), decl = l.example ? examples.get(`${s.id}:${l.exampleKey}`) : null;
      if (l.example) {
        // does the example really break a rule? (soft rules count; the label "counter-example" must be true)
        const own = checkLine(text, { names, terms, free: false, profile });
        if (decl) decl.broke = decl.broke || own.length > 0;
      }
      strings.push({ slide: s.id, idx, key: l.key, text, exempt: !!decl, free });
      if (decl) continue;
      if (l.example) add(s.id, l.key, 'example', true, `${s.id}.${l.exampleKey} is an x_ counter-example without a valid declaration in ste.examples; the exemption is refused and the text is checked like normal copy`, `add { "slide": "${s.id}", "key": "${l.exampleKey}", "why": "..." } to ste.examples`, 'declaration');
      for (const f of checkLine(text, { names, terms, free, profile })) {
        if (allowed(s.id, l.key, f.rule)) continue;
        add(s.id, l.key, f.rule, f.hard, f.msg, f.fix);
      }
    }
  });
  for (const d of examples.values()) if (d.broke === false) add(d.slide, d.key, 'example', true, `${d.slide}.${d.key} is declared as a counter-example but breaks no rule of the profile; remove the x_ prefix and the declaration (or show text that really breaks a rule)`, null, 'declaration');
  for (const a of allow) if (!a.used) add(a.slide, a.key || '-', 'allow', false, `ste.allow for ${a.rule} on ${a.slide} matches no finding; remove it`, null, 'declaration');

  return { strings, findings, hard: findings.filter((f) => f.hard).length, soft: findings.filter((f) => !f.hard).length, exempt: [...examples.values()].filter((d) => d.broke !== false) };
}

export function cliSte(dir) {
  const { post } = loadPost(dir);
  const r = checkPost(post);
  for (const e of r.exempt) console.log(`exempt  ${e.slide}  ${e.key}  counter-example: ${e.why}`);
  for (const f of r.findings) console.log(`${f.hard ? 'FAIL' : 'warn'}  ${f.slide}  ${f.key}  ${f.rule}: ${f.msg}${f.fix ? `  -> ${f.fix}` : ''}`);
  const n = r.strings.filter((s) => !s.exempt).length;
  console.log(`STE: ${r.hard} hard, ${r.soft} soft finding(s) in ${n} string(s) on ${post.slides.length} slide(s); ${r.exempt.length} counter-example(s) exempt`);
  return r.hard ? 1 : 0;
}

