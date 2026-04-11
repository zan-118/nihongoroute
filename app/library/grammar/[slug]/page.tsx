import { client } from "@/sanity/lib/client";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Query untuk mengambil artikel berdasarkan slug
const articleQuery = `*[_type == "grammar_article" && slug.current == $slug][0] {
  title,
  content
}`;

// Kustomisasi tampilan komponen Portable Text (Contoh: Contoh Kalimat)
const components = {
  types: {
    exampleSentence: ({ value }: any) => (
      <div className="my-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
        <p className="text-xl font-bold text-gray-900 mb-1">{value.jp}</p>
        <p className="text-gray-600 italic">{value.id}</p>
      </div>
    ),
  },
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">{children}</h2>
    ),
    normal: ({ children }: any) => (
      <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
    ),
  },
};

export default async function GrammarDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await client.fetch(articleQuery, { slug: params.slug });

  if (!article) {
    notFound();
  }

  return (
    <article className="max-w-3xl mx-auto p-6">
      {/* Breadcrumb sederhana */}
      <nav className="mb-8">
        <Link
          href="/reference/grammar"
          className="text-blue-600 hover:underline text-sm"
        >
          ← Kembali ke Daftar Artikel
        </Link>
      </nav>

      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
          {article.title}
        </h1>
        <div className="h-1 w-20 bg-blue-500 mt-4"></div>
      </header>

      {/* Bagian Isi Artikel */}
      <div className="prose prose-blue max-w-none">
        <PortableText value={article.content} components={components} />
      </div>

      <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
        Materi ini disadur dari Lampiran Minna no Nihongo.
      </footer>
    </article>
  );
}
