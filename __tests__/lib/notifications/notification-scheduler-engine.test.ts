import { describe, it, expect } from "vitest";
import {
  reconcileNotificationItems,
  canRequestWebPushPermission,
  StoreNotificationItem,
  RawDbNotification,
} from "@/lib/notifications/notification-scheduler-engine";

describe("NotificationSchedulerEngine Seam", () => {
  it("harus menyatukan dan mendeduplikasi notifikasi baru dari DB", () => {
    const existing: StoreNotificationItem[] = [
      { id: "1", title: "Tingkat 1", message: "Pesan 1", type: "info", read: false, timestamp: 1000 },
    ];
    const incoming: RawDbNotification[] = [
      { id: "2", title: "Tingkat 2", message: "Pesan 2", type: "like", read: false, created_at: "2026-07-31T08:00:00Z" },
    ];

    const result = reconcileNotificationItems(existing, incoming);
    expect(result.hasChanges).toBe(true);
    expect(result.notifications).toHaveLength(2);
    expect(result.notifications[0].id).toBe("2"); // newest timestamp first
  });

  it("harus memperbarui status baca notifikasi yang sudah ada", () => {
    const existing: StoreNotificationItem[] = [
      { id: "1", title: "Tingkat 1", message: "Pesan 1", type: "info", read: false, timestamp: 1000 },
    ];
    const incoming: RawDbNotification[] = [
      { id: "1", title: "Tingkat 1", message: "Pesan 1", type: "info", read: true, created_at: "2026-07-31T08:00:00Z" },
    ];

    const result = reconcileNotificationItems(existing, incoming);
    expect(result.hasChanges).toBe(true);
    expect(result.notifications[0].read).toBe(true);
  });

  it("harus mengevaluasi kelayakan permintaan izin Web Push", () => {
    expect(canRequestWebPushPermission("default")).toBe(true);
    expect(canRequestWebPushPermission("granted")).toBe(false);
    expect(canRequestWebPushPermission("denied")).toBe(false);
  });
});
