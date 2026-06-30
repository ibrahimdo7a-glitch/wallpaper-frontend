'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const API = (process.env.NEXT_PUBLIC_API_URL || 'https://api.qev.app').replace(/\/$/, '');

/** Persistent visitor id (localStorage) / per-session id (sessionStorage). */
function getId(key: string, store: Storage): string {
  try {
    let v = store.getItem(key);
    if (!v) {
      v = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2);
      store.setItem(key, v);
    }
    return v;
  } catch {
    return 'anon';
  }
}

/**
 * First-party analytics beacon. Sends a pageview on each route change and a
 * lightweight presence heartbeat every 45s while the tab is visible. Uses fetch
 * keepalive (non-blocking) and forwards the member token so logged-in members
 * are attributed. Complements Vercel/GA4 for the deep web metrics.
 */
export function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const visitorId = getId('qev_vid', window.localStorage);
    const sessionId = getId('qev_sid', window.sessionStorage);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
      const token = window.localStorage.getItem('qev_member_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    } catch { /* ignore */ }

    const send = (type: 'pageview' | 'heartbeat') => {
      try {
        const params = new URLSearchParams(window.location.search);
        const body = JSON.stringify({
          visitor_id: visitorId,
          session_id: sessionId,
          type,
          path: pathname || window.location.pathname,
          referrer: document.referrer || '',
          utm_source: params.get('utm_source') || '',
        });
        fetch(`${API}/api/v1/track/hit`, { method: 'POST', headers, body, keepalive: true }).catch(() => {});
      } catch { /* ignore */ }
    };

    // One pageview per distinct path.
    if (lastPath.current !== pathname) {
      lastPath.current = pathname ?? '';
      send('pageview');
    }

    // Presence heartbeat (keeps "online now" accurate) while the tab is visible.
    const hb = setInterval(() => {
      if (document.visibilityState === 'visible') send('heartbeat');
    }, 45000);

    return () => clearInterval(hb);
  }, [pathname]);

  return null;
}
