import type { NextApiRequest, NextApiResponse } from 'next';
import { initSentry, Sentry } from './sentry';

type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
) => Promise<void> | void;

export function withSentryApiHandler(handler: ApiHandler): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    initSentry();
    try {
      await handler(req, res);
    } catch (error) {
      const eventId = Sentry.captureException(error, {
        tags: {
          route: req.url || 'unknown',
          method: req.method || 'unknown',
        },
        extra: {
          query: req.query,
          headers: {
            'user-agent': req.headers['user-agent'],
            'x-forwarded-for': req.headers['x-forwarded-for'],
          },
        },
      });
      console.error('[api] Unhandled error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          ok: false,
          error: 'Internal server error',
          eventId: process.env.SENTRY_DSN ? eventId : undefined,
        });
      }
    }
  };
}

