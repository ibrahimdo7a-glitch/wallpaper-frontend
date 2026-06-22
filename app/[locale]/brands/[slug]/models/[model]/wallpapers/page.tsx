import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchCarModel, fetchModelWallpapers } from '@/lib/server-api';
import { type Locale } from '@/lib/i18n';

type Props = { params: { locale: Locale; slug: string; model: string }; searchParams: { page?: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const model = await fetchCarModel(params.slug, params.model);
  if (!model) return { title: 'Not Found' };
  const n = params.locale === 'ar' ? model.name_ar : (model.name_en ?? model.name_ar);
  return { title: `خلفيات ${n} | QEV`, description: `تحميل خلفيات ${n} بجودة عالية` };
}

export default async function ModelWallpapersPage({ params, searchParams }: Props) {
  const isAr = params.locale === 'ar';
  const page = Number(searchParams.page ?? 1);
  const [model, { data: wallpapers, meta }] = await Promise.all([
    fetchCarModel(params.slug, params.model),
    fetchModelWallpapers(params.slug, params.model, page),
  ]);
  if (!model) notFound();

  const modelName = isAr ? model.name_ar : (model.name_en ?? model.name_ar);

  return (
    <main className="min-h-screen bg-black text-white" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
          <Link href={`/${params.locale}/brands`} className="hover:text-white">{isAr ? 'الماركات' : 'Brands'}</Link>
          <span>/</span>
          <Link href={`/${params.locale}/brands/${params.slug}`} className="hover:text-white">{model.brand?.name_ar}</Link>
          <span>/</span>
          <Link href={`/${params.locale}/brands/${params.slug}/models/${params.model}`} className="hover:text-white">{modelName}</Link>
          <span>/</span>
          <span className="text-white">{isAr ? 'الخلفيات' : 'Wallpapers'}</span>
        </div>

        <h1 className="text-2xl font-bold mb-1">🖼️ {isAr ? `خلفيات ${modelName}` : `${modelName} Wallpapers`}</h1>
        <p className="text-gray-400 text-sm mb-8">{meta.total} {isAr ? 'خلفية' : 'wallpapers'}</p>

        {wallpapers.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-3">🖼️</p>
            <p>{isAr ? 'لا توجد خلفيات بعد' : 'No wallpapers yet'}</p>
          </div>
        ) : (
          <>
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 space-y-3">
              {wallpapers.map(w => (
                <Link key={w.id} href={`/${params.locale}/wallpaper/${w.slug}`} className="block break-inside-avoid rounded-xl overflow-hidden bg-gray-900 hover:opacity-90 transition-opacity">
                  {(w.thumbnail_url ?? w.image_url) ? (
                    <Image src={(w.thumbnail_url ?? w.image_url)!} alt={w.title_ar} width={300} height={500} className="w-full object-cover" />
                  ) : (
                    <div className="aspect-[9/16] bg-gray-800 flex items-center justify-center text-gray-600">🖼️</div>
                  )}
                </Link>
              ))}
            </div>

            {meta.last_page > 1 && (
              <div className="flex justify-center gap-2 mt-10 flex-wrap">
                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                  <Link
                    key={p}
                    href={`/${params.locale}/brands/${params.slug}/models/${params.model}/wallpapers?page=${p}`}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm ${p === page ? 'bg-white text-black font-bold' : 'bg-gray-800 hover:bg-gray-700'}`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
