import { getLibraryItemBySlug } from "@/actions/library.actions";
import ReadingPageClient from "./ReadingPageClient";
import { notFound } from "next/navigation";

export default async function ReadingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const data = await getLibraryItemBySlug("reading", decodedSlug);


  if (!data) {
    notFound();
  }

  return <ReadingPageClient data={data} />;
}
