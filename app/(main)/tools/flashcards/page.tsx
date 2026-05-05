/**
 * @file app/(main)/tools/flashcards/page.tsx
 * @description Pusat Latihan Flashcard (General Flashcards).
 * Memungkinkan user memilih level atau kategori untuk latihan flashcard.
 * @module FlashcardsPage
 */

"use client";

import React, { useState, useEffect } from "react";
import { client } from "@/sanity/lib/client";
import Link from "next/link";
import { 
  Zap, 
  RotateCw, 
  ChevronLeft, 
  Layers,
  ArrowRight,
  BookOpen
} from "lucide-react";
import FlashcardMaster from "@/components/features/flashcards/master/FlashcardMaster";
import { MasterCardData } from "@/components/features/flashcards/master/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface Category {
  _id: string;
  title: string;
  slug: { current: string };
}

export default function FlashcardsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | "all" | null>(null);
  const [cards, setCards] = useState<MasterCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingCards, setIsFetchingCards] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const query = `*[_type == "course_category"] { _id, title, slug }`;
        const data = await client.fetch(query);
        setCategories(data);
      } catch (error) {
        console.error("Gagal memuat kategori:", error);
        toast.error("Gagal memuat daftar kategori");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const startSession = async (categoryId: string | "all") => {
    setIsFetchingCards(true);
    setSelectedCategory(categoryId);
    try {
      let query = "";
      let params = {};

      if (categoryId === "all") {
        query = `{
          "vocab": *[_type == "vocab" && showInFlashcard != false][0...50] { _id, word, meaning, romaji, furigana },
          "verbs": *[_type == "verb_dictionary" && showInFlashcard != false][0...50] { _id, "word": jisho, meaning, romaji, furigana }
        }`;
      } else {
        query = `{
          "vocab": *[_type == "vocab" && showInFlashcard != false && course_category->_id == $id] { _id, word, meaning, romaji, furigana },
          "verbs": *[_type == "verb_dictionary" && showInFlashcard != false && course_category->_id == $id] { _id, "word": jisho, meaning, romaji, furigana }
        }`;
        params = { id: categoryId };
      }

      const data = await client.fetch(query, params);
      const combined = [...(data.vocab || []), ...(data.verbs || [])].sort(() => Math.random() - 0.5);
      
      if (combined.length === 0) {
        toast.error("Tidak ada data kartu untuk kategori ini.");
        setSelectedCategory(null);
      } else {
        setCards(combined);
      }
    } catch (error) {
      console.error("Gagal memuat kartu:", error);
      toast.error("Gagal memuat data kartu");
      setSelectedCategory(null);
    } finally {
      setIsFetchingCards(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <RotateCw className="text-primary animate-spin mb-4" size={32} />
        <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs animate-pulse font-bold">
          Menyiapkan Pustaka...
        </p>
      </div>
    );
  }

  // Tampilan Pemilihan Kategori
  if (!selectedCategory) {
    return (
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-8 py-12">
        <header className="mb-12">
          <nav className="mb-6 italic">
            <Button asChild variant="ghost" className="h-auto text-muted-foreground text-xs font-bold uppercase tracking-widest px-0 hover:bg-transparent hover:text-foreground">
              <Link href="/tools">← Kembali ke Peralatan</Link>
            </Button>
          </nav>
          <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight italic">
            Pilih <span className="text-primary">Materi</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-xl font-medium leading-relaxed">
            Pilih level atau kategori yang ingin kamu latih menggunakan flashcard. 
            Latihan berulang adalah kunci penguasaan kosakata yang cepat.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Opsi: Semua Materi */}
          <Card 
            onClick={() => startSession("all")}
            className="group p-6 rounded-3xl border border-primary/20 bg-primary/5 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 cursor-pointer flex flex-col gap-4 relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg">
              <Layers size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight text-foreground">Semua Materi</h3>
              <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">
                Campuran 100 kartu acak dari seluruh koleksi yang tersedia.
              </p>
            </div>
            <ArrowRight size={20} className="absolute bottom-6 right-6 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </Card>

          {/* Opsi: Per Kategori */}
          {categories.map((cat) => (
            <Card 
              key={cat._id}
              onClick={() => startSession(cat._id)}
              className="group p-6 rounded-3xl border border-border bg-card/50 hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300 cursor-pointer flex flex-col gap-4 relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all">
                <BookOpen size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-foreground">{cat.title}</h3>
                <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">
                  Fokus latihan khusus pada materi level {cat.title}.
                </p>
              </div>
              <ArrowRight size={20} className="absolute bottom-6 right-6 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Tampilan Loading Kartu
  if (isFetchingCards) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <RotateCw className="text-primary animate-spin mb-4" size={32} />
        <p className="text-muted-foreground font-mono uppercase tracking-widest text-xs animate-pulse font-bold">
          Mengumpulkan kartu...
        </p>
      </div>
    );
  }

  // Sesi Flashcard Aktif
  return (
    <div className="flex-1 w-full px-4 md:px-8 relative overflow-hidden flex flex-col items-center">
      <div className="relative z-10 w-full max-w-2xl mt-4 sm:mt-8">
        <header className="flex justify-between items-center mb-10">
          <Button
            onClick={() => setSelectedCategory(null)}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-widest bg-muted/50 h-auto px-4 py-2.5 rounded-xl border border-border"
          >
            <ChevronLeft size={14} className="mr-2" /> Ganti Materi
          </Button>
          <Badge
            variant="outline"
            className="bg-primary/10 border-primary/30 text-primary px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 h-auto"
          >
            <Zap size={16} />
            <span>Latihan Mode</span>
          </Badge>
        </header>

        <FlashcardMaster
          key={cards[0]?._id}
          cards={cards}
          type="vocab"
          mode="latihan"
          isFixedMode={true}
        />
      </div>
    </div>
  );
}
