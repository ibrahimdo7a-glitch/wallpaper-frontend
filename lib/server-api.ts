// Server-side fetch functions (used in Next.js Server Components)

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://api.qev.app').replace(/\/$/, '');

async function get<T>(path: string, revalidate = 300): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1${path}`, {
      next: { revalidate },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export interface ApiCategory {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  description_ar?: string;
  description_en?: string;
  cover_image_url?: string | null;
  wallpapers_count: number;
  downloads_count: number;
  children?: ApiCategory[];
}

export interface ApiWallpaper {
  id: number;
  title_ar: string;
  title_en: string;
  slug: string;
  thumbnail_url?: string | null;
  image_url?: string | null;
  resolution_label?: string;
  downloads_count: number;
  is_free: boolean;
  tags?: { name_ar: string; name_en: string; slug: string }[];
  category?: { id: number; name_ar: string; name_en: string; slug: string } | null;
}

export interface SiteContent {
  site_name_ar: string;
  site_name_en: string;
  hero_title_ar: string;
  hero_title_en: string;
  hero_subtitle_ar: string;
  hero_subtitle_en: string;
  search_placeholder_ar: string;
  search_placeholder_en: string;
  popular_tags_ar: string[];
  popular_tags_en: string[];
  feature_car_ar: string;
  feature_car_en: string;
  feature_quality_ar: string;
  feature_quality_en: string;
  feature_fast_ar: string;
  feature_fast_en: string;
  footer_copyright_ar: string;
  footer_copyright_en: string;
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  const res = await get<{ data: ApiCategory[] }>('/categories');
  return res?.data ?? [];
}

export async function fetchMostDownloaded(limit = 5): Promise<ApiWallpaper[]> {
  const res = await get<{ data: ApiWallpaper[] }>(`/wallpapers?sort=most_downloaded&per_page=${limit}`, 30);
  return res?.data ?? [];
}

export async function fetchSiteContent(): Promise<SiteContent | null> {
  const res = await get<{ data: SiteContent }>('/settings/site-content', 60);
  return res?.data ?? null;
}
