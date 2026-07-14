"use client";

/**
 * Hook kustom untuk memuat dan meng-cache audio secara luring (offline-first).
 * Mengunduh berkas audio dari remote URL, menyimpannya di CacheStorage peramban,
 * dan merendernya via Blob URL untuk performa pemutaran audio tanpa latensi.
 *
 * @param {string | undefined} src - Sumber URL berkas audio jarak jauh.
 * @returns {string | undefined} Tautan berkas audio lokal ter-cache (Blob URL) atau remote URL asli sebagai fallback.
 * @sideEffects Mengakses CacheStorage dan URL.createObjectURL/revokeObjectURL.
 * @zustandStores Tidak mengakses store Zustand global.
 */

import { useState, useEffect } from "react";

/** Safe reference to window.requestIdleCallback. */
const idleCb: ((cb: () => void, opts?: { timeout: number }) => number) | undefined =
  typeof window !== "undefined" ? (window as Window & { requestIdleCallback?: typeof idleCb }).requestIdleCallback : undefined;

/** Safe reference to window.cancelIdleCallback. */
const cancelIdleCb: ((id: number) => void) | undefined =
  typeof window !== "undefined" ? (window as Window & { cancelIdleCallback?: typeof cancelIdleCb }).cancelIdleCallback : undefined;

/**
 * Enforces FIFO limit on CacheStorage items.
 * 
 * @param cacheName - Target cache identifier.
 * @param maxItems - Maximum allowed items.
 */
const limitCacheSize = async (cacheName: string, maxItems: number) => {
  try {
    // Prevent execution during SSR or if Cache API is unsupported
    if (typeof window === "undefined" || !("caches" in window)) return;
    const cache = await caches.open(cacheName);
    if (typeof cache.keys !== "function") return;
    const keys = await cache.keys();
    // Remove oldest entries if limit exceeded
    if (keys.length > maxItems) {
      for (let i = 0; i < keys.length - maxItems; i++) {
        await cache.delete(keys[i]);
      }
    }
  } catch { /* non-critical */ }
};

/**
 * Hook to load and cache audio files offline-first.
 * Downloads remote audio, stores in CacheStorage, and returns Blob URL.
 * 
 * @param src - Remote audio source URL.
 * @returns Cached local Blob URL or original remote URL fallback.
 */
export function useCachedAudio(src: string | undefined): string | undefined {
  const [prevSrc, setPrevSrc] = useState<string | undefined>(src);
  const [cachedUrl, setCachedUrl] = useState<string | undefined>(src);

  // Reset state immediately if source URL changes
  if (src !== prevSrc) {
    setPrevSrc(src);
    setCachedUrl(src);
  }

  useEffect(() => {
    if (!src || typeof window === "undefined") {
      return;
    }

    let cancelled = false;
    let localBlobUrl: string | null = null;
    const cacheName = "nihongoroute_audio_cache";

    /**
     * Resolves audio source from cache or fetches from remote.
     */
    const loadAudio = async () => {
      try {
        // Fallback to remote URL if Cache API is missing
        if (!("caches" in window)) {
          if (!cancelled) setCachedUrl(src);
          return;
        }

        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(src);

        // Return cached blob if hit
        if (cachedResponse) {
          const blob = await cachedResponse.blob();
          if (!cancelled) {
            localBlobUrl = URL.createObjectURL(blob);
            setCachedUrl(localBlobUrl);
          }
          return;
        }

        // Fetch from remote on cache miss
        const res = await fetch(src);
        if (!res.ok) throw new Error("Gagal mengunduh berkas audio");

        const resClone = res.clone();
        const blob = await res.blob();

        try {
          // Save clone to cache and enforce size limit
          await cache.put(src, resClone);
          await limitCacheSize(cacheName, 50);
        } catch (err) {
          console.warn("Gagal menyimpan audio ke CacheStorage:", err);
        }

        if (!cancelled) {
          localBlobUrl = URL.createObjectURL(blob);
          setCachedUrl(localBlobUrl);
        }
      } catch (err) {
        console.warn("Gagal memuat cached audio, fallback ke URL asli:", err);
        if (!cancelled) {
          setCachedUrl(src);
        }
      }
    };
    loadAudio();

    // Clean up local object URL on unmount or source change
    return () => {
      cancelled = true;
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
    };
  }, [src]);

  return cachedUrl;
}