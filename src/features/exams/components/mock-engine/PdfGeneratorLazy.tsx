"use client";

/**
 * @file PdfGeneratorLazy.tsx
 * @description Lazy-loading wrapper untuk komponen generator PDF (non-SSR).
 * Dipakai bersama oleh OfficialCertificateView dan ModernBreakdownView agar
 * konfigurasi dynamic import tidak terduplikasi.
 */

import dynamic from "next/dynamic";
import { Loader } from "@/components/ui/icons";

/** Dynamic import untuk komponen generator PDF (non-SSR). */
export const PdfGenerator = dynamic(() => import("@/features/pdf/PdfGenerator"), {
 ssr: false,
 loading: () => <Loader className="animate-spin text-primary" size={20} />,
});
