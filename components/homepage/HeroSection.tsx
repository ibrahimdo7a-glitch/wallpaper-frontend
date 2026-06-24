import Image from 'next/image';
import Link from 'next/link';
import type { ApiHeroData, ApiBrand } from '@/lib/server-api';

interface Props {
  data: ApiHeroData;
  brands: ApiBrand[];
  isAr: boolean;
  locale: string;
  searchPlaceholder?: string;
  searchEnabled?: boolean | string;
}

export function HeroSection({ data, brands, isAr, locale, searchPlaceholder, searchEnabled = true }: Props) {
  const topBrands = brands.slice(0, 6);
  const showSearch = !(searchEnabled === false || searchEnabled === 'false' || searchEnabled === '0' || searchEnabled === '');
  const hasSide = showSearch || !!data.image_url;

  return (
    <section className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
        {/* DOM order = [text, side]. In RTL the first item sits on the right, the
            second on the left — so text stays on the right and search on the left. */}
        <div className={`grid gap-8 items-center ${hasSide ? 'md:grid-cols-2' : 'md:grid-cols-1'}`}>

          {/* ── Text (right in RTL) ── */}
          <div className={isAr ? 'text-right' : 'text-left'}>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
              {isAr ? data.title_ar : (data.title_en ?? data.title_ar)}
            </h1>
            {data.subtitle_ar && (
              <h2 className="text-xl md:text-2xl font-bold mb-3" style={{ color: '#2563eb' }}>
                {isAr ? data.subtitle_ar : (data.subtitle_en ?? data.subtitle_ar)}
              </h2>
            )}
            {data.description_ar && (
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {isAr ? data.description_ar : (data.description_en ?? data.description_ar)}
              </p>
            )}
          </div>

          {/* ── Side: search + popular tags + image (left in RTL) ── */}
          {hasSide && (
            <div className="space-y-5">
              {showSearch && (
                <div>
                  <form action={`/${locale}/search`} method="get" className="relative mb-3">
                    <input
                      name="q"
                      type="text"
                      placeholder={searchPlaceholder ?? (isAr ? 'ابحث...' : 'Search...')}
                      className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-100 px-4 py-3.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
                      dir={isAr ? 'rtl' : 'ltr'}
                    />
                    <button type="submit" className="absolute inset-y-0 end-3 flex items-center text-gray-400 hover:text-blue-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </form>

                  {topBrands.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400 whitespace-nowrap">{isAr ? 'الأكثر بحثاً:' : 'Popular:'}</span>
                      {topBrands.map(b => (
                        <Link key={b.id} href={`/${locale}/brands/${b.slug}`}
                          className="text-xs px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          {isAr ? b.name_ar : (b.name_en ?? b.name_ar)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {data.image_url && (
                <div className="relative h-48 md:h-72">
                  <Image src={data.image_url} alt={data.title_ar} fill className="object-contain" priority />
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
