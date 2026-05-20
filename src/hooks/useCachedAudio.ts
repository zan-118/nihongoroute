"use client";

import { useState, useEffect } from "react";

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
