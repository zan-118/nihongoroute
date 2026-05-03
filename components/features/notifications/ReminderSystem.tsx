"use client";

import { useEffect, useRef } from "react";
import { useProgressStore } from "@/store/useProgressStore";
import { useShallow } from "zustand/react/shallow";

export default function ReminderSystem() {
  const { srs, notificationsEnabled } = useProgressStore(
    useShallow((state) => ({
      srs: state.progress.srs,
      notificationsEnabled: state.progress.settings?.notificationsEnabled || false,
    }))
  );

  const lastNotifiedRef = useRef<number>(0);

  useEffect(() => {
    if (!notificationsEnabled || typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    if (Notification.permission !== "granted") {
      return;
    }

    const checkDueCards = () => {
      const now = Date.now();
      const dueCount = Object.values(srs).filter((card) => card.nextReview <= now).length;

      // Only notify if there are cards due and we haven't notified in the last 1 hour
      if (dueCount > 0 && now - lastNotifiedRef.current > 3600000) {
        new Notification("NihongoRoute", {
          body: `Okaeri! Ada ${dueCount} kartu yang butuh kamu review sekarang. Jangan sampai lupa ya!`,
          icon: "/logo-branding.png",
          tag: "srs-reminder", // Avoid duplicates
        });
        lastNotifiedRef.current = now;
      }
    };

    // Check immediately and then every 15 minutes
    checkDueCards();
    const interval = setInterval(checkDueCards, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [srs, notificationsEnabled]);

  return null; // This is a logic-only component
}
