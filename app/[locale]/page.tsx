import type { Metadata } from 'next';
import { type Locale } from '@/lib/i18n';
import { Hero } from '@/components/Hero';
import { MostDownloaded } from '@/components/MostDownloaded';
import { Categories } from '@/components/Categories';
import { ScreenSelector } from '@/components/ScreenSelector';
import { FeatureStrip } from '@/components/FeatureStrip';
import { mockWallpapers } from '@/data/wallpapers';
import { mockCategories } from '@/data/categories';
import { translations } from '@/data/translations';
import { fetchCategories, fetchMostDownloaded, fetchSiteContent } from '@/lib/server-api';
import type { Wallpaper, Category } from '@/types';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const siteContent = await fetchSiteContent();
  const t = translations[locale] ?? translations.en;
  return {
    title: locale === 'ar'
      ? (siteContent?.site_name_ar || t.siteName)
      : (siteContent?.site_name_en || t.siteName),
    description: locale === 'ar'
      ? (siteContent?.hero_subtitle_ar || t.hero.subtitle)
      : (siteContent?.hero_subtitle_en || t.hero.subtitle),
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

  // Fetch all data in parallel; individual functions already catch errors and return []/ null
  const [apiWallpapers, apiCategories, siteContent] = await Promise.all([
    fetchMostDownloaded(5).catch(() => [] as Awaited<ReturnType<typeof fetchMostDownloaded>>),
    fetchCategories().catch(() => [] as Awaited<ReturnType<typeof fetchCategories>>),
    fetchSiteContent().catch(() => null),
  ]);

  // Map API wallpapers to local type (fallback to mock if empty)
  const wallpapers: Wallpaper[] = apiWallpapers.length > 0
    ? apiWallpapers.map((w, i): Wallpaper => ({
        id: String(w.id),
        slug: w.slug,
        titleAr: w.title_ar || '',
        titleEn: w.title_en || '',
        downloads: w.downloads_count,
        is4K: w.resolution_label === '4K' || w.resolution_label === '8K',
        imageUrl: w.thumbnail_url ?? w.image_url ?? undefined,
        gradient: gradients()[i % gradients().length],
        category: w.category ? (loc === 'ar' ? w.category.name_ar : w.category.name_en) : '',
      }))
    : mockWallpapers;

  // Map API categories to local type (fallback to mock if empty)
  const categoryGradients = [
    'from-amber-700 to-orange-600',
    'from-slate-800 to-zinc-700',
    'from-violet-800 to-indigo-700',
    'from-emerald-800 to-teal-700',
    'from-rose-800 to-pink-700',
  ];

  const categories: Category[] = apiCategories.length > 0
    ? apiCategories.map((c, i): Category => ({
        id: String(c.id),
        slug: c.slug,
        nameAr: c.name_ar,
        nameEn: c.name_en,
        descriptionAr: c.description_ar || '',
        descriptionEn: c.description_en || '',
        imageUrl: c.cover_image_url ?? undefined,
        gradient: categoryGradients[i % categoryGradients.length],
        subcategoriesAr: c.children?.map((ch) => ch.name_ar) ?? [],
        subcategoriesEn: c.children?.map((ch) => ch.name_en) ?? [],
      }))
    : mockCategories;

  return (
    <div>
      <Hero locale={loc} siteContent={siteContent} />
      <MostDownloaded wallpapers={wallpapers} locale={loc} />
      <Categories categories={categories} locale={loc} />
      <ScreenSelector locale={loc} />
      <FeatureStrip locale={loc} siteContent={siteContent} />
    </div>
  );
}
