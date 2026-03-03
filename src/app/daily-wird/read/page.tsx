'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getPageAyahs, getJuzFromPage, getSurahByNumber, getSurahNameByPage } from '@/services/quranService';
import { getPageTranslations } from '@/services/translationService';

interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  surah: {
    number: number;
    name: string;
  };
}

// تحويل الأرقام إلى أرقام عربية
const toArabicNumber = (num: number): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(d => arabicNumerals[parseInt(d)]).join('');
};

// صور صفحات المصحف محلية - نفس المصدر المستخدم في المصحف
const getMushafPageUrl = (pageNumber: number): string => {
  const paddedNumber = String(pageNumber).padStart(3, '0');
  return `/images/mushaf/${paddedNumber}.webp`;
};

// Urdu translation options
const urduTranslations = [
  { id: 97, name: 'تفہیم القرآن - مولانا مودودی' },
  { id: 54, name: 'مولانا جونا گڑھی' },
  { id: 234, name: 'فتح محمد جالندھری' },
  { id: 819, name: 'مولانا وحید الدین خان' },
];

function WirdReader() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations('dailyWird');
  const tCommon = useTranslations('common');
  
  const fromPage = parseInt(searchParams.get('from') || '1');
  const toPage = parseInt(searchParams.get('to') || '1');
  
  const isUrdu = locale === 'ur';
  
  const [currentPage, setCurrentPage] = useState(fromPage);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [juzNumber, setJuzNumber] = useState(1);
  const [currentSurahName, setCurrentSurahName] = useState('');
  
  // حالات خاصة بالأردية فقط
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [translations, setTranslations] = useState<Map<string, string>>(new Map());
  const [showArabicWithTranslation, setShowArabicWithTranslation] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState(97);
  const [showTranslationMenu, setShowTranslationMenu] = useState(false);
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // حساب التقدم في الورد
  const totalPages = toPage - fromPage + 1;
  const pagesRead = currentPage - fromPage + 1;
  const progressPercent = (pagesRead / totalPages) * 100;

  // تحميل معلومات الصفحة
  useEffect(() => {
    if (currentPage >= fromPage && currentPage <= toPage) {
      setJuzNumber(getJuzFromPage(currentPage));
      setCurrentSurahName(getSurahNameByPage(currentPage));
      
      if (!isUrdu) {
        // للعربية: نستخدم الصور - نعيد تعيين حالة الخطأ فقط
        setImageError(false);
        
        // تحميل مسبق للصفحات المجاورة
        const pagesToPreload = [currentPage + 1, currentPage + 2].filter(p => p >= fromPage && p <= toPage);
        pagesToPreload.forEach(p => {
          const img = new Image();
          img.src = getMushafPageUrl(p);
        });
      } else {
        // للأردية: نحمّل النصوص
        setLoading(true);
        try {
          const localAyahs = getPageAyahs(currentPage);
          if (localAyahs.length > 0) {
            const formattedAyahs = localAyahs.map(ayah => {
              const surahInfo = getSurahByNumber(ayah.surah);
              return {
                number: ayah.number,
                text: ayah.text,
                numberInSurah: ayah.number,
                juz: ayah.juz,
                page: ayah.page,
                surah: {
                  number: ayah.surah,
                  name: ayah.surahName || surahInfo?.name || ''
                }
              };
            });
            setAyahs(formattedAyahs);
          }
        } catch (err) {
          console.error('Error loading page:', err);
        } finally {
          setLoading(false);
        }
        
        // تحميل إعدادات الترجمة
        const savedShowArabic = localStorage.getItem('showArabicWithTranslation');
        if (savedShowArabic === 'true') setShowArabicWithTranslation(true);
        const savedTranslationId = localStorage.getItem('selectedUrduTranslation');
        if (savedTranslationId) setSelectedTranslation(parseInt(savedTranslationId));
      }
    }
  }, [currentPage, fromPage, toPage, isUrdu]);

  // جلب الترجمة الأردية
  useEffect(() => {
    if (!isUrdu || ayahs.length === 0) return;
    setLoadingTranslation(true);
    try {
      const verses = ayahs.map(a => ({ surah: a.surah.number, ayah: a.numberInSurah }));
      const translationMap = getPageTranslations(selectedTranslation, verses);
      setTranslations(translationMap);
    } catch (err) {
      console.error('Error loading translations:', err);
    } finally {
      setLoadingTranslation(false);
    }
  }, [isUrdu, ayahs, selectedTranslation]);

  // إغلاق قائمة الترجمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.translation-menu')) setShowTranslationMenu(false);
    };
    if (showTranslationMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTranslationMenu]);

  const toggleArabicWithTranslation = () => {
    const newValue = !showArabicWithTranslation;
    setShowArabicWithTranslation(newValue);
    localStorage.setItem('showArabicWithTranslation', newValue.toString());
  };

  const changeTranslation = (id: number) => {
    setSelectedTranslation(id);
    localStorage.setItem('selectedUrduTranslation', id.toString());
    setShowTranslationMenu(false);
  };

  const goToPage = useCallback((page: number) => {
    if (page >= fromPage && page <= toPage) {
      setCurrentPage(page);
    }
  }, [fromPage, toPage]);

  const nextPage = useCallback(() => {
    if (currentPage < toPage) goToPage(currentPage + 1);
  }, [goToPage, currentPage, toPage]);

  const prevPage = useCallback(() => {
    if (currentPage > fromPage) goToPage(currentPage - 1);
  }, [goToPage, currentPage, fromPage]);

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

  const groupedAyahs = () => {
    const groups: { surahNumber: number; surahName: string; ayahs: Ayah[] }[] = [];
    ayahs.forEach((ayah) => {
      const lastGroup = groups[groups.length - 1];
      if (!lastGroup || lastGroup.surahNumber !== ayah.surah.number) {
        groups.push({ surahNumber: ayah.surah.number, surahName: ayah.surah.name, ayahs: [ayah] });
      } else {
        lastGroup.ayahs.push(ayah);
      }
    });
    return groups;
  };

  const finishReading = () => {
    // تسجيل إتمام الورد تلقائياً
    try {
      const saved = localStorage.getItem('quranWird');
      if (saved) {
        const settings = JSON.parse(saved);
        const completedDays: number[] = settings.completedDays || [];
        
        // حساب رقم اليوم الحالي
        const startDate = new Date(settings.createdAt);
        startDate.setHours(0, 0, 0, 0);
        const currentDayNumber = completedDays.length + 1;
        
        if (!completedDays.includes(currentDayNumber)) {
          if (currentDayNumber >= settings.durationDays) {
            // اكتملت الختمة - حذف الورد
            localStorage.removeItem('quranWird');
          } else {
            // تسجيل اليوم كمكتمل
            settings.completedDays = [...completedDays, currentDayNumber];
            localStorage.setItem('quranWird', JSON.stringify(settings));
          }
        }
      }
    } catch (e) {
      console.error('Error marking wird as completed:', e);
    }
    router.push('/daily-wird');
  };

  return (
    <div 
      className="fixed inset-0 flex flex-col bg-[#FDFAF3]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* الهيدر العلوي - نفس تصميم المصحف */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-b from-[var(--gradient-start)] to-[var(--gradient-start)]/90 text-white shadow-lg">
        <button onClick={finishReading} className="p-1 hover:bg-[var(--card-bg)]/10 rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
        
        <div className="text-center">
          <h1 className="text-sm font-bold" style={{ fontFamily: "'Amiri', serif" }}>
            {currentSurahName}
          </h1>
          <p className="text-xs opacity-80">
            {locale === 'ur' ? `صفحہ ${toArabicNumber(currentPage)} - پارہ ${toArabicNumber(juzNumber)}` : `صفحة ${toArabicNumber(currentPage)} - جزء ${toArabicNumber(juzNumber)}`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* إعدادات الترجمة للأردية فقط */}
          {isUrdu && (
            <div className="relative translation-menu">
              <button 
                onClick={() => setShowTranslationMenu(!showTranslationMenu)}
                className="p-1 rounded-full transition-colors hover:bg-[var(--card-bg)]/10"
                title="ترجمہ کی ترتیبات"
              >
                {loadingTranslation ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
              
              {showTranslationMenu && (
                <div className="absolute top-full left-0 mt-2 bg-[var(--card-bg)] rounded-xl shadow-xl border border-gray-200 py-2 min-w-[220px] z-50">
                  <div className="px-3 py-2 border-b border-gray-100">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showArabicWithTranslation}
                        onChange={toggleArabicWithTranslation}
                        className="w-4 h-4 rounded text-[#1B5E20] focus:ring-[#1B5E20]"
                      />
                      <span className="text-sm text-gray-700 font-medium">
                        عربی متن بھی دکھائیں
                      </span>
                    </label>
                  </div>
                  <div className="px-3 py-2 text-xs text-gray-400 font-medium">
                    مترجم منتخب کریں
                  </div>
                  <div className="py-1">
                    {urduTranslations.map((trans) => (
                      <button
                        key={trans.id}
                        onClick={() => changeTranslation(trans.id)}
                        className={`w-full text-right px-3 py-2 text-sm hover:bg-[var(--primary)]/5 transition-colors ${
                          selectedTranslation === trans.id ? 'bg-[var(--primary)]/5 text-[#1B5E20] font-medium' : 'text-gray-600'
                        }`}
                      >
                        {trans.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="text-center bg-[var(--card-bg)]/20 px-2 py-0.5 rounded-full">
            <p className="text-xs font-bold font-tajawal">{pagesRead}/{totalPages}</p>
          </div>
        </div>
      </div>

      {/* شريط التقدم */}
      <div className="h-1 bg-[#1B5E20]/10">
        <div 
          className="h-full bg-[var(--primary)] transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* المحتوى الرئيسي */}
      {isUrdu ? (
        /* === الأردية: عرض نص الترجمة - نفس تصميم المصحف الأردو === */
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-8" style={{ WebkitOverflowScrolling: 'touch' }}>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-[#1B5E20] text-sm" style={{ fontFamily: "'Amiri', serif" }}>{tCommon('loading')}</p>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto" dir="rtl">
              {groupedAyahs().map((group, groupIndex) => {
                const firstAyah = group.ayahs[0];
                const showSurahHeader = firstAyah && firstAyah.numberInSurah === 1;
                const hasBismillah = group.surahNumber !== 1 && group.surahNumber !== 9 && showSurahHeader;
                
                return (
                  <div key={groupIndex} className="mb-6">
                    {/* عنوان السورة */}
                    {showSurahHeader && (
                      <div className="mb-4 mt-2">
                        <div className="relative w-full flex items-center justify-center py-3 bg-gradient-to-r from-emerald-100 via-emerald-50 to-emerald-100 rounded-lg border border-[var(--card-border)]">
                          <h2 className="text-xl font-bold text-emerald-800" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
                            سورۃ {group.surahName}
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
                    
                    {/* الآيات كنص متصل - نفس المصحف الأردو */}
                    <div 
                      className="text-right"
                      style={{ 
                        fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
                        fontSize: '1.3rem',
                        lineHeight: 2.8
                      }}
                    >
                      {group.ayahs.map((ayah) => {
                        const verseKey = `${ayah.surah.number}:${ayah.numberInSurah}`;
                        const urduTranslation = translations.get(verseKey);
                        
                        return (
                          <span key={ayah.number}>
                            {showArabicWithTranslation && (
                              <span className="block text-right mb-1" style={{ fontFamily: "'KFGQPC Uthmanic Script HAFS', 'Amiri Quran', serif", fontSize: '1.1rem', lineHeight: 2, color: '#6B4423' }}>
                                {ayah.text}
                              </span>
                            )}
                            <span className="text-[var(--foreground)]">
                              {urduTranslation || (loadingTranslation ? '...' : ayah.text)}
                            </span>
                            <span 
                              className="inline-flex items-center justify-center w-7 h-7 mx-1 bg-[var(--primary-dark)] text-white rounded-full text-xs font-bold align-middle"
                              style={{ fontSize: '0.7rem' }}
                            >
                              {toArabicNumber(ayah.numberInSurah)}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* === العربية: عرض صورة صفحة المصحف - نفس API المصحف === */
        <div className="flex-1 flex items-center justify-center overflow-hidden relative">
          {imageError ? (
            <div className="text-center p-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium mb-2" style={{ fontFamily: "'Amiri', serif" }}>
                تعذر تحميل الصفحة
              </p>
              <button 
                onClick={() => {
                  setImageError(false);
                }}
                className="px-6 py-2 bg-[var(--primary-dark)] text-white rounded-lg font-medium hover:bg-[#2E7D32] transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={currentPage}
              src={getMushafPageUrl(currentPage)}
              alt={`صفحة ${currentPage} من المصحف`}
              className="max-w-full max-h-full object-contain"
              onError={() => setImageError(true)}
            />
          )}
        </div>
      )}

      {/* زر إنهاء القراءة عند الوصول للصفحة الأخيرة */}
      {currentPage === toPage && (
        <div className="px-4 py-2 bg-[#FDFAF3] border-t border-[var(--primary-dark)]/10">
          <button
            onClick={finishReading}
            className="w-full py-2.5 bg-[var(--primary-dark)] text-white rounded-xl font-bold text-sm hover:bg-[#2E7D32] transition-colors"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            ✅ {locale === 'ur' ? 'ورد مکمل کریں' : 'إنهاء الورد'}
          </button>
        </div>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#FDFAF3]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#1B5E20] font-tajawal" style={{ fontFamily: "'Amiri', serif" }}>جاري التحميل...</p>
      </div>
    </div>
  );
}

export default function WirdReadPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <WirdReader />
    </Suspense>
  );
}
