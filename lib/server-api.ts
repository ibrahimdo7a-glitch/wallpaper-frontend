// Server-side fetch functions (used in Next.js Server Components)

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://api.qev.app').replace(/\/$/, '');

async function get<T>(path: string, revalidate = 300, tags?: string[]): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}/api/v1${path}`, {
      next: { revalidate, tags },
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
  ilink_enabled: boolean | string;
  ilink_label_ar: string;
  ilink_label_en: string;
  ilink_tooltip_ar: string;
  ilink_tooltip_en: string;
  ilink_file_url: string;
}

export async function fetchCategories(): Promise<ApiCategory[]> {
  const res = await get<{ data: ApiCategory[] }>('/categories', 300, ['categories']);
  return res?.data ?? [];
}

export async function fetchMostDownloaded(limit = 5): Promise<ApiWallpaper[]> {
  const res = await get<{ data: ApiWallpaper[] }>(`/wallpapers?sort=most_downloaded&per_page=${limit}`, 300, ['wallpapers']);
  const data = res?.data ?? [];
  if (data.length > 0) return data;
  const fallback = await get<{ data: ApiWallpaper[] }>(`/wallpapers?per_page=${limit}`, 300, ['wallpapers']);
  return fallback?.data ?? [];
}

export async function fetchLatestWallpapers(limit = 10): Promise<ApiWallpaper[]> {
  const res = await get<{ data: ApiWallpaper[] }>(`/wallpapers?per_page=${limit}`, 300, ['wallpapers']);
  return res?.data ?? [];
}

export async function fetchSiteContent(): Promise<SiteContent | null> {
  const res = await get<{ data: SiteContent }>('/settings/site-content', 300, ['site-content']);
  return res?.data ?? null;
}

// ─── Apps ─────────────────────────────────────────────────────────────────────

export interface ApiAppCategory {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  icon: string | null;
  apps_count: number;
  cover_image_url: string | null;
}

export interface ApiApp {
  id: number;
  title_ar: string;
  title_en: string | null;
  slug: string;
  icon_url: string | null;
  version: string | null;
  developer: string | null;
  min_android: string | null;
  file_size_label: string;
  is_free: boolean;
  is_featured: boolean;
  downloads_count: number;
  published_at: string | null;
  category: { id: number; name_ar: string; name_en: string; slug: string; icon: string | null } | null;
}

export interface ApiAppFull extends ApiApp {
  description_ar: string | null;
  description_en: string | null;
  package_name: string | null;
  has_apk: boolean;
  has_external_url: boolean;
  installation_steps: {
    step_number: number;
    image_url: string;
    title_ar: string | null;
    title_en: string | null;
  }[];
}

export async function fetchAppCategories(): Promise<ApiAppCategory[]> {
  const res = await get<{ data: ApiAppCategory[] }>('/app-categories', 300, ['app-categories']);
  return res?.data ?? [];
}

export async function fetchApps(params: {
  category?: string;
  sort?: string;
  per_page?: number;
  search?: string;
  featured?: boolean;
} = {}): Promise<{ data: ApiApp[]; meta: { current_page: number; last_page: number; total: number } }> {
  const q = new URLSearchParams();
  if (params.category)  q.set('category',  params.category);
  if (params.sort)      q.set('sort',       params.sort);
  if (params.per_page)  q.set('per_page',   String(params.per_page));
  if (params.search)    q.set('search',     params.search);
  if (params.featured)  q.set('featured',   '1');

  const res = await get<{ data: ApiApp[]; meta: any }>(`/apps?${q.toString()}`, 300, ['apps']);
  return { data: res?.data ?? [], meta: res?.meta ?? { current_page: 1, last_page: 1, total: 0 } };
}

export async function fetchApp(slug: string): Promise<ApiAppFull | null> {
  const res = await get<{ data: ApiAppFull }>(`/apps/${slug}`, 300, ['apps']);
  return res?.data ?? null;
}
