import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { type Locale } from '@/lib/i18n';

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  return {
    title: locale === 'ar' ? 'الشروط والأحكام - منصة الخلفيات' : 'Terms & Conditions - Wallpaper Platform',
  };
}

export default function TermsPage({ params: { locale } }: { params: { locale: Locale } }) {
  setRequestLocale(locale);
  const isAr = locale === 'ar';

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-8">
        {isAr ? 'الشروط والأحكام' : 'Terms & Conditions'}
      </h1>
      <div className="space-y-6 text-gray-300">
        {isAr ? (
          <>
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">استخدام الموقع</h2>
              <p>يمكنك تصفح وتحميل الخلفيات المجانية للاستخدام الشخصي. يُمنع إعادة بيع الخلفيات أو ادعاء ملكيتها.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">حقوق الملكية</h2>
              <p>الخلفيات المرفوعة من قبل مشرفينا تخضع لترخيص الاستخدام الشخصي فقط. حقوق الصور تعود لأصحابها الأصليين.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">المحتوى المحظور</h2>
              <p>يُمنع رفع أي محتوى إباحي أو مسيء أو ينتهك حقوق الملكية الفكرية.</p>
            </section>
          </>
        ) : (
          <>
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Usage</h2>
              <p>You may browse and download free wallpapers for personal use. Reselling wallpapers or claiming ownership is prohibited.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Ownership</h2>
              <p>Wallpapers uploaded by our moderators are available for personal use only. Image rights belong to their original owners.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Prohibited Content</h2>
              <p>Uploading pornographic, offensive, or copyright-infringing content is strictly prohibited.</p>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
