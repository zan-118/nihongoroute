"use client";

import { Plus, Check } from "lucide-react";
import { useAddToSRS } from "../button/useAddToSRS";

export default function AddToSRSButton({ wordId }: { wordId: string }) {
  const { isLoaded, isAdded, handleAdd } = useAddToSRS(wordId);

  if (!isLoaded)
    return <div className="w-10 h-10 animate-pulse bg-background/5 rounded-xl" />;

  if (isAdded) {
    return (
      <button
        disabled
        className="p-3 bg-success/10 border border-success/30 text-success rounded-xl transition-all cursor-default flex items-center justify-center relative group shadow-inner"
      >
        <Check size={18} />
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-xs font-bold px-3 py-1 rounded-lg border border-success/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Tersimpan di Hafalan
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className="p-3 bg-card border border-border hover:border-primary hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-xl transition-all flex items-center justify-center active:scale-90 relative group"
    >
      <Plus size={18} />
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-xs font-bold px-3 py-1 rounded-lg border border-primary/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-primary z-10">
        Mulai Hafalkan Kata Ini
      </span>
    </button>
  );
}
