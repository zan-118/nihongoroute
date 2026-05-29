/**
 * @file useStoreHydration.ts
 * @description Hook kustom offline-first pengontrol pelacakan proses pemulihan (hydration) data lokal Zustand dari IndexedDB peramban ke memori aktif. Mencegah kondisi balapan (race condition) pengambilan data awan sebelum data lokal termuat seutuhnya.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { useState, useEffect } from "react";

// ==========================================
// ANTARMUKA INTERNAL
// ==========================================
/** Interface minimal untuk melacak Zustand store yang menggunakan middleware persist */
interface ZustandPersistStore {
  persist?: {
    hasHydrated: () => boolean;
    onFinishHydration: (fn: () => void) => () => void;
  };
}

// ==========================================
// CUSTOM HOOK UTAMA
// ==========================================
/**
 * Hook kustom untuk mengamati status hidrasi state persisten Zustand.
 * 
 * @param {ZustandPersistStore} store - Zustand store persisten yang akan dipantau
 * @returns {boolean} True jika store persisten telah selesai dimuat dari IndexedDB
 */
export function useStoreHydration(store: ZustandPersistStore) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!store?.persist) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHydrated(true);
      return;
    }

    // Jika store sudah terhidrasi, set true secara instan
    if (store.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    // Jika belum terhidrasi, daftarkan callback untuk mendengarkan selesainya hidrasi
    const unsub = store.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    return unsub;
  }, [store]);

  return hydrated;
}
