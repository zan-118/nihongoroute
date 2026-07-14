"use client";

/**
 * @file PdfGenerator.tsx
 * @description Komponen pembuat dokumen PDF berbasis React PDF renderer.
 * Memanfaatkan impor dinamis untuk PDFDownloadLink untuk meminimalkan beban bundle JavaScript awal,
 * serta menyajikan pilihan template PDF (Lesson, Vocab, Certificate, Cheatsheet).
 *
 * @package components/features/pdf
 * @project NihongoRoute
 */

// ==========================================
// IMPOR
// ==========================================
import React from "react";
import dynamic from "next/dynamic";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePdfGenerator } from "./usePdfGenerator";
import { LessonPdfTemplate } from "./templates/LessonPdfTemplate";
import { VocabPdfTemplate } from "./templates/VocabPdfTemplate";
import { CertificatePdfTemplate } from "./templates/CertificatePdfTemplate";
import { CheatsheetPdfTemplate } from "./templates/CheatsheetPdfTemplate";
import { GrammarPdfTemplate } from "./templates/GrammarPdfTemplate";

// ==========================================
// IMPOR DINAMIS & KONFIGURASI
// ==========================================
/**
 * Dynamic import for PDFDownloadLink.
 * Prevents server-side rendering issues with PDF engine.
 */
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <Button 
        variant="ghost" 
        disabled 
        className="bg-card border-border neo-inset shadow-none px-6 py-3 rounded-xl text-muted-foreground text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 w-full sm:w-auto h-auto"
      >
        <Loader2 size={14} aria-hidden="true" className="animate-spin text-primary" />
        <span>Menyiapkan Engine…</span>
      </Button>
    ),
  }
);

// ==========================================
// TIPE & ANTARMUKA (TYPES & INTERFACES)
// ==========================================
/**
 * Supported PDF template types.
 */
export type TemplateType = "lesson" | "vocab" | "certificate" | "cheatsheet" | "grammar";

/**
 * Props for PdfGenerator component.
 */
interface PdfGeneratorProps {
  /** Data payload passed to the selected PDF template. */
  data: unknown;
  /** Type of PDF template to generate. */
  type: TemplateType;
  /** Optional title for the PDF document. */
  title?: string;
  /** Optional JLPT level. */
  level?: string;
  /** Optional category for cheatsheets. */
  category?: string;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * PdfGenerator component.
 * Renders a download button that triggers client-side PDF generation.
 */
export default function PdfGenerator({
  data,
  type,
  title,
  level,
  category,
}: PdfGeneratorProps) {
  const { isClient, getFileName } = usePdfGenerator({ type, title, level });

  /**
   * Resolves and returns the appropriate PDF template component based on type.
   * Casts data to template-specific interfaces.
   */
  const getDocument = (): React.ReactElement => {
    if (type === "lesson")
      return <LessonPdfTemplate lessonData={data as unknown as import("./templates/LessonPdfTemplate").PdfLessonData} />;
    if (type === "vocab")
      return <VocabPdfTemplate data={data as unknown as import("./templates/LessonPdfTemplate").PdfVocabItem[]} level={level || "N5"} />;
    if (type === "certificate")
      return <CertificatePdfTemplate data={data as unknown as { userName: string; examTitle: string; score: number; date: string; level?: string; }} />;
    if (type === "cheatsheet")
      return <CheatsheetPdfTemplate data={data as unknown as { label: string; jp: string; romaji: string; }[]} title={title || "Cheatsheet"} category={category || "General"} />;
    if (type === "grammar")
      return <GrammarPdfTemplate data={data as unknown as import("./templates/GrammarPdfTemplate").PdfGrammarItem} />;
    return <LessonPdfTemplate lessonData={data as unknown as import("./templates/LessonPdfTemplate").PdfLessonData} />;
  };

  // Prevent rendering if client hydration is incomplete or data is missing
  if (!isClient || !data || (Array.isArray(data) && data.length === 0)) {
    return (
      <Button variant="ghost" disabled className="bg-card border-border neo-inset shadow-none px-6 py-3 rounded-xl text-muted-foreground text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 w-full sm:w-auto h-auto">
        Menunggu Data…
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={getDocument() as unknown as React.ReactElement<import("@react-pdf/renderer").DocumentProps>}
      fileName={getFileName()}
      style={{ textDecoration: 'none' }}
    >
      {({ loading }) => (
        <Button
          variant="ghost"
          disabled={loading}
          className="bg-card border-border neo-card shadow-none hover:border-primary/50 hover:bg-primary/10 px-6 py-3 rounded-xl text-primary text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 w-full sm:w-auto active:scale-95 group h-auto"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin text-primary" />
          ) : (
            <Download
              size={14}
              aria-hidden="true"
              className="group-hover:-translate-y-0.5 transition-transform"
            />
          )}
          <span>{loading ? "Menyusun PDF..." : type === 'certificate' ? 'Unduh Sertifikat' : `Unduh PDF`}</span>
        </Button>
      )}
    </PDFDownloadLink>
  );
}