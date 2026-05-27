/**
 * @file route.ts
 * @description Webhook Handler untuk memproses data donasi dari Trakteer.
 * @module TrakteerWebhook
 */

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Trakteer payload fields:
    // tr_id, supporter_name, quantity, price, net_amount, support_message, key, etc.
    const trId = body.tr_id;
    const supporterName = body.supporter_name || "Anonim";
    const netAmount = Number(body.net_amount || body.price * (body.quantity || 1) || 0);
    const supportMessage = body.support_message || "";
    // Validasi token webhook rahasia dari Trakteer (mendukung header x-trakteer-token dan body key)
    const expectedKey = process.env.TRAKTEER_WEBHOOK_SECRET;
    const token = request.headers.get("x-trakteer-token") || body.key;

    if (expectedKey && token !== expectedKey) {
      return NextResponse.json({ error: "Invalid webhook secret key" }, { status: 401 });
    }

    // Jika ini adalah uji coba/ping test dari dashboard Trakteer, langsung return sukses tanpa simpan DB
    const isTest = !trId || trId.toLowerCase().includes("test") || netAmount <= 0;
    if (isTest) {
      return NextResponse.json({ success: true, message: "Trakteer Webhook Test Successful" });
    }

    // Tentukan tingkatan lencana (tier) berdasarkan total kontribusi
    let tier: "gold" | "silver" | "bronze" = "bronze";
    if (netAmount >= 100000) {
      tier = "gold";
    } else if (netAmount >= 50000) {
      tier = "silver";
    }

    const supabase = createAdminClient();

    // Simpan ke database Supabase
    const { error } = await supabase
      .from("supporters")
      .insert({
        name: supporterName,
        amount: netAmount,
        message: supportMessage,
        tier,
        source: "trakteer"
      });

    if (error) {
      console.error("Gagal menyimpan donatur Trakteer ke Supabase:", error);
      return NextResponse.json({ error: "Failed to save to database" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Donator successfully processed and saved" });
  } catch (err) {
    console.error("Fatal error di Trakteer webhook:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
