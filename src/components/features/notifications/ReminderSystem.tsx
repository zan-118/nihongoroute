"use client";

/**
 * @file ReminderSystem.tsx
 * @description Komponen sistem pengingat latar belakang (Reminder System) tanpa visual (renderless).
 * Secara periodik memeriksa ketersediaan kartu SRS yang telah jatuh tempo dan memicu notifikasi peramban.
 */

// ======================
// IMPOR
// ======================
import { useEffect, useRef } from "react";
import { useSRSStore } from "@/store/useSRSStore";
import { useUIStore } from "@/store/useUIStore";

// ======================
// EKSEKUSI UTAMA
// ======================
export default function ReminderSystem() {
  const srs = useSRSStore((state) => state.srs);
  const settings = useUIStore((state) => state.settings);

  const lastNotifiedRef = useRef<number>(0);

  useEffect(() => {
    if (!settings.notificationsEnabled || typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    if (Notification.permission !== "granted") {
      return;
    }

    const checkDueCards = () => {
      const now = Date.now();
      const dueCount = Object.values(srs).filter((card) => !card.isDeleted && card.nextReview <= now).length;

      // Hanya beri notifikasi jika ada kartu yang jatuh tempo dan kita belum memberitahu dalam 1 jam terakhir
      if (dueCount > 0 && now - lastNotifiedRef.current > 3600000) {
        const title = "NihongoRoute";
        const options = {
          body: `Okaeri! Ada ${dueCount} kartu yang butuh kamu review sekarang. Jangan sampai lupa ya!`,
          icon: "/logo-branding.png",
          badge: "/logo-branding.png",
          tag: "srs-reminder", // Hindari duplikasi
          vibrate: [100, 50, 100],
        };

        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, options as NotificationOptions);
          }).catch(() => {
            new Notification(title, options as NotificationOptions);
          });
        } else {
          new Notification(title, options as NotificationOptions);
        }
        
        lastNotifiedRef.current = now;
      }
    };

    // Periksa segera dan kemudian setiap 15 menit
    checkDueCards();
    const interval = setInterval(checkDueCards, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [srs, settings.notificationsEnabled]);

  return null; // Komponen ini hanya berisi logika
}
