'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getMemberToken, memberFetch, setMemberToken } from './member-api';

export interface Member {
  id: number;
  name: string | null;
  username: string | null;
  photo_url: string | null;
  tier: string;
  is_premium: boolean;
  news_telegram: boolean;
}

interface MemberContextValue {
  member: Member | null;
  loading: boolean;
  login: (token: string, member: Member) => void;
  logout: () => void;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
}

const MemberContext = createContext<MemberContextValue>({
  member: null,
  loading: true,
  login: () => {},
  logout: () => {},
  loginOpen: false,
  openLogin: () => {},
  closeLogin: () => {},
});

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginOpen, setLoginOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const openLogin = useCallback(() => setLoginOpen(true), []);
  const closeLogin = useCallback(() => setLoginOpen(false), []);

  const dismissNotice = useCallback(() => {
    setNotice(null);
    memberFetch('/member/notice/ack', { method: 'POST' }).catch(() => {});
  }, []);

  useEffect(() => {
    const token = getMemberToken();
    if (!token) {
      setLoading(false);
      return;
    }
    memberFetch('/member/me')
      .then(async (r) => {
        if (r.ok) {
          const d = await r.json();
          setMember(d.member);
          if (d.notice) setNotice(d.notice);
        } else {
          setMemberToken(null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((token: string, m: Member) => {
    setMemberToken(token);
    setMember(m);
    setLoginOpen(false);
  }, []);

  const logout = useCallback(() => {
    memberFetch('/member/logout', { method: 'POST' }).catch(() => {});
    setMemberToken(null);
    setMember(null);
  }, []);

  return (
    <MemberContext.Provider value={{ member, loading, login, logout, loginOpen, openLogin, closeLogin }}>
      {children}
      {notice && (
        <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-[#0f1216] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="text-3xl mb-3">📩</div>
            <h3 className="font-bold text-white text-lg mb-2">رسالة من الإدارة</h3>
            <p className="text-neutral-200 text-sm leading-relaxed whitespace-pre-line mb-5">{notice}</p>
            <button
              onClick={dismissNotice}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
            >
              حسنًا، فهمت
            </button>
            <p className="text-[11px] text-neutral-500 mt-3">هذه الرسالة تظهر مرة واحدة فقط</p>
          </div>
        </div>
      )}
    </MemberContext.Provider>
  );
}

export const useMember = () => useContext(MemberContext);
