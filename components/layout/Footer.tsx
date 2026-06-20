import Link from 'next/link';
import { type Locale } from '@/lib/i18n';

interface FooterProps {
  locale: Locale;
}

export function Footer({ locale }: FooterProps) {
  const isAr = locale === 'ar';

  return (
    <footer className="bg-gray-950 border-t border-gray-800 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">W</span>
              </div>
              <span className="font-bold text-white">
                {isAr ? 'منصة الخلفيات' : 'Wallpaper Platform'}
              </span>
            </div>
            <p className="text-gray-400 text-sm">
              {isAr
                ? 'أفضل منصة لخلفيات الجوال والكمبيوتر بجودة عالية'
                : 'The best platform for high quality mobile and desktop wallpapers'}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">{isAr ? 'الأقسام' : 'Browse'}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/most-downloaded`} className="text-gray-400 hover:text-white transition-colors">
                  {isAr ? 'الأكثر تحميلًا' : 'Most Downloaded'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/most-liked`} className="text-gray-400 hover:text-white transition-colors">
                  {isAr ? 'الأكثر إعجابًا' : 'Most Liked'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/mobile`} className="text-gray-400 hover:text-white transition-colors">
                  {isAr ? 'خلفيات الجوال' : 'Mobile Wallpapers'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/desktop`} className="text-gray-400 hover:text-white transition-colors">
                  {isAr ? 'خلفيات الكمبيوتر' : 'Desktop Wallpapers'}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">{isAr ? 'قانوني' : 'Legal'}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/privacy`} className="text-gray-400 hover:text-white transition-colors">
                  {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/terms`} className="text-gray-400 hover:text-white transition-colors">
                  {isAr ? 'الشروط والأحكام' : 'Terms & Conditions'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} {isAr ? 'منصة الخلفيات. جميع الحقوق محفوظة.' : 'Wallpaper Platform. All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
