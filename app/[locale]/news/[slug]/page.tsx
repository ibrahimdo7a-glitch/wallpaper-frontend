import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchNewsArticle } from '@/lib/server-api';
import { type Locale } from '@/lib/i18n';
import NewsSubscribeForm from '@/components/news/NewsSubscribeForm';

type Props = { params: { locale: Locale; slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await fetchNewsArticle(params.slug);
  if (!article) return { title: 'Not Found' };
  const isAr = params.locale === 'ar';
  return {
    title: `${isAr ? article.title_ar : (article.title_en ?? article.title_ar)} | QEV`,
    description: isAr ? article.summary_ar ?? '' : article.summary_en ?? '',
    openGraph: {
      images: article.cover_image_url ? [article.cover_image_url] : [],
    },
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const isAr = params.locale === 'ar';
  const article = await fetchNewsArticle(params.slug);
  if (!article) notFound();

  const title = isAr ? article.title_ar : (article.title_en ?? article.title_ar);
  const content = isAr ? article.content_ar : (article.content_en ?? article.content_ar);

  return (
    <main className="min-h-screen bg-black text-white" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href={`/${params.locale}/news`} className="hover:text-white">{isAr ? 'الأخبار' : 'News'}</Link>
          {article.category && (
            <>
              <span>/</span>
              <Link href={`/${params.locale}/news?category=${article.category.slug}`} className="hover:text-white" style={{ color: article.category.color ?? undefined }}>
                {article.category.name_ar}
              </Link>
            </>
          )}
        </div>

        {/* Header */}
        <div className="mb-6">
          {article.is_breaking && (
            <span className="inline-block bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold mb-3">
              🔴 {isAr ? 'عاجل' : 'Breaking News'}
            </span>
          )}
          <h1 className="text-2xl md:text-3xl font-bold leading-snug mb-3">{title}</h1>
          {(isAr ? article.summary_ar : article.summary_en) && (
            <p className="text-gray-300 text-lg leading-relaxed">{isAr ? article.summary_ar : article.summary_en}</p>
          )}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
            {article.author_name && <span>✍️ {article.author_name}</span>}
            {article.published_at && <span>📅 {new Date(article.published_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
            <span>👁 {article.views_count} {isAr ? 'مشاهدة' : 'views'}</span>
          </div>
        </div>

        {/* Cover image */}
        {article.cover_image_url && (
          <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
            <Image src={article.cover_image_url} alt={title} fill className="object-cover" priority />
          </div>
        )}

        {/* Linked brands & models */}
        {(article.brands.length > 0 || article.car_models.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {article.brands.map(b => (
              <Link key={b.slug} href={`/${params.locale}/brands/${b.slug}`} className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-full text-sm transition-colors">
                🏭 {b.name_ar}
              </Link>
            ))}
            {article.car_models.map(m => (
              <span key={m.slug} className="bg-gray-800 px-3 py-1 rounded-full text-sm">
                🚗 {m.name_ar}
              </span>
            ))}
          </div>
        )}

        {/* Content */}
        {content && (
          <div
            className="prose prose-invert prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}

        {/* Source */}
        {article.source_url && (
          <div className="mt-8 p-4 bg-gray-900 border border-gray-800 rounded-xl text-sm text-gray-400">
            {isAr ? 'المصدر:' : 'Source:'}{' '}
            <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              {article.source_name ?? article.source_url}
            </a>
          </div>
        )}

        {/* Subscribe widget */}
        <div className="mt-12">
          <NewsSubscribeForm locale={params.locale} />
        </div>
      </div>
    </main>
  );
}
