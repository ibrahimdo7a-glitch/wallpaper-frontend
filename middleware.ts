import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { locales } from './lib/i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'ar',
  localeDetection: false,
});

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  // next-intl sets a NEXT_LOCALE cookie on every request, which makes the
  // response `Cache-Control: no-store` and disables Vercel ISR — so every page
  // re-renders on each visit (~1s TTFB). The locale already lives in the URL
  // prefix (/ar, /en), so the cookie isn't needed for routing. Drop both on
  // non-redirect responses so static/ISR pages can be served from the edge.
  const isRedirect = response.headers.has('location');
  if (!isRedirect && (response.headers.get('cache-control') ?? '').includes('no-store')) {
    response.headers.delete('cache-control');
    response.headers.delete('set-cookie');
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
