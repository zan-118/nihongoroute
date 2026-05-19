import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LessonNavigationProps {
  prevLesson: any;
  nextLesson: any;
  levelCode: string;
  categoryId: string;
}

export const LessonNavigation: React.FC<LessonNavigationProps> = ({ 
  prevLesson, 
  nextLesson, 
  levelCode, 
  categoryId 
}) => {
  return (
    <nav className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-12 border-t border-border mt-auto mb-20">
      {prevLesson ? (
        <Link
          href={`/courses/${levelCode || categoryId}/${prevLesson.slug}`}
          className="neo-card h-full p-8 group flex flex-col justify-center items-start hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
        >
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary mb-3 flex items-center gap-2 transition-colors">
            <ChevronLeft size={14} aria-hidden="true" /> Materi Sebelumnya
          </span>
          <h4 className="text-xl font-black uppercase text-foreground tracking-tight leading-tight">
            {prevLesson.title}
          </h4>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
      {nextLesson ? (
        <Link
          href={`/courses/${levelCode || categoryId}/${nextLesson.slug}`}
          className="neo-card h-full p-8 group flex flex-col justify-center items-end text-right hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary mb-3 flex items-center gap-2 transition-colors">
            Materi Selanjutnya <ChevronRight size={14} aria-hidden="true" />
          </span>
          <h4 className="text-xl font-black italic uppercase text-foreground tracking-tight leading-tight">
            {nextLesson.title}
          </h4>
        </Link>
      ) : (
        <Link
          href={`/courses/${levelCode || categoryId}`}
          className="neo-card h-full p-8 flex flex-col items-center justify-center text-center bg-primary/5 border-primary/20 group hover:border-primary hover:bg-primary/10 transition-all duration-300"
        >
          <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
            🎉
          </span>
          <p className="text-xs font-black uppercase tracking-widest text-primary">
            Yeay! Materi Selesai
          </p>
        </Link>
      )}
    </nav>
  );
};
