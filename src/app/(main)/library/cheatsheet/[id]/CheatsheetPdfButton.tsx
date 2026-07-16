"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const PdfGenerator = dynamic(() => import("@/components/features/pdf/PdfGenerator"), {
  ssr: false,
  loading: () => (
    <Button variant="ghost" disabled className="bg-card border-border neo-inset shadow-none px-6 py-3 rounded-xl text-muted-foreground text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 w-full sm:w-auto h-auto">
      <Loader2 size={14} aria-hidden="true" className="animate-spin text-primary" />
      <span>Menyiapkan Engine…</span>
    </Button>
  ),
});

interface CheatsheetPdfButtonProps {
  data: unknown;
  title: string;
  category: string;
}

export default function CheatsheetPdfButton({ data, title, category }: CheatsheetPdfButtonProps) {
  return (
    <PdfGenerator 
      data={data} 
      type="cheatsheet" 
      title={title} 
      category={category} 
    />
  );
}
