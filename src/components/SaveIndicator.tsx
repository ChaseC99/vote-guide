import type { SaveStatus } from '../lib/useWorksheet';

export function SaveIndicator({
  status,
  compact = false,
  onClick,
}: {
  status: SaveStatus;
  compact?: boolean;
  onClick: () => void;
}) {
  const text =
    status === 'loading'
      ? 'Loading…'
      : status === 'saved'
        ? compact
          ? 'Saved'
          : 'Saved on this device'
        : 'Not saved';
  return (
    <button
      className="save-indicator"
      onClick={onClick}
      aria-label={`${text}. About browser-only storage`}
    >
      <span className={`status-dot ${status !== 'saved' ? 'not-saved' : ''}`} aria-hidden="true" />
      {text}
    </button>
  );
}
