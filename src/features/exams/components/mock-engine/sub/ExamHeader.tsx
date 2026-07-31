"use client";

import React from "react";
import { Lock as LockIcon } from "@/components/ui/icons";
import { SECTION_LABELS } from "../constants";
import { ExamCountdown } from "../ExamCountdown";
import { useExamSession } from "../ExamSessionContext";

/**
 * Sticky Header Navigasi Seksi & Countdown Timer untuk CBT Exam.
 */
export function ExamHeader() {
  const {
    availableSections,
    currentSection,
    activeSectionIndex,
    sections,
    goToQuestion,
    examEndAt,
    exam,
    finishExam,
  } = useExamSession();

  return (
    <header className="sticky top-0 z-50 pt-6 pb-4 bg-background/80">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-1">
            {availableSections.map((section, idx) => {
              const isLocked = idx < activeSectionIndex;
              const isActive = currentSection === section;
              return (
                <button
                  type="button"
                  key={section}
                  disabled={isLocked}
                  onClick={() => !isLocked && goToQuestion(sections[section][0])}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                    isActive
                      ? "bg-destructive text-destructive-foreground border-transparent shadow-sm"
                      : isLocked
                        ? "bg-transparent text-muted-foreground/30 border-border/50 cursor-not-allowed"
                        : "bg-background border-border hover:border-destructive/30"
                  }`}
                >
                  {isLocked && <LockIcon size={10} className="inline mr-1" />}
                  {SECTION_LABELS[section]?.split(" ")[0] || section}
                </button>
              );
            })}
          </div>

          {/* Timer Compact (Mobile & Top Bar) */}
          <ExamCountdown
            endAt={examEndAt}
            timeLimitSeconds={exam.timeLimit * 60}
            onExpire={finishExam}
            variant="compact"
          />
        </div>
      </div>
    </header>
  );
}
