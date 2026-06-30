'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { type Locale } from '@/types';
import { translations } from '@/data/translations';
import { useMember } from '@/lib/member-auth';
import { LoginModal } from '@/components/auth/LoginModal';

interface ILink {
  label: string;
  tooltip: string;
  fileUrl: string;
}

interface HeaderProps {
  locale: Locale;
  siteName?: string;
  ilink?: ILink;
  marketLinks?: { href: string; label: string }[];
}

export function Header({ locale, siteName, marketLinks = [] }: HeaderProps) {
  const t = translations[locale];
  const pathname = usePathname();
  const isRTL = locale === 'ar';
  const otherLocale: Locale = locale === 'ar' ? 'en' : 'ar';
  const otherPath = pathname.replace(`/${locale}`, `/${otherLocale}`);
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { member, loading: memberLoading, logout, loginOpen, openLogin, closeLogin } = useMember();

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
    ...marketLinks,
    { href: `/${locale}/news`, label: isRTL ? 'الأخبار' : 'News' },
    { href: `/${locale}/apps`, label: isRTL ? 'التطبيقات' : 'Apps' },
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
          <Link href={`/${locale}`} className="flex items-center gap-2.5 min-w-0">
            <div className="flex gap-0.5 shrink-0">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-gray-900 dark:bg-white"
                  style={{ opacity: 1 - i * 0.2 }}
                />
              ))}
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm tracking-tight truncate">
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
          <div className="flex items-center gap-2 ms-auto shrink-0">
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

            {/* Member / login */}
            {!memberLoading && (member ? (
              <div className="flex items-center gap-1.5">
                <Link href={`/${locale}/account`} className="flex items-center gap-1.5 ps-1 pe-2 py-1 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  {member.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={member.photo_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-sky-600 text-white text-xs font-bold flex items-center justify-center">{(member.name || member.username || 'ع').charAt(0)}</span>
                  )}
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 max-w-[80px] truncate hidden sm:block">{member.name || member.username}</span>
                </Link>
                <button onClick={logout} title={isRTL ? 'خروج' : 'Logout'} className="w-7 h-7 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">⎋</button>
              </div>
            ) : (
              <button onClick={openLogin} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors whitespace-nowrap">
                {isRTL ? 'دخول' : 'Sign in'}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile nav — always-visible horizontal scroll bar */}
        <nav className="md:hidden flex items-center gap-1 overflow-x-auto pb-2 -mt-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <LoginModal open={loginOpen} onOpenChange={(o) => (o ? openLogin() : closeLogin())} isAr={isRTL} />
    </header>
  );
}
