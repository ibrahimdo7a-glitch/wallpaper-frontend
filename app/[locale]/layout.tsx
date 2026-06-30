import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/lib/i18n';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MemberProvider } from '@/lib/member-auth';
import { translations } from '@/data/translations';
import { fetchSiteContent, fetchMarketConfig } from '@/lib/server-api';
import { SITE_URL, OG_IMAGE, resolveKeywords, siteJsonLd } from '@/lib/seo';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import './globals.css';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const [t, siteContent] = await Promise.all([
    Promise.resolve(translations[locale as Locale] ?? translations.en),
    fetchSiteContent(),
  ]);
  const isAr = locale === 'ar';
  const siteName = isAr
    ? (siteContent?.site_name_ar || t.siteName)
    : (siteContent?.site_name_en || t.siteName);
  const description = isAr
    ? (siteContent?.hero_subtitle_ar || t.hero.subtitle)
    : (siteContent?.hero_subtitle_en || t.hero.subtitle);
  const faviconUrl = siteContent?.favicon_url || undefined;
  const keywords = resolveKeywords(isAr ? siteContent?.seo_keywords_ar : siteContent?.seo_keywords_en, locale);
  const google = siteContent?.seo_google_verification || undefined;
  const bing = siteContent?.seo_bing_verification || undefined;

  return {
    title: { default: siteName, template: `%s | ${siteName}` },
    description,
    metadataBase: new URL(SITE_URL),
    keywords,
    applicationName: siteName,
    alternates: {
      // hreflang pair for the locale home; deep pages also ship alternates via the sitemap.
      languages: { ar: '/ar', en: '/en', 'x-default': '/ar' },
    },
    openGraph: {
      type: 'website',
      siteName,
      title: siteName,
      description,
      locale: isAr ? 'ar_AR' : 'en_US',
      images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description,
      images: [OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
    },
    ...((google || bing) ? {
      verification: {
        ...(google ? { google } : {}),
        ...(bing ? { other: { 'msvalidate.01': bing } } : {}),
      },
    } : {}),
    // Favicon is admin-managed via Site Settings — applied to every browser tab + mobile.
    ...(faviconUrl ? { icons: { icon: faviconUrl, shortcut: faviconUrl, apple: faviconUrl } } : {}),
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();
  setRequestLocale(locale);

  const isRTL = locale === 'ar';
  const siteContent = await fetchSiteContent();
  const marketConfig = await fetchMarketConfig();
  const marketLinks = [
    ...(marketConfig.cars.enabled
      ? [{ href: `/${locale}/cars`, label: isRTL ? marketConfig.cars.label_ar : marketConfig.cars.label_en }]
      : []),
    ...(marketConfig.parts.enabled
      ? [{ href: `/${locale}/parts`, label: isRTL ? marketConfig.parts.label_ar : marketConfig.parts.label_en }]
      : []),
  ];
  const t = translations[locale as Locale] ?? translations.en;
  const siteName = isRTL
    ? (siteContent?.site_name_ar || t.siteName)
    : (siteContent?.site_name_en || t.siteName);

  const ilinkEnabled = siteContent?.ilink_enabled === true || siteContent?.ilink_enabled === '1';
  const ilinkLabel   = isRTL ? siteContent?.ilink_label_ar   : siteContent?.ilink_label_en;
  const ilinkTooltip = isRTL ? siteContent?.ilink_tooltip_ar : siteContent?.ilink_tooltip_en;
  const ilinkFileUrl = siteContent?.ilink_file_url ?? '';

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        {/* Prevent dark mode flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem('theme');var d=s==='dark'||(!s&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark')})()`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Kufi+Arabic:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        {/* Organization + WebSite (sitelinks search box) structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(siteJsonLd(siteName, locale, siteContent?.favicon_url || undefined)),
          }}
        />
        {/* Hybrid analytics: Vercel Web Analytics (zero-package; active once enabled in the
            Vercel dashboard) + optional GA4 when NEXT_PUBLIC_GA_ID is set. */}
        <script defer src="/_vercel/insights/script.js" />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');`,
              }}
            />
          </>
        )}
      </head>
      <body
        className={`min-h-screen overflow-x-hidden bg-white dark:bg-gray-950 text-gray-900 dark:text-white antialiased ${
          isRTL ? 'font-arabic' : 'font-sans'
        }`}
      >
        <MemberProvider>
          <AnalyticsTracker />
          <Header
            locale={locale as Locale}
            siteName={siteName}
            marketLinks={marketLinks}
            ilink={ilinkEnabled ? { label: ilinkLabel || '', tooltip: ilinkTooltip || '', fileUrl: ilinkFileUrl } : undefined}
          />
          <main>{children}</main>
          <Footer locale={locale as Locale} />
        </MemberProvider>
      </body>
    </html>
  );
}
