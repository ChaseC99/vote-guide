import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ballotSchema } from '../src/data/schema.ts';
import { emptyState, hasSkippedRank, normalizeSelection, restoreState, selectionLines, toggleChoice, toggleRank } from '../src/lib/selections.ts';

const ballot = ballotSchema.parse(JSON.parse(readFileSync(new URL('../src/data/ballot.json', import.meta.url), 'utf8')));
const yesno = ballot.contests.find((contest) => contest.type === 'yesno')!;
const single = ballot.contests.find((contest) => contest.type === 'single')!;
const multi = ballot.contests.find((contest) => contest.type === 'multi')!;
const ranked = ballot.contests.find((contest) => contest.type === 'ranked')!;

test('Yes/No toggles off and replacing a choice never retains both', () => {
  assert.equal(toggleChoice(yesno, undefined, 'Yes').selection, 'Yes');
  assert.equal(toggleChoice(yesno, 'Yes', 'No').selection, 'No');
  assert.equal(toggleChoice(yesno, 'No', 'No').selection, undefined);
  assert.equal(toggleChoice(yesno, 'Yes', 'unexpected').selection, 'Yes');
});

test('single choice replaces the existing candidate', () => {
  assert.equal(toggleChoice(single, 'dana-whitfield', 'theo-mercado').selection, 'theo-mercado');
});

test('multi choice enforces the cap but allows removing and replacing choices', () => {
  const atLimit = ['lena-park', 'grace-abernathy', 'omar-haddad'];
  assert.deepEqual(toggleChoice(multi, atLimit, 'ruth-delgado'), { selection: atLimit, limited: true });
  const removed = toggleChoice(multi, atLimit, 'grace-abernathy').selection;
  assert.deepEqual(toggleChoice(multi, removed, 'ruth-delgado').selection, ['lena-park', 'omar-haddad', 'ruth-delgado']);
});

test('moving a taken rank removes its old occupant and the candidate’s old rank', () => {
  const old = { 'ana-liu': 1, 'rafael-moreno': 2, 'jordan-pike': 3 };
  const next = toggleRank(ranked, old, 'jordan-pike', 1);
  assert.deepEqual(next, { 'rafael-moreno': 2, 'jordan-pike': 1 });
  assert.deepEqual(old, { 'ana-liu': 1, 'rafael-moreno': 2, 'jordan-pike': 3 });
  assert.deepEqual(selectionLines(ranked, next), ['1 Jordan Pike', '2 Rafael Moreno']);
});

test('selected ranks can be cleared and skipped ranks are kept', () => {
  assert.equal(toggleRank(ranked, { 'ana-liu': 1 }, 'ana-liu', 1), undefined);
  assert.equal(hasSkippedRank({ 'ana-liu': 3 }), true);
  assert.equal(hasSkippedRank({ 'ana-liu': 1, 'rafael-moreno': 2 }), false);
  assert.equal(toggleRank(ranked, undefined, 'ana-liu', 6), undefined);
});

test('restoring storage removes invalid choices, duplicate ranks, and other ballots', () => {
  const state = { ...emptyState(ballot.id), selections: { sup: { 'ana-liu': 1, 'rafael-moreno': 1, ghost: 2, 'jordan-pike': 9 }, edu: ['lena-park', 'lena-park', 'ghost'], rep: 'ghost' }, notes: { rep: 'Remember this\nSecond line', ghost: 'ignore' } };
  const restored = restoreState(JSON.stringify(state), ballot.id, ballot.contests);
  assert.deepEqual(restored.selections, { sup: { 'ana-liu': 1 }, edu: ['lena-park'] });
  assert.deepEqual(restored.notes, { rep: 'Remember this\nSecond line' });
  assert.deepEqual(restoreState(JSON.stringify(state), 'another-ballot', ballot.contests), emptyState('another-ballot'));
  assert.throws(() => restoreState('{broken', ballot.id, ballot.contests));
});

test('multiple selections print in ballot order, regardless of click order', () => {
  assert.deepEqual(selectionLines(multi, ['omar-haddad', 'lena-park']), ['Lena Park', 'Omar Haddad']);
  assert.equal(normalizeSelection(single, ['dana-whitfield']), undefined);
});

test('content validation rejects ambiguous routes and unsafe source URLs', () => {
  assert.equal(ballotSchema.safeParse({ ...ballot, contests: [...ballot.contests, ballot.contests[0]] }).success, false);
  assert.equal(ballotSchema.safeParse({ ...ballot, contests: [{ ...yesno, links: [{ label: 'Bad link', url: 'javascript:alert(1)', group: 'sources' }] }] }).success, false);
});
