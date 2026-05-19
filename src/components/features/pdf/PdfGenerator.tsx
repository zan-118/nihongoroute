"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePdfGenerator } from "./usePdfGenerator";
import { LessonPdfTemplate } from "./templates/LessonPdfTemplate";
import { VocabPdfTemplate } from "./templates/VocabPdfTemplate";
import { CertificatePdfTemplate } from "./templates/CertificatePdfTemplate";
import { CheatsheetPdfTemplate } from "./templates/CheatsheetPdfTemplate";

// Dynamic import for PDFDownloadLink to reduce initial bundle size
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
        <span>Menyiapkan Engine...</span>
      </Button>
    ),
  }
);

export type TemplateType = "lesson" | "vocab" | "certificate" | "cheatsheet";

interface PdfGeneratorProps {
   
  data: any;
  type: TemplateType;
  title?: string;
  level?: string;
  category?: string;
}

export default function PdfGenerator({
  data,
  type,
  title,
  level,
  category,
}: PdfGeneratorProps) {
  const { isClient, getFileName } = usePdfGenerator({ type, title, level });

   
  const getDocument = (): any => {
    if (type === "lesson") return <LessonPdfTemplate lessonData={data} />;
    if (type === "vocab")
      return <VocabPdfTemplate data={data} level={level || "N5"} />;
    if (type === "certificate")
      return <CertificatePdfTemplate data={data} />;
    if (type === "cheatsheet")
      return <CheatsheetPdfTemplate data={data} title={title || "Cheatsheet"} category={category || "General"} />;
    return <LessonPdfTemplate lessonData={data} />;
  };

  if (!isClient || !data || (Array.isArray(data) && data.length === 0)) {
    return (
      <Button variant="ghost" disabled className="bg-card border-border neo-inset shadow-none px-6 py-3 rounded-xl text-muted-foreground text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 w-full sm:w-auto h-auto">
        Menunggu Data...
      </Button>
    );
  }

  return (
    <PDFDownloadLink
      document={getDocument()}
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
