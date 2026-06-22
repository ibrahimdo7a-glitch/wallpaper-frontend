import Image from 'next/image';
import Link from 'next/link';
import type { ApiContentItem } from '@/lib/server-api';

interface Props {
  items: ApiContentItem[];
  isAr: boolean;
  layout: 'gallery' | 'grid' | 'cards';
  locale: string;
  brandSlug: string;
  sectionSlug: string;
  modelSlug?: string;
}

export function ContentImageGrid({ items, isAr, layout, locale, brandSlug, sectionSlug }: Props) {
  // Detail page is keyed by content id and resolves regardless of model context.
  const detailHref = (id: number) => `/${locale}/brands/${brandSlug}/${sectionSlug}/${id}`;

  const title = (item: ApiContentItem) => isAr ? item.title_ar : (item.title_en ?? item.title_ar);

  // ─── Gallery (masonry) ──────────────────────────────────────────────────────
  if (layout === 'gallery') {
    return (
      <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
        {items.map(item => {
          const thumb = item.thumbnail_url ?? item.image_url;
          if (!thumb) return null;
          return (
            <Link key={item.id} href={detailHref(item.id)}
              className="group relative block break-inside-avoid rounded-xl overflow-hidden bg-gray-900">
              <Image src={thumb} alt={title(item)} width={400} height={600}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              {item.is_pinned && <span className="absolute top-1 start-1 text-xs bg-yellow-500 text-black px-1.5 rounded">📌</span>}
              {item.downloads_count > 0 && (
                <span className="absolute bottom-1 end-1 text-xs text-white bg-black/50 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  ⬇️ {item.downloads_count.toLocaleString()}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    );
  }

  // ─── Grid / Cards ───────────────────────────────────────────────────────────
  const gridCols = layout === 'cards'
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
    : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4';

  return (
    <div className={gridCols}>
      {items.map(item => {
        const thumb = item.image_url ?? item.thumbnail_url;
        return (
          <Link key={item.id} href={detailHref(item.id)}
            className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-600 transition-all">
            {thumb && (
              <div className={`relative ${layout === 'cards' ? 'h-44' : 'h-36'} overflow-hidden`}>
                <Image src={thumb} alt={title(item)} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                {item.is_featured && <span className="absolute top-2 end-2 text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full">⭐</span>}
                {item.is_pinned && <span className="absolute top-2 start-2 text-xs bg-yellow-500 text-black px-1.5 rounded">📌</span>}
              </div>
            )}
            <div className="p-3">
              <h3 className="font-medium text-sm line-clamp-2">{title(item)}</h3>
              <div className="flex gap-3 mt-1 text-xs text-gray-500">
                {item.downloads_count > 0 && <span>⬇️ {item.downloads_count.toLocaleString()}</span>}
                {item.views_count > 0 && <span>👁 {item.views_count.toLocaleString()}</span>}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
