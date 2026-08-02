/**
 * @file notification-scheduler-engine.ts
 * @description Core domain engine seam untuk mengelola deduplikasi pemberitahuan,
 * perataan urutan (sorting timestamp), penggabungan data server ke store lokal, dan evaluasi izin Web Push API.
 * 100% bebas dari ketergantungan React DOM/hooks untuk keterujian murni via Vitest.
 */

export interface RawDbNotification {
 id: string;
 title: string;
 message: string;
 type: string;
 read: boolean;
 created_at: string;
}

export interface StoreNotificationItem {
 id: string;
 title: string;
 message: string;
 type: "success" | "info" | "warning" | "error";
 read: boolean;
 timestamp: number;
}

export interface NotificationReconcileResult {
 hasChanges: boolean;
 notifications: StoreNotificationItem[];
}

/**
 * Reconciles remote DB notifications into local store notification items list.
 * Deduplicates items, updates read statuses, sorts newest first, and caps list size.
 */
export function reconcileNotificationItems(
 existingItems: StoreNotificationItem[],
 incomingDbItems: RawDbNotification[],
 maxLimit: number = 50
): NotificationReconcileResult {
 if (!incomingDbItems || incomingDbItems.length === 0) {
 return { hasChanges: false, notifications: existingItems };
 }

 const merged = [...existingItems];
 let hasChanges = false;

 incomingDbItems.forEach((dbItem) => {
 const idx = merged.findIndex((n) => n.id === dbItem.id);
 if (idx > -1) {
 if (merged[idx].read !== dbItem.read) {
 merged[idx] = {
 ...merged[idx],
 read: dbItem.read,
 };
 hasChanges = true;
 }
 } else {
 merged.push({
 id: dbItem.id,
 title: dbItem.title,
 message: dbItem.message,
 type: dbItem.type === "like" || dbItem.type === "achievement" ? "success" : "info",
 read: dbItem.read,
 timestamp: new Date(dbItem.created_at).getTime() || Date.now(),
 });
 hasChanges = true;
 }
 });

 if (hasChanges) {
 merged.sort((a, b) => b.timestamp - a.timestamp);
 return {
 hasChanges: true,
 notifications: merged.slice(0, maxLimit),
 };
 }

 return {
 hasChanges: false,
 notifications: existingItems,
 };
}

/**
 * Evaluates whether Web Push Notifications can be requested based on browser environment.
 */
export function canRequestWebPushPermission(permissionState?: string): boolean {
 if (permissionState === "granted" || permissionState === "denied") {
 return false;
 }
 return true;
}
