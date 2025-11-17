import type { NextApiRequest, NextApiResponse } from 'next';
import { initSentry, Sentry } from '@/lib/observability/sentry';

type SentryTestResponse = {
  ok: boolean;
  sentry: boolean;
  sentryConfigured: boolean;
  env: string;
  eventId?: string;
};

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<SentryTestResponse>,
) {
  initSentry();
  const sentryConfigured = Boolean(process.env.SENTRY_DSN);
  const environment = process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development';

  if (sentryConfigured) {
    try {
      const eventId = Sentry.captureMessage('Sentry staging test event', {
        level: 'info',
        tags: { test: 'staging-smoke', environment },
      });
      return res.status(200).json({
        ok: true,
        sentry: true,
        sentryConfigured: true,
        env: environment,
        eventId,
      });
    } catch (error) {
      console.error('[sentry-test] Failed to capture event:', error);
      return res.status(200).json({
        ok: true,
        sentry: false,
        sentryConfigured: true,
        env: environment,
      });
    }
  }

  return res.status(200).json({
    ok: true,
    sentry: false,
    sentryConfigured: false,
    env: environment,
  });
}

