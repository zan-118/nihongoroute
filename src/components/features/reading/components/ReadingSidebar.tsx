/**
 * @file ReadingSidebar.tsx
 * @description Komponen bilah samping (sidebar sticky) halaman membaca artikel di layar lebar, menyediakan akses cepat ke pemutar audio, ukuran font, dan toggle terjemahan.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { Type, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import AudioController from "./AudioController";

// ==========================================
// TIPE DATA / INTERFACE
// ==========================================
/**
 * Props for ReadingSidebar component.
 */
interface ReadingSidebarProps {
  /** URL of audio file. */
  audioUrl?: string;
  /** Text content for text-to-speech engine. */
  textToSpeak: string;
  /** Disable text-to-speech flag. */
  isTTSDisabled?: boolean;
  /** Current font size setting. */
  fontSize: "standard" | "large" | "extra";
  /** Trigger font size change. */
  onFontSizeToggle: () => void;
  /** Translation visibility state. */
  showTranslation: boolean;
  /** Trigger translation visibility toggle. */
  onTranslationToggle: () => void;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Sidebar component for reading page.
 * Provides audio controls, font size toggle, translation toggle.
 * Visible on large screens.
 */
export function ReadingSidebar({
  audioUrl,
  textToSpeak,
  isTTSDisabled,
  fontSize,
  onFontSizeToggle,
  showTranslation,
  onTranslationToggle,
}: ReadingSidebarProps) {
  // ==========================================
  // RENDER KOMPONEN
  // ==========================================
  return (
    /* Position sidebar on left side of content for large screens */
    <div className="hidden xl:block absolute -left-32 top-0 h-full">
      {/* Keep sidebar visible during scroll */}
      <div className="sticky top-40 flex flex-col items-center gap-6">
        <Card className="p-3 bg-card/30 border-border rounded-lg glass flex flex-col gap-4 shadow-2xl">
          {/* Audio playback and TTS controls */}
          <AudioController
            audioUrl={audioUrl}
            textToSpeak={textToSpeak}
            isTTSDisabled={isTTSDisabled}
            compact={true}
          />
          <div className="h-px w-8 bg-border mx-auto" />
          {/* Font size toggle button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={onFontSizeToggle}
            aria-label="Ubah Ukuran Font"
          >
            <Type size={20} />
          </Button>
          {/* Translation toggle button */}
          <Button
            variant={showTranslation ? "default" : "ghost"}
            size="icon"
            className={cn("rounded-xl transition-all", showTranslation && "text-primary-foreground shadow-lg")}
            onClick={onTranslationToggle}
            aria-label="Toggle Terjemahan"
          >
            <Languages size={20} />
          </Button>
        </Card>
      </div>
    </div>
  );
}