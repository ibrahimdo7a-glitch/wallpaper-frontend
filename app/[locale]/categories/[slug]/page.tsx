import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { categoryApi, wallpaperApi } from '@/lib/api';
import { WallpaperGrid } from '@/components/wallpaper/WallpaperGrid';
import { type Locale } from '@/lib/i18n';

type Props = { params: { locale: Locale; slug: string }; searchParams: { sort?: string; page?: string } };

export async function generateMetadata({ params: { locale, slug } }: Props): Promise<Metadata> {
  try {
    const res = await categoryApi.get(slug);
    const cat = res.data.data;
    const title = locale === 'ar' ? cat.name_ar : cat.name_en;
    const description = locale === 'ar' ? cat.description_ar : cat.description_en;
    return {
      title: `${title} - Wallpaper Platform`,
      description: description || title,
      openGraph: {
        title,
        images: cat.cover_image_url ? [{ url: cat.cover_image_url }] : [],
      },
    };
  } catch {
    return { title: 'Category Not Found' };
  }
}

export default async function CategoryPage({ params: { locale, slug }, searchParams }: Props) {
  const isAr = locale === 'ar';

  let category;
  let wallpapers;

  try {
    const [catRes, wpRes] = await Promise.all([
      categoryApi.get(slug),
      wallpaperApi.list({
        category: slug,
        sort: (searchParams.sort as any) || 'newest',
        page: parseInt(searchParams.page || '1'),
        per_page: 30,
      }),
    ]);
    category = catRes.data.data;
    wallpapers = wpRes.data;
  } catch {
    notFound();
  }

  const name = isAr ? category.name_ar : category.name_en;
  const description = isAr ? category.description_ar : category.description_en;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Breadcrumbs */}
      {category.breadcrumbs && category.breadcrumbs.length > 1 && (
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href={`/${locale}`} className="hover:text-white">{isAr ? 'الرئيسية' : 'Home'}</Link>
          {category.breadcrumbs.map((crumb: any, i: number) => (
            <span key={crumb.id} className="flex items-center gap-2">
              <span>/</span>
              {i === category.breadcrumbs!.length - 1 ? (
                <span className="text-white">{isAr ? crumb.name_ar : crumb.name_en}</span>
              ) : (
                <Link href={`/${locale}/categories/${crumb.slug}`} className="hover:text-white">
                  {isAr ? crumb.name_ar : crumb.name_en}
                </Link>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{name}</h1>
        {description && <p className="text-gray-400">{description}</p>}
      </div>

      {/* Subcategories */}
      {category.children && category.children.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">{isAr ? 'الأقسام الفرعية' : 'Subcategories'}</h2>
          <div className="flex flex-wrap gap-3">
            {category.children.map((child: any) => (
              <Link
                key={child.id}
                href={`/${locale}/categories/${child.slug}`}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
              >
                {isAr ? child.name_ar : child.name_en}
                <span className="ms-2 text-gray-500 text-xs">({child.wallpapers_count})</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sort */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-gray-400 text-sm">{isAr ? 'ترتيب:' : 'Sort:'}</span>
        {['newest', 'most_downloaded', 'most_liked'].map((sort) => (
          <a
            key={sort}
            href={`?sort=${sort}`}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              (searchParams.sort || 'newest') === sort
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {sort === 'newest' ? (isAr ? 'الأحدث' : 'Newest')
              : sort === 'most_downloaded' ? (isAr ? 'الأكثر تحميلًا' : 'Most Downloaded')
              : (isAr ? 'الأكثر إعجابًا' : 'Most Liked')}
          </a>
        ))}
      </div>

      <WallpaperGrid
        wallpapers={wallpapers.data}
        locale={locale}
        pagination={wallpapers.meta}
      />
    </div>
  );
}
