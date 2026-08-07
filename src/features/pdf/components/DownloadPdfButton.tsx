"use client";

/**
 * @file DownloadPdfButton.tsx
 * @description Komponen tombol untuk mengunduh dokumen PDF secara dinamis.
 * Menggunakan pemuatan malas (lazy loading) via next/dynamic untuk merender mesin pembuat PDF (PdfGenerator)
 * hanya di sisi klien guna optimalisasi kinerja rendering.
 *
 * @package components/features/pdf/components
 * @project NihongoRoute
 */

// ==========================================
// IMPOR
// ==========================================
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/icons";
import { useDownloadPdfButton } from "../useDownloadPdfButton";

// ==========================================
// ELEMEN DINAMIS
// ==========================================
/**
 * Dynamically imported PdfGenerator component.
 * SSR disabled to prevent canvas/document reference errors on server.
 */
const PdfGenerator = dynamic(() => import("../PdfGenerator"), {
 ssr: false,
 loading: () => (
 <Button variant="ghost" disabled className="bg-[hsl(var(--background)/0.4)] border border-border neo-inset shadow-none px-8 py-4 rounded-[1.5rem] text-muted-foreground text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 w-full sm:w-auto h-auto italic">
 <Loader size={16} aria-hidden="true" className="animate-spin text-destructive" />
 Initializing Engine…
 </Button>
 ),
});

// ==========================================
// KOMPONEN UTAMA
// ==========================================
/**
 * DownloadPdfButton component.
 * Handles client-side mounting check and renders PDF generator trigger.
 *
 * @param props - Component properties.
 * @param props.data - Raw data payload for PDF generation.
 * @param props.type - Document type schema selector.
 */
export default function DownloadPdfButton({
 data,
 type = "lesson",
}: {
 
 data: unknown;
 type?: "lesson" | "vocab";
}) {
 // Check client-side mount status to prevent hydration mismatch
 const { isMounted } = useDownloadPdfButton();

 // Render loading state if not mounted or data missing
 if (!isMounted || !data) {
 return (
 <Button variant="ghost" disabled className="bg-[hsl(var(--background)/0.4)] border border-border neo-inset shadow-none px-8 py-4 rounded-[1.5rem] text-muted-foreground text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 w-full sm:w-auto h-auto italic">
 <Loader size={16} aria-hidden="true" className="animate-spin text-destructive" />
 Loading Payload…
 </Button>
 );
 }

 // Render generator component when ready
 return <PdfGenerator data={data} type={type} />;
}