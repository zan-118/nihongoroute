"use client";

import { useState, useEffect, useCallback } from "react";
import * as wanakana from "wanakana";
import { createClient } from "@/lib/supabase/client";
import { VocabItem } from "./types";

const ITEMS_PER_PAGE = 50;

/**
 * Hook untuk menangani data fetching, filter, dan pagination kosakata dari Supabase.
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

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

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

      // Apply search filter
      if (trimmed !== "") {
        const kanaSearch = wanakana.toHiragana(trimmed);
        const kataSearch = wanakana.toKatakana(trimmed);
        query = query.or(
          `word.ilike.%${trimmed}%,meaning_id.ilike.%${trimmed}%,romaji.ilike.%${trimmed}%,word.ilike.%${kanaSearch}%,furigana.ilike.%${kanaSearch}%,word.ilike.%${kataSearch}%`
        );
      }

      // Apply hinshi filter
      if (hinshi !== "all") {
        query = query.contains("hinshi", JSON.stringify([hinshi]));
      }

      const { data, count, error } = await query
        .order("romaji", { ascending: true, nullsFirst: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (error) throw error;

      const mapped: VocabItem[] = (data || []).map(v => ({
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
      console.error("Gagal mengambil data:", error);
    } finally {
      setLoading(false);
    }
  }, [level, hinshi, debouncedSearch]);

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
      console.error("Gagal mengambil count:", error);
    }
  }, [level, hinshi, debouncedSearch]);

  // Handle filter changes
  useEffect(() => {
    const isDefaultFilter = level === "N5" && hinshi === "all" && debouncedSearch === "";
    
    // On first render with default filters, use initial data but fetch count
    if (isDefaultFilter && initialData.length > 0 && totalItems === 0) {
      requestAnimationFrame(() => fetchTotalCount());
      return;
    }

    requestAnimationFrame(() => {
      setCurrentPage(1);
      fetchData(1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, hinshi, debouncedSearch]);

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
