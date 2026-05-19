"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Flame, Search, Crown } from "lucide-react";
import { motion } from "framer-motion";

/**
 * @file LeaderboardClient.tsx
 * @description Komponen utama fitur sosial (Papan Peringkat).
 */

interface LeaderboardUser {
  id: string;
  full_name: string;
  xp: number;
  level: number;
  streak: number;
  avatar_url?: string;
}

export default function LeaderboardClient() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, xp, level, streak, avatar_url")
          .order("xp", { ascending: false })
          .limit(20);

        if (!error && data) {
          setUsers(data as LeaderboardUser[]);
        }
      } catch (err) {
        console.error("Gagal memuat papan peringkat:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-3 gap-6 h-64 w-full items-end">
          <div className="bg-muted/30 animate-pulse rounded-[2.5rem] h-[80%]" />
          <div className="bg-muted/30 animate-pulse rounded-[2.5rem] h-full" />
          <div className="bg-muted/30 animate-pulse rounded-[2.5rem] h-[70%]" />
        </div>
        <div className="flex flex-col gap-4 mt-12">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 w-full bg-muted/20 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const topThree = users.slice(0, 3);
  const others = users.slice(3);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-16 pb-24 px-4">
      
      {/* 🏆 HOLOGRAPHIC PODIUM SECTION (TOP 3) */}
      <div className="grid grid-cols-3 gap-3 sm:gap-8 items-end mt-12 bg-background/25 glass border border-border/80 rounded-[3rem] p-6 sm:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.35)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.02] via-transparent to-transparent pointer-events-none" />
        
        {/* RANK 2 (Silver) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
          className="order-1 flex flex-col items-center group/podium"
        >
          <div className="relative mb-6">
            <div className="absolute -inset-1 bg-gradient-to-br from-secondary to-transparent rounded-full blur-md opacity-40 group-hover/podium:opacity-85 transition duration-500" />
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-card border-2 border-secondary/60 flex items-center justify-center text-xl sm:text-2xl font-black text-secondary shadow-[0_10px_25px_rgba(var(--secondary-rgb),0.1)] relative z-10 select-none font-japanese">
              {topThree[1]?.full_name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground border border-background shadow-xl z-20">
              <Medal size={16} />
            </div>
          </div>
          <div className="bg-background/20 backdrop-blur-md p-4 sm:p-6 rounded-t-3xl w-full text-center border-x border-t border-secondary/20 h-28 sm:h-36 flex flex-col justify-between group-hover/podium:border-secondary/40 transition-colors shadow-lg">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/60 mb-1">Rank #2</p>
              <p className="text-xs sm:text-sm font-black text-foreground truncate max-w-full px-1">{topThree[1]?.full_name || "Misterius"}</p>
            </div>
            <Badge variant="outline" className="font-mono text-[10px] border-secondary/30 text-secondary w-fit mx-auto px-3 bg-secondary/5">
              {topThree[1]?.xp || 0} XP
            </Badge>
          </div>
        </motion.div>

        {/* RANK 1 (Gold - Champion) */}
        <motion.div 
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 12 }}
          className="order-2 flex flex-col items-center relative z-10 scale-105 sm:scale-115 group/champ"
        >
          <div className="relative mb-8">
            <div className="absolute -inset-2 bg-gradient-to-br from-warning via-amber-500 to-transparent rounded-full blur-lg opacity-40 group-hover/champ:opacity-90 transition duration-700 animate-pulse pointer-events-none" />
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-card border-4 border-warning flex items-center justify-center text-2xl sm:text-4xl font-black text-warning shadow-[0_15px_35px_rgba(var(--warning-rgb),0.25)] relative z-10 select-none font-japanese">
              {topThree[0]?.full_name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-warning animate-bounce drop-shadow-[0_0_12px_rgba(var(--warning-rgb),0.5)] z-20">
              <Trophy size={36} />
            </div>
            <div className="absolute -bottom-2 -right-1 w-9 h-9 rounded-full bg-warning flex items-center justify-center text-warning-foreground border border-background shadow-xl z-20 animate-pulse">
              <Crown size={16} />
            </div>
          </div>
          <div className="bg-background/30 backdrop-blur-md p-4 sm:p-6 rounded-t-3xl w-full text-center border-x border-t border-warning/30 h-36 sm:h-44 flex flex-col justify-between group-hover/champ:border-warning/50 transition-colors shadow-2xl relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-warning/60 to-transparent" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-warning mb-1 animate-pulse">Champion</p>
              <p className="text-sm sm:text-base font-black text-foreground truncate max-w-full px-1">{topThree[0]?.full_name || "Sang Juara"}</p>
            </div>
            <Badge variant="outline" className="font-mono text-xs border-warning/45 text-warning bg-warning/10 w-fit mx-auto px-4 py-0.5 shadow-[0_0_10px_rgba(var(--warning-rgb),0.1)]">
              {topThree[0]?.xp || 0} XP
            </Badge>
          </div>
        </motion.div>

        {/* RANK 3 (Bronze) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
          className="order-3 flex flex-col items-center group/third"
        >
          <div className="relative mb-6">
            <div className="absolute -inset-1 bg-gradient-to-br from-destructive to-transparent rounded-full blur-md opacity-35 group-hover/third:opacity-80 transition duration-500" />
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-card border-2 border-destructive/60 flex items-center justify-center text-xl sm:text-2xl font-black text-destructive shadow-[0_10px_25px_rgba(var(--destructive-rgb),0.1)] relative z-10 select-none font-japanese">
              {topThree[2]?.full_name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground border border-background shadow-xl z-20">
              <Medal size={16} />
            </div>
          </div>
          <div className="bg-background/20 backdrop-blur-md p-4 sm:p-6 rounded-t-3xl w-full text-center border-x border-t border-destructive/20 h-24 sm:h-32 flex flex-col justify-between group-hover/third:border-destructive/40 transition-colors shadow-lg">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-muted-foreground/60 mb-1">Rank #3</p>
              <p className="text-xs sm:text-sm font-black text-foreground truncate max-w-full px-1">{topThree[2]?.full_name || "Pesaing"}</p>
            </div>
            <Badge variant="outline" className="font-mono text-[10px] border-destructive/30 text-destructive w-fit mx-auto px-3 bg-destructive/5">
              {topThree[2]?.xp || 0} XP
            </Badge>
          </div>
        </motion.div>
      </div>

      {/* 📋 LIST SECTION (OTHERS) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2 mb-4">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/70">Peringkat Belajar Lainnya</h3>
          <div className="flex items-center gap-2 text-muted-foreground/50 text-[10px] font-black uppercase tracking-widest">
            <Search size={12} /> Global
          </div>
        </div>
        
        {others.map((user, idx) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            <Card className="glass border border-border/80 p-5 flex items-center gap-4 sm:gap-6 bg-card/60 backdrop-blur-md shadow-lg group hover:border-primary/45 hover:bg-primary/[0.03] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
              
              {/* RANK # */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-background/30 flex items-center justify-center text-xs font-mono font-black text-muted-foreground/60 border border-border/60 group-hover:text-primary group-hover:border-primary/25 transition-all shrink-0">
                #{idx + 4}
              </div>
              
              {/* AVATAR */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center font-black text-foreground shrink-0 border border-border/80 group-hover:scale-110 transition-transform shadow-inner select-none font-japanese">
                {user.full_name?.charAt(0).toUpperCase() || "?"}
              </div>
              
              {/* NAME & STATS */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-black text-foreground truncate group-hover:text-primary transition-colors">
                  {user.full_name || "Siswa Misterius"}
                </h4>
                <div className="flex items-center gap-3 sm:gap-4 mt-1">
                  <Badge variant="ghost" className="p-0 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Level {user.level}
                  </Badge>
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                  <div className="flex items-center gap-1.5 text-xs font-bold text-warning select-none">
                    <Flame size={12} className="drop-shadow-sm text-warning fill-current" /> 
                    {user.streak} <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-0.5">Hari Beruntun</span>
                  </div>
                </div>
              </div>
              
              {/* XP SCORE */}
              <div className="text-right shrink-0">
                <p className="text-lg sm:text-xl font-black font-mono text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]">
                  {user.xp.toLocaleString()}
                </p>
                <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Poin XP</p>
              </div>
            </Card>
          </motion.div>
        ))}

        {others.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-border/80 rounded-[2.5rem] bg-muted/5 glass">
            <p className="text-muted-foreground/60 font-black uppercase tracking-widest text-xs">Belum ada penantang lain...</p>
          </div>
        )}
      </div>
      
    </div>
  );
}
