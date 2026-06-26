'use client';

import { useEffect, useState } from 'react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://api.qev.app').replace(/\/$/, '');

interface Props {
  listingId: number;
  contact: { name: string | null; has_phone: boolean; whatsapp: string | null; telegram: string | null };
  title: string;
  isAr: boolean;
}

/** Extract a bare Telegram username from whatever the admin typed (@user, t.me/user, https://t.me/user…). */
function tgUsername(raw: string): string {
  return raw
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^(www\.)?(t|telegram)\.me\//i, '')
    .replace(/^@/, '')
    .split(/[/?#\s]/)[0]
    .trim();
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
  const tgUser = contact.telegram ? tgUsername(contact.telegram) : '';
  const tg = tgUser ? `https://t.me/${tgUser}` : null;

  // ─── Phone reveal: hidden until a simple human check is solved ───
  const [phase, setPhase] = useState<'hidden' | 'asking' | 'revealed'>('hidden');
  const [challenge, setChallenge] = useState<{ a: number; b: number } | null>(null);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState<string | null>(null);

  const newChallenge = () => setChallenge({ a: 2 + Math.floor(Math.random() * 8), b: 2 + Math.floor(Math.random() * 8) });

  const startReveal = () => {
    setError(false);
    setAnswer('');
    newChallenge();
    setPhase('asking');
  };

  const submitAnswer = async () => {
    if (!challenge) return;
    if (parseInt(answer, 10) !== challenge.a + challenge.b) {
      setError(true);
      setAnswer('');
      newChallenge();
      return;
    }
    setError(false);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/market/${listingId}/phone`);
      const data = await res.json();
      setPhone(data?.phone ?? null);
      setPhase('revealed');
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!wa && !tg && !contact.has_phone) {
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

      {tg && (
        <a href={tg} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors">
          <span>✈️</span> {isAr ? 'تلجرام' : 'Telegram'}
        </a>
      )}

      {contact.has_phone && phase === 'hidden' && (
        <button onClick={startReveal}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold bg-white/10 hover:bg-white/15 text-white transition-colors">
          <span>📞</span> {isAr ? 'إظهار رقم الهاتف' : 'Show phone number'}
        </button>
      )}

      {contact.has_phone && phase === 'asking' && challenge && (
        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4 space-y-3">
          <p className="text-sm text-neutral-300 text-center">
            {isAr ? 'تأكيد بشري: كم يساوي' : 'Human check: what is'} <span className="font-bold text-white">{challenge.a} + {challenge.b}</span> ؟
          </p>
          <div className="flex gap-2">
            <input
              type="number" inputMode="numeric" value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
              autoFocus
              className="flex-1 min-w-0 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-center outline-none focus:border-sky-500"
              placeholder={isAr ? 'الإجابة' : 'Answer'}
            />
            <button onClick={submitAnswer} disabled={loading}
              className="px-4 py-2 rounded-lg font-semibold bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white transition-colors whitespace-nowrap">
              {loading ? '…' : (isAr ? 'تأكيد' : 'Verify')}
            </button>
          </div>
          {error && <p className="text-xs text-rose-400 text-center">{isAr ? 'إجابة غير صحيحة، حاول مرة ثانية' : 'Wrong answer, try again'}</p>}
        </div>
      )}

      {phase === 'revealed' && phone && (
        <a href={`tel:${phone.replace(/\s/g, '')}`}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold bg-white/10 hover:bg-white/15 text-white transition-colors" dir="ltr">
          <span>📞</span> {phone}
        </a>
      )}
      {phase === 'revealed' && !phone && (
        <p className="text-sm text-neutral-500 text-center">{isAr ? 'تعذّر جلب الرقم' : 'Could not load the number'}</p>
      )}
    </div>
  );
}
