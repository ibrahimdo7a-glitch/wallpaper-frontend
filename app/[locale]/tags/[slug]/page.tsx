import type { Metadata } from 'next';
import { wallpaperApi } from '@/lib/api';
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import { type Locale } from '@/lib/i18n';

type Props = { params: { locale: Locale; slug: string }; searchParams: { page?: string } };

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  return {
    title: `#${slug} - Wallpaper Platform`,
  };
}

export default async function TagPage({ params: { locale, slug }, searchParams }: Props) {
  const isAr = locale === 'ar';
  const page = parseInt(searchParams.page || '1');

  let wallpapers = null;
  try {
    const res = await wallpaperApi.list({ tag: slug, page, per_page: 30 });
    wallpapers = res.data;
  } catch {}

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold text-white mb-8">#{slug}</h1>
      {wallpapers ? (
        <WallpaperGrid wallpapers={wallpapers.data} locale={locale} pagination={wallpapers.meta} />
      ) : (
        <div className="text-center py-20 text-gray-400">
          {isAr ? 'لا توجد خلفيات بهذا الوسم' : 'No wallpapers with this tag'}
        </div>
      )}
    </div>
  );
}
