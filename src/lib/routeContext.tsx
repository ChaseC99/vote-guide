import { createContext, useContext } from 'react';
import type { Contest } from '../data/schema';

export const RouteBase = createContext('');
export function useBallotPaths() {
  const base = useContext(RouteBase);
  return {
    homePath: `${base}/`,
    completePath: `${base}/#complete`,
    contestPath: (contest: Contest) => `${base}/#contest/${contest.slug}`,
  };
}
