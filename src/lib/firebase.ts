import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getFirestore, Firestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;
const measurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID;

export const isFirebaseConfigured = !!(apiKey && authDomain && projectId && appId);

let app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _googleProvider: GoogleAuthProvider | null = null;
let _analytics: Analytics | null = null;

if (isFirebaseConfigured) {
    try {
        app = initializeApp({
            apiKey,
            authDomain,
            projectId,
            storageBucket,
            messagingSenderId,
            appId,
            measurementId,
        });
        _auth = getAuth(app);
        _db = getFirestore(app);
        _googleProvider = new GoogleAuthProvider();

        // Analytics only works in a browser (not SSR)
        if (typeof window !== 'undefined' && measurementId) {
            _analytics = getAnalytics(app);
        }
    } catch (e) {
        console.error('[Firebase] Initialisation failed:', e);
    }
}

export const auth = _auth;
export const db = _db;
export const googleProvider = _googleProvider;
export const analytics = _analytics;

