import Link from 'next/link';
import Image from 'next/image';
import { type Category, type Locale } from '@/types';

interface CategoryCardProps {
  category: Category;
  locale: Locale;
}

export function CategoryCard({ category, locale }: CategoryCardProps) {
  const isRTL = locale === 'ar';
  const name = locale === 'ar' ? category.nameAr : category.nameEn;
  const description = locale === 'ar' ? category.descriptionAr : category.descriptionEn;
  const subcategories = locale === 'ar' ? category.subcategoriesAr : category.subcategoriesEn;

  return (
    <div className={`relative flex items-start gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer ${isRTL ? 'flex-row-reverse' : ''}`}>
      {/* Stretched link — covers the whole card */}
      <Link href={`/${locale}/categories/${category.slug}`} className="absolute inset-0 rounded-2xl" aria-label={name} />

      {/* Thumbnail */}
      <div className="shrink-0 w-20 h-20 rounded-xl overflow-hidden">
        {category.imageUrl ? (
          <Image
            src={category.imageUrl}
            alt={name}
            width={80}
            height={80}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${category.gradient} flex items-center justify-center`}>
            <span className="text-white text-2xl font-black opacity-60">{name[0]}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className="mb-0.5">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">{name}</h3>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">{description}</p>

        {/* Subcategory chips — raised above stretched link */}
        <div className={`relative z-10 flex flex-wrap gap-1 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
          {subcategories.map((sub) => (
            <Link
              key={sub}
              href={`/${locale}/categories/${category.slug}?tag=${encodeURIComponent(sub)}`}
              className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {sub}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
