const cacheName = 'dicdeep-v1';
const assets = [
  './',
  './index.html',
  './dictionary.js',
  './manifest.json'
];

// نصب سرویس ورکر و ذخیره فایل‌ها در کش
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// پاسخ‌دهی به درخواست‌ها حتی در حالت آفلاین
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});
