/**
 * @file SessionSummaryModal.tsx
 * @description Modal dialog component displaying flashcard study session results. Shows memory accuracy stats, maximum streak combo, study duration, total XP gained, and mistake review options.
 */

// Import & Dependencies

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Fire, Refresh, Time, Zap } from "@/components/ui/icons";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

// Component Props Interface

/**
 * Props for SessionSummaryModal component.
 */
interface SessionSummaryModalProps {
 /** Flag indicating if the session has finished */
 isFinished: boolean;
 /** Callback to update the finished state */
 setIsFinished: (val: boolean) => void;
 /** Total number of cards reviewed in the session */
 cardsCount: number;
 /** Statistics gathered during the session */
 sessionStats: { 
 /** Number of cards marked as known */
 known: number; 
 /** Number of cards marked as learning/forgotten */
 learning: number; 
 /** Total XP gained during the session */
 xpGained: number;
 /** Maximum consecutive correct answers */
 maxCombo: number;
 /** Percentage of correct answers */
 accuracy: number;
 /** Duration of the session in seconds */
 duration: number;
 };
 /** Background color class for the top accent bar */
 themeBgColor: string;
 /** Shadow class for the top accent bar */
 themeShadow: string;
 /** Callback to restart the entire session */
 handleRestart: () => void;
 /** Callback to start reviewing incorrect cards */
 handleReviewMistakes: () => void;
 /** Number of incorrect cards available for review */
 mistakeCount: number;
 /** Next.js App Router instance for navigation */
 router: AppRouterInstance;
}

// Main Component

/**
 * Modal dialog showing flashcard session summary.
 * Displays accuracy, combo, duration, XP, and action buttons.
 */
export function SessionSummaryModal({
 isFinished,
 setIsFinished,
 cardsCount,
 sessionStats,
 themeBgColor,
 themeShadow,
 handleRestart,
 handleReviewMistakes,
 mistakeCount,
 router,
}: SessionSummaryModalProps) {
 /**
 * Get rating title, color, and background style based on accuracy.
 */
 const getRating = (accuracy: number) => {
 if (accuracy >= 90) return { title: "Luar Biasa!", color: "text-success", bg: "bg-success/5 border-success/20 shadow-sm" };
 if (accuracy >= 70) return { title: "Bagus Sekali!", color: "text-warning", bg: "bg-warning/5 border-warning/20 shadow-sm" };
 return { title: "Mari Terus Latihan!", color: "text-primary", bg: "bg-primary/5 border-primary/20 shadow-sm" };
 };

 // Get rating details based on accuracy
 const rating = getRating(sessionStats.accuracy || 0);

 /**
 * Format seconds into MM:SS string.
 */
 const formatDuration = (sec: number) => {
 const mins = Math.floor(sec / 60);
 const secs = sec % 60;
 return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
 };

 return (
 <Dialog open={isFinished} onOpenChange={setIsFinished}>
 <DialogContent className="max-w-md w-[90%] md:w-full p-0 border-none bg-transparent shadow-none mx-auto transition-colors duration-300">
 <Card className="w-full bg-card p-8 md:p-10 rounded-lg border border-border text-center relative overflow-hidden shadow-2xl">
 {/* Top accent bar */}
 <div className={`absolute top-0 left-0 right-0 h-1.5 ${themeBgColor} ${themeShadow}`} />

  {/* Trophy icon container */}
  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-muted/50 dark:bg-background/5 rounded-xl flex items-center justify-center border border-border mb-6 shadow-none">
  <Trophy
  size={32}
  aria-hidden="true"
  className="text-warning drop-shadow-sm"
  />
  </div>

  <DialogHeader>
  <DialogTitle className="text-2xl md:text-3xl font-black text-foreground uppercase tracking-tight mb-2 text-center">
  Sesi Selesai
  </DialogTitle>
  </DialogHeader>

  {/* Performance rating banner */}
  <Card className={`py-4 rounded-xl border mb-6 flex justify-center items-center shadow-none ${rating.bg}`}>
  <span className={`text-base md:text-lg font-black uppercase tracking-wider ${rating.color}`}>
  {rating.title}
  </span>
  </Card>

  <p className="text-muted-foreground text-xs md:text-xs mb-6 uppercase font-bold tracking-wider">
  {cardsCount} KARTU SELESAI DITINJAU
  </p>

  {/* Known vs Learning stats */}
  <div className="grid grid-cols-2 gap-4 mb-6">
  <Card className="bg-success/5 border border-success/20 p-5 rounded-xl flex flex-col items-center shadow-none">
  <span className="text-2xl md:text-3xl font-black text-success">
  {sessionStats.known}
  </span>
  <span className="text-[10px] font-bold text-success/80 uppercase tracking-wider mt-2">
  Sudah Hafal
  </span>
  </Card>
  <Card className="bg-primary/5 border border-primary/20 p-5 rounded-xl flex flex-col items-center shadow-none">
  <span className="text-2xl md:text-3xl font-black text-primary">
  {sessionStats.learning}
  </span>
  <span className="text-[10px] font-bold text-primary/80 uppercase tracking-wider mt-2">
  Masih Lupa
  </span>
  </Card>
  </div>

  {/* Accuracy, Combo, and Duration stats */}
  <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
  <Card className="bg-card border border-border p-4 rounded-xl flex flex-col items-center shadow-none">
  <span className="text-lg md:text-xl font-black text-foreground">
  {sessionStats.accuracy}%
  </span>
  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1 text-center">
  Akurasi
  </span>
  </Card>
  <Card className="bg-card border border-border p-4 rounded-xl flex flex-col items-center shadow-none">
  <span className="text-lg md:text-xl font-black text-foreground flex items-center gap-1">
  <Zap size={14} className="text-warning fill-warning/30" />
  {sessionStats.maxCombo}
  </span>
  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1 text-center">
  Maks Kombo
  </span>
  </Card>
  <Card className="bg-card border border-border p-4 rounded-xl flex flex-col items-center shadow-none">
  <span className="text-lg md:text-xl font-black text-foreground flex items-center gap-1">
  <Time size={14} className="text-primary" />
  {formatDuration(sessionStats.duration)}
  </span>
  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-1 text-center">
  Durasi
  </span>
  </Card>
  </div>

  {/* XP Gained banner */}
  <Card className="bg-muted/50 dark:bg-background/5 py-4 rounded-xl border border-border mb-6 flex justify-center items-center gap-3 shadow-none">
  <Fire size={18} aria-hidden="true" className="text-primary" />
  <span className="text-foreground font-mono font-black text-base md:text-lg">
  +{sessionStats.xpGained} XP
  </span>
  </Card>

  {/* Action buttons */}
  <div className="flex flex-col gap-3">
  {mistakeCount > 0 && (
  <Button
  onClick={handleReviewMistakes}
  className="w-full h-auto py-4 rounded-xl text-xs md:text-xs font-bold uppercase tracking-wider border border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-lg"
  >
  Ulas {mistakeCount} Kesalahan
  </Button>
  )}
  <Button
  onClick={handleRestart}
  className={`w-full h-auto py-4 rounded-xl text-xs md:text-xs font-bold uppercase tracking-wider border-none bg-primary text-primary-foreground hover:bg-foreground hover:text-background transition-all shadow-lg`}
  >
  <Refresh size={16} aria-hidden="true" className="mr-2" /> Ulangi Semua
  </Button>
  <Button
  variant="ghost"
  onClick={() => router.push("/dashboard")}
  className="w-full h-auto py-4 text-muted-foreground hover:text-foreground font-bold uppercase tracking-wider text-xs md:text-xs border border-border bg-muted dark:bg-background/5 rounded-xl transition-all"
  >
  Kembali ke Dashboard
  </Button>
 </div>
 </Card>
 </DialogContent>
 </Dialog>
 );
}