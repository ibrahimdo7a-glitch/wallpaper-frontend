import Link from 'next/link';
import Image from 'next/image';
import { type Category } from '@/lib/api';
import { type Locale } from '@/lib/i18n';

interface CategoryBarProps {
  categories: Category[];
  locale: Locale;
}

export function CategoryBar({ categories, locale }: CategoryBarProps) {
  const isAr = locale === 'ar';

  if (categories.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      <Link
        href={`/${locale}`}
        className="shrink-0 flex flex-col items-center gap-2 p-3 bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors min-w-[80px]"
      >
        <span className="text-2xl">🏠</span>
        <span className="text-xs text-gray-300 whitespace-nowrap">
          {isAr ? 'الكل' : 'All'}
        </span>
      </Link>

      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/${locale}/categories/${category.slug}`}
          className="shrink-0 flex flex-col items-center gap-2 p-3 bg-gray-900 hover:bg-gray-800 rounded-xl transition-colors min-w-[80px]"
        >
          {category.cover_image_url ? (
            <Image
              src={category.cover_image_url}
              alt={isAr ? category.name_ar : category.name_en}
              width={40}
              height={40}
              className="w-10 h-10 rounded-lg object-cover"
              unoptimized
            />
          ) : (
            <span className="text-2xl">{category.icon || '📁'}</span>
          )}
          <span className="text-xs text-gray-300 whitespace-nowrap text-center">
            {isAr ? category.name_ar : category.name_en}
          </span>
          <span className="text-xs text-gray-500">{category.wallpapers_count}</span>
        </Link>
      ))}
    </div>
  );
}
