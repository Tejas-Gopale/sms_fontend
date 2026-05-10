// src/common/services/firebase.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey:            "AIzaSyA2-IW_ouVfJyHiLXoNK9TV3RLOHbgh-BM",
  authDomain:        "sas-schoolmanagement-software.firebaseapp.com",
  projectId:         "sas-schoolmanagement-software",
  storageBucket:     "sas-schoolmanagement-software.firebasestorage.app",
  messagingSenderId: "1008895936440",
  appId:             "1:1008895936440:web:409daa4974271b6ce9f14d",
  measurementId:     "G-EL05L7618H"
};

const app       = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const VAPID_KEY =
  'BPpmI_MdgvUeH2PrfgLPsMZBWPiPAovUZgY61_6XBAOCbuSzXWHfkKgxsX02qAkb8yrrgHB6O45x5CtpK2xa2uQ';

export { messaging, getToken, onMessage };