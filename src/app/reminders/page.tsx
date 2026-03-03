'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  useNotifications,
  REMINDER_IDS,
  DEFAULT_TIMES,
  DEFAULT_ENABLED_REMINDERS,
  saveReminderSettings,
  getReminderSettings,
  ReminderSettings
} from '@/hooks/useNotifications';
import { toast } from 'sonner';

interface ReminderItem {
  id: string;
  numericId: number;
  icon: React.ReactNode;
  defaultTime: { hour: number; minute: number };
  notificationTitle: string;
  notificationBody: string;
  scheduleType?: 'daily' | 'weekly-sunday' | 'weekly-wednesday' | 'white-days';
}

export default function RemindersPage() {
  const t = useTranslations('reminders');
  const {
    requestPermission,
    checkPermission,
    scheduleReminder,
    scheduleWeeklyReminder,
    scheduleWhiteDaysReminder,
    cancelReminder,
    createNotificationChannel
  } = useNotifications();

  const [settings, setSettings] = useState<Record<string, ReminderSettings>>({});
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showTimePicker, setShowTimePicker] = useState<string | null>(null);
  const [tempTime, setTempTime] = useState({ hour: 0, minute: 0 });

  // قائمة المنبهات
  const reminders: ReminderItem[] = [
    {
      id: 'dailyWird',
      numericId: REMINDER_IDS.dailyWird,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      defaultTime: DEFAULT_TIMES.dailyWird,
      notificationTitle: 'الورد اليومي',
      notificationBody: 'حان وقت قراءة الورد اليومي من القرآن الكريم 📖',
    },
    {
      id: 'duha',
      numericId: REMINDER_IDS.duha,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
        </svg>
      ),
      defaultTime: DEFAULT_TIMES.duha,
      notificationTitle: 'صلاة الضحى',
      notificationBody: 'لا تنسَ صلاة الضحى ☀️',
    },
    {
      id: 'morningAthkar',
      numericId: REMINDER_IDS.morningAthkar,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z" />
        </svg>
      ),
      defaultTime: DEFAULT_TIMES.morningAthkar,
      notificationTitle: 'أذكار الصباح',
      notificationBody: 'حان وقت أذكار الصباح 🌅',
    },
    {
      id: 'eveningAthkar',
      numericId: REMINDER_IDS.eveningAthkar,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9.37,5.51C9.19,6.15,9.1,6.82,9.1,7.5c0,4.08,3.32,7.4,7.4,7.4c0.68,0,1.35-0.09,1.99-0.27C17.45,17.19,14.93,19,12,19 c-3.86,0-7-3.14-7-7C5,9.07,6.81,6.55,9.37,5.51z M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9c0-0.46-0.04-0.92-0.1-1.36 c-0.98,1.37-2.58,2.26-4.4,2.26c-2.98,0-5.4-2.42-5.4-5.4c0-1.81,0.89-3.42,2.26-4.4C12.92,3.04,12.46,3,12,3L12,3z" />
        </svg>
      ),
      defaultTime: DEFAULT_TIMES.eveningAthkar,
      notificationTitle: 'أذكار المساء',
      notificationBody: 'حان وقت أذكار المساء 🌙',
    },
    {
      id: 'surahBaqarah',
      numericId: REMINDER_IDS.surahBaqarah,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      defaultTime: DEFAULT_TIMES.surahBaqarah,
      notificationTitle: 'سورة البقرة',
      notificationBody: 'تذكير بقراءة سورة البقرة 📿',
    },
    {
      id: 'surahMulk',
      numericId: REMINDER_IDS.surahMulk,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      defaultTime: DEFAULT_TIMES.surahMulk,
      notificationTitle: 'سورة الملك',
      notificationBody: 'لا تنسَ قراءة سورة الملك قبل النوم 🌟',
    },
    {
      id: 'mondayFasting',
      numericId: REMINDER_IDS.mondayFasting,
      scheduleType: 'weekly-sunday',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2" />
        </svg>
      ),
      defaultTime: DEFAULT_TIMES.mondayFasting,
      notificationTitle: 'صيام الاثنين',
      notificationBody: 'تذكير: غداً يوم الاثنين ✨ لا تنسَ صيامه اقتداءً بالنبي ﷺ',
    },
    {
      id: 'thursdayFasting',
      numericId: REMINDER_IDS.thursdayFasting,
      scheduleType: 'weekly-wednesday',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6l4 2" />
        </svg>
      ),
      defaultTime: DEFAULT_TIMES.thursdayFasting,
      notificationTitle: 'صيام الخميس',
      notificationBody: 'تذكير: غداً يوم الخميس ✨ لا تنسَ صيامه اقتداءً بالنبي ﷺ',
    },
    {
      id: 'witrPrayer',
      numericId: REMINDER_IDS.witrPrayer,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      defaultTime: DEFAULT_TIMES.witrPrayer,
      notificationTitle: 'صلاة الوتر',
      notificationBody: 'قم لصلاة الوتر 🌙 «أوتِروا فإنَّ الله وترٌ يحبُّ الوتر»',
    },
    {
      id: 'whiteDaysFasting',
      numericId: REMINDER_IDS.whiteDaysFasting,
      scheduleType: 'white-days',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          <circle cx="12" cy="12" r="5" opacity="0.3" />
        </svg>
      ),
      defaultTime: DEFAULT_TIMES.whiteDaysFasting,
      notificationTitle: 'صيام أيام البيض',
      notificationBody: 'تذكير: غداً يبدأ صيام أيام البيض (13، 14، 15) 🌕',
    },
  ];

  // تحميل الإعدادات عند البداية
  useEffect(() => {
    const loadSettings = async () => {
      // إنشاء قناة الإشعارات
      await createNotificationChannel();

      // طلب الإذن تلقائياً عند أول زيارة
      let permitted = await checkPermission();
      if (!permitted) {
        // طلب الإذن من المستخدم
        permitted = await requestPermission();
      }
      setHasPermission(permitted);

      // تحميل الإعدادات المحفوظة
      const saved = getReminderSettings();
      const isFirstTime = Object.keys(saved).length === 0;

      // إنشاء إعدادات افتراضية للمنبهات غير المحفوظة
      const initialSettings: Record<string, ReminderSettings> = {};
      reminders.forEach(reminder => {
        if (saved[reminder.id]) {
          initialSettings[reminder.id] = saved[reminder.id];
        } else {
          // تفعيل المنبهات الافتراضية في أول مرة
          const isDefaultEnabled = isFirstTime && DEFAULT_ENABLED_REMINDERS.includes(reminder.id);
          initialSettings[reminder.id] = {
            id: reminder.id,
            enabled: isDefaultEnabled,
            hour: reminder.defaultTime.hour,
            minute: reminder.defaultTime.minute,
          };
          // حفظ الإعدادات الافتراضية
          if (isDefaultEnabled) {
            saveReminderSettings(reminder.id, initialSettings[reminder.id]);
          }
        }
      });

      // جدولة المنبهات المفعلة افتراضياً في أول مرة
      if (isFirstTime && permitted) {
        for (const reminder of reminders) {
          if (DEFAULT_ENABLED_REMINDERS.includes(reminder.id)) {
            await scheduleReminderByType(reminder);
          }
        }
      }

      setSettings(initialSettings);
      setIsLoading(false);
    };

    loadSettings();
  }, []);

  // جدولة منبه حسب النوع
  const scheduleReminderByType = useCallback(async (
    reminder: ReminderItem,
    hour?: number,
    minute?: number
  ): Promise<boolean> => {
    const h = hour ?? reminder.defaultTime.hour;
    const m = minute ?? reminder.defaultTime.minute;

    switch (reminder.scheduleType) {
      case 'weekly-sunday':
        // تذكير ليلة الأحد (لصيام الاثنين)
        return scheduleWeeklyReminder(reminder.numericId, reminder.notificationTitle, reminder.notificationBody, h, m, 1);
      case 'weekly-wednesday':
        // تذكير ليلة الأربعاء (لصيام الخميس)
        return scheduleWeeklyReminder(reminder.numericId, reminder.notificationTitle, reminder.notificationBody, h, m, 4);
      case 'white-days':
        return scheduleWhiteDaysReminder(reminder.numericId, reminder.notificationTitle, reminder.notificationBody, h, m);
      default:
        return scheduleReminder(reminder.numericId, reminder.notificationTitle, reminder.notificationBody, h, m);
    }
  }, [scheduleReminder, scheduleWeeklyReminder, scheduleWhiteDaysReminder]);

  // تبديل حالة المنبه
  const toggleReminder = useCallback(async (reminder: ReminderItem) => {
    const currentSetting = settings[reminder.id];
    const newEnabled = !currentSetting?.enabled;

    // طلب الإذن إذا لم يكن ممنوحاً
    if (newEnabled && !hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        toast.error(t('permissionDenied'));
        return;
      }
      setHasPermission(true);
    }

    const newSettings: ReminderSettings = {
      id: reminder.id,
      enabled: newEnabled,
      hour: currentSetting?.hour ?? reminder.defaultTime.hour,
      minute: currentSetting?.minute ?? reminder.defaultTime.minute,
    };

    if (newEnabled) {
      // جدولة المنبه
      const success = await scheduleReminderByType(
        reminder,
        newSettings.hour,
        newSettings.minute
      );

      if (success) {
        toast.success(t('reminderEnabled'));
      } else {
        toast.error(t('reminderError'));
        return;
      }
    } else {
      // إلغاء المنبه
      await cancelReminder(reminder.numericId);
      // إلغاء المنبهات الإضافية لأيام البيض
      if (reminder.scheduleType === 'white-days') {
        await cancelReminder(reminder.numericId + 100);
        await cancelReminder(reminder.numericId + 200);
      }
      toast.success(t('reminderDisabled'));
    }

    // حفظ الإعدادات
    saveReminderSettings(reminder.id, newSettings);
    setSettings(prev => ({ ...prev, [reminder.id]: newSettings }));
  }, [settings, hasPermission, requestPermission, scheduleReminderByType, cancelReminder, t]);

  // فتح منتقي الوقت
  const openTimePicker = (reminderId: string) => {
    const currentSetting = settings[reminderId];
    setTempTime({
      hour: currentSetting?.hour ?? 0,
      minute: currentSetting?.minute ?? 0,
    });
    setShowTimePicker(reminderId);
  };

  // حفظ الوقت الجديد
  const saveTime = async () => {
    if (!showTimePicker) return;

    const reminder = reminders.find(r => r.id === showTimePicker);
    if (!reminder) return;

    const currentSetting = settings[showTimePicker];
    const newSettings: ReminderSettings = {
      id: showTimePicker,
      enabled: currentSetting?.enabled ?? false,
      hour: tempTime.hour,
      minute: tempTime.minute,
    };

    // إعادة جدولة المنبه إذا كان مفعلاً
    if (newSettings.enabled) {
      await scheduleReminderByType(
        reminder,
        newSettings.hour,
        newSettings.minute
      );
    }

    saveReminderSettings(showTimePicker, newSettings);
    setSettings(prev => ({ ...prev, [showTimePicker]: newSettings }));
    setShowTimePicker(null);
    toast.success(t('timeSaved'));
  };

  // تنسيق الوقت
  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    const displayMinute = minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] text-[var(--primary-light)] py-8 px-4 shadow-md border-b border-[var(--primary)]/10">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/menu" className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold font-tajawal">{t('title')}</h1>
        </div>
        <p className="text-[var(--primary-light)]/70 font-tajawal text-sm">{t('subtitle')}</p>
      </div>

      {/* المنبهات */}
      <div className="px-4 py-6 space-y-4">
        {reminders.map((reminder) => {
          const setting = settings[reminder.id];
          const isEnabled = setting?.enabled ?? false;

          return (
            <div
              key={reminder.id}
              className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl overflow-hidden dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5"
            >
              {/* الصف الرئيسي */}
              <div className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-xl border ${isEnabled ? 'bg-[var(--primary)]/10 text-[var(--primary-dark)] border-[var(--primary)]/30 dark:text-[var(--primary-light)]' : 'bg-[var(--accent)] text-[var(--muted)] border-transparent'}`}>
                  {reminder.icon}
                </div>

                <div className="flex-1">
                  <h3 className="font-tajawal font-bold text-[var(--foreground)]">
                    {t(`${reminder.id}.title`)}
                  </h3>
                  <p className="text-sm text-[var(--muted)] font-tajawal">
                    {t(`${reminder.id}.description`)}
                  </p>
                </div>

                {/* مفتاح التبديل */}
                <button
                  onClick={() => toggleReminder(reminder)}
                  className={`w-14 h-8 rounded-full transition-all duration-300 border ${isEnabled ? 'bg-[var(--secondary)] border-[var(--primary)]/50 shadow-md shadow-[var(--shadow-color)]' : 'bg-[var(--card-border)] border-transparent dark:bg-[var(--surface-3)]'
                    } relative`}
                >
                  <span
                    className={`absolute top-[3px] w-6 h-6 rounded-full shadow-sm transition-transform duration-300 ${isEnabled ? 'left-1 bg-[var(--primary-light)]' : 'right-1 bg-white dark:bg-[#9ca3af]'
                      }`}
                  />
                </button>
              </div>

              {/* صف الوقت */}
              <button
                onClick={() => openTimePicker(reminder.id)}
                className="w-full px-4 py-3 border-t border-[var(--card-border)] dark:border-white/5 flex items-center gap-3 hover:bg-[var(--accent)] transition-colors"
              >
                <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-[var(--muted)] font-tajawal flex-1 text-right">
                  {t('time')}
                </span>
                <span className="text-[var(--primary-dark)] dark:text-[var(--primary-light)] font-bold">
                  {formatTime(setting?.hour ?? reminder.defaultTime.hour, setting?.minute ?? reminder.defaultTime.minute)}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* منتقي الوقت */}
      {showTimePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card-bg)] rounded-2xl w-full max-w-sm overflow-hidden dark:bg-[#111827]">
            <div className="p-4 border-b border-[var(--card-border)] dark:border-white/5">
              <h3 className="font-tajawal font-bold text-lg text-[var(--foreground)] text-center">
                {t('selectTime')}
              </h3>
            </div>

            <div className="p-6 flex items-center justify-center gap-4">
              {/* الدقائق - بالسحب */}
              <div className="flex flex-col items-center">
                <div
                  className="h-40 overflow-hidden relative"
                  style={{ width: '70px' }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{
                      background: 'linear-gradient(to bottom, var(--card-bg) 0%, transparent 30%, transparent 70%, var(--card-bg) 100%)'
                    }}
                  />
                  <div
                    className="overflow-y-auto h-full snap-y snap-mandatory scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    onScroll={(e) => {
                      const scrollTop = e.currentTarget.scrollTop;
                      const itemHeight = 40;
                      const selectedMinute = Math.round(scrollTop / itemHeight);
                      if (selectedMinute >= 0 && selectedMinute < 60) {
                        setTempTime(prev => ({ ...prev, minute: selectedMinute }));
                      }
                    }}
                    ref={(el) => {
                      if (el && !el.dataset.initialized) {
                        el.scrollTop = tempTime.minute * 40;
                        el.dataset.initialized = 'true';
                      }
                    }}
                  >
                    <div className="h-16" /> {/* Spacer */}
                    {Array.from({ length: 60 }, (_, i) => (
                      <div
                        key={i}
                        className={`h-10 flex items-center justify-center snap-center cursor-pointer transition-all ${tempTime.minute === i
                            ? 'text-[var(--primary)] font-bold text-2xl'
                            : 'text-[var(--muted)] text-lg'
                          }`}
                        onClick={() => setTempTime(prev => ({ ...prev, minute: i }))}
                      >
                        {i.toString().padStart(2, '0')}
                      </div>
                    ))}
                    <div className="h-16" /> {/* Spacer */}
                  </div>
                </div>
                <span className="text-xs text-[var(--muted)] mt-2">{t('minutes') || 'دقيقة'}</span>
              </div>

              <span className="text-4xl font-bold text-[var(--primary)]">:</span>

              {/* الساعات - بالسحب */}
              <div className="flex flex-col items-center">
                <div
                  className="h-40 overflow-hidden relative"
                  style={{ width: '70px' }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none z-10"
                    style={{
                      background: 'linear-gradient(to bottom, var(--card-bg) 0%, transparent 30%, transparent 70%, var(--card-bg) 100%)'
                    }}
                  />
                  <div
                    className="overflow-y-auto h-full snap-y snap-mandatory scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    onScroll={(e) => {
                      const scrollTop = e.currentTarget.scrollTop;
                      const itemHeight = 40;
                      const selectedHour = Math.round(scrollTop / itemHeight);
                      if (selectedHour >= 0 && selectedHour < 24) {
                        setTempTime(prev => ({ ...prev, hour: selectedHour }));
                      }
                    }}
                    ref={(el) => {
                      if (el && !el.dataset.initialized) {
                        el.scrollTop = tempTime.hour * 40;
                        el.dataset.initialized = 'true';
                      }
                    }}
                  >
                    <div className="h-16" /> {/* Spacer */}
                    {Array.from({ length: 24 }, (_, i) => (
                      <div
                        key={i}
                        className={`h-10 flex items-center justify-center snap-center cursor-pointer transition-all ${tempTime.hour === i
                            ? 'text-[var(--primary)] font-bold text-2xl'
                            : 'text-[var(--muted)] text-lg'
                          }`}
                        onClick={() => setTempTime(prev => ({ ...prev, hour: i }))}
                      >
                        {i.toString().padStart(2, '0')}
                      </div>
                    ))}
                    <div className="h-16" /> {/* Spacer */}
                  </div>
                </div>
                <span className="text-xs text-[var(--muted)] mt-2">{t('hours') || 'ساعة'}</span>
              </div>
            </div>

            {/* عرض الوقت المحدد */}
            <div className="text-center pb-4">
              <span className="text-lg font-bold text-[var(--primary)]">
                {formatTime(tempTime.hour, tempTime.minute)}
              </span>
            </div>

            <div className="p-4 border-t border-[var(--card-border)] dark:border-white/5 flex gap-3">
              <button
                onClick={() => setShowTimePicker(null)}
                className="flex-1 py-3 rounded-xl bg-[var(--accent)] text-[var(--foreground)] font-tajawal font-bold"
              >
                {t('cancel')}
              </button>
              <button
                onClick={saveTime}
                className="flex-1 py-3 rounded-xl bg-[var(--primary)] text-white font-tajawal font-bold"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
