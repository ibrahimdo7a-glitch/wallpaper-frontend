import { type Locale } from '@/lib/i18n';
import { SearchBar } from './SearchBar';

interface HeroBannerProps {
  locale: Locale;
}

export function HeroBanner({ locale }: HeroBannerProps) {
  const isAr = locale === 'ar';

  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 py-20 px-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center" />
      </div>
      <div className="relative container mx-auto max-w-3xl text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          {isAr ? 'أفضل خلفيات HD' : 'Best HD Wallpapers'}
        </h1>
        <p className="text-gray-300 text-lg md:text-xl mb-8">
          {isAr
            ? 'آلاف الخلفيات المجانية بجودة عالية لجوالك وكمبيوترك'
            : 'Thousands of free high quality wallpapers for your phone and computer'}
        </p>
        <SearchBar locale={locale} large />
      </div>
    </div>
  );
}
