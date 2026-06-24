import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { type Locale } from '@/lib/i18n';
import { fetchHomepage, fetchBrands, fetchSiteContent } from '@/lib/server-api';
import { SectionRenderer } from '@/components/homepage/SectionRenderer';

export const revalidate = 120;

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const site = await fetchSiteContent();
  const isAr = locale === 'ar';
  return {
    title: isAr ? (site?.site_name_ar || 'QEV') : (site?.site_name_en || 'QEV'),
    description: isAr ? (site?.hero_subtitle_ar || '') : (site?.hero_subtitle_en || ''),
  };
}

export default async function HomePage({ params: { locale } }: { params: { locale: Locale } }) {
  setRequestLocale(locale);
  const isAr = locale === 'ar';

  const [sections, brands, site] = await Promise.all([
    fetchHomepage().catch(() => []),
    fetchBrands().catch(() => []),
    fetchSiteContent().catch(() => null),
  ]);

  const searchPlaceholder = isAr
    ? (site?.search_placeholder_ar || 'ابحث عن ماركة أو موديل أو تطبيق أو خلفية...')
    : (site?.search_placeholder_en || 'Search brands, models, apps, wallpapers...');
  const searchEnabled = site?.search_enabled ?? true;

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="bg-white dark:bg-gray-950 min-h-screen">
      {sections.map(section => (
        <SectionRenderer
          key={section.id}
          section={section}
          isAr={isAr}
          locale={locale}
          allBrands={brands}
          searchPlaceholder={searchPlaceholder}
          searchEnabled={searchEnabled}
        />
      ))}
    </div>
  );
}
