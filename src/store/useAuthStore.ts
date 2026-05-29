/**
 * @file useAuthStore.ts
 * @description Zustand Store luring pengelola status kredensial autentikasi pengguna secara aman menggunakan IndexedDB (idb-keyval) untuk proteksi perutean (routing guard) berkinerja nol-latensi.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get, set as idbSet, del } from "idb-keyval";

// ==========================================
// ANTARMUKA STATE
// ==========================================
/**
 * Mengelola status autentikasi pengguna secara luring dan daring.
 */
interface AuthState {
  isAuthenticated: boolean;
  setAuth: (isAuthenticated: boolean) => void;
  resetAuth: () => void;
}

// ==========================================
// ZUSTAND STORE UTAMA
// ==========================================
/**
 * Zustand Store untuk memantau status sesi masuk pengguna secara zero-latency di peramban.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Status autentikasi awal adalah false sebelum berhasil login/memulihkan sesi
      isAuthenticated: false,
      // Mengubah status autentikasi pengguna saat login/logout sukses
      setAuth: (isAuthenticated) => set({ isAuthenticated }),
      // Reset status autentikasi kembali ke tamu/guest
      resetAuth: () => set({ isAuthenticated: false }),
    }),
    {
      name: "nihongoroute_auth_data",
      storage: createJSONStorage(() => ({
        // Membaca status autentikasi dari IndexedDB
        getItem: async (name) => (await get(name)) ?? null,
        // Menyimpan status autentikasi ke IndexedDB
        setItem: async (name, value) => await idbSet(name, value),
        // Menghapus status autentikasi dari IndexedDB
        removeItem: async (name) => await del(name),
      })),
      // Hanya menyimpan status isAuthenticated ke penyimpanan lokal untuk menjaga keamanan data
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
    }
  )
);
