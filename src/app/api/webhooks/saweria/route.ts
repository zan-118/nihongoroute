/**
 * @file route.ts
 * @description Webhook Handler untuk memproses data donasi dari Saweria.
 * @module SaweriaWebhook
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const body = JSON.parse(rawBody);
    
    // Saweria payload fields:
    // id, donator_name, amount_raw, message, created_at, signature/etc.
    const donatorId = body.id;
    const donatorName = body.donator_name || "Anonim";
    const amountRaw = Number(body.amount_raw || 0);
    const message = body.message || "";

    // Validasi signature Saweria (HMAC SHA256 dengan webhook secret) jika tersedia
    const expectedSecret = process.env.SAWERIA_WEBHOOK_SECRET;
    const signature = request.headers.get("x-saweria-signature");

    if (expectedSecret && signature) {
      const hmac = crypto.createHmac("sha256", expectedSecret);
      const computedSignature = hmac.update(rawBody).digest("hex");
      if (computedSignature !== signature) {
        return NextResponse.json({ error: "Invalid Saweria signature" }, { status: 401 });
      }
    } else if (expectedSecret) {
      // Fallback: check secret parameter in URL query or body parameter if signature header not present
      const { searchParams } = new URL(request.url);
      const secretQuery = searchParams.get("secret") || body.secret;
      if (secretQuery !== expectedSecret) {
        return NextResponse.json({ error: "Invalid webhook secret token" }, { status: 401 });
      }
    }

    if (!donatorId || amountRaw <= 0) {
      return NextResponse.json({ error: "Invalid payment payload data" }, { status: 400 });
    }

    // Tentukan tingkatan lencana (tier) berdasarkan total kontribusi
    let tier: "gold" | "silver" | "bronze" = "bronze";
    if (amountRaw >= 100000) {
      tier = "gold";
    } else if (amountRaw >= 50000) {
      tier = "silver";
    }

    const supabase = createAdminClient();

    // Simpan ke database Supabase
    const { error } = await supabase
      .from("supporters")
      .insert({
        name: donatorName,
        amount: amountRaw,
        message: message,
        tier,
        source: "saweria"
      });

    if (error) {
      console.error("Gagal menyimpan donatur Saweria ke Supabase:", error);
      return NextResponse.json({ error: "Failed to save to database" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Donator successfully processed and saved" });
  } catch (err) {
    console.error("Fatal error di Saweria webhook:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
