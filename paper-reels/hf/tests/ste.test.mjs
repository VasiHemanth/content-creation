// node --test paper-reels/hf/tests/ste.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { checkLine, checkStoryboard, sentences } from '../bin/ste.mjs';

const rules = (text, o) => checkLine(text, o).map((f) => `${f.rule}${f.hard ? '!' : ''}`);

test('splits sentences after . ? ! but keeps a label with a colon', () => {
  assert.deepEqual(sentences('Each test checks one fix. A different fix can work. Not measured: code quality.'),
    ['Each test checks one fix.', 'A different fix can work.', 'Not measured: code quality.']);
});

test('plain active sentences pass', () => {
  assert.deepEqual(rules('Each test checks for one specific fix. A different fix can also work.'), []);
});

test('sentence over 20 words is a hard failure', () => {
  const long = 'The agent reads the prompt and then it edits the code in many files and then it runs the tests and then it stops.';
  assert.ok(rules(long).includes('length!'));
});

test('passive voice and perfect tense are hard failures', () => {
  assert.ok(rules('Their tests were written for one fix.').includes('passive!'));
  assert.ok(rules('The tasks are built from scratch.').includes('passive!'));
  assert.ok(rules('The team has written new tasks.').includes('tense!'));
});

test('-ing forms fail unless they are technical names', () => {
  assert.ok(rules('Grading checks behavior.').includes('ing!'));
  assert.deepEqual(rules('Dreaming gives cheap feedback.', { names: ['dreaming'] }), []);
  assert.deepEqual(rules('Nothing changes during the test.'), []);
});

test('phrasal verbs and unclear words fail with a fix', () => {
  const f = checkLine('The agents figure out a huge number of fixes.');
  assert.ok(f.some((x) => x.rule === 'phrasal' && x.hard));
  assert.ok(f.some((x) => x.rule === 'word' && x.fix === 'use "large"'));
});

test('a second name for a glossary term fails', () => {
  const terms = [{ term: 'replay simulator', avoid: ['sandbox'] }];
  assert.ok(rules('The sandbox replays old searches.', { terms }).includes('term!'));
});

test('first and last lines skip soft rules only', () => {
  const sb = { name: 'X', lines: [
    { id: 'l1', text: 'Can an agent improve itself, without help, and at low cost, and fast?' },
    { id: 'l2', text: 'The agent checks its own work, and it fixes errors, and it tries again.' },
    { id: 'l3', text: 'Check who graded it.' },
  ] };
  const r = checkStoryboard(sb);
  assert.ok(!r.findings.some((f) => f.line === 'l1' && f.rule === 'one-idea'));
  assert.ok(r.findings.some((f) => f.line === 'l2' && f.rule === 'one-idea'));
});

test('an allow entry needs a reason', () => {
  const base = { name: 'X', lines: [{ id: 'l1', text: 'A hook.' }, { id: 'l2', text: 'The fix was merged upstream.' }, { id: 'l3', text: 'End.' }] };
  assert.equal(checkStoryboard({ ...base, ste: { allow: [{ line: 'l2', rule: 'passive' }] } }).hard, 1);
  assert.equal(checkStoryboard({ ...base, ste: { allow: [{ line: 'l2', rule: 'passive', why: 'the agent of the action is unknown' }] } }).hard, 0);
});

// ste.jargon: each technical term enters on its declared line, one at a time (paper-reels/formats/explain.md)
const jsb = (format, jargon, lines) => ({ name: 'X', format, ste: { jargon }, lines: lines.map((text, i) => ({ id: `l${i + 1}`, text })) });

test('a term used before the line that explains it is a hard failure', () => {
  const sb = jsb('paper', [{ term: 'checkout', line: 'l3' }],
    ['How do they serve many checkouts?', 'Each machine needs the code.', 'We call this step a checkout.', 'End.']);
  const f = checkStoryboard(sb).findings.find((x) => x.rule === 'jargon');
  assert.ok(f && f.hard && f.line === 'l1');
});

test('a term introduced on its declared line passes, and plurals count as uses', () => {
  const sb = jsb('system-design', [{ term: 'checkout', line: 'l2' }],
    ['Each machine needs the code.', 'We call this step a checkout.', 'They run many checkouts a day.', 'End.']);
  assert.equal(checkStoryboard(sb).findings.filter((x) => x.rule.startsWith('jargon')).length, 0);
});

test('two new terms in one line: soft for paper, hard for system-design', () => {
  const lines = ['A hook.', 'The client asks for trees and blobs.', 'End.'];
  const j = [{ term: 'tree', line: 'l2' }, { term: 'blob', line: 'l2' }];
  const soft = checkStoryboard(jsb('paper', j, lines)).findings.find((x) => x.rule === 'jargon-density');
  const hard = checkStoryboard(jsb('system-design', j, lines)).findings.find((x) => x.rule === 'jargon-density');
  assert.ok(soft && !soft.hard);
  assert.ok(hard && hard.hard);
});

test('declared jargon may end in -ing', () => {
  const sb = jsb('system-design', [{ term: 'caching', line: 'l2' }], ['A hook.', 'Scion uses caching for this.', 'End.']);
  assert.ok(!checkStoryboard(sb).findings.some((x) => x.rule === 'ing'));
});

test('a storyboard without a format is a paper; an unknown format throws', () => {
  assert.doesNotThrow(() => checkStoryboard({ name: 'X', lines: [{ id: 'l1', text: 'A hook.' }] }));
  assert.throws(() => checkStoryboard({ name: 'X', format: 'vlog', lines: [{ id: 'l1', text: 'A hook.' }] }), /not one of/);
});
