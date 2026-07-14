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
import { Variants } from "framer-motion";
import { RandomExpression } from "@/actions/expressions.actions";

// ==========================================
// ELEMEN DINAMIS (LAZY LOADING)
// ==========================================
/**
 * Lazy load KanjiProgressGrid component.
 * Disable SSR to prevent hydration mismatch from client-side state.
 */
const KanjiProgressGrid = dynamic(() => import("../KanjiProgressGrid"), { 
  ssr: false,
  // Render skeleton loader during client-side load.
  loading: () => <div className="h-[200px] w-full animate-pulse bg-muted rounded-lg" />
});

// ==========================================
// ANTARMUKA & PROPS (INTERFACES)
// ==========================================
/**
 * Props for HomePanel component.
 */
interface HomePanelProps {
  /** Loading state indicator. */
  loading: boolean;
  /** Unique identifier for guest user. */
  guestId: string;
  /** Number of items due for review. */
  dueCount: number;
  /** Framer motion animation variants. */
  itemVariants: Variants;
  /** User authentication status. */
  isAuthenticated: boolean;
  /** Random daily expression data. */
  expression: RandomExpression | null;
  /** Course structure metadata. */
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
/**
 * Home panel component.
 * Renders dashboard hero, kanji progress, daily quests, and daily expression.
 */
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
          // Cast metadata to match DashboardHero expected type structure.
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
        
        <section className="space-y-[34px]">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-[13px]">
              <div className="w-[34px] h-[1px] bg-primary/40" />
              <h2 className="text-[10px] uppercase tracking-[0.2em] text-primary">
                Ringkasan Belajar
              </h2>
            </div>
            <h3 className="text-3xl tracking-tight text-foreground">
              Rangkuman <span className="text-muted-foreground font-medium">Progresmu</span>
            </h3>
          </div>
          
          <div className="p-[21px] rounded-[34px] bg-card/30  border border-border">
            <KanjiProgressGrid />
          </div>
        </section>
      </div>
      
      {/* PANEL SAMPING (SISI KANAN - STICKY) */}
      <aside className="lg:col-span-4 space-y-[34px]">
        <div className="sticky top-[100px] space-y-[21px]">
          <DailyQuests />
          <DailyExpression expression={expression} />
        </div>
      </aside>

    </div>
  );
}