'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Geolocation } from '@capacitor/geolocation';

// التحقق من أننا على منصة native
const isNativePlatform = (): boolean => {
  return typeof window !== 'undefined' &&
         window.Capacitor !== undefined &&
         window.Capacitor.isNativePlatform();
};

// إحداثيات الكعبة المشرفة
const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

// حساب زاوية القبلة باستخدام Great Circle Bearing
function calculateQiblaAngle(lat: number, lng: number): number {
  const phi1 = (lat * Math.PI) / 180;
  const phi2 = (KAABA_LAT * Math.PI) / 180;
  const deltaLambda = ((KAABA_LNG - lng) * Math.PI) / 180;

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);

  let qibla = (Math.atan2(y, x) * 180) / Math.PI;
  return (qibla + 360) % 360;
}

// حساب المسافة بين نقطتين (Haversine)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// الحصول على اسم الاتجاه
function getDirectionName(angle: number, t: (key: string) => string): string {
  const directions = [
    t('north'), t('northEast'), t('east'), t('southEast'),
    t('south'), t('southWest'), t('west'), t('northWest'),
  ];
  const index = Math.round(angle / 45) % 8;
  return directions[index];
}

// تمديد واجهة DeviceOrientationEvent لدعم iOS
interface DeviceOrientationEventIOS extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

interface DeviceOrientationEventConstructorIOS {
  requestPermission?: () => Promise<'granted' | 'denied' | 'default'>;
}

export default function QiblaPage() {
  const t = useTranslations('qibla');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [distance, setDistance] = useState<number | null>(null);
  const [hasCompass, setHasCompass] = useState(true);
  const [needsCompassPermission, setNeedsCompassPermission] = useState(false);
  const [isFacingQibla, setIsFacingQibla] = useState(false);

  // ref للتنعيم (low-pass filter)
  const smoothedHeading = useRef(0);
  const rafId = useRef(0);
  const lastUpdate = useRef(0);

  // الحصول على الموقع
  const getLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isNativePlatform()) {
        const permission = await Geolocation.requestPermissions();
        if (permission.location === 'granted' || permission.coarseLocation === 'granted') {
          const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 15000,
          });
          const { latitude, longitude } = position.coords;
          const angle = calculateQiblaAngle(latitude, longitude);
          const dist = calculateDistance(latitude, longitude, KAABA_LAT, KAABA_LNG);
          setQiblaAngle(angle);
          setDistance(dist);
          setLoading(false);
        } else {
          setError(t('locationDeniedMsg'));
          setLoading(false);
        }
      } else {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              const angle = calculateQiblaAngle(latitude, longitude);
              const dist = calculateDistance(latitude, longitude, KAABA_LAT, KAABA_LNG);
              setQiblaAngle(angle);
              setDistance(dist);
              setLoading(false);
            },
            () => {
              setError(t('locationDeniedMsg'));
              setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
          );
        } else {
          setError(t('browserNotSupported'));
          setLoading(false);
        }
      }
    } catch {
      setError(t('unknownError'));
      setLoading(false);
    }
  }, [t]);

  // تشغيل البوصلة
  const startCompass = useCallback(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const now = Date.now();
      // Throttle بـ ~50ms (20fps)
      if (now - lastUpdate.current < 50) return;
      lastUpdate.current = now;

      const e = event as DeviceOrientationEventIOS;
      let heading: number;

      if (e.webkitCompassHeading !== undefined) {
        // iOS
        heading = e.webkitCompassHeading;
      } else if (e.alpha !== null && e.alpha !== undefined) {
        // Android
        heading = (360 - e.alpha) % 360;
      } else {
        return;
      }

      // Low-pass filter للتنعيم
      const alpha = 0.3;
      // معالجة الانتقال بين 359° و 0°
      let diff = heading - smoothedHeading.current;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      smoothedHeading.current = (smoothedHeading.current + alpha * diff + 360) % 360;

      cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        setCompassHeading(smoothedHeading.current);
      });
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  // طلب إذن البوصلة على iOS
  const requestCompassPermission = useCallback(async () => {
    const DOE = DeviceOrientationEvent as unknown as DeviceOrientationEventConstructorIOS;
    if (DOE.requestPermission) {
      try {
        const result = await DOE.requestPermission();
        if (result === 'granted') {
          setNeedsCompassPermission(false);
          startCompass();
        } else {
          setError(t('compassPermissionFailed'));
        }
      } catch {
        setError(t('compassPermissionFailed'));
      }
    }
  }, [startCompass, t]);

  // التهيئة
  useEffect(() => {
    getLocation();
  }, [getLocation]);

  // تشغيل البوصلة بعد الحصول على الموقع
  useEffect(() => {
    if (qiblaAngle === null) return;

    const DOE = DeviceOrientationEvent as unknown as DeviceOrientationEventConstructorIOS;

    // التحقق من دعم البوصلة
    if (!('DeviceOrientationEvent' in window)) {
      setHasCompass(false);
      return;
    }

    // iOS 13+ يتطلب إذن
    if (DOE.requestPermission) {
      setNeedsCompassPermission(true);
      return;
    }

    // Android والمتصفحات الأخرى
    const cleanup = startCompass();

    // التحقق من وجود بيانات بعد ثانيتين
    const timeout = setTimeout(() => {
      if (smoothedHeading.current === 0 && compassHeading === 0) {
        // قد لا يكون هناك بوصلة (ديسكتوب)
        setHasCompass(false);
      }
    }, 2000);

    return () => {
      cleanup();
      clearTimeout(timeout);
    };
  }, [qiblaAngle, startCompass, compassHeading]);

  // التحقق من مواجهة القبلة
  useEffect(() => {
    if (qiblaAngle === null || !hasCompass) return;

    // الفرق بين اتجاه الجهاز وزاوية القبلة
    let diff = Math.abs(compassHeading - qiblaAngle);
    if (diff > 180) diff = 360 - diff;

    const facing = diff <= 5;
    setIsFacingQibla(facing);

    // اهتزاز عند المحاذاة
    if (facing && navigator.vibrate) {
      navigator.vibrate(50);
    }
  }, [compassHeading, qiblaAngle, hasCompass]);

  // زاوية دوران القرص (عكس اتجاه البوصلة)
  const diskRotation = -compassHeading;

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Header */}
      <div className="bg-[var(--card-bg)] border-b border-[var(--card-border)] dark:bg-gradient-to-b dark:from-[#111827] dark:to-[#0d1320] dark:border-white/5">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] opacity-10"></div>
          <div className="py-5 px-4 relative">
            <Link href="/" className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-tajawal text-sm">{t('retry')}</span>
            </Link>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                  <path d="M12 7l-5 9h10l-5-9z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-tajawal text-[var(--foreground)]">{t('title')}</h1>
                <p className="text-[var(--muted)] text-sm font-tajawal">{t('subtitle')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[var(--muted)] mt-4 font-tajawal">{t('locating')}</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-[var(--error)]/20 dark:bg-[var(--error)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-[var(--error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="font-tajawal text-lg text-[var(--error)]">{error}</p>
            <button
              onClick={getLocation}
              className="mt-4 px-6 py-2 bg-[var(--primary)] text-white rounded-xl font-tajawal hover:bg-[var(--primary-dark)] transition-colors"
            >
              {t('retry')}
            </button>
          </div>
        ) : needsCompassPermission ? (
          /* iOS: طلب إذن البوصلة */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-[var(--primary)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                <path d="M12 7l-5 9h10l-5-9z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold font-tajawal text-[var(--foreground)] mb-2">
              {t('enableCompass')}
            </h2>
            <p className="text-[var(--muted)] font-tajawal mb-6 max-w-xs">
              {t('rotateDevice')}
            </p>
            <button
              onClick={requestCompassPermission}
              className="px-8 py-3 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-white rounded-xl font-tajawal font-bold hover:from-[var(--gradient-end)] hover:to-[var(--primary)] transition-all shadow-lg"
            >
              {t('enableCompass')}
            </button>
          </div>
        ) : (
          <>
            {/* رسالة مواجهة القبلة */}
            {isFacingQibla && (
              <div className="mb-4 p-4 bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-center animate-pulse">
                <p className="text-emerald-600 dark:text-emerald-400 font-bold font-tajawal text-lg">
                  {t('facingQibla')}
                </p>
              </div>
            )}

            {/* البوصلة */}
            <div className="flex justify-center mb-6">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80">
                {/* مؤشر ثابت في الأعلى */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
                  <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                    <path d="M10 0L20 16H0L10 0Z" className="fill-[var(--primary)] dark:fill-emerald-400" />
                  </svg>
                </div>

                {/* القرص الدوار */}
                <div
                  className="w-full h-full rounded-full border-4 border-[var(--card-border)] dark:border-white/10 bg-[var(--card-bg)] dark:bg-[#111827] shadow-xl transition-transform"
                  style={{
                    transform: `rotate(${diskRotation}deg)`,
                    transitionDuration: hasCompass ? '0ms' : '500ms',
                  }}
                >
                  {/* SVG البوصلة */}
                  <svg viewBox="0 0 300 300" className="w-full h-full">
                    {/* الدوائر الداخلية */}
                    <circle cx="150" cy="150" r="140" fill="none" className="stroke-[var(--card-border)] dark:stroke-white/5" strokeWidth="1" />
                    <circle cx="150" cy="150" r="100" fill="none" className="stroke-[var(--card-border)] dark:stroke-white/5" strokeWidth="0.5" />

                    {/* علامات الدرجات */}
                    {Array.from({ length: 72 }).map((_, i) => {
                      const angle = i * 5;
                      const isMajor = angle % 30 === 0;
                      const r1 = isMajor ? 125 : 132;
                      const r2 = 140;
                      const rad = (angle * Math.PI) / 180;
                      return (
                        <line
                          key={i}
                          x1={150 + r1 * Math.sin(rad)}
                          y1={150 - r1 * Math.cos(rad)}
                          x2={150 + r2 * Math.sin(rad)}
                          y2={150 - r2 * Math.cos(rad)}
                          className={isMajor ? 'stroke-[var(--foreground)]/60' : 'stroke-[var(--muted)]/30'}
                          strokeWidth={isMajor ? 2 : 1}
                        />
                      );
                    })}

                    {/* حرف الشمال */}
                    <text x="150" y="40" textAnchor="middle" className="fill-red-500 dark:fill-red-400 font-bold" fontSize="18">
                      {t('north').charAt(0)}
                    </text>
                    {/* حرف الجنوب */}
                    <text x="150" y="270" textAnchor="middle" className="fill-[var(--muted)]" fontSize="14">
                      {t('south').charAt(0)}
                    </text>
                    {/* حرف الشرق */}
                    <text x="265" y="155" textAnchor="middle" className="fill-[var(--muted)]" fontSize="14">
                      {t('east').charAt(0)}
                    </text>
                    {/* حرف الغرب */}
                    <text x="35" y="155" textAnchor="middle" className="fill-[var(--muted)]" fontSize="14">
                      {t('west').charAt(0)}
                    </text>

                    {/* علامة القبلة (الكعبة) */}
                    {qiblaAngle !== null && (
                      <g transform={`rotate(${qiblaAngle}, 150, 150)`}>
                        {/* خط من المركز للقبلة */}
                        <line
                          x1="150" y1="150" x2="150" y2="45"
                          className={`${isFacingQibla ? 'stroke-emerald-500 dark:stroke-emerald-400' : 'stroke-[var(--primary)]'}`}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        {/* رأس السهم */}
                        <polygon
                          points="150,35 143,52 157,52"
                          className={`${isFacingQibla ? 'fill-emerald-500 dark:fill-emerald-400' : 'fill-[var(--primary)]'}`}
                        />
                        {/* دائرة الكعبة */}
                        <circle
                          cx="150" cy="28"
                          r="10"
                          className={`${isFacingQibla ? 'fill-emerald-500 dark:fill-emerald-400' : 'fill-[var(--primary)]'}`}
                        />
                        {/* أيقونة الكعبة */}
                        <text x="150" y="33" textAnchor="middle" fontSize="12" fill="white">
                          &#x1F54B;
                        </text>
                      </g>
                    )}

                    {/* نقطة المركز */}
                    <circle cx="150" cy="150" r="5" className="fill-[var(--primary)]" />
                    <circle cx="150" cy="150" r="2" fill="white" />
                  </svg>
                </div>

                {/* توهج أخضر عند مواجهة القبلة */}
                {isFacingQibla && (
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500/50 dark:border-emerald-400/50 shadow-[0_0_30px_rgba(16,185,129,0.3)] dark:shadow-[0_0_40px_rgba(52,211,153,0.4)] pointer-events-none" />
                )}
              </div>
            </div>

            {/* كروت المعلومات */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* زاوية القبلة */}
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 dark:bg-gradient-to-br dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[var(--primary)]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                      <path d="M12 7l-5 9h10l-5-9z" />
                    </svg>
                  </div>
                  <p className="text-xs text-[var(--muted)] font-tajawal">{t('qiblaDirection')}</p>
                </div>
                <p className="text-2xl font-bold text-[var(--foreground)] font-tajawal">
                  {qiblaAngle !== null ? `${Math.round(qiblaAngle)}°` : '--'}
                </p>
                <p className="text-xs text-[var(--muted)] font-tajawal mt-1">
                  {qiblaAngle !== null ? getDirectionName(qiblaAngle, t) : ''}
                </p>
              </div>

              {/* المسافة للكعبة */}
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 dark:bg-gradient-to-br dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                    <svg className="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-xs text-[var(--muted)] font-tajawal">{t('distanceToKaaba')}</p>
                </div>
                <p className="text-2xl font-bold text-[var(--foreground)] font-tajawal">
                  {distance !== null ? Math.round(distance).toLocaleString('ar-EG') : '--'}
                </p>
                <p className="text-xs text-[var(--muted)] font-tajawal mt-1">{t('km')}</p>
              </div>
            </div>

            {/* اتجاهك الحالي (إذا كانت البوصلة تعمل) */}
            {hasCompass && (
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 mb-6 dark:bg-gradient-to-br dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                      <svg className="w-4 h-4 text-[var(--primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                    <p className="text-sm text-[var(--muted)] font-tajawal">{t('yourDirection')}</p>
                  </div>
                  <p className="text-lg font-bold text-[var(--foreground)] font-tajawal">
                    {Math.round(compassHeading)}° {getDirectionName(compassHeading, t)}
                  </p>
                </div>
              </div>
            )}

            {/* تعليمات - إذا لا توجد بوصلة */}
            {!hasCompass && (
              <div className="bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 rounded-2xl p-4 mb-6">
                <p className="text-amber-700 dark:text-amber-400 font-tajawal text-sm text-center">
                  {t('pointToQibla')}
                </p>
              </div>
            )}

            {/* كيفية الاستخدام */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 dark:bg-gradient-to-br dark:from-[#111827] dark:to-[#0f1621] dark:border-white/5">
              <h3 className="font-bold font-tajawal text-[var(--foreground)] mb-2">{t('howToUse')}</h3>
              <p className="text-sm text-[var(--muted)] font-tajawal leading-relaxed">
                {t('usageInstructions')}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
