'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

// قائمة المؤذنين - نفس القائمة من صفحة الصلاة
const MUEZZINS = [
  { id: 'makkah', nameAr: 'الحرم المكي', nameUr: 'حرمِ مکی', bundled: true },
  { id: 'madinah', nameAr: 'المسجد النبوي', nameUr: 'مسجدِ نبوی', bundled: true },
  { id: 'alaqsa', nameAr: 'المسجد الأقصى', nameUr: 'مسجدِ اقصیٰ', bundled: true },
  { id: 'qatami', nameAr: 'ناصر القطامي', nameUr: 'ناصر القطامی', bundled: true },
  { id: 'abdulbasit', nameAr: 'عبد الباسط عبد الصمد', nameUr: 'عبدالباسط عبدالصمد', bundled: true },
  { id: 'sobhi', nameAr: 'إسلام صبحي', nameUr: 'اسلام صبحی', bundled: true },
  { id: 'alafasy', nameAr: 'مشاري العفاسي', nameUr: 'مشاری العفاسی', bundled: false },
  { id: 'zahrani', nameAr: 'منصور الزهراني', nameUr: 'منصور الزہرانی', bundled: false },
  { id: 'deghreeri', nameAr: 'حمد الدغريري', nameUr: 'حمد الدغریری', bundled: false },
  { id: 'minshawi', nameAr: 'المنشاوي', nameUr: 'المنشاوی', bundled: false },
];

export default function AthanSettingsCard() {
  const [muezzinName, setMuezzinName] = useState('الحرم المكي'); // القيمة الافتراضية
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const t = useTranslations('home');
  const locale = useLocale();

  useEffect(() => {
    try {
      // قراءة المؤذن المحفوظ
      const savedMuezzin = localStorage.getItem('athan-muezzin') || 'makkah';
      const muezzin = MUEZZINS.find(m => m.id === savedMuezzin);
      if (muezzin) {
        setMuezzinName(locale === 'ar' ? muezzin.nameAr : muezzin.nameUr);
      }

      // قراءة حالة التنبيهات
      const savedNotifs = localStorage.getItem('athan-notifications');
      if (savedNotifs) {
        const notifs = JSON.parse(savedNotifs);
        // التحقق إذا كان أي تنبيه مفعّل
        const anyEnabled = Object.values(notifs).some(v => v === true);
        setNotificationsEnabled(anyEnabled);
      }
    } catch {
      // تجاهل أخطاء التحميل واستخدام القيم الافتراضية
    }
  }, [locale]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[var(--card-bg)] dark:bg-[var(--surface-1)] text-[var(--foreground)] border border-[var(--card-border)] shadow-md transition-all duration-300 hover:shadow-xl hover:border-[var(--primary)] group">
      {/* Subtle background glow for dark mode only */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-0 dark:opacity-20 transition-opacity dark:group-hover:opacity-40">
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-[var(--primary)] rounded-full blur-[100px]"></div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[var(--secondary)] rounded-full blur-[100px]"></div>
      </div>

      {/* نمط زخرفي */}
      <div className="absolute left-0 top-0 bottom-0 w-32 opacity-[0.03] dark:opacity-[0.02] pointer-events-none">
        <svg viewBox="0 0 100 200" className="w-full h-full text-[var(--foreground)]">
          <pattern id="athan-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1.5" fill="currentColor" />
          </pattern>
          <rect fill="url(#athan-pattern)" width="100" height="200" />
        </svg>
      </div>

      <div className="relative p-6">
        <div className="flex justify-between items-center">
          {/* المعلومات على اليمين */}
          <div className="flex-1 text-right z-10">
            <div className="inline-flex items-center gap-2 bg-[var(--accent)] text-[var(--primary-dark)] dark:text-[var(--primary-light)] px-3 py-1 rounded-full mb-3 border border-[var(--primary)]/20 shadow-sm">
              <div className={`w-2 h-2 rounded-full ${notificationsEnabled ? 'bg-[var(--primary)] animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-xs font-semibold font-tajawal">{t('athanSettings')}</span>
            </div>

            <h3 className="font-bold text-xl text-[var(--foreground)] font-tajawal mb-1 group-hover:text-[var(--primary)] transition-colors">
              {muezzinName}
            </h3>
            <p className="text-sm text-[var(--muted)] font-tajawal">
              {notificationsEnabled ? t('notificationsOn') : t('notificationsOff')}
            </p>
          </div>

          {/* أيقونة */}
          <div className="w-20 h-20 flex items-center justify-center relative z-10">
            <div className="absolute inset-0 bg-[var(--accent)] dark:bg-[var(--surface-2)] rounded-2xl rotate-3 group-hover:rotate-6 transition-transform duration-300 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary)] opacity-10 rounded-2xl -rotate-3 group-hover:-rotate-6 transition-transform duration-300 pointer-events-none"></div>
            <svg className="w-10 h-10 text-[var(--primary)] relative z-20 transition-transform duration-300 group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
          </div>
        </div>

        <Link
          href="/prayer"
          className="mt-6 flex items-center justify-center gap-3 w-full bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] text-white py-3.5 rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 font-tajawal shadow-md group/btn"
        >
          <span>{t('configure')}</span>
          <svg className="w-5 h-5 rotate-180 transition-transform duration-300 group-hover/btn:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
