"use client";

/**
 * @file WorkspaceTabs.tsx
 * @description Tab selector workspace belajar listening (Belajar & Transkrip / Latihan Dikte / Kuis Pemahaman).
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Draft, Headphone, Pencil } from "@/components/ui/icons";

/** Tab workspace yang tersedia. */
export type WorkspaceTab = "study" | "dictation" | "quiz";

/** Props untuk WorkspaceTabs. */
interface WorkspaceTabsProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  /** Apakah tersedia baris untuk latihan dikte. */
  hasDictation: boolean;
  /** Apakah tersedia kuis pemahaman. */
  hasQuiz: boolean;
}

/**
 * Tab selector workspace belajar.
 */
export function WorkspaceTabs({ activeTab, onTabChange, hasDictation, hasQuiz }: WorkspaceTabsProps) {
  return (
 <div className="flex w-full p-1 rounded-lg bg-muted/20 border border-border/80 mb-6 glass">
 <Button
 variant={activeTab === "study" ? "default" : "ghost"}
 onClick={() => onTabChange("study")}
 className={cn(
 "flex-1 rounded-xl py-3 text-xs font-black uppercase tracking-wider transition-all h-10 flex items-center justify-center gap-1.5",
 activeTab === "study" && "shadow-md shadow-primary/20 text-primary-foreground bg-primary"
 )}
 >
 <Headphone size={14} />
 <span><span className="hidden sm:inline">Belajar & </span>Transkrip</span>
 </Button>
 <Button
 variant={activeTab === "dictation" ? "default" : "ghost"}
 disabled={!hasDictation}
 onClick={() => onTabChange("dictation")}
 className={cn(
 "flex-1 rounded-xl py-3 text-xs font-black uppercase tracking-wider transition-all h-10 flex items-center justify-center gap-1.5",
 activeTab === "dictation" && "shadow-md shadow-primary/20 text-primary-foreground bg-primary"
 )}
 >
 <Pencil size={14} />
 <span><span className="hidden sm:inline">Latihan </span>Dikte</span>
 </Button>
 {hasQuiz && (
 <Button
 variant={activeTab === "quiz" ? "default" : "ghost"}
 onClick={() => onTabChange("quiz")}
 className={cn(
 "flex-1 rounded-xl py-3 text-xs font-black uppercase tracking-wider transition-all h-10 flex items-center justify-center gap-1.5",
 activeTab === "quiz" && "shadow-md shadow-primary/20 text-primary-foreground bg-primary"
 )}
 >
 <Draft size={14} />
 <span><span className="hidden sm:inline">Kuis </span>Pemahaman</span>
 </Button>
 )}
 </div>

  );
}
