import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchMarket, fetchBrands, type ApiMarketListing, type ApiBrand } from '@/lib/server-api';
import { locales, type Locale } from '@/lib/i18n';
import { COUNTRIES, countryBySlug } from '@/lib/countries';
import { SITE_URL, OG_IMAGE, jsonLdScript } from '@/lib/seo';

export const revalidate = 300;

export function generateStaticParams() {
  return locales.flatMap((locale) => COUNTRIES.map((c) => ({ locale, country: c.slug })));
}

type Props = { params: { locale: Locale; country: string } };

export async function generateMetadata({ params: { locale, country } }: Props): Promise<Metadata> {
  const c = countryBySlug(country);
  if (!c) return { title: 'Not found' };
  const isAr = locale === 'ar';
  const name = isAr ? c.name_ar : c.name_en;
  const title = isAr
    ? `سيارات كهربائية في ${name} — أسعار وعروض وأخبار`
    : `Electric Cars in ${name} — Prices, Listings & News`;
  const description = isAr ? c.intro_ar : c.intro_en;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/electric-cars/${country}`,
      languages: { ar: `/ar/electric-cars/${country}`, en: `/en/electric-cars/${country}` },
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${SITE_URL}/${locale}/electric-cars/${country}`,
      images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

export default async function CountryPage({ params: { locale, country } }: Props) {
  const c = countryBySlug(country);
  if (!c) notFound();
  const isAr = locale === 'ar';
  const name = isAr ? c.name_ar : c.name_en;

  const [marketRes, brands] = await Promise.all([
    c.gulf ? fetchMarket({ section: 'cars', country: c.name_ar, per_page: 8 }) : Promise.resolve({ data: [] as ApiMarketListing[], meta: {} }),
    fetchBrands(),
  ]);
  const listings = marketRes.data;
  const topBrands = brands.slice(0, 12);

  const others = COUNTRIES.filter((x) => x.slug !== c.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isAr ? 'الرئيسية' : 'Home', item: `${SITE_URL}/${locale}` },
      { '@type': 'ListItem', position: 2, name: isAr ? 'سوق السيارات' : 'Cars', item: `${SITE_URL}/${locale}/cars` },
      { '@type': 'ListItem', position: 3, name: isAr ? `سيارات كهربائية في ${name}` : `Electric cars in ${name}` },
    ],
  };

  return (
    <main className="min-h-screen bg-[#0a0c11] text-neutral-100" dir={isAr ? 'rtl' : 'ltr'}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Hero */}
        <nav className="text-xs text-neutral-500 mb-5 flex gap-2">
          <Link href={`/${locale}`} className="hover:text-white transition-colors">{isAr ? 'الرئيسية' : 'Home'}</Link>
          <span>/</span>
          <Link href={`/${locale}/cars`} className="hover:text-white transition-colors">{isAr ? 'سوق السيارات' : 'Cars'}</Link>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {isAr ? `سيارات كهربائية في ${name}` : `Electric Cars in ${name}`}
          </h1>
          <p className="text-neutral-300 leading-relaxed mt-3 max-w-3xl">{isAr ? c.intro_ar : c.intro_en}</p>
          <div className="flex flex-wrap gap-2 mt-5">
            <Link href={`/${locale}/cars${c.gulf ? `?country=${encodeURIComponent(c.name_ar)}` : ''}`}
              className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-sm hover:bg-neutral-200 transition-colors">
              {isAr ? '🚗 تصفّح السيارات' : '🚗 Browse cars'}
            </Link>
            <Link href={`/${locale}/news`}
              className="px-4 py-2 rounded-xl bg-white/5 text-neutral-200 font-semibold text-sm border border-white/10 hover:bg-white/10 transition-colors">
              {isAr ? '📰 آخر الأخبار' : '📰 Latest news'}
            </Link>
          </div>
        </header>

        {/* Listings in this country (Gulf only) */}
        {listings.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{isAr ? `أحدث الإعلانات في ${name}` : `Latest listings in ${name}`}</h2>
              <Link href={`/${locale}/cars?country=${encodeURIComponent(c.name_ar)}`} className="text-sm text-sky-400 hover:underline">
                {isAr ? 'عرض الكل ←' : 'View all →'}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {listings.map((l) => <ListingCard key={l.id} l={l} locale={locale} isAr={isAr} />)}
            </div>
          </section>
        )}

        {/* Brands */}
        {topBrands.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">{isAr ? 'تصفّح حسب الماركة' : 'Browse by brand'}</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {topBrands.map((b) => <BrandCard key={b.id} b={b} locale={locale} isAr={isAr} />)}
            </div>
          </section>
        )}

        {/* Other countries — internal link cluster */}
        <section className="mb-4">
          <h2 className="text-xl font-bold mb-4">{isAr ? 'السيارات الكهربائية حسب الدولة' : 'Electric cars by country'}</h2>
          <div className="flex flex-wrap gap-2">
            {others.map((o) => (
              <Link key={o.slug} href={`/${locale}/electric-cars/${o.slug}`}
                className="px-3 py-1.5 rounded-lg text-sm bg-white/[0.03] text-neutral-300 border border-white/10 hover:bg-white/10 transition-colors">
                {isAr ? o.name_ar : o.name_en}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function ListingCard({ l, locale, isAr }: { l: ApiMarketListing; locale: string; isAr: boolean }) {
  const title = isAr ? l.title_ar : (l.title_en ?? l.title_ar);
  return (
    <Link href={`/${locale}/market/${l.slug}`}
      className="group flex flex-col bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden transition-all">
      <div className="relative h-40 bg-white/5 overflow-hidden">
        {l.cover_url
          ? <Image src={l.cover_url} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-4xl text-white/10">🚗</div>}
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

function BrandCard({ b, locale, isAr }: { b: ApiBrand; locale: string; isAr: boolean }) {
  return (
    <Link href={`/${locale}/brands/${b.slug}`}
      className="group flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all">
      <div className="w-11 h-11 flex items-center justify-center">
        {b.logo_url
          ? <Image src={b.logo_url} alt={b.name_ar} width={44} height={44} className="object-contain max-h-11 w-auto" />
          : <span className="text-xl font-bold text-neutral-400">{b.name_ar.charAt(0)}</span>}
      </div>
      <span className="text-xs font-semibold text-neutral-100 text-center leading-tight line-clamp-1 w-full">
        {isAr ? b.name_ar : (b.name_en ?? b.name_ar)}
      </span>
    </Link>
  );
}
