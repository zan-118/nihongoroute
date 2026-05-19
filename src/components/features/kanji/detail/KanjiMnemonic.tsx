"use client";

import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface KanjiMnemonicProps {
  mnemonics?: any;
}

export function KanjiMnemonic({ mnemonics }: KanjiMnemonicProps) {
  if (!mnemonics) return null;

  return (
    <Card className="p-8 md:p-10 bg-card/20 backdrop-blur-xl border-border rounded-[2.5rem] hover:border-primary/40 transition-all md:col-span-full lg:col-span-2 relative overflow-hidden group">
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <Sparkles size={20} className="text-warning" aria-hidden="true" />
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Memory Mnemonic</h2>
      </div>
      <div className="prose dark:prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-p:text-warning italic font-medium relative z-10">
        {typeof mnemonics === "string"
          ? mnemonics.split("\n").filter(Boolean).map((line: string, i: number) => (
              <p key={i} className="text-warning italic">{line}</p>
            ))
          : Array.isArray(mnemonics)
            ? mnemonics.map((m: any, i: number) => (
                <p key={i} className="text-warning italic">
                  {typeof m === "string" ? m : m?.text || m?.children?.[0]?.text || ""}
                </p>
              ))
            : null}
      </div>
    </Card>
  );
}
