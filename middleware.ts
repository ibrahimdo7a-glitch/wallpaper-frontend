import createMiddleware from 'next-intl/middleware';
import { locales } from './lib/i18n';

export default createMiddleware({
  locales,
  defaultLocale: 'ar',
  // Auto-detection sets a NEXT_LOCALE cookie on every request, which forces
  // `Cache-Control: no-store` and defeats ISR (every page re-renders, ~1s TTFB).
  // The site is Arabic-first; users switch language explicitly. Off = cacheable.
  localeDetection: false,
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
