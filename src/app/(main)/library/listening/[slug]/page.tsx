import { getLibraryItemBySlug } from "@/actions/library.actions";
import ListeningPageClient from "./ListeningPageClient";
import { notFound } from "next/navigation";

export default async function ListeningPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const data = await getLibraryItemBySlug("listening", decodedSlug);


  if (!data) {
    notFound();
  }

  return <ListeningPageClient data={data as unknown as import("@/components/features/listening/types").ListeningTaskData} />;
}
