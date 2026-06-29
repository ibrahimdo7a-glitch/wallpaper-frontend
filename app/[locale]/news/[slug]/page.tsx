import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchNewsArticle, fetchNews } from '@/lib/server-api';
import { type Locale } from '@/lib/i18n';
import NewsSubscribeForm from '@/components/news/NewsSubscribeForm';
import NewsArticleActions from '@/components/news/NewsArticleActions';

type Props = { params: { locale: Locale; slug: string } };

export const revalidate = 60;
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await fetchNewsArticle(params.slug);
  if (!article) return { title: 'Not Found' };
  const isAr = params.locale === 'ar';
  const title = isAr ? article.title_ar : (article.title_en ?? article.title_ar);
  const description = isAr ? article.summary_ar ?? '' : article.summary_en ?? '';
  return {
    title: `${title} | QEV`,
    description,
    alternates: {
      canonical: `/${params.locale}/news/${params.slug}`,
      languages: { ar: `/ar/news/${params.slug}`, en: `/en/news/${params.slug}` },
    },
    openGraph: {
      type: 'article',
      title,
      description,
      ...(article.published_at ? { publishedTime: article.published_at } : {}),
      images: article.cover_image_url ? [article.cover_image_url] : [],
    },
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const isAr = params.locale === 'ar';
  const article = await fetchNewsArticle(params.slug);
  if (!article) notFound();

  const title = isAr ? article.title_ar : (article.title_en ?? article.title_ar);
  const summary = isAr ? article.summary_ar : article.summary_en;
  const content = isAr ? article.content_ar : (article.content_en ?? article.content_ar);

  const words = (content ?? '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  const readMins = Math.max(1, Math.round(words / 200));
  const dateStr = article.published_at
    ? new Date(article.published_at).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const front = (process.env.NEXT_PUBLIC_SITE_URL || 'https://qev.app').replace(/\/$/, '');
  const shareUrl = `${front}/${params.locale}/news/${article.slug}`;

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: title,
    ...(summary ? { description: summary } : {}),
    ...(article.cover_image_url ? { image: [article.cover_image_url] } : {}),
    ...(article.published_at ? { datePublished: article.published_at, dateModified: article.published_at } : {}),
    ...(article.author_name ? { author: { '@type': 'Person', name: article.author_name } } : {}),
    publisher: { '@type': 'Organization', name: isAr ? 'قناة قطر للسيارات الكهربائية' : 'QEV' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': shareUrl },
    inLanguage: isAr ? 'ar' : 'en',
  };

  const related = (await fetchNews({ category: article.category?.slug, perPage: 4 })).data
    .filter(a => a.slug !== article.slug)
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-[#0a0c11] text-neutral-100" dir={isAr ? 'rtl' : 'ltr'}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <article className="max-w-3xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-neutral-400 mb-6">
          <Link href={`/${params.locale}/news`} className="hover:text-white">{isAr ? 'الأخبار' : 'News'}</Link>
          {article.category && (
            <>
              <span className="text-neutral-600">/</span>
              <Link href={`/${params.locale}/news?category=${article.category.slug}`}
                className="hover:text-white" style={{ color: article.category.color ?? undefined }}>
                {article.category.name_ar}
              </Link>
            </>
          )}
        </div>

        {/* Header */}
        <header className="mb-7">
          {article.is_breaking && (
            <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold mb-4">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> {isAr ? 'عاجل' : 'Breaking'}
            </span>
          )}
          <h1 className="text-3xl md:text-[2.4rem] font-extrabold leading-[1.25] tracking-tight">{title}</h1>
          {summary && <p className="text-neutral-300 text-lg leading-relaxed mt-4">{summary}</p>}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-5 text-sm text-neutral-500">
            {article.author_name && <span>✍️ {article.author_name}</span>}
            {dateStr && <span>📅 {dateStr}</span>}
            <span>⏱️ {readMins} {isAr ? 'دقيقة قراءة' : 'min read'}</span>
            <span>👁 {article.views_count}</span>
          </div>
        </header>

        {/* Cover */}
        {article.cover_image_url && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-7 border border-white/5">
            <Image src={article.cover_image_url} alt={title} fill className="object-cover" priority unoptimized />
          </div>
        )}

        {/* Actions */}
        <div className="mb-8 pb-6 border-b border-white/10">
          <NewsArticleActions articleId={article.id} initialLikes={article.likes_count} url={shareUrl} title={title} isAr={isAr} />
        </div>

        {/* Linked brands & models */}
        {(article.brands.length > 0 || article.car_models.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-7">
            {article.brands.map(b => (
              <Link key={b.slug} href={`/${params.locale}/brands/${b.slug}`}
                className="bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full text-sm transition-colors">
                🏭 {b.name_ar}
              </Link>
            ))}
            {article.car_models.map(m => (
              <span key={m.slug} className="bg-white/5 px-3 py-1 rounded-full text-sm">🚗 {m.name_ar}</span>
            ))}
          </div>
        )}

        {/* Content */}
        {content && <div className="article-body" dangerouslySetInnerHTML={{ __html: content }} />}

        {/* Source */}
        {article.source_url && (
          <div className="mt-8 p-4 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-neutral-400">
            {isAr ? 'المصدر:' : 'Source:'}{' '}
            <a href={article.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              {article.source_name ?? article.source_url}
            </a>
          </div>
        )}

        {/* Share again */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-sm text-neutral-400 mb-3">{isAr ? 'أعجبك الخبر؟ شاركه:' : 'Enjoyed it? Share:'}</p>
          <NewsArticleActions articleId={article.id} initialLikes={article.likes_count} url={shareUrl} title={title} isAr={isAr} />
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold mb-5">{isAr ? 'أخبار ذات صلة' : 'Related news'}</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map(a => (
                <Link key={a.id} href={`/${params.locale}/news/${a.slug}`}
                  className="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-xl overflow-hidden transition-all">
                  {a.cover_image_url && (
                    <div className="relative h-28 overflow-hidden">
                      <Image src={a.cover_image_url} alt={a.title_ar} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <p className="p-3 text-sm font-semibold leading-snug line-clamp-2">{isAr ? a.title_ar : (a.title_en ?? a.title_ar)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Subscribe */}
        <div className="mt-12">
          <NewsSubscribeForm locale={params.locale} />
        </div>
      </article>
    </main>
  );
}
