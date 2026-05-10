importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey:            "#API KEY#",
  authDomain:        "sas-schoolmanagement-software.firebaseapp.com",
  projectId:         "sas-schoolmanagement-software",
  storageBucket:     "sas-schoolmanagement-software.firebasestorage.app",
  messagingSenderId: "1008895936440",
  appId:             "1:1008895936440:web:409daa4974271b6ce9f14d"
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage(payload => {
  console.log('Background message:', payload);
});