"use client";

/**
 * @file useLeaderboard.ts
 * @description Hook untuk logika data papan peringkat: fetch real-time dari Supabase,
 * cache IndexedDB (offline-first), sinkronisasi lintas-tab via BroadcastChannel,
 * pencarian, filter tab, dan kalkulasi peringkat pengguna.
 * @module features/social/hooks
 */

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { get as idbGet, set as idbSet } from "idb-keyval";
import { useUserStore } from "@/store/useUserStore";
import { toast } from "sonner";

/**
 * Structure representing user data retrieved from the database.
 */
export interface LeaderboardUser {
 id: string;
 full_name: string;
 xp: number;
 level: number;
 streak: number;
 avatar_url?: string;
 study_days?: Record<string, number>;
}

/**
 * Structure representing user data combined with their calculated rank.
 */
export type RankedLeaderboardUser = LeaderboardUser & { rank: number | null };

/**
 * Shape hasil query papan peringkat.
 */
interface LeaderboardQueryResult {
 users: LeaderboardUser[];
 ownRank: number | null;
 customRanks?: Record<string, number>;
}

/**
 * Key penyimpanan IndexedDB untuk cache papan peringkat.
 */
const LEADERBOARD_CACHE_KEY = "nihongoroute_ui_data_leaderboard";

/**
 * Key BroadcastChannel untuk sinkronisasi lintas-tab.
 */
const SYNC_CHANNEL_NAME = "nihongoroute_sync";

/**
 * Logika data papan peringkat.
 * Mengembalikan state, data query, hasil filter, dan handler untuk komponen UI.
 */
export function useLeaderboard() {
 const [cachedUsers, setCachedUsers] = useState<LeaderboardUser[]>([]);
 const [isOffline, setIsOffline] = useState(false);
 const [searchQuery, setSearchQuery] = useState("");
 const deferredSearchQuery = useDeferredValue(searchQuery);
 const [activeTab, setActiveTab] = useState<"top_global" | "around_me">("top_global");
 const [selectedUser, setSelectedUser] = useState<LeaderboardUser | null>(null);
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
  const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
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
    const cached = await idbGet<LeaderboardUser[]>(LEADERBOARD_CACHE_KEY);
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
 const { data, isLoading, isFetching } = useQuery<LeaderboardQueryResult>({
  queryKey: ["leaderboard", activeTab],
  queryFn: async () => {
   const currentUserState = useUserStore.getState();
   const userId = currentUserState.id;
   const userXp = currentUserState.xp;
   const userIsGuest = currentUserState.isGuest;

   if (activeTab === "top_global") {
    const supabase = createClient();

    // Fetch top 20 users sorted by XP descending
    const { data: topUsers, error } = await supabase
     .from("leaderboard_profiles")
     .select("id, full_name, xp, level, streak, avatar_url, study_days")
     .order("xp", { ascending: false })
     .limit(20);

    if (error) throw error;

    const freshUsers = (topUsers || []) as LeaderboardUser[];

    // Simpan ke IndexedDB
    try {
     await idbSet(LEADERBOARD_CACHE_KEY, freshUsers);
    } catch (err) {
     console.error("Gagal menyimpan cache leaderboard:", err);
    }

    // Hitung peringkat absolut jika terautentikasi
    let ownRank: number | null = null;

    if (!userIsGuest && userId && userId !== "guest") {
     const { count, error: rankError } = await supabase
      .from("leaderboard_profiles")
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

    const supabase = createClient();

    // Ambil 3 user di atas user aktif
    const { data: aboveUsers, error: errorAbove } = await supabase
     .from("leaderboard_profiles")
     .select("id, full_name, xp, level, streak, avatar_url, study_days")
     .gt("xp", userXp)
     .order("xp", { ascending: true })
     .limit(3);

    if (errorAbove) throw errorAbove;

    // Ambil 3 user di bawah user aktif
    const { data: belowUsers, error: errorBelow } = await supabase
     .from("leaderboard_profiles")
     .select("id, full_name, xp, level, streak, avatar_url, study_days")
     .lt("xp", userXp)
     .order("xp", { ascending: false })
     .limit(3);

    if (errorBelow) throw errorBelow;

    // Ambil data user aktif secara fresh
    const { data: ownProfile, error: errorOwn } = await supabase
     .from("leaderboard_profiles")
     .select("id, full_name, xp, level, streak, avatar_url, study_days")
     .eq("id", userId)
     .single();

    if (errorOwn) throw errorOwn;

    // Gabungkan: Di atas (dibalik agar urutan menurun), Sendiri, Di bawah
    const combined = [
     ...[...(aboveUsers || [])].reverse(),
     ownProfile,
     ...(belowUsers || []),
    ] as LeaderboardUser[];

    // Hitung rank absolut untuk masing-masing user secara paralel
    const customRanks: Record<string, number> = {};
    await Promise.all(
     combined.map(async (u) => {
      const { count, error: rankErr } = await supabase
       .from("leaderboard_profiles")
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

 // Fallback to cached users if query is loading and cache exists
 const usersList = useMemo(() => data?.users || cachedUsers, [cachedUsers, data?.users]);
 const ownRank = data?.ownRank || null;
 const showSkeleton = isLoading && usersList.length === 0;

 const searchTerm = deferredSearchQuery.trim().toLowerCase();
 const isSearching = searchTerm.length > 0;

 // Map user IDs to their calculated ranks based on active tab
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

 // Filter and map users with their calculated ranks
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

 // Extract top 3 users for podium display (only in global tab and when not searching)
 const topThree = useMemo(
  () => (isSearching || activeTab === "around_me") ? [] : rankedUsers.slice(0, 3),
  [isSearching, activeTab, rankedUsers]
 );
 // Extract remaining users below top 3
 const othersList = useMemo(
  () => (isSearching || activeTab === "around_me") ? rankedUsers : rankedUsers.slice(3),
  [isSearching, activeTab, rankedUsers]
 );

 // Check if current user is present in the top 20 list
 const isOwnUserInTop20 = useMemo(
  () => usersList.some((x) => x.id === currentUserId),
  [currentUserId, usersList]
 );
 // Determine if floating rank card should be displayed
 const showFloatingOwnRank =
  !isGuest && currentUserId !== "guest" && ownRank !== null && !isOwnUserInTop20 && activeTab === "top_global";

 return {
  cachedUsers,
  isOffline,
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  selectedUser,
  setSelectedUser,
  data,
  isLoading,
  isFetching,
  usersList,
  ownRank,
  showSkeleton,
  searchTerm,
  isSearching,
  rankedUsers,
  topThree,
  othersList,
  isOwnUserInTop20,
  showFloatingOwnRank,
  currentUserId,
  currentUserXp,
  currentUserLevel,
  currentUserStreak,
  currentUserName,
  isGuest,
  handleAroundMeTab: () => {
   if (isOffline) {
    toast.error("Mode luring aktif. Peringkat sekitar saya membutuhkan jaringan.");
    return;
   }
   if (isGuest || currentUserId === "guest") {
    toast.error("Kamu perlu masuk/daftar untuk melihat peringkat sekitar.");
    return;
   }
   setActiveTab("around_me");
  },
  handleCheer: (userName?: string) => {
   toast.success(`Kamu mengirimkan semangat kepada ${userName || "member"}!`);
  },
 };
}
