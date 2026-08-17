import { init } from '@sentry/nextjs';

init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.SENTRY_TRACES_SAMPLE_RATE ? parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) : 0.05,
  environment: process.env.NODE_ENV || 'development',
});
