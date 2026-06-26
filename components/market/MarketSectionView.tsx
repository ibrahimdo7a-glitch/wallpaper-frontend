import Link from 'next/link';
import Image from 'next/image';
import type { ApiMarketListing } from '@/lib/server-api';

const SECTION_TABS: Record<string, { type: string; ar: string; en: string }[]> = {
  cars: [
    { type: 'car_sale', ar: '🚗 للبيع', en: 'For sale' },
    { type: 'car_request', ar: '🔎 طلبات', en: 'Requests' },
  ],
  parts: [
    { type: 'part', ar: '🔧 قطع غيار', en: 'Parts' },
    { type: 'accessory', ar: '🎁 اكسسوارات', en: 'Accessories' },
    { type: 'service', ar: '🛠️ خدمات', en: 'Services' },
  ],
};

interface Props {
  section: 'cars' | 'parts';
  basePath: string;
  label: string;
  locale: string;
  isAr: boolean;
  listings: ApiMarketListing[];
  meta: any;
  searchParams: { type?: string; sort?: string; page?: string };
}

export function MarketSectionView({ section, basePath, label, locale, isAr, listings, meta, searchParams }: Props) {
  const tabs = SECTION_TABS[section] ?? [];
  const page = Math.max(1, Number(searchParams.page ?? 1));
  const tab = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${active ? 'bg-white text-black' : 'bg-white/5 text-neutral-300 hover:bg-white/10'}`;

  return (
    <main className="min-h-screen bg-[#0a0c11] text-neutral-100" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{label}</h1>
        </header>

        <nav className="flex gap-2 flex-wrap mb-6">
          <Link href={`/${locale}${basePath}`} className={tab(!searchParams.type)}>{isAr ? 'الكل' : 'All'}</Link>
          {tabs.map(t => (
            <Link key={t.type} href={`/${locale}${basePath}?type=${t.type}`} className={tab(searchParams.type === t.type)}>
              {isAr ? t.ar : t.en}
            </Link>
          ))}
        </nav>

        <div className="flex justify-end mb-6">
          <div className="flex gap-2">
            {[
              { value: '', label: isAr ? 'الأحدث' : 'Newest' },
              { value: 'price_low', label: isAr ? 'الأرخص' : 'Cheapest' },
              { value: 'price_high', label: isAr ? 'الأغلى' : 'Priciest' },
            ].map(s => (
              <Link key={s.value}
                href={`/${locale}${basePath}?${searchParams.type ? `type=${searchParams.type}&` : ''}${s.value ? `sort=${s.value}` : ''}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${(searchParams.sort ?? '') === s.value ? 'bg-white/10 text-white' : 'bg-white/[0.03] text-neutral-400 hover:bg-white/10'}`}>
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        {listings.length === 0 ? (
          <p className="text-neutral-500 text-center py-24 border border-dashed border-white/10 rounded-2xl">
            {isAr ? 'لا توجد إعلانات بعد' : 'No listings yet'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {listings.map(l => <Card key={l.id} l={l} locale={locale} isAr={isAr} />)}
          </div>
        )}

        {meta?.last_page > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
              <Link key={p}
                href={`/${locale}${basePath}?${searchParams.type ? `type=${searchParams.type}&` : ''}page=${p}`}
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

function Card({ l, locale, isAr }: { l: ApiMarketListing; locale: string; isAr: boolean }) {
  const title = isAr ? l.title_ar : (l.title_en ?? l.title_ar);
  return (
    <Link href={`/${locale}/market/${l.slug}`}
      className="group flex flex-col bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden transition-all">
      <div className="relative h-44 bg-white/5 overflow-hidden">
        {l.cover_url ? (
          <Image src={l.cover_url} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-white/10">🛒</div>
        )}
        {l.is_featured && (
          <span className="absolute top-2 start-2 bg-amber-500 text-black text-[11px] font-bold px-2 py-0.5 rounded-full">⭐ مميّز</span>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-bold text-sm leading-snug line-clamp-2 text-white">{title}</h3>
        <div className="flex items-center justify-between mt-auto pt-2 text-xs">
          <span className="text-emerald-400 font-bold">
            {l.price != null ? `${l.price.toLocaleString()} ${l.currency}` : (isAr ? 'حسب الطلب' : 'On request')}
          </span>
          {l.city && <span className="text-neutral-500">📍 {l.city}</span>}
        </div>
      </div>
    </Link>
  );
}
