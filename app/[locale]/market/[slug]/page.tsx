import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchMarketListing } from '@/lib/server-api';
import { MarketContact } from '@/components/market/MarketContact';
import { type Locale } from '@/lib/i18n';

export const revalidate = 60;
export async function generateStaticParams() { return []; }

type Props = { params: { locale: Locale; slug: string } };

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const l = await fetchMarketListing(slug);
  if (!l) return { title: 'Not found' };
  return { title: `${locale === 'ar' ? l.title_ar : (l.title_en ?? l.title_ar)} | السوق` };
}

export default async function MarketDetailPage({ params: { locale, slug } }: Props) {
  const isAr = locale === 'ar';
  const l = await fetchMarketListing(slug);
  if (!l) notFound();

  const title = isAr ? l.title_ar : (l.title_en ?? l.title_ar);
  const desc = isAr ? l.description_ar : (l.description_en ?? l.description_ar);

  const specs: { label: string; value: string }[] = [];
  if (l.condition) specs.push({ label: isAr ? 'الحالة' : 'Condition', value: l.condition === 'new' ? (isAr ? 'جديد' : 'New') : l.condition === 'used' ? (isAr ? 'مستعمل' : 'Used') : '—' });
  if (l.year) specs.push({ label: isAr ? 'السنة' : 'Year', value: String(l.year) });
  if (l.mileage) specs.push({ label: isAr ? 'الممشى' : 'Mileage', value: `${l.mileage.toLocaleString()} ${isAr ? 'كم' : 'km'}` });
  if (l.brand) specs.push({ label: isAr ? 'الماركة' : 'Brand', value: l.brand.name_ar });
  if (l.car_model) specs.push({ label: isAr ? 'الموديل' : 'Model', value: l.car_model });
  if (l.category) specs.push({ label: isAr ? 'التصنيف' : 'Category', value: l.category });
  if (l.city) specs.push({ label: isAr ? 'الموقع' : 'Location', value: `${l.country ? l.country + ' · ' : ''}${l.city}` });

  return (
    <main className="min-h-screen bg-[#0a0c11] text-neutral-100" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <nav className="text-xs text-neutral-500 mb-6 flex gap-2">
          <Link href={`/${locale}/market`} className="hover:text-white transition-colors">{isAr ? 'السوق' : 'Market'}</Link>
          <span>/</span>
          <span className="text-neutral-300 truncate">{title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {l.images.length > 0 ? (
              <div className="space-y-2">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-white/5">
                  <Image src={l.images[0]} alt={title} fill className="object-contain" />
                </div>
                {l.images.length > 1 && (
                  <div className="grid grid-cols-5 gap-2">
                    {l.images.slice(1, 6).map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-white/5">
                        <Image src={img} alt="" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-[4/3] rounded-2xl bg-white/5 flex items-center justify-center text-5xl text-white/10">🛒</div>
            )}

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
