'use client';

import { useEffect, useState } from 'react';

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
  max?: number;
  isAr: boolean;
}

/**
 * Accumulating image picker: pick images (they add up, don't replace), see a
 * thumbnail for each with an ✕ to remove it, capped at `max`.
 */
export function ImageUploader({ files, onChange, max = 3, isAr }: Props) {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list).filter((f) => f.type.startsWith('image/'));
    onChange([...files, ...incoming].slice(0, max));
  };

  const removeAt = (i: number) => onChange(files.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {previews.map((src, i) => (
          <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label="remove"
              className="absolute top-1 end-1 w-6 h-6 rounded-full bg-black/70 hover:bg-black text-white text-sm flex items-center justify-center"
            >
              ✕
            </button>
            {i === 0 && (
              <span className="absolute bottom-1 start-1 text-[10px] px-1.5 py-0.5 rounded bg-black/70 text-white">
                {isAr ? 'الغلاف' : 'Cover'}
              </span>
            )}
          </div>
        ))}

        {files.length < max && (
          <label className="aspect-square rounded-xl border-2 border-dashed border-white/15 hover:border-sky-500 flex flex-col items-center justify-center cursor-pointer text-neutral-400 hover:text-sky-400 transition-colors">
            <span className="text-2xl leading-none">＋</span>
            <span className="text-[11px] mt-1">{isAr ? 'أضف صورة' : 'Add'}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => { addFiles(e.target.files); e.currentTarget.value = ''; }}
            />
          </label>
        )}
      </div>
      <p className="text-xs text-neutral-500 mt-1.5">
        {files.length}/{max} {isAr ? '— أول صورة هي الغلاف' : '— first image is the cover'}
      </p>
    </div>
  );
}
