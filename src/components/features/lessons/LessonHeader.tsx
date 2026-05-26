import React from "react";
import { renderSmartText } from "@/components/features/global/SmartText";
import DownloadPdfButton from "@/components/features/pdf/components/DownloadPdfButton";
import DownloadOfflineButton, { type LessonData } from "@/components/features/lessons/DownloadOfflineButton";

interface LessonHeaderProps {
  title: string;
  summary?: string;
  isSideQuest?: boolean;
  lesson: LessonData;
}

/**
 * Komponen: LessonHeader
 * 
 * Bagian header visual utama untuk modul pelajaran. Menampilkan judul pelajaran dalam tipografi neon 
 * berukuran besar, kotak ringkasan bermarkup cerdas (renderSmartText), serta menyediakan barisan tombol 
 * aksi utilitas termasuk unduhan offline (DownloadOfflineButton) dan pembuatan sertifikat/PDF (DownloadPdfButton).
 * 
 * @param {Object} props - Properti komponen
 * @param {string} props.title - Judul pelajaran
 * @param {string} [props.summary] - Ringkasan deskripsi pelajaran
 * @param {boolean} [props.isSideQuest] - Menandakan apakah pelajaran ini adalah materi tambahan (side quest)
 * @param {LessonData} props.lesson - Objek data pelajaran lengkap untuk diunduh/diekspor
 */
export const LessonHeader: React.FC<LessonHeaderProps> = ({ 
  title, 
  summary, 
  isSideQuest, 
  lesson 
}) => {
  return (
    <header className="mb-20">
      <h1
        className={`text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-8 ${
          isSideQuest ? "text-warning" : "text-foreground"
        }`}
      >
        {title}
      </h1>
      {summary && (
        <div
          className={`p-8 rounded-[2rem] neo-inset border-l-8 mb-8 ${
            isSideQuest ? "border-warning" : "border-primary"
          }`}
        >
          <p className="text-base md:text-lg font-medium leading-relaxed text-muted-foreground">
            {renderSmartText(summary)}
          </p>
        </div>
      )}
      <div className="flex items-center flex-wrap gap-4 justify-start">
        <DownloadOfflineButton lesson={lesson} />
        <DownloadPdfButton data={lesson} />
      </div>
    </header>
  );
};
