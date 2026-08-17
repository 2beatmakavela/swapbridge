'use client';

import { useEffect } from 'react';
import { TranslationProvider } from '@/lib/translation-context';
import { initBrowserSentry } from '@/lib/client/sentry.js';

export default function Providers({ children }) {
  useEffect(() => {
    initBrowserSentry();
  }, []);

  return <TranslationProvider>{children}</TranslationProvider>;
}
