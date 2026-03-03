'use client';

import { useEffect } from 'react';

interface ToastAction {
  label: string;
  handler: () => void;
}

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
  duration?: number;
  action?: ToastAction;
  persistent?: boolean; // لا يختفي تلقائياً
}

export default function Toast({
  message,
  type = 'success',
  onClose,
  duration = 2000,
  action,
  persistent = false
}: ToastProps) {
  useEffect(() => {
    // إذا persistent، لا نخفيه تلقائياً
    if (persistent) return;

    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose, persistent]);

  const bgColor = {
    success: 'bg-green-500 dark:bg-green-600',
    error: 'bg-red-500 dark:bg-red-600',
    warning: 'bg-orange-500 dark:bg-orange-600',
    info: 'bg-blue-500 dark:bg-blue-600',
  }[type];

  const icon = {
    success: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
      </svg>
    ),
  }[type];

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-slideUp">
      <div className={`${bgColor} text-white rounded-xl px-5 py-3 shadow-lg flex items-center gap-3 max-w-sm`}>
        <span className="flex-shrink-0">{icon}</span>
        <p className="font-medium font-tajawal text-sm flex-1">{message}</p>

        {/* Action Button */}
        {action && (
          <button
            onClick={action.handler}
            className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition-colors whitespace-nowrap"
          >
            {action.label}
          </button>
        )}

        {/* Close Button (للـ persistent toasts) */}
        {persistent && onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 w-5 h-5 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
