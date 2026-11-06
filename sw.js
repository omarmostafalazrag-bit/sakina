// Offline-first service worker. Bump VERSION when shipping changes.
const VERSION = 'sakina-v7';
const SHELL = [
  './', 'index.html', 'styles.css', 'manifest.webmanifest',
  'js/app.js', 'js/store.js', 'js/ui.js', 'js/core.js', 'js/prayer-times.js',
  'js/views/today.js', 'js/views/calendar.js', 'js/views/settings.js', 'js/views/duas.js', 'js/views/dhikr.js', 'js/views/learn.js', 'js/views/feed.js',
  'js/views/path.js', 'js/views/arabic.js', 'js/views/guide.js', 'js/views/blocks.js', 'js/views/tawba.js', 'js/data/tawba.js',
  'js/views/quran.js', 'js/views/journal.js', 'js/idb.js', 'js/data/suras.js', 'js/data/journal.js', 'js/views/sadaqa.js',
  'js/data/duas.js', 'js/data/adhkar.js', 'js/data/learn.js', 'js/data/guide.js', 'js/data/newmuslim.js', 'js/data/arabic.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-180.png',
];

self.addEventListener('install', (e) => {
  // cache: 'reload' skips the HTTP cache so a new version never installs stale files
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== 'sakina-fonts').map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  // Fonts: cache-first, kept across versions
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open('sakina-fonts').then(async (c) => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      const res = await fetch(e.request);
      if (res.ok || res.type === 'opaque') c.put(e.request, res.clone());
      return res;
    }));
    return;
  }

  // App shell: stale-while-revalidate, so updates arrive on the next open
  if (url.origin === location.origin) {
    e.respondWith(caches.open(VERSION).then(async (c) => {
      const hit = await c.match(e.request, { ignoreSearch: true });
      const net = fetch(e.request, { cache: 'no-cache' }).then((res) => { if (res.ok) c.put(e.request, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
  }
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    const c = list.find((w) => 'focus' in w);
    return c ? c.focus() : self.clients.openWindow('./#/hoy');
  }));
});
