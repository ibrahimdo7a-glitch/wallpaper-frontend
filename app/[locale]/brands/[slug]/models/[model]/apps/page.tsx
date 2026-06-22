import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchCarModel, fetchModelApps } from '@/lib/server-api';
import { type Locale } from '@/lib/i18n';

type Props = { params: { locale: Locale; slug: string; model: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const model = await fetchCarModel(params.slug, params.model);
  if (!model) return { title: 'Not Found' };
  const n = params.locale === 'ar' ? model.name_ar : (model.name_en ?? model.name_ar);
  return { title: `تطبيقات ${n} | QEV` };
}

const safetyColors: Record<string, string> = {
  verified: 'bg-green-900 text-green-300',
  tested: 'bg-blue-900 text-blue-300',
  external_source: 'bg-yellow-900 text-yellow-300',
  not_tested: 'bg-gray-700 text-gray-400',
};
const safetyLabels: Record<string, { ar: string; en: string }> = {
  verified: { ar: '✅ موثق', en: '✅ Verified' },
  tested: { ar: '🔵 مجرّب', en: '🔵 Tested' },
  external_source: { ar: '⚠️ خارجي', en: '⚠️ External' },
  not_tested: { ar: '❓ غير مختبر', en: '❓ Untested' },
};

export default async function ModelAppsPage({ params }: Props) {
  const isAr = params.locale === 'ar';
  const [model, apps] = await Promise.all([
    fetchCarModel(params.slug, params.model),
    fetchModelApps(params.slug, params.model),
  ]);
  if (!model) notFound();

  const modelName = isAr ? model.name_ar : (model.name_en ?? model.name_ar);

  return (
    <main className="min-h-screen bg-black text-white" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
          <Link href={`/${params.locale}/brands`} className="hover:text-white">{isAr ? 'الماركات' : 'Brands'}</Link>
          <span>/</span>
          <Link href={`/${params.locale}/brands/${params.slug}`} className="hover:text-white">{model.brand?.name_ar}</Link>
          <span>/</span>
          <Link href={`/${params.locale}/brands/${params.slug}/models/${params.model}`} className="hover:text-white">{modelName}</Link>
          <span>/</span>
          <span className="text-white">{isAr ? 'التطبيقات' : 'Apps'}</span>
        </div>

        <h1 className="text-2xl font-bold mb-1">📱 {isAr ? `تطبيقات ${modelName}` : `${modelName} Apps`}</h1>
        <p className="text-gray-400 text-sm mb-8">{apps.length} {isAr ? 'تطبيق' : 'apps'}</p>

        {apps.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-3">📱</p>
            <p>{isAr ? 'لا توجد تطبيقات بعد' : 'No apps yet'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps.map(app => (
              <Link
                key={app.id}
                href={`/${params.locale}/apps/${app.slug}`}
                className="group bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-2xl p-4 flex gap-4 transition-all"
              >
                {app.icon_url ? (
                  <Image src={app.icon_url} alt={app.title_ar} width={56} height={56} className="rounded-xl flex-shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gray-700 flex-shrink-0 flex items-center justify-center text-2xl">📱</div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">{isAr ? app.title_ar : (app.title_en ?? app.title_ar)}</h3>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {app.version && <span className="text-xs text-gray-400">v{app.version}</span>}
                    {app.safety_status && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${safetyColors[app.safety_status] ?? safetyColors.not_tested}`}>
                        {(isAr ? safetyLabels[app.safety_status]?.ar : safetyLabels[app.safety_status]?.en) ?? app.safety_status}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{app.downloads_count.toLocaleString()} {isAr ? 'تحميل' : 'downloads'}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
