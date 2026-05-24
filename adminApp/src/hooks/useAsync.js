import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs `fn` whenever `deps` change. Race-safe: only the most recent invocation
 * is allowed to update state, so out-of-order responses can't overwrite fresh data.
 */
export function useAsync(fn, deps = []) {
  const [data, setData]       = useState(null);
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(true);
  const reqIdRef              = useRef(0);

  const run = useCallback(async () => {
    const myReq = ++reqIdRef.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      if (myReq === reqIdRef.current) setData(result);
      return result;
    } catch (err) {
      if (myReq === reqIdRef.current) {
        setError(err?.response?.data?.error || err.message);
      }
      throw err;
    } finally {
      if (myReq === reqIdRef.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run().catch(() => {}); }, [run]);

  return { data, error, loading, reload: run, setData };
}
