import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// UUID v4 validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids");

  if (!idsParam) {
    return NextResponse.json({ error: "Parameter 'ids' wajib diisi." }, { status: 400 });
  }

  // Filter hanya UUID valid — buang legacy IDs seperti "n5-noun-shigoto"
  const ids = idsParam.split(",").filter((id) => UUID_REGEX.test(id.trim()));

  if (ids.length === 0) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("vocab")
      .select(`
        id,
        word,
        meaning:meaning_id,
        romaji,
        furigana,
        jlpt_level,
        examples,
        mnemonic,
        usage_notes,
        pitch_accent,
        hinshi
      `)
      .in("id", ids);

    if (error) throw error;

    const formattedData = (data ?? []).map((v: any) => ({
      _id: v.id,
      id: v.id,
      word: v.word,
      meaning: v.meaning,
      romaji: v.romaji,
      furigana: v.furigana,
      jlptLevel: v.jlpt_level,
      examples: v.examples || [],
      mnemonic: v.mnemonic,
      usageNotes: v.usage_notes,
      pitchAccent: v.pitch_accent,
      hinshi: v.hinshi,
      category: "vocab",
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("[API /api/cards] Gagal mengambil data kartu dari Supabase:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data kartu." },
      { status: 500 }
    );
  }
}

