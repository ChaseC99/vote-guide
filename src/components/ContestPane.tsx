import type { Ballot, Contest } from '../data/schema';
import { numberLabel } from '../lib/navigation';
import { useBallotPaths } from '../lib/routeContext';
import { Progress } from './Progress';
import { SourceLinks } from './SourceLinks';
import { SelectionControls } from './SelectionControls';
import type { Selection, WorksheetState } from '../lib/selections';

interface Props {
  ballot: Ballot;
  contest: Contest;
  onNext: () => void;
  state: WorksheetState;
  ready: boolean;
  onSelection: (value: Selection | undefined) => void;
  onNote: (note: string) => void;
  onPrivacy: () => void;
}

export function ContestPane({
  ballot,
  contest,
  onNext,
  state,
  ready,
  onSelection,
  onNote,
  onPrivacy,
}: Props) {
  const { homePath, contestPath } = useBallotPaths();
  const index = ballot.contests.indexOf(contest);
  const previous = ballot.contests[index - 1];
  const next = ballot.contests[index + 1];
  const typeLabel = {
    yesno: 'Yes/No',
    single: 'Single choice',
    multi: 'Multiple choice',
    ranked: 'Ranked choice',
  }[contest.type];
  const value = state.selections[contest.id];
  function focusNotes() {
    document.getElementById('contest-notes')?.focus();
    document
      .getElementById('notes-label')
      ?.scrollIntoView({ block: 'center', behavior: 'instant' });
  }
  return (
    <main className="contest-pane" id="main-content">
      <header className="contest-mobile-header">
        <div className="mobile-topline">
          <a href={homePath} data-route>
            ‹ All
          </a>
          <span>
            {numberLabel(index)} / {String(ballot.contests.length).padStart(2, '0')}
          </span>
        </div>
        <Progress ballot={ballot} current={contest} selections={state.selections} />
      </header>
      <div className="contest-content">
        <p className="eyebrow contest-kicker">
          {contest.section} ·{' '}
          {contest.type === 'single' && contest.writeInOnly ? 'Write-in only' : typeLabel}
          {ballot.isMock ? ' · Sample contest' : ''}
        </p>
        <h1 id="contest-title" tabIndex={-1}>
          {contest.title}
        </h1>
        <p className="contest-summary">{contest.summary}</p>
        {contest.type === 'yesno' && (
          <>
            <div className="measure-meanings">
              <div>
                <h2>A yes vote means</h2>
                <p>{contest.yes}</p>
              </div>
              <div>
                <h2>A no vote means</h2>
                <p>{contest.no}</p>
              </div>
            </div>
            {contest.threshold && <p className="threshold">{contest.threshold}</p>}
          </>
        )}
        <div className="contest-resources">
          {(['arguments', 'sources'] as const)
            .filter((group) => contest.links.some((link) => link.group === group))
            .map((group) => (
              <section
                key={group}
                className="resource-group resource-links"
                aria-labelledby={`resource-${group}`}
              >
                <h2 id={`resource-${group}`}>
                  {group === 'arguments'
                    ? contest.type === 'yesno'
                      ? 'Arguments & rebuttals'
                      : 'Candidate statements'
                    : 'Sources'}
                </h2>
                <SourceLinks links={contest.links.filter((link) => link.group === group)} />
                {contest.links.filter((link) => link.group === group).some((link) => !link.url) && (
                  <p className="source-note">
                    Source links will be added with the official ballot.
                  </p>
                )}
              </section>
            ))}
        </div>
        {contest.type !== 'yesno' &&
          contest.candidates.some((candidate) => candidate.links.some((link) => link.url)) && (
            <details className="resource-group candidate-information">
              <summary>
                Candidate information <span aria-hidden="true">+</span>
              </summary>
              {contest.candidates.map((candidate) => (
                <div className="candidate-info" key={candidate.id}>
                  <h3>{candidate.name}</h3>
                  <p>{[candidate.party, candidate.occupation].filter(Boolean).join(' · ')}</p>
                  <SourceLinks links={candidate.links} />
                </div>
              ))}
            </details>
          )}
        <section className="selection-box" aria-label="Your selections and notes">
          <SelectionControls contest={contest} value={value} onChange={onSelection} ready={ready} />
          <div className="notes-heading">
            <label id="notes-label" className="notes-label" htmlFor="contest-notes">
              Notes
            </label>
            <button
              className="text-button notes-privacy"
              onClick={onPrivacy}
              aria-haspopup="dialog"
            >
              Private thoughts
            </button>
          </div>
          <textarea
            id="contest-notes"
            rows={4}
            placeholder="Jot down your thoughts"
            value={state.notes[contest.id] ?? ''}
            onChange={(event) => onNote(event.target.value)}
            disabled={!ready}
          />
        </section>
        <nav className="contest-navigation" aria-label="Contests">
          <a
            className="button previous-button"
            href={previous ? contestPath(previous) : homePath}
            data-route
          >
            <span className="nav-caption">← Previous</span>
            {previous?.shortTitle ?? 'All contests'}
          </a>
          <button className="button primary next-button" onClick={onNext}>
            <span className="nav-caption">Next →</span>
            {next?.shortTitle ?? 'Back to worksheet'}
          </button>
        </nav>
      </div>
      <div className="mobile-contest-bar">
        {contest.type === 'yesno' && (
          <div className="pinned-choices" role="group" aria-label="Quick selection">
            {(['Yes', 'No'] as const).map((choice) => (
              <button
                className={`button ${value === choice ? 'selected' : ''}`}
                data-choice={choice}
                key={choice}
                aria-pressed={value === choice}
                disabled={!ready}
                onClick={() => onSelection(value === choice ? undefined : choice)}
              >
                {value === choice && <span aria-hidden="true">✓ </span>}
                {choice}
              </button>
            ))}
          </div>
        )}
        <nav aria-label="Mobile contest navigation">
          <a
            className="button"
            href={previous ? contestPath(previous) : homePath}
            data-route
            aria-label={previous ? `Previous: ${previous.shortTitle}` : 'All contests'}
          >
            ← <span>Previous</span>
          </a>
          <button className="button notes-button" onClick={focusNotes}>
            Notes{state.notes[contest.id]?.trim() ? ' ✎' : ''}
          </button>
          <button className="button primary" onClick={onNext}>
            {next ? 'Next →' : 'Finish →'}
          </button>
        </nav>
      </div>
    </main>
  );
}
