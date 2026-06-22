import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchCarModel, fetchModelTutorials } from '@/lib/server-api';
import { type Locale } from '@/lib/i18n';

type Props = { params: { locale: Locale; slug: string; model: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const model = await fetchCarModel(params.slug, params.model);
  if (!model) return { title: 'Not Found' };
  const n = params.locale === 'ar' ? model.name_ar : (model.name_en ?? model.name_ar);
  return { title: `شروحات ${n} | QEV` };
}

const difficultyLabel: Record<string, { ar: string; en: string; color: string }> = {
  beginner:     { ar: 'مبتدئ', en: 'Beginner', color: 'bg-green-900 text-green-300' },
  intermediate: { ar: 'متوسط', en: 'Intermediate', color: 'bg-yellow-900 text-yellow-300' },
  advanced:     { ar: 'متقدم', en: 'Advanced', color: 'bg-red-900 text-red-300' },
};

export default async function ModelTutorialsPage({ params }: Props) {
  const isAr = params.locale === 'ar';
  const [model, tutorials] = await Promise.all([
    fetchCarModel(params.slug, params.model),
    fetchModelTutorials(params.slug, params.model),
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
          <span className="text-white">{isAr ? 'الشروحات' : 'Tutorials'}</span>
        </div>

        <h1 className="text-2xl font-bold mb-1">🎓 {isAr ? `شروحات ${modelName}` : `${modelName} Tutorials`}</h1>
        <p className="text-gray-400 text-sm mb-8">{tutorials.length} {isAr ? 'شرح' : 'tutorials'}</p>

        {tutorials.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-3">🎓</p>
            <p>{isAr ? 'لا توجد شروحات بعد' : 'No tutorials yet'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tutorials.map((t: any) => (
              <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-all">
                {t.cover_image_url && (
                  <div className="relative h-44 overflow-hidden">
                    <Image src={t.cover_image_url} alt={t.title_ar} fill className="object-cover" />
                    {t.video_url && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center text-xl">▶️</div>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {t.difficulty && difficultyLabel[t.difficulty] && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyLabel[t.difficulty].color}`}>
                        {isAr ? difficultyLabel[t.difficulty].ar : difficultyLabel[t.difficulty].en}
                      </span>
                    )}
                    {t.duration_label && <span className="text-xs text-gray-500">⏱ {t.duration_label}</span>}
                  </div>
                  <h3 className="font-semibold line-clamp-2">{isAr ? t.title_ar : (t.title_en ?? t.title_ar)}</h3>
                  {t.summary_ar && (
                    <p className="text-sm text-gray-400 line-clamp-2 mt-1">{isAr ? t.summary_ar : (t.summary_en ?? t.summary_ar)}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">👁 {t.views_count?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
