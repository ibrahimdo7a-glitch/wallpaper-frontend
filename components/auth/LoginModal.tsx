'use client';

import { useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { QRCodeSVG } from 'qrcode.react';
import { useMember } from '@/lib/member-auth';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://api.qev.app').replace(/\/$/, '');

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAr: boolean;
}

type Session = { token: string; deep_link: string; bot_username: string } | null;

export function LoginModal({ open, onOpenChange, isAr }: Props) {
  const { login } = useMember();
  const [session, setSession] = useState<Session>(null);
  const [status, setStatus] = useState<'idle' | 'waiting' | 'expired' | 'error'>('idle');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPoll = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const begin = async () => {
    stopPoll();
    setStatus('waiting');
    setSession(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/telegram/start`, { method: 'POST', headers: { Accept: 'application/json' } });
      if (!res.ok) { setStatus('error'); return; }
      const s = await res.json();
      setSession(s);

      pollRef.current = setInterval(async () => {
        try {
          const r = await fetch(`${API_BASE}/api/v1/auth/telegram/status?token=${encodeURIComponent(s.token)}`, { headers: { Accept: 'application/json' } });
          const d = await r.json();
          if (d.status === 'verified') {
            stopPoll();
            login(d.api_token, d.member);
            onOpenChange(false);
          } else if (d.status === 'expired') {
            stopPoll();
            setStatus('expired');
          }
        } catch { /* keep polling */ }
      }, 2500);
    } catch {
      setStatus('error');
    }
  };

  // Start a fresh session whenever the modal opens; clean up on close.
  useEffect(() => {
    if (open) begin();
    else { stopPoll(); setSession(null); setStatus('idle'); }
    return stopPoll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm" />
        <Dialog.Content
          dir={isAr ? 'rtl' : 'ltr'}
          className="fixed left-1/2 top-1/2 z-[101] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[#0f1219] border border-white/10 p-6 text-neutral-100 shadow-2xl">
          <Dialog.Title className="text-xl font-extrabold text-center">{isAr ? 'الدخول عبر تلجرام' : 'Sign in with Telegram'}</Dialog.Title>
          <Dialog.Description className="text-sm text-neutral-400 text-center mt-1">
            {isAr ? 'آمن وسريع — بدون كلمة مرور' : 'Secure & fast — no password'}
          </Dialog.Description>

          {status === 'error' && (
            <div className="mt-6 text-center space-y-3">
              <p className="text-rose-400 text-sm">{isAr ? 'تعذّر بدء الدخول. حاول مرة ثانية.' : 'Could not start. Try again.'}</p>
              <button onClick={begin} className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 font-semibold">{isAr ? 'إعادة المحاولة' : 'Retry'}</button>
            </div>
          )}

          {status === 'expired' && (
            <div className="mt-6 text-center space-y-3">
              <p className="text-amber-400 text-sm">{isAr ? 'انتهت صلاحية الرمز.' : 'The code expired.'}</p>
              <button onClick={begin} className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 font-semibold">{isAr ? 'رمز جديد' : 'New code'}</button>
            </div>
          )}

          {status === 'waiting' && (
            <div className="mt-6 space-y-5">
              {/* Mobile: open the app directly */}
              <a href={session?.deep_link} target="_blank" rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold transition-colors ${session ? 'bg-sky-600 hover:bg-sky-500' : 'bg-white/10 pointer-events-none opacity-60'}`}>
                <span>✈️</span> {isAr ? 'افتح تلجرام واضغط Start' : 'Open Telegram & press Start'}
              </a>

              {/* Desktop: scan with phone */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-neutral-500">{isAr ? 'أو امسح الكود بكاميرا جوالك' : 'Or scan with your phone'}</span>
                <div className="bg-white p-3 rounded-xl">
                  {session ? <QRCodeSVG value={session.deep_link} size={168} /> : <div className="w-[168px] h-[168px] animate-pulse bg-neutral-200 rounded" />}
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {isAr ? 'بانتظار التأكيد من تلجرام…' : 'Waiting for Telegram…'}
              </div>
            </div>
          )}

          <Dialog.Close className="absolute top-3 end-3 w-8 h-8 rounded-full hover:bg-white/10 text-neutral-400 flex items-center justify-center">✕</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
