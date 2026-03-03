'use client';

interface WarningBannerProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

export default function WarningBanner({
  message,
  actionLabel,
  onAction,
  onDismiss
}: WarningBannerProps) {
  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 px-4 py-3 mb-4 animate-slideDown">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          {/* Warning Icon */}
          <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>

          {/* Message */}
          <p className="text-sm font-medium text-orange-800 dark:text-orange-200 font-tajawal">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="text-xs font-bold text-orange-700 dark:text-orange-300 hover:text-orange-900 dark:hover:text-orange-100 transition-colors whitespace-nowrap font-tajawal"
            >
              {actionLabel}
            </button>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="w-5 h-5 rounded-full hover:bg-orange-200 dark:hover:bg-orange-800 flex items-center justify-center transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <svg className="w-3 h-3 text-orange-600 dark:text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
