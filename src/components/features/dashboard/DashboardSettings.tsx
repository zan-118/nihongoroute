"use client";

/**
 * @file DashboardSettings.tsx
 * @description Komponen panel pengaturan dashboard untuk NihongoRoute.
 * Menyediakan antarmuka untuk manajemen notifikasi belajar harian serta fitur pengelolaan data
 * seperti pencadangan (backup), pemulihan (restore), setel ulang data lokal, dan fungsi keluar (logout).
 *
 * @package components/features/dashboard
 * @project NihongoRoute
 */

// ==========================================
// IMPOR
// ==========================================
import { m, Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Upload, Trash2, LogOut } from "lucide-react";
import NotificationManager from "@/components/features/notifications/NotificationManager";

// ==========================================
// ANTARMUKA & PROPS (INTERFACES)
// ==========================================
interface DashboardSettingsProps {
  isAuthenticated: boolean;
  handleExportData: () => void;
  handleImportData: () => void;
  handleResetData: () => void;
  handleLogout: () => void;
  itemVariants: Variants;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
export default function DashboardSettings({ 
  isAuthenticated, 
  handleExportData, 
  handleImportData, 
  handleResetData, 
  handleLogout,
  itemVariants
}: DashboardSettingsProps) {
  return (
    <m.div variants={itemVariants} className="md:col-span-12">
      <Card className="bg-muted/30 border border-border rounded-lg p-6 md:p-8 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-8 mb-10">
          
          {/* PANEL KIRI: MANAJEMEN NOTIFIKASI */}
          <div className="flex-1">
            <h2 className="text-muted-foreground uppercase tracking-widest text-xs mb-6 flex items-center gap-3">
              <div className="size-1 rounded-full bg-primary" />
              Notifikasi & Retensi
            </h2>
            <NotificationManager />
          </div>

          {/* PANEL KANAN: DATA & SINKRONISASI */}
          <div className="flex-1">
            <h2 className="text-muted-foreground uppercase tracking-widest text-xs mb-6 flex items-center gap-3">
              <div className="size-1 rounded-full bg-border" />
              Data & Sinkronisasi
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={handleExportData}
                className="h-14 bg-background border-border hover:bg-primary/10 hover:border-primary hover:text-primary text-muted-foreground rounded-lg uppercase tracking-widest font-bold text-xs transition-all"
              >
                <Save size={16} className="mr-2" /> Backup Data
              </Button>
              <Button
                variant="outline"
                onClick={handleImportData}
                className="h-14 bg-background border-border hover:bg-secondary/10 hover:border-secondary hover:text-secondary text-muted-foreground rounded-lg uppercase tracking-widest font-bold text-xs transition-all"
              >
                <Upload size={16} className="mr-2" /> Restore Data
              </Button>
              <Button
                variant="outline"
                onClick={handleResetData}
                className="h-14 bg-destructive/5 border-destructive/20 hover:bg-destructive/20 hover:border-destructive text-destructive rounded-lg uppercase tracking-widest font-bold text-xs transition-all"
              >
                <Trash2 size={16} className="mr-2" /> Reset Data
              </Button>
              {isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="h-14 bg-destructive/10 border-destructive/30 hover:bg-destructive/30 hover:border-destructive text-destructive rounded-lg uppercase tracking-widest font-bold text-xs transition-all"
                >
                  <LogOut size={16} className="mr-2" /> Keluar
                </Button>
              )}
            </div>
          </div>

        </div>
      </Card>
    </m.div>
  );
}

