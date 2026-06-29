"use client";

/**
 * @file useVocabList.ts
 * @description Hook kustom untuk mengelola pemuatan data, pencarian, pemfilteran,
 * dan pagination daftar kosakata (Vocabulary List) dari database Supabase secara luring-first.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import { useState, useEffect, useCallback } from "react";
import * as wanakana from "wanakana";
import { createClient } from "@/lib/supabase/client";
import { VocabItem } from "./types";

// ==========================================
// KONSTRUKTOR / INDEKS KONSTANTA
// ==========================================
const ITEMS_PER_PAGE = 50;

// ==========================================
// HOOK UTAMA: useVocabList
// ==========================================
/**
 * Hook kustom untuk orkestrasi pemuatan data kosakata lengkap dengan fitur pencarian dan filter kelas kata.
 * 
 * @param {VocabItem[]} initialData Data awal penampung kosakata untuk rendering pertama luring.
 * @returns {Object} State dan handler pemrosesan data kosakata.
 */
export function useVocabList(initialData: VocabItem[] = []) {
  const [level, setLevel] = useState("N5");
  const [hinshi, setHinshi] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [vocabList, setVocabList] = useState<VocabItem[]>(initialData);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  // Berikan jeda (debounce) sebesar 500ms pada input pencarian untuk menghemat beban kueri database
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Mengambil data kosakata halaman tertentu secara asinkron dari Supabase
  const fetchData = useCallback(async (page: number) => {
    setLoading(true);
    const supabase = createClient();
    const offset = (page - 1) * ITEMS_PER_PAGE;
    const levelFilter = level.toUpperCase();
    const trimmed = debouncedSearch.trim();

    try {
      let query = supabase
        .from("vocab")
        .select("id, word, furigana, romaji, meaning_id, hinshi, mnemonic, slug, related_kanji, jlpt_level", { count: "exact" })
        .eq("jlpt_level", levelFilter);

      // Menerapkan kueri pencarian multi-bahasa (Jepang Kanji/Kana, Romaji, Indonesia arti)
      if (trimmed !== "") {
        const kanaSearch = wanakana.toHiragana(trimmed);
        const kataSearch = wanakana.toKatakana(trimmed);
        query = query.or(
          `word.ilike.%${trimmed}%,meaning_id.ilike.%${trimmed}%,romaji.ilike.%${trimmed}%,word.ilike.%${kanaSearch}%,furigana.ilike.%${kanaSearch}%,word.ilike.%${kataSearch}%`
        );
      }

      // Menerapkan filter jenis kelas kata (hinshi)
      if (hinshi !== "all") {
        query = query.contains("hinshi", JSON.stringify([hinshi]));
      }

      const { data, count, error } = await query
        .order("romaji", { ascending: true, nullsFirst: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (error) throw error;

      // Normalisasi properti data dari Supabase ke dalam format VocabItem pustaka
      const mapped: VocabItem[] = (data || []).map((v: { id: string; word: string; furigana: string | null; romaji: string | null; meaning_id: string | null; hinshi: any; mnemonic: string | null; slug: string | null; related_kanji: any }) => ({
        id: v.id,
        word: v.word,
        furigana: v.furigana || undefined,
        romaji: v.romaji || undefined,
        meaning: v.meaning_id || "",
        hinshi: Array.isArray(v.hinshi) ? v.hinshi : v.hinshi ? [v.hinshi] : undefined,
        mnemonic: v.mnemonic || undefined,
        slug: v.slug || undefined,
        related_kanji: (v.related_kanji as Array<{ character: string; meaning: string }>) || [],
      }));

      setVocabList(mapped);
      setTotalItems(count || 0);
    } catch (error) {
      console.error("Gagal mengambil data kosakata dari awan:", error);
    } finally {
      setLoading(false);
    }
  }, [level, hinshi, debouncedSearch]);

  // Mengambil total item tanpa mengambil data baris secara asinkron (head-only query)
  const fetchTotalCount = useCallback(async () => {
    const supabase = createClient();
    const levelFilter = level.toUpperCase();
    const trimmed = debouncedSearch.trim();

    try {
      let query = supabase
        .from("vocab")
        .select("id", { count: "exact", head: true })
        .eq("jlpt_level", levelFilter);

      if (trimmed !== "") {
        const kanaSearch = wanakana.toHiragana(trimmed);
        const kataSearch = wanakana.toKatakana(trimmed);
        query = query.or(
          `word.ilike.%${trimmed}%,meaning_id.ilike.%${trimmed}%,romaji.ilike.%${trimmed}%,word.ilike.%${kanaSearch}%,furigana.ilike.%${kanaSearch}%,word.ilike.%${kataSearch}%`
        );
      }

      if (hinshi !== "all") {
        query = query.contains("hinshi", JSON.stringify([hinshi]));
      }

      const { count, error } = await query;
      if (error) throw error;
      setTotalItems(count || 0);
    } catch (error) {
      console.error("Gagal memuat kalkulasi jumlah kosakata:", error);
    }
  }, [level, hinshi, debouncedSearch]);

  // Menangani pemantauan perubahan filter dan memicu pemuatan ulang data asinkron
  useEffect(() => {
    const isDefaultFilter = level === "N5" && hinshi === "all" && debouncedSearch === "";
    
    // Pada rendering pertama dengan filter default, gunakan data awal tetapi ambil jumlah totalnya secara asinkron
    if (isDefaultFilter && initialData.length > 0 && totalItems === 0) {
      requestAnimationFrame(() => fetchTotalCount());
      return;
    }

    requestAnimationFrame(() => {
      setCurrentPage(1);
      fetchData(1);
    });
  }, [level, hinshi, debouncedSearch, fetchData, fetchTotalCount, initialData.length, totalItems]);

  // Handler berpindah halaman visual
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchData(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    level,
    setLevel,
    hinshi,
    setHinshi,
    search,
    setSearch,
    vocabList,
    totalItems,
    loading,
    currentPage,
    totalPages: Math.ceil(totalItems / ITEMS_PER_PAGE),
    handlePageChange,
  };
}

