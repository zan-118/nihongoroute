/**
 * @file ProgressProvider.tsx
 * @description Komponen penyedia status (Zustand auth/progress sync orchestrator) untuk menyimak autentikasi Supabase dan sinkronisasi kemajuan belajar pengguna.
 */

"use client";

// ======================
// IMPOR
// ======================
import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useUserStore } from "@/store/useUserStore";
import { useSRSStore } from "@/store/useSRSStore";
import { useSyncProgress } from "@/hooks/useSyncProgress";
import { useHasMounted } from "@/hooks/useHasMounted";
import dynamic from "next/dynamic";

/**
 * ReminderSystem component.
 * Loaded dynamically. Client-side only.
 */
const ReminderSystem = dynamic(() => import("@/features/notifications/ReminderSystem"), { ssr: false });

// ======================
// EKSEKUSI UTAMA
// ======================

import { Session } from "@supabase/supabase-js";

/**
 * ProgressProvider component.
 * Syncs Supabase auth state with Zustand stores.
 * Warns user on exit if local SRS data unsynced.
 * 
 * @param props - Component props.
 * @param props.children - Child nodes.
 */
export const ProgressProvider = ({
 children,
 initialSession,
}: {
 children: React.ReactNode;
 initialSession?: Session | null;
}) => {
 const hasMounted = useHasMounted();
 const setAuth = useAuthStore((state) => state.setAuth);
 const syncUserData = useUserStore((state) => state.syncUserData);
 const dirtySrsSize = useSRSStore((state) => state.dirtySrs.size);
 
 const [supabase] = useState(() => createClient());

 // Seed Zustand stores synchronously on the first render using initialSession to prevent CLS. Only run in browser.
 useState(() => {
 if (typeof window !== "undefined") {
 if (initialSession?.user) {
 const userFullName = initialSession.user.user_metadata?.full_name || initialSession.user.email?.split('@')[0] || "Member";
 useAuthStore.getState().setAuth(true);
 useUserStore.getState().syncUserData({
 id: initialSession.user.id,
 isGuest: false,
 name: useUserStore.getState().name || userFullName
 });
 } else if (initialSession === null) {
 useAuthStore.getState().setAuth(false);
 useUserStore.getState().syncUserData({ id: "guest", isGuest: true, name: null });
 }
 }
 });

 // Trigger background sync hook for progress data.
 useSyncProgress(initialSession);

 // AUTHENTICATION LISTENER
 useEffect(() => {
 // Only fetch session client-side if it wasn't provided server-side.
 if (!initialSession) {
 supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
 const userFullName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || "Member";
 setAuth(!!session?.user);
 if (session?.user) {
 const currentLocalName = useUserStore.getState().name;
 syncUserData({ 
 id: session.user.id, 
 isGuest: false, 
 name: currentLocalName || userFullName 
 });
 } else {
 syncUserData({ id: "guest", isGuest: true, name: null });
 }
 });
 }

 // Listen to auth state changes. Update store and show welcome toast.
 const {
 data: { subscription },
 } = supabase.auth.onAuthStateChange((event: string, session: { user?: { id: string; user_metadata?: { full_name?: string }; email?: string } } | null) => {
 const userFullName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || "Member";
 setAuth(!!session?.user);
 if (session?.user) {
 const currentLocalName = useUserStore.getState().name;
 syncUserData({ 
 id: session.user.id, 
 isGuest: false, 
 name: currentLocalName || userFullName 
 });
 } else {
 syncUserData({ id: "guest", isGuest: true, name: null });
 }
 
 if (event === "SIGNED_IN" && session?.user) {
 if (typeof sessionStorage !== "undefined" && !sessionStorage.getItem("nihongo_welcomed")) {
 toast.success(`Okaeri, ${userFullName}!`, {
 description: "Senang kamu balik! Yuk selesaikan tantangan hari ini.",
 });
 sessionStorage.setItem("nihongo_welcomed", "true");
 }
 } else if (event === "SIGNED_OUT") {
 if (typeof sessionStorage !== "undefined") {
 sessionStorage.removeItem("nihongo_welcomed");
 }
 }
 });

 return () => subscription.unsubscribe();
 }, [setAuth, supabase, syncUserData, initialSession]);
 
 // UNSYNCED DATA WARNING (beforeunload)
 useEffect(() => {
 // Prevent tab close if local SRS changes not synced to server.
 const handleBeforeUnload = (e: BeforeUnloadEvent) => {
 if (dirtySrsSize > 0 && hasMounted) {
 const message = "Ada data belajar yang belum tersinkron ke Cloud. Yakin ingin keluar?";
 e.preventDefault();
 e.returnValue = message;
 return message;
 }
 };

 window.addEventListener("beforeunload", handleBeforeUnload);
 return () => window.removeEventListener("beforeunload", handleBeforeUnload);
 }, [dirtySrsSize, hasMounted]);

 // Always render children to avoid white screen flicker during hydration
 // Components should handle their own internal loading states if needed
 // if (!hasMounted) return null;

 return (
 <>
 <ReminderSystem />
 {children}
 </>
 );
};