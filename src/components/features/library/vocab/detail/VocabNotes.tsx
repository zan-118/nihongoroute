"use client";

import { Card } from "@/components/ui/card";
import { Sparkles, Info } from "lucide-react";

interface VocabNotesProps {
  mnemonic?: string;
  usageNotes?: string;
}

export function VocabNotes({ mnemonic, usageNotes }: VocabNotesProps) {
  return (
    <Card className="p-6 bg-warning/5 backdrop-blur-xl border-warning/20 rounded-[2rem] hover:border-warning/40 transition-all group overflow-hidden relative col-span-1 md:col-span-1 lg:col-span-1 flex flex-col gap-4">
      <div className="absolute -top-4 -right-4 p-8 opacity-[0.05] group-hover:scale-110 transition-transform duration-700 text-warning">
        <Sparkles size={80} />
      </div>
      {mnemonic && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} aria-hidden="true" className="text-warning" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-warning">Mnemonic</span>
          </div>
          <p className="text-sm font-medium text-warning leading-relaxed italic">
            &quot;{mnemonic}&quot;
          </p>
        </div>
      )}
      {usageNotes && (
        <div className={mnemonic ? "pt-4 border-t border-warning/10" : ""}>
          <div className="flex items-center gap-2 mb-2">
            <Info size={14} aria-hidden="true" className="text-warning" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-warning">Catatan</span>
          </div>
          <p className="text-sm font-medium text-warning/90 leading-relaxed">
            {usageNotes}
          </p>
        </div>
      )}
      {!mnemonic && !usageNotes && (
        <div className="flex items-center gap-2 opacity-50">
           <Info size={14} aria-hidden="true" className="text-warning" />
           <span className="text-xs italic text-warning">Belum ada catatan khusus.</span>
        </div>
      )}
    </Card>
  );
}
