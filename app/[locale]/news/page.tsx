import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { fetchNews, fetchNewsCategories } from '@/lib/server-api';
import { type Locale } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'أخبار السيارات | QEV',
  description: 'آخر أخبار السيارات الكهربائية والصينية',
};

type Props = { params: { locale: Locale }; searchParams: { category?: string; page?: string } };

export default async function NewsPage({ params, searchParams }: Props) {
  const isAr = params.locale === 'ar';
  const page = Number(searchParams.page ?? 1);

  const [{ data: articles, meta }, categories] = await Promise.all([
    fetchNews({ category: searchParams.category, page }),
    fetchNewsCategories(),
  ]);

  return (
    <main className="min-h-screen bg-black text-white" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">{isAr ? 'الأخبار' : 'News'}</h1>
        <p className="text-gray-400 mb-8">{isAr ? 'آخر أخبار السيارات الكهربائية والصينية' : 'Latest electric and Chinese car news'}</p>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          <Link
            href={`/${params.locale}/news`}
            className={`px-4 py-1.5 rounded-full text-sm transition-colors ${!searchParams.category ? 'bg-white text-black' : 'bg-gray-800 hover:bg-gray-700'}`}
          >
            {isAr ? 'الكل' : 'All'}
          </Link>
          {categories.map(cat => (
            <Link
              key={cat.id}
              href={`/${params.locale}/news?category=${cat.slug}`}
              className={`px-4 py-1.5 rounded-full text-sm transition-colors ${searchParams.category === cat.slug ? 'bg-white text-black' : 'bg-gray-800 hover:bg-gray-700'}`}
              style={searchParams.category === cat.slug && cat.color ? { backgroundColor: cat.color } : {}}
            >
              {cat.icon && <span className="mr-1">{cat.icon}</span>}
              {isAr ? cat.name_ar : (cat.name_en ?? cat.name_ar)}
            </Link>
          ))}
        </div>

        {/* Articles grid */}
        {articles.length === 0 ? (
          <p className="text-gray-500 text-center py-20">{isAr ? 'لا توجد مقالات' : 'No articles found'}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(article => (
                <Link
                  key={article.id}
                  href={`/${params.locale}/news/${article.slug}`}
                  className="group bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-2xl overflow-hidden transition-all"
                >
                  {article.cover_image_url && (
                    <div className="relative h-44 overflow-hidden">
                      <Image src={article.cover_image_url} alt={article.title_ar} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      {article.is_breaking && (
                        <span className="absolute top-2 start-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                          {isAr ? '🔴 عاجل' : '🔴 Breaking'}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    {article.category && (
                      <span className="text-xs font-medium mb-1 block" style={{ color: article.category.color ?? '#9ca3af' }}>
                        {isAr ? article.category.name_ar : article.category.name_ar}
                      </span>
                    )}
                    <h2 className="font-semibold line-clamp-2 mb-2">{isAr ? article.title_ar : (article.title_en ?? article.title_ar)}</h2>
                    {article.summary_ar && (
                      <p className="text-sm text-gray-400 line-clamp-2">{isAr ? article.summary_ar : (article.summary_en ?? article.summary_ar)}</p>
                    )}
                    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                      <span>{article.views_count} {isAr ? 'مشاهدة' : 'views'}</span>
                      {article.published_at && <span>{new Date(article.published_at).toLocaleDateString(isAr ? 'ar' : 'en')}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {meta.last_page > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                  <Link
                    key={p}
                    href={`/${params.locale}/news?${searchParams.category ? `category=${searchParams.category}&` : ''}page=${p}`}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm ${p === page ? 'bg-white text-black font-bold' : 'bg-gray-800 hover:bg-gray-700'}`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
