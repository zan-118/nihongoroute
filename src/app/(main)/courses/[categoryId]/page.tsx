/**
 * @file page.tsx
 * @description Halaman indeks daftar materi untuk level spesifik (e.g., N5, N4).
 * @module CourseCategoryPage
 */

// ======================
// IMPOR
// ======================
import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import CourseCategoryClient from "./CourseCategoryClient";
import { getCourseCategoryData } from "@/actions/library.actions";
import {
  breadcrumbJsonLd,
  courseJsonLd,
  createPageMetadata,
  encodeRouteSegment,
} from "@/lib/seo";


interface PageProps {
  params: Promise<{ categoryId: string }>;
}

const getCachedCourseCategoryData = cache(getCourseCategoryData);

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
  const data = await getCachedCourseCategoryData(decodedCategoryId);

  if (!data.category)
    return { title: "Kategori Tidak Ditemukan | NihongoRoute" };

  return createPageMetadata({
    title: `${data.category.title} - Rute Belajar | NihongoRoute`,
    description:
      data.category.description ||
      `Pelajari materi bahasa Jepang untuk level ${data.category.title} secara gratis.`,
    path: `/courses/${encodeRouteSegment(decodedCategoryId)}`,
    keywords: [
      String(data.category.title),
      "rute belajar bahasa Jepang",
      "kurikulum JLPT",
      "materi bahasa Jepang gratis",
    ],
  });
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
  const data = await getCachedCourseCategoryData(decodedCategoryId);

  if (!data.category) return notFound();

  const path = `/courses/${encodeRouteSegment(decodedCategoryId)}`;
  const description =
    data.category.description ||
    `Pelajari materi bahasa Jepang untuk level ${data.category.title} secara gratis.`;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Rute Belajar", path: "/courses" },
            { name: data.category.title, path },
          ]),
          courseJsonLd({
            name: data.category.title,
            description,
            path,
            educationalLevel: data.category.title,
          }),
        ]}
      />
      <CourseCategoryClient data={data} categoryId={decodedCategoryId} />
    </>
  );
}

