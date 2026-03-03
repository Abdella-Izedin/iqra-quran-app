// Service Worker لتخزين صور المصحف مؤقتاً
const CACHE_NAME = 'mushaf-images-v1';
const MUSHAF_URL_PATTERN = 'raw.githubusercontent.com/akram-seid/quran-hd-images';

// عند التثبيت
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// عند التفعيل - تنظيف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('mushaf-images-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// اعتراض الطلبات - Cache First لصور المصحف
self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // فقط صور المصحف
  if (!url.includes(MUSHAF_URL_PATTERN)) {
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // موجودة في الكاش - ارجعها فوراً
          return cachedResponse;
        }
        
        // غير موجودة - حملها وخزنها
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // لا يوجد اتصال ولا كاش
          return new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      });
    })
  );
});

// رسائل من التطبيق
self.addEventListener('message', (event) => {
  if (event.data.type === 'GET_CACHE_STATUS') {
    getCacheStatus().then((status) => {
      event.ports[0].postMessage(status);
    });
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

async function getCacheStatus() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    return {
      cachedPages: keys.length,
      totalPages: 604
    };
  } catch {
    return { cachedPages: 0, totalPages: 604 };
  }
}
