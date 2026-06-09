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
import { JsonLd } from "@/components/seo/JsonLd";
import ExamsClient from "./ExamsClient";
import { getExamsList } from "@/actions/library.actions";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  learningResourceJsonLd,
} from "@/lib/seo";

type ExamListItem = {
  title?: string;
};

// ======================
// METADATA SEO
// ======================
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Pusat Ujian Simulasi JLPT | NihongoRoute",
    description:
      "Uji kemampuan bahasa Jepang dengan simulasi ujian JLPT waktu nyata, pembagian sesi, dan laporan hasil untuk latihan mandiri.",
    path: "/exams",
    keywords: ["simulasi JLPT", "tryout JLPT", "ujian bahasa Jepang", "latihan JLPT"],
  }),
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

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Ujian", path: "/exams" },
          ]),
          learningResourceJsonLd({
            name: "Pusat Ujian Simulasi JLPT",
            description: metadata.description as string,
            path: "/exams",
            educationalLevel: "JLPT N5-N1",
            teaches: (exams as ExamListItem[]).map((exam) => exam.title || "").filter(Boolean),
          }),
        ]}
      />
      <ExamsClient exams={exams} />
    </>
  );
}
