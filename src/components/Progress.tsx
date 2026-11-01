import type { Ballot, Contest } from '../data/schema';
import { sectionNames } from '../lib/navigation';
import { selectionCount, type Selections } from '../lib/selections';

export function Progress({ ballot, current, selections }: { ballot: Ballot; current: Contest; selections: Selections }) {
  const marked = ballot.contests.filter(({ id }) => selectionCount(selections[id])).length;
  return <div className="section-progress" role="img" aria-label={`${current.section}, contest ${ballot.contests.indexOf(current) + 1} of ${ballot.contests.length}. ${marked} marked.`}>
    {sectionNames.map((section) => <div className="progress-group" key={section}>
      <span>{section === 'Federal' ? 'Fed' : section}</span>
      <div className="progress-ticks">{ballot.contests.filter((contest) => contest.section === section).map((contest) => <span key={contest.id} className={`progress-tick ${contest.id === current.id ? 'current' : ''} ${selectionCount(selections[contest.id]) ? 'marked' : ''}`} />)}</div>
    </div>)}
  </div>;
}
