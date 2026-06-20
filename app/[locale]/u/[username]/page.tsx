import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { uploaderApi } from '@/lib/api';
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import { formatNumber } from '@/lib/utils';
import { type Locale } from '@/lib/i18n';

type Props = { params: { locale: Locale; username: string } };

export async function generateMetadata({ params: { locale, username } }: Props): Promise<Metadata> {
  try {
    const res = await uploaderApi.get(username);
    const uploader = res.data.data;
    const bio = locale === 'ar' ? uploader.bio_ar : uploader.bio_en;

    return {
      title: `${uploader.name} (@${uploader.username}) - Wallpaper Platform`,
      description: bio || `خلفيات ${uploader.name} على منصة الخلفيات`,
    };
  } catch {
    return { title: 'Uploader Not Found' };
  }
}

export default async function UploaderPage({ params: { locale, username } }: Props) {
  const t = await getTranslations({ locale, namespace: 'uploader' });

  let uploader;
  let wallpapers;

  try {
    const [uploaderRes, wallpapersRes] = await Promise.all([
      uploaderApi.get(username),
      uploaderApi.wallpapers(username),
    ]);
    uploader = uploaderRes.data.data;
    wallpapers = wallpapersRes.data;
  } catch {
    notFound();
  }

  const bio = locale === 'ar' ? uploader.bio_ar : uploader.bio_en;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-12 p-6 bg-gray-900 rounded-2xl">
        {uploader.avatar_url ? (
          <Image
            src={uploader.avatar_url}
            alt={uploader.name}
            width={96}
            height={96}
            className="w-24 h-24 rounded-full object-cover border-4 border-gray-700"
            unoptimized
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-4xl font-bold text-white">
            {uploader.name[0]}
          </div>
        )}

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">{uploader.name}</h1>
          <p className="text-gray-400 text-lg">@{uploader.username}</p>
          {bio && <p className="text-gray-300 mt-2">{bio}</p>}

          <div className="flex flex-wrap gap-4 mt-4">
            {uploader.website && (
              <a href={uploader.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm">
                🌐 {uploader.website}
              </a>
            )}
            {uploader.twitter && (
              <a href={`https://twitter.com/${uploader.twitter}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm">
                🐦 @{uploader.twitter}
              </a>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-blue-400">{formatNumber(uploader.stats.wallpapers_count)}</div>
            <div className="text-xs text-gray-400">{t('wallpapers')}</div>
          </div>
          <div className="text-center p-3 bg-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-green-400">{formatNumber(uploader.stats.downloads_count)}</div>
            <div className="text-xs text-gray-400">{t('total_downloads')}</div>
          </div>
          <div className="text-center p-3 bg-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-red-400">{formatNumber(uploader.stats.likes_count)}</div>
            <div className="text-xs text-gray-400">{t('total_likes')}</div>
          </div>
          <div className="text-center p-3 bg-gray-800 rounded-xl">
            <div className="text-2xl font-bold text-purple-400">{formatNumber(uploader.stats.views_count)}</div>
            <div className="text-xs text-gray-400">{t('total_views')}</div>
          </div>
        </div>
      </div>

      {/* Wallpapers */}
      <h2 className="text-xl font-bold text-white mb-6">{t('all_wallpapers')}</h2>
      <WallpaperGrid
        wallpapers={wallpapers.data}
        locale={locale}
        pagination={wallpapers.meta}
      />
    </div>
  );
}
