import { type Wallpaper } from '@/types';

export const mockWallpapers: Wallpaper[] = [
  {
    id: '1',
    slug: 'leopard-5-desert-dawn',
    titleAr: 'ليوبارد 5 - صحراوي',
    titleEn: 'Leopard 5 – Desert Dawn',
    downloads: 12400,
    is4K: true,
    gradient: 'from-amber-800 via-orange-700 to-yellow-600',
    category: 'leopard-5',
  },
  {
    id: '2',
    slug: 'leopard-5-urban-night',
    titleAr: 'ليوبارد 5 - ليلي',
    titleEn: 'Leopard 5 – Urban Night',
    downloads: 9800,
    is4K: true,
    gradient: 'from-slate-900 via-blue-950 to-indigo-900',
    category: 'leopard-5',
  },
  {
    id: '3',
    slug: 'leopard-8-mountain-range',
    titleAr: 'ليوبارد 8 - جبال',
    titleEn: 'Leopard 8 – Mountain Range',
    downloads: 8700,
    is4K: true,
    gradient: 'from-emerald-900 via-teal-800 to-cyan-700',
    category: 'leopard-8',
  },
  {
    id: '4',
    slug: 'leopard-8-studio',
    titleAr: 'ليوبارد 8 - استوديو',
    titleEn: 'Leopard 8 – Studio',
    downloads: 7300,
    is4K: true,
    gradient: 'from-zinc-700 via-slate-600 to-gray-500',
    category: 'leopard-8',
  },
  {
    id: '5',
    slug: 'compact-suv-city-drive',
    titleAr: 'السيارات الصغيرة - مدينة',
    titleEn: 'Compact SUV – City Drive',
    downloads: 6100,
    is4K: true,
    gradient: 'from-violet-900 via-purple-800 to-indigo-700',
    category: 'compact',
  },
];

export function formatDownloads(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  return String(n);
}
