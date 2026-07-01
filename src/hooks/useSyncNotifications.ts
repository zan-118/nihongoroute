"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUIStore } from "@/store/useUIStore";
import { useUserStore } from "@/store/useUserStore";
import { getNotifications } from "@/actions/community.actions";

/**
 * Hook kustom untuk menyinkronkan notifikasi database (Supabase) ke Zustand UI Store.
 * Melakukan polling secara berkala untuk mengambil notifikasi interaksi komunitas terbaru.
 */
export function useSyncNotifications() {
  const isGuest = useUserStore((s) => s.isGuest);
  const currentUserId = useUserStore((s) => s.id);

  const { data: dbNotifs } = useQuery({
    queryKey: ["db_notifications", currentUserId],
    queryFn: () => getNotifications(),
    enabled: !isGuest && !!currentUserId,
    refetchInterval: 30000, // Sinkronkan setiap 30 detik
  });

  useEffect(() => {
    if (!dbNotifs || dbNotifs.length === 0) return;

    const currentNotifs = useUIStore.getState().notifications;
    let hasChanges = false;
    
    // Gandakan untuk manipulasi data
    const newNotifs = [...currentNotifs];

    dbNotifs.forEach((dbNotif) => {
      const existingIdx = newNotifs.findIndex((n) => n.id === dbNotif.id);
      if (existingIdx > -1) {
        // Jika ada perubahan status keterbacaan dari cloud
        if (newNotifs[existingIdx].read !== dbNotif.read) {
          newNotifs[existingIdx] = {
            ...newNotifs[existingIdx],
            read: dbNotif.read,
          };
          hasChanges = true;
        }
      } else {
        // Notifikasi baru dari database
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
      // Urutkan berdasarkan waktu terbaru
      newNotifs.sort((a, b) => b.timestamp - a.timestamp);
      // Batasi maksimal 50 notifikasi di cache lokal
      useUIStore.setState({ notifications: newNotifs.slice(0, 50) });
    }
  }, [dbNotifs]);
}
