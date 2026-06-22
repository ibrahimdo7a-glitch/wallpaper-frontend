'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { type Locale } from '@/types';
import { translations } from '@/data/translations';

interface ILink {
  label: string;
  tooltip: string;
  fileUrl: string;
}

interface HeaderProps {
  locale: Locale;
  siteName?: string;
  ilink?: ILink;
}

export function Header({ locale, siteName, ilink }: HeaderProps) {
  const t = translations[locale];
  const pathname = usePathname();
  const isRTL = locale === 'ar';
  const otherLocale: Locale = locale === 'ar' ? 'en' : 'ar';
  const otherPath = pathname.replace(`/${locale}`, `/${otherLocale}`);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDark(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  const navLinks = [
    { href: `/${locale}`, label: t.nav.home },
    { href: `/${locale}/brands`, label: isRTL ? 'الماركات' : 'Brands' },
    { href: `/${locale}/news`, label: isRTL ? 'الأخبار' : 'News' },
    { href: `/${locale}/apps`, label: isRTL ? 'التطبيقات' : 'Apps' },
    { href: `/${locale}/categories`, label: t.nav.categories },
    { href: `/${locale}/most-downloaded`, label: t.nav.mostDownloaded },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur shadow-sm border-b border-gray-100 dark:border-gray-800'
          : 'bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-4">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2.5 shrink-0">
            <div className="flex gap-0.5">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-gray-900 dark:bg-white"
                  style={{ opacity: 1 - i * 0.2 }}
                />
              ))}
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm tracking-tight">
              {siteName || t.siteName}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'text-gray-900 dark:text-white border-b-2 border-gray-900 dark:border-white rounded-none pb-0'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 ms-auto">
            {/* iLink download button */}
            {ilink && ilink.fileUrl && (
              <div className="relative group">
                <a
                  href={ilink.fileUrl}
                  download
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                    <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                  </svg>
                  {ilink.label || (locale === 'ar' ? 'تحميل' : 'Download')}
                </a>
                {ilink.tooltip && (
                  <div className="absolute top-full mt-2 end-0 z-50 hidden group-hover:block w-48 rounded-lg bg-gray-900 dark:bg-gray-700 text-white text-xs p-2.5 shadow-lg text-center leading-relaxed pointer-events-none">
                    {ilink.tooltip}
                    <div className="absolute -top-1.5 end-4 w-3 h-3 bg-gray-900 dark:bg-gray-700 rotate-45" />
                  </div>
                )}
              </div>
            )}

            {/* Dark mode */}
            <button
              onClick={toggleDark}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? '☀️' : '🌙'}
            </button>

            {/* Language switcher */}
            <Link
              href={otherPath}
              className="px-3 py-1 rounded-full text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {otherLocale === 'ar' ? 'عربي' : 'EN'}
            </Link>

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-gray-700 dark:text-gray-300 text-lg">{menuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
