import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { fetchApp } from '@/lib/server-api';
import { AppDownloadButton } from '@/components/apps/AppDownloadButton';
import { type Locale } from '@/lib/i18n';

type Props = { params: { locale: Locale; slug: string } };

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  const app = await fetchApp(slug);
  if (!app) return { title: 'App Not Found' };
  const title = locale === 'ar' ? app.title_ar : (app.title_en || app.title_ar);
  const description = locale === 'ar' ? (app.description_ar || '') : (app.description_en || app.description_ar || '');
  return {
    title: `${title} - ${process.env.NEXT_PUBLIC_SITE_NAME || 'Apps'}`,
    description: description?.slice(0, 160),
  };
}

export default async function AppPage({ params: { locale, slug } }: Props) {
  setRequestLocale(locale);
  const app = await fetchApp(slug);
  if (!app) notFound();

  const isAr = locale === 'ar';
  const title = isAr ? app.title_ar : (app.title_en || app.title_ar);
  const description = isAr ? app.description_ar : (app.description_en || app.description_ar);
  const badge = (isAr ? app.badge_text_ar : (app.badge_text_en || app.badge_text_ar))
    || (app.works_on_car_screen ? (isAr ? 'يعمل على شاشة السيارة' : 'Works on car screen') : null);

  return (
    <div className="min-h-screen bg-[#0a0c11] text-white">
      <div className="container mx-auto px-4 py-10 max-w-4xl">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8">
          <Link href={`/${locale}`} className="hover:text-white transition-colors">
            {isAr ? 'الرئيسية' : 'Home'}
          </Link>
          <span>/</span>
          <Link href={`/${locale}/apps`} className="hover:text-white transition-colors">
            {isAr ? 'التطبيقات' : 'Apps'}
          </Link>
          {app.category && (
            <>
              <span>/</span>
              <Link href={`/${locale}/apps?category=${app.category.slug}`} className="hover:text-white transition-colors">
                {isAr ? app.category.name_ar : (app.category.name_en || app.category.name_ar)}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-300">{title}</span>
        </nav>

        {/* App Hero */}
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-10">
          {/* Icon */}
          <div className="shrink-0 w-24 h-24 rounded-3xl overflow-hidden bg-gray-800 shadow-2xl flex items-center justify-center">
            {app.icon_url ? (
              <Image src={app.icon_url} alt={title} width={96} height={96} className="object-cover" />
            ) : (
              <span className="text-5xl">📱</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{title}</h1>
            {app.developer && (
              <p className="text-gray-400 text-sm mb-3">{app.developer}</p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {badge && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/25">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {app.works_on_car_screen ? (
                      <>
                        <path d="M5 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0M15 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0" />
                        <path d="M5 17H3v-6l2-5h9l4 5h1a2 2 0 0 1 2 2v4h-2M9 17h6" />
                      </>
                    ) : (
                      <path d="M5 12l5 5L20 7" />
                    )}
                  </svg>
                  {badge}
                </span>
              )}
              {app.is_free && (
                <span className="px-3 py-1 rounded-full text-xs bg-green-900/40 text-green-400 border border-green-800">
                  {isAr ? '✓ مجاني' : '✓ Free'}
                </span>
              )}
              {app.version && (
                <span className="px-3 py-1 rounded-full text-xs bg-gray-800 text-gray-300">
                  v{app.version}
                </span>
              )}
              {app.min_android && (
                <span className="px-3 py-1 rounded-full text-xs bg-gray-800 text-gray-300">
                  {app.min_android}
                </span>
              )}
              {app.file_size_label && app.file_size_label !== '—' && (
                <span className="px-3 py-1 rounded-full text-xs bg-gray-800 text-gray-300">
                  {app.file_size_label}
                </span>
              )}
            </div>

            {/* Download button */}
            <AppDownloadButton appId={app.id} locale={locale} hasApk={app.has_apk} hasExternal={app.has_external_url} />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-10 p-4 rounded-2xl bg-gray-900 border border-gray-800">
          <div className="text-center">
            <div className="text-xl font-bold text-indigo-400">{app.downloads_count.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-0.5">{isAr ? 'تحميل' : 'Downloads'}</div>
          </div>
          <div className="text-center border-x border-gray-800">
            <div className="text-xl font-bold text-gray-200">{app.version || '—'}</div>
            <div className="text-xs text-gray-500 mt-0.5">{isAr ? 'الإصدار' : 'Version'}</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-200">{app.file_size_label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{isAr ? 'الحجم' : 'Size'}</div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-primary-500 inline-block" />
              {isAr ? 'عن التطبيق' : 'About'}
            </h2>
            <div className="text-gray-300 text-sm leading-7 whitespace-pre-line bg-gray-900 rounded-2xl p-5 border border-gray-800">
              {description}
            </div>
          </section>
        )}

        {/* Installation Steps */}
        {app.installation_steps.length > 0 && (
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-primary-500 inline-block" />
              {isAr ? 'خطوات التنصيب' : 'Installation Steps'}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {app.installation_steps.map((step: any) => {
                const stepTitle = isAr ? step.title_ar : (step.title_en || step.title_ar);
                return (
                  <div key={step.step_number} className="relative">
                    {/* Step number badge */}
                    <div className="absolute -top-3 -start-3 z-10 w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center shadow-lg">
                      {step.step_number}
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-gray-800 bg-gray-900">
                      <div className="relative aspect-[9/16] bg-gray-800">
                        <Image
                          src={step.image_url}
                          alt={stepTitle || `Step ${step.step_number}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                        />
                      </div>
                      {stepTitle && (
                        <div className="px-4 py-3 text-sm text-center text-gray-300 font-medium">
                          {stepTitle}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* App Info Table */}
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-primary-500 inline-block" />
            {isAr ? 'معلومات التطبيق' : 'App Info'}
          </h2>
          <div className="rounded-2xl border border-gray-800 overflow-hidden">
            {[
              { label: isAr ? 'الاسم' : 'Name', value: title },
              app.developer   && { label: isAr ? 'المطور' : 'Developer', value: app.developer },
              app.version     && { label: isAr ? 'الإصدار' : 'Version', value: app.version },
              app.min_android && { label: isAr ? 'يتطلب' : 'Requires', value: app.min_android },
              app.file_size_label !== '—' && { label: isAr ? 'الحجم' : 'Size', value: app.file_size_label },
              app.package_name && { label: 'Package', value: app.package_name },
              app.category    && { label: isAr ? 'القسم' : 'Category', value: isAr ? app.category.name_ar : (app.category.name_en || app.category.name_ar) },
            ].filter(Boolean).map((row: any, i, arr) => (
              <div key={i} className={`flex justify-between items-center px-5 py-3 text-sm ${i < arr.length - 1 ? 'border-b border-gray-800' : ''} ${i % 2 === 0 ? 'bg-gray-900' : 'bg-gray-900/50'}`}>
                <span className="text-gray-500">{row.label}</span>
                <span className="text-gray-200 font-medium text-end">{row.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Back button */}
        <Link
          href={`/${locale}/apps`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4 rotate-180 rtl:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {isAr ? 'العودة للتطبيقات' : 'Back to Apps'}
        </Link>

      </div>
    </div>
  );
}
