"use server";

import { createClient } from "@/lib/supabase/server";

export interface RandomExpression {
  id: string;
  text: string;
  reading: string;
  meanings: string[];
  indonesia: string[];
  jlpt_level: string | null;
}

/**
 * Mengambil satu ungkapan acak dari tabel `expressions`
 * dengan filter `common = true` untuk menjamin kualitas ungkapan.
 */
export async function getRandomExpression(): Promise<RandomExpression | null> {
  const supabase = await createClient();

  // Ambil jumlah total ungkapan umum untuk offset acak
  const { count } = await supabase
    .from("expressions")
    .select("*", { count: "exact", head: true })
    .eq("common", true);

  if (!count || count === 0) return null;

  const randomOffset = Math.floor(Math.random() * count);

  const { data, error } = await supabase
    .from("expressions")
    .select("id, text, reading, meanings, indonesia, jlpt_level")
    .eq("common", true)
    .range(randomOffset, randomOffset)
    .single();

  if (error || !data) {
    console.error("[getRandomExpression] error:", error?.message);
    return null;
  }

  return {
    id: data.id as string,
    text: data.text as string,
    reading: data.reading as string,
    meanings: Array.isArray(data.meanings) ? (data.meanings as string[]) : [],
    indonesia: Array.isArray(data.indonesia) ? (data.indonesia as string[]) : [],
    jlpt_level: (data.jlpt_level as string | null) ?? null,
  };
}
