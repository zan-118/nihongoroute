import { describe, it, expect } from "vitest";
import {
  sanitizePdfFilename,
  generatePdfFilename,
  buildPdfExporterConfig,
} from "@/lib/pdf/pdf-exporter-engine";

describe("PdfExporterEngine Seam", () => {
  describe("sanitizePdfFilename", () => {
    it("harus membersihkan karakter terlarang dari nama file", () => {
      expect(sanitizePdfFilename("Materi/Kosakata:N5.pdf")).toBe("Materi-Kosakata-N5.pdf");
      expect(sanitizePdfFilename("Dokumen Belajar")).toBe("Dokumen_Belajar.pdf");
    });
  });

  describe("generatePdfFilename", () => {
    it("harus menghasilkan nama file PDF dinamis berdasarkan judul", () => {
      expect(generatePdfFilename("vocab", "JLPT N5 Vocab")).toBe("JLPT_N5_Vocab_NihongoRoute.pdf");
    });

    it("harus menghasilkan nama file PDF dinamis berdasarkan tipe dan level", () => {
      const fixedDate = new Date(2026, 6, 31);
      const filename = generatePdfFilename("vocab", undefined, "N5", fixedDate);

      expect(filename).toBe("ListKosakata_N5_2026-07-31.pdf");
    });
  });

  describe("buildPdfExporterConfig", () => {
    it("harus menyusun opsi konfigurasi cetak PDF standar A4", () => {
      const config = buildPdfExporterConfig("Materi N5");

      expect(config.filename).toBe("Materi_N5.pdf");
      expect(config.format).toBe("a4");
      expect(config.orientation).toBe("portrait");
      expect(config.marginMm).toBe(10);
    });
  });
});
