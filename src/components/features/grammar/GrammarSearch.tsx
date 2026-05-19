"use client";

import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface GrammarSearchProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Komponen input pencarian untuk tata bahasa.
 */
export function GrammarSearch({ value, onChange }: GrammarSearchProps) {
  return (
    <div className="mb-10 md:mb-16 relative group max-w-2xl">
      <div className="absolute inset-y-0 left-5 md:left-7 flex items-center pointer-events-none z-10">
        <Search aria-hidden="true" className="text-muted-foreground group-focus-within:text-primary transition-colors duration-300" size={20} />
      </div>
      <Input
        placeholder="Cari pola kalimat (contoh: ~te kureru)..."
        className="w-full pl-14 md:pl-16 pr-8 py-5 md:py-7 h-auto bg-[rgba(var(--card-rgb),0.4)] backdrop-blur-xl border-border rounded-2xl md:rounded-[2rem] text-sm md:text-lg text-foreground placeholder:text-muted-foreground/30 font-bold shadow-2xl focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all duration-500"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      />
      {/* Decorative Ring */}
      <div className="absolute inset-0 rounded-2xl md:rounded-[2rem] border border-primary/0 group-focus-within:border-primary/20 pointer-events-none transition-all duration-500 scale-[1.01]" />
    </div>
  );
}
