import Link from 'next/link';
import Image from 'next/image';
import type { ApiMarketListing } from '@/lib/server-api';
import { AddListingButton } from './AddListingButton';

interface Props {
  basePath: string;
  label: string;
  locale: string;
  isAr: boolean;
  listings: ApiMarketListing[];
  meta: any;
  tabs: { value: string; label: string }[];
  tabParam: 'type' | 'category';
  activeTab?: string;
  sort?: string;
  countries?: string[];
  activeCountry?: string;
}

export function MarketSectionView({ basePath, label, locale, isAr, listings, meta, tabs, tabParam, activeTab, sort, countries = [], activeCountry }: Props) {
  const page = Math.max(1, Number(meta?.current_page ?? 1));

  // Build a query string for this section, overriding selected keys.
  const href = (over: Record<string, string | undefined>) => {
    const params: Record<string, string | undefined> = { [tabParam]: activeTab, sort, country: activeCountry, ...over };
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`)
      .join('&');
    return `/${locale}${basePath}${qs ? `?${qs}` : ''}`;
  };

  const tabCls = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${active ? 'bg-white text-black' : 'bg-white/5 text-neutral-300 hover:bg-white/10'}`;

  const countryItemCls = (active: boolean) =>
    `block px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${active ? 'bg-white/10 text-white font-semibold' : 'text-neutral-300 hover:bg-white/10'}`;

  return (
    <main className="min-h-screen bg-[#0a0c11] text-neutral-100" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 py-10">
        <header className="mb-6 flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{label}</h1>
          <AddListingButton locale={locale} isAr={isAr} />
        </header>

        {(tabs.length > 0 || countries.length > 0) && (
          <nav className="flex items-center gap-2 flex-wrap mb-6">
            {tabs.length > 0 && (
              <>
                <Link href={href({ [tabParam]: undefined, page: undefined })} className={tabCls(!activeTab)}>{isAr ? 'الكل' : 'All'}</Link>
                {tabs.map((t) => (
                  <Link key={t.value} href={href({ [tabParam]: t.value, page: undefined })} className={tabCls(activeTab === t.value)}>
                    {t.label}
                  </Link>
                ))}
              </>
            )}

            {/* Country filter — sits right beside the type filters, styled to match them. */}
            {countries.length > 0 && (
              <details className="relative">
                <summary className={`${tabCls(!!activeCountry)} list-none [&::-webkit-details-marker]:hidden cursor-pointer inline-flex items-center gap-1.5`}>
                  <span>🌍</span>
                  <span>{activeCountry || (isAr ? 'كل الدول' : 'All countries')}</span>
                  <span className="text-[10px] opacity-60">▾</span>
                </summary>
                <div className="absolute z-30 mt-2 start-0 min-w-[180px] max-h-72 overflow-auto rounded-2xl border border-white/10 bg-[#11151b] p-1.5 shadow-2xl">
                  <Link href={href({ country: undefined, page: undefined })} className={countryItemCls(!activeCountry)}>
                    {isAr ? 'كل الدول' : 'All countries'}
                  </Link>
                  {countries.map((c) => (
                    <Link key={c} href={href({ country: c, page: undefined })} className={countryItemCls(activeCountry === c)}>
                      {c}
                    </Link>
                  ))}
                </div>
              </details>
            )}
          </nav>
        )}

        <div className="flex justify-end mb-6">
          <div className="flex gap-2">
            {[
              { value: '', label: isAr ? 'الأحدث' : 'Newest' },
              { value: 'price_low', label: isAr ? 'الأرخص' : 'Cheapest' },
              { value: 'price_high', label: isAr ? 'الأغلى' : 'Priciest' },
            ].map((s) => (
              <Link key={s.value} href={href({ sort: s.value || undefined, page: undefined })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${(sort ?? '') === s.value ? 'bg-white/10 text-white' : 'bg-white/[0.03] text-neutral-400 hover:bg-white/10'}`}>
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
            {listings.map((l) => <Card key={l.id} l={l} locale={locale} isAr={isAr} />)}
          </div>
        )}

        {meta?.last_page > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
              <Link key={p} href={href({ page: String(p) })}
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
