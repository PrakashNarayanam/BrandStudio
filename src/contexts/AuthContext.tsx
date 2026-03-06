import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    User,
    AuthError,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';

interface AuthContextValue {
    user: User | null;
    loading: boolean;
    isConfigured: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    error: string;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(isFirebaseConfigured); // only show loading if Firebase is set up
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isFirebaseConfigured || !auth) {
            setLoading(false);
            return;
        }
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setLoading(false);
        });
        return unsub;
    }, []);

    const friendly = (err: AuthError) => {
        switch (err.code) {
            case 'auth/user-not-found': return 'No account found with this email.';
            case 'auth/wrong-password': return 'Incorrect password. Please try again.';
            case 'auth/email-already-in-use': return 'An account with this email already exists.';
            case 'auth/weak-password': return 'Password must be at least 6 characters.';
            case 'auth/invalid-email': return 'Please enter a valid email address.';
            case 'auth/popup-closed-by-user': return 'Google sign-in was cancelled.';
            case 'auth/network-request-failed': return 'Network error. Check your connection.';
            case 'auth/invalid-credential': return 'Invalid credentials. Please check and retry.';
            default: return err.message || 'Something went wrong.';
        }
    };

    const notConfigured = () => {
        setError('Authentication service is currently unavailable due to technical issues. Please try again later.');
    };

    const signInWithGoogle = async () => {
        if (!isFirebaseConfigured || !auth || !googleProvider) { notConfigured(); return; }
        try {
            setError('');
            await signInWithPopup(auth, googleProvider);
        } catch (e) { setError(friendly(e as AuthError)); }
    };

    const signInWithEmail = async (email: string, password: string) => {
        if (!isFirebaseConfigured || !auth) { notConfigured(); return; }
        try {
            setError('');
            await signInWithEmailAndPassword(auth, email, password);
        } catch (e) { setError(friendly(e as AuthError)); }
    };

    const signUpWithEmail = async (name: string, email: string, password: string) => {
        if (!isFirebaseConfigured || !auth) { notConfigured(); return; }
        try {
            setError('');
            const cred = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(cred.user, { displayName: name });
            setUser({ ...cred.user, displayName: name } as User);
        } catch (e) { setError(friendly(e as AuthError)); }
    };

    const logout = async () => {
        if (!auth) return;
        await signOut(auth);
    };

    const clearError = () => setError('');

    return (
        <AuthContext.Provider value={{
            user, loading, isConfigured: isFirebaseConfigured,
            signInWithGoogle, signInWithEmail, signUpWithEmail,
            logout, error, clearError,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
