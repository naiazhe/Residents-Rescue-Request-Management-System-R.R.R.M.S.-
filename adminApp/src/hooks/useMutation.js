import { useState } from 'react';

/**
 * Wraps an async function with busy/error state so callers can disable buttons
 * during in-flight requests and surface backend errors to the UI.
 */
export function useMutation(fn) {
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState(null);

  async function run(...args) {
    setBusy(true);
    setError(null);
    try {
      return await fn(...args);
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || 'Request failed';
      setError(msg);
      throw err;
    } finally {
      setBusy(false);
    }
  }

  return { run, busy, error, setError };
}
