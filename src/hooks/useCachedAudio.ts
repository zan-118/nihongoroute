"use client";

/**
 * @file useCachedAudio.ts
 * @description Hook kustom offline-first untuk memuat berkas audio dari CacheStorage lokal peramban. Mengunduh berkas audio dari remote URL, menyimpannya di cache peramban dengan kapasitas FIFO terbatas, dan merendernya via Blob URL untuk performa tanpa latensi.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { useState, useEffect } from "react";

// ==========================================
// FUNGSI PEMBANTU (HELPERS)
// ==========================================
/**
 * Membatasi ukuran Web Cache Storage menggunakan logika native FIFO (First-In, First-Out).
 * Mengurutkan kunci cache berdasarkan urutan penyisipan dan menghapus item tertua saat melebihi batas maksimum.
 * 
 * @param {string} cacheName - Nama storage cache tujuan
 * @param {number} maxItems - Jumlah maksimal berkas audio yang boleh disimpan
 */
const limitCacheSize = async (cacheName: string, maxItems: number) => {
  try {
    if (typeof window === "undefined" || !("caches" in window)) return;
    const cache = await caches.open(cacheName);
    // Pemeriksaan defensif untuk lingkungan pengujian unit (mocks) dengan implementasi API tidak lengkap
    if (typeof cache.keys !== "function") return; 
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      const excess = keys.length - maxItems;
      for (let i = 0; i < excess; i++) {
        await cache.delete(keys[i]);
      }
    }
  } catch (err) {
    console.warn("Gagal merampingkan cache audio:", err);
  }
};

// ==========================================
// CUSTOM HOOK UTAMA
// ==========================================
/**
 * Hook kustom untuk memuat dan meng-cache audio lokal agar bisa diakses secara luring.
 * 
 * @param {string | undefined} src - Sumber URL berkas audio jarak jauh
 * @returns {string | undefined} Tautan berkas audio lokal ter-cache (blob URL) atau remote URL asli sebagai fallback
 */
export function useCachedAudio(src: string | undefined): string | undefined {
  const [cachedUrl, setCachedUrl] = useState<string | undefined>(src);

  useEffect(() => {
    if (!src) {
      requestAnimationFrame(() => {
        setCachedUrl(undefined);
      });
      return;
    }

    let isMounted = true;
    let localBlobUrl: string | null = null;

    const cacheName = "nihongoroute_audio_cache";

    const fetchAndCache = async () => {
      try {
        const response = await fetch(src);
        if (!response.ok) throw new Error("Gagal mengunduh berkas audio");

        const clonedResponse = response.clone();
        const blob = await response.blob();

        if ("caches" in window) {
          try {
            const cache = await caches.open(cacheName);
            await cache.put(src, clonedResponse);
            // Batasi ukuran cache maksimal 50 item menggunakan logika native FIFO
            await limitCacheSize(cacheName, 50);
          } catch (err) {
            console.warn("Gagal menyimpan audio ke CacheStorage:", err);
          }
        }

        if (isMounted) {
          localBlobUrl = URL.createObjectURL(blob);
          setCachedUrl(localBlobUrl);
        }
      } catch (err) {
        console.warn("Gagal fetch audio, fallback ke URL asli:", err);
        if (isMounted) {
          setCachedUrl(src);
        }
      }
    };

    const checkCache = async () => {
      if ("caches" in window) {
        try {
          const cache = await caches.open(cacheName);
          const cachedResponse = await cache.match(src);
          if (cachedResponse) {
            const blob = await cachedResponse.blob();
            if (isMounted) {
              localBlobUrl = URL.createObjectURL(blob);
              setCachedUrl(localBlobUrl);
            }
            return;
          }
        } catch (err) {
          console.warn("Gagal membaca CacheStorage audio:", err);
        }
      }
      // Jika tidak ada di cache, unduh dan simpan ke cache
      await fetchAndCache();
    };

    checkCache();

    return () => {
      isMounted = false;
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
    };
  }, [src]);

  return cachedUrl;
}
