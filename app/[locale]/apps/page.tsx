import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { fetchAppCategories, fetchApps, fetchSiteContent, type ApiApp } from '@/lib/server-api';
import { type Locale } from '@/lib/i18n';

type Props = { params: { locale: Locale }; searchParams: { category?: string; sort?: string } };

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return {
    title: locale === 'ar' ? 'التطبيقات | QEV' : 'Apps | QEV',
    description: locale === 'ar' ? 'تطبيقات أندرويد للسيارات مع شرح خطوات التنصيب' : 'Android apps for cars with installation guides',
  };
}

/** The custom admin-written badge, with a graceful fallback to the car-screen flag. */
function appBadge(app: ApiApp, isAr: boolean): string | null {
  const custom = isAr ? app.badge_text_ar : (app.badge_text_en || app.badge_text_ar);
  if (custom) return custom;
  if (app.works_on_car_screen) return isAr ? 'يعمل على شاشة السيارة' : 'Works on car screen';
  return null;
}

export default async function AppsPage({ params: { locale }, searchParams }: Props) {
  setRequestLocale(locale);
  const isAr = locale === 'ar';

  const [categories, { data: apps }, site] = await Promise.all([
    fetchAppCategories(),
    fetchApps({ category: searchParams.category, sort: searchParams.sort, per_page: 24 }),
    fetchSiteContent().catch(() => null),
  ]);

  const ilinkEnabled = site?.ilink_enabled === true || site?.ilink_enabled === '1';
  const ilinkUrl = site?.ilink_file_url ?? '';
  const ilinkLabel = isAr ? site?.ilink_label_ar : site?.ilink_label_en;
  const ilinkTooltip = isAr ? site?.ilink_tooltip_ar : site?.ilink_tooltip_en;

  return (
    <main className="min-h-screen bg-[#0a0c11] text-neutral-100" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {isAr ? 'التطبيقات' : 'Apps'}
          </h1>
          <p className="text-neutral-400 mt-2">
            {isAr ? 'تطبيقات مختارة للسيارات الكهربائية والصينية، مع خطوات التنصيب.' : 'Curated car apps with installation guides.'}
          </p>
        </header>

        {/* iLink — prominent download banner */}
        {ilinkEnabled && ilinkUrl && (
          <a href={ilinkUrl} download
            className="group flex items-center gap-4 mb-8 p-5 rounded-2xl border border-orange-500/30 bg-orange-500/[0.08] hover:bg-orange-500/[0.14] transition-colors">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-white">{ilinkLabel || (isAr ? 'حمّل تطبيق iLink' : 'Download iLink app')}</p>
              {ilinkTooltip && <p className="text-sm text-neutral-400 mt-0.5 line-clamp-2">{ilinkTooltip}</p>}
            </div>
            <span className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500 group-hover:bg-orange-600 text-white text-sm font-semibold transition-colors">
              {isAr ? 'تحميل' : 'Download'}
              <span className="transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">↓</span>
            </span>
          </a>
        )}

        {/* Category tabs */}
        <nav className="flex gap-2 flex-wrap mb-6">
          <Link href={`/${locale}/apps`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!searchParams.category ? 'bg-white text-black' : 'bg-white/5 text-neutral-300 hover:bg-white/10'}`}>
            {isAr ? 'الكل' : 'All'}
          </Link>
          {categories.map((cat) => (
            <Link key={cat.id} href={`/${locale}/apps?category=${cat.slug}`}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${searchParams.category === cat.slug ? 'bg-white text-black' : 'bg-white/5 text-neutral-300 hover:bg-white/10'}`}>
              {cat.icon && <span className="me-1">{cat.icon}</span>}
              {isAr ? cat.name_ar : (cat.name_en || cat.name_ar)}
              <span className="ms-1.5 text-xs opacity-60">({cat.apps_count})</span>
            </Link>
          ))}
        </nav>

        {/* Sort */}
        <div className="flex justify-end mb-6">
          <div className="flex gap-2">
            {[
              { value: 'newest', label: isAr ? 'الأحدث' : 'Newest' },
              { value: 'most_downloaded', label: isAr ? 'الأكثر تحميلاً' : 'Most downloaded' },
            ].map((s) => (
              <Link key={s.value}
                href={`/${locale}/apps?${searchParams.category ? `category=${searchParams.category}&` : ''}sort=${s.value}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${(searchParams.sort ?? 'newest') === s.value ? 'bg-white/10 text-white' : 'bg-white/[0.03] text-neutral-400 hover:bg-white/10'}`}>
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Apps grid */}
        {apps.length === 0 ? (
          <p className="text-neutral-500 text-center py-24 border border-dashed border-white/10 rounded-2xl">
            {isAr ? 'لا توجد تطبيقات بعد' : 'No apps yet'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function AppCard({ app, locale }: { app: ApiApp; locale: Locale }) {
  const isAr = locale === 'ar';
  const title = isAr ? app.title_ar : (app.title_en || app.title_ar);
  const badge = appBadge(app, isAr);
  const desc = isAr ? app.short_description_ar : (app.short_description_en || app.short_description_ar);

  return (
    <Link href={`/${locale}/apps/${app.slug}`}
      className="group flex flex-col gap-3 p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="shrink-0 w-14 h-14 rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center">
          {app.icon_url ? (
            <Image src={app.icon_url} alt={title} width={56} height={56} className="object-cover" />
          ) : (
            <span className="text-2xl text-white/20">📱</span>
          )}
        </div>

        {/* Title + developer */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[15px] leading-tight text-white line-clamp-2 group-hover:text-white">
            {title}
          </h3>
          {app.developer && (
            <p className="text-xs text-neutral-500 mt-1 truncate">{app.developer}</p>
          )}
        </div>
      </div>

      {/* Short description */}
      {desc && (
        <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">{desc}</p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-1.5 mt-auto">
        {badge && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/20">
            <CarIcon car={app.works_on_car_screen} />
            {badge}
          </span>
        )}
        {app.is_free ? (
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300">{isAr ? 'مجاني' : 'Free'}</span>
        ) : (
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300">{isAr ? 'مدفوع' : 'Paid'}</span>
        )}
        {app.version && (
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-neutral-400">v{app.version}</span>
        )}
        {app.downloads_count > 0 && (
          <span className="text-[11px] text-neutral-600 ms-auto">⬇️ {app.downloads_count.toLocaleString()}</span>
        )}
      </div>
    </Link>
  );
}

function CarIcon({ car }: { car: boolean }) {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {car ? (
        <>
          <path d="M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0" />
          <path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2M9 17h6" />
        </>
      ) : (
        <path d="M5 12l5 5L20 7" />
      )}
    </svg>
  );
}
