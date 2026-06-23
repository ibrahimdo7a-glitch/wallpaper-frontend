import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { fetchSearch, type ApiSearchResult } from '@/lib/server-api';
import { type Locale } from '@/lib/i18n';

type Props = { params: { locale: Locale }; searchParams: { q?: string } };

export async function generateMetadata({ params: { locale }, searchParams }: Props): Promise<Metadata> {
  const q = searchParams.q || '';
  const isAr = locale === 'ar';
  return { title: q ? `${isAr ? 'بحث' : 'Search'}: ${q} | QEV` : (isAr ? 'بحث' : 'Search') };
}

const typeLabel: Record<string, { ar: string; en: string; color: string }> = {
  brand: { ar: 'ماركة', en: 'Brand',  color: 'bg-blue-500'   },
  model: { ar: 'موديل', en: 'Model',  color: 'bg-green-500'  },
  app:   { ar: 'تطبيق', en: 'App',    color: 'bg-purple-500' },
  news:  { ar: 'خبر',   en: 'News',   color: 'bg-orange-500' },
};

function resultHref(r: ApiSearchResult, locale: string): string {
  switch (r.type) {
    case 'brand': return `/${locale}/brands/${r.slug}`;
    case 'model': return `/${locale}/brands/${r.brand_slug}/models/${r.slug}`;
    case 'app':   return `/${locale}/apps/${r.slug}`;
    case 'news':  return `/${locale}/news/${r.slug}`;
    default:      return '#';
  }
}

export default async function SearchPage({ params: { locale }, searchParams }: Props) {
  const isAr = locale === 'ar';
  const q = (searchParams.q || '').trim();
  const results = q ? await fetchSearch(q) : [];

  return (
    <main className="min-h-screen bg-black text-white" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Search box */}
        <form action={`/${locale}/search`} method="get" className="relative mb-8">
          <input
            name="q"
            defaultValue={q}
            type="text"
            placeholder={isAr ? 'ابحث عن ماركة أو موديل أو تطبيق أو خبر...' : 'Search brands, models, apps, news...'}
            className="w-full rounded-2xl border border-gray-700 bg-gray-900 text-white px-5 py-3.5 pe-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="absolute inset-y-0 end-4 flex items-center text-gray-400 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </button>
        </form>

        {q && (
          <p className="text-gray-400 text-sm mb-6">
            {results.length} {isAr ? `نتيجة لـ "${q}"` : `results for "${q}"`}
          </p>
        )}

        {q && results.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-5xl mb-3">🔍</p>
            <p>{isAr ? 'لا توجد نتائج' : 'No results found'}</p>
          </div>
        )}

        <div className="space-y-3">
          {results.map(r => {
            const label = typeLabel[r.type];
            return (
              <Link key={`${r.type}-${r.id}`} href={resultHref(r, locale)}
                className="flex items-center gap-4 bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl p-3 transition-all">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0 flex items-center justify-center">
                  {r.image
                    ? <Image src={r.image} alt={r.title} fill className="object-cover" />
                    : <span className="text-2xl">{r.type === 'brand' ? '🚗' : r.type === 'app' ? '📱' : r.type === 'news' ? '📰' : '🚙'}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{r.title}</h3>
                  {label && (
                    <span className={`inline-block mt-1 text-xs text-white px-2 py-0.5 rounded-full ${label.color}`}>
                      {isAr ? label.ar : label.en}
                    </span>
                  )}
                </div>
                <span className="text-gray-500">←</span>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
