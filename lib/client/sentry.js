let initialized = false;

export async function initBrowserSentry() {
  if (initialized || typeof window === 'undefined' || !process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  const { init } = await import('@sentry/react');

  init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE ? parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) : 0.05,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.VERCEL_GIT_COMMIT_SHA || undefined,
    debug: process.env.NODE_ENV !== 'production',
  });

  initialized = true;
}
