import { useEffect, useMemo, type ElementType } from "react";
import { useUIStore } from "@/store/useUIStore";
import { BookOpen, Eye, EyeOff, Type } from "lucide-react";
import { ReadingData, ReadingMode, PortableTextContent, PortableTextBlock } from "../types";

export function useReadingLogic(data: ReadingData) {
  const readingState = useUIStore((state) => state.readingState);
  const setReadingState = useUIStore((state) => state.setReadingState);
  const { mode, showTranslation } = readingState;

  // Sync data to global store on mount for FAB access
  useEffect(() => {
    setReadingState({
      audioUrl: data.audioUrl,
      textToSpeak: typeof data.body === 'string' ? data.body : undefined,
      isTTSDisabled: data.isTTSDisabled,
    });
  }, [data, setReadingState]);

  // Helper to extract text from either string or PortableText blocks
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

  // Split content into paragraphs
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
