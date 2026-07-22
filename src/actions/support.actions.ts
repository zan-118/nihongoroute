/**
 * @file support.actions.ts
 * @description Server Actions untuk mengambil data donatur asli dari tabel `supporters` Supabase.
 * @module SupportActions
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { SupporterTable } from "@/types/database";

export interface FormattedSupporter {
  id: string;
  name: string;
  amount: string;
  numericAmount: number;
  tier: "gold" | "silver" | "bronze";
  message: string;
  date: string;
  source: "saweria" | "trakteer" | string;
}

/**
 * Mengambil daftar donatur asli dari Supabase.
 * Format nilai Rupiah dan tanggal secara relatif/lokal.
 */
export async function getSupporters(): Promise<FormattedSupporter[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("supporters")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);

    if (error || !data) {
      console.error("Gagal mengambil donatur dari Supabase:", error?.message);
      return [];
    }

    return (data as SupporterTable[]).map((supporter) => {
      const numericAmount = Number(supporter.amount || 0);
      const formattedAmount = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(numericAmount);

      // Tentukan tier berdasarkan jumlah donasi jika tidak ada di DB
      let tier: "gold" | "silver" | "bronze" = "bronze";
      if (supporter.tier === "gold" || numericAmount >= 100000) {
        tier = "gold";
      } else if (supporter.tier === "silver" || numericAmount >= 50000) {
        tier = "silver";
      }

      // Format tanggal relatif
      const createdAt = supporter.created_at ? new Date(supporter.created_at) : new Date();
      const dateStr = createdAt.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      return {
        id: supporter.id,
        name: supporter.name || "Anonim",
        amount: formattedAmount,
        numericAmount,
        tier,
        message: supporter.message || "Terima kasih atas dukungannya!",
        date: dateStr,
        source: supporter.source || "saweria",
      };
    });
  } catch (err) {
    console.error("Error di getSupporters action:", err);
    return [];
  }
}
