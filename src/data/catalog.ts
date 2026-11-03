import countyDirectory from './counties.json';
import { ballot as original } from './ballot';
import { resolveCountyBundle } from './countyBundle';
import extraContests from './elections/2026-11-03/san-francisco-extra-contests.json';
import styles from './elections/2026-11-03/san-francisco-styles.json';
import officialContestIds from './elections/2026-11-03/san-francisco-contest-map.json';
import { ballotSchema, contestSchema, type Ballot } from './schema';
import {
  ballotPath,
  countyBallotsSchema,
  equivalentGroups,
  matchingCode,
  type CountyBallots,
  type BallotStyle,
} from '../lib/ballotMatching';

const officialOrder = new Map(
  Object.entries(officialContestIds).map(([key, value]) => [value, Number(key)]),
);
const contests = [
  ...original.contests,
  ...extraContests.map((contest) => contestSchema.parse(contest)),
].sort((a, b) => (officialOrder.get(a.id) ?? Infinity) - (officialOrder.get(b.id) ?? Infinity));
const contestMap = new Map(contests.map((contest) => [contest.id, contest]));
const sectionOrder = ['Federal', 'State', 'Local'];

const sf = countyBallotsSchema.parse({
  electionId: '2026-11-03',
  countyId: 'san-francisco',
  countyName: 'San Francisco',
  verifiedOn: '2026-11-02',
  coverage: 'partial',
  coverageNote:
    'Includes 33 regular general-election ballot types. School-board-only ballots are not included; use the official sample-ballot link below for help.',
  screeningContestId: 'governor',
  sourceUrl: 'https://sfelections.org/tools/election_data/datasets.php',
  lookupUrl: 'https://sfelections.org/tools/portal/',
  codeHelp:
    'Enter your official San Francisco ballot type (1–33), if known. This is not your precinct number. If you can’t find a ballot type, choose “Match my sample ballot.”',
  contests: contests.map(({ id, title }) => ({ id, title })),
  styles: styles.map((style) => ({
    ...style,
    aliases: [],
    label: `Ballot type ${style.code}`,
    // Keep worksheet order consistent across methods; candidate rotation is not reproduced.
    contestIds: [...style.contestIds].sort((a, b) => {
      const ca = contestMap.get(a);
      const cb = contestMap.get(b);
      if (!ca || !cb) throw new Error(`Unresolved contest ${a} or ${b}`);
      return (
        sectionOrder.indexOf(ca.section) - sectionOrder.indexOf(cb.section) ||
        contests.indexOf(ca) - contests.indexOf(cb)
      );
    }),
  })),
});

const importedFiles = import.meta.glob('./elections/2026-11-03/counties/*.json', {
  eager: true,
  import: 'default',
});
const importedCounties = Object.values(importedFiles).map((data) =>
  resolveCountyBundle(data, original.contests),
);
const sfSources = [
  {
    label: 'Official ballot-type mapping',
    url: 'https://sfelections.org/tools/election_data/datasets/2026-11-03/EWMJ014_ContestBalTypeXref.txt',
    group: 'sources' as const,
  },
  { label: 'Your official sample ballot', url: sf.lookupUrl, group: 'sources' as const },
  {
    label: 'San Francisco voter pamphlet',
    url: 'https://media.api.sf.gov/documents/N26_EN_VIP.pdf',
    group: 'sources' as const,
  },
];
const countyDatasets = [
  { catalog: sf, contests, jurisdiction: 'City & County of San Francisco', sources: sfSources },
  ...importedCounties,
];
export const catalogs: CountyBallots[] = countyDatasets.map(({ catalog }) => catalog);
const countyIds = catalogs.map(({ countyId }) => countyId);
if (new Set(countyIds).size !== countyIds.length) throw new Error('Duplicate imported county');
for (const data of catalogs) {
  if (!countyDirectory.some(({ id, name }) => id === data.countyId && name === data.countyName))
    throw new Error(`Unknown county: ${data.countyId}`);
  if (data.electionId !== '2026-11-03') throw new Error(`Wrong election: ${data.countyId}`);
}
export const countyOptions = countyDirectory.map((county) => ({
  ...county,
  coverage: catalogs.find(({ countyId }) => countyId === county.id)?.coverage,
  dataUrl: catalogs.some(({ countyId }) => countyId === county.id)
    ? `/data/2026-11-03/${county.id}.json`
    : undefined,
}));

function buildBallot(data: CountyBallots, selected: BallotStyle[]): Ballot {
  const dataset = countyDatasets.find(({ catalog }) => catalog.countyId === data.countyId)!;
  const countyContests = new Map(dataset.contests.map((contest) => [contest.id, contest]));
  const first = selected[0];
  const group = equivalentGroups(data).find((group) =>
    group.some(({ code }) => code === first.code),
  )!;
  const originalIds = new Set(original.contests.map(({ id }) => id));
  const isOriginal =
    data.countyId === 'san-francisco' &&
    data.electionId === '2026-11-03' &&
    first.contestIds.length === originalIds.size &&
    first.contestIds.every((id) => originalIds.has(id));
  return ballotSchema.parse({
    election: original.election,
    date: original.date,
    dateShort: original.dateShort,
    jurisdiction: dataset.jurisdiction,
    locationShort: data.countyName,
    isMock: false,
    // Equivalent contest sets share saved choices. Preserve the existing personal worksheet.
    id: isOriginal ? original.id : `ca-${data.electionId}-${data.countyId}-${matchingCode(group)}`,
    ballotCode: selected.map(({ code }) => code).join(', '),
    countyId: data.countyId,
    provenance: {
      verifiedOn: data.verifiedOn,
      districts: first.districts,
      note: 'Matched to published county ballot mappings or official sample ballots. Districts shown come from contest headings and are not a complete district lookup. Contests are grouped by Federal, State, and Local; printed candidate order may differ. Compare every contest with your official ballot before voting.',
      sources: dataset.sources,
    },
    contests: first.contestIds
      .map((id) => {
        const contest = countyContests.get(id);
        if (!contest) throw new Error(`Missing contest content: ${id}`);
        return contest;
      })
      .sort((a, b) => sectionOrder.indexOf(a.section) - sectionOrder.indexOf(b.section)),
  });
}

export const ballotEntries = catalogs.flatMap((data) => {
  const groups = equivalentGroups(data).filter((group) => group.length > 1);
  return [...data.styles.map((style) => [style]), ...groups].map((selected) => ({
    basePath: ballotPath(data, matchingCode(selected)).replace(/\/$/, ''),
    ballot: buildBallot(data, selected),
  }));
});
export const originalWorksheetPath = ballotPath(
  sf,
  matchingCode(equivalentGroups(sf).find((group) => group.some(({ code }) => code === '1'))!),
);
