'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { getPageAyahs, getSurahByNumber, getJuzFromPage } from '@/services/quranService';

interface WirdSettings {
  startPage: number;
  startJuz: number;
  durationDays: number;
  pagesPerDay: number;
  createdAt: string;
  completedDays: number[];
}

interface TodayWird {
  dayNumber: number;
  fromPage: number;
  toPage: number;
  fromSurah: string;
  fromAyah: number;
  toSurah: string;
  toAyah: number;
  juz: number;
  isCompleted: boolean;
  delayedDays: number;
}

const TOTAL_PAGES = 604;

// صفحة بداية كل جزء
const juzStartPages = [1, 22, 42, 62, 82, 102, 121, 142, 162, 182, 201, 222, 242, 262, 282, 302, 322, 342, 362, 382, 402, 422, 442, 462, 482, 502, 522, 542, 562, 582];

export default function DailyWirdPage() {
  const t = useTranslations('dailyWird');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const [wirdSettings, setWirdSettings] = useState<WirdSettings | null>(null);
  const [todayWird, setTodayWird] = useState<TodayWird | null>(null);
  const [loading, setLoading] = useState(true);
  const [showJuzPicker, setShowJuzPicker] = useState(false);

  // إعدادات إنشاء الورد
  const [startFrom, setStartFrom] = useState<'beginning' | 'juz'>('beginning');
  const [selectedJuz, setSelectedJuz] = useState(1);
  const [customDays, setCustomDays] = useState('30');

  // حساب الصفحات المتبقية والحد الأقصى للأيام
  const startPage = startFrom === 'beginning' ? 1 : juzStartPages[selectedJuz - 1];
  const remainingPages = TOTAL_PAGES - startPage + 1;
  const durationDays = parseInt(customDays) || 30;
  const pagesPerDay = Math.ceil(remainingPages / durationDays);

  useEffect(() => {
    loadWirdSettings();
  }, []);

  const loadWirdSettings = async () => {
    setLoading(true);
    const saved = localStorage.getItem('quranWird');

    if (saved) {
      let settings: WirdSettings = JSON.parse(saved);

      // التوافق مع البيانات القديمة - إضافة completedDays إذا لم تكن موجودة
      if (!settings.completedDays || !Array.isArray(settings.completedDays)) {
        settings = {
          ...settings,
          completedDays: []
        };
        localStorage.setItem('quranWird', JSON.stringify(settings));
      }

      setWirdSettings(settings);
      await calculateTodayWird(settings);
    }

    setLoading(false);
  };

  const calculateTodayWird = async (settings: WirdSettings) => {
    // التحقق من وجود completedDays
    const completedDays = settings.completedDays || [];

    const startDate = new Date(settings.createdAt);
    startDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // حساب عدد الأيام المتأخرة (الأيام التي لم تُكمل)
    const expectedCompletedDays = Math.min(diffDays, settings.durationDays);
    const actualCompletedDays = completedDays.length;
    const delayedDays = Math.max(0, expectedCompletedDays - actualCompletedDays);

    // الورد الحالي هو أول ورد غير مكتمل
    const currentDayNumber = actualCompletedDays + 1;

    if (currentDayNumber > settings.durationDays) {
      // اكتملت الختمة - حذف الورد وعرض شاشة إنشاء ختمة جديدة
      localStorage.removeItem('quranWird');
      setWirdSettings(null);
      setTodayWird(null);
      return;
    }

    const fromPage = settings.startPage + ((currentDayNumber - 1) * settings.pagesPerDay);
    let toPage = fromPage + settings.pagesPerDay - 1;

    if (toPage > TOTAL_PAGES) {
      toPage = TOTAL_PAGES;
    }

    try {
      // استخدام البيانات المحلية بدلاً من API
      const fromAyahs = getPageAyahs(fromPage);
      const toAyahs = getPageAyahs(toPage);

      if (fromAyahs.length > 0 && toAyahs.length > 0) {
        const firstAyah = fromAyahs[0];
        const lastAyah = toAyahs[toAyahs.length - 1];
        const firstSurah = getSurahByNumber(firstAyah.surah);
        const lastSurah = getSurahByNumber(lastAyah.surah);

        const isCompleted = completedDays.includes(currentDayNumber);

        setTodayWird({
          dayNumber: currentDayNumber,
          fromPage,
          toPage,
          fromSurah: firstSurah?.name || firstAyah.surahName,
          fromAyah: firstAyah.number,
          toSurah: lastSurah?.name || lastAyah.surahName,
          toAyah: lastAyah.number,
          juz: getJuzFromPage(fromPage),
          isCompleted,
          delayedDays
        });
      }
    } catch (error) {
      console.error('Error fetching wird details:', error);
    }
  };

  const createWird = () => {
    const days = parseInt(customDays) || 30;

    // حساب الصفحات المتبقية بناءً على نقطة البداية
    const startPage = startFrom === 'beginning' ? 1 : juzStartPages[selectedJuz - 1];
    const remainingPages = TOTAL_PAGES - startPage + 1;

    // الحد الأقصى للأيام هو عدد الصفحات المتبقية (صفحة واحدة على الأقل في اليوم)
    if (days < 1 || days > remainingPages) {
      alert(t('invalidDaysAlert', { max: remainingPages }));
      return;
    }

    const settings: WirdSettings = {
      startPage,
      startJuz: startFrom === 'beginning' ? 1 : selectedJuz,
      durationDays: days,
      pagesPerDay: Math.ceil(remainingPages / days),
      createdAt: new Date().toISOString(),
      completedDays: []
    };

    localStorage.setItem('quranWird', JSON.stringify(settings));
    setWirdSettings(settings);
    calculateTodayWird(settings);
  };

  const markAsCompleted = () => {
    if (!wirdSettings || !todayWird) return;

    const currentCompletedDays = wirdSettings.completedDays || [];
    const updatedSettings = {
      ...wirdSettings,
      completedDays: [...currentCompletedDays, todayWird.dayNumber]
    };

    // الانتقال للورد التالي
    if (todayWird.dayNumber < wirdSettings.durationDays) {
      localStorage.setItem('quranWird', JSON.stringify(updatedSettings));
      setWirdSettings(updatedSettings);
      calculateTodayWird(updatedSettings);
    } else {
      // اكتملت الختمة! - حذف الورد وعرض شاشة إنشاء ختمة جديدة
      localStorage.removeItem('quranWird');
      setWirdSettings(null);
      setTodayWird(null);
    }
  };

  const deleteWird = () => {
    toast(
      t('confirmDeleteWird'),
      {
        action: {
          label: tCommon('delete'),
          onClick: () => {
            localStorage.removeItem('quranWird');
            setWirdSettings(null);
            setTodayWird(null);
            toast.success(t('wirdDeleted'));
          },
        },
        cancel: {
          label: tCommon('cancel'),
          onClick: () => { },
        },
        duration: 5000,
      }
    );
  };

  const startReading = () => {
    if (todayWird && wirdSettings) {
      // حفظ معلومات الورد الحالي للقراءة
      localStorage.setItem('currentWirdReading', JSON.stringify({
        fromPage: todayWird.fromPage,
        toPage: todayWird.toPage,
        dayNumber: todayWird.dayNumber
      }));
      router.push(`/daily-wird/read?from=${todayWird.fromPage}&to=${todayWird.toPage}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--foreground)] font-tajawal">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // حساب نسبة التقدم
  const completedCount = wirdSettings?.completedDays?.length || 0;
  const progressPercent = wirdSettings ? (completedCount / wirdSettings.durationDays) * 100 : 0;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header */}
      <div className="pt-2 pb-4 text-[var(--foreground)]">
        <div className="flex items-center justify-between px-4 py-2">
          <Link href="/" className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>

          <h1 className="text-xl font-bold font-tajawal">{t('title')}</h1>

          {wirdSettings && (
            <button
              onClick={deleteWird}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          {!wirdSettings && <div className="w-10"></div>}
        </div>
      </div>

      <div className="px-4 py-6">
        {/* إذا لم يكن هناك ورد */}
        {!wirdSettings ? (
          <div className="space-y-6">
            {/* بطاقة الترحيب */}
            <div className="bg-gradient-to-br from-[var(--card-bg)] to-[var(--accent)] dark:from-[var(--surface-1)] dark:to-[var(--surface-2)] border border-[var(--card-border)] rounded-3xl p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] border border-[var(--primary)]/30 flex items-center justify-center shadow-[0_4px_20px_var(--shadow-color)]">
                <svg className="w-10 h-10 text-[var(--primary-light)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[var(--foreground)] font-tajawal mb-2">{t('createYourWird')}</h2>
              <p className="text-[var(--primary-dark)] dark:text-[var(--primary-light)] font-tajawal text-sm">{t('setYourSchedule')}</p>
            </div>

            {/* نموذج الإنشاء */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 space-y-6 dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5">
              {/* اختيار نقطة البداية */}
              <div>
                <label className="block text-[var(--foreground)] font-bold font-tajawal mb-3 text-right">{t('startFromLabel')}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setStartFrom('beginning')}
                    className={`p-4 rounded-2xl border transition-all font-tajawal ${startFrom === 'beginning'
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary-dark)] dark:text-[var(--primary-light)]'
                      : 'border-[var(--card-border)] text-[var(--foreground)] hover:border-[var(--primary)]/50'
                      }`}
                  >
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {t('fromBeginning')}
                  </button>
                  <button
                    onClick={() => { setStartFrom('juz'); setShowJuzPicker(true); }}
                    className={`p-4 rounded-2xl border transition-all font-tajawal ${startFrom === 'juz'
                      ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary-dark)] dark:text-[var(--primary-light)]'
                      : 'border-[var(--card-border)] text-[var(--foreground)] hover:border-[var(--primary)]/50'
                      }`}
                  >
                    <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {startFrom === 'juz' ? `${t('juz')} ${t(`juzNames.${selectedJuz}`)}` : t('specificJuz')}
                  </button>
                </div>
              </div>

              {/* اختيار مدة الختمة - حقل إدخال */}
              <div>
                <label className="block text-[var(--foreground)] font-bold font-tajawal mb-3 text-right">{t('durationLabel')}</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={remainingPages}
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    className="w-full p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--background)] text-[var(--foreground)] font-tajawal text-center text-2xl font-bold focus:border-[var(--primary)] focus:outline-none dark:bg-white/5 dark:border-white/10 dark:focus:border-[var(--primary)] dark:focus:shadow-[0_0_15px_var(--shadow-color)] transition-all"
                    placeholder="30"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] font-tajawal">{t('days')}</span>
                </div>
                <p className="text-xs text-[var(--muted)] text-center mt-2 font-tajawal">
                  {t('maxDays')}: {remainingPages} {t('days')} ({remainingPages} {t('pagesRemaining')})
                </p>
                {/* أزرار سريعة */}
                <div className="flex gap-2 mt-3 justify-center">
                  {[7, 14, 30, 60].filter(d => d <= remainingPages).map((days) => (
                    <button
                      key={days}
                      onClick={() => setCustomDays(days.toString())}
                      className={`px-4 py-2 rounded-xl text-sm font-tajawal transition-all border ${customDays === days.toString()
                        ? 'border-[var(--primary)] bg-[var(--primary)]/20 text-[var(--primary-dark)] dark:text-[var(--primary-light)]'
                        : 'border-[var(--card-border)] bg-[var(--accent)] text-[var(--foreground)] hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5'
                        }`}
                    >
                      {days}
                    </button>
                  ))}
                </div>
              </div>

              {/* ملخص الورد */}
              <div className="bg-[var(--card-bg)] dark:bg-[var(--surface-1)] border border-[var(--primary)]/20 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 text-[var(--primary-dark)] dark:text-[var(--primary-light)] font-tajawal justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span className="font-bold text-lg">{t('wirdSummary')}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-[var(--accent)] rounded-xl p-3 border border-[var(--card-border)] dark:bg-white/5 dark:border-white/5">
                    <p className="text-3xl font-bold text-[var(--foreground)] font-tajawal">{pagesPerDay}</p>
                    <p className="text-sm text-[var(--primary-dark)] dark:text-[var(--primary-light)] font-tajawal">{t('pagesPerDay')}</p>
                  </div>
                  <div className="bg-[var(--accent)] rounded-xl p-3 border border-[var(--card-border)] dark:bg-white/5 dark:border-white/5">
                    <p className="text-3xl font-bold text-[var(--foreground)] font-tajawal">{durationDays}</p>
                    <p className="text-sm text-[var(--primary-dark)] dark:text-[var(--primary-light)] font-tajawal">{t('daysForKhatmah')}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={createWird}
                className="w-full py-4 bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] text-[var(--primary-light)] rounded-2xl font-bold font-tajawal text-lg hover:shadow-lg transition-all active:scale-[0.98] border border-[var(--primary)]/30"
              >
                {t('start')}
              </button>
            </div>
          </div>
        ) : todayWird && (
          /* عرض الورد الحالي */
          <div className="space-y-5">
            {/* تنبيه التأخر */}
            {todayWird.delayedDays > 0 && (
              <div className="bg-gradient-to-r from-[var(--error)]/5 to-[var(--error)]/10 dark:from-[var(--error)]/10 dark:to-[var(--error)]/20 border-2 border-[var(--error)]/30 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[var(--error)]/20 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 text-right">
                  <p className="font-bold text-red-700 dark:text-red-400 font-tajawal">{t('delayed')} {todayWird.delayedDays} {todayWird.delayedDays === 1 ? t('day') : t('daysPlural')}</p>
                  <p className="text-sm text-red-600 dark:text-red-300 font-tajawal">{t('tryCatchUp')} 💪</p>
                </div>
              </div>
            )}

            {/* شريط التقدم الكلي */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--muted)] font-tajawal">
                  {completedCount} / {wirdSettings.durationDays}
                </span>
                <span className="text-sm font-bold text-[var(--primary-dark)] dark:text-[var(--primary-light)] font-tajawal">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--primary)] rounded-full transition-all duration-500 shadow-[0_0_10px_var(--primary)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* بطاقة الورد اليومي */}
            <div className="bg-[var(--card-bg)] dark:bg-[var(--surface-1)] border border-[var(--primary)]/20 shadow-md rounded-3xl overflow-hidden">
              {/* الهيدر */}
              <div className="bg-[var(--secondary)] text-white px-5 py-4">
                <div className="flex items-center justify-between">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-tajawal">
                    {t('juz')} {t(`juzNames.${todayWird.juz}`)}
                  </span>
                  <div className="text-right">
                    <p className="text-white/80 text-sm font-tajawal">{t('today')}</p>
                    <p className="text-2xl font-bold font-tajawal">{todayWird.dayNumber}</p>
                  </div>
                </div>
              </div>

              {/* تفاصيل الورد */}
              <div className="p-5 space-y-4">
                {/* من */}
                <div className="flex items-center gap-3 bg-black/5 dark:bg-white/5 rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--primary)]/20 text-[var(--primary-dark)] dark:text-[var(--primary-light)] flex items-center justify-center font-bold font-tajawal">
                    {t('from')}
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-bold text-[var(--foreground)] font-tajawal">{todayWird.fromSurah}</p>
                    <p className="text-sm text-[var(--muted)] font-tajawal">{t('ayah')} {todayWird.fromAyah} • {t('page')} {todayWird.fromPage}</p>
                  </div>
                </div>

                {/* إلى */}
                <div className="flex items-center gap-3 bg-black/10 dark:bg-white/10 rounded-2xl p-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--primary)]/20 text-[var(--primary-dark)] dark:text-[var(--primary-light)] flex items-center justify-center font-bold font-tajawal text-sm">
                    {t('to')}
                  </div>
                  <div className="flex-1 text-right">
                    <p className="font-bold text-[var(--foreground)] font-tajawal">{todayWird.toSurah}</p>
                    <p className="text-sm text-[var(--muted)] font-tajawal">{t('ayah')} {todayWird.toAyah} • {t('page')} {todayWird.toPage}</p>
                  </div>
                </div>

                {/* عدد الصفحات */}
                <div className="text-center py-2">
                  <span className="inline-block bg-[#1B5E20]/10 dark:bg-green-900/30 text-[var(--primary-dark)] dark:text-[var(--primary-light)] px-4 py-2 rounded-full font-bold font-tajawal">
                    📖 {todayWird.toPage - todayWird.fromPage + 1} {t('pages')}
                  </span>
                </div>

                {/* الأزرار */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={startReading}
                    className="flex-1 py-4 bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] text-[var(--primary-light)] border border-[var(--primary)]/30 rounded-2xl font-bold font-tajawal text-center hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {t('readWird')}
                  </button>
                  <button
                    onClick={markAsCompleted}
                    className="flex-1 py-4 bg-[var(--card-bg)] text-[var(--foreground)] border border-[var(--card-border)] rounded-2xl font-bold font-tajawal flex items-center justify-center gap-2 transition-all hover:bg-[var(--primary)]/10 hover:border-[var(--primary)]/50 active:scale-[0.98]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('markComplete')}
                  </button>
                </div>
              </div>
            </div>

            {/* إحصائيات */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 text-center dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5">
                <p className="text-2xl font-bold text-[var(--primary-dark)] dark:text-[var(--primary-light)] font-tajawal">{completedCount}</p>
                <p className="text-xs text-[var(--muted)] font-tajawal">{t('completedWirds')}</p>
              </div>
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 text-center dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5">
                <p className="text-2xl font-bold text-[var(--primary-dark)] font-tajawal">{wirdSettings.durationDays - completedCount}</p>
                <p className="text-xs text-[var(--muted)] font-tajawal">{t('remainingWirds')}</p>
              </div>
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 text-center dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5">
                <p className="text-2xl font-bold text-[var(--primary)] font-tajawal">{wirdSettings.pagesPerDay}</p>
                <p className="text-xs text-[var(--muted)] font-tajawal">{t('pagePerDay')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Juz Picker Modal */}
      {showJuzPicker && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-[var(--card-bg)] w-full max-w-lg rounded-t-3xl max-h-[70vh] overflow-hidden">
            <div className="sticky top-0 bg-[var(--card-bg)] border-b border-[var(--card-border)] p-4 flex items-center justify-between">
              <button onClick={() => setShowJuzPicker(false)} className="text-[var(--muted)] font-tajawal">{t('cancel')}</button>
              <h3 className="font-bold font-tajawal text-[var(--foreground)]">{t('selectJuz')}</h3>
              <button
                onClick={() => setShowJuzPicker(false)}
                className="text-[var(--primary-dark)] dark:text-[var(--primary-light)] font-bold font-tajawal"
              >
                {t('done')}
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-4">
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 30 }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => { setSelectedJuz(index + 1); setShowJuzPicker(false); }}
                    className={`p-3 rounded-xl border-2 transition-all font-tajawal text-sm ${selectedJuz === index + 1
                      ? 'border-[var(--primary-dark)] bg-[var(--primary)]/20 dark:bg-green-900/30 text-[var(--primary-dark)] dark:text-[var(--primary-light)] font-bold'
                      : 'border-[var(--card-border)] text-[var(--foreground)] hover:border-[var(--primary)]'
                      }`}
                  >
                    <p className="text-lg font-bold">{index + 1}</p>
                    <p className="text-xs truncate">{t(`juzNames.${index + 1}`)}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
