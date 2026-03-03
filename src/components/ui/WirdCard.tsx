'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface WirdSettings {
  startPage: number;
  startJuz: number;
  durationDays: number;
  pagesPerDay: number;
  createdAt: string;
  completedDays: number[];
}

export default function WirdCard() {
  const [hasWird, setHasWird] = useState(false);
  const [wirdProgress, setWirdProgress] = useState(0);
  const [completedDays, setCompletedDays] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const t = useTranslations('home');

  useEffect(() => {
    const savedWird = localStorage.getItem('quranWird');
    if (savedWird) {
      const wird: WirdSettings = JSON.parse(savedWird);
      const completed = wird.completedDays?.length || 0;

      // التحقق إذا اكتملت الختمة
      if (completed >= wird.durationDays) {
        setHasWird(false);
      } else {
        setHasWird(true);
        setCompletedDays(completed);
        setTotalDays(wird.durationDays);
        setWirdProgress(Math.round((completed / wird.durationDays) * 100));
      }
    } else {
      setHasWird(false);
    }
  }, []);

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
          <pattern id="pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1.5" fill="currentColor" />
          </pattern>
          <rect fill="url(#pattern)" width="100" height="200" />
        </svg>
      </div>

      <div className="relative p-6">
        <div className="flex justify-between items-center">
          {/* المعلومات على اليمين */}
          <div className="flex-1 text-right z-10">
            <div className="inline-flex items-center gap-2 bg-[var(--accent)] text-[var(--primary-dark)] dark:text-[var(--primary-light)] px-3 py-1 rounded-full mb-3 border border-[var(--primary)]/20 shadow-sm">
              <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold font-tajawal">{t('dailyWird')}</span>
            </div>

            {hasWird ? (
              <>
                <h3 className="font-bold text-xl text-[var(--foreground)] font-tajawal mb-1 group-hover:text-[var(--primary)] transition-colors">{t('continueWird')}</h3>
                <p className="text-sm text-[var(--muted)] font-tajawal mb-4">
                  {t('completed')} {completedDays} {t('of')} {totalDays} {t('day')} ({wirdProgress}%)
                </p>
                {/* شريط التقدم */}
                <div className="h-2 bg-[var(--accent)] dark:bg-[var(--surface-3)] rounded-full overflow-hidden shadow-inner border border-[var(--card-border)]/50">
                  <div
                    className="h-full bg-[var(--primary)] rounded-full transition-all duration-1000 ease-out relative"
                    style={{ width: `${wirdProgress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-bold text-xl text-[var(--foreground)] font-tajawal mb-1 group-hover:text-[var(--primary)] transition-colors">{t('startKhatmah')}</h3>
                <p className="text-sm text-[var(--muted)] font-tajawal">{t('startKhatmahDesc')}</p>
              </>
            )}
          </div>

          {/* أيقونة */}
          <div className="w-20 h-20 flex items-center justify-center relative z-10">
            <div className="absolute inset-0 bg-[var(--accent)] dark:bg-[var(--surface-2)] rounded-2xl rotate-3 group-hover:rotate-6 transition-transform duration-300 pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-light)] to-[var(--primary)] opacity-10 rounded-2xl -rotate-3 group-hover:-rotate-6 transition-transform duration-300 pointer-events-none"></div>
            <svg className="w-10 h-10 text-[var(--primary)] relative z-20 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>

        <Link
          href="/daily-wird"
          className="mt-6 flex items-center justify-center gap-3 w-full bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] text-white py-3.5 rounded-xl font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 font-tajawal shadow-md group/btn"
        >
          <span>{hasWird ? t('goToWird') : t('createKhatmah')}</span>
          <svg className="w-5 h-5 rotate-180 transition-transform duration-300 group-hover/btn:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
