/**
 * @file QueryProvider.tsx
 * @description Komponen penyedia status React Query (TanStack Query) klien global untuk optimalisasi caching data dan revalidation.
 */

"use client";

// ======================
// IMPOR
// ======================
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import dynamic from "next/dynamic";

// Pemisahan kode (Code-splitting) via next/dynamic untuk menghindari pemblokiran FCP global pada client-side
const FeedbackWidget = dynamic(() => import("@/components/features/feedback/FeedbackWidget"), { ssr: false });
const DictionaryPopup = dynamic(() => import("@/components/features/tools/dictionary/DictionaryPopup"), { ssr: false });

// ======================
// EKSEKUSI UTAMA
// ======================
export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Kita biarkan stale time sedikit lebih lama untuk progres belajar
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <FeedbackWidget />
      <DictionaryPopup />
    </QueryClientProvider>
  );
}
