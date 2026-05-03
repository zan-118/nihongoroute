"use client";

import { motion, Variants } from "framer-motion";
import { Sparkles, BrainCircuit, Target, BookMarked, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import ProfileEditor from "../user/ProfileEditor";

interface DashboardHeroProps {
  loading: boolean;
  guestId: string;
  dueCount: number;
  itemVariants: Variants;
}

export default function DashboardHero({ loading, guestId, dueCount, itemVariants }: DashboardHeroProps) {
  return (
    <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center justify-between mb-16">
      <div className="flex-1 w-full flex flex-col items-center lg:items-start text-center lg:text-left">
        {loading ? (
          <Skeleton className="h-6 w-32 rounded-full mb-6" />
        ) : (
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 w-fit shadow-none">
            <Sparkles size={14} /> ID: {guestId}
          </Badge>
        )}
        
        {loading ? (
          <div className="space-y-4 mb-4">
            <Skeleton className="h-16 w-64 md:w-96" />
            <Skeleton className="h-4 w-48 md:w-64" />
          </div>
        ) : (
          <ProfileEditor />
        )}
      </div>

      {/* MAIN CALL TO ACTION */}
      <div className="w-full lg:w-[400px] shrink-0">
        {loading ? (
          <Skeleton className="h-[280px] w-full rounded-2xl" />
        ) : (
        <Card className="p-6 md:p-8 rounded-2xl bg-card border border-border shadow-lg relative overflow-hidden group transition-all duration-300 hover:border-primary/40 hover:bg-primary/[0.02]">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg border ${dueCount > 0 ? 'bg-primary/20 border-primary/50' : 'bg-emerald-500/20 border-emerald-500/50 animate-pulse'}`}>
              {dueCount > 0 ? (
                <BrainCircuit size={40} className="text-primary" />
              ) : (
                <Sparkles size={40} className="text-emerald-400" />
              )}
            </div>
            
            <h3 className={`text-lg md:text-xl font-black uppercase tracking-tight mb-2 ${dueCount > 0 ? 'text-foreground' : 'text-emerald-500'}`}>
              {dueCount > 0 ? "Waktunya Sapa Ingatan!" : "Ingatanmu Hebat!"}
            </h3>
            <p className="text-muted-foreground text-xs md:text-sm mb-6 font-medium">
              {dueCount > 0 
                ? `Ada ${dueCount} kosakata yang kangen kamu nih. Yuk, segarkan ingatanmu sebentar!` 
                : "Semua hafalanmu masih segar bugar! Mau coba pelajari materi baru?"}
            </p>

            {dueCount > 0 ? (
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button asChild className="flex-1 h-14 bg-primary hover:bg-foreground text-primary-foreground font-black uppercase tracking-widest rounded-2xl text-[10px] md:text-xs transition-all shadow-lg border-none">
                  <Link href="/review">
                    Mulai Sesi Review <Target size={16} className="ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 h-14 bg-background border-border hover:bg-primary/10 hover:border-primary hover:text-primary rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all">
                  <Link href="/review/quick">
                    <Zap size={16} className="mr-2" /> Quick Quiz
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button asChild className="flex-1 h-14 bg-foreground text-background hover:bg-emerald-500 hover:text-white font-black uppercase tracking-widest rounded-2xl text-[10px] md:text-xs transition-all shadow-lg border-none">
                  <Link href="/courses">
                    Pelajari Materi Baru <BookMarked size={16} className="ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 h-14 bg-background border-border hover:bg-primary/10 hover:border-primary hover:text-primary rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all">
                  <Link href="/review/quick">
                    <Zap size={16} className="mr-2" /> Quick Quiz
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </Card>
        )}
        
        {/* SMART TIPS / ONBOARDING */}
        {!loading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex gap-4 items-center"
          >
            <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Zap size={14} />
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-0.5">Pro Tip</h4>
              <p className="text-[11px] text-muted-foreground leading-snug font-medium">
                {Math.random() > 0.5 
                  ? "Aktifkan notifikasi di pengaturan agar tidak ketinggalan sesi review krusial." 
                  : "Beli 'Streak Freeze' di shop untuk melindungi progresmu saat libur belajar."}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
