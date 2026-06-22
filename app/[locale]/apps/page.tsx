import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { fetchAppCategories, fetchApps } from '@/lib/server-api';
import { type Locale } from '@/lib/i18n';

type Props = { params: { locale: Locale }; searchParams: { category?: string; sort?: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return {
    title: locale === 'ar' ? 'التطبيقات - منصة الخلفيات' : 'Apps - Wallpaper Platform',
    description: locale === 'ar' ? 'تطبيقات أندرويد مع شرح خطوات التنصيب' : 'Android apps with installation guides',
  };
}

export default async function AppsPage({ params: { locale }, searchParams }: Props) {
  setRequestLocale(locale);
  const isAr = locale === 'ar';

  const [categories, { data: apps }] = await Promise.all([
    fetchAppCategories(),
    fetchApps({
      category: searchParams.category,
      sort: searchParams.sort,
      per_page: 24,
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-10 max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isAr ? '📱 مكتبة التطبيقات' : '📱 Apps Library'}
          </h1>
          <p className="text-gray-400 text-sm">
            {isAr ? 'تطبيقات أندرويد مختارة مع شرح خطوات التنصيب' : 'Curated Android apps with installation guides'}
          </p>
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              href={`/${locale}/apps`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !searchParams.category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {isAr ? 'الكل' : 'All'}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/${locale}/apps?category=${cat.slug}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  searchParams.category === cat.slug
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {cat.icon && <span className="me-1">{cat.icon}</span>}
                {isAr ? cat.name_ar : (cat.name_en || cat.name_ar)}
                <span className="ms-1.5 text-xs opacity-60">({cat.apps_count})</span>
              </Link>
            ))}
          </div>
        )}

        {/* Sort */}
        <div className="flex justify-end mb-6">
          <div className="flex gap-2">
            {[
              { value: 'newest', label: isAr ? 'الأحدث' : 'Newest' },
              { value: 'most_downloaded', label: isAr ? 'الأكثر تحميلاً' : 'Most Downloaded' },
            ].map((s) => (
              <Link
                key={s.value}
                href={`/${locale}/apps?${searchParams.category ? `category=${searchParams.category}&` : ''}sort=${s.value}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  (searchParams.sort ?? 'newest') === s.value
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                }`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Apps grid */}
        {apps.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            {isAr ? 'لا توجد تطبيقات حالياً' : 'No apps yet'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AppCard({ app, locale }: { app: any; locale: Locale }) {
  const isAr = locale === 'ar';
  const title = isAr ? app.title_ar : (app.title_en || app.title_ar);

  return (
    <Link
      href={`/${locale}/apps/${app.slug}`}
      className="group flex items-start gap-3 p-4 rounded-2xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 transition-all"
    >
      {/* Icon */}
      <div className="shrink-0 w-16 h-16 rounded-2xl overflow-hidden bg-gray-800 flex items-center justify-center">
        {app.icon_url ? (
          <Image src={app.icon_url} alt={title} width={64} height={64} className="object-cover" />
        ) : (
          <span className="text-3xl">📱</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white text-sm leading-tight mb-1 group-hover:text-primary-400 transition-colors line-clamp-2">
          {title}
        </h3>
        {app.developer && (
          <p className="text-xs text-gray-500 mb-2 truncate">{app.developer}</p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {app.version && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
              v{app.version}
            </span>
          )}
          {app.is_free ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-900/50 text-green-400">
              {isAr ? 'مجاني' : 'Free'}
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-900/50 text-yellow-400">
              {isAr ? 'مدفوع' : 'Paid'}
            </span>
          )}
        </div>
        {app.downloads_count > 0 && (
          <p className="text-[10px] text-gray-600 mt-1.5">
            ⬇️ {app.downloads_count.toLocaleString()}
          </p>
        )}
      </div>
    </Link>
  );
}
