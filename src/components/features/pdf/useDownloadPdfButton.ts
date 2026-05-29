/**
 * @file useDownloadPdfButton.ts
 * @description Hook kustom untuk melacak status pemasangan (mounted status) komponen tombol PDF di sisi klien.
 * Mencegah masalah hidrasi (hydration mismatch) dengan memastikan kode hanya dijalankan setelah terpasang di browser.
 *
 * @package components/features/pdf
 * @project NihongoRoute
 */

// ==========================================
// IMPOR
// ==========================================
import { useState, useEffect } from "react";

// ==========================================
// HOOK UTAMA
// ==========================================
/**
 * Hook useDownloadPdfButton
 * Melacak apakah komponen telah terpasang (mounted) di sisi klien.
 *
 * @returns Status isMounted (boolean)
 */
export function useDownloadPdfButton() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return { isMounted };
}

