import { z } from 'zod';
import { contestSchema, type Contest, type SourceLink } from './schema.ts';
import { countyBallotsSchema } from '../lib/ballotMatching.ts';

// A county import is independent of SF. Reusing a statewide contest is explicit,
// and only valid when its names and voting rules match that county's sample ballot.
export const countyBundleSchema = z.object({
  ...countyBallotsSchema.shape,
  jurisdiction: z.string().min(1),
  contests: z.array(contestSchema),
  sharedContestIds: z.array(z.string()).default([]),
  sources: z
    .array(
      z.object({
        label: z.string().min(1),
        url: z.url().startsWith('https://'),
        group: z.literal('sources'),
      }),
    )
    .min(1),
});

export function resolveCountyBundle(input: unknown, shared: Contest[]) {
  const bundle = countyBundleSchema.parse(input);
  const ids = new Set<string>();
  const sharedMap = new Map(
    shared.filter(({ section }) => section !== 'Local').map((contest) => [contest.id, contest]),
  );
  const contests = [
    ...bundle.sharedContestIds.map((id) => {
      const contest = sharedMap.get(id);
      if (!contest) throw new Error(`${bundle.countyId}: unknown shared contest ${id}`);
      return contest;
    }),
    ...bundle.contests,
  ];
  for (const contest of contests) {
    if (ids.has(contest.id)) throw new Error(`${bundle.countyId}: duplicate contest ${contest.id}`);
    if (!contest.links.some(({ url, group }) => url && group === 'sources'))
      throw new Error(`${bundle.countyId}: contest ${contest.id} has no source`);
    ids.add(contest.id);
  }
  const catalog = countyBallotsSchema.parse({
    ...bundle,
    contests: contests.map(({ id, title }) => ({ id, title })),
  });
  const used = new Set(catalog.styles.flatMap(({ contestIds }) => contestIds));
  for (const id of ids)
    if (!used.has(id)) throw new Error(`${bundle.countyId}: orphan contest ${id}`);
  return {
    catalog,
    contests,
    jurisdiction: bundle.jurisdiction,
    sources: bundle.sources as SourceLink[],
  };
}
