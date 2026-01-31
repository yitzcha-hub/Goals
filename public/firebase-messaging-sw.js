importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBXqwKpQs5vGHxH8vZ9YqJxK7LmN3PqRsT",
  authDomain: "depo-goal-tracker.firebaseapp.com",
  projectId: "depo-goal-tracker",
  storageBucket: "depo-goal-tracker.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification?.title || 'Goal Reminder';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a goal reminder!',
    icon: '/placeholder.svg',
    badge: '/placeholder.svg',
    data: payload.data || {}
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});
