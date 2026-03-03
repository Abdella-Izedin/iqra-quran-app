'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] py-8 px-4 text-center relative">
        <Link href="/menu" className="absolute top-4 right-4 text-white/80 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-white font-tajawal">سياسة الخصوصية</h1>
        <p className="text-white/70 text-sm font-tajawal mt-2">آخر تحديث: مارس 2026</p>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* مقدمة */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5">
          <p className="text-[var(--foreground)] font-tajawal leading-relaxed text-justify">
            نحن في تطبيق &quot;اقرأ&quot; نحترم خصوصيتك ونلتزم بحماية بياناتك. توضح هذه السياسة كيفية تعاملنا مع المعلومات عند استخدامك للتطبيق.
          </p>
        </div>

        {/* البيانات التي نستخدمها */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5">
          <h2 className="text-lg font-bold text-[var(--foreground)] font-tajawal mb-3 flex items-center gap-2">
            <span className="text-[#1B5E20]">&#x1F4CD;</span>
            البيانات التي نستخدمها
          </h2>
          <div className="space-y-3">
            <div className="bg-[var(--background)] rounded-xl p-4">
              <h3 className="font-bold text-[var(--foreground)] font-tajawal mb-1">الموقع الجغرافي</h3>
              <p className="text-[var(--foreground)]/70 font-tajawal text-sm leading-relaxed">
                يُستخدم فقط لتحديد مواقيت الصلاة واتجاه القبلة. لا يتم إرسال موقعك إلى أي جهة خارجية ولا يتم تخزينه على أي خادم.
              </p>
            </div>
            <div className="bg-[var(--background)] rounded-xl p-4">
              <h3 className="font-bold text-[var(--foreground)] font-tajawal mb-1">التخزين المحلي</h3>
              <p className="text-[var(--foreground)]/70 font-tajawal text-sm leading-relaxed">
                إعداداتك مثل اللغة المفضلة، الوضع الليلي، والعلامات المرجعية تُحفظ على جهازك فقط ولا تُرسل لأي جهة.
              </p>
            </div>
          </div>
        </div>

        {/* البيانات التي لا نجمعها */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-5">
          <h2 className="text-lg font-bold text-emerald-700 dark:text-emerald-300 font-tajawal mb-3 flex items-center gap-2">
            <span>&#x2705;</span>
            البيانات التي لا نجمعها
          </h2>
          <ul className="space-y-2">
            {[
              'لا نجمع بيانات شخصية (الاسم، البريد الإلكتروني، رقم الهاتف)',
              'لا نستخدم إعلانات',
              'لا نبيع أو نشارك أي بيانات مع أطراف ثالثة',
              'لا نتتبع نشاطك خارج التطبيق',
            ].map((item, index) => (
              <li key={index} className="flex items-center gap-3">
                <span className="w-5 h-5 bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs flex-shrink-0">
                  &#x2713;
                </span>
                <span className="text-emerald-700 dark:text-emerald-300 font-tajawal text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* خدمات خارجية */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5">
          <h2 className="text-lg font-bold text-[var(--foreground)] font-tajawal mb-3 flex items-center gap-2">
            <span className="text-[#1B5E20]">&#x1F310;</span>
            خدمات خارجية
          </h2>
          <p className="text-[var(--foreground)]/70 font-tajawal text-sm mb-3 leading-relaxed">
            يستخدم التطبيق الخدمات التالية لتوفير بعض الميزات:
          </p>
          <ul className="space-y-2">
            {[
              'واجهة Aladhan لحساب مواقيت الصلاة',
              'واجهة BigDataCloud لتحديد اسم المدينة من الموقع',
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="w-2 h-2 bg-[#1B5E20] rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-[var(--foreground)]/70 font-tajawal text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* التواصل */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5">
          <h2 className="text-lg font-bold text-[var(--foreground)] font-tajawal mb-3 flex items-center gap-2">
            <span className="text-[#1B5E20]">&#x1F4E7;</span>
            التواصل
          </h2>
          <p className="text-[var(--foreground)]/70 font-tajawal text-sm leading-relaxed">
            إذا كان لديك أي استفسار حول سياسة الخصوصية، يمكنك التواصل معنا عبر البريد الإلكتروني:
          </p>
          <a
            href="mailto:izedin2026.g.play@gmail.com"
            className="inline-block mt-3 text-[#1B5E20] dark:text-emerald-400 font-tajawal font-bold text-sm hover:underline"
            dir="ltr"
          >
            izedin2026.g.play@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
