import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ballotSchema } from '../src/data/schema.ts';
import {
  emptyState,
  restoreState,
  toggleChoice,
  toggleRank,
  selectionLines,
} from '../src/lib/selections.ts';

const ballot = ballotSchema.parse(
  JSON.parse(readFileSync(new URL('../src/data/ballot.json', import.meta.url), 'utf8')),
);
const contest = (id: string) => ballot.contests.find((item) => item.id === id)!;

test('November ballot matches the verified districts and complete contest inventory', () => {
  assert.equal(ballot.isMock, false);
  assert.deepEqual(ballot.provenance?.districts, {
    congressional: 11,
    assembly: 19,
    senate: 11,
    boardOfEqualization: 2,
    supervisorial: 7,
    bart: 8,
  });
  assert.equal(ballot.contests.length, 55);
  assert.equal(ballot.contests.filter((item) => item.id.startsWith('retain-')).length, 13);
  assert.equal(ballot.contests.filter((item) => item.id.startsWith('local-prop-')).length, 10);
  assert.deepEqual(
    ballot.contests
      .filter((item) => item.id.startsWith('state-prop-'))
      .map((item) => Number(item.id.slice(11))),
    [1, 2, 3, 4, 5, 37, 38, 39, 40, 41, 42, 43, 44, 45],
  );
  assert.ok(contest('regional-rtm'));
  assert.ok(contest('bart-director-district-8'));
  assert.ok(
    !ballot.contests.some((item) =>
      /supervisor|state-senate|district-15|district-17/.test(item.id),
    ),
  );
  for (const item of ballot.contests) {
    assert.ok(item.links.some((link) => link.group === 'sources' && link.url));
    assert.ok(item.links.every((link) => link.url));
    if (item.type !== 'yesno')
      assert.ok(item.candidates.every((candidate) => candidate.links.every((link) => link.url)));
  }
});

test('full and partial City College seats have separate choices and limits', () => {
  const full = contest('community-college-board-full-term');
  const partial = contest('community-college-board-partial-term');
  assert.equal(full.type, 'multi');
  assert.equal(partial.type, 'single');
  assert.equal(full.type === 'multi' && full.max, 3);
  const chosen = ['elijah-ball', 'rome-moses-jones', 'monroe-lace'];
  assert.equal(toggleChoice(full, chosen, 'jeremy-lee').limited, true);
  assert.equal(toggleChoice(partial, undefined, 'ruth-ferguson').selection, 'ruth-ferguson');
});

test('unopposed ranked contests and judicial retention save and print correctly', () => {
  const assessor = contest('assessor-recorder');
  const selection = toggleRank(assessor, undefined, 'joaquin-torres', 1);
  assert.deepEqual(selectionLines(assessor, selection), ['1 Joaquín Torres']);
  const state = {
    ...emptyState(ballot.id),
    selections: { 'assessor-recorder': selection, 'retain-kelli-m-evans': 'Yes' },
  };
  assert.deepEqual(
    restoreState(JSON.stringify(state), ballot.id, ballot.contests).selections,
    state.selections,
  );
});

test('mock worksheet choices cannot carry into the real ballot', () => {
  const old = {
    ...emptyState('sf-2026-mock-v1'),
    selections: { gov: 'helen-castellanos', p2: 'Yes' },
    notes: { gov: 'Demo' },
  };
  assert.deepEqual(
    restoreState(JSON.stringify(old), ballot.id, ballot.contests),
    emptyState(ballot.id),
  );
});

test('real ballots require provenance and a source for every contest', () => {
  assert.equal(ballotSchema.safeParse({ ...ballot, provenance: undefined }).success, false);
  assert.equal(
    ballotSchema.safeParse({ ...ballot, contests: [{ ...ballot.contests[0], links: [] }] }).success,
    false,
  );
});
