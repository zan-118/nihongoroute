/**
 * @file route.ts
 * @description Webhook Handler untuk memproses data donasi dari Saweria.
 * @module SaweriaWebhook
 */

// ======================
// IMPOR
// ======================
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";
import { safeEqual } from "@/lib/core/admin-api-auth";
import { z } from "zod";
import { securityLogger } from "@/lib/core/logger";
import { rateLimit } from "@/lib/core/rate-limit";

const MAX_DONATION_AMOUNT = 1_000_000_000;

export const saweriaPayloadSchema = z
  .object({
    id: z.string().trim().min(1).max(200),
    donator_name: z.string().trim().max(100).optional(),
    amount_raw: z.coerce.number().int().positive().max(MAX_DONATION_AMOUNT),
    message: z.string().trim().max(1_000).optional(),
    created_at: z.string().optional(),
  });

// ======================
// HANDLER
// ======================
/**
 * Handle Saweria webhook POST request.
 * Verify signature, parse payload, save supporter to database.
 * 
 * @param request - Incoming HTTP request.
 * @returns JSON response with status.
 */
export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    // Batas 20 request per 10 detik per IP
    if (rateLimit(`saweria_webhook_${ip}`, 20, 10000)) {
      securityLogger.warn({ event: "saweria_webhook_rate_limit", source: "saweria", metadata: { ip } });
      return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
    }

    const expectedSecret = process.env.SAWERIA_WEBHOOK_SECRET?.trim();
    if (!expectedSecret) {
      return NextResponse.json(
        { error: "Saweria webhook is not configured" },
        { status: 503 }
      );
    }

    // Read raw body for signature verification.
    const rawBody = await request.text();
    const signature = request.headers.get("x-saweria-signature");

    if (!signature) {
      securityLogger.warn({ event: "saweria_webhook_missing_signature", source: "saweria" });
      return NextResponse.json({ error: "Missing Saweria signature" }, { status: 401 });
    }

    const computedSignature = crypto
      .createHmac("sha256", expectedSecret)
      .update(rawBody)
      .digest("hex");

    if (!safeEqual(computedSignature, signature.trim().toLowerCase())) {
      securityLogger.alert({ event: "saweria_webhook_invalid_signature", source: "saweria" });
      return NextResponse.json({ error: "Invalid Saweria signature" }, { status: 401 });
    }

    let json: unknown;
    try {
      json = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid payment payload data" }, { status: 400 });
    }

    const parsed = saweriaPayloadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payment payload data" }, { status: 400 });
    }

    const {
      donator_name: donatorName = "Anonim",
      amount_raw: amountRaw,
      message = "",
      created_at = "",
    } = parsed.data;

    if (created_at) {
      const createdAtDate = new Date(created_at);
      if (!isNaN(createdAtDate.getTime())) {
        const timeDiff = Math.abs(Date.now() - createdAtDate.getTime());
        // Batas replay window: 5 menit (300.000 ms)
        if (timeDiff > 300000) {
          securityLogger.alert({ 
            event: "saweria_webhook_replay_attack", 
            source: "saweria", 
            metadata: { created_at } 
          });
          return NextResponse.json({ error: "Replay window exceeded" }, { status: 400 });
        }
      }
    }

    // Tentukan tingkatan lencana (tier) berdasarkan total kontribusi
    let tier: "gold" | "silver" | "bronze" = "bronze";
    if (amountRaw >= 100000) {
      tier = "gold";
    } else if (amountRaw >= 50000) {
      tier = "silver";
    }

    // Initialize Supabase client with admin privileges.
    const supabase = createAdminClient();

    // Simpan ke database Supabase
    const { error } = await supabase
      .from("supporters")
      .insert({
        name: donatorName,
        amount: amountRaw,
        message: message,
        tier,
        source: "saweria",
        provider_event_id: parsed.data.id
      });

    if (error) {
      if (error.code === '23505') {
        securityLogger.warn({ 
          event: "saweria_webhook_duplicate", 
          source: "saweria", 
          metadata: { provider_event_id: parsed.data.id } 
        });
        return NextResponse.json({ success: true, message: "Duplicate donation ignored" });
      }
      securityLogger.error({ 
        event: "saweria_webhook_db_error", 
        source: "saweria", 
        metadata: { error_code: error.code } 
      });
      return NextResponse.json({ error: "Failed to save to database" }, { status: 500 });
    }

    securityLogger.info({ 
      event: "saweria_webhook_success", 
      source: "saweria", 
      metadata: { provider_event_id: parsed.data.id, amount: amountRaw } 
    });
    return NextResponse.json({ success: true, message: "Donator successfully processed and saved" });
  } catch (err) {
    securityLogger.error({ event: "saweria_webhook_fatal_error", source: "saweria" });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
