"use client";

import { motion, Variants } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { Zap, Flame, Award, ShieldCheck, User } from "lucide-react";

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

  useEffect(() => {
    requestAnimationFrame(() => {
      setNewName(name);
    });
  }, [name]);

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
    <motion.div variants={itemVariants}>
      <Card className="glass backdrop-blur-3xl border border-border/80 rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden relative group">
        {/* Pilot ID Card Decorative Elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 blur-[120px] rounded-full -mr-32 -mt-32 animate-pulse pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/5 blur-[80px] rounded-full -ml-16 -mb-16 pointer-events-none" />
        
        {/* ID Card Header Pattern */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-blue-500 to-emerald-500 opacity-80" />

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 relative z-10">
          {/* AVATAR / PILOT ID */}
          <div className="flex flex-col items-center gap-4 shrink-0">
             <div className="relative group/avatar">
                <div className="absolute -inset-1.5 bg-gradient-to-br from-primary to-blue-500 rounded-[2.5rem] blur-md opacity-30 group-hover/avatar:opacity-60 transition duration-1000 group-hover/avatar:duration-300" />
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-[2.2rem] bg-card border border-border flex items-center justify-center text-foreground relative z-10 overflow-hidden shadow-2xl">
                   <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-60" />
                   <span className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-br from-primary to-blue-500 drop-shadow-md select-none font-japanese">
                      {(newName || "S").charAt(0).toUpperCase()}
                   </span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-card border border-border rounded-2xl flex items-center justify-center z-20 shadow-xl group-hover/avatar:scale-110 transition-transform">
                   <ShieldCheck size={20} className="text-success animate-pulse" />
                </div>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mb-0.5">Level Belajar</span>
                <span className="text-xs font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Master Route</span>
             </div>
          </div>
          
          <div className="flex-1 space-y-8">
            <div className="text-center lg:text-left space-y-2">
              <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter text-foreground flex flex-col lg:flex-row lg:items-center gap-3">
                 Profil Pengguna
                 {isAuthenticated && (
                   <span className="text-[9px] not-italic font-black bg-success/15 text-success border border-success/30 px-3 py-1 rounded-full uppercase tracking-widest w-fit mx-auto lg:mx-0 shadow-[0_0_15px_rgba(var(--success-rgb),0.1)]">
                      Akun Terhubung
                   </span>
                 )}
              </h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground/60 font-semibold uppercase tracking-widest">Sesuaikan nama tampilan Anda di NihongoRoute</p>
            </div>

            {/* STATS COUNTERS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="bg-background/20 backdrop-blur-md border border-border rounded-2xl p-5 flex items-center gap-4 group/stat hover:bg-background/35 hover:border-primary/20 transition-all duration-300 shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                     <Zap size={22} className="fill-current animate-pulse text-primary" />
                  </div>
                  <div>
                     <div className="text-2xl font-black tracking-tighter text-foreground font-mono">
                        <AnimatedCounter value={xp} />
                     </div>
                     <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Total XP</p>
                  </div>
               </div>
               <div className="bg-background/20 backdrop-blur-md border border-border rounded-2xl p-5 flex items-center gap-4 group/stat hover:bg-background/35 hover:border-warning/20 transition-all duration-300 shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center text-warning shadow-inner">
                     <Flame size={22} className="fill-current text-warning animate-bounce" />
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
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Masukkan nama Anda..."
                  className="w-full h-14 bg-background/25 border border-border rounded-2xl pl-12 pr-4 text-sm font-black text-foreground uppercase tracking-tight focus:ring-2 focus:ring-primary/25 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30"
                />
              </div>
              <Button 
                onClick={handleSave}
                disabled={isSyncing}
                className="h-14 bg-primary hover:bg-primary/95 text-primary-foreground font-black uppercase tracking-widest text-xs rounded-2xl px-8 shadow-xl shadow-primary/20 hover:shadow-primary/45 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
              >
                {isSyncing ? "Menyimpan..." : "Simpan Nama"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
