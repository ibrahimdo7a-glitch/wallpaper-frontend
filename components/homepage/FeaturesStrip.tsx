import type { ApiHomepageSection } from '@/lib/server-api';

interface Props { section: ApiHomepageSection; isAr: boolean }

export function FeaturesStrip({ section, isAr }: Props) {
  const items: any[] = section.data?.items ?? section.settings?.items ?? [];
  if (items.length === 0) return null;

  return (
    <section className="py-8 px-4 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {items.map((f: any, i: number) => (
            <div key={i} className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <span className="text-3xl">{f.icon}</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">{isAr ? f.title_ar : (f.title_en ?? f.title_ar)}</p>
                {(f.subtitle_ar || f.subtitle_en) && (
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{isAr ? f.subtitle_ar : (f.subtitle_en ?? f.subtitle_ar)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
