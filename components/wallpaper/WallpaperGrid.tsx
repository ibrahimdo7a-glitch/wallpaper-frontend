'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { Heart, Download, Eye } from 'lucide-react';
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
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '200px' });
  const title = locale === 'ar'
    ? (wallpaper.title_ar || wallpaper.title_en || '')
    : (wallpaper.title_en || wallpaper.title_ar || '');

  const imageUrl = wallpaper.thumbnail_url || wallpaper.image_url;

  return (
    <Link
      ref={ref}
      href={`/${locale}/wallpaper/${wallpaper.slug}`}
      className="group relative bg-gray-900 rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
    >
      <div
        className="relative bg-gray-800"
        style={{ paddingBottom: `${Math.min((wallpaper.height / wallpaper.width) * 100, 100)}%` }}
      >
        {inView && (
          <Image
            src={imageUrl}
            alt={title || 'Wallpaper'}
            fill
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading="lazy"
            unoptimized
          />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="absolute bottom-0 left-0 right-0 p-3">
            {title && (
              <p className="text-white text-sm font-medium line-clamp-2 mb-2">{title}</p>
            )}
            <div className="flex items-center gap-3 text-xs text-gray-300">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatNumber(wallpaper.views_count)}
              </span>
              <span className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                {formatNumber(wallpaper.downloads_count)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {formatNumber(wallpaper.likes_count)}
              </span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {wallpaper.is_featured && (
            <span className="px-1.5 py-0.5 bg-yellow-500 rounded text-xs font-bold text-black">★</span>
          )}
          {wallpaper.resolution_label && (
            <span className="px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-xs text-white">
              {wallpaper.resolution_label}
            </span>
          )}
        </div>

        {wallpaper.is_paid && (
          <div className="absolute top-2 right-2">
            <span className="px-1.5 py-0.5 bg-yellow-500 rounded text-xs font-bold text-black">
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
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🖼️</div>
        <p className="text-gray-400 text-lg">
          {locale === 'ar' ? 'لا توجد خلفيات' : 'No wallpapers found'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {wallpapers.map((wallpaper) => (
          <WallpaperCard key={wallpaper.id} wallpaper={wallpaper} locale={locale} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: Math.min(pagination.last_page, 10) }, (_, i) => i + 1).map((page) => (
            <a
              key={page}
              href={`?${searchQuery ? `q=${encodeURIComponent(searchQuery)}&` : ''}page=${page}`}
              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-colors ${
                page === pagination.current_page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
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
