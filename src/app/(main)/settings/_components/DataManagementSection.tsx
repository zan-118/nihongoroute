"use client";

import { motion, Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Upload, Trash2, LogOut, Database } from "lucide-react";

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
    <motion.div variants={itemVariants}>
      <Card className="glass backdrop-blur-3xl border border-border/80 rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[100px] rounded-full -mr-16 -mt-16 pointer-events-none group-hover:bg-primary/15 transition-colors duration-500" />
        
        <div className="flex items-center gap-4 mb-10 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-background/30 flex items-center justify-center border border-border/80 shadow-2xl">
            <Database size={22} className="text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)] animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter text-foreground">Manajemen Data</h2>
            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-0.5 opacity-60">Manajemen basis data belajar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
          <Button
            variant="ghost"
            onClick={handleExportData}
            className="h-16 bg-background/20 border border-border/80 hover:bg-primary/15 hover:border-primary/40 hover:text-primary text-muted-foreground rounded-2xl uppercase tracking-[0.2em] font-black text-[10px] transition-all duration-300 group/btn shadow-xl hover:-translate-y-0.5"
          >
            <Save size={18} className="mr-3 group-hover/btn:scale-110 group-hover/btn:text-primary transition-all text-muted-foreground/70" /> Ekspor Backup
          </Button>
          <Button
            variant="ghost"
            onClick={handleImportData}
            className="h-16 bg-background/20 border border-border/80 hover:bg-secondary/15 hover:border-secondary/40 hover:text-secondary text-muted-foreground rounded-2xl uppercase tracking-[0.2em] font-black text-[10px] transition-all duration-300 group/btn shadow-xl hover:-translate-y-0.5"
          >
            <Upload size={18} className="mr-3 group-hover/btn:scale-110 group-hover/btn:text-secondary transition-all text-muted-foreground/70" /> Impor Backup
          </Button>
          <Button
            variant="ghost"
            onClick={handleResetData}
            className="h-16 bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 hover:border-destructive hover:text-destructive text-destructive/95 rounded-2xl uppercase tracking-[0.2em] font-black text-[10px] transition-all duration-300 group/btn shadow-xl hover:-translate-y-0.5"
          >
            <Trash2 size={18} className="mr-3 group-hover/btn:scale-110 group-hover/btn:text-destructive transition-all text-destructive/70" /> Hapus Semua Data
          </Button>
          {isAuthenticated && (
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="h-16 bg-background/20 border border-border/80 hover:bg-foreground/5 hover:border-foreground/20 text-muted-foreground hover:text-foreground rounded-2xl uppercase tracking-[0.2em] font-black text-[10px] transition-all duration-300 group/btn shadow-xl hover:-translate-y-0.5"
            >
              <LogOut size={18} className="mr-3 group-hover:translate-x-1 transition-transform text-muted-foreground/70 group-hover:text-foreground" /> Keluar Akun
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
