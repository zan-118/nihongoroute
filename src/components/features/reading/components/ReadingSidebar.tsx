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
interface ReadingSidebarProps {
  audioUrl?: string;
  textToSpeak: string;
  isTTSDisabled?: boolean;
  fontSize: "standard" | "large" | "extra";
  onFontSizeToggle: () => void;
  showTranslation: boolean;
  onTranslationToggle: () => void;
}

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Komponen bilah samping artikel membaca.
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
    <div className="hidden xl:block absolute -left-32 top-0 h-full">
      <div className="sticky top-40 flex flex-col items-center gap-6">
        <Card className="p-3 bg-card/30 border-border rounded-lg glass flex flex-col gap-4 shadow-2xl">
          <AudioController
            audioUrl={audioUrl}
            textToSpeak={textToSpeak}
            isTTSDisabled={isTTSDisabled}
            compact={true}
          />
          <div className="h-px w-8 bg-border mx-auto" />
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl"
            onClick={onFontSizeToggle}
            aria-label="Ubah Ukuran Font"
          >
            <Type size={20} />
          </Button>
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

