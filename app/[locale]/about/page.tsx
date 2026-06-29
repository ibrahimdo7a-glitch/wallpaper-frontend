import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { type Locale } from '@/lib/i18n';
import { fetchSiteContent } from '@/lib/server-api';

export const revalidate = 120;

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  return {
    title: locale === 'ar' ? 'من نحن | QEV' : 'About Us | QEV',
  };
}

export default async function AboutPage({ params: { locale } }: { params: { locale: Locale } }) {
  setRequestLocale(locale);
  const isAr = locale === 'ar';

  const site = await fetchSiteContent().catch(() => null);
  const custom = (isAr ? site?.about_ar : site?.about_en)?.trim();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl" dir={isAr ? 'rtl' : 'ltr'}>
      <h1 className="text-3xl font-bold text-white mb-8">{isAr ? 'من نحن' : 'About Us'}</h1>

      {custom ? (
        <div className="article-body text-gray-300" dangerouslySetInnerHTML={{ __html: custom }} />
      ) : (
        <p className="text-gray-400">
          {isAr ? 'سيُضاف المحتوى قريبًا.' : 'Content coming soon.'}
        </p>
      )}
    </div>
  );
}
