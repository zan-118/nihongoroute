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
    const key = body.key;

    // Validasi token webhook rahasia dari Trakteer
    const expectedKey = process.env.TRAKTEER_WEBHOOK_SECRET;
    if (expectedKey && key !== expectedKey) {
      return NextResponse.json({ error: "Invalid webhook secret key" }, { status: 401 });
    }

    if (!trId || netAmount <= 0) {
      return NextResponse.json({ error: "Invalid payment payload data" }, { status: 400 });
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
