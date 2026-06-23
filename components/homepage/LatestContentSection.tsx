import Image from 'next/image';
import Link from 'next/link';
import type { ApiHomepageSection } from '@/lib/server-api';

interface Props {
  section: ApiHomepageSection;
  isAr: boolean;
  locale: string;
}

export function LatestContentSection({ section, isAr, locale }: Props) {
  const items: any[] = section.data?.items ?? [];
  if (items.length === 0) return null;

  const title = isAr ? section.title_ar : (section.title_en ?? section.title_ar);

  const href = (item: any): string =>
    item.brand_slug && item.section_slug
      ? `/${locale}/brands/${item.brand_slug}/${item.section_slug}/${item.id}`
      : '#';

  return (
    <section className="py-8 px-4 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`flex items-center justify-between mb-5 ${isAr ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-base font-bold text-gray-900">
            🆕 {title ?? (isAr ? 'آخر الخلفيات المضافة' : 'Latest Wallpapers')}
          </h2>
          <Link href={`/${locale}/brands`}
            className="text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1 hover:bg-gray-50 transition-colors">
            {isAr ? 'عرض الكل' : 'View all'}
          </Link>
        </div>

        {/* Horizontal cards */}
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {items.map((item: any) => {
            const thumb = item.thumbnail_url ?? item.image_url;
            return (
              <Link key={item.id} href={href(item)}
                className="flex-shrink-0 group relative w-40 rounded-2xl overflow-hidden bg-gray-900 block shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-56 bg-gray-800">
                  {thumb
                    ? <Image src={thumb} alt={item.title_ar} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl">🖼️</div>
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <span className="absolute top-2 start-2 text-white text-xs px-2 py-0.5 rounded-full font-medium bg-purple-500">
                    {isAr ? 'خلفية' : 'Wallpaper'}
                  </span>
                  {item.resolution_label && (
                    <span className="absolute top-2 end-2 text-white text-xs px-2 py-0.5 rounded-full font-bold bg-black/50">
                      {item.resolution_label}
                    </span>
                  )}
                  {item.downloads_count > 0 && (
                    <span className="absolute bottom-2 end-2 text-white text-xs bg-black/50 px-1.5 py-0.5 rounded">
                      ⬇️ {item.downloads_count >= 1000 ? `${(item.downloads_count / 1000).toFixed(1)}K` : item.downloads_count}
                    </span>
                  )}
                </div>
                <div className="p-2.5 bg-white">
                  <p className="text-xs font-semibold text-gray-900 line-clamp-1">
                    {isAr ? item.title_ar : (item.title_en ?? item.title_ar)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
