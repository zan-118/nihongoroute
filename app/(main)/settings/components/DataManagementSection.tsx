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
      <Card className="bg-card backdrop-blur-xl border border-border rounded-2xl p-6 md:p-7 neo-card shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/15">
            <Database size={20} className="text-primary" />
          </div>
          <h2 className="text-foreground font-black uppercase italic tracking-tight text-base">Kelola Data & Akun</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleExportData}
            className="h-12 bg-muted/30 border-border hover:bg-primary/10 hover:border-primary/30 hover:text-primary text-muted-foreground rounded-xl uppercase tracking-wider font-bold text-xs transition-all group"
          >
            <Save size={16} className="mr-2 group-hover:scale-110 transition-transform" /> Simpan Backup
          </Button>
          <Button
            variant="outline"
            onClick={handleImportData}
            className="h-12 bg-muted/30 border-border hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-600 dark:hover:text-purple-400 text-muted-foreground rounded-xl uppercase tracking-wider font-bold text-xs transition-all group"
          >
            <Upload size={16} className="mr-2 group-hover:scale-110 transition-transform" /> Muat Backup
          </Button>
          <Button
            variant="outline"
            onClick={handleResetData}
            className="h-12 bg-destructive/5 border-destructive/10 hover:bg-destructive/15 hover:border-destructive text-destructive rounded-xl uppercase tracking-wider font-bold text-xs transition-all group"
          >
            <Trash2 size={16} className="mr-2 group-hover:scale-110 transition-transform" /> Reset Semua Progres
          </Button>
          {isAuthenticated && (
            <Button
              variant="outline"
              onClick={handleLogout}
              className="h-12 bg-destructive/10 border-destructive/15 hover:bg-destructive/20 hover:border-destructive text-destructive rounded-xl uppercase tracking-wider font-bold text-xs transition-all group"
            >
              <LogOut size={16} className="mr-2 group-hover:translate-x-0.5 transition-transform" /> Keluar Akun
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
