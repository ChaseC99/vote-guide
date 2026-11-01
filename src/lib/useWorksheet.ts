import { useCallback, useEffect, useRef, useState } from 'react';
import type { Ballot } from '../data/schema';
import { emptyState, restoreState, type Selection, type WorksheetState } from './selections';

export type SaveStatus = 'loading' | 'saved' | 'unavailable' | 'invalid';

export function useWorksheet(ballot: Ballot) {
  const key = `voter-guide:${ballot.id}`;
  const [state, setState] = useState(() => emptyState(ballot.id));
  const latest = useRef(state);
  const [status, setStatus] = useState<SaveStatus>('loading');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      try {
        latest.current = restoreState(raw, ballot.id, ballot.contests);
        setState(latest.current);
        setStatus('saved');
      } catch { setStatus('invalid'); }
    } catch { setStatus('unavailable'); }
    setReady(true);
    function onStorage(event: StorageEvent) {
      if (event.key !== key && event.key !== null) return;
      try {
        latest.current = restoreState(event.newValue, ballot.id, ballot.contests);
        setState(latest.current);
        setStatus('saved');
      } catch { setStatus('invalid'); }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key, ballot]);

  const write = useCallback((next: WorksheetState) => {
    latest.current = next;
    setState(next);
    try { window.localStorage.setItem(key, JSON.stringify(next)); setStatus('saved'); }
    catch { setStatus('unavailable'); }
  }, [key]);

  function setSelection(id: string, selection: Selection | undefined) {
    const selections = { ...latest.current.selections };
    if (selection === undefined) delete selections[id];
    else selections[id] = selection;
    write({ ...latest.current, selections });
  }

  function setNote(id: string, note: string) { write({ ...latest.current, notes: { ...latest.current.notes, [id]: note } }); }

  function erase() {
    try {
      window.localStorage.removeItem(key);
      latest.current = emptyState(ballot.id);
      setState(latest.current);
      setStatus('saved');
      return true;
    } catch { setStatus('unavailable'); return false; }
  }

  return { state, status, ready, setSelection, setNote, erase };
}
