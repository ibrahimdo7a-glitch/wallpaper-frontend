'use client';

import { useEffect } from 'react';

/**
 * Disables the right-click context menu and image dragging WHILE MOUNTED.
 * It's rendered only on the wallpaper display page, so it's scoped to that page:
 * navigating anywhere else unmounts it and restores normal behaviour.
 *
 * This is a light deterrent against casually saving the wallpaper — it does NOT
 * stop screenshots or DevTools. The real lock is the members-only download gate.
 */
export function NoImageSave() {
  useEffect(() => {
    const block = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', block);
    document.addEventListener('dragstart', block);
    return () => {
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('dragstart', block);
    };
  }, []);

  return null;
}
