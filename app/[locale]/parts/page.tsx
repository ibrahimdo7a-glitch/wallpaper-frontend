import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchMarket, fetchMarketConfig } from '@/lib/server-api';
import { MarketSectionView } from '@/components/market/MarketSectionView';
import { type Locale } from '@/lib/i18n';

export const revalidate = 60;

type Props = { params: { locale: Locale }; searchParams: { type?: string; sort?: string; page?: string } };

export const metadata: Metadata = { title: 'قطع وأكسسوارات | QEV', description: 'قطع غيار واكسسوارات وخدمات للسيارات الكهربائية والهجينة' };

export default async function PartsPage({ params: { locale }, searchParams }: Props) {
  const isAr = locale === 'ar';
  const config = await fetchMarketConfig();
  if (!config.parts.enabled) notFound();

  const page = Math.max(1, Number(searchParams.page ?? 1));
  const { data, meta } = await fetchMarket({ section: 'parts', type: searchParams.type, sort: searchParams.sort, page, per_page: 24 });

  return (
    <MarketSectionView
      section="parts" basePath="/parts"
      label={isAr ? config.parts.label_ar : config.parts.label_en}
      locale={locale} isAr={isAr} listings={data} meta={meta} searchParams={searchParams}
    />
  );
}
