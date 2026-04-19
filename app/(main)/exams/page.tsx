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
import { client } from "@/sanity/lib/client";
import ExamsClient from "./ExamsClient";

// ======================
// CONFIG / CONSTANTS
// ======================
export const revalidate = 60; 

export const metadata: Metadata = {
  title: "Pusat Ujian Simulasi JLPT | NihongoRoute",
  description:
    "Uji kemampuan bahasa Jepang Anda dengan mesin simulasi ujian JLPT waktu nyata.",
};

// ======================
// DATABASE OPERATIONS
// ======================

/**
 * Menarik daftar ujian simulasi dari Sanity CMS.
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

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen ExamsPage (Server Component): Mengambil data ujian dan merender ExamsClient.
 * 
 * @returns {JSX.Element} Halaman pusat ujian.
 */
export default async function ExamsPage() {
  const exams = await getExamsData();

  return <ExamsClient exams={exams} />;
}

