/**
 * @file CategoryHero.tsx
 * @description Hero banner component for course category detail pages displaying titles, descriptions, completion progress, and JLPT badges.
 * @module features/courses/components
 */

"use client";

// Import & Dependencies

import { m, Variants } from "framer-motion";

// Component Props Interface

/**
 * Props for CategoryHero component.
 */
interface CategoryHeroProps {
 /** Title of the category */
 title: string;
 /** Optional description text */
 description?: string;
 /** Flag indicating if category is side quest or main JLPT path */
 isSideQuest: boolean;
 /** Percentage of progress completed */
 progressPercent: number;
 /** Number of completed lessons */
 lessonsDone: number;
 /** Total number of lessons in category */
 totalLessons: number;
 /** Tailwind text color class name */
 themeColor: string;
 /** RGB values for theme color accent */
 themeRgb: string;
 /** Framer motion animation variants for child items */
 itemVariants: Variants;
}

// EKSEKUSI UTAMA

/**
 * CategoryHero component. Displays header, description, and progress widget.
 */
export function CategoryHero({
 title,
 description,
 isSideQuest,
 progressPercent,
 lessonsDone,
 totalLessons,
 themeColor,
 themeRgb,
 itemVariants,
}: CategoryHeroProps) {
 // Set badge colors based on quest type
 const badgeStyle = isSideQuest
 ? {
 backgroundColor: "hsl(var(--warning)/0.1)",
 color: "hsl(var(--warning))",
 borderColor: "hsl(var(--warning)/0.2)",
 }
 : {
 backgroundColor: "hsl(var(--primary)/0.1)",
 color: "hsl(var(--primary))",
 borderColor: "hsl(var(--primary)/0.2)",
 };

 return (
 <header className="mb-8 md:mb-16 space-y-6 md:space-y-8">
 <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-10">
 <div className="space-y-4 md:space-y-6 max-w-3xl flex-1 min-w-0">
        <m.div variants={itemVariants} className="flex items-center gap-3">
          <span
            className="px-3 py-1 rounded-[4px] border text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all"
            style={badgeStyle}
          >
            {isSideQuest ? "Kemampuan Praktis" : "Jalur Kuasai JLPT"}
          </span>
          <div className="h-[1px] w-8 bg-border hidden sm:block" />
        </m.div>

        <div className="space-y-2 sm:space-y-3">
          <m.h1
            variants={itemVariants}
            className={`text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-black tracking-tighter leading-[0.85] uppercase ${themeColor}`}
          >
            {title}
          </m.h1>

          {description && (
            <m.p
              variants={itemVariants}
              className="text-sm sm:text-base md:text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl line-clamp-3 md:line-clamp-none"
            >
              {description}
            </m.p>
          )}
        </div>
      </div>

      {/* Progress Widget — Compact, Inline */}
      <m.div
        variants={itemVariants}
        className="w-full lg:w-auto lg:min-w-[240px] lg:max-w-[280px] p-4 sm:p-5 md:p-6 bg-card border border-border/50 dark:border-white/10 rounded-xl relative overflow-hidden group transition-all duration-200 shrink-0 shadow-sm"
      >
        <div className="relative z-10 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Progres
            </span>
            <span className={`text-sm font-bold ${themeColor}`}>{progressPercent}%</span>
          </div>

          <div
            className="h-2 sm:h-2.5 rounded-full overflow-hidden border border-border/80 bg-background/50"
          >
            <m.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              className={`h-full rounded-full transition-all duration-500 ${isSideQuest ? "bg-warning" : "bg-primary"}`}
            />
          </div>

 <div className="flex justify-between text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
 <span>{lessonsDone} Selesai</span>
 <span>{totalLessons} Pelajaran</span>
 </div>
 </div>
 </m.div>
 </div>
 </header>
 );
}