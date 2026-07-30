/**
 * @file DataManagementSection.tsx
 * @description Komponen seksi manajemen data pada halaman pengaturan.
 * @module features/settings/components
 */

"use client";

import { m, Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Upload, Trash2, LogOut, Database } from "@/components/ui/icons";

interface DataManagementSectionProps {
  isAuthenticated: boolean;
  handleExportData: () => void;
  handleImportData: () => void;
  handleResetData: () => void;
  handleLogout: () => void;
  itemVariants: Variants;
}

export default function DataManagementSection({
  isAuthenticated,
  handleExportData,
  handleImportData,
  handleResetData,
  handleLogout,
  itemVariants
}: DataManagementSectionProps) {
  return (
    <m.div variants={itemVariants} className="relative group">
      <div className="absolute -top-[6px] -right-[6px] w-[14px] h-[14px] pointer-events-none z-20">
        <div className="absolute top-0 right-0 w-[14px] h-[1px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
        <div className="absolute top-0 right-0 w-[1px] h-[14px] bg-primary/20 group-hover:bg-primary transition-colors duration-500" />
      </div>

      <Card className="bg-card border border-border/50 dark:border-white/10 rounded-2xl p-8 md:p-10 shadow-[0_4px_25px_rgba(0,0,0,0.015)] relative overflow-hidden">
        <div className="flex items-center gap-4 mb-10 relative z-10">
          <div className="size-12 rounded-lg bg-background/50 flex items-center justify-center border border-border/80 shadow-sm">
            <Database size={22} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl uppercase italic tracking-tighter text-foreground font-bold">Manajemen Data</h2>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-0.5 opacity-60">Manajemen basis data belajar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          <Button
            variant="ghost"
            onClick={handleExportData}
            className="h-16 bg-background/50 border border-border/80 hover:bg-primary/10 hover:border-primary/40 hover:text-primary text-muted-foreground rounded-lg rounded-br-none uppercase tracking-[0.2em] font-black text-[10px] transition-all duration-200 group/btn shadow-sm"
          >
            <Save size={18} className="mr-3 group-hover/btn:scale-110 group-hover/btn:text-primary transition-all text-muted-foreground/70" /> Ekspor Backup
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleImportData}
            className="h-16 bg-background/50 border border-border/80 hover:bg-secondary/10 hover:border-secondary/40 hover:text-secondary text-muted-foreground rounded-lg rounded-br-none uppercase tracking-[0.2em] font-black text-[10px] transition-all duration-200 group/btn shadow-sm"
          >
            <Upload size={18} className="mr-3 group-hover/btn:scale-110 group-hover/btn:text-secondary transition-all text-muted-foreground/70" /> Impor Backup
          </Button>
          
          <Button
            variant="ghost"
            onClick={handleResetData}
            className="h-16 bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 hover:border-destructive hover:text-destructive text-destructive/95 rounded-lg rounded-br-none uppercase tracking-[0.2em] font-black text-[10px] transition-all duration-200 group/btn shadow-sm"
          >
            <Trash2 size={18} className="mr-3 group-hover/btn:scale-110 group-hover/btn:text-destructive transition-all text-destructive/70" /> Hapus Semua Data
          </Button>
          
          {isAuthenticated && (
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="h-16 bg-background/50 border border-border/80 hover:bg-foreground/5 hover:border-foreground/20 text-muted-foreground hover:text-foreground rounded-lg rounded-br-none uppercase tracking-[0.2em] font-black text-[10px] transition-all duration-200 group/btn shadow-sm"
            >
              <LogOut size={18} className="mr-3 group-hover:translate-x-1 transition-transform text-muted-foreground/70 group-hover:text-foreground" /> Keluar Akun
            </Button>
          )}
        </div>
      </Card>
    </m.div>
  );
}
