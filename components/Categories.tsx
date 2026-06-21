import { type Category, type Locale } from '@/types';
import { CategoryCard } from './CategoryCard';
import { translations } from '@/data/translations';

interface CategoriesProps {
  categories: Category[];
  locale: Locale;
}

export function Categories({ categories, locale }: CategoriesProps) {
  const t = translations[locale];
  const isRTL = locale === 'ar';

  return (
    <section className="py-8 bg-gray-50 dark:bg-gray-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className={`flex items-center gap-2 mb-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="text-base">⊞</span>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            {t.categories.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
