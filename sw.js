'use strict';
/* Bloom service worker — offline app shell + best-effort background reminders.
   Reads mirrored reminder state from IndexedDB (service workers can't see
   the page's localStorage), since periodicsync can fire with no page open. */

const CACHE = 'bloom-shell-v4';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-512-maskable.png'];

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

// Network-first so app updates arrive on the next load; cache keeps it working offline.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then(res => {
        if (res.ok && new URL(event.request.url).origin === self.location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(event.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
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
    const req = db.transaction('state', 'readonly').objectStore('state').get('reminder');
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  })).catch(() => null);
}
const pad = n => String(n).padStart(2, '0');
function todayStrNow() {
  const d = new Date();
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}
const SLOT_LABELS = ['morning', 'afternoon', 'evening'];
const slotOf = h => h < 12 ? 0 : h < 17 ? 1 : 2;

async function checkAndNotify() {
  const st = await getReminderState();
  if (!st) return;
  const h = new Date().getHours();
  const isToday = st.today === todayStrNow();

  if (st.remind && h >= st.whStart && h < st.whEnd) {
    const doneHours = isToday ? (st.doneHours || []) : [];
    if (!doneHours.includes(h)) {
      await self.registration.showNotification('Bloom — eye break time', {
        body: 'A gentle break is due this hour. Five short exercises, about five minutes.',
        icon: 'icon-192.png', badge: 'icon-192.png', tag: 'bloom-reminder'
      });
    }
  }

  if (st.sRemind && Array.isArray(st.sTimes)) {
    const i = slotOf(h);
    const doneSlots = isToday ? (st.sDoneSlots || []) : [];
    if (h >= st.sTimes[i] && !doneSlots.includes(i)) {
      await self.registration.showNotification('Bloom — shoulder session', {
        body: `Your ${SLOT_LABELS[i]} session: 3 gentle exercises, about 5 minutes.`,
        icon: 'icon-192.png', badge: 'icon-192.png', tag: 'bloom-shoulder'
      });
    }
  }

  if (st.hRemind && h >= st.hTime && !(isToday && st.hTouched)) {
    await self.registration.showNotification('Bloom — habit check-in', {
      body: "Take 10 seconds to log today's habits.",
      icon: 'icon-192.png', badge: 'icon-192.png', tag: 'bloom-habits'
    });
  }
}

// Only for installed PWAs on Chrome/Edge, and only once the browser's own
// engagement heuristics grant it — no user prompt exists for this permission.
self.addEventListener('periodicsync', event => {
  if (event.tag === 'bloom-reminder-check') event.waitUntil(checkAndNotify());
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
