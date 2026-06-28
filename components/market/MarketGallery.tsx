'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

/**
 * Listing image gallery:
 * - click a thumbnail → it swaps into the big slot
 * - click the big image → opens a clean fullscreen lightbox with prev/next arrows
 */
export function MarketGallery({ images, title, isAr }: { images: string[]; title: string; isAr: boolean }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const n = images.length;
  const prev = useCallback(() => setActive((i) => (i - 1 + n) % n), [n]);
  const next = useCallback(() => setActive((i) => (i + 1) % n), [n]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, prev, next]);

  if (n === 0) {
    return <div className="aspect-[4/3] rounded-2xl bg-white/5 flex items-center justify-center text-5xl text-white/10">🛒</div>;
  }

  return (
    <div className="space-y-2">
      {/* Main image — click to open the lightbox */}
      <button type="button" onClick={() => setLightbox(true)}
        className="relative block w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white/5 cursor-zoom-in group">
        <Image src={images[active]} alt={title} fill className="object-contain" priority />
        <span className="absolute bottom-2 end-2 text-[11px] bg-black/60 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
          {isAr ? '🔍 اضغط للتكبير' : '🔍 Click to zoom'}
        </span>
      </button>

      {/* Thumbnails — click to swap into the big slot */}
      {n > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button type="button" key={i} onClick={() => setActive(i)}
              className={`relative aspect-square rounded-lg overflow-hidden bg-white/5 transition-all ${i === active ? 'ring-2 ring-sky-500' : 'opacity-60 hover:opacity-100'}`}>
              <Image src={img} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center select-none" onClick={() => setLightbox(false)}>
          <button type="button" aria-label="close" onClick={(e) => { e.stopPropagation(); setLightbox(false); }}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl flex items-center justify-center">✕</button>

          {n > 1 && (
            <>
              <button type="button" aria-label="previous" onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-3xl flex items-center justify-center">‹</button>
              <button type="button" aria-label="next" onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white text-3xl flex items-center justify-center">›</button>
            </>
          )}

          <div className="relative w-[92vw] h-[88vh]" onClick={(e) => e.stopPropagation()}>
            <Image src={images[active]} alt={title} fill className="object-contain" />
          </div>

          {n > 1 && (
            <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80 bg-black/50 px-3 py-1 rounded-full">
              {active + 1} / {n}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
