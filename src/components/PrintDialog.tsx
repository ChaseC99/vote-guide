import { useState } from 'react';
import { useModalDialog } from '../lib/useModalDialog';

export function PrintDialog({
  onClose,
  onPrint,
}: {
  onClose: () => void;
  onPrint: (includeNotes: boolean) => void;
}) {
  const dialog = useModalDialog();
  const [includeNotes, setIncludeNotes] = useState(false);
  return (
    <dialog
      ref={dialog}
      className="dialog"
      aria-labelledby="print-title"
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      <div className="dialog-content">
        <div className="dialog-title">
          <h2 id="print-title">Print your worksheet</h2>
          <button className="button icon-button" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <p>
          A compact list of your selections, in worksheet order. In the print dialog, choose your
          printer or “Save as PDF.”
        </p>
        <fieldset className="print-options">
          <legend>What to include</legend>
          <label>
            <input
              type="radio"
              name="print-content"
              checked={!includeNotes}
              onChange={() => setIncludeNotes(false)}
              autoFocus
            />
            <span>Selections only</span>
          </label>
          <label>
            <input
              type="radio"
              name="print-content"
              checked={includeNotes}
              onChange={() => setIncludeNotes(true)}
            />
            <span>Selections + my notes</span>
          </label>
        </fieldset>
        {includeNotes && (
          <p className="source-note">
            Long notes may take more than one page. All of your notes will be included.
          </p>
        )}
        <div className="dialog-actions">
          <button className="button" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" onClick={() => onPrint(includeNotes)}>
            Print / Save PDF
          </button>
        </div>
      </div>
    </dialog>
  );
}
