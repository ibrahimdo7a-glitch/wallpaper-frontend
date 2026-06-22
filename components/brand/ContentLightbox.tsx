'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import type { ApiContentItem } from '@/lib/server-api';

interface Props {
  items: ApiContentItem[];
  isAr: boolean;
  layout: 'gallery' | 'grid' | 'cards';
}

export function ContentLightbox({ items, isAr, layout }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const next  = useCallback(() => setActiveIndex(i => (i === null ? null : (i + 1) % items.length)), [items.length]);
  const prev  = useCallback(() => setActiveIndex(i => (i === null ? null : (i - 1 + items.length) % items.length)), [items.length]);

  // Keyboard navigation
  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') isAr ? prev() : next();
      if (e.key === 'ArrowLeft')  isAr ? next() : prev();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [activeIndex, close, next, prev, isAr]);

  const active = activeIndex !== null ? items[activeIndex] : null;

  const title = (item: ApiContentItem) => isAr ? item.title_ar : (item.title_en ?? item.title_ar);

  // ─── Thumbnail grid ───────────────────────────────────────────────────────
  const containerClass = layout === 'gallery'
    ? 'columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3'
    : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4';

  return (
    <>
      <div className={containerClass}>
        {items.map((item, i) => {
          const thumb = item.thumbnail_url ?? item.image_url;
          if (!thumb) return null;
          return (
            <button
              key={item.id}
              onClick={() => setActiveIndex(i)}
              className={`group relative block w-full overflow-hidden bg-gray-900 cursor-zoom-in ${layout === 'gallery' ? 'break-inside-avoid rounded-xl' : 'rounded-2xl border border-gray-800 hover:border-gray-600 transition-all'}`}
            >
              <Image
                src={thumb}
                alt={title(item)}
                width={400}
                height={layout === 'gallery' ? 600 : 400}
                className={`w-full ${layout === 'gallery' ? 'object-cover' : 'h-36 object-cover'} group-hover:scale-105 transition-transform duration-300`}
              />
              {/* hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-2xl">🔍</span>
              </div>
              {item.is_pinned && <span className="absolute top-1 start-1 text-xs bg-yellow-500 text-black px-1.5 rounded">📌</span>}
            </button>
          );
        })}
      </div>

      {/* ─── Lightbox overlay ─── */}
      {active && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={close}
          dir={isAr ? 'rtl' : 'ltr'}
        >
          {/* Close */}
          <button onClick={close}
            className="absolute top-4 end-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center z-10">
            ✕
          </button>

          {/* Prev */}
          {items.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); isAr ? next() : prev(); }}
              className="absolute start-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center z-10">
              ‹
            </button>
          )}

          {/* Image + info */}
          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <Image
                src={active.image_url ?? active.thumbnail_url ?? ''}
                alt={title(active)}
                width={1080}
                height={1920}
                className="max-h-[75vh] w-auto object-contain rounded-xl"
              />
            </div>

            <div className="flex items-center gap-4 flex-wrap justify-center">
              <div className="text-center">
                <p className="text-white font-medium">{title(active)}</p>
                <div className="flex gap-3 justify-center text-xs text-gray-400 mt-1">
                  {active.metadata?.resolution && <span>{active.metadata.resolution}</span>}
                  {active.downloads_count > 0 && <span>⬇️ {active.downloads_count.toLocaleString()}</span>}
                </div>
              </div>
              <a
                href={active.file_url ?? active.image_url ?? '#'}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-black font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                ⬇️ {isAr ? 'تحميل' : 'Download'}
              </a>
            </div>
          </div>

          {/* Next */}
          {items.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); isAr ? prev() : next(); }}
              className="absolute end-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white text-2xl flex items-center justify-center z-10">
              ›
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-4 start-1/2 -translate-x-1/2 text-white/60 text-sm">
            {activeIndex! + 1} / {items.length}
          </div>
        </div>
      )}
    </>
  );
}
