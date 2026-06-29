import Link from 'next/link';
import { type Locale } from '@/types';
import { translations } from '@/data/translations';
import { fetchSiteContent } from '@/lib/server-api';
import { ContactWidget } from '@/components/ContactWidget';
import { COUNTRIES } from '@/lib/countries';

interface FooterProps {
  locale: Locale;
}

export async function Footer({ locale }: FooterProps) {
  const t = translations[locale];
  const isRTL = locale === 'ar';
  const siteContent = await fetchSiteContent();

  const siteName = isRTL
    ? (siteContent?.site_name_ar || t.siteName)
    : (siteContent?.site_name_en || t.siteName);
  const copyright = isRTL
    ? (siteContent?.footer_copyright_ar || t.footer.copyright)
    : (siteContent?.footer_copyright_en || t.footer.copyright);

  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Geo links — internal links to the country landing pages (SEO + discovery) */}
        <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
          <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold mb-2">
            {isRTL ? 'السيارات الكهربائية حسب الدولة' : 'Electric cars by country'}
          </p>
          <div className={`flex flex-wrap gap-x-4 gap-y-1.5 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            {COUNTRIES.map((c) => (
              <Link key={c.slug} href={`/${locale}/electric-cars/${c.slug}`}
                className="text-gray-500 dark:text-gray-400 text-xs hover:text-gray-900 dark:hover:text-white transition-colors">
                {isRTL ? `سيارات كهربائية ${c.name_ar}` : `EV ${c.name_en}`}
              </Link>
            ))}
          </div>
        </div>

        <div className={`flex flex-col sm:flex-row items-center gap-3 justify-between ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          {/* Logo */}
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex gap-0.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white" style={{ opacity: 1 - i * 0.2 }} />
              ))}
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-xs">{siteName}</span>
          </div>

          {/* Copyright */}
          <p className="text-gray-400 dark:text-gray-500 text-xs">{copyright}</p>

          {/* Links */}
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {siteContent?.contact_enabled !== false && <ContactWidget isAr={isRTL} />}
            <Link href={`/${locale}/about`} className="text-gray-500 dark:text-gray-400 text-xs hover:text-gray-900 dark:hover:text-white transition-colors">
              {isRTL ? 'من نحن' : 'About'}
            </Link>
            <Link href={`/${locale}/privacy`} className="text-gray-500 dark:text-gray-400 text-xs hover:text-gray-900 dark:hover:text-white transition-colors">
              {t.footer.privacy}
            </Link>
            <Link href={`/${locale}/terms`} className="text-gray-500 dark:text-gray-400 text-xs hover:text-gray-900 dark:hover:text-white transition-colors">
              {t.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
