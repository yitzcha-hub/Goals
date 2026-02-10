const CACHE_NAME = 'goal-tracker-v2';
const urlsToCache = [
  '/manifest.json',
  '/placeholder.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isApi = url.pathname.startsWith('/api/');

  if (isApi) {
    // API: network only; on failure return 503 so the promise doesn't reject (avoids uncaught in SW)
    event.respondWith(
      fetch(event.request).catch(function () {
        return new Response(JSON.stringify({ error: 'Network error' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    return;
  }

  // Document/navigation requests: always try network first so updates are visible on refresh.
  // Fall back to cache only when offline (keeps offline support).
  const isDocument = event.request.mode === 'navigate' || event.request.destination === 'document';
  if (isDocument) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match('/index.html').then((r) => r || caches.match('/')))
    );
    return;
  }

  // Static assets: cache-first for performance, then network
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const requestUrl = event.request.url;
          if (requestUrl.startsWith('http://') || requestUrl.startsWith('https://')) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(event.request, responseToCache))
              .catch(() => {});
          }
          return response;
        });
      })
      .catch(() => {
        return caches.match('/index.html');
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body || 'You have a goal reminder!',
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    vibrate: [200, 100, 200],
    tag: data.tag || 'goal-reminder',
    data: {
      url: data.url || '/',
      goalId: data.goalId,
      habitId: data.habitId,
      type: data.type || 'general'
    },
    actions: [
      { action: 'view', title: 'View' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'Goal Reminder', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const notificationData = event.notification.data;
  let targetUrl = '/';
  
  if (event.action === 'dismiss') {
    return;
  }
  
  if (notificationData.goalId) {
    targetUrl = `/?goal=${notificationData.goalId}`;
  } else if (notificationData.habitId) {
    targetUrl = `/?habit=${notificationData.habitId}`;
  } else if (notificationData.url) {
    targetUrl = notificationData.url;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let client of clientList) {
        if (client.url === new URL(targetUrl, self.location.origin).href && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

