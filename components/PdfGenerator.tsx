"use client";

import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { LessonPdfTemplate } from "./LessonPdfTemplate";
import { VocabPdfTemplate } from "./VocabPdfTemplate";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePdfGenerator } from "./features/pdf/usePdfGenerator";

export type TemplateType = "lesson" | "vocab";

interface PdfGeneratorProps {
  data: any;
  type: TemplateType;
  title?: string;
  level?: string;
}

export default function PdfGenerator({
  data,
  type,
  title,
  level,
}: PdfGeneratorProps) {
  const { isClient, getFileName } = usePdfGenerator({ type, title, level });

  const getDocument = (): any => {
    if (type === "lesson") return <LessonPdfTemplate lessonData={data} />;
    if (type === "vocab")
      return <VocabPdfTemplate data={data} level={level || "N5"} />;
    return <LessonPdfTemplate lessonData={data} />;
  };

  if (!isClient || !data || (Array.isArray(data) && data.length === 0)) {
    return (
      <Button variant="ghost" disabled className="bg-[#0a0c10] border-white/5 neo-inset shadow-none px-6 py-3 rounded-xl text-slate-300 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 w-full sm:w-auto h-auto">
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
      {/* @ts-ignore */}
      {({ loading }) => (
        <Button
          variant="ghost"
          disabled={loading}
          className="bg-[#0d1117] border-white/5 neo-card shadow-none hover:border-cyan-400/50 hover:bg-cyan-400/10 px-6 py-3 rounded-xl text-cyan-400 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 w-full sm:w-auto active:scale-95 group h-auto"
        >
          {loading ? (
            <Loader2 size={14} className="animate-spin text-cyan-400" />
          ) : (
            <Download
              size={14}
              className="group-hover:-translate-y-0.5 transition-transform"
            />
          )}
          <span>{loading ? "Menyusun PDF..." : `Unduh PDF`}</span>
        </Button>
      )}
    </PDFDownloadLink>
  );
}
