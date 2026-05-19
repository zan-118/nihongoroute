"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { Layers, PenTool, Flame, Sparkles, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TrainingGroundProps {
  categoryId: string;
  themeColor: string;
  itemVariants: Variants;
}

export function TrainingGround({ categoryId, themeColor, itemVariants }: TrainingGroundProps) {
  const trainingItems = [
    {
      title: "Vocabulary",
      desc: "Flashcard & Spaced Repetition",
      icon: Layers,
      colorClass: "text-primary",
      rgb: "var(--primary-rgb)",
      href: `/tools/flashcards?category=${categoryId}`,
    },
    {
      title: "Kanji Lab",
      desc: "Stroke Order & Recognition",
      icon: PenTool,
      colorClass: "text-secondary",
      rgb: "var(--secondary-rgb)",
      href: `/tools/flashcards?category=${categoryId}`,
    },
    {
      title: "Survival",
      desc: "Speed & Accuracy Challenge",
      icon: Flame,
      colorClass: "text-destructive",
      rgb: "var(--destructive-rgb)",
      href: `/tools/flashcards?category=${categoryId}`,
    },
  ];

  return (
    <motion.section variants={itemVariants} className="mb-24">
      <div className="flex items-center gap-6 mb-12">
        <div className="space-y-1">
          <h3 className="text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
            <Sparkles size={20} className={themeColor} /> Training Ground
          </h3>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">
            Optimalkan Hafalan & Keterampilan
          </p>
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-border/50 to-transparent" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {trainingItems.map((item, i) => (
          <Link key={i} href={item.href} className="group">
            <Card className="p-8 bg-card/30 backdrop-blur-xl border border-border rounded-[2.5rem] hover:border-foreground/10 transition-all duration-500 h-full relative overflow-hidden group shadow-xl hover:shadow-2xl glass">
              {/* Premium Glow Overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, rgba(${item.rgb}, 0.05) 0%, transparent 100%)`,
                }}
              />
              
              <div className="relative z-10 flex flex-col gap-8">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-2xl ${item.colorClass}`}
                  style={{
                    backgroundColor: "rgba(var(--background-rgb), 0.5)",
                    border: "1px solid var(--border)",
                  }}
                  role="img"
                  aria-label={`Ikon Latihan ${item.title}`}
                >
                  <item.icon size={28} aria-hidden="true" />
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-2xl font-black text-foreground tracking-tight uppercase">{item.title}</h4>
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                    {item.desc}
                  </p>
                </div>
              </div>
              
              <div className="absolute bottom-8 right-8 w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                <ChevronRight className="text-foreground" size={18} />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </motion.section>
  );
}
