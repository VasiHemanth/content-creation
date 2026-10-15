// node --test paper-reels/post/tests/ste-post.test.mjs
// The STE gate for posts: per-string checks, drawing keys, the first and last slide, and the exemptions, including every
// case in which an exemption must be refused.
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkPost, RULES } from '../lib/ste-post.mjs';
import { describeData } from '../lib/data.mjs';
import { checkFacts, numbersIn } from '../lib/facts.mjs';

const BAD = 'The configuration file was edited by the operator, and then the new settings were applied by the system after the restart was completed.';
const GOOD = 'The operator edits the file.';
const slide = (id, data, extra = {}) => ({ id, kind: 'image', alt: 'x', data, ...extra });
const post = (slides, ste) => ({ item: 'x', kind: 'post', name: 'Test post', format: '4x5', slides, ...(ste ? { ste } : {}) });
const three = (mid, ste) => post([slide('s01', { hook: GOOD }), slide('s02', mid), slide('s03', { end: GOOD })], ste);
const rules = (r, hard) => r.findings.filter((f) => hard === undefined || f.hard === hard).map((f) => `${f.slide}.${f.key}:${f.rule}`);

test('a clean post has no findings, and every printed string was checked', () => {
  const r = checkPost(three({ title: 'Cut it short', body: GOOD }));
  assert.equal(r.hard, 0);
  assert.equal(r.soft, 0);
  assert.equal(r.strings.length, 4);
});

test('hard findings name the slide, the key and the rule', () => {
  const r = checkPost(three({ body: BAD }));
  assert.ok(r.hard >= 2);
  assert.ok(rules(r, true).includes('s02.body:length'));
  assert.ok(rules(r, true).includes('s02.body:passive'));
});

test('strings are checked one by one: two 12 word keys pass, the same words in one key fail', () => {
  const half = 'The operator edits the file and the system applies the new settings.';
  assert.equal(half.split(' ').length, 12);
  assert.equal(checkPost(three({ a: half, b: half })).hard, 0);
  assert.ok(checkPost(three({ a: `${half.slice(0, -1)} ${half.toLowerCase()}` })).hard >= 1);
});

test('keys that start with _ are drawing only: never printed, never checked, at any depth', () => {
  const r = checkPost(three({ title: 'Cut it short', _bar: 0.4, _note: BAD, rows: [{ label: 'Before', _pct: 1, _x: BAD }], _deep: { a: { b: BAD } } }));
  assert.equal(r.hard, 0);
  assert.ok(!r.strings.some((s) => /^_|\._/.test(s.key)), 'no _ key in the checked strings');
  const d = describeData({ rows: [{ _pct: 1 }] }, 's');
  assert.equal(d.leaves[0].draw, true);
});

test('nested arrays and objects are walked', () => {
  const r = checkPost(three({ steps: [{ title: 'Open the file.', text: GOOD }, { title: BAD }] }));
  assert.ok(rules(r, true).some((x) => x.startsWith('s02.steps.1.title:')));
  assert.equal(r.strings.filter((s) => s.slide === 's02').length, 3);
});

test('the first and the last slide skip the soft rules, but not the hard ones', () => {
  // 18 words: over the target of 15 (soft), under the maximum of 20 (hard)
  const soft = 'The operator opens the file and checks each line before the system starts the new job today.';
  assert.equal(soft.split(' ').length, 17);
  const mid = checkPost(post([slide('s01', { a: GOOD }), slide('s02', { a: soft }), slide('s03', { a: GOOD })]));
  assert.ok(rules(mid, false).includes('s02.a:length'), 'soft finding in the middle');
  const first = checkPost(post([slide('s01', { a: soft }), slide('s02', { a: GOOD }), slide('s03', { a: GOOD })]));
  const last = checkPost(post([slide('s01', { a: GOOD }), slide('s02', { a: GOOD }), slide('s03', { a: soft })]));
  assert.equal(first.soft, 0);
  assert.equal(last.soft, 0);
  const hard = checkPost(post([slide('s01', { a: BAD }), slide('s02', { a: GOOD })]));
  assert.ok(hard.hard >= 2, 'hard findings still count on the first slide');
});

test('names allow an -ing word; the post name does not (the episode checker is looser)', () => {
  const ing = 'Prompting needs plain words.';
  assert.ok(rules(checkPost(three({ a: ing })), true).includes('s02.a:ing'));
  assert.equal(checkPost(three({ a: ing }, { names: ['Prompting'] })).hard, 0);
  assert.ok(checkPost({ ...three({ a: ing }), name: 'Prompting guide' }).hard >= 1);
});

test('one name per concept: a second name for a term fails', () => {
  const r = checkPost(three({ a: 'Each stage needs one verb.' }, { terms: [{ term: 'step', avoid: ['stage'] }] }));
  assert.ok(rules(r, true).includes('s02.a:term'));
});

// ---- exemptions ----

const WHY = 'typical long prose with passive verbs, shown on purpose';
const ex = (extra = {}) => ({ slide: 's02', key: 'x_before', why: WHY, ...extra });

test('an x_ counter-example declared with a why is exempt and listed', () => {
  const r = checkPost(three({ x_before: BAD, after: GOOD }, { examples: [ex()] }));
  assert.equal(r.hard, 0);
  assert.equal(r.exempt.length, 1);
  assert.equal(r.strings.find((s) => s.key === 'x_before').exempt, true);
  assert.equal(r.strings.find((s) => s.key === 'after').exempt, false);
});

test('REFUSED: an x_ key that is not declared is checked like normal copy and the missing declaration fails', () => {
  const r = checkPost(three({ x_before: BAD }, { examples: [] }));
  assert.ok(rules(r, true).includes('s02.x_before:length'), 'its own findings stay');
  assert.ok(rules(r, true).includes('s02.x_before:example'), 'and the refused exemption is a finding');
  assert.equal(r.strings.find((s) => s.key === 'x_before').exempt, false);
});

test('REFUSED: a declaration without a why, or with a throwaway why', () => {
  for (const why of [undefined, '', '   ', 'n/a', 'x']) {
    const r = checkPost(three({ x_before: BAD }, { examples: [why === undefined ? { slide: 's02', key: 'x_before' } : ex({ why })] }));
    assert.ok(r.hard >= 2, `why=${JSON.stringify(why)} must not exempt`);
    assert.equal(r.strings.find((s) => s.key === 'x_before').exempt, false);
  }
});

test('REFUSED: a declaration for a slide or a key that does not exist', () => {
  const wrongSlide = checkPost(three({ x_before: BAD }, { examples: [ex({ slide: 's09' })] }));
  assert.ok(wrongSlide.hard >= 1 && wrongSlide.findings.some((f) => /not in post.json/.test(f.msg)));
  const wrongKey = checkPost(three({ x_before: BAD }, { examples: [{ slide: 's02', key: 'x_other', why: 'a long enough reason here' }] }));
  assert.ok(wrongKey.findings.some((f) => /no printed x_ key/.test(f.msg)));
  assert.equal(wrongKey.strings.find((s) => s.key === 'x_before').exempt, false);
});

test('REFUSED: a declaration for a key that does not start with x_', () => {
  const r = checkPost(three({ before: BAD }, { examples: [{ slide: 's02', key: 'before', why: 'a long enough reason here' }] }));
  assert.ok(r.findings.some((f) => /no printed x_ key/.test(f.msg)));
  assert.ok(rules(r, true).includes('s02.before:length'), 'plain keys are always checked');
});

test('REFUSED: an x_ example that breaks no rule is not a counter-example', () => {
  const r = checkPost(three({ x_before: GOOD }, { examples: [ex()] }));
  assert.ok(r.findings.some((f) => f.hard && /breaks no rule/.test(f.msg)));
});

test('an exemption covers its own key only', () => {
  const r = checkPost(three({ x_before: BAD, x_second: BAD }, { examples: [ex()] }));
  assert.ok(rules(r, true).includes('s02.x_second:example'));
  assert.equal(r.strings.find((s) => s.key === 'x_before').exempt, true);
});

test('a nested x_ group is declared once, by the path of the x_ key', () => {
  const r = checkPost(three({ pair: { x_bad: BAD, ok: GOOD } }, { examples: [ex({ key: 'pair.x_bad' })] }));
  assert.equal(r.hard, 0);
});

test('REFUSED: ste.enforce = false (an episode may opt out with a reason, a post may not)', () => {
  const r = checkPost(three({ a: GOOD }, { enforce: false, why: 'old post' }));
  assert.ok(r.findings.some((f) => f.hard && f.rule === 'enforce'));
});

test('ste.allow without a why is ignored; with a why it lets one rule pass on one slide', () => {
  const noWhy = checkPost(three({ a: 'The file was edited.' }, { allow: [{ slide: 's02', rule: 'passive' }] }));
  assert.ok(rules(noWhy, true).includes('s02.a:passive'));
  assert.ok(noWhy.findings.some((f) => f.rule === 'allow' && /no why/.test(f.msg)));
  const ok = checkPost(three({ a: 'The file was edited.' }, { allow: [{ slide: 's02', rule: 'passive', why: 'the actor is unknown in the source' }] }));
  assert.equal(ok.hard, 0);
  const other = checkPost(three({ a: 'The file was edited.' }, { allow: [{ slide: 's03', rule: 'passive', why: 'the actor is unknown in the source' }] }));
  assert.ok(rules(other, true).includes('s02.a:passive'), 'an allow is for its own slide');
});

test('REFUSED: ste.allow has no wildcard and no unknown rule', () => {
  for (const rule of ['*', 'all', 'everything', 'nonsense']) {
    const r = checkPost(three({ a: 'The file was edited.' }, { allow: [{ slide: 's02', rule, why: 'a long enough reason here' }] }));
    assert.ok(rules(r, true).includes('s02.a:passive'), `rule ${rule} must not allow anything`);
  }
  assert.ok(RULES.includes('passive') && !RULES.includes('*'));
});

test('ste.allow can be narrowed to one key, and an unused allow is reported', () => {
  const allow = [{ slide: 's02', rule: 'passive', key: 'a', why: 'the actor is unknown in the source' }];
  const r = checkPost(three({ a: 'The file was edited.', b: 'The file was edited.' }, { allow }));
  assert.ok(rules(r, true).includes('s02.b:passive'));
  assert.ok(!rules(r, true).includes('s02.a:passive'));
  const unused = checkPost(three({ a: GOOD }, { allow }));
  assert.ok(unused.findings.some((f) => f.rule === 'allow' && /matches no finding/.test(f.msg)));
});

// ---- facts (the numbers on the same strings) ----

test('facts: every printed number needs an entry; _ keys, names and identifiers are not figures', () => {
  const p = three({ a: 'Version 12 has ASD-STE100 and gpt-6-astra.', x_b: 'Counter-example with 7 items', _n: 99, rows: [{ value: '23 words', _pct: 0.5 }] }, { names: ['Version 12'] });
  assert.deepEqual(numbersIn('ASD-STE100 and 1,200 items, 2.43x, 74%'), ['1,200', '2.43', '74']);
  const missing = checkFacts(p, { 23: 'counted' }).missing.map((m) => `${m.slide}.${m.key}:${m.n}`);
  assert.deepEqual(missing, ['s02.x_b:7'], 'x_ text is printed, so its number counts; _n and the name are not figures');
  assert.deepEqual(checkFacts(p, { 23: 'counted', 7: 'a count in the example' }).missing, []);
});
