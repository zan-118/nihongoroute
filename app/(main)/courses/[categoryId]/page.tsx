/**
 * @file page.tsx
 * @description Halaman indeks daftar materi untuk level spesifik (e.g., N5, N4).
 * @module CourseCategoryPage
 */

// ======================
// IMPORTS
// ======================
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import CourseCategoryClient from "./CourseCategoryClient";

// ======================
// CONFIG / CONSTANTS
// ======================
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ categoryId: string }>;
}

// ======================
// DATABASE OPERATIONS
// ======================

/**
 * Mengambil metadata kategori dan daftar pelajaran dari Sanity CMS.
 * 
 * @param {string} slug - Identifikasi level (e.g., "n5").
 * @returns {Promise<Object>} Data kategori, pelajaran, dan ujian.
 */
async function getCourseData(slug: string) {
  const query = `{
    "category": *[_type == "course_category" && slug.current == $slug][0] {
      _id, title, type, description, "slug": slug.current
    },
    "lessons": *[_type == "lesson" && course_category->slug.current == $slug] | order(orderNumber asc, _createdAt desc) {
      _id, title, summary, "slug": slug.current
    },
    "mockExams": *[_type == "mockExam" && course_category->slug.current == $slug] | order(_createdAt desc) {
      _id, title, timeLimit, passingScore
    }
  }`;
  return await client.fetch(query, { slug });
}

// ======================
// METADATA
// ======================

/**
 * Menghasilkan metadata SEO dinamis berdasarkan kategori.
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

// ======================
// MAIN EXECUTION
// ======================

/**
 * Komponen CourseCategoryPage: Mengambil data kategori dan merender CourseCategoryClient.
 * 
 * @returns {JSX.Element} Halaman kategori materi.
 */
export default async function CourseCategoryPage({ params }: PageProps) {
  const { categoryId } = await params;
  const data = await getCourseData(categoryId);

  if (!data.category) return notFound();

  return <CourseCategoryClient data={data} categoryId={categoryId} />;
}

