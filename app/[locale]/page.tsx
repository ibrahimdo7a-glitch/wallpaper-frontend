import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { type Locale } from '@/lib/i18n';

export const revalidate = 300;

import { Hero } from '@/components/Hero';
import { MostDownloaded } from '@/components/MostDownloaded';
import { LatestWallpapers } from '@/components/LatestWallpapers';
import { ScreenSelector } from '@/components/ScreenSelector';
import { FeatureStrip } from '@/components/FeatureStrip';
import { mockWallpapers } from '@/data/wallpapers';
import { translations } from '@/data/translations';
import {
  fetchCategories, fetchMostDownloaded, fetchLatestWallpapers, fetchSiteContent,
  fetchBrands, fetchNews,
} from '@/lib/server-api';
import type { Wallpaper } from '@/types';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const siteContent = await fetchSiteContent();
  const t = translations[locale] ?? translations.en;
  return {
    title: locale === 'ar' ? (siteContent?.site_name_ar || 'QEV') : (siteContent?.site_name_en || 'QEV'),
    description: locale === 'ar' ? (siteContent?.hero_subtitle_ar || t.hero.subtitle) : (siteContent?.hero_subtitle_en || t.hero.subtitle),
  };
}

function gradients() {
  return [
    'from-amber-800 via-orange-700 to-yellow-600',
    'from-slate-900 via-blue-950 to-indigo-900',
    'from-emerald-900 via-teal-800 to-cyan-700',
    'from-zinc-700 via-slate-600 to-gray-500',
    'from-violet-900 via-purple-800 to-indigo-700',
    'from-rose-900 via-red-800 to-orange-700',
  ];
}

export default async function HomePage({ params: { locale } }: { params: { locale: Locale } }) {
  const loc = (locale === 'ar' || locale === 'en') ? locale : 'en';
  const isAr = loc === 'ar';

  const [apiWallpapers, apiLatest, siteContent, brands, { data: newsArticles }] = await Promise.all([
    fetchMostDownloaded(5).catch(() => []),
    fetchLatestWallpapers(10).catch(() => []),
    fetchSiteContent().catch(() => null),
    fetchBrands().catch(() => []),
    fetchNews({ featured: false }).catch(() => ({ data: [], meta: {} as any })),
  ]);

  const wallpapers: Wallpaper[] = apiWallpapers.length > 0
    ? apiWallpapers.map((w, i): Wallpaper => ({
        id: String(w.id), slug: w.slug, titleAr: w.title_ar || '', titleEn: w.title_en || '',
        downloads: w.downloads_count, is4K: w.resolution_label === '4K' || w.resolution_label === '8K',
        imageUrl: w.thumbnail_url ?? w.image_url ?? undefined,
        gradient: gradients()[i % gradients().length],
        category: w.category ? (isAr ? w.category.name_ar : w.category.name_en) : '',
      }))
    : mockWallpapers;

  const latestWallpapers: Wallpaper[] = apiLatest.map((w, i): Wallpaper => ({
    id: String(w.id), slug: w.slug, titleAr: w.title_ar || '', titleEn: w.title_en || '',
    downloads: w.downloads_count, is4K: w.resolution_label === '4K' || w.resolution_label === '8K',
    imageUrl: w.thumbnail_url ?? w.image_url ?? undefined,
    gradient: gradients()[i % gradients().length],
    category: w.category ? (isAr ? w.category.name_ar : w.category.name_en) : '',
  }));

  return (
    <div dir={isAr ? 'rtl' : 'ltr'}>
      <Hero locale={loc} siteContent={siteContent} />

      {/* ─── Brands Section ─── */}
      {brands.length > 0 && (
        <section className="py-12 px-4 bg-gray-950">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{isAr ? '🏭 الماركات' : '🏭 Brands'}</h2>
              <Link href={`/${loc}/brands`} className="text-sm text-gray-400 hover:text-white transition-colors">
                {isAr ? 'عرض الكل ←' : 'View all →'}
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {brands.slice(0, 10).map(brand => (
                <Link
                  key={brand.id}
                  href={`/${loc}/brands/${brand.slug}`}
                  className="flex-shrink-0 group bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-2xl p-4 flex flex-col items-center gap-2 w-28 transition-all"
                >
                  {brand.logo_url ? (
                    <div className="w-12 h-12 relative">
                      <Image src={brand.logo_url} alt={brand.name_ar} fill className="object-contain" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold text-white">
                      {brand.name_ar.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs text-white text-center font-medium leading-tight">
                    {isAr ? brand.name_ar : (brand.name_en ?? brand.name_ar)}
                  </span>
                  <span className="text-xs text-gray-500">{brand.models_count}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <MostDownloaded wallpapers={wallpapers} locale={loc} />
      <LatestWallpapers wallpapers={latestWallpapers} locale={loc} />

      {/* ─── News Section ─── */}
      {newsArticles.length > 0 && (
        <section className="py-12 px-4 bg-gray-950">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{isAr ? '📰 آخر الأخبار' : '📰 Latest News'}</h2>
              <Link href={`/${loc}/news`} className="text-sm text-gray-400 hover:text-white transition-colors">
                {isAr ? 'كل الأخبار ←' : 'All News →'}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {newsArticles.slice(0, 3).map(article => (
                <Link
                  key={article.id}
                  href={`/${loc}/news/${article.slug}`}
                  className="group bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-2xl overflow-hidden transition-all"
                >
                  {article.cover_image_url && (
                    <div className="relative h-40 overflow-hidden">
                      <Image src={article.cover_image_url} alt={article.title_ar} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      {article.is_breaking && (
                        <span className="absolute top-2 start-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                          {isAr ? 'عاجل' : 'Breaking'}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    {article.category && (
                      <span className="text-xs mb-1 block font-medium" style={{ color: article.category.color ?? '#9ca3af' }}>
                        {article.category.name_ar}
                      </span>
                    )}
                    <h3 className="font-semibold text-white line-clamp-2 text-sm">
                      {isAr ? article.title_ar : (article.title_en ?? article.title_ar)}
                    </h3>
                    {article.published_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(article.published_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <ScreenSelector locale={loc} />
      <FeatureStrip locale={loc} siteContent={siteContent} />
    </div>
  );
}
