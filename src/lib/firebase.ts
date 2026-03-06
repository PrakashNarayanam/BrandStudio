// ─────────────────────────────────────────────────────────────────────────────
// Firebase – SERVICES DISABLED
// All Firebase services (Auth, Firestore, Analytics) have been intentionally
// disabled. API keys have been removed.  To re-enable, restore the original
// firebaseConfig object and import.meta.env references.
// ─────────────────────────────────────────────────────────────────────────────

import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { Analytics } from 'firebase/analytics';
import type { GoogleAuthProvider } from 'firebase/auth';

// Always reports "not configured" so the rest of the app gracefully degrades
export const isFirebaseConfigured = false;

export const auth: Auth | null = null;
export const db: Firestore | null = null;
export const googleProvider: GoogleAuthProvider | null = null;
export const analytics: Analytics | null = null;
