'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { Heart, Download, Eye, Star } from 'lucide-react';
import { type Wallpaper } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import { type Locale } from '@/lib/i18n';

interface WallpaperGridProps {
  wallpapers: Wallpaper[];
  locale: Locale;
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  searchQuery?: string;
}

function WallpaperCard({ wallpaper, locale }: { wallpaper: Wallpaper; locale: Locale }) {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '300px' });
  const [loaded, setLoaded] = useState(false);

  const title = locale === 'ar'
    ? (wallpaper.title_ar || wallpaper.title_en || '')
    : (wallpaper.title_en || wallpaper.title_ar || '');

  const imageUrl = wallpaper.thumbnail_url || wallpaper.image_url;
  const aspectRatio = wallpaper.width && wallpaper.height
    ? Math.min((wallpaper.height / wallpaper.width) * 100, 120)
    : 56.25;

  return (
    <Link
      ref={ref}
      href={`/${locale}/wallpaper/${wallpaper.slug}`}
      className="wallpaper-card group relative bg-gray-900 rounded-2xl overflow-hidden block transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
    >
      <div className="relative bg-gray-800" style={{ paddingBottom: `${aspectRatio}%` }}>
        {/* Skeleton loader */}
        {!loaded && <div className="absolute inset-0 skeleton rounded-2xl" />}

        {inView && (
          <Image
            src={imageUrl}
            alt={title || 'Wallpaper'}
            fill
            className={`object-cover transition-all duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            loading="lazy"
            unoptimized
            onLoad={() => setLoaded(true)}
          />
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

        {/* Info on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          {title && (
            <p className="text-white text-xs font-semibold line-clamp-2 mb-2 leading-tight">{title}</p>
          )}
          <div className="flex items-center gap-3 text-[10px] text-gray-300">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatNumber(wallpaper.views_count)}
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3 text-blue-400" />
              {formatNumber(wallpaper.downloads_count)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-pink-400" />
              {formatNumber(wallpaper.likes_count)}
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {wallpaper.is_featured && (
            <span className="px-1.5 py-0.5 bg-yellow-500/90 backdrop-blur-sm rounded-md text-[10px] font-bold text-black flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 fill-black" />
            </span>
          )}
          {wallpaper.resolution_label && (
            <span className="px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded-md text-[10px] text-white font-medium">
              {wallpaper.resolution_label}
            </span>
          )}
        </div>

        {wallpaper.is_paid && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-md text-[10px] font-bold text-black">
              {wallpaper.price} {wallpaper.currency}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export function WallpaperGrid({ wallpapers, locale, pagination, searchQuery }: WallpaperGridProps) {
  if (wallpapers.length === 0) {
    return (
      <div className="text-center py-24">
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gray-800/50 flex items-center justify-center">
          <span className="text-4xl">🖼️</span>
        </div>
        <p className="text-gray-400 text-lg font-medium">
          {locale === 'ar' ? 'لا توجد خلفيات بعد' : 'No wallpapers found'}
        </p>
        <p className="text-gray-600 text-sm mt-1">
          {locale === 'ar' ? 'جرّب البحث بكلمات أخرى' : 'Try different search terms'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {wallpapers.map((wallpaper) => (
          <WallpaperCard key={wallpaper.id} wallpaper={wallpaper} locale={locale} />
        ))}
      </div>

      {pagination && pagination.last_page > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: Math.min(pagination.last_page, 10) }, (_, i) => i + 1).map((page) => (
            <a
              key={page}
              href={`?${searchQuery ? `q=${encodeURIComponent(searchQuery)}&` : ''}page=${page}`}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                page === pagination.current_page
                  ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              {page}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
