"use client";

import { motion, Variants } from "framer-motion";

interface CategoryHeroProps {
  title: string;
  description?: string;
  isSideQuest: boolean;
  progressPercent: number;
  lessonsDone: number;
  totalLessons: number;
  themeColor: string;
  themeRgb: string;
  itemVariants: Variants;
}

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
  const badgeStyle = isSideQuest
    ? {
        backgroundColor: "rgba(var(--warning-rgb), 0.1)",
        color: "var(--warning)",
        borderColor: "rgba(var(--warning-rgb), 0.2)",
        boxShadow: "0 0 15px rgba(var(--warning-rgb), 0.1)",
      }
    : {
        backgroundColor: "rgba(var(--primary-rgb), 0.1)",
        color: "var(--primary)",
        borderColor: "rgba(var(--primary-rgb), 0.2)",
        boxShadow: "0 0 15px rgba(var(--primary-rgb), 0.1)",
      };

  return (
    <header className="mb-24 space-y-12">
      <div className="h-4" /> {/* Spacer for global breadcrumb */}

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
        <div className="space-y-8 max-w-3xl">
          <motion.div variants={itemVariants} className="flex items-center gap-4">
            <span
              className="px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] transition-all"
              style={badgeStyle}
            >
              {isSideQuest ? "Practical competency" : "JLPT Mastery Track"}
            </span>
            <div className="h-[1px] w-12 bg-border" />
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              variants={itemVariants}
              className={`text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] uppercase ${themeColor}`}
            >
              {title}
            </motion.h1>

            {description && (
              <motion.p
                variants={itemVariants}
                className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl"
              >
                {description}
              </motion.p>
            )}
          </div>
        </div>

        {/* Overall Progress Widget */}
        <motion.div
          variants={itemVariants}
          className="lg:mb-4 p-8 glass bg-card/30 rounded-[2.5rem] border border-border min-w-[280px] shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Category Progress
              </span>
              <span className={`text-sm font-black ${themeColor}`}>{progressPercent}%</span>
            </div>
            
            <div 
              className="h-3 rounded-full overflow-hidden border border-border/80"
              style={{ backgroundColor: "rgba(var(--background-rgb), 0.5)" }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  background: isSideQuest
                    ? "linear-gradient(90deg, var(--warning) 0%, rgba(var(--warning-rgb), 0.6) 100%)"
                    : "linear-gradient(90deg, var(--primary) 0%, rgba(var(--primary-rgb), 0.6) 100%)",
                  boxShadow: `0 0 15px rgba(${themeRgb}, 0.4)`,
                }}
              />
            </div>
            
            <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <span>{lessonsDone} Completed</span>
              <span>{totalLessons} Lessons</span>
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
