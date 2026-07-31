/**
 * @file pdf-exporter-engine.ts
 * @description Core domain engine seam untuk konfigurasi opsi cetak PDF leksikal,
 * sanitasi nama file PDF, dan penentuan margin lembar dokumen.
 * 100% bebas dari ketergantungan React DOM/hooks untuk keterujian murni via Vitest.
 */

export interface PdfExportOptions {
  filename: string;
  marginMm: number;
  orientation: "portrait" | "landscape";
  unit: "mm" | "in" | "px";
  format: "a4" | "letter";
}

/**
 * Sanitizes PDF filename to prevent invalid filesystem characters (slashes, colons, quotes).
 */
export function sanitizePdfFilename(filename: string): string {
  const safeName = filename
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\s+/g, "_")
    .trim();

  return safeName.endsWith(".pdf") ? safeName : `${safeName}.pdf`;
}

/**
 * Generates dynamic PDF filename based on template type, title, level, and timestamp.
 */
export function generatePdfFilename(
  type: string,
  title?: string,
  level?: string,
  nowDate: Date = new Date()
): string {
  if (title) {
    return sanitizePdfFilename(`${title}_NihongoRoute.pdf`);
  }

  const timestamp = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, "0")}-${String(nowDate.getDate()).padStart(2, "0")}`;

  if (type === "vocab") {
    return sanitizePdfFilename(`ListKosakata_${level || "All"}_${timestamp}.pdf`);
  }
  if (type === "kanji") {
    return sanitizePdfFilename(`ListKanji_${level || "All"}_${timestamp}.pdf`);
  }

  return sanitizePdfFilename(`Materi_NihongoRoute_${timestamp}.pdf`);
}

/**
 * Builds default html2pdf export options object.
 */
export function buildPdfExporterConfig(filename: string): PdfExportOptions {
  return {
    filename: sanitizePdfFilename(filename),
    marginMm: 10,
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  };
}
