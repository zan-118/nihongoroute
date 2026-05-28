"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Flame, Search, Crown, X } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { get as idbGet, set as idbSet } from "idb-keyval";
import { useUserStore } from "@/store/useUserStore";

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
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Get active user state
  const currentUserId = useUserStore((s) => s.id);
  const currentUserXp = useUserStore((s) => s.xp);
  const currentUserLevel = useUserStore((s) => s.level);
  const currentUserStreak = useUserStore((s) => s.streak);
  const currentUserName = useUserStore((s) => s.name);
  const isGuest = useUserStore((s) => s.isGuest);

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

  // 2. BroadcastChannel for cross-tab sync
  useEffect(() => {
    if (typeof window === "undefined") return;
    const channel = new BroadcastChannel("nihongoroute_sync");
    channel.onmessage = (event) => {
      if (event.data === "SYNC_COMPLETE") {
        queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
      }
    };
    return () => channel.close();
  }, [queryClient]);

  // 3. Load cached leaderboard data instantly on mount (<16ms)
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

  // 4. React Query for background fetching, SWR caching, and own rank calculation
  const { data, isLoading, isFetching } = useQuery<{ users: LeaderboardUser[]; ownRank: number | null }>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data: topUsers, error } = await supabase
        .from("profiles")
        .select("id, full_name, xp, level, streak, avatar_url")
        .order("xp", { ascending: false })
        .limit(20);

      if (error) throw error;
      
      const freshUsers = (topUsers || []) as LeaderboardUser[];
      
      // Persist to IndexedDB
      try {
        await idbSet("nihongoroute_ui_data_leaderboard", freshUsers);
      } catch (err) {
        console.error("Gagal menyimpan cache leaderboard:", err);
      }

      // Calculate absolute rank if authenticated
      let ownRank: number | null = null;
      const currentUserState = useUserStore.getState();
      const userId = currentUserState.id;
      const userXp = currentUserState.xp;
      const userIsGuest = currentUserState.isGuest;

      if (!userIsGuest && userId && userId !== "guest") {
        const { count, error: rankError } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gt("xp", userXp);

        if (!rankError && count !== null) {
          ownRank = count + 1;
        }
      }

      return {
        users: freshUsers,
        ownRank,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache fresh
    refetchOnWindowFocus: false,
  });

  const usersList = data?.users || cachedUsers;
  const ownRank = data?.ownRank || null;
  const showSkeleton = isLoading && usersList.length === 0;

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
            <div key={`skeleton-row-${i}`} className="h-20 w-full bg-muted/20 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const isSearching = searchQuery.trim().length > 0;

  // Filter users based on search
  const filteredUsers = usersList.filter((u) =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Map users with original ranks
  const rankedUsers = filteredUsers.map((u) => {
    const originalRank = usersList.findIndex((x) => x.id === u.id) + 1;
    return {
      ...u,
      rank: originalRank > 0 ? originalRank : null,
    };
  });

  const topThree = isSearching ? [] : rankedUsers.slice(0, 3);
  const othersList = isSearching ? rankedUsers : rankedUsers.slice(3);

  const isOwnUserInTop20 = usersList.slice(0, 20).some((x) => x.id === currentUserId);
  const showFloatingOwnRank = !isGuest && currentUserId !== "guest" && ownRank !== null && !isOwnUserInTop20;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 sm:gap-12 pb-32 px-4 relative">
      
      {/* 🔍 PREMIUM SEARCH INPUT */}
      <div className="relative w-full max-w-md mx-auto z-20">
        <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full pointer-events-none" />
        <Card className="glass border-border/80 p-1 flex items-center bg-card/65 backdrop-blur-md rounded-2xl shadow-lg relative z-10 transition-all duration-300 focus-within:border-primary/45 focus-within:shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)]">
          <div className="pl-3.5 text-muted-foreground/60">
            <Search size={16} />
          </div>
          <input aria-label="Cari nama siswa"
            type="text"
            placeholder="Cari nama siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none py-2 px-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/50"
          />
          {searchQuery && (
            <button type="button"
              onClick={() => setSearchQuery("")}
              className="p-2 mr-1 rounded-xl text-muted-foreground/50 hover:text-foreground hover:bg-muted/40 transition-colors"
              aria-label="Bersihkan pencarian"
            >
              <X size={14} />
            </button>
          )}
        </Card>
      </div>

      <AnimatePresence mode="wait">
        {!isSearching && topThree.length > 0 && (
          <m.div
            key="podium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-3 gap-2 sm:gap-8 items-end mt-6 bg-background/25 glass border border-border/80 rounded-[2rem] sm:rounded-[3rem] p-3 sm:p-12 shadow-[0_25px_60px_rgba(0,0,0,0.35)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.02] via-transparent to-transparent pointer-events-none" />
            
            {/* RANK 2 (Silver) */}
            <m.div 
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
            </m.div>

            {/* RANK 1 (Gold - Champion) */}
            <m.div 
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
                <div className="absolute -top-7 sm:-top-10 left-1/2 -translate-x-1/2 text-warning animate-premium-bounce drop-shadow-[0_0_12px_rgba(var(--warning-rgb),0.5)] z-20">
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
            </m.div>

            {/* RANK 3 (Bronze) */}
            <m.div 
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
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* 📋 LIST SECTION (OTHERS) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2 mb-2 sm:mb-4">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/70">
            {isSearching ? "Hasil Pencarian Siswa" : "Peringkat Belajar Lainnya"}
          </h3>
          <div className="flex items-center gap-2 text-muted-foreground/50 text-[10px] font-black uppercase tracking-widest">
            <Search size={12} /> Global
          </div>
        </div>

        {/* Status Badge Luring */}
        {isOffline && (
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3.5 rounded-2xl bg-warning/5 border border-warning/20 text-warning text-xs font-bold flex items-center gap-2.5 select-none"
          >
            <div className="size-2 rounded-full bg-warning animate-pulse shrink-0" />
            <span>Mode Luring Aktif. Menampilkan peringkat dari cache lokal.</span>
          </m.div>
        )}

        {/* Status Badge Sinkronisasi */}
        {!isOffline && isFetching && !showSkeleton && (
          <m.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-primary text-[10px] uppercase font-black tracking-widest flex items-center gap-2 select-none"
          >
            <div className="size-1.5 rounded-full bg-primary animate-ping shrink-0" />
            <span>Menyinkronkan papan peringkat dengan server…</span>
          </m.div>
        )}
        
        {othersList.map((user) => {
          const isOwnCard = user.id === currentUserId;
          const userRankNum = user.rank;
          
          return (
            <m.div
              key={user.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              layout
            >
              <Card 
                className={`glass border p-3.5 sm:p-5 flex items-center gap-3 sm:gap-6 backdrop-blur-md shadow-lg group transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${
                  isOwnCard 
                    ? "border-primary/50 bg-primary/[0.03] shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)]" 
                    : "border-border/80 bg-card/60 hover:border-primary/45 hover:bg-primary/[0.01]"
                }`}
              >
                
                {/* RANK # */}
                <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center text-xs font-mono font-black border transition-all shrink-0 ${
                  isOwnCard
                    ? "bg-primary/20 text-primary border-primary/30 shadow-[0_0_8px_rgba(var(--primary-rgb),0.2)]"
                    : "bg-background/30 text-muted-foreground/60 border-border/60 group-hover:text-primary group-hover:border-primary/25"
                }`}>
                  #{userRankNum}
                </div>
                
                {/* AVATAR */}
                <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-2xl flex items-center justify-center font-black text-foreground shrink-0 border group-hover:scale-110 transition-transform shadow-inner select-none font-japanese text-xs sm:text-base ${
                  isOwnCard
                    ? "bg-primary/25 border-primary/35"
                    : "bg-gradient-to-br from-primary/10 to-transparent border-border/80"
                }`}>
                  {user.full_name?.charAt(0).toUpperCase() || "?"}
                </div>
                
                {/* NAME & STATS */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-xs sm:text-base font-black truncate group-hover:text-primary transition-colors ${
                      isOwnCard ? "text-primary" : "text-foreground"
                    }`}>
                      {user.full_name || "Siswa Misterius"}
                    </h4>
                    {isOwnCard && (
                      <Badge className="bg-primary/25 text-primary border-primary/35 text-[7px] sm:text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0">
                        Anda
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 mt-0.5 sm:mt-1">
                    <Badge variant="ghost" className="p-0 text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                      Level {user.level}
                    </Badge>
                    <div className="size-1 rounded-full bg-muted-foreground/30" />
                    <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-warning select-none">
                      <Flame size={12} className="drop-shadow-sm text-warning fill-current" /> 
                      {user.streak} <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-0.5">Hari Beruntun</span>
                    </div>
                  </div>
                </div>
                
                {/* XP SCORE */}
                <div className="text-right shrink-0">
                  <p className={`text-sm sm:text-xl font-black font-mono drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.3)] ${
                    isOwnCard ? "text-primary scale-105" : "text-primary"
                  }`}>
                    {user.xp.toLocaleString()}
                  </p>
                  <p className="text-[7px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Poin XP</p>
                </div>
              </Card>
            </m.div>
          );
        })}

        {othersList.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-border/80 rounded-[2.5rem] bg-muted/5 glass flex flex-col items-center justify-center gap-3">
            <p className="text-muted-foreground/60 font-black uppercase tracking-widest text-xs">
              Siswa "{searchQuery}" tidak ditemukan
            </p>
            <p className="text-[10px] text-muted-foreground/45">Coba periksa ejaan atau cari nama siswa lain.</p>
          </div>
        )}
      </div>

      {/* 📱 FLOATING STICKY CARD (PERINGKAT SAYA DI LUAR TOP 20) */}
      {showFloatingOwnRank && (
        <m.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-4xl z-50 pointer-events-none"
        >
          <Card className="glass border-primary/45 p-4 flex items-center gap-3 sm:gap-6 bg-card/85 backdrop-blur-xl shadow-[0_-15px_40px_rgba(0,0,0,0.3),0_0_35px_rgba(var(--primary-rgb),0.2)] rounded-3xl pointer-events-auto border-2 hover:border-primary/60 transition-colors">
            {/* Rank */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 border border-primary/30 flex flex-col items-center justify-center shrink-0 shadow-[0_0_12px_rgba(var(--primary-rgb),0.25)]">
              <span className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">Rank</span>
              <span className="text-sm sm:text-base font-mono font-black text-primary leading-none mt-0.5">#{ownRank}</span>
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center font-black text-foreground shrink-0 border border-primary/25 shadow-inner select-none font-japanese text-xs sm:text-sm">
              {currentUserName?.charAt(0).toUpperCase() || "?"}
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-base font-black text-foreground truncate">
                  {currentUserName || "Anda"}
                </h4>
                <Badge className="bg-primary/20 text-primary border-primary/30 text-[7px] sm:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0">
                  Peringkat Anda
                </Badge>
              </div>
              <p className="text-[8px] sm:text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
                Level {currentUserLevel} • {currentUserStreak} Hari Beruntun
              </p>
            </div>

            {/* XP and motivation */}
            <div className="text-right shrink-0">
              <p className="text-xs sm:text-lg font-black font-mono text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.35)]">
                {currentUserXp.toLocaleString()} XP
              </p>
              {usersList.length > 0 && (
                <p className="text-[7px] sm:text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                  Butuh {Math.max(0, usersList[usersList.length - 1].xp - currentUserXp).toLocaleString()} XP ke Top 20
                </p>
              )}
            </div>
          </Card>
        </m.div>
      )}
      
    </div>
  );
}
