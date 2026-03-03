'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

const getTasbeehOptions = (t: ReturnType<typeof useTranslations<'tasbeeh'>>) => [
  { 
    id: 'subhanallah',
    label: t('subhanAllah'), 
    target: 33,
    description: t('subhanAllahDesc'),
    gradient: 'from-[var(--gradient-start)] to-[var(--gradient-end)]',
    reference: t('afterPrayerReference')
  },
  { 
    id: 'alhamdulillah',
    label: t('alhamdulillah'), 
    target: 33,
    description: t('alhamdulillahDesc'),
    gradient: 'from-[var(--gradient-start)] to-[var(--gradient-end)]',
    reference: t('afterPrayerReference')
  },
  { 
    id: 'allahuakbar',
    label: t('allahuAkbar'), 
    target: 34,
    description: t('allahuAkbarDesc'),
    gradient: 'from-[var(--gradient-start)] to-[var(--gradient-start)]',
    reference: t('afterPrayerReference')
  },
  { 
    id: 'lailaha',
    label: t('laIlahaIllallah'), 
    target: 100,
    description: t('laIlahaIllallahDesc'),
    gradient: 'from-violet-500 to-purple-600',
    reference: t('tirmithiReference')
  },
  { 
    id: 'astaghfirullah',
    label: t('astaghfirullah'), 
    target: 100,
    description: t('astaghfirullahDesc'),
    gradient: 'from-rose-500 to-pink-600',
    reference: t('morningEveningReference')
  },
  { 
    id: 'hawqala',
    label: t('hawqala'), 
    target: 100,
    description: t('hawqalaDesc'),
    gradient: 'from-[var(--gradient-start)] to-[var(--gradient-end)]',
    reference: t('agreedUponReference')
  },
  { 
    id: 'subhanallahwabihamdihi',
    label: t('subhanAllahWabihamdihi'), 
    target: 100,
    description: t('subhanAllahWabihamdihiDesc'),
    gradient: 'from-[var(--gradient-start)] to-[var(--gradient-end)]',
    reference: t('bukhariMuslimReference')
  },
  { 
    id: 'custom',
    label: t('customTasbeeh'), 
    target: 0,
    description: t('customTasbeehDesc'),
    gradient: 'from-slate-500 to-gray-600',
    reference: ''
  },
];

export default function TasbeehPage() {
  const t = useTranslations('tasbeeh');
  const tCommon = useTranslations('common');
  const tasbeehOptions = getTasbeehOptions(t);
  
  const [count, setCount] = useState(0);
  const [totals, setTotals] = useState<Record<string, number>>({});
  const [rounds, setRounds] = useState(0);
  const [selectedOption, setSelectedOption] = useState(0);
  const [customTarget, setCustomTarget] = useState(100);
  const [customText, setCustomText] = useState('');
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [showOptions, setShowOptions] = useState(false);

  // استرجاع البيانات المحفوظة
  useEffect(() => {
    const saved = localStorage.getItem('tasbeeh');
    if (saved) {
      const data = JSON.parse(saved);
      setTotals(data.totals || {});
      setVibrationEnabled(data.vibrationEnabled ?? true);
    }
  }, []);

  // حفظ البيانات
  useEffect(() => {
    localStorage.setItem('tasbeeh', JSON.stringify({
      totals,
      vibrationEnabled,
    }));
  }, [totals, vibrationEnabled]);

  const currentOption = tasbeehOptions[selectedOption];
  const currentTarget = selectedOption === 7 ? customTarget : currentOption.target;
  const currentTotal = totals[currentOption.id] || 0;

  const handleTap = useCallback(() => {
    const newCount = count + 1;
    // تحديث الإجمالي لهذه التسبيحة فقط
    setTotals((prev) => ({
      ...prev,
      [currentOption.id]: (prev[currentOption.id] || 0) + 1
    }));

    // إذا وصل للهدف، سجل دورة وأعد من الصفر
    if (currentTarget > 0 && newCount >= currentTarget) {
      setRounds((prev) => prev + 1);
      setCount(0);
      // اهتزاز عند إكمال الدورة
      if (vibrationEnabled && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    } else {
      setCount(newCount);
      // اهتزاز عادي
      if (vibrationEnabled && 'vibrate' in navigator) {
        if (newCount % 33 === 0) {
          navigator.vibrate([50, 30, 50]);
        } else {
          navigator.vibrate(30);
        }
      }
    }
  }, [count, currentTarget, vibrationEnabled, currentOption.id]);

  const resetCount = () => {
    setCount(0);
    setRounds(0);
  };

  const resetTotal = () => {
    toast(
      t('confirmResetTotal'),
      {
        action: {
          label: tCommon('delete'),
          onClick: () => {
            setTotals((prev) => ({
              ...prev,
              [currentOption.id]: 0
            }));
            toast.success(t('totalReset'));
          },
        },
        cancel: {
          label: tCommon('cancel'),
          onClick: () => {},
        },
        duration: 5000,
      }
    );
  };

  const progress = currentTarget > 0 ? Math.min((count / currentTarget) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header */}
      <div className="bg-[var(--card-bg)] sticky top-0 z-10 border-b border-[var(--card-border)] dark:bg-gradient-to-b dark:from-[#111827] dark:to-[#0d1320] dark:border-white/5">
        <div className="relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${currentOption.gradient} opacity-10`}></div>
          <div className="text-center py-5 relative">
            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${currentOption.gradient} mb-2 shadow-lg`}>
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold font-tajawal text-[var(--foreground)]">{t('title')}</h1>
            <p className="text-[var(--muted)] text-sm mt-1 font-tajawal">{t('subtitle')}</p>
          </div>
        </div>

        {/* زر اختيار التسبيحة */}
        <div className="px-4 pt-4 pb-4">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="w-full px-5 py-4 rounded-2xl border-2 border-[var(--card-border)] bg-[var(--accent)] hover:border-[var(--primary)] text-right transition-all duration-300 font-tajawal flex items-center justify-between dark:bg-[var(--card-bg)]/5 dark:border-white/10 dark:hover:border-[var(--primary)]/30"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentOption.gradient} flex items-center justify-center`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">{currentOption.label}</p>
                <p className="text-xs text-[var(--muted)]">{currentOption.description}</p>
              </div>
            </div>
            <svg className={`w-5 h-5 text-[var(--muted)] transition-transform ${showOptions ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* قائمة الخيارات */}
      {showOptions && (
        <div className="px-4 py-4 bg-[var(--card-bg)] border-b border-[var(--card-border)] animate-scaleIn dark:bg-[#111827] dark:border-white/5">
          <div className="grid grid-cols-2 gap-2">
            {tasbeehOptions.map((option, index) => (
              <button
                key={option.id}
                onClick={() => {
                  setSelectedOption(index);
                  setCount(0);
                  setShowOptions(false);
                }}
                className={`p-3 rounded-2xl border-2 transition-all duration-300 text-right ${
                  selectedOption === index
                    ? `border-transparent bg-gradient-to-br ${option.gradient} text-white`
                    : 'border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--primary)]/30'
                }`}
              >
                <p className="font-bold font-tajawal text-sm">{option.label}</p>
                {option.target > 0 && (
                  <p className={`text-xs mt-1 ${selectedOption === index ? 'text-white/80' : 'text-[var(--muted)]'}`}>
                    {option.target} {t('times')}
                  </p>
                )}
              </button>
            ))}
          </div>

          {/* حقل الهدف المخصص */}
          {selectedOption === 7 && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <label className="text-sm font-tajawal text-[var(--muted)]">{t('textLabel')}</label>
                <input
                  type="text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={t('enterDhikr')}
                  className="flex-1 px-4 py-2 rounded-xl border border-[var(--card-border)] bg-[var(--accent)] text-right font-tajawal"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm font-tajawal text-[var(--muted)]">{t('targetLabel')}</label>
                <input
                  type="number"
                  value={customTarget}
                  onChange={(e) => setCustomTarget(Number(e.target.value) || 0)}
                  className="w-24 px-4 py-2 rounded-xl border border-[var(--card-border)] bg-[var(--accent)] text-center font-tajawal"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* العداد الرئيسي */}
      <div className="px-4 pt-8 pb-4 flex flex-col items-center">
        {/* دائرة التقدم */}
        <div className="relative mb-4">
          <svg className="w-52 h-52 transform -rotate-90">
            <circle
              cx="104"
              cy="104"
              r="95"
              stroke="var(--accent)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="104"
              cy="104"
              r="95"
              stroke={`url(#gradient-${currentOption.id})`}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 95}
              strokeDashoffset={2 * Math.PI * 95 * (1 - progress / 100)}
              className="transition-all duration-300"
            />
            <defs>
              <linearGradient id={`gradient-${currentOption.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={currentOption.gradient.includes('emerald') ? '#10b981' : currentOption.gradient.includes('blue') ? '#3b82f6' : currentOption.gradient.includes('amber') ? '#f59e0b' : currentOption.gradient.includes('violet') ? '#8b5cf6' : currentOption.gradient.includes('rose') ? '#f43f5e' : currentOption.gradient.includes('cyan') ? '#06b6d4' : currentOption.gradient.includes('green') ? '#22c55e' : '#64748b'} />
                <stop offset="100%" stopColor={currentOption.gradient.includes('teal') ? '#14b8a6' : currentOption.gradient.includes('indigo') ? '#6366f1' : currentOption.gradient.includes('orange') ? '#f97316' : currentOption.gradient.includes('purple') ? '#a855f7' : currentOption.gradient.includes('pink') ? '#ec4899' : currentOption.gradient.includes('blue') ? '#2563eb' : currentOption.gradient.includes('emerald') ? '#059669' : '#475569'} />
              </linearGradient>
            </defs>
          </svg>
          
          {/* زر الضغط */}
          <button
            onClick={handleTap}
            className="absolute inset-4 rounded-full flex flex-col items-center justify-center transition-all duration-200 active:scale-95 shadow-xl bg-[var(--card-bg)] border-2 border-[var(--card-border)] hover:border-[var(--primary)]/50 dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5 dark:hover:border-[var(--primary)]/30"
          >
            {/* عدد الدورات */}
            {rounds > 0 && (
              <div className={`absolute -top-1 -right-1 min-w-8 h-8 px-2 rounded-full bg-gradient-to-br ${currentOption.gradient} flex items-center justify-center shadow-lg`}>
                <span className="text-white text-sm font-bold">{rounds}</span>
              </div>
            )}
            <span className={`text-5xl font-bold bg-gradient-to-br ${currentOption.gradient} bg-clip-text text-transparent`}>
              {count}
            </span>
            {currentTarget > 0 && (
              <span className="text-[var(--muted)] text-lg font-tajawal">/ {currentTarget}</span>
            )}
            <p className="text-xs text-[var(--muted)] mt-1 font-tajawal">{t('tapToCount')}</p>
          </button>
        </div>
      </div>

      {/* الأزرار والإحصائيات */}
      <div className="px-4 pt-4 space-y-3">
        {/* العدد الإجمالي لهذه التسبيحة */}
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-[var(--muted)] font-tajawal">{t('total')} - {currentOption.label}</p>
              <p className={`text-2xl font-bold bg-gradient-to-r ${currentOption.gradient} bg-clip-text text-transparent`}>
                {currentTotal.toLocaleString('en-US')}
              </p>
            </div>
            <button
              onClick={resetTotal}
              className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* زر إعادة العداد */}
        <button
          onClick={resetCount}
          className="w-full py-3 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--primary)] transition-all duration-300 font-tajawal flex items-center justify-center gap-2 text-sm dark:bg-[#111827] dark:border-white/5 dark:hover:border-[var(--primary)]/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t('resetCounter')}
        </button>
      </div>
    </div>
  );
}
