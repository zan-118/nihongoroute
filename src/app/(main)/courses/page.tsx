/**
 * @file page.tsx
 * @description Halaman utama direktori silabus pembelajaran (Course Landing Page).
 * Mengambil kategori secara dinamis (JLPT, General, dll) dari Supabase.
 * @module CoursesLandingPage
 */

import React from "react";
import CoursesClient from "./CoursesClient";
import type { Metadata } from "next";
import { getCourseCategories } from "@/actions/lessons.actions";

export const metadata: Metadata = {
  title: "Pusat Belajar - Pilih Rute Kamu | NihongoRoute",
  description: "Pilih jalur belajar bahasa Jepangmu, mulai dari dasar Kana hingga persiapan JLPT N2.",
};

export default async function CoursesLandingPage() {
  const categories = await getCourseCategories();

  return <CoursesClient categories={categories} />;
}

