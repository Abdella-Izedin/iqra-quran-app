package com.iqra.quran.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;

import com.getcapacitor.plugin.notification.LocalNotification;
import com.getcapacitor.plugin.notification.LocalNotificationManager;

/**
 * يعيد جدولة الإشعارات بعد إعادة تشغيل الجهاز.
 * الإشعارات المحلية تُمسح عند إعادة التشغيل، لذا نحتاج إعادة جدولتها.
 * يتم ذلك فعلياً من JavaScript عند فتح التطبيق (شبكة أمان).
 * هذا الـ Receiver يضمن فتح التطبيق عند الحاجة.
 */
public class BootReceiver extends BroadcastReceiver {
    private static final String TAG = "IqraBootReceiver";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            Log.d(TAG, "Device rebooted - notifications will be rescheduled on next app open");
            // نضع علامة أن الجهاز أعيد تشغيله
            // الإشعارات ستُعاد جدولتها عند فتح التطبيق من JavaScript
            SharedPreferences prefs = context.getSharedPreferences("iqra_prefs", Context.MODE_PRIVATE);
            prefs.edit().putBoolean("needs_reschedule", true).apply();
        }
    }
}
