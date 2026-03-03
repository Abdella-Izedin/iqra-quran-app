'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import recitersData from '@/data/quran/reciters.json';
import surahsData from '@/data/quran/surahs.json';

interface ReciterClientProps {
  reciterId: string;
}

export default function ReciterClient({ reciterId }: ReciterClientProps) {
  const t = useTranslations('reciters');
  const tQuran = useTranslations('quran');
  const locale = useLocale();
  const reciterIdNum = parseInt(reciterId);
  
  const reciter = recitersData.reciters.find(r => r.id === reciterIdNum);
  const surahs = surahsData.surahs;
  
  const [playingSurah, setPlayingSurah] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Helper to get surah display name based on locale
  const getSurahName = (surah: typeof surahs[0]) => {
    return locale === 'ur' ? surah.urduName : surah.name;
  };

  // Helper to get reciter name based on locale
  const getReciterName = () => {
    if (!reciter) return '';
    return locale === 'ur' ? reciter.urduName : reciter.name;
  };

  // Helper to get reciter style based on locale
  const getReciterStyle = () => {
    if (!reciter) return '';
    return locale === 'ur' ? reciter.urduStyle : reciter.style;
  };

  const filteredSurahs = surahs.filter((surah) => {
    return surah.name.includes(searchQuery) || 
           surah.urduName.includes(searchQuery) ||
           surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           surah.number.toString().includes(searchQuery);
  });

  const playSurah = (surahNumber: number) => {
    if (!reciter) return;
    
    if (playingSurah === surahNumber) {
      audioRef.current?.pause();
      setPlayingSurah(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      setIsLoading(surahNumber);
      setPlayingSurah(null);
      
      // Format surah number as 3-digit padded (001, 002, ..., 114)
      const paddedSurahNumber = surahNumber.toString().padStart(3, '0');
      const audio = new Audio(`${reciter.audioUrl}/${paddedSurahNumber}.mp3`);
      
      audio.oncanplaythrough = () => {
        setIsLoading(null);
        audio.play();
        setPlayingSurah(surahNumber);
      };
      
      audio.onerror = () => {
        setIsLoading(null);
        setPlayingSurah(null);
      };
      
      audio.ontimeupdate = () => setCurrentTime(audio.currentTime);
      audio.onloadedmetadata = () => setDuration(audio.duration);
      audio.onended = () => {
        setPlayingSurah(null);
        setCurrentTime(0);
      };
      
      audioRef.current = audio;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  if (!reciter) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 mb-4 rounded-full bg-[var(--accent)] flex items-center justify-center">
          <svg className="w-10 h-10 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-[var(--muted)] font-tajawal text-lg mb-4">{t('reciterNotFound')}</p>
        <Link href="/reciters" className="text-[var(--primary)] font-tajawal font-medium flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {t('backToReciters')}
        </Link>
      </div>
    );
  }

  const currentSurah = playingSurah ? surahs.find(s => s.number === playingSurah) : null;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* الهيدر مع معلومات القارئ */}
      <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white px-4 pt-6 pb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="pattern" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="1" fill="currentColor"/>
            </pattern>
            <rect width="100" height="100" fill="url(#pattern)"/>
          </svg>
        </div>
        
        <div className="max-w-lg mx-auto relative">
          {/* زر الرجوع */}
          <Link href="/reciters" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 font-tajawal transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>{t('recitersLabel')}</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* أيقونة القارئ */}
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/10">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold font-tajawal">{getReciterName()}</h1>
              <p className="text-white/80 font-tajawal">{reciter.englishName}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-tajawal backdrop-blur-sm">
                  {getReciterStyle()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* مشغل الصوت الثابت */}
      {playingSurah && currentSurah && (
        <div className="sticky top-0 z-20 bg-[var(--card-bg)]/95 backdrop-blur-xl border-b border-[var(--card-border)] shadow-lg dark:bg-[#111827]/95 dark:border-white/5">
          <div className="max-w-lg mx-auto p-4">
            <div className="flex items-center gap-4">
              {/* زر التحكم */}
              <button
                onClick={() => playSurah(playingSurah)}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white flex items-center justify-center shadow-lg shadow-[var(--primary)]/30 transition-transform hover:scale-105"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              </button>

              <div className="flex-1 min-w-0">
                <p className="font-bold font-tajawal truncate text-[var(--foreground)]">{getSurahName(currentSurah)}</p>
                <div className="flex items-center gap-2 text-sm text-[var(--muted)] mt-1">
                  <span className="font-tajawal">{formatTime(currentTime)}</span>
                  <div className="flex-1">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1.5 bg-[var(--accent)] rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[var(--primary)] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                    />
                  </div>
                  <span className="font-tajawal">{formatTime(duration)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* شريط البحث */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t('searchSurah')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-4 pl-14 rounded-2xl border-2 border-[var(--card-border)] bg-[var(--card-bg)] focus:outline-none focus:border-[var(--primary)] text-right transition-all duration-300 font-tajawal dark:bg-white/5 dark:border-white/10 dark:focus:border-emerald-500 dark:focus:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
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

        {/* عدد السور */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[var(--muted)] font-tajawal">
            {filteredSurahs.length} {t('surahsAvailable')}
          </p>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)]"></span>
            <span className="text-xs text-[var(--muted)] font-tajawal">{t('directPlay')}</span>
          </div>
        </div>

        {/* قائمة السور */}
        <div className="space-y-2">
          {filteredSurahs.map((surah, index) => (
            <div
              key={surah.number}
              className={`bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 flex items-center gap-3 transition-all duration-300 hover:shadow-lg hover:border-[var(--primary)]/30 animate-fadeIn dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-emerald-500/30 ${
                playingSurah === surah.number ? 'ring-2 ring-[var(--primary)] bg-[var(--primary)]/5 dark:ring-emerald-500' : ''
              }`}
              style={{ animationDelay: `${(index % 10) * 30}ms` }}
            >
              {/* رقم السورة */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 flex items-center justify-center border border-[var(--primary)]/20">
                <span className="font-bold text-[var(--primary)] text-sm font-tajawal">{surah.number}</span>
              </div>

              {/* معلومات السورة */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold font-tajawal text-[var(--foreground)] truncate">{getSurahName(surah)}</h3>
                <p className="text-xs text-[var(--muted)] font-tajawal mt-0.5">
                  {surah.ayahCount} {t('ayah')} • {surah.revelationType === 'Meccan' ? t('meccan') : t('medinan')}
                </p>
              </div>

              {/* زر التشغيل */}
              <button
                onClick={() => playSurah(surah.number)}
                disabled={isLoading === surah.number}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  playingSurah === surah.number
                    ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30'
                    : isLoading === surah.number
                    ? 'bg-[var(--accent)]'
                    : 'bg-[var(--accent)] hover:bg-[var(--primary)]/20'
                }`}
              >
                {isLoading === surah.number ? (
                  <svg className="w-5 h-5 animate-spin text-[var(--primary)]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : playingSurah === surah.number ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>

        {filteredSurahs.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--accent)] flex items-center justify-center">
              <svg className="w-10 h-10 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-[var(--muted)] font-tajawal">{t('noResults')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
