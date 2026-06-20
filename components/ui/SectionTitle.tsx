import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { type Locale } from '@/lib/i18n';

interface SectionTitleProps {
  titleAr: string;
  titleEn: string;
  locale: Locale;
  href?: string;
}

export function SectionTitle({ titleAr, titleEn, locale, href }: SectionTitleProps) {
  const isAr = locale === 'ar';
  const title = isAr ? titleAr : titleEn;
  const ChevronIcon = isAr ? ChevronLeft : ChevronRight;

  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
        >
          {isAr ? 'عرض الكل' : 'View All'}
          <ChevronIcon className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
