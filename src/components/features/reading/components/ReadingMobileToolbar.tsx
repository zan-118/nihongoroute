import { Type, Languages } from "lucide-react";
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
    <div className="fixed bottom-6 inset-x-4 z-50 flex flex-col items-center gap-2">
      {/* Baris Atas: Kontrol Teks (Font Size & Translation) */}
      <div className="flex items-center gap-2 p-1 px-2 rounded-full bg-card/90 backdrop-blur-md border border-border shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full size-9 text-muted-foreground hover:text-primary transition-colors"
          onClick={onFontSizeToggle}
          aria-label="Ubah ukuran huruf teks bacaan"
        >
          <Type size={16} />
        </Button>
        <div className="w-px h-4 bg-border" />
        <Button
          variant={showTranslation ? "default" : "ghost"}
          size="icon"
          className={cn(
            "rounded-full size-9 transition-all text-muted-foreground",
            showTranslation ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "hover:text-primary"
          )}
          onClick={onTranslationToggle}
          aria-label="Tampilkan atau sembunyikan terjemahan paragraf"
        >
          <Languages size={16} />
        </Button>
      </div>

      {/* Baris Bawah: Pengendali Audio Lengkap */}
      {hasAudio && (
        <div className="w-full max-w-md">
          <AudioController
            audioUrl={audioUrl}
            textToSpeak={textToSpeak}
            isTTSDisabled={isTTSDisabled}
            compact={false}
            header={true} // Menggunakan mode header untuk tampilan horizontal compact dengan seek bar
          />
        </div>
      )}
    </div>
  );
}
