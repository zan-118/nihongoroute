/**
 * @file page.tsx
 * @description Pusat ujian simulasi JLPT. 
 * Mengambil daftar ujian dari CMS dan mendelegasikan rendering ke komponen client.
 * @module ExamsPage
 */

// ======================
// IMPORTS
// ======================
import type { Metadata } from "next";
import ExamsClient from "./ExamsClient";
import { getExamsList } from "@/actions/library.actions";

export const metadata: Metadata = {
  title: "Pusat Ujian Simulasi JLPT | NihongoRoute",
  description:
    "Uji kemampuan bahasa Jepang Anda dengan mesin simulasi ujian JLPT waktu nyata.",
};

export default async function ExamsPage() {
  const exams = await getExamsList();


  return <ExamsClient exams={exams} />;
}

