'use client';

import { useEffect, useRef } from 'react';
import {
  useNotifications,
  REMINDER_IDS,
  REMINDER_META,
  getReminderSettings,
} from '@/hooks/useNotifications';

/**
 * مكوّن صامت يعمل في الخلفية عند فتح التطبيق.
 * يعيد جدولة جميع المنبهات المفعّلة كشبكة أمان
 * (مثلاً بعد إعادة تشغيل الجهاز أو بعد إغلاق التطبيق لفترة).
 * لا يعرض أي شيء في الواجهة.
 */
export default function ReminderRescheduler() {
  const hasRun = useRef(false);
  const {
    isNativePlatform,
    checkPermission,
    createNotificationChannel,
    scheduleReminder,
    scheduleWeeklyReminder,
    scheduleWhiteDaysReminder,
  } = useNotifications();

  useEffect(() => {
    // نشغّل مرة واحدة فقط عند فتح التطبيق
    if (hasRun.current) return;
    hasRun.current = true;

    const reschedule = async () => {
      // لا نعمل شيء على الويب
      if (!isNativePlatform()) return;

      // تحقق من الإذن
      const permitted = await checkPermission();
      if (!permitted) return;

      // إنشاء قناة الإشعارات
      await createNotificationChannel();

      // جلب الإعدادات المحفوظة
      const settings = getReminderSettings();
      if (Object.keys(settings).length === 0) return;

      // إعادة جدولة كل منبه مفعّل
      for (const [reminderId, setting] of Object.entries(settings)) {
        if (!setting.enabled) continue;

        const meta = REMINDER_META[reminderId];
        const numericId = REMINDER_IDS[reminderId as keyof typeof REMINDER_IDS];
        if (!meta || !numericId) continue;

        try {
          switch (meta.scheduleType) {
            case 'weekly-sunday':
              await scheduleWeeklyReminder(numericId, meta.title, meta.body, setting.hour, setting.minute, 1);
              break;
            case 'weekly-wednesday':
              await scheduleWeeklyReminder(numericId, meta.title, meta.body, setting.hour, setting.minute, 4);
              break;
            case 'white-days':
              await scheduleWhiteDaysReminder(numericId, meta.title, meta.body, setting.hour, setting.minute);
              break;
            default:
              await scheduleReminder(numericId, meta.title, meta.body, setting.hour, setting.minute);
          }
        } catch (error) {
          console.error(`Failed to reschedule ${reminderId}:`, error);
        }
      }

      console.log('All active reminders rescheduled on app open');
    };

    reschedule();
  }, [isNativePlatform, checkPermission, createNotificationChannel, scheduleReminder, scheduleWeeklyReminder, scheduleWhiteDaysReminder]);

  // لا يعرض شيء في الواجهة
  return null;
}
