'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import asmaData from '@/data/asma-ul-husna.json';

interface Name {
  name: string;
  transliteration: string;
  number: number;
  meaning: string;
  urduMeaning: string;
}

export default function NamesOfAllahPage() {
  const t = useTranslations('names');
  const tQuran = useTranslations('quran');
  const locale = useLocale();
  const isUrdu = locale === 'ur';
  const [names, setNames] = useState<Name[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<Name | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Use local data instead of API
    try {
      setNames(asmaData.names);
    } catch (err) {
      console.error(err);
      setError('error');
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredNames = names.filter(name =>
    name.name.includes(searchQuery) ||
    name.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
    name.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
    name.urduMeaning.includes(searchQuery)
  );

  const convertToArabicNumber = (num: number): string => {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(d => arabicNumbers[parseInt(d)]).join('');
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header */}
      <div className="bg-[var(--card-bg)] sticky top-0 z-10 border-b border-[var(--primary)]/10 shadow-sm dark:bg-[var(--surface-1)]">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] opacity-5"></div>
          <div className="py-5 px-4 relative">
            {/* Back Button */}
            <Link href="/library" className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-tajawal text-sm">{t('back')}</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] flex items-center justify-center shadow-lg border border-[var(--primary)]/20">
                <svg className="w-7 h-7 text-[var(--primary-light)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-tajawal text-[var(--foreground)]">{t('title')}</h1>
                <p className="text-[var(--muted)] text-sm font-tajawal">{t('subtitle')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4 pt-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-xl bg-[var(--accent)] border border-[var(--card-border)] text-[var(--foreground)] font-tajawal focus:outline-none focus:border-[var(--primary)] dark:bg-[var(--card-bg)]/5 dark:border-white/10 dark:focus:border-[var(--primary)] dark:focus:shadow-[0_0_15px_var(--shadow-color)]"
            />
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] border border-[var(--primary)]/20 animate-pulse mb-4"></div>
            <p className="text-[var(--muted)] font-tajawal">{t('loading')}</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-500 font-tajawal mb-4">{t(error || 'error')}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg font-tajawal hover:bg-red-600 transition-colors"
            >
              {t('retry')}
            </button>
          </div>
        ) : (
          <>
            {/* Hadith about 99 Names */}
            <div className="mb-4 p-4 rounded-2xl bg-[var(--secondary)]/5 dark:bg-[var(--secondary)]/20 border border-[var(--primary)]/20">
              <p className="text-sm text-[var(--foreground)] font-amiri leading-relaxed text-center">
                {t('hadith')}
              </p>
              <p className="text-xs text-[var(--muted)] font-tajawal text-center mt-2">{t('hadithSource')}</p>
            </div>

            {/* Names Grid */}
            <div className="grid grid-cols-3 gap-3">
              {filteredNames.map((name) => (
                <button
                  key={name.number}
                  onClick={() => setSelectedName(name)}
                  className="group relative overflow-hidden rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--primary)]/40 transition-all p-4 pt-6 text-center dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-[var(--primary)]/30 dark:hover:shadow-[0_8px_30px_var(--shadow-color)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] opacity-0 group-hover:opacity-10 transition-opacity"></div>

                  {/* Number Badge */}
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20">
                    <span className="text-[10px] text-[var(--primary-dark)] dark:text-[var(--primary-light)] font-bold">
                      {convertToArabicNumber(name.number)}
                    </span>
                  </div>

                  <h3 className="font-amiri text-xl font-bold text-[var(--foreground)] group-hover:text-[var(--primary-dark)] dark:group-hover:text-[var(--primary-light)] transition-colors mb-1">
                    {name.name}
                  </h3>
                  <p className="text-[10px] text-[var(--muted)] font-tajawal line-clamp-1">
                    {isUrdu ? name.urduMeaning : name.meaning}
                  </p>
                </button>
              ))}
            </div>

            {filteredNames.length === 0 && (
              <div className="text-center py-10">
                <p className="text-[var(--muted)] font-tajawal">{tQuran('noResults')}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Name Details Modal */}
      {selectedName && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedName(null)}
        >
          <div
            className="w-full max-w-sm bg-[var(--card-bg)] rounded-3xl overflow-hidden shadow-2xl dark:bg-[#111827]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] p-6 text-center border-b border-[var(--primary)]/20">
              <button
                onClick={() => setSelectedName(null)}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[var(--card-bg)]/10 flex items-center justify-center hover:bg-[var(--primary)]/30 transition-colors text-[var(--primary-light)] border border-[var(--primary)]/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--card-bg)]/10 flex items-center justify-center mb-3 border border-[var(--primary)]/30 text-[var(--primary-light)]">
                <span className="text-3xl font-bold font-tajawal">
                  {convertToArabicNumber(selectedName.number)}
                </span>
              </div>

              <h2 className="text-4xl font-amiri font-bold text-white mb-2">
                {selectedName.name}
              </h2>
              <p className="text-[var(--primary-light)]/80 font-tajawal text-lg">
                {selectedName.transliteration}
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-sm font-tajawal text-[var(--muted)] mb-2">{t('meaning')}</h3>
                <p className="text-xl font-tajawal text-[var(--foreground)]">
                  {isUrdu ? selectedName.urduMeaning : selectedName.meaning}
                </p>
              </div>

              <div className="mt-6 p-4 rounded-xl bg-[var(--secondary)]/5 dark:bg-[var(--secondary)]/20 border border-[var(--primary)]/20">
                <p className="text-sm text-[var(--muted)] font-tajawal text-center leading-relaxed">
                  {t('tasbih')}
                </p>
              </div>

              <button
                onClick={() => setSelectedName(null)}
                className="w-full mt-4 py-3 rounded-xl bg-[var(--secondary)] text-white font-tajawal font-medium hover:opacity-90 transition-opacity border border-[var(--primary)]/30"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
