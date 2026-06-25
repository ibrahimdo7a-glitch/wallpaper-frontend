import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { fetchNews, fetchNewsCategories, type ApiNewsArticle } from '@/lib/server-api';
import { type Locale } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'أخبار السيارات الكهربائية | QEV',
  description: 'آخر أخبار السيارات الكهربائية والصينية',
};

type Props = { params: { locale: Locale }; searchParams: { category?: string; page?: string } };

function timeAgo(date: string | null, isAr: boolean): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function NewsPage({ params, searchParams }: Props) {
  const isAr = params.locale === 'ar';
  const page = Math.max(1, Number(searchParams.page ?? 1));

  const [{ data: articles, meta }, mostLiked, categories] = await Promise.all([
    fetchNews({ category: searchParams.category, page, perPage: 10 }),
    fetchNews({ sort: 'likes', perPage: 10 }),
    fetchNewsCategories(),
  ]);

  const t = (a: ApiNewsArticle) => (isAr ? a.title_ar : a.title_en ?? a.title_ar);
  const breaking = articles.find(a => a.is_breaking);

  return (
    <main className="min-h-screen bg-[#0a0c11] text-neutral-100" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Breaking strip */}
      {breaking && (
        <Link href={`/${params.locale}/news/${breaking.slug}`}
          className="block bg-red-600/90 hover:bg-red-600 transition-colors">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1.5 font-bold flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> {isAr ? 'عاجل' : 'Breaking'}
            </span>
            <span className="truncate text-white/95">{t(breaking)}</span>
          </div>
        </Link>
      )}

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{isAr ? 'الأخبار' : 'News'}</h1>
          <p className="text-neutral-400 mt-2">{isAr ? 'آخر أخبار السيارات الكهربائية والصينية، أول بأول.' : 'Latest electric & Chinese car news.'}</p>
        </header>

        {/* Category tabs */}
        <nav className="flex gap-2 flex-wrap mb-8">
          <Link href={`/${params.locale}/news`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!searchParams.category ? 'bg-white text-black' : 'bg-white/5 text-neutral-300 hover:bg-white/10'}`}>
            {isAr ? 'الكل' : 'All'}
          </Link>
          {categories.map(cat => (
            <Link key={cat.id} href={`/${params.locale}/news?category=${cat.slug}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${searchParams.category === cat.slug ? 'bg-white text-black' : 'bg-white/5 text-neutral-300 hover:bg-white/10'}`}>
              {cat.icon && <span className="me-1">{cat.icon}</span>}
              {isAr ? cat.name_ar : cat.name_en ?? cat.name_ar}
            </Link>
          ))}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ─── Main feed ─── */}
          <div className="lg:col-span-8">
            {articles.length === 0 ? (
              <p className="text-neutral-500 text-center py-24 border border-dashed border-white/10 rounded-2xl">
                {isAr ? 'لا توجد أخبار بعد' : 'No news yet'}
              </p>
            ) : (
              <div className="space-y-5">
                {articles.map(a => (
                  <Link key={a.id} href={`/${params.locale}/news/${a.slug}`}
                    className="group flex flex-col sm:flex-row gap-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden transition-all">
                    <div className="relative sm:w-56 h-44 sm:h-auto flex-shrink-0 overflow-hidden bg-white/5">
                      {a.cover_image_url ? (
                        <Image src={a.cover_image_url} alt={t(a)} fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-white/10">📰</div>
                      )}
                    </div>
                    <div className="flex-1 p-4 sm:py-5 sm:pe-5 min-w-0 flex flex-col">
                      <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
                        {a.category && (
                          <span className="font-semibold" style={{ color: a.category.color ?? '#60a5fa' }}>
                            {a.category.name_ar}
                          </span>
                        )}
                        {a.category && <span className="text-neutral-600">•</span>}
                        <span>{timeAgo(a.published_at, isAr)}</span>
                      </div>
                      <h2 className="text-lg font-bold leading-snug line-clamp-2 group-hover:text-white transition-colors">
                        {t(a)}
                      </h2>
                      {(isAr ? a.summary_ar : a.summary_en) && (
                        <p className="text-sm text-neutral-400 leading-relaxed line-clamp-2 mt-2">
                          {isAr ? a.summary_ar : a.summary_en}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto pt-3 text-xs text-neutral-500">
                        <span className="text-blue-400 font-medium group-hover:gap-2 inline-flex items-center gap-1 transition-all">
                          {isAr ? 'اقرأ المزيد' : 'Read more'} <span>←</span>
                        </span>
                        <span className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1">♥ {a.likes_count}</span>
                          <span className="inline-flex items-center gap-1">👁 {a.views_count}</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta.last_page > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                  <Link key={p}
                    href={`/${params.locale}/news?${searchParams.category ? `category=${searchParams.category}&` : ''}page=${p}`}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-colors ${p === page ? 'bg-white text-black font-bold' : 'bg-white/5 text-neutral-300 hover:bg-white/10'}`}>
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ─── Sidebar: most engaged ─── */}
          <aside className="lg:col-span-4">
            <div className="sticky top-6 bg-white/[0.03] border border-white/5 rounded-2xl p-5">
              <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                <span>🔥</span> {isAr ? 'الأكثر تفاعلًا' : 'Most engaged'}
              </h2>
              {mostLiked.length === 0 ? (
                <p className="text-neutral-500 text-sm">{isAr ? 'لا يوجد بعد' : 'Nothing yet'}</p>
              ) : (
                <ol className="space-y-1">
                  {mostLiked.map((a, i) => (
                    <li key={a.id}>
                      <Link href={`/${params.locale}/news/${a.slug}`}
                        className="group flex gap-3 items-start py-2.5 border-b border-white/5 last:border-0">
                        <span className={`flex-shrink-0 w-6 text-center font-bold tabular-nums ${i < 3 ? 'text-blue-400' : 'text-neutral-600'}`}>
                          {i + 1}
                        </span>
                        <span className="text-sm text-neutral-300 leading-snug line-clamp-2 group-hover:text-white transition-colors">
                          {t(a)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
