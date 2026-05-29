/**
 * @file useReadingLogic.ts
 * @description Hook khusus untuk mengelola logika membaca artikel, mencakup parsing teks multi-format (Portable Text Sanity vs Plain Text), kontrol mode visualisasi, dan sinkronisasi status ke Zustand.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { useEffect, useMemo, type ElementType } from "react";
import { useUIStore } from "@/store/useUIStore";
import { BookOpen, Eye, EyeOff, Type } from "lucide-react";
import { ReadingData, ReadingMode, PortableTextContent, PortableTextBlock } from "../types";

// ==========================================
// HOOK UTAMA
// ==========================================
/**
 * Hook utama pengendali artikel bacaan terpandu.
 * 
 * @param data Data artikel membaca mentah dari Sanity.
 * @returns State membaca, list paragraf ter-parse, mode membaca, dan fungsi toggle.
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
  // Sinkronkan data ke store global saat mount untuk akses tombol aksi melayang (FAB)
  useEffect(() => {
    setReadingState({
      audioUrl: data.audioUrl,
      textToSpeak: typeof data.body === 'string' ? data.body : undefined,
      isTTSDisabled: data.isTTSDisabled,
    });
  }, [data, setReadingState]);

  // ==========================================
  // FUNGSI PEMBANTU (HELPERS)
  // ==========================================
  // Helper untuk mengekstrak teks baik dari string maupun blok PortableText
  const extractText = (content: PortableTextContent | undefined): string[] => {
    if (!content) return [];
    if (typeof content === "string") return content.split(/\n+/).filter(p => p.trim());
    if (Array.isArray(content)) {
      return content
        .filter((block: PortableTextBlock) => block._type === "block" && block.children)
        .map((block: PortableTextBlock) => block.children.map((child) => child.text).join(""))
        .filter((text: string) => text.trim().length > 0);
    }
    return [];
  };

  // Bagi konten menjadi beberapa paragraf
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
  const modes: { id: ReadingMode; label: string; icon: ElementType }[] = [
    { id: "kanji", label: "Kanji", icon: BookOpen },
    { id: "furigana", label: "Furigana", icon: Eye },
    { id: "hiragana", label: "Hiragana", icon: EyeOff },
  ];

  const toggleTranslation = () => {
    setReadingState({ showTranslation: !showTranslation });
  };

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
