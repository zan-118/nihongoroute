"use client";

import React, { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useProgressStore } from "@/store/useProgressStore";
import { useSyncProgress } from "@/hooks/useSyncProgress";
import { useHasMounted } from "@/hooks/useHasMounted";
import ReminderSystem from "@/components/features/notifications/ReminderSystem";

export const ProgressProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const hasMounted = useHasMounted();
  const setAuth = useProgressStore((state) => state.setAuth);
  const dirtySrs = useProgressStore((state) => state.dirtySrs);
  
  const supabase = createClient();

  // Inisialisasi Sinkronisasi via React Query Hook
  useSyncProgress();

  // AUTHENTICATION LISTENER
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const userFullName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || "Siswa";
      setAuth(!!session?.user, session?.user ? userFullName : null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const userFullName = session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || "Siswa";
      setAuth(!!session?.user, session?.user ? userFullName : null);
      
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
  }, [supabase.auth, setAuth]);
  
  // UNSYNCED DATA WARNING (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirtySrs.size > 0 && hasMounted) {
        const message = "Ada data belajar yang belum tersinkron ke Cloud. Yakin ingin keluar?";
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirtySrs, hasMounted]);

  if (!hasMounted) return null;

  return (
    <>
      <ReminderSystem />
      {children}
    </>
  );
};
