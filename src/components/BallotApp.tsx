import type { MouseEvent } from 'react';
import type { Ballot } from '../data/schema';
import { contestPath, useNavigation } from '../lib/navigation';
import { ContestPane } from './ContestPane';
import { Worksheet } from './Worksheet';

export default function BallotApp({ ballot, initialPath = '/' }: { ballot: Ballot; initialPath?: string }) {
  const { path, current, lastVisited, navigate } = useNavigation(initialPath, ballot.contests);
  const complete = path === '/complete/';
  function handleLink(event: MouseEvent<HTMLDivElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[data-route]');
    if (!anchor || anchor.target || anchor.origin !== window.location.origin) return;
    event.preventDefault();
    navigate(anchor.pathname);
  }
  function next() {
    if (!current) return;
    const nextContest = ballot.contests[ballot.contests.indexOf(current) + 1];
    navigate(nextContest ? contestPath(nextContest) : window.matchMedia('(max-width: 799px)').matches ? '/complete/' : '/');
  }
  return <div onClick={handleLink}>
    <a className="skip-link" href={current ? '#main-content' : '#page-title'}>Skip to content</a>
    <div className={`app-shell ${current ? 'is-split' : ''}`}>
      {!complete && <Worksheet ballot={ballot} currentId={current?.id} lastVisited={lastVisited} />}
      {current && <ContestPane key={current.id} ballot={ballot} contest={current} onNext={next} />}
      {complete && <main className="completion" id="main-content"><p className="eyebrow">End of ballot</p><h1 id="page-title" tabIndex={-1}>That’s every contest.</h1><p>You marked 0 of {ballot.contests.length}. Unmarked contests show “No selection” in your printout.</p><a href={contestPath(ballot.contests[0])} data-route>Jump to first unmarked: 01 {ballot.contests[0].shortTitle} →</a><a className="button" href="/" data-route>Back to all contests</a></main>}
    </div>
  </div>;
}
