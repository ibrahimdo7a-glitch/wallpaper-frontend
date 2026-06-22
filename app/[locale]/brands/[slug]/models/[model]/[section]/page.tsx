import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchBrand, fetchModelWithSections, fetchModelSectionContent } from '@/lib/server-api';
import { type Locale } from '@/lib/i18n';
import type { ApiContentItem, ApiBrandSection } from '@/lib/server-api';
import { ContentImageGrid } from '@/components/brand/ContentImageGrid';

type Props = {
  params: { locale: Locale; slug: string; model: string; section: string };
  searchParams: { page?: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ model }, { section }] = await Promise.all([
    fetchModelWithSections(params.slug, params.model),
    fetchModelSectionContent(params.slug, params.model, params.section, 1),
  ]);
  if (!model || !section) return { title: 'Not Found' };
  const isAr = params.locale === 'ar';
  const modelName = isAr ? model.name_ar : (model.name_en ?? model.name_ar);
  const sectionName = isAr ? section.name_ar : section.name_en;
  return { title: `${sectionName} — ${modelName} | QEV` };
}

// ─── Layout renderers ──────────────────────────────────────────────────────────
// Image-based layouts (gallery/grid/cards) are handled by <ContentImageGrid> (links to detail page).

function ListLayout({ items, isAr }: { items: ApiContentItem[]; isAr: boolean }) {
  return (
    <div className="space-y-3">
      {items.map(item => (
        <div key={item.id} className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl p-4 flex gap-4 items-start transition-all">
          {(item.image_url ?? item.thumbnail_url) && (
            <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
              <Image src={(item.image_url ?? item.thumbnail_url)!} alt={item.title_ar} fill className="object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">{isAr ? item.title_ar : (item.title_en ?? item.title_ar)}</h3>
            {(isAr ? item.description_ar : item.description_en) && (
              <p className="text-sm text-gray-400 line-clamp-2 mt-1">{isAr ? item.description_ar : item.description_en}</p>
            )}
            {item.external_url && (
              <a href={item.external_url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:underline mt-1 block">{item.external_url}</a>
            )}
          </div>
          {item.is_pinned && <span className="text-yellow-500 flex-shrink-0">📌</span>}
        </div>
      ))}
    </div>
  );
}

function VideoGridLayout({ items, isAr }: { items: ApiContentItem[]; isAr: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(item => {
        const ytId = item.video_url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
        const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : item.thumbnail_url ?? item.image_url;
        return (
          <a key={item.id} href={item.video_url ?? '#'} target="_blank" rel="noopener noreferrer"
            className="group bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl overflow-hidden transition-all block">
            <div className="relative h-44 bg-gray-800">
              {thumb && <Image src={thumb} alt={item.title_ar} fill className="object-cover" />}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-black/70 flex items-center justify-center text-2xl group-hover:bg-black/90 transition-colors">▶️</div>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-medium text-sm line-clamp-2">{isAr ? item.title_ar : (item.title_en ?? item.title_ar)}</h3>
              {item.views_count > 0 && <p className="text-xs text-gray-500 mt-1">👁 {item.views_count.toLocaleString()}</p>}
            </div>
          </a>
        );
      })}
    </div>
  );
}

function DownloadListLayout({ items, isAr }: { items: ApiContentItem[]; isAr: boolean }) {
  const fileIcons: Record<string, string> = { PDF: '📄', APK: '📱', ZIP: '🗜️', RAR: '🗜️' };
  return (
    <div className="space-y-3">
      {items.map(item => {
        const ext = (item.metadata?.file_type ?? item.file_url?.split('.').pop() ?? '').toUpperCase();
        return (
          <div key={item.id}
            className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl p-4 flex gap-4 items-center transition-all">
            <div className="text-3xl flex-shrink-0">{fileIcons[ext] ?? '📁'}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{isAr ? item.title_ar : (item.title_en ?? item.title_ar)}</h3>
              {(isAr ? item.description_ar : item.description_en) && (
                <p className="text-sm text-gray-400 line-clamp-1 mt-0.5">{isAr ? item.description_ar : item.description_en}</p>
              )}
              <div className="flex gap-3 mt-1.5 text-xs text-gray-500">
                {ext && <span className="font-mono">{ext}</span>}
                {item.metadata?.version && <span>v{item.metadata.version}</span>}
                {item.file_size_label !== '—' && <span>{item.file_size_label}</span>}
                <span>⬇️ {item.downloads_count.toLocaleString()}</span>
              </div>
            </div>
            {item.file_url && (
              <a href={item.file_url} download
                className="flex-shrink-0 bg-white text-black text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-200 transition-colors">
                {isAr ? 'تحميل' : 'Download'}
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FaqAccordionLayout({ items, isAr }: { items: ApiContentItem[]; isAr: boolean }) {
  return (
    <div className="space-y-2">
      {items.map(item => (
        <details key={item.id} className="group bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-gray-800 transition-colors">
            <span className="font-medium">{isAr ? item.title_ar : (item.title_en ?? item.title_ar)}</span>
            <span className="text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ms-4">▼</span>
          </summary>
          <div className="px-4 pb-4 text-gray-300 leading-relaxed">
            {isAr
              ? (item.metadata?.answer_ar ?? item.description_ar ?? '')
              : (item.metadata?.answer_en ?? item.description_en ?? item.metadata?.answer_ar ?? item.description_ar ?? '')}
          </div>
        </details>
      ))}
    </div>
  );
}

function SectionContent({ section, items, isAr, locale, brandSlug, sectionSlug, modelSlug }: {
  section: ApiBrandSection; items: ApiContentItem[]; isAr: boolean;
  locale: string; brandSlug: string; sectionSlug: string; modelSlug: string;
}) {
  if (items.length === 0) return (
    <div className="text-center py-20 text-gray-500">
      <p className="text-5xl mb-3">{section.icon}</p>
      <p>{isAr ? 'لا يوجد محتوى بعد' : 'No content yet'}</p>
    </div>
  );
  const gridProps = { items, isAr, locale, brandSlug, sectionSlug, modelSlug };
  switch (section.layout_type) {
    case 'gallery':       return <ContentImageGrid {...gridProps} layout="gallery" />;
    case 'video_grid':    return <VideoGridLayout items={items} isAr={isAr} />;
    case 'download_list': return <DownloadListLayout items={items} isAr={isAr} />;
    case 'faq_accordion': return <FaqAccordionLayout items={items} isAr={isAr} />;
    case 'list':          return <ListLayout items={items} isAr={isAr} />;
    case 'cards':         return <ContentImageGrid {...gridProps} layout="cards" />;
    default:              return <ContentImageGrid {...gridProps} layout="grid" />;
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function ModelSectionPage({ params, searchParams }: Props) {
  const isAr = params.locale === 'ar';
  const page = Number(searchParams.page ?? 1);

  const [brand, { model }, { section, data: items, meta }] = await Promise.all([
    fetchBrand(params.slug),
    fetchModelWithSections(params.slug, params.model),
    fetchModelSectionContent(params.slug, params.model, params.section, page),
  ]);

  if (!model || !section) notFound();

  const modelName = isAr ? model.name_ar : (model.name_en ?? model.name_ar);
  const brandName = brand ? (isAr ? brand.name_ar : (brand.name_en ?? brand.name_ar)) : '';
  const sectionName = isAr ? section.name_ar : section.name_en;
  const primaryColor = brand?.primary_color ?? '#3b82f6';

  return (
    <main className="min-h-screen bg-black text-white" dir={isAr ? 'rtl' : 'ltr'}>
      {section.cover_image_url && (
        <div className="relative h-36 overflow-hidden">
          <Image src={section.cover_image_url} alt={sectionName} fill className="object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 flex-wrap">
          <Link href={`/${params.locale}/brands`} className="hover:text-white">{isAr ? 'الماركات' : 'Brands'}</Link>
          <span>/</span>
          <Link href={`/${params.locale}/brands/${params.slug}`} className="hover:text-white">{brandName}</Link>
          <span>/</span>
          <Link href={`/${params.locale}/brands/${params.slug}/models/${params.model}`} className="hover:text-white">{modelName}</Link>
          <span>/</span>
          <span className="text-white">{sectionName}</span>
        </div>

        {/* Title */}
        <div className="flex items-center gap-3 mb-2">
          {brand?.logo_url && (
            <Image src={brand.logo_url} alt={brandName} width={28} height={28} className="object-contain" />
          )}
          <h1 className="text-2xl font-bold">{section.icon} {sectionName}</h1>
        </div>
        <p className="text-gray-500 text-sm mb-2">{modelName}</p>
        {(isAr ? section.description_ar : section.description_en) && (
          <p className="text-gray-400 text-sm mb-6">{isAr ? section.description_ar : section.description_en}</p>
        )}
        <p className="text-gray-500 text-sm mb-8">{meta.total ?? items.length} {isAr ? 'عنصر' : 'items'}</p>

        <SectionContent section={section} items={items} isAr={isAr}
          locale={params.locale} brandSlug={params.slug} sectionSlug={params.section} modelSlug={params.model} />

        {/* Pagination */}
        {(meta.last_page ?? 1) > 1 && (
          <div className="flex justify-center gap-2 mt-10 flex-wrap">
            {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
              <Link key={p}
                href={`/${params.locale}/brands/${params.slug}/models/${params.model}/${params.section}?page=${p}`}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm ${p === page ? 'text-black font-bold' : 'bg-gray-800 hover:bg-gray-700'}`}
                style={p === page ? { backgroundColor: primaryColor } : {}}>
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
