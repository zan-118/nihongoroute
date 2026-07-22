/**
 * @file useReadingLogic.ts
 * @description Hook khusus untuk mengelola logika membaca artikel, mencakup parsing teks multi-format (Rich Text vs Plain Text), kontrol mode visualisasi, dan sinkronisasi status ke Zustand.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { useEffect, useMemo, type ElementType } from "react";
import { useUIStore } from "@/store/useUIStore";
import { BookOpen, Eye, EyeOff, Type } from "@/components/ui/icons";
import { ReadingData, ReadingMode, PortableTextContent, PortableTextBlock } from "../types";

// ==========================================
// HOOK UTAMA
// ==========================================
/**
 * Custom hook to manage reading article logic.
 * Handles multi-format text parsing, visualization modes, and Zustand state sync.
 * 
 * @param data - Raw reading article data from database.
 * @returns Reading state, parsed paragraphs, active mode, and toggle handlers.
 */
export function useReadingLogic(data: ReadingData) {
  // ==========================================
  // STATUS & STATE & STORE ZUSTAND
  // ==========================================
  const readingState = useUIStore((state) => state.readingState);
  const setReadingState = useUIStore((state) => state.setReadingState);
  const { mode, showTranslation } = readingState;

  // ==========================================
  // EFEK SAMPING (EFFECTS)
  // ==========================================
  // Sync article data to global UI store on mount for Floating Action Button (FAB) access.
  useEffect(() => {
    setReadingState({
      audioUrl: data.audioUrl,
      textToSpeak: typeof data.body === 'string' ? data.body : undefined,
      isTTSDisabled: data.isTTSDisabled,
      sourceId: data._id || data.id || data.title,
      sourceTitle: data.title,
      sourceHref: data.slug ? `/library/reading/${data.slug}` : undefined,
    });
  }, [data, setReadingState]);

  // ==========================================
  // FUNGSI PEMBANTU (HELPERS)
  // ==========================================
  /**
   * Extracts text paragraphs from string or PortableText content.
   * 
   * @param content - Raw content source (string or PortableText array).
   * @returns Array of cleaned paragraph strings.
   */
  const extractText = (content: PortableTextContent | undefined): string[] => {
    if (!content) return [];
    // Split plain text by newlines and filter out empty lines.
    if (typeof content === "string") return content.split(/\n+/).filter(p => p.trim());
    // Filter blocks of type "block", map children text, join, and filter empty results.
    if (Array.isArray(content)) {
      return content
        .filter((block: PortableTextBlock) => block._type === "block" && block.children)
        .map((block: PortableTextBlock) => block.children.map((child) => child.text).join(""))
        .filter((text: string) => text.trim().length > 0);
    }
    return [];
  };

  // Parse all text variants concurrently when data changes.
  const content = useMemo(() => {
    const paragraphs = extractText(data.body);
    const hiraganaParagraphs = extractText(data.hiragana);
    const romajiParagraphs = extractText(data.romaji);
    const translationParagraphs = extractText(data.translation);
    
    return {
      paragraphs,
      hiraganaParagraphs,
      romajiParagraphs,
      translationParagraphs
    };
  }, [data.body, data.hiragana, data.romaji, data.translation]);

  // ==========================================
  // LOGIKA PENGENDALI & METODE (HANDLERS)
  // ==========================================
  /**
   * Available reading visualization modes with corresponding icons.
   */
  const modes: { id: ReadingMode; label: string; icon: ElementType }[] = [
    { id: "kanji", label: "Kanji", icon: BookOpen },
    { id: "furigana", label: "Furigana", icon: Eye },
    { id: "hiragana", label: "Hiragana", icon: EyeOff },
    { id: "romaji", label: "Romaji", icon: Type },
  ];

  /**
   * Toggles translation visibility state.
   */
  const toggleTranslation = () => {
    setReadingState({ showTranslation: !showTranslation });
  };

  /**
   * Updates active reading mode.
   * 
   * @param newMode - Target reading mode.
   */
  const setMode = (newMode: ReadingMode) => {
    setReadingState({ mode: newMode });
  };

  // ==========================================
  // HASIL HOOK (RETURN VALUE)
  // ==========================================
  return {
    mode,
    showTranslation,
    paragraphs: content.paragraphs,
    hiraganaParagraphs: content.hiraganaParagraphs,
    romajiParagraphs: content.romajiParagraphs,
    translationParagraphs: content.translationParagraphs,
    modes,
    toggleTranslation,
    setMode,
    readingState
  };
}