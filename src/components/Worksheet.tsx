import { useEffect, useState } from 'react';
import type { Ballot } from '../data/schema';
import { contestPath, numberLabel, sectionNames } from '../lib/navigation';
import { selectionCount, selectionSummary, type WorksheetState } from '../lib/selections';
import { SourceLinks } from './SourceLinks';
import { Progress } from './Progress';

interface Props {
  ballot: Ballot;
  currentId?: string;
  lastVisited: string | null;
  state: WorksheetState;
  onPrivacy: () => void;
  onPrint: () => void;
}

export function Worksheet({ ballot, currentId, lastVisited, state, onPrivacy, onPrint }: Props) {
  const compact = !!currentId;
  const current = ballot.contests.find(({ id }) => id === currentId);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
  const last = ballot.contests.find(({ id }) => id === lastVisited);
  const activeSection = ballot.contests.find(
    ({ id }) => id === (currentId ?? lastVisited),
  )?.section;
  const sampleBallot = ballot.provenance?.sources.find(
    ({ label }) => label === 'Your official sample ballot',
  );
  useEffect(() => {
    // Keep the current contest and the return-to-worksheet marker reachable after navigation.
    if (activeSection) {
      setCollapsedSections((sections) => sections.filter((section) => section !== activeSection));
    }
  }, [activeSection, currentId]);
  const Container = compact ? 'aside' : 'main';
  return (
    <Container className={`worksheet ${compact ? 'compact' : ''}`} aria-label="Vote Guide">
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
              <h2>Vote Guide</h2>
            ) : (
              <h1 id="page-title" tabIndex={-1}>
                Vote Guide
              </h1>
            )}
            <div className="worksheet-actions">
              <button
                className={compact ? 'text-button compact-print' : 'button primary print-button'}
                onClick={onPrint}
              >
                {compact ? 'Print' : 'Print / PDF'}
              </button>
            </div>
          </div>
          <div className="worksheet-progress">
            <Progress ballot={ballot} current={current} selections={state.selections} />
          </div>
        </header>
        <div className="worksheet-body">
          {!compact && ballot.isMock && (
            <p className="sample-notice">
              <span className="sample-label">SAMPLE BALLOT</span> Fictional contests for
              demonstration.
            </p>
          )}
          {!compact && ballot.provenance && (
            <details className="ballot-provenance resource-group">
              <summary>
                Your districts & official sources <span aria-hidden="true">+</span>
              </summary>
              <p>
                Congressional District {ballot.provenance.districts.congressional} · Assembly{' '}
                {ballot.provenance.districts.assembly} · Supervisor{' '}
                {ballot.provenance.districts.supervisorial} · BART{' '}
                {ballot.provenance.districts.bart}
              </p>
              <p>{ballot.provenance.note}</p>
              <SourceLinks links={ballot.provenance.sources} />
              <p className="source-note">
                Sources checked {ballot.provenance.verifiedOn}. Your street address is not stored in
                this app.
              </p>
            </details>
          )}
          {sectionNames.map((section) => {
            const contests = ballot.contests.filter((contest) => contest.section === section);
            if (!contests.length) return null;
            const expanded = !collapsedSections.includes(section);
            const sectionId = `section-${section.toLowerCase()}`;
            return (
              <section className="worksheet-section" key={section} aria-label={section}>
                <h2 className="section-heading">
                  <button
                    className="section-toggle"
                    aria-expanded={expanded}
                    aria-controls={sectionId}
                    onClick={() =>
                      setCollapsedSections((sections) =>
                        sections.includes(section)
                          ? sections.filter((item) => item !== section)
                          : [...sections, section],
                      )
                    }
                  >
                    <span className="section-name">
                      <svg
                        className="section-chevron"
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        aria-hidden="true"
                      >
                        <path
                          d="m3 4.5 3 3 3-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                      {section}
                    </span>
                    <span className="section-count">
                      {contests.filter(({ id }) => selectionCount(state.selections[id])).length} /{' '}
                      {contests.length}
                      <span className="full-count"> marked</span>
                    </span>
                  </button>
                </h2>
                <div id={sectionId} hidden={!expanded}>
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
                        </span>
                        <span
                          className={`row-value ${selected ? '' : 'unmarked'}`}
                          data-choice={
                            contest.type === 'yesno' ? state.selections[contest.id] : undefined
                          }
                        >
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
          <footer className="worksheet-footer">
            {!compact && last && (
              <a className="button continue-button" href={contestPath(last)} data-route>
                Continue at {numberLabel(ballot.contests.indexOf(last))} {last.shortTitle}{' '}
                <span aria-hidden="true">→</span>
              </a>
            )}
            <div className="footer-details">
              <p className="footer-caption">A personal worksheet · Not an official ballot</p>
              <nav className="footer-links" aria-label="Worksheet information">
                <button className="text-button" onClick={onPrivacy} aria-haspopup="dialog">
                  About saving & privacy
                </button>
                {sampleBallot?.url && (
                  <a href={sampleBallot.url} target="_blank" rel="noopener noreferrer">
                    Official sample ballot <span aria-hidden="true">↗</span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                )}
              </nav>
            </div>
          </footer>
        </div>
      </div>
    </Container>
  );
}
