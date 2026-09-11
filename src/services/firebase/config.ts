import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';
import { Auth, getAuth } from 'firebase/auth';
import { FirebaseConnectionStatus } from '../../types/firebase';

const getEnv = (key: string): string => {
  return (import.meta.env as Record<string, string>)[key] || '';
};

export const defaultFirebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID'),
};

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let auth: Auth | null = null;
let initialized = false;

let connectionStatus: FirebaseConnectionStatus = {
  isConfigured: false,
  isConnected: false,
  usingFallback: true,
};

/**
 * Lazy initialize Firebase SDK on-demand.
 * Does not block Home startup or eagerly initialize services.
 */
export function ensureFirebaseInitialized(): {
  app: FirebaseApp | null;
  firestore: Firestore | null;
  storage: FirebaseStorage | null;
  auth: Auth | null;
  status: FirebaseConnectionStatus;
} {
  if (initialized) {
    return { app, firestore, storage, auth, status: connectionStatus };
  }

  initialized = true;
  const hasValidConfig = Boolean(
    defaultFirebaseConfig.apiKey &&
    defaultFirebaseConfig.projectId &&
    defaultFirebaseConfig.apiKey !== 'YOUR_API_KEY'
  );

  if (hasValidConfig) {
    try {
      app = getApps().length === 0 ? initializeApp(defaultFirebaseConfig) : getApps()[0];
      firestore = getFirestore(app);
      storage = getStorage(app);
      auth = getAuth(app);
      connectionStatus = {
        isConfigured: true,
        isConnected: true,
        usingFallback: false,
      };
    } catch (err) {
      console.warn('[Dolly Firebase] Offline fallback active:', err);
      connectionStatus = {
        isConfigured: true,
        isConnected: false,
        usingFallback: true,
        error: String(err),
      };
    }
  } else {
    connectionStatus = {
      isConfigured: false,
      isConnected: false,
      usingFallback: true,
    };
  }

  return { app, firestore, storage, auth, status: connectionStatus };
}

export function getFirebaseStatus(): FirebaseConnectionStatus {
  if (!initialized) {
    ensureFirebaseInitialized();
  }
  return connectionStatus;
}

export { app, firestore, storage, auth, connectionStatus };
