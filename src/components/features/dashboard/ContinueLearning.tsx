"use client";

import { useUserStore } from "@/store/useUserStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";

interface ContinueLearningProps {
  courseMetadata: Array<{
    _id: string;
    title: string;
    slug: string;
    lessons: Array<{
      _id: string;
      title: string;
      slug: string;
    }>;
  }>;
}

export default function ContinueLearning({ courseMetadata }: ContinueLearningProps) {
  const completedLessons = useUserStore(s => s.completedLessons);

  // Logic to find active course and next lesson
  const activeData = useMemo(() => {
    if (!courseMetadata || courseMetadata.length === 0) return null;

    // 1. Calculate progress for each category
    const stats = courseMetadata.map(cat => {
      const lessons = cat.lessons || [];
      const completedInCat = lessons.filter(lesson => {
          const record = completedLessons[lesson._id];
          return record && record.completedAt;
      });
      
      const totalLessons = lessons.length;
      const progress = totalLessons > 0 
        ? (completedInCat.length / totalLessons) * 100 
        : 0;
      
      // Find last updated lesson in this category
      const lastUpdate = lessons.reduce((max, lesson) => {
        const ts = completedLessons[lesson._id]?.updatedAt || 0;
        return ts > max ? ts : max;
      }, 0);

      return { ...cat, lessons, progress, lastUpdate, completedCount: completedInCat.length, totalLessons };
    });

    // 2. Find "Active" course (has progress but not 100%, and most recently updated)
    // If none has progress, pick the first category (usually N5)
    let active = stats
      .filter(s => s.progress > 0 && s.progress < 100)
      .sort((a, b) => b.lastUpdate - a.lastUpdate)[0] as typeof stats[number] | undefined;

    if (!active) {
       // If no partially completed course, check if any course is not 100%
       active = stats.find(s => s.progress < 100);
    }

    if (!active || !active.lessons || active.lessons.length === 0) return null;

    // 3. Find next lesson in active course
    const nextLessonIndex = active.lessons.findIndex(l => !completedLessons[l._id]?.completedAt);
    const nextLesson = active.lessons[nextLessonIndex] || active.lessons[0];

    if (!nextLesson) return null;

    return {
      courseTitle: active.title,
      courseSlug: active.slug,
      progress: active.progress,
      lessonTitle: nextLesson.title,
      lessonSlug: nextLesson.slug,
      completedCount: active.completedCount,
      totalLessons: active.totalLessons,
      isNew: active.progress === 0
    };
  }, [courseMetadata, completedLessons]);

  if (!activeData) return null;

  return (
    <div className="w-full space-y-[21px]">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-[13px]">
          <div className="w-[34px] h-[1px] bg-primary/40" />
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            Lanjut Belajar
          </h2>
        </div>
        <div className="flex items-end justify-between">
           <h3 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
             {activeData.isNew ? "Mulai Perjalanan" : "Lanjut Belajar"}
           </h3>
           <Link href="/courses" className="text-[10px] font-bold text-primary hover:text-foreground transition-colors uppercase tracking-widest flex items-center gap-1 group">
             Lihat Semua <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
           </Link>
        </div>
      </div>

      <Card className="group relative overflow-hidden border-border bg-card/10 backdrop-blur-xl p-0 rounded-[34px] transition-all duration-500 hover:border-primary/30">
        {/* Progress Background Glow */}
        <div 
          className="absolute left-0 top-0 bottom-0 bg-primary/5 transition-all duration-1000 ease-out" 
          style={{ width: `${activeData.progress}%` }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-[34px] p-[34px]">
          {/* Icon/Thumbnail Area */}
          <div className="shrink-0 relative">
            <div className="w-[89px] h-[89px] rounded-[21px] bg-card/40 border border-border flex items-center justify-center shadow-2xl overflow-hidden group-hover:border-primary/20 transition-colors">
               {activeData.progress === 100 ? (
                 <CheckCircle2 size={34} className="text-success" />
               ) : (
                 <BookOpen size={34} className="text-primary group-hover:scale-110 transition-transform duration-500" />
               )}
            </div>
            
            {/* Percentage Badge */}
            <div className="absolute -bottom-2 -right-2 bg-foreground text-background text-[10px] font-bold px-3 py-1 rounded-full border border-border shadow-xl">
              {Math.round(activeData.progress)}%
            </div>
          </div>

          {/* Info Area */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col gap-1 mb-[13px]">
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] opacity-80">
                {activeData.courseTitle}
              </span>
              <h4 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight line-clamp-1">
                {activeData.lessonTitle}
              </h4>
            </div>
            
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className={`w-1.5 h-3 rounded-full border border-background ${i < Math.floor(activeData.progress / 33) ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]' : 'bg-background/10'}`} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  {activeData.completedCount} / {activeData.totalLessons} Pelajaran
                </span>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="w-full md:w-auto shrink-0">
            <Button asChild className="w-full md:w-auto h-[89px] px-10 rounded-[21px] bg-foreground text-background hover:bg-primary hover:text-primary-foreground font-bold uppercase tracking-widest transition-all duration-300 group shadow-2xl border-none">
              <Link href={`/courses/${activeData.courseSlug}/${activeData.lessonSlug}`}>
                {activeData.isNew ? "Mulai" : "Lanjut"}
                <div className="ml-3 w-[34px] h-[34px] rounded-full bg-background/20 flex items-center justify-center group-hover:bg-primary-foreground/20 transition-colors">
                  <Play size={14} fill="currentColor" />
                </div>
              </Link>
            </Button>
          </div>
        </div>

        {/* Bottom Progress Bar (Slim) */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-border">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${activeData.progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="h-full bg-primary shadow-[0_0_13px_rgba(var(--primary-rgb),0.5)]"
          />
        </div>
      </Card>
    </div>
  );
}
