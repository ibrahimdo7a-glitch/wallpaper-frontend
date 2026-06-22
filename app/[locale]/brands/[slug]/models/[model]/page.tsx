import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  fetchCarModel,
  fetchModelWallpapers,
  fetchModelImportantApps,
  fetchModelTutorials,
} from '@/lib/server-api';
import { type Locale } from '@/lib/i18n';

type Props = { params: { locale: Locale; slug: string; model: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const model = await fetchCarModel(params.slug, params.model);
  if (!model) return { title: 'Not Found' };
  const locale = params.locale;
  return {
    title: `${locale === 'ar' ? model.name_ar : (model.name_en ?? model.name_ar)} | QEV`,
    description: locale === 'ar' ? model.description_ar ?? '' : model.description_en ?? '',
  };
}

export default async function ModelPage({ params }: Props) {
  const isAr = params.locale === 'ar';

  const [model, wallpapers, importantApps, tutorials] = await Promise.all([
    fetchCarModel(params.slug, params.model),
    fetchModelWallpapers(params.slug, params.model),
    fetchModelImportantApps(params.slug, params.model),
    fetchModelTutorials(params.slug, params.model),
  ]);

  if (!model) notFound();

  const modelName = isAr ? model.name_ar : (model.name_en ?? model.name_ar);
  const brandName = model.brand ? (isAr ? model.brand.name_ar : (model.brand.name_en ?? model.brand.name_ar)) : '';

  const navItems = [
    { href: 'wallpapers', label: isAr ? 'الخلفيات' : 'Wallpapers', count: model.wallpapers_count, icon: '🖼️' },
    { href: 'apps', label: isAr ? 'التطبيقات' : 'Apps', count: model.apps_count, icon: '📱' },
    { href: 'important-apps', label: isAr ? 'التطبيقات المهمة' : 'Important Apps', count: 0, icon: '⭐' },
    { href: 'tutorials', label: isAr ? 'الشروحات' : 'Tutorials', count: model.tutorials_count, icon: '🎓' },
    { href: 'files', label: isAr ? 'الملفات' : 'Files', count: 0, icon: '📁' },
  ];

  return (
    <main className="min-h-screen bg-black text-white" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Cover */}
      {(model.cover_image_url ?? model.image_url) && (
        <div className="relative h-56 md:h-72 w-full overflow-hidden">
          <Image src={(model.cover_image_url ?? model.image_url)!} alt={modelName} fill className="object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
          <Link href={`/${params.locale}/brands`} className="hover:text-white">{isAr ? 'الماركات' : 'Brands'}</Link>
          <span>/</span>
          <Link href={`/${params.locale}/brands/${params.slug}`} className="hover:text-white">{brandName}</Link>
          <span>/</span>
          <span className="text-white">{modelName}</span>
        </div>

        {/* Model title */}
        <div className="flex items-center gap-4 mb-6">
          {model.brand?.logo_url && (
            <div className="w-12 h-12 relative">
              <Image src={model.brand.logo_url} alt={brandName} fill className="object-contain" />
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{modelName}</h1>
            <div className="flex gap-3 mt-1 text-sm text-gray-400">
              {model.year_label && <span>{model.year_label}</span>}
              {model.fuel_type && <span className="capitalize">{model.fuel_type}</span>}
              {model.car_type && <span className="capitalize">{model.car_type}</span>}
            </div>
          </div>
        </div>

        {/* Quick nav */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-10">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={`/${params.locale}/brands/${params.slug}/models/${params.model}/${item.href}`}
              className="bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-xl p-4 text-center transition-all"
            >
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-sm font-medium">{item.label}</div>
              {item.count > 0 && <div className="text-xs text-gray-500 mt-1">{item.count}</div>}
            </Link>
          ))}
        </div>

        {/* Important apps preview */}
        {importantApps.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">⭐ {isAr ? 'التطبيقات المهمة' : 'Important Apps'}</h2>
              <Link href={`/${params.locale}/brands/${params.slug}/models/${params.model}/important-apps`} className="text-sm text-blue-400 hover:underline">
                {isAr ? 'عرض الكل' : 'View all'}
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {importantApps.slice(0, 6).map(app => (
                <Link
                  key={app.id}
                  href={`/${params.locale}/apps/${app.slug}`}
                  className="flex-shrink-0 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-3 flex items-center gap-3 min-w-[180px]"
                >
                  {app.icon_url ? (
                    <Image src={app.icon_url} alt={app.title_ar} width={40} height={40} className="rounded-xl flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gray-700 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{isAr ? app.title_ar : (app.title_en ?? app.title_ar)}</div>
                    <div className="text-xs text-gray-500">{app.version}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Wallpapers preview */}
        {wallpapers.data.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">🖼️ {isAr ? 'الخلفيات' : 'Wallpapers'}</h2>
              <Link href={`/${params.locale}/brands/${params.slug}/models/${params.model}/wallpapers`} className="text-sm text-blue-400 hover:underline">
                {isAr ? 'عرض الكل' : 'View all'}
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {wallpapers.data.slice(0, 8).map(w => (
                <Link key={w.id} href={`/${params.locale}/wallpaper/${w.slug}`} className="relative aspect-[9/16] rounded-xl overflow-hidden bg-gray-800 block">
                  {(w.thumbnail_url ?? w.image_url) && (
                    <Image src={(w.thumbnail_url ?? w.image_url)!} alt={w.title_ar} fill className="object-cover hover:scale-105 transition-transform duration-300" />
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Tutorials preview */}
        {tutorials.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">🎓 {isAr ? 'الشروحات' : 'Tutorials'}</h2>
              <Link href={`/${params.locale}/brands/${params.slug}/models/${params.model}/tutorials`} className="text-sm text-blue-400 hover:underline">
                {isAr ? 'عرض الكل' : 'View all'}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {tutorials.slice(0, 3).map((t: any) => (
                <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  {t.cover_image_url && (
                    <div className="relative h-32">
                      <Image src={t.cover_image_url} alt={t.title_ar} fill className="object-cover" />
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-medium text-sm">{isAr ? t.title_ar : (t.title_en ?? t.title_ar)}</h3>
                    {t.duration_label && <p className="text-xs text-gray-500 mt-1">⏱ {t.duration_label}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
