/**
 * @file env.ts
 * @description Konfigurasi variabel lingkungan untuk koneksi ke Sanity CMS.
 * Memastikan semua variabel yang diperlukan tersedia sebelum aplikasi berjalan.
 * @module sanity/env
 */

// ======================
// CONFIGURATION
// ======================

/**
 * Versi API Sanity yang digunakan.
 */
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-04-01";

/**
 * Dataset target (contoh: 'production').
 */
export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET",
);

/**
 * ID Proyek Sanity.
 */
export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID",
);

/**
 * Pengaturan CDN. 
 * Diset ke 'false' agar data selalu fresh (tidak di-cache) saat dipanggil dari Next.js.
 */
export const useCdn = false;

// ======================
// HELPER FUNCTIONS
// ======================

/**
 * Memastikan nilai variabel lingkungan tersedia.
 * 
 * @param {T | undefined} v - Nilai yang akan diperiksa.
 * @param {string} errorMessage - Pesan error jika nilai hilang.
 * @returns {T} Nilai yang valid.
 * @throws {Error} Jika nilai undefined.
 */
function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }
  return v;
}
