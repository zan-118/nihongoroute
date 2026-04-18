/**
 * LOKASI FILE: app/(main)/exams/page.tsx
 * KONSEP: Server Component (Data Fetching + SEO)
 */

import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import ExamsClient from "./ExamsClient";

export const revalidate = 60; // Refresh data setiap 60 detik agar ujian baru cepat muncul

export const metadata: Metadata = {
  title: "Pusat Ujian Simulasi JLPT | NihongoRoute",
  description:
    "Uji kemampuan bahasa Jepang Anda dengan mesin simulasi ujian JLPT waktu nyata.",
};

async function getExamsData() {
  // 1. Menghapus syarat is_published == true
  // 2. Memperbaiki order menggunakan referensi aslinya (course_category->slug.current)
  const query = `*[_type == "mockExam" && !(_id in path("drafts.**"))] | order(_createdAt desc) {
    _id,
    title,
    description,
    "levelCode": course_category->slug.current,
    timeLimit,
    passingScore
  }`;

  return await client.fetch(query);
}
export default async function ExamsPage() {
  const exams = await getExamsData();

  // Oper data ke Client Component untuk dianimasikan
  return <ExamsClient exams={exams} />;
}
