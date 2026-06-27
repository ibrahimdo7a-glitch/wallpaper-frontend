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

  const ilink = {
    enabled: site?.ilink_enabled === true || site?.ilink_enabled === '1',
    url: site?.ilink_file_url ?? '',
    label: (isAr ? site?.ilink_label_ar : site?.ilink_label_en) ?? null,
    tooltip: (isAr ? site?.ilink_tooltip_ar : site?.ilink_tooltip_en) ?? null,
  };

  return (
    <AppsBrowser
      apps={apps}
      categories={categories}
      ilink={ilink}
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
