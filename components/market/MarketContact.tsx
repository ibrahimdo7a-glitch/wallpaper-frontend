'use client';

import { useEffect } from 'react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://api.qev.app').replace(/\/$/, '');

interface Props {
  listingId: number;
  contact: { name: string | null; phone: string | null; whatsapp: string | null; telegram: string | null };
  title: string;
  isAr: boolean;
}

export function MarketContact({ listingId, contact, title, isAr }: Props) {
  // Count one real view per browser session.
  useEffect(() => {
    const key = `qev_market_viewed_${listingId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch { /* ignore */ }
    fetch(`${API_BASE}/api/v1/market/${listingId}/view`, { method: 'POST', keepalive: true }).catch(() => {});
  }, [listingId]);

  const msg = encodeURIComponent((isAr ? 'مرحبًا، بخصوص إعلان: ' : 'Hi, about: ') + title);
  const wa = contact.whatsapp ? `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}?text=${msg}` : null;
  const tg = contact.telegram ? `https://t.me/${contact.telegram.replace(/^@/, '')}` : null;
  const tel = contact.phone ? `tel:${contact.phone.replace(/\s/g, '')}` : null;

  if (!wa && !tel && !tg) {
    return <p className="text-sm text-neutral-500">{isAr ? 'لا توجد معلومات تواصل' : 'No contact info'}</p>;
  }

  return (
    <div className="space-y-2">
      {contact.name && <p className="text-sm text-neutral-400 mb-3">{isAr ? 'المُعلِن:' : 'Seller:'} <span className="text-white font-medium">{contact.name}</span></p>}
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors">
          <span>💬</span> {isAr ? 'تواصل عبر واتساب' : 'WhatsApp'}
        </a>
      )}
      {tel && (
        <a href={tel}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold bg-white/10 hover:bg-white/15 text-white transition-colors">
          <span>📞</span> {isAr ? 'اتصال' : 'Call'} {contact.phone}
        </a>
      )}
      {tg && (
        <a href={tg} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors">
          <span>✈️</span> {isAr ? 'تلجرام' : 'Telegram'}
        </a>
      )}
    </div>
  );
}
