import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { locales, type Locale } from '@/lib/i18n';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { translations } from '@/data/translations';
import { fetchSiteContent, fetchMarketConfig } from '@/lib/server-api';
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
  const siteName = locale === 'ar'
    ? (siteContent?.site_name_ar || t.siteName)
    : (siteContent?.site_name_en || t.siteName);
  return {
    title: { default: siteName, template: `%s | ${siteName}` },
    description: locale === 'ar'
      ? (siteContent?.hero_subtitle_ar || t.hero.subtitle)
      : (siteContent?.hero_subtitle_en || t.hero.subtitle),
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://qev.app'),
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
  const market = marketConfig.enabled
    ? { label: isRTL ? marketConfig.label_ar : marketConfig.label_en }
    : null;
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
      </head>
      <body
        className={`min-h-screen overflow-x-hidden bg-white dark:bg-gray-950 text-gray-900 dark:text-white antialiased ${
          isRTL ? 'font-arabic' : 'font-sans'
        }`}
      >
        <Header
          locale={locale as Locale}
          siteName={siteName}
          market={market}
          ilink={ilinkEnabled ? { label: ilinkLabel || '', tooltip: ilinkTooltip || '', fileUrl: ilinkFileUrl } : undefined}
        />
        <main>{children}</main>
        <Footer locale={locale as Locale} />
      </body>
    </html>
  );
}
