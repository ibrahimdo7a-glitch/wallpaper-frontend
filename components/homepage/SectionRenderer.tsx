import type { ApiHomepageSection, ApiBrand } from '@/lib/server-api';
import { HeroSection }            from './HeroSection';
import { BrandsSection }          from './BrandsSection';
import { StatisticsSection }      from './StatisticsSection';
import { FeaturedContentSection } from './FeaturedContentSection';
import { NewsSection }            from './NewsSection';
import { FeaturesStrip }          from './FeaturesStrip';

interface Props {
  section: ApiHomepageSection;
  isAr: boolean;
  locale: string;
  allBrands?: ApiBrand[];
  searchPlaceholder?: string;
}

export function SectionRenderer({ section, isAr, locale, allBrands = [], searchPlaceholder }: Props) {
  switch (section.type) {
    case 'hero':
      return <HeroSection data={section.data} brands={allBrands} isAr={isAr} locale={locale} searchPlaceholder={searchPlaceholder} />;
    case 'brands':
    case 'featured_brands':
      return <BrandsSection section={section} isAr={isAr} locale={locale} />;
    case 'statistics':
      return <StatisticsSection section={section} isAr={isAr} />;
    case 'featured_wallpapers':
    case 'featured_apps':
    case 'tutorials':
      return <FeaturedContentSection section={section} isAr={isAr} locale={locale} />;
    case 'news':
      return <NewsSection section={section} isAr={isAr} locale={locale} />;
    case 'custom_content':
      return <FeaturesStrip section={section} isAr={isAr} />;
    case 'custom_html':
      if (!section.data?.html) return null;
      return (
        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto" dangerouslySetInnerHTML={{ __html: section.data.html }} />
        </section>
      );
    default:
      return null;
  }
}
