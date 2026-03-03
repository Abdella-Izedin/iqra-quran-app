'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from "next/navigation";
import { App } from '@capacitor/app';
import BottomNavigation from "./BottomNavigation";
import Header from "./Header";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isMushafPage = pathname === '/mushaf' || pathname?.startsWith('/mushaf/');
  const isMushafUrduPage = pathname === '/mushaf-urdu' || pathname?.startsWith('/mushaf-urdu/');
  const isWirdReadPage = pathname?.startsWith('/daily-wird/read');
  
  // إخفاء ال header و footer فقط في صفحات المصحف وصفحة قراءة الورد
  const hideLayout = isMushafPage || isMushafUrduPage || isWirdReadPage;

  // التعامل مع زر الرجوع في الأندرويد
  useEffect(() => {
    const handleBackButton = (e: { canGoBack: boolean }) => {
      // قائمة الصفحات الرئيسية التي سيتم الخروج من التطبيق عند الضغط على زر الرجوع فيها
      const mainPages = ['/', '/quran', '/athkar', '/library', '/menu'];

      if (!e.canGoBack || mainPages.includes(pathname)) {
        App.exitApp();
      } else {
        router.back();
      }
    };

    const listener = App.addListener('backButton', handleBackButton);

    return () => {
      listener.then(l => l.remove());
    };
  }, [pathname, router]);

  return (
    <div className="max-w-lg mx-auto min-h-screen flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.06)]">
      {!hideLayout && <Header />}
      <main className="flex-1 safe-area-bottom">
        {children}
      </main>
      {!hideLayout && <BottomNavigation />}
    </div>
  );
}
