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

const ReminderSystem = dynamic(() => import("@/components/features/notifications/ReminderSystem"), { ssr: false });

// ======================
// EKSEKUSI UTAMA
// ======================
export const ProgressProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const hasMounted = useHasMounted();
  const setAuth = useAuthStore((state) => state.setAuth);
  const syncUserData = useUserStore((state) => state.syncUserData);
  const dirtySrsSize = useSRSStore((state) => state.dirtySrs.size);
  
  const [supabase] = useState(() => createClient());

  // Inisialisasi Sinkronisasi via React Query Hook
  useSyncProgress();

  // AUTHENTICATION LISTENER
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: { user?: { id: string; user_metadata?: { full_name?: string }; email?: string } } | null } }) => {
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
            description: "Senang kamu kembali, mari taklukkan tantangan hari ini!",
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
  }, [setAuth, supabase, syncUserData]);
  
  // UNSYNCED DATA WARNING (beforeunload)
  useEffect(() => {
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
