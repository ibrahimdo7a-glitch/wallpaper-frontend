import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchWallpaperFacets, fetchWallpaperGallery, type WpCard, type WpFacet } from '@/lib/server-api';
import { type Locale } from '@/lib/i18n';
import { SITE_URL, OG_IMAGE } from '@/lib/seo';

export const revalidate = 60;

type SP = { model?: string; brand?: string; country?: string; section?: string; sort?: string; page?: string };
type Props = { params: { locale: Locale }; searchParams: SP };

export async function generateMetadata({ params: { locale }, searchParams }: Props): Promise<Metadata> {
  const { config } = await fetchWallpaperFacets();
  const isAr = locale === 'ar';
  let title = isAr ? config.title_ar : config.title_en;
  if (searchParams.country) title = isAr ? `${title} — ${searchParams.country}` : `${title} — ${searchParams.country}`;
  const description = isAr ? config.subtitle_ar : config.subtitle_en;
  return {
    title,
    description,
    alternates: { canonical: `/${locale}/wallpapers`, languages: { ar: '/ar/wallpapers', en: '/en/wallpapers' } },
    openGraph: { type: 'website', title, description, url: `${SITE_URL}/${locale}/wallpapers`, images: [{ url: OG_IMAGE, width: 1200, height: 630 }] },
  };
}

export default async function WallpapersPage({ params: { locale }, searchParams }: Props) {
  const isAr = locale === 'ar';
  const [{ config, facets, featured }, { data, meta }] = await Promise.all([
    fetchWallpaperFacets(),
    fetchWallpaperGallery({
      model: searchParams.model, brand: searchParams.brand, country: searchParams.country,
      section: searchParams.section, sort: searchParams.sort, page: Math.max(1, Number(searchParams.page ?? 1)),
    }),
  ]);

  if (!config?.enabled) notFound();

  const page = Math.max(1, Number(meta?.current_page ?? 1));

  const buildHref = (over: Record<string, string | undefined>) => {
    const params: Record<string, string | undefined> = {
      model: searchParams.model, country: searchParams.country, section: searchParams.section,
      brand: searchParams.brand, sort: searchParams.sort, ...over,
    };
    const qs = Object.entries(params).filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`).join('&');
    return `/${locale}/wallpapers${qs ? `?${qs}` : ''}`;
  };
  const clearAll = { model: undefined, country: undefined, section: undefined, brand: undefined, page: undefined };
  const chipHref = (f: WpFacet) => buildHref({ ...clearAll, [f.key]: f.value });
  const isChipActive = (f: WpFacet) => (searchParams as any)[f.key] === f.value;
  const noFilter = !searchParams.model && !searchParams.country && !searchParams.section && !searchParams.brand;

  const groups: { label: string; items: WpFacet[] }[] = [
    { label: isAr ? 'حسب الموديل' : 'By model', items: facets.models ?? [] },
    { label: isAr ? 'حسب الدولة' : 'By country', items: facets.countries ?? [] },
    { label: isAr ? 'حسب القسم' : 'By section', items: facets.sections ?? [] },
    { label: isAr ? 'حسب الماركة' : 'By brand', items: facets.brands ?? [] },
  ].filter((g) => g.items.length > 0);

  const sorts = [
    { v: 'newest', label: isAr ? 'الأحدث' : 'Newest' },
    { v: 'views', label: isAr ? 'الأكثر مشاهدة' : 'Most viewed' },
    { v: 'downloads', label: isAr ? 'الأكثر تحميلًا' : 'Most downloaded' },
  ];
  const activeSort = searchParams.sort || config.default_sort || 'newest';

  return (
    <main className="min-h-screen bg-[#0a0c11] text-neutral-100" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Hero */}
        <header className="mb-7 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{isAr ? config.title_ar : config.title_en}</h1>
          <p className="text-neutral-400 mt-2 max-w-2xl mx-auto">{isAr ? config.subtitle_ar : config.subtitle_en}</p>
        </header>

        {/* Keyword tags */}
        {groups.length > 0 && (
          <div className="space-y-3 mb-7">
            {groups.map((g) => (
              <div key={g.label} className="flex items-start gap-3 flex-wrap">
                <span className="text-xs text-neutral-500 pt-1.5 w-16 shrink-0">{g.label}</span>
                <div className="flex flex-wrap gap-2 flex-1">
                  {g.label === groups[0].label && (
                    <Link href={buildHref({ ...clearAll })}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${noFilter ? 'bg-white text-black' : 'bg-white/5 text-neutral-300 hover:bg-white/10'}`}>
                      {isAr ? 'الكل' : 'All'}
                    </Link>
                  )}
                  {g.items.map((f) => (
                    <Link key={f.key + f.value} href={chipHref(f)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isChipActive(f) ? 'bg-white text-black' : 'bg-white/5 text-neutral-300 hover:bg-white/10'}`}>
                      {f.label} <span className="opacity-50 text-xs">{f.count}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Featured strip */}
        {noFilter && featured.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-3">⭐ {isAr ? 'خلفيات مميّزة' : 'Featured'}</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
              {featured.map((w) => <Card key={`f-${w.id}`} w={w} locale={locale} isAr={isAr} className="w-40 shrink-0" />)}
            </div>
          </section>
        )}

        {/* Sort */}
        <div className="flex justify-end mb-5">
          <div className="flex gap-2">
            {sorts.map((s) => (
              <Link key={s.v} href={buildHref({ sort: s.v, page: undefined })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeSort === s.v ? 'bg-white/10 text-white' : 'bg-white/[0.03] text-neutral-400 hover:bg-white/10'}`}>
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Grid */}
        {data.length === 0 ? (
          <p className="text-neutral-500 text-center py-24 border border-dashed border-white/10 rounded-2xl">
            {isAr ? 'لا توجد خلفيات مطابقة' : 'No wallpapers found'}
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {data.map((w) => <Card key={w.id} w={w} locale={locale} isAr={isAr} />)}
          </div>
        )}

        {/* Pagination */}
        {meta?.last_page > 1 && (
          <div className="flex justify-center flex-wrap gap-2 mt-10">
            {Array.from({ length: Math.min(meta.last_page, 30) }, (_, i) => i + 1).map((p) => (
              <Link key={p} href={buildHref({ page: String(p) })}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm transition-colors ${p === page ? 'bg-white text-black font-bold' : 'bg-white/5 text-neutral-300 hover:bg-white/10'}`}>
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function Card({ w, locale, isAr, className = '' }: { w: WpCard; locale: string; isAr: boolean; className?: string }) {
  const href = w.brand_slug && w.section_slug ? `/${locale}/brands/${w.brand_slug}/${w.section_slug}/${w.id}` : '#';
  return (
    <Link href={href} className={`group relative block rounded-xl overflow-hidden bg-white/5 aspect-[3/4] ${className}`}>
      {w.thumbnail ? (
        <Image src={w.thumbnail} alt={w.title} fill unoptimized sizes="(max-width:768px) 50vw, 20vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-3xl text-white/10">🖼️</div>
      )}
      {w.is_featured && <span className="absolute top-2 start-2 bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">⭐</span>}
      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-white text-xs font-semibold line-clamp-1">{w.title}</p>
        <div className="flex items-center gap-3 mt-0.5 text-[10px] text-neutral-300">
          {w.model && <span className="line-clamp-1">{w.model}</span>}
          <span className="ms-auto">👁 {w.views}</span>
          <span>⬇ {w.downloads}</span>
        </div>
      </div>
    </Link>
  );
}
