/* eslint-disable no-undef */
/* global firebase, importScripts, self */

// ── Firebase Service Worker ───────────────────────────────────────────────────
// Place this file in: public/firebase-messaging-sw.js
// DO NOT move it inside src/ — it must be served from the root URL
// ─────────────────────────────────────────────────────────────────────────────

importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "AIzaSyA2-IW_ouVfJyHiLXoNK9TV3RLOHbgh-BM",
  authDomain:        "sas-schoolmanagement-software.firebaseapp.com",
  projectId:         "sas-schoolmanagement-software",
  storageBucket:     "sas-schoolmanagement-software.firebasestorage.app",
  messagingSenderId: "1008895936440",
  appId:             "1:1008895936440:web:409daa4974271b6ce9f14d"
});

const messaging = firebase.messaging();

// Handle notifications when the app is in the BACKGROUND or CLOSED
messaging.onBackgroundMessage(payload => {
  console.log('[SW] Background message received:', payload);

  const { title = 'School Notification', body = '' } = payload.notification ?? {};

  self.registration.showNotification(title, {
    body,
    icon:  '/logo.png',
    badge: '/logo.png',
    data:  payload.data,
  });
});