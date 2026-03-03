'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale } from 'next-intl';
import { downloadAllPages, getCachedPagesCount, clearCache, getCacheSize } from '@/utils/mushafCache';

interface MushafDownloadManagerProps {
  onClose: () => void;
}

export default function MushafDownloadManager({ onClose }: MushafDownloadManagerProps) {
  const locale = useLocale();
  const isUrdu = locale === 'ur';
  
  const [cachedPages, setCachedPages] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [totalToDownload, setTotalToDownload] = useState(604);
  const [cacheSize, setCacheSize] = useState('—');
  const [error, setError] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    checkCache();
  }, []);

  const checkCache = async () => {
    const count = await getCachedPagesCount();
    setCachedPages(count);
    const size = await getCacheSize();
    setCacheSize(size);
  };

  const startDownload = async () => {
    setIsDownloading(true);
    setError('');
    abortControllerRef.current = new AbortController();

    try {
      const result = await downloadAllPages(
        (downloaded, total) => {
          setDownloadProgress(downloaded);
          setTotalToDownload(total);
        },
        abortControllerRef.current.signal
      );

      if (result.success) {
        setCachedPages(604);
      } else {
        setCachedPages(result.downloaded);
      }
    } catch {
      setError(isUrdu ? 'ڈاؤن لوڈ ناکام ہوا' : 'فشل التحميل');
    } finally {
      setIsDownloading(false);
      await checkCache();
    }
  };

  const cancelDownload = () => {
    abortControllerRef.current?.abort();
    setIsDownloading(false);
  };

  const handleClearCache = async () => {
    await clearCache();
    setCachedPages(0);
    setCacheSize('—');
  };

  const progressPercent = totalToDownload > 0 ? (downloadProgress / totalToDownload) * 100 : 0;
  const isFullyDownloaded = cachedPages >= 604;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* العنوان */}
        <div className="bg-gradient-to-b from-[#1B5E20] to-[#2E7D32] text-white px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold" style={{ fontFamily: "'Amiri', serif" }}>
              {isUrdu ? 'مصحف آف لائن' : 'المصحف بدون إنترنت'}
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm opacity-80 mt-1">
            {isUrdu ? 'مصحف کی تصاویر ڈاؤن لوڈ کریں تاکہ بغیر انٹرنیٹ پڑھ سکیں' : 'حمّل صور المصحف لقراءته بدون اتصال'}
          </p>
        </div>
        
        {/* المحتوى */}
        <div className="p-5 space-y-4">
          {/* حالة الكاش */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              {isUrdu ? 'ڈاؤن لوڈ شدہ صفحات' : 'الصفحات المحفوظة'}
            </span>
            <span className={`font-bold ${isFullyDownloaded ? 'text-green-600' : 'text-orange-500'}`}>
              {cachedPages} / 604
            </span>
          </div>
          
          {/* شريط التقدم الثابت */}
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${isFullyDownloaded ? 'bg-green-500' : 'bg-[#1B5E20]'}`}
              style={{ width: `${(cachedPages / 604) * 100}%` }}
            />
          </div>
          
          {/* حجم الكاش */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{isUrdu ? 'سٹوریج' : 'التخزين'}: {cacheSize}</span>
            {isFullyDownloaded && (
              <span className="flex items-center gap-1 text-green-600">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {isUrdu ? 'مکمل' : 'مكتمل'}
              </span>
            )}
          </div>
          
          {/* شريط التحميل أثناء التنزيل */}
          {isDownloading && (
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#1B5E20] to-[#4CAF50] rounded-full transition-all duration-300 animate-pulse"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                {downloadProgress} / {totalToDownload} 
                <span className="text-xs text-gray-400 mr-2">
                  ({Math.round(progressPercent)}%)
                </span>
              </p>
            </div>
          )}
          
          {/* رسالة الخطأ */}
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          
          {/* الأزرار */}
          <div className="space-y-2 pt-2">
            {!isDownloading ? (
              <>
                <button
                  onClick={startDownload}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-colors ${
                    isFullyDownloaded 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-[#1B5E20] text-white hover:bg-[#2E7D32]'
                  }`}
                >
                  {isFullyDownloaded 
                    ? (isUrdu ? '✅ مکمل ڈاؤن لوڈ ہو چکا' : '✅ تم التحميل بالكامل')
                    : cachedPages > 0
                      ? (isUrdu ? `⬇️ باقی صفحات ڈاؤن لوڈ کریں (${604 - cachedPages})` : `⬇️ تحميل الصفحات المتبقية (${604 - cachedPages})`)
                      : (isUrdu ? '⬇️ مصحف ڈاؤن لوڈ کریں (604 صفحات)' : '⬇️ تحميل المصحف (604 صفحة)')
                  }
                </button>
                
                {cachedPages > 0 && (
                  <button
                    onClick={handleClearCache}
                    className="w-full py-2.5 rounded-xl text-sm text-red-500 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    {isUrdu ? '🗑️ ڈاؤن لوڈ شدہ صفحات حذف کریں' : '🗑️ حذف الصفحات المحفوظة'}
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={cancelDownload}
                className="w-full py-3 rounded-xl font-bold text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                {isUrdu ? '⏹️ ڈاؤن لوڈ روکیں' : '⏹️ إيقاف التحميل'}
              </button>
            )}
          </div>
          
          {/* ملاحظة */}
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed">
            {isUrdu 
              ? 'تقریباً 600 ایم بی جگہ درکار ہے۔ وائی فائی پر ڈاؤن لوڈ کرنا بہتر ہے۔'
              : 'يحتاج حوالي 600 ميجابايت تخزين. يُفضّل التحميل عبر واي فاي.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
