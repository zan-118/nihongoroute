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
 * Hook kustom untuk mendeteksi status pemasangan (hydration) komponen di lingkungan klien.
 * 
 * @returns {boolean} True jika komponen telah terpasang di sisi klien
 */
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasMounted(true);
  }, []);

  return hasMounted;
}
