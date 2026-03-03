'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import surahsData from '@/data/quran/surahs.json';
import recitersData from '@/data/quran/reciters.json';
import { getSurahAyahs } from '@/services/quranService';
import { getSurahTranslation } from '@/services/translationService';

interface UthmaniVerse {
  id: number;
  verse_key: string;
  text_uthmani: string;
}

interface QuranComAPIResponse {
  verses: UthmaniVerse[];
}

interface AudioAPIResponse {
  audio_files: {
    verse_key: string;
    url: string;
  }[];
}

// تحويل رقم الآية إلى رقم عربي مزخرف
const toArabicNumber = (num: number): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(d => arabicNumerals[parseInt(d)]).join('');
};

// Urdu translation options
const urduTranslations = [
  { id: 97, name: 'تفہیم القرآن - مولانا مودودی' },
  { id: 54, name: 'مولانا جونا گڑھی' },
  { id: 234, name: 'فتح محمد جالندھری' },
  { id: 819, name: 'مولانا وحید الدین خان' },
];

interface SurahClientProps {
  surahNumber: string;
}

export default function SurahClient({ surahNumber: surahNumberStr }: SurahClientProps) {
  const surahNumber = parseInt(surahNumberStr);
  const t = useTranslations('quran');
  const locale = useLocale();
  const [verses, setVerses] = useState<UthmaniVerse[]>([]);
  const [audioUrls, setAudioUrls] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReciter, setSelectedReciter] = useState(7); // مشاري العفاسي
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVerse, setCurrentVerse] = useState<string | null>(null);
  const [showReciterMenu, setShowReciterMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'continuous' | 'verse'>('continuous');
  const [fontSize, setFontSize] = useState(32);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const verseRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  // Urdu translation state
  const isUrdu = locale === 'ur';
  const [translations, setTranslations] = useState<Map<string, string>>(new Map());
  const [showArabicWithTranslation, setShowArabicWithTranslation] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState(97);
  const [showTranslationMenu, setShowTranslationMenu] = useState(false);
  const [loadingTranslation, setLoadingTranslation] = useState(false);

  const surah = surahsData.surahs.find((s) => s.number === surahNumber);
  const reciter = recitersData.reciters[selectedReciter];
  
  // Helper to get surah display name based on locale
  const getSurahName = () => {
    if (!surah) return '';
    return locale === 'ur' ? surah.urduName : surah.name;
  };

  // جلب الآيات من البيانات المحلية (بدون إنترنت)
  useEffect(() => {
    const loadVerses = () => {
      try {
        setLoading(true);
        setError(null);
        
        // استخدام البيانات المحلية بدلاً من API
        const localAyahs = getSurahAyahs(surahNumber);
        
        if (localAyahs.length > 0) {
          // تحويل البيانات لتتوافق مع الهيكل المتوقع
          const formattedVerses = localAyahs.map((ayah, index) => ({
            id: index + 1,
            verse_key: `${surahNumber}:${ayah.number}`,
            text_uthmani: ayah.text
          }));
          setVerses(formattedVerses);
        } else {
          setError('لم يتم العثور على البيانات');
        }
      } catch (err) {
        setError('حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    if (surahNumber >= 1 && surahNumber <= 114) {
      loadVerses();
    } else {
      setError('رقم السورة غير صحيح');
      setLoading(false);
    }
  }, [surahNumber]);

  // جلب روابط الصوت
  useEffect(() => {
    const fetchAudio = async () => {
      try {
        // الحصول على recitation_id بناء على القارئ المختار
        const recitationIds: { [key: number]: number } = {
          0: 2, // عبدالباسط
          1: 3, // السديس
          2: 4, // أبو بكر الشاطري
          3: 5, // هاني الرفاعي
          4: 6, // الحصري
          5: 8, // المنشاوي
          6: 10, // شريم
          7: 7, // مشاري العفاسي
        };
        
        const recitationId = recitationIds[selectedReciter] || 7;
        
        const response = await fetch(
          `https://api.quran.com/api/v4/recitations/${recitationId}/by_chapter/${surahNumber}`
        );
        
        if (response.ok) {
          const data: AudioAPIResponse = await response.json();
          const urlMap = new Map<string, string>();
          data.audio_files.forEach(file => {
            urlMap.set(file.verse_key, `https://verses.quran.com/${file.url}`);
          });
          setAudioUrls(urlMap);
        }
      } catch (err) {
        console.error('Error fetching audio:', err);
      }
    };

    if (surahNumber >= 1 && surahNumber <= 114) {
      fetchAudio();
    }
  }, [surahNumber, selectedReciter]);

  // جلب الترجمة من البيانات المحلية (بدون إنترنت)
  useEffect(() => {
    const loadTranslations = () => {
      if (!isUrdu || !surahNumber) return;
      
      setLoadingTranslation(true);
      try {
        // الحصول على الترجمة من البيانات المحلية
        const surahTranslations = getSurahTranslation(selectedTranslation, surahNumber);
        
        const translationMap = new Map<string, string>();
        surahTranslations.forEach(verse => {
          const verseKey = `${surahNumber}:${verse.ayah}`;
          translationMap.set(verseKey, verse.text);
        });
        
        setTranslations(translationMap);
      } catch (err) {
        console.error('Error loading translations:', err);
      } finally {
        setLoadingTranslation(false);
      }
    };
    
    loadTranslations();
  }, [isUrdu, surahNumber, selectedTranslation]);

  // تحميل إعدادات الترجمة
  useEffect(() => {
    const savedShowArabic = localStorage.getItem('showArabicWithTranslation');
    if (savedShowArabic === 'true') {
      setShowArabicWithTranslation(true);
    }
    const savedTranslationId = localStorage.getItem('selectedUrduTranslation');
    if (savedTranslationId) {
      setSelectedTranslation(parseInt(savedTranslationId));
    }
  }, []);

  // إغلاق قائمة الترجمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.translation-menu')) {
        setShowTranslationMenu(false);
      }
    };
    
    if (showTranslationMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
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

  // حفظ مكان القراءة
  useEffect(() => {
    if (surahNumber && verses.length > 0) {
      localStorage.setItem('lastRead', JSON.stringify({
        surahNumber,
        surahName: surah?.name,
        timestamp: Date.now(),
      }));
    }
  }, [surahNumber, verses, surah?.name]);

  // التمرير للآية الحالية
  const scrollToVerse = useCallback((verseKey: string) => {
    const element = verseRefs.current.get(verseKey);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // تشغيل آية
  const playVerse = useCallback(async (verseKey: string) => {
    const audioUrl = audioUrls.get(verseKey);
    if (!audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    audioRef.current = new Audio(audioUrl);
    audioRef.current.onended = () => {
      // تشغيل الآية التالية
      const currentIndex = verses.findIndex(v => v.verse_key === verseKey);
      if (currentIndex < verses.length - 1) {
        const nextVerse = verses[currentIndex + 1];
        playVerse(nextVerse.verse_key);
      } else {
        setIsPlaying(false);
        setCurrentVerse(null);
      }
    };

    setCurrentVerse(verseKey);
    setIsPlaying(true);
    scrollToVerse(verseKey);
    
    try {
      await audioRef.current.play();
    } catch (err) {
      console.error('Error playing audio:', err);
      setIsPlaying(false);
    }
  }, [audioUrls, verses, scrollToVerse]);

  const togglePlay = () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const firstVerse = verses[0]?.verse_key;
      playVerse(currentVerse || firstVerse);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentVerse(null);
  };

  // استخراج رقم الآية من verse_key
  const getVerseNumber = (verseKey: string): number => {
    return parseInt(verseKey.split(':')[1]);
  };

  if (!surah) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">{t('surahNotFound')}</p>
          <Link href="/quran" className="text-[var(--primary)] hover:underline">
            {t('backToIndex')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--background)] to-[var(--card-bg)]">
      {/* الشريط العلوي الثابت */}
      <div className="sticky top-0 z-50 bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--card-border)] dark:bg-gradient-to-b dark:from-[#111827]/95 dark:to-[#0d1320]/95 dark:border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link 
              href="/quran" 
              className="p-2 hover:bg-[var(--accent)] rounded-xl transition-all"
            >
              <svg className="w-6 h-6 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>

            <div className="text-center">
              <h1 className="text-lg font-bold">{getSurahName()}</h1>
              <p className="text-xs text-[var(--muted)]">
                {surah.ayahCount} {t('ayahs')} • {surah.revelationType === 'Meccan' ? t('makki') : t('madani')}
              </p>
            </div>

            {/* أزرار التحكم */}
            <div className="flex items-center gap-1">
              {/* إعدادات الترجمة للأردية */}
              {isUrdu && (
                <div className="relative translation-menu">
                  <button 
                    onClick={() => setShowTranslationMenu(!showTranslationMenu)}
                    className="p-2 hover:bg-[var(--accent)] rounded-xl transition-all"
                    title="ترجمہ کی ترتیبات"
                  >
                    {loadingTranslation ? (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                  
                  {showTranslationMenu && (
                    <div className="absolute top-full left-0 mt-2 bg-[var(--card-bg)] dark:bg-[#111827] rounded-xl shadow-xl border border-gray-200 dark:border-white/10 py-2 min-w-[220px] z-50">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={showArabicWithTranslation}
                            onChange={toggleArabicWithTranslation}
                            className="w-4 h-4 rounded text-[var(--primary)] focus:ring-[var(--primary)]"
                          />
                          <span className="text-sm text-gray-700 font-medium">
                            عربی متن بھی دکھائیں
                          </span>
                        </label>
                      </div>
                      <div className="px-3 py-2 text-xs text-gray-500 font-medium">
                        مترجم منتخب کریں
                      </div>
                      <div className="py-1">
                        {urduTranslations.map((trans) => (
                          <button
                            key={trans.id}
                            onClick={() => changeTranslation(trans.id)}
                            className={`w-full text-right px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                              selectedTranslation === trans.id ? 'bg-[var(--primary)]/10 text-[var(--primary)] font-medium' : 'text-gray-700'
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
              
              {/* تكبير/تصغير الخط */}
              <button
                onClick={() => setFontSize(prev => Math.min(prev + 2, 48))}
                className="p-2 hover:bg-[var(--accent)] rounded-xl transition-all"
                title="تكبير الخط"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <button
                onClick={() => setFontSize(prev => Math.max(prev - 2, 20))}
                className="p-2 hover:bg-[var(--accent)] rounded-xl transition-all"
                title="تصغير الخط"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              {/* تبديل العرض */}
              <button
                onClick={() => setViewMode(prev => prev === 'continuous' ? 'verse' : 'continuous')}
                className="p-2 hover:bg-[var(--accent)] rounded-xl transition-all"
                title={viewMode === 'continuous' ? 'عرض آية آية' : 'عرض متصل'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {viewMode === 'continuous' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* محتوى السورة */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[var(--muted)] text-lg">جاري تحميل السورة...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <p className="text-red-500 text-xl mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary">
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <>
            {/* إطار اسم السورة */}
            <div className="mb-8">
              <div className="relative bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] rounded-2xl p-6 text-white overflow-hidden shadow-xl">
                {/* زخرفة خلفية */}
                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <pattern id="islamic-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <circle cx="10" cy="10" r="8" fill="none" stroke="white" strokeWidth="0.5"/>
                      <circle cx="10" cy="10" r="4" fill="none" stroke="white" strokeWidth="0.5"/>
                    </pattern>
                    <rect x="0" y="0" width="100%" height="100%" fill="url(#islamic-pattern)"/>
                  </svg>
                </div>
                
                {/* نجمة مزخرفة */}
                <div className="flex justify-center mb-3 relative z-10">
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white/80">
                      <path d="M12 2l2.4 7.4h7.6l-6 4.6 2.3 7.4-6.3-4.6-6.3 4.6 2.3-7.4-6-4.6h7.6z"/>
                    </svg>
                  </div>
                </div>
                
                <div className="relative z-10 text-center">
                  <div className="inline-block bg-[var(--card-bg)]/20 backdrop-blur-sm rounded-full px-6 py-2 mb-4">
                    <h2 className="text-2xl font-bold quran-text" style={{ fontSize: '28px' }}>
                      سُورَةُ {surah.name.replace('سورة ', '')}
                    </h2>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-sm opacity-90">
                    <span className="bg-[var(--card-bg)]/10 px-3 py-1 rounded-full">{surah.ayahCount} آية</span>
                    <span className="bg-[var(--card-bg)]/10 px-3 py-1 rounded-full">{surah.revelationType === 'meccan' ? 'مكية' : 'مدنية'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* البسملة */}
            {surahNumber !== 1 && surahNumber !== 9 && (
              <div className="text-center mb-8">
                <p 
                  className="inline-block text-[var(--primary)] px-8 py-4 quran-text"
                  style={{ 
                    fontSize: `${fontSize + 6}px`,
                  }}
                >
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                </p>
              </div>
            )}

            {/* الآيات */}
            <div className={`bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 ${viewMode === 'continuous' ? 'p-6 md:p-8' : 'p-4'}`}>
              {viewMode === 'continuous' ? (
                // العرض المتصل
                <div 
                  className="text-justify"
                  style={{ 
                    fontSize: `${fontSize}px`,
                    fontFamily: isUrdu ? "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif" : undefined,
                  }}
                  dir="rtl"
                >
                  {verses.map((verse, index) => {
                    const verseNum = getVerseNumber(verse.verse_key);
                    const isCurrentVerse = currentVerse === verse.verse_key;
                    // إزالة البسملة من أول آية (إلا الفاتحة)
                    let arabicText = verse.text_uthmani;
                    if (index === 0 && surahNumber !== 1 && surahNumber !== 9) {
                      arabicText = arabicText.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ\s*/, '');
                    }
                    
                    const urduTranslation = translations.get(verse.verse_key);
                    
                    // للأردية: نعرض الترجمة كنص رئيسي
                    if (isUrdu) {
                      return (
                        <div key={verse.id} className="mb-4">
                          {/* عرض النص العربي اختيارياً */}
                          {showArabicWithTranslation && (
                            <span 
                              className="block text-right mb-2 quran-text"
                              style={{
                                fontSize: `${fontSize - 4}px`,
                                lineHeight: 2,
                                color: 'var(--muted)',
                              }}
                            >
                              {arabicText}
                              <span 
                                className="inline-flex items-center justify-center mx-1"
                                style={{ 
                                  fontSize: '0.7em',
                                  verticalAlign: 'middle',
                                  fontFamily: "'Amiri', serif",
                                  color: 'var(--muted)'
                                }}
                              >
                                ﴿{toArabicNumber(verseNum)}﴾
                              </span>
                            </span>
                          )}
                          {/* الترجمة الأردية كنص رئيسي */}
                          <span
                            ref={(el) => {
                              if (el) verseRefs.current.set(verse.verse_key, el as unknown as HTMLDivElement);
                            }}
                            className={`block cursor-pointer transition-all duration-300 ${
                              isCurrentVerse 
                                ? 'bg-[var(--primary)]/20 rounded-lg px-2 py-1' 
                                : 'hover:text-[var(--primary)]'
                            }`}
                            onClick={() => playVerse(verse.verse_key)}
                            style={{
                              fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
                              lineHeight: 2.2,
                              color: 'var(--primary)',
                            }}
                          >
                            {urduTranslation || (loadingTranslation ? '...' : arabicText)}
                            <span 
                              className={`inline-flex items-center justify-center mx-1 transition-colors ${
                                isCurrentVerse ? 'text-[var(--primary)]' : 'text-[var(--secondary)]'
                              }`}
                              style={{ 
                                fontSize: '0.8em',
                                verticalAlign: 'middle',
                                fontFamily: "'Amiri', serif"
                              }}
                            >
                              ﴿{toArabicNumber(verseNum)}﴾
                            </span>
                          </span>
                        </div>
                      );
                    }
                    
                    // للعربية: النص العربي فقط
                    return (
                      <span
                        key={verse.id}
                        ref={(el) => {
                          if (el) verseRefs.current.set(verse.verse_key, el as unknown as HTMLDivElement);
                        }}
                        className={`cursor-pointer transition-all duration-300 quran-text ${
                          isCurrentVerse 
                            ? 'bg-[var(--primary)]/20 rounded-lg px-2 py-1' 
                            : 'hover:text-[var(--primary)]'
                        }`}
                        onClick={() => playVerse(verse.verse_key)}
                      >
                        {arabicText}
                        {/* رقم الآية المزخرف */}
                        <span 
                          className={`inline-flex items-center justify-center mx-1 transition-colors ${
                            isCurrentVerse ? 'text-[var(--primary)]' : 'text-[var(--secondary)]'
                          }`}
                          style={{ 
                            fontSize: '0.7em',
                            verticalAlign: 'middle',
                            fontFamily: "'Amiri', serif"
                          }}
                        >
                          ﴿{toArabicNumber(verseNum)}﴾
                        </span>
                      </span>
                    );
                  })}
                </div>
              ) : (
                // العرض آية آية
                <div className="space-y-4">
                  {verses.map((verse, index) => {
                    const verseNum = getVerseNumber(verse.verse_key);
                    const isCurrentVerse = currentVerse === verse.verse_key;
                    let arabicText = verse.text_uthmani;
                    if (index === 0 && surahNumber !== 1 && surahNumber !== 9) {
                      arabicText = arabicText.replace(/^بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ\s*/, '');
                    }
                    
                    const urduTranslation = translations.get(verse.verse_key);
                    
                    return (
                      <div
                        key={verse.id}
                        ref={(el) => {
                          if (el) verseRefs.current.set(verse.verse_key, el);
                        }}
                        className={`p-4 rounded-xl transition-all duration-300 ${
                          isCurrentVerse 
                            ? 'bg-[var(--primary)]/10 border-2 border-[var(--primary)]' 
                            : 'bg-[var(--accent)]/50 hover:bg-[var(--accent)] border-2 border-transparent'
                        }`}
                        onClick={() => playVerse(verse.verse_key)}
                      >
                        <div className="flex items-start gap-3">
                          {/* رقم الآية */}
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            isCurrentVerse 
                              ? 'bg-[var(--primary)] text-white' 
                              : 'bg-[var(--card-bg)] text-[var(--primary)] border border-[var(--primary)]'
                          }`}>
                            {toArabicNumber(verseNum)}
                          </div>
                          
                          {/* نص الآية */}
                          <div className="flex-1">
                            {isUrdu ? (
                              <>
                                {/* عرض النص العربي اختيارياً */}
                                {showArabicWithTranslation && (
                                  <p 
                                    className="text-right mb-2 quran-text"
                                    style={{ 
                                      fontSize: `${fontSize - 4}px`,
                                      color: 'var(--muted)',
                                    }}
                                    dir="rtl"
                                  >
                                    {arabicText}
                                  </p>
                                )}
                                {/* الترجمة الأردية كنص رئيسي */}
                                <p 
                                  className="text-right"
                                  style={{ 
                                    fontSize: `${fontSize}px`,
                                    fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
                                    lineHeight: 2.2,
                                    color: 'var(--primary)',
                                  }}
                                  dir="rtl"
                                >
                                  {urduTranslation || (loadingTranslation ? '...' : arabicText)}
                                </p>
                              </>
                            ) : (
                              <p 
                                className="text-right quran-text"
                                style={{ 
                                  fontSize: `${fontSize}px`,
                                }}
                                dir="rtl"
                              >
                                {arabicText}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* التنقل بين السور */}
            <div className="flex justify-between items-center mt-8 gap-4">
              {surahNumber > 1 ? (
                <Link
                  href={`/quran/${surahNumber - 1}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl hover:border-[var(--primary)] transition-all dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-[var(--primary)]/30"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-sm">
                    {surahsData.surahs.find(s => s.number === surahNumber - 1)?.name}
                  </span>
                </Link>
              ) : <div className="flex-1" />}
              
              <Link
                href="/quran"
                className="p-3 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary-light)] transition-all"
                title="فهرس السور"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </Link>
              
              {surahNumber < 114 ? (
                <Link
                  href={`/quran/${surahNumber + 1}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl hover:border-[var(--primary)] transition-all dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-[var(--primary)]/30"
                >
                  <span className="text-sm">
                    {surahsData.surahs.find(s => s.number === surahNumber + 1)?.name}
                  </span>
                  <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : <div className="flex-1" />}
            </div>
          </>
        )}
      </div>

      {/* شريط التحكم بالصوت الثابت */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--card-bg)]/95 backdrop-blur-md border-t border-[var(--card-border)] z-50 dark:bg-gradient-to-r dark:from-[#111827]/95 dark:to-[#0f1621]/95 dark:border-white/5">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            {/* زر التشغيل */}
            <button
              onClick={togglePlay}
              disabled={loading || audioUrls.size === 0}
              className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlaying ? (
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-7 h-7 mr-[-2px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* معلومات التشغيل */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium truncate">
                  {currentVerse ? `الآية ${toArabicNumber(getVerseNumber(currentVerse))}` : surah.name}
                </span>
                {isPlaying && (
                  <button
                    onClick={stopAudio}
                    className="text-[var(--muted)] hover:text-[var(--error)] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* اختيار القارئ */}
              <div className="relative">
                <button
                  onClick={() => setShowReciterMenu(!showReciterMenu)}
                  className="flex items-center gap-2 text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {reciter.name}
                  <svg className={`w-3 h-3 transition-transform ${showReciterMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* قائمة القراء */}
                {showReciterMenu && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto dark:bg-[#111827] dark:border-white/10">
                    {recitersData.reciters.map((r, index) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          stopAudio();
                          setSelectedReciter(index);
                          setShowReciterMenu(false);
                        }}
                        className={`w-full px-4 py-3 text-right text-sm hover:bg-[var(--accent)] transition-colors flex items-center justify-between ${
                          selectedReciter === index ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : ''
                        }`}
                      >
                        {r.name}
                        {selectedReciter === index && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* شريط التقدم */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--muted)]">
              {currentVerse && (
                <>
                  <span>{toArabicNumber(getVerseNumber(currentVerse))}</span>
                  <div className="w-24 h-1 bg-[var(--accent)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--primary)] transition-all duration-300"
                      style={{ 
                        width: `${(getVerseNumber(currentVerse) / verses.length) * 100}%` 
                      }}
                    />
                  </div>
                  <span>{toArabicNumber(verses.length)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* مساحة للشريط السفلي */}
      <div className="h-24" />
    </div>
  );
}
