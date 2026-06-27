import Link from 'next/link';
import Image from 'next/image';
import type { ApiApp } from '@/lib/server-api';

export interface AppsBrowserCategory {
  id: number | string;
  slug: string;
  name_ar: string;
  name_en: string | null;
  icon: string | null;
  apps_count: number;
}

interface Props {
  apps: ApiApp[];
  categories: AppsBrowserCategory[];
  basePath: string; // e.g. /ar/apps or /ar/brands/leopard/apps
  locale: string;
  isAr: boolean;
  activeCategory?: string;
  activeSort?: string;
  title: string;
  subtitle: string;
}

/** The custom admin-written badge, with a graceful fallback to the car-screen flag. */
function appBadge(app: ApiApp, isAr: boolean): string | null {
  const custom = isAr ? app.badge_text_ar : (app.badge_text_en || app.badge_text_ar);
  if (custom) return custom;
  if (app.works_on_car_screen) return isAr ? 'يعمل على شاشة السيارة' : 'Works on car screen';
  return null;
}

export function AppsBrowser({ apps, categories, basePath, locale, isAr, activeCategory, activeSort, title, subtitle }: Props) {
  const sort = activeSort ?? 'newest';
  // Featured apps surface as orange boxes at the top, in the admin's manual order (sort_order);
  // the rest fall into the normal grid.
  const featured = apps.filter((a) => a.is_featured).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const regular = apps.filter((a) => !a.is_featured);

  const chip = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${active ? 'bg-white text-black' : 'bg-white/5 text-neutral-300 hover:bg-white/10'}`;

  return (
    <main className="min-h-screen bg-[#0a0c11] text-neutral-100" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 py-10">

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{title}</h1>
          <p className="text-neutral-400 mt-2">{subtitle}</p>
        </header>

        {/* Featured apps — prominent orange boxes (up to 4 in a row) that open the normal app page */}
        {featured.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {featured.map((app) => <FeaturedAppBox key={app.id} app={app} locale={locale} isAr={isAr} />)}
          </div>
        )}

        {/* Category tabs */}
        {categories.length > 0 && (
          <nav className="flex gap-2 flex-wrap mb-6">
            <Link href={basePath} className={chip(!activeCategory)}>{isAr ? 'الكل' : 'All'}</Link>
            {categories.map((cat) => (
              <Link key={cat.id} href={`${basePath}?category=${cat.slug}`} className={chip(activeCategory === cat.slug)}>
                {cat.icon && <span className="me-1">{cat.icon}</span>}
                {isAr ? cat.name_ar : (cat.name_en || cat.name_ar)}
                <span className="ms-1.5 text-xs opacity-60">({cat.apps_count})</span>
              </Link>
            ))}
          </nav>
        )}

        {/* Sort */}
        <div className="flex justify-end mb-6">
          <div className="flex gap-2">
            {[
              { value: 'newest', label: isAr ? 'الأحدث' : 'Newest' },
              { value: 'most_downloaded', label: isAr ? 'الأكثر تحميلاً' : 'Most downloaded' },
            ].map((s) => (
              <Link key={s.value}
                href={`${basePath}?${activeCategory ? `category=${activeCategory}&` : ''}sort=${s.value}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${sort === s.value ? 'bg-white/10 text-white' : 'bg-white/[0.03] text-neutral-400 hover:bg-white/10'}`}>
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Apps grid */}
        {regular.length === 0 ? (
          featured.length === 0 && (
            <p className="text-neutral-500 text-center py-24 border border-dashed border-white/10 rounded-2xl">
              {isAr ? 'لا توجد تطبيقات بعد' : 'No apps yet'}
            </p>
          )
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regular.map((app) => <AppCard key={app.id} app={app} locale={locale} isAr={isAr} />)}
          </div>
        )}
      </div>
    </main>
  );
}

/** Featured app rendered as an orange highlight box; clicking opens the standard app detail page. */
function FeaturedAppBox({ app, locale, isAr }: { app: ApiApp; locale: string; isAr: boolean }) {
  const title = isAr ? app.title_ar : (app.title_en || app.title_ar);
  const desc = isAr ? app.short_description_ar : (app.short_description_en || app.short_description_ar);

  return (
    <Link href={`/${locale}/apps/${app.slug}`}
      className="group flex flex-col gap-3 p-4 rounded-2xl border border-orange-400/50 bg-orange-500/[0.16] hover:bg-orange-500/[0.24] transition-colors">
      <div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-orange-500 flex items-center justify-center text-white">
        {app.icon_url ? (
          <Image src={app.icon_url} alt={title} width={48} height={48} className="object-cover w-full h-full" />
        ) : (
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
          </svg>
        )}
      </div>
      <div className="min-w-0">
        <p className="font-bold text-white truncate">{title}</p>
        {desc && <p className="text-xs text-orange-200/70 line-clamp-2 mt-1">{desc}</p>}
      </div>
    </Link>
  );
}

function AppCard({ app, locale, isAr }: { app: ApiApp; locale: string; isAr: boolean }) {
  const title = isAr ? app.title_ar : (app.title_en || app.title_ar);
  const badge = appBadge(app, isAr);
  const desc = isAr ? app.short_description_ar : (app.short_description_en || app.short_description_ar);

  return (
    <Link href={`/${locale}/apps/${app.slug}`}
      className="group flex flex-col gap-3 p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all">
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-14 h-14 rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center">
          {app.icon_url ? (
            <Image src={app.icon_url} alt={title} width={56} height={56} className="object-cover" />
          ) : (
            <span className="text-2xl text-white/20">📱</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[15px] leading-tight text-white line-clamp-2">{title}</h3>
          {app.developer && <p className="text-xs text-neutral-500 mt-1 truncate">{app.developer}</p>}
        </div>
      </div>

      {desc && <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">{desc}</p>}

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
        {app.version && <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-neutral-400">v{app.version}</span>}
        {app.downloads_count > 0 && <span className="text-[11px] text-neutral-600 ms-auto">⬇️ {app.downloads_count.toLocaleString()}</span>}
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
