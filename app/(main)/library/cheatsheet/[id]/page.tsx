import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  Home,
  Library,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheatsheetTable } from "./CheatsheetTable";
import PdfGenerator from "@/components/features/pdf/PdfGenerator";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SheetItem {
  label: string;
  jp: string;
  romaji: string;
}

interface Cheatsheet {
  _id: string;
  title: string;
  category: string;
  items?: SheetItem[];
  linkedVocab?: SheetItem[];
}

export default async function CheatsheetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const sheet: Cheatsheet = await client.fetch(
    `*[_type == "cheatsheet" && (_id == $id || _id == "drafts." + $id || slug.current == $id)][0] {
      _id, title, category, items,
      linkedVocab[]->{ "jp": word, "label": meaning, "romaji": coalesce(romaji, furigana) }
    }`,
    { id }
  );

  if (!sheet) notFound();

  const allItems = [
    ...(sheet.linkedVocab || []),
    ...(sheet.items || [])
  ].filter(Boolean);

  return (
    <main className="w-full bg-background min-h-screen pb-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="neural-grid" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.03)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10 pt-10">
        {/* Navigation */}
        <nav className="mb-12 flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
          <Link href="/dashboard" className="hover:text-primary transition-colors flex items-center gap-2">
            <Home size={14} /> Beranda
          </Link>
          <span className="text-border">/</span>
          <Link href="/library" className="hover:text-primary transition-colors flex items-center gap-2">
            <Library size={14} /> Pustaka
          </Link>
          <span className="text-border">/</span>
          <Link href="/library/cheatsheet" className="hover:text-primary transition-colors flex items-center gap-2">
             Cheatsheet
          </Link>
          <span className="text-border">/</span>
          <span className="text-primary">{sheet.title}</span>
        </nav>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-16">
          <div className="flex flex-col gap-6 max-w-3xl">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                {sheet.category}
              </Badge>
              <div className="w-1 h-1 rounded-full bg-border" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                {allItems.length} Materi Terdaftar
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-[0.85]">
              {sheet.title}
            </h1>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
              Panduan referensi lengkap untuk memahami <span className="text-primary">{sheet.title}</span> dengan tabel komparasi yang sistematis.
            </p>
          </div>

          <div className="flex items-center gap-3 no-print">
            <PdfGenerator 
              data={allItems} 
              type="cheatsheet" 
              title={sheet.title} 
              category={sheet.category} 
            />
          </div>
        </div>

        {/* Main Content Table (Client Component) */}
        <CheatsheetTable items={allItems} />

        {/* Action Bottom */}
        <div className="mt-16 flex flex-col items-center gap-8 text-center pb-20">
          <div className="w-16 h-1 bg-border rounded-full" />
          <div className="flex flex-col gap-3">
            <h3 className="text-2xl font-black tracking-tight">Butuh Versi Cetak?</h3>
            <p className="text-muted-foreground text-sm font-medium">Unduh PDF cheatsheet ini untuk dipelajari secara offline di mana saja.</p>
          </div>
          <Link href="/library/cheatsheet">
            <Button variant="ghost" className="gap-2 font-bold text-muted-foreground hover:text-primary">
              <ChevronLeft size={16} /> Kembali ke Daftar
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
