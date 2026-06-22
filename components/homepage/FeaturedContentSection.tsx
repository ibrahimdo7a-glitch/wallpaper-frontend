import Image from 'next/image';
import Link from 'next/link';
import type { ApiHomepageSection } from '@/lib/server-api';

interface Props {
  section: ApiHomepageSection;
  isAr: boolean;
  locale: string;
}

const typeLabel: Record<string, { ar: string; en: string; color: string }> = {
  wallpaper: { ar: 'خلفية', en: 'Wallpaper', color: 'bg-purple-500' },
  app:       { ar: 'تطبيق', en: 'App',       color: 'bg-blue-500'   },
  news:      { ar: 'خبر',   en: 'News',      color: 'bg-orange-500' },
  tutorial:  { ar: 'شرح',   en: 'Tutorial',  color: 'bg-green-500'  },
  file:      { ar: 'ملف',   en: 'File',      color: 'bg-gray-500'   },
};

function itemHref(item: any, locale: string): string {
  if (item.type === 'app') return `/${locale}/apps/${item.slug}`;
  if (item.type === 'news') return `/${locale}/news/${item.slug}`;
  if (item.type === 'wallpaper') return `/${locale}/wallpaper/${item.slug}`;
  return '#';
}

export function FeaturedContentSection({ section, isAr, locale }: Props) {
  const items: any[] = section.data?.items ?? [];
  if (items.length === 0) return null;

  const title    = isAr ? section.title_ar : (section.title_en ?? section.title_ar);
  const subtitle = isAr ? section.subtitle_ar : (section.subtitle_en ?? section.subtitle_ar);
  const isHeroCards = section.layout === 'hero_cards';

  return (
    <section className="py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {title && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            <Link href={`/${locale}/brands`} className="text-xs text-blue-600 hover:underline">
              {isAr ? 'عرض الكل' : 'View all'}
            </Link>
          </div>
        )}

        {isHeroCards ? (
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
            {items.map((item: any) => {
              const label = typeLabel[item.type];
              const thumb = item.thumbnail_url ?? item.image_url ?? item.icon_url ?? item.cover_image_url;
              return (
                <Link key={item.id} href={itemHref(item, locale)}
                  className="flex-shrink-0 group relative w-44 rounded-2xl overflow-hidden bg-gray-900 block">
                  <div className="relative h-64">
                    {thumb
                      ? <Image src={thumb} alt={item.title_ar} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full bg-gray-800 flex items-center justify-center text-4xl">📄</div>
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    {label && (
                      <span className={`absolute top-2 start-2 text-white text-xs px-2 py-0.5 rounded-full ${label.color}`}>
                        {isAr ? label.ar : label.en}
                      </span>
                    )}
                    {item.downloads_count > 0 && (
                      <span className="absolute bottom-2 end-2 text-white text-xs bg-black/50 px-1.5 py-0.5 rounded">
                        ⬇️ {(item.downloads_count / 1000).toFixed(1)}K
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-0 start-0 end-0 p-3">
                    <p className="text-white text-xs font-semibold line-clamp-2">
                      {isAr ? item.title_ar : (item.title_en ?? item.title_ar)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((item: any) => {
              const label = typeLabel[item.type];
              const thumb = item.thumbnail_url ?? item.image_url ?? item.icon_url ?? item.cover_image_url;
              return (
                <Link key={item.id} href={itemHref(item, locale)}
                  className="group bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all block">
                  <div className="relative h-32 bg-gray-100">
                    {thumb
                      ? <Image src={thumb} alt={item.title_ar} fill className="object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-3xl">📄</div>
                    }
                    {label && (
                      <span className={`absolute top-2 start-2 text-white text-xs px-2 py-0.5 rounded-full ${label.color}`}>
                        {isAr ? label.ar : label.en}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {isAr ? item.title_ar : (item.title_en ?? item.title_ar)}
                    </p>
                    {item.downloads_count > 0 && (
                      <p className="text-xs text-gray-400 mt-1">⬇️ {(item.downloads_count / 1000).toFixed(1)}K</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
