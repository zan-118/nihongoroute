"use client";

/**
 * @file useCachedAudio.ts
 * @description Hook offline-first untuk audio.
 *
 * Strategi:
 * - Kembalikan URL asli agar <audio> bisa pakai HTTP Range requests
 *   (blob URL tidak support Range → ERR_REQUEST_RANGE_NOT_SATISFIABLE)
 * - Prefetch ke CacheStorage dijadwalkan saat window idle / setelah load
 *   agar tidak memicu "preloaded but not used" browser warning
 */

import { useEffect } from "react";

// requestIdleCallback tidak ada di semua env TypeScript — deklarasi manual
const idleCb: ((cb: () => void, opts?: { timeout: number }) => number) | undefined =
  typeof window !== "undefined" ? (window as Window & { requestIdleCallback?: typeof idleCb }).requestIdleCallback : undefined;

const cancelIdleCb: ((id: number) => void) | undefined =
  typeof window !== "undefined" ? (window as Window & { cancelIdleCallback?: typeof cancelIdleCb }).cancelIdleCallback : undefined;

// ── Batasi ukuran cache FIFO ─────────────────────────────────
const limitCacheSize = async (cacheName: string, maxItems: number) => {
  try {
    if (typeof window === "undefined" || !("caches" in window)) return;
    const cache = await caches.open(cacheName);
    if (typeof cache.keys !== "function") return;
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      for (let i = 0; i < keys.length - maxItems; i++) {
        await cache.delete(keys[i]);
      }
    }
  } catch { /* non-critical */ }
};

// ── Hook utama ───────────────────────────────────────────────
export function useCachedAudio(src: string | undefined): string | undefined {
  useEffect(() => {
    if (!src || typeof window === "undefined" || !("caches" in window)) return;

    let cancelled = false;
    const cacheName = "nihongoroute_audio_cache";

    const prefetch = async () => {
      if (cancelled) return;
      try {
        const cache = await caches.open(cacheName);
        if (await cache.match(src)) return; // Sudah ada
        const res = await fetch(src, { credentials: "omit" });
        if (!res.ok || cancelled) return;
        await cache.put(src, res);
        await limitCacheSize(cacheName, 50);
      } catch { /* prefetch gagal — audio tetap diputar dari remote */ }
    };

    let timerId: ReturnType<typeof setTimeout> | number | undefined;

    if (document.readyState === "complete") {
      // Sudah loaded — jadwalkan saat idle
      if (idleCb) {
        timerId = idleCb(() => prefetch(), { timeout: 5000 });
        return () => { cancelled = true; cancelIdleCb?.(timerId as number); };
      } else {
        timerId = setTimeout(prefetch, 2000);
        return () => { cancelled = true; clearTimeout(timerId as ReturnType<typeof setTimeout>); };
      }
    } else {
      // Tunggu window load
      const onLoad = () => prefetch();
      window.addEventListener("load", onLoad, { once: true });
      return () => { cancelled = true; window.removeEventListener("load", onLoad); };
    }
  }, [src]);

  // Kembalikan URL asli — bukan blob URL
  return src;
}
