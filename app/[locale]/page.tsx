import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { type Locale } from '@/lib/i18n';
import { fetchBrands, fetchNews, fetchSiteContent } from '@/lib/server-api';

export const revalidate = 300;

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const isAr = locale === 'ar';
  return {
    title: isAr ? 'QEV — منصة السيارات الكهربائية الصينية' : 'QEV — Chinese EV Cars Hub',
    description: isAr
      ? 'كل ما يخص السيارات الكهربائية الصينية — خلفيات، تطبيقات، شروحات، أخبار'
      : 'Everything about Chinese electric cars — wallpapers, apps, tutorials, news',
  };
}

export default async function HomePage({ params: { locale } }: { params: { locale: Locale } }) {
  const isAr = locale === 'ar';

  const [brands, { data: news }] = await Promise.all([
    fetchBrands().catch(() => []),
    fetchNews({ featured: false, page: 1 }).catch(() => ({ data: [], meta: {} as any })),
  ]);

  const featuredBrands = brands.filter(b => b.is_featured);
  const allBrands = brands;

  return (
    <main className="min-h-screen bg-black text-white" dir={isAr ? 'rtl' : 'ltr'}>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-900" />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 70% 50%, #8b5cf6 0%, transparent 50%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            {isAr ? 'منصة السيارات الكهربائية الصينية' : 'Chinese EV Cars Platform'}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
            {isAr ? 'كل شيء عن' : 'Everything about'}{' '}
            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              {isAr ? 'السيارات الصينية' : 'Chinese Cars'}
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            {isAr
              ? 'خلفيات، تطبيقات، شروحات، ملفات، أخبار — كل ماركة في مكان واحد'
              : 'Wallpapers, apps, tutorials, files, news — every brand in one place'}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href={`/${locale}/brands`}
              className="bg-white text-black font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors">
              {isAr ? 'استعرض الماركات' : 'Browse Brands'}
            </Link>
            {news.length > 0 && (
              <Link href={`/${locale}/news`}
                className="bg-white/10 border border-white/20 px-6 py-3 rounded-xl hover:bg-white/20 transition-colors">
                {isAr ? 'آخر الأخبار' : 'Latest News'}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ─── Featured Brands ─── */}
      {featuredBrands.length > 0 && (
        <section className="py-14 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">⭐ {isAr ? 'الماركات المميزة' : 'Featured Brands'}</h2>
              <Link href={`/${locale}/brands`} className="text-sm text-gray-400 hover:text-white">
                {isAr ? 'كل الماركات ←' : 'All brands →'}
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {featuredBrands.slice(0, 10).map(brand => (
                <Link key={brand.id} href={`/${locale}/brands/${brand.slug}`}
                  className="group bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-2xl p-5 flex flex-col items-center gap-3 transition-all">
                  {brand.logo_url ? (
                    <div className="w-16 h-16 relative">
                      <Image src={brand.logo_url} alt={brand.name_ar} fill className="object-contain" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gray-700 flex items-center justify-center text-2xl font-bold">
                      {brand.name_ar.charAt(0)}
                    </div>
                  )}
                  <div className="text-center">
                    <p className="font-semibold text-sm">{isAr ? brand.name_ar : (brand.name_en ?? brand.name_ar)}</p>
                    {brand.models_count > 0 && (
                      <p className="text-xs text-gray-500 mt-0.5">{brand.models_count} {isAr ? 'موديل' : 'models'}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── All Brands horizontal scroll (if more than featured) ─── */}
      {allBrands.length > featuredBrands.length && (
        <section className="pb-14 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-lg font-bold mb-4">🏭 {isAr ? 'جميع الماركات' : 'All Brands'}</h2>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {allBrands.map(brand => (
                <Link key={brand.id} href={`/${locale}/brands/${brand.slug}`}
                  className="flex-shrink-0 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-xl px-4 py-3 flex items-center gap-3 transition-all min-w-[140px]">
                  {brand.logo_url ? (
                    <div className="w-8 h-8 relative flex-shrink-0">
                      <Image src={brand.logo_url} alt={brand.name_ar} fill className="object-contain" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {brand.name_ar.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-medium truncate">{isAr ? brand.name_ar : (brand.name_en ?? brand.name_ar)}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Quick features strip ─── */}
      <section className="py-12 px-4 bg-gray-950 border-y border-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: '🖼️', ar: 'خلفيات حصرية', en: 'Exclusive Wallpapers' },
            { icon: '📱', ar: 'تطبيقات السيارات', en: 'Car Apps' },
            { icon: '🎓', ar: 'شروحات مفصلة', en: 'Detailed Tutorials' },
            { icon: '📰', ar: 'آخر الأخبار', en: 'Latest News' },
          ].map(f => (
            <div key={f.en} className="text-center">
              <div className="text-3xl mb-2">{f.icon}</div>
              <p className="font-semibold text-sm">{isAr ? f.ar : f.en}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── News Section ─── */}
      {news.length > 0 && (
        <section className="py-14 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">📰 {isAr ? 'آخر الأخبار' : 'Latest News'}</h2>
              <Link href={`/${locale}/news`} className="text-sm text-gray-400 hover:text-white">
                {isAr ? 'كل الأخبار ←' : 'All news →'}
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {news.slice(0, 6).map(article => (
                <Link key={article.id} href={`/${locale}/news/${article.slug}`}
                  className="group bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 rounded-2xl overflow-hidden transition-all">
                  {article.cover_image_url && (
                    <div className="relative h-44 overflow-hidden">
                      <Image src={article.cover_image_url} alt={article.title_ar} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      {article.is_breaking && (
                        <span className="absolute top-2 start-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                          {isAr ? 'عاجل' : 'Breaking'}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    {article.category && (
                      <span className="text-xs mb-1 block font-medium" style={{ color: article.category.color ?? '#9ca3af' }}>
                        {article.category.name_ar}
                      </span>
                    )}
                    <h3 className="font-semibold line-clamp-2 text-sm">
                      {isAr ? article.title_ar : (article.title_en ?? article.title_ar)}
                    </h3>
                    {article.published_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(article.published_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Footer CTA ─── */}
      <section className="py-16 px-4 text-center bg-gray-950 border-t border-gray-800">
        <h2 className="text-2xl font-bold mb-3">
          {isAr ? 'اختر ماركتك وابدأ الاستكشاف' : 'Choose your brand and start exploring'}
        </h2>
        <p className="text-gray-400 mb-6">
          {isAr ? 'BYD، Xiaomi Auto، Zeekr، Jetour والمزيد...' : 'BYD, Xiaomi Auto, Zeekr, Jetour and more...'}
        </p>
        <Link href={`/${locale}/brands`}
          className="bg-white text-black font-semibold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors inline-block">
          {isAr ? 'استعرض الماركات' : 'Browse Brands'}
        </Link>
      </section>

    </main>
  );
}
