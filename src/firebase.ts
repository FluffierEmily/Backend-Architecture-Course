import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const hasRequiredConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.appId);

export const app: FirebaseApp | null = hasRequiredConfig
  ? initializeApp(firebaseConfig)
  : null;

export const analyticsPromise: Promise<Analytics | null> = app
  ? isSupported()
      .then((supported) => (supported ? getAnalytics(app) : null))
      .catch(() => null)
  : Promise.resolve(null);
