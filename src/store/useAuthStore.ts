/**
 * @file useAuthStore.ts
 * @description Offline-first Zustand store managing user authentication state securely via IndexedDB (`idb-keyval`) for zero-latency route guards.
 */

// ==========================================
// Import & Dependencies
// ==========================================
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get, set as idbSet, del } from "idb-keyval";

// ==========================================
// State Interface & Actions
// ==========================================
/**
 * Authentication state structure.
 * Manages user authentication state offline and online.
 */
interface AuthState {
 /** User authentication status flag. */
 isAuthenticated: boolean;
 /** Set authentication status flag. */
 setAuth: (isAuthenticated: boolean) => void;
 /** Reset authentication status flag to false. */
 resetAuth: () => void;
}

// ==========================================
// ZUSTAND STORE UTAMA
// ==========================================
/**
 * Zustand store for authentication state. Persists to IndexedDB.
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
 // Custom storage engine using IndexedDB for async storage.
 storage: createJSONStorage(() => ({
 // Membaca status autentikasi dari IndexedDB
 getItem: async (name) => (await get(name)) ?? null,
 // Menyimpan status autentikasi ke IndexedDB
 setItem: async (name, value) => await idbSet(name, value),
 // Menghapus status autentikasi dari IndexedDB
 removeItem: async (name) => await del(name),
 })),
 // Hanya menyimpan status isAuthenticated ke penyimpanan lokal untuk menjaga keamanan data
 // Only persist isAuthenticated field to limit storage footprint.
 partialize: (state) => ({ isAuthenticated: state.isAuthenticated }),
 }
 )
);