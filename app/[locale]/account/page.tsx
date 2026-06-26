'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMember } from '@/lib/member-auth';

export default function AccountPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const isAr = locale === 'ar';
  const { member, loading, logout } = useMember();

  return (
    <main className="min-h-screen bg-[#0a0c11] text-neutral-100" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto px-4 py-12">
        {loading ? (
          <div className="h-40 flex items-center justify-center text-neutral-500">{isAr ? 'جارٍ التحميل…' : 'Loading…'}</div>
        ) : !member ? (
          <div className="text-center py-20 space-y-4 border border-dashed border-white/10 rounded-2xl">
            <p className="text-neutral-400">{isAr ? 'سجّل الدخول أولًا من زر "دخول" بالأعلى.' : 'Please sign in from the button above.'}</p>
            <Link href={`/${locale}`} className="inline-block px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15">{isAr ? 'الرئيسية' : 'Home'}</Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              {member.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.photo_url} alt="" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <span className="w-16 h-16 rounded-full bg-sky-600 text-white text-2xl font-bold flex items-center justify-center">{(member.name || member.username || 'ع').charAt(0)}</span>
              )}
              <div>
                <h1 className="text-2xl font-extrabold">{member.name || member.username}</h1>
                {member.username && <p className="text-neutral-400 text-sm">@{member.username}</p>}
                {member.is_premium && <span className="inline-block mt-1 text-xs font-bold bg-amber-500 text-black px-2 py-0.5 rounded-full">⭐ {isAr ? 'عضو مميّز' : 'Premium'}</span>}
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 text-sm text-neutral-400">
              {isAr ? 'قريبًا: إعلاناتك، مفضّلتك، ومتابعاتك.' : 'Coming soon: your listings, favorites, and follows.'}
            </div>

            <button onClick={logout} className="px-4 py-2 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white font-semibold">
              {isAr ? 'تسجيل الخروج' : 'Logout'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
