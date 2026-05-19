"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Flame, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MockExam {
  id: string;
  title: string;
  timeLimit: number;
  passingScore: number;
}

interface MockExamsProps {
  exams: MockExam[];
  itemVariants: Variants;
}

export function MockExams({ exams, itemVariants }: MockExamsProps) {
  if (!exams || exams.length === 0) return null;

  return (
    <motion.section variants={itemVariants} className="mb-24">
      <div className="flex items-center gap-6 mb-12">
        <div className="space-y-1">
          <h3 className="text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
            <Flame size={20} className="text-destructive" /> Simulasi Ujian
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
            Uji Batas Kemampuan Anda
          </p>
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-border/50 to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {exams.map((exam) => (
          <Link key={exam.id} href={`/exams/${exam.id}`} className="group">
            <Card className="p-10 bg-card/30 backdrop-blur-xl border border-border rounded-[3rem] hover:border-primary/30 transition-all duration-500 flex flex-col gap-8 h-full relative overflow-hidden group shadow-2xl hover:shadow-[0_0_40px_rgba(var(--primary-rgb),0.15)] glass">
              {/* Premium Glow Overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: "linear-gradient(135deg, rgba(var(--primary-rgb), 0.04) 0%, transparent 100%)",
                }}
              />
              
              <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-150 transition-all duration-1000 pointer-events-none text-foreground">
                <Flame size={140} />
              </div>
              
              <div className="relative z-10 space-y-4">
                <h4 className="text-3xl font-black text-foreground group-hover:text-primary transition-colors tracking-tighter uppercase leading-none">
                  {exam.title}
                </h4>
                <div className="flex flex-wrap gap-3">
                  <span 
                    className="px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                    style={{ backgroundColor: "rgba(var(--background-rgb), 0.5)", borderColor: "rgba(var(--border-rgb), 0.5)" }}
                  >
                    ⏱️ {exam.timeLimit} Mins
                  </span>
                  <span 
                    className="px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                    style={{ backgroundColor: "rgba(var(--background-rgb), 0.5)", borderColor: "rgba(var(--border-rgb), 0.5)" }}
                  >
                    🎯 {exam.passingScore}% Pass
                  </span>
                </div>
              </div>
              
              <div className="mt-auto relative z-10 flex items-center justify-between pt-8 border-t border-border">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Challenge Start</span>
                <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xl group-hover:translate-x-2 transition-transform">
                  <ChevronRight size={20} />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </motion.section>
  );
}
