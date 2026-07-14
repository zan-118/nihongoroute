"use client";

/**
 * @file useHasMounted.ts
 * @description Hook kustom utilitas untuk memverifikasi apakah komponen React telah terpasang (mounted) seutuhnya di sisi klien (browser). Berguna mencegah inkonsistensi hidrasi (Hydration Mismatch) pada server-side rendering (SSR) Next.js.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { useState, useEffect } from "react";

// ==========================================
// CUSTOM HOOK UTAMA
// ==========================================
/**
 * Track component mount status.
 * Prevents hydration mismatch in SSR.
 * 
 * @returns {boolean} True if component mounted on client.
 */
export function useHasMounted() {
  // State tracks mount status. Initial false for SSR.
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // Trigger state update after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);
  }, []);

  return hasMounted;
}