/**
 * @file app/(main)/exams/page.tsx
 * @description Pusat ujian simulasi JLPT. Berfungsi sebagai Server Component yang mengeksekusi kueri langsung ke Sanity CMS untuk mengambil daftar ujian, lalu mendelegasikan hasil rendering ke ExamsClient.
 * @module Server Component
 */

import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import ExamsClient from "./ExamsClient";

// Konfigurasi Incremental Static Regeneration (ISR).
// Waktu hidup cache (cache lifetime) ditetapkan selama 60 detik.
export const revalidate = 60; 

export const metadata: Metadata = {
  title: "Pusat Ujian Simulasi JLPT | NihongoRoute",
  description:
    "Uji kemampuan bahasa Jepang Anda dengan mesin simulasi ujian JLPT waktu nyata.",
};

/**
 * Menarik spesifikasi dasar (judul, deskripsi, durasi, nilai kelulusan) dari 
 * seluruh antrean ujian yang tersedia (kecuali rancangan/draft) di CMS.
 * 
 * @returns {Promise<Array>} Kumpulan data metadata simulasi ujian.
 */
async function getExamsData() {
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

/**
 * Komponen Rute Induk Halaman Ujian.
 * Karena status komponen ini dirender di server, ia mendelegasikan data
 * ke `ExamsClient` agar interaktivitas klien (animasi framer-motion) dapat berjalan.
 * 
 * @returns {JSX.Element} Merender komponen antarmuka klien ExamsClient dengan data dari CMS.
 */
export default async function ExamsPage() {
  const exams = await getExamsData();

  // Oper data ke Client Component untuk dianimasikan
  return <ExamsClient exams={exams} />;
}
