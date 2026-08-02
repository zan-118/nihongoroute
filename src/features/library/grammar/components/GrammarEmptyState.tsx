"use client";

/**
 * @file GrammarEmptyState.tsx
 * @description Komponen tampilan ketika pola kalimat tata bahasa tidak ditemukan
 * atau materi level tertentu belum tersedia di basis data.
 */

// ==========================================
// IMPOR UTAMA
// ==========================================
import React from "react";
import { BookText } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// ==========================================
// ANTARMUKA & TIPE DATA
// ==========================================
/**
 * Props for the GrammarEmptyState component.
 */
interface GrammarEmptyStateProps {
 /** Current search query string. */
 searchTerm: string;
 /** Selected JLPT level filter. */
 selectedLevel: string;
 /** Callback to clear search input. */
 onResetSearch: () => void;
}

// ==========================================
// KOMPONEN UTAMA: GrammarEmptyState
// ==========================================
/**
 * Renders empty state UI when grammar patterns are missing or not found.
 * 
 * @param props - Component properties.
 * @returns React element representing empty state card.
 */
export function GrammarEmptyState({ searchTerm, selectedLevel, onResetSearch }: GrammarEmptyStateProps) {
 return (
 <Card className="col-span-full py-20 md:py-32 bg-[hsl(var(--card)/0.2)] border border-dashed border-border rounded-2xl md:rounded-3xl text-center px-6 relative overflow-hidden">
 <div className="relative z-10">
 <div className="flex justify-center mb-8">
 {/* Icon container with subtle glow effect */}
 <div className="size-20 rounded-2xl md:rounded-3xl bg-primary/5 flex items-center justify-center border border-primary/10 shadow-[0_0_30px_hsl(var(--primary)/0.1)]">
 <BookText size={32} aria-hidden="true" className="text-primary/40" />
 </div>
 </div>
 <h3 className="text-xl md:text-2xl text-foreground uppercase tracking-tight mb-4">
 {/* Toggle heading based on search state */}
 {searchTerm ? "Pola Kalimat Tidak Ditemukan" : "Materi Belum Tersedia"}
 </h3>
 <p className="text-muted-foreground font-medium text-sm md:text-base max-w-md mx-auto mb-10 leading-relaxed font-sans">
 {/* Dynamic message based on search state or selected level */}
 {searchTerm 
 ? `Waduh, hasil buat "${searchTerm}" gak ketemu nih. Coba cari kata kunci lain atau pencarianmu.` 
 : `Sabar ya, Sensei kami lagi ngeracik materi buat level ${selectedLevel.toUpperCase()}. Pantau terus!`}
 </p>
 {/* Show reset button only when search query is active */}
 {searchTerm && (
 <Button 
 onClick={onResetSearch}
 className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg px-10 py-6 h-auto font-black uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
 >
 Reset Pencarian
 </Button>
 )}
 </div>
 {/* Pendar Ambient Latar Belakang */}
 {/* Decorative background glow element */}
 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-64 bg-primary/5 blur-[60px] pointer-events-none ambient-glow will-change-transform" />
 </Card>
 );
}