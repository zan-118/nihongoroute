import { getLibraryItemBySlug } from "@/actions/library.actions";
import ListeningPageClient from "./ListeningPageClient";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const data = await getLibraryItemBySlug("listening", decodedSlug);
  return {
    title: data ? `${data.title} | Laboratorium Listening NihongoRoute` : "Latihan Listening Choukai | NihongoRoute",
    description: data ? `Latih choukai / pendengaran bahasa Jepang Anda dengan materi percakapan dan kuis interaktif untuk ${data.title}.` : "Laboratorium choukai interaktif dengan klip audio percakapan asli penutur Jepang dan kuis pemahaman.",
  };
}

export default async function ListeningPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const data = await getLibraryItemBySlug("listening", decodedSlug);


  if (!data) {
    notFound();
  }

  return <ListeningPageClient data={data as unknown as import("@/components/features/listening/types").ListeningTaskData} />;
}
