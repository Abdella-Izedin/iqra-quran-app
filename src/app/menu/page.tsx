'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocaleContext } from '@/providers/LocaleProvider';

export default function MenuPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const t = useTranslations('menu');
  const { locale, setLocale } = useLocaleContext();

  useEffect(() => {
    // التحقق من الوضع المحفوظ
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newMode);
  };

  const toggleLanguage = () => {
    const newLang = locale === 'ar' ? 'ur' : 'ar';
    setLocale(newLang);
    // No need to reload - LocaleProvider handles the state update
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/916363857328', '_blank');
  };

  const shareApp = () => {
    if (navigator.share) {
      navigator.share({
        title: t('appName'),
        text: t('shareText'),
        url: window.location.origin,
      });
    } else {
      navigator.clipboard.writeText(window.location.origin);
      alert(t('linkCopied'));
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24" dir="rtl">
      {/* العنوان */}
      <div className="py-6 text-center">
        <h1 className="text-2xl font-bold text-[var(--foreground)] font-tajawal">{t('title')}</h1>
      </div>

      {/* عناصر القائمة */}
      <div className="px-4 space-y-3">
        {/* اللغة */}
        <button onClick={toggleLanguage} className="w-full">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 flex items-center hover:bg-[var(--accent)] transition-all dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-[var(--primary)]/20 dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <svg className="w-6 h-6 text-[#1B5E20] dark:text-[var(--primary-light)] ml-3 dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span className="font-tajawal text-[var(--foreground)] flex-1 text-right">{t('language')}</span>
            <div className="flex items-center gap-2 bg-[#1B5E20]/10 dark:bg-[var(--primary)]/10 px-3 py-1 rounded-full">
              <span className={`text-sm font-tajawal ${locale === 'ar' ? 'text-[#1B5E20] dark:text-[var(--primary-light)] font-bold' : 'text-[var(--muted)]'}`}>{t('arabic')}</span>
              <span className="text-[var(--muted)]">|</span>
              <span className={`text-sm font-tajawal ${locale === 'ur' ? 'text-[#1B5E20] dark:text-[var(--primary-light)] font-bold' : 'text-[var(--muted)]'}`}>{t('urdu')}</span>
            </div>
          </div>
        </button>

        {/* الانتقال إلى العلامة */}
        <Link href="/quran?tab=bookmarks">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 flex items-center hover:bg-[var(--accent)] transition-all dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-[var(--primary)]/20 dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <svg className="w-6 h-6 text-[#1B5E20] dark:text-[var(--primary-light)] ml-3 dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <span className="font-tajawal text-[var(--foreground)] flex-1 text-right">{t('goToBookmark')}</span>
            <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* الوضع الليلي */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 flex items-center dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5">
          <svg className="w-6 h-6 text-[#1B5E20] dark:text-[var(--primary-light)] ml-3 dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <span className="font-tajawal text-[var(--foreground)] flex-1 text-right">{t('nightMode')}</span>
          <button
            onClick={toggleDarkMode}
            className={`w-14 h-8 rounded-full transition-all duration-300 ${
              isDarkMode ? 'bg-[var(--primary)] shadow-[0_0_15px_var(--glow-primary)]' : 'bg-gray-300'
            } relative`}
          >
            <span
              className={`absolute top-1 w-6 h-6 bg-[var(--card-bg)] rounded-full shadow-md transition-transform duration-300 ${
                isDarkMode ? 'left-1' : 'right-1'
              }`}
            />
          </button>
        </div>

        {/* المنبهات */}
        <Link href="/reminders">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 flex items-center hover:bg-[var(--accent)] transition-all dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-[var(--primary)]/20 dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <svg className="w-6 h-6 text-[#1B5E20] dark:text-[var(--primary-light)] ml-3 dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="font-tajawal text-[var(--foreground)] flex-1 text-right">{t('reminders')}</span>
            <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* المكتبة */}
        <Link href="/library">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 flex items-center hover:bg-[var(--accent)] transition-all dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-[var(--primary)]/20 dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <svg className="w-6 h-6 text-[#1B5E20] dark:text-[var(--primary-light)] ml-3 dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/>
              <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 10l-2.5-1.5L15 12V4h5v8z"/>
            </svg>
            <span className="font-tajawal text-[var(--foreground)] flex-1 text-right">{t('library')}</span>
            <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* تواصل معنا */}
        <button onClick={openWhatsApp} className="w-full">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 flex items-center hover:bg-[var(--accent)] transition-all dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-[var(--primary)]/20 dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <svg className="w-6 h-6 text-[#1B5E20] dark:text-[var(--primary-light)] ml-3 dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="font-tajawal text-[var(--foreground)] flex-1 text-right">{t('contactUs')}</span>
            <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* عن التطبيق */}
        <Link href="/about">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 flex items-center hover:bg-[var(--accent)] transition-all dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-[var(--primary)]/20 dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <svg className="w-6 h-6 text-[#1B5E20] dark:text-[var(--primary-light)] ml-3 dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-tajawal text-[var(--foreground)] flex-1 text-right">{t('aboutApp')}</span>
            <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* سياسة الخصوصية */}
        <Link href="/privacy">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 flex items-center hover:bg-[var(--accent)] transition-all dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-[var(--primary)]/20 dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <svg className="w-6 h-6 text-[#1B5E20] dark:text-[var(--primary-light)] ml-3 dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-tajawal text-[var(--foreground)] flex-1 text-right">سياسة الخصوصية</span>
            <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* شارك تؤجر */}
        <button onClick={shareApp} className="w-full">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 flex items-center hover:bg-[var(--accent)] transition-all dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-[var(--primary)]/20 dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <svg className="w-6 h-6 text-[#1B5E20] dark:text-[var(--primary-light)] ml-3 dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="font-tajawal text-[var(--foreground)] flex-1 text-right">{t('shareReward')}</span>
            <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </button>

        {/* تقييم التطبيق */}
        <Link href="/rate">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 flex items-center hover:bg-[var(--accent)] transition-all dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-[var(--primary)]/20 dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <svg className="w-6 h-6 text-[#1B5E20] dark:text-[var(--primary-light)] ml-3 dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <span className="font-tajawal text-[var(--foreground)] flex-1 text-right">{t('rateApp')}</span>
            <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>

      {/* معلومات التطبيق */}
      <div className="mt-12 text-center">
        <p className="text-sm text-[var(--muted)] font-tajawal">{t('appName')}</p>
        <p className="text-xs text-[var(--muted)] font-tajawal mt-1">{t('version')}</p>
      </div>
    </div>
  );
}
