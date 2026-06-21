export const translations = {
  ar: {
    siteName: 'خلفيات ليوبارد',
    nav: {
      home: 'الرئيسية',
      categories: 'الأقسام',
      mostDownloaded: 'الأكثر تحميلًا',
      latest: 'أحدث الخلفيات',
      about: 'حول الموقع',
    },
    hero: {
      title: 'خلفيات ليوبارد',
      subtitle: 'خلفيات عالية الجودة لعائلة ليوبارد',
      searchPlaceholder: 'ابحث عن خلفيات ليوبارد...',
      popular: 'الأكثر بحثًا:',
      popularTags: ['ليوبارد 5', 'ليوبارد 8', 'صحراوي', 'ليلي', '4K'],
      features: [
        { icon: '⚡', label: 'خفيفة وسريعة' },
        { icon: '🖼️', label: 'جودة عالية' },
        { icon: '🚗', label: 'مناسبة لشاشة السيارة' },
      ],
    },
    mostDownloaded: { title: 'الأكثر تحميلًا', viewAll: 'عرض الكل' },
    categories: { title: 'الأقسام' },
    screenSelector: {
      title: 'اختر جهازك',
      options: {
        car: { label: 'شاشة السيارة', desc: 'مقاسات عريضة تناسب شاشات السيارة', spec: '16:9 · 1920×1080 وأكثر' },
        mobile: { label: 'الجوال', desc: 'مقاسات عمودية لجميع الهواتف', spec: '9:16 · 1080×1920 وأكثر' },
        desktop: { label: 'سطح المكتب', desc: 'مقاسات عالية الدقة للكمبيوتر', spec: '16:10 · 2560×1600 وأكثر' },
      },
    },
    features: [
      { value: '+10K', label: 'خلفية متاحة', icon: '🖼️' },
      { value: '+50K', label: 'تحميل شهريًا', icon: '📥' },
      { value: 'HD', label: 'جودة عالية', icon: '✨' },
      { value: '⚡', label: 'سريعة وخفيفة', icon: '' },
    ],
    footer: {
      copyright: '© 2024 خلفيات ليوبارد. جميع الحقوق محفوظة.',
      privacy: 'الخصوصية',
      terms: 'الشروط والأحكام',
    },
    download: 'تحميل',
    viewAll: 'عرض الكل',
    search: 'بحث',
  },
  en: {
    siteName: 'Leopard Wallpapers',
    nav: {
      home: 'Home',
      categories: 'Categories',
      mostDownloaded: 'Most Downloaded',
      latest: 'Latest',
      about: 'About',
    },
    hero: {
      title: 'Power. Presence. Freedom.',
      subtitle: 'Premium wallpapers for BYD Leopard 5, Leopard 8 & more.',
      searchPlaceholder: 'Search wallpapers...',
      popular: '🔥 Popular:',
      popularTags: ['Leopard 5', 'Leopard 8', 'Desert', 'Night', '4K'],
      features: [
        { icon: '⚡', label: 'Ultra Lightweight' },
        { icon: '🖼️', label: 'High Quality' },
        { icon: '🚗', label: 'Car Screen Ready' },
      ],
    },
    mostDownloaded: { title: 'Most Downloaded', viewAll: 'View all' },
    categories: { title: 'Categories' },
    screenSelector: {
      title: 'Choose Your Screen',
      options: {
        car: { label: 'Car Screen', desc: 'Wide ratio for car displays', spec: '16:9 · 1920×1080 and more' },
        mobile: { label: 'Mobile', desc: 'Portrait ratio for phones', spec: '9:16 · 1080×1920 and more' },
        desktop: { label: 'Desktop', desc: 'High-res for computer screens', spec: '16:10 · 2560×1600 and more' },
      },
    },
    features: [
      { value: '10K+', label: 'Wallpapers', icon: '🖼️' },
      { value: '50K+', label: 'Monthly Downloads', icon: '📥' },
      { value: 'HD', label: 'High Quality', icon: '✨' },
      { value: '⚡', label: 'Ultra Lightweight', icon: '' },
    ],
    footer: {
      copyright: '© 2024 Leopard Wallpapers. All rights reserved.',
      privacy: 'Privacy',
      terms: 'Terms',
    },
    download: 'Download',
    viewAll: 'View all',
    search: 'Search',
  },
} as const;

export type Translations = typeof translations.en;
