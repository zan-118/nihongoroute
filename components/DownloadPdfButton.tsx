/**
 * @file DownloadPdfButton.tsx
 * @description Komponen wrapper untuk memuat PdfGenerator secara dinamis (client-side only).
 * Menghindari masalah hidrasi dan memastikan library PDF hanya dimuat saat dibutuhkan.
 * @module DownloadPdfButton
 */

"use client";

// ======================
// IMPORTS
// ======================
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// ======================
// CONFIG / DYNAMIC IMPORTS
// ======================

/**
 * Memuat PdfGenerator secara dinamis dengan SSR dinonaktifkan.
 */
const PdfGenerator = dynamic(() => import("./PdfGenerator"), {
  ssr: false,
  loading: () => (
    <Button variant="ghost" disabled className="bg-black/40 border-white/5 neo-inset shadow-none px-8 py-4 rounded-[1.5rem] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 w-full sm:w-auto h-auto italic">
      <Loader2 size={16} className="animate-spin text-red-500" />
      Initializing_Engine...
    </Button>
  ),
});

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen DownloadPdfButton: Tombol pemicu unduhan PDF.
 * 
 * @param {Object} props - Properti komponen.
 * @param {any} props.data - Data konten (pelajaran/kosakata) yang akan dijadikan PDF.
 * @param {"lesson" | "vocab"} props.type - Tipe template PDF.
 * @returns {JSX.Element} Antarmuka tombol unduh.
 */
export default function DownloadPdfButton({
  data,
  type = "lesson",
}: {
  data: any;
  type?: "lesson" | "vocab";
}) {
  const [isMounted, setIsMounted] = useState(false);

  // ======================
  // EFFECTS
  // ======================

  // Mencegah hydration mismatch error dengan memastikan komponen hanya render di client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ======================
  // RENDER
  // ======================

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
