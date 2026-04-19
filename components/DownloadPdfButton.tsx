/**
 * LOKASI FILE: components/DownloadPdfButton.tsx
 * KONSEP: Cyber-Dark Neumorphic (Intel Export HUD)
 */

"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";

// Dynamic import dengan SSR dinonaktifkan
const PdfGenerator = dynamic(() => import("./PdfGenerator"), {
  ssr: false,
  loading: () => (
    <Button variant="ghost" disabled className="bg-black/40 border-white/5 neo-inset shadow-none px-8 py-4 rounded-[1.5rem] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 w-full sm:w-auto h-auto italic">
      <Loader2 size={16} className="animate-spin text-red-500" />
      Initializing_Engine...
    </Button>
  ),
});

export default function DownloadPdfButton({
  data,
  type = "lesson",
}: {
  data: any;
  type?: "lesson" | "vocab";
}) {
  const [isMounted, setIsMounted] = useState(false);

  // Mencegah hydration mismatch error
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !data) {
    return (
      <Button variant="ghost" disabled className="bg-black/40 border-white/5 neo-inset shadow-none px-8 py-4 rounded-[1.5rem] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 w-full sm:w-auto h-auto italic">
        <Loader2 size={16} className="animate-spin text-red-500" />
        Loading_Payload...
      </Button>
    );
  }

  return <PdfGenerator data={data} type={type} />;
}
