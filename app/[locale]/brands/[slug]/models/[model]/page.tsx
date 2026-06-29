import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { fetchBrand, fetchModelWithSections, fetchBrands, fetchBrandModels } from '@/lib/server-api';
import { locales, type Locale } from '@/lib/i18n';

type Props = { params: { locale: Locale; slug: string; model: string } };

// Pre-render every brand/model combo for ISR caching (rest on-demand + cached).
export const revalidate = 60;
export async function generateStaticParams() {
  try {
    const brands = await fetchBrands();
    const pairs = (
      await Promise.all(
        brands.map(async (b) => {
          const models = await fetchBrandModels(b.slug);
          return models.map((m) => ({ slug: b.slug, model: m.slug }));
        }),
      )
    ).flat();
    return locales.flatMap((locale) => pairs.map((p) => ({ locale, ...p })));
  } catch {
    return [];
  }
}

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

  const [brand, { model, sections, listings, wallpapers }] = await Promise.all([
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

        {/* Marketplace listings that picked this model — featured first */}
        {listings.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg">🛒 {isAr ? `إعلانات ${modelName}` : `${modelName} listings`}</h2>
              <Link href={`/${params.locale}/cars`} className="text-xs text-gray-400 border border-gray-700 rounded-full px-3 py-1 hover:bg-gray-800 transition-colors">
                {isAr ? 'عرض الكل' : 'View all'}
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {listings.map(l => (
                <Link key={l.id} href={`/${params.locale}/market/${l.slug}`}
                  className={`group rounded-2xl overflow-hidden bg-gray-900 border transition-all ${l.is_featured ? 'border-amber-500/60 ring-1 ring-amber-500/30' : 'border-gray-800 hover:border-gray-600'}`}>
                  <div className="relative aspect-square bg-gray-800">
                    {l.cover_url
                      ? <Image src={l.cover_url} alt={l.title_ar} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl text-white/10">🛒</div>}
                    {l.is_featured && <span className="absolute top-1.5 start-1.5 text-[10px] font-bold bg-amber-500 text-black px-1.5 py-0.5 rounded-full">⭐</span>}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-semibold truncate">{isAr ? l.title_ar : (l.title_en ?? l.title_ar)}</p>
                    <p className="text-xs text-emerald-400 truncate">{l.price != null ? `${l.price.toLocaleString()} ${l.currency}` : (isAr ? 'حسب الطلب' : 'On request')}</p>
                    {l.city && <p className="text-[10px] text-gray-500 truncate">{l.city}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Latest wallpapers for this model (homepage-style strip) */}
        {wallpapers.length > 0 && (
          <section className="mb-10">
            <h2 className="font-bold text-lg mb-3">🖼️ {isAr ? `خلفيات ${modelName}` : `${modelName} wallpapers`}</h2>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {wallpapers.map(w => {
                const thumb = w.thumbnail_url ?? w.image_url;
                const href = w.section_slug ? `/${params.locale}/brands/${params.slug}/${w.section_slug}/${w.id}` : '#';
                return (
                  <Link key={w.id} href={href}
                    className="flex-shrink-0 group relative w-36 rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-gray-600 block transition-colors">
                    <div className="relative h-52 bg-gray-800">
                      {thumb
                        ? <Image src={thumb} alt={w.title_ar} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        : <div className="w-full h-full flex items-center justify-center text-3xl text-white/10">🖼️</div>}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
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
