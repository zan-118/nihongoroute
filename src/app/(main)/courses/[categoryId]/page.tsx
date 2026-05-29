/**
 * @file page.tsx
 * @description Halaman indeks daftar materi untuk level spesifik (e.g., N5, N4).
 * @module CourseCategoryPage
 */

// ======================
// IMPOR
// ======================
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CourseCategoryClient from "./CourseCategoryClient";
import { getCourseCategoryData } from "@/actions/library.actions";


interface PageProps {
  params: Promise<{ categoryId: string }>;
}

// ======================
// METADATA SEO
// ======================

/**
 * Menghasilkan metadata SEO dinamis berdasarkan kategori.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { categoryId } = await params;
  const decodedCategoryId = decodeURIComponent(categoryId);
  const data = await getCourseCategoryData(decodedCategoryId);

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
// EKSEKUSI UTAMA
// ======================

/**
 * Komponen CourseCategoryPage: Mengambil data kategori dan merender CourseCategoryClient.
 * 
 * @returns {JSX.Element} Halaman kategori materi.
 */
export default async function CourseCategoryPage({ params }: PageProps) {
  const { categoryId } = await params;
  const decodedCategoryId = decodeURIComponent(categoryId);
  const data = await getCourseCategoryData(decodedCategoryId);

  if (!data.category) return notFound();

  return <CourseCategoryClient data={data} categoryId={decodedCategoryId} />;
}


