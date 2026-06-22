import Image from 'next/image';
import Link from 'next/link';
import type { ApiHomepageSection } from '@/lib/server-api';

interface Props {
  section: ApiHomepageSection;
  isAr: boolean;
  locale: string;
}

export function NewsSection({ section, isAr, locale }: Props) {
  const items: any[] = section.data?.items ?? [];
  if (items.length === 0) return null;

  const title = isAr ? section.title_ar : (section.title_en ?? section.title_ar);

  return (
    <section className="py-10 px-4 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        {title && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <Link href={`/${locale}/news`} className="text-xs text-blue-600 hover:underline">
              {isAr ? 'كل الأخبار' : 'All news'}
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((article: any) => (
            <Link key={article.id} href={`/${locale}/news/${article.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all block">
              {article.cover_image_url && (
                <div className="relative h-40 overflow-hidden">
                  <Image src={article.cover_image_url} alt={article.title_ar} fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  {article.is_breaking && (
                    <span className="absolute top-2 start-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {isAr ? 'عاجل' : 'Breaking'}
                    </span>
                  )}
                </div>
              )}
              <div className="p-4">
                {article.category && (
                  <span className="text-xs font-medium mb-1 block" style={{ color: article.category.color ?? '#6b7280' }}>
                    {article.category.name_ar}
                  </span>
                )}
                <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                  {isAr ? article.title_ar : (article.title_en ?? article.title_ar)}
                </h3>
                {article.published_at && (
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(article.published_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
