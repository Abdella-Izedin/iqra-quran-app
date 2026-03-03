'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function BottomNavigation() {
  const pathname = usePathname();
  const t = useTranslations('nav');
  
  // Hide bottom navigation on athkar category pages (they have their own footer)
  // Only hide on subpages like /athkar/morning, not on /athkar main page
  const isAthkarCategoryPage = pathname.match(/^\/athkar\/[^/]+$/);
  // Hide on ruqyah section pages too (like /ruqyah/1, not /ruqyah)
  const isRuqyahSectionPage = pathname.match(/^\/ruqyah\/[^/]+$/);
  
  if (isAthkarCategoryPage || isRuqyahSectionPage) {
    return null;
  }

  const navItems = [
    {
      href: '/',
      label: t('home'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      ),
    },
    {
      href: '/quran',
      label: t('mushaf'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
        </svg>
      ),
    },
    {
      href: '/qibla',
      label: t('qibla'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
          <path d="M12 7l-5 9h10l-5-9z"/>
        </svg>
      ),
    },
    {
      href: '/prayer',
      label: t('prayer'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C10.08 2 8.5 3.58 8.5 5.5c0 1.58 1.07 2.9 2.5 3.32V10H6v2h2v8H3v2h18v-2h-5v-8h2v-2h-5V8.82c1.43-.42 2.5-1.74 2.5-3.32C15.5 3.58 13.92 2 12 2zm0 2c.83 0 1.5.67 1.5 1.5S12.83 7 12 7s-1.5-.67-1.5-1.5S11.17 4 12 4z"/>
        </svg>
      ),
    },
    {
      href: '/menu',
      label: t('menu'),
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 bg-[var(--card-bg)]/80 backdrop-blur-xl border-t border-[var(--card-border)] shadow-lg shadow-black/5 dark:bg-[#111827]/90 dark:border-white/5 dark:shadow-[0_-4px_30px_rgba(0,0,0,0.4)]">
      <div className="px-2">
        <ul className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={`relative flex flex-col items-center justify-center py-2 transition-all duration-300 group ${
                    isActive
                      ? 'text-[var(--primary)] dark:text-emerald-400'
                      : 'text-[var(--muted)] hover:text-[var(--primary)] dark:hover:text-emerald-400'
                  }`}
                >
                  {/* خلفية للأيقونة النشطة */}
                  {isActive && (
                    <span className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-14 h-14 bg-[var(--primary)]/10 dark:bg-emerald-500/15 rounded-2xl dark:shadow-[0_0_20px_rgba(16,185,129,0.2)]" />
                  )}
                  <span className={`relative transition-transform duration-300 ${isActive ? 'scale-110 dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'group-hover:scale-105'}`}>
                    {item.icon}
                  </span>
                  <span className={`text-[10px] mt-1 font-medium font-tajawal transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                    {item.label}
                  </span>
                  {/* نقطة تحت العنصر النشط */}
                  {isActive && (
                    <span className="absolute -bottom-1 w-1 h-1 bg-[var(--primary)] dark:bg-emerald-400 rounded-full dark:shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
