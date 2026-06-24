import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { fetchBrand, fetchModelWithSections } from '@/lib/server-api';
import { type Locale } from '@/lib/i18n';

type Props = { params: { locale: Locale; slug: string; model: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { model } = await fetchModelWithSections(params.slug, params.model);
  if (!model) return { title: 'Not Found' };
  const isAr = params.locale === 'ar';
  return {
    title: `${isAr ? model.name_ar : (model.name_en ?? model.name_ar)} | QEV`,
    description: isAr ? model.description_ar ?? '' : model.description_en ?? '',
  };
}

export default async function ModelPage({ params }: Props) {
  setRequestLocale(params.locale);
  const isAr = params.locale === 'ar';

  const [brand, { model, sections }] = await Promise.all([
    fetchBrand(params.slug),
    fetchModelWithSections(params.slug, params.model),
  ]);

  if (!model) notFound();

  const modelName = isAr ? model.name_ar : (model.name_en ?? model.name_ar);
  const brandName = brand ? (isAr ? brand.name_ar : (brand.name_en ?? brand.name_ar)) : '';
  const primaryColor = brand?.primary_color ?? '#3b82f6';

  const navSections = sections.filter(s => s.show_in_navigation);
  const homeSections = sections.filter(s => s.show_in_brand_home);

  return (
    <main className="min-h-screen bg-black text-white" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Cover */}
      {(model.cover_image_url ?? model.image_url) && (
        <div className="relative h-56 md:h-72 w-full overflow-hidden">
          <Image src={(model.cover_image_url ?? model.image_url)!} alt={modelName} fill className="object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4 flex-wrap">
          <Link href={`/${params.locale}/brands`} className="hover:text-white">{isAr ? 'الماركات' : 'Brands'}</Link>
          <span>/</span>
          <Link href={`/${params.locale}/brands/${params.slug}`} className="hover:text-white">{brandName}</Link>
          <span>/</span>
          <span className="text-white">{modelName}</span>
        </div>

        {/* Model header */}
        <div className="flex items-center gap-4 mb-4">
          {brand?.logo_url && (
            <div className="w-12 h-12 relative flex-shrink-0">
              <Image src={brand.logo_url} alt={brandName} fill className="object-contain" />
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{modelName}</h1>
            <div className="flex gap-3 mt-1 text-sm text-gray-400 flex-wrap">
              {model.year_label && <span>{model.year_label}</span>}
              {model.fuel_type && <span className="capitalize">{model.fuel_type}</span>}
              {model.car_type && <span className="capitalize">{model.car_type}</span>}
            </div>
          </div>
        </div>

        {model.description_ar && (
          <p className="text-gray-300 max-w-3xl mb-8 leading-relaxed">
            {isAr ? model.description_ar : (model.description_en ?? model.description_ar)}
          </p>
        )}

        {/* Dynamic sections navigation */}
        {navSections.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mb-10">
            {navSections.map(section => (
              <Link
                key={section.id}
                href={`/${params.locale}/brands/${params.slug}/models/${params.model}/${section.slug}`}
                className="group bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-xl p-3 text-center transition-all"
              >
                <div className="text-xl mb-1">{section.icon}</div>
                <div className="text-xs font-medium leading-tight">
                  {isAr ? section.name_ar : section.name_en}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* If no sections configured, show a friendly empty state */}
        {sections.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-5xl mb-3">🚗</p>
            <p>{isAr ? 'لا توجد أقسام مفعّلة لهذا الموديل بعد' : 'No sections enabled for this model yet'}</p>
          </div>
        )}

        {/* Home sections preview strips */}
        {homeSections.map(section => (
          <section key={section.id} className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg">
                {section.icon} {isAr ? section.name_ar : section.name_en}
              </h2>
              <Link
                href={`/${params.locale}/brands/${params.slug}/models/${params.model}/${section.slug}`}
                className="text-sm hover:underline"
                style={{ color: primaryColor }}>
                {isAr ? 'عرض الكل ←' : 'View all →'}
              </Link>
            </div>
            {(isAr ? section.description_ar : section.description_en) && (
              <p className="text-gray-400 text-sm mb-2">{isAr ? section.description_ar : section.description_en}</p>
            )}
          </section>
        ))}

        <div className="h-12" />
      </div>
    </main>
  );
}
