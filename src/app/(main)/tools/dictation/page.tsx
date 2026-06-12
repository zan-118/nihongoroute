/**
 * @file app/(main)/tools/dictation/page.tsx
 * @description Halaman utama alat latihan Dictation (Dikte).
 */

import React from "react";
import DictationClient from "@/components/features/tools/dictation/DictationClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Latihan Dikte (Dictation) | NihongoRoute",
  description: "Uji kemampuan mendengar dan menulis bahasa Jepang Anda dengan kalimat contoh JLPT asli.",
};

export default function DictationPage() {
  return <DictationClient />;
}
