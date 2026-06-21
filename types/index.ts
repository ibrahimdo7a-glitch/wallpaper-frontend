export type Locale = 'ar' | 'en';
export type ScreenType = 'car' | 'mobile' | 'desktop';

export interface Wallpaper {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  downloads: number;
  is4K: boolean;
  imageUrl?: string;
  gradient: string;
  category: string;
}

export interface Category {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  imageUrl?: string;
  gradient: string;
  subcategoriesAr: string[];
  subcategoriesEn: string[];
}
