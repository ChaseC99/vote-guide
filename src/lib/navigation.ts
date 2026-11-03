import { useCallback, useEffect, useState } from 'react';
import type { Contest } from '../data/schema';

export const numberLabel = (index: number) => String(index + 1).padStart(2, '0');
export const sectionNames = ['Federal', 'State', 'Local'] as const;

export function useNavigation(
  initialPath: string,
  contests: Contest[],
  basePath = '',
  location = 'San Francisco',
) {
  const [path, setPath] = useState(initialPath);
  const [lastVisited, setLastVisited] = useState<string | null>(null);
  const current = contests.find((contest) => `${basePath}/#contest/${contest.slug}` === path);

  const navigate = useCallback((next: string) => {
    if (window.location.pathname + window.location.hash !== next)
      window.history.pushState({}, '', next);
    setPath(next);
  }, []);

  useEffect(() => {
    const onPop = () => {
      const home = `${basePath}/`;
      const next = window.location.pathname.replace(/\/?$/, '/') + window.location.hash;
      const valid =
        next === home ||
        next === `${home}#complete` ||
        contests.some(({ slug }) => next === `${home}#contest/${slug}`);
      // Invalid or stale fragment links return to this ballot's worksheet, never another ballot.
      setPath(valid ? next : home);
    };
    onPop();
    window.addEventListener('popstate', onPop);
    window.addEventListener('hashchange', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('hashchange', onPop);
    };
  }, [basePath, contests]);

  useEffect(() => {
    if (current) setLastVisited(current.id);
    document.title = `${current?.shortTitle ?? (path === `${basePath}/#complete` ? 'End of ballot' : 'Ballot worksheet')} · ${location}`;
    const frame = requestAnimationFrame(() => {
      const target = current
        ? document.getElementById('contest-title')
        : document.getElementById('page-title');
      document.querySelector('.contest-pane')?.scrollTo(0, 0);
      window.scrollTo(0, 0);
      target?.focus({ preventScroll: true });
      if (path === `${basePath}/` && lastVisited) {
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
      if (event.key === 'Escape' && !document.querySelector('dialog[open]'))
        navigate(`${basePath}/`);
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [current, navigate]);

  return { path, current, lastVisited, navigate };
}
