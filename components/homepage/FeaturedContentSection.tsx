'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import type { ApiHomepageSection } from '@/lib/server-api';

interface Props {
  section: ApiHomepageSection;
  isAr: boolean;
  locale: string;
}

const typeConfig: Record<string, { ar: string; en: string; color: string }> = {
  wallpaper: { ar: 'خلفيات', en: 'Wallpapers', color: 'bg-purple-500' },
  app:       { ar: 'تطبيقات', en: 'Apps',      color: 'bg-blue-500'   },
  news:      { ar: 'أخبار',   en: 'News',      color: 'bg-orange-500' },
  tutorial:  { ar: 'شروحات',  en: 'Tutorials', color: 'bg-green-500'  },
  file:      { ar: 'ملفات',   en: 'Files',     color: 'bg-gray-600'   },
};

function itemHref(item: any, locale: string): string {
  if (item.type === 'app')   return `/${locale}/apps/${item.slug}`;
  if (item.type === 'news')  return `/${locale}/news/${item.slug}`;
  if (item.type === 'wallpaper') {
    return item.brand_slug && item.section_slug
      ? `/${locale}/brands/${item.brand_slug}/${item.section_slug}/${item.id}`
      : `/${locale}/brands`;
  }
  return '#';
}

// Bottom-right icon per type (matching the design)
const typeIcon: Record<string, string> = {
  wallpaper: '🖼️',
  app:       '📱',
  news:      '📰',
  tutorial:  '🎓',
  file:      '📁',
};

export function FeaturedContentSection({ section, isAr, locale }: Props) {
  const items: any[] = section.data?.items ?? [];
  if (items.length === 0) return null;

  const scrollRef = useRef<HTMLDivElement>(null);
  const title    = isAr ? section.title_ar : (section.title_en ?? section.title_ar);

  return (
    <section className="py-8 px-4 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`flex items-center justify-between mb-5 ${isAr ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">{title ?? (isAr ? 'الأكثر تميزاً' : 'Featured')}</h2>
          <Link href={`/${locale}/brands`}
            className="text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            {isAr ? 'عرض الكل' : 'View all'}
          </Link>
        </div>

        {/* Horizontal cards */}
        <div ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none' }}>
          {items.map((item: any) => {
            const cfg   = typeConfig[item.type] ?? typeConfig.file;
            const thumb = item.thumbnail_url ?? item.image_url ?? item.icon_url ?? item.cover_image_url;
            const resLabel = item.resolution_label;

            return (
              <Link key={item.id} href={itemHref(item, locale)}
                className="flex-shrink-0 group relative w-52 rounded-2xl overflow-hidden bg-gray-900 block shadow-sm hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="relative h-36 bg-gray-800">
                  {thumb
                    ? <Image src={thumb} alt={item.title_ar} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl">{typeIcon[item.type] ?? '📄'}</div>
                  }
                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Top-left type badge */}
                  <span className={`absolute top-2 start-2 text-white text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                    {isAr ? cfg.ar : cfg.en}
                  </span>

                  {/* Top-right resolution or extra badge */}
                  {resLabel && (
                    <span className="absolute top-2 end-2 text-white text-xs px-2 py-0.5 rounded-full font-bold bg-black/50">
                      {resLabel}
                    </span>
                  )}

                  {/* Bottom-right downloads */}
                  {item.downloads_count > 0 && (
                    <span className="absolute bottom-2 end-2 text-white text-xs bg-black/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                      ⬇️ {item.downloads_count >= 1000 ? `${(item.downloads_count/1000).toFixed(1)}K` : item.downloads_count}
                    </span>
                  )}

                  {/* Bottom-left icon */}
                  <span className="absolute bottom-2 start-2 text-sm">
                    {typeIcon[item.type] ?? '📄'}
                  </span>
                </div>

                {/* Text */}
                <div className="p-3 bg-white dark:bg-gray-900">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {isAr ? item.title_ar : (item.title_en ?? item.title_ar)}
                  </p>
                  {(isAr ? item.description_ar : item.description_en) && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 mt-0.5">
                      {isAr ? item.description_ar : item.description_en}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
