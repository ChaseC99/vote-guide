import { z } from 'zod';

export const normalizeCode = (value: string) => value.trim().toUpperCase();

export const countyBallotsSchema = z
  .object({
    electionId: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    countyId: z.string().regex(/^[a-z0-9-]+$/),
    countyName: z.string().min(1),
    verifiedOn: z.iso.date(),
    coverage: z.enum(['complete', 'partial']),
    coverageNote: z.string().min(1),
    screeningContestId: z.string().optional(),
    sourceUrl: z.url().startsWith('https://'),
    lookupUrl: z.url().startsWith('https://'),
    codeHelp: z.string().min(1),
    contests: z.array(z.object({ id: z.string(), title: z.string().min(1) })).min(1),
    styles: z
      .array(
        z.object({
          code: z.string().regex(/^[A-Za-z0-9-]+$/),
          aliases: z.array(z.string().min(1)).default([]),
          label: z.string().min(1),
          contestIds: z.array(z.string()).min(1),
          districts: z.record(z.string(), z.number().int().positive()).default({}),
        }),
      )
      .min(1),
  })
  .superRefine((data, ctx) => {
    const ids = new Set(data.contests.map(({ id }) => id));
    if (ids.size !== data.contests.length)
      ctx.addIssue({ code: 'custom', message: 'Duplicate contest IDs' });
    const codes = new Set<string>();
    data.styles.forEach((style) => {
      if (data.screeningContestId && !style.contestIds.includes(data.screeningContestId))
        ctx.addIssue({
          code: 'custom',
          message: 'Screening contest must appear on every loaded ballot',
        });
      for (const code of [style.code, ...style.aliases]) {
        const normalized = normalizeCode(code);
        if (!normalized || codes.has(normalized))
          ctx.addIssue({ code: 'custom', message: `Duplicate or empty ballot code: ${code}` });
        codes.add(normalized);
      }
      if (new Set(style.contestIds).size !== style.contestIds.length)
        ctx.addIssue({ code: 'custom', message: `Duplicate contests in ballot ${style.code}` });
      style.contestIds.forEach((id) => {
        if (!ids.has(id)) ctx.addIssue({ code: 'custom', message: `Unknown contest: ${id}` });
      });
    });
  });

export type CountyBallots = z.infer<typeof countyBallotsSchema>;
export type BallotStyle = CountyBallots['styles'][number];
export type MatchAnswer = { contestId: string; present: boolean };

export function findByCode(data: CountyBallots, code: string) {
  const normalized = normalizeCode(code);
  if (!normalized) return undefined;
  return data.styles.find((style) =>
    [style.code, ...style.aliases].some((alias) => normalizeCode(alias) === normalized),
  );
}

export function matchingStyles(data: CountyBallots, answers: MatchAnswer[]) {
  return data.styles.filter((style) =>
    answers.every(({ contestId, present }) => style.contestIds.includes(contestId) === present),
  );
}

// Only ask questions that split the remaining styles. A balanced split minimizes work.
export function nextQuestion(data: CountyBallots, answers: MatchAnswer[], skipped: string[] = []) {
  const remaining = matchingStyles(data, answers);
  if (
    remaining.length &&
    data.screeningContestId &&
    !answers.some(({ contestId }) => contestId === data.screeningContestId) &&
    !skipped.includes(data.screeningContestId)
  )
    return data.contests.find(({ id }) => id === data.screeningContestId);
  // Count each remaining ballot once. Large counties have hundreds of styles;
  // rescanning every style for every possible contest makes each answer costly.
  const appearances = new Map<string, number>();
  for (const style of remaining)
    for (const id of style.contestIds)
      appearances.set(id, (appearances.get(id) ?? 0) + 1);
  return data.contests
    .filter(({ id }) => !answers.some((answer) => answer.contestId === id) && !skipped.includes(id))
    .map((contest) => ({
      contest,
      yes: appearances.get(contest.id) ?? 0,
    }))
    .filter(({ yes }) => yes > 0 && yes < remaining.length)
    .sort(
      (a, b) => Math.abs(remaining.length - 2 * a.yes) - Math.abs(remaining.length - 2 * b.yes),
    )[0]?.contest;
}

export function ballotPath(data: Pick<CountyBallots, 'electionId' | 'countyId'>, code: string) {
  return `/ballot/${data.electionId}/${data.countyId}/${encodeURIComponent(code)}/`;
}

export function sameContests(styles: BallotStyle[]) {
  if (!styles.length) return false;
  const first = new Set(styles[0].contestIds);
  return styles.every(
    (style) =>
      style.contestIds.length === first.size && style.contestIds.every((id) => first.has(id)),
  );
}

export function matchingCode(styles: BallotStyle[]) {
  if (!sameContests(styles)) throw new Error('Ballots have different contests');
  return styles.length === 1 ? styles[0].code : `match-${styles.map(({ code }) => code).join('-')}`;
}

export function equivalentGroups(data: CountyBallots) {
  const groups = new Map<string, BallotStyle[]>();
  data.styles.forEach((style) => {
    const key = [...style.contestIds].sort().join('|');
    groups.set(key, [...(groups.get(key) ?? []), style]);
  });
  return [...groups.values()];
}
