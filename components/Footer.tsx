import Link from 'next/link';
import { type Locale } from '@/types';
import { translations } from '@/data/translations';

interface FooterProps {
  locale: Locale;
}

export function Footer({ locale }: FooterProps) {
  const t = translations[locale];
  const isRTL = locale === 'ar';

  return (
    <footer className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 py-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className={`flex flex-col sm:flex-row items-center gap-3 justify-between ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          {/* Logo */}
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex gap-0.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white" style={{ opacity: 1 - i * 0.2 }} />
              ))}
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-xs">{t.siteName}</span>
          </div>

          {/* Copyright */}
          <p className="text-gray-400 dark:text-gray-500 text-xs">{t.footer.copyright}</p>

          {/* Links */}
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
