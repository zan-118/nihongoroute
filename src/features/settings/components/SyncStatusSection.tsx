/**
 * @file SyncStatusSection.tsx
 * @description Komponen seksi status sinkronisasi pada halaman pengaturan.
 * @module features/settings/components
 */

"use client";

import { m, Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cloud, Check, RefreshCw } from "@/components/ui/icons";

interface SyncStatusSectionProps {
 dirtySrsCount: number;
 isSyncing: boolean;
 handleManualSync: () => void;
 itemVariants: Variants;
}

export default function SyncStatusSection({
 dirtySrsCount,
 isSyncing,
 handleManualSync,
 itemVariants
}: SyncStatusSectionProps) {
 return (
 <m.div variants={itemVariants} className="relative group">
 <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 pointer-events-none z-20">
 <div className="absolute top-0 right-0 w-3.5 h-px bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
 <div className="absolute top-0 right-0 w-px h-3.5 bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
 </div>

 <Card className="bg-card border border-border/50 dark:border-white/10 rounded-2xl p-8 shadow-[0_4px_25px_rgba(0,0,0,0.015)] relative overflow-hidden">
 <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
 <div className="flex items-center gap-6">
 <div className={`w-16 h-16 rounded-lg flex items-center justify-center border transition-all duration-300 shadow-sm ${
 dirtySrsCount > 0
 ? 'bg-warning/10 border-warning/30 text-warning'
 : 'bg-success/10 border-success/30 text-success'
 }`}>
 {dirtySrsCount > 0 ? (
 <Cloud size={32} />
 ) : (
 <Check size={32} />
 )}
 </div>
 <div className="space-y-1">
 <h3 className="text-lg uppercase italic tracking-tighter text-foreground flex items-center gap-2 font-bold">
 Status Sinkronisasi
 <span className={`w-2 h-2 rounded-full ${dirtySrsCount > 0 ? 'bg-warning animate-ping' : 'bg-success'}`} />
 </h3>
 <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">
 {dirtySrsCount > 0
 ? `${dirtySrsCount} data belum disinkronkan`
 : "Semua data telah sinkron & aman"}
 </p>
 </div>
 </div>
 <Button
 onClick={handleManualSync}
 disabled={isSyncing || dirtySrsCount === 0}
 className={`h-14 px-8 rounded-lg rounded-br-none text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-200 shadow-md ${
 dirtySrsCount > 0
 ? 'bg-primary text-primary-foreground hover:scale-[1.02]'
 : 'bg-background/10 text-muted-foreground border border-border/80 opacity-50 cursor-not-allowed'
 }`}
 >
 <RefreshCw size={18} className={`mr-3 ${isSyncing ? 'animate-spin' : ''}`} />
 {isSyncing ? "Menyinkronkan..." : "Sinkronkan Sekarang"}
 </Button>
 </div>
 </Card>
 </m.div>
 );
}
