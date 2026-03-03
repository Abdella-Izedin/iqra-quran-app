'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import surahsData from '@/data/quran/surahs.json';

export default function Header() {
  const t = useTranslations('header');
  const tQuran = useTranslations('quran');
  const locale = useLocale();
  const pathname = usePathname();
  const [hijriDate, setHijriDate] = useState<string>('');
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: string } | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Helper to get surah display name based on locale
  const getSurahName = (surah: typeof surahsData.surahs[0]) => {
    return locale === 'ur' ? surah.urduName : surah.name;
  };

  // فلترة السور
  const filteredSurahs = surahsData.surahs.filter((surah) => {
    if (!searchQuery) return surahsData.surahs.slice(0, 10);
    return surah.name.includes(searchQuery) ||
      surah.urduName.includes(searchQuery) ||
      surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.number.toString() === searchQuery;
  });

  useEffect(() => {
    // حساب التاريخ الهجري
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      calendar: 'islamic-umalqura',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    };

    try {
      const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', options);
      setHijriDate(formatter.format(today));
    } catch {
      setHijriDate('السبت 5 شعبان 1447');
    }

    // حساب أوقات الصلاة
    calculatePrayerTimes();

    // تحديث كل دقيقة
    const interval = setInterval(calculatePrayerTimes, 60000);
    return () => clearInterval(interval);
  }, []);

  const calculatePrayerTimes = async () => {
    const setDefaultPrayer = () => {
      setNextPrayer({ name: 'الصلاة', time: '--:--', remaining: 'غير متاح' });
    };

    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const today = new Date();
            const date = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

            const response = await fetch(
              `https://api.aladhan.com/v1/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=4`
            );

            if (!response.ok) {
              setDefaultPrayer();
              return;
            }

            const data = await response.json();

            if (data.code === 200) {
              const timings = data.data.timings;
              const prayers = [
                { name: 'الفجر', time: timings.Fajr },
                { name: 'الشروق', time: timings.Sunrise },
                { name: 'الظهر', time: timings.Dhuhr },
                { name: 'العصر', time: timings.Asr },
                { name: 'المغرب', time: timings.Maghrib },
                { name: 'العشاء', time: timings.Isha },
              ];

              const now = new Date();
              const currentMinutes = now.getHours() * 60 + now.getMinutes();

              for (const prayer of prayers) {
                const [hours, minutes] = prayer.time.split(':').map(Number);
                const prayerMinutes = hours * 60 + minutes;

                if (prayerMinutes > currentMinutes) {
                  const diff = prayerMinutes - currentMinutes;
                  const remainingHours = Math.floor(diff / 60);
                  const remainingMins = diff % 60;

                  let remaining = '';
                  if (remainingHours > 0) {
                    remaining = `${remainingHours} ساعة و ${remainingMins} دقيقة`;
                  } else {
                    remaining = `${remainingMins} دقيقة`;
                  }

                  setNextPrayer({
                    name: prayer.name,
                    time: prayer.time,
                    remaining
                  });
                  return;
                }
              }
              // إذا لم نجد صلاة قادمة، نعرض الفجر
              setNextPrayer({
                name: 'الفجر',
                time: prayers[0].time,
                remaining: 'غداً'
              });
            } else {
              setDefaultPrayer();
            }
          } catch {
            // خطأ في الشبكة أو الـ fetch
            setDefaultPrayer();
          }
        }, () => {
          // خطأ في الموقع
          setDefaultPrayer();
        });
      } else {
        setDefaultPrayer();
      }
    } catch {
      setDefaultPrayer();
    }
  };

  if (pathname !== '/') {
    return null;
  }

  return (
    <>
      <header className="relative overflow-hidden">
        {/* الخلفية المتدرجة */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)]"></div>

        {/* زخرفة خلفية */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative text-white py-5 px-4">
          <div className="max-w-lg mx-auto">
            {/* الصف العلوي */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2 font-tajawal">
                  {t('welcome')}
                  <span className="text-2xl">👋</span>
                </h1>
                <p className="text-sm opacity-80 mt-1 font-tajawal">{t('subtitle')}</p>
              </div>
              <button
                onClick={() => setShowSearch(true)}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
                aria-label={t('search')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            {/* بطاقات التاريخ والصلاة */}
            <div className="flex gap-3">
              {/* التاريخ الهجري */}
              <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-xs opacity-90 font-tajawal truncate">{hijriDate || '...'}</span>
                </div>
              </div>

              {/* الصلاة القادمة */}
              {nextPrayer && (
                <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[var(--secondary)]/30 flex items-center justify-center">
                      <svg className="w-4 h-4 text-[var(--secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs opacity-70 font-tajawal">{nextPrayer.name}</p>
                      <p className="text-xs font-semibold font-tajawal truncate">{nextPrayer.remaining}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* نافذة البحث */}
      {showSearch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setShowSearch(false)}>
          <div
            className="bg-[var(--card-bg)] rounded-b-3xl max-w-lg mx-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* حقل البحث */}
            <div className="p-5">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full px-5 py-4 pr-12 pl-14 rounded-2xl border-2 border-[var(--card-border)] bg-[var(--accent)] focus:outline-none focus:border-[var(--primary)] text-right font-tajawal transition-colors"
                />
                <svg
                  className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--primary)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <button
                  onClick={() => setShowSearch(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-[var(--card-border)] transition-colors"
                >
                  <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* قائمة السور */}
            <div className="max-h-[60vh] overflow-y-auto pb-5">
              {(searchQuery ? filteredSurahs : surahsData.surahs.slice(0, 15)).map((surah, index) => (
                <Link
                  key={surah.number}
                  href={`/mushaf#${surah.startPage}`}
                  onClick={() => setShowSearch(false)}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-[var(--accent)] transition-colors"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm font-tajawal">{surah.number}</span>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-bold text-[var(--foreground)] font-tajawal">{tQuran('surah')} {getSurahName(surah)}</p>
                    <p className="text-xs text-[var(--muted)] font-tajawal">{surah.ayahCount} {t('ayahs')} • {surah.revelationType === 'Meccan' ? tQuran('makki') : tQuran('madani')}</p>
                  </div>
                  <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
