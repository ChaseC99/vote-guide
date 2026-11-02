import { z } from 'zod';

const linkSchema = z.object({
  label: z.string().min(1),
  url: z
    .url()
    .refine((url) => url.startsWith('https://'), 'Use an HTTPS source URL')
    .nullable(),
  group: z.enum(['arguments', 'sources']),
});

const candidateSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  party: z.string().optional(),
  occupation: z.string().min(1),
  links: z.array(linkSchema),
});

const base = {
  id: z.string().regex(/^[a-z0-9-]+$/),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  section: z.enum(['Federal', 'State', 'Local']),
  title: z.string().min(1),
  shortTitle: z.string().min(1),
  rule: z.string().min(1),
  summary: z.string().min(1),
  links: z.array(linkSchema),
};

export const contestSchema = z.discriminatedUnion('type', [
  z.object({
    ...base,
    type: z.literal('yesno'),
    yes: z.string(),
    no: z.string(),
    yesShort: z.string(),
    noShort: z.string(),
    threshold: z.string().optional(),
  }),
  z.object({ ...base, type: z.literal('single'), candidates: z.array(candidateSchema).min(1) }),
  z.object({
    ...base,
    type: z.literal('multi'),
    max: z.number().int().positive(),
    candidates: z.array(candidateSchema).min(1),
  }),
  z.object({
    ...base,
    type: z.literal('ranked'),
    max: z.number().int().min(1).max(5),
    candidates: z.array(candidateSchema).min(1),
  }),
]);

export const ballotSchema = z
  .object({
    id: z.string().min(1),
    election: z.string().min(1),
    date: z.string().min(1),
    dateShort: z.string().min(1),
    jurisdiction: z.string().min(1),
    locationShort: z.string().min(1),
    isMock: z.boolean(),
    provenance: z
      .object({
        verifiedOn: z.iso.date(),
        districts: z.object({
          congressional: z.number().int().positive(),
          assembly: z.number().int().positive(),
          senate: z.number().int().positive(),
          boardOfEqualization: z.number().int().positive(),
          supervisorial: z.number().int().positive(),
          bart: z.number().int().positive(),
        }),
        note: z.string().min(1),
        sources: z.array(linkSchema).min(1),
      })
      .optional(),
    contests: z.array(contestSchema).min(1),
  })
  .superRefine((ballot, context) => {
    if (!ballot.isMock) {
      if (!ballot.provenance)
        context.addIssue({
          code: 'custom',
          message: 'Real ballots require provenance',
          path: ['provenance'],
        });
      ballot.contests.forEach((contest, index) => {
        if (!contest.links.some((link) => link.group === 'sources' && link.url))
          context.addIssue({
            code: 'custom',
            message: 'Real contests require an official source',
            path: ['contests', index, 'links'],
          });
      });
    }
    for (const field of ['id', 'slug'] as const) {
      const values = ballot.contests.map((contest) => contest[field]);
      if (new Set(values).size !== values.length)
        context.addIssue({
          code: 'custom',
          message: `Contest ${field}s must be unique`,
          path: ['contests'],
        });
    }
    ballot.contests.forEach((contest, index) => {
      if (
        contest.type !== 'yesno' &&
        new Set(contest.candidates.map(({ id }) => id)).size !== contest.candidates.length
      ) {
        context.addIssue({
          code: 'custom',
          message: 'Candidate IDs must be unique within a contest',
          path: ['contests', index, 'candidates'],
        });
      }
    });
  });

export type Ballot = z.infer<typeof ballotSchema>;
export type Contest = z.infer<typeof contestSchema>;
export type Candidate = z.infer<typeof candidateSchema>;
export type SourceLink = z.infer<typeof linkSchema>;
