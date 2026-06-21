import { type Locale } from '@/types';
import { translations } from '@/data/translations';
import type { SiteContent } from '@/lib/server-api';

interface FeatureStripProps {
  locale: Locale;
  siteContent?: SiteContent | null;
}

export function FeatureStrip({ locale, siteContent }: FeatureStripProps) {
  const t = translations[locale];
  const isRTL = locale === 'ar';

  // Build features from API content or fallback to static
  const features = siteContent && (siteContent.feature_car_ar || siteContent.feature_car_en)
    ? [
        {
          icon: '🚗',
          value: t.features[0]?.value ?? '',
          label: isRTL ? (siteContent.feature_car_ar || t.features[0]?.label) : (siteContent.feature_car_en || t.features[0]?.label),
        },
        {
          icon: '🖼️',
          value: t.features[1]?.value ?? '',
          label: isRTL ? (siteContent.feature_quality_ar || t.features[1]?.label) : (siteContent.feature_quality_en || t.features[1]?.label),
        },
        {
          icon: '⚡',
          value: t.features[2]?.value ?? '',
          label: isRTL ? (siteContent.feature_fast_ar || t.features[2]?.label) : (siteContent.feature_fast_en || t.features[2]?.label),
        },
        t.features[3],
      ]
    : t.features;

  return (
    <section className="py-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${isRTL ? 'direction-rtl' : ''}`}>
          {features.map((feat) => (
            <div
              key={feat.label}
              className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                <span className="text-sm">{feat.icon || feat.value}</span>
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-white text-sm">{feat.value}</div>
                <div className="text-gray-500 dark:text-gray-400 text-xs">{feat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
