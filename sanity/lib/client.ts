/**
 * @file client.ts
 * @description Inisialisasi Sanity Client untuk pengambilan data (Data Fetching).
 * @module sanity/lib/client
 */

// ======================
// IMPORTS
// ======================
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

// ======================
// MAIN EXECUTION
// ======================

/**
 * Sanity Client Instance.
 * Digunakan di seluruh aplikasi untuk menjalankan query GROQ.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Dipaksa false agar selalu mengambil data terbaru (fresh data)
  perspective: "published",
});
