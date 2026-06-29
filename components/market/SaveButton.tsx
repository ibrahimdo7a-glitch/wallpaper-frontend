'use client';

import { useEffect, useState } from 'react';
import { useMember } from '@/lib/member-auth';
import { memberFetch } from '@/lib/member-api';

export function SaveButton({ type, id, isAr }: { type: 'listing' | 'content' | 'news'; id: number; isAr: boolean }) {
  const { member } = useMember();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!member) return;
    memberFetch(`/member/saved-ids?type=${type}`)
      .then((r) => (r.ok ? r.json() : { ids: [] }))
      .then((d) => setSaved((d.ids || []).includes(id)))
      .catch(() => {});
  }, [member, type, id]);

  if (!member) return null;

  const toggle = async () => {
    setBusy(true);
    const next = !saved;
    setSaved(next); // optimistic
    try {
      const r = await memberFetch('/member/saves/toggle', { method: 'POST', body: JSON.stringify({ type, id }) });
      const d = await r.json();
      setSaved(!!d.saved);
    } catch {
      setSaved(!next); // revert
    } finally {
      setBusy(false);
    }
  };

  return (
    <button onClick={toggle} disabled={busy}
      className={`flex items-center justify-center gap-1.5 w-full py-2 rounded-xl font-medium text-sm transition-colors ${saved ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30' : 'bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10'}`}>
      <span className="text-base leading-none">{saved ? '❤️' : '🤍'}</span>
      {isAr ? (saved ? 'محفوظ' : 'حفظ') : (saved ? 'Saved' : 'Save')}
    </button>
  );
}
