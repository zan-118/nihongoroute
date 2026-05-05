"use client";

import { motion, Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cloud, CloudCheck, RefreshCw } from "lucide-react";

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
      <Card className="bg-card backdrop-blur-xl border border-border rounded-2xl p-6 neo-card shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${dirtySrsCount > 0 ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}>
              {dirtySrsCount > 0 ? <Cloud size={24} /> : <CloudCheck size={24} />}
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-tight text-foreground">Status Sinkronisasi</h3>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5">
                {dirtySrsCount > 0 ? `${dirtySrsCount} Item belum tersinkron` : "Semua data aman di Cloud"}
              </p>
            </div>
          </div>
          <Button 
            onClick={handleManualSync}
            disabled={isSyncing || dirtySrsCount === 0}
            variant="outline" 
            className="h-10 px-4 bg-muted/30 border-border rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            <RefreshCw size={14} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? "Sinkron..." : "Sinkron Sekarang"}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
