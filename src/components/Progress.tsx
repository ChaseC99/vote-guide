import type { Ballot, Contest } from '../data/schema';
import { sectionNames } from '../lib/navigation';

export function Progress({ ballot, current }: { ballot: Ballot; current: Contest }) {
  return <div className="section-progress" role="img" aria-label={`${current.section}, contest ${ballot.contests.indexOf(current) + 1} of ${ballot.contests.length}`}>
    {sectionNames.map((section) => <div className="progress-group" key={section}>
      <span>{section === 'Federal' ? 'Fed' : section}</span>
      <div className="progress-ticks">{ballot.contests.filter((contest) => contest.section === section).map((contest) => <span key={contest.id} className={`progress-tick ${contest.id === current.id ? 'current' : ''}`} />)}</div>
    </div>)}
  </div>;
}
