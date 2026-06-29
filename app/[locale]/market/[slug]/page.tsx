import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchMarketListing } from '@/lib/server-api';
import { MarketContact } from '@/components/market/MarketContact';
import { MarketGallery } from '@/components/market/MarketGallery';
import { SaveButton } from '@/components/market/SaveButton';
import { ShareButton } from '@/components/market/ShareButton';
import { type Locale } from '@/lib/i18n';

export const revalidate = 60;
export async function generateStaticParams() { return []; }

type Props = { params: { locale: Locale; slug: string } };

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const l = await fetchMarketListing(slug);
  if (!l) return { title: 'Not found' };
  const title = locale === 'ar' ? l.title_ar : (l.title_en ?? l.title_ar);
  const price = l.price != null ? `${l.price.toLocaleString()} ${l.currency}` : (locale === 'ar' ? 'حسب الطلب' : 'On request');
  const desc = (locale === 'ar' ? l.description_ar : l.description_en) || price;
  const image = l.images?.[0];
  return {
    title: `${title} | السوق`,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: 'website',
      url: `https://qev.app/${locale}/market/${slug}`,
      siteName: locale === 'ar' ? 'قناة قطر للسيارات الكهربائية' : 'QEV',
      images: image ? [{ url: image }] : [],
    },
    twitter: { card: image ? 'summary_large_image' : 'summary', title, description: desc, images: image ? [image] : [] },
  };
}

export default async function MarketDetailPage({ params: { locale, slug } }: Props) {
  const isAr = locale === 'ar';
  const l = await fetchMarketListing(slug);
  if (!l) notFound();

  const title = isAr ? l.title_ar : (l.title_en ?? l.title_ar);
  const desc = isAr ? l.description_ar : (l.description_en ?? l.description_ar);

  // Descriptive text shared on Telegram/WhatsApp (the cover shows via OpenGraph).
  const shareLines = [
    isAr ? '📢 إعلان من قناة قطر للسيارات الكهربائية:' : '📢 A listing from QEV Cars:',
    `🚗 ${title}`,
  ];
  if (l.price != null) shareLines.push(`💰 ${l.price.toLocaleString()} ${l.currency}${l.is_negotiable ? (isAr ? ' (قابل للتفاوض)' : ' (negotiable)') : ''}`);
  if (l.country || l.city) shareLines.push(`📍 ${[l.country, l.city].filter(Boolean).join(' · ')}`);
  if (l.contact?.name) shareLines.push(`👤 ${l.contact.name}`);
  const shareText = shareLines.join('\n');

  const isCar = l.listing_type === 'car_sale' || l.listing_type === 'car_request';
  const section = { base: isCar ? '/cars' : '/parts', label: isCar ? (isAr ? 'سوق السيارات' : 'Cars') : (isAr ? 'قطع وأكسسوارات' : 'Parts & Accessories') };

  const specs: { label: string; value: string }[] = [];
  // Dynamic fields resolved by the admin's field config (labels + units come from the API).
  for (const f of l.spec_fields ?? []) {
    if (f.value === null || f.value === '') continue;
    specs.push({ label: f.label, value: `${f.value}${f.unit ? ' ' + f.unit : ''}` });
  }
  // Structured catalog relations.
  if (l.brand) specs.push({ label: isAr ? 'الماركة' : 'Brand', value: l.brand.name_ar });
  if (l.car_model) specs.push({ label: isAr ? 'الموديل' : 'Model', value: l.car_model });
  if (l.category) specs.push({ label: isAr ? 'القسم' : 'Section', value: l.category });
  if (l.city) specs.push({ label: isAr ? 'الموقع' : 'Location', value: `${l.country ? l.country + ' · ' : ''}${l.city}` });

  return (
    <main className="min-h-screen bg-[#0a0c11] text-neutral-100" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-xs text-neutral-500 mb-6 flex gap-2">
          <Link href={`/${locale}${section.base}`} className="hover:text-white transition-colors">{section.label}</Link>
          <span>/</span>
          <span className="text-neutral-300 truncate">{title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <MarketGallery images={l.images} title={title} isAr={isAr} />

            {desc && (
              <section>
                <h2 className="text-lg font-bold mb-2">{isAr ? 'الوصف' : 'Description'}</h2>
                <p className="text-neutral-300 leading-relaxed whitespace-pre-line">{desc}</p>
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
              <h1 className="text-xl font-extrabold leading-snug">{title}</h1>
              <p className="text-2xl font-extrabold text-emerald-400 mt-2">
                {l.price != null ? `${l.price.toLocaleString()} ${l.currency}` : (isAr ? 'حسب الطلب' : 'On request')}
                {l.is_negotiable && <span className="text-xs text-neutral-400 font-normal ms-2">{isAr ? '(قابل للتفاوض)' : '(negotiable)'}</span>}
              </p>
              <div className="mt-3 flex gap-2">
                <SaveButton type="listing" id={l.id} isAr={isAr} />
                <ShareButton title={title} text={shareText} isAr={isAr} />
              </div>
            </div>

            {specs.length > 0 && (
              <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                <table className="w-full text-sm">
                  <tbody>
                    {specs.map((s, i) => (
                      <tr key={i} className="border-b border-white/5 last:border-0">
                        <td className="py-2 text-neutral-500">{s.label}</td>
                        <td className="py-2 text-white font-medium text-end">{s.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5">
              <h2 className="text-base font-bold mb-3">{isAr ? 'تواصل مع المُعلِن' : 'Contact seller'}</h2>
              <MarketContact listingId={l.id} contact={l.contact} title={title} isAr={isAr} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
