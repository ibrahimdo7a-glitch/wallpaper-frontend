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

export function BrandsSection({ section, isAr, locale }: Props) {
  const items = section.data?.items ?? [];
  if (items.length === 0) return null;

  const scrollRef = useRef<HTMLDivElement>(null);
  const title = isAr ? section.title_ar : (section.title_en ?? section.title_ar);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="py-8 px-4 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`flex items-center justify-between mb-5 ${isAr ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-base font-bold text-gray-900">{title ?? (isAr ? 'الماركات' : 'Brands')}</h2>
          <Link href={`/${locale}/brands`}
            className="text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1 hover:bg-gray-50 transition-colors">
            {isAr ? 'عرض جميع الماركات' : 'View all brands'}
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Left arrow */}
          <button onClick={() => scroll(isAr ? 'right' : 'left')}
            className="absolute start-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 -ms-4">
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isAr ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
            </svg>
          </button>

          {/* Scrollable list */}
          <div ref={scrollRef}
            className="flex gap-4 overflow-x-auto px-6 pb-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {items.map((brand: any) => (
              <Link key={brand.id} href={`/${locale}/brands/${brand.slug}`}
                className="flex-shrink-0 group flex flex-col items-center gap-2 w-24 py-3 px-2 rounded-2xl hover:bg-gray-50 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden p-1.5">
                  {brand.logo_url
                    ? <Image src={brand.logo_url} alt={brand.name_ar} width={48} height={48} className="object-contain" />
                    : <span className="text-xl font-bold text-gray-400">{brand.name_ar.charAt(0)}</span>}
                </div>
                <span className="text-xs font-semibold text-gray-800 text-center leading-tight">
                  {isAr ? brand.name_ar : (brand.name_en ?? brand.name_ar)}
                </span>
                {brand.models_count > 0 && (
                  <span className="text-xs text-gray-400">{brand.models_count} {isAr ? 'موديل' : 'models'}</span>
                )}
              </Link>
            ))}
          </div>

          {/* Right arrow */}
          <button onClick={() => scroll(isAr ? 'left' : 'right')}
            className="absolute end-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-sm flex items-center justify-center hover:bg-gray-50 -me-4">
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isAr ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
