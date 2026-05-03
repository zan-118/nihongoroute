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
        const title = "NihongoRoute";
        const options = {
          body: `Okaeri! Ada ${dueCount} kartu yang butuh kamu review sekarang. Jangan sampai lupa ya!`,
          icon: "/logo-branding.png",
          badge: "/logo-branding.png",
          tag: "srs-reminder", // Avoid duplicates
          vibrate: [100, 50, 100],
        };

        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            registration.showNotification(title, options as any);
          }).catch(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            new Notification(title, options as any);
          });
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          new Notification(title, options as any);
        }
        
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
