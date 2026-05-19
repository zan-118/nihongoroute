import React from "react";
import { renderSmartText } from "@/components/features/global/SmartText";
import DownloadPdfButton from "@/components/features/pdf/components/DownloadPdfButton";

interface LessonHeaderProps {
  title: string;
  summary?: string;
  isSideQuest?: boolean;
  lesson: any; // Keep it flexible for now, or use a proper type if available
}

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
      <div className="flex justify-start">
        <DownloadPdfButton data={lesson} />
      </div>
    </header>
  );
};
