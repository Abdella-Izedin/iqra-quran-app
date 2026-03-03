'use client';

import { useCallback } from 'react';
import { LocalNotifications, ScheduleOptions, LocalNotificationSchema } from '@capacitor/local-notifications';

// Extend Window interface for Capacitor
declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform: () => boolean;
    };
  }
}

export interface ReminderSettings {
  id: string;
  enabled: boolean;
  hour: number;
  minute: number;
}

// معرفات المنبهات
export const REMINDER_IDS = {
  dailyWird: 1,
  duha: 2,
  morningAthkar: 3,
  eveningAthkar: 4,
  surahBaqarah: 5,
  surahMulk: 6,
  mondayFasting: 7,    // تذكير صيام الاثنين (ليلة الأحد)
  thursdayFasting: 8,   // تذكير صيام الخميس (ليلة الأربعاء)
  witrPrayer: 9,        // صلاة الوتر
  whiteDaysFasting: 10, // صيام أيام البيض
} as const;

// الأوقات الافتراضية
export const DEFAULT_TIMES: Record<string, { hour: number; minute: number }> = {
  dailyWird: { hour: 5, minute: 0 },      // بعد صلاة الفجر
  duha: { hour: 9, minute: 0 },           // وقت صلاة الضحى
  morningAthkar: { hour: 7, minute: 0 },  // الصباح
  eveningAthkar: { hour: 17, minute: 30 }, // المساء
  surahBaqarah: { hour: 20, minute: 30 }, // بعد العشاء
  surahMulk: { hour: 21, minute: 0 },     // قبل النوم
  mondayFasting: { hour: 21, minute: 0 },  // ليلة الأحد 9 مساء
  thursdayFasting: { hour: 21, minute: 0 }, // ليلة الأربعاء 9 مساء
  witrPrayer: { hour: 2, minute: 0 },      // 2 بالليل
  whiteDaysFasting: { hour: 21, minute: 0 }, // يوم 12 هجري 9 مساء
};

// المنبهات المفعلة افتراضياً
export const DEFAULT_ENABLED_REMINDERS = ['dailyWird', 'duha', 'morningAthkar', 'eveningAthkar', 'witrPrayer'];

export function useNotifications() {
  // التحقق من أننا على منصة native وليس الويب
  const isNativePlatform = useCallback((): boolean => {
    return typeof window !== 'undefined' && 
           window.Capacitor !== undefined && 
           window.Capacitor.isNativePlatform();
  }, []);

  // طلب إذن الإشعارات
  const requestPermission = useCallback(async (): Promise<boolean> => {
    // على الويب، نرجع true للسماح بحفظ الإعدادات
    if (!isNativePlatform()) {
      return true;
    }
    
    try {
      const permission = await LocalNotifications.requestPermissions();
      return permission.display === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isNativePlatform]);

  // التحقق من الإذن
  const checkPermission = useCallback(async (): Promise<boolean> => {
    // على الويب، نرجع true للسماح بحفظ الإعدادات
    if (!isNativePlatform()) {
      return true;
    }
    
    try {
      const permission = await LocalNotifications.checkPermissions();
      return permission.display === 'granted';
    } catch (error) {
      console.error('Error checking notification permission:', error);
      return false;
    }
  }, [isNativePlatform]);

  // جدولة منبه يومي
  const scheduleReminder = useCallback(async (
    id: number,
    title: string,
    body: string,
    hour: number,
    minute: number
  ): Promise<boolean> => {
    // على الويب، نرجع true للسماح بحفظ الإعدادات
    if (!isNativePlatform()) {
      console.log('Skipping schedule reminder on web:', { id, title, hour, minute });
      return true;
    }
    
    try {
      // إلغاء جميع الإشعارات القديمة بهذا المعرف أولاً
      await LocalNotifications.cancel({ notifications: [{ id }] });
      
      // إلغاء أي إشعارات معلقة أيضاً
      const pending = await LocalNotifications.getPending();
      const toCancel = pending.notifications.filter(n => n.id === id);
      if (toCancel.length > 0) {
        await LocalNotifications.cancel({ notifications: toCancel.map(n => ({ id: n.id })) });
      }

      // استخدام on بدلاً من at للجدولة اليومية المتكررة
      const notification: LocalNotificationSchema = {
        id,
        title,
        body,
        schedule: {
          on: {
            hour: hour,
            minute: minute,
          },
          repeats: true,
          allowWhileIdle: true,
        },
        sound: 'default',
        smallIcon: 'ic_stat_icon_config_sample',
        largeIcon: 'ic_launcher',
        channelId: 'reminders',
        autoCancel: true,
      };

      const options: ScheduleOptions = {
        notifications: [notification],
      };

      await LocalNotifications.schedule(options);
      console.log('Notification scheduled:', { id, hour, minute });
      return true;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return false;
    }
  }, [isNativePlatform]);

  // إلغاء منبه
  const cancelReminder = useCallback(async (id: number): Promise<boolean> => {
    // على الويب، نرجع true للسماح بحفظ الإعدادات
    if (!isNativePlatform()) {
      console.log('Skipping cancel reminder on web:', id);
      return true;
    }
    
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });
      return true;
    } catch (error) {
      console.error('Error canceling notification:', error);
      return false;
    }
  }, [isNativePlatform]);

  // إنشاء قناة الإشعارات (مطلوب لأندرويد)
  const createNotificationChannel = useCallback(async () => {
    // تخطي على الويب
    if (!isNativePlatform()) {
      console.log('Skipping notification channel creation on web');
      return;
    }
    
    try {
      await LocalNotifications.createChannel({
        id: 'reminders',
        name: 'المنبهات',
        description: 'تذكيرات يومية للأذكار والقرآن',
        importance: 4, // HIGH
        visibility: 1, // PUBLIC
        sound: 'default',
        vibration: true,
        lights: true,
      });
    } catch (error) {
      console.error('Error creating notification channel:', error);
    }
  }, [isNativePlatform]);

  // الحصول على المنبهات المجدولة
  const getPendingReminders = useCallback(async () => {
    // على الويب، نرجع مصفوفة فارغة
    if (!isNativePlatform()) {
      return [];
    }
    
    try {
      const pending = await LocalNotifications.getPending();
      return pending.notifications;
    } catch (error) {
      console.error('Error getting pending notifications:', error);
      return [];
    }
  }, [isNativePlatform]);

  // جدولة منبه أسبوعي (بيوم محدد)
  const scheduleWeeklyReminder = useCallback(async (
    id: number,
    title: string,
    body: string,
    hour: number,
    minute: number,
    weekday: number // 1=Sunday, 2=Monday, ... 7=Saturday
  ): Promise<boolean> => {
    if (!isNativePlatform()) {
      console.log('Skipping weekly schedule on web:', { id, title, hour, minute, weekday });
      return true;
    }
    
    try {
      await LocalNotifications.cancel({ notifications: [{ id }] });

      const notification: LocalNotificationSchema = {
        id,
        title,
        body,
        schedule: {
          on: {
            hour,
            minute,
            weekday: weekday as any,
          },
          repeats: true,
          allowWhileIdle: true,
        },
        sound: 'default',
        smallIcon: 'ic_stat_icon_config_sample',
        largeIcon: 'ic_launcher',
        channelId: 'reminders',
        autoCancel: true,
      };

      await LocalNotifications.schedule({ notifications: [notification] });
      console.log('Weekly notification scheduled:', { id, hour, minute, weekday });
      return true;
    } catch (error) {
      console.error('Error scheduling weekly notification:', error);
      return false;
    }
  }, [isNativePlatform]);

  // جدولة منبه أيام البيض (13، 14، 15 من كل شهر هجري)
  const scheduleWhiteDaysReminder = useCallback(async (
    id: number,
    title: string,
    body: string,
    hour: number,
    minute: number
  ): Promise<boolean> => {
    if (!isNativePlatform()) {
      console.log('Skipping white days schedule on web:', { id, title, hour, minute });
      return true;
    }
    
    try {
      // إلغاء المنبهات السابقة (نستخدم 3 IDs: id, id+100, id+200)
      await LocalNotifications.cancel({ notifications: [{ id }, { id: id + 100 }, { id: id + 200 }] });

      // حساب أقرب 3 أيام بيض قادمة
      const whiteDaysDates = getNextWhiteDays();
      const notifications: LocalNotificationSchema[] = whiteDaysDates.map((date, index) => {
        // التذكير يكون الليلة التي قبلها (يوم 12)
        const reminderDate = new Date(date);
        reminderDate.setDate(reminderDate.getDate() - 1);
        reminderDate.setHours(hour, minute, 0, 0);
        
        // إذا كان التاريخ قد مضى، لا نجدوله
        if (reminderDate.getTime() < Date.now()) {
          reminderDate.setMonth(reminderDate.getMonth() + 1);
        }

        return {
          id: index === 0 ? id : id + (index * 100),
          title,
          body,
          schedule: {
            at: reminderDate,
            allowWhileIdle: true,
          },
          sound: 'default',
          smallIcon: 'ic_stat_icon_config_sample',
          largeIcon: 'ic_launcher',
          channelId: 'reminders',
          autoCancel: true,
        };
      });

      await LocalNotifications.schedule({ notifications });
      console.log('White days notifications scheduled:', whiteDaysDates);
      return true;
    } catch (error) {
      console.error('Error scheduling white days notification:', error);
      return false;
    }
  }, [isNativePlatform]);

  return {
    requestPermission,
    checkPermission,
    scheduleReminder,
    scheduleWeeklyReminder,
    scheduleWhiteDaysReminder,
    cancelReminder,
    createNotificationChannel,
    getPendingReminders,
    isNativePlatform,
  };
}

// ======= حساب التاريخ الهجري وأيام البيض =======

// تحويل تاريخ ميلادي إلى هجري (تقريبي)
function gregorianToHijri(date: Date): { year: number; month: number; day: number } {
  const jd = Math.floor((1461 * (date.getFullYear() + 4800 + Math.floor((date.getMonth() + 1 - 14) / 12))) / 4)
    + Math.floor((367 * (date.getMonth() + 1 - 2 - 12 * Math.floor((date.getMonth() + 1 - 14) / 12))) / 12)
    - Math.floor((3 * Math.floor((date.getFullYear() + 4900 + Math.floor((date.getMonth() + 1 - 14) / 12)) / 100)) / 4)
    + date.getDate() - 32075;

  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719)
    + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
    - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const month = Math.floor((24 * l3) / 709);
  const day = l3 - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  return { year, month, day };
}

// الحصول على أقرب أيام بيض قادمة (13, 14, 15 هجري)
function getNextWhiteDays(): Date[] {
  const today = new Date();
  const dates: Date[] = [];
  
  // نبحث في الأيام القادمة (حتى 40 يوم للأمام)
  for (let i = 0; i < 40; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() + i);
    const hijri = gregorianToHijri(checkDate);
    
    if (hijri.day === 13) {
      // وجدنا يوم 13، نضيف 13 و 14 و 15
      dates.push(new Date(checkDate));
      const day14 = new Date(checkDate);
      day14.setDate(day14.getDate() + 1);
      dates.push(day14);
      const day15 = new Date(checkDate);
      day15.setDate(day15.getDate() + 2);
      dates.push(day15);
      break;
    }
  }
  
  return dates;
}

// تصدير دالة حساب التاريخ الهجري للاستخدام في الواجهة
export function getCurrentHijriDay(): number {
  const hijri = gregorianToHijri(new Date());
  return hijri.day;
}

export function getNextWhiteDaysInfo(): { dates: Date[]; hijriMonth: number; hijriYear: number } {
  const dates = getNextWhiteDays();
  const hijri = dates.length > 0 ? gregorianToHijri(dates[0]) : gregorianToHijri(new Date());
  return { dates, hijriMonth: hijri.month, hijriYear: hijri.year };
}

// حفظ إعدادات المنبه في localStorage
export function saveReminderSettings(reminderId: string, settings: ReminderSettings) {
  try {
    const allSettings = getReminderSettings();
    allSettings[reminderId] = settings;
    localStorage.setItem('reminderSettings', JSON.stringify(allSettings));
  } catch (error) {
    console.error('Error saving reminder settings:', error);
  }
}

// استرجاع إعدادات المنبهات
export function getReminderSettings(): Record<string, ReminderSettings> {
  try {
    const saved = localStorage.getItem('reminderSettings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error getting reminder settings:', error);
  }
  return {};
}

// استرجاع إعدادات منبه معين
export function getReminderSetting(reminderId: string): ReminderSettings | null {
  const settings = getReminderSettings();
  return settings[reminderId] || null;
}
