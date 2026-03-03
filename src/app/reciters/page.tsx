'use client';

import { useState, useRef, useEffect } from 'react';
import recitersData from '@/data/quran/reciters.json';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

type ReciterData = typeof recitersData.reciters[number];

export default function RecitersPage() {
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const t = useTranslations('reciters');
  const tQuran = useTranslations('quran');
  const locale = useLocale();

  // Helper to get reciter name based on locale
  const getReciterName = (reciter: ReciterData) => {
    return locale === 'ur' ? reciter.urduName : reciter.name;
  };

  // Helper to get reciter style based on locale
  const getReciterStyle = (reciter: ReciterData) => {
    return locale === 'ur' ? reciter.urduStyle : reciter.style;
  };

  const filteredReciters = recitersData.reciters.filter((reciter) => {
    const matchesSearch = reciter.name.includes(searchQuery) || 
                          reciter.urduName.includes(searchQuery) ||
                          reciter.englishName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const playSample = async (reciter: ReciterData) => {
    if (playingId === reciter.id) {
      // إيقاف التشغيل
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      // تشغيل عينة
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsLoading(reciter.id);
      setPlayingId(null);
      
      // Format surah number as 3-digit padded (001, 002, ..., 114)
      const paddedSurahNumber = reciter.sampleSurah.toString().padStart(3, '0');
      const audio = new Audio(`${reciter.audioUrl}/${paddedSurahNumber}.mp3`);
      
      audio.oncanplaythrough = () => {
        setIsLoading(null);
        audio.play();
        setPlayingId(reciter.id);
      };
      
      audio.onerror = () => {
        setIsLoading(null);
        setPlayingId(null);
      };
      
      audioRef.current = audio;
      audio.onended = () => setPlayingId(null);
    }
  };

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header */}
      <div className="bg-[var(--card-bg)] sticky top-0 z-10 border-b border-[var(--card-border)] dark:bg-gradient-to-b dark:from-[#111827] dark:to-[#0d1320] dark:border-white/5">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent"></div>
          <div className="text-center py-5 relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] mb-2 shadow-lg shadow-[var(--primary)]/30">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold font-tajawal text-[var(--foreground)]">{t('title')}</h1>
            <p className="text-[var(--muted)] text-sm mt-1 font-tajawal">{t('subtitle')}</p>
          </div>
        </div>
        
        {/* شريط البحث */}
        <div className="px-4 pb-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-4 pl-14 rounded-2xl border-2 border-[var(--card-border)] bg-[var(--accent)] focus:outline-none focus:border-[var(--primary)] text-right transition-all duration-300 font-tajawal dark:bg-[var(--card-bg)]/5 dark:border-white/10 dark:focus:border-[var(--primary)] dark:focus:shadow-[0_0_15px_var(--glow-primary)]"
            />
            <svg
              className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--primary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* قائمة القراء */}
      <div className="px-4 py-4 space-y-3">
        {filteredReciters.map((reciter, index) => (
          <div
            key={reciter.id}
            className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl overflow-hidden hover:shadow-xl hover:border-[var(--primary)]/30 transition-all duration-300 animate-slideUp dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-[var(--primary)]/30 dark:hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)]"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* الجزء العلوي - معلومات القارئ */}
            <div className="p-4 flex items-center gap-4">
              {/* أيقونة القارئ */}
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 flex items-center justify-center border-2 border-[var(--primary)]/20">
                  <svg className="w-8 h-8 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                {/* مؤشر التشغيل */}
                {playingId === reciter.id && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--primary)] rounded-full flex items-center justify-center shadow-lg">
                    <div className="flex gap-0.5">
                      <span className="w-0.5 h-3 bg-[var(--card-bg)] rounded-full animate-pulse"></span>
                      <span className="w-0.5 h-2 bg-[var(--card-bg)] rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-0.5 h-3 bg-[var(--card-bg)] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                  </div>
                )}
                {/* مؤشر التحميل */}
                {isLoading === reciter.id && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--secondary)] rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-lg font-tajawal text-[var(--foreground)] truncate">{getReciterName(reciter)}</h2>
                <p className="text-sm text-[var(--muted)] font-tajawal truncate">{reciter.englishName}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1 rounded-full font-tajawal font-medium">
                    {getReciterStyle(reciter)}
                  </span>
                </div>
              </div>

              {/* سهم للدخول */}
              <Link
                href={`/reciters/${reciter.id}`}
                className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center hover:bg-[var(--primary)]/10 transition-colors"
              >
                <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
            </div>

            {/* أزرار التحكم */}
            <div className="flex border-t border-[var(--card-border)]">
              {/* زر تشغيل عينة */}
              <button
                onClick={() => playSample(reciter)}
                disabled={isLoading === reciter.id}
                className={`flex-1 py-3.5 flex items-center justify-center gap-2 text-sm font-tajawal font-medium transition-all duration-300 ${
                  playingId === reciter.id
                    ? 'bg-[var(--primary)] text-white'
                    : 'hover:bg-[var(--accent)]'
                }`}
              >
                {isLoading === reciter.id ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t('loading')}</span>
                  </>
                ) : playingId === reciter.id ? (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                    <span>{t('stop')}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <span>{t('listenSample')}</span>
                  </>
                )}
              </button>

              {/* فاصل */}
              <div className="w-px bg-[var(--card-border)]"></div>

              {/* زر عرض السور */}
              <Link
                href={`/reciters/${reciter.id}`}
                className="flex-1 py-3.5 flex items-center justify-center gap-2 text-sm font-tajawal font-medium hover:bg-[var(--accent)] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>{t('allSurahs')}</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* لا توجد نتائج */}
      {filteredReciters.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--accent)] flex items-center justify-center">
            <svg className="w-10 h-10 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-[var(--muted)] font-tajawal">{tQuran('noResults')}</p>
        </div>
      )}
    </div>
  );
}
