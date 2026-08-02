"use client";

/**
 * @file NotificationManager.tsx
 * @description Komponen visual untuk mengelola izin notifikasi web peramban (Web Notification API) di NihongoRoute.
 * Menyediakan sakelar pengaktifan pengingat SRS dan pengujian pengiriman notifikasi instan melalui Service Worker.
 */

// ======================
// IMPOR
// ======================
import { useState, useEffect } from "react";
import { Bell, BellOff, BellRing, Settings2 } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useUIStore } from "@/store/useUIStore";

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * NotificationManager component.
 * Renders UI to toggle SRS reminders and request browser notification permissions.
 */
export default function NotificationManager() {
 const settings = useUIStore((state) => state.settings);
 const toggleNotifications = useUIStore((state) => state.toggleNotifications);
 const notificationsEnabled = settings?.notificationsEnabled || false;
 
 // Initialize permission state from window.Notification if available
 const [permission, setPermission] = useState<NotificationPermission>(() => {
 if (typeof window !== "undefined" && "Notification" in window) {
 return Notification.permission;
 }
 return "default";
 });

 const isEnabled = notificationsEnabled;

 /**
 * Requests permission for web notifications.
 * Triggers test notification if permission is granted.
 */
 const requestPermission = async () => {
 // Check if browser supports Notification API
 if (!("Notification" in window)) {
 toast.error("Browser Tidak Mendukung", {
 description: "Browser kamu belum support notifikasi web."
 });
 return;
 }

 try {
 // Request permission from user
 const res = await Notification.requestPermission();
 setPermission(res);
 if (res === "granted") {
 toggleNotifications(true);
 toast.success("Notifikasi Aktif!", {
 description: "Kamu bakal dapat pengingat buat sesi review selanjutnya."
 });
 
 // Uji notifikasi menggunakan Service Worker jika tersedia (lebih baik untuk perangkat Mobile)
 if ("serviceWorker" in navigator) {
 navigator.serviceWorker.ready.then((registration) => {
 registration.showNotification("NihongoRoute", {
 body: "Notifikasi aktif! Kamu bakal diingatkan kalau ada kartu yang perlu di-review.",
 icon: "/logo-branding.png",
 badge: "/logo-branding.png",
 vibrate: [100, 50, 100],
 
 } as NotificationOptions);
 }).catch(() => {
 // Fallback to standard Notification API if Service Worker fails
 new Notification("NihongoRoute", {
 body: "Notifikasi aktif! Kamu bakal diingatkan kalau ada kartu yang perlu di-review.",
 icon: "/logo-branding.png"
 });
 });
 } else {
 // Fallback to standard Notification API if Service Worker is not supported
 new Notification("NihongoRoute", {
 body: "Notifikasi aktif! Kamu bakal diingatkan kalau ada kartu yang perlu di-review.",
 icon: "/logo-branding.png"
 });
 }
 } else {
 toggleNotifications(false);
 toast.warning("Izin Ditolak", {
 description: "Kamu nggak akan dapat notifikasi pengingat."
 });
 }
 } catch (err) {
 console.error("Gagal meminta izin notifikasi:", err);
 }
 };

 return (
 <Card className="p-6 rounded-lg bg-card border border-border shadow-lg relative overflow-hidden group">
 <div className="absolute -top-4 -right-4 text-primary/5 rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700">
 <Bell size={100} />
 </div>

 <div className="relative z-10 flex flex-col gap-6">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isEnabled ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
 {isEnabled ? <BellRing size={20} /> : <BellOff size={20} />}
 </div>
 <div>
 <h4 className="text-xs text-primary uppercase tracking-widest mb-0.5">Retensi PWA</h4>
 <h3 className="text-sm text-foreground uppercase tracking-tight">Pengingat Review</h3>
 </div>
 </div>
 <Switch 
 checked={isEnabled}
 onCheckedChange={(checked: boolean) => {
 // Request permission if enabling and not yet granted, otherwise toggle state
 if (checked && permission !== "granted") {
 requestPermission();
 } else {
 toggleNotifications(checked);
 if (checked) {
 toast.success("Pengingat Diaktifkan");
 } else {
 toast.info("Pengingat Dinonaktifkan");
 }
 }
 }}
 />
 </div>

 <p className="text-xs text-muted-foreground font-medium leading-relaxed">
 Biar nggak lupa, aktifkan notifikasi supaya kamu diingatkan waktu ada kosakata yang perlu di-review.
 </p>

 <div className="flex items-center gap-4 pt-2">
 <div className="flex-1 p-3 rounded-xl bg-muted/50 border border-border flex flex-col gap-1">
 <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Status Izin</span>
 <span className={`text-xs font-black uppercase ${permission === 'granted' ? 'text-success' : 'text-warning'}`}>
 {permission === 'granted' ? 'Diberikan' : permission === 'denied' ? 'Ditolak' : 'Belum Diatur'}
 </span>
 </div>
 <Button 
 variant="outline"
 size="sm"
 onClick={requestPermission}
 className="h-auto py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-widest border-primary/30 text-primary hover:bg-primary/10"
 >
 <Settings2 size={12} className="mr-2" /> Konfigurasi
 </Button>
 </div>
 </div>
 </Card>
 );
}