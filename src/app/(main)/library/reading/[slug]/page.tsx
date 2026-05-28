import { getLibraryItemBySlug } from "@/actions/library.actions";
import ReadingPageClient from "./ReadingPageClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const data = await getLibraryItemBySlug("reading", decodedSlug);
  return {
    title: data ? `${data.title} | Graded Reading NihongoRoute` : "Latihan Membaca Dokkai | NihongoRoute",
    description: data ? `Tingkatkan kemampuan membaca dokkai bahasa Jepang Anda dengan teks interaktif ber-furigana untuk ${data.title}.` : "Koleksi teks membaca bahasa Jepang terlengkap dengan furigana dinamis, daftar kosakata terjemahan, dan latihan pemahaman.",
  };
}

export default async function ReadingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const data = await getLibraryItemBySlug("reading", decodedSlug);


  if (!data) {
    notFound();
  }

  return <ReadingPageClient data={data as unknown as import("@/components/features/reading/types").ReadingData} />;
}
