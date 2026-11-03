import { readFileSync, readdirSync } from 'node:fs';
import { resolveCountyBundle } from '../src/data/countyBundle.ts';
import { ballotSchema } from '../src/data/schema.ts';
import { equivalentGroups } from '../src/lib/ballotMatching.ts';

const read = (path: string) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const original = ballotSchema.parse(read('../src/data/ballot.json'));
const directory = read('../src/data/counties.json');
const root = '../src/data/elections/2026-11-03/counties/';
const loaded = new Map<string, string>([
  ['san-francisco', 'partial · 33 regular ballot types · 21 contest sets'],
]);
for (const name of readdirSync(new URL(root, import.meta.url)).filter((name) =>
  name.endsWith('.json'),
)) {
  const { catalog, contests, jurisdiction, sources } = resolveCountyBundle(
    read(root + name),
    original.contests,
  );
  if (loaded.has(catalog.countyId)) throw new Error(`Duplicate county: ${catalog.countyId}`);
  if (name !== `${catalog.countyId}.json` || catalog.electionId !== '2026-11-03')
    throw new Error(`Wrong county/election: ${name}`);
  if (
    !directory.some(
      ({ id, name }: { id: string; name: string }) =>
        id === catalog.countyId && name === catalog.countyName,
    )
  )
    throw new Error(`Unknown county: ${name}`);
  const byId = new Map(contests.map((contest) => [contest.id, contest]));
  for (const style of catalog.styles)
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
  loaded.set(
    catalog.countyId,
    `${catalog.coverage} · ${catalog.styles.length} ballot types · ${equivalentGroups(catalog).length} contest sets`,
  );
}
console.log('November 3, 2026 — verified worksheet coverage');
for (const county of directory)
  console.log(
    `${county.name.padEnd(16)} ${loaded.get(county.id) ?? 'not imported — official office link only'}`,
  );
console.log(
  `\n${loaded.size}/${directory.length} counties have imported ballots; partial counties do not cover every voter.`,
);
