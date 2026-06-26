'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMember } from '@/lib/member-auth';
import { getMemberToken } from '@/lib/member-api';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://api.qev.app').replace(/\/$/, '');
const GULF = ['قطر', 'السعودية', 'الإمارات', 'الكويت', 'البحرين', 'عُمان'];
const CURRENCIES = ['QAR', 'SAR', 'AED', 'KWD', 'BHD', 'OMR', 'USD'];

type Section = { id: number; slug: string; name_ar: string; name_en: string | null; icon: string | null };

export default function SellPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const isAr = locale === 'ar';
  const { member, loading } = useMember();

  const [section, setSection] = useState<'cars' | 'parts'>('cars');
  const [listingType, setListingType] = useState('car_sale');
  const [categoryId, setCategoryId] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('QAR');
  const [negotiable, setNegotiable] = useState(false);
  const [condition, setCondition] = useState('');
  const [country, setCountry] = useState('قطر');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [images, setImages] = useState<File[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (member?.username) setTelegram((t) => t || member.username || '');
  }, [member]);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/market/config`, { headers: { Accept: 'application/json' } })
      .then((r) => r.json())
      .then((d) => setSections(d?.parts?.sections ?? []))
      .catch(() => {});
  }, []);

  const submit = async () => {
    setError('');
    if (!title.trim()) { setError(isAr ? 'العنوان مطلوب' : 'Title required'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('section', section);
      if (section === 'cars') fd.append('listing_type', listingType);
      if (section === 'parts' && categoryId) fd.append('market_category_id', categoryId);
      fd.append('title_ar', title);
      if (desc) fd.append('description_ar', desc);
      if (price) fd.append('price', price);
      fd.append('currency', currency);
      if (negotiable) fd.append('is_negotiable', '1');
      if (condition) fd.append('condition', condition);
      fd.append('country', country);
      if (city) fd.append('city', city);
      if (phone) fd.append('contact_phone', phone);
      if (whatsapp) fd.append('contact_whatsapp', whatsapp);
      if (telegram) fd.append('contact_telegram', telegram);
      images.slice(0, 10).forEach((f) => fd.append('images[]', f));

      const res = await fetch(`${API_BASE}/api/v1/member/listings`, {
        method: 'POST',
        headers: { Accept: 'application/json', Authorization: `Bearer ${getMemberToken()}` },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || data?.message || (isAr ? 'تعذّر الإرسال' : 'Failed'));
        return;
      }
      setDone(data?.message || (isAr ? 'تم استلام إعلانك' : 'Submitted'));
    } catch {
      setError(isAr ? 'تعذّر الاتصال' : 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const input = 'w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-sky-500';
  const lbl = 'block text-sm text-neutral-400 mb-1';

  return (
    <main className="min-h-screen bg-[#0a0c11] text-neutral-100" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-extrabold mb-6">{isAr ? 'أضف إعلان' : 'Post a listing'}</h1>

        {loading ? (
          <p className="text-neutral-500">{isAr ? 'جارٍ التحميل…' : 'Loading…'}</p>
        ) : !member ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
            <p className="text-neutral-400 mb-4">{isAr ? 'سجّل الدخول أولًا من زر «دخول» بالأعلى.' : 'Sign in first.'}</p>
            <Link href={`/${locale}`} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15">{isAr ? 'الرئيسية' : 'Home'}</Link>
          </div>
        ) : done ? (
          <div className="text-center py-16 border border-emerald-500/30 bg-emerald-500/5 rounded-2xl space-y-4">
            <div className="text-5xl">✅</div>
            <p className="text-emerald-300 font-bold text-lg">{done}</p>
            <div className="flex gap-2 justify-center">
              <Link href={`/${locale}/account`} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15">{isAr ? 'إعلاناتي' : 'My listings'}</Link>
              <Link href={`/${locale}`} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15">{isAr ? 'الرئيسية' : 'Home'}</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Section */}
            <div className="grid grid-cols-2 gap-2">
              {(['cars', 'parts'] as const).map((s) => (
                <button key={s} onClick={() => setSection(s)} type="button"
                  className={`py-2.5 rounded-xl font-semibold transition-colors ${section === s ? 'bg-white text-black' : 'bg-white/5 text-neutral-300'}`}>
                  {s === 'cars' ? (isAr ? '🚗 سيارة' : '🚗 Car') : (isAr ? '🔧 قطعة / اكسسوار' : '🔧 Part')}
                </button>
              ))}
            </div>

            {section === 'cars' ? (
              <div>
                <label className={lbl}>{isAr ? 'النوع' : 'Type'}</label>
                <select value={listingType} onChange={(e) => setListingType(e.target.value)} className={input}>
                  <option value="car_sale">{isAr ? 'للبيع' : 'For sale'}</option>
                  <option value="car_request">{isAr ? 'طلب شراء' : 'Wanted'}</option>
                </select>
              </div>
            ) : (
              <div>
                <label className={lbl}>{isAr ? 'القسم' : 'Section'}</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={input}>
                  <option value="">{isAr ? 'اختر القسم' : 'Select'}</option>
                  {sections.map((s) => <option key={s.slug} value={String(s.id)}>{s.icon} {isAr ? s.name_ar : (s.name_en ?? s.name_ar)}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className={lbl}>{isAr ? 'العنوان *' : 'Title *'}</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} placeholder={isAr ? 'مثال: بي واي دي سيل 2024' : ''} />
            </div>

            <div>
              <label className={lbl}>{isAr ? 'الوصف' : 'Description'}</label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} className={input} />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className={lbl}>{isAr ? 'السعر' : 'Price'}</label>
                <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" inputMode="numeric" className={input} />
              </div>
              <div className="col-span-1">
                <label className={lbl}>{isAr ? 'العملة' : 'Currency'}</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={input}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-1">
                <label className={lbl}>{isAr ? 'الحالة' : 'Condition'}</label>
                <select value={condition} onChange={(e) => setCondition(e.target.value)} className={input}>
                  <option value="">—</option>
                  <option value="new">{isAr ? 'جديد' : 'New'}</option>
                  <option value="used">{isAr ? 'مستعمل' : 'Used'}</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-neutral-300">
              <input type="checkbox" checked={negotiable} onChange={(e) => setNegotiable(e.target.checked)} /> {isAr ? 'السعر قابل للتفاوض' : 'Negotiable'}
            </label>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={lbl}>{isAr ? 'الدولة' : 'Country'}</label>
                <select value={country} onChange={(e) => setCountry(e.target.value)} className={input}>
                  {GULF.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>{isAr ? 'المدينة' : 'City'}</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} className={input} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className={lbl}>{isAr ? 'هاتف' : 'Phone'}</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className={input} placeholder="974XXXXXXXX" />
              </div>
              <div>
                <label className={lbl}>{isAr ? 'واتساب' : 'WhatsApp'}</label>
                <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={input} placeholder="974XXXXXXXX" />
              </div>
              <div>
                <label className={lbl}>{isAr ? 'تلجرام 🔒 (من حسابك)' : 'Telegram 🔒 (your account)'}</label>
                <input value={telegram ? `@${telegram}` : '—'} readOnly title={isAr ? 'مرتبط بحسابك ولا يمكن تغييره' : 'Linked to your account'}
                  className={`${input} opacity-70 cursor-not-allowed`} />
              </div>
            </div>

            <div>
              <label className={lbl}>{isAr ? 'الصور (حتى ١٠)' : 'Images (up to 10)'}</label>
              <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files || []))}
                className="block w-full text-sm text-neutral-400 file:me-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white" />
              {images.length > 0 && <p className="text-xs text-neutral-500 mt-1">{images.length} {isAr ? 'صورة مختارة' : 'selected'}</p>}
            </div>

            {error && <p className="text-rose-400 text-sm">{error}</p>}

            <button onClick={submit} disabled={submitting}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold transition-colors">
              {submitting ? (isAr ? 'جارٍ الإرسال…' : 'Submitting…') : (isAr ? 'إرسال الإعلان' : 'Submit')}
            </button>
            <p className="text-xs text-neutral-500 text-center">{isAr ? 'يُراجَع إعلانك قبل النشر.' : 'Reviewed before publishing.'}</p>
          </div>
        )}
      </div>
    </main>
  );
}
