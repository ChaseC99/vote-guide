import { useCallback, useEffect, useState } from 'react';
import type { Contest } from '../data/schema';

export const contestPath = (contest: Contest) => `/contest/${contest.slug}/`;
export const numberLabel = (index: number) => String(index + 1).padStart(2, '0');
export const sectionNames = ['Federal', 'State', 'Local'] as const;

export function useNavigation(initialPath: string, contests: Contest[]) {
  const [path, setPath] = useState(initialPath);
  const [lastVisited, setLastVisited] = useState<string | null>(null);
  const current = contests.find((contest) => contestPath(contest) === path);

  const navigate = useCallback((next: string) => {
    if (window.location.pathname !== next) window.history.pushState({}, '', next);
    setPath(next);
  }, []);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname.replace(/\/?$/, '/'));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    if (current) setLastVisited(current.id);
    document.title = `${current?.shortTitle ?? (path === '/complete/' ? 'End of ballot' : 'Ballot worksheet')} · San Francisco`;
    const frame = requestAnimationFrame(() => {
      const target = current
        ? document.getElementById('contest-title')
        : document.getElementById('page-title');
      document.querySelector('.contest-pane')?.scrollTo(0, 0);
      window.scrollTo(0, 0);
      target?.focus({ preventScroll: true });
      if (path === '/' && lastVisited) {
        const row = document.getElementById(`row-${lastVisited}`);
        row?.scrollIntoView({ block: 'center' });
        row?.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
    // Run on navigation, not when remembering the last contest.
  }, [path, current]);

  useEffect(() => {
    if (!current) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.querySelector('dialog[open]')) navigate('/');
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [current, navigate]);

  return { path, current, lastVisited, navigate };
}
