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
}

interface MemberContextValue {
  member: Member | null;
  loading: boolean;
  login: (token: string, member: Member) => void;
  logout: () => void;
}

const MemberContext = createContext<MemberContextValue>({
  member: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const logout = useCallback(() => {
    memberFetch('/member/logout', { method: 'POST' }).catch(() => {});
    setMemberToken(null);
    setMember(null);
  }, []);

  return <MemberContext.Provider value={{ member, loading, login, logout }}>{children}</MemberContext.Provider>;
}

export const useMember = () => useContext(MemberContext);
