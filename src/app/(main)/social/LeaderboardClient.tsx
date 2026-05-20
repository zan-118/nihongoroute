"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Flame, Search, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { get as idbGet, set as idbSet } from "idb-keyval";

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
  const [cachedUsers, setCachedUsers] = useState<LeaderboardUser[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const supabase = createClient();

  // 1. Detect Offline Status
  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateStatus = () => setIsOffline(!navigator.onLine);
    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  // 2. Load cached leaderboard data instantly on mount (<16ms)
  useEffect(() => {
    const loadCache = async () => {
      try {
        const cached = await idbGet<LeaderboardUser[]>("nihongoroute_ui_data_leaderboard");
        if (cached && Array.isArray(cached)) {
          setCachedUsers(cached);
        }
      } catch (err) {
        console.error("Gagal membaca cache leaderboard:", err);
      }
    };
    loadCache();
  }, []);

  // 3. React Query for background fetching and SWR caching
  const { data: users, isLoading, isFetching } = useQuery<LeaderboardUser[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, xp, level, streak, avatar_url")
        .order("xp", { ascending: false })
        .limit(20);

      if (error) throw error;
      
      const freshData = (data || []) as LeaderboardUser[];
      
      // Persist to IndexedDB
      try {
        await idbSet("nihongoroute_ui_data_leaderboard", freshData);
      } catch (err) {
        console.error("Gagal menyimpan cache leaderboard:", err);
      }

      return freshData;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache fresh
    refetchOnWindowFocus: false,
  });

  const displayUsers = users || cachedUsers;
  const showSkeleton = isLoading && displayUsers.length === 0;

  if (showSkeleton) {
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

  const topThree = displayUsers.slice(0, 3);
  const others = displayUsers.slice(3);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 sm:gap-16 pb-24 px-4">
      
      {/* 🏆 HOLOGRAPHIC PODIUM SECTION (TOP 3) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-8 items-end mt-6 sm:mt-12 bg-background/25 glass border border-border/80 rounded-[2rem] sm:rounded-[3rem] p-3 sm:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.35)] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.02] via-transparent to-transparent pointer-events-none" />
        
        {/* RANK 2 (Silver) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
          className="order-1 flex flex-col items-center group/podium"
        >
          <div className="relative mb-3 sm:mb-6">
            <div className="absolute -inset-1 bg-gradient-to-br from-secondary to-transparent rounded-full blur-md opacity-40 group-hover/podium:opacity-85 transition duration-500" />
            <div className="w-12 h-12 sm:w-24 sm:h-24 rounded-full bg-card border-2 border-secondary/60 flex items-center justify-center text-sm sm:text-2xl font-black text-secondary shadow-[0_10px_25px_rgba(var(--secondary-rgb),0.1)] relative z-10 select-none font-japanese">
              {topThree[1]?.full_name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground border border-background shadow-xl z-20">
              <Medal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="bg-background/20 backdrop-blur-md p-2 sm:p-6 rounded-t-[1.5rem] sm:rounded-t-3xl w-full text-center border-x border-t border-secondary/20 h-24 sm:h-36 flex flex-col justify-between group-hover/podium:border-secondary/40 transition-colors shadow-lg">
            <div className="min-w-0">
              <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] sm:tracking-[0.22em] text-muted-foreground/60 mb-0.5 sm:mb-1">Rank #2</p>
              <p className="text-[10px] sm:text-sm font-black text-foreground truncate max-w-full px-0.5">{topThree[1]?.full_name || "Misterius"}</p>
            </div>
            <Badge variant="outline" className="font-mono text-[8px] sm:text-[10px] border-secondary/30 text-secondary w-fit mx-auto px-1.5 sm:px-3 bg-secondary/5 truncate max-w-full">
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
          <div className="relative mb-5 sm:mb-8">
            <div className="absolute -inset-2 bg-gradient-to-br from-warning via-amber-500 to-transparent rounded-full blur-lg opacity-40 group-hover/champ:opacity-90 transition duration-700 animate-pulse pointer-events-none" />
            <div className="w-16 h-16 sm:w-28 sm:h-28 rounded-full bg-card border-[3px] sm:border-4 border-warning flex items-center justify-center text-lg sm:text-4xl font-black text-warning shadow-[0_15px_35px_rgba(var(--warning-rgb),0.25)] relative z-10 select-none font-japanese">
              {topThree[0]?.full_name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="absolute -top-7 sm:-top-10 left-1/2 -translate-x-1/2 text-warning animate-bounce drop-shadow-[0_0_12px_rgba(var(--warning-rgb),0.5)] z-20">
              <Trophy className="w-6 h-6 sm:w-9 sm:h-9" />
            </div>
            <div className="absolute -bottom-1.5 -right-1 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-warning flex items-center justify-center text-warning-foreground border border-background shadow-xl z-20 animate-pulse">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="bg-background/30 backdrop-blur-md p-2 sm:p-6 rounded-t-[1.5rem] sm:rounded-t-3xl w-full text-center border-x border-t border-warning/30 h-30 sm:h-44 flex flex-col justify-between group-hover/champ:border-warning/50 transition-colors shadow-2xl relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-0.5 sm:h-1 bg-gradient-to-r from-warning/60 to-transparent" />
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.25em] text-warning mb-0.5 sm:mb-1 animate-pulse">Champion</p>
              <p className="text-xs sm:text-base font-black text-foreground truncate max-w-full px-0.5">{topThree[0]?.full_name || "Sang Juara"}</p>
            </div>
            <Badge variant="outline" className="font-mono text-[9px] sm:text-xs border-warning/45 text-warning bg-warning/10 w-fit mx-auto px-2 sm:px-4 py-0.5 shadow-[0_0_10px_rgba(var(--warning-rgb),0.1)] truncate max-w-full">
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
          <div className="relative mb-3 sm:mb-6">
            <div className="absolute -inset-1 bg-gradient-to-br from-destructive to-transparent rounded-full blur-md opacity-35 group-hover/third:opacity-80 transition duration-500" />
            <div className="w-12 h-12 sm:w-24 sm:h-24 rounded-full bg-card border-2 border-destructive/60 flex items-center justify-center text-sm sm:text-2xl font-black text-destructive shadow-[0_10px_25px_rgba(var(--destructive-rgb),0.1)] relative z-10 select-none font-japanese">
              {topThree[2]?.full_name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground border border-background shadow-xl z-20">
              <Medal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="bg-background/20 backdrop-blur-md p-2 sm:p-6 rounded-t-[1.5rem] sm:rounded-t-3xl w-full text-center border-x border-t border-destructive/20 h-20 sm:h-32 flex flex-col justify-between group-hover/third:border-destructive/40 transition-colors shadow-lg">
            <div className="min-w-0">
              <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] sm:tracking-[0.22em] text-muted-foreground/60 mb-0.5 sm:mb-1">Rank #3</p>
              <p className="text-[10px] sm:text-sm font-black text-foreground truncate max-w-full px-0.5">{topThree[2]?.full_name || "Pesaing"}</p>
            </div>
            <Badge variant="outline" className="font-mono text-[8px] sm:text-[10px] border-destructive/30 text-destructive w-fit mx-auto px-1.5 sm:px-3 bg-destructive/5 truncate max-w-full">
              {topThree[2]?.xp || 0} XP
            </Badge>
          </div>
        </motion.div>
      </div>

      {/* 📋 LIST SECTION (OTHERS) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2 mb-2 sm:mb-4">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/70">Peringkat Belajar Lainnya</h3>
          <div className="flex items-center gap-2 text-muted-foreground/50 text-[10px] font-black uppercase tracking-widest">
            <Search size={12} /> Global
          </div>
        </div>

        {/* Status Badge Luring */}
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 rounded-2xl bg-warning/5 border border-warning/20 text-warning text-xs font-bold flex items-center gap-2.5 select-none"
          >
            <div className="w-2 h-2 rounded-full bg-warning animate-pulse shrink-0" />
            <span>Mode Luring Aktif. Menampilkan peringkat dari cache lokal.</span>
          </motion.div>
        )}

        {/* Status Badge Sinkronisasi */}
        {!isOffline && isFetching && !showSkeleton && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-primary text-[10px] uppercase font-black tracking-widest flex items-center gap-2 select-none"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping shrink-0" />
            <span>Menyinkronkan papan peringkat dengan server...</span>
          </motion.div>
        )}
        
        {others.map((user, idx) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            <Card className="glass border border-border/80 p-3.5 sm:p-5 flex items-center gap-3 sm:gap-6 bg-card/60 backdrop-blur-md shadow-lg group hover:border-primary/45 hover:bg-primary/[0.03] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
              
              {/* RANK # */}
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-background/30 flex items-center justify-center text-xs font-mono font-black text-muted-foreground/60 border border-border/60 group-hover:text-primary group-hover:border-primary/25 transition-all shrink-0">
                #{idx + 4}
              </div>
              
              {/* AVATAR */}
              <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-2xl bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center font-black text-foreground shrink-0 border border-border/80 group-hover:scale-110 transition-transform shadow-inner select-none font-japanese text-xs sm:text-base">
                {user.full_name?.charAt(0).toUpperCase() || "?"}
              </div>
              
              {/* NAME & STATS */}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-base font-black text-foreground truncate group-hover:text-primary transition-colors">
                  {user.full_name || "Siswa Misterius"}
                </h4>
                <div className="flex items-center gap-2 sm:gap-4 mt-0.5 sm:mt-1">
                  <Badge variant="ghost" className="p-0 text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Level {user.level}
                  </Badge>
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-warning select-none">
                    <Flame size={12} className="drop-shadow-sm text-warning fill-current" /> 
                    {user.streak} <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-0.5">Hari Beruntun</span>
                  </div>
                </div>
              </div>
              
              {/* XP SCORE */}
              <div className="text-right shrink-0">
                <p className="text-sm sm:text-xl font-black font-mono text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)]">
                  {user.xp.toLocaleString()}
                </p>
                <p className="text-[7px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Poin XP</p>
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
