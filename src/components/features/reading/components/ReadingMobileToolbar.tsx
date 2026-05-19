"use client";

import { Type, Languages, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReadingMobileToolbarProps {
  onFontSizeToggle: () => void;
  showTranslation: boolean;
  onTranslationToggle: () => void;
  onAudioToggle?: () => void;
  showAudio: boolean;
}

export function ReadingMobileToolbar({
  onFontSizeToggle,
  showTranslation,
  onTranslationToggle,
  onAudioToggle,
  showAudio,
}: ReadingMobileToolbarProps) {
  return (
    <div className="xl:hidden fixed bottom-8 inset-x-4 z-50 flex justify-center">
      <div className="flex items-center gap-2 p-2 rounded-2xl glass border border-border/50 shadow-2xl shadow-primary/20">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl w-12 h-12"
          onClick={onFontSizeToggle}
        >
          <Type size={22} />
        </Button>
        <Button
          variant={showTranslation ? "default" : "ghost"}
          size="icon"
          className={cn("rounded-xl w-12 h-12 transition-all", showTranslation && "shadow-lg shadow-primary/30")}
          onClick={onTranslationToggle}
        >
          <Languages size={22} />
        </Button>
        {onAudioToggle && (
          <Button
            variant={showAudio ? "default" : "ghost"}
            size="icon"
            className={cn("rounded-xl w-12 h-12 transition-all", showAudio && "shadow-lg shadow-primary/30")}
            onClick={onAudioToggle}
          >
            <Headphones size={22} />
          </Button>
        )}
      </div>
    </div>
  );
}
