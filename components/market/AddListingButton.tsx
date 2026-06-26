'use client';

import Link from 'next/link';
import { useMember } from '@/lib/member-auth';

export function AddListingButton({ locale, isAr }: { locale: string; isAr: boolean }) {
  const { member } = useMember();
  if (!member) return null;
  return (
    <Link
      href={`/${locale}/sell`}
      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors shrink-0"
    >
      ➕ {isAr ? 'أضف إعلان' : 'Post listing'}
    </Link>
  );
}
