import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ballotSchema, contestSchema } from '../src/data/schema.ts';
import {
  countyBallotsSchema,
  findByCode,
  matchingStyles,
  nextQuestion,
  equivalentGroups,
  sameContests,
  matchingCode,
  ballotPath,
  type MatchAnswer,
} from '../src/lib/ballotMatching.ts';
import { emptyState, restoreState, toggleRank } from '../src/lib/selections.ts';

const read = (path: string) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const original = ballotSchema.parse(read('../src/data/ballot.json'));
const extra = read('../src/data/elections/2026-11-03/san-francisco-extra-contests.json').map(
  (item: unknown) => contestSchema.parse(item),
);
const styles = read('../src/data/elections/2026-11-03/san-francisco-styles.json');
const data = countyBallotsSchema.parse({
  electionId: '2026-11-03',
  countyId: 'san-francisco',
  countyName: 'San Francisco',
  verifiedOn: '2026-11-02',
  coverage: 'partial',
  coverageNote: 'Regular ballots only',
  screeningContestId: 'governor',
  sourceUrl: 'https://sfelections.org/tools/election_data/datasets.php',
  lookupUrl: 'https://sfelections.org/tools/portal/',
  codeHelp: 'Official ballot type',
  contests: [...original.contests, ...extra].map(({ id, title }) => ({ id, title })),
  styles: styles.map((style: object) => ({ ...style, label: 'Ballot type' })),
});

test('all 33 regular SF ballot types exactly match the official 1,813-row cross-reference', () => {
  assert.equal(data.styles.length, 33);
  assert.equal(data.contests.length, 65);
  const mapping = read('../src/data/elections/2026-11-03/san-francisco-contest-map.json');
  const [header, ...rows] = readFileSync(
    new URL('../src/data/elections/2026-11-03/san-francisco-xref.tsv', import.meta.url),
    'utf8',
  )
    .trimEnd()
    .split(/\r?\n/)
    .map((row) => row.split('\t'));
  assert.equal(rows.length, 1813);
  for (const style of data.styles) {
    const expected = rows
      .filter((row) => row[header.indexOf('BALLOTTYPE')] === style.code)
      .map((row) => mapping[row[header.indexOf('CONTESTID')]])
      .sort();
    assert.deepEqual([...style.contestIds].sort(), expected);
  }
});

test('code lookup is exact, whitespace tolerant, and never guesses a precinct or unknown code', () => {
  assert.equal(findByCode(data, ' 19 ')?.code, '19');
  for (const code of ['', '0', '34', '019', '1900', '1junk', '../1'])
    assert.equal(findByCode(data, code), undefined);
  const other = { ...data, countyId: 'other', styles: [{ ...data.styles[0], code: 'other-code' }] };
  assert.equal(findByCode(other, '19'), undefined);
});

test('guided matching reaches the exact contest set for every published ballot type', () => {
  assert.equal(equivalentGroups(data).length, 21);
  for (const target of data.styles) {
    const answers: MatchAnswer[] = [];
    for (let step = 0; step < data.contests.length; step++) {
      const question = nextQuestion(data, answers);
      if (!question) break;
      answers.push({ contestId: question.id, present: target.contestIds.includes(question.id) });
    }
    const remaining = matchingStyles(data, answers);
    assert.ok(remaining.some(({ code }) => code === target.code));
    assert.ok(sameContests(remaining));
    assert.deepEqual([...remaining[0].contestIds].sort(), [...target.contestIds].sort());
    assert.ok(
      ballotPath(data, matchingCode(remaining)).startsWith('/ballot/2026-11-03/san-francisco/'),
    );
  }
});

test('unknown answers do not eliminate ballots; ambiguity cannot become a worksheet', () => {
  assert.equal(nextQuestion(data, [])?.id, 'governor');
  assert.equal(
    nextQuestion(
      data,
      [],
      data.contests.map(({ id }) => id),
    ),
    undefined,
  );
  assert.equal(matchingStyles(data, []).length, 33);
  assert.equal(sameContests(data.styles), false);
  assert.throws(() => matchingCode(data.styles));
  assert.equal(sameContests([]), false);
  assert.deepEqual(matchingStyles(data, [{ contestId: 'governor', present: false }]), []);
});

test('equivalent printed codes keep their identity and include the existing personal worksheet', () => {
  const group = equivalentGroups(data).find((items) => items.some(({ code }) => code === '1'))!;
  assert.deepEqual(
    group.map(({ code }) => code),
    ['1', '19', '25', '26'],
  );
  assert.equal(matchingCode(group), 'match-1-19-25-26');
  assert.deepEqual([...group[0].contestIds].sort(), original.contests.map(({ id }) => id).sort());
  assert.ok(findByCode(data, '33')?.contestIds.includes('state-senate-district-2'));
  assert.ok(findByCode(data, '32')?.contestIds.includes('state-assembly-district-18'));
});

test('invalid catalogs fail validation before publication', () => {
  assert.equal(
    countyBallotsSchema.safeParse({ ...data, styles: [...data.styles, data.styles[0]] }).success,
    false,
  );
  assert.equal(
    countyBallotsSchema.safeParse({ ...data, styles: [{ ...data.styles[0], aliases: [' 1 '] }] })
      .success,
    false,
  );
  assert.equal(
    countyBallotsSchema.safeParse({
      ...data,
      styles: [{ ...data.styles[0], contestIds: ['missing'] }],
    }).success,
    false,
  );
});

test('ten-rank contests restore rank ten and unrelated ballot storage remains isolated', () => {
  const contest = extra.find(
    (item: { id: string }) => item.id === 'board-of-supervisors-district-10',
  );
  assert.equal(contest.max, 10);
  const selection = toggleRank(contest, undefined, contest.candidates[0].id, 10);
  const state = { ...emptyState('ballot-a'), selections: { [contest.id]: selection } };
  assert.deepEqual(
    restoreState(JSON.stringify(state), 'ballot-a', [contest]).selections,
    state.selections,
  );
  assert.deepEqual(
    restoreState(JSON.stringify(state), 'ballot-b', [contest]),
    emptyState('ballot-b'),
  );
});

test('county picker includes all 58 unique counties with official directory links', () => {
  const counties = read('../src/data/counties.json');
  assert.equal(counties.length, 58);
  assert.equal(new Set(counties.map((county: { id: string }) => county.id)).size, 58);
  assert.ok(
    counties.every((county: { officialUrl: string }) => /^https?:\/\//.test(county.officialUrl)),
  );
});
