'use client';

import { useState } from 'react';
import { type Locale, type ScreenType } from '@/types';
import { translations } from '@/data/translations';

const ICONS: Record<ScreenType, string> = { car: '🚗', mobile: '📱', desktop: '🖥️' };
const SCREENS: ScreenType[] = ['car', 'mobile', 'desktop'];

interface ScreenSelectorProps {
  locale: Locale;
}

export function ScreenSelector({ locale }: ScreenSelectorProps) {
  const t = translations[locale];
  const [selected, setSelected] = useState<ScreenType>('car');
  const isRTL = locale === 'ar';

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className={`flex items-center gap-2 mb-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-base">🖥️</span>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            {t.screenSelector.title}
          </h2>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${isRTL ? 'direction-rtl' : ''}`}>
          {SCREENS.map((screen) => {
            const opt = t.screenSelector.options[screen];
            const isSelected = selected === screen;
            return (
              <button
                key={screen}
                onClick={() => setSelected(screen)}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                  isRTL ? 'text-right flex-row-reverse' : ''
                } ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-400'
                    : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg ${
                    isSelected
                      ? 'bg-blue-100 dark:bg-blue-900/50'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  {ICONS[screen]}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 justify-between">
                    <span className={`font-semibold text-sm ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                      {opt.label}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                        <span className="text-white text-[10px]">✓</span>
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{opt.spec}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
