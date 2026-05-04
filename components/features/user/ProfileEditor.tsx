"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Edit2, Check, X, UserCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * @file ProfileEditor.tsx
 * @description Komponen untuk mengedit profil pengguna (nama) langsung dari dashboard.
 * Terintegrasi dengan sistem store lokal dan sinkronisasi Supabase.
 */

export default function ProfileEditor() {
  const { updateProfileName } = useUserStore();
    const { isAuthenticated } = useAuthStore();
    const { name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory } = useUserStore();
    const { srs } = useSRSStore();
    const { notifications, settings } = useUIStore();
    const progress = { name, xp, level, streak, todayReviewCount, lastStudyDate, studyDays, inventory, srs, notifications, settings };
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(progress.name || "");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Nama tidak boleh kosong!");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Update lokal store
      updateProfileName(name.trim());

      // 2. Jika login, sync ke Supabase
      if (isAuthenticated) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from("profiles")
            .update({ full_name: name.trim() })
            .eq("id", user.id);
            
          if (error) throw error;
        }
      }
      
      toast.success("Profil berhasil diperbarui!");
      setIsEditing(false);
    } catch (error) {
      console.error("Gagal update profil:", error);
      toast.error("Gagal menyambung ke server, perubahan disimpan secara lokal.");
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {isEditing ? (
        <Card className="p-1 bg-muted border-border flex items-center gap-2 rounded-2xl animate-in fade-in slide-in-from-top-1 shadow-sm">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masukkan nama kamu..."
            className="bg-transparent border-none text-foreground font-black uppercase tracking-tighter text-xl h-12 focus-visible:ring-0 placeholder:text-muted-foreground/30"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") setIsEditing(false);
            }}
          />
          <div className="flex gap-1 pr-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSave}
              disabled={isLoading}
              className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white dark:hover:text-black transition-all"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsEditing(false)}
              disabled={isLoading}
              className="w-10 h-10 rounded-xl bg-muted border border-border text-muted-foreground hover:bg-background hover:text-foreground transition-all"
            >
              <X size={18} />
            </Button>
          </div>
        </Card>
      ) : (
        <div className="flex items-center gap-4 group">
          <div className="relative">
             <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 border border-border flex items-center justify-center text-primary shadow-sm group-hover:shadow-md transition-all">
                <UserCircle size={32} />
             </div>
             <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-background" />
          </div>
          
          <div className="flex-1">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground tracking-tighter leading-none flex items-center gap-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                {progress.name || "Pelajar"}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-muted-foreground hover:text-primary"
              >
                <Edit2 size={24} />
              </button>
            </h2>
            <p className="text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Siswa Aktif NihongoRoute
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
