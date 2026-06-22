import Image from 'next/image';
import Link from 'next/link';
import type { ApiHomepageSection } from '@/lib/server-api';

interface Props {
  section: ApiHomepageSection;
  isAr: boolean;
  locale: string;
}

export function BrandsSection({ section, isAr, locale }: Props) {
  const items = section.data?.items ?? [];
  if (items.length === 0) return null;

  const title = isAr ? section.title_ar : (section.title_en ?? section.title_ar);

  const isCarousel = section.layout === 'carousel' || section.layout === 'slider';

  return (
    <section className="py-8 px-4 border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">{title}</h2>
            <Link href={`/${locale}/brands`} className="text-xs text-blue-600 hover:underline">
              {isAr ? 'عرض الجميع' : 'View all'}
            </Link>
          </div>
        )}

        {isCarousel ? (
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {items.map((brand: any) => (
                <Link key={brand.id} href={`/${locale}/brands/${brand.slug}`}
                  className="flex-shrink-0 group flex flex-col items-center gap-2 w-20 hover:opacity-80 transition-opacity">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden p-1">
                    {brand.logo_url
                      ? <Image src={brand.logo_url} alt={brand.name_ar} width={48} height={48} className="object-contain" />
                      : <span className="text-xl font-bold text-gray-400">{brand.name_ar.charAt(0)}</span>
                    }
                  </div>
                  <span className="text-xs text-center text-gray-700 font-medium leading-tight">
                    {isAr ? brand.name_ar : (brand.name_en ?? brand.name_ar)}
                  </span>
                  {brand.models_count > 0 && (
                    <span className="text-xs text-gray-400">{brand.models_count} {isAr ? 'موديل' : 'models'}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {items.map((brand: any) => (
              <Link key={brand.id} href={`/${locale}/brands/${brand.slug}`}
                className="group flex flex-col items-center gap-2 p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-all">
                <div className="w-12 h-12 relative">
                  {brand.logo_url
                    ? <Image src={brand.logo_url} alt={brand.name_ar} fill className="object-contain" />
                    : <span className="text-lg font-bold text-gray-400 flex items-center justify-center h-full">{brand.name_ar.charAt(0)}</span>
                  }
                </div>
                <span className="text-xs text-center font-medium text-gray-700 leading-tight">
                  {isAr ? brand.name_ar : (brand.name_en ?? brand.name_ar)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
