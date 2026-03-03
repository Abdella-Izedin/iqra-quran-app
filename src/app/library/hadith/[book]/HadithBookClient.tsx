'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { getBook, getHadithPage, getTotalPages, Hadith as LocalHadith } from '@/services/hadithService';

interface Hadith {
  hadithnumber: number;
  number?: number;
  text: string;
  arabicnumber?: number;
  grades?: Array<{ name: string; grade: string }>;
}

// Books that have Urdu translations available
const booksWithUrdu = ['bukhari', 'muslim', 'abudawud', 'tirmidhi', 'nasai', 'ibnmajah', 'malik'];

const bookInfo: Record<string, { arabicName: string; author: string; gradient: string }> = {
  bukhari: { arabicName: 'صحيح البخاري', author: 'الإمام البخاري', gradient: 'from-[var(--gradient-start)] to-[var(--gradient-start)]' },
  muslim: { arabicName: 'صحيح مسلم', author: 'الإمام مسلم', gradient: 'from-emerald-500 to-teal-600' },
  abudawud: { arabicName: 'سنن أبي داود', author: 'أبو داود السجستاني', gradient: 'from-blue-500 to-indigo-600' },
  tirmidhi: { arabicName: 'جامع الترمذي', author: 'الإمام الترمذي', gradient: 'from-violet-500 to-purple-600' },
  nasai: { arabicName: 'سنن النسائي', author: 'الإمام النسائي', gradient: 'from-rose-500 to-pink-600' },
  ibnmajah: { arabicName: 'سنن ابن ماجه', author: 'ابن ماجه القزويني', gradient: 'from-[var(--gradient-start)] to-[var(--gradient-end)]' },
  malik: { arabicName: 'موطأ مالك', author: 'الإمام مالك', gradient: 'from-green-500 to-emerald-600' },
  nawawi: { arabicName: 'الأربعون النووية', author: 'الإمام النووي', gradient: 'from-teal-500 to-cyan-600' },
  qudsi: { arabicName: 'الأحاديث القدسية', author: 'مجموعة من العلماء', gradient: 'from-purple-500 to-violet-600' },
};

interface HadithBookClientProps {
  book: string;
}

export default function HadithBookClient({ book }: HadithBookClientProps) {
  const t = useTranslations('hadith');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const isUrdu = locale === 'ur';
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedHadith, setExpandedHadith] = useState<number | null>(null);
  const hadithsPerPage = 20;

  const info = bookInfo[book] || { arabicName: book, author: '', gradient: 'from-gray-500 to-gray-600' };

  useEffect(() => {
    const loadHadiths = () => {
      setLoading(true);
      setError(null);
      
      try {
        // استخدام البيانات المحلية بدلاً من API
        const bookData = getBook(book);
        
        if (bookData && bookData.hadiths) {
          const validHadiths = bookData.hadiths
            .filter((h: LocalHadith) => h.arabic && h.arabic.trim().length > 0)
            .map((h: LocalHadith) => ({
              hadithnumber: h.number,
              number: h.number,
              text: h.arabic,
            }));
          setHadiths(validHadiths);
        } else {
          setError(t('fetchError'));
        }
      } catch (err) {
        console.error('Error loading hadiths:', err);
        setError(t('fetchError'));
      } finally {
        setLoading(false);
      }
    };

    loadHadiths();
  }, [book, isUrdu, t]);

  const totalPages = Math.ceil(hadiths.length / hadithsPerPage);
  const currentHadiths = hadiths.slice(
    (currentPage - 1) * hadithsPerPage,
    currentPage * hadithsPerPage
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
    setExpandedHadith(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header */}
      <div className="bg-[var(--card-bg)] sticky top-0 z-10 border-b border-[var(--card-border)] dark:bg-gradient-to-b dark:from-[#111827] dark:to-[#0d1320] dark:border-white/5">
        <div className="relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${info.gradient} opacity-10`}></div>
          <div className="py-5 px-4 relative">
            <Link href="/library/hadith" className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-tajawal text-sm">{tCommon('back')}</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${info.gradient} flex items-center justify-center shadow-lg`}>
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-tajawal text-[var(--foreground)]">{info.arabicName}</h1>
                <p className="text-[var(--muted)] text-sm font-tajawal">{info.author}</p>
                {hadiths.length > 0 && (
                  <span className="text-xs bg-[var(--accent)] text-[var(--muted)] px-2 py-0.5 rounded-md font-tajawal mt-1 inline-block">
                    {hadiths.length.toLocaleString('ar-EG')} {t('hadithUnit')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${info.gradient} animate-pulse mb-4`}></div>
            <p className="text-[var(--muted)] font-tajawal">{t('loadingHadiths')}</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-500 font-tajawal mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-tajawal hover:bg-red-600 transition-colors"
            >
              {tCommon('retry')}
            </button>
          </div>
        ) : (
          <>
            {/* Pagination Info */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[var(--muted)] font-tajawal">
                {t('page')} {currentPage.toLocaleString('ar-EG')} {t('of')} {totalPages.toLocaleString('ar-EG')}
              </span>
              <span className="text-sm text-[var(--muted)] font-tajawal">
                {t('showing')} {((currentPage - 1) * hadithsPerPage + 1).toLocaleString('ar-EG')} - {Math.min(currentPage * hadithsPerPage, hadiths.length).toLocaleString('ar-EG')}
              </span>
            </div>

            {/* Hadiths */}
            <div className="space-y-3">
              {currentHadiths.map((hadith, idx) => (
                <div 
                  key={hadith.hadithnumber || hadith.number || idx}
                  className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-amber-500/30 transition-all dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-amber-500/30"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${info.gradient} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-bold text-sm">
                        {(hadith.hadithnumber || hadith.number || (((currentPage - 1) * hadithsPerPage) + idx + 1)).toLocaleString('ar-EG')}
                      </span>
                    </div>

                    <div className="flex-1">
                      <p 
                        className={`font-amiri text-lg leading-loose text-right text-[var(--foreground)] ${
                          expandedHadith === (hadith.hadithnumber || hadith.number || idx) ? '' : 'line-clamp-4'
                        }`}
                      >
                        {hadith.text.replace(/<br\s*\/?>/gi, ' ')}
                      </p>
                      
                      {hadith.text && hadith.text.length > 200 && (
                        <button
                          onClick={() => setExpandedHadith(
                            expandedHadith === (hadith.hadithnumber || hadith.number || idx) ? null : (hadith.hadithnumber || hadith.number || idx)
                          )}
                          className="mt-2 text-sm text-[var(--primary-dark)] dark:text-amber-400 font-tajawal hover:underline"
                        >
                          {expandedHadith === (hadith.hadithnumber || hadith.number || idx) ? t('hide') : t('showMore')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-500/10 hover:border-amber-500 transition-all dark:bg-[#111827] dark:border-white/5 dark:hover:border-amber-500/30"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-500/10 hover:border-amber-500 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(Math.min(3, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage === 1) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages) {
                      pageNum = totalPages - 2 + i;
                    } else {
                      pageNum = currentPage - 1 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-9 h-9 rounded-lg font-tajawal font-bold text-sm transition-all ${
                          currentPage === pageNum
                            ? `bg-gradient-to-br ${info.gradient} text-white shadow-md`
                            : 'bg-[var(--card-bg)] border border-[var(--card-border)] hover:bg-amber-500/10 hover:border-amber-500'
                        }`}
                      >
                        {pageNum.toLocaleString('ar-EG')}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-500/10 hover:border-amber-500 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-500/10 hover:border-amber-500 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Jump to Page */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <span className="text-xs text-[var(--muted)] font-tajawal">{t('jumpToPage')}</span>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  placeholder="رقم"
                  className="w-20 px-3 py-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-center font-tajawal font-bold text-sm focus:outline-none focus:border-amber-500 transition-all dark:bg-white/5 dark:border-white/10 dark:focus:border-amber-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const value = parseInt((e.target as HTMLInputElement).value);
                      if (value >= 1 && value <= totalPages) {
                        goToPage(value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
