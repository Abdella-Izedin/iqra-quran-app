'use client';

import WirdCard from '@/components/ui/WirdCard';
import FeatureCard from '@/components/ui/FeatureCard';
import { useTranslations } from 'next-intl';

// أيقونات الميزات - مطابقة للتصميم بالضبط
// المصحف - كتاب مفتوح مع علامة
const MushafIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
    <path d="M17.5 10.5c.88 0 1.73.09 2.5.26V9.24c-.79-.15-1.64-.24-2.5-.24-1.7 0-3.24.29-4.5.83v1.66c1.13-.64 2.7-.99 4.5-.99zM13 12.49v1.66c1.13-.64 2.7-.99 4.5-.99.88 0 1.73.09 2.5.26v-1.52c-.79-.15-1.64-.24-2.5-.24-1.7 0-3.24.3-4.5.83zM17.5 14.33c-1.7 0-3.24.29-4.5.83v1.66c1.13-.64 2.7-.99 4.5-.99.88 0 1.73.09 2.5.26v-1.52c-.79-.15-1.64-.24-2.5-.24z" />
  </svg>
);

// القراء - سماعات
const RecitersIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z" />
  </svg>
);

// الأذكار - يدين مرفوعتين للدعاء
const AthkarIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.5 11C3.12 11 2 12.12 2 13.5V21h3v-8.5c0-.28-.22-.5-.5-.5zM19.5 11c-.28 0-.5.22-.5.5V21h3v-7.5c0-1.38-1.12-2.5-2.5-2.5zM12 2C9.24 2 7 4.24 7 7v6c0 2.76 2.24 5 5 5s5-2.24 5-5V7c0-2.76-2.24-5-5-5zm3 11c0 1.65-1.35 3-3 3s-3-1.35-3-3V7c0-1.65 1.35-3 3-3s3 1.35 3 3v6z" />
  </svg>
);

// الرقية - درع حماية
const RuqyahIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
  </svg>
);

// السبحة - حبات مسبحة دائرية
const TasbeehIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="4" r="2" />
    <circle cx="6.5" cy="6.5" r="2" />
    <circle cx="4" cy="12" r="2" />
    <circle cx="6.5" cy="17.5" r="2" />
    <circle cx="12" cy="20" r="2" />
    <circle cx="17.5" cy="17.5" r="2" />
    <circle cx="20" cy="12" r="2" />
    <circle cx="17.5" cy="6.5" r="2" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

// القبلة - بوصلة مع اتجاه
const QiblaIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    <path d="M12 7l-5 9h10l-5-9z" />
  </svg>
);

// المكتبة - كتب على رف
const LibraryIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z" />
    <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 10l-2.5-1.5L15 12V4h5v8z" />
  </svg>
);

// الصلاة - مسجد مع قبة ومئذنة
const PrayerIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C10.08 2 8.5 3.58 8.5 5.5c0 1.58 1.07 2.9 2.5 3.32V10H6v2h2v8H3v2h18v-2h-5v-8h2v-2h-5V8.82c1.43-.42 2.5-1.74 2.5-3.32C15.5 3.58 13.92 2 12 2zm0 2c.83 0 1.5.67 1.5 1.5S12.83 7 12 7s-1.5-.67-1.5-1.5S11.17 4 12 4z" />
  </svg>
);

// التذكيرات - جرس مع نقطة إشعار
const RemindersIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
    <circle cx="18" cy="4" r="3" />
  </svg>
);

// الختمة - مصحف مع شريط
const KhatmahIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
  </svg>
);

export default function Home() {
  const t = useTranslations('home');

  const features = [
    {
      href: '/quran',
      icon: <MushafIcon />,
      title: t('mushaf'),
    },
    {
      href: '/daily-wird',
      icon: <KhatmahIcon />,
      title: t('wird'),
    },
    {
      href: '/reciters',
      icon: <RecitersIcon />,
      title: t('reciters'),
    },
    {
      href: '/prayer',
      icon: <PrayerIcon />,
      title: t('prayer'),
    },
    {
      href: '/athkar',
      icon: <AthkarIcon />,
      title: t('athkar'),
    },
    {
      href: '/tasbeeh',
      icon: <TasbeehIcon />,
      title: t('tasbeeh'),
    },
    {
      href: '/qibla',
      icon: <QiblaIcon />,
      title: t('qibla'),
    },
    {
      href: '/reminders',
      icon: <RemindersIcon />,
      title: t('reminders'),
    },
  ];

  return (
    <div className="px-4 py-8 max-w-lg mx-auto animate-fadeIn min-h-screen">
      {/* بطاقة الورد اليومي */}
      <section className="mb-6">
        <WirdCard />
      </section>

      {/* شبكة الميزات */}
      <section>
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-[var(--card-border)] to-transparent flex-1 opacity-50"></div>
          <h2 className="text-lg font-bold text-center text-[var(--foreground)] font-tajawal tracking-wide">{t('featuresTitle')}</h2>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-[var(--card-border)] to-transparent flex-1 opacity-50"></div>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {features.map((feature, index) => (
            <div key={feature.href} style={{ animationDelay: `${index * 50}ms` }} className="animate-slideUp">
              <FeatureCard
                href={feature.href}
                icon={feature.icon}
                title={feature.title}
                iconBgColor="" // We no longer pass background from here, it's defined internally in FeatureCard
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
