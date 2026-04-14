import { NextResponse } from "next/server";
import { createClient } from "next-sanity";

/**
 * Konfigurasi Client Sanity khusus untuk operasi penulisan (Write).
 * Menggunakan token API khusus (SANITY_API_WRITE_TOKEN) agar memiliki izin
 * untuk membuat dokumen baru di dataset Sanity.
 */
const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-04-12",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false, // CDN dinonaktifkan agar data yang baru ditulis bisa langsung terbaca
});

/**
 * Handler untuk metode POST.
 * Berfungsi untuk menerima hasil ujian dari frontend dan menyimpannya
 * ke dalam database Sanity sebagai dokumen 'examResult'.
 */
export async function POST(req: Request) {
  try {
    // Mengekstrak data dari body permintaan (request body)
    const body = await req.json();

    const {
      guestId, // ID unik pengguna (Guest)
      examTitle, // Judul paket ujian yang dikerjakan
      score, // Skor akhir yang diperoleh (skala 0-180)
      totalQuestions, // Jumlah total soal dalam ujian
      passed, // Status kelulusan (boolean)
      sectionScores, // Detail skor per kategori (Vocabulary, Grammar, Reading, Listening)
    } = body;

    // Validasi sederhana untuk memastikan data krusial tidak kosong
    if (!guestId || !examTitle) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 },
      );
    }

    /**
     * Menyiapkan struktur dokumen sesuai dengan skema 'examResult' di Sanity.
     */
    const doc = {
      _type: "examResult",
      guestId,
      examTitle,
      score,
      totalQuestions,
      passed,
      sectionScores, // Menyimpan breakdown skor per bagian untuk analisis progres
      completedAt: new Date().toISOString(), // Mencatat waktu penyelesaian ujian
    };

    // Melakukan proses pembuatan dokumen di Sanity
    const result = await writeClient.create(doc);

    // Mengirim respon sukses beserta ID dokumen yang baru dibuat
    return NextResponse.json({ success: true, documentId: result._id });
  } catch (error) {
    // Log error ke konsol server untuk keperluan debugging
    console.error("Gagal menyimpan skor ke Sanity:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
