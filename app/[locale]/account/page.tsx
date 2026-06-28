'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useMember } from '@/lib/member-auth';
import { memberFetch } from '@/lib/member-api';

interface MyListing {
  id: number; title_ar: string; slug: string; price: number | null; currency: string;
  cover_url: string | null; status: string; rejection_reason?: string | null; created_at: string;
}

const STATUS_AR: Record<string, { t: string; c: string }> = {
  published: { t: 'منشور', c: 'text-emerald-400' },
  pending: { t: 'بانتظار المراجعة', c: 'text-amber-400' },
  rejected: { t: 'مرفوض', c: 'text-rose-400' },
  sold: { t: 'مُباع', c: 'text-neutral-400' },
  hidden: { t: 'مخفي', c: 'text-neutral-400' },
};

export default function AccountPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const isAr = locale === 'ar';
  const { member, loading, logout } = useMember();

  const [listings, setListings] = useState<MyListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [saved, setSaved] = useState<MyListing[]>([]);
  const [newsTg, setNewsTg] = useState(false);

  useEffect(() => {
    if (!member) return;
    setNewsTg(member.news_telegram);
    memberFetch('/member/listings')
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((d) => setListings(d.data ?? []))
      .catch(() => {})
      .finally(() => setListingsLoading(false));
    memberFetch('/member/saves?type=listing')
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((d) => setSaved(d.data ?? []))
      .catch(() => {});
  }, [member]);

  const toggleNews = async () => {
    const next = !newsTg;
    setNewsTg(next);
    try {
      await memberFetch('/member/prefs', { method: 'POST', body: JSON.stringify({ news_telegram: next }) });
    } catch {
      setNewsTg(!next);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0c11] text-neutral-100" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto px-4 py-12">
        {loading ? (
          <div className="h-40 flex items-center justify-center text-neutral-500">{isAr ? 'جارٍ التحميل…' : 'Loading…'}</div>
        ) : !member ? (
          <div className="text-center py-20 space-y-4 border border-dashed border-white/10 rounded-2xl">
            <p className="text-neutral-400">{isAr ? 'سجّل الدخول أولًا من زر «دخول» بالأعلى.' : 'Please sign in from the button above.'}</p>
            <Link href={`/${locale}`} className="inline-block px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15">{isAr ? 'الرئيسية' : 'Home'}</Link>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between gap-4 flex-wrap">
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
              <Link href={`/${locale}/sell`} className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm">➕ {isAr ? 'أضف إعلان' : 'Post listing'}</Link>
            </div>

            <button onClick={toggleNews} className="w-full flex items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-colors text-start">
              <div className="min-w-0">
                <p className="text-sm font-semibold flex items-center gap-2">📩 {isAr ? 'تنبيهات الأخبار على تلجرام' : 'News alerts on Telegram'}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{isAr ? 'يوصلك كل خبر جديد برسالة من البوت' : 'Get every new article as a bot message'}</p>
              </div>
              <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold ${newsTg ? 'bg-emerald-500 text-black' : 'bg-white/10 text-neutral-400'}`}>
                {newsTg ? (isAr ? 'مُفعّل' : 'On') : (isAr ? 'إيقاف' : 'Off')}
              </span>
            </button>

            <section>
              <h2 className="text-lg font-bold mb-3">{isAr ? 'إعلاناتي' : 'My listings'}</h2>
              {listingsLoading ? (
                <p className="text-neutral-500 text-sm">{isAr ? 'جارٍ التحميل…' : 'Loading…'}</p>
              ) : listings.length === 0 ? (
                <p className="text-neutral-500 text-sm py-8 text-center border border-dashed border-white/10 rounded-2xl">{isAr ? 'لا توجد إعلانات بعد.' : 'No listings yet.'}</p>
              ) : (
                <div className="space-y-2">
                  {listings.map((l) => {
                    const st = STATUS_AR[l.status] ?? { t: l.status, c: 'text-neutral-400' };
                    const inner = (
                      <div className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white/5 shrink-0">
                          {l.cover_url ? <Image src={l.cover_url} alt="" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl text-white/10">🛒</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{l.title_ar}</p>
                          <p className="text-xs text-emerald-400">{l.price != null ? `${l.price.toLocaleString()} ${l.currency}` : (isAr ? 'حسب الطلب' : 'On request')}</p>
                        </div>
                        <span className={`text-xs font-semibold ${st.c}`}>{isAr ? st.t : l.status}</span>
                      </div>
                    );
                    if (l.status === 'published') {
                      return <Link key={l.id} href={`/${locale}/market/${l.slug}`}>{inner}</Link>;
                    }
                    return (
                      <div key={l.id} className="space-y-1">
                        {inner}
                        {l.status === 'rejected' && l.rejection_reason && (
                          <p className="text-xs text-rose-300/90 px-2">❌ {isAr ? 'سبب الرفض:' : 'Reason:'} {l.rejection_reason}</p>
                        )}
                        {(l.status === 'rejected' || l.status === 'pending') && (
                          <Link href={`/${locale}/sell?edit=${l.id}`} className="inline-block text-xs font-semibold text-sky-400 hover:underline px-2">
                            ✏️ {isAr ? 'تعديل وإعادة الإرسال' : 'Edit & resubmit'}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">{isAr ? 'محفوظاتي ❤️' : 'Saved ❤️'}</h2>
              {saved.length === 0 ? (
                <p className="text-neutral-500 text-sm py-8 text-center border border-dashed border-white/10 rounded-2xl">{isAr ? 'لا توجد محفوظات بعد.' : 'Nothing saved yet.'}</p>
              ) : (
                <div className="space-y-2">
                  {saved.map((l) => (
                    <Link key={l.id} href={`/${locale}/market/${l.slug}`} className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white/5 shrink-0">
                        {l.cover_url ? <Image src={l.cover_url} alt="" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl text-white/10">🛒</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{l.title_ar}</p>
                        <p className="text-xs text-emerald-400">{l.price != null ? `${l.price.toLocaleString()} ${l.currency}` : (isAr ? 'حسب الطلب' : 'On request')}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <button onClick={logout} className="px-4 py-2 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-white font-semibold">
              {isAr ? 'تسجيل الخروج' : 'Logout'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
