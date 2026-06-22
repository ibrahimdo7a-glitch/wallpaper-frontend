import Image from 'next/image';
import Link from 'next/link';
import type { ApiHeroData, ApiBrand } from '@/lib/server-api';

interface Props {
  data: ApiHeroData;
  brands: ApiBrand[];
  isAr: boolean;
  locale: string;
  searchPlaceholder?: string;
}

export function HeroSection({ data, brands, isAr, locale, searchPlaceholder }: Props) {
  const bgColor   = data.bg_color   ?? '#ffffff';
  const textColor = data.text_color ?? '#111827';
  const topBrands = brands.slice(0, 6);

  return (
    <section style={{ backgroundColor: bgColor, color: textColor }} className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Text side */}
          <div className={isAr ? 'order-2 md:order-2 text-right' : 'order-2 md:order-1'}>
            {data.subtitle_ar && (
              <p className="text-sm font-medium mb-3 opacity-70">
                {isAr ? data.subtitle_ar : (data.subtitle_en ?? data.subtitle_ar)}
              </p>
            )}
            <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
              {isAr ? data.title_ar : (data.title_en ?? data.title_ar)}
            </h1>
            {data.description_ar && (
              <p className="text-sm md:text-base opacity-60 mb-6 leading-relaxed">
                {isAr ? data.description_ar : (data.description_en ?? data.description_ar)}
              </p>
            )}

            {/* Search bar */}
            <form action={`/${locale}/search`} method="get" className="relative mb-6">
              <input
                name="q"
                type="text"
                placeholder={searchPlaceholder ?? (isAr ? 'ابحث...' : 'Search...')}
                className="w-full rounded-2xl border border-gray-200 bg-white text-gray-900 px-5 py-3 pr-12 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                dir={isAr ? 'rtl' : 'ltr'}
              />
              <button type="submit" className="absolute inset-y-0 end-3 flex items-center text-gray-400 hover:text-blue-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </form>

            {/* Popular brand tags */}
            {topBrands.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs opacity-50">{isAr ? 'الأكثر بحثاً:' : 'Popular:'}</span>
                {topBrands.map(b => (
                  <Link key={b.id} href={`/${locale}/brands/${b.slug}`}
                    className="text-xs px-3 py-1 rounded-full border border-gray-200 hover:bg-gray-100 transition-colors opacity-80 hover:opacity-100"
                    style={{ color: textColor }}>
                    {isAr ? b.name_ar : (b.name_en ?? b.name_ar)}
                  </Link>
                ))}
              </div>
            )}

            {/* CTAs */}
            {(data.primary_btn_url || data.secondary_btn_url) && (
              <div className="flex gap-3 mt-6 flex-wrap">
                {data.primary_btn_url && (
                  <Link href={data.primary_btn_url}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                    {isAr ? (data.primary_btn_label_ar ?? '') : (data.primary_btn_label_en ?? data.primary_btn_label_ar ?? '')}
                  </Link>
                )}
                {data.secondary_btn_url && (
                  <Link href={data.secondary_btn_url}
                    className="border border-current px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-black/5 transition-colors"
                    style={{ color: textColor }}>
                    {isAr ? (data.secondary_btn_label_ar ?? '') : (data.secondary_btn_label_en ?? data.secondary_btn_label_ar ?? '')}
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Image side */}
          {data.image_url && (
            <div className={isAr ? 'order-1 md:order-1' : 'order-1 md:order-2'}>
              <div className="relative h-64 md:h-96">
                <Image
                  src={data.image_url}
                  alt={data.title_ar}
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
