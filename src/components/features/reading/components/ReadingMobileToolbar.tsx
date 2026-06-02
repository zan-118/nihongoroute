/**
 * @file ReadingMobileToolbar.tsx
 * @description Komponen toolbar bawah (floating bottom bar) khusus untuk perangkat seluler untuk memudahkan akses kontrol ukuran font, terjemahan, dan audio.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { Type, Languages, Headphones, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AudioController from "./AudioController";

// ==========================================
// TIPE DATA / INTERFACE
// ==========================================
interface ReadingMobileToolbarProps {
  onFontSizeToggle: () => void;
  showTranslation: boolean;
  onTranslationToggle: () => void;
  audioUrl?: string;
  textToSpeak?: string;
  isTTSDisabled?: boolean;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Komponen toolbar membaca mobile.
 */
export function ReadingMobileToolbar({
  onFontSizeToggle,
  showTranslation,
  onTranslationToggle,
  audioUrl,
  textToSpeak,
  isTTSDisabled,
}: ReadingMobileToolbarProps) {
  const hasAudio = !!(audioUrl || (!isTTSDisabled && textToSpeak));

  // ==========================================
  // RENDER KOMPONEN
  // ==========================================
  return (
    <div className="xl:hidden fixed bottom-8 inset-x-4 z-50 flex flex-col items-center gap-3">
      {/* Toolbar kontrol utama */}
      <div className="flex items-center gap-2 p-2 rounded-2xl glass border border-border/50 shadow-2xl shadow-primary/20">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl size-12"
          onClick={onFontSizeToggle}
          aria-label="Ubah ukuran huruf teks bacaan"
        >
          <Type size={22} />
        </Button>
        <Button
          variant={showTranslation ? "default" : "ghost"}
          size="icon"
          className={cn("rounded-xl w-12 h-12 transition-all", showTranslation && "shadow-lg shadow-primary/30")}
          onClick={onTranslationToggle}
          aria-label="Tampilkan atau sembunyikan terjemahan paragraf"
        >
          <Languages size={22} />
        </Button>
        {hasAudio && (
          <div className="flex items-center">
            <div className="w-px h-6 bg-border mx-1" />
            <AudioController
              audioUrl={audioUrl}
              textToSpeak={textToSpeak}
              isTTSDisabled={isTTSDisabled}
              compact={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
