import type { Ballot } from '../data/schema';
import { numberLabel, sectionNames } from '../lib/navigation';
import { districtSummary } from '../lib/districts';
import { selectionLines, type WorksheetState } from '../lib/selections';

export function PrintWorksheet({
  ballot,
  state,
  includeNotes,
}: {
  ballot: Ballot;
  state: WorksheetState;
  includeNotes: boolean;
}) {
  return (
    <section className="print-only" aria-label="Printable ballot worksheet">
      <header className="print-header">
        <div>
          <p>
            My ballot worksheet · {ballot.locationShort} · {ballot.date}
          </p>
          <h1>Not an official ballot</h1>
        </div>
        {ballot.isMock && <span>Sample ballot · Fictional contests</span>}
      </header>
      {ballot.provenance && (
        <p className="print-districts">
          {ballot.ballotCode &&
            `Ballot type${ballot.ballotCode.includes(',') ? 's' : ''} ${ballot.ballotCode} · `}
          {districtSummary(ballot.provenance.districts)} · Sources checked{' '}
          {ballot.provenance.verifiedOn}
        </p>
      )}
      {sectionNames.map((section) => (
        <section key={section} className="print-section">
          <h2>{section}</h2>
          <table>
            <thead className="sr-only">
              <tr>
                <th>Number</th>
                <th>Contest</th>
                <th>Your selection</th>
              </tr>
            </thead>
            <tbody>
              {ballot.contests
                .filter((contest) => contest.section === section)
                .map((contest) => {
                  const lines = selectionLines(contest, state.selections[contest.id]);
                  const note = state.notes[contest.id];
                  return (
                    <tr key={contest.id}>
                      <td className="print-number">
                        {numberLabel(ballot.contests.indexOf(contest))}
                      </td>
                      <th scope="row">
                        {contest.shortTitle}
                        {includeNotes && note?.trim() && (
                          <div className="print-note">
                            <span>Notes: </span>
                            {note}
                          </div>
                        )}
                      </th>
                      <td className={lines.length ? 'print-selected' : 'print-unmarked'}>
                        {lines.length ? (
                          <ul>
                            {lines.map((line) => (
                              <li key={line}>{line}</li>
                            ))}
                          </ul>
                        ) : (
                          'No selection'
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </section>
      ))}
      <p className="print-footer">
        Personal worksheet · Selections are not submitted or counted as votes.
      </p>
    </section>
  );
}
