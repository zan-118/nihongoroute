/**
 * LOKASI FILE: app/(main)/courses/[categoryId]/page.tsx
 * KONSEP: Server Component (Data Fetching + SEO)
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { client } from "@/sanity/lib/client";
import CourseCategoryClient from "./CourseCategoryClient"; // Import komponen klien

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ categoryId: string }>;
}

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

// ✨ METADATA SEO TETAP AMAN DI SINI
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

export default async function CourseCategoryPage({ params }: PageProps) {
  const { categoryId } = await params;
  const data = await getCourseData(categoryId);

  if (!data.category) return notFound();

  // ✨ OPER DATA KE KOMPONEN KLIEN
  return <CourseCategoryClient data={data} categoryId={categoryId} />;
}
