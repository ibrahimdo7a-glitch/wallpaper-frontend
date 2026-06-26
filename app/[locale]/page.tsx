import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { type Locale } from '@/lib/i18n';
import { fetchHomepage, fetchBrands, fetchSiteContent } from '@/lib/server-api';
import { SectionRenderer } from '@/components/homepage/SectionRenderer';
import { BrandsStatsRow } from '@/components/homepage/BrandsStatsRow';
import { StatsBlock } from '@/components/homepage/StatsBlock';
import { VisitTracker } from '@/components/homepage/VisitTracker';
import { Fragment } from 'react';

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

  // Brands render as a single row at the top; statistics move down to their own
  // block (3×2) just above the features strip (custom_content).
  const statsSection = sections.find(s => s.type === 'statistics');
  const visibleSections = sections.filter(s => s.type !== 'statistics');
  const hasFeatures = visibleSections.some(s => s.type === 'custom_content');

  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="bg-white dark:bg-gray-950 min-h-screen">
      <VisitTracker />
      {visibleSections.map(section => {
        const node = (section.type === 'brands' || section.type === 'featured_brands') ? (
          <BrandsStatsRow brandsSection={section} isAr={isAr} locale={locale} />
        ) : (
          <SectionRenderer
            section={section}
            isAr={isAr}
            locale={locale}
            allBrands={brands}
            searchPlaceholder={searchPlaceholder}
            searchEnabled={searchEnabled}
          />
        );

        // Drop the stats block right before the features strip.
        if (section.type === 'custom_content' && statsSection) {
          return (
            <Fragment key={section.id}>
              <StatsBlock statsSection={statsSection} isAr={isAr} />
              {node}
            </Fragment>
          );
        }
        return <Fragment key={section.id}>{node}</Fragment>;
      })}

      {/* Fallback: if there's no features strip, show stats at the end. */}
      {statsSection && !hasFeatures && <StatsBlock statsSection={statsSection} isAr={isAr} />}
    </div>
  );
}
