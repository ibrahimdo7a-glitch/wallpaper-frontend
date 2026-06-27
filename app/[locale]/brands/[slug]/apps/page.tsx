import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchBrand, fetchBrandApps } from '@/lib/server-api';
import { type Locale } from '@/lib/i18n';

export const revalidate = 60;

type Props = { params: { locale: Locale; slug: string } };

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const brand = await fetchBrand(slug);
  const name = brand ? (locale === 'ar' ? brand.name_ar : (brand.name_en ?? brand.name_ar)) : '';
  return { title: `${locale === 'ar' ? 'تطبيقات' : 'Apps'} ${name} | QEV` };
}

export default async function BrandAppsPage({ params: { locale, slug } }: Props) {
  const isAr = locale === 'ar';
  const [brand, apps] = await Promise.all([fetchBrand(slug), fetchBrandApps(slug)]);
  if (!brand) notFound();
  const brandName = isAr ? brand.name_ar : (brand.name_en ?? brand.name_ar);

  return (
    <main className="min-h-screen bg-black text-white" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <nav className="text-xs text-gray-500 mb-6 flex gap-2">
          <Link href={`/${locale}/brands/${slug}`} className="hover:text-white transition-colors">{brandName}</Link>
          <span>/</span>
          <span className="text-gray-300">{isAr ? 'التطبيقات' : 'Apps'}</span>
        </nav>

        <h1 className="text-2xl font-extrabold mb-6">📱 {isAr ? `تطبيقات ${brandName}` : `${brandName} apps`}</h1>

        {apps.length === 0 ? (
          <p className="text-gray-500 text-center py-20 border border-dashed border-white/10 rounded-2xl">
            {isAr ? 'لا توجد تطبيقات بعد' : 'No apps yet'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {apps.map(app => (
              <Link key={app.id} href={`/${locale}/apps/${app.slug}`}
                className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/5 shrink-0 flex items-center justify-center">
                  {app.icon_url ? <Image src={app.icon_url} alt="" width={56} height={56} className="object-cover w-full h-full" /> : <span className="text-2xl">📱</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm truncate">{isAr ? app.title_ar : (app.title_en ?? app.title_ar)}</p>
                  {app.category && <p className="text-[11px] text-gray-400 truncate">{app.category.icon} {isAr ? app.category.name_ar : (app.category.name_en ?? app.category.name_ar)}</p>}
                  <div className="flex gap-2 mt-0.5">
                    {app.works_on_car_screen && <span className="text-[11px] text-emerald-400">🚗 {isAr ? 'شاشة السيارة' : 'Car screen'}</span>}
                    {app.is_free && <span className="text-[11px] text-sky-400">{isAr ? 'مجاني' : 'Free'}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
