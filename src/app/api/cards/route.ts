import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// UUID v4 validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface FormattedCard {
  _id: string;
  id: string;
  word: string;
  meaning: string;
  romaji?: string | null;
  furigana?: string | null;
  jlptLevel?: string | null;
  examples?: Array<{ japanese: string; indonesian: string }> | null;
  mnemonic?: string | null;
  usageNotes?: string | null;
  pitchAccent?: string | null;
  hinshi?: string | null;
  category: "vocab" | "kanji";
  docType: "vocab" | "kanji";
  kanjiDetails?: {
    onyomi?: string | null;
    kunyomi?: string | null;
  } | null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids");

  if (!idsParam) {
    return NextResponse.json({ error: "Parameter 'ids' wajib diisi." }, { status: 400 });
  }

  // Pisahkan parameter identifikasi
  const rawIds = idsParam.split(",").map(id => id.trim()).filter(Boolean);

  if (rawIds.length === 0) {
    return NextResponse.json([], { status: 200 });
  }

  const uuids: string[] = [];
  const slugs: string[] = [];
  const romajis: string[] = [];
  const kanjiChars: string[] = [];

  const posPrefixes = [
    "pre-noun-adjectival-",
    "adverbial-noun-",
    "temporal-noun-",
    "noun-",
    "pronoun-",
    "numeric-",
    "expression-",
    "conjunction-",
    "verb-"
  ];

  for (const id of rawIds) {
    if (UUID_REGEX.test(id)) {
      uuids.push(id);
    } else if (id.startsWith("n5-") || id.startsWith("n4-")) {
      // Ekstrak romaji secara cerdas dari ID legacy Sanity
      const cleanId = id.slice(3); // Hapus n5- atau n4-
      let romajiFound = cleanId;
      for (const prefix of posPrefixes) {
        if (cleanId.startsWith(prefix)) {
          romajiFound = cleanId.slice(prefix.length);
          break;
        }
      }
      romajis.push(romajiFound);
    } else if (id.length === 1) {
      kanjiChars.push(id);
    } else {
      slugs.push(id);
    }
  }

  try {
    const supabase = await createClient();

    // 1. Eksekusi seluruh kueri secara paralel asinkron
    const [
      vocabByUuidRes,
      vocabBySlugRes,
      vocabByRomajiRes,
      kanjiByUuidRes,
      kanjiByCharRes
    ] = await Promise.all([
      uuids.length > 0 
        ? supabase.from("vocab").select("id, word, meaning:meaning_id, romaji, furigana, jlpt_level, examples, mnemonic, usage_notes, pitch_accent, hinshi").in("id", uuids) 
        : Promise.resolve({ data: null, error: null }),
      slugs.length > 0 
        ? supabase.from("vocab").select("id, word, meaning:meaning_id, romaji, furigana, jlpt_level, examples, mnemonic, usage_notes, pitch_accent, hinshi").in("slug", slugs) 
        : Promise.resolve({ data: null, error: null }),
      romajis.length > 0 
        ? supabase.from("vocab").select("id, word, meaning:meaning_id, romaji, furigana, jlpt_level, examples, mnemonic, usage_notes, pitch_accent, hinshi").in("romaji", romajis) 
        : Promise.resolve({ data: null, error: null }),
      uuids.length > 0 
        ? supabase.from("kanji").select("id, character, meaning, onyomi, kunyomi, jlpt_level, stroke_order_svg, mnemonics, examples").in("id", uuids) 
        : Promise.resolve({ data: null, error: null }),
      kanjiChars.length > 0 
        ? supabase.from("kanji").select("id, character, meaning, onyomi, kunyomi, jlpt_level, stroke_order_svg, mnemonics, examples").in("character", kanjiChars) 
        : Promise.resolve({ data: null, error: null }),
    ]);

    // Tangani error kueri
    if (vocabByUuidRes.error) throw vocabByUuidRes.error;
    if (vocabBySlugRes.error) throw vocabBySlugRes.error;
    if (vocabByRomajiRes.error) throw vocabByRomajiRes.error;
    if (kanjiByUuidRes.error) throw kanjiByUuidRes.error;
    if (kanjiByCharRes.error) throw kanjiByCharRes.error;

    // 2. Gabungkan & Eliminasi Duplikat kosakata (UUID & Slug)
    const rawVocabs = [
      ...(vocabByUuidRes.data || []),
      ...(vocabBySlugRes.data || [])
    ];
    const uniqueVocabsMap = new Map<string, typeof rawVocabs[number]>();
    rawVocabs.forEach(v => uniqueVocabsMap.set(v.id, v));

    // Gabungkan & Eliminasi Duplikat Kanji
    const rawKanjis = [
      ...(kanjiByUuidRes.data || []),
      ...(kanjiByCharRes.data || [])
    ];
    const uniqueKanjisMap = new Map<string, typeof rawKanjis[number]>();
    rawKanjis.forEach(k => uniqueKanjisMap.set(k.id, k));

    // 3. Format kosakata menjadi struktur MasterCardData
    const formattedVocabs: FormattedCard[] = Array.from(uniqueVocabsMap.values()).map((v) => ({
      _id: v.id,
      id: v.id,
      word: v.word,
      meaning: v.meaning,
      romaji: v.romaji,
      furigana: v.furigana,
      jlptLevel: v.jlpt_level,
      examples: Array.isArray(v.examples) ? v.examples.map((ex: any) => ({
        japanese: ex?.japanese || ex?.jp || "",
        indonesian: ex?.indonesian || ex?.meaning || ex?.id || ""
      })) : [],
      mnemonic: v.mnemonic,
      usageNotes: v.usage_notes,
      pitchAccent: v.pitch_accent,
      hinshi: v.hinshi,
      category: "vocab",
      docType: "vocab",
    }));

    // 4. Format kosakata dari kueri romaji ke struktur legacy ID
    const formattedRomajiVocabs: FormattedCard[] = [];
    if (vocabByRomajiRes.data) {
      vocabByRomajiRes.data.forEach((v) => {
        const matchingLegacyIds = rawIds.filter((id) => {
          if (!id.startsWith("n5-") && !id.startsWith("n4-")) return false;
          const cleanId = id.slice(3);
          let romajiFound = cleanId;
          for (const prefix of posPrefixes) {
            if (cleanId.startsWith(prefix)) {
              romajiFound = cleanId.slice(prefix.length);
              break;
            }
          }
          return romajiFound.toLowerCase() === v.romaji?.toLowerCase();
        });

        matchingLegacyIds.forEach((legacyId) => {
          formattedRomajiVocabs.push({
            _id: legacyId,
            id: legacyId, // SANGAT PENTING: Gunakan ID legacy agar sesuai dengan Zustand store client!
            word: v.word,
            meaning: v.meaning,
            romaji: v.romaji,
            furigana: v.furigana,
            jlptLevel: v.jlpt_level,
            examples: Array.isArray(v.examples) ? v.examples.map((ex: any) => ({
              japanese: ex?.japanese || ex?.jp || "",
              indonesian: ex?.indonesian || ex?.meaning || ex?.id || ""
            })) : [],
            mnemonic: v.mnemonic,
            usageNotes: v.usage_notes,
            pitchAccent: v.pitch_accent,
            hinshi: v.hinshi,
            category: "vocab",
            docType: "vocab",
          });
        });
      });
    }

    // 5. Format Kanji menjadi struktur MasterCardData
    const formattedKanjis: FormattedCard[] = Array.from(uniqueKanjisMap.values()).map((k) => {
      let formattedMnemonic = "";
      if (Array.isArray(k.mnemonics)) {
        formattedMnemonic = k.mnemonics.join("\n");
      } else if (typeof k.mnemonics === "string") {
        formattedMnemonic = k.mnemonics;
      }

      const formattedExamples = Array.isArray(k.examples) ? k.examples.map((ex: any) => ({
        japanese: ex?.japanese || ex?.jp || "",
        indonesian: ex?.indonesian || ex?.meaning || ex?.id || ""
      })) : [];

      return {
        _id: k.id,
        id: k.id,
        word: k.character,
        meaning: k.meaning,
        romaji: null,
        furigana: k.kunyomi || k.onyomi || null,
        jlptLevel: k.jlpt_level,
        examples: formattedExamples,
        mnemonic: formattedMnemonic || null,
        category: "kanji",
        docType: "kanji",
        kanjiDetails: {
          onyomi: k.onyomi,
          kunyomi: k.kunyomi,
        }
      };
    });

    // 6. Gabungkan seluruh tipe kartu secara unik berdasarkan id
    const uniqueFinalCardsMap = new Map<string, FormattedCard>();
    formattedVocabs.forEach(c => uniqueFinalCardsMap.set(c.id, c));
    formattedRomajiVocabs.forEach(c => uniqueFinalCardsMap.set(c.id, c));
    formattedKanjis.forEach(c => uniqueFinalCardsMap.set(c.id, c));

    const allCards = Array.from(uniqueFinalCardsMap.values());

    // 7. Urutkan hasil agar presisi sesuai dengan urutan parameter `ids` yang diminta klien
    const requestedOrderMap = new Map<string, number>();
    rawIds.forEach((id, index) => {
      requestedOrderMap.set(id.toLowerCase(), index);
    });

    allCards.sort((a, b) => {
      const aKeys = [a.id.toLowerCase(), a.word.toLowerCase()];
      const bKeys = [b.id.toLowerCase(), b.word.toLowerCase()];
      
      let aIdx = 9999;
      let bIdx = 9999;
      
      for (const k of aKeys) {
        if (requestedOrderMap.has(k)) {
          aIdx = requestedOrderMap.get(k)!;
          break;
        }
      }
      for (const k of bKeys) {
        if (requestedOrderMap.has(k)) {
          bIdx = requestedOrderMap.get(k)!;
          break;
        }
      }
      
      return aIdx - bIdx;
    });

    return NextResponse.json(allCards);
  } catch (error) {
    console.error("[API /api/cards] Gagal mengambil data kartu dari Supabase:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data kartu dari database." },
      { status: 500 }
    );
  }
}
