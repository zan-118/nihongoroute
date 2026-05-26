import { useState, useEffect } from "react";

/** Interface minimal untuk melacak Zustand store yang menggunakan middleware persist */
interface ZustandPersistStore {
  persist?: {
    hasHydrated: () => boolean;
    onFinishHydration: (fn: () => void) => () => void;
  };
}

/**
 * Custom Hook: useStoreHydration
 * 
 * Memantau proses hidrasi asinkron dari IndexedDB ke Zustand store via middleware persist.
 * Mencegah kondisi balapan (race condition) dengan menjamin data lokal telah dimuat sepenuhnya
 * di sisi klien sebelum inisialisasi sinkronisasi cloud atau interaksi visual dimulai.
 * 
 * @param {ZustandPersistStore} store - Zustand store yang ingin dipantau status hidrasinya
 * @returns {boolean} hydrated - Status hidrasi store (true jika selesai hidrasi, false jika belum)
 */
export function useStoreHydration(store: ZustandPersistStore) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!store?.persist) {
      requestAnimationFrame(() => setHydrated(true));
      return;
    }

    // Jika store sudah terhidrasi, set true secara instan
    if (store.persist.hasHydrated()) {
      requestAnimationFrame(() => setHydrated(true));
      return;
    }

    // Jika belum terhidrasi, daftarkan callback untuk mendengarkan selesainya hidrasi
    const unsub = store.persist.onFinishHydration(() => {
      requestAnimationFrame(() => setHydrated(true));
    });

    return unsub;
  }, [store]);

  return hydrated;
}
