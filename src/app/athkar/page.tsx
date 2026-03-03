'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const athkarCategories = [
  {
    id: 'morning',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    gradient: 'from-[var(--gradient-start)] to-[var(--gradient-start)]',
    count: 14
  },
  {
    id: 'evening',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
    gradient: 'from-indigo-500 to-purple-600',
    count: 14
  },
  {
    id: 'sleep',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1" />
      </svg>
    ),
    gradient: 'from-slate-600 to-slate-800',
    count: 12
  },
  {
    id: 'wake-up',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: 'from-cyan-400 to-blue-500',
    count: 6
  },
  {
    id: 'after-prayer',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    gradient: 'from-emerald-400 to-teal-500',
    count: 10
  },
  {
    id: 'entering-home',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    gradient: 'from-rose-400 to-pink-500',
    count: 4
  },
  {
    id: 'entering-mosque',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    gradient: 'from-[var(--gradient-start)] to-[var(--gradient-end)]',
    count: 4
  },
  {
    id: 'food',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    gradient: 'from-yellow-400 to-[var(--gradient-end)]',
    count: 6
  },
  {
    id: 'travel',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: 'from-[var(--gradient-start)] to-[var(--gradient-end)]',
    count: 8
  },
  {
    id: 'anxiety',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    gradient: 'from-red-400 to-rose-500',
    count: 8
  },
  {
    id: 'quran-completion',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    gradient: 'from-violet-500 to-purple-600',
    count: 3
  },
  {
    id: 'misc',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    gradient: 'from-fuchsia-400 to-pink-500',
    count: 10
  },
  {
    id: 'ruqyah',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
      </svg>
    ),
    gradient: 'from-[var(--gradient-start)] to-[var(--gradient-start)]',
    count: 11,
    isRuqyah: true
  },
];

export default function AthkarPage() {
  const t = useTranslations('athkar');
  const tRuqyah = useTranslations('ruqyah');
  const tQuran = useTranslations('quran');
  const [searchQuery, setSearchQuery] = useState('');

  // Map category IDs to translation keys
  const getCategoryTitle = (id: string) => {
    const titleMap: Record<string, string> = {
      'morning': t('morning'),
      'evening': t('evening'),
      'sleep': t('sleep'),
      'wake-up': t('wakeUp'),
      'after-prayer': t('afterPrayer'),
      'entering-home': t('home'),
      'entering-mosque': t('mosque'),
      'food': t('food'),
      'travel': t('travel'),
      'anxiety': t('anxiety'),
      'quran-completion': t('quranCompletion'),
      'misc': t('misc'),
      'ruqyah': tRuqyah('title'),
    };
    return titleMap[id] || id;
  };

  // Map category IDs to description translation keys
  const getCategoryDescription = (id: string) => {
    const descMap: Record<string, string> = {
      'morning': t('morningDesc'),
      'evening': t('eveningDesc'),
      'sleep': t('sleepDesc'),
      'wake-up': t('wakeUpDesc'),
      'after-prayer': t('afterPrayerDesc'),
      'entering-home': t('homeDesc'),
      'entering-mosque': t('mosqueDesc'),
      'food': t('foodDesc'),
      'travel': t('travelDesc'),
      'anxiety': t('anxietyDesc'),
      'quran-completion': t('quranCompletionDesc'),
      'misc': t('miscDesc'),
      'ruqyah': tRuqyah('subtitle'),
    };
    return descMap[id] || '';
  };

  // Get the correct href for each category
  const getCategoryHref = (id: string) => {
    if (id === 'ruqyah') return '/ruqyah';
    return `/athkar/${id}`;
  };

  const filteredCategories = athkarCategories.filter((cat) => {
    const title = getCategoryTitle(cat.id);
    const desc = getCategoryDescription(cat.id);
    return title.includes(searchQuery) || desc.includes(searchQuery);
  });

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header */}
      <div className="bg-[var(--card-bg)] sticky top-0 z-10 border-b border-[var(--card-border)] dark:bg-gradient-to-b dark:from-[#111827] dark:to-[#0d1320] dark:border-white/5">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent"></div>
          <div className="text-center py-5 relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] mb-2 shadow-lg shadow-[var(--primary)]/30">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold font-tajawal text-[var(--foreground)]">{t('title')}</h1>
            <p className="text-[var(--muted)] text-sm mt-1 font-tajawal">{t('subtitle')}</p>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-4 pl-14 rounded-2xl border-2 border-[var(--card-border)] bg-[var(--accent)] focus:outline-none focus:border-[var(--primary)] text-right transition-all duration-300 font-tajawal dark:bg-[var(--card-bg)]/5 dark:border-white/10 dark:focus:border-[var(--primary)] dark:focus:shadow-[0_0_15px_var(--glow-primary)]"
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
      </div>

      {/* Categories Grid */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredCategories.map((category, index) => (
            <Link
              key={category.id}
              href={getCategoryHref(category.id)}
              className="block animate-scaleIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-4 hover:shadow-xl hover:border-[var(--primary)]/30 transition-all duration-300 group h-full dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-[var(--primary)]/30 dark:hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)]">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-3 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {category.icon}
                </div>
                
                {/* Title */}
                <h2 className="font-bold text-base font-tajawal text-[var(--foreground)] mb-1">
                  {getCategoryTitle(category.id)}
                </h2>
                
                {/* Description */}
                <p className="text-xs text-[var(--muted)] font-tajawal line-clamp-2 mb-2">
                  {getCategoryDescription(category.id)}
                </p>
                
                {/* Count Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--primary)] bg-[var(--primary)]/10 px-2 py-1 rounded-full font-tajawal">
                    {category.count} {t('dhikr')}
                  </span>
                  <svg className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* No results */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--accent)] flex items-center justify-center">
            <svg className="w-10 h-10 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-[var(--muted)] font-tajawal">{tQuran('noResults')}</p>
        </div>
      )}
    </div>
  );
}
