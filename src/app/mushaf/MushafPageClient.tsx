'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { getJuzFromPage, getSurahNameByPage } from '@/services/quranService';
import surahsData from '@/data/quran/surahs.json';

// تحويل الأرقام إلى أرقام عربية
const toArabicNumber = (num: number): string => {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().split('').map(d => arabicNumerals[parseInt(d)]).join('');
};

const juzStartPages = [1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282, 302, 322, 342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582];

const TOTAL_PAGES = 604;

// صور صفحات المصحف محلية (مصحف التجويد)
const getMushafPageUrl = (pageNumber: number): string => {
  return `/images/mushaf-tajweed/${pageNumber}.jpg`;
};

// قراءة رقم الصفحة من الهاش أو localStorage
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
    const saved = localStorage.getItem('lastReadPage');
    if (saved && !isNaN(Number(saved))) {
      const p = Number(saved);
      if (p >= 1 && p <= TOTAL_PAGES) return p;
    }
  }
  return 1;
};

// مكون الصفحة الوهمية للتمرير الطولي (لإدارة الذاكرة بذكاء)
const VirtualMushafPage = ({
  pageNum,
  imageUrl,
  zoomLevel,
  viewMode,
  onVisible,
  onError,
  onToggleUI,
}: {
  pageNum: number;
  imageUrl: string;
  zoomLevel: number;
  viewMode: 'fit' | 'width';
  onVisible: (page: number) => void;
  onError: () => void;
  onToggleUI: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsLoaded(true);
            if (entry.intersectionRatio > 0.3) {
              onVisible(pageNum);
            }
          }
        });
      },
      { rootMargin: '1000px', threshold: [0, 0.3] }
    );

    observer.observe(currentRef);
    return () => observer.unobserve(currentRef);
  }, [pageNum, onVisible]);

  return (
    <div
      id={`mushaf-page-${pageNum}`}
      ref={ref}
      onClick={onToggleUI}
      className="w-full relative flex justify-center transition-all bg-[var(--background)] dark:bg-black cursor-pointer"
      style={{
        aspectRatio: '1068/1600'
      }}
    >
      {isLoaded ? (
        <img
          src={imageUrl}
          alt={`صفحة ${pageNum}`}
          className="mushaf-image transition-transform duration-300 select-none pointer-events-none"
          style={{
            width: viewMode === 'width' ? `${zoomLevel}%` : (zoomLevel > 100 ? `${zoomLevel}%` : '100%'),
            maxWidth: viewMode === 'width' || zoomLevel > 100 ? 'none' : '100%',
            display: 'block',
            objectFit: 'contain'
          }}
          onError={onError}
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--card-bg)]/10 animate-pulse">
          <svg className="w-12 h-12 text-gray-400 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
    </div>
  );
};

// مكون الصفحتين المتجاورتين للتمرير الطولي في وضع العرض (مصحف مفتوح)
const VirtualMushafSpreadRow = ({
  rightPageNum,
  leftPageNum,
  onVisible,
  onError,
  onToggleUI,
}: {
  rightPageNum: number;
  leftPageNum: number | null;
  onVisible: (page: number) => void;
  onError: () => void;
  onToggleUI: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsLoaded(true);
            if (entry.intersectionRatio > 0.3) {
              onVisible(rightPageNum);
            }
          }
        });
      },
      { rootMargin: '1000px', threshold: [0, 0.3] }
    );

    observer.observe(currentRef);
    return () => observer.unobserve(currentRef);
  }, [rightPageNum, onVisible]);

  return (
    <div
      id={`mushaf-page-${rightPageNum}`}
      ref={ref}
      onClick={onToggleUI}
      className="w-full relative flex cursor-pointer bg-[var(--background)] dark:bg-black"
      style={{ aspectRatio: '2136/1600' }}
    >
      {/* معرّف مخفي للصفحة اليسرى لدعم التنقل المباشر */}
      {leftPageNum && <span id={`mushaf-page-${leftPageNum}`} className="absolute top-0" />}
      {isLoaded ? (
        <div className="flex flex-row-reverse items-center justify-center w-full h-full gap-0.5" dir="rtl">
          <img
            src={getMushafPageUrl(rightPageNum)}
            alt={`صفحة ${rightPageNum}`}
            className="mushaf-image select-none pointer-events-none shadow-md"
            style={{ width: '49.5%', maxWidth: '49.5%', objectFit: 'contain' }}
            onError={onError}
            loading="lazy"
          />
          {leftPageNum && (
            <img
              src={getMushafPageUrl(leftPageNum)}
              alt={`صفحة ${leftPageNum}`}
              className="mushaf-image select-none pointer-events-none shadow-md"
              style={{ width: '49.5%', maxWidth: '49.5%', objectFit: 'contain' }}
              onError={onError}
              loading="lazy"
            />
          )}
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--card-bg)]/10 animate-pulse">
          <svg className="w-12 h-12 text-gray-400 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default function MushafPageClient() {
  const locale = useLocale();
  const t = useTranslations('quran');

  // Prevent hydration mismatch by delaying rendering until mounted on client
  const [mounted, setMounted] = useState(false);

  const [pageNumber, setPageNumber] = useState(() => getSavedPage());
  const [imageError, setImageError] = useState(false);
  const [juzNumber, setJuzNumber] = useState(1);
  const [currentSurahName, setCurrentSurahName] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'surahs' | 'juz'>('surahs');
  const [isFlipAnimationEnabled, setIsFlipAnimationEnabled] = useState(true);
  const [flipClass, setFlipClass] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [viewMode, setViewMode] = useState<'fit' | 'width'>('fit');
  const [readingMode, setReadingMode] = useState<'single' | 'vertical'>('single');
  const [isUIVisible, setIsUIVisible] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLandscapeAllowed, setIsLandscapeAllowed] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // كشف اتجاه الشاشة (طولي/عرضي)
  useEffect(() => {
    if (!mounted) return;
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, [mounted]);

  // إخفاء الواجهة تلقائياً في وضع العرض
  useEffect(() => {
    if (isLandscape && isLandscapeAllowed) {
      setIsUIVisible(false);
    }
  }, [isLandscape, isLandscapeAllowed]);

  // قفل الاتجاه عند مغادرة صفحة المصحف لمنع تأثر الصفحات الأخرى
  useEffect(() => {
    return () => {
      ScreenOrientation.lock({ orientation: 'portrait' }).catch(() => {});
    };
  }, []);

  // وضع الصفحتين المتجاورتين (يعمل في الصفحة المنفردة والتمرير الطولي معاً)
  const isSpreadMode = isLandscape && isLandscapeAllowed;
  const getSpreadPages = (current: number): [number, number] => {
    // في المصحف العربي: الصفحة الفردية على اليمين، الزوجية على اليسار
    if (current % 2 === 1) {
      // فردية: هذه يمين، التالية يسار
      return [current, Math.min(current + 1, TOTAL_PAGES)];
    } else {
      // زوجية: السابقة يمين، هذه يسار
      return [Math.max(current - 1, 1), current];
    }
  };

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isInitialized = useRef(false);
  const isJumping = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // === Pinch-to-Zoom ===
  const isPinching = useRef(false);
  const pinchStartDistance = useRef(0);
  const pinchStartZoom = useRef(100);
  const lastPinchZoom = useRef(100);
  const justPinched = useRef(false);
  const pinchRafId = useRef(0);

  const getTouchDistance = (t1: React.Touch, t2: React.Touch): number => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // تهيئة رقم الصفحة من الهاش أو localStorage عند التحميل
  useEffect(() => {
    const updatePageFromHash = () => {
      const hashPage = getPageFromHash();
      if (hashPage) {
        setPageNumber(hashPage);
      }
    };

    // قراءة الهاش عند التحميل الأول
    updatePageFromHash();

    // السماح بتحديث الهاش بعد التهيئة
    requestAnimationFrame(() => {
      isInitialized.current = true;
    });

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

    // Check initial dark mode state
    setIsDarkMode(document.documentElement.classList.contains('dark'));

    // Check landscape preference
    const savedLandscape = localStorage.getItem('landscapeAllowed');
    if (savedLandscape === 'true') {
      setIsLandscapeAllowed(true);
      ScreenOrientation.unlock().catch(() => {});
    }

    return () => clearInterval(interval);
  }, []);

  // تحميل معلومات الصفحة عند تغيرها
  useEffect(() => {
    if (pageNumber >= 1 && pageNumber <= TOTAL_PAGES) {
      setJuzNumber(getJuzFromPage(pageNumber));
      setCurrentSurahName(getSurahNameByPage(pageNumber));

      const bookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
      setIsBookmarked(bookmarks.includes(pageNumber));

      localStorage.setItem('lastReadPage', pageNumber.toString());

      // تحديث الهاش فقط بعد التهيئة لمنع الكتابة فوق الهاش الأصلي
      if (isInitialized.current) {
        window.location.hash = String(pageNumber);
      }

      // تحميل مسبق للصفحات المجاورة
      const pagesToPreload = [pageNumber - 1, pageNumber + 1, pageNumber + 2].filter(p => p >= 1 && p <= TOTAL_PAGES);
      pagesToPreload.forEach(p => {
        const img = new Image();
        img.src = getMushafPageUrl(p);
      });
    }
  }, [pageNumber]);

  // استرجاع تفضيلات الرسوم المتحركة ووضع العرض
  useEffect(() => {
    const storedFlip = localStorage.getItem('isFlipAnimationEnabled');
    if (storedFlip !== null) setIsFlipAnimationEnabled(storedFlip === 'true');

    const storedZoom = localStorage.getItem('mushafZoomLevel');
    if (storedZoom !== null) setZoomLevel(Number(storedZoom));

    const storedViewMode = localStorage.getItem('mushafViewMode');
    if (storedViewMode === 'fit' || storedViewMode === 'width') setViewMode(storedViewMode);

    const storedReadingMode = localStorage.getItem('mushafReadingMode');
    if (storedReadingMode === 'single' || storedReadingMode === 'vertical') setReadingMode(storedReadingMode);
  }, []);

  const handleZoomChange = (newZoom: number) => {
    setZoomLevel(newZoom);
    localStorage.setItem('mushafZoomLevel', String(newZoom));
  };

  const handleViewModeChange = (newMode: 'fit' | 'width') => {
    setViewMode(newMode);
    localStorage.setItem('mushafViewMode', newMode);
  };

  const handleReadingModeChange = (mode: 'single' | 'vertical') => {
    setReadingMode(mode);
    localStorage.setItem('mushafReadingMode', mode);
    if (mode === 'vertical') {
      setTimeout(() => {
        const el = document.getElementById(`mushaf-page-${pageNumber}`);
        if (el) el.scrollIntoView({ block: 'start' });
      }, 100);
    }
  };

  const handlePageVisible = useCallback((page: number) => {
    if (!isJumping.current) {
      setPageNumber(page);
    }
  }, []);

  const toggleFlipAnimation = () => {
    setIsFlipAnimationEnabled(prev => {
      localStorage.setItem('isFlipAnimationEnabled', String(!prev));
      return !prev;
    });
  };

  const toggleUI = () => {
    if (justPinched.current) return;
    setIsUIVisible(prev => !prev);
  };

  const toggleDarkMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= TOTAL_PAGES) {
      setImageError(false);
      setPageNumber(page);

      if (readingMode === 'vertical') {
        isJumping.current = true;
        const el = document.getElementById(`mushaf-page-${page}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => { isJumping.current = false; }, 800);
        } else {
          isJumping.current = false;
        }
      }
    }
  }, [readingMode]);

  const triggerAnimation = (direction: 'next' | 'prev') => {
    if (!isFlipAnimationEnabled) return;
    setFlipClass(direction === 'next' ? 'flip-next' : 'flip-prev');
    setTimeout(() => setFlipClass(''), 500); // مدة مطابقة لـ CSS
  };

  const nextPage = useCallback(() => {
    const step = isSpreadMode ? 2 : 1;
    if (pageNumber < TOTAL_PAGES) {
      triggerAnimation('next');
      goToPage(Math.min(pageNumber + step, TOTAL_PAGES));
    }
  }, [goToPage, pageNumber, isFlipAnimationEnabled, isSpreadMode]);

  const prevPage = useCallback(() => {
    const step = isSpreadMode ? 2 : 1;
    if (pageNumber > 1) {
      triggerAnimation('prev');
      goToPage(Math.max(pageNumber - step, 1));
    }
  }, [goToPage, pageNumber, isFlipAnimationEnabled, isSpreadMode]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // بداية القرص بإصبعين (Pinch)
      isPinching.current = true;
      pinchStartDistance.current = getTouchDistance(e.touches[0], e.touches[1]);
      pinchStartZoom.current = zoomLevel;
      lastPinchZoom.current = zoomLevel;
    } else if (e.touches.length === 1 && !isPinching.current) {
      touchStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && isPinching.current) {
      const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / pinchStartDistance.current;
      const newZoom = Math.round(Math.min(300, Math.max(100, pinchStartZoom.current * scale)));
      lastPinchZoom.current = newZoom;

      // تحديث الزوم بسلاسة عبر requestAnimationFrame
      cancelAnimationFrame(pinchRafId.current);
      pinchRafId.current = requestAnimationFrame(() => {
        setZoomLevel(newZoom);
      });
    } else if (e.touches.length === 1 && !isPinching.current) {
      touchEndX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    if (isPinching.current) {
      isPinching.current = false;
      cancelAnimationFrame(pinchRafId.current);

      // حفظ مستوى الزوم النهائي في localStorage
      handleZoomChange(lastPinchZoom.current);

      // منع السحب العرضي بعد القرص
      justPinched.current = true;
      setTimeout(() => { justPinched.current = false; }, 300);
      return;
    }

    // تعطيل التقليب بالسحب لتجنب تضارب التمرير عندما تكون الصفحة مكبرة أو في وضع القراءة بالعرض
    if (zoomLevel > 100 || viewMode === 'width' || justPinched.current) return;

    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) prevPage();
      else nextPage();
    }
  };

  // التنقل بلوحة المفاتيح
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevPage();
      if (e.key === 'ArrowRight') nextPage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPage, prevPage]);

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
    const newBookmarks = isBookmarked
      ? bookmarks.filter((p: number) => p !== pageNumber)
      : [...bookmarks, pageNumber].sort((a: number, b: number) => a - b);
    localStorage.setItem('quranBookmarks', JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
  };

  if (!mounted) {
    return (
      <div className="flex flex-col h-[100dvh] bg-[#FDFAF3] dark:bg-[#121212]">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-[var(--primary)] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/5 dark:bg-black flex justify-center">
      <div
        className={`mushaf-container relative w-full flex flex-col bg-[#FDFAF3] transition-colors duration-300 ${isSpreadMode ? '' : 'max-w-lg'}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* الهيدر العلوي - شريط عائم يختفي في وضع القراءة الممتعة */}
        <div
          className={`absolute top-0 w-full z-40 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isUIVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <div className="mushaf-header flex items-center justify-between px-3 py-2 bg-gradient-to-b from-[var(--background)] to-transparent dark:from-black dark:to-transparent text-[var(--foreground)] dark:text-gray-300 pb-10 transition-colors duration-300">
            <Link href="/quran" className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <div className="text-center">
              <h1 className="text-sm font-bold" style={{ fontFamily: "'Amiri', serif" }}>
                {currentSurahName}
              </h1>
              <p className="text-xs opacity-80">
                {locale === 'ur'
                  ? `صفحہ ${toArabicNumber(pageNumber)} - پارہ ${toArabicNumber(juzNumber)}`
                  : `صفحة ${toArabicNumber(pageNumber)} - جزء ${toArabicNumber(juzNumber)}`
                }
              </p>
            </div>

            {/* إزالة الأزرار من الهيدر لتبسيط الواجهة */}
          </div>
        </div>

        {/* شريط الأدوات السفلي للمصحف - التصميم النحيف جداً وزجاجي بالكامل (Ultra-Thin Glassmorphism) */}
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 bg-[var(--background)]/60 dark:bg-black/40 backdrop-blur-2xl border-t border-[var(--card-border)]/30 dark:border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.2)] transition-all duration-300 ease-out ${isUIVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
          dir={locale === 'ur' ? 'ltr' : 'rtl'}
        >
          <div
            className="mx-auto w-full max-w-2xl h-11 flex items-center justify-between px-3 sm:px-5"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* الجانب الأيمن: الفهرس (القائمة) */}
            <button
              onClick={(e) => { e.stopPropagation(); setIsDrawerOpen(true); }}
              className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-[var(--primary-dark)] dark:hover:text-white transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              title="الفهرس"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>

            {/* المنتصف: فارغ لراحة العين */}
            <div className="flex-1"></div>

            {/* الجانب الأيسر: أيقونات التحكم */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* العلامة المرجعية */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleBookmark(); }}
                className={`p-1.5 transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${isBookmarked ? 'text-[var(--primary-dark)] dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400 hover:text-[var(--primary-dark)] dark:hover:text-emerald-400'}`}
                title="حفظ العلامة"
              >
                <svg className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>

              {/* الوضع الليلي / النهاري */}
              <button
                onClick={toggleDarkMode}
                className={`p-1.5 transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/10 ${isDarkMode ? 'text-amber-400 dark:text-amber-300 hover:text-amber-500' : 'text-gray-500 dark:text-gray-400 hover:text-amber-500'}`}
                title={isDarkMode ? "الوضع الساطع" : "الوضع الليلي"}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* الإعدادات */}
              <button
                onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(true); }}
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-[var(--primary-dark)] dark:hover:text-white transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/10"
                title="الإعدادات"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* صورة صفحة المصحف أو القائمة الطولية */}
        {readingMode === 'single' ? (
          <div className="flex-1 overflow-auto relative scroll-smooth bg-[var(--background)] transition-colors duration-300" dir="ltr">
            {imageError ? (
              <div className="text-center p-8 flex flex-col items-center justify-center min-h-full">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-600 font-medium mb-2" style={{ fontFamily: "'Amiri', serif" }}>
                  تعذر تحميل الصفحة
                </p>
                <button
                  onClick={() => setImageError(false)}
                  className="px-6 py-2 bg-[var(--primary-dark)] text-white rounded-lg font-medium hover:bg-[#2E7D32] transition-colors"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : isSpreadMode ? (
              /* وضع الصفحتين المتجاورتين (مصحف مفتوح) */
              <div className={`min-w-full min-h-full flex items-center justify-center p-1 ${flipClass} cursor-pointer`} onClick={toggleUI}>
                {(() => {
                  const [rightPage, leftPage] = getSpreadPages(pageNumber);
                  return (
                    <div className="flex flex-row-reverse items-center justify-center h-full w-full gap-0.5" dir="rtl">
                      <img
                        key={`right-${rightPage}`}
                        src={getMushafPageUrl(rightPage)}
                        alt={`صفحة ${rightPage}`}
                        className="mushaf-image shadow-md max-h-[calc(100vh-20px)] object-contain"
                        style={{ width: '49.5%', maxWidth: '49.5%' }}
                        onError={() => setImageError(true)}
                      />
                      {leftPage !== rightPage && (
                        <img
                          key={`left-${leftPage}`}
                          src={getMushafPageUrl(leftPage)}
                          alt={`صفحة ${leftPage}`}
                          className="mushaf-image shadow-md max-h-[calc(100vh-20px)] object-contain"
                          style={{ width: '49.5%', maxWidth: '49.5%' }}
                          onError={() => setImageError(true)}
                        />
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className={`min-w-full min-h-full flex p-2 ${flipClass} cursor-pointer`} onClick={toggleUI}>
                <img
                  key={pageNumber}
                  src={getMushafPageUrl(pageNumber)}
                  alt={`صفحة ${pageNumber} من المصحف`}
                  className={`mushaf-image shadow-lg transition-transform duration-300 m-auto ${viewMode === 'fit' && zoomLevel === 100 ? 'max-w-full max-h-[calc(100vh-120px)] object-contain' : 'object-cover'
                    }`}
                  style={{
                    width: viewMode === 'width' ? `${zoomLevel}%` : (zoomLevel > 100 ? `${zoomLevel}%` : 'auto'),
                    maxWidth: viewMode === 'width' || zoomLevel > 100 ? 'none' : '100%',
                  }}
                  onError={() => setImageError(true)}
                />
              </div>
            )}
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto w-full relative scroll-smooth bg-[var(--background)] transition-colors duration-300"
            dir="ltr"
            id="vertical-mushaf-container"
          >
            <div className="w-full flex flex-col items-center">
              {isSpreadMode ? (
                // التمرير الطولي مع صفحتين متجاورتين (مصحف مفتوح)
                Array.from({ length: Math.ceil(TOTAL_PAGES / 2) }).map((_, i) => {
                  const rightPage = i * 2 + 1;
                  const leftPage = rightPage + 1;
                  return (
                    <VirtualMushafSpreadRow
                      key={rightPage}
                      rightPageNum={rightPage}
                      leftPageNum={leftPage <= TOTAL_PAGES ? leftPage : null}
                      onVisible={handlePageVisible}
                      onError={() => {}}
                      onToggleUI={toggleUI}
                    />
                  );
                })
              ) : (
                Array.from({ length: TOTAL_PAGES }).map((_, i) => (
                  <VirtualMushafPage
                    key={i + 1}
                    pageNum={i + 1}
                    imageUrl={getMushafPageUrl(i + 1)}
                    zoomLevel={zoomLevel}
                    viewMode={viewMode}
                    onVisible={handlePageVisible}
                    onError={() => { /* Ignore single image errors in scroll */ }}
                    onToggleUI={toggleUI}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* أزرار التنقل العائمة */}
        {(zoomLevel > 100 || viewMode === 'width' || readingMode === 'vertical') && (
          <>
            <button
              onClick={nextPage}
              className="fixed bottom-10 left-4 z-40 w-12 h-12 bg-black/40 text-[var(--primary-light)] rounded-full flex items-center justify-center backdrop-blur-md shadow-lg border border-white/10 hover:bg-black/60 transition-colors"
              title="الصفحة التالية"
            >
              <svg className="w-6 h-6 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
            <button
              onClick={prevPage}
              className="fixed bottom-10 right-4 z-40 w-12 h-12 bg-black/40 text-[var(--primary-light)] rounded-full flex items-center justify-center backdrop-blur-md shadow-lg border border-white/10 hover:bg-black/60 transition-colors"
              title="الصفحة السابقة"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        )}

        <style dangerouslySetInnerHTML={{
          __html: `
        .dark .mushaf-container {
          background-color: #000000 !important;
        }
        .dark .mushaf-header {
          background: #000000 !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .dark .mushaf-image {
          filter: invert(1) hue-rotate(180deg) contrast(1.1) saturate(1.5) brightness(0.9) !important;
        }

        .flip-next {
          animation: turnPageNext 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          transform-origin: left center;
        }
        .flip-prev {
          animation: turnPagePrev 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          transform-origin: right center;
        }
        @keyframes turnPageNext {
          0% { transform: perspective(2000px) rotateY(90deg); opacity: 0.5; }
          100% { transform: perspective(2000px) rotateY(0deg); opacity: 1; }
        }
        @keyframes turnPagePrev {
          0% { transform: perspective(2000px) rotateY(-90deg); opacity: 0.5; }
          100% { transform: perspective(2000px) rotateY(0deg); opacity: 1; }
        }
      `}} />

        {/* مودال الإعدادات (Bottom Sheet الزجاجي) */}
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[60] flex flex-col justify-end" dir={locale === 'ur' ? 'ltr' : 'rtl'}>
            {/* خلفية التعتيم */}
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-300"
              onClick={(e) => { e.stopPropagation(); setIsSettingsOpen(false); }}
            ></div>

            {/* القائمة المنزلقة من الأسفل */}
            <div
              className="relative w-full max-w-lg mx-auto bg-[var(--card-bg)]/90 dark:bg-[#1a1a24]/90 backdrop-blur-2xl rounded-t-3xl shadow-2xl pb-safe pt-2 px-4 border-t border-[var(--card-border)]/50 dark:border-white/10 animate-[slideUp_0.4s_cubic-bezier(0.16,1,0.3,1)]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* مقبض السحب (Drag Handle) */}
              <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 mx-auto my-3 opacity-50"></div>

              <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-xl font-bold font-tajawal text-[var(--foreground)] dark:text-white">الإعدادات</h3>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 text-gray-400 hover:text-gray-800 dark:hover:text-white bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-col gap-5 px-2 pb-8">
                {/* طريقة القراءة (Segmented Control) */}
                <div className="bg-gray-100/50 dark:bg-black/30 p-1.5 rounded-2xl flex relative overflow-hidden ring-1 ring-inset ring-[var(--card-border)]/50 dark:ring-white/5">
                  <div
                    className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[var(--card-bg)] dark:bg-[#2a2a35] rounded-xl shadow-sm transition-transform duration-300 ease-out z-0
                    ${readingMode === 'single' ? (locale === 'ur' ? 'translate-x-0' : 'translate-x-[calc(-100%-12px)]') : (locale === 'ur' ? 'translate-x-[calc(100%+12px)]' : 'translate-x-0')}`}
                  ></div>

                  <button
                    onClick={() => handleReadingModeChange('vertical')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold font-tajawal z-10 transition-colors duration-300
                    ${readingMode === 'vertical' ? 'text-[var(--primary-dark)] dark:text-[var(--primary-light)]' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>
                    التمرير الطولي
                  </button>

                  <button
                    onClick={() => handleReadingModeChange('single')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold font-tajawal z-10 transition-colors duration-300
                    ${readingMode === 'single' ? 'text-[var(--primary-dark)] dark:text-[var(--primary-light)]' : 'text-gray-500 dark:text-gray-400'}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    صفحة منفردة
                  </button>
                </div>

                {/* شريط التحكم بالخط (Zoom Slider) */}
                <div className="bg-[var(--card-bg)] dark:bg-[#2a2a35]/50 border border-[var(--card-border)]/50 dark:border-white/5 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold font-tajawal text-[var(--foreground)] dark:text-gray-200 flex items-center gap-2">
                      <svg className="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                      تكبير وتصغير
                    </h4>
                    <span className="text-xs font-bold bg-[var(--primary)]/10 text-[var(--primary-dark)] dark:text-[var(--primary-light)] px-2 py-1 rounded-md">{zoomLevel}%</span>
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <button onClick={() => handleZoomChange(Math.max(100, zoomLevel - 10))} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-black/30 text-gray-500 dark:text-gray-400 hover:text-[var(--primary)] transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                    </button>

                    <input
                      type="range"
                      min="100"
                      max="300"
                      step="10"
                      value={zoomLevel}
                      onChange={(e) => handleZoomChange(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none outline-none accent-[var(--primary)] cursor-pointer"
                    />

                    <button onClick={() => handleZoomChange(Math.min(300, zoomLevel + 10))} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-black/30 text-gray-500 dark:text-gray-400 hover:text-[var(--primary)] transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                  </div>
                </div>

                {/* مفاتيح وخيارات (Toggles & Selects) */}
                <div className="bg-[var(--card-bg)] dark:bg-[#2a2a35]/50 border border-[var(--card-border)]/50 dark:border-white/5 rounded-2xl overflow-hidden divide-y divide-[var(--card-border)]/30 dark:divide-white/5">

                  {/* القراءة بالعرض */}
                  <div className="flex items-center justify-between p-4 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary-dark)] dark:text-[var(--primary-light)]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v12H4z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v4" /></svg>
                      </div>
                      <span className="font-bold font-tajawal text-[var(--foreground)] dark:text-gray-200">القراءة بالعرض</span>
                    </div>
                    <button
                      onClick={() => {
                        const next = !isLandscapeAllowed;
                        setIsLandscapeAllowed(next);
                        localStorage.setItem('landscapeAllowed', JSON.stringify(next));
                        if (next) {
                          ScreenOrientation.unlock().catch(() => {});
                        } else {
                          ScreenOrientation.lock({ orientation: 'portrait' }).catch(() => {});
                        }
                      }}
                      className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none 
                      ${isLandscapeAllowed
                          ? 'bg-[var(--primary-dark)] dark:bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                          : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 transition duration-300 ease-in-out 
                        ${isLandscapeAllowed
                            ? (locale === 'ur' ? 'translate-x-5' : '-translate-x-5')
                            : 'translate-x-0'}`}
                      />
                    </button>
                  </div>

                  {/* حركة التقليب */}
                  {readingMode === 'single' && (
                    <div className="flex items-center justify-between p-4 bg-transparent hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary-dark)] dark:text-[var(--primary-light)]">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        </div>
                        <span className="font-bold font-tajawal text-[var(--foreground)] dark:text-gray-200">تأثير التقليب (3D)</span>
                      </div>
                      <button
                        onClick={toggleFlipAnimation}
                        className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none 
                        ${isFlipAnimationEnabled
                            ? 'bg-[var(--primary-dark)] dark:bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : 'bg-gray-300 dark:bg-gray-600'}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 transition duration-300 ease-in-out 
                          ${isFlipAnimationEnabled
                              ? (locale === 'ur' ? 'translate-x-5' : '-translate-x-5')
                              : 'translate-x-0'}`}
                        />
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* سياق الدرج الجانبي (Side Drawer) */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 flex" dir={locale === 'ur' ? 'ltr' : 'rtl'}>
            {/* الخلفية المظللة */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setIsDrawerOpen(false)}
            ></div>

            {/* قائمة الدرج */}
            <div className="relative w-80 max-w-[80%] h-full bg-[var(--card-bg)] dark:bg-[var(--surface-2)] shadow-2xl flex flex-col">
              <div className="mushaf-header p-4 bg-gradient-to-r from-[var(--gradient-start)] to-[#2E7D32] text-white flex justify-between items-center shadow-md z-10 transition-colors duration-300">
                <h2 className="text-xl font-bold font-tajawal">{t('title') || 'القرآن الكريم'}</h2>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* التبويبات */}
              <div className="flex border-b border-gray-200 dark:border-gray-800 bg-[var(--background)] dark:bg-gray-800/50">
                <button
                  className={`flex-1 py-3 font-semibold font-tajawal transition-colors ${drawerTab === 'surahs' ? 'text-[#1B5E20] dark:text-emerald-400 border-b-2 border-[var(--primary-dark)] dark:border-emerald-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                  onClick={() => setDrawerTab('surahs')}
                >
                  {t('surahs')}
                </button>
                <button
                  className={`flex-1 py-3 font-semibold font-tajawal transition-colors ${drawerTab === 'juz' ? 'text-[#1B5E20] dark:text-emerald-400 border-b-2 border-[var(--primary-dark)] dark:border-emerald-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                  onClick={() => setDrawerTab('juz')}
                >
                  {t('juz')}
                </button>
              </div>

              {/* القائمة السكرول */}
              <div className="flex-1 overflow-y-auto p-3 bg-[var(--card-bg)] dark:bg-[var(--surface-2)]">
                {drawerTab === 'surahs' && (
                  <div className="space-y-2">
                    {surahsData.surahs.map(surah => (
                      <button
                        key={surah.number}
                        onClick={() => { goToPage(surah.startPage); setIsDrawerOpen(false); }}
                        className="w-full text-right p-3 bg-[var(--background)] dark:bg-gray-800/50 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl flex items-center justify-between group transition-all duration-300 border border-transparent hover:border-green-200 dark:hover:border-green-800"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 flex items-center justify-center font-bold text-sm border border-green-200 dark:border-green-800 shadow-sm">
                            {surah.number}
                          </div>
                          <span className="font-amiri text-lg font-bold text-[var(--foreground)] dark:text-gray-200 group-hover:text-[#1B5E20] dark:group-hover:text-green-400">
                            {t('surah')} {locale === 'ur' ? surah.urduName : surah.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 font-tajawal bg-gray-100 dark:bg-[var(--surface-1)] px-2 py-1 rounded-md">
                          {t('page')} {surah.startPage}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {drawerTab === 'juz' && (
                  <div className="space-y-2">
                    {juzStartPages.map((startPage, index) => (
                      <button
                        key={index}
                        onClick={() => { goToPage(startPage); setIsDrawerOpen(false); }}
                        className="w-full text-right p-4 bg-[var(--background)] dark:bg-gray-800/50 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl flex items-center justify-between group transition-all duration-300 border border-transparent hover:border-green-200 dark:hover:border-green-800"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--gradient-start)] to-[#2E7D32] text-white flex items-center justify-center font-bold shadow-md">
                            {index + 1}
                          </div>
                          <span className="font-tajawal font-bold text-[var(--foreground)] dark:text-gray-200 group-hover:text-[#1B5E20] dark:group-hover:text-green-400">
                            {locale === 'ur' ? 'پارہ' : 'الجزء'} {index + 1}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 font-tajawal bg-gray-100 dark:bg-[var(--surface-1)] px-2 py-1 rounded-md">
                          {t('page')} {startPage}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
