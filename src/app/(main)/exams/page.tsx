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

/**
 * Represents a simplified exam item for SEO metadata generation.
 */
type ExamListItem = {
  title?: string;
};

// ======================
// METADATA SEO
// ======================
/**
 * SEO metadata configuration for the Exams page.
 */
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
 * Server component for the JLPT exam center page.
 * Fetches exam list from CMS and renders client-side exam interface.
 * 
 * @returns React element containing SEO JSON-LD and the ExamsClient component.
 */
export default async function ExamsPage() {
  // Fetch available exams from Sanity CMS
  const exams = await getExamsList();

  return (
    <>
      {/* Inject JSON-LD structured data for SEO */}
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
            // Map exam titles to teachable topics for SEO schema
            teaches: (exams as ExamListItem[]).map((exam) => exam.title || "").filter(Boolean),
          }),
        ]}
      />
      {/* Render client component with fetched exams */}
      <ExamsClient exams={exams} />
    </>
  );
}