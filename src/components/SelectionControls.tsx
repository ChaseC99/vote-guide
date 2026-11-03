import { useState, type CSSProperties } from 'react';
import type { Contest } from '../data/schema';
import {
  hasSkippedRank,
  selectionCount,
  selectionSummary,
  toggleChoice,
  toggleRank,
  type Selection,
} from '../lib/selections';

interface Props {
  contest: Contest;
  value?: Selection;
  onChange: (selection: Selection | undefined) => void;
  ready: boolean;
}
const ordinals = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

export function SelectionControls({ contest, value, onChange, ready }: Props) {
  const [message, setMessage] = useState('');
  const count = selectionCount(value);
  const countLabel =
    contest.type === 'multi'
      ? `${count} of ${contest.max} chosen`
      : contest.type === 'ranked'
        ? `${count} of ${contest.max} ranked`
        : count
          ? '1 chosen'
          : 'None chosen';
  function choose(choice: string) {
    const result = toggleChoice(contest, value, choice);
    if (result.limited && contest.type === 'multi') {
      setMessage(`You can choose up to ${contest.max}. Clear one choice before adding another.`);
      return;
    }
    onChange(result.selection);
    setMessage(selectionSummary(contest, result.selection));
  }
  function rank(candidate: string, position: number) {
    const next = toggleRank(contest, value, candidate, position);
    onChange(next);
    setMessage(`Ranking updated. ${selectionSummary(contest, next)}.`);
  }
  const candidates = contest.type === 'yesno' ? [] : contest.candidates;
  const options =
    contest.type === 'yesno'
      ? [
          { id: 'Yes', label: 'Yes', sub: contest.yesShort },
          { id: 'No', label: 'No', sub: contest.noShort },
        ]
      : candidates.map((candidate) => ({
          id: candidate.id,
          label: candidate.name,
          sub: [candidate.party, candidate.occupation].filter(Boolean).join(' · '),
        }));

  return (
    <fieldset className="selection-controls" disabled={!ready}>
      <legend>Your selection</legend>
      <div className="selection-rule">
        <span>{contest.rule}</span>
        <span aria-live="polite" aria-atomic="true">
          {countLabel}
        </span>
      </div>
      {contest.type === 'single' && contest.writeInOnly ? (
        <div className="write-in-option">
          <p className="selection-hint">
            This contest has no printed candidate names. Check your county’s official instructions
            for eligible write-in candidates.
          </p>
          <label htmlFor="write-in-name">Write-in name for your worksheet</label>
          <input
            id="write-in-name"
            type="text"
            autoComplete="off"
            maxLength={200}
            value={typeof value === 'string' ? value : ''}
            onChange={(event) =>
              onChange(event.target.value.trim() ? event.target.value : undefined)
            }
          />
        </div>
      ) : contest.type !== 'ranked' ? (
        <div className="choice-options">
          {options.map((option) => {
            const selected = Array.isArray(value) ? value.includes(option.id) : value === option.id;
            return (
              <button
                type="button"
                key={option.id}
                className={`choice-option ${selected ? 'selected' : ''}`}
                data-choice={contest.type === 'yesno' ? option.id : undefined}
                aria-pressed={selected}
                onClick={() => choose(option.id)}
              >
                <span
                  aria-hidden="true"
                  className={`choice-mark ${contest.type === 'multi' ? 'square' : ''}`}
                >
                  {selected ? '✓' : ''}
                </span>
                <span>
                  <span className="option-label">{option.label}</span>
                  <span className="option-description">{option.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div
          className={`ranked-options ${contest.max > 5 ? 'many-ranks' : ''}`}
          style={{ '--ranks': contest.max } as CSSProperties}
        >
          <div className="rank-header" aria-hidden="true">
            <span>Candidate</span>
            {ordinals.slice(0, contest.max).map((ordinal) => (
              <span key={ordinal}>{ordinal}</span>
            ))}
          </div>
          {candidates.map((candidate) => (
            <div className="rank-row" key={candidate.id}>
              <div className="rank-candidate">
                <span className="option-label">{candidate.name}</span>
                <span className="option-description">{candidate.occupation}</span>
              </div>
              <div className="rank-buttons" role="group" aria-label={`Rank ${candidate.name}`}>
                {ordinals.slice(0, contest.max).map((ordinal, index) => {
                  const selected =
                    value &&
                    typeof value === 'object' &&
                    !Array.isArray(value) &&
                    value[candidate.id] === index + 1;
                  return (
                    <button
                      type="button"
                      key={ordinal}
                      className={`rank-button ${selected ? 'selected' : ''}`}
                      aria-label={`${candidate.name}, ${ordinal} choice`}
                      aria-pressed={!!selected}
                      disabled={!ready}
                      onClick={() => rank(candidate.id, index + 1)}
                    >
                      <span className="rank-bubble" aria-hidden="true">
                        {selected ? '✓' : ''}
                      </span>
                      <span className="rank-ordinal" aria-hidden="true">
                        {ordinal}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <p className="rank-summary">{selectionSummary(contest, value)}</p>
          {hasSkippedRank(value) && (
            <p className="selection-hint">
              You’ve skipped a rank. That’s allowed; your other rankings are kept.
            </p>
          )}
        </div>
      )}
      <p
        className={message.startsWith('You can choose') ? 'selection-announcement' : 'sr-only'}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {message}
      </p>
      <button
        className="text-button clear-selection"
        onClick={() => {
          onChange(undefined);
          setMessage('Selection cleared.');
        }}
        type="button"
      >
        Clear selection
      </button>
    </fieldset>
  );
}
