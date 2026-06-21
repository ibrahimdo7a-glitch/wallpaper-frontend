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
      <div className="flex items-center gap-3">
        <div className="w-1 h-7 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm font-medium text-gray-400 hover:text-white transition-colors group"
        >
          {isAr ? 'عرض الكل' : 'View All'}
          <ChevronIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}
