import Link from 'next/link';
import { type Wallpaper, type Locale } from '@/types';
import { WallpaperCard } from './WallpaperCard';
import { translations } from '@/data/translations';

interface MostDownloadedProps {
  wallpapers: Wallpaper[];
  locale: Locale;
}

export function MostDownloaded({ wallpapers, locale }: MostDownloadedProps) {
  const t = translations[locale];
  const isRTL = locale === 'ar';

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className={`flex items-center justify-between mb-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className="text-base">📥</span>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {t.mostDownloaded.title}
            </h2>
          </div>
          <Link
            href={`/${locale}/most-downloaded`}
            className={`flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            {t.mostDownloaded.viewAll}
            <span>{isRTL ? '←' : '→'}</span>
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {wallpapers.slice(0, 5).map((w) => (
            <WallpaperCard key={w.id} wallpaper={w} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
