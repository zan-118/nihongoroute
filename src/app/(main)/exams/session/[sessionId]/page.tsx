import type { Metadata } from "next";
import Link from "next/link";
import { getExamSessionPackage } from "@/actions/jlpt-exams.actions";
import MockExamEngine from "@/features/exams/components/mock-engine/MockExamEngine";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createPageMetadata, encodeRouteSegment } from "@/lib/seo";

/**
 * Props for exam session page.
 */
interface PageProps {
  params: Promise<{ sessionId: string }>;
}

/**
 * Generate metadata for exam session page.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Extract session ID from route params
  const { sessionId } = await params;

  return createPageMetadata({
    title: "Resume Mock Test | NihongoRoute",
    description: "Lanjutkan atau tinjau sesi mock test JLPT Supabase.",
    path: `/exams/session/${encodeRouteSegment(sessionId)}`,
    noIndex: true,
  });
}

/**
 * Exam session page component. Load session data and render exam engine.
 */
export default async function ExamSessionPage({ params }: PageProps) {
  // Extract session ID from route params
  const { sessionId } = await params;
  
  // Fetch exam session package from database
  const session = await getExamSessionPackage(decodeURIComponent(sessionId));

  // Show error if session not found or unauthorized
  if (!session) {
    return (
      <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden px-6 py-12 text-center">
        <Card className="relative z-10 w-full max-w-lg rounded-[2rem] border-destructive/30 bg-card p-10 shadow-xl md:p-14">
          <h1 className="mb-4 text-2xl uppercase tracking-tight text-foreground md:text-3xl">
            Sesi Tidak Ditemukan
          </h1>
          <p className="mb-10 text-sm leading-relaxed text-muted-foreground">
            Sesi mock test ini tidak tersedia, bukan milik akunmu, atau sudah
            dihapus.
          </p>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/exams">Kembali ke daftar ujian</Link>
          </Button>
        </Card>
      </div>
    );
  }

  // Map session result to exam object for engine
  const exam = {
    ...session.exam,
    serverResult: session.result,
  };

  return (
    <div className="relative mt-4 flex w-full flex-1 flex-col overflow-hidden px-4 md:mt-8 md:px-8">
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col">
        <MockExamEngine exam={exam} />
      </div>
    </div>
  );
}