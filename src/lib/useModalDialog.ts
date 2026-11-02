import { useLayoutEffect, useRef } from 'react';

export function useModalDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);
  return ref;
}
