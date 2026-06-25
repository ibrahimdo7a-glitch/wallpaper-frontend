'use client';

import { useEffect } from 'react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://api.qev.app').replace(/\/$/, '');

/** Counts one site visit per browser session (used by the homepage statistics). */
export function VisitTracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem('qev_visit')) return;
      sessionStorage.setItem('qev_visit', '1');
    } catch {
      /* sessionStorage unavailable — still count, just not de-duped */
    }
    fetch(`${API_BASE}/api/v1/track/visit`, { method: 'POST', keepalive: true }).catch(() => {});
  }, []);

  return null;
}
