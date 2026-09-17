'use strict';
/* Bloom service worker — offline app shell + best-effort background reminders.
   Reads mirrored reminder state from IndexedDB (service workers can't see
   the page's localStorage), since periodicsync can fire with no page open. */

const CACHE = 'bloom-shell-v2';
const ASSETS = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-512-maskable.png'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).catch(() => cached))
  );
});

function idbOpen() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('bloom-eye-care-idb', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('state');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function getReminderState() {
  return idbOpen().then(db => new Promise(resolve => {
    const tx = db.transaction('state', 'readonly');
    const req = tx.objectStore('state').get('reminder');
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  })).catch(() => null);
}
function pad(n) { return String(n).padStart(2, '0') }
function todayStrNow() {
  const d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

async function checkAndNotify() {
  const st = await getReminderState();
  if (!st || !st.remind) return;
  const now = new Date(), h = now.getHours();
  if (h < st.whStart || h >= st.whEnd) return;
  const doneHours = (st.today === todayStrNow()) ? (st.doneHours || []) : [];
  if (doneHours.includes(h)) return;
  await self.registration.showNotification('Bloom — eye break time', {
    body: 'A gentle break is due this hour. Five short exercises, about five minutes.',
    icon: 'icon-192.png',
    badge: 'icon-192.png',
    tag: 'bloom-reminder',
    renotify: true
  });
}

// Fires only for installed PWAs, only on Chrome/Edge (desktop + Android),
// and only after the browser's engagement heuristics allow it — there is
// no user-facing prompt for this permission, so it can take normal daily
// use for a few days before the browser starts granting sync ticks.
self.addEventListener('periodicsync', event => {
  if (event.tag === 'bloom-reminder-check') {
    event.waitUntil(checkAndNotify());
  }
});

// Fallback for browsers/situations without periodic sync: a one-off sync
// requested by the page right before it would otherwise be backgrounded.
self.addEventListener('sync', event => {
  if (event.tag === 'bloom-reminder-check-once') {
    event.waitUntil(checkAndNotify());
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(list => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow('./index.html');
    })
  );
});
