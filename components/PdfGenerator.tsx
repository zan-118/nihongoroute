"use client";

import React, { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { LessonPdfTemplate } from "./LessonPdfTemplate";
import { VocabPdfTemplate } from "./VocabPdfTemplate";
import { Download, Loader2 } from "lucide-react";

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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient || !data || (Array.isArray(data) && data.length === 0)) {
    return (
      <button className="bg-[#0a0c10] border border-white/5 shadow-[inset_3px_3px_8px_#050608,inset_-2px_-2px_6px_rgba(255,255,255,0.02)] px-6 py-3 rounded-xl text-slate-300 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 w-full sm:w-auto cursor-not-allowed">
        Menunggu Data...
      </button>
    );
  }

  const getDocument = (): any => {
    if (type === "lesson") return <LessonPdfTemplate lessonData={data} />;
    if (type === "vocab")
      return <VocabPdfTemplate data={data} level={level || "N5"} />;
    // Default fallback agar tidak pernah me-return null secara fatal
    return <LessonPdfTemplate lessonData={data} />;
  };

  const getFileName = () => {
    if (title) return `${title}_NihongoRoute.pdf`;
    const timestamp = new Date()
      .toLocaleDateString("id-ID")
      .replace(/\//g, "-");

    if (type === "vocab")
      return `Kamus_Kosakata_${level || "All"}_${timestamp}.pdf`;
    return `Materi_NihongoRoute_${timestamp}.pdf`;
  };

  return (
    <PDFDownloadLink
      document={getDocument()}
      fileName={getFileName()}
      className="bg-[#0d1117] border border-white/5 shadow-[6px_6px_15px_#050608,-4px_-4px_10px_rgba(255,255,255,0.02)] hover:border-cyan-400/50 hover:bg-cyan-400/5 px-6 py-3 rounded-xl text-cyan-400 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 w-full sm:w-auto active:scale-95 group"
    >
      {/* @ts-ignore */}
      {({ loading }) => (
        <>
          {loading ? (
            <Loader2 size={14} className="animate-spin text-cyan-400" />
          ) : (
            <Download
              size={14}
              className="group-hover:-translate-y-0.5 transition-transform"
            />
          )}
          <span>{loading ? "Menyusun PDF..." : `Unduh PDF`}</span>
        </>
      )}
    </PDFDownloadLink>
  );
}
