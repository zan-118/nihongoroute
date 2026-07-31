/**
 * @file notification-engine.ts
 * @description Modul dalam (deep module) untuk konstruksi payload pemberitahuan komunitas,
 * pembentukan pesan standar, dan pengiriman notifikasi via Supabase Admin Client.
 */

export interface NotificationPayload {
  user_id: string;
  sender_id: string;
  type: string;
  title: string;
  message: string;
  post_id: string;
  read: boolean;
}

/**
 * Membentuk payload notifikasi untuk komentar baru pada postingan.
 */
export function buildCommentNotificationPayload(
  targetUserId: string,
  senderId: string,
  senderName: string | null | undefined,
  postId: string
): NotificationPayload {
  const displayName = senderName?.trim() || "Seseorang";
  return {
    user_id: targetUserId,
    sender_id: senderId,
    type: "comment",
    title: "Komentar Baru",
    message: `${displayName} mengomentari postingan Anda.`,
    post_id: postId,
    read: false,
  };
}

/**
 * Membentuk payload notifikasi untuk apresiasi (like) pada postingan.
 */
export function buildLikeNotificationPayload(
  targetUserId: string,
  senderId: string,
  senderName: string | null | undefined,
  postId: string
): NotificationPayload {
  const displayName = senderName?.trim() || "Seseorang";
  return {
    user_id: targetUserId,
    sender_id: senderId,
    type: "like",
    title: "Suka Posting",
    message: `${displayName} menyukai postingan Anda.`,
    post_id: postId,
    read: false,
  };
}

/**
 * Mengirim notifikasi komunitas ke database via admin client Supabase.
 *
 * @param adminClient Client Supabase service role
 * @param payload Payload notifikasi yang sudah terbentuk
 */
export async function sendCommunityNotification(
  adminClient: unknown,
  payload: NotificationPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = adminClient as { from: (table: string) => { insert: (data: unknown) => Promise<{ error: unknown }> | { error: unknown } } };
    const { error } = await client.from("notifications").insert(payload);
    if (error) {
      console.error("[NotificationEngine] Gagal menyisipkan notifikasi:", error);
      return { success: false, error: String(error) };
    }
    return { success: true };
  } catch (err) {
    console.error("[NotificationEngine] Gagal mengeksekusi pengiriman notifikasi:", err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
