/**
 * @file page.tsx
 * @description Main learning syllabus directory landing page route component.
 * Dynamically fetches course categories (JLPT, General, etc.) from Supabase.
 * @module CoursesLandingPage
 */

import CoursesView from "@/features/courses/CoursesView";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCourseCategories } from "@/actions/lessons.actions";
import {
 breadcrumbJsonLd,
 createPageMetadata,
 learningResourceJsonLd,
} from "@/lib/seo";

/**
 * SEO metadata configuration for courses page.
 */
export const metadata: Metadata = {
 ...createPageMetadata({
 title: "Pusat Belajar - Pilih Rute Kamu | NihongoRoute",
 description:
 "Pilih jalur belajar bahasa Jepang dari dasar Kana hingga persiapan JLPT N5 sampai N1.",
 path: "/courses",
 keywords: ["rute belajar bahasa Jepang", "kurikulum JLPT", "belajar JLPT online"],
 }),
};

/**
 * Courses landing page component. Fetch categories. Render client view.
 * 
 * @returns React element containing SEO JSON-LD and client component.
 */
export default async function CoursesLandingPage() {
 // Fetch course categories from DB
 const categories = await getCourseCategories();

 return (
 <>
 <JsonLd
 data={[
 breadcrumbJsonLd([
 { name: "Beranda", path: "/" },
 { name: "Rute Belajar", path: "/courses" },
 ]),
 learningResourceJsonLd({
 name: "Pusat Belajar NihongoRoute",
 description: metadata.description as string,
 path: "/courses",
 educationalLevel: "JLPT N5-N1",
 // Extract valid category titles for SEO schema
 teaches: categories.map((category) => category.title).filter(Boolean),
 }),
 ]}
 />
 <CoursesView categories={categories} />
 </>
 );
}