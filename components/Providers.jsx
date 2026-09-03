'use client';

import { useEffect } from 'react';
import { TranslationProvider } from '@/lib/translation-context';
import { RealtimeProvider } from '@/lib/realtime-context';
import { initBrowserSentry } from '@/lib/client/sentry.js';
import { ErrorBoundary } from './ErrorBoundary';

export default function Providers({ children }) {
  useEffect(() => {
    initBrowserSentry();
  }, []);

  return (
    <ErrorBoundary>
      <RealtimeProvider>
        <TranslationProvider>{children}</TranslationProvider>
      </RealtimeProvider>
    </ErrorBoundary>
  );
}
