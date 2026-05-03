"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, BellRing, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "../../ui/switch";
import { toast } from "sonner";
import { useProgressStore } from "@/store/useProgressStore";
import { useShallow } from "zustand/react/shallow";

export default function NotificationManager() {
  const { notificationsEnabled, toggleNotifications } = useProgressStore(
    useShallow((state) => ({ 
      notificationsEnabled: state.progress.settings?.notificationsEnabled || false,
      toggleNotifications: state.toggleNotifications 
    }))
  );
  
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isEnabled, setIsEnabled] = useState(notificationsEnabled);

  useEffect(() => {
    setIsEnabled(notificationsEnabled);
  }, [notificationsEnabled]);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Browser Tidak Mendukung", {
        description: "Browser Anda tidak mendukung notifikasi web."
      });
      return;
    }

    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === "granted") {
        toggleNotifications(true);
        toast.success("Notifikasi Aktif!", {
          description: "Anda akan menerima pengingat untuk sesi review berikutnya."
        });
        
        // Test notification
        new Notification("NihongoRoute", {
          body: "Notifikasi berhasil diaktifkan! Kami akan mengingatkanmu jika ada kartu yang jatuh tempo.",
          icon: "/logo-branding.png"
        });
      } else {
        toggleNotifications(false);
        toast.warning("Izin Ditolak", {
          description: "Anda tidak akan menerima notifikasi pengingat."
        });
      }
    } catch (err) {
      console.error("Gagal meminta izin notifikasi:", err);
    }
  };

  return (
    <Card className="p-6 rounded-2xl bg-card border border-border shadow-lg relative overflow-hidden group">
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
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-0.5">Retensi PWA</h4>
              <h3 className="text-sm font-black text-foreground uppercase tracking-tight">Pengingat Review</h3>
            </div>
          </div>
          <Switch 
            checked={isEnabled}
            onCheckedChange={(checked: boolean) => {
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

        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
          Jangan biarkan ingatanmu pudar! Aktifkan notifikasi untuk mendapatkan pengingat saat kosakata masuk jadwal review (SRS).
        </p>

        <div className="flex items-center gap-4 pt-2">
          <div className="flex-1 p-3 rounded-xl bg-muted/50 border border-border flex flex-col gap-1">
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Status Izin</span>
            <span className={`text-[10px] font-black uppercase ${permission === 'granted' ? 'text-emerald-500' : 'text-amber-500'}`}>
              {permission === 'granted' ? 'Diberikan' : permission === 'denied' ? 'Ditolak' : 'Belum Diatur'}
            </span>
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={requestPermission}
            className="h-auto py-2.5 px-4 rounded-xl text-[9px] font-bold uppercase tracking-widest border-primary/30 text-primary hover:bg-primary/10"
          >
            <Settings2 size={12} className="mr-2" /> Konfigurasi
          </Button>
        </div>
      </div>
    </Card>
  );
}
