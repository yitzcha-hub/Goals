// Firebase Cloud Messaging - Service Worker
// Must be at /firebase-messaging-sw.js (public folder root)

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Authenticity and Purpose - Firebase config (must match src/lib/firebase.ts)
firebase.initializeApp({
  apiKey: 'AIzaSyB5DFrkjolSKUCdx08Peq-GiZ55UEAKpIo',
  authDomain: 'goals-and-development.firebaseapp.com',
  projectId: 'goals-and-development',
  storageBucket: 'goals-and-development.firebasestorage.app',
  messagingSenderId: '22247220733',
  appId: '1:22247220733:web:09d6e864d01aa650dbe594',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'Goal Reminder';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a goal reminder!',
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    tag: payload.data?.tag || 'goal-reminder',
    data: payload.data || {},
    requireInteraction: false,
    actions: [{ action: 'open', title: 'Open' }],
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.navigate(urlToOpen).then((c) => c && c.focus());
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
