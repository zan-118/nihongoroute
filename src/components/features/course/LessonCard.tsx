"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface LessonCardProps {
  lesson: {
    _id: string;
    title: string;
    slug: string;
    summary?: string;
  };
  index: number;
  categoryId: string;
  isSideQuest?: boolean;
  progress?: number; // 0 to 100
}

export function LessonCard({ lesson, index, categoryId, isSideQuest, progress = 0 }: LessonCardProps) {
  const themeRgb = isSideQuest ? "var(--warning-rgb)" : "var(--primary-rgb)";

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{ 
        contentVisibility: 'auto', 
        containIntrinsicSize: '0 300px',
        willChange: 'transform'
      }}
    >
      <Link href={`/courses/${categoryId}/${lesson.slug}`} className="group flex flex-col h-full relative">
        {/* Animated Glow Backdrop */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700 -z-10 scale-105" 
          style={{
            background: `linear-gradient(135deg, rgba(${themeRgb}, 0.1) 0%, transparent 100%)`
          }}
        />

        <Card className="p-8 bg-card/30 backdrop-blur-xl glass rounded-[2.5rem] group transition-all duration-500 flex flex-col items-start gap-8 cursor-pointer border border-border hover:border-foreground/10 h-full shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative overflow-hidden">
          {/* Shine Effect */}
          <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-foreground/[0.03] to-transparent skew-x-12 pointer-events-none" />
          
          <div className="flex justify-between items-start w-full relative z-10">
            <div
              className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center font-black text-xs font-mono bg-background border border-border transition-all duration-500 shadow-2xl ${
                isSideQuest 
                  ? "text-warning group-hover:bg-warning group-hover:text-warning-foreground group-hover:border-none group-hover:rotate-6" 
                  : "text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-none group-hover:rotate-6"
              }`}
            >
              {(index + 1).toString().padStart(2, "0")}
            </div>
            
            {progress > 0 && (
              <div 
                className="px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors shadow-sm"
                style={{ backgroundColor: "rgba(var(--background-rgb), 0.5)", borderColor: "var(--border)" }}
              >
                {progress}% Complete
              </div>
            )}
          </div>

          <div className="flex-1 relative z-10 w-full space-y-3">
            <h4 className={`text-2xl md:text-3xl font-black text-foreground transition-colors tracking-tighter leading-none text-balance ${
              isSideQuest ? "group-hover:text-warning" : "group-hover:text-primary"
            }`}>
              {lesson.title}
            </h4>
            {lesson.summary && (
              <p className="text-muted-foreground text-sm font-medium line-clamp-3 opacity-70 group-hover:opacity-100 transition-opacity leading-relaxed">
                {lesson.summary}
              </p>
            )}
          </div>

          <div className="mt-auto pt-8 w-full flex items-center justify-between border-t border-border relative z-10">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${
              isSideQuest ? "text-warning/40 group-hover:text-warning" : "text-primary/40 group-hover:text-primary"
            }`}>
              Start Learning
            </span>
            <div
              className={`w-11 h-11 rounded-xl border border-border flex items-center justify-center transition-all duration-500 bg-background shadow-xl ${
                isSideQuest ? "group-hover:bg-warning group-hover:text-warning-foreground" : "group-hover:bg-primary group-hover:text-primary-foreground"
              }`}
            >
              <ChevronRight size={18} aria-hidden="true" className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Bottom Progress Bar - Cyber Style */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-1.5"
            style={{ backgroundColor: "rgba(var(--background-rgb), 0.1)" }}
          >
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full rounded-full transition-all duration-1000"
              style={{
                background: isSideQuest
                  ? "linear-gradient(90deg, var(--warning) 0%, rgba(var(--warning-rgb), 0.6) 100%)"
                  : "linear-gradient(90deg, var(--primary) 0%, rgba(var(--primary-rgb), 0.6) 100%)",
                boxShadow: `0 0 10px rgba(${themeRgb}, 0.5)`,
              }}
            />
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
