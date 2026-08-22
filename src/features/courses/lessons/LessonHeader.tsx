/**
 * @file LessonHeader.tsx
 * @description Lesson header component rendering titles, smart text markup summaries, PDF export buttons, and offline download triggers.
 * @module features/courses/lessons
 */

import React from "react";
import { renderSmartText } from "@/components/global/SmartText";
import DownloadPdfButton from "@/features/pdf/components/DownloadPdfButton";
import DownloadOfflineButton, { type LessonData } from "@/features/courses/lessons/DownloadOfflineButton";

/**
 * Props for LessonHeader component.
 */
interface LessonHeaderProps {
  /** Lesson title text. */
  title: string;
  /** Optional lesson summary text. */
  summary?: string;
  /** Flag indicating if lesson is side quest. */
  isSideQuest?: boolean;
  /** Lesson data payload for downloads. */
  lesson: LessonData;
}

/**
 * Header component for lessons. Displays title, summary, and action buttons.
 */
export const LessonHeader: React.FC<LessonHeaderProps> = ({
  title, 
  summary, 
  isSideQuest, 
  lesson 
}) => {
  return (
    <header className="mb-14">
      {/* Dynamic title color based on side quest status */}
      <h1
        className={`text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-none mb-4 ${
          isSideQuest ? "text-warning" : "text-foreground"
        }`}
      >
        {title}
      </h1>
      {/* Accent bar */}
      <div
        className={`h-1 w-24 rounded-full mb-8 ${
          isSideQuest ? "bg-warning" : "bg-primary"
        }`}
      />
      {/* Render summary with smart text formatting if provided */}
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
      {/* Action buttons for offline storage and PDF generation */}
      <div className="flex items-center flex-wrap gap-3 justify-start p-3 rounded-xl bg-muted/20 border border-border/40 w-fit">
        <DownloadOfflineButton lesson={lesson} />
        <DownloadPdfButton data={lesson} />
      </div>
    </header>
  );
};