import type { Ballot } from '../data/schema';
import { numberLabel, sectionNames } from '../lib/navigation';
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
    <section className="print-only" aria-label="Printable Vote Guide">
      <header className="print-header">
        <div>
          <h1>My Vote Guide · {ballot.locationShort}</h1>
          {ballot.provenance && (
            <p className="print-districts">
              Congressional {ballot.provenance.districts.congressional} · Assembly{' '}
              {ballot.provenance.districts.assembly} · Supervisor{' '}
              {ballot.provenance.districts.supervisorial} · BART {ballot.provenance.districts.bart}
            </p>
          )}
          {ballot.isMock && <p className="print-sample">Sample ballot · Fictional contests</p>}
        </div>
        <p className="print-deadline">Vote by {ballot.date}</p>
      </header>
      {sectionNames.map((section) => (
        <section key={section} className="print-section">
          <h2>{section}</h2>
          <table>
            <colgroup>
              <col className="print-number-column" />
              <col className="print-contest-column" />
              <col />
            </colgroup>
            <thead className="sr-only">
              <tr>
                <th>Number</th>
                <th>Contest</th>
                <th>Your selection</th>
              </tr>
            </thead>
            {ballot.contests
              .filter((contest) => contest.section === section)
              .map((contest) => {
                const lines = selectionLines(contest, state.selections[contest.id]);
                const note = state.notes[contest.id];
                const hasNote = includeNotes && Boolean(note?.trim());
                const noteParagraphs = hasNote ? note.trim().split(/\r?\n\s*\r?\n/) : [];
                return (
                  <tbody key={contest.id}>
                    <tr className={hasNote ? 'print-has-note' : undefined}>
                      <td className="print-number">
                        {numberLabel(ballot.contests.indexOf(contest))}
                      </td>
                      <th scope="row">{contest.shortTitle}</th>
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
                    {hasNote && (
                      <tr className="print-note-row">
                        <td aria-hidden="true" />
                        <td colSpan={2}>
                          <div className="print-note">
                            {noteParagraphs.map((paragraph, index) => (
                              <p key={index}>
                                {index === 0 && <span className="print-note-label">Notes: </span>}
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                );
              })}
          </table>
        </section>
      ))}
      <p className="print-footer">
        Personal worksheet · Selections are not submitted or counted as votes.
      </p>
    </section>
  );
}
