import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchBrand, fetchBrandSections, fetchBrandModels } from '@/lib/server-api';
import { type Locale } from '@/lib/i18n';
import type { ApiBrandSection } from '@/lib/server-api';

type Props = { params: { locale: Locale; slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brand = await fetchBrand(params.slug);
  if (!brand) return { title: 'Not Found' };
  const isAr = params.locale === 'ar';
  return {
    title: `${isAr ? brand.name_ar : (brand.name_en ?? brand.name_ar)} | QEV`,
    description: isAr ? brand.description_ar ?? '' : brand.description_en ?? '',
  };
}

export default async function BrandPage({ params }: Props) {
  const isAr = params.locale === 'ar';

  const [brand, sections, models] = await Promise.all([
    fetchBrand(params.slug),
    fetchBrandSections(params.slug),
    fetchBrandModels(params.slug),
  ]);

  if (!brand) notFound();

  const brandName = isAr ? brand.name_ar : (brand.name_en ?? brand.name_ar);
  const navSections = sections.filter(s => s.show_in_navigation);
  const homeSections = sections.filter(s => s.show_in_brand_home);

  const primaryColor = brand.primary_color ?? '#3b82f6';

  return (
    <main className="min-h-screen bg-black text-white" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ─── Hero / Cover ─── */}
      <div className="relative h-52 md:h-72 w-full overflow-hidden">
        {brand.cover_image_url ? (
          <Image src={brand.cover_image_url} alt={brandName} fill className="object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${primaryColor}33, ${primaryColor}11)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black" />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* ─── Brand Header ─── */}
        <div className="flex items-end gap-5 -mt-12 mb-6 relative z-10">
          {brand.logo_url && (
            <div className="w-20 h-20 rounded-2xl bg-gray-900 border-2 border-gray-700 p-2 flex-shrink-0">
              <Image src={brand.logo_url} alt={brandName} width={72} height={72} className="object-contain w-full h-full" />
            </div>
          )}
          <div className="pb-1">
            <h1 className="text-2xl md:text-3xl font-bold">{brandName}</h1>
            {brand.country && <p className="text-gray-400 text-sm">{brand.country}</p>}
          </div>
        </div>

        {/* ─── Stats bar ─── */}
        <div className="flex gap-4 flex-wrap text-sm text-gray-400 mb-4">
          {brand.models_count > 0     && <span>🚗 {brand.models_count} {isAr ? 'موديل' : 'models'}</span>}
          {brand.wallpapers_count > 0 && <span>🖼️ {brand.wallpapers_count} {isAr ? 'خلفية' : 'wallpapers'}</span>}
          {brand.apps_count > 0       && <span>📱 {brand.apps_count} {isAr ? 'تطبيق' : 'apps'}</span>}
          {brand.news_count > 0       && <span>📰 {brand.news_count} {isAr ? 'خبر' : 'news'}</span>}
        </div>

        {/* ─── Description ─── */}
        {(isAr ? brand.description_ar : brand.description_en) && (
          <p className="text-gray-300 mb-6 max-w-3xl leading-relaxed">
            {isAr ? brand.description_ar : brand.description_en}
          </p>
        )}

        {/* ─── CTA buttons ─── */}
        {(brand.telegram_url || brand.whatsapp_url || brand.channel_url || brand.download_cta_url) && (
          <div className="flex gap-2 flex-wrap mb-8">
            {brand.telegram_url && (
              <a href={brand.telegram_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                ✈️ {isAr ? 'تليجرام' : 'Telegram'}
              </a>
            )}
            {brand.whatsapp_url && (
              <a href={brand.whatsapp_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-700 hover:bg-green-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                💬 {isAr ? 'واتساب' : 'WhatsApp'}
              </a>
            )}
            {brand.download_cta_url && (
              <a href={brand.download_cta_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors text-black"
                style={{ backgroundColor: primaryColor }}>
                ⬇️ {isAr ? (brand.download_cta_label_ar ?? 'تحميل') : (brand.download_cta_label_en ?? 'Download')}
              </a>
            )}
          </div>
        )}

        {/* ─── Dynamic Sections Navigation ─── */}
        {navSections.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 mb-10">
            {navSections.map(section => (
              <Link
                key={section.id}
                href={`/${params.locale}/brands/${params.slug}/${section.slug}`}
                className="group bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-xl p-3 text-center transition-all"
                style={{ '--hover-color': primaryColor } as React.CSSProperties}
              >
                <div className="text-xl mb-1">{section.icon}</div>
                <div className="text-xs font-medium leading-tight">
                  {isAr ? section.name_ar : section.name_en}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ─── Models ─── */}
        {models.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-bold mb-4">🚗 {isAr ? 'الموديلات' : 'Models'}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {models.map(model => (
                <Link
                  key={model.id}
                  href={`/${params.locale}/brands/${params.slug}/models/${model.slug}`}
                  className="group bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-2xl overflow-hidden transition-all"
                >
                  {(model.cover_image_url ?? model.image_url) ? (
                    <div className="relative h-32 overflow-hidden">
                      <Image src={(model.cover_image_url ?? model.image_url)!} alt={model.name_ar} fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-32 flex items-center justify-center text-4xl"
                      style={{ background: `${primaryColor}15` }}>🚗</div>
                  )}
                  <div className="p-3">
                    <h3 className="font-semibold text-sm">{isAr ? model.name_ar : (model.name_en ?? model.name_ar)}</h3>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {model.year_label && <span className="text-xs text-gray-500">{model.year_label}</span>}
                      {model.fuel_type && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-300">
                          {model.fuel_type}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ─── Brand home sections preview ─── */}
        {homeSections.filter(s => !s.is_model_specific).map(section => (
          <section key={section.id} className="mb-10">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg">
                {section.icon} {isAr ? section.name_ar : section.name_en}
              </h2>
              <Link href={`/${params.locale}/brands/${params.slug}/${section.slug}`}
                className="text-sm hover:underline" style={{ color: primaryColor }}>
                {isAr ? 'عرض الكل ←' : 'View all →'}
              </Link>
            </div>
            {section.description_ar && (
              <p className="text-gray-400 text-sm mb-3">{isAr ? section.description_ar : section.description_en}</p>
            )}
          </section>
        ))}

        <div className="h-16" />
      </div>
    </main>
  );
}
