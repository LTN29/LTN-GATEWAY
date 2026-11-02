// Sảnh Văn Phòng AI (PWA): giữ sẵn khung trang để mở như app; dữ liệu Sảnh (/v1/…) luôn lấy trực tiếp, không lưu.
const CACHE = 'vpm-shell-v1';
const SHELL = ['/m', '/m/manifest.webmanifest', '/m/icon-192.png', '/m/icon-512.png', '/m/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || !url.pathname.startsWith('/m')) return; // /v1/… đi thẳng mạng
  // trang: lấy bản mới nhất, mất mạng thì dùng bản đã lưu; icon: dùng bản đã lưu
  if (e.request.mode === 'navigate' || url.pathname === '/m' || url.pathname === '/m/') {
    e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put('/m', copy)); return r; }).catch(() => caches.match('/m')));
    return;
  }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
