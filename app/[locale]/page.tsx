import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { wallpaperApi, categoryApi } from '@/lib/api';
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import { CategoryBar } from '@/components/ui/CategoryBar';
import { HeroBanner } from '@/components/ui/HeroBanner';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { type Locale } from '@/lib/i18n';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'page' });

  return {
    title: t('home_title'),
    description: t('home_description'),
    openGraph: {
      title: t('home_title'),
      description: t('home_description'),
      type: 'website',
      locale: locale === 'ar' ? 'ar_QA' : 'en_US',
    },
  };
}

async function getHomeData() {
  const [latestRes, popularRes, categoriesRes] = await Promise.allSettled([
    wallpaperApi.list({ sort: 'newest', per_page: 24 }),
    wallpaperApi.list({ sort: 'most_downloaded', per_page: 12 }),
    categoryApi.list(),
  ]);

  return {
    latest: latestRes.status === 'fulfilled' ? latestRes.value.data : { data: [], meta: { current_page: 1, last_page: 1, per_page: 24, total: 0 } },
    popular: popularRes.status === 'fulfilled' ? popularRes.value.data : { data: [], meta: { current_page: 1, last_page: 1, per_page: 12, total: 0 } },
    categories: categoriesRes.status === 'fulfilled' ? categoriesRes.value.data.data : [],
  };
}

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  const t = await getTranslations({ locale, namespace: 'nav' });
  const data = await getHomeData();

  return (
    <div className="space-y-12 pb-16">
      <HeroBanner locale={locale} />

      {/* Categories */}
      <section className="container mx-auto px-4">
        <CategoryBar categories={data.categories} locale={locale} />
      </section>

      {/* Most Downloaded */}
      {data.popular.data.length > 0 && (
        <section className="container mx-auto px-4">
          <SectionTitle
            titleAr="الأكثر تحميلًا"
            titleEn="Most Downloaded"
            locale={locale}
            href={`/${locale}/most-downloaded`}
          />
          <WallpaperGrid
            wallpapers={data.popular.data}
            locale={locale}
          />
        </section>
      )}

      {/* Latest Wallpapers */}
      <section className="container mx-auto px-4">
        <SectionTitle
          titleAr="أحدث الخلفيات"
          titleEn="Latest Wallpapers"
          locale={locale}
          href={`/${locale}/most-downloaded`}
        />
        <WallpaperGrid
          wallpapers={data.latest.data}
          locale={locale}
          pagination={data.latest.meta}
        />
      </section>
    </div>
  );
}
