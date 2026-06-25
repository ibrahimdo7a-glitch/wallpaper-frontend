import Image from 'next/image';
import Link from 'next/link';
import type { ApiHomepageSection } from '@/lib/server-api';

interface Props {
  section: ApiHomepageSection;
  isAr: boolean;
  locale: string;
}

export function NewsSection({ section, isAr, locale }: Props) {
  const items: any[] = (section.data?.items ?? []).slice(0, 6);
  if (items.length === 0) return null;

  const title = isAr ? section.title_ar : (section.title_en ?? section.title_ar);

  return (
    <section className="py-12 px-4 bg-gray-50 dark:bg-[#0a0c11] border-t border-gray-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-7">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {title || (isAr ? 'آخر الأخبار' : 'Latest news')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
              {isAr ? 'أحدث ما يدور في عالم السيارات الكهربائية' : 'Fresh from the EV world'}
            </p>
          </div>
          <Link href={`/${locale}/news`}
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:gap-2.5 transition-all">
            {isAr ? 'كل الأخبار' : 'All news'} <span>←</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((article: any) => (
            <Link key={article.id} href={`/${locale}/news/${article.slug}`}
              className="group bg-white dark:bg-white/[0.03] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/10 hover:shadow-md dark:hover:bg-white/[0.06] transition-all block">
              <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-white/5">
                {article.cover_image_url ? (
                  <Image src={article.cover_image_url} alt={article.title_ar} fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300 dark:text-white/10">📰</div>
                )}
                {article.is_breaking && (
                  <span className="absolute top-2 start-2 inline-flex items-center gap-1 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> {isAr ? 'عاجل' : 'Breaking'}
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs mb-1.5">
                  {article.category && (
                    <span className="font-semibold" style={{ color: article.category.color ?? '#60a5fa' }}>
                      {article.category.name_ar}
                    </span>
                  )}
                  {article.published_at && (
                    <span className="text-gray-400 dark:text-neutral-500">
                      {new Date(article.published_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                  {isAr ? article.title_ar : (article.title_en ?? article.title_ar)}
                </h3>
                {(isAr ? article.summary_ar : article.summary_en) && (
                  <p className="text-sm text-gray-500 dark:text-neutral-400 line-clamp-2 mt-1.5 leading-relaxed">
                    {isAr ? article.summary_ar : article.summary_en}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
