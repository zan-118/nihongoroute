"use client";

import { useState, useEffect } from "react";

/**
 * Helper function to limit the size of Web Cache Storage using native FIFO logic.
 * Orders cached keys by insertion sequence and deletes the oldest items when exceeding maxItems.
 */
const limitCacheSize = async (cacheName: string, maxItems: number) => {
  try {
    if (typeof window === "undefined" || !("caches" in window)) return;
    const cache = await caches.open(cacheName);
    if (typeof cache.keys !== "function") return; // Defensive check for test environments with incomplete mocks
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

/**
 * @file useCachedAudio.ts
 * @description Hook untuk memuat audio secara offline-first dengan CacheStorage lokal.
 * Mengunduh berkas audio dari remote URL, menyimpannya di cache, dan merendernya via Blob URL.
 */
export function useCachedAudio(src: string | undefined): string | undefined {
  const [cachedUrl, setCachedUrl] = useState<string | undefined>(src);

  useEffect(() => {
    if (!src) {
      setCachedUrl(undefined);
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
            // Limit cache size to 50 items using native FIFO
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
