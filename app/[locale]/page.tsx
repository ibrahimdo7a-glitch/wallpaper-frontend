import type { Metadata } from 'next';
import { type Locale } from '@/lib/i18n';
import { Hero } from '@/components/Hero';
import { MostDownloaded } from '@/components/MostDownloaded';
import { Categories } from '@/components/Categories';
import { ScreenSelector } from '@/components/ScreenSelector';
import { FeatureStrip } from '@/components/FeatureStrip';
import { mockWallpapers } from '@/data/wallpapers';
import { mockCategories } from '@/data/categories';
import { translations } from '@/data/translations';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = translations[locale] ?? translations.en;
  return {
    title: t.siteName,
    description: t.hero.subtitle,
  };
}

export default function HomePage({ params: { locale } }: { params: { locale: Locale } }) {
  const loc = (locale === 'ar' || locale === 'en') ? locale : 'en';

  return (
    <div>
      <Hero locale={loc} />
      <MostDownloaded wallpapers={mockWallpapers} locale={loc} />
      <Categories categories={mockCategories} locale={loc} />
      <ScreenSelector locale={loc} />
      <FeatureStrip locale={loc} />
    </div>
  );
}
