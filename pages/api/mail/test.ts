import type { NextApiRequest, NextApiResponse } from 'next';

import { sendSimple } from '@/lib/mail/provider';

function resolveRecipient(req: NextApiRequest): string | null {
  if (typeof req.body?.to === 'string' && req.body.to.trim()) {
    return req.body.to.trim();
  }
  if (typeof req.query.to === 'string' && req.query.to.trim()) {
    return req.query.to.trim();
  }
  const fallback = process.env.MAILGUN_TEST_RECIPIENT?.trim();
  return fallback && fallback.length > 0 ? fallback : null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const to = resolveRecipient(req);
  if (!to) {
    return res.status(200).json({
      ok: false,
      degrade: true,
      reason: 'NO_TEST_RECIPIENT',
      ts: Date.now(),
    });
  }

  const result = await sendSimple({
    to,
    subject: 'LiquiLab Mail provider test',
    html: '<p>This is a test email from the LiquiLab Mailgun provider.</p>',
  });

  if (result.ok) {
    return res.status(200).json({
      ok: true,
      degrade: false,
      id: result.id ?? null,
      ts: Date.now(),
    });
  }

  return res.status(200).json({
    ok: false,
    degrade: true,
    reason: result.reason,
    ts: Date.now(),
  });
}
