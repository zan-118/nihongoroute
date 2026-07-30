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
import CourseCategoryView from "@/features/courses/CourseCategoryView";
import { getCourseCategoryData } from "@/actions/library.actions";
import {
  breadcrumbJsonLd,
  courseJsonLd,
  createPageMetadata,
  encodeRouteSegment,
} from "@/lib/seo";

/**
 * Route parameters for the course category page.
 */
interface PageProps {
  /** Promise resolving to route parameters. */
  params: Promise<{ categoryId: string }>;
}

/**
 * Cached function to retrieve course category data.
 * Prevents duplicate database queries during metadata generation and page rendering.
 */
const getCachedCourseCategoryData = cache(getCourseCategoryData);

// ======================
// METADATA SEO
// ======================

/**
 * Generates dynamic SEO metadata based on the requested course category.
 * @param props - Component properties containing route parameters.
 * @returns Promise resolving to Next.js Metadata object.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { categoryId } = await params;
  // Decode URL parameter to handle special characters or spaces
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
 * CourseCategoryPage component. Fetches category data and renders client view.
 * 
 * @param props - Component properties containing route parameters.
 * @returns React element containing SEO JSON-LD and client component.
 */
export default async function CourseCategoryPage({ params }: PageProps) {
  const { categoryId } = await params;
  // Decode URL parameter to match database identifier format
  const decodedCategoryId = decodeURIComponent(categoryId);
  const data = await getCachedCourseCategoryData(decodedCategoryId);

  // Trigger 404 page if category does not exist
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
      <CourseCategoryView data={data} categoryId={decodedCategoryId} />
    </>
  );
}