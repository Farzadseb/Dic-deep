// Service Worker برای PWA
const CACHE_NAME = 'dicdeep-v1.0';
const urlsToCache = [
  '/Dic-deep/',
  '/Dic-deep/index.html',
  '/Dic-deep/style.css',
  '/Dic-deep/app.js',
  '/Dic-deep/dictionary.js',
  '/Dic-deep/tts.js',
  '/Dic-deep/leitner.js',
  '/Dic-deep/telegram.js',
  '/Dic-deep/competition.js',
  '/Dic-deep/tests.js',
  'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// نصب
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// فعال‌سازی
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// درخواست‌ها
self.addEventListener('fetch', event => {
  // رد درخواست‌های غیر GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // برگرداندن از کش اگر وجود دارد
        if (response) {
          return response;
        }

        // در غیر این صورت از شبکه بگیر
        return fetch(event.request)
          .then(response => {
            // بررسی معتبر بودن پاسخ
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // کلون کردن پاسخ
            const responseToCache = response.clone();

            // ذخیره در کش
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            // اگر آفلاین هستیم و فایل HTML می‌خواهیم
            if (event.request.url.includes('/Dic-deep/') && 
                event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/Dic-deep/index.html');
            }
            
            console.error('Fetch failed:', error);
            throw error;
          });
      })
  );
});

// دریافت پیام
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// همگام‌سازی در پس‌زمینه
self.addEventListener('sync', event => {
  if (event.tag === 'sync-leitner-reviews') {
    event.waitUntil(syncLeitnerReviews());
  }
});

// همگام‌سازی مرورهای لایتنر
async function syncLeitnerReviews() {
  try {
    // اینجا می‌توانید داده‌ها را با سرور همگام کنید
    console.log('🔄 Syncing Leitner reviews in background');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// دریافت نوتیفیکیشن
self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        // اگر پنجره باز است، فوکوس کن
        for (const client of clientList) {
          if (client.url.includes('/Dic-deep/') && 'focus' in client) {
            return client.focus();
          }
        }
        // در غیر این صورت پنجره جدید باز کن
        if (clients.openWindow) {
          return clients.openWindow('/Dic-deep/');
        }
      })
  );
});
