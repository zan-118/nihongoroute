"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";

// Dynamic import dengan SSR dinonaktifkan
const PdfGenerator = dynamic(() => import("./PdfGenerator"), {
  ssr: false,
  loading: () => (
    <button className="bg-[#0a0c10] border border-white/5 shadow-[inset_3px_3px_8px_#050608,inset_-2px_-2px_6px_rgba(255,255,255,0.02)] px-6 py-3 rounded-xl text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 w-full sm:w-auto cursor-wait">
      <div className="w-3 h-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
      Menyiapkan Engine...
    </button>
  ),
});

export default function DownloadPdfButton({
  data,
  type = "lesson", // ✨ PASTIKAN TYPE ADA NILAI DEFAULT-NYA
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
      <button className="bg-[#0a0c10] border border-white/5 shadow-[inset_3px_3px_8px_#050608,inset_-2px_-2px_6px_rgba(255,255,255,0.02)] px-6 py-3 rounded-xl text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 w-full sm:w-auto cursor-wait">
        <div className="w-3 h-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
        Memuat Komponen...
      </button>
    );
  }

  // ✨ KIRIM TYPE KE GENERATOR
  return <PdfGenerator data={data} type={type} />;
}
