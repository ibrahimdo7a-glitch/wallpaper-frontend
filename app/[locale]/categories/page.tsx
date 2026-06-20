import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { categoryApi } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import { type Locale } from '@/lib/i18n';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  return {
    title: locale === 'ar' ? 'الأقسام - منصة الخلفيات' : 'Categories - Wallpaper Platform',
  };
}

export default async function CategoriesPage({ params: { locale } }: { params: { locale: Locale } }) {
  setRequestLocale(locale);
  const isAr = locale === 'ar';
  let categories: any[] = [];
  try {
    const res = await categoryApi.list();
    categories = res.data.data;
  } catch {}

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <h1 className="text-3xl font-bold text-white mb-8">
        {isAr ? 'جميع الأقسام' : 'All Categories'}
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((category: any) => (
          <Link
            key={category.id}
            href={`/${locale}/categories/${category.slug}`}
            className="group bg-gray-900 hover:bg-gray-800 rounded-xl overflow-hidden transition-colors"
          >
            {category.cover_image_url ? (
              <div className="relative h-32">
                <Image
                  src={category.cover_image_url}
                  alt={isAr ? category.name_ar : category.name_en}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center bg-gradient-to-br from-blue-900/40 to-purple-900/40">
                <span className="text-5xl">{category.icon || '📁'}</span>
              </div>
            )}
            <div className="p-3">
              <h3 className="font-semibold text-white text-sm">
                {isAr ? category.name_ar : category.name_en}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {formatNumber(category.wallpapers_count)} {isAr ? 'خلفية' : 'wallpapers'}
              </p>
              {category.children && category.children.length > 0 && (
                <p className="text-xs text-blue-400 mt-1">
                  {category.children.length} {isAr ? 'أقسام فرعية' : 'subcategories'}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
