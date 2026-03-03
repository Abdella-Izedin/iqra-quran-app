'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getJuzFromPage, getSurahNameByPage, getPageAyahs, getSurahByNumber } from '@/services/quranService';
import { getPageTranslations, getAvailableTranslations } from '@/services/translationService';

// تحويل الأرقام إلى أرقام أردية
const toUrduNumber = (num: number): string => {
  const urduNumerals = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().split('').map(d => urduNumerals[parseInt(d)]).join('');
};

const TOTAL_PAGES = 604;

interface Ayah {
  number: number;
  text: string;
  surah: number;
  surahName: string;
  juz: number;
  hizb: number;
  page: number;
}

export default function UrduMushafPageClient() {
  // قراءة رقم الصفحة من الهاش
  const getPageFromHash = (): number | null => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash && !isNaN(Number(hash))) {
        const p = Number(hash);
        if (p >= 1 && p <= TOTAL_PAGES) return p;
      }
    }
    return null;
  };

  const getSavedPage = (): number => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('lastReadPageUrdu');
      if (saved && !isNaN(Number(saved))) {
        const p = Number(saved);
        if (p >= 1 && p <= TOTAL_PAGES) return p;
      }
    }
    return 1;
  };

  const [pageNumber, setPageNumber] = useState(() => getSavedPage());
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [translations, setTranslations] = useState<Map<string, string>>(new Map());
  const [juzNumber, setJuzNumber] = useState(1);
  const [currentSurahName, setCurrentSurahName] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);

  const [selectedTranslation, setSelectedTranslation] = useState(97);
  const [showTranslationMenu, setShowTranslationMenu] = useState(false);
  const [showArabicText, setShowArabicText] = useState(false);
  
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isInitialized = useRef(false);

  const urduTranslations = getAvailableTranslations();

  // تهيئة رقم الصفحة ومراقبة تغييرات الهاش
  useEffect(() => {
    const updatePageFromHash = () => {
      const hashPage = getPageFromHash();
      if (hashPage) {
        setPageNumber(hashPage);
      }
    };

    updatePageFromHash();

    // السماح بتحديث الهاش بعد التهيئة
    requestAnimationFrame(() => {
      isInitialized.current = true;
    });
    
    // استرجاع المترجم المحفوظ
    const savedTranslationId = localStorage.getItem('selectedUrduTranslation');
    if (savedTranslationId) {
      setSelectedTranslation(parseInt(savedTranslationId));
    }
    
    // استرجاع إعداد عرض النص العربي
    const savedShowArabic = localStorage.getItem('showArabicWithTranslation');
    if (savedShowArabic === 'true') {
      setShowArabicText(true);
    }

    // مراقبة تغييرات الهاش من Next.js Link
    let lastHash = window.location.hash;
    const checkHash = () => {
      const currentHash = window.location.hash;
      if (currentHash !== lastHash) {
        lastHash = currentHash;
        updatePageFromHash();
      }
    };
    const interval = setInterval(checkHash, 100);
    return () => clearInterval(interval);
  }, []);

  // حساب أرقام الآيات داخل السور
  const computeVerses = useCallback((pageAyahs: Ayah[]) => {
    return pageAyahs.map((a) => {
      const surahInfo = getSurahByNumber(a.surah);
      const surahStartPage = surahInfo?.startPage || 1;
      
      let prevAyahCount = 0;
      if (surahStartPage < a.page) {
        for (let p = surahStartPage; p < a.page; p++) {
          const prevPageAyahs = getPageAyahs(p);
          prevAyahCount += prevPageAyahs.filter(pa => pa.surah === a.surah).length;
        }
      }
      
      const allPageAyahs = getPageAyahs(a.page);
      const currentIndex = allPageAyahs.findIndex(ay => ay.number === a.number);
      let samesurahBefore = 0;
      for (let i = 0; i < currentIndex; i++) {
        if (allPageAyahs[i].surah === a.surah) samesurahBefore++;
      }
      
      const ayahInSurah = prevAyahCount + samesurahBefore + 1;
      return { surah: a.surah, ayah: ayahInSurah };
    });
  }, []);

  // تحميل بيانات الصفحة
  useEffect(() => {
    if (pageNumber >= 1 && pageNumber <= TOTAL_PAGES) {
      const pageAyahs = getPageAyahs(pageNumber);
      setAyahs(pageAyahs);
      
      setJuzNumber(getJuzFromPage(pageNumber));
      
      const surahInfo = getSurahByNumber(pageAyahs[0]?.surah || 1);
      setCurrentSurahName(surahInfo?.urduName || getSurahNameByPage(pageNumber));
      
      const verses = computeVerses(pageAyahs);
      const translationMap = getPageTranslations(selectedTranslation, verses);
      setTranslations(translationMap);
      
      const bookmarks = JSON.parse(localStorage.getItem('quranBookmarksUrdu') || '[]');
      setIsBookmarked(bookmarks.includes(pageNumber));
      
      localStorage.setItem('lastReadPageUrdu', pageNumber.toString());
      
      // تحديث الهاش فقط بعد التهيئة لمنع الكتابة فوق الهاش الأصلي
      if (isInitialized.current) {
        window.location.hash = String(pageNumber);
      }
    }
  }, [pageNumber, selectedTranslation, computeVerses]);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= TOTAL_PAGES) {
      setPageNumber(page);
    }
  }, []);

  const nextPage = useCallback(() => goToPage(pageNumber + 1), [goToPage, pageNumber]);
  const prevPage = useCallback(() => goToPage(pageNumber - 1), [goToPage, pageNumber]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) prevPage();
      else nextPage();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevPage();
      if (e.key === 'ArrowRight') nextPage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPage, prevPage]);

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('quranBookmarksUrdu') || '[]');
    const newBookmarks = isBookmarked
      ? bookmarks.filter((p: number) => p !== pageNumber)
      : [...bookmarks, pageNumber].sort((a: number, b: number) => a - b);
    localStorage.setItem('quranBookmarksUrdu', JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
  };

  const changeTranslation = (id: number) => {
    setSelectedTranslation(id);
    localStorage.setItem('selectedUrduTranslation', id.toString());
    setShowTranslationMenu(false);
  };

  const toggleArabicText = () => {
    const newValue = !showArabicText;
    setShowArabicText(newValue);
    localStorage.setItem('showArabicWithTranslation', newValue.toString());
  };

  // تجميع الآيات حسب السورة
  const groupedAyahs = () => {
    const groups: { surahNumber: number; urduSurahName: string; ayahs: { ayah: Ayah; ayahInSurah: number }[] }[] = [];
    let currentAyahInSurah = 1;
    let lastSurah = 0;
    
    ayahs.forEach((ayah) => {
      if (ayah.surah !== lastSurah) {
        const surahInfo = getSurahByNumber(ayah.surah);
        const surahStartPage = surahInfo?.startPage || 1;
        const urduName = surahInfo?.urduName || ayah.surahName;
        
        if (surahStartPage < pageNumber) {
          let prevCount = 0;
          for (let p = surahStartPage; p < pageNumber; p++) {
            prevCount += getPageAyahs(p).filter(a => a.surah === ayah.surah).length;
          }
          currentAyahInSurah = prevCount + 1;
        } else {
          currentAyahInSurah = 1;
        }
        
        groups.push({ surahNumber: ayah.surah, urduSurahName: urduName, ayahs: [] });
        lastSurah = ayah.surah;
      }
      
      groups[groups.length - 1].ayahs.push({ ayah, ayahInSurah: currentAyahInSurah });
      currentAyahInSurah++;
    });
    
    return groups;
  };

  if (ayahs.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F5F0E8]">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-800 text-lg" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>صفحہ لوڈ ہو رہا ہے...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 flex flex-col bg-[#F5F0E8]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* الهيدر */}
      <div 
        className="z-20"
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-b from-emerald-700 to-emerald-800 text-white shadow-lg">
          <Link href="/quran" className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          
          <div className="text-center">
            <h1 className="text-sm font-bold" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
              {currentSurahName}
            </h1>
            <p className="text-xs opacity-80" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
              صفحہ {toUrduNumber(pageNumber)} - پارہ {toUrduNumber(juzNumber)}
            </p>
          </div>
          
          <div className="flex items-center gap-1">
            <div className="relative">
              <button 
                onClick={() => setShowTranslationMenu(!showTranslationMenu)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              
              {showTranslationMenu && (
                <>
                  {/* خلفية شفافة للإغلاق */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={(e) => { e.stopPropagation(); setShowTranslationMenu(false); }}
                  />
                  {/* القائمة */}
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 py-2 min-w-[220px] z-50" dir="rtl">
                    {/* خيار عرض النص العربي */}
                    <div className="px-3 py-2 border-b border-gray-100">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showArabicText}
                          onChange={(e) => { e.stopPropagation(); toggleArabicText(); }}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-gray-700 font-medium" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
                          عربی متن بھی دکھائیں
                        </span>
                      </label>
                    </div>
                    <div className="px-3 py-2 text-xs text-gray-500" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
                      مترجم منتخب کریں
                    </div>
                    {urduTranslations.map((trans) => (
                      <button
                        key={trans.id}
                        onClick={(e) => { e.stopPropagation(); changeTranslation(trans.id); }}
                        className={`w-full text-right px-3 py-2 text-sm hover:bg-emerald-50 transition-colors ${
                          selectedTranslation === trans.id ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700'
                        }`}
                        style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
                      >
                        {trans.name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <button onClick={(e) => { e.stopPropagation(); toggleBookmark(); }} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* محتوى الصفحة */}
      <div 
        className="flex-1 overflow-y-auto px-4 pt-4 pb-8"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="max-w-2xl mx-auto" dir="rtl">
          {groupedAyahs().map((group, groupIndex) => {
            const isFirstAyahOfSurah = group.ayahs[0]?.ayahInSurah === 1;
            const hasBismillah = group.surahNumber !== 1 && group.surahNumber !== 9 && isFirstAyahOfSurah;
            
            return (
              <div key={groupIndex} className="mb-6">
                {isFirstAyahOfSurah && (
                  <div className="mb-4 mt-2">
                    <div className="relative w-full flex items-center justify-center py-3 bg-gradient-to-r from-emerald-100 via-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <svg width="12" height="24" viewBox="0 0 12 24" fill="none">
                          <path d="M6 2L10 6L6 10L2 6Z" fill="#059669" opacity="0.6"/>
                          <path d="M6 14L10 18L6 22L2 18Z" fill="#059669" opacity="0.6"/>
                        </svg>
                      </div>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <svg width="12" height="24" viewBox="0 0 12 24" fill="none">
                          <path d="M6 2L10 6L6 10L2 6Z" fill="#059669" opacity="0.6"/>
                          <path d="M6 14L10 18L6 22L2 18Z" fill="#059669" opacity="0.6"/>
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-emerald-800" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
                        سورۃ {group.urduSurahName}
                      </h2>
                    </div>
                    
                    {hasBismillah && (
                      <div className="flex justify-center my-4">
                        <p className="text-xl text-emerald-800" style={{ fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif" }}>
                          شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                <div 
                  className="text-right"
                  style={{ 
                    fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
                    fontSize: '1.3rem',
                    lineHeight: 2.8
                  }}
                >
                  {group.ayahs.map(({ ayah, ayahInSurah }) => {
                    const verseKey = `${ayah.surah}:${ayahInSurah}`;
                    const translation = translations.get(verseKey);
                    
                    return (
                      <span key={ayah.number}>
                        {/* عرض النص العربي إذا كان مفعلاً */}
                        {showArabicText && (
                          <span 
                            className="block text-right mb-1" 
                            style={{ 
                              fontFamily: "'KFGQPC Uthmanic Script HAFS', 'Amiri Quran', serif", 
                              fontSize: '1.1rem', 
                              lineHeight: 2, 
                              color: '#6B4423' 
                            }}
                          >
                            {ayah.text}
                          </span>
                        )}
                        <span className="text-gray-900">
                          {translation || '...'}
                        </span>
                        <span 
                          className="inline-flex items-center justify-center w-7 h-7 mx-1 bg-emerald-600 text-white rounded-full text-xs font-bold align-middle"
                          style={{ fontSize: '0.7rem' }}
                        >
                          {toUrduNumber(ayahInSurah)}
                        </span>
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* أزرار التنقل */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-t from-emerald-700 to-emerald-800 text-white">
        <button
          onClick={nextPage}
          disabled={pageNumber >= TOTAL_PAGES}
          className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }} className="text-sm">اگلا صفحہ</span>
        </button>

        <span className="text-sm opacity-80" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
          {toUrduNumber(pageNumber)} / {toUrduNumber(TOTAL_PAGES)}
        </span>

        <button
          onClick={prevPage}
          disabled={pageNumber <= 1}
          className="flex items-center gap-2 px-4 py-2 bg-white/15 hover:bg-white/25 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <span style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }} className="text-sm">پچھلا صفحہ</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
