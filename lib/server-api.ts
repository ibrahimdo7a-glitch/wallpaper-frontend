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
  search_enabled: boolean | string;
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
  terms_ar: string;
  terms_en: string;
  privacy_ar: string;
  privacy_en: string;
  about_ar: string;
  about_en: string;
  contact_enabled: boolean | string;
  ilink_enabled: boolean | string;
  ilink_label_ar: string;
  ilink_label_en: string;
  ilink_tooltip_ar: string;
  ilink_tooltip_en: string;
  ilink_file_url: string;
  favicon_url: string;
  seo_google_verification: string;
  seo_bing_verification: string;
  seo_keywords_ar: string;
  seo_keywords_en: string;
  broadcast: { id: string; message: string; audience: string } | null;
  wp_enabled: boolean;
  og_image_url: string;
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
  short_description_ar: string | null;
  short_description_en: string | null;
  badge_text_ar: string | null;
  badge_text_en: string | null;
  works_on_car_screen: boolean;
  icon_url: string | null;
  cover_image_url: string | null;
  version: string | null;
  developer: string | null;
  min_android: string | null;
  file_size_label: string;
  is_free: boolean;
  is_featured: boolean;
  is_important: boolean;
  is_verified: boolean;
  sort_order: number;
  safety_status: string | null;
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

// ─── Homepage Builder ─────────────────────────────────────────────────────────

export interface ApiNavItem {
  id: number;
  label_ar: string;
  label_en: string | null;
  url: string | null;
  icon: string | null;
  open_in_new_tab: boolean;
  children: Omit<ApiNavItem, 'children'>[];
}

export interface ApiHeroData {
  title_ar: string;
  title_en: string | null;
  subtitle_ar: string | null;
  subtitle_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  image_url: string | null;
  bg_color: string | null;
  text_color: string | null;
  primary_btn_label_ar: string | null;
  primary_btn_label_en: string | null;
  primary_btn_url: string | null;
  secondary_btn_label_ar: string | null;
  secondary_btn_label_en: string | null;
  secondary_btn_url: string | null;
}

export interface ApiStatItem {
  key: string;
  icon: string;
  label_ar: string;
  label_en: string;
  value: number;
  prefix: string;
}

export interface ApiHomepageSection {
  id: number;
  type: 'hero' | 'brands' | 'featured_brands' | 'latest_wallpapers' | 'featured_wallpapers' | 'featured_apps' | 'news' | 'tutorials' | 'statistics' | 'cta' | 'custom_html' | 'custom_content';
  name: string;
  title_ar: string | null;
  title_en: string | null;
  subtitle_ar: string | null;
  subtitle_en: string | null;
  layout: 'grid' | 'slider' | 'carousel' | 'cards' | 'list' | 'masonry' | 'hero_cards';
  visibility: 'all' | 'desktop' | 'mobile' | 'tablet';
  settings: Record<string, any> | null;
  sort_order: number;
  data: any;
}

export async function fetchHomepage(): Promise<ApiHomepageSection[]> {
  const res = await get<{ data: ApiHomepageSection[] }>('/homepage', 120, ['homepage']);
  return res?.data ?? [];
}

export async function fetchNavigation(): Promise<ApiNavItem[]> {
  const res = await get<{ data: ApiNavItem[] }>('/navigation', 300, ['navigation']);
  return res?.data ?? [];
}

export interface ApiSearchResult {
  type: 'brand' | 'model' | 'app' | 'news';
  id: number;
  title: string;
  slug: string;
  brand_slug?: string;
  image: string | null;
}

export async function fetchSearch(q: string): Promise<ApiSearchResult[]> {
  if (!q || q.trim().length < 2) return [];
  const res = await get<{ data: ApiSearchResult[] }>(`/search?q=${encodeURIComponent(q)}`, 60);
  return res?.data ?? [];
}

// ─── Brand Builder (Dynamic Sections) ─────────────────────────────────────────

export interface ApiBrandSection {
  id: number;
  slug: string;
  name_ar: string;
  name_en: string;
  icon: string;
  description_ar: string | null;
  description_en: string | null;
  cover_image_url: string | null;
  layout_type: 'grid' | 'list' | 'cards' | 'gallery' | 'video_grid' | 'download_list' | 'faq_accordion';
  is_model_specific: boolean;
  show_in_navigation: boolean;
  show_in_brand_home: boolean;
  sort_order: number;
  settings: Record<string, any> | null;
}

export interface ApiContentItem {
  id: number;
  title_ar: string;
  title_en: string | null;
  slug: string | null;
  description_ar: string | null;
  description_en: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  file_url: string | null;
  file_size_label: string;
  video_url: string | null;
  external_url: string | null;
  metadata: Record<string, any> | null;
  content_type: string;
  is_featured: boolean;
  is_pinned: boolean;
  views_count: number;
  downloads_count: number;
  published_at: string | null;
  section_slug?: string | null;
}

export interface ApiContentDetail extends ApiContentItem {
  author_name: string | null;
  designer: { id: number; name_ar: string; name_en: string | null; avatar_url: string | null; telegram_url: string | null } | null;
  likes_count: number;
  brand: { name_ar: string; name_en: string | null; slug: string; logo_url: string | null; primary_color: string | null } | null;
  section: { name_ar: string; name_en: string | null; slug: string; icon: string | null } | null;
  collection: { name_ar: string; name_en: string | null; slug: string; icon: string | null } | null;
  model: { name_ar: string; name_en: string | null; slug: string } | null;
}

export async function fetchContentItem(id: string | number): Promise<{ item: ApiContentDetail | null; related: ApiContentItem[] }> {
  const res = await get<{ data: ApiContentDetail; related: ApiContentItem[] }>(`/content/${id}`, 60, [`content-${id}`]);
  return { item: res?.data ?? null, related: res?.related ?? [] };
}

export async function fetchBrandSections(brandSlug: string): Promise<ApiBrandSection[]> {
  const res = await get<{ data: ApiBrandSection[] }>(`/brands/${brandSlug}/sections`, 60, ['brand-sections', `brand-${brandSlug}`]);
  return res?.data ?? [];
}

export interface ApiCollection {
  id: number;
  name_ar: string;
  name_en: string | null;
  slug: string;
  icon: string | null;
  image_url: string | null;
  description_ar: string | null;
  description_en: string | null;
  items_count: number;
}

export async function fetchSectionContent(
  brandSlug: string,
  sectionSlug: string,
  page = 1,
  perPage = 20,
  collection?: string
): Promise<{ section: ApiBrandSection | null; collections: ApiCollection[]; activeCollection: ApiCollection | null; data: ApiContentItem[]; meta: any }> {
  const collParam = collection ? `&collection=${encodeURIComponent(collection)}` : '';
  const res = await get<{ section: ApiBrandSection; collections: ApiCollection[]; active_collection: ApiCollection | null; data: ApiContentItem[]; meta: any }>(
    `/brands/${brandSlug}/sections/${sectionSlug}?page=${page}&per_page=${perPage}${collParam}`,
    120,
    [`section-${brandSlug}-${sectionSlug}`]
  );
  return {
    section: res?.section ?? null,
    collections: res?.collections ?? [],
    activeCollection: res?.active_collection ?? null,
    data: res?.data ?? [],
    meta: res?.meta ?? {},
  };
}

export async function fetchModelSections(brandSlug: string, modelSlug: string): Promise<ApiBrandSection[]> {
  const res = await get<{ data: ApiCarModel; sections: ApiBrandSection[] }>(`/brands/${brandSlug}/models/${modelSlug}`, 300, [`model-${modelSlug}`]);
  return res?.sections ?? [];
}

export interface ApiModelListing {
  id: number;
  title_ar: string;
  title_en: string | null;
  slug: string;
  price: number | null;
  currency: string;
  city: string | null;
  cover_url: string | null;
  is_featured: boolean;
  listing_type: string;
}

export async function fetchModelWithSections(brandSlug: string, modelSlug: string): Promise<{ model: ApiCarModel | null; sections: ApiBrandSection[]; listings: ApiModelListing[]; wallpapers: ApiContentItem[] }> {
  const res = await get<{ data: ApiCarModel; sections: ApiBrandSection[]; listings: ApiModelListing[]; wallpapers: ApiContentItem[] }>(`/brands/${brandSlug}/models/${modelSlug}`, 300, [`model-${modelSlug}`, `brand-${brandSlug}`]);
  return {
    model: res?.data ?? null,
    sections: res?.sections ?? [],
    listings: res?.listings ?? [],
    wallpapers: res?.wallpapers ?? [],
  };
}

export async function fetchModelSectionContent(
  brandSlug: string,
  modelSlug: string,
  sectionSlug: string,
  page = 1,
  collection?: string
): Promise<{ section: ApiBrandSection | null; collections: ApiCollection[]; activeCollection: ApiCollection | null; data: ApiContentItem[]; meta: any }> {
  const collParam = collection ? `&collection=${encodeURIComponent(collection)}` : '';
  const res = await get<{ section: ApiBrandSection; collections: ApiCollection[]; active_collection: ApiCollection | null; data: ApiContentItem[]; meta: any }>(
    `/brands/${brandSlug}/models/${modelSlug}/sections/${sectionSlug}?page=${page}${collParam}`,
    120,
    [`model-section-${modelSlug}-${sectionSlug}`]
  );
  return {
    section: res?.section ?? null,
    collections: res?.collections ?? [],
    activeCollection: res?.active_collection ?? null,
    data: res?.data ?? [],
    meta: res?.meta ?? {},
  };
}

// ─── Brands & Car Models ───────────────────────────────────────────────────────

export interface ApiBrand {
  id: number;
  name_ar: string;
  name_en: string | null;
  slug: string;
  logo_url: string | null;
  cover_image_url: string | null;
  description_ar: string | null;
  description_en: string | null;
  country: string | null;
  website_url?: string | null;
  models_count: number;
  wallpapers_count: number;
  apps_count: number;
  news_count: number;
  tutorials_count: number;
  total_downloads: number;
  total_views: number;
  is_featured: boolean;
  primary_color: string | null;
  accent_color: string | null;
  telegram_url: string | null;
  whatsapp_url: string | null;
  channel_url: string | null;
  download_cta_url: string | null;
  download_cta_label_ar: string | null;
  download_cta_label_en: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
}

export interface ApiCarModel {
  id: number;
  name_ar: string;
  name_en: string | null;
  slug: string;
  image_url: string | null;
  cover_image_url: string | null;
  description_ar: string | null;
  description_en: string | null;
  car_type: string | null;
  fuel_type: string | null;
  year_from: number | null;
  year_to: number | null;
  year_label: string | null;
  wallpapers_count: number;
  apps_count: number;
  tutorials_count: number;
  is_featured: boolean;
  brand?: { name_ar: string; name_en: string | null; slug: string; logo_url: string | null };
  meta_title?: string | null;
  meta_description?: string | null;
}

export interface ApiNewsCategory {
  id: number;
  name_ar: string;
  name_en: string | null;
  slug: string;
  color: string | null;
  icon: string | null;
  articles_count: number;
}

export interface ApiNewsArticle {
  id: number;
  title_ar: string;
  title_en: string | null;
  slug: string;
  summary_ar: string | null;
  summary_en: string | null;
  cover_image_url: string | null;
  is_breaking: boolean;
  is_featured: boolean;
  views_count: number;
  likes_count: number;
  published_at: string | null;
  category: { name_ar: string; slug: string; color: string | null } | null;
  brands: { name_ar: string; slug: string }[];
}

export interface ApiNewsArticleFull extends ApiNewsArticle {
  content_ar: string | null;
  content_en: string | null;
  source_url: string | null;
  source_name: string | null;
  author_name: string | null;
  car_models: { name_ar: string; slug: string }[];
  meta_title: string | null;
  meta_description: string | null;
}

export async function fetchBrands(featured = false): Promise<ApiBrand[]> {
  const q = featured ? '?featured=1' : '';
  const res = await get<{ data: ApiBrand[] }>(`/brands${q}`, 300, ['brands']);
  return res?.data ?? [];
}

export async function fetchBrand(slug: string): Promise<ApiBrand | null> {
  const res = await get<{ data: ApiBrand }>(`/brands/${slug}`, 60, ['brands', `brand-${slug}`]);
  return res?.data ?? null;
}

export async function fetchBrandModels(brandSlug: string): Promise<ApiCarModel[]> {
  const res = await get<{ data: ApiCarModel[] }>(`/brands/${brandSlug}/models`, 60, ['car-models', `brand-${brandSlug}`]);
  return res?.data ?? [];
}

export async function fetchBrandApps(brandSlug: string): Promise<ApiApp[]> {
  const res = await get<{ data: ApiApp[] }>(`/brands/${brandSlug}/apps`, 60, ['apps', `brand-${brandSlug}`]);
  return res?.data ?? [];
}

export interface BrandShowcaseListing {
  id: number; title_ar: string; title_en: string | null; slug: string;
  price: number | null; currency: string; is_negotiable: boolean;
  city: string | null; cover_url: string | null; is_featured: boolean;
}
export interface BrandShowcaseWallpaper {
  id: number; title_ar: string; title_en: string | null; slug: string;
  image_url: string | null; thumbnail_url: string | null;
  section_slug: string | null; downloads_count: number;
}
export async function fetchBrandShowcase(brandSlug: string): Promise<{ listings: BrandShowcaseListing[]; wallpapers: BrandShowcaseWallpaper[] }> {
  const res = await get<{ data: { listings: BrandShowcaseListing[]; wallpapers: BrandShowcaseWallpaper[] } }>(
    `/brands/${brandSlug}/showcase`, 60, [`brand-${brandSlug}`, 'market', 'wallpapers'],
  );
  return res?.data ?? { listings: [], wallpapers: [] };
}

export async function fetchCarModel(brandSlug: string, modelSlug: string): Promise<ApiCarModel | null> {
  const res = await get<{ data: ApiCarModel }>(`/brands/${brandSlug}/models/${modelSlug}`, 60, ['car-models', `model-${modelSlug}`]);
  return res?.data ?? null;
}

export async function fetchModelWallpapers(brandSlug: string, modelSlug: string, page = 1): Promise<{ data: ApiWallpaper[]; meta: any }> {
  const res = await get<{ data: ApiWallpaper[]; meta: any }>(`/brands/${brandSlug}/models/${modelSlug}/wallpapers?page=${page}`, 60, ['wallpapers', `model-${modelSlug}`]);
  return { data: res?.data ?? [], meta: res?.meta ?? { current_page: 1, last_page: 1, total: 0 } };
}

export async function fetchModelApps(brandSlug: string, modelSlug: string): Promise<ApiApp[]> {
  const res = await get<{ data: ApiApp[] }>(`/brands/${brandSlug}/models/${modelSlug}/apps`, 300, ['apps', `model-${modelSlug}`]);
  return res?.data ?? [];
}

export async function fetchModelImportantApps(brandSlug: string, modelSlug: string): Promise<ApiApp[]> {
  const res = await get<{ data: ApiApp[] }>(`/brands/${brandSlug}/models/${modelSlug}/important-apps`, 300, ['apps', `model-${modelSlug}`]);
  return res?.data ?? [];
}

export async function fetchModelTutorials(brandSlug: string, modelSlug: string): Promise<any[]> {
  const res = await get<{ data: any[] }>(`/brands/${brandSlug}/models/${modelSlug}/tutorials`, 300, ['tutorials', `model-${modelSlug}`]);
  return res?.data ?? [];
}

export async function fetchModelFiles(brandSlug: string, modelSlug: string): Promise<any[]> {
  const res = await get<{ data: any[] }>(`/brands/${brandSlug}/models/${modelSlug}/files`, 300, ['files', `model-${modelSlug}`]);
  return res?.data ?? [];
}

export async function fetchNews(params: { category?: string; brand?: string; model?: string; featured?: boolean; search?: string; page?: number; perPage?: number; sort?: 'likes' | 'latest' } = {}): Promise<{ data: ApiNewsArticle[]; meta: any }> {
  const q = new URLSearchParams();
  if (params.category) q.set('category', params.category);
  if (params.brand)    q.set('brand', params.brand);
  if (params.model)    q.set('model', params.model);
  if (params.featured) q.set('featured', '1');
  if (params.search)   q.set('search', params.search);
  if (params.page)     q.set('page', String(params.page));
  if (params.perPage)  q.set('per_page', String(params.perPage));
  if (params.sort)     q.set('sort', params.sort);
  const res = await get<{ data: ApiNewsArticle[]; meta: any }>(`/news?${q}`, 120, ['news']);
  return { data: res?.data ?? [], meta: res?.meta ?? { current_page: 1, last_page: 1, total: 0 } };
}

export async function fetchNewsArticle(slug: string): Promise<ApiNewsArticleFull | null> {
  const res = await get<{ data: ApiNewsArticleFull }>(`/news/${slug}`, 120, ['news', `news-${slug}`]);
  return res?.data ?? null;
}

export async function fetchNewsCategories(): Promise<ApiNewsCategory[]> {
  const res = await get<{ data: ApiNewsCategory[] }>('/news/categories', 300, ['news-categories']);
  return res?.data ?? [];
}

// ─── Marketplace (cars + parts, two separate sections) ───
export interface ApiMarketFieldDef {
  key: string;
  label_ar: string;
  label_en: string | null;
  type: string;
  unit: string | null;
  options: { value: string; label_ar: string }[] | null;
  is_filterable: boolean;
}

export interface ApiMarketSectionCat {
  id: number;
  slug: string;
  name_ar: string;
  name_en: string | null;
  icon: string | null;
}

export interface ApiMarketSection {
  enabled: boolean;
  label_ar: string;
  label_en: string;
  fields?: ApiMarketFieldDef[];      // cars
  sections?: ApiMarketSectionCat[];  // parts
}

export interface ApiMarketConfig {
  cars: ApiMarketSection;
  parts: ApiMarketSection;
  countries: string[];
}

export interface ApiMarketListing {
  id: number;
  listing_type: string;
  title_ar: string;
  title_en: string | null;
  slug: string;
  price: number | null;
  currency: string;
  is_negotiable: boolean;
  condition: string | null;
  country: string | null;
  city: string | null;
  cover_url: string | null;
  is_featured: boolean;
  published_at: string | null;
}

export interface ApiMarketListingFull extends ApiMarketListing {
  description_ar: string | null;
  description_en: string | null;
  images: string[];
  year: number | null;
  mileage: number | null;
  specs: Record<string, any> | null;
  spec_fields: { key: string; label: string; unit: string | null; type: string; value: any }[];
  brand: { name_ar: string; slug: string } | null;
  car_model: string | null;
  category: string | null;
  views_count: number;
  contact: { name: string | null; has_phone: boolean; whatsapp: string | null; telegram: string | null };
}

export async function fetchMarketConfig(): Promise<ApiMarketConfig> {
  const res = await get<ApiMarketConfig>('/market/config', 60, ['market']);
  return res ?? {
    cars: { enabled: false, label_ar: 'سوق السيارات', label_en: 'Cars' },
    parts: { enabled: false, label_ar: 'قطع وأكسسوارات', label_en: 'Parts & Accessories' },
    countries: [],
  };
}

export async function fetchMarket(params: {
  section?: string; type?: string; category?: string; brand?: string; city?: string; country?: string;
  condition?: string; sort?: string; search?: string; page?: number; per_page?: number;
} = {}): Promise<{ data: ApiMarketListing[]; meta: any }> {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, String(v)); });
  const res = await get<{ data: ApiMarketListing[]; meta: any }>(`/market?${q.toString()}`, 60, ['market']);
  return res ?? { data: [], meta: { enabled: false, types: [] } };
}

export async function fetchMarketListing(slug: string): Promise<ApiMarketListingFull | null> {
  const res = await get<{ data: ApiMarketListingFull }>(`/market/${slug}`, 120, ['market', `market-${slug}`]);
  return res?.data ?? null;
}

// ─── Wallpapers gallery ──────────────────────────────────────────────────────
export interface WpFacet { key: string; value: string; label: string; count: number }
export interface WpGalleryConfig {
  enabled: boolean;
  title_ar: string; title_en: string;
  subtitle_ar: string; subtitle_en: string;
  default_sort: string;
  show: { models: boolean; countries: boolean; sections: boolean; brands: boolean; featured: boolean };
}
export interface WpCard {
  id: number; title: string;
  thumbnail: string | null; image: string | null;
  brand_slug: string | null; section_slug: string | null; model: string | null;
  is_featured: boolean; views: number; downloads: number;
}

export async function fetchWallpaperFacets(): Promise<{ config: WpGalleryConfig; facets: Record<string, WpFacet[]>; featured: WpCard[] }> {
  const res = await get<{ config: WpGalleryConfig; facets: Record<string, WpFacet[]>; featured: WpCard[] }>('/wallpapers-gallery/facets', 120, ['wallpapers']);
  return res ?? { config: { enabled: false } as WpGalleryConfig, facets: {}, featured: [] };
}

export async function fetchWallpaperGallery(params: {
  model?: string; brand?: string; country?: string; section?: string; search?: string; sort?: string; seed?: string; page?: number;
} = {}): Promise<{ data: WpCard[]; meta: any }> {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, String(v)); });
  const res = await get<{ data: WpCard[]; meta: any }>(`/wallpapers-gallery?${q.toString()}`, 60, ['wallpapers']);
  return res ?? { data: [], meta: { enabled: false } };
}
