'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function KhatmahPage() {
  const t = useTranslations('khatmah');

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header */}
      <div className="bg-[var(--card-bg)] border-b border-[var(--card-border)] dark:bg-gradient-to-b dark:from-[#111827] dark:to-[#0d1320] dark:border-white/5">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-purple-600 opacity-10"></div>
          <div className="py-5 px-4 relative">
            {/* Back Button */}
            <Link href="/" className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-tajawal text-sm">{t('home')}</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-tajawal text-[var(--foreground)]">{t('title')}</h1>
                <p className="text-[var(--muted)] text-sm font-tajawal">{t('groupReading')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6">
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-8 text-center dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5">
          <div className="w-24 h-24 bg-gradient-to-br from-violet-500/20 to-purple-500/20 dark:from-violet-500/10 dark:to-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-violet-500 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3 font-tajawal text-[var(--foreground)]">{t('comingSoon')}</h2>
          <p className="text-[var(--muted)] font-tajawal leading-relaxed mb-4">
            {t('comingSoonDesc')}
          </p>
          <p className="text-sm text-violet-600 dark:text-violet-400 font-tajawal font-medium">
            {t('trackProgress')}
          </p>
        </div>

        {/* Features Preview */}
        <div className="mt-6 space-y-4">
          <h3 className="font-bold font-tajawal text-[var(--foreground)] text-lg">{t('upcomingFeatures')}</h3>
          
          {[
            { icon: '👥', title: t('featureGroup'), desc: t('featureGroupDesc') },
            { icon: '📊', title: t('featureProgress'), desc: t('featureProgressDesc') },
            { icon: '🔔', title: t('featureReminders'), desc: t('featureRemindersDesc') },
          ].map((feature, index) => (
            <div 
              key={index}
              className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 flex items-start gap-4 dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5"
            >
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                {feature.icon}
              </div>
              <div>
                <h4 className="font-bold font-tajawal text-[var(--foreground)] mb-1">{feature.title}</h4>
                <p className="text-sm text-[var(--muted)] font-tajawal">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
