'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const ruqyahSections = [
  {
    id: 'fatiha',
    type: 'quran',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    gradient: 'from-emerald-500 to-teal-600',
    count: 1
  },
  {
    id: 'baqara-start',
    type: 'quran',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    gradient: 'from-blue-500 to-indigo-600',
    count: 1
  },
  {
    id: 'ayat-kursi',
    type: 'quran',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    gradient: 'from-[var(--gradient-start)] to-[var(--gradient-start)]',
    count: 1
  },
  {
    id: 'baqara-end',
    type: 'quran',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    gradient: 'from-violet-500 to-purple-600',
    count: 2
  },
  {
    id: 'araf-magic',
    type: 'quran',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    gradient: 'from-red-500 to-rose-600',
    count: 2
  },
  {
    id: 'yunus-magic',
    type: 'quran',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    gradient: 'from-pink-500 to-fuchsia-600',
    count: 2
  },
  {
    id: 'taha-magic',
    type: 'quran',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    gradient: 'from-[var(--gradient-start)] to-[var(--gradient-end)]',
    count: 1
  },
  {
    id: 'kafirun',
    type: 'quran',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    gradient: 'from-slate-500 to-gray-600',
    count: 1
  },
  {
    id: 'muawwithat',
    type: 'quran',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    gradient: 'from-green-500 to-emerald-600',
    count: 3
  },
  {
    id: 'sunnah-ruqya',
    type: 'sunnah',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    gradient: 'from-yellow-500 to-amber-600',
    count: 8
  },
  {
    id: 'protection',
    type: 'sunnah',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    gradient: 'from-indigo-500 to-violet-600',
    count: 6
  },
];

export default function RuqyahPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const t = useTranslations('ruqyah');

  // Map section IDs to translation keys
  const getSectionTitle = (id: string) => {
    const titleMap: Record<string, string> = {
      'fatiha': t('fatiha'),
      'baqara-start': t('baqaraStart'),
      'ayat-kursi': t('ayatKursi'),
      'baqara-end': t('baqaraEnd'),
      'araf-magic': t('arafMagic'),
      'yunus-magic': t('yunusMagic'),
      'taha-magic': t('tahaMagic'),
      'kafirun': t('kafirun'),
      'muawwithat': t('muawwithat'),
      'sunnah-ruqya': t('sunnahRuqya'),
      'protection': t('protectionDuas'),
    };
    return titleMap[id] || id;
  };

  // Map section IDs to description translation keys
  const getSectionDescription = (id: string) => {
    const descMap: Record<string, string> = {
      'fatiha': t('fatihaDesc'),
      'baqara-start': t('baqaraStartDesc'),
      'ayat-kursi': t('ayatKursiDesc'),
      'baqara-end': t('baqaraEndDesc'),
      'araf-magic': t('arafMagicDesc'),
      'yunus-magic': t('yunusMagicDesc'),
      'taha-magic': t('tahaMagicDesc'),
      'kafirun': t('kafirunDesc'),
      'muawwithat': t('muawwithatDesc'),
      'sunnah-ruqya': t('sunnahRuqyaDesc'),
      'protection': t('protectionDuasDesc'),
    };
    return descMap[id] || '';
  };

  const filteredSections = ruqyahSections.filter((section) => {
    const title = getSectionTitle(section.id);
    const desc = getSectionDescription(section.id);
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold font-tajawal text-[var(--foreground)]">{t('title')}</h1>
            <p className="text-[var(--muted)] text-sm mt-1 font-tajawal">{t('description')}</p>
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
              className="w-full px-5 py-4 pl-14 rounded-2xl border-2 border-[var(--card-border)] bg-[var(--accent)] focus:outline-none focus:border-[var(--primary)] text-right transition-all duration-300 font-tajawal dark:bg-white/5 dark:border-white/10 dark:focus:border-emerald-500 dark:focus:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
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

      {/* Sections Grid */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredSections.map((section, index) => (
            <Link
              key={section.id}
              href={`/ruqyah/${section.id}`}
              className="block animate-scaleIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-4 hover:shadow-xl hover:border-[var(--primary)]/30 transition-all duration-300 group h-full dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-emerald-500/30 dark:hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)]">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${section.gradient} flex items-center justify-center mb-3 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {section.icon}
                </div>
                
                {/* Title */}
                <h2 className="font-bold text-base font-tajawal text-[var(--foreground)] mb-1">
                  {getSectionTitle(section.id)}
                </h2>
                
                {/* Description */}
                <p className="text-xs text-[var(--muted)] font-tajawal line-clamp-2 mb-2">
                  {getSectionDescription(section.id)}
                </p>
                
                {/* Count Badge */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full font-tajawal ${
                    section.type === 'quran' 
                      ? 'text-[var(--primary)] bg-[var(--primary)]/10' 
                      : 'text-[var(--primary-dark)] bg-amber-100'
                  }`}>
                    {section.count} {section.type === 'quran' ? t('ayah') : t('dua')}
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
      {filteredSections.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--accent)] flex items-center justify-center">
            <svg className="w-10 h-10 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-[var(--muted)] font-tajawal">{t('noResults')}</p>
        </div>
      )}
    </div>
  );
}
