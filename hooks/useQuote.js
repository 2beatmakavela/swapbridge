'use client';

import { useEffect, useRef, useState } from 'react';

// Debounced quote hook now routes requests through the server-side quote API.
export function useQuote({ fromToken, toToken, sendAmount, walletAddress, routePriority, settings }) {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    requestId.current += 1;
    setRoutes([]);

    const canQuote = fromToken?.address && toToken?.address && parseFloat(sendAmount) > 0;
    if (!canQuote) {
      setLoading(false);
      return undefined;
    }

    const myRequestId = requestId.current;
    setLoading(true);

    timerRef.current = setTimeout(async () => {
      try {
        const response = await fetch('/api/quotes', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            fromToken,
            toToken,
            sendAmount,
            walletAddress,
            routePriority,
            settings,
          }),
        });
        if (!response.ok) {
          throw new Error(`Quote API returned ${response.status}`);
        }
        const data = await response.json();
        if (myRequestId !== requestId.current) return;
        setRoutes(data.routes || []);
      } catch (err) {
        console.error('[useQuote]', err?.message || err);
        if (myRequestId === requestId.current) {
          setRoutes([]);
        }
      } finally {
        if (myRequestId === requestId.current) {
          setLoading(false);
        }
      }
    }, 700);

    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fromToken?.address, fromToken?.chain, toToken?.address, toToken?.chain,
    sendAmount, walletAddress, routePriority, settings.bridgesEnabled, settings.exchangesEnabled,
  ]);

  return { routes, loading };
}
