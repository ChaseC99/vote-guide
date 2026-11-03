import { useState, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import type { Ballot } from '../data/schema';
import { contestPath, numberLabel, useNavigation } from '../lib/navigation';
import { useWorksheet } from '../lib/useWorksheet';
import { selectionCount } from '../lib/selections';
import { PrivacyDialog } from './PrivacyDialog';
import { PrintDialog } from './PrintDialog';
import { PrintWorksheet } from './PrintWorksheet';
import { ContestPane } from './ContestPane';
import { Worksheet } from './Worksheet';

export default function BallotApp({
  ballot,
  initialPath = '/',
}: {
  ballot: Ballot;
  initialPath?: string;
}) {
  const { path, current, lastVisited, navigate } = useNavigation(initialPath, ballot.contests);
  const complete = path === '/complete/';
  const { state, status, ready, setSelection, setNote, erase } = useWorksheet(ballot);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [includeNotes, setIncludeNotes] = useState(false);
  const marked = ballot.contests.filter(({ id }) => selectionCount(state.selections[id])).length;
  const firstUnmarked = ballot.contests.find(({ id }) => !selectionCount(state.selections[id]));
  function handleLink(event: MouseEvent<HTMLDivElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[data-route]');
    if (!anchor || anchor.target || anchor.origin !== window.location.origin) return;
    event.preventDefault();
    navigate(anchor.pathname);
  }
  function next() {
    if (!current) return;
    const nextContest = ballot.contests[ballot.contests.indexOf(current) + 1];
    navigate(
      nextContest
        ? contestPath(nextContest)
        : window.matchMedia('(max-width: 799px)').matches
          ? '/complete/'
          : '/',
    );
  }
  function print(notes: boolean) {
    flushSync(() => {
      setIncludeNotes(notes);
      setPrintOpen(false);
    });
    window.print();
  }
  return (
    <div className={`ballot-app ${current ? 'contest-open' : ''}`} onClick={handleLink}>
      <a className="skip-link" href={current ? '#main-content' : '#page-title'}>
        Skip to content
      </a>
      {status === 'unavailable' && (
        <p className="storage-warning" role="alert">
          Your browser can’t save this worksheet. You can keep making selections, but print or save
          a PDF before leaving.
        </p>
      )}
      {status === 'invalid' && (
        <p className="storage-warning" role="alert">
          The saved worksheet could not be read. New selections will start a fresh copy on this
          device.
        </p>
      )}
      <div className={`app-shell ${current ? 'is-split' : ''}`}>
        {!complete && (
          <Worksheet
            ballot={ballot}
            currentId={current?.id}
            lastVisited={lastVisited}
            state={state}
            onPrivacy={() => setPrivacyOpen(true)}
            onPrint={() => setPrintOpen(true)}
          />
        )}
        {current && (
          <button
            className="button worksheet-expand-button"
            onClick={() => navigate('/')}
            aria-label="Expand worksheet"
            title="Expand worksheet (Esc)"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
              <path d="m6 4 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        )}
        {current && (
          <ContestPane
            key={current.id}
            ballot={ballot}
            contest={current}
            onNext={next}
            state={state}
            ready={ready}
            onSelection={(selection) => setSelection(current.id, selection)}
            onNote={(note) => setNote(current.id, note)}
            onPrivacy={() => setPrivacyOpen(true)}
          />
        )}
        {complete && (
          <main className="completion" id="main-content">
            <p className="eyebrow">
              After {String(ballot.contests.length).padStart(2, '0')} · End of ballot
            </p>
            <h1 id="page-title" tabIndex={-1}>
              That’s every contest.
            </h1>
            <p>
              You marked{' '}
              <strong>
                {marked} of {ballot.contests.length}
              </strong>
              . Unmarked contests show “No selection” in your printout.
            </p>
            {firstUnmarked ? (
              <a href={contestPath(firstUnmarked)} data-route>
                Jump to first unmarked: {numberLabel(ballot.contests.indexOf(firstUnmarked))}{' '}
                {firstUnmarked.shortTitle} →
              </a>
            ) : (
              <p>Every contest has a selection. You can still go back and make changes.</p>
            )}
            <a className="button" href="/" data-route>
              Back to all contests
            </a>
            <button className="button primary" onClick={() => setPrintOpen(true)}>
              Print / Save PDF
            </button>
          </main>
        )}
      </div>
      {privacyOpen && <PrivacyDialog onClose={() => setPrivacyOpen(false)} onErase={erase} />}
      {printOpen && <PrintDialog onClose={() => setPrintOpen(false)} onPrint={print} />}
      <PrintWorksheet ballot={ballot} state={state} includeNotes={includeNotes} />
    </div>
  );
}
