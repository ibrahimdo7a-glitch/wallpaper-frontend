import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchCarModel, fetchModelImportantApps } from '@/lib/server-api';
import { type Locale } from '@/lib/i18n';

type Props = { params: { locale: Locale; slug: string; model: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const model = await fetchCarModel(params.slug, params.model);
  if (!model) return { title: 'Not Found' };
  const n = params.locale === 'ar' ? model.name_ar : (model.name_en ?? model.name_ar);
  return { title: `التطبيقات المهمة لـ ${n} | QEV` };
}

export default async function ModelImportantAppsPage({ params }: Props) {
  const isAr = params.locale === 'ar';
  const [model, apps] = await Promise.all([
    fetchCarModel(params.slug, params.model),
    fetchModelImportantApps(params.slug, params.model),
  ]);
  if (!model) notFound();

  const modelName = isAr ? model.name_ar : (model.name_en ?? model.name_ar);

  return (
    <main className="min-h-screen bg-black text-white" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
          <Link href={`/${params.locale}/brands`} className="hover:text-white">{isAr ? 'الماركات' : 'Brands'}</Link>
          <span>/</span>
          <Link href={`/${params.locale}/brands/${params.slug}`} className="hover:text-white">{model.brand?.name_ar}</Link>
          <span>/</span>
          <Link href={`/${params.locale}/brands/${params.slug}/models/${params.model}`} className="hover:text-white">{modelName}</Link>
          <span>/</span>
          <span className="text-white">{isAr ? 'التطبيقات المهمة' : 'Important Apps'}</span>
        </div>

        <h1 className="text-2xl font-bold mb-1">⭐ {isAr ? `التطبيقات المهمة لـ ${modelName}` : `Important Apps for ${modelName}`}</h1>
        <p className="text-gray-400 text-sm mb-2">{isAr ? 'قائمة منتقاة بأهم التطبيقات لهذا الموديل' : 'A curated list of must-have apps for this model'}</p>
        <p className="text-gray-500 text-sm mb-8">{apps.length} {isAr ? 'تطبيق' : 'apps'}</p>

        {apps.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-3">⭐</p>
            <p>{isAr ? 'لا توجد تطبيقات مهمة بعد' : 'No important apps yet'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {apps.map((app, i) => (
              <Link
                key={app.id}
                href={`/${params.locale}/apps/${app.slug}`}
                className="group bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-2xl p-4 flex gap-4 items-center transition-all"
              >
                <span className="text-2xl font-bold text-gray-600 w-8 text-center flex-shrink-0">{i + 1}</span>
                {app.icon_url ? (
                  <Image src={app.icon_url} alt={app.title_ar} width={52} height={52} className="rounded-xl flex-shrink-0" />
                ) : (
                  <div className="w-13 h-13 rounded-xl bg-gray-700 flex-shrink-0 flex items-center justify-center text-2xl">📱</div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{isAr ? app.title_ar : (app.title_en ?? app.title_ar)}</h3>
                  {(isAr ? (app as any).short_description_ar : (app as any).short_description_en) && (
                    <p className="text-sm text-gray-400 line-clamp-1 mt-0.5">
                      {isAr ? (app as any).short_description_ar : (app as any).short_description_en}
                    </p>
                  )}
                </div>
                <span className="text-gray-500 group-hover:text-white transition-colors flex-shrink-0">←</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
