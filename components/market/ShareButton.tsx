'use client';

import { useState } from 'react';

/** "Share" button → a lightweight modal with Telegram / WhatsApp / copy-link options. */
export function ShareButton({ title, isAr }: { title: string; isAr: boolean }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = typeof window !== 'undefined' ? window.location.href : '';
  const tg = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  return (
    <>
      <button
        onClick={() => { setCopied(false); setOpen(true); }}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 transition-colors"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        {isAr ? 'مشاركة' : 'Share'}
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div
            className="bg-[#0f1216] border border-white/10 rounded-2xl p-5 w-full max-w-xs shadow-xl"
            dir={isAr ? 'rtl' : 'ltr'}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">{isAr ? 'مشاركة الإعلان' : 'Share listing'}</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white text-lg leading-none">✕</button>
            </div>

            <div className="space-y-2">
              <a href={tg} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 w-full p-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"/></svg>
                <span className="font-semibold">{isAr ? 'تلجرام' : 'Telegram'}</span>
              </a>

              <a href={wa} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 w-full p-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 transition-colors">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.39 5.034l-.999 3.648 3.999-1.05zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/></svg>
                <span className="font-semibold">{isAr ? 'واتساب' : 'WhatsApp'}</span>
              </a>

              <button onClick={copy}
                className="flex items-center gap-3 w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 transition-colors">
                <span className="text-xl">🔗</span>
                <span className="font-semibold">{copied ? (isAr ? 'تم النسخ ✓' : 'Copied ✓') : (isAr ? 'نسخ رابط الإعلان' : 'Copy link')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
