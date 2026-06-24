import { NextResponse, type NextRequest } from 'next/server';
import { locales } from './lib/i18n';

const DEFAULT_LOCALE = 'ar';

/**
 * Minimal locale routing. The app renders translations from its own data layer
 * (not next-intl), so the only job here is the locale prefix. We deliberately
 * avoid next-intl's middleware: it set a NEXT_LOCALE cookie + `no-store` on every
 * response, which disabled Vercel ISR and made each page re-render (~1s TTFB).
 * A plain pass-through lets static/ISR pages be served straight from the edge.
 */
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );

  // Already localized → serve untouched (cacheable, no extra headers).
  if (hasLocale) {
    return NextResponse.next();
  }

  // Otherwise send to the default locale, keeping the rest of the path.
  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
