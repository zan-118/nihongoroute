"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minimize2 } from "lucide-react";
import { ReadingProvider } from "@/components/features/reading/components/ReadingContext";
import { cn } from "@/lib/utils";
import { useReadingLogic } from "@/components/features/reading/hooks/useReadingLogic";
import { ReadingData } from "@/components/features/reading/types";
import { Button } from "@/components/ui/button";

// Modular Components
import { ReadingNavbar } from "@/components/features/reading/components/ReadingNavbar";
import { ReadingSidebar } from "@/components/features/reading/components/ReadingSidebar";
import { ReadingArticle } from "@/components/features/reading/components/ReadingArticle";
import { ReadingMobileToolbar } from "@/components/features/reading/components/ReadingMobileToolbar";

interface ReadingPageClientProps {
  data: ReadingData;
}

function ReadingPageContent({ data }: ReadingPageClientProps) {
  const {
    mode,
    showTranslation,
    paragraphs,
    hiraganaParagraphs,
    romajiParagraphs,
    translationParagraphs,
    modes,
    toggleTranslation,
    setMode,
  } = useReadingLogic(data);

  const [isZenMode, setIsZenMode] = useState(false);
  const [fontSize, setFontSize] = useState<"standard" | "large" | "extra">("large");

  const toggleFontSize = () => {
    setFontSize((prev) => 
      prev === "standard" ? "large" : prev === "large" ? "extra" : "standard"
    );
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-700 relative",
      isZenMode ? "bg-background pb-20" : "bg-background/95 pb-40"
    )}>
      {/* Immersive Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-success/5 blur-[150px] rounded-full animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--foreground-rgb),0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--foreground-rgb),0.01)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none opacity-20" />
      </div>

      {/* Top Navbar */}
      <AnimatePresence>
        {!isZenMode && (
          <ReadingNavbar
            title={data.title}
            difficulty={data.difficulty}
            mode={mode}
            modes={modes}
            onModeChange={(id) => setMode(id as "kanji" | "furigana" | "romaji" | "hiragana")}
            onZenModeToggle={() => setIsZenMode(true)}
          />
        )}
      </AnimatePresence>

      {/* Floating Mode Exit for Zen Mode */}
      <AnimatePresence>
        {isZenMode && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed top-8 right-8 z-[100]"
          >
            <Button 
              size="lg" 
              className="rounded-full w-14 h-14 bg-background/80 backdrop-blur-xl border border-border shadow-2xl group hover:border-primary/40 transition-all"
              onClick={() => setIsZenMode(false)}
              aria-label="Keluar Mode Zen"
            >
              <Minimize2 size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Reading Container */}
      <div className={cn(
        "max-w-4xl mx-auto px-6 relative z-10 transition-all duration-1000",
        isZenMode ? "pt-24 md:pt-40" : "pt-32 md:pt-48"
      )}>
        {/* Immersive Header Decoration */}
        {!isZenMode && (
          <div className="flex flex-col items-center mb-24 md:mb-32 text-center">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
               <span className="text-primary font-black text-[10px] md:text-xs uppercase tracking-[0.4em]">Graded Reading Experience</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-[0.9] mb-12 max-w-3xl drop-shadow-2xl">
              {data.title}
            </h1>
            <div className="h-1.5 w-32 bg-gradient-to-r from-primary/0 via-primary to-primary/0 rounded-full" />
          </div>
        )}

        <div className="relative">
          {/* Audio & Settings Floating Sidebar (Desktop) */}
          <ReadingSidebar
            audioUrl={data.audioUrl}
            textToSpeak={data.body as string}
            isTTSDisabled={data.isTTSDisabled}
            fontSize={fontSize}
            onFontSizeToggle={toggleFontSize}
            showTranslation={showTranslation}
            onTranslationToggle={toggleTranslation}
          />

          {/* Body Content */}
          <ReadingArticle
            paragraphs={paragraphs}
            hiraganaParagraphs={hiraganaParagraphs}
            romajiParagraphs={romajiParagraphs}
            translationParagraphs={translationParagraphs}
            mode={mode}
            fontSize={fontSize}
            showTranslation={showTranslation}
            isZenMode={isZenMode}
            onComplete={() => {
              // Handle completion logic here
              console.log("Reading completed");
            }}
          />
        </div>
      </div>

      {/* Mobile Toolbar */}
      <AnimatePresence>
        {!isZenMode && (
          <ReadingMobileToolbar
            onFontSizeToggle={toggleFontSize}
            showTranslation={showTranslation}
            onTranslationToggle={toggleTranslation}
            showAudio={false} // Adjust based on state if needed
            onAudioToggle={() => {}} // Handle mobile audio toggle
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ReadingPageClient({ data }: ReadingPageClientProps) {
  return (
    <ReadingProvider>
      <ReadingPageContent data={data} />
    </ReadingProvider>
  );
}
