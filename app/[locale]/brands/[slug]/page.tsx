import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchBrand, fetchBrandModels } from '@/lib/server-api';
import { type Locale } from '@/lib/i18n';

type Props = { params: { locale: Locale; slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brand = await fetchBrand(params.slug);
  if (!brand) return { title: 'Not Found' };
  return {
    title: `${params.locale === 'ar' ? brand.name_ar : (brand.name_en ?? brand.name_ar)} | QEV`,
    description: params.locale === 'ar' ? brand.description_ar ?? '' : brand.description_en ?? '',
  };
}

const fuelColors: Record<string, string> = {
  electric: 'bg-green-900 text-green-300',
  hybrid: 'bg-blue-900 text-blue-300',
  phev: 'bg-cyan-900 text-cyan-300',
  petrol: 'bg-orange-900 text-orange-300',
};

export default async function BrandPage({ params }: Props) {
  const isAr = params.locale === 'ar';
  const [brand, models] = await Promise.all([fetchBrand(params.slug), fetchBrandModels(params.slug)]);
  if (!brand) notFound();

  return (
    <main className="min-h-screen bg-black text-white" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Cover */}
      {brand.cover_image_url && (
        <div className="relative h-48 md:h-64 w-full overflow-hidden">
          <Image src={brand.cover_image_url} alt={brand.name_ar} fill className="object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Brand header */}
        <div className="flex items-center gap-5 mb-8 -mt-8 relative z-10">
          {brand.logo_url && (
            <div className="w-20 h-20 relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-700 flex-shrink-0">
              <Image src={brand.logo_url} alt={brand.name_ar} fill className="object-contain p-2" />
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{isAr ? brand.name_ar : (brand.name_en ?? brand.name_ar)}</h1>
            {brand.country && <p className="text-gray-400 text-sm mt-1">{brand.country}</p>}
            <div className="flex gap-4 mt-2 text-sm text-gray-400">
              <span>{brand.models_count} {isAr ? 'موديل' : 'models'}</span>
              <span>{brand.wallpapers_count} {isAr ? 'خلفية' : 'wallpapers'}</span>
              <span>{brand.apps_count} {isAr ? 'تطبيق' : 'apps'}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {(isAr ? brand.description_ar : brand.description_en) && (
          <p className="text-gray-300 mb-8 max-w-3xl">{isAr ? brand.description_ar : brand.description_en}</p>
        )}

        {/* Models grid */}
        <h2 className="text-xl font-bold mb-4">{isAr ? 'الموديلات' : 'Models'}</h2>
        {models.length === 0 ? (
          <p className="text-gray-500">{isAr ? 'لا توجد موديلات بعد' : 'No models yet'}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {models.map(model => (
              <Link
                key={model.id}
                href={`/${params.locale}/brands/${params.slug}/models/${model.slug}`}
                className="group bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-2xl overflow-hidden transition-all"
              >
                {model.cover_image_url || model.image_url ? (
                  <div className="relative h-36 bg-gray-800">
                    <Image
                      src={(model.cover_image_url ?? model.image_url)!}
                      alt={model.name_ar}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-36 bg-gray-800 flex items-center justify-center text-gray-600 text-4xl">🚗</div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold">{isAr ? model.name_ar : (model.name_en ?? model.name_ar)}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {model.year_label && <span className="text-xs text-gray-400">{model.year_label}</span>}
                    {model.fuel_type && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${fuelColors[model.fuel_type] ?? 'bg-gray-700 text-gray-300'}`}>
                        {model.fuel_type}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 mt-2 text-xs text-gray-500">
                    {model.wallpapers_count > 0 && <span>{model.wallpapers_count} {isAr ? 'خلفية' : 'wallpapers'}</span>}
                    {model.apps_count > 0 && <span>{model.apps_count} {isAr ? 'تطبيق' : 'apps'}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
