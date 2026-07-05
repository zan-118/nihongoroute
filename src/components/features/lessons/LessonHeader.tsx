/**
 * @file LessonHeader.tsx
 * @description Komponen header pelajaran (LessonHeader) untuk menampilkan judul premium, ringkasan markup cerdas, serta tombol aksi utilitas (PDF & offline download).
 */

// ======================
// IMPOR
// ======================
import React from "react";
import { renderSmartText } from "@/components/features/global/SmartText";
import DownloadPdfButton from "@/components/features/pdf/components/DownloadPdfButton";
import DownloadOfflineButton, { type LessonData } from "@/components/features/lessons/DownloadOfflineButton";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
interface LessonHeaderProps {
  title: string;
  summary?: string;
  isSideQuest?: boolean;
  lesson: LessonData;
}

// ======================
// EKSEKUSI UTAMA
// ======================
export const LessonHeader: React.FC<LessonHeaderProps> = ({
  title, 
  summary, 
  isSideQuest, 
  lesson 
}) => {
  return (
    <header className="mb-14">
      <h1
        className={`text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-4 ${
          isSideQuest ? "text-warning" : "text-foreground"
        }`}
      >
        {title}
      </h1>
      {/* Accent gradient bar */}
      <div
        className={`h-1 w-24 rounded-full mb-8 ${
          isSideQuest ? "bg-warning" : ""
        }`}
        style={
          isSideQuest
            ? undefined
            : { backgroundImage: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))" }
        }
      />
      {summary && (
        <div 
          className={`p-6 md:p-8 rounded-2xl md:rounded-3xl neo-inset border-l-8 mb-8 ${
            isSideQuest ? "border-warning" : "border-primary"
          }`}
        >
          <p className="text-sm md:text-base font-medium leading-relaxed text-muted-foreground">
            {renderSmartText(summary)}
          </p>
        </div>
      )}
      <div className="flex items-center flex-wrap gap-3 justify-start p-3 rounded-xl bg-muted/20 border border-border/40 w-fit">
        <DownloadOfflineButton lesson={lesson} />
        <DownloadPdfButton data={lesson} />
      </div>
    </header>
  );
};
