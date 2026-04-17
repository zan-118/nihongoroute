"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Dynamic import dengan SSR dinonaktifkan
const PdfGenerator = dynamic(() => import("./PdfGenerator"), {
  ssr: false,
  loading: () => (
    <button className="px-5 py-3 bg-white/5 border border-white/10 text-[#c4cfde] text-sm font-bold rounded-xl cursor-wait flex items-center gap-2 w-full sm:w-auto">
      ⏳ Menyiapkan Dokumen...
    </button>
  ),
});

export default function DownloadPdfButton({ data }: { data: any }) {
  const [isMounted, setIsMounted] = useState(false);

  // Mencegah hydration mismatch error
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !data) {
    return (
      <button className="px-5 py-3 bg-white/5 border border-white/10 text-[#c4cfde] text-sm font-bold rounded-xl cursor-wait flex items-center gap-2 w-full sm:w-auto">
        ⏳ Menyiapkan Dokumen...
      </button>
    );
  }

  return <PdfGenerator data={data} />;
}
