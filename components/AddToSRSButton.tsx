"use client";

import { useProgress } from "@/context/UserProgressContext";
import { Plus, Check } from "lucide-react";
import { useState, useEffect } from "react";

export default function AddToSRSButton({ wordId }: { wordId: string }) {
  const { progress, addToSRS } = useProgress();
  const [isAdded, setIsAdded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    // Cek apakah kata ini sudah ada di dalam objek srs milik user
    if (progress.srs && progress.srs[wordId]) {
      setIsAdded(true);
    }
  }, [progress.srs, wordId]);

  const handleAdd = () => {
    addToSRS(wordId);
    setIsAdded(true);
  };

  // Mencegah kedipan UI saat proses render pertama
  if (!isLoaded)
    return <div className="w-10 h-10 animate-pulse bg-white/5 rounded-xl" />;

  if (isAdded) {
    return (
      <button
        disabled
        className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-xl transition-all cursor-default flex items-center justify-center relative group shadow-[inset_0_0_10px_rgba(34,197,94,0.1)]"
      >
        <Check size={18} />
        {/* Tooltip Ramah Awam */}
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-cyber-bg text-[10px] font-bold px-3 py-1 rounded-lg border border-green-500/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Tersimpan di Hafalan
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className="p-3 bg-cyber-bg border border-white/10 hover:border-cyber-neon hover:bg-cyber-neon/10 text-white/50 hover:text-cyber-neon rounded-xl transition-all flex items-center justify-center active:scale-90 relative group"
    >
      <Plus size={18} />
      {/* Tooltip Petunjuk */}
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-cyber-bg text-[10px] font-bold px-3 py-1 rounded-lg border border-cyber-neon/30 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none text-cyber-neon z-10">
        Mulai Hafalkan Kata Ini
      </span>
    </button>
  );
}
