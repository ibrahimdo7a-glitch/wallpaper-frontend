import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { fetchContentItem } from '@/lib/server-api';
import { type Locale } from '@/lib/i18n';
import { ContentActions } from '@/components/brand/ContentActions';
import { NoImageSave } from '@/components/brand/NoImageSave';

type Props = {
  params: { locale: Locale; slug: string; section: string; item: string };
};

// Empty list = nothing pre-built, but pages render on-demand and are then ISR-
// cached (instead of dynamic SSR on every request).
export const revalidate = 60;
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { item } = await fetchContentItem(params.item);
  if (!item) return { title: 'Not Found' };
  const isAr = params.locale === 'ar';
  const title = isAr ? item.title_ar : (item.title_en ?? item.title_ar);
  return {
    title: `${title} | QEV`,
    description: (isAr ? item.description_ar : item.description_en) ?? '',
    openGraph: { images: item.image_url ? [{ url: item.image_url }] : [] },
  };
}

export default async function ContentDetailPage({ params }: Props) {
  setRequestLocale(params.locale);
  const isAr = params.locale === 'ar';
  const { item, related } = await fetchContentItem(params.item);

  if (!item) notFound();

  const title = isAr ? item.title_ar : (item.title_en ?? item.title_ar);
  const description = isAr ? item.description_ar : item.description_en;
  const brandName = item.brand ? (isAr ? item.brand.name_ar : (item.brand.name_en ?? item.brand.name_ar)) : '';
  const sectionName = item.section ? (isAr ? item.section.name_ar : (item.section.name_en ?? item.section.name_ar)) : '';
  const primaryColor = item.brand?.primary_color ?? '#3b82f6';
  const modelName = item.model ? (isAr ? item.model.name_ar : (item.model.name_en ?? item.model.name_ar)) : '';
  // Detail pages only exist at the brand-level route, so links to OTHER items
  // (related) stay brand-level. But the "back to the section list" links go to
  // the model's section page when this item belongs to a model.
  const detailBase  = `/${params.locale}/brands/${params.slug}/${params.section}`;
  const sectionList = item.model
    ? `/${params.locale}/brands/${params.slug}/models/${item.model.slug}/${params.section}`
    : detailBase;

  const resolution = item.metadata?.resolution;
  const width = item.metadata?.width;
  const height = item.metadata?.height;

  const fmt = (n: number) => n.toLocaleString(isAr ? 'ar-SA' : 'en-US');

  return (
    <main className="min-h-screen bg-black text-white" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Disables right-click + drag on THIS page only (wallpaper display) */}
      <NoImageSave />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
          <Link href={`/${params.locale}/brands`} className="hover:text-white">{isAr ? 'الماركات' : 'Brands'}</Link>
          <span>/</span>
          <Link href={`/${params.locale}/brands/${params.slug}`} className="hover:text-white">{brandName}</Link>
          <span>/</span>
          {item.model && (
            <>
              <Link href={`/${params.locale}/brands/${params.slug}/models/${item.model.slug}`} className="hover:text-white">{modelName}</Link>
              <span>/</span>
            </>
          )}
          <Link href={sectionList} className="hover:text-white">{item.section?.icon} {sectionName}</Link>
          <span>/</span>
          <span className="text-white">{title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ─── Main image ─── */}
          <div className="lg:col-span-2">
            <div className="relative bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center">
              {item.image_url && (
                <Image
                  src={item.image_url}
                  alt={title}
                  width={width || 1080}
                  height={height || 1920}
                  className="w-full h-auto object-contain max-h-[80vh]"
                  priority
                  unoptimized
                />
              )}
            </div>

            {/* Mobile actions */}
            <div className="mt-4 lg:hidden">
              <ContentActions
                contentId={item.id} fileUrl={item.file_url} imageUrl={item.image_url} slug={item.slug}
                initialLikes={item.likes_count} initialDownloads={item.downloads_count}
                primaryColor={primaryColor} isAr={isAr}
              />
            </div>

            {description && (
              <div className="mt-6 p-4 bg-gray-900 rounded-xl">
                <p className="text-gray-300 leading-relaxed">{description}</p>
              </div>
            )}
          </div>

          {/* ─── Sidebar ─── */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">{title}</h1>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
                  {isAr ? 'مجاني' : 'Free'}
                </span>
                {item.collection && (
                  <Link href={`${sectionList}?collection=${item.collection.slug}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-800 text-gray-300 hover:bg-gray-700">
                    {item.collection.icon} {isAr ? item.collection.name_ar : (item.collection.name_en ?? item.collection.name_ar)}
                  </Link>
                )}
              </div>
            </div>

            {/* Desktop actions */}
            <div className="hidden lg:block">
              <ContentActions
                contentId={item.id} fileUrl={item.file_url} imageUrl={item.image_url} slug={item.slug}
                initialLikes={item.likes_count} initialDownloads={item.downloads_count}
                primaryColor={primaryColor} isAr={isAr}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-900 rounded-xl">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-400">{fmt(item.views_count)}</div>
                <div className="text-xs text-gray-400">{isAr ? 'مشاهدات' : 'Views'}</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">{fmt(item.downloads_count)}</div>
                <div className="text-xs text-gray-400">{isAr ? 'تحميلات' : 'Downloads'}</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-400">{fmt(item.likes_count)}</div>
                <div className="text-xs text-gray-400">{isAr ? 'إعجابات' : 'Likes'}</div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 p-4 bg-gray-900 rounded-xl text-sm">
              {resolution && (
                <div className="flex justify-between">
                  <span className="text-gray-400">{isAr ? 'الدقة' : 'Resolution'}</span>
                  <span className="text-white font-medium">
                    {width && height ? `${width} × ${height}` : ''} {resolution && `(${resolution})`}
                  </span>
                </div>
              )}
              {item.file_size_label && item.file_size_label !== '—' && (
                <div className="flex justify-between">
                  <span className="text-gray-400">{isAr ? 'الحجم' : 'Size'}</span>
                  <span className="text-white">{item.file_size_label}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">{isAr ? 'القسم' : 'Section'}</span>
                <Link href={sectionList} className="text-white hover:underline">{item.section?.icon} {sectionName}</Link>
              </div>
            </div>

            {/* Brand */}
            {item.brand && (
              <Link href={`/${params.locale}/brands/${item.brand.slug}`}
                className="flex items-center gap-3 p-4 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors">
                {item.brand.logo_url && (
                  <Image src={item.brand.logo_url} alt={brandName} width={40} height={40} className="object-contain" />
                )}
                <div>
                  <div className="text-xs text-gray-400">{isAr ? 'الماركة' : 'Brand'}</div>
                  <div className="font-semibold text-white">{brandName}</div>
                </div>
              </Link>
            )}

            {/* Designer — below the brand, same style */}
            {(item.designer || item.author_name) && (
              <div className="flex items-center gap-3 p-4 bg-gray-900 rounded-xl">
                {item.designer?.avatar_url ? (
                  <Image src={item.designer.avatar_url} alt={item.designer.name_ar} width={40} height={40}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold flex-shrink-0">
                    {(item.designer ? (isAr ? item.designer.name_ar : (item.designer.name_en ?? item.designer.name_ar)) : item.author_name!)?.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400">{isAr ? 'المصمّم' : 'Designer'}</div>
                  <div className="font-semibold text-white truncate">
                    {item.designer ? (isAr ? item.designer.name_ar : (item.designer.name_en ?? item.designer.name_ar)) : item.author_name}
                  </div>
                </div>
                {item.designer?.telegram_url && (
                  <a href={item.designer.telegram_url} target="_blank" rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm flex-shrink-0">✈️</a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── Related ─── */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold mb-6">{isAr ? 'خلفيات مشابهة' : 'Similar Wallpapers'}</h2>
            <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
              {related.map(r => {
                const thumb = r.thumbnail_url ?? r.image_url;
                if (!thumb) return null;
                return (
                  <Link key={r.id} href={`${detailBase}/${r.id}`}
                    className="group relative block break-inside-avoid rounded-xl overflow-hidden bg-gray-900">
                    <Image src={thumb} alt={r.title_ar} width={400} height={600}
                      className="w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
