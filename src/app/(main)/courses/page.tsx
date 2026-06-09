/**
 * @file page.tsx
 * @description Halaman utama direktori silabus pembelajaran (Course Landing Page).
 * Mengambil kategori secara dinamis (JLPT, General, dll) dari Supabase.
 * @module CoursesLandingPage
 */

// ======================
// IMPOR
// ======================
import React from "react";
import CoursesClient from "./CoursesClient";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCourseCategories } from "@/actions/lessons.actions";
import {
  breadcrumbJsonLd,
  createPageMetadata,
  learningResourceJsonLd,
} from "@/lib/seo";

// ======================
// METADATA SEO
// ======================
export const metadata: Metadata = {
  ...createPageMetadata({
    title: "Pusat Belajar - Pilih Rute Kamu | NihongoRoute",
    description:
      "Pilih jalur belajar bahasa Jepang dari dasar Kana hingga persiapan JLPT N5 sampai N1.",
    path: "/courses",
    keywords: ["rute belajar bahasa Jepang", "kurikulum JLPT", "belajar JLPT online"],
  }),
};

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Halaman utama untuk merender indeks seluruh kategori dan modul pembelajaran NihongoRoute.
 * 
 * @returns {JSX.Element} Halaman direktori rute belajar.
 */
export default async function CoursesLandingPage() {
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
            teaches: categories.map((category) => category.title).filter(Boolean),
          }),
        ]}
      />
      <CoursesClient categories={categories} />
    </>
  );
}
