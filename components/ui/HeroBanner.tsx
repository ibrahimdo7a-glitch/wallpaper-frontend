import { type Locale } from '@/lib/i18n';
import { SearchBar } from './SearchBar';

interface HeroBannerProps {
  locale: Locale;
}

export function HeroBanner({ locale }: HeroBannerProps) {
  const isAr = locale === 'ar';

  return (
    <div className="relative overflow-hidden bg-gray-950 py-24 px-4">
      {/* Animated gradient blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-64 bg-indigo-500/10 rounded-full blur-3xl" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative container mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          {isAr ? 'آلاف الخلفيات المجانية' : 'Thousands of free wallpapers'}
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
          {isAr ? (
            <>
              اكتشف أجمل{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400">
                الخلفيات
              </span>
            </>
          ) : (
            <>
              Discover{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400">
                Amazing
              </span>{' '}
              Wallpapers
            </>
          )}
        </h1>

        <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
          {isAr
            ? 'خلفيات HD وUltra HD مجانية لجوالك وكمبيوترك. حمّل، شارك، واستمتع.'
            : 'Free HD & Ultra HD wallpapers for your phone and computer. Download, share, and enjoy.'}
        </p>

        <SearchBar locale={locale} large />

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mt-10 text-sm text-gray-500">
          {[
            { labelAr: 'خلفية', labelEn: 'Wallpapers', value: '10K+' },
            { labelAr: 'تحميل', labelEn: 'Downloads', value: '500K+' },
            { labelAr: 'قسم', labelEn: 'Categories', value: '50+' },
          ].map((stat) => (
            <div key={stat.value} className="text-center">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div>{isAr ? stat.labelAr : stat.labelEn}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
