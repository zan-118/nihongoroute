/**
 * @file app/(main)/courses/[categoryId]/page.tsx
 * @description Halaman indeks daftar materi (kurikulum) untuk level spesifik seperti N5 atau N4. Mengambil metadata materi beserta daftar simulasi ujian dari Sanity CMS.
 * @module Server Component
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import CourseCategoryClient from "./CourseCategoryClient"; // Import komponen klien

// ISR: Regenerasi halaman statis secara latar belakang setiap 1 Jam (3600 detik)
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ categoryId: string }>;
}

/**
 * Mengambil metadata kategori dan daftar pelajaran (lessons) dari Sanity CMS berdasarkan referensi kategori silabus yang cocok.
 * 
 * @param {string} slug - String identifikasi level (contoh: "n5" atau "n4").
 * @returns {Promise<Object>} Kumpulan data kategori, daftar artikel/bab pelajaran, dan daftar ujian terkait.
 */
async function getCourseData(slug: string) {
  const query = `{
    "category": *[_type == "course_category" && slug.current == $slug][0],
    "lessons": *[_type == "lesson" && course_category->slug.current == $slug && is_published == true] | order(orderNumber asc) {
      _id, title, summary, "slug": slug.current
    },
    "mockExams": *[_type == "mockExam" && course_category->slug.current == $slug] | order(_createdAt desc) {
      _id, title, timeLimit, passingScore
    }
  }`;
  return await client.fetch(query, { slug });
}

/**
 * Penyuntikan Metadata SEO Secara Dinamis.
 * Mengekstrak informasi kategori sebelum render untuk memberi informasi *title* dan *description* ke metatag HTML.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { categoryId } = await params;
  const data = await getCourseData(categoryId);

  if (!data.category)
    return { title: "Kategori Tidak Ditemukan | NihongoRoute" };

  return {
    title: `${data.category.title} - Rute Belajar | NihongoRoute`,
    description:
      data.category.description ||
      `Pelajari materi bahasa Jepang untuk level ${data.category.title} secara gratis.`,
  };
}

/**
 * Rute Induk Daftar Materi Silabus.
 * Mengelola pengunduhan data server, memberikan status 'notFound' jika parameter gagal dipenuhi,
 * dan mendelegasikan perenderan visual ke antarmuka klien (CourseCategoryClient).
 * 
 * @returns {JSX.Element} Merender komponen interaktif atau pesan 404 jika silabus kosong.
 */
export default async function CourseCategoryPage({ params }: PageProps) {
  const { categoryId } = await params;
  const data = await getCourseData(categoryId);

  if (!data.category) return notFound();

  // Oper data ke komponen klien untuk keperluan animasi dan state manajemen
  return <CourseCategoryClient data={data} categoryId={categoryId} />;
}
