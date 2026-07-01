/**
 * Central SEO helpers: canonical site URL, the curated default keyword strategy
 * (Gulf + Jordan + Iraq + wider Arab market), and JSON-LD builders. Keywords can
 * be overridden per-locale from Site Settings; these are the strong defaults.
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://qev.app').replace(/\/$/, '');

/** Branded default share image (1200×630), generated at /api/og. */
export const OG_IMAGE = `${SITE_URL}/api/og`;

/**
 * Serialize JSON-LD for safe inline <script> injection. JSON.stringify does NOT
 * escape "<", so a value containing "</script>" (e.g. a member-controlled listing
 * title) would break out of the tag → stored XSS. Escaping "<" closes that hole.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Strong Arabic keywords for the Chinese/EV cars hub across the Arab market. */
export const DEFAULT_KEYWORDS_AR = [
  'سيارات كهربائية', 'سيارات صينية', 'سيارات هجينة', 'أسعار السيارات الكهربائية',
  'سوق السيارات الكهربائية', 'سيارات كهربائية للبيع', 'قطع غيار سيارات كهربائية',
  'أخبار السيارات الكهربائية', 'شاحن سيارة كهربائية', 'مدى السيارة الكهربائية',
  'مواصفات السيارات الكهربائية', 'أفضل سيارة كهربائية',
  'سيارات BYD', 'بي واي دي', 'زيكر', 'جيتور', 'تشيري', 'إم جي', 'نيو', 'شاومي',
  'سيارات كهربائية قطر', 'سيارات كهربائية السعودية', 'سيارات كهربائية الإمارات',
  'سيارات كهربائية الكويت', 'سيارات كهربائية البحرين', 'سيارات كهربائية عمان',
  'سيارات كهربائية الأردن', 'سيارات كهربائية العراق',
];

/** English mirror for the EN locale. */
export const DEFAULT_KEYWORDS_EN = [
  'electric cars', 'Chinese EV', 'hybrid cars', 'EV prices', 'electric cars for sale',
  'EV spare parts', 'EV news', 'EV charger', 'EV range', 'best electric car',
  'BYD', 'Zeekr', 'Jetour', 'Chery', 'MG', 'NIO', 'Xiaomi',
  'electric cars Qatar', 'electric cars Saudi Arabia', 'electric cars UAE',
  'electric cars Kuwait', 'electric cars Bahrain', 'electric cars Oman',
  'electric cars Jordan', 'electric cars Iraq',
];

/** Parse an admin-entered comma/newline list, falling back to the curated defaults. */
export function resolveKeywords(raw: string | undefined, locale: string): string[] {
  const parsed = (raw ?? '')
    .split(/[,\n]/)
    .map((k) => k.trim())
    .filter(Boolean);
  if (parsed.length > 0) return parsed;
  return locale === 'ar' ? DEFAULT_KEYWORDS_AR : DEFAULT_KEYWORDS_EN;
}

/** Organization + WebSite (with a sitelinks search box) JSON-LD for the whole site. */
export function siteJsonLd(siteName: string, locale: string, logoUrl?: string) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteName,
      url: SITE_URL,
      ...(logoUrl ? { logo: logoUrl } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: SITE_URL,
      inLanguage: locale === 'ar' ? 'ar' : 'en',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/${locale}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ];
}
