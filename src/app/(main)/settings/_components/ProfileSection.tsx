/**
 * @file ProfileSection.tsx
 * @description Komponen seksi profil pada halaman pengaturan.
 * Menampilkan dan mengelola avatar, nama tampilan, dan preferensi belajar pengguna.
 */

"use client";

// ======================
// IMPOR
// ======================
import { m, Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { Zap, Flame, Award, ShieldCheck, User } from "lucide-react";

// ======================
// TIPE DATA
// ======================
interface ProfileSectionProps {
  name: string;
  xp: number;
  streak: number;
  isAuthenticated: boolean;
  updateProfileName: (name: string) => void;
  itemVariants: Variants;
}

export default function ProfileSection({
  name,
  xp,
  streak,
  isAuthenticated,
  updateProfileName,
  itemVariants
}: ProfileSectionProps) {
  const [newName, setNewName] = useState(name);
  const [isSyncing, setIsSyncing] = useState(false);
  const supabase = createClient();

  const [prevName, setPrevName] = useState(name);
  if (name !== prevName) {
    setPrevName(name);
    setNewName(name);
  }

  const handleSave = async () => {
    if (!newName.trim()) {
      toast.error("Nama tidak boleh kosong!");
      return;
    }

    setIsSyncing(true);
    try {
      updateProfileName(newName);

      if (isAuthenticated) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from("profiles")
            .update({ full_name: newName.trim() })
            .eq("id", user.id);

          if (error) throw error;
        }
      }
      toast.success("Nama profil berhasil diperbarui!");
    } catch (error) {
      console.error("Gagal sinkron nama:", error);
      toast.error("Nama disimpan lokal, tapi gagal sinkron ke cloud.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <m.div variants={itemVariants}>
      <Card className="glass  border border-border/80 rounded-[2.5rem] p-8 md:p-10 shadow-xl overflow-hidden relative group">
        {/* Elemen Dekoratif Kartu ID Pilot */}
        <div className="absolute top-0 right-0 size-64 bg-primary/8 blur-[70px] rounded-full -mr-28 -mt-28 pointer-events-none" />
        <div className="absolute bottom-0 left-0 size-40 bg-secondary/5 blur-[50px] rounded-full -ml-14 -mb-14 pointer-events-none" />

        {/* Pola Header Kartu ID */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[linear-gradient(90deg,rgb(var(--brand-cyan-rgb)),rgb(var(--brand-blue-rgb)),rgb(var(--brand-violet-rgb)))] opacity-80" />

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 relative z-10">
          {/* AVATAR / IDENTITAS PILOT */}
          <div className="flex flex-col items-center gap-4 shrink-0">
             <div className="relative group/avatar">
                <div className="absolute -inset-1.5 bg-gradient-to-br from-primary to-secondary rounded-[2.5rem] blur-sm opacity-25 group-hover/avatar:opacity-45 transition duration-300" />
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-[2.2rem] bg-card border border-border flex items-center justify-center text-foreground relative z-10 overflow-hidden shadow-xl">
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-60" />
                   <span className="text-6xl font-black italic text-primary drop-shadow-md select-none font-japanese">
                      {(newName || "S").charAt(0).toUpperCase()}
                   </span>
                </div>
                <div className="absolute -bottom-2 -right-2 size-10 bg-card border border-border rounded-lg flex items-center justify-center z-20 shadow-xl group-hover/avatar:scale-110 transition-transform">
                   <ShieldCheck size={20} className="text-success" />
                </div>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mb-0.5">Level Belajar</span>
                <span className="text-xs font-black uppercase tracking-widest text-primary">Master Route</span>
             </div>
          </div>

          <div className="flex-1 space-y-8">
            <div className="text-center lg:text-left space-y-2">
              <h2 className="text-2xl md:text-3xl uppercase italic tracking-tighter text-foreground flex flex-col lg:flex-row lg:items-center gap-3">
                 Profil Pengguna
                 {isAuthenticated && (
                   <span className="text-[9px] not-italic font-black bg-success/15 text-success border border-success/30 px-3 py-1 rounded-full uppercase tracking-widest w-fit mx-auto lg:mx-0 shadow-[0_0_15px_rgb(var(--success-rgb)/0.1)]">
                      Akun Terhubung
                   </span>
                 )}
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground/60 font-semibold uppercase tracking-widest">Sesuaikan nama tampilan Anda di NihongoRoute</p>
            </div>

            {/* PENGHITUNG STATISTIK */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="bg-background/25  border border-border rounded-lg p-5 flex items-center gap-4 group/stat hover:bg-background/35 hover:border-primary/20 transition-all duration-200 shadow-sm">
                  <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                     <Zap size={22} className="fill-current text-primary" />
                  </div>
                  <div>
                     <div className="text-2xl font-black tracking-tighter text-foreground font-mono">
                        <AnimatedCounter value={xp} />
                     </div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Total XP</p>
                  </div>
               </div>
               <div className="bg-background/25  border border-border rounded-lg p-5 flex items-center gap-4 group/stat hover:bg-background/35 hover:border-warning/20 transition-all duration-200 shadow-sm">
                  <div className="size-12 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center text-warning shadow-inner">
                     <Flame size={22} className="fill-current text-warning animate-premium-bounce" />
                  </div>
                  <div>
                     <div className="text-2xl font-black tracking-tighter text-foreground font-mono">
                        <AnimatedCounter value={streak} />
                     </div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Streak Hari</p>
                  </div>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 group/input">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground/30 group-focus-within/input:text-primary transition-colors">
                   <User size={18} />
                </div>
                <input aria-label="Masukkan nama Anda"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Masukkan nama Anda..."
                  className="control-surface w-full h-14 rounded-lg pl-12 pr-4 text-sm font-black text-foreground uppercase tracking-tight focus:ring-2 focus:ring-primary/35 outline-none transition-all placeholder:text-muted-foreground/40"
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={isSyncing}
                className="h-14 bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-widest text-xs rounded-lg px-8 shadow-lg shadow-primary/15 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
              >
                {isSyncing ? "Menyimpan..." : "Simpan Nama"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </m.div>
  );
}
