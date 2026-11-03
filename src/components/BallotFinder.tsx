import { useEffect, useRef, useState } from 'react';
import {
  ballotPath,
  countyBallotsSchema,
  findByCode,
  matchingCode,
  matchingStyles,
  nextQuestion,
  sameContests,
  type BallotStyle,
  type CountyBallots,
  type MatchAnswer,
} from '../lib/ballotMatching';

export type CountyOption = {
  id: string;
  name: string;
  officialUrl: string;
  dataUrl?: string;
  coverage?: 'complete' | 'partial';
};
type LoadState =
  { status: 'idle' | 'loading' | 'error' } | { status: 'ready'; data: CountyBallots };

export default function BallotFinder({ counties }: { counties: CountyOption[] }) {
  const [countyId, setCountyId] = useState('');
  const [ready, setReady] = useState(false);
  const [load, setLoad] = useState<LoadState>({ status: 'idle' });
  const [attempt, setAttempt] = useState(0);
  const available = counties.filter(({ dataUrl }) => dataUrl);
  const county = counties.find(({ id }) => id === countyId);
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('county');
    if (requested && counties.some(({ id }) => id === requested)) setCountyId(requested);
    setReady(true);
  }, [counties]);
  useEffect(() => {
    const controller = new AbortController();
    setLoad({ status: county?.dataUrl ? 'loading' : 'idle' });
    if (county?.dataUrl) {
      fetch(county.dataUrl, { signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) throw new Error('County data unavailable');
          const data = countyBallotsSchema.parse(await response.json());
          if (data.countyId !== county.id || data.electionId !== '2026-11-03')
            throw new Error('Wrong election data');
          if (!controller.signal.aborted) setLoad({ status: 'ready', data });
        })
        .catch(() => {
          if (!controller.signal.aborted) setLoad({ status: 'error' });
        });
    }
    return () => controller.abort();
  }, [county, attempt]);
  return (
    <main className="ballot-finder" id="main-content">
      <header className="finder-header">
        <a className="finder-brand" href="/">
          Ballot worksheet <span aria-hidden="true">↗</span>
        </a>
        <p className="eyebrow">California · November 3, 2026</p>
      </header>
      <div className="finder-intro">
        <p className="eyebrow">Your ballot, your research</p>
        <h1 id="page-title">Find your ballot.</h1>
        <p>
          Have your official ballot or sample ballot handy. Choose your county, then enter its
          ballot code or match the contests you see.
        </p>
        <p className="finder-privacy">No address needed. Your choices stay in this browser.</p>
      </div>
      <section className="finder-county" aria-labelledby="county-heading">
        <h2 id="county-heading">
          <span className="step-number">01</span> Choose your county
        </h2>
        <label htmlFor="county">County where you’re registered to vote</label>
        <select
          id="county"
          disabled={!ready}
          value={countyId}
          onChange={(event) => {
            setLoad({ status: 'idle' });
            setCountyId(event.target.value);
            window.history.replaceState(
              {},
              '',
              event.target.value ? `/?county=${event.target.value}` : '/',
            );
          }}
        >
          <option value="">Select a California county</option>
          {counties.map((item) => (
            <option value={item.id} key={item.id}>
              {item.name}
              {item.dataUrl
                ? item.coverage === 'partial'
                  ? ' — limited ballot types'
                  : ' — ballots available'
                : ''}
            </option>
          ))}
        </select>
        <p className="finder-help">
          Ballot matching is available in {available.length} of {counties.length} counties:{' '}
          {available.map(({ name }) => name).join(', ')}. Check the coverage note for your county.
          Other counties link to their official election office.
        </p>
      </section>
      {county && !county.dataUrl && (
        <section className="finder-notice" aria-live="polite">
          <h2>{county.name} ballots aren’t loaded yet.</h2>
          <p>
            We don’t have verified ballot types for this county for November 3, 2026. Your county’s
            election office can help you find your official sample ballot.
          </p>
          <a className="button" href={county.officialUrl} target="_blank" rel="noopener noreferrer">
            Visit {county.name} elections ↗<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </section>
      )}
      {county?.dataUrl && load.status === 'loading' && (
        <p role="status" className="finder-notice">
          Loading {county.name} ballot types…
        </p>
      )}
      {county?.dataUrl && load.status === 'error' && (
        <section className="finder-notice" role="alert">
          <h2>We couldn’t load the ballot data.</h2>
          <p>Check your connection and try again. Your saved worksheet choices haven’t changed.</p>
          <button className="button" onClick={() => setAttempt((value) => value + 1)}>
            Try again
          </button>{' '}
          <a href={county.officialUrl} target="_blank" rel="noopener noreferrer">
            Official election office ↗
          </a>
        </section>
      )}
      {load.status === 'ready' && load.data.countyId === countyId && (
        <CountyFlow key={countyId} data={load.data} />
      )}
      <footer className="finder-footer">
        <p>A personal research worksheet. Not an official ballot.</p>
        <p>Selections and notes are saved only in this browser. No accounts or address lookup.</p>
        <a
          href="https://www.sos.ca.gov/elections/voting-resources/county-elections-offices"
          target="_blank"
          rel="noopener noreferrer"
        >
          California’s official county directory ↗
        </a>
      </footer>
    </main>
  );
}

function CountyFlow({ data }: { data: CountyBallots }) {
  const [mode, setMode] = useState<'choose' | 'code' | 'match'>('choose');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<{ contestId: string; present: boolean | null }[]>([]);
  const [result, setResult] = useState<BallotStyle[] | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const title = useRef<HTMLHeadingElement>(null);
  const answers = history.filter((answer): answer is MatchAnswer => answer.present !== null);
  const remaining = matchingStyles(data, answers);
  const question = nextQuestion(
    data,
    answers,
    history.filter(({ present }) => present === null).map(({ contestId }) => contestId),
  );
  const matched = mode === 'match' && !question && sameContests(remaining) ? remaining : null;
  const selected = result ?? matched;
  useEffect(() => {
    if (mode !== 'choose') title.current?.focus();
    setConfirmed(false);
  }, [mode, history, result]);
  function choose(next: typeof mode) {
    setMode(next);
    setError('');
    setHistory([]);
    setResult(null);
    setConfirmed(false);
  }
  return (
    <section className="finder-flow" aria-labelledby="identify-heading">
      <div className="finder-step-heading">
        <h2 id="identify-heading" tabIndex={-1} ref={title}>
          <span className="step-number">{selected ? '03' : '02'}</span>{' '}
          {selected ? 'Check your contests' : 'Identify your ballot'}
        </h2>
        {mode !== 'choose' && (
          <button className="text-button" onClick={() => choose('choose')}>
            Change method
          </button>
        )}
      </div>
      <p className="finder-help">{data.coverageNote}</p>
      {mode === 'choose' && (
        <div className="finder-methods">
          <button className="method-card" onClick={() => choose('code')}>
            <span className="eyebrow">Use a printed identifier</span>
            <strong>
              I have a ballot code <span aria-hidden="true">→</span>
            </strong>
            <span>Enter the ballot type from your official ballot materials.</span>
          </button>
          <button className="method-card" onClick={() => choose('match')}>
            <span className="eyebrow">Compare the contests</span>
            <strong>
              Match my sample ballot <span aria-hidden="true">→</span>
            </strong>
            <span>Answer a few questions about what appears on your ballot.</span>
          </button>
        </div>
      )}
      {mode === 'code' && !result && (
        <form
          className="finder-code"
          onSubmit={(event) => {
            event.preventDefault();
            const found = findByCode(data, code);
            if (found) {
              setResult([found]);
              setError('');
            } else
              setError(
                'That code doesn’t match a loaded ballot type for this county and election. Check the ballot-type label, or try matching the contests.',
              );
          }}
        >
          <label htmlFor="ballot-code">Ballot type / code</label>
          <p id="code-help" className="finder-help">
            {data.codeHelp}
          </p>
          <div className="finder-code-row">
            <input
              id="ballot-code"
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
                setError('');
              }}
              autoComplete="off"
              spellCheck={false}
              maxLength={80}
              aria-describedby={`code-help${error ? ' code-error' : ''}`}
              aria-invalid={!!error}
              required
            />
            <button className="button primary" type="submit">
              Find ballot →
            </button>
          </div>
          {error && (
            <p className="finder-error" id="code-error" role="alert">
              {error}
            </p>
          )}
          <button className="text-button" type="button" onClick={() => choose('match')}>
            I don’t know my code — match contests instead
          </button>
        </form>
      )}
      {mode === 'match' && !matched && (
        <div className="finder-question">
          {question ? (
            <>
              <p className="eyebrow">
                Question {history.length + 1} · Compare your official sample ballot
              </p>
              <h3>Does this contest appear on your ballot?</h3>
              <p className="question-contest">{question.title}</p>
              <p className="finder-help">
                Look for the office or measure heading. This asks what’s on your ballot, not how you
                plan to vote.
              </p>
              <div className="finder-actions">
                <button
                  className="button primary"
                  onClick={() =>
                    setHistory([...history, { contestId: question.id, present: true }])
                  }
                >
                  Yes, it appears
                </button>
                <button
                  className="button"
                  onClick={() =>
                    setHistory([...history, { contestId: question.id, present: false }])
                  }
                >
                  No, it doesn’t
                </button>
                <button
                  className="text-button"
                  onClick={() =>
                    setHistory([...history, { contestId: question.id, present: null }])
                  }
                >
                  I’m not sure
                </button>
              </div>
            </>
          ) : (
            <div role="status">
              <h3>
                {remaining.length ? 'We still need more information.' : 'No matching ballot found.'}
              </h3>
              <p>
                {remaining.length
                  ? 'The remaining ballots have different contests. Review your sample ballot and try the questions again, or enter its ballot code.'
                  : 'Your answers don’t match a loaded ballot. Review your answers or check your county’s official sample ballot.'}
              </p>
              <button className="button" onClick={() => choose('code')}>
                Enter a ballot code
              </button>
            </div>
          )}
        </div>
      )}
      {selected && (
        <div className="finder-confirmation">
          <p className="eyebrow">{data.countyName} · November 3, 2026</p>
          <h3>
            {selected.length === 1
              ? `Ballot type ${selected[0].code}`
              : 'These ballot types have the same contests'}
          </h3>
          {selected.length > 1 && (
            <p>
              Types {selected.map(({ code }) => code).join(', ')} contain the same contests. Your
              answers identify a matching worksheet, not a unique printed ballot code. Printed
              candidate order may differ.
            </p>
          )}
          <p>
            Compare all {selected[0].contestIds.length} contests with your official ballot,
            including local measures. If anything is missing or different, go back and check your
            answers.
          </p>
          <details className="confirmation-contests" open>
            <summary>{selected[0].contestIds.length} contests to check</summary>
            <ol>
              {selected[0].contestIds.map((id) => (
                <li key={id}>{data.contests.find((contest) => contest.id === id)!.title}</li>
              ))}
            </ol>
          </details>
          <label className="finder-check">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
            />
            <span>These contests match my official ballot.</span>
          </label>
          <button
            className="button primary"
            disabled={!confirmed}
            onClick={() => window.location.assign(ballotPath(data, matchingCode(selected)))}
          >
            Open my worksheet →
          </button>
          {mode === 'code' && (
            <button
              className="text-button"
              onClick={() => {
                setResult(null);
                setConfirmed(false);
              }}
            >
              Use a different code
            </button>
          )}
        </div>
      )}
      {mode === 'match' && (
        <div className="finder-back">
          {history.length > 0 && (
            <button className="text-button" onClick={() => setHistory(history.slice(0, -1))}>
              ← Previous question
            </button>
          )}
          {history.length > 0 && (
            <button className="text-button" onClick={() => setHistory([])}>
              Start over
            </button>
          )}
          <p className="finder-help" role="status">
            {remaining.length} ballot {remaining.length === 1 ? 'type' : 'types'} remaining
          </p>
        </div>
      )}
      <div className="finder-sources">
        <a href={data.lookupUrl} target="_blank" rel="noopener noreferrer">
          Find your official sample ballot ↗<span className="sr-only"> (opens in a new tab)</span>
        </a>
        <p>
          Source:{' '}
          <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer">
            county election data ↗
          </a>{' '}
          · Checked {data.verifiedOn}
        </p>
      </div>
    </section>
  );
}
