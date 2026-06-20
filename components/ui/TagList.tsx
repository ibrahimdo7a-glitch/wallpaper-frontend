import Link from 'next/link';
import { type Locale } from '@/lib/i18n';

interface Tag {
  id: number;
  name_ar: string;
  name_en: string;
  slug: string;
}

interface TagListProps {
  tags: Tag[];
  locale: Locale;
}

export function TagList({ tags, locale }: TagListProps) {
  const isAr = locale === 'ar';

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/${locale}/tags/${tag.slug}`}
          className="px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 text-gray-300 hover:text-white rounded-lg text-sm transition-all"
        >
          #{isAr ? tag.name_ar : tag.name_en}
        </Link>
      ))}
    </div>
  );
}
