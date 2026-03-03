'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import surahsData from '@/data/quran/surahs.json';
import { useTranslations, useLocale } from 'next-intl';
import { getPageAyahs, getJuzFromPage, getSurahByNumber } from '@/services/quranService';

interface WirdSettings {
  startPage: number;
  startJuz: number;
  durationDays: number;
  pagesPerDay: number;
  createdAt: string;
  completedDays: number[];
}

type TabType = 'surahs' | 'juz' | 'hizb' | 'pages' | 'bookmarks';

const getMainTabs = (t: (key: string) => string) => [
  { id: 'surahs' as const, label: t('surahs'), placeholder: t('searchSurah') },
  { id: 'juz' as const, label: t('juz'), placeholder: t('searchJuz') },
  { id: 'hizb' as const, label: t('hizb'), placeholder: t('searchHizb') },
  { id: 'pages' as const, label: t('pages'), placeholder: t('searchPage') },
];

// Helper to get juz names from translations
const getJuzNames = (t: (key: string) => string) =>
  Array.from({ length: 30 }, (_, i) => t(`juzNames.${i + 1}`));

// صفحة بداية كل جزء
const juzStartPages = [1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282, 302, 322, 342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582];

// صفحة بداية كل حزب (60 حزب)
const hizbStartPages = [
  1, 11, 22, 32, 42, 52, 62, 72, 82, 92, 102, 112, 121, 132, 142, 152, 162, 173, 182, 192,
  201, 212, 222, 232, 242, 252, 262, 272, 282, 292, 302, 312, 322, 332, 342, 352, 362, 372, 382, 392,
  402, 412, 422, 432, 442, 452, 462, 472, 482, 492, 502, 512, 522, 532, 542, 552, 562, 572, 582, 592
];

const TOTAL_PAGES = 604;

function QuranPageContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const t = useTranslations('quran');
  const locale = useLocale();

  const mainTabs = getMainTabs(t);

  // Helper to get surah display name based on locale
  const getSurahName = (surah: typeof surahsData.surahs[0]) => {
    return locale === 'ur' ? surah.urduName : surah.name;
  };

  const [activeTab, setActiveTab] = useState<TabType>('surahs');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [bookmarkDetails, setBookmarkDetails] = useState<Map<number, { surahName: string; firstAyah: string; juz: number }>>(new Map());
  const [hasWird, setHasWird] = useState(false);
  const [wirdCompleted, setWirdCompleted] = useState(false);
  const [lastReadDetails, setLastReadDetails] = useState<{ page: number; surahName: string; juz: number } | null>(null);

  // التحقق من معلمة URL للتبويب
  useEffect(() => {
    if (tabParam === 'bookmarks') {
      setActiveTab('bookmarks');
      const savedBookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
      setBookmarks(savedBookmarks);
    }
  }, [tabParam]);

  // جلب العلامات المرجعية والتحقق من وجود الورد وآخر صفحة مقروءة
  useEffect(() => {
    const savedBookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
    setBookmarks(savedBookmarks);

    // التحقق من وجود ورد يومي
    const savedWird = localStorage.getItem('quranWird');
    if (savedWird) {
      const wird: WirdSettings = JSON.parse(savedWird);
      const completedDays = wird.completedDays || [];
      setHasWird(true);
      // التحقق إذا اكتملت الختمة
      setWirdCompleted(completedDays.length >= wird.durationDays);
    } else {
      setHasWird(false);
      setWirdCompleted(false);
    }

    // جلب آخر صفحة مقروءة
    const lastRead = localStorage.getItem('lastReadPage');
    if (lastRead && !isNaN(Number(lastRead))) {
      const pageNum = Number(lastRead);
      if (pageNum >= 1 && pageNum <= TOTAL_PAGES) {
        const surahInfo = getSurahByNumber(getPageAyahs(pageNum)[0]?.surah);
        setLastReadDetails({
          page: pageNum,
          surahName: surahInfo?.name || getPageAyahs(pageNum)[0]?.surahName || '',
          juz: getJuzFromPage(pageNum)
        });
      }
    }
  }, []);

  // جلب تفاصيل الصفحات المحفوظة من البيانات المحلية
  useEffect(() => {
    const loadBookmarkDetails = () => {
      const details = new Map<number, { surahName: string; firstAyah: string; juz: number }>();

      for (const page of bookmarks) {
        try {
          const ayahs = getPageAyahs(page);

          if (ayahs.length > 0) {
            const firstAyah = ayahs[0];
            const surahInfo = getSurahByNumber(firstAyah.surah);
            details.set(page, {
              surahName: surahInfo?.name || firstAyah.surahName,
              firstAyah: firstAyah.text.substring(0, 50) + (firstAyah.text.length > 50 ? '...' : ''),
              juz: getJuzFromPage(page)
            });
          }
        } catch (error) {
          console.error(`Error loading page ${page}:`, error);
        }
      }

      setBookmarkDetails(details);
    };

    if (bookmarks.length > 0) {
      loadBookmarkDetails();
    }
  }, [bookmarks]);

  const getSearchPlaceholder = () => {
    if (activeTab === 'bookmarks') return t('searchBookmarks');
    return mainTabs.find(tab => tab.id === activeTab)?.placeholder || '';
  };

  // فلترة السور
  const filteredSurahs = surahsData.surahs.filter((surah) => {
    if (!searchQuery) return true;
    return surah.name.includes(searchQuery) ||
      surah.urduName.includes(searchQuery) ||
      surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.number.toString() === searchQuery;
  });

  // فلترة الأجزاء
  const juzNamesTranslated = getJuzNames(t);
  const filteredJuz = juzNamesTranslated.map((name, i) => ({ number: i + 1, name, startPage: juzStartPages[i] }))
    .filter((juz) => {
      if (!searchQuery) return true;
      return juz.number.toString() === searchQuery || juz.name.includes(searchQuery);
    });

  // فلترة الأحزاب
  const allHizbs = Array.from({ length: 60 }, (_, i) => ({ number: i + 1, startPage: hizbStartPages[i] }));
  const filteredHizb = allHizbs.filter((hizb) => {
    if (!searchQuery) return true;
    return hizb.number.toString() === searchQuery;
  });

  // فلترة الصفحات
  const getFilteredPages = () => {
    const pages = Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1);
    if (!searchQuery) return pages;
    return pages.filter(p => p.toString().includes(searchQuery));
  };

  // فلترة العلامات المرجعية
  const getFilteredBookmarks = () => {
    if (!searchQuery) return bookmarks;
    return bookmarks.filter(p => p.toString().includes(searchQuery));
  };

  // حذف علامة مرجعية
  const removeBookmark = (page: number) => {
    const newBookmarks = bookmarks.filter(p => p !== page);
    setBookmarks(newBookmarks);
    localStorage.setItem('quranBookmarks', JSON.stringify(newBookmarks));
  };

  // شكل بسيط وجميل للأرقام
  const NumberIcon = ({ number, size = 'md', color = 'primary' }: { number: number; size?: 'sm' | 'md'; color?: 'primary' | 'green' }) => {
    const sizeClasses = size === 'sm' ? 'w-11 h-11' : 'w-14 h-14';
    const textSize = size === 'sm' ? 'text-sm' : 'text-base';
    const colorClass = color === 'green' ? 'text-[var(--primary-dark)]' : 'text-[var(--primary)]';
    const bgColorClass = color === 'green' ? 'bg-[var(--primary)]/5' : 'bg-[var(--primary)]/5';

    return (
      <div className={`relative ${sizeClasses} flex items-center justify-center flex-shrink-0 ${bgColorClass} rounded-2xl border-2 border-current ${colorClass} transition-all duration-300 hover:scale-105`}>
        <span className={`${textSize} font-bold font-tajawal`}>
          {number}
        </span>
      </div>
    );
  };

  // الحصول على رابط المصحف حسب اللغة
  const getMushafLink = (page: number) => {
    // إذا كانت اللغة أردية، نستخدم المصحف الأردي المصور
    if (locale === 'ur') {
      return `/mushaf-urdu#${page}`;
    }
    // للعربية نستخدم المصحف المدني المصور
    return `/mushaf#${page}`;
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-4">
      {/* Header */}
      <div className="bg-[var(--card-bg)] sticky top-0 z-10 border-b border-[var(--card-border)] dark:bg-gradient-to-b dark:from-[#111827] dark:to-[#0d1320] dark:border-white/5">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent dark:from-[var(--primary)]/10 dark:to-transparent"></div>
          <div className="flex items-center justify-between px-4 py-4">
            {/* مساحة فارغة للتوازن */}
            <div className="w-10"></div>

            <h1 className="text-2xl font-bold text-center font-tajawal text-[var(--foreground)]">
              {t('title')}
            </h1>

            {/* أيقونة المحفوظات */}
            <button
              onClick={() => {
                setActiveTab('bookmarks');
                setSearchQuery('');
                const savedBookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
                setBookmarks(savedBookmarks);
              }}
              className={`relative p-2 rounded-full transition-all duration-300 ${activeTab === 'bookmarks'
                ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white shadow-lg shadow-[var(--shadow-color)]'
                : 'hover:bg-[var(--primary)]/10 dark:hover:bg-[var(--primary)]/20 text-[var(--primary)] dark:text-[var(--primary-light)]'
                }`}
            >
              <svg className="w-6 h-6" fill={activeTab === 'bookmarks' || bookmarks.length > 0 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {bookmarks.length > 0 && activeTab !== 'bookmarks' && (
                <span className="absolute -top-1 -right-1 bg-[var(--primary)] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {bookmarks.length > 9 ? '9+' : bookmarks.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <input
              type="text"
              placeholder={getSearchPlaceholder()}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-4 pl-14 rounded-2xl border-2 border-[var(--card-border)] bg-[var(--accent)] focus:outline-none focus:border-[var(--primary)] text-right transition-all duration-300 font-tajawal dark:bg-white/5 dark:border-white/10 dark:focus:border-[var(--primary)] dark:focus:shadow-[0_0_15px_var(--glow-primary)]"
            />
            <svg
              className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--primary)] dark:text-[var(--primary-light)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* بطاقة متابعة القراءة (Auto-Save) */}
        {lastReadDetails && (
          <div className="px-4 pb-4">
            <Link href={getMushafLink(lastReadDetails.page)}>
              <div className="bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg transition-all dark:shadow-lg shadow-[var(--shadow-color)] dark:hover:shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <svg className="w-7 h-7 text-[var(--primary-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="flex-1 text-right">
                  <h3 className="text-white font-bold font-tajawal">متابعة القراءة</h3>
                  <p className="text-white/80 text-sm font-tajawal">
                    سورة {lastReadDetails.surahName} - صفحة {lastReadDetails.page}
                  </p>
                </div>
                <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </Link>
          </div>
        )}

        {/* بطاقة الورد اليومي */}
        <div className="px-4 pb-4">
          <Link href="/daily-wird">
            <div className="bg-[var(--secondary)] rounded-2xl p-4 flex items-center gap-4 hover:shadow-lg transition-all dark:shadow-lg shadow-[var(--shadow-color)] dark:hover:shadow-xl">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <svg className="w-7 h-7 text-[var(--primary-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477-4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1 text-right">
                <h3 className="text-white font-bold font-tajawal">{t('dailyWird')}</h3>
                <p className="text-white/80 text-sm font-tajawal">
                  {!hasWird || wirdCompleted ? t('createNewKhatmah') : t('continueWird')}
                </p>
              </div>
              <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pb-4 gap-2 overflow-x-auto">
          {mainTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery('');
              }}
              className={`flex-1 min-w-fit py-3 px-4 rounded-2xl text-sm font-bold transition-all duration-300 font-tajawal border-2 ${activeTab === tab.id
                ? 'bg-[var(--primary)]/10 text-[var(--primary-dark)] border-[var(--primary)] dark:bg-[var(--primary)]/20 dark:text-[var(--primary-light)] shadow-sm'
                : 'bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--primary)]/30 hover:text-[var(--primary-dark)] dark:hover:text-[var(--primary-light)]'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {/* المحفوظات */}
        {activeTab === 'bookmarks' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-tajawal text-[var(--foreground)] flex items-center gap-2">
                <svg className="w-6 h-6 text-[var(--primary)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {t('bookmarks')}
              </h2>
              <span className="text-sm text-[var(--muted-foreground)] font-tajawal">
                {bookmarks.length} {t('page')}
              </span>
            </div>

            {getFilteredBookmarks().length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--primary)]/10 dark:bg-[var(--primary)]/20 flex items-center justify-center">
                  <svg className="w-10 h-10 text-[var(--primary)] dark:text-[var(--primary-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <p className="text-[var(--muted-foreground)] font-tajawal text-lg">{t('noBookmarks')}</p>
                <p className="text-sm text-[var(--muted-foreground)] font-tajawal mt-2">
                  {t('addBookmarksHint')}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {getFilteredBookmarks().map((page, index) => {
                  const details = bookmarkDetails.get(page);

                  return (
                    <div
                      key={page}
                      className="relative animate-slideUp"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center gap-2">
                        <Link
                          href={getMushafLink(page)}
                          className="flex-1 block bg-gradient-to-br from-[var(--card-bg)] to-[var(--accent)] dark:from-[var(--surface-1)] dark:to-[var(--surface-2)] border-2 border-[var(--card-border)] dark:border-[var(--primary)]/30 rounded-3xl p-4 hover:shadow-xl dark:hover:shadow-[0_8px_30px_var(--shadow-color)] hover:border-[var(--primary)] dark:hover:border-[var(--primary)]/50 transition-all duration-300 group"
                        >
                          <div className="flex items-center gap-4">
                            {/* رقم الصفحة */}
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex flex-col items-center justify-center shadow-lg group-hover:scale-110 transition-transform dark:shadow-[0_4px_20px_var(--shadow-color)]">
                              <span className="text-white text-xl font-bold font-tajawal">{page}</span>
                              <span className="text-white/80 text-[10px] font-tajawal">{t('page')}</span>
                            </div>

                            {/* تفاصيل الصفحة */}
                            <div className="flex-1 text-right min-w-0">
                              {details ? (
                                <>
                                  <h3 className="font-bold text-lg text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors font-amiri truncate">
                                    {details.surahName}
                                  </h3>
                                  <p className="text-sm text-[var(--muted)] font-amiri mt-1 line-clamp-1 leading-relaxed" dir="rtl">
                                    {details.firstAyah}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="text-xs text-[var(--primary)] dark:text-[var(--primary-light)] bg-[var(--primary)]/10 dark:bg-[var(--primary)]/20 px-2 py-0.5 rounded-full font-tajawal">
                                      {t('juzPrefix')} {details.juz}
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <div className="animate-pulse">
                                  <div className="h-5 bg-[var(--primary)]/20 dark:bg-[var(--primary)]/30 rounded w-24 mb-2"></div>
                                  <div className="h-4 bg-[var(--primary)]/10 dark:bg-[var(--primary)]/20 rounded w-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>

                        {/* زر إزالة العلامة */}
                        <button
                          onClick={() => removeBookmark(page)}
                          className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 dark:bg-[var(--primary)]/20 hover:bg-[var(--error)]/20 dark:hover:bg-[var(--error)]/20 flex items-center justify-center transition-all duration-300 group/btn"
                          title="إزالة من المحفوظات"
                        >
                          <svg
                            className="w-6 h-6 text-[var(--primary)] dark:text-[var(--primary-light)] group-hover/btn:text-[var(--error)] dark:group-hover/btn:text-[var(--error)] transition-colors"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* السور */}
        {activeTab === 'surahs' && (
          <div className="space-y-3">
            {filteredSurahs.map((surah, index) => (
              <Link
                key={surah.number}
                href={getMushafLink(surah.startPage)}
                className="block animate-slideUp"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-4 flex items-center gap-4 hover:shadow-xl hover:border-[var(--primary)]/30 transition-all duration-300 group dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-[var(--primary)]/30 dark:hover:shadow-xl shadow-[var(--shadow-color)]">
                  {/* شكل بسيط مع رقم السورة */}
                  <div className="transition-transform duration-300 group-hover:scale-110">
                    <NumberIcon number={surah.number} />
                  </div>

                  {/* معلومات السورة */}
                  <div className="flex-1 text-right">
                    <h2 className="font-bold text-lg font-amiri text-[var(--foreground)]">{t('surah')} {getSurahName(surah)}</h2>
                    <p className="text-sm text-[var(--muted)] font-tajawal mt-1">
                      <span className="inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] dark:bg-emerald-400"></span>
                        {surah.ayahCount} {t('ayahs')}
                      </span>
                      <span className="mx-2">•</span>
                      <span className={`${surah.revelationType === 'Meccan' ? 'text-[var(--primary)] dark:text-[var(--primary-light)]' : 'text-[var(--primary-dark)] dark:text-[var(--primary-light)]'}`}>
                        {surah.revelationType === 'Meccan' ? t('makki') : t('madani')}
                      </span>
                    </p>
                  </div>

                  {/* سهم */}
                  <svg className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--primary)] dark:group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* الأجزاء */}
        {activeTab === 'juz' && (
          <div className="grid grid-cols-2 gap-3">
            {filteredJuz.map((juz, index) => (
              <Link
                key={juz.number}
                href={getMushafLink(juz.startPage)}
                className="block animate-scaleIn"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-5 text-center hover:shadow-xl hover:border-[var(--primary)]/30 transition-all duration-300 group dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-[var(--primary)]/30 dark:hover:shadow-xl shadow-[var(--shadow-color)]">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform dark:shadow-md shadow-[var(--shadow-color)]">
                    <span className="text-white font-bold font-tajawal">{juz.number}</span>
                  </div>
                  <span className="font-semibold text-sm text-[var(--foreground)] font-tajawal">{juz.name}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* الأحزاب */}
        {activeTab === 'hizb' && (
          <div className="grid grid-cols-3 gap-3">
            {filteredHizb.map((hizb, index) => (
              <Link
                key={hizb.number}
                href={getMushafLink(hizb.startPage)}
                className="block animate-scaleIn"
                style={{ animationDelay: `${index * 20}ms` }}
              >
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 text-center hover:shadow-xl hover:border-[var(--primary)]/30 transition-all duration-300 group dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-[var(--primary)]/30 dark:hover:shadow-xl shadow-[var(--shadow-color)]">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform dark:shadow-md shadow-[var(--shadow-color)]">
                    <span className="text-white text-sm font-bold font-tajawal">{hizb.number}</span>
                  </div>
                  <span className="font-medium text-xs text-[var(--foreground)] font-tajawal">{t('hizbPrefix')} {hizb.number}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* الصفحات */}
        {activeTab === 'pages' && (
          <div className="grid grid-cols-4 gap-2">
            {getFilteredPages().map((page, index) => (
              <Link
                key={page}
                href={getMushafLink(page)}
                className="block animate-fadeIn"
                style={{ animationDelay: `${(index % 20) * 10}ms` }}
              >
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-3 flex items-center justify-center hover:shadow-lg hover:border-[var(--primary)]/30 transition-all duration-300 aspect-square group dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-[var(--primary)]/30 dark:hover:shadow-[0_4px_20px_rgba(16,185,129,0.1)]">
                  <span className="font-bold text-[var(--primary)] dark:text-[var(--primary-light)] font-tajawal group-hover:scale-110 transition-transform">{page}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No results */}
        {searchQuery && (
          (activeTab === 'surahs' && filteredSurahs.length === 0) ||
          (activeTab === 'juz' && filteredJuz.length === 0) ||
          (activeTab === 'hizb' && filteredHizb.length === 0) ||
          (activeTab === 'pages' && getFilteredPages().length === 0)
        ) && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--accent)] dark:bg-white/5 flex items-center justify-center">
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

function QuranLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-[var(--muted)] mt-4 font-tajawal">جاري التحميل...</p>
      </div>
    </div>
  );
}

export default function QuranPage() {
  return (
    <Suspense fallback={<QuranLoading />}>
      <QuranPageContent />
    </Suspense>
  );
}
