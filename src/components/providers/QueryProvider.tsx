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

/**
 * Global React Query provider component.
 * Wraps application to enable caching and data fetching.
 *
 * @param props - Component properties.
 * @param props.children - Child nodes to render.
 */
export default function QueryProvider({ children }: { children: ReactNode }) {
 // Lazy initialize QueryClient. Prevents recreation during component re-renders.
 const [queryClient] = useState(
 () =>
 new QueryClient({
 defaultOptions: {
 queries: {
 // Set stale time to 1 minute. Disable refetch on window focus to reduce API load.
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