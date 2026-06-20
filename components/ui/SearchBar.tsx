'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { type Locale } from '@/lib/i18n';

interface SearchBarProps {
  locale: Locale;
  initialQuery?: string;
  large?: boolean;
}

export function SearchBar({ locale, initialQuery = '', large = false }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const isAr = locale === 'ar';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/${locale}/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl mx-auto">
      <Search className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'right-4' : 'left-4'} ${large ? 'w-5 h-5' : 'w-4 h-4'} text-gray-400`} />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={isAr ? 'ابحث عن خلفيات...' : 'Search wallpapers...'}
        className={`w-full bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-gray-800 transition-all ${
          large
            ? `${isAr ? 'pr-14 pl-6' : 'pl-14 pr-6'} py-4 text-lg`
            : `${isAr ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-sm`
        }`}
      />
      <button
        type="submit"
        className={`absolute top-1/2 -translate-y-1/2 ${isAr ? 'left-2' : 'right-2'} ${large ? 'px-4 py-2' : 'px-3 py-1.5'} bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-colors`}
      >
        {isAr ? 'بحث' : 'Search'}
      </button>
    </form>
  );
}
