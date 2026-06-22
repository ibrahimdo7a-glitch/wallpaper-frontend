import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { fetchBrands } from '@/lib/server-api';
import { type Locale } from '@/lib/i18n';

export const metadata: Metadata = {
  title: 'الماركات | QEV',
  description: 'استعرض جميع ماركات السيارات الكهربائية والصينية المتوفرة',
};

export default async function BrandsPage({ params }: { params: { locale: Locale } }) {
  const isAr = params.locale === 'ar';
  const brands = await fetchBrands();

  return (
    <main className="min-h-screen bg-black text-white" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">{isAr ? 'الماركات' : 'Brands'}</h1>
        <p className="text-gray-400 mb-10">{isAr ? 'استعرض جميع ماركات السيارات الكهربائية والصينية' : 'Explore all electric and Chinese car brands'}</p>

        {brands.length === 0 ? (
          <p className="text-gray-500 text-center py-20">{isAr ? 'لا توجد ماركات بعد' : 'No brands yet'}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {brands.map(brand => (
              <Link
                key={brand.id}
                href={`/${params.locale}/brands/${brand.slug}`}
                className="group bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-2xl p-5 flex flex-col items-center gap-3 transition-all"
              >
                {brand.logo_url ? (
                  <div className="w-16 h-16 relative">
                    <Image src={brand.logo_url} alt={brand.name_ar} fill className="object-contain" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-2xl font-bold">
                    {(isAr ? brand.name_ar : (brand.name_en ?? brand.name_ar)).charAt(0)}
                  </div>
                )}
                <span className="font-semibold text-center text-sm">{isAr ? brand.name_ar : (brand.name_en ?? brand.name_ar)}</span>
                <span className="text-xs text-gray-500">{brand.models_count} {isAr ? 'موديل' : 'models'}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
