import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { type Locale } from '@/lib/i18n';
import { fetchSiteContent } from '@/lib/server-api';

export const revalidate = 120;

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  return {
    title: locale === 'ar' ? 'سياسة الخصوصية | QEV' : 'Privacy Policy | QEV',
  };
}

export default async function PrivacyPage({ params: { locale } }: { params: { locale: Locale } }) {
  setRequestLocale(locale);
  const isAr = locale === 'ar';

  const site = await fetchSiteContent().catch(() => null);
  const custom = (isAr ? site?.privacy_ar : site?.privacy_en)?.trim();

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl" dir={isAr ? 'rtl' : 'ltr'}>
      <h1 className="text-3xl font-bold text-white mb-8">
        {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
      </h1>

      {custom ? (
        <div className="article-body text-gray-300" dangerouslySetInnerHTML={{ __html: custom }} />
      ) : (
        <div className="space-y-6 text-gray-300">
          {isAr ? (
            <>
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">جمع البيانات</h2>
                <p>نحن لا نجمع بيانات شخصية عن الزوار. نستخدم hash مشفر لعناوين IP لأغراض منع الإساءة فقط، ولا نحفظ IP الحقيقي.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">ملفات الكوكيز</h2>
                <p>نستخدم ملفات كوكيز لتحسين تجربتك مثل تذكر اللغة المختارة.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">الصور</h2>
                <p>الصور المرفوعة تبقى على خوادمنا. نحتفظ بحق إزالة أي محتوى يخالف شروط الاستخدام.</p>
              </section>
            </>
          ) : (
            <>
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Data Collection</h2>
                <p>We do not collect personal data from visitors. We use hashed IP addresses for anti-abuse purposes only and never store the real IP.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Cookies</h2>
                <p>We use cookies to improve your experience, such as remembering your language preference.</p>
              </section>
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Images</h2>
                <p>Uploaded images are stored on our servers. We reserve the right to remove content that violates our terms.</p>
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}
