import { useState } from 'react';
import { useModalDialog } from '../lib/useModalDialog';

export function PrivacyDialog({
  onClose,
  onErase,
}: {
  onClose: () => void;
  onErase: () => boolean;
}) {
  const dialog = useModalDialog();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState('');
  return (
    <dialog
      ref={dialog}
      className="dialog"
      aria-labelledby="privacy-title"
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      <div className="dialog-content">
        <div className="dialog-title">
          <h2 id="privacy-title">
            {confirming ? 'Erase this worksheet?' : 'About saving & privacy'}
          </h2>
          <button className="button icon-button" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        {confirming ? (
          <>
            <p>
              This removes every selection and note for this ballot from this browser. This cannot
              be undone.
            </p>
            <p>Print or save a PDF first if you’d like to keep a copy.</p>
            <div className="dialog-actions">
              <button className="button" autoFocus onClick={() => setConfirming(false)}>
                Keep my worksheet
              </button>
              <button
                className="button primary"
                onClick={() => {
                  if (onErase()) onClose();
                  else
                    setError(
                      'This browser could not erase the saved worksheet. Try allowing browser storage, or clear this site’s data in your browser settings.',
                    );
                }}
              >
                Erase everything
              </button>
            </div>
            {error && <p role="alert">{error}</p>}
          </>
        ) : (
          <>
            <p>
              Your selections and notes stay on this device and in this browser only. Nothing is
              sent to a server, and there are no accounts.
            </p>
            <p>
              Clearing browser data erases your worksheet. In private mode, it may disappear when
              you close the private session.
            </p>
            <p>Print or save a PDF to keep a copy.</p>
            <p>
              Ballot types with the same contests share a worksheet. Other ballot worksheets are
              saved separately.
            </p>
            <div className="dialog-actions">
              <button className="text-button" onClick={() => setConfirming(true)}>
                Erase all selections and notes
              </button>
              <button className="button primary" autoFocus onClick={onClose}>
                Got it
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
