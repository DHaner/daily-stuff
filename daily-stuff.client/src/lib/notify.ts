import { useSyncExternalStore } from 'react';

let message: string | null = null;
const listeners = new Set<() => void>();

function emit(next: string | null) {
  message = next;
  listeners.forEach((listener) => listener());
}

/** Shows an error in the global snackbar. */
export const notifyError = (text: string) => emit(text);
export const dismissNotification = () => emit(null);

export function useNotification() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => message,
  );
}
