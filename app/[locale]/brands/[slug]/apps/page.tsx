import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchBrand, fetchBrandApps, fetchSiteContent } from '@/lib/server-api';
import { AppsBrowser, type AppsBrowserCategory } from '@/components/apps/AppsBrowser';
import { type Locale } from '@/lib/i18n';

export const revalidate = 60;

type Props = { params: { locale: Locale; slug: string }; searchParams: { category?: string; sort?: string } };

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const brand = await fetchBrand(slug);
  const name = brand ? (locale === 'ar' ? brand.name_ar : (brand.name_en ?? brand.name_ar)) : '';
  return { title: `${locale === 'ar' ? 'تطبيقات' : 'Apps'} ${name} | QEV` };
}

export default async function BrandAppsPage({ params: { locale, slug }, searchParams }: Props) {
  const isAr = locale === 'ar';
  const [brand, allApps, site] = await Promise.all([
    fetchBrand(slug),
    fetchBrandApps(slug),
    fetchSiteContent().catch(() => null),
  ]);
  if (!brand) notFound();
  const brandName = isAr ? brand.name_ar : (brand.name_en ?? brand.name_ar);

  // Category facets derived from this brand's apps only.
  const catMap = new Map<string, AppsBrowserCategory>();
  for (const a of allApps) {
    if (!a.category) continue;
    const existing = catMap.get(a.category.slug);
    if (existing) existing.apps_count++;
    else catMap.set(a.category.slug, {
      id: a.category.id, slug: a.category.slug, name_ar: a.category.name_ar,
      name_en: a.category.name_en, icon: a.category.icon, apps_count: 1,
    });
  }
  const categories = Array.from(catMap.values());

  // Filter + sort in-memory (a brand has few apps).
  let apps = searchParams.category ? allApps.filter(a => a.category?.slug === searchParams.category) : allApps;
  const sort = searchParams.sort ?? 'newest';
  apps = [...apps].sort((a, b) =>
    sort === 'most_downloaded'
      ? b.downloads_count - a.downloads_count
      : new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime());

  return (
    <AppsBrowser
      apps={apps}
      categories={categories}
      ilinkBoxes={site?.ilink_boxes ?? []}
      basePath={`/${locale}/brands/${slug}/apps`}
      locale={locale}
      isAr={isAr}
      activeCategory={searchParams.category}
      activeSort={searchParams.sort}
      title={isAr ? `تطبيقات ${brandName}` : `${brandName} apps`}
      subtitle={isAr ? `التطبيقات الخاصة بسيارات ${brandName} مع خطوات التنصيب.` : `Apps for ${brandName} cars with installation guides.`}
    />
  );
}
