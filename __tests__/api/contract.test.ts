import { describe, expect, it } from "vitest";

// Karena kita menggunakan Next.js App Router, pengujian kontrak penuh biasanya memerlukan
// server yang berjalan (misal dengan Playwright atau supertest + server custom).
// Namun, kita dapat melakukan pengujian skema / validasi modul secara langsung
// untuk memastikan kontrak Zod dan error responses sesuai ekspektasi.

import { saweriaPayloadSchema } from "@/app/api/webhooks/saweria/route";
import { trakteerPayloadSchema } from "@/app/api/webhooks/trakteer/route";
import { POST as postSaweria } from "@/app/api/webhooks/saweria/route";
import { POST as postTrakteer } from "@/app/api/webhooks/trakteer/route";

describe("API Contract Validation", () => {
  describe("Saweria Webhook Schema Contract", () => {
    it("menerima payload yang valid", () => {
      const validPayload = {
        id: "donasi-valid-123",
        donator_name: "Fauzan",
        amount_raw: 50000,
        message: "Semangat ngoding!",
        created_at: new Date().toISOString()
      };
      
      const result = saweriaPayloadSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("menolak payload tanpa field wajib", () => {
      const invalidPayload = {
        donator_name: "Fauzan",
        message: "Semangat ngoding!",
      };
      
      const result = saweriaPayloadSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe("Trakteer Webhook Schema Contract", () => {
    it("menerima payload yang valid (transaction_id)", () => {
      const validPayload = {
        transaction_id: "trx-valid-123",
        supporter_name: "Fauzan",
        net_amount: 100000,
        price: 100000,
        quantity: 1,
        supporter_message: "Ganbatte!",
        payment_date: new Date().toISOString()
      };
      
      const result = trakteerPayloadSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("menerima payload yang valid (tr_id)", () => {
      const validPayload = {
        tr_id: "trx-valid-456",
        supporter_name: "Fauzan",
        net_amount: 100000,
      };
      
      const result = trakteerPayloadSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("menolak payload tanpa transaction_id dan tr_id", () => {
      const invalidPayload = {
        supporter_name: "Fauzan",
        net_amount: 100000,
      };
      
      const result = trakteerPayloadSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe("Webhook Auth Guards", () => {
    it("menolak Saweria webhook tanpa signature", async () => {
      process.env.SAWERIA_WEBHOOK_SECRET = "secret";

      const response = await postSaweria(new Request("https://example.test/api/webhooks/saweria", {
        method: "POST",
        body: JSON.stringify({ id: "donasi-1", amount_raw: 50000 }),
      }));

      expect(response.status).toBe(401);
    });

    it("menolak Trakteer webhook dengan token salah", async () => {
      process.env.TRAKTEER_WEBHOOK_SECRET = "secret";

      const response = await postTrakteer(new Request("https://example.test/api/webhooks/trakteer", {
        method: "POST",
        headers: { "x-webhook-token": "wrong" },
        body: JSON.stringify({ transaction_id: "trx-1", net_amount: 50000 }),
      }));

      expect(response.status).toBe(401);
    });
  });
});
