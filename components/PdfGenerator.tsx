"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { LessonPdfTemplate } from "./LessonPdfTemplate";

export default function PdfGenerator({ data }: { data: any }) {
  return (
    <PDFDownloadLink
      document={<LessonPdfTemplate lessonData={data} />}
      fileName={`${data.title}_NihongoRoute.pdf`}
      className="px-5 py-3 bg-cyan-500/10 border border-cyan-400/30 hover:bg-cyan-400/20 hover:border-cyan-400 text-cyan-400 text-sm font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 w-full sm:w-auto shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_25px_rgba(34,211,238,0.2)]"
    >
      {({ loading }) => (
        <span>{loading ? "⏳ Memproses PDF..." : "⬇ Download PDF Materi"}</span>
      )}
    </PDFDownloadLink>
  );
}
