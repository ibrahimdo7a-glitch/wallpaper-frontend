import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchCarModel, fetchModelFiles } from '@/lib/server-api';
import { type Locale } from '@/lib/i18n';

type Props = { params: { locale: Locale; slug: string; model: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const model = await fetchCarModel(params.slug, params.model);
  if (!model) return { title: 'Not Found' };
  const n = params.locale === 'ar' ? model.name_ar : (model.name_en ?? model.name_ar);
  return { title: `ملفات ${n} | QEV` };
}

const fileIcons: Record<string, string> = {
  PDF: '📄', APK: '📱', ZIP: '🗜️', RAR: '🗜️', IMG: '💾', EXE: '⚙️', DOC: '📝', DOCX: '📝',
};

export default async function ModelFilesPage({ params }: Props) {
  const isAr = params.locale === 'ar';
  const [model, files] = await Promise.all([
    fetchCarModel(params.slug, params.model),
    fetchModelFiles(params.slug, params.model),
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
          <span className="text-white">{isAr ? 'الملفات' : 'Files'}</span>
        </div>

        <h1 className="text-2xl font-bold mb-1">📁 {isAr ? `ملفات ${modelName}` : `${modelName} Files`}</h1>
        <p className="text-gray-400 text-sm mb-8">{files.length} {isAr ? 'ملف' : 'files'}</p>

        {files.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-3">📁</p>
            <p>{isAr ? 'لا توجد ملفات بعد' : 'No files yet'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((f: any) => (
              <div
                key={f.id}
                className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl p-4 flex gap-4 items-center transition-all"
              >
                <div className="text-3xl flex-shrink-0">
                  {fileIcons[f.file_type?.toUpperCase()] ?? '📄'}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{isAr ? f.title_ar : (f.title_en ?? f.title_ar)}</h3>
                  {f.description_ar && (
                    <p className="text-sm text-gray-400 line-clamp-1 mt-0.5">{isAr ? f.description_ar : (f.description_en ?? f.description_ar)}</p>
                  )}
                  <div className="flex gap-3 mt-1.5 text-xs text-gray-500">
                    {f.file_type && <span className="uppercase font-mono">{f.file_type}</span>}
                    {f.version && <span>v{f.version}</span>}
                    {f.file_size_label && <span>{f.file_size_label}</span>}
                    <span>⬇️ {f.downloads_count?.toLocaleString() ?? 0}</span>
                  </div>
                </div>
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL ?? 'https://api.qev.app'}/api/v1/brands/${params.slug}/models/${params.model}/files/${f.id}/download`}
                  className="flex-shrink-0 bg-white text-black text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors"
                  download
                >
                  {isAr ? 'تحميل' : 'Download'}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
