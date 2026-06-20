'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { wallpaperApi } from '@/lib/api';
import { type Locale } from '@/lib/i18n';

interface ReportModalProps {
  wallpaperId: number;
  locale: Locale;
  open: boolean;
  onClose: () => void;
}

const REASONS = {
  copyright: { ar: 'انتهاك حقوق الملكية', en: 'Copyright violation' },
  inappropriate: { ar: 'محتوى غير لائق', en: 'Inappropriate content' },
  spam: { ar: 'سبام', en: 'Spam' },
  offensive: { ar: 'محتوى مسيء', en: 'Offensive content' },
  other: { ar: 'أخرى', en: 'Other' },
};

export function ReportModal({ wallpaperId, locale, open, onClose }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const isAr = locale === 'ar';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) return;
    setSubmitting(true);
    try {
      await wallpaperApi.report(wallpaperId, { reason, message: message || undefined });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setReason('');
        setMessage('');
        onClose();
      }, 2000);
    } catch {
      alert(isAr ? 'حدث خطأ' : 'Error occurred');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">
            {isAr ? 'الإبلاغ عن خلفية' : 'Report Wallpaper'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-green-400">{isAr ? 'تم إرسال البلاغ' : 'Report submitted'}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">
                {isAr ? 'سبب البلاغ' : 'Reason'}
              </label>
              <div className="space-y-2">
                {Object.entries(REASONS).map(([key, labels]) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="reason"
                      value={key}
                      checked={reason === key}
                      onChange={(e) => setReason(e.target.value)}
                      className="text-blue-500"
                    />
                    <span className="text-gray-300 text-sm">{labels[isAr ? 'ar' : 'en']}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">
                {isAr ? 'تفاصيل إضافية (اختياري)' : 'Additional details (optional)'}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                placeholder={isAr ? 'اكتب تفاصيل...' : 'Write details...'}
              />
            </div>

            <button
              type="submit"
              disabled={!reason || submitting}
              className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition-colors"
            >
              {submitting
                ? (isAr ? 'جاري الإرسال...' : 'Submitting...')
                : (isAr ? 'إرسال البلاغ' : 'Submit Report')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
