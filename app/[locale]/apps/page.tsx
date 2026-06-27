import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { fetchAppCategories, fetchApps, fetchSiteContent } from '@/lib/server-api';
import { AppsBrowser } from '@/components/apps/AppsBrowser';
import { type Locale } from '@/lib/i18n';

type Props = { params: { locale: Locale }; searchParams: { category?: string; sort?: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return {
    title: locale === 'ar' ? 'التطبيقات | QEV' : 'Apps | QEV',
    description: locale === 'ar' ? 'تطبيقات أندرويد للسيارات مع شرح خطوات التنصيب' : 'Android apps for cars with installation guides',
  };
}

export default async function AppsPage({ params: { locale }, searchParams }: Props) {
  setRequestLocale(locale);
  const isAr = locale === 'ar';

  const [categories, { data: apps }, site] = await Promise.all([
    fetchAppCategories(),
    fetchApps({ category: searchParams.category, sort: searchParams.sort, per_page: 24 }),
    fetchSiteContent().catch(() => null),
  ]);

  return (
    <AppsBrowser
      apps={apps}
      categories={categories}
      ilinkBoxes={site?.ilink_boxes ?? []}
      basePath={`/${locale}/apps`}
      locale={locale}
      isAr={isAr}
      activeCategory={searchParams.category}
      activeSort={searchParams.sort}
      title={isAr ? 'التطبيقات' : 'Apps'}
      subtitle={isAr ? 'تطبيقات مختارة للسيارات الكهربائية والصينية، مع خطوات التنصيب.' : 'Curated car apps with installation guides.'}
    />
  );
}
