import { NextResponse } from "next/server";
import { createClient } from "next-sanity";

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-04-12",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Tambahkan sectionScores di sini
    const { guestId, examTitle, score, totalQuestions, passed, sectionScores } =
      body;

    if (!guestId || !examTitle) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    const doc = {
      _type: "examResult",
      guestId,
      examTitle,
      score,
      totalQuestions,
      passed,
      sectionScores, // Simpan objek skor spesifik
      completedAt: new Date().toISOString(),
    };

    const result = await writeClient.create(doc);
    return NextResponse.json({ success: true, documentId: result._id });
  } catch (error) {
    console.error("Gagal menyimpan skor ke Sanity:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
