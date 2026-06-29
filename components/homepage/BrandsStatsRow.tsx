import Image from 'next/image';
import Link from 'next/link';
import type { ApiHomepageSection } from '@/lib/server-api';

interface Props {
  brandsSection: ApiHomepageSection;
  statsSection?: ApiHomepageSection; // stats now render in their own block lower down
  isAr: boolean;
  locale: string;
}

export function BrandsStatsRow({ brandsSection, isAr, locale }: Props) {
  const brands: any[] = (brandsSection.data?.items ?? []).slice(0, 6);
  const title = isAr ? brandsSection.title_ar : (brandsSection.title_en ?? brandsSection.title_ar);

  if (brands.length === 0) return null;

  return (
    <section className="py-5 px-4 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{title ?? (isAr ? 'الماركات' : 'Brands')}</h2>
          <Link href={`/${locale}/brands`}
            className="text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            {isAr ? 'عرض جميع الماركات' : 'View all brands'}
          </Link>
        </div>

        {/* Single row of brand logos */}
        <div className="grid grid-cols-6 gap-2">
          {brands.map((brand) => (
            <Link key={brand.id} href={`/${locale}/brands/${brand.slug}`}
              className="group flex flex-col items-center gap-1.5 py-0.5 min-w-0">
              <div className="w-11 h-11 flex items-center justify-center transition-transform group-hover:scale-105">
                {brand.logo_url
                  ? <Image src={brand.logo_url} alt={brand.name_ar} width={44} height={44} className="object-contain max-h-11 w-auto" />
                  : <span className="text-xl font-bold text-gray-400">{brand.name_ar.charAt(0)}</span>}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 text-center leading-tight line-clamp-1 w-full group-hover:text-gray-900 dark:group-hover:text-white">
                {isAr ? brand.name_ar : (brand.name_en ?? brand.name_ar)}
              </span>
              {brand.models_count > 0 && (
                <span className="text-[10px] text-gray-400 dark:text-gray-500">{brand.models_count} {isAr ? 'موديلات' : 'models'}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
