import * as Sentry from '@sentry/node';

let initialized = false;

export function initSentry() {
  if (initialized) return;
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    initialized = false;
    return;
  }
  const environment = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';
  Sentry.init({
    dsn,
    environment: environment === 'production' ? 'production' : environment === 'staging' ? 'staging' : 'development',
    tracesSampleRate: 0,
    beforeSend(event) {
      if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DSN) {
        return null;
      }
      return event;
    },
  });
  initialized = true;
}

export function captureSentryMessage(message: string) {
  initSentry();
  if (!process.env.SENTRY_DSN) return;
  try {
    Sentry.captureMessage(message);
  } catch {
    // swallow sentry errors
  }
}

export { Sentry };
