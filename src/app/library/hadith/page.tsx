'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface HadithBookData {
  id: string;
  hadithCount: number;
}

const mainHadithBooksData: HadithBookData[] = [
  { id: 'bukhari', hadithCount: 7563 },
  { id: 'muslim', hadithCount: 7500 },
  { id: 'abudawud', hadithCount: 5274 },
  { id: 'tirmidhi', hadithCount: 3956 },
  { id: 'nasai', hadithCount: 5758 },
  { id: 'ibnmajah', hadithCount: 4341 },
];

const otherHadithBooksData: HadithBookData[] = [
  { id: 'malik', hadithCount: 1832 },
  { id: 'nawawi', hadithCount: 42 },
  { id: 'qudsi', hadithCount: 40 },
];

const hadithBooksData: HadithBookData[] = [...mainHadithBooksData, ...otherHadithBooksData];

export default function HadithPage() {
  const t = useTranslations('hadith');
  const tCommon = useTranslations('common');
  const [searchQuery, setSearchQuery] = useState('');

  const hadithBooks = useMemo(() => {
    return hadithBooksData.map((book) => ({
      ...book,
      name: t(`books.${book.id}.name`),
      author: t(`books.${book.id}.author`),
    }));
  }, [t]);

  const filteredBooks = hadithBooks.filter(
    (book) =>
      book.name.includes(searchQuery) ||
      book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.includes(searchQuery)
  );

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
              <span className="font-tajawal text-sm">{t('backToLibrary')}</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] flex items-center justify-center shadow-lg border border-[var(--primary)]/20">
                <svg className="w-7 h-7 text-[var(--primary-light)]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-tajawal text-[var(--foreground)]">{t('title')}</h1>
                <p className="text-[var(--muted)] text-sm font-tajawal">{t('subtitle')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-4 pt-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t('searchBook')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pr-12 rounded-xl border border-[var(--card-border)] bg-[var(--accent)] text-right font-tajawal focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 dark:bg-white/5 dark:border-white/10 dark:focus:border-[var(--primary)] dark:focus:shadow-[0_0_15px_var(--shadow-color)]"
            />
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-1 gap-3">
          {filteredBooks.map((book) => (
            <Link key={book.id} href={`/library/hadith/${book.id}`}>
              <div className="group p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--primary)]/30 transition-all duration-300 dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-[var(--primary)]/30 dark:hover:shadow-[0_8px_30px_var(--shadow-color)]">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform border border-[var(--primary)]/20`}>
                    <svg className="w-7 h-7 text-[var(--primary-light)]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
                    </svg>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="font-bold font-tajawal text-lg text-[var(--foreground)] group-hover:text-[var(--primary-dark)] dark:group-hover:text-[var(--primary-light)] transition-colors">
                      {book.name}
                    </h3>
                    <p className="text-sm text-[var(--muted)] font-tajawal">{book.author}</p>
                    <span className="text-xs bg-[var(--accent)] text-[var(--muted)] px-2 py-0.5 rounded-md font-tajawal mt-1 inline-block">
                      {book.hadithCount.toLocaleString('ar-EG')} {t('hadithUnit')}
                    </span>
                  </div>

                  {/* Arrow */}
                  <svg className="w-5 h-5 text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info */}
        <div className="mt-6 p-4 rounded-2xl bg-[var(--secondary)]/5 dark:bg-[var(--secondary)]/20 border border-[var(--primary)]/20">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] flex items-center justify-center flex-shrink-0 border border-[var(--primary)]/20">
              <svg className="w-5 h-5 text-[var(--primary-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-bold font-tajawal text-sm mb-1 text-[var(--primary-dark)] dark:text-[var(--primary-light)]">{t('hadithBooks')}</p>
              <p className="text-[var(--muted)] text-xs font-tajawal leading-relaxed">
                {t('hadithBooksDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
