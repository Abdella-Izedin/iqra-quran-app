'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { AthkarCategory, Thikr } from '@/types';
import { useTranslations, useLocale } from 'next-intl';

// استيراد البيانات
import morningAthkar from '@/data/athkar/morning.json';
import eveningAthkar from '@/data/athkar/evening.json';
import afterPrayerAthkar from '@/data/athkar/after-prayer.json';
import sleepAthkar from '@/data/athkar/sleep.json';
import wakeUpAthkar from '@/data/athkar/wake-up.json';
import enteringHomeAthkar from '@/data/athkar/entering-home.json';
import enteringMosqueAthkar from '@/data/athkar/entering-mosque.json';
import foodAthkar from '@/data/athkar/food.json';
import travelAthkar from '@/data/athkar/travel.json';
import anxietyAthkar from '@/data/athkar/anxiety.json';
import quranCompletionAthkar from '@/data/athkar/quran-completion.json';
import miscAthkar from '@/data/athkar/misc.json';

const athkarData: Record<string, AthkarCategory> = {
  morning: morningAthkar,
  evening: eveningAthkar,
  'after-prayer': afterPrayerAthkar,
  sleep: sleepAthkar,
  'wake-up': wakeUpAthkar,
  'entering-home': enteringHomeAthkar,
  'entering-mosque': enteringMosqueAthkar,
  food: foodAthkar,
  travel: travelAthkar,
  anxiety: anxietyAthkar,
  'quran-completion': quranCompletionAthkar,
  misc: miscAthkar,
};

const categoryGradients: Record<string, string> = {
  morning: 'from-[var(--gradient-start)] to-[var(--gradient-start)]',
  evening: 'from-indigo-500 to-purple-600',
  sleep: 'from-slate-600 to-slate-800',
  'wake-up': 'from-cyan-400 to-blue-500',
  'after-prayer': 'from-emerald-400 to-teal-500',
  'entering-home': 'from-rose-400 to-pink-500',
  'entering-mosque': 'from-green-500 to-emerald-600',
  food: 'from-yellow-400 to-[var(--gradient-end)]',
  travel: 'from-blue-500 to-indigo-600',
  anxiety: 'from-red-400 to-rose-500',
  'quran-completion': 'from-violet-500 to-purple-600',
  misc: 'from-fuchsia-400 to-pink-500',
};

interface AthkarCategoryClientProps {
  categoryId: string;
}

export default function AthkarCategoryClient({ categoryId }: AthkarCategoryClientProps) {
  const t = useTranslations('athkar');
  const locale = useLocale();
  const isUrdu = locale === 'ur';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [counters, setCounters] = useState<Record<number, number>>({});
  const [initialized, setInitialized] = useState(false);
  
  // Swipe gesture refs
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false);
  const isTransitioning = useRef(false);
  const minSwipeDistance = 50;

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
    };
    return titleMap[id] || id;
  };
  
  const category = athkarData[categoryId];
  const gradient = categoryGradients[categoryId] || 'from-emerald-500 to-teal-600';
  
  // إعادة التهيئة عند تغيير الفئة
  useEffect(() => {
    if (category) {
      const initialCounters: Record<number, number> = {};
      category.items.forEach((item: Thikr) => {
        initialCounters[item.id] = 0;
      });
      setCounters(initialCounters);
      setCurrentIndex(0);
      setInitialized(true);
    }
  }, [category, categoryId]);

  if (!category) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 rounded-full bg-[var(--accent)] flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-[var(--muted)] font-tajawal text-lg mb-4">الفئة غير موجودة</p>
        <Link 
          href="/athkar" 
          className="px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] text-white rounded-xl font-tajawal hover:opacity-90 transition-opacity"
        >
          {t('title')}
        </Link>
      </div>
    );
  }

  // انتظر حتى تتم التهيئة
  if (!initialized) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-pulse text-[var(--muted)] font-tajawal">جاري التحميل...</div>
      </div>
    );
  }

  // حماية من تجاوز الحدود
  const safeIndex = Math.min(currentIndex, category.items.length - 1);
  const currentThikr = category.items[safeIndex];
  const currentCount = counters[currentThikr?.id] ?? 0;
  const isCompleted = currentThikr ? currentCount >= currentThikr.count : false;

  // تصحيح الـ index إذا كان خارج النطاق
  if (currentIndex !== safeIndex) {
    setCurrentIndex(safeIndex);
  }

  const handleCount = () => {
    // لا تعد إذا كان المستخدم يسحب أو في مرحلة انتقال
    if (isSwiping.current || isTransitioning.current) {
      isSwiping.current = false;
      return;
    }
    
    if (!currentThikr) return;
    
    const thikrId = currentThikr.id;
    const requiredCount = currentThikr.count;
    const currentValue = counters[thikrId] ?? 0;
    
    // لا تزيد إذا اكتمل
    if (currentValue >= requiredCount) return;
    
    const newValue = currentValue + 1;
    
    // اهتزاز خفيف
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
    
    // تحديث العداد
    setCounters(prev => ({
      ...prev,
      [thikrId]: newValue,
    }));
    
    // الانتقال للتالي عند الاكتمال
    if (newValue >= requiredCount && currentIndex < category.items.length - 1) {
      isTransitioning.current = true;
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        isTransitioning.current = false;
      }, 400);
    }
  };

  const goToNext = () => {
    if (currentIndex < category.items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Swipe handlers - فقط للسحب الحقيقي وليس الضغط
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;
    
    // فقط إذا كان السحب أكبر من 50 بكسل
    if (Math.abs(distance) > minSwipeDistance) {
      isSwiping.current = true; // منع الـ click
      
      if (distance > 0) {
        // Swiped left
        goToPrev();
      } else {
        // Swiped right
        goToNext();
      }
    }
    
    // reset
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const completedCount = category.items.filter(
    (item: Thikr) => (counters[item.id] || 0) >= item.count
  ).length;

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col pb-20">
      {/* Header جميل */}
      <div className={`bg-gradient-to-r ${gradient} text-white flex-shrink-0`}>
        <div className="flex items-center justify-between px-4 py-4">
          <Link 
            href="/athkar" 
            className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
          >
            <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="text-center">
            <h1 className="text-lg font-bold font-tajawal">{getCategoryTitle(categoryId)}</h1>
            <p className="text-xs opacity-80 font-tajawal">{safeIndex + 1} من {category.items.length}</p>
          </div>
          <div className="p-2 bg-white/20 rounded-xl">
            <span className="text-sm font-bold font-tajawal">{completedCount}/{category.items.length}</span>
          </div>
        </div>
      </div>

      {/* بطاقة الذكر */}
      <div 
        className="flex-1 p-4"
      >
        <div 
          className={`bg-[var(--card-bg)] rounded-3xl p-6 cursor-pointer select-none h-full flex flex-col shadow-xl dark:bg-[#1a1f2e] border-2 ${
            isCompleted ? 'border-green-500' : 'border-transparent'
          }`}
          onClick={handleCount}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* النص العربي */}
          <div className="flex-1 overflow-y-auto flex items-center justify-center py-4">
            <p className="arabic-text text-center leading-[2.2] text-xl md:text-2xl font-amiri">
              {currentThikr?.text}
            </p>
          </div>
          
          {/* العداد والمصدر */}
          <div className="flex justify-between items-center pt-4 border-t border-[var(--card-border)] flex-shrink-0">
            <span className="text-xs text-[var(--muted)] font-tajawal">{currentThikr?.reference}</span>
            <div 
              className={`px-5 py-2 rounded-full font-bold text-lg font-tajawal ${
                isCompleted 
                  ? 'bg-[var(--primary-dark)] text-white' 
                  : `bg-gradient-to-r ${gradient} text-white`
              }`}
            >
              {currentCount} / {currentThikr?.count}
            </div>
          </div>
        </div>
      </div>

      {/* Footer ثابت */}
      <div className="fixed bottom-0 left-0 right-0 bg-[var(--card-bg)]/95 backdrop-blur-lg border-t border-[var(--card-border)] dark:bg-[#111827]/95 px-4 py-3 z-40">
        {/* شريط التقدم */}
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <span className="text-xs text-[var(--muted)] font-tajawal">التقدم</span>
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${gradient} transition-all duration-500 rounded-full`}
              style={{ width: `${(completedCount / category.items.length) * 100}%` }}
            />
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r ${gradient} text-white font-tajawal`}>
            {completedCount}/{category.items.length}
          </span>
        </div>
      </div>

      {/* Modal الاكتمال */}
      {completedCount === category.items.length && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="bg-[var(--card-bg)] rounded-3xl p-8 text-center max-w-xs w-full dark:bg-[#1a1f2e]">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-xl font-bold text-green-600 mb-2 font-tajawal">{t('wellDone')}</p>
            <p className="text-sm text-[var(--muted)] font-tajawal mb-6">{t('allCompleted')}</p>
            <Link 
              href="/athkar" 
              className={`inline-block w-full py-3 bg-gradient-to-r ${gradient} text-white rounded-xl font-tajawal font-bold shadow-lg`}
            >
              العودة للأذكار
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
