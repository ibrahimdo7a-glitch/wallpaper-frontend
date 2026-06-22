import type { ApiHomepageSection, ApiStatItem } from '@/lib/server-api';

function formatValue(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
}

// SVG icons matching the design
const StatIcons: Record<string, JSX.Element> = {
  downloads: (
    <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
      <circle cx="20" cy="20" r="20" fill="#EEF2FF"/>
      <path d="M20 12v10m0 0l-4-4m4 4l4-4M13 28h14" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  apps: (
    <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
      <circle cx="20" cy="20" r="20" fill="#EFF6FF"/>
      <path d="M20 11l7.5 4.5v9L20 29l-7.5-4.5v-9L20 11z" stroke="#3B82F6" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M20 11v9m0 9V20m-7.5-4.5L20 20m7.5-4.5L20 20" stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  wallpapers: (
    <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
      <circle cx="20" cy="20" r="20" fill="#F0FDF4"/>
      <rect x="11" y="13" width="18" height="14" rx="2" stroke="#22C55E" strokeWidth="2"/>
      <path d="M11 23l5-4 4 3 3-2.5 4 3.5" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="16" cy="18" r="1.5" fill="#22C55E"/>
    </svg>
  ),
  models: (
    <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
      <circle cx="20" cy="20" r="20" fill="#FFF7ED"/>
      <path d="M12 23h16M14 23l2-5h8l2 5" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="15.5" cy="24.5" r="1.5" fill="#F97316"/>
      <circle cx="24.5" cy="24.5" r="1.5" fill="#F97316"/>
      <path d="M17 18h6" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  brands: (
    <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
      <circle cx="20" cy="20" r="20" fill="#FFF1F2"/>
      <path d="M20 12l2.5 5 5.5.8-4 3.9.9 5.5L20 24.5l-4.9 2.7.9-5.5-4-3.9 5.5-.8L20 12z" stroke="#EF4444" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  ),
};

interface Props { section: ApiHomepageSection; isAr: boolean }

export function StatisticsSection({ section, isAr }: Props) {
  const items: ApiStatItem[] = section.data?.items ?? [];
  if (items.length === 0) return null;

  return (
    <section className="py-6 px-4 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {items.map(stat => (
            <div key={stat.key}
              className="flex flex-col items-center text-center gap-2 py-4 px-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex-shrink-0">
                {StatIcons[stat.key] ?? <span className="text-2xl">{stat.icon}</span>}
              </div>
              <div>
                <p className="text-lg md:text-xl font-bold text-gray-900">
                  {stat.prefix}{formatValue(stat.value)}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{isAr ? stat.label_ar : stat.label_en}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
