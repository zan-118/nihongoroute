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
/**
 * Properties for the usePdfGenerator hook.
 */
interface UsePdfGeneratorProps {
  /** Type of PDF template to generate. */
  type: TemplateType;
  /** Optional title of the document. */
  title?: string;
  /** Optional JLPT level or study level. */
  level?: string;
}

// ==========================================
// HOOK UTAMA
// ==========================================
/**
 * Custom hook to manage client-side PDF rendering state and generate dynamic PDF filenames.
 *
 * @param props - Configuration properties containing template type, title, and level.
 * @returns Object containing client mount status and filename generator function.
 */
export function usePdfGenerator({ type, title, level }: UsePdfGeneratorProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Delay setting client state to next animation frame to prevent hydration mismatch.
    const frame = requestAnimationFrame(() => setIsClient(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  /**
   * Generates a dynamic PDF filename based on title, type, level, and current date.
   *
   * @returns Formatted PDF filename string.
   */
  const getFileName = () => {
    if (title) return `${title}_NihongoRoute.pdf`;
    
    // Format date to DD-MM-YYYY using Indonesian locale to avoid slash characters in filename.
    const timestamp = new Date()
      .toLocaleDateString("id-ID")
      .replace(/\//g, "-");

    if (type === "vocab")
      return `ListKosakata_${level || "All"}_${timestamp}.pdf`;
    return `Materi_NihongoRoute_${timestamp}.pdf`;
  };

  return { isClient, getFileName };
}