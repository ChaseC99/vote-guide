import type { Ballot } from '../data/schema';
import { contestPath, numberLabel, sectionNames } from '../lib/navigation';
import { selectionCount, selectionSummary, type WorksheetState } from '../lib/selections';
import type { SaveStatus } from '../lib/useWorksheet';
import { SaveIndicator } from './SaveIndicator';

interface Props {
  ballot: Ballot;
  currentId?: string;
  lastVisited: string | null;
  state: WorksheetState;
  status: SaveStatus;
  onPrivacy: () => void;
  onPrint: () => void;
}

export function Worksheet({
  ballot,
  currentId,
  lastVisited,
  state,
  status,
  onPrivacy,
  onPrint,
}: Props) {
  const compact = !!currentId;
  const last = ballot.contests.find(({ id }) => id === lastVisited);
  const marked = ballot.contests.filter(({ id }) => selectionCount(state.selections[id])).length;
  const Container = compact ? 'aside' : 'main';
  return (
    <Container className={`worksheet ${compact ? 'compact' : ''}`} aria-label="Ballot worksheet">
      <div className="worksheet-inner">
        <header className="worksheet-header">
          <p className="eyebrow election-line">
            {ballot.election} · {ballot.date} · {ballot.jurisdiction}
          </p>
          <p className="eyebrow mobile-election">
            {ballot.dateShort} · {ballot.locationShort}
          </p>
          <div className="worksheet-title-row">
            {compact ? (
              <h2>Ballot worksheet</h2>
            ) : (
              <h1 id="page-title" tabIndex={-1}>
                Ballot worksheet
              </h1>
            )}
            {compact && (
              <a
                className="button expand-button"
                href="/"
                data-route
                title="Expand worksheet (Esc)"
              >
                ⤢ Expand
              </a>
            )}
            <div className="worksheet-actions">
              <div className="save-status">
                <SaveIndicator status={status} compact={compact} onClick={onPrivacy} />
                <span>
                  · {marked} of {ballot.contests.length} marked
                </span>
              </div>
              <button
                className={compact ? 'text-button compact-print' : 'button primary print-button'}
                onClick={onPrint}
              >
                {compact ? 'Print' : 'Print / PDF'}
              </button>
            </div>
          </div>
        </header>
        <div className="worksheet-body">
          {!compact && ballot.isMock && (
            <p className="sample-notice">
              <span className="sample-label">SAMPLE BALLOT</span> Fictional contests for
              demonstration.
            </p>
          )}
          {sectionNames.map((section) => {
            const contests = ballot.contests.filter((contest) => contest.section === section);
            if (!contests.length) return null;
            return (
              <section className="worksheet-section" key={section} aria-label={section}>
                <h2 className="section-heading">
                  <span>{section}</span>
                  <span>
                    {contests.filter(({ id }) => selectionCount(state.selections[id])).length} /{' '}
                    {contests.length}
                    <span className="full-count"> marked</span>
                  </span>
                </h2>
                <div>
                  {contests.map((contest) => {
                    const here = !compact && lastVisited === contest.id;
                    const selected = !!selectionCount(state.selections[contest.id]);
                    return (
                      <a
                        className={`worksheet-row ${contest.id === currentId ? 'current' : ''} ${here ? 'were-here' : ''}`}
                        id={`row-${contest.id}`}
                        href={contestPath(contest)}
                        data-route
                        key={contest.id}
                        aria-current={contest.id === currentId ? 'page' : undefined}
                      >
                        <span className="contest-number">
                          {numberLabel(ballot.contests.indexOf(contest))}
                        </span>
                        <span className="row-description">
                          {here && <span className="you-were-here">You were here</span>}
                          <span className="row-title">
                            {compact ? contest.shortTitle : contest.title}
                            {state.notes[contest.id]?.trim() && (
                              <span
                                className="note-marker"
                                aria-label="Has a note"
                                title="Has a note"
                              >
                                ✎
                              </span>
                            )}
                          </span>
                          <span className="row-rule">{contest.rule}</span>
                        </span>
                        <span className={`row-value ${selected ? '' : 'unmarked'}`}>
                          {selected && (
                            <span className="row-check" aria-hidden="true">
                              ✓{' '}
                            </span>
                          )}
                          <span className="row-value-full">
                            {selectionSummary(contest, state.selections[contest.id])}
                          </span>
                          <span className="row-value-mobile">
                            {!selected
                              ? 'No selection'
                              : contest.type === 'ranked'
                                ? `${selectionCount(state.selections[contest.id])} ranked`
                                : contest.type === 'multi'
                                  ? `${selectionCount(state.selections[contest.id])} of ${contest.max} chosen`
                                  : selectionSummary(contest, state.selections[contest.id])}
                          </span>
                        </span>
                      </a>
                    );
                  })}
                </div>
              </section>
            );
          })}
          {!compact && (
            <footer className="worksheet-footer">
              {last && (
                <a className="button continue-button" href={contestPath(last)} data-route>
                  Continue at {numberLabel(ballot.contests.indexOf(last))} {last.shortTitle}{' '}
                  <span aria-hidden="true">→</span>
                </a>
              )}
              <p>
                Your selections and notes stay in this browser on this device. Nothing is sent
                anywhere. Clearing your browser data erases them.
              </p>
              <button className="text-button privacy-link" onClick={onPrivacy}>
                About saving & privacy
              </button>
              <span className="eyebrow">A personal worksheet · Not an official ballot</span>
            </footer>
          )}
        </div>
      </div>
      {!compact && (
        <div className="mobile-worksheet-bar">
          <div>
            <SaveIndicator status={status} compact onClick={onPrivacy} />
            <span className="mobile-marked">
              {marked} of {ballot.contests.length} marked
            </span>
          </div>
          <button className="button primary" onClick={onPrint}>
            Print / PDF
          </button>
        </div>
      )}
    </Container>
  );
}
