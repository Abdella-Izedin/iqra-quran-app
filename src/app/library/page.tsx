'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';



export default function LibraryPage() {
  const t = useTranslations('library');
  const tQuran = useTranslations('quran');

  // الأقسام الرئيسية التي تحتوي على محتوى حقيقي
  const mainCategories = [
    {
      id: 'hadith',
      title: t('hadith'),
      description: t('hadithDesc'),
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
        </svg>
      ),
      gradient: 'from-[var(--secondary)] to-[var(--secondary-light)]',
      count: t('hadithCount'),
      features: t('hadithFeatures').split('، '),
      href: '/library/hadith',
    },
    {
      id: 'tafsir',
      title: t('tafsir'),
      description: t('tafsirDesc'),
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1.06 13.54L7.4 12l1.41-1.41 2.12 2.12 4.24-4.24 1.41 1.41-5.64 5.66z" />
        </svg>
      ),
      gradient: 'from-[var(--secondary)] to-[var(--secondary-light)]',
      count: t('tafsirCount'),
      features: t('tafsirFeatures').split('، '),
      href: '/library/tafsir',
    },
    {
      id: 'names',
      title: t('names'),
      description: t('namesDesc'),
      icon: (
        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
      ),
      gradient: 'from-[var(--secondary)] to-[var(--secondary-light)]',
      count: t('namesCount'),
      features: t('namesFeatures').split('، '),
      href: '/library/names',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header */}
      <div className="bg-[var(--card-bg)] border-b border-[var(--card-border)] dark:bg-gradient-to-b dark:from-[#111827] dark:to-[#0d1320] dark:border-white/5">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] opacity-5"></div>
          <div className="text-center py-6 relative">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] mb-3 shadow-lg border border-[var(--primary)]/20">
              <svg className="w-8 h-8 text-[var(--primary-light)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold font-tajawal text-[var(--foreground)]">{t('title')}</h1>
            <p className="text-[var(--muted)] text-sm mt-1 font-tajawal">{t('subtitle')}</p>
          </div>
        </div>
      </div>

      {/* Main Categories */}
      <div className="px-4 pt-6">
        <div className="space-y-4">
          {mainCategories.map((category) => (
            <Link key={category.id} href={category.href}>
              <div className="group relative overflow-hidden rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--primary)]/40 transition-all duration-300 hover:shadow-xl dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-[var(--primary)]/30 dark:hover:shadow-[0_8px_30px_var(--shadow-color)]">
                {/* Background Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>

                <div className="relative p-5">
                  {/* Header Row */}
                  <div className="flex items-start gap-4 mb-4">
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.gradient} flex items-center justify-center text-[var(--primary-light)] shadow-lg group-hover:scale-110 transition-transform duration-300 border border-[var(--primary)]/20`}>
                      {category.icon}
                    </div>

                    {/* Title & Description */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h2 className="font-bold text-xl font-tajawal text-[var(--foreground)] group-hover:text-[var(--primary-dark)] dark:group-hover:text-[var(--primary-light)] transition-colors">
                          {category.title}
                        </h2>
                        <span className={`text-xs font-bold bg-[var(--primary)]/10 text-[var(--primary-dark)] dark:bg-[var(--primary)]/20 dark:text-[var(--primary-light)] px-3 py-1 rounded-full border border-[var(--primary)]/30`}>
                          {category.count}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--muted)] font-tajawal leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  {/* Features Tags */}
                  <div className="flex flex-wrap gap-2">
                    {category.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-[var(--accent)] text-[var(--muted)] px-3 py-1.5 rounded-full font-tajawal border border-[var(--card-border)]"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Action Row */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-[var(--primary)] dark:text-[var(--primary-light)] font-tajawal font-medium">
                      {t('exploreContent')}
                    </span>
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${category.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Statistics Card */}
        <div className="mt-6 p-5 rounded-2xl bg-[var(--secondary)]/5 dark:bg-[var(--secondary)]/20 border border-[var(--primary)]/20 dark:border-[var(--primary)]/10">
          <div className="text-center mb-4">
            <h3 className="font-bold font-tajawal text-lg text-[var(--primary-dark)] dark:text-[var(--primary-light)] mb-2">
              {t('statistics')}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--card-bg)] rounded-xl p-4 text-center border border-[var(--card-border)] dark:bg-[#1a2332] dark:border-[var(--primary)]/10">
              <div className="text-3xl font-bold text-[var(--primary)] dark:text-[var(--primary-light)] font-tajawal">٩</div>
              <div className="text-sm text-[var(--muted)] dark:text-gray-400 font-tajawal mt-1">{t('hadithBooks')}</div>
            </div>
            <div className="bg-[var(--card-bg)] rounded-xl p-4 text-center border border-[var(--card-border)] dark:bg-[#1a2332] dark:border-[var(--primary)]/10">
              <div className="text-3xl font-bold text-[var(--primary)] dark:text-[var(--primary-light)] font-tajawal">٧</div>
              <div className="text-sm text-[var(--muted)] dark:text-gray-400 font-tajawal mt-1">{t('tafsirs')}</div>
            </div>
            <div className="bg-[var(--card-bg)] rounded-xl p-4 text-center border border-[var(--card-border)] dark:bg-[#1a2332] dark:border-[var(--card-border)]">
              <div className="text-3xl font-bold text-[var(--primary)] dark:text-[var(--primary-light)] font-tajawal">٩٩</div>
              <div className="text-sm text-[var(--muted)] dark:text-gray-400 font-tajawal mt-1">{t('namesOfAllah')}</div>
            </div>
            <div className="bg-[var(--card-bg)] rounded-xl p-4 text-center border border-[var(--card-border)] dark:bg-[#1a2332] dark:border-[var(--card-border)]">
              <div className="text-3xl font-bold text-[var(--primary)] dark:text-[var(--primary-light)] font-tajawal">١١٤</div>
              <div className="text-sm text-[var(--muted)] dark:text-gray-400 font-tajawal mt-1">{t('surahsWithTafsir')}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
