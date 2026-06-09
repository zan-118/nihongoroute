"use client";

/**
 * @file HomePanel.tsx
 * @description Komponen panel Beranda (Home Panel) pada dashboard NihongoRoute.
 * Menyusun struktur layout utama dashboard yang menggabungkan DashboardHero, peta penguasaan Kanji,
 * modul Misi Harian (Daily Quests), serta widget Ungkapan Harian (Daily Expression).
 *
 * @package components/features/dashboard/panels
 * @project NihongoRoute
 */

// ==========================================
// IMPOR
// ==========================================
import dynamic from "next/dynamic";
import DashboardHero from "../DashboardHero";
import DailyQuests from "../quests/DailyQuests";
import DailyExpression from "../DailyExpression";
import LearningTimelinePanel from "@/components/features/ecosystem/LearningTimelinePanel";
import NextActionPanel from "@/components/features/ecosystem/NextActionPanel";
import { Variants } from "framer-motion";
import { RandomExpression } from "@/actions/expressions.actions";

// ==========================================
// ELEMEN DINAMIS (LAZY LOADING)
// ==========================================
const KanjiProgressGrid = dynamic(() => import("../KanjiProgressGrid"), { 
  ssr: false,
  loading: () => <div className="h-[200px] w-full animate-pulse bg-muted rounded-2xl" />
});

// ==========================================
// ANTARMUKA & PROPS (INTERFACES)
// ==========================================
interface HomePanelProps {
  loading: boolean;
  guestId: string;
  dueCount: number;
  itemVariants: Variants;
  isAuthenticated: boolean;
  expression: RandomExpression | null;
  courseMetadata: Array<{
    id?: string;
    _id?: string;
    title: string;
    slug: string;
    lessons: Array<{
      id?: string;
      _id?: string;
      title: string;
      slug: string;
    }>;
  }>;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
export function HomePanel({
  loading,
  guestId,
  dueCount,
  itemVariants,
  isAuthenticated,
  expression,
  courseMetadata,
}: HomePanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-[55px]">
      
      {/* KOLOM UTAMA (SISI KIRI) */}
      <div className="lg:col-span-8 space-y-[89px]">
        <DashboardHero 
          loading={loading} 
          guestId={guestId} 
          dueCount={dueCount}
          itemVariants={itemVariants}
          isAuthenticated={isAuthenticated}
          courseMetadata={courseMetadata as unknown as Array<{
            _id: string;
            title: string;
            slug: string;
            lessons: Array<{
              _id: string;
              title: string;
              slug: string;
            }>;
          }>}
        />

        <NextActionPanel />
        
        <section className="space-y-[34px]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-[13px]">
              <div className="w-[34px] h-[1px] bg-primary/40" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                Ringkasan Belajar
              </h2>
            </div>
            <h3 className="text-3xl font-bold tracking-tight text-foreground">
              Rangkuman <span className="text-muted-foreground font-medium">Progresmu</span>
            </h3>
          </div>
          
          <div className="p-[21px] rounded-[34px] bg-card/30 backdrop-blur-sm border border-border">
            <KanjiProgressGrid />
          </div>
        </section>
      </div>
      
      {/* PANEL SAMPING (SISI KANAN - STICKY) */}
      <aside className="lg:col-span-4 space-y-[34px]">
        <div className="sticky top-[100px] space-y-[21px]">
          <DailyQuests />
          <DailyExpression expression={expression} />
          <LearningTimelinePanel compact />
        </div>
      </aside>

    </div>
  );
}
