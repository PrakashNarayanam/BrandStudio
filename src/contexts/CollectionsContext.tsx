import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
    collection, query, where, orderBy,
    onSnapshot, addDoc, deleteDoc, doc,
    serverTimestamp, updateDoc
} from 'firebase/firestore';
import { SavedItem } from '../types';

interface CollectionsContextValue {
    items: SavedItem[];
    loading: boolean;
    saveItem: (item: Omit<SavedItem, 'id' | 'userId' | 'timestamp'>) => Promise<void>;
    removeItem: (id: string) => Promise<void>;
    syncLocalToCloud: () => Promise<void>;
}

const CollectionsContext = createContext<CollectionsContextValue | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'brandcraft_collections';

export const CollectionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [items, setItems] = useState<SavedItem[]>([]);
    const [loading, setLoading] = useState(true);

    // 1. Initial Load from LocalStorage
    useEffect(() => {
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
            try {
                setItems(JSON.parse(localData));
            } catch (e) {
                console.error("Local storage parse error", e);
            }
        }
        if (!user) setLoading(false);
    }, [user]);

    // 2. Sync with Firestore if logged in
    useEffect(() => {
        if (!user || !db) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const q = query(
            collection(db, 'collections'),
            where('userId', '==', user.uid),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const cloudItems = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            })) as SavedItem[];

            setItems(cloudItems);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudItems));
            setLoading(false);
        }, (err) => {
            console.error("Firestore sync error", err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // 3. Save Item logic
    const saveItem = useCallback(async (baseItem: Omit<SavedItem, 'id' | 'userId' | 'timestamp'>) => {
        const timestamp = Date.now();
        const id = Math.random().toString(36).substr(2, 9); // Temporary ID for local

        if (user && db) {
            // Save to Cloud
            await addDoc(collection(db, 'collections'), {
                ...baseItem,
                userId: user.uid,
                timestamp: timestamp
            });
            // Firestore onSnapshot will update local state and localStorage
        } else {
            // Save only to LocalStorage
            const newItem: SavedItem = {
                ...baseItem,
                id,
                userId: 'guest',
                timestamp
            };
            const updated = [newItem, ...items];
            setItems(updated);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        }
    }, [user, items]);

    // 4. Remove Item logic
    const removeItem = useCallback(async (id: string) => {
        if (user && db) {
            // Cloud removal
            try {
                await deleteDoc(doc(db, 'collections', id));
            } catch (e) {
                // If it failed, maybe it was a local-only item that didn't sync yet?
                const updated = items.filter(i => i.id !== id);
                setItems(updated);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
            }
        } else {
            // Local removal
            const updated = items.filter(i => i.id !== id);
            setItems(updated);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        }
    }, [user, items]);

    // 5. Sync Local (Guest) data to Cloud upon login
    const syncLocalToCloud = useCallback(async () => {
        if (!user || !db) return;

        const localItems = items.filter(i => i.userId === 'guest');
        if (localItems.length === 0) return;

        for (const item of localItems) {
            const { id, ...rest } = item;
            await addDoc(collection(db, 'collections'), {
                ...rest,
                userId: user.uid,
                timestamp: item.timestamp
            });
        }
        // The onSnapshot will eventually refresh everything
    }, [user, items]);

    return (
        <CollectionsContext.Provider value={{ items, loading, saveItem, removeItem, syncLocalToCloud }}>
            {children}
        </CollectionsContext.Provider>
    );
};

export const useCollections = () => {
    const context = useContext(CollectionsContext);
    if (!context) throw new Error('useCollections must be used within CollectionsProvider');
    return context;
};
