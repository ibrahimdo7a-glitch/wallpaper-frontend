'use client';

import { useState } from 'react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://api.qev.app').replace(/\/$/, '');

interface Props {
  contentId: number;
  fileUrl: string | null;
  imageUrl: string | null;
  slug: string | null;
  initialLikes: number;
  initialDownloads: number;
  primaryColor: string;
  isAr: boolean;
}

export function ContentActions({ contentId, fileUrl, imageUrl, slug, initialLikes, initialDownloads, primaryColor, isAr }: Props) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [downloads, setDownloads] = useState(initialDownloads);
  const [downloading, setDownloading] = useState(false);

  async function handleLike() {
    if (liked) return;
    setLiked(true);
    setLikes(l => l + 1);
    try {
      const res = await fetch(`${API_BASE}/api/v1/content/${contentId}/like`, { method: 'POST', headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        if (typeof data.likes_count === 'number') setLikes(data.likes_count);
      }
    } catch { /* keep optimistic value */ }
  }

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    let url = fileUrl ?? imageUrl ?? '#';
    try {
      const res = await fetch(`${API_BASE}/api/v1/content/${contentId}/download`, { method: 'POST', headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        if (data.download_url) url = data.download_url;
        if (typeof data.downloads_count === 'number') setDownloads(data.downloads_count);
      }
    } catch { /* fall back to direct url */ }
    finally {
      const link = document.createElement('a');
      link.href = url;
      link.download = `wallpaper-${slug ?? contentId}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white transition-opacity disabled:opacity-60"
        style={{ backgroundColor: primaryColor }}
      >
        ⬇️ {downloading ? (isAr ? 'جاري التحميل...' : 'Downloading...') : (isAr ? 'تحميل مجاني' : 'Free Download')}
      </button>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleLike}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
            liked ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-red-400'
          }`}
        >
          {liked ? '❤️' : '🤍'} {likes.toLocaleString()}
        </button>
        <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-800 text-gray-300 font-medium">
          ⬇️ {downloads.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
