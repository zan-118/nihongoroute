/**
 * @file useStoreHydration.ts
 * @description Offline-first custom hook tracking the hydration process of local Zustand state from browser IndexedDB to active memory.
 * Prevents race conditions during cloud synchronization before local storage is fully restored.
 */

// ==========================================
// Import & Dependencies
// ==========================================
import { useState, useEffect } from "react";

// ==========================================
// Internal Interfaces
// ==========================================
/**
 * Minimal interface representing a Zustand store configured with persist middleware.
 */
interface ZustandPersistStore {
 persist?: {
 /** Checks if the store has completed hydration. */
 hasHydrated: () => boolean;
 /** Registers a listener for hydration completion. */
 onFinishHydration: (fn: () => void) => () => void;
 };
}

// ==========================================
// Main Custom Hook
// ==========================================
/**
 * Custom hook to track the hydration status of a persisted Zustand store.
 * Prevents race conditions by ensuring local state is fully loaded.
 * 
 * @param store - The Zustand store to monitor.
 * @returns True if the store has finished hydrating, false otherwise.
 */
export function useStoreHydration(store: ZustandPersistStore) {
 const [hydrated, setHydrated] = useState(false);

 useEffect(() => {
 // If store has no persist middleware, treat as hydrated immediately
 if (!store?.persist) {
 // eslint-disable-next-line react-hooks/set-state-in-effect
 setHydrated(true);
 return;
 }

 // Jika store sudah terhidrasi, set true secara instan
 // Check current hydration status to avoid unnecessary subscription
 if (store.persist.hasHydrated()) {
 setHydrated(true);
 return;
 }

 // Jika belum terhidrasi, daftarkan callback untuk mendengarkan selesainya hidrasi
 // Subscribe to hydration finish event and store unsubscribe function
 const unsub = store.persist.onFinishHydration(() => {
 setHydrated(true);
 });

 // Clean up subscription on store change or unmount
 return unsub;
 }, [store]);

 return hydrated;
}