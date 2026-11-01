import type { Ballot } from '../data/schema';
import { contestPath, numberLabel, sectionNames } from '../lib/navigation';

interface Props {
  ballot: Ballot;
  currentId?: string;
  lastVisited: string | null;
}

export function Worksheet({ ballot, currentId, lastVisited }: Props) {
  const compact = !!currentId;
  const last = ballot.contests.find(({ id }) => id === lastVisited);
  return <aside className={`worksheet ${compact ? 'compact' : ''}`} aria-label="Ballot worksheet">
    <div className="worksheet-inner">
      <header className="worksheet-header">
        <p className="eyebrow election-line">{ballot.election} · {ballot.date} · {ballot.jurisdiction}</p>
        <p className="eyebrow mobile-election">{ballot.dateShort} · {ballot.locationShort}</p>
        <div className="worksheet-title-row">
          {compact ? <h2>Ballot worksheet</h2> : <h1 id="page-title" tabIndex={-1}>Ballot worksheet</h1>}
          {compact && <a className="button expand-button" href="/" data-route title="Expand worksheet (Esc)">⤢ Expand</a>}
          <div className="worksheet-actions"><span className="save-status"><span className="status-dot" />Saved on this device · 0 of {ballot.contests.length} marked</span></div>
        </div>
      </header>
      <div className="worksheet-body">
        {!compact && ballot.isMock && <p className="sample-notice"><span className="sample-label">SAMPLE BALLOT</span> Fictional contests for demonstration.</p>}
        {sectionNames.map((section) => {
          const contests = ballot.contests.filter((contest) => contest.section === section);
          if (!contests.length) return null;
          return <section className="worksheet-section" key={section} aria-label={section}>
            <h2 className="section-heading"><span>{section}</span><span>0 / {contests.length}<span className="full-count"> marked</span></span></h2>
            <div>{contests.map((contest) => {
              const here = !compact && lastVisited === contest.id;
              return <a className={`worksheet-row ${contest.id === currentId ? 'current' : ''} ${here ? 'were-here' : ''}`} id={`row-${contest.id}`} href={contestPath(contest)} data-route key={contest.id} aria-current={contest.id === currentId ? 'page' : undefined}>
                <span className="contest-number">{numberLabel(ballot.contests.indexOf(contest))}</span>
                <span className="row-description">{here && <span className="you-were-here">You were here</span>}<span className="row-title">{compact ? contest.shortTitle : contest.title}</span><span className="row-rule">{contest.rule}</span></span>
                <span className="row-value unmarked">No selection</span>
              </a>;
            })}</div>
          </section>;
        })}
        {!compact && <footer className="worksheet-footer">
          {last && <a className="button continue-button" href={contestPath(last)} data-route>Continue at {numberLabel(ballot.contests.indexOf(last))} {last.shortTitle} <span aria-hidden="true">→</span></a>}
          <p>Your selections and notes stay in this browser on this device. Nothing is sent anywhere. Clearing your browser data erases them.</p>
          <span className="eyebrow">A personal worksheet · Not an official ballot</span>
        </footer>}
      </div>
    </div>
  </aside>;
}
