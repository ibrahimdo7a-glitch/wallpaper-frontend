import { type Category } from '@/types';

export const mockCategories: Category[] = [
  {
    id: '1',
    slug: 'leopard-5',
    nameAr: 'ليوبارد 5',
    nameEn: 'Leopard 5',
    descriptionAr: 'القوة والصلابة',
    descriptionEn: 'Power & Toughness',
    gradient: 'from-amber-700 to-orange-600',
    subcategoriesAr: ['صحراوي', 'ليلي', 'مدينة', 'جبال', 'استوديو', 'أبيض', 'أسود'],
    subcategoriesEn: ['Desert', 'Night', 'City', 'Mountains', 'Studio', 'White', 'Black'],
  },
  {
    id: '2',
    slug: 'leopard-8',
    nameAr: 'ليوبارد 8',
    nameEn: 'Leopard 8',
    descriptionAr: 'الفخامة والتقدم',
    descriptionEn: 'Luxury & Progress',
    gradient: 'from-slate-800 to-zinc-700',
    subcategoriesAr: ['صحراوي', 'ليلي', 'مدينة', 'جبال', 'استوديو', 'أبيض', 'أسود'],
    subcategoriesEn: ['Desert', 'Night', 'City', 'Mountains', 'Studio', 'White', 'Black'],
  },
  {
    id: '3',
    slug: 'compact',
    nameAr: 'السيارات الصغيرة',
    nameEn: 'Compact SUVs',
    descriptionAr: 'عملية وذكية',
    descriptionEn: 'Smart & Practical',
    gradient: 'from-violet-800 to-indigo-700',
    subcategoriesAr: ['مدينة', 'ليلي', 'طبيعة', 'استوديو', 'أبيض', 'أسود', 'غروب'],
    subcategoriesEn: ['City', 'Night', 'Nature', 'Studio', 'White', 'Black', 'Sunset'],
  },
];
