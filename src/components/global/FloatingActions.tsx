"use client";

/**
 * @file FloatingActions.tsx
 * @description Komponen tombol aksi melayang (Unified Floating Action Button / FAB) global untuk akses cepat donasi/support, pengiriman feedback, kontrol pemutar audio pemahaman bacaan/mendengarkan, serta penyesuaian layout translasi bahasa Jepang.
 */

// ==========================================
// IMPORT & DEPENDENSI
// ==========================================
import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Plus, MessageSquare, Coffee, X } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import FeedbackWidget from "@/features/support/feedback/FeedbackWidget";
import { useUIStore } from "@/store/useUIStore";
import { ReadingMode } from "@/features/library/reading/types";
import AudioController from "@/features/library/reading/components/AudioController";
import { Eye, LayoutGrid, BookOpen as BookIcon, GraduationCap, Headphones } from "@/components/ui/icons";

import React from "react";
import { cn } from "@/lib/utils";

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * Global Floating Action Button (FAB) component.
 * Adapts based on active pathname to show feedback, donation, audio, or layout controls.
 * 
 * @returns React element representing the floating action menu.
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

 // Exit early on reading/listening pages. Avoid duplicate controls.
 if (isReadingPage || isListeningPage) return null;

 /**
 * Available reading modes for Japanese text display.
 */
 const modes: { id: ReadingMode; label: string; icon: React.ElementType }[] = [
 { id: "kanji", label: "Kanji", icon: BookIcon },
 { id: "furigana", label: "Furigana", icon: Eye },
 { id: "hiragana", label: "Hiragana", icon: LayoutGrid },
 ];

 return (
 <>
 <div className="fixed bottom-32 right-6 md:bottom-10 md:right-10 z-40 flex flex-col items-end gap-4">
 <AnimatePresence mode="wait">
 {/* Global Actions (Non-Reading) - Uses unmounting for AnimatePresence */}
 {!isReadingPage && isOpen && (
 <m.div
 initial={{ opacity: 0, y: 20, scale: 0.8 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 20, scale: 0.8 }}
 className="flex flex-col gap-3 mb-2"
 >
 <m.div whileHover={{ x: -5 }}>
 <Button
 onClick={() => {
 setShowFeedbackDialog(true);
 setIsOpen(false);
 }}
 className="button-outline-premium rounded-lg px-4 py-6 flex items-center gap-3 h-auto group"
 >
 <span className="text-xs font-black uppercase tracking-widest hidden md:block">Feedback</span>
 <MessageSquare size={20} className="text-primary group-hover:text-current" />
 </Button>
 </m.div>

 <m.div whileHover={{ x: -5 }}>
 <Link href="/support">
 <Button
 className="rounded-lg px-4 py-6 flex items-center gap-3 h-auto group border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground"
 >
 <span className="text-xs font-black uppercase tracking-widest hidden md:block">Donasi</span>
 <Coffee size={20} className="text-destructive group-hover:text-current" />
 </Button>
 </Link>
 </m.div>
 </m.div>
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
 <m.div whileHover={{ x: -5 }}>
 <div className="bg-card border border-border transition-colors hover:border-primary/40 rounded-lg px-4 py-3 flex items-center gap-3 transition-all h-auto group">
 <AudioController 
 audioUrl={readingState.audioUrl} 
 textToSpeak={readingState.textToSpeak}
 isTTSDisabled={readingState.isTTSDisabled}
 compact={true}
 />
 <span className="text-[10px] font-black uppercase tracking-widest hidden md:block text-muted-foreground">Audio</span>
 </div>
 </m.div>

 {/* Reading: Mode Cycle */}
 <m.div whileHover={{ x: -5 }}>
 <button type="button"
 onClick={() => {
 const currentIndex = modes.findIndex(m => m.id === readingState.mode);
 const nextIndex = (currentIndex + 1) % modes.length;
 setReadingState({ mode: modes[nextIndex].id });
 }}
 aria-label={`Ubah mode membaca, mode aktif saat ini: ${modes.find(m => m.id === readingState.mode)?.label || "Kanji"}`}
 className="bg-card border border-border transition-colors hover:border-primary/40 hover:text-primary rounded-lg px-4 py-4 flex items-center gap-3 transition-all h-auto group w-full justify-between"
 >
 <span className="text-[10px] font-black uppercase tracking-widest hidden md:block" aria-hidden="true">
 {modes.find(m => m.id === readingState.mode)?.label || "Mode"}
 </span>
 {React.createElement(modes.find(m => m.id === readingState.mode)?.icon || Eye, { size: 20, className: "text-primary group-hover:text-current" })}
 </button>
 </m.div>

 {/* Reading: Translation Toggle */}
 <m.div whileHover={{ x: -5 }}>
 <button type="button"
 onClick={() => setReadingState({ showTranslation: !readingState.showTranslation })}
 aria-label={readingState.showTranslation ? "Matikan terjemahan bahasa Indonesia" : "Aktifkan terjemahan bahasa Indonesia"}
 className={`bg-card border border-border transition-colors hover:border-primary/40 rounded-lg px-4 py-4 flex items-center gap-3 transition-all h-auto group w-full justify-between ${
 readingState.showTranslation ? "hover:bg-success hover:text-success-foreground" : "hover:bg-success/20"
 }`}
 >
 <span className="text-[10px] font-black uppercase tracking-widest hidden md:block" aria-hidden="true">
 {readingState.showTranslation ? "Terjemahan ON" : "Terjemahan OFF"}
 </span>
 <LayoutGrid size={20} className={readingState.showTranslation ? "text-success group-hover:text-current" : "text-success"} />
 </button>
 </m.div>
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
 <m.div whileHover={{ x: -5 }}>
 <div className="bg-card border border-border transition-colors hover:border-primary/40 rounded-lg px-4 py-3 flex items-center gap-3 transition-all h-auto group">
 <AudioController 
 audioUrl={listeningState.audioUrl} 
 textToSpeak={listeningState.textToSpeak}
 compact={true}
 />
 <span className="text-[10px] font-black uppercase tracking-widest hidden md:block text-muted-foreground">Voice</span>
 </div>
 </m.div>

 {/* Listening: Scroll to Quiz */}
 <m.div whileHover={{ x: -5 }}>
 <button type="button"
 onClick={() => {
 document.querySelector("[data-section='quiz']")?.scrollIntoView({ behavior: "smooth", block: "start" });
 setIsOpen(false);
 }}
 aria-label="Gulir ke bagian kuis pemahaman"
 className="bg-card border border-border transition-colors hover:border-primary/40 hover:text-primary rounded-lg px-4 py-4 flex items-center gap-3 transition-all h-auto group w-full justify-between"
 >
 <span className="text-[10px] font-black uppercase tracking-widest hidden md:block" aria-hidden="true">
 Ke Kuis
 </span>
 <GraduationCap size={20} className="text-primary group-hover:text-current" />
 </button>
 </m.div>
 </div>
 )}

 {/* Main Toggle Button */}
 <Button
 onClick={() => setIsOpen(!isOpen)}
 aria-label={isOpen ? "Tutup menu tindakan cepat" : "Buka menu tindakan cepat"}
 className={`w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl transition-all duration-500 border-none flex items-center justify-center p-0 ${
 isOpen 
 ? "bg-foreground text-background rotate-0" 
 : "bg-primary text-primary-foreground hover:bg-primary/92 hover:scale-110"
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