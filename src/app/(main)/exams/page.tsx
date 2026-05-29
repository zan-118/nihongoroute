/**
 * @file page.tsx
 * @description Pusat ujian simulasi JLPT. 
 * Mengambil daftar ujian dari CMS dan mendelegasikan rendering ke komponen client.
 * @module ExamsPage
 */

// ======================
// IMPOR
// ======================
import type { Metadata } from "next";
import ExamsClient from "./ExamsClient";
import { getExamsList } from "@/actions/library.actions";

// ======================
// METADATA SEO
// ======================
export const metadata: Metadata = {
  title: "Pusat Ujian Simulasi JLPT | NihongoRoute",
  description:
    "Uji kemampuan bahasa Jepang Anda dengan mesin simulasi ujian JLPT waktu nyata.",
};

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Halaman utama untuk memuat daftar simulasi ujian JLPT yang tersedia dari Sanity CMS.
 * 
 * @returns {JSX.Element} Halaman daftar simulasi ujian.
 */
export default async function ExamsPage() {
  const exams = await getExamsList();

  return <ExamsClient exams={exams} />;
}

