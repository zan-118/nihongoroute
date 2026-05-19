"use client";

import { motion, Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Upload, Trash2, LogOut } from "lucide-react";
import NotificationManager from "@/components/features/notifications/NotificationManager";

interface DashboardSettingsProps {
  isAuthenticated: boolean;
  handleExportData: () => void;
  handleImportData: () => void;
  handleResetData: () => void;
  handleLogout: () => void;
  itemVariants: Variants;
}

export default function DashboardSettings({ 
  isAuthenticated, 
  handleExportData, 
  handleImportData, 
  handleResetData, 
  handleLogout,
  itemVariants
}: DashboardSettingsProps) {
  return (
    <motion.div variants={itemVariants} className="md:col-span-12">
      <Card className="bg-muted/30 border border-border rounded-2xl p-6 md:p-8 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-8 mb-10">
          <div className="flex-1">
            <h2 className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-primary" />
              Notifikasi & Retensi
            </h2>
            <NotificationManager />
          </div>
          <div className="flex-1">
            <h2 className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-border" />
              Data & Sinkronisasi
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={handleExportData}
                className="h-14 bg-background border-border hover:bg-primary/10 hover:border-primary hover:text-primary text-muted-foreground rounded-2xl uppercase tracking-widest font-bold text-xs transition-all"
              >
                <Save size={16} className="mr-2" /> Backup Data
              </Button>
              <Button
                variant="outline"
                onClick={handleImportData}
                className="h-14 bg-background border-border hover:bg-secondary/10 hover:border-secondary hover:text-secondary text-muted-foreground rounded-2xl uppercase tracking-widest font-bold text-xs transition-all"
              >
                <Upload size={16} className="mr-2" /> Restore Data
              </Button>
              <Button
                variant="outline"
                onClick={handleResetData}
                className="h-14 bg-destructive/5 border-destructive/20 hover:bg-destructive/20 hover:border-destructive text-destructive rounded-2xl uppercase tracking-widest font-bold text-xs transition-all"
              >
                <Trash2 size={16} className="mr-2" /> Reset Data
              </Button>
              {isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="h-14 bg-destructive/10 border-destructive/30 hover:bg-destructive/30 hover:border-destructive text-destructive rounded-2xl uppercase tracking-widest font-bold text-xs transition-all"
                >
                  <LogOut size={16} className="mr-2" /> Keluar
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
