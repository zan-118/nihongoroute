"use client";

import { motion, Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cloud, CheckCircle, RefreshCw } from "lucide-react";

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
    <motion.div variants={itemVariants}>
      <Card className="glass backdrop-blur-3xl border border-border/80 rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.02] to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 shadow-2xl ${
              dirtySrsCount > 0 
                ? 'bg-warning/10 border-warning/30 text-warning shadow-[0_0_20px_rgba(var(--warning-rgb),0.15)]' 
                : 'bg-success/10 border-success/30 text-success shadow-[0_0_20px_rgba(var(--success-rgb),0.15)]'
            }`}>
              {dirtySrsCount > 0 ? (
                <Cloud size={32} className="animate-pulse" />
              ) : (
                <CheckCircle size={32} className="drop-shadow-[0_0_8px_rgba(var(--success-rgb),0.4)]" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black uppercase italic tracking-tighter text-foreground flex items-center gap-2">
                Status Sinkronisasi
                <span className={`w-2 h-2 rounded-full ${dirtySrsCount > 0 ? 'bg-warning animate-ping' : 'bg-success animate-pulse'}`} />
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
            className={`h-14 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 shadow-xl ${
              dirtySrsCount > 0
                ? 'bg-primary text-primary-foreground hover:scale-[1.02] shadow-primary/20 hover:shadow-primary/45'
                : 'bg-background/10 text-muted-foreground border border-border/80 opacity-50 cursor-not-allowed'
            }`}
          >
            <RefreshCw size={18} className={`mr-3 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? "Menyinkronkan..." : "Sinkronkan Sekarang"}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
