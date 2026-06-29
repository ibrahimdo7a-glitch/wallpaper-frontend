'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useMember } from '@/lib/member-auth';
import { getMemberToken } from '@/lib/member-api';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://api.qev.app').replace(/\/$/, '');
const GULF = ['قطر', 'السعودية', 'الإمارات', 'الكويت', 'البحرين', 'عُمان'];
const CURRENCIES = ['QAR', 'SAR', 'AED', 'KWD', 'BHD', 'OMR', 'USD'];

type Section = { id: number; slug: string; name_ar: string; name_en: string | null; icon: string | null };
type Model = { id: number; name_ar: string; name_en: string | null };
type Brand = { id: number; name_ar: string; name_en: string | null; models: Model[] };

export default function SellPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0c11]" />}>
      <SellForm />
    </Suspense>
  );
}

function SellForm() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ar';
  const isAr = locale === 'ar';
  const { member, loading } = useMember();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  const [section, setSection] = useState<'cars' | 'parts'>('cars');
  const [listingType, setListingType] = useState('car_sale');
  const [categoryId, setCategoryId] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandId, setBrandId] = useState('');       // '' | "<id>" | 'other'
  const [customBrand, setCustomBrand] = useState('');
  const [modelId, setModelId] = useState('');        // '' | "<id>" | 'other'
  const [customModel, setCustomModel] = useState('');
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

  // Edit mode: load the member's own listing into the form.
  useEffect(() => {
    if (!editId || !member) return;
    fetch(`${API_BASE}/api/v1/member/listings/${editId}`, {
      headers: { Accept: 'application/json', Authorization: `Bearer ${getMemberToken()}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const x = d?.data;
        if (!x) return;
        setSection(x.section);
        setListingType(x.listing_type || 'car_sale');
        setCategoryId(x.market_category_id ? String(x.market_category_id) : '');
        setTitle(x.title_ar || '');
        setDesc(x.description_ar || '');
        setPrice(x.price != null ? String(x.price) : '');
        setCurrency(x.currency || 'QAR');
        setNegotiable(!!x.is_negotiable);
        setCondition(x.condition || '');
        setCountry(x.country || 'قطر');
        setCity(x.city || '');
        if (x.brand_id) setBrandId(String(x.brand_id));
        else if (x.custom_brand) { setBrandId('other'); setCustomBrand(x.custom_brand); }
        if (x.car_model_id) setModelId(String(x.car_model_id));
        else if (x.custom_model) { setModelId('other'); setCustomModel(x.custom_model); }
        setPhone(x.contact_phone || '');
        setWhatsapp(x.contact_whatsapp || '');
        setExistingImages(x.images || []);
        setRejectionReason(x.status === 'rejected' ? x.rejection_reason : null);
      })
      .catch(() => {});
  }, [editId, member]);

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/market/config`, { headers: { Accept: 'application/json' } })
      .then((r) => r.json())
      .then((d) => { setSections(d?.parts?.sections ?? []); setBrands(d?.brands ?? []); })
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
      // Brand: a real brand id, or a typed "other" value.
      if (/^\d+$/.test(brandId)) fd.append('brand_id', brandId);
      else if (brandId === 'other' && customBrand.trim()) fd.append('custom_brand', customBrand.trim());
      // Model: a real model id, or a typed value (when brand or model is "other").
      if (/^\d+$/.test(modelId)) fd.append('car_model_id', modelId);
      else if (customModel.trim() && (brandId === 'other' || modelId === 'other')) fd.append('custom_model', customModel.trim());
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

      const path = editId ? `/api/v1/member/listings/${editId}` : '/api/v1/member/listings';
      const res = await fetch(`${API_BASE}${path}`, {
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
        <h1 className="text-2xl font-extrabold mb-6">{editId ? (isAr ? '✏️ تعديل الإعلان' : 'Edit listing') : (isAr ? 'أضف إعلان' : 'Post a listing')}</h1>

        {rejectionReason && (
          <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
            <p className="font-bold text-rose-300">{isAr ? '❌ تم رفض إعلانك' : '❌ Listing rejected'}</p>
            <p className="text-sm text-rose-200/90 mt-1">{isAr ? 'السبب: ' : 'Reason: '}{rejectionReason}</p>
            <p className="text-xs text-neutral-400 mt-2">{isAr ? 'عدّل الإعلان أدناه وأعد إرساله للمراجعة.' : 'Fix the listing below and resubmit.'}</p>
          </div>
        )}

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

            {/* Brand + Model (cars = the car; parts = compatible car). "Other" lets the member type a custom value. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className={lbl}>{section === 'parts' ? (isAr ? 'الماركة المتوافقة' : 'Compatible brand') : (isAr ? 'الماركة' : 'Brand')}</label>
                <select value={brandId} onChange={(e) => { setBrandId(e.target.value); setModelId(''); setCustomModel(''); }} className={input}>
                  <option value="">{isAr ? 'اختر الماركة' : 'Select brand'}</option>
                  {brands.map((b) => <option key={b.id} value={String(b.id)}>{isAr ? b.name_ar : (b.name_en ?? b.name_ar)}</option>)}
                  <option value="other">{isAr ? 'أخرى (اكتبها)' : 'Other (type it)'}</option>
                </select>
                {brandId === 'other' && (
                  <input value={customBrand} onChange={(e) => setCustomBrand(e.target.value)} maxLength={60} className={`${input} mt-2`} placeholder={isAr ? 'اكتب اسم الماركة' : 'Type the brand'} />
                )}
              </div>
              <div>
                <label className={lbl}>{isAr ? 'الموديل' : 'Model'}</label>
                {brandId && brandId !== 'other' ? (
                  <>
                    <select value={modelId} onChange={(e) => { setModelId(e.target.value); if (e.target.value !== 'other') setCustomModel(''); }} className={input}>
                      <option value="">{isAr ? 'اختر الموديل' : 'Select model'}</option>
                      {(brands.find((b) => String(b.id) === brandId)?.models ?? []).map((m) => (
                        <option key={m.id} value={String(m.id)}>{isAr ? m.name_ar : (m.name_en ?? m.name_ar)}</option>
                      ))}
                      <option value="other">{isAr ? 'أخرى (اكتبه)' : 'Other (type it)'}</option>
                    </select>
                    {modelId === 'other' && (
                      <input value={customModel} onChange={(e) => setCustomModel(e.target.value)} maxLength={60} className={`${input} mt-2`} placeholder={isAr ? 'اكتب اسم الموديل' : 'Type the model'} />
                    )}
                  </>
                ) : (
                  <input value={customModel} onChange={(e) => setCustomModel(e.target.value)} maxLength={60} disabled={!brandId} className={`${input} disabled:opacity-50`} placeholder={brandId ? (isAr ? 'اكتب الموديل' : 'Type the model') : (isAr ? 'اختر الماركة أولًا' : 'Select brand first')} />
                )}
              </div>
            </div>

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

            <div>
              <label className={lbl}>{isAr ? 'الاسم 🔒 (من حسابك)' : 'Name 🔒 (your account)'}</label>
              <input value={member?.name || '—'} readOnly title={isAr ? 'يظهر هذا الاسم في إعلانك ولا يمكن تغييره' : 'Shown on your listing'}
                className={`${input} opacity-70 cursor-not-allowed`} />
              <p className="text-xs text-neutral-500 mt-1">{isAr ? 'أضف هاتفًا أو واتساب ليتمكّن المشترون من التواصل معك.' : 'Add a phone or WhatsApp so buyers can reach you.'}</p>
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
              {editId && existingImages.length > 0 && images.length === 0 && (
                <div className="mb-2">
                  <div className="grid grid-cols-5 gap-2">
                    {existingImages.slice(0, 10).map((img, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={img} alt="" className="aspect-square w-full rounded-lg object-cover bg-white/5" />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">{isAr ? 'الصور الحالية — ارفع صورًا جديدة لاستبدالها.' : 'Current images — upload new ones to replace.'}</p>
                </div>
              )}
              <input type="file" multiple accept="image/*" onChange={(e) => setImages(Array.from(e.target.files || []))}
                className="block w-full text-sm text-neutral-400 file:me-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-white/10 file:text-white" />
              {images.length > 0 && <p className="text-xs text-neutral-500 mt-1">{images.length} {isAr ? 'صورة مختارة' : 'selected'}</p>}
            </div>

            {error && <p className="text-rose-400 text-sm">{error}</p>}

            <button onClick={submit} disabled={submitting}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold transition-colors">
              {submitting ? (isAr ? 'جارٍ الإرسال…' : 'Submitting…') : editId ? (isAr ? 'إرسال التعديل للمراجعة' : 'Resubmit for review') : (isAr ? 'إرسال الإعلان' : 'Submit')}
            </button>
            <p className="text-xs text-neutral-500 text-center">{isAr ? 'يُراجَع إعلانك قبل النشر.' : 'Reviewed before publishing.'}</p>
          </div>
        )}
      </div>
    </main>
  );
}
