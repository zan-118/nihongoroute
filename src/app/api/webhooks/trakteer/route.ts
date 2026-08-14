/**
 * @file route.ts
 * @description Webhook Handler untuk memproses data donasi dari Trakteer.
 * @module TrakteerWebhook
 */

// ======================
// IMPOR
// ======================
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { safeEqual } from "@/lib/core/admin-api-auth";
import { z } from "zod";
import { securityLogger } from "@/lib/core/logger";
import { rateLimit } from "@/lib/core/rate-limit";

const MAX_DONATION_AMOUNT = 1_000_000_000;

const optionalAmountSchema = z.coerce
 .number()
 .finite()
 .nonnegative()
 .max(MAX_DONATION_AMOUNT)
 .optional();

export const trakteerPayloadSchema = z
 .object({
 tr_id: z.string().trim().min(1).max(200).optional(),
 transaction_id: z.string().trim().min(1).max(200).optional(),
 supporter_name: z.string().trim().max(100).optional(),
 net_amount: optionalAmountSchema,
 price: optionalAmountSchema,
 quantity: z.coerce.number().int().positive().max(10_000).optional(),
 supporter_message: z.string().trim().max(1_000).optional(),
 support_message: z.string().trim().max(1_000).optional(),
 payment_date: z.string().optional(),
 created_at: z.string().optional(),
 })
 .refine((payload) => Boolean(payload.transaction_id || payload.tr_id), {
 message: "Transaction ID is required",
 });

// ======================
// HANDLER UTAMA (POST)
// ======================
/**
 * Handles POST requests from Trakteer webhook.
 * Validates token, parses donation details, determines tier, and saves to database.
 * 
 * @param request - Incoming HTTP request.
 * @returns JSON response indicating success or failure.
 */
export async function POST(request: Request) {
 try {
 const ip = request.headers.get("x-forwarded-for") ?? "unknown";
 // Batas 20 request per 10 detik per IP
 if (rateLimit(`trakteer_webhook_${ip}`, 20, 10000)) {
 securityLogger.warn({ event: "trakteer_webhook_rate_limit", source: "trakteer", metadata: { ip } });
 return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
 }

 const expectedKey = process.env.TRAKTEER_WEBHOOK_SECRET?.trim();
 if (!expectedKey) {
 return NextResponse.json(
 { error: "Trakteer webhook is not configured" },
 { status: 503 }
 );
 }

 const token =
 request.headers.get("x-webhook-token") ||
 request.headers.get("x-trakteer-token");
 const cleanToken = (token || "").replace(/[\s\r\n]/g, "");
 const cleanExpected = expectedKey.replace(/[\s\r\n]/g, "");

 if (!cleanToken || !safeEqual(cleanToken, cleanExpected)) {
 securityLogger.alert({ event: "trakteer_webhook_invalid_token", source: "trakteer" });
 return NextResponse.json({ error: "Invalid webhook secret key" }, { status: 401 });
 }

 const parsed = trakteerPayloadSchema.safeParse(await request.json());
 if (!parsed.success) {
 return NextResponse.json({ error: "Invalid payment payload data" }, { status: 400 });
 }

 const body = parsed.data;
 
 // Field payload Trakteer:
 // transaction_id/tr_id, supporter_name, quantity, price, net_amount, supporter_message/support_message
 const trId = (body.transaction_id || body.tr_id)!;
 const supporterName = body.supporter_name || "Anonim";
 
 // Calculate donation amounts
 const priceVal = body.price ?? 0;
 const quantityVal = body.quantity ?? 1;
 const netAmount = body.net_amount ?? priceVal * quantityVal;
 
 const supportMessage = body.supporter_message || body.support_message || "";
 // Jika ini adalah uji coba/ping test dari dashboard Trakteer, langsung return sukses tanpa simpan DB
 const isTest = trId.toLowerCase().includes("test");
 if (isTest) {
 return NextResponse.json({ success: true, message: "Trakteer Webhook Test Successful" });
 }

 if (!Number.isFinite(netAmount) || netAmount <= 0 || netAmount > MAX_DONATION_AMOUNT) {
 return NextResponse.json({ error: "Invalid payment payload data" }, { status: 400 });
 }

 // Tentukan tingkatan lencana (tier) berdasarkan total kontribusi
 let tier: "gold" | "silver" | "bronze" = "bronze";
 if (netAmount >= 100000) {
 tier = "gold";
 } else if (netAmount >= 50000) {
 tier = "silver";
 }

 // Initialize Supabase admin client
 const supabase = createAdminClient();

 // Simpan ke database Supabase
 const { error } = await supabase
 .from("supporters")
 .insert({
 name: supporterName,
 amount: netAmount,
 message: supportMessage,
 tier,
 source: "trakteer",
 provider_event_id: trId
 });

 // Handle database insertion errors
 if (error) {
 if (error.code === '23505') {
 securityLogger.warn({ 
 event: "trakteer_webhook_duplicate", 
 source: "trakteer", 
 metadata: { provider_event_id: trId } 
 });
 return NextResponse.json({ success: true, message: "Duplicate donation ignored" });
 }
 securityLogger.error({ 
 event: "trakteer_webhook_db_error", 
 source: "trakteer", 
 metadata: { error_code: error.code } 
 });
 return NextResponse.json({ error: "Failed to save to database" }, { status: 500 });
 }

 securityLogger.info({ 
 event: "trakteer_webhook_success", 
 source: "trakteer", 
 metadata: { provider_event_id: trId, amount: netAmount } 
 });
 return NextResponse.json({ success: true, message: "Donator successfully processed and saved" });
 } catch (err) {
 // Handle unexpected errors
 securityLogger.error({ event: "trakteer_webhook_fatal_error", source: "trakteer" });
 return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
 }
}
