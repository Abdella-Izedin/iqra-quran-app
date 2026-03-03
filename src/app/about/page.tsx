'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function AboutPage() {
  const t = useTranslations('about');
  const tMenu = useTranslations('menu');

  const featuresList = [
    t('feature1'),
    t('feature2'),
    t('feature3'),
    t('feature4'),
    t('feature5'),
    t('feature6'),
    t('feature7'),
    t('feature8'),
    t('feature9'),
    t('feature10'),
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] py-8 px-4 text-center relative">
        <Link href="/menu" className="absolute top-4 right-4 text-white/80 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>

        <h1 className="text-2xl font-bold text-white font-tajawal">{t('title')}</h1>
        <p className="text-white/90 font-tajawal mt-2">{tMenu('appName')}</p>
        <p className="text-white/70 text-sm font-tajawal">{tMenu('version')}</p>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* الوصف */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5">
          <p className="text-[var(--foreground)] font-tajawal leading-relaxed text-justify">
            {t('description')}
          </p>
        </div>

        {/* التذكير */}
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-5">
          <h2 className="text-lg font-bold text-[var(--primary-dark)] dark:text-amber-400 font-tajawal mb-3">🌙 {t('reminder')}</h2>
          <p className="text-[var(--primary-dark)] dark:text-amber-300 font-tajawal leading-relaxed">
            {t('reminderText')}
          </p>
        </div>

        {/* المميزات */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5">
          <h2 className="text-lg font-bold text-[var(--foreground)] font-tajawal mb-4 flex items-center gap-2">
            <span className="text-[#1B5E20]">✨</span>
            {t('features')}
          </h2>
          <ul className="space-y-3">
            {featuresList.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <span className="w-6 h-6 bg-[#1B5E20]/10 rounded-full flex items-center justify-center text-[#1B5E20] text-sm flex-shrink-0">
                  ✓
                </span>
                <span className="text-[var(--foreground)] font-tajawal">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* طلب الدعاء */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200 dark:border-emerald-700 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-800/50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.5 2C9.64 2 8 5 8 5S6.36 2 3.5 2C2.5 2 1 3.5 1 5.5C1 7.27 2 8 2 8L8 16L14 8C14 8 15 7.27 15 5.5C15 3.5 13.5 2 12.5 2Z" transform="translate(4, 2) scale(0.9)"/>
            </svg>
          </div>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 font-amiri mb-2">
            {t('duaRequest')}
          </p>
        </div>
      </div>
    </div>
  );
}
