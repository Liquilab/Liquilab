import { NextResponse, NextRequest } from 'next/server';

import { allowOrigin } from '@/lib/ops/cors';
import { rateLimit } from '@/lib/ops/rateLimit';

/**
 * Placeholder gate policy:
 * - Disabled when NODE_ENV !== 'production' OR PLACEHOLDER_OFF === '1'
 * - Enabled in production unless PLACEHOLDER_OFF === '1'
 */
const ALLOW = [
  /^\/_next\//,
  /^\/favicon\.ico$/,
  /^\/placeholder$/,
  /^\/api\/placeholder\/login$/,
  /^\/api\/health$/,
  /^\/api\/health\/details$/,
  /^\/api\/entitlements$/,
  /^\/api\/user\/delete$/,
  /^\/robots\.txt$/,
  /^\/sitemap\.xml$/,
  /^\/admin\//,           // Allow all /admin/* routes
  /^\/api\/admin\//,      // Allow all /api/admin/* routes
];

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.coingecko.com https://*.stripe.com",
  "frame-src https://js.stripe.com https://checkout.stripe.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

function applySecurityHeaders(req: NextRequest, res: NextResponse): NextResponse {
  res.headers.set('Content-Security-Policy', CSP);
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (process.env.NODE_ENV === 'production') {
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  const isApiRoute = req.nextUrl.pathname.startsWith('/api/');
  if (isApiRoute) {
    allowOrigin(req, res);
  }

  return res;
}

function handlePlaceholderGate(req: NextRequest): NextResponse | null {
  const isProd = process.env.NODE_ENV === 'production';
  const off = process.env.PLACEHOLDER_OFF === '1';
  if (!isProd || off) return null;

  const pass = process.env.PLACEHOLDER_PASS;
  if (!pass) return null;

  const { pathname } = req.nextUrl;
  if (ALLOW.some((r) => r.test(pathname))) return null;

  const cookie = req.cookies.get('ll_pass')?.value;
  if (cookie && cookie === pass) return null;

  const url = req.nextUrl.clone();
  url.pathname = '/placeholder';
  url.search = '';
  return NextResponse.redirect(url);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApiRoute = pathname.startsWith('/api/');

  // CORS preflight: respond fast with headers.
  if (isApiRoute && req.method === 'OPTIONS') {
    const preflight = NextResponse.json({}, { status: 204 });
    return applySecurityHeaders(req, preflight);
  }

  const gated = handlePlaceholderGate(req);
  if (gated) {
    return applySecurityHeaders(req, gated);
  }

  if (isApiRoute) {
    const limited = rateLimit(req, { limitPerMinute: 60 });
    if (limited) {
      return applySecurityHeaders(req, limited);
    }
  }

  const response = NextResponse.next();
  return applySecurityHeaders(req, response);
}

export const config = { matcher: ['/((?!_next/static|_next/image).*)'] };
