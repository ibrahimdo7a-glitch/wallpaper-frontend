'use client';

import { useState } from 'react';
import { useMember } from '@/lib/member-auth';
import { memberFetch } from '@/lib/member-api';

interface Props {
  appId: number;
  locale: string;
  hasApk: boolean;
  hasExternal: boolean;
}

export function AppDownloadButton({ appId, locale, hasApk, hasExternal }: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const isAr = locale === 'ar';
  const { member, openLogin } = useMember();

  const handleDownload = async () => {
    if (loading || (!hasApk && !hasExternal)) return;
    // Downloads are members-only — open the login modal for guests.
    if (!member) {
      openLogin();
      return;
    }
    setLoading(true);
    try {
      const res = await memberFetch(`/apps/${appId}/download`, { method: 'POST' });
      if (res.status === 401) {
        openLogin();
        return;
      }
      const data = await res.json();
      if (data.download_url) {
        window.open(data.download_url, '_blank', 'noopener');
        setDone(true);
        setTimeout(() => setDone(false), 3000);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (!hasApk && !hasExternal) {
    return (
      <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800 text-gray-500 text-sm cursor-not-allowed">
        {isAr ? 'غير متوفر حالياً' : 'Not available'}
      </div>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`inline-flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${
        done
          ? 'bg-green-600 text-white'
          : 'bg-primary-600 hover:bg-primary-700 active:scale-95 text-white'
      } disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      {loading ? (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : done ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      )}
      {done
        ? (isAr ? 'جاري التحميل...' : 'Downloading...')
        : (isAr ? 'تحميل التطبيق' : 'Download App')
      }
    </button>
  );
}
