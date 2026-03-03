'use client';

import { useTranslations } from 'next-intl';

interface SettingsGuideModalProps {
  onClose: () => void;
}

export default function SettingsGuideModal({ onClose }: SettingsGuideModalProps) {
  const t = useTranslations('prayer');

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slideUp">
        <div className="bg-[var(--card-bg)] dark:bg-[var(--surface-1)] rounded-t-3xl max-w-lg mx-auto shadow-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[var(--card-border)] dark:border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--foreground)] font-tajawal">
                📱 {t('settingsGuideTitle')}
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-[var(--accent)] transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 text-[var(--muted)]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Steps */}
          <div className="px-6 py-6 space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 dark:bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-[var(--primary)] font-tajawal">1</span>
              </div>
              <p className="text-[var(--foreground)] font-tajawal pt-1">{t('settingsStep1')}</p>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 dark:bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-[var(--primary)] font-tajawal">2</span>
              </div>
              <p className="text-[var(--foreground)] font-tajawal pt-1">{t('settingsStep2')}</p>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 dark:bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-[var(--primary)] font-tajawal">3</span>
              </div>
              <p className="text-[var(--foreground)] font-tajawal pt-1">{t('settingsStep3')}</p>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 dark:bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-[var(--primary)] font-tajawal">4</span>
              </div>
              <p className="text-[var(--foreground)] font-tajawal pt-1">{t('settingsStep4')}</p>
            </div>
          </div>

          {/* Done Button */}
          <div className="px-6 py-4 border-t border-[var(--card-border)] dark:border-white/10">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] text-white rounded-xl font-bold font-tajawal transition-all hover:shadow-lg"
            >
              {t('done')} ✓
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
