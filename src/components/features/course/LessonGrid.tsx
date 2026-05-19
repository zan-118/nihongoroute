"use client";

import { motion, Variants } from "framer-motion";
import { Sparkles, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonCard } from "./LessonCard";

interface Lesson {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
}

interface LessonGridProps {
  lessons: Lesson[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  categoryId: string;
  isSideQuest: boolean;
  completedLessons: Record<string, any>;
  itemVariants: Variants;
}

export function LessonGrid({
  lessons,
  currentPage,
  totalPages,
  onPageChange,
  categoryId,
  isSideQuest,
  completedLessons,
  itemVariants,
}: LessonGridProps) {
  return (
    <motion.section variants={itemVariants} className="pb-32">
      <div className="mb-8 flex items-center gap-5">
        <h3 className="text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground">Daftar Pelajaran</h3>
        <div className="h-[1px] flex-1 bg-border" />
      </div>

      {lessons.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {lessons.map((lesson, index) => (
            <LessonCard
              key={lesson._id}
              lesson={lesson}
              index={index + (currentPage - 1) * 12} // Adjusted index for pagination
              categoryId={categoryId}
              isSideQuest={isSideQuest}
              progress={completedLessons[lesson._id] && !completedLessons[lesson._id].isDeleted ? 100 : 0}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 glass rounded-[2.5rem] text-center px-[55px] border-dashed border-2 border-border">
          <div className="w-[89px] h-[89px] bg-background border border-border rounded-3xl flex items-center justify-center mb-8">
            <Sparkles size={40} className="text-muted-foreground/40" aria-hidden="true" />
          </div>

          <h4 className="text-3xl font-bold text-foreground tracking-tight mb-4 uppercase">Content Incoming</h4>
          <p className="max-w-md text-muted-foreground text-sm font-medium leading-relaxed">
            We&apos;re currently crafting the perfect lessons for this section. Stay tuned for a premium learning
            experience!
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-8 mt-[55px]">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em]">
            Page <span className="text-foreground">{currentPage}</span> of {totalPages}
          </div>
          <div className="flex items-center gap-3 p-2 bg-card/30 backdrop-blur-md border border-border rounded-2xl glass">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="w-11 h-11 rounded-xl hover:bg-background transition-all disabled:opacity-20"
            >
              <ChevronsLeft size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-11 h-11 rounded-xl hover:bg-background transition-all disabled:opacity-20"
            >
              <ChevronLeft size={18} />
            </Button>

            <div className="flex items-center gap-1.5 px-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-11 h-11 rounded-xl font-bold transition-all ${
                      currentPage === pageNum
                        ? `bg-foreground text-background shadow-xl`
                        : "hover:bg-background text-muted-foreground"
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-11 h-11 rounded-xl hover:bg-background transition-all disabled:opacity-20"
            >
              <ChevronRight size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="w-11 h-11 rounded-xl hover:bg-background transition-all disabled:opacity-20"
            >
              <ChevronsRight size={18} />
            </Button>
          </div>
        </div>
      )}
    </motion.section>
  );
}
