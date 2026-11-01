import type { Contest } from '../data/schema.ts';

export type Selection = string | string[] | Record<string, number>;
export type Selections = Record<string, Selection>;
export interface WorksheetState { version: 1; ballotId: string; selections: Selections; notes: Record<string, string>; }
export const emptyState = (ballotId: string): WorksheetState => ({ version: 1, ballotId, selections: {}, notes: {} });

const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);

export function normalizeSelection(contest: Contest, value: unknown): Selection | undefined {
  if (contest.type === 'yesno') return value === 'Yes' || value === 'No' ? value : undefined;
  const ids = contest.candidates.map(({ id }) => id);
  if (contest.type === 'single') return typeof value === 'string' && ids.includes(value) ? value : undefined;
  if (contest.type === 'multi') {
    if (!Array.isArray(value)) return undefined;
    const picked = ids.filter((id) => value.includes(id)).slice(0, contest.max);
    return picked.length ? picked : undefined;
  }
  if (!isRecord(value)) return undefined;
  const ranks: Record<string, number> = {};
  const used = new Set<number>();
  for (const id of ids) {
    const rank = value[id];
    if (typeof rank === 'number' && Number.isInteger(rank) && rank >= 1 && rank <= contest.max && !used.has(rank)) {
      ranks[id] = rank;
      used.add(rank);
    }
  }
  return used.size ? ranks : undefined;
}

export function restoreState(raw: string | null, ballotId: string, contests: Contest[]): WorksheetState {
  const fresh = emptyState(ballotId);
  if (!raw) return fresh;
  const data: unknown = JSON.parse(raw);
  if (!isRecord(data) || data.version !== 1 || data.ballotId !== ballotId) return fresh;
  for (const contest of contests) {
    const selection = normalizeSelection(contest, isRecord(data.selections) ? data.selections[contest.id] : undefined);
    if (selection !== undefined) fresh.selections[contest.id] = selection;
    if (isRecord(data.notes) && typeof data.notes[contest.id] === 'string') fresh.notes[contest.id] = data.notes[contest.id] as string;
  }
  return fresh;
}

export function selectionCount(value: Selection | undefined): number {
  return typeof value === 'string' ? Number(!!value) : value ? Object.keys(value).length : 0;
}

export function selectionLines(contest: Contest, value: Selection | undefined): string[] {
  if (!selectionCount(value)) return [];
  if (contest.type === 'yesno') return [value as string];
  const name = (id: string) => contest.candidates.find((candidate) => candidate.id === id)?.name ?? id;
  if (contest.type === 'single') return [name(value as string)];
  if (contest.type === 'multi') return contest.candidates.filter(({ id }) => (value as string[]).includes(id)).map(({ name }) => name);
  return Object.entries(value as Record<string, number>).sort((a, b) => a[1] - b[1]).map(([id, rank]) => `${rank} ${name(id)}`);
}

export function selectionSummary(contest: Contest, value: Selection | undefined) {
  return selectionLines(contest, value).join(' · ') || 'No selection';
}

export function toggleChoice(contest: Contest, value: Selection | undefined, choice: string): { selection?: Selection; limited?: boolean } {
  if (contest.type === 'ranked') return { selection: value };
  if (contest.type === 'yesno' && choice !== 'Yes' && choice !== 'No') return { selection: value };
  if (contest.type !== 'yesno' && !contest.candidates.some(({ id }) => id === choice)) return { selection: value };
  if (contest.type !== 'multi') return { selection: value === choice ? undefined : choice };
  const picked = Array.isArray(value) ? value : [];
  if (picked.includes(choice)) return { selection: normalizeSelection(contest, picked.filter((id) => id !== choice)) };
  if (picked.length >= contest.max) return { selection: value, limited: true };
  return { selection: normalizeSelection(contest, [...picked, choice]) };
}

export function toggleRank(contest: Contest, value: Selection | undefined, candidate: string, rank: number): Selection | undefined {
  if (contest.type !== 'ranked' || !contest.candidates.some(({ id }) => id === candidate) || !Number.isInteger(rank) || rank < 1 || rank > contest.max) return value;
  const previous = isRecord(value) ? value as Record<string, number> : {};
  const result = Object.fromEntries(Object.entries(previous).filter(([id, selectedRank]) => id !== candidate && selectedRank !== rank));
  if (previous[candidate] !== rank) result[candidate] = rank;
  return Object.keys(result).length ? result : undefined;
}

export function hasSkippedRank(value: Selection | undefined) {
  if (!isRecord(value)) return false;
  const ranks = Object.values(value) as number[];
  return ranks.length > 0 && Math.max(...ranks) > ranks.length;
}
