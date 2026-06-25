'use client';

import { useState } from 'react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://api.qev.app').replace(/\/$/, '');

export default function NewsArticleActions({
  articleId,
  initialLikes,
  url,
  title,
  isAr,
}: {
  articleId: number;
  initialLikes: number;
  url: string;
  title: string;
  isAr: boolean;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const like = async () => {
    if (liked) return;
    setLiked(true);
    setLikes((l) => l + 1);
    try {
      await fetch(`${API_BASE}/api/v1/news/${articleId}/like`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
      });
    } catch {
      setLiked(false);
      setLikes((l) => l - 1);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const tg = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;

  const btn = 'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={like}
        className={`${btn} ${liked ? 'bg-rose-600/20 text-rose-300 border border-rose-500/40' : 'bg-white/5 text-neutral-200 hover:bg-white/10 border border-white/10'}`}
      >
        <span className={liked ? 'scale-110' : ''}>{liked ? '❤️' : '🤍'}</span>
        <span className="tabular-nums">{likes}</span>
        <span>{isAr ? 'إعجاب' : 'Like'}</span>
      </button>

      <a href={tg} target="_blank" rel="noopener noreferrer"
        className={`${btn} bg-sky-600/15 text-sky-300 hover:bg-sky-600/25 border border-sky-500/30`}>
        ✈️ {isAr ? 'تلجرام' : 'Telegram'}
      </a>
      <a href={wa} target="_blank" rel="noopener noreferrer"
        className={`${btn} bg-green-600/15 text-green-300 hover:bg-green-600/25 border border-green-500/30`}>
        💬 {isAr ? 'واتساب' : 'WhatsApp'}
      </a>
      <button onClick={copy}
        className={`${btn} bg-white/5 text-neutral-200 hover:bg-white/10 border border-white/10`}>
        {copied ? `✓ ${isAr ? 'نُسخ' : 'Copied'}` : `🔗 ${isAr ? 'نسخ الرابط' : 'Copy link'}`}
      </button>
    </div>
  );
}
