import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchMarket, fetchMarketConfig } from '@/lib/server-api';
import { MarketSectionView } from '@/components/market/MarketSectionView';
import { type Locale } from '@/lib/i18n';

export const revalidate = 60;

type Props = { params: { locale: Locale }; searchParams: { type?: string; sort?: string; page?: string; country?: string } };

export const metadata: Metadata = { title: 'سوق السيارات | QEV', description: 'سيارات كهربائية وهجينة للبيع وطلبات شراء' };

export default async function CarsPage({ params: { locale }, searchParams }: Props) {
  const isAr = locale === 'ar';
  const config = await fetchMarketConfig();
  if (!config.cars.enabled) notFound();

  const page = Math.max(1, Number(searchParams.page ?? 1));
  const { data, meta } = await fetchMarket({ section: 'cars', type: searchParams.type, sort: searchParams.sort, country: searchParams.country, page, per_page: 24 });

  const tabs = [
    { value: 'car_sale', label: isAr ? '🚗 للبيع' : 'For sale' },
    { value: 'car_request', label: isAr ? '🔎 طلبات' : 'Requests' },
  ];

  return (
    <MarketSectionView
      basePath="/cars"
      label={isAr ? config.cars.label_ar : config.cars.label_en}
      locale={locale} isAr={isAr} listings={data} meta={meta}
      tabs={tabs} tabParam="type" activeTab={searchParams.type} sort={searchParams.sort}
      countries={config.countries} activeCountry={searchParams.country}
    />
  );
}
