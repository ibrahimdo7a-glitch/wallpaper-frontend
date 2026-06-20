import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { wallpaperApi } from '@/lib/api';
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import { SearchBar } from '@/components/ui/SearchBar';
import { type Locale } from '@/lib/i18n';

type Props = { params: { locale: Locale }; searchParams: { q?: string; page?: string } };

export async function generateMetadata({ params: { locale }, searchParams }: Props): Promise<Metadata> {
  const q = searchParams.q || '';
  return {
    title: q
      ? `${locale === 'ar' ? 'نتائج البحث عن' : 'Search results for'}: "${q}" - Wallpaper Platform`
      : `${locale === 'ar' ? 'بحث' : 'Search'} - Wallpaper Platform`,
  };
}

export default async function SearchPage({ params: { locale }, searchParams }: Props) {
  const t = await getTranslations({ locale, namespace: 'page' });
  const q = searchParams.q || '';
  const page = parseInt(searchParams.page || '1');

  let results = null;
  if (q && q.length >= 2) {
    try {
      const res = await wallpaperApi.search(q, page);
      results = res.data;
    } catch {
      results = null;
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <SearchBar locale={locale} initialQuery={q} />
      </div>

      {q && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            {t('search_results')}: <span className="text-blue-400">"{q}"</span>
          </h1>
          {results && (
            <p className="text-gray-400 mt-1">
              {locale === 'ar' ? `${results.meta.total} نتيجة` : `${results.meta.total} results`}
            </p>
          )}
        </div>
      )}

      {results ? (
        results.data.length > 0 ? (
          <WallpaperGrid
            wallpapers={results.data}
            locale={locale}
            pagination={results.meta}
            searchQuery={q}
          />
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-400 text-lg">
              {locale === 'ar' ? 'لا توجد نتائج' : 'No results found'}
            </p>
          </div>
        )
      ) : (
        !q && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🖼️</div>
            <p className="text-gray-400 text-lg">
              {locale === 'ar' ? 'ابحث عن خلفياتك المفضلة' : 'Search for your favorite wallpapers'}
            </p>
          </div>
        )
      )}
    </div>
  );
}
