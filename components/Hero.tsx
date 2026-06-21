'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Locale } from '@/types';
import { translations } from '@/data/translations';
import type { SiteContent } from '@/lib/server-api';

interface HeroProps {
  locale: Locale;
  siteContent?: SiteContent | null;
}

export function Hero({ locale, siteContent }: HeroProps) {
  const t = translations[locale];
  const router = useRouter();
  const [query, setQuery] = useState('');
  const isRTL = locale === 'ar';

  // Use API content if available, else fallback to static translations
  const title = isRTL
    ? (siteContent?.hero_title_ar || t.hero.title)
    : (siteContent?.hero_title_en || t.hero.title);
  const subtitle = isRTL
    ? (siteContent?.hero_subtitle_ar || t.hero.subtitle)
    : (siteContent?.hero_subtitle_en || t.hero.subtitle);
  const searchPlaceholder = isRTL
    ? (siteContent?.search_placeholder_ar || t.hero.searchPlaceholder)
    : (siteContent?.search_placeholder_en || t.hero.searchPlaceholder);
  const popularTags = isRTL
    ? (siteContent?.popular_tags_ar?.length ? siteContent.popular_tags_ar : t.hero.popularTags)
    : (siteContent?.popular_tags_en?.length ? siteContent.popular_tags_en : t.hero.popularTags);
  const features = [
    { icon: '🚗', label: isRTL ? (siteContent?.feature_car_ar || t.hero.features[0]?.label) : (siteContent?.feature_car_en || t.hero.features[0]?.label) },
    { icon: '🖼️', label: isRTL ? (siteContent?.feature_quality_ar || t.hero.features[1]?.label) : (siteContent?.feature_quality_en || t.hero.features[1]?.label) },
    { icon: '⚡', label: isRTL ? (siteContent?.feature_fast_ar || t.hero.features[2]?.label) : (siteContent?.feature_fast_en || t.hero.features[2]?.label) },
  ];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/${locale}/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <section className="relative overflow-hidden bg-[#0d0d0d] text-white min-h-[340px] flex items-center">
      {/* Gradient overlay — left fade */}
      <div
        className={`absolute inset-0 z-10 pointer-events-none ${
          isRTL
            ? 'bg-gradient-to-l from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent'
            : 'bg-gradient-to-r from-[#0d0d0d] via-[#0d0d0d]/80 to-transparent'
        }`}
      />

      {/* Car image placeholder — replace src with real image */}
      <div
        className={`absolute inset-0 z-0 ${isRTL ? 'left-0' : 'right-0'}`}
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #533483 100%)',
        }}
      >
        {/* Uncomment and replace with real hero image:
        <Image src="/images/hero-leopard.jpg" alt="BYD Leopard" fill className="object-cover object-center" priority />
        */}
      </div>

      {/* Content */}
      <div className={`relative z-20 max-w-7xl mx-auto px-4 sm:px-6 w-full py-14 ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className={`max-w-lg ${isRTL ? 'mr-0' : 'ml-0'}`}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-3 tracking-tight">
            {title}
          </h1>
          <p className="text-gray-300 text-base mb-7 leading-relaxed">
            {subtitle}
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative mb-5">
            <div className="relative flex items-center">
              <span className={`absolute ${isRTL ? 'right-4' : 'left-4'} text-gray-400 pointer-events-none`}>
                🔍
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className={`w-full bg-white text-gray-900 placeholder-gray-400 rounded-full py-3.5 text-sm font-medium outline-none focus:ring-2 focus:ring-white/30 ${
                  isRTL ? 'pr-12 pl-28 text-right' : 'pl-12 pr-28'
                }`}
              />
              <button
                type="submit"
                className={`absolute ${isRTL ? 'left-1.5' : 'right-1.5'} bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-700 transition-colors`}
              >
                {t.search}
              </button>
            </div>
          </form>

          {/* Popular tags */}
          <div className={`flex flex-wrap items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
            <span className="text-gray-400 text-xs">{t.hero.popular}</span>
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => router.push(`/${locale}/search?q=${encodeURIComponent(tag)}`)}
                className="px-3 py-1 rounded-full border border-white/20 text-white text-xs hover:bg-white/10 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Feature badges */}
        <div className={`flex flex-wrap gap-4 mt-8 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
          {features.map((f) => f.label && (
            <div key={f.label} className="flex items-center gap-1.5 text-gray-300 text-xs font-medium">
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
