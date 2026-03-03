'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Geolocation } from '@capacitor/geolocation';
import { LocalNotifications } from '@capacitor/local-notifications';
import Switch from '@/components/ui/Switch';
import Toast from '@/components/ui/Toast';
import WarningBanner from '@/components/ui/WarningBanner';
import SettingsGuideModal from '@/components/ui/SettingsGuideModal';

// التحقق من أننا على منصة native
const isNativePlatform = (): boolean => {
  return typeof window !== 'undefined' &&
         window.Capacitor !== undefined &&
         window.Capacitor.isNativePlatform();
};

// Extend Window interface for Capacitor
declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform: () => boolean;
    };
  }
}

interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface LocationInfo {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface PrayerInfo {
  name: string;
  nameAr: string;
  icon: string;
  time: string;
}

// بيانات المؤذنين - 6 مدمجين (offline) + 4 إضافيين (online)
const MUEZZINS = [
  // === المؤذنون المدمجون (يعملون بدون إنترنت) ===
  { id: 'makkah', nameAr: 'الحرم المكي', nameUr: 'حرمِ مکی', url: '/audio/athan/makkah.mp3', bundled: true },
  { id: 'madinah', nameAr: 'المسجد النبوي', nameUr: 'مسجدِ نبوی', url: '/audio/athan/madinah.mp3', bundled: true },
  { id: 'alaqsa', nameAr: 'المسجد الأقصى', nameUr: 'مسجدِ اقصیٰ', url: '/audio/athan/alaqsa.mp3', bundled: true },
  { id: 'qatami', nameAr: 'ناصر القطامي', nameUr: 'ناصر القطامی', url: '/audio/athan/qatami.mp3', bundled: true },
  { id: 'abdulbasit', nameAr: 'عبد الباسط عبد الصمد', nameUr: 'عبدالباسط عبدالصمد', url: '/audio/athan/abdulbasit.mp3', bundled: true },
  { id: 'sobhi', nameAr: 'إسلام صبحي', nameUr: 'اسلام صبحی', url: '/audio/athan/sobhi.mp3', bundled: true },

  // === مؤذنون إضافيون (يحتاجون إنترنت) ===
  { id: 'alafasy', nameAr: 'مشاري العفاسي', nameUr: 'مشاری العفاسی', url: 'https://archive.org/download/AdzanAroundTheWorld/TheMostSweetestAzanByAlMisharyAlAfasy.mp3', bundled: false },
  { id: 'zahrani', nameAr: 'منصور الزهراني', nameUr: 'منصور الزہرانی', url: 'https://raw.githubusercontent.com/abodehq/Athan-MP3/master/Sounds/Athan%20Mansoor%20Az-Zahrani.mp3', bundled: false },
  { id: 'deghreeri', nameAr: 'حمد الدغريري', nameUr: 'حمد الدغریری', url: 'https://raw.githubusercontent.com/abodehq/Athan-MP3/master/Sounds/Athan%20Hamad%20Deghreri.mp3', bundled: false },
  { id: 'minshawi', nameAr: 'المنشاوي', nameUr: 'المنشاوی', url: 'https://praytimes.org/audio/sunni/Minshawi.mp3', bundled: false },
];

// نوع الخطأ: لا إنترنت أو رفض الموقع
type ErrorType = 'no-internet' | 'location-denied' | null;

export default function PrayerPage() {
  const t = useTranslations('prayer');
  const locale = useLocale();
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [nextPrayer, setNextPrayer] = useState<string | null>(null);
  const [hijriDate, setHijriDate] = useState<string>('');
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  // حالات الأذان
  const [selectedMuezzin, setSelectedMuezzin] = useState('makkah');
  const [playingPrayer, setPlayingPrayer] = useState<string | null>(null);
  const [isAthanLoading, setIsAthanLoading] = useState<string | null>(null);
  const [showMuezzinPicker, setShowMuezzinPicker] = useState(false);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true
  });
  const athanAudioRef = useRef<HTMLAudioElement | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // حالات التعامل مع الأخطاء
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [toastConfig, setToastConfig] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    action?: { label: string; handler: () => void };
    persistent?: boolean;
  } | null>(null);

  // تحميل الإعدادات من localStorage
  useEffect(() => {
    try {
      const savedMuezzin = localStorage.getItem('athan-muezzin');
      if (savedMuezzin) setSelectedMuezzin(savedMuezzin);

      const savedNotifs = localStorage.getItem('athan-notifications');
      if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
    } catch { /* تجاهل أخطاء التحميل */ }
  }, []);

  // حفظ المؤذن المختار
  useEffect(() => {
    localStorage.setItem('athan-muezzin', selectedMuezzin);
  }, [selectedMuezzin]);

  // حفظ إعدادات التنبيهات
  useEffect(() => {
    localStorage.setItem('athan-notifications', JSON.stringify(notifications));
  }, [notifications]);

  // تحديث الوقت كل ثانية
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // جلب اسم المدينة من الإحداثيات
  const fetchCityName = useCallback(async (latitude: number, longitude: number) => {
    try {
      const geoResponse = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ar`
      );
      const geoData = await geoResponse.json();

      setLocation({
        city: geoData.city || geoData.locality || t('unknown'),
        country: geoData.countryName || t('unknown'),
        latitude,
        longitude
      });
    } catch {
      setLocation({
        city: t('yourLocation'),
        country: '',
        latitude,
        longitude
      });
    }
  }, [t]);

  // جلب مواقيت الصلاة
  const fetchPrayerTimes = useCallback(async (lat: number, lng: number) => {
    try {
      const today = new Date();
      const date = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lng}&method=4`
      );

      if (!response.ok) throw new Error(t('fetchError'));

      const data = await response.json();
      setPrayerTimes(data.data.timings);

      // جلب التاريخ الهجري
      const hijri = data.data.date.hijri;
      setHijriDate(`${hijri.day} ${hijri.month.ar} ${hijri.year}`);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setErrorType('no-internet');
      setError('لا يوجد اتصال بالإنترنت');
      setLoading(false);
    }
  }, [t]);

  // الحصول على الموقع ومواقيت الصلاة
  const getLocationAndPrayerTimes = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorType(null);

    const isOnline = navigator.onLine;

    try {
      if (isNativePlatform()) {
        try {
          const permission = await Geolocation.requestPermissions();
          if (permission.location === 'granted' || permission.coarseLocation === 'granted') {
            const position = await Geolocation.getCurrentPosition({
              enableHighAccuracy: true,
              timeout: 15000,
            });
            const { latitude, longitude } = position.coords;
            setLocationPermission('granted');

            if (!isOnline) {
              setErrorType('no-internet');
              setError('لا يوجد اتصال بالإنترنت');
              setLoading(false);
              return;
            }

            await fetchCityName(latitude, longitude);
            await fetchPrayerTimes(latitude, longitude);
          } else {
            setLocationPermission('denied');
            if (!isOnline) {
              setErrorType('no-internet');
              setError('لا يوجد اتصال بالإنترنت');
            } else {
              setErrorType('location-denied');
              setError('تم رفض إذن الموقع');
            }
            setLoading(false);
          }
        } catch (err) {
          console.error('Capacitor Geolocation error:', err);
          setLocationPermission('denied');
          if (!isOnline) {
            setErrorType('no-internet');
            setError('لا يوجد اتصال بالإنترنت');
          } else {
            setErrorType('location-denied');
            setError('تم رفض إذن الموقع');
          }
          setLoading(false);
        }
      } else {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              setLocationPermission('granted');

              if (!navigator.onLine) {
                setErrorType('no-internet');
                setError('لا يوجد اتصال بالإنترنت');
                setLoading(false);
                return;
              }

              await fetchCityName(latitude, longitude);
              await fetchPrayerTimes(latitude, longitude);
            },
            () => {
              setLocationPermission('denied');
              if (!navigator.onLine) {
                setErrorType('no-internet');
                setError('لا يوجد اتصال بالإنترنت');
              } else {
                setErrorType('location-denied');
                setError('تم رفض إذن الموقع');
              }
              setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
          );
        } else {
          setError(t('browserNotSupported') || 'المتصفح لا يدعم تحديد الموقع');
          setLoading(false);
        }
      }
    } catch (err) {
      console.error(err);
      if (!navigator.onLine) {
        setErrorType('no-internet');
        setError('لا يوجد اتصال بالإنترنت');
      } else {
        setError(t('error'));
      }
      setLoading(false);
    }
  }, [t, fetchCityName, fetchPrayerTimes]);

  // التحقق من إذن الموقع عند التحميل
  useEffect(() => {
    getLocationAndPrayerTimes();
  }, [getLocationAndPrayerTimes]);

  // حساب الصلاة القادمة
  const calculateNextPrayer = useCallback(() => {
    if (!prayerTimes) return;

    const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const now = currentTime;

    for (const prayer of prayers) {
      const prayerKey = prayer as keyof PrayerTimes;
      const timeStr = prayerTimes[prayerKey];
      if (!timeStr) continue;

      const [hours, minutes] = timeStr.split(':').map(Number);
      const prayerTime = new Date();
      prayerTime.setHours(hours, minutes, 0, 0);

      if (prayerTime > now) {
        setNextPrayer(prayer);
        return;
      }
    }

    setNextPrayer('Fajr');
  }, [prayerTimes, currentTime]);

  useEffect(() => {
    calculateNextPrayer();
  }, [calculateNextPrayer]);

  const formatTime = (time: string): string => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const period = h >= 12 ? t('pm') : t('am');
    const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${hour12}:${minutes} ${period}`;
  };

  const getPrayersList = (): PrayerInfo[] => {
    if (!prayerTimes) return [];

    return [
      { name: 'Fajr', nameAr: t('fajr'), icon: '🌙', time: prayerTimes.Fajr },
      { name: 'Sunrise', nameAr: t('sunrise'), icon: '🌅', time: prayerTimes.Sunrise },
      { name: 'Dhuhr', nameAr: t('dhuhr'), icon: '☀️', time: prayerTimes.Dhuhr },
      { name: 'Asr', nameAr: t('asr'), icon: '🌤️', time: prayerTimes.Asr },
      { name: 'Maghrib', nameAr: t('maghrib'), icon: '🌇', time: prayerTimes.Maghrib },
      { name: 'Isha', nameAr: t('isha'), icon: '🌃', time: prayerTimes.Isha },
    ];
  };

  const getTimeRemaining = (): string => {
    if (!prayerTimes || !nextPrayer) return '';

    const nextPrayerTime = prayerTimes[nextPrayer as keyof PrayerTimes];
    if (!nextPrayerTime) return '';

    const [hours, minutes] = nextPrayerTime.split(':').map(Number);
    const prayerDate = new Date();
    prayerDate.setHours(hours, minutes, 0, 0);

    if (prayerDate < currentTime) {
      prayerDate.setDate(prayerDate.getDate() + 1);
    }

    const diff = prayerDate.getTime() - currentTime.getTime();
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours} ${t('hour')} و ${diffMinutes} ${t('minute')}`;
    }
    return `${diffMinutes} ${t('minute')}`;
  };

  const getPrayerNameAr = (name: string): string => {
    const names: { [key: string]: string } = {
      Fajr: t('fajr'),
      Dhuhr: t('dhuhr'),
      Asr: t('asr'),
      Maghrib: t('maghrib'),
      Isha: t('isha')
    };
    return names[name] || name;
  };

  // ===== وظائف الأذان =====

  // فتح دليل الإعدادات
  const openSettingsGuide = () => {
    setShowPermissionBanner(false);
    setShowSettingsModal(true);
  };

  // الحصول على اسم المؤذن حسب اللغة
  const getMuezzinName = (muezzin: typeof MUEZZINS[0]) => {
    return locale === 'ur' ? muezzin.nameUr : muezzin.nameAr;
  };

  // تشغيل/إيقاف الأذان (مع smart fallback)
  const playAthan = (prayerName: string, fallbackMuezzinId?: string) => {
    if (playingPrayer === prayerName) {
      athanAudioRef.current?.pause();
      athanAudioRef.current = null;
      setPlayingPrayer(null);
      return;
    }

    if (athanAudioRef.current) {
      athanAudioRef.current.pause();
      athanAudioRef.current = null;
    }

    const muezzinId = fallbackMuezzinId || selectedMuezzin;
    const muezzin = MUEZZINS.find(m => m.id === muezzinId);
    if (!muezzin) return;

    // التحقق: إذا المؤذن online ولا يوجد إنترنت → التبديل الفوري للمحلي
    const isOnline = navigator.onLine;
    if (!muezzin.bundled && !isOnline) {
      const firstBundled = MUEZZINS.find(m => m.bundled);
      if (firstBundled) {
        setSelectedMuezzin(firstBundled.id);
        setToastConfig({
          message: t('athanOfflineMode'),
          type: 'info',
          persistent: false
        });
        // إعادة محاولة التشغيل بالمؤذن المحلي
        setTimeout(() => playAthan(prayerName, firstBundled.id), 300);
        return;
      }
    }

    setIsAthanLoading(prayerName);
    setPlayingPrayer(null);

    const audio = new Audio(muezzin.url);

    audio.oncanplaythrough = () => {
      setIsAthanLoading(null);
      audio.play();
      setPlayingPrayer(prayerName);
    };

    audio.onended = () => {
      setPlayingPrayer(null);
      athanAudioRef.current = null;
    };

    audio.onerror = () => {
      setIsAthanLoading(null);
      setPlayingPrayer(null);
      athanAudioRef.current = null;

      // Smart fallback: إذا فشل مؤذن online → التبديل تلقائياً للمحلي
      if (!muezzin.bundled && !fallbackMuezzinId) {
        const firstBundled = MUEZZINS.find(m => m.bundled);
        if (firstBundled) {
          setSelectedMuezzin(firstBundled.id);
          setToastConfig({
            message: t('athanSwitchedToLocal'),
            type: 'info',
            action: {
              label: t('retry'),
              handler: () => {
                setToastConfig(null);
                playAthan(prayerName, muezzinId); // إعادة المحاولة بالمؤذن الأصلي
              }
            },
            persistent: false
          });
          // تشغيل المؤذن المحلي
          setTimeout(() => playAthan(prayerName, firstBundled.id), 300);
          return;
        }
      }

      // إذا فشل حتى المؤذن المحلي → error toast
      const errorMessage = !isOnline ? t('athanNetworkError') : t('athanLoadError');
      setToastConfig({
        message: errorMessage,
        type: 'error',
        action: {
          label: t('retry'),
          handler: () => {
            setToastConfig(null);
            playAthan(prayerName, muezzinId);
          }
        },
        persistent: false
      });
    };

    athanAudioRef.current = audio;
  };

  // تبديل تنبيه صلاة معينة
  const toggleNotification = (prayerName: string) => {
    const newValue = !notifications[prayerName];
    setNotifications(prev => ({ ...prev, [prayerName]: newValue }));

    // عرض رسالة تأكيد
    const prayerNameAr = getPrayerNameAr(prayerName);
    const message = newValue
      ? t('notificationEnabledFor', { prayer: prayerNameAr })
      : t('notificationDisabledFor', { prayer: prayerNameAr });
    setToastMessage(message);
  };

  // جدولة التنبيهات المحلية
  const scheduleAthanNotifications = useCallback(async () => {
    if (!prayerTimes || !isNativePlatform()) return;

    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel(pending);
      }

      const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const notifsList: { id: number; title: string; body: string; schedule: { at: Date; allowWhileIdle: boolean } }[] = [];

      for (const prayer of prayers) {
        if (!notifications[prayer]) continue;

        const timeStr = prayerTimes[prayer as keyof PrayerTimes];
        if (!timeStr) continue;

        const [hours, minutes] = timeStr.split(':').map(Number);
        const scheduleDate = new Date();
        scheduleDate.setHours(hours, minutes, 0, 0);

        if (scheduleDate <= new Date()) {
          scheduleDate.setDate(scheduleDate.getDate() + 1);
        }

        notifsList.push({
          id: prayers.indexOf(prayer) + 1,
          title: `حان وقت صلاة ${getPrayerNameAr(prayer)}`,
          body: formatTime(timeStr),
          schedule: { at: scheduleDate, allowWhileIdle: true },
        });
      }

      if (notifsList.length > 0) {
        await LocalNotifications.schedule({ notifications: notifsList });
      }
    } catch (err) {
      console.error('Failed to schedule notifications:', err);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prayerTimes, notifications]);

  // جدولة التنبيهات عند تغيير المواقيت أو الإعدادات
  useEffect(() => {
    scheduleAthanNotifications();
  }, [scheduleAthanNotifications]);

  // طلب إذن التنبيهات + listener لتشغيل الأذان عند الضغط على التنبيه
  useEffect(() => {
    if (isNativePlatform()) {
      LocalNotifications.requestPermissions()
        .then((result) => {
          // التحقق من حالة الإذن
          if (result.display === 'denied') {
            // تم رفض الإذن → عرض بانر التحذير
            setShowPermissionBanner(true);
            // تعطيل جميع التنبيهات
            setNotifications({
              Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false
            });
          } else if (result.display === 'granted') {
            // تم منح الإذن → إخفاء البانر
            setShowPermissionBanner(false);
          }
        })
        .catch(() => {
          // خطأ في طلب الإذن → عرض بانر التحذير
          setShowPermissionBanner(true);
        });

      let cleanup: (() => void) | undefined;

      // الاستماع لضغط المستخدم على التنبيه
      (async () => {
        const listener = await LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
          // حفظ الصلاة لتشغيل الأذان عند فتح الصفحة
          const prayerMap: Record<number, string> = {
            1: 'Fajr', 2: 'Dhuhr', 3: 'Asr', 4: 'Maghrib', 5: 'Isha'
          };
          const prayer = prayerMap[notification.notification.id];
          if (prayer) {
            localStorage.setItem('athan-auto-play', prayer);
          }
        });

        cleanup = () => listener.remove();
      })();

      return () => {
        cleanup?.();
      };
    }
  }, []);

  // تشغيل الأذان تلقائياً إذا جاء المستخدم من تنبيه
  useEffect(() => {
    const autoPlay = localStorage.getItem('athan-auto-play');
    if (autoPlay && prayerTimes) {
      localStorage.removeItem('athan-auto-play');
      // تأخير بسيط للسماح بتحميل الصفحة
      setTimeout(() => {
        playAthan(autoPlay);
      }, 500);
    }
  }, [prayerTimes]);

  // تنظيف الصوت عند مغادرة الصفحة
  useEffect(() => {
    return () => {
      if (athanAudioRef.current) {
        athanAudioRef.current.pause();
        athanAudioRef.current = null;
      }
    };
  }, []);

  // المؤذن الحالي
  const currentMuezzin = MUEZZINS.find(m => m.id === selectedMuezzin) || MUEZZINS[0];

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header */}
      <div className="bg-[var(--card-bg)] border-b border-[var(--card-border)] dark:bg-gradient-to-b dark:from-[#111827] dark:to-[#0d1320] dark:border-white/5">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] opacity-10"></div>
          <div className="py-5 px-4 relative">
            {/* Back Button */}
            <Link href="/" className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-tajawal text-sm">{t('home')}</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-tajawal text-[var(--foreground)]">{t('title')}</h1>
                <p className="text-[var(--muted)] text-sm font-tajawal">
                  {location ? `${location.city}${location.country ? ` - ${location.country}` : ''}` : t('locating')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {/* تحذير رفض إذن التنبيهات */}
        {showPermissionBanner && (
          <WarningBanner
            message={t('notificationPermissionDenied')}
            actionLabel={t('howToEnable')}
            onAction={openSettingsGuide}
            onDismiss={() => setShowPermissionBanner(false)}
          />
        )}

        {locationPermission !== 'granted' && !loading && !error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold font-tajawal text-[var(--foreground)] mb-2">
              {t('locationRequired') || 'مطلوب إذن الموقع'}
            </h2>
            <p className="text-[var(--muted)] font-tajawal mb-6 max-w-xs">
              {t('locationRequiredDesc') || 'نحتاج إلى موقعك لعرض مواقيت الصلاة الدقيقة لمنطقتك'}
            </p>
            <button
              onClick={getLocationAndPrayerTimes}
              className="px-8 py-3 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white rounded-xl font-tajawal font-bold hover:from-[var(--gradient-end)] hover:to-[var(--primary)] transition-all shadow-lg"
            >
              {t('enableLocation') || 'تفعيل الموقع'}
            </button>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[var(--muted)] mt-4 font-tajawal">{t('loading')}</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              errorType === 'no-internet'
                ? 'bg-[var(--warning)]/20 dark:bg-[var(--warning)]/10'
                : 'bg-[var(--error)]/20 dark:bg-[var(--error)]/10'
            }`}>
              {errorType === 'no-internet' ? (
                <svg className="w-10 h-10 text-[var(--warning)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-[var(--error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
            <p className={`font-tajawal text-lg ${
              errorType === 'no-internet' ? 'text-[var(--warning)]' : 'text-[var(--error)]'
            }`}>{error}</p>
            <button
              onClick={getLocationAndPrayerTimes}
              className="mt-4 px-6 py-2 bg-[var(--primary)] text-white rounded-xl font-tajawal hover:bg-[var(--primary-dark)] transition-colors"
            >
              {t('retry') || 'إعادة المحاولة'}
            </button>
          </div>
        ) : (
          <>
            {/* Date & Time Card */}
            <div className="bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary-light)] rounded-2xl p-5 mb-4 text-white shadow-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[var(--background)]/80 text-sm font-tajawal">{hijriDate}</p>
                  <p className="text-3xl font-bold font-tajawal mt-1">
                    {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-[var(--background)]/80 text-sm font-tajawal mt-1">
                    {currentTime.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="text-left">
                  <div className="bg-white/20 rounded-xl px-3 py-2 backdrop-blur-sm">
                    <p className="text-xs text-[var(--background)]/80 font-tajawal">{t('nextPrayer')}</p>
                    <p className="text-lg font-bold font-tajawal">{nextPrayer ? getPrayerNameAr(nextPrayer) : '-'}</p>
                    <p className="text-xs text-[var(--background)]/80 font-tajawal">{t('after')} {getTimeRemaining()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Info */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-4 mb-4 flex items-center gap-3 dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-tajawal font-semibold text-[var(--foreground)]">
                  {location?.city}
                </p>
                <p className="text-sm text-[var(--muted)] font-tajawal">
                  {location?.country}
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="p-2 rounded-lg bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 transition-colors"
              >
                <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* Muezzin Selector */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl mb-4 overflow-hidden dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5">
              <button
                onClick={() => setShowMuezzinPicker(!showMuezzinPicker)}
                className="w-full p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 0112.728 0" />
                  </svg>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-xs text-[var(--muted)] font-tajawal">{t('muezzin')}</p>
                  <p className="font-tajawal font-semibold text-[var(--foreground)]">{getMuezzinName(currentMuezzin)}</p>
                </div>
                <svg className={`w-5 h-5 text-[var(--muted)] transition-transform duration-200 ${showMuezzinPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* قائمة المؤذنين */}
              {showMuezzinPicker && (
                <div className="border-t border-[var(--card-border)] dark:border-white/5">
                  {MUEZZINS.map((muezzin) => (
                    <button
                      key={muezzin.id}
                      onClick={() => {
                        setSelectedMuezzin(muezzin.id);
                        setShowMuezzinPicker(false);
                        // إيقاف الأذان الحالي عند تغيير المؤذن
                        if (athanAudioRef.current) {
                          athanAudioRef.current.pause();
                          athanAudioRef.current = null;
                          setPlayingPrayer(null);
                        }
                      }}
                      className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
                        selectedMuezzin === muezzin.id
                          ? 'bg-[var(--primary)]/10 dark:bg-[var(--primary)]/20'
                          : 'hover:bg-[var(--primary)]/5'
                      }`}
                    >
                      <span className={`font-tajawal ${
                        selectedMuezzin === muezzin.id
                          ? 'text-[var(--primary)] font-bold'
                          : 'text-[var(--foreground)]'
                      }`}>
                        {getMuezzinName(muezzin)}
                      </span>
                      {selectedMuezzin === muezzin.id && (
                        <svg className="w-5 h-5 text-[var(--primary)]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Prayer Times List */}
            <div className="space-y-3">
              {getPrayersList().map((prayer) => {
                const isActive = nextPrayer === prayer.name && prayer.name !== 'Sunrise';
                const isNotSunrise = prayer.name !== 'Sunrise';
                const isPlaying = playingPrayer === prayer.name;
                const isLoadingAthan = isAthanLoading === prayer.name;

                return (
                  <div
                    key={prayer.name}
                    className={`bg-[var(--card-bg)] border rounded-xl p-4 transition-all dark:bg-gradient-to-r dark:from-[#111827] dark:to-[#0f1621] ${
                      isActive
                        ? 'border-[var(--primary)] shadow-lg shadow-[var(--shadow-color)] bg-gradient-to-r from-[var(--gradient-start)]/5 to-[var(--gradient-end)]/5 dark:border-[var(--primary)]/50 dark:shadow-[0_8px_30px_var(--shadow-color)]'
                        : 'border-[var(--card-border)] dark:border-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Switch تنبيه الصلاة */}
                        {isNotSunrise ? (
                          <Switch
                            checked={notifications[prayer.name]}
                            onChange={() => toggleNotification(prayer.name)}
                          />
                        ) : (
                          <span className="w-11 h-6" />
                        )}
                        <span className="text-2xl">{prayer.icon}</span>
                        <div>
                          <p className={`font-tajawal font-bold text-lg ${
                            isActive
                              ? 'text-[var(--primary-dark)] dark:text-[var(--primary-light)]'
                              : 'text-[var(--foreground)]'
                          }`}>
                            {prayer.nameAr}
                          </p>
                          {isActive && (
                            <p className="text-xs text-[var(--primary)] font-tajawal">{t('nextPrayer')}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* زر تشغيل الأذان */}
                        {isNotSunrise && (
                          <button
                            onClick={() => playAthan(prayer.name)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                              isPlaying
                                ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--shadow-color)]'
                                : 'bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20'
                            }`}
                          >
                            {isLoadingAthan ? (
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : isPlaying ? (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 6h12v12H6z"/>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                              </svg>
                            )}
                          </button>
                        )}
                        <p className={`font-tajawal font-bold text-xl min-w-[85px] text-left ${
                          isActive
                            ? 'text-[var(--primary-dark)] dark:text-[var(--primary-light)]'
                            : 'text-[var(--foreground)]'
                        }`}>
                          {formatTime(prayer.time)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* شريط الأذان عند التشغيل */}
            {playingPrayer && (
              <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[calc(var(--max-w-lg,512px)-2rem)] z-40">
                <div className="bg-[var(--primary)] text-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-xl shadow-[var(--shadow-color)]">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                    <p className="font-tajawal font-semibold text-sm">{t('athanPlaying')}</p>
                  </div>
                  <button
                    onClick={() => {
                      athanAudioRef.current?.pause();
                      athanAudioRef.current = null;
                      setPlayingPrayer(null);
                    }}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 6h12v12H6z"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* رسالة التأكيد (Toast) - النظام القديم للتوافق */}
            {toastMessage && (
              <Toast
                message={toastMessage}
                type="success"
                onClose={() => setToastMessage(null)}
              />
            )}

            {/* نظام Toast المحسّن مع الأخطاء والإجراءات */}
            {toastConfig && (
              <Toast
                message={toastConfig.message}
                type={toastConfig.type}
                action={toastConfig.action}
                persistent={toastConfig.persistent}
                onClose={() => setToastConfig(null)}
              />
            )}
          </>
        )}
      </div>

      {/* نافذة دليل الإعدادات */}
      {showSettingsModal && (
        <SettingsGuideModal onClose={() => setShowSettingsModal(false)} />
      )}
    </div>
  );
}
