import type { ReactNode } from 'react';
import type { ApiHomepageSection, ApiStatItem } from '@/lib/server-api';

function formatValue(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return String(v);
}

const StatIcon: Record<string, ReactNode> = {
  visitors: (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.2a3.2 3.2 0 0 1 0 5.6M17.6 20a5.5 5.5 0 0 0-3-4.9" /></svg>),
  downloads: (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14" /></svg>),
  wallpapers: (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.5" /><path d="M21 16l-5-4-4 3-2-1.5L3 18" /></svg>),
  apps: (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></svg>),
  likes: (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20.5s-6.6-4.2-9-8.3C1.4 9.3 2.8 5.8 6.2 5.8c2 0 3.2 1.2 3.8 2.2.6-1 1.8-2.2 3.8-2.2 3.4 0 4.8 3.5 3.2 6.4-2.4 4.1-9 8.3-9 8.3z" /></svg>),
  views: (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></svg>),
  news: (<svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h13v14H5a1 1 0 0 1-1-1V5zM17 8h2.5a1 1 0 0 1 1 1v8.5a1.5 1.5 0 0 1-3 0V8zM7 8h7M7 11.5h7M7 15h4" /></svg>),
};

const StatAccent: Record<string, string> = {
  visitors: 'text-violet-500 bg-violet-500/10',
  downloads: 'text-indigo-500 bg-indigo-500/10',
  wallpapers: 'text-emerald-500 bg-emerald-500/10',
  apps: 'text-sky-500 bg-sky-500/10',
  likes: 'text-rose-500 bg-rose-500/10',
  views: 'text-cyan-500 bg-cyan-500/10',
  news: 'text-amber-500 bg-amber-500/10',
};

export function StatsBlock({ statsSection, isAr }: { statsSection: ApiHomepageSection; isAr: boolean }) {
  const stats: ApiStatItem[] = (statsSection.data?.items ?? []).slice(0, 6);
  if (stats.length === 0) return null;

  return (
    <section className="py-8 px-4 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto grid grid-cols-3 gap-2.5">
        {stats.map((stat) => (
          <div key={stat.key}
            className="flex items-center justify-center gap-2 px-2 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${StatAccent[stat.key] ?? 'text-gray-500 bg-gray-500/10'}`}>
              {StatIcon[stat.key] ?? <span className="text-lg">{stat.icon}</span>}
            </div>
            <div className="min-w-0 text-center sm:text-start">
              <p className="text-base sm:text-xl font-extrabold text-gray-900 dark:text-white leading-none tabular-nums">
                {stat.prefix}{formatValue(stat.value)}
              </p>
              <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">{isAr ? stat.label_ar : stat.label_en}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
