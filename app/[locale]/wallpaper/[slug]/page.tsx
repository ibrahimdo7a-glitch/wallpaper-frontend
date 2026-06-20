import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { wallpaperApi } from '@/lib/api';
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import { WallpaperActions } from '@/components/wallpaper/WallpaperActions';
import { ShareButtons } from '@/components/wallpaper/ShareButtons';
import { TagList } from '@/components/ui/TagList';
import { formatNumber, formatFileSize } from '@/lib/utils';
import { type Locale } from '@/lib/i18n';

type Props = { params: { locale: Locale; slug: string } };

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  try {
    const res = await wallpaperApi.get(slug);
    const w = res.data.data;
    const title = locale === 'ar' ? (w.title_ar || w.title_en || 'خلفية') : (w.title_en || w.title_ar || 'Wallpaper');
    const description = locale === 'ar' ? (w.description_ar || '') : (w.description_en || '');

    return {
      title: `${title} - Wallpaper Platform`,
      description,
      openGraph: {
        title,
        description,
        images: [{ url: w.image_url, width: w.width, height: w.height }],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [w.image_url],
      },
    };
  } catch {
    return { title: 'Wallpaper Not Found' };
  }
}

export default async function WallpaperPage({ params: { locale, slug } }: Props) {
  const t = await getTranslations({ locale, namespace: 'wallpaper' });

  let wallpaper;
  try {
    const res = await wallpaperApi.get(slug);
    wallpaper = res.data.data;
  } catch {
    notFound();
  }

  const title = locale === 'ar'
    ? (wallpaper.title_ar || wallpaper.title_en || '')
    : (wallpaper.title_en || wallpaper.title_ar || '');

  const description = locale === 'ar'
    ? wallpaper.description_ar
    : wallpaper.description_en;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Image */}
        <div className="lg:col-span-2">
          <div className="relative bg-gray-900 rounded-2xl overflow-hidden">
            <Image
              src={wallpaper.image_url}
              alt={title}
              width={wallpaper.width}
              height={wallpaper.height}
              className="w-full h-auto object-contain max-h-[80vh]"
              priority
              unoptimized
            />
          </div>

          {/* Mobile actions */}
          <div className="mt-4 lg:hidden">
            <WallpaperActions wallpaper={wallpaper} locale={locale} />
          </div>

          {/* Description */}
          {description && (
            <div className="mt-6 p-4 bg-gray-900 rounded-xl">
              <p className="text-gray-300 leading-relaxed">{description}</p>
            </div>
          )}

          {/* Tags */}
          {wallpaper.tags && wallpaper.tags.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm text-gray-400 mb-2">{t('tags')}</h3>
              <TagList tags={wallpaper.tags} locale={locale} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {wallpaper.is_free ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300 mt-2">
                {t('free')}
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300 mt-2">
                {t('paid')} - {wallpaper.price} {wallpaper.currency}
              </span>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:block">
            <WallpaperActions wallpaper={wallpaper} locale={locale} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-900 rounded-xl">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">{formatNumber(wallpaper.views_count)}</div>
              <div className="text-xs text-gray-400">{t('views')}</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">{formatNumber(wallpaper.downloads_count)}</div>
              <div className="text-xs text-gray-400">{t('downloads')}</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-red-400">{formatNumber(wallpaper.likes_count)}</div>
              <div className="text-xs text-gray-400">{t('likes')}</div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3 p-4 bg-gray-900 rounded-xl text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">{t('resolution')}</span>
              <span className="text-white font-medium">
                {wallpaper.width} × {wallpaper.height} ({wallpaper.resolution_label})
              </span>
            </div>
            {wallpaper.file_size && (
              <div className="flex justify-between">
                <span className="text-gray-400">{t('size')}</span>
                <span className="text-white">{formatFileSize(wallpaper.file_size)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">النوع</span>
              <span className="text-white">{t(`device_${wallpaper.device_type}`)}</span>
            </div>
          </div>

          {/* Uploader */}
          {wallpaper.uploader && (
            <Link
              href={`/${locale}/u/${wallpaper.uploader.username}`}
              className="flex items-center gap-3 p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
            >
              {wallpaper.uploader.avatar_url ? (
                <Image
                  src={wallpaper.uploader.avatar_url}
                  alt={wallpaper.uploader.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold">
                  {wallpaper.uploader.name[0]}
                </div>
              )}
              <div>
                <div className="text-xs text-gray-400">{t('uploaded_by')}</div>
                <div className="font-semibold text-white">{wallpaper.uploader.name}</div>
                <div className="text-xs text-gray-400">@{wallpaper.uploader.username}</div>
              </div>
            </Link>
          )}

          {/* Category */}
          {wallpaper.category && (
            <div className="p-4 bg-gray-900 rounded-xl">
              <div className="text-xs text-gray-400 mb-1">{t('category')}</div>
              <Link
                href={`/${locale}/categories/${wallpaper.category.slug}`}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                {locale === 'ar' ? wallpaper.category.name_ar : wallpaper.category.name_en}
              </Link>
            </div>
          )}

          {/* Share */}
          <ShareButtons
            wallpaper={wallpaper}
            locale={locale}
            siteUrl={siteUrl}
            title={title}
          />
        </div>
      </div>

      {/* Related Wallpapers */}
      {wallpaper.related && wallpaper.related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-white mb-6">
            {locale === 'ar' ? 'خلفيات مشابهة' : 'Similar Wallpapers'}
          </h2>
          <WallpaperGrid wallpapers={wallpaper.related} locale={locale} />
        </section>
      )}
    </div>
  );
}
