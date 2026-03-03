'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import surahsData from '@/data/quran/surahs.json';

export default function ContinueReadingCard() {
  const t = useTranslations('home');
  const tQuran = useTranslations('quran');
  const locale = useLocale();
  const [lastPage, setLastPage] = useState<number>(1);
  const [surahName, setSurahName] = useState<string>('');

  useEffect(() => {
    const savedPage = localStorage.getItem('lastReadPage');
    if (savedPage) {
      const page = parseInt(savedPage);
      setLastPage(page);
      
      const surah = surahsData.surahs.find(s => 
        page >= s.startPage && page <= s.endPage
      );
      if (surah) {
        setSurahName(locale === 'ur' ? surah.urduName : surah.name);
      }
    } else {
      // Default surah name
      const firstSurah = surahsData.surahs[0];
      setSurahName(locale === 'ur' ? firstSurah.urduName : firstSurah.name);
    }
  }, [locale]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#0f0f0f] via-[#1a1a2e] to-[#16213e] text-white shadow-2xl">
      {/* زخرفة خلفية */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 -top-10 w-40 h-40 bg-[var(--secondary)]/10 rounded-full blur-3xl"></div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[var(--primary)]/10 rounded-full blur-3xl"></div>
      </div>
      
      {/* نمط زخرفي */}
      <div className="absolute left-0 top-0 bottom-0 w-24 opacity-20">
        <svg viewBox="0 0 100 200" className="w-full h-full">
          <pattern id="pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1.5" fill="var(--secondary)" />
          </pattern>
          <rect fill="url(#pattern)" width="100" height="200" />
        </svg>
      </div>

      <div className="relative p-6">
        <div className="flex justify-between items-center">
          {/* المعلومات على اليمين */}
          <div className="flex-1 text-right">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full mb-3">
              <div className="w-2 h-2 bg-[var(--secondary)] rounded-full animate-pulse"></div>
              <span className="text-xs text-white/80 font-tajawal">{t('continueReading')}</span>
            </div>
            <h3 className="font-bold text-xl text-white font-tajawal mb-1">{tQuran('surah')} {surahName}</h3>
            <p className="text-sm text-white/60 font-tajawal">{tQuran('page')} {lastPage}</p>
          </div>
          
          {/* أيقونة القرآن */}
          <div className="w-20 h-20 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--secondary)]/20 to-transparent rounded-2xl"></div>
            <span className="text-5xl text-[var(--secondary)] font-amiri">۞</span>
          </div>
        </div>

        <Link 
          href={`/quran/page/${lastPage}`}
          className="mt-5 flex items-center justify-center gap-3 w-full bg-gradient-to-r from-[var(--secondary)] to-[#f59e0b] text-[#1a1a2e] py-4 rounded-2xl font-bold transition-all duration-300 hover:shadow-lg hover:shadow-[var(--secondary)]/30 hover:scale-[1.02] font-tajawal"
        >
          <span>{t('continueReading')}</span>
          <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
