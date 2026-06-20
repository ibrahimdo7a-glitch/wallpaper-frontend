'use client';

import { useState } from 'react';
import { Download, Heart, Flag } from 'lucide-react';
import { wallpaperApi, type Wallpaper } from '@/lib/api';
import { type Locale } from '@/lib/i18n';
import { ReportModal } from './ReportModal';

interface WallpaperActionsProps {
  wallpaper: Wallpaper;
  locale: Locale;
}

export function WallpaperActions({ wallpaper, locale }: WallpaperActionsProps) {
  const [likes, setLikes] = useState(wallpaper.likes_count);
  const [liked, setLiked] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const isAr = locale === 'ar';

  async function handleLike() {
    if (liked) return;
    try {
      const res = await wallpaperApi.like(wallpaper.id);
      if (!res.data.already_liked) {
        setLikes((l) => l + 1);
      }
      setLiked(true);
    } catch {}
  }

  async function handleDownload() {
    if (downloading) return;
    setDownloading(true);
    try {
      const res = await wallpaperApi.download(wallpaper.id);
      const link = document.createElement('a');
      link.href = res.data.download_url;
      link.download = `wallpaper-${wallpaper.slug}`;
      link.click();
    } catch {
      alert(isAr ? 'حدث خطأ أثناء التحميل' : 'Download error occurred');
    } finally {
      setDownloading(false);
    }
  }

  if (wallpaper.is_paid) {
    return (
      <div className="space-y-3">
        <div className="p-4 bg-yellow-900/30 border border-yellow-700 rounded-xl text-center">
          <p className="text-yellow-300 font-bold text-lg">
            {wallpaper.price} {wallpaper.currency}
          </p>
          <p className="text-yellow-400/70 text-sm">{isAr ? 'خلفية مدفوعة' : 'Paid Wallpaper'}</p>
        </div>
        <button
          disabled
          className="w-full py-3 bg-yellow-600 rounded-xl font-semibold text-white opacity-60 cursor-not-allowed"
        >
          {isAr ? 'اشتر الآن (قريبًا)' : 'Buy Now (Coming Soon)'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-wait rounded-xl font-semibold text-white transition-colors"
      >
        <Download className="w-5 h-5" />
        {downloading
          ? (isAr ? 'جاري التحميل...' : 'Downloading...')
          : (isAr ? 'تحميل مجاني' : 'Free Download')}
      </button>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleLike}
          className={`flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
            liked
              ? 'bg-red-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-red-400'
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          {likes}
        </button>

        <button
          onClick={() => setReportOpen(true)}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-red-400 font-medium transition-colors"
        >
          <Flag className="w-4 h-4" />
          {isAr ? 'إبلاغ' : 'Report'}
        </button>
      </div>

      <ReportModal
        wallpaperId={wallpaper.id}
        locale={locale}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </div>
  );
}
