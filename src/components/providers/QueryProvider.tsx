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
    </QueryClientProvider>
  );
}
