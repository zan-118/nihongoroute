/**
 * @file SyncStatusSection.tsx
 * @description Sync status section component for settings page.
 * Shows unsynced SRS data count and manual sync trigger.
 */

"use client";

// ======================
// IMPOR
// ======================
import { m, Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cloud, CheckCircle, RefreshCw } from "@/components/ui/icons";

// ======================
// TIPE DATA
// ======================
/**
 * Props for SyncStatusSection.
 */
interface SyncStatusSectionProps {
  /** Count of unsynced SRS items. */
  dirtySrsCount: number;
  /** True if sync is active. */
  isSyncing: boolean;
  /** Callback to trigger manual sync. */
  handleManualSync: () => void;
  /** Animation variants for container. */
  itemVariants: Variants;
}

/**
 * SyncStatusSection component.
 * Renders sync status card with action button.
 */
export default function SyncStatusSection({
  dirtySrsCount,
  isSyncing,
  handleManualSync,
  itemVariants
}: SyncStatusSectionProps) {
  return (
    <m.div variants={itemVariants}>
      <Card className="glass  border border-border/80 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/[0.02] to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-6">
            {/* Icon container: yellow warning if unsynced data exists, green success if clean */}
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center border transition-all duration-300 shadow-lg ${
              dirtySrsCount > 0
                ? 'bg-warning/10 border-warning/30 text-warning shadow-[0_0_12px_rgb(var(--warning-rgb)/0.12)]'
                : 'bg-success/10 border-success/30 text-success shadow-[0_0_12px_rgb(var(--success-rgb)/0.12)]'
            }`}>
              {dirtySrsCount > 0 ? (
                <Cloud size={32} />
              ) : (
                <CheckCircle size={32} className="drop-shadow-[0_0_8px_rgb(var(--success-rgb)/0.4)]" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-lg uppercase italic tracking-tighter text-foreground flex items-center gap-2">
                Status Sinkronisasi
                {/* Ping animation when unsynced data exists */}
                <span className={`w-2 h-2 rounded-full ${dirtySrsCount > 0 ? 'bg-warning animate-ping' : 'bg-success'}`} />
              </h3>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-60">
                {dirtySrsCount > 0
                  ? `${dirtySrsCount} data belum disinkronkan`
                  : "Semua data telah sinkron & aman"}
              </p>
            </div>
          </div>
          {/* Sync button: disabled during sync or when no unsynced data */}
          <Button
            onClick={handleManualSync}
            disabled={isSyncing || dirtySrsCount === 0}
            className={`h-14 px-8 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-200 shadow-lg ${
              dirtySrsCount > 0
                ? 'bg-primary text-primary-foreground hover:scale-[1.02] shadow-primary/20 hover:shadow-primary/45'
                : 'bg-background/10 text-muted-foreground border border-border/80 opacity-50 cursor-not-allowed'
            }`}
          >
            {/* Spin icon when sync is active */}
            <RefreshCw size={18} className={`mr-3 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? "Menyinkronkan..." : "Sinkronkan Sekarang"}
          </Button>
        </div>
      </Card>
    </m.div>
  );
}