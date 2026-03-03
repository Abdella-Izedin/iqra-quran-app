// أدوات تخزين صور المصحف للعمل بدون إنترنت

const CACHE_NAME = 'mushaf-images-v1';
const TOTAL_PAGES = 604;

// رابط صور المصحف
export const getMushafPageUrl = (pageNumber: number): string => {
  const paddedNumber = String(pageNumber).padStart(3, '0');
  return `https://raw.githubusercontent.com/akram-seid/quran-hd-images/main/images/${paddedNumber}.jpg`;
};

// تسجيل Service Worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    return registration;
  } catch (err) {
    console.error('SW registration failed:', err);
    return null;
  }
}

// التحقق من عدد الصفحات المحفوظة
export async function getCachedPagesCount(): Promise<number> {
  if (typeof window === 'undefined' || !('caches' in window)) return 0;
  
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    // عد فقط صور المصحف
    const mushafKeys = keys.filter(req => req.url.includes('quran-hd-images'));
    return mushafKeys.length;
  } catch {
    return 0;
  }
}

// التحقق من وجود صفحة معينة في الكاش
export async function isPageCached(pageNumber: number): Promise<boolean> {
  if (typeof window === 'undefined' || !('caches' in window)) return false;
  
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(getMushafPageUrl(pageNumber));
    return !!response;
  } catch {
    return false;
  }
}

// تحميل كل صفحات المصحف مسبقاً
export async function downloadAllPages(
  onProgress: (downloaded: number, total: number) => void,
  signal?: AbortSignal
): Promise<{ success: boolean; downloaded: number }> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return { success: false, downloaded: 0 };
  }
  
  const cache = await caches.open(CACHE_NAME);
  let downloaded = 0;
  
  // التحقق من الصفحات الموجودة أولاً
  const existingKeys = await cache.keys();
  const existingUrls = new Set(existingKeys.map(k => k.url));
  
  // تحديد الصفحات غير المحملة
  const pagesToDownload: number[] = [];
  for (let i = 1; i <= TOTAL_PAGES; i++) {
    const url = getMushafPageUrl(i);
    if (!existingUrls.has(url)) {
      pagesToDownload.push(i);
    } else {
      downloaded++;
    }
  }
  
  onProgress(downloaded, TOTAL_PAGES);
  
  if (pagesToDownload.length === 0) {
    return { success: true, downloaded: TOTAL_PAGES };
  }
  
  // تحميل بمجموعات (5 في نفس الوقت) لعدم إثقال الشبكة
  const BATCH_SIZE = 5;
  
  for (let i = 0; i < pagesToDownload.length; i += BATCH_SIZE) {
    if (signal?.aborted) {
      return { success: false, downloaded };
    }
    
    const batch = pagesToDownload.slice(i, i + BATCH_SIZE);
    
    const results = await Promise.allSettled(
      batch.map(async (page) => {
        const url = getMushafPageUrl(page);
        try {
          const response = await fetch(url, { signal });
          if (response.ok) {
            await cache.put(url, response);
            return true;
          }
          return false;
        } catch {
          return false;
        }
      })
    );
    
    const successCount = results.filter(
      r => r.status === 'fulfilled' && r.value === true
    ).length;
    
    downloaded += successCount;
    onProgress(downloaded, TOTAL_PAGES);
  }
  
  return { success: downloaded === TOTAL_PAGES, downloaded };
}

// تحميل نطاق معين من الصفحات (للورد)
export async function downloadPageRange(
  fromPage: number,
  toPage: number,
  onProgress: (downloaded: number, total: number) => void,
  signal?: AbortSignal
): Promise<{ success: boolean; downloaded: number }> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return { success: false, downloaded: 0 };
  }
  
  const cache = await caches.open(CACHE_NAME);
  const total = toPage - fromPage + 1;
  let downloaded = 0;
  
  // التحقق من الصفحات الموجودة
  const pagesToDownload: number[] = [];
  for (let i = fromPage; i <= toPage; i++) {
    const url = getMushafPageUrl(i);
    const cached = await cache.match(url);
    if (cached) {
      downloaded++;
    } else {
      pagesToDownload.push(i);
    }
  }
  
  onProgress(downloaded, total);
  
  if (pagesToDownload.length === 0) {
    return { success: true, downloaded: total };
  }
  
  const BATCH_SIZE = 5;
  
  for (let i = 0; i < pagesToDownload.length; i += BATCH_SIZE) {
    if (signal?.aborted) {
      return { success: false, downloaded };
    }
    
    const batch = pagesToDownload.slice(i, i + BATCH_SIZE);
    
    const results = await Promise.allSettled(
      batch.map(async (page) => {
        const url = getMushafPageUrl(page);
        try {
          const response = await fetch(url, { signal });
          if (response.ok) {
            await cache.put(url, response);
            return true;
          }
          return false;
        } catch {
          return false;
        }
      })
    );
    
    const successCount = results.filter(
      r => r.status === 'fulfilled' && r.value === true
    ).length;
    
    downloaded += successCount;
    onProgress(downloaded, total);
  }
  
  return { success: downloaded === total, downloaded };
}

// حذف كل الكاش
export async function clearCache(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  await caches.delete(CACHE_NAME);
}

// حجم الكاش التقريبي
export async function getCacheSize(): Promise<string> {
  if (typeof window === 'undefined' || !('storage' in navigator && 'estimate' in navigator.storage)) {
    return '—';
  }
  
  try {
    const estimate = await navigator.storage.estimate();
    const usedMB = ((estimate.usage || 0) / (1024 * 1024)).toFixed(1);
    return `${usedMB} MB`;
  } catch {
    return '—';
  }
}
