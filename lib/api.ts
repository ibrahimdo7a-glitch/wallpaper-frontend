import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

// Types
export interface Wallpaper {
  id: number;
  title_ar: string | null;
  title_en: string | null;
  slug: string;
  description_ar?: string | null;
  description_en?: string | null;
  thumbnail_url: string | null;
  image_url: string;
  width: number;
  height: number;
  resolution_label: string;
  device_type: 'mobile' | 'desktop' | 'tablet' | 'all';
  is_free: boolean;
  is_paid: boolean;
  price: number | null;
  currency: string;
  views_count: number;
  downloads_count: number;
  likes_count: number;
  is_featured: boolean;
  file_size?: number;
  published_at: string;
  uploader: {
    id: number;
    name: string;
    username: string;
    avatar_url: string | null;
    bio_ar?: string;
    bio_en?: string;
    stats?: UploaderStats;
  } | null;
  category: {
    id: number;
    name_ar: string;
    name_en: string;
    slug: string;
  } | null;
  tags: Array<{ id: number; name_ar: string; name_en: string; slug: string }>;
  related?: Wallpaper[];
}

export interface Category {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
  icon?: string;
  cover_image_url?: string;
  wallpapers_count: number;
  downloads_count: number;
  description_ar?: string;
  description_en?: string;
  breadcrumbs?: Array<{ id: number; name_ar: string; name_en: string; slug: string }>;
  children?: Category[];
  parent?: Category;
}

export interface Uploader {
  id: number;
  name: string;
  username: string;
  avatar_url: string | null;
  bio_ar?: string;
  bio_en?: string;
  website?: string;
  twitter?: string;
  stats: UploaderStats;
  member_since: string;
}

export interface UploaderStats {
  wallpapers_count: number;
  downloads_count: number;
  likes_count: number;
  views_count: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export type WallpaperSort = 'newest' | 'most_downloaded' | 'most_liked' | 'most_viewed' | 'oldest';
export type DeviceType = 'mobile' | 'desktop' | 'tablet' | 'all';

// API functions
export const wallpaperApi = {
  list: (params?: {
    page?: number;
    per_page?: number;
    category?: number | string;
    device_type?: DeviceType;
    resolution?: string;
    tag?: string;
    uploader?: string;
    sort?: WallpaperSort;
    is_free?: boolean;
  }) => api.get<PaginatedResponse<Wallpaper>>('/wallpapers', { params }),

  search: (q: string, page = 1) =>
    api.get<PaginatedResponse<Wallpaper>>('/wallpapers/search', { params: { q, page } }),

  get: (slug: string) =>
    api.get<{ data: Wallpaper }>(`/wallpapers/${slug}`),

  like: (id: number) =>
    api.post<{ liked: boolean; already_liked: boolean }>(`/wallpapers/${id}/like`),

  download: (id: number) =>
    api.post<{ download_url: string }>(`/wallpapers/${id}/download`),

  report: (id: number, data: { reason: string; message?: string }) =>
    api.post(`/wallpapers/${id}/report`, data),
};

export const categoryApi = {
  list: () => api.get<{ data: Category[] }>('/categories'),
  get: (slug: string) => api.get<{ data: Category }>(`/categories/${slug}`),
};

export const uploaderApi = {
  get: (username: string) => api.get<{ data: Uploader }>(`/uploaders/${username}`),
  wallpapers: (username: string, params?: object) =>
    api.get<PaginatedResponse<Wallpaper>>(`/uploaders/${username}/wallpapers`, { params }),
};

export const translationApi = {
  getAll: () => api.get<{ data: Record<string, any> }>('/translations'),
};

export const settingsApi = {
  getPublic: () => api.get<{ data: Record<string, any> }>('/settings/public'),
};

export const adsApi = {
  get: (position: string, locale = 'ar') =>
    api.get(`/ads/${position}`, { params: { locale } }),
};

export default api;
