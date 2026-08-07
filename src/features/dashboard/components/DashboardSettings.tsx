"use client";

/**
 * @file DashboardSettings.tsx
 * @description Dashboard settings panel component for managing study notifications, data backup/restore, local resets, and session logouts.
 * @module features/dashboard/components
 */

// ==========================================
// Import & Dependencies
// ==========================================
import { m, Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Upload, DeleteBin, LoginBox } from "@/components/ui/icons";
import NotificationManager from "@/features/notifications/NotificationManager";

// ==========================================
// Component Props Interface
// ==========================================
/**
 * Props for DashboardSettings component.
 */
interface DashboardSettingsProps {
 /** Auth state flag. */
 isAuthenticated: boolean;
 /** Export local data to file. */
 handleExportData: () => void;
 /** Import data from file. */
 handleImportData: () => void;
 /** Clear local storage data. */
 handleResetData: () => void;
 /** Sign out user. */
 handleLogout: () => void;
 /** Animation variants for container. */
 itemVariants: Variants;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Dashboard settings panel. Manage notifications and data backup.
 */
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
 <Save size={16} className="mr-2" /> Cadangkan Data
 </Button>
 <Button
 variant="outline"
 onClick={handleImportData}
 className="h-14 bg-background border-border hover:bg-primary/10 hover:border-primary hover:text-primary text-muted-foreground rounded-lg uppercase tracking-widest font-bold text-xs transition-all"
 >
 <Upload size={16} className="mr-2" /> Pulihkan Data
 </Button>
 <Button
 variant="outline"
 onClick={handleResetData}
 className="h-14 bg-destructive/5 border-destructive/20 hover:bg-destructive/20 hover:border-destructive text-destructive rounded-lg uppercase tracking-widest font-bold text-xs transition-all"
 >
 <DeleteBin size={16} className="mr-2" /> Setel Ulang Data
 </Button>
 {/* Render logout button if user logged in. */}
 {isAuthenticated && (
 <Button
 variant="outline"
 onClick={handleLogout}
 className="h-14 bg-destructive/10 border-destructive/30 hover:bg-destructive/30 hover:border-destructive text-destructive rounded-lg uppercase tracking-widest font-bold text-xs transition-all"
 >
 <LoginBox size={16} className="mr-2" /> Keluar
 </Button>
 )}
 </div>
 </div>

 </div>
 </Card>
 </m.div>
 );
}