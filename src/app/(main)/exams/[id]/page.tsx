/**
 * @file page.tsx
 * @description Halaman Sesi Ujian Dinamis (Standalone Exam Session).
 * Bertanggung jawab meresolusi ID rute URL dan menarik struktur soal dari Supabase.
 * @module StandaloneExamSessionPage
 */

// ======================
// IMPOR
// ======================
import MockExamEngine from "@/components/features/exams/mock-engine/MockExamEngine";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getExamByIdOrSlug } from "@/actions/library.actions";
import type { Metadata } from "next";
import { createPageMetadata, encodeRouteSegment } from "@/lib/seo";

// ======================
// ANTARMUKA
// ======================

/**
 * Route parameters for exam page.
 */
interface PageProps {
  params: Promise<{ id: string }>;
}

// ======================
// METADATA SEO
// ======================

/**
 * Generate dynamic SEO metadata for specific JLPT exam session.
 * Resolves route params, fetches exam details, returns metadata object.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Await route params from Next.js 15 dynamic route
  const { id } = await params;
  // Decode URL-encoded ID or slug
  const decodedId = decodeURIComponent(id);
  // Fetch exam structure from database
  const examData = await getExamByIdOrSlug(decodedId);
  return createPageMetadata({
    title: examData ? `${examData.title} | Simulasi JLPT NihongoRoute` : "Simulasi Ujian JLPT | NihongoRoute",
    description: examData
      ? `Ikuti simulasi ujian JLPT untuk paket ${examData.title}. Sistem timer waktu nyata dan format penilaian akurat.`
      : "Ikuti simulasi ujian JLPT untuk level N5 hingga N1.",
    path: `/exams/${encodeRouteSegment(decodedId)}`,
    noIndex: true,
  });
}

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * Standalone exam session page component.
 * Fetches exam data and questions, renders interactive exam engine.
 */
export default async function StandaloneExamSessionPage({ params }: PageProps) {
  // Await route params from Next.js 15 dynamic route
  const { id } = await params;
  // Decode URL-encoded ID or slug
  const decodedId = decodeURIComponent(id);
  // Fetch exam structure from database
  const examData = await getExamByIdOrSlug(decodedId);

  const backLink = "/exams";


  // ======================
  // RENDER UTAMA (Penanganan Kesalahan & Engine)
  // ======================

  // 1. PENANGANAN: DATA TIDAK DITEMUKAN
  if (!examData) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center px-6 text-center relative overflow-hidden py-12">
        <div className="absolute top-0 right-1/4 size-[300px] bg-destructive/5 blur-[55px] rounded-full pointer-events-none" />
        <Card className="p-10 md:p-14 border-destructive/30 max-w-lg w-full relative z-10 my-auto neo-card rounded-[2rem] bg-card">
          <div className="size-20 mx-auto neo-inset text-destructive flex items-center justify-center rounded-full mb-8 shadow-inner bg-destructive/10">
            <span className="text-4xl block">🚫</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-foreground uppercase tracking-tight mb-4">
            Ujian Tidak Ditemukan
          </h1>
          <p className="text-muted-foreground mb-10 text-sm leading-relaxed">
            Data ujian ini tidak ditemukan atau sudah dihapus dari sistem.
          </p>
          <Button
            asChild
            variant="ghost"
            className="bg-card neo-inset border border-border hover:border-primary/50 text-foreground hover:text-primary font-black uppercase tracking-widest h-auto py-4 px-8 rounded-xl text-[10px] transition-all"
          >
            <Link href={backLink}>
              ← Kembali ke Menu
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  // 2. PENANGANAN: SOAL MASIH KOSONG
  if (!examData.questions || examData.questions.length === 0) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center px-6 text-center relative overflow-hidden py-12">
        <div className="absolute top-0 left-1/4 size-[300px] bg-warning/5 blur-[55px] rounded-full pointer-events-none" />
        <Card className="p-10 md:p-14 border-warning/30 max-w-lg w-full relative z-10 my-auto neo-card rounded-[2rem] bg-card">
          <div className="size-20 mx-auto neo-inset text-warning flex items-center justify-center rounded-full mb-8 shadow-inner bg-warning/10">
            <span className="text-4xl block">🚧</span>
          </div>
          <h1 className="text-2xl md:text-3xl text-foreground uppercase tracking-tight mb-4">
            Sedang Dalam Pembuatan
          </h1>
          <p className="text-muted-foreground mb-10 text-sm leading-relaxed">
            Paket ujian{" "}
            <strong className="text-warning">{examData.title}</strong> belum
            memiliki butir soal di database.
          </p>
          <Button
            asChild
            variant="ghost"
            className="bg-card neo-inset border border-warning/30 hover:border-warning/60 text-warning hover:text-warning font-black uppercase tracking-widest h-auto py-4 px-8 rounded-xl text-[10px] transition-all"
          >
            <Link href={backLink}>
              ← Kembali ke Menu
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  // 3. RENDER UTAMA ENGINE
  return (
    <div className="w-full flex-1 px-4 md:px-8 relative overflow-hidden flex flex-col mt-4 md:mt-8">
      <div className="absolute top-[-8%] right-[-5%] size-[420px] bg-destructive/5 blur-[70px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] size-[360px] bg-warning/5 blur-[60px] rounded-full pointer-events-none" />
      <div className="w-full max-w-5xl mx-auto relative z-10 flex-1 flex flex-col">
        <MockExamEngine exam={examData} />
      </div>
    </div>
  );
}