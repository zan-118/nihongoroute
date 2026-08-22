/**
 * @file useSyncNotifications.ts
 * @description Custom hook to sync database notifications into Zustand UI store via 30s polling.
 */

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUIStore } from "@/store/useUIStore";
import { useUserStore } from "@/store/useUserStore";
import { getNotifications } from "@/actions/community.actions";

// Main Custom Hook

/**
 * Sync database notifications into local Zustand UI store.
 * Polls Supabase community notifications every 30 seconds for authenticated non-guest users.
 * 
 * @returns {void} Updates UI state store synchronously.
 * @sideEffects Polls server endpoint every 30,000ms and updates `useUIStore`.
 * @storeAccess Accesses `useUserStore` for auth identity and mutates `useUIStore.notifications`.
 */
export function useSyncNotifications() {
 const isGuest = useUserStore((s) => s.isGuest);
 const currentUserId = useUserStore((s) => s.id);

 // Fetch notifications from database periodically
 const { data: dbNotifs } = useQuery({
 queryKey: ["db_notifications", currentUserId],
 queryFn: () => getNotifications(),
 enabled: !isGuest && !!currentUserId, // Only fetch for logged-in users
 refetchInterval: 30000, // Poll every 30 seconds
 });

 useEffect(() => {
 if (!dbNotifs || dbNotifs.length === 0) return;

 const currentNotifs = useUIStore.getState().notifications;
 let hasChanges = false;
 
 // Clone array to avoid direct mutation
 const newNotifs = [...currentNotifs];

 dbNotifs.forEach((dbNotif) => {
 const existingIdx = newNotifs.findIndex((n) => n.id === dbNotif.id);
 if (existingIdx > -1) {
 // Update read status if changed on server
 if (newNotifs[existingIdx].read !== dbNotif.read) {
 newNotifs[existingIdx] = {
 ...newNotifs[existingIdx],
 read: dbNotif.read,
 };
 hasChanges = true;
 }
 } else {
 // Add new notification from database
 newNotifs.push({
 id: dbNotif.id,
 title: dbNotif.title,
 message: dbNotif.message,
 type: dbNotif.type === "like" ? "success" : "info",
 read: dbNotif.read,
 timestamp: new Date(dbNotif.created_at).getTime(),
 });
 hasChanges = true;
 }
 });

 if (hasChanges) {
 // Sort newest first
 newNotifs.sort((a, b) => b.timestamp - a.timestamp);
 // Keep max 50 items in store
 useUIStore.setState({ notifications: newNotifs.slice(0, 50) });
 }
 }, [dbNotifs]);
}