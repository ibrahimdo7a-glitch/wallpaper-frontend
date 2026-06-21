import Link from 'next/link';
import Image from 'next/image';
import { type Wallpaper, type Locale } from '@/types';
import { formatDownloads } from '@/data/wallpapers';

interface WallpaperCardProps {
  wallpaper: Wallpaper;
  locale: Locale;
}

export function WallpaperCard({ wallpaper, locale }: WallpaperCardProps) {
  const title = locale === 'ar' ? wallpaper.titleAr : wallpaper.titleEn;

  return (
    <Link
      href={`/${locale}/wallpaper/${wallpaper.slug}`}
      className="group relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 aspect-video cursor-pointer block"
    >
      {/* Image / gradient background */}
      {wallpaper.imageUrl ? (
        <Image
          src={wallpaper.imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
          loading="lazy"
          unoptimized
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${wallpaper.gradient} transition-transform duration-300 group-hover:scale-105`} />
      )}

      {/* Top badges */}
      <div className="absolute top-2.5 flex items-center gap-1.5 w-full px-2.5">
        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
          📥 {formatDownloads(wallpaper.downloads)}
        </div>
        {wallpaper.is4K && (
          <div className="ms-auto bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            4K
          </div>
        )}
      </div>

      {/* Bottom: title + download button */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2.5 pt-8">
        <div className="flex items-end justify-between gap-2">
          <p className="text-white text-xs font-semibold leading-tight line-clamp-2 flex-1">{title}</p>
          <button
            className="shrink-0 w-7 h-7 rounded-full bg-white text-gray-900 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
            aria-label="Download"
          >
            <span className="text-xs">↓</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
