"use client";

import { useProgress } from "@/context/UserProgressContext";
import { useState, useEffect } from "react";

export default function AddToSRSButton({ wordId }: { wordId: string }) {
  const { addToSRS, progress } = useProgress();
  const [isAdded, setIsAdded] = useState(false);

  // Cek status saat komponen dimuat
  useEffect(() => {
    if (progress.srs[wordId]) {
      setIsAdded(true);
    }
  }, [progress.srs, wordId]);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAdded) {
      addToSRS(wordId);
      setIsAdded(true);
    }
  };

  return (
    <button
      onClick={handleAdd}
      disabled={isAdded}
      className={`p-2.5 rounded-xl border transition-all active:scale-90 flex items-center justify-center ${
        isAdded
          ? "bg-green-500/10 border-green-500/30 text-green-400 cursor-default"
          : "bg-white/5 border-white/10 text-white/40 hover:text-[#0ef] hover:border-[#0ef]/50 hover:bg-[#0ef]/5"
      }`}
      title={
        isAdded ? "Sudah masuk daftar review" : "Simpan untuk dilatih (SRS)"
      }
    >
      <span className="text-lg leading-none">{isAdded ? "✓" : "+"}</span>
    </button>
  );
}
