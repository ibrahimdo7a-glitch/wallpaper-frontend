'use client';

import { useState } from 'react';
import { useMember } from '@/lib/member-auth';
import { memberFetch } from '@/lib/member-api';

/** Footer "Contact us" link + a lightweight in-page modal (max 200 chars, members only). */
export function ContactWidget({ isAr }: { isAr: boolean }) {
  const { member, openLogin } = useMember();
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const reset = () => { setMsg(''); setDone(false); setError(''); };

  const send = async () => {
    if (!msg.trim() || sending) return;
    setSending(true); setError('');
    try {
      const res = await memberFetch('/contact', { method: 'POST', body: JSON.stringify({ message: msg.trim() }) });
      if (res.status === 401) { setOpen(false); openLogin(); return; }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data?.error || (isAr ? 'تعذّر الإرسال' : 'Failed to send')); return; }
      setDone(true); setMsg('');
    } catch {
      setError(isAr ? 'تعذّر الاتصال' : 'Network error');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => { reset(); setOpen(true); }}
        className="text-gray-500 dark:text-gray-400 text-xs hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        {isAr ? 'تواصل معنا' : 'Contact us'}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div
            className="bg-[#0f1216] border border-white/10 rounded-2xl p-5 w-full max-w-sm shadow-xl"
            dir={isAr ? 'rtl' : 'ltr'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white">{isAr ? 'تواصل معنا' : 'Contact us'}</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white text-lg leading-none">✕</button>
            </div>

            {done ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">✅</div>
                <p className="text-emerald-300 text-sm">{isAr ? 'تم إرسال رسالتك، شكرًا لك.' : 'Your message was sent. Thank you.'}</p>
              </div>
            ) : !member ? (
              <div className="text-center py-4 space-y-3">
                <p className="text-sm text-neutral-400">{isAr ? 'سجّل الدخول بتلجرام لإرسال رسالة.' : 'Sign in with Telegram to send a message.'}</p>
                <button
                  onClick={() => { setOpen(false); openLogin(); }}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold"
                >
                  {isAr ? 'تسجيل الدخول' : 'Sign in'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={msg}
                  onChange={(e) => setMsg(e.target.value.slice(0, 200))}
                  maxLength={200}
                  rows={4}
                  placeholder={isAr ? 'اكتب رسالتك (حتى ٢٠٠ حرف)...' : 'Your message (up to 200 chars)...'}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-sky-500 resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">{msg.length}/200</span>
                  <button
                    onClick={send}
                    disabled={sending || !msg.trim()}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-semibold"
                  >
                    {sending ? (isAr ? 'جارٍ الإرسال...' : 'Sending...') : (isAr ? 'إرسال' : 'Send')}
                  </button>
                </div>
                {error && <p className="text-rose-400 text-xs">{error}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
