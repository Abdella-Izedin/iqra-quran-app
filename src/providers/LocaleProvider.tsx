'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { NextIntlClientProvider } from 'next-intl';

// Import messages directly for client-side use
import arMessages from '../../messages/ar.json';
import urMessages from '../../messages/ur.json';

type Locale = 'ar' | 'ur';
type Messages = Record<string, unknown>;

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isLoading: boolean;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const messages: Record<Locale, Messages> = {
  ar: arMessages as Messages,
  ur: urMessages as Messages,
};

export function LocaleProvider({ 
  children, 
  initialLocale = 'ar',
  initialMessages 
}: { 
  children: ReactNode;
  initialLocale?: string;
  initialMessages: Messages;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale as Locale);
  const [currentMessages, setCurrentMessages] = useState<Messages>(initialMessages);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Load saved locale on mount
  useEffect(() => {
    setMounted(true);
    try {
      const savedLocale = localStorage.getItem('appLocale') as Locale;
      if (savedLocale && (savedLocale === 'ar' || savedLocale === 'ur')) {
        setLocaleState(savedLocale);
        setCurrentMessages(messages[savedLocale]);
      }
    } catch (e) {
      console.error('Error reading locale from localStorage:', e);
    }
    setIsLoading(false);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    try {
      localStorage.setItem('appLocale', newLocale);
      setLocaleState(newLocale);
      setCurrentMessages(messages[newLocale]);
      // No need to reload - we update state directly
    } catch (e) {
      console.error('Error saving locale to localStorage:', e);
    }
  }, []);

  // Don't render children until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <NextIntlClientProvider locale={initialLocale} messages={initialMessages}>
        {children}
      </NextIntlClientProvider>
    );
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, isLoading }}>
      <NextIntlClientProvider locale={locale} messages={currentMessages}>
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

export function useLocaleContext() {
  const context = useContext(LocaleContext);
  // Return a default context during SSR or when not in provider
  if (context === undefined) {
    // Return default values for SSR - this will be updated on client mount
    return {
      locale: 'ar' as Locale,
      setLocale: () => {},
      isLoading: true
    };
  }
  return context;
}
