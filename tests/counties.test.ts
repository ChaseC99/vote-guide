import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolveCountyBundle } from '../src/data/countyBundle.ts';
import { ballotSchema } from '../src/data/schema.ts';
import {
  equivalentGroups,
  findByCode,
  matchingCode,
  matchingStyles,
  nextQuestion,
  sameContests,
  type MatchAnswer,
} from '../src/lib/ballotMatching.ts';

const read = (path: string | URL) => JSON.parse(readFileSync(path, 'utf8'));
const original = ballotSchema.parse(read(new URL('../src/data/ballot.json', import.meta.url)));
const directory = read(new URL('../src/data/counties.json', import.meta.url));
const root = new URL('../src/data/elections/2026-11-03/counties/', import.meta.url);
const bundles = readdirSync(root)
  .filter((name) => name.endsWith('.json'))
  .map((name) => ({
    name,
    input: read(new URL(name, root)),
  }));

test('county imports have unique identities and every complete ballot passes content validation', () => {
  const ids = new Set();
  for (const { name, input } of bundles) {
    const { catalog, contests, jurisdiction, sources } = resolveCountyBundle(
      input,
      original.contests,
    );
    assert.equal(name, `${catalog.countyId}.json`);
    assert.equal(catalog.electionId, '2026-11-03');
    assert.ok(
      directory.some(
        (county: { id: string; name: string }) =>
          county.id === catalog.countyId && county.name === catalog.countyName,
      ),
    );
    assert.ok(!ids.has(catalog.countyId));
    ids.add(catalog.countyId);
    const byId = new Map(contests.map((contest) => [contest.id, contest]));
    for (const style of catalog.styles) {
      // Printed rank limits may exceed the number of named candidates (for
      // example, Berkeley's five-rank, one-candidate auditor contest).
      ballotSchema.parse({
        ...original,
        id: `${catalog.countyId}-${style.code}`,
        jurisdiction,
        countyId: catalog.countyId,
        locationShort: catalog.countyName,
        ballotCode: style.code,
        provenance: {
          verifiedOn: catalog.verifiedOn,
          districts: style.districts,
          note: catalog.coverageNote,
          sources,
        },
        contests: style.contestIds.map((id) => byId.get(id)),
      });
    }
  }
});

test('every imported code and verified alias resolves only within its county', () => {
  for (const { input } of bundles) {
    const { catalog } = resolveCountyBundle(input, original.contests);
    for (const style of catalog.styles) {
      for (const code of [style.code, ...style.aliases])
        assert.equal(findByCode(catalog, ` ${code.toLowerCase()} `)?.code, style.code);
    }
    assert.equal(findByCode(catalog, 'not-a-published-ballot'), undefined);
  }
});

test('guided matching reaches the exact imported contests for every county ballot', () => {
  for (const { input } of bundles) {
    const { catalog } = resolveCountyBundle(input, original.contests);
    const paths = new Set(catalog.styles.map(({ code }) => code));
    for (const group of equivalentGroups(catalog)) {
      if (group.length > 1) {
        const path = matchingCode(group);
        assert.ok(path.length < 240, `${catalog.countyId}: route exceeds filesystem limit`);
        assert.ok(!paths.has(path), `${catalog.countyId}: duplicate route`);
        paths.add(path);
      }
    }
    for (const target of catalog.styles) {
      const answers: MatchAnswer[] = [];
      for (let n = 0; n <= catalog.contests.length; n++) {
        const question = nextQuestion(catalog, answers);
        if (!question) break;
        answers.push({ contestId: question.id, present: target.contestIds.includes(question.id) });
      }
      const matches = matchingStyles(catalog, answers);
      assert.ok(matches.some(({ code }) => code === target.code));
      assert.ok(sameContests(matches));
      assert.deepEqual([...matches[0].contestIds].sort(), [...target.contestIds].sort());
    }
  }
});

test('county imports reject SF local reuse, missing content, orphan contests and duplicate aliases', () => {
  const input = bundles[0].input;
  const local = original.contests.find(({ section }) => section === 'Local')!;
  assert.throws(
    () =>
      resolveCountyBundle(
        { ...input, sharedContestIds: [...input.sharedContestIds, local.id] },
        original.contests,
      ),
    /unknown shared contest/,
  );
  assert.throws(
    () =>
      resolveCountyBundle(
        { ...input, sharedContestIds: [...input.sharedContestIds, 'missing'] },
        original.contests,
      ),
    /unknown shared contest/,
  );
  assert.throws(
    () =>
      resolveCountyBundle(
        { ...input, contests: [...input.contests, { ...local, id: 'unused' }] },
        original.contests,
      ),
    /orphan contest/,
  );
  assert.throws(() =>
    resolveCountyBundle(
      {
        ...input,
        styles: input.styles.map((style: object) => ({
          ...style,
          aliases: ['duplicate', 'DUPLICATE'],
        })),
      },
      original.contests,
    ),
  );
});
