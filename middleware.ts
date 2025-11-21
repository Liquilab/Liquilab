import { NextResponse, NextRequest } from 'next/server';

const isDev = process.env.NODE_ENV === 'development';
const csp = [
  "default-src 'self'",
  isDev ? "script-src 'self' 'unsafe-eval'" : "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob:",
  "connect-src 'self' https: wss:",
  "worker-src 'self' blob:",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const withSecurityHeaders = (response: NextResponse) => {
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  return response;
};

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
  /^\/robots\.txt$/,
  /^\/sitemap\.xml$/,
  /^\/admin\//,           // Allow all /admin/* routes
  /^\/api\/admin\//,      // Allow all /api/admin/* routes
];

export function middleware(req: NextRequest) {
  const isProd = process.env.NODE_ENV === 'production';
  const off = process.env.PLACEHOLDER_OFF === '1';
  if (!isProd || off) return withSecurityHeaders(NextResponse.next());

  const pass = process.env.PLACEHOLDER_PASS;
  if (!pass) return withSecurityHeaders(NextResponse.next());

  const { pathname } = req.nextUrl;
  if (ALLOW.some((r) => r.test(pathname))) return withSecurityHeaders(NextResponse.next());

  const cookie = req.cookies.get('ll_pass')?.value;
  if (cookie && cookie === pass) return withSecurityHeaders(NextResponse.next());

  const url = req.nextUrl.clone();
  url.pathname = '/placeholder';
  url.search = '';
  return withSecurityHeaders(NextResponse.redirect(url));
}

export const config = { matcher: ['/((?!_next/static|_next/image).*)'] };
