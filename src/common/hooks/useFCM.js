// src/common/hooks/useFCM.js
//
// ⚡ USAGE:  Call this ONLY from inside useAuth (AuthProvider).
//           Do NOT call useFCM() directly in any Dashboard/page.
//           It auto-runs for every role as soon as the user logs in.
//
import { useEffect, useRef } from 'react';
import { messaging, getToken, onMessage, VAPID_KEY } from '../services/firebase';
import API from '../services/api';

/**
 * @param {object|null} user  – the `user` object from AuthContext.
 *                              When user is null (logged out) the hook cleans up.
 */
export function useFCM(user) {
  const initialized = useRef(false);

  useEffect(() => {
    // ── Reset when user logs out ──────────────────────────────────
    if (!user) {
      initialized.current = false;   // allow re-init on next login
      return;
    }

    // ── Run only once per login session ──────────────────────────
    if (initialized.current) return;
    initialized.current = true;

    async function setup() {
      try {
        // 1. Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('FCM: Notification permission denied by user');
          return;
        }

        // 2. Register Firebase service worker
        const swReg = await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js'
        );
        await navigator.serviceWorker.ready;

        // 3. Get FCM token
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swReg,
        });

        if (!token) {
          console.warn('FCM: Could not get token');
          return;
        }

        console.log('FCM Token obtained:', token.substring(0, 20) + '...');

        // 4. Register token with backend (sends userId + role automatically
        //    via the Authorization header in api.js interceptor)
        await API.post('/notifications/device-token', {
          fcmToken:   token,
          platform:   'WEB',
          deviceName: navigator.userAgent.substring(0, 100),
        });

        console.log('FCM: Token registered with backend successfully');

        // 5. Listen for foreground notifications
        //    (Background notifications handled by firebase-messaging-sw.js)
        onMessage(messaging, payload => {
          console.log('FCM foreground message:', payload);
          const { title, body } = payload.notification ?? {};
          if (title && Notification.permission === 'granted') {
            new Notification(title, {
              body,
              icon: '/logo.png',
            });
          }
        });

      } catch (err) {
        console.error('FCM setup error:', err);
      }
    }

    setup();

  }, [user]); // ← re-runs whenever user changes (login / logout)
}
// // src/common/hooks/useFCM.js
// import { useEffect, useRef } from 'react';
// import { messaging, getToken, onMessage, VAPID_KEY } from '../services/firebase';
// import API from '../services/api';

// export function useFCM() {
//   const initialized = useRef(false);

//   useEffect(() => {
//     // Run only once per session
//     if (initialized.current) return;
//     initialized.current = true;

//     async function setup() {
//       try {
//         // ── 1. Request notification permission ────────────────────
//         const permission = await Notification.requestPermission();
//         if (permission !== 'granted') {
//           console.warn('FCM: Notification permission denied by user');
//           return;
//         }

//         // ── 2. Register Firebase service worker ───────────────────
//         const swReg = await navigator.serviceWorker.register(
//           '/firebase-messaging-sw.js'
//         );
//         await navigator.serviceWorker.ready;

//         // ── 3. Get FCM token ──────────────────────────────────────
//         const token = await getToken(messaging, {
//           vapidKey: VAPID_KEY,
//           serviceWorkerRegistration: swReg,
//         });

//         if (!token) {
//           console.warn('FCM: Could not get token');
//           return;
//         }

//         console.log('FCM Token obtained:', token.substring(0, 20) + '...');

//         // ── 4. Register token with backend ────────────────────────
//         await API.post('/notifications/device-token', {
//           fcmToken:   token,
//           platform:   'WEB',
//           deviceName: navigator.userAgent.substring(0, 100),
//         });

//         console.log('FCM: Token registered with backend successfully');

//         // ── 5. Listen for foreground notifications ────────────────
//         // (Background notifications handled by service worker)
//         onMessage(messaging, payload => {
//           console.log('FCM foreground message:', payload);
//           const { title, body } = payload.notification ?? {};
//           if (title && Notification.permission === 'granted') {
//             new Notification(title, {
//               body,
//               icon: '/logo.png',
//             });
//           }
//         });

//       } catch (err) {
//         console.error('FCM setup error:', err);
//       }
//     }

//     // Only run if user is logged in
//     const accessToken = localStorage.getItem('accessToken');
//     if (accessToken) {
//       setup();
//     }

//   }, []);
// }