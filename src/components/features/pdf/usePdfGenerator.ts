/**
 * @file usePdfGenerator.ts
 * @description Hook kustom untuk melacak status rendering mesin PDF di sisi klien
 * serta menghasilkan nama file PDF dinamis berdasarkan jenis template, judul, level, dan stempel waktu.
 *
 * @package components/features/pdf
 * @project NihongoRoute
 */

// ==========================================
// IMPOR
// ==========================================
import { useState, useEffect } from "react";
import { TemplateType } from "./PdfGenerator";

// ==========================================
// ANTARMUKA (INTERFACES)
// ==========================================
interface UsePdfGeneratorProps {
  type: TemplateType;
  title?: string;
  level?: string;
}

// ==========================================
// HOOK UTAMA
// ==========================================
/**
 * Hook usePdfGenerator
 * Mengelola logic klien dan pembuatan nama file hasil unduhan PDF.
 *
 * @param props Parameter tipe, judul, dan tingkat pembelajaran
 * @returns Status rendering klien (isClient) dan fungsi getFileName
 */
export function usePdfGenerator({ type, title, level }: UsePdfGeneratorProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsClient(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  /**
   * Menghasilkan nama berkas PDF yang sesuai dan dinamis.
   * @returns Nama berkas dalam format string
   */
  const getFileName = () => {
    if (title) return `${title}_NihongoRoute.pdf`;
    const timestamp = new Date()
      .toLocaleDateString("id-ID")
      .replace(/\//g, "-");

    if (type === "vocab")
      return `ListKosakata_${level || "All"}_${timestamp}.pdf`;
    return `Materi_NihongoRoute_${timestamp}.pdf`;
  };

  return { isClient, getFileName };
}

