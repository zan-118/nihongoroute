"use client";

import React from "react";
import { BookText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface GrammarEmptyStateProps {
  searchTerm: string;
  selectedLevel: string;
  onResetSearch: () => void;
}

/**
 * Tampilan kosong saat pola kalimat tidak ditemukan atau belum tersedia.
 */
export function GrammarEmptyState({ searchTerm, selectedLevel, onResetSearch }: GrammarEmptyStateProps) {
  return (
    <Card className="col-span-full py-20 md:py-32 bg-[rgba(var(--card-rgb),0.2)] backdrop-blur-sm border border-dashed border-border rounded-[2.5rem] text-center px-6 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-[2rem] bg-primary/5 flex items-center justify-center border border-primary/10 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]">
            <BookText size={32} aria-hidden="true" className="text-primary/40" />
          </div>
        </div>
        <h3 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight mb-4">
          {searchTerm ? "Pola Kalimat Tidak Ditemukan" : "Materi Belum Tersedia"}
        </h3>
        <p className="text-muted-foreground font-medium text-sm md:text-base max-w-md mx-auto mb-10 leading-relaxed">
          {searchTerm 
            ? `Waduh, hasil buat "${searchTerm}" gak ketemu nih. Coba cari kata kunci lain atau periksa ejaanmu.` 
            : `Sabar ya, Sensei kami lagi ngeracik materi buat level ${selectedLevel.toUpperCase()}. Pantau terus!`}
        </p>
        {searchTerm && (
          <Button 
            onClick={onResetSearch}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl px-10 py-6 h-auto font-black uppercase tracking-[0.2em] text-xs transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
          >
            Reset Pencarian
          </Button>
        )}
      </div>
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />
    </Card>
  );
}
