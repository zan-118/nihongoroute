import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  Copy, 
  Printer, 
  Share2,
  Home,
  Library,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import * as wanakana from "wanakana";
import { splitFurigana } from "@/lib/furigana";

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
    `*[_type == "cheatsheet" && _id == $id][0] {
      _id, title, category, items,
      linkedVocab[]->{ "jp": word, "label": meaning, "romaji": coalesce(romaji, furigana) }
    }`,
    { id }
  );

  if (!sheet) notFound();

  const formatLabel = (text: string) => {
    if (!text) return text;
    const keywords = [
      "Contoh", "Catatan", "Penting", "Fakta budaya", 
      "Perubahan fonetis", "Nuansa", "Tips", "Catatan menarik",
      "Pengecualian penting", "Batas", "Fakta budaya", "Nuansa sosial"
    ];
    
    let formatted = text;
    keywords.forEach(key => {
      const regex = new RegExp(`(${key}:)`, 'g');
      formatted = formatted.replace(regex, '<strong class="text-primary font-bold">$1</strong>');
    });

    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

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
            <Button variant="outline" className="rounded-2xl border-border bg-muted/20 hover:bg-muted font-bold text-xs gap-2 py-6 px-6">
              <Printer size={16} /> Print
            </Button>
            <Button className="rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-xs gap-2 py-6 px-8 shadow-xl shadow-primary/20">
              <Share2 size={16} /> Bagikan
            </Button>
          </div>
        </div>

        {/* Main Content Table */}
        <Card className="overflow-hidden border border-border/50 bg-card/50 backdrop-blur-sm rounded-[3rem] shadow-2xl overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-muted/50 border-b border-border/50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-primary/60 w-20 text-center">No</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-primary/60 w-1/3">Konteks / Label</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-primary/60">Ekspresi (JP)</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-primary/60 text-right">Opsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {allItems.map((item, idx) => (
                <tr key={idx} className="group hover:bg-primary/[0.01] transition-all duration-300">
                  <td className="px-8 py-10 text-center">
                    <span className="text-sm font-black text-muted-foreground/20 italic group-hover:text-primary/30 transition-colors">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                  </td>
                  <td className="px-8 py-10">
                    <div className="text-base md:text-lg font-bold text-foreground leading-tight mb-1 group-hover:text-primary transition-colors">
                      {formatLabel(item.label)}
                    </div>
                    <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                      Meaning & Context
                    </div>
                  </td>
                  <td className="px-8 py-10">
                    <div className="flex flex-col gap-1.5">
                      <div className="text-3xl md:text-4xl font-japanese font-black text-foreground tracking-tighter leading-normal">
                        {(() => {
                          const hiraReading = wanakana.toHiragana(item.romaji || "");
                          return splitFurigana(item.jp || "", hiraReading).map((chunk, i) => (
                            chunk.furi ? (
                              <ruby key={i}>
                                {chunk.text}
                                <rt className="text-[10px] md:text-xs text-primary font-bold tracking-widest mb-1 select-none">
                                  {chunk.furi}
                                </rt>
                              </ruby>
                            ) : (
                              <span key={i}>{chunk.text}</span>
                            )
                          ));
                        })()}
                      </div>
                      <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] italic">
                        {item.romaji}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-10 text-right">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="rounded-xl hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all"
                      onClick={() => {
                        navigator.clipboard.writeText(item.jp);
                        toast.success("Disalin ke papan klip!");
                      }}
                    >
                      <Copy size={18} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

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
