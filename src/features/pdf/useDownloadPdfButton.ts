/**
 * @file useDownloadPdfButton.ts
 * @description Hook kustom untuk melacak status pemasangan (mounted status) komponen tombol PDF di sisi klien.
 * Mencegah masalah hidrasi (hydration mismatch) dengan memastikan kode hanya dijalankan setelah terpasang di browser.
 *
 * @package components/features/pdf
 * @project NihongoRoute
 */

// IMPOR

import { useState, useEffect } from "react";

// HOOK UTAMA

/**
 * Track mount state. Prevent hydration mismatch.
 * 
 * @returns Object containing mount status.
 */
export function useDownloadPdfButton() {
 // Track client mount status.
 const [isMounted, setIsMounted] = useState(false);

 useEffect(() => {
 // Defer state update to next frame. Avoid layout thrashing.
 const frame = requestAnimationFrame(() => setIsMounted(true));
 // Cancel frame on unmount. Prevent memory leak.
 return () => cancelAnimationFrame(frame);
 }, []);

 return { isMounted };
}