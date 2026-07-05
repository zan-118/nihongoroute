/**
 * @file LeaderboardClient.tsx
 * @description Komponen klien interaktif untuk papan peringkat global (Global Leaderboard).
 * Mengambil data peringkat secara real-time dari Supabase dan menampilkan dalam antarmuka sosial premium.
 */

"use client";

// ======================
// IMPOR
// ======================
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Flame, Search, Crown, X, Lock, Target, Calendar } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { get as idbGet, set as idbSet } from "idb-keyval";
import { useUserStore } from "@/store/useUserStore";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// ======================
// TIPE DATA
// ======================
interface LeaderboardUser {
  id: string;
  full_name: string;
  xp: number;
  level: number;
  streak: number;
  avatar_url?: string;
  study_days?: Record<string, number>;
}

type RankedLeaderboardUser = LeaderboardUser & { rank: number | null };

export default function LeaderboardClient() {
  const [cachedUsers, setCachedUsers] = useState<LeaderboardUser[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [activeTab, setActiveTab] = useState<"top_global" | "around_me">("top_global");
  const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const queryClient = useQueryClient();

  // Dapatkan state pengguna aktif
  const currentUserId = useUserStore((s) => s.id);
  const currentUserXp = useUserStore((s) => s.xp);
  const currentUserLevel = useUserStore((s) => s.level);
  const currentUserStreak = useUserStore((s) => s.streak);
  const currentUserName = useUserStore((s) => s.name);
  const isGuest = useUserStore((s) => s.isGuest);

  // 1. Deteksi Status Luring (Offline)
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

  // 2. BroadcastChannel untuk sinkronisasi lintas-tab
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

  // 3. Muat data papan peringkat dari cache secara instan saat pemasangan (<16ms)
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

  // 4. React Query untuk pengambilan data latar belakang, caching SWR, dan kalkulasi peringkat sendiri
  const { data, isLoading, isFetching } = useQuery<{ users: LeaderboardUser[]; ownRank: number | null; customRanks?: Record<string, number> }>({
    queryKey: ["leaderboard", activeTab],
    queryFn: async () => {
      const currentUserState = useUserStore.getState();
      const userId = currentUserState.id;
      const userXp = currentUserState.xp;
      const userIsGuest = currentUserState.isGuest;

      if (activeTab === "top_global") {
        const { data: topUsers, error } = await supabase
          .from("profiles")
          .select("id, full_name, xp, level, streak, avatar_url, study_days")
          .order("xp", { ascending: false })
          .limit(20);

        if (error) throw error;
        
        const freshUsers = (topUsers || []) as LeaderboardUser[];
        
        // Simpan ke IndexedDB
        try {
          await idbSet("nihongoroute_ui_data_leaderboard", freshUsers);
        } catch (err) {
          console.error("Gagal menyimpan cache leaderboard:", err);
        }

        // Hitung peringkat absolut jika terautentikasi
        let ownRank: number | null = null;

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
      } else {
        // Tab "around_me"
        if (userIsGuest || !userId || userId === "guest") {
          return { users: [], ownRank: null };
        }

        // Ambil 3 user di atas user aktif
        const { data: aboveUsers, error: errorAbove } = await supabase
          .from("profiles")
          .select("id, full_name, xp, level, streak, avatar_url, study_days")
          .gt("xp", userXp)
          .order("xp", { ascending: true })
          .limit(3);

        if (errorAbove) throw errorAbove;

        // Ambil 3 user di bawah user aktif
        const { data: belowUsers, error: errorBelow } = await supabase
          .from("profiles")
          .select("id, full_name, xp, level, streak, avatar_url, study_days")
          .lt("xp", userXp)
          .order("xp", { ascending: false })
          .limit(3);

        if (errorBelow) throw errorBelow;

        // Ambil data user aktif secara fresh
        const { data: ownProfile, error: errorOwn } = await supabase
          .from("profiles")
          .select("id, full_name, xp, level, streak, avatar_url, study_days")
          .eq("id", userId)
          .single();

        if (errorOwn) throw errorOwn;

        // Gabungkan: Di atas (dibalik agar urutan menurun), Sendiri, Di bawah
        const combined = [
          ...[...(aboveUsers || [])].reverse(),
          ownProfile,
          ...(belowUsers || [])
        ] as LeaderboardUser[];

        // Hitung rank absolut untuk masing-masing user secara paralel
        const customRanks: Record<string, number> = {};
        await Promise.all(
          combined.map(async (u) => {
            const { count, error: rankErr } = await supabase
              .from("profiles")
              .select("id", { count: "exact", head: true })
              .gt("xp", u.xp);
            if (!rankErr && count !== null) {
              customRanks[u.id] = count + 1;
            } else {
              customRanks[u.id] = 1;
            }
          })
        );

        return {
          users: combined,
          ownRank: customRanks[userId] || null,
          customRanks,
        };
      }
    },
    staleTime: 5 * 60 * 1000, // Cache segar selama 5 menit
    refetchOnWindowFocus: false,
  });

  const usersList = useMemo(() => data?.users || cachedUsers, [cachedUsers, data?.users]);
  const ownRank = data?.ownRank || null;
  const showSkeleton = isLoading && usersList.length === 0;

  const searchTerm = deferredSearchQuery.trim().toLowerCase();
  const isSearching = searchTerm.length > 0;

  const rankByUserId = useMemo(() => {
    const rankMap = new Map<string, number>();
    if (activeTab === "around_me" && data?.customRanks) {
      Object.entries(data.customRanks).forEach(([uid, rank]) => {
        rankMap.set(uid, rank);
      });
    } else {
      usersList.forEach((user, index) => {
        rankMap.set(user.id, index + 1);
      });
    }
    return rankMap;
  }, [usersList, data, activeTab]);

  const rankedUsers = useMemo<RankedLeaderboardUser[]>(() => {
    const result: RankedLeaderboardUser[] = [];

    for (const user of usersList) {
      if (searchTerm && !user.full_name?.toLowerCase().includes(searchTerm)) {
        continue;
      }

      result.push({
        ...user,
        rank: rankByUserId.get(user.id) ?? null,
      });
    }

    return result;
  }, [rankByUserId, searchTerm, usersList]);

  const topThree = useMemo(() => (isSearching || activeTab === "around_me") ? [] : rankedUsers.slice(0, 3), [isSearching, activeTab, rankedUsers]);
  const othersList = useMemo(() => (isSearching || activeTab === "around_me") ? rankedUsers : rankedUsers.slice(3), [isSearching, activeTab, rankedUsers]);

  const isOwnUserInTop20 = useMemo(
    () => usersList.some((x) => x.id === currentUserId),
    [currentUserId, usersList]
  );
  const showFloatingOwnRank = !isGuest && currentUserId !== "guest" && ownRank !== null && !isOwnUserInTop20 && activeTab === "top_global";

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
            <div key={`skeleton-row-${i}`} className="h-20 w-full bg-muted/20 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 sm:gap-12 pb-32 px-4 relative">
      
      {/* 🔍 PREMIUM SEARCH INPUT */}
      <div className="relative w-full max-w-md mx-auto z-20">
        <Card className="glass border-border/80 p-1 flex items-center bg-card/80 rounded-lg shadow-sm relative z-10 transition-all duration-200 focus-within:border-primary/45 focus-within:shadow-[0_0_14px_rgb(var(--primary-rgb)/0.12)]">
          <div className="pl-3.5 text-muted-foreground/60">
            <Search size={16} />
          </div>
          <input aria-label="Cari nama member"
            type="text"
            placeholder="Cari nama member..."
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

      {/* 🏆 TAB SWITCHER */}
      <div className="flex justify-center -mt-2 sm:-mt-6 relative z-20">
        <div className="bg-background/40 glass p-1 rounded-lg flex gap-1.5 border border-border/80 shadow-md">
          <button
            type="button"
            onClick={() => setActiveTab("top_global")}
            className={`px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
              activeTab === "top_global"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Top 20 Global
          </button>
          <button
            type="button"
            onClick={() => {
              if (isOffline) {
                toast.error("Mode luring aktif. Peringkat sekitar saya membutuhkan jaringan.");
                return;
              }
              if (isGuest || currentUserId === "guest") {
                toast.error("Kamu perlu masuk/daftar untuk melihat peringkat sekitar.");
                return;
              }
              setActiveTab("around_me");
            }}
            className={`px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === "around_me"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {(isGuest || currentUserId === "guest") && <Lock size={12} className="text-muted-foreground/60" />}
            Di Sekitar Saya
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isSearching && activeTab === "top_global" && topThree.length > 0 && (
          <m.div
            key="podium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-3 gap-2 sm:gap-8 items-end mt-6 bg-background/55 glass border border-border/80 rounded-[2rem] sm:rounded-[3rem] p-3 sm:p-12 shadow-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.02] via-transparent to-transparent pointer-events-none" />
            
            {/* RANK 2 (Silver) */}
            <m.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
              onClick={() => {
                if (topThree[1]) {
                  setSelectedUser(topThree[1]);
                  confetti({ particleCount: 70, spread: 50, colors: ["#9ca3af", "#cbd5e1", "#e2e8f0"] });
                }
              }}
              className="order-1 flex flex-col items-center group/podium cursor-pointer"
            >
              <div className="relative mb-3 sm:mb-6">
                <div className="absolute -inset-1 bg-gradient-to-br from-secondary to-transparent rounded-full blur-md opacity-40 group-hover/podium:opacity-85 transition duration-500" />
                <div className="w-12 h-12 sm:w-24 sm:h-24 rounded-full bg-card border-2 border-secondary/60 flex items-center justify-center text-sm sm:text-2xl font-black text-secondary shadow-[0_10px_25px_rgb(var(--secondary-rgb)/0.1)] relative z-10 select-none font-japanese">
                  {topThree[1]?.full_name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground border border-background shadow-xl z-20">
                  <Medal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="bg-background/20  p-2 sm:p-6 rounded-t-[1.5rem] sm:rounded-t-3xl w-full text-center border-x border-t border-secondary/20 h-24 sm:h-36 flex flex-col justify-between group-hover/podium:border-secondary/40 transition-colors shadow-lg">
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
              onClick={() => {
                if (topThree[0]) {
                  setSelectedUser(topThree[0]);
                  confetti({ particleCount: 120, spread: 80, colors: ["#fbbf24", "#f59e0b", "#d97706"] });
                }
              }}
              className="order-2 flex flex-col items-center relative z-10 scale-105 sm:scale-115 group/champ cursor-pointer"
            >
              <div className="relative mb-5 sm:mb-8">
                <div className="absolute -inset-2 bg-gradient-to-br from-warning via-amber-500 to-transparent rounded-full blur-md opacity-35 group-hover/champ:opacity-75 transition duration-500 pointer-events-none" />
                <div className="w-16 h-16 sm:w-28 sm:h-28 rounded-full bg-card border-[3px] sm:border-4 border-warning flex items-center justify-center text-lg sm:text-4xl font-black text-warning shadow-[0_15px_35px_rgb(var(--warning-rgb)/0.25)] relative z-10 select-none font-japanese">
                  {topThree[0]?.full_name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="absolute -top-7 sm:-top-10 left-1/2 -translate-x-1/2 text-warning animate-premium-bounce drop-shadow-[0_0_12px_rgb(var(--warning-rgb)/0.5)] z-20">
                  <Trophy className="w-6 h-6 sm:w-9 sm:h-9" />
                </div>
                <div className="absolute -bottom-1.5 -right-1 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-warning flex items-center justify-center text-warning-foreground border border-background shadow-lg z-20">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div className="bg-background/30  p-2 sm:p-6 rounded-t-[1.5rem] sm:rounded-t-3xl w-full text-center border-x border-t border-warning/30 h-30 sm:h-44 flex flex-col justify-between group-hover/champ:border-warning/50 transition-colors shadow-2xl relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-0.5 sm:h-1 bg-gradient-to-r from-warning/60 to-transparent" />
                <div className="min-w-0">
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.15em] sm:tracking-[0.25em] text-warning mb-0.5 sm:mb-1">Champion</p>
                  <p className="text-xs sm:text-base font-black text-foreground truncate max-w-full px-0.5">{topThree[0]?.full_name || "Sang Juara"}</p>
                </div>
                <Badge variant="outline" className="font-mono text-[9px] sm:text-xs border-warning/45 text-warning bg-warning/10 w-fit mx-auto px-2 sm:px-4 py-0.5 shadow-[0_0_10px_rgb(var(--warning-rgb)/0.1)] truncate max-w-full">
                  {topThree[0]?.xp || 0} XP
                </Badge>
              </div>
            </m.div>
 
            {/* RANK 3 (Bronze) */}
            <m.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.2 }}
              onClick={() => {
                if (topThree[2]) {
                  setSelectedUser(topThree[2]);
                  confetti({ particleCount: 60, spread: 40, colors: ["#b45309", "#d97706", "#f97316"] });
                }
              }}
              className="order-3 flex flex-col items-center group/third cursor-pointer"
            >
              <div className="relative mb-3 sm:mb-6">
                <div className="absolute -inset-1 bg-gradient-to-br from-destructive to-transparent rounded-full blur-md opacity-35 group-hover/third:opacity-80 transition duration-500" />
                <div className="w-12 h-12 sm:w-24 sm:h-24 rounded-full bg-card border-2 border-destructive/60 flex items-center justify-center text-sm sm:text-2xl font-black text-destructive shadow-[0_10px_25px_rgb(var(--destructive-rgb)/0.1)] relative z-10 select-none font-japanese">
                  {topThree[2]?.full_name?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-destructive flex items-center justify-center text-destructive-foreground border border-background shadow-xl z-20">
                  <Medal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>
              <div className="bg-background/20  p-2 sm:p-6 rounded-t-[1.5rem] sm:rounded-t-3xl w-full text-center border-x border-t border-destructive/20 h-20 sm:h-32 flex flex-col justify-between group-hover/third:border-destructive/40 transition-colors shadow-lg">
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
          <h3 className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70">
            {isSearching ? "Hasil Pencarian Member" : "Peringkat Belajar Lainnya"}
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
            className="p-3.5 rounded-lg bg-warning/5 border border-warning/20 text-warning text-xs font-bold flex items-center gap-2.5 select-none"
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
            >
              <Card 
                onClick={() => setSelectedUser(user)}
                className={`glass border p-3.5 sm:p-5 flex items-center gap-3 sm:gap-6 shadow-sm group transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
                  isOwnCard 
                    ? "border-primary/50 bg-primary/[0.03] shadow-[0_0_12px_rgb(var(--primary-rgb)/0.12)]"
                    : "border-border/80 bg-card/60 hover:border-primary/45 hover:bg-primary/[0.01]"
                }`}
              >
                
                {/* RANK # */}
                <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center text-xs font-mono font-black border transition-all shrink-0 ${
                  isOwnCard
                    ? "bg-primary/20 text-primary border-primary/30 shadow-[0_0_8px_rgb(var(--primary-rgb)/0.2)]"
                    : "bg-background/30 text-muted-foreground/60 border-border/60 group-hover:text-primary group-hover:border-primary/25"
                }`}>
                  #{userRankNum}
                </div>
                
                {/* AVATAR */}
                <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-lg flex items-center justify-center font-black text-foreground shrink-0 border group-hover:scale-110 transition-transform shadow-inner select-none font-japanese text-xs sm:text-base ${
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
                      {user.full_name || "Member Misterius"}
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
                  <p className={`text-sm sm:text-xl font-black font-mono drop-shadow-[0_0_8px_rgb(var(--primary-rgb)/0.3)] ${
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
              Member "{searchQuery}" tidak ditemukan
            </p>
            <p className="text-[10px] text-muted-foreground/45">Coba periksa ejaan atau cari nama member lain.</p>
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
          <Card className="glass border-primary/45 p-4 flex items-center gap-3 sm:gap-6 bg-card/90  shadow-[0_-10px_28px_rgba(var(--foreground-rgb),0.24),0_0_22px_rgb(var(--primary-rgb)/0.14)] rounded-xl pointer-events-auto border-2 hover:border-primary/60 transition-colors">
            {/* Peringkat */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 border border-primary/30 flex flex-col items-center justify-center shrink-0 shadow-[0_0_12px_rgb(var(--primary-rgb)/0.25)]">
              <span className="text-[10px] font-black uppercase text-primary tracking-widest leading-none">Rank</span>
              <span className="text-sm sm:text-base font-mono font-black text-primary leading-none mt-0.5">#{ownRank}</span>
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center font-black text-foreground shrink-0 border border-primary/25 shadow-inner select-none font-japanese text-xs sm:text-sm">
              {currentUserName?.charAt(0).toUpperCase() || "?"}
            </div>

            {/* Nama */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-base text-foreground truncate">
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

            {/* XP dan motivasi */}
            <div className="text-right shrink-0">
              <p className="text-xs sm:text-lg font-black font-mono text-primary drop-shadow-[0_0_8px_rgb(var(--primary-rgb)/0.35)]">
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

      {/* 👤 USER DETAIL MODAL */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="glass border-border max-w-sm w-full p-6 sm:p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/[0.04] to-transparent pointer-events-none" />
          
          {selectedUser && (
            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Profile Avatar */}
              <div className="size-20 rounded-[2rem] bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-center font-black text-foreground shrink-0 border border-primary/20 shadow-inner select-none font-japanese text-2xl mb-4">
                {selectedUser.full_name?.charAt(0).toUpperCase() || "?"}
              </div>

              {/* Title & Badges */}
              <DialogTitle className="text-xl font-black text-foreground uppercase tracking-tight mb-1">
                {selectedUser.full_name || "Member Misterius"}
              </DialogTitle>
              
              <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">
                {selectedUser.level >= 15
                  ? "Sensei Bahasa / Ahli Utama"
                  : selectedUser.level >= 10
                  ? "Samurai Nihongo / Pembelajar Madya"
                  : selectedUser.level >= 5
                  ? "Ronin Bahasa / Pembelajar Aktif"
                  : "Chibi Nihongo / Pemula"}
              </DialogDescription>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3.5 w-full mb-6 text-left">
                {/* Level */}
                <div className="p-4 bg-background/25 border border-border/80 rounded-lg flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                    <Target size={15} />
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-wider block">Level</span>
                    <span className="text-sm font-black text-foreground">{selectedUser.level}</span>
                  </div>
                </div>

                {/* Streak */}
                <div className="p-4 bg-background/25 border border-border/80 rounded-lg flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-warning/10 border border-warning/20 text-warning flex items-center justify-center shrink-0">
                    <Flame size={15} className="fill-current" />
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-wider block">Streak</span>
                    <span className="text-sm font-black text-stone-900 dark:text-stone-100">{selectedUser.streak} Hari</span>
                  </div>
                </div>

                {/* Total XP */}
                <div className="p-4 bg-background/25 border border-border/80 rounded-lg flex items-center gap-3 col-span-2">
                  <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                    <Trophy size={15} />
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-wider block">Total XP</span>
                    <span className="text-base font-black text-primary font-mono">{selectedUser.xp.toLocaleString()} XP</span>
                  </div>
                </div>

                {/* Hari Aktif Belajar */}
                <div className="p-4 bg-background/25 border border-border/80 rounded-lg flex items-center gap-3 col-span-2">
                  <div className="size-8 rounded-lg bg-success/10 border border-success/20 text-success flex items-center justify-center shrink-0">
                    <Calendar size={15} />
                  </div>
                  <div>
                    <span className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-wider block">Hari Belajar Aktif</span>
                    <span className="text-sm font-black text-foreground">
                      {selectedUser.study_days && typeof selectedUser.study_days === "object"
                        ? Object.keys(selectedUser.study_days).length
                        : 0}{" "}
                      Hari
                    </span>
                  </div>
                </div>
              </div>

              {/* Cheer Button */}
              <button
                onClick={() => {
                  confetti({
                    particleCount: 80,
                    spread: 60,
                    origin: { y: 0.6 },
                    colors: ["#fbbf24", "#f59e0b", "#3b82f6"]
                  });
                  toast.success(`Kamu mengirimkan semangat kepada ${selectedUser.full_name || "member"}! 🎉⚡`);
                }}
                className="w-full h-12 bg-primary hover:bg-secondary text-primary-foreground font-black uppercase tracking-widest text-xs rounded-xl shadow-lg transition-all active:scale-[0.97]"
              >
                Kirim Semangat! ⚡
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
    </div>
  );
}
