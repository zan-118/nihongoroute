/**
 * @file notification-engine.test.ts
 * @description Unit test untuk NotificationEngine — menguji pembuatan payload komentar,
 * payload like, penanganan senderName kosong, serta pengiriman via admin client mock.
 */

import { describe, it, expect, vi } from "vitest";
import {
  buildCommentNotificationPayload,
  buildLikeNotificationPayload,
  sendCommunityNotification,
} from "@/lib/notifications/notification-engine";

describe("NotificationEngine", () => {
  describe("buildCommentNotificationPayload", () => {
    it("creates correct comment notification payload with sender name", () => {
      const payload = buildCommentNotificationPayload(
        "owner-123",
        "sender-456",
        "Tanaka Taro",
        "post-789"
      );

      expect(payload).toEqual({
        user_id: "owner-123",
        sender_id: "sender-456",
        type: "comment",
        title: "Komentar Baru",
        message: "Tanaka Taro mengomentari postingan Anda.",
        post_id: "post-789",
        read: false,
      });
    });

    it("falls back to 'Seseorang' when senderName is null or empty", () => {
      const payloadNull = buildCommentNotificationPayload("owner-123", "sender-456", null, "post-789");
      expect(payloadNull.message).toBe("Seseorang mengomentari postingan Anda.");

      const payloadEmpty = buildCommentNotificationPayload("owner-123", "sender-456", "   ", "post-789");
      expect(payloadEmpty.message).toBe("Seseorang mengomentari postingan Anda.");
    });
  });

  describe("buildLikeNotificationPayload", () => {
    it("creates correct like notification payload", () => {
      const payload = buildLikeNotificationPayload(
        "owner-123",
        "sender-456",
        "Yamada Hanako",
        "post-789"
      );

      expect(payload).toEqual({
        user_id: "owner-123",
        sender_id: "sender-456",
        type: "like",
        title: "Suka Posting",
        message: "Yamada Hanako menyukai postingan Anda.",
        post_id: "post-789",
        read: false,
      });
    });
  });

  describe("sendCommunityNotification", () => {
    it("inserts notification payload via admin client successfully", async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null });
      const mockAdminClient = {
        from: vi.fn().mockReturnValue({ insert: mockInsert }),
      };

      const payload = buildCommentNotificationPayload("user-1", "user-2", "User 2", "post-1");
      const result = await sendCommunityNotification(mockAdminClient, payload);

      expect(result.success).toBe(true);
      expect(mockAdminClient.from).toHaveBeenCalledWith("notifications");
      expect(mockInsert).toHaveBeenCalledWith(payload);
    });

    it("returns error result on database insertion failure", async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: "DB Error" });
      const mockAdminClient = {
        from: vi.fn().mockReturnValue({ insert: mockInsert }),
      };

      const payload = buildCommentNotificationPayload("user-1", "user-2", "User 2", "post-1");
      const result = await sendCommunityNotification(mockAdminClient, payload);

      expect(result.success).toBe(false);
      expect(result.error).toBe("DB Error");
    });
  });
});
