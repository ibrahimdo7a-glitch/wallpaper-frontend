'use client';

import { useState } from 'react';
import { type Locale } from '@/lib/i18n';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'https://api.qev.app').replace(/\/$/, '');

export default function NewsSubscribeForm({ locale }: { locale: Locale }) {
  const isAr = locale === 'ar';
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [msg, setMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch(`${API_BASE}/api/v1/news/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, name, subscribe_all: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMsg(data.message ?? (isAr ? 'تم الاشتراك بنجاح!' : 'Subscribed successfully!'));
        setEmail('');
        setName('');
      } else {
        setStatus('error');
        setMsg(data.message ?? (isAr ? 'حدث خطأ، حاول مجدداً' : 'An error occurred, try again.'));
      }
    } catch {
      setStatus('error');
      setMsg(isAr ? 'تعذّر الاتصال بالخادم' : 'Could not reach server');
    }
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6" dir={isAr ? 'rtl' : 'ltr'}>
      <h3 className="text-lg font-bold mb-1">
        {isAr ? '📬 اشترك في أخبار السيارات' : '📬 Subscribe to Car News'}
      </h3>
      <p className="text-sm text-gray-400 mb-4">
        {isAr ? 'احصل على آخر الأخبار مباشرة في بريدك الإلكتروني' : 'Get the latest news directly to your inbox'}
      </p>

      {status === 'success' ? (
        <p className="text-green-400 font-medium">{msg}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder={isAr ? 'الاسم (اختياري)' : 'Name (optional)'}
            value={name}
            onChange={e => setName(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-500"
          />
          <input
            type="email"
            placeholder={isAr ? 'بريدك الإلكتروني' : 'Your email'}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-500"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-white text-black font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? '...' : (isAr ? 'اشتراك' : 'Subscribe')}
          </button>
        </form>
      )}

      {status === 'error' && (
        <p className="text-red-400 text-sm mt-2">{msg}</p>
      )}
    </div>
  );
}
