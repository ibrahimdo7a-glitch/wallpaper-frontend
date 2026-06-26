import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchMarket, fetchMarketConfig } from '@/lib/server-api';
import { MarketSectionView } from '@/components/market/MarketSectionView';
import { type Locale } from '@/lib/i18n';

export const revalidate = 60;

type Props = { params: { locale: Locale }; searchParams: { category?: string; sort?: string; page?: string } };

export const metadata: Metadata = { title: 'قطع وأكسسوارات | QEV', description: 'قطع غيار واكسسوارات وخدمات للسيارات الكهربائية والهجينة' };

export default async function PartsPage({ params: { locale }, searchParams }: Props) {
  const isAr = locale === 'ar';
  const config = await fetchMarketConfig();
  if (!config.parts.enabled) notFound();

  const page = Math.max(1, Number(searchParams.page ?? 1));
  const { data, meta } = await fetchMarket({ section: 'parts', category: searchParams.category, sort: searchParams.sort, page, per_page: 24 });

  const tabs = (config.parts.sections ?? []).map((s) => ({
    value: s.slug,
    label: `${s.icon ? s.icon + ' ' : ''}${isAr ? s.name_ar : (s.name_en ?? s.name_ar)}`,
  }));

  return (
    <MarketSectionView
      basePath="/parts"
      label={isAr ? config.parts.label_ar : config.parts.label_en}
      locale={locale} isAr={isAr} listings={data} meta={meta}
      tabs={tabs} tabParam="category" activeTab={searchParams.category} sort={searchParams.sort}
    />
  );
}
