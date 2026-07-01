'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useMember } from '@/lib/member-auth';
import { memberFetch } from '@/lib/member-api';

interface MyListing {
  id: number; title_ar: string; slug: string; price: number | null; currency: string;
  cover_url: string | null; status: string; rejection_reason?: string | null;
  can_renew?: boolean; is_expired?: boolean; created_at: string;
}

interface BrandOpt { id: number; name_ar: string }
interface MarketSub { enabled: boolean; brand_id: number | null }
interface Subs { news: { enabled: boolean }; cars: MarketSub; parts: MarketSub }
interface Dash {
  stats: {
    listings_total: number; listings_published: number; listings_pending: number;
    views_total: number; saved_count: number; expiring_soon: number; member_since: string | null;
  };
  subscriptions: Subs;
  brands: BrandOpt[];
}

const STATUS_AR: Record<string, { t: string; c: string }> = {
  published: { t: 'منشور', c: 'text-emerald-400' },
  pending: { t: 'بانتظار المراجعة', c: 'text-amber-400' },
  rejected: { t: 'مرفوض', c: 'text-rose-400' },
  sold: { t: 'مُباع', c: 'text-neutral-400' },
  hidden: { t: 'متوقف', c: 'text-amber-400' },
};

export default function AccountPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const isAr = locale === 'ar';
  const { member, loading, logout } = useMember();

  const [listings, setListings] = useState<MyListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [saved, setSaved] = useState<MyListing[]>([]);
  const [dash, setDash] = useState<Dash | null>(null);
  const [subs, setSubs] = useState<Subs | null>(null);
  const [brands, setBrands] = useState<BrandOpt[]>([]);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  useEffect(() => {
    if (!member) return;
    memberFetch('/member/dashboard')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Dash | null) => { if (d) { setDash(d); setSubs(d.subscriptions); setBrands(d.brands ?? []); } })
      .catch(() => {});
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

  const doAction = async (id: number, action: 'pause' | 'resume' | 'sold' | 'renew') => {
    if (action === 'sold' && !window.confirm(isAr ? 'تعليم هذا الإعلان كمباع؟' : 'Mark this listing as sold?')) return;
    try {
      const res = await memberFetch(`/member/listings/${id}/action`, { method: 'POST', body: JSON.stringify({ action }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) { if (d?.error) showToast(d.error); return; }
      if (action === 'renew') showToast(isAr ? 'تم تجديد الإعلان ✓' : 'Listing renewed ✓');
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: d.status, can_renew: d.can_renew, is_expired: false } : l)));
    } catch { /* ignore */ }
  };

  // Persist the full subscription state; optimistic with revert on failure.
  const saveSubs = async (next: Subs) => {
    const prev = subs;
    setSubs(next);
    try {
      const res = await memberFetch('/member/subscriptions', {
        method: 'POST',
        body: JSON.stringify({
          news: next.news.enabled,
          cars_enabled: next.cars.enabled,
          cars_brand_id: next.cars.brand_id,
          parts_enabled: next.parts.enabled,
          parts_brand_id: next.parts.brand_id,
        }),
      });
      if (!res.ok) throw new Error();
      showToast(isAr ? 'تم حفظ اشتراكاتك ✓' : 'Subscriptions saved ✓');
    } catch {
      if (prev) setSubs(prev);
      showToast(isAr ? 'تعذّر الحفظ، حاول مجددًا' : 'Could not save, try again');
    }
  };

  const activeSubs = subs ? [subs.news.enabled, subs.cars.enabled, subs.parts.enabled].filter(Boolean).length : 0;
  const since = dash?.stats.member_since
    ? new Date(dash.stats.member_since).toLocaleDateString(isAr ? 'ar' : 'en', { year: 'numeric', month: 'long' })
    : null;

  // Renders one market channel card (cars / parts share the shape).
  const marketCard = (
    channel: 'cars' | 'parts', icon: string, title: string, desc: string,
  ): ReactNode => {
    if (!subs) return null;
    const s = subs[channel];
    return (
      <div className={`rounded-2xl border p-4 transition-colors ${s.enabled ? 'border-emerald-500/30 bg-emerald-500/[0.06]' : 'border-white/10 bg-white/[0.03]'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold flex items-center gap-2">{icon} {title}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{desc}</p>
          </div>
          <button
            onClick={() => saveSubs({ ...subs, [channel]: { ...s, enabled: !s.enabled } })}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-colors ${s.enabled ? 'bg-emerald-500 text-black' : 'bg-white/10 text-neutral-400 hover:bg-white/15'}`}
          >
            {s.enabled ? (isAr ? 'مُفعّل' : 'On') : (isAr ? 'إيقاف' : 'Off')}
          </button>
        </div>
        {s.enabled && (
          <div className="mt-3">
            <label className="block text-[11px] text-neutral-500 mb-1">{isAr ? 'تنبيهات لـ:' : 'Alerts for:'}</label>
            <select
              value={s.brand_id ?? ''}
              onChange={(e) => saveSubs({ ...subs, [channel]: { ...s, brand_id: e.target.value ? Number(e.target.value) : null } })}
              className="w-full rounded-lg bg-[#171a21] border border-white/10 text-sm px-3 py-2 text-neutral-100 focus:outline-none focus:border-emerald-500/50"
            >
              <option value="">{isAr ? '🌐 كل الماركات' : '🌐 All brands'}</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name_ar}</option>)}
            </select>
          </div>
        )}
      </div>
    );
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
          <div className="space-y-7">
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

            {/* ── Stats window ── */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold flex items-center gap-2">📊 {isAr ? 'لوحتي' : 'My dashboard'}</p>
                {since && <p className="text-[11px] text-neutral-500">{isAr ? `عضو منذ ${since}` : `Member since ${since}`}</p>}
              </div>

              {!dash ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[0, 1, 2, 3].map((i) => <div key={i} className="h-[76px] rounded-2xl bg-white/[0.04] animate-pulse" />)}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <Stat icon="📢" value={dash.stats.listings_total} label={isAr ? 'إعلاناتي' : 'Listings'}
                      sub={isAr ? `${dash.stats.listings_published} منشور` : `${dash.stats.listings_published} live`} color="text-sky-400" />
                    <Stat icon="👁️" value={dash.stats.views_total} label={isAr ? 'مشاهدات إعلاناتي' : 'Listing views'} color="text-violet-400" />
                    <Stat icon="❤️" value={dash.stats.saved_count} label={isAr ? 'محفوظاتي' : 'Saved'} color="text-rose-400" />
                    <Stat icon="🔔" value={activeSubs} label={isAr ? 'اشتراكاتي النشطة' : 'Active alerts'} color="text-emerald-400" />
                  </div>

                  {dash.stats.expiring_soon > 0 && (
                    <div className="mt-2.5 flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] px-3.5 py-2.5 text-xs text-amber-300">
                      ⏳ {isAr
                        ? `لديك ${dash.stats.expiring_soon} إعلان ينتهي خلال ٣ أيام — جدّدها من قائمة «إعلاناتي» بالأسفل.`
                        : `${dash.stats.expiring_soon} listing(s) expire within 3 days — renew them below.`}
                    </div>
                  )}
                </>
              )}
            </section>

            {/* ── Subscriptions ── */}
            <section>
              <h2 className="text-lg font-bold mb-1">{isAr ? 'اشتراكاتي 🔔' : 'My subscriptions 🔔'}</h2>
              <p className="text-xs text-neutral-500 mb-3">{isAr ? 'اختر ما يهمّك ويوصلك فورًا برسالة على تلجرام.' : 'Pick what matters — delivered instantly to your Telegram.'}</p>
              {!subs ? (
                <div className="grid gap-2.5 sm:grid-cols-3">
                  {[0, 1, 2].map((i) => <div key={i} className="h-24 rounded-2xl bg-white/[0.04] animate-pulse" />)}
                </div>
              ) : (
                <div className="grid gap-2.5 sm:grid-cols-3">
                  {/* News */}
                  <div className={`rounded-2xl border p-4 transition-colors ${subs.news.enabled ? 'border-emerald-500/30 bg-emerald-500/[0.06]' : 'border-white/10 bg-white/[0.03]'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold flex items-center gap-2">📰 {isAr ? 'الأخبار' : 'News'}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{isAr ? 'كل خبر جديد يوصلك على تلجرام' : 'Every new article on Telegram'}</p>
                      </div>
                      <button
                        onClick={() => saveSubs({ ...subs, news: { enabled: !subs.news.enabled } })}
                        className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-colors ${subs.news.enabled ? 'bg-emerald-500 text-black' : 'bg-white/10 text-neutral-400 hover:bg-white/15'}`}
                      >
                        {subs.news.enabled ? (isAr ? 'مُفعّل' : 'On') : (isAr ? 'إيقاف' : 'Off')}
                      </button>
                    </div>
                  </div>

                  {marketCard('cars', '🚗', isAr ? 'سوق السيارات' : 'Car market', isAr ? 'كل إعلان بيع أو طلب سيارة' : 'Every car sale/request')}
                  {marketCard('parts', '🔧', isAr ? 'سوق قطع الغيار' : 'Parts market', isAr ? 'كل قطعة غيار وإكسسوار جديد' : 'Every new part/accessory')}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-lg font-bold mb-3">{isAr ? 'إعلاناتي' : 'My listings'}</h2>
              {listingsLoading ? (
                <p className="text-neutral-500 text-sm">{isAr ? 'جارٍ التحميل…' : 'Loading…'}</p>
              ) : listings.length === 0 ? (
                <p className="text-neutral-500 text-sm py-8 text-center border border-dashed border-white/10 rounded-2xl">{isAr ? 'لا توجد إعلانات بعد.' : 'No listings yet.'}</p>
              ) : (
                <div className="space-y-2">
                  {listings.map((l) => {
                    const expired = l.status === 'published' && l.is_expired;
                    const st = expired
                      ? { t: 'منتهي الصلاحية', c: 'text-rose-400' }
                      : (STATUS_AR[l.status] ?? { t: l.status, c: 'text-neutral-400' });
                    const topRow = (
                      <div className="flex items-center gap-3 p-3">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-white/5 shrink-0">
                          {l.cover_url ? <Image src={l.cover_url} alt="" fill className="object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl text-white/10">🛒</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{l.title_ar}</p>
                          <p className="text-xs text-emerald-400">{l.price != null ? `${l.price.toLocaleString()} ${l.currency}` : (isAr ? 'حسب الطلب' : 'On request')}</p>
                        </div>
                        <span className={`text-xs font-semibold ${st.c}`}>{isAr ? st.t : (expired ? 'Expired' : l.status)}</span>
                      </div>
                    );

                    const actions: ReactNode[] = [];
                    if (l.status === 'rejected' || l.status === 'pending') {
                      actions.push(<Link key="edit" href={`/${locale}/sell?edit=${l.id}`} className="text-xs font-semibold text-sky-400 hover:underline">✏️ {isAr ? 'تعديل وإعادة الإرسال' : 'Edit & resubmit'}</Link>);
                    }
                    if (l.status === 'published') {
                      // Renew is always clickable; the API replies with a light message if it's too soon (before 7 days).
                      actions.push(<button key="renew" onClick={() => doAction(l.id, 'renew')} className="text-xs font-semibold text-sky-400 hover:underline">🔄 {isAr ? 'تجديد' : 'Renew'}</button>);
                      actions.push(<button key="pause" onClick={() => doAction(l.id, 'pause')} className="text-xs font-semibold text-amber-400 hover:underline">⏸ {isAr ? 'إيقاف' : 'Pause'}</button>);
                      actions.push(<button key="sold" onClick={() => doAction(l.id, 'sold')} className="text-xs font-semibold text-neutral-300 hover:underline">✅ {isAr ? 'تم البيع' : 'Sold'}</button>);
                    }
                    if (l.status === 'hidden') {
                      actions.push(<button key="resume" onClick={() => doAction(l.id, 'resume')} className="text-xs font-semibold text-emerald-400 hover:underline">▶ {isAr ? 'إعادة النشر' : 'Resume'}</button>);
                      actions.push(<button key="sold" onClick={() => doAction(l.id, 'sold')} className="text-xs font-semibold text-neutral-300 hover:underline">✅ {isAr ? 'تم البيع' : 'Sold'}</button>);
                    }
                    if (l.status === 'sold') {
                      actions.push(<button key="resume" onClick={() => doAction(l.id, 'resume')} className="text-xs font-semibold text-emerald-400 hover:underline">▶ {isAr ? 'إعادة النشر' : 'Re-list'}</button>);
                    }

                    return (
                      <div key={l.id} className="rounded-xl bg-white/[0.03] border border-white/5 overflow-hidden">
                        {l.status === 'published'
                          ? <Link href={`/${locale}/market/${l.slug}`} className="block hover:bg-white/[0.02]">{topRow}</Link>
                          : topRow}

                        {l.status === 'rejected' && l.rejection_reason && (
                          <p className="text-xs text-rose-300/90 px-3 pb-1">❌ {isAr ? 'سبب الرفض:' : 'Reason:'} {l.rejection_reason}</p>
                        )}

                        {actions.length > 0 && (
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-3 py-2 border-t border-white/5 bg-white/[0.02]">
                            {actions}
                          </div>
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

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[120] max-w-[90vw] rounded-xl bg-[#171a21] border border-white/15 px-4 py-2.5 text-sm text-neutral-100 shadow-xl text-center" dir={isAr ? 'rtl' : 'ltr'}>
          {toast}
        </div>
      )}
    </main>
  );
}

function Stat({ icon, value, label, sub, color }: { icon: string; value: number; label: string; sub?: string; color: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/5 p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">{icon} {label}</div>
      <div className={`text-2xl font-extrabold mt-1 ${color}`}>{value.toLocaleString()}</div>
      {sub && <div className="text-[10px] text-neutral-500 mt-0.5">{sub}</div>}
    </div>
  );
}
