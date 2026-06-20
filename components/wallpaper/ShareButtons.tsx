'use client';

import { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { type Wallpaper } from '@/lib/api';
import { type Locale } from '@/lib/i18n';

interface ShareButtonsProps {
  wallpaper: Wallpaper;
  locale: Locale;
  siteUrl: string;
  title: string;
}

export function ShareButtons({ wallpaper, locale, siteUrl, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const isAr = locale === 'ar';

  const pageUrl = `${siteUrl}/${locale}/wallpaper/${wallpaper.slug}`;
  const encodedUrl = encodeURIComponent(pageUrl);
  const encodedTitle = encodeURIComponent(title);

  async function copyLink() {
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-4 bg-gray-900 rounded-xl">
      <div className="flex items-center gap-2 mb-3">
        <Share2 className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-400">{isAr ? 'مشاركة' : 'Share'}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={copyLink}
          className="flex flex-col items-center gap-1 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          {copied ? (
            <Check className="w-5 h-5 text-green-400" />
          ) : (
            <Copy className="w-5 h-5 text-gray-300" />
          )}
          <span className="text-xs text-gray-400">{isAr ? 'نسخ' : 'Copy'}</span>
        </button>

        <a
          href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 p-3 bg-gray-800 hover:bg-green-900/30 rounded-lg transition-colors"
        >
          <span className="text-xl">📱</span>
          <span className="text-xs text-gray-400">WhatsApp</span>
        </a>

        <a
          href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center gap-1 p-3 bg-gray-800 hover:bg-blue-900/30 rounded-lg transition-colors"
        >
          <span className="text-xl">🐦</span>
          <span className="text-xs text-gray-400">Twitter</span>
        </a>
      </div>
    </div>
  );
}
