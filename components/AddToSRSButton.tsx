"use client";

import { useSRS } from "@/hooks/useSRS";
import { Plus, Check, BrainCircuit } from "lucide-react";
import { useState, useEffect } from "react";

export default function AddToSRSButton({ wordId }: { wordId: string }) {
  const { addWord, isWordInSRS, isLoaded } = useSRS();
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setIsAdded(isWordInSRS(wordId));
    }
  }, [isLoaded, isWordInSRS, wordId]);

  const handleAdd = () => {
    addWord(wordId);
    setIsAdded(true);
  };

  // Jangan render tombol sampai status localstorage selesai di-load (mencegah kedipan UI)
  if (!isLoaded)
    return <div className="w-10 h-10 animate-pulse bg-white/5 rounded-xl" />;

  if (isAdded) {
    return (
      <button
        disabled
        title="Sudah masuk di jadwal Review"
        className="p-3 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-xl transition-all cursor-default flex items-center justify-center relative group"
      >
        <BrainCircuit size={18} />
        {/* Tooltip kecil */}
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-cyber-bg text-[10px] font-mono px-3 py-1 rounded-lg border border-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          In SRS Queue
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      title="Tambahkan ke Daily Review"
      className="p-3 bg-cyber-bg border border-white/10 hover:border-cyber-neon hover:bg-cyber-neon/10 text-white/50 hover:text-cyber-neon rounded-xl transition-all flex items-center justify-center active:scale-90"
    >
      <Plus size={18} />
    </button>
  );
}
