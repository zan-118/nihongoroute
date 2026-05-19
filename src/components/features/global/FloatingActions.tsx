"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageSquarePlus, Coffee, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import FeedbackWidget from "../feedback/FeedbackWidget";
import { useUIStore } from "@/store/useUIStore";
import { ReadingMode } from "@/components/features/reading/types";
import AudioController from "@/components/features/reading/components/AudioController";
import { Eye, Languages, BookOpen as BookIcon, GraduationCap, FileText, Headphones } from "lucide-react";

import React from "react";
import { cn } from "@/lib/utils";


/**
 * @file FloatingActions.tsx
 * @description Unified Floating Action Button (FAB) that combines Support and Feedback
 * into a single, space-saving expandable widget.
 */

export default function FloatingActions() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const readingState = useUIStore((state) => state.readingState);
  const setReadingState = useUIStore((state) => state.setReadingState);

  const isReadingPage = pathname?.includes("/library/reading/");
  const isListeningPage = pathname?.includes("/library/listening/");
  const listeningState = useUIStore((state) => state.listeningState);
  const setListeningState = useUIStore((state) => state.setListeningState);


  const modes: { id: ReadingMode; label: string; icon: React.ElementType }[] = [
    { id: "kanji", label: "Kanji", icon: BookIcon },
    { id: "furigana", label: "Furigana", icon: Eye },
    { id: "hiragana", label: "Hiragana", icon: Languages },
  ];

  return (
    <>
      <div className="fixed bottom-32 right-6 md:bottom-10 md:right-10 z-[100] flex flex-col items-end gap-4">
        <AnimatePresence mode="wait">
          {/* Global Actions (Non-Reading) - Uses unmounting for AnimatePresence */}
          {!isReadingPage && isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="flex flex-col gap-3 mb-2"
            >
              <motion.div whileHover={{ x: -5 }}>
                <Button
                  onClick={() => {
                    setShowFeedbackDialog(true);
                    setIsOpen(false);
                  }}
                  className="bg-card hover:bg-primary hover:text-primary-foreground text-foreground border border-border shadow-xl rounded-2xl px-4 py-6 flex items-center gap-3 transition-all h-auto group"
                >
                  <span className="text-xs font-black uppercase tracking-widest hidden md:block">Feedback</span>
                  <MessageSquarePlus size={20} className="text-primary group-hover:text-current" />
                </Button>
              </motion.div>

              <motion.div whileHover={{ x: -5 }}>
                <Link href="/support">
                  <Button
                    className="bg-card hover:bg-destructive hover:text-destructive-foreground text-foreground border border-border shadow-xl rounded-2xl px-4 py-6 flex items-center gap-3 transition-all h-auto group"
                  >
                    <span className="text-xs font-black uppercase tracking-widest hidden md:block">Donasi</span>
                    <Coffee size={20} className="text-destructive group-hover:text-current" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reading Page Actions - Persistent mounting to keep audio alive */}
        {isReadingPage && (
          <div 
            className={cn(
              "flex flex-col gap-3 mb-2 transition-all duration-300 transform origin-bottom",
              isOpen 
                ? "opacity-100 scale-100 translate-y-0" 
                : "opacity-0 scale-90 translate-y-10 pointer-events-none"
            )}
          >
            {/* Reading: Audio */}
            <motion.div whileHover={{ x: -5 }}>
              <div className="bg-card/90 backdrop-blur-3xl hover:bg-primary/20 text-foreground border border-border shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-3 transition-all h-auto group">
                 <AudioController 
                  audioUrl={readingState.audioUrl} 
                  textToSpeak={readingState.textToSpeak}
                  isTTSDisabled={readingState.isTTSDisabled}
                  compact={true}
                />
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:block text-muted-foreground">Audio</span>
              </div>
            </motion.div>

            {/* Reading: Mode Cycle */}
            <motion.div whileHover={{ x: -5 }}>
              <button
                onClick={() => {
                  const currentIndex = modes.findIndex(m => m.id === readingState.mode);
                  const nextIndex = (currentIndex + 1) % modes.length;
                  setReadingState({ mode: modes[nextIndex].id });
                }}
                className="bg-card/90 backdrop-blur-3xl hover:bg-primary hover:text-primary-foreground text-foreground border border-border shadow-2xl rounded-2xl px-4 py-4 flex items-center gap-3 transition-all h-auto group w-full justify-between"
              >
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">
                  {modes.find(m => m.id === readingState.mode)?.label || "Mode"}
                </span>
                {React.createElement(modes.find(m => m.id === readingState.mode)?.icon || Eye, { size: 20, className: "text-primary group-hover:text-current" })}
              </button>
            </motion.div>

            {/* Reading: Translation Toggle */}
            <motion.div whileHover={{ x: -5 }}>
              <button
                onClick={() => setReadingState({ showTranslation: !readingState.showTranslation })}
                className={`bg-card/90 backdrop-blur-3xl border border-border shadow-2xl rounded-2xl px-4 py-4 flex items-center gap-3 transition-all h-auto group w-full justify-between ${
                  readingState.showTranslation ? "hover:bg-success hover:text-success-foreground" : "hover:bg-success/20"
                }`}
              >
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">
                  {readingState.showTranslation ? "Terjemahan ON" : "Terjemahan OFF"}
                </span>
                <Languages size={20} className={readingState.showTranslation ? "text-success group-hover:text-current" : "text-success"} />
              </button>
            </motion.div>
          </div>
        )}

        {/* Listening Page Actions - Persistent mounting for audio */}
        {isListeningPage && (
          <div 
            className={cn(
              "flex flex-col gap-3 mb-2 transition-all duration-300 transform origin-bottom",
              isOpen 
                ? "opacity-100 scale-100 translate-y-0" 
                : "opacity-0 scale-90 translate-y-10 pointer-events-none"
            )}
          >
            {/* Listening: Audio Control */}
            <motion.div whileHover={{ x: -5 }}>
              <div className="bg-card/90 backdrop-blur-3xl hover:bg-primary/20 text-foreground border border-border shadow-2xl rounded-2xl px-4 py-3 flex items-center gap-3 transition-all h-auto group">
                 <AudioController 
                  audioUrl={listeningState.audioUrl} 
                  textToSpeak={listeningState.textToSpeak}
                  compact={true}
                />
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:block text-muted-foreground">Voice</span>
              </div>
            </motion.div>

            {/* Listening: Tab Toggle (Transcript/Quiz) */}
            <motion.div whileHover={{ x: -5 }}>
              <button
                onClick={() => setListeningState({ 
                  activeTab: listeningState.activeTab === "transcript" ? "quiz" : "transcript" 
                })}
                className="bg-card/90 backdrop-blur-3xl hover:bg-primary hover:text-primary-foreground text-foreground border border-border shadow-2xl rounded-2xl px-4 py-4 flex items-center gap-3 transition-all h-auto group w-full justify-between"
              >
                <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">
                  {listeningState.activeTab === "transcript" ? "Latihan Kuis" : "Lihat Transkrip"}
                </span>
                {listeningState.activeTab === "transcript" 
                  ? <GraduationCap size={20} className="text-primary group-hover:text-current" />
                  : <FileText size={20} className="text-primary group-hover:text-current" />
                }
              </button>
            </motion.div>
          </div>
        )}

        {/* Main Toggle Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl transition-all duration-500 border-none flex items-center justify-center p-0 ${
            isOpen 
              ? "bg-foreground text-background rotate-0" 
              : "bg-primary text-primary-foreground hover:scale-110 shadow-primary/20"
          }`}
        >
          {isOpen ? <X size={28} /> : (
            isReadingPage ? <BookIcon size={28} className={isOpen ? "" : "animate-pulse"} /> : 
            isListeningPage ? <Headphones size={28} className={isOpen ? "" : "animate-pulse"} /> :
            <Plus size={28} className={isOpen ? "" : "animate-pulse"} />
          )}

        </Button>
      </div>

      <FeedbackWidget forceOpen={showFeedbackDialog} onOpenChange={setShowFeedbackDialog} />
    </>
  );
}
