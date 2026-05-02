"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Flame, Search } from "lucide-react";
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
      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-6 h-48 w-full">
          <div className="bg-muted animate-pulse rounded-3xl" />
          <div className="bg-muted animate-pulse rounded-3xl scale-110" />
          <div className="bg-muted animate-pulse rounded-3xl" />
        </div>
        <div className="flex flex-col gap-4 mt-12">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 w-full bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const topThree = users.slice(0, 3);
  const others = users.slice(3);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-12 pb-24">
      
      {/* 🏆 PODIUM SECTION (TOP 3) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end mt-8">
        
        {/* RANK 2 (Silver) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="order-1 flex flex-col items-center"
        >
          <div className="relative mb-6">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full neo-inset flex items-center justify-center text-2xl font-black bg-muted border-2 border-slate-400 text-slate-400">
              {topThree[1]?.full_name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center text-white border-2 border-background">
              <Medal size={16} />
            </div>
          </div>
          <div className="bg-gradient-to-b from-slate-400/20 to-transparent p-4 sm:p-6 rounded-t-3xl w-full text-center border-x border-t border-slate-400/30 h-28 sm:h-36">
            <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Rank #2</p>
            <p className="text-xs sm:text-sm font-bold text-foreground truncate mb-2">{topThree[1]?.full_name || "Misterius"}</p>
            <Badge variant="outline" className="font-mono text-[10px] border-slate-400/30 text-slate-600 dark:text-slate-300">
              {topThree[1]?.xp || 0} XP
            </Badge>
          </div>
        </motion.div>

        {/* RANK 1 (Gold) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="order-2 flex flex-col items-center relative z-10 scale-110 sm:scale-125"
        >
          <div className="relative mb-8">
            <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full neo-inset flex items-center justify-center text-3xl font-black bg-amber-500/10 border-4 border-amber-500 text-amber-600 dark:text-amber-400 shadow-xl">
              {topThree[0]?.full_name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
              <Trophy size={40} className="drop-shadow-lg" />
            </div>
          </div>
          <div className="bg-gradient-to-b from-amber-500/20 to-transparent p-4 sm:p-8 rounded-t-3xl w-full text-center border-x border-t border-amber-500/40 h-36 sm:h-48">
            <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 mb-1 animate-pulse">Champion</p>
            <p className="text-sm sm:text-base font-black text-foreground truncate mb-3">{topThree[0]?.full_name || "Sang Juara"}</p>
            <Badge variant="outline" className="font-mono text-[10px] sm:text-xs border-amber-500/50 text-amber-700 dark:text-amber-300 bg-amber-500/10">
              {topThree[0]?.xp || 0} XP
            </Badge>
          </div>
        </motion.div>

        {/* RANK 3 (Bronze) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="order-3 flex flex-col items-center"
        >
          <div className="relative mb-6">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full neo-inset flex items-center justify-center text-2xl font-black bg-orange-500/10 border-2 border-orange-600 text-orange-600">
              {topThree[2]?.full_name?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white border-2 border-background">
              <Medal size={16} />
            </div>
          </div>
          <div className="bg-gradient-to-b from-orange-600/20 to-transparent p-4 sm:p-6 rounded-t-3xl w-full text-center border-x border-t border-orange-600/30 h-24 sm:h-32">
            <p className="text-[9px] font-black uppercase text-orange-600 mb-1">Rank #3</p>
            <p className="text-xs sm:text-sm font-bold text-foreground truncate mb-2">{topThree[2]?.full_name || "Pesaing"}</p>
            <Badge variant="outline" className="font-mono text-[10px] border-orange-600/30 text-orange-600 dark:text-orange-400">
              {topThree[2]?.xp || 0} XP
            </Badge>
          </div>
        </motion.div>
      </div>

      {/* 📋 LIST SECTION (OTHERS) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-4 mb-4">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Peringkat Lainnya</h3>
          <div className="flex items-center gap-2 text-muted-foreground/50 text-[10px] font-bold uppercase tracking-widest">
            <Search size={14} /> Global League
          </div>
        </div>
        
        {others.map((user, idx) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="neo-card p-4 sm:p-5 flex items-center gap-4 sm:gap-6 bg-card border border-border shadow-sm group hover:border-primary/30 hover:bg-primary/[0.02] transition-all cursor-default">
              
              {/* RANK # */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 neo-inset flex items-center justify-center text-xs sm:text-sm font-mono font-black text-muted-foreground group-hover:text-primary transition-colors shrink-0">
                {idx + 4}
              </div>
              
              {/* AVATAR */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center font-bold text-foreground shrink-0 border border-border group-hover:scale-110 transition-transform">
                {user.full_name?.charAt(0).toUpperCase() || "?"}
              </div>
              
              {/* NAME & STATS */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {user.full_name || "Siswa Misterius"}
                </h4>
                <div className="flex items-center gap-3 sm:gap-4 mt-1">
                  <Badge variant="ghost" className="p-0 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Level {user.level}
                  </Badge>
                  <div className="w-1 h-1 rounded-full bg-muted" />
                  <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-orange-600 dark:text-orange-500">
                    <Flame size={12} className="drop-shadow-sm" /> 
                    {user.streak} <span className="hidden sm:inline">Hari Berturut</span>
                  </div>
                </div>
              </div>
              
              {/* XP SCORE */}
              <div className="text-right shrink-0">
                <p className="text-base sm:text-xl font-black font-mono text-primary drop-shadow-sm">
                  {user.xp.toLocaleString()}
                </p>
                <p className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">XP Points</p>
              </div>
            </Card>
          </motion.div>
        ))}

        {others.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-[2rem] bg-muted/20">
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Belum ada penantang lain...</p>
          </div>
        )}
      </div>
      
    </div>
  );
}
