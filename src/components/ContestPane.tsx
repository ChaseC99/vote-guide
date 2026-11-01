import type { Ballot, Contest } from '../data/schema';
import { contestPath, numberLabel } from '../lib/navigation';
import { Progress } from './Progress';
import { SourceLinks } from './SourceLinks';

interface Props { ballot: Ballot; contest: Contest; onNext: () => void; }

export function ContestPane({ ballot, contest, onNext }: Props) {
  const index = ballot.contests.indexOf(contest);
  const previous = ballot.contests[index - 1];
  const next = ballot.contests[index + 1];
  const typeLabel = { yesno: 'Yes/No', single: 'Single choice', multi: 'Multiple choice', ranked: 'Ranked choice' }[contest.type];
  return <main className="contest-pane" id="main-content">
    <header className="contest-mobile-header">
      <div className="mobile-topline"><a href="/" data-route>‹ All</a><span>{numberLabel(index)} / {String(ballot.contests.length).padStart(2, '0')}</span><span>● Saved</span></div>
      <Progress ballot={ballot} current={contest} />
    </header>
    <div className="contest-status"><span>{numberLabel(index)} of {String(ballot.contests.length).padStart(2, '0')} · {contest.section} · {typeLabel}</span><span>● Saved on this device</span></div>
    <div className="contest-content">
      <p className="eyebrow contest-kicker">{contest.section} · {typeLabel}{ballot.isMock ? ' · Sample contest' : ''}</p>
      <h1 id="contest-title" tabIndex={-1}>{contest.title}</h1>
      <p className="contest-summary">{contest.summary}</p>
      {contest.type === 'yesno' && <>
        <div className="measure-meanings"><div><h2>A yes vote means</h2><p>{contest.yes}</p></div><div><h2>A no vote means</h2><p>{contest.no}</p></div></div>
        {contest.threshold && <p className="threshold">{contest.threshold}</p>}
      </>}
      <div className="contest-resources">{(['arguments', 'sources'] as const).map((group) => <details key={group} className="resource-group"><summary>{group === 'arguments' ? 'Arguments & endorsements' : 'Sources'}<span aria-hidden="true">+</span></summary><SourceLinks links={contest.links.filter((link) => link.group === group)} />{contest.links.filter((link) => link.group === group).some((link) => !link.url) && <p className="source-note">Source links will be added with the official ballot.</p>}</details>)}</div>
      {contest.type !== 'yesno' && <section className="candidate-information"><h2>Candidates</h2><p className="source-note">Listed in sample ballot order.</p>{contest.candidates.map((candidate) => <div className="candidate-info" key={candidate.id}><h3>{candidate.name}</h3><p>{[candidate.party, candidate.occupation].filter(Boolean).join(' · ')}</p><SourceLinks links={candidate.links} /></div>)}</section>}
      <nav className="contest-navigation" aria-label="Contests"><a className="button previous-button" href={previous ? contestPath(previous) : '/'} data-route><span className="nav-caption">← Previous</span>{previous?.shortTitle ?? 'All contests'}</a><button className="button primary next-button" onClick={onNext}><span className="nav-caption">Next →</span>{next?.shortTitle ?? 'Back to worksheet'}</button></nav>
    </div>
    <nav className="mobile-contest-bar" aria-label="Mobile contest navigation"><a className="button" href={previous ? contestPath(previous) : '/'} data-route aria-label={previous ? `Previous: ${previous.shortTitle}` : 'All contests'}>← Previous</a><button className="button primary" onClick={onNext}>{next ? 'Next →' : 'Finish →'}</button></nav>
  </main>;
}
