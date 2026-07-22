/**
 * @file DataManagementSection.tsx
 * @description Komponen seksi manajemen data pada halaman pengaturan.
 * Menyediakan tombol ekspor, impor, hapus data, dan logout.
 */

"use client";

// ======================
// IMPOR
// ======================
import { m, Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Upload, Trash2, LogOut, Database } from "@/components/ui/icons";

// ======================
// TIPE DATA
// ======================
/**
 * Props for DataManagementSection component.
 */
interface DataManagementSectionProps {
  /** User authentication status. */
  isAuthenticated: boolean;
  /** Trigger data export. */
  handleExportData: () => void;
  /** Trigger data import. */
  handleImportData: () => void;
  /** Trigger data reset. */
  handleResetData: () => void;
  /** Trigger user logout. */
  handleLogout: () => void;
  /** Framer motion animation variants. */
  itemVariants: Variants;
}

/**
 * Data management section component.
 * Renders export, import, reset, and logout buttons.
 */
export default function DataManagementSection({
  isAuthenticated,
  handleExportData,
  handleImportData,
  handleResetData,
  handleLogout,
  itemVariants
}: DataManagementSectionProps) {
  return (
    // Animate section entry
    <m.div variants={itemVariants}>
      <Card className="glass  border border-border/80 rounded-[2.5rem] p-8 md:p-10 shadow-xl relative overflow-hidden group">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 size-40 bg-primary/8 blur-[55px] rounded-full -mr-14 -mt-14 pointer-events-none group-hover:bg-primary/12 transition-colors duration-300 ambient-glow will-change-transform" />

        {/* Section header with icon */}
        <div className="flex items-center gap-4 mb-10 relative z-10">
          <div className="size-12 rounded-lg bg-background/30 flex items-center justify-center border border-border/80 shadow-lg">
            <Database size={22} className="text-primary drop-shadow-[0_0_6px_rgb(var(--primary-rgb)/0.3)]" />
          </div>
          <div>
            <h2 className="text-xl uppercase italic tracking-tighter text-foreground">Manajemen Data</h2>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-0.5 opacity-60">Manajemen basis data belajar</p>
          </div>
        </div>

        {/* Action buttons grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          {/* Export button */}
          <Button
            variant="ghost"
            onClick={handleExportData}
            className="h-16 bg-background/20 border border-border/80 hover:bg-primary/15 hover:border-primary/40 hover:text-primary text-muted-foreground rounded-lg uppercase tracking-[0.2em] font-black text-[10px] transition-all duration-200 group/btn shadow-sm hover:-translate-y-0.5"
          >
            <Save size={18} className="mr-3 group-hover/btn:scale-110 group-hover/btn:text-primary transition-all text-muted-foreground/70" /> Ekspor Backup
          </Button>
          
          {/* Import button */}
          <Button
            variant="ghost"
            onClick={handleImportData}
            className="h-16 bg-background/20 border border-border/80 hover:bg-secondary/15 hover:border-secondary/40 hover:text-secondary text-muted-foreground rounded-lg uppercase tracking-[0.2em] font-black text-[10px] transition-all duration-200 group/btn shadow-sm hover:-translate-y-0.5"
          >
            <Upload size={18} className="mr-3 group-hover/btn:scale-110 group-hover/btn:text-secondary transition-all text-muted-foreground/70" /> Impor Backup
          </Button>
          
          {/* Reset button */}
          <Button
            variant="ghost"
            onClick={handleResetData}
            className="h-16 bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 hover:border-destructive hover:text-destructive text-destructive/95 rounded-lg uppercase tracking-[0.2em] font-black text-[10px] transition-all duration-200 group/btn shadow-sm hover:-translate-y-0.5"
          >
            <Trash2 size={18} className="mr-3 group-hover/btn:scale-110 group-hover/btn:text-destructive transition-all text-destructive/70" /> Hapus Semua Data
          </Button>
          
          {/* Logout button shown only if authenticated */}
          {isAuthenticated && (
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="h-16 bg-background/20 border border-border/80 hover:bg-foreground/5 hover:border-foreground/20 text-muted-foreground hover:text-foreground rounded-lg uppercase tracking-[0.2em] font-black text-[10px] transition-all duration-200 group/btn shadow-sm hover:-translate-y-0.5"
            >
              <LogOut size={18} className="mr-3 group-hover:translate-x-1 transition-transform text-muted-foreground/70 group-hover:text-foreground" /> Keluar Akun
            </Button>
          )}
        </div>
      </Card>
    </m.div>
  );
}