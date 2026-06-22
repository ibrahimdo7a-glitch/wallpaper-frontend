import type { ApiHomepageSection, ApiStatItem } from '@/lib/server-api';

function formatValue(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
}

interface Props { section: ApiHomepageSection; isAr: boolean }

export function StatisticsSection({ section, isAr }: Props) {
  const items: ApiStatItem[] = section.data?.items ?? [];
  if (items.length === 0) return null;

  return (
    <section className="py-6 px-4 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {items.map(stat => (
            <div key={stat.key} className="flex flex-col items-center text-center gap-1 py-2">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-xl md:text-2xl font-bold text-gray-900">
                {stat.prefix}{formatValue(stat.value)}
              </span>
              <span className="text-xs text-gray-500">{isAr ? stat.label_ar : stat.label_en}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
