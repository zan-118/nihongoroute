"use client";

/**
 * @file LandingFaq.tsx
 * @description Interactive FAQ accordion section component for landing page.
 */

import React, { useState } from "react";
import { HelpCircle, ChevronDown } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const faqItems = [
  {
    question: "Apakah NihongoRoute benar-benar 100% gratis & bebas iklan?",
    answer:
      "Pasti! NihongoRoute berkomitmen penuh memberikan akses belajar bahasa Jepang yang setara dan bersih. Seluruh materi kosakata, tata bahasa, dan simulasi ujian dapat diakses tanpa biaya dan 100% bebas dari iklan banner atau popup yang mengganggu fokus.",
  },
  {
    question: "Bagaimana cara kerja teknologi Offline-First?",
    answer:
      "Seluruh data materi dan kemajuan belajar disimpan secara lokal di perangkat Anda (menggunakan sistem penyimpanan browser IndexedDB). Anda dapat terus belajar, menghafal kosakata, dan mengerjakan soal latihan tanpa koneksi internet sama sekali.",
  },
  {
    question: "Materi JLPT dari level berapa sampai berapa yang tersedia?",
    answer:
      "NihongoRoute menyediakan kurikulum lengkap dari tingkat dasar JLPT N5 hingga tingkat mahir JLPT N1. Setiap level mencakup tabel Kana, daftar kosakata utama, kamus Kanji, penjelasan tata bahasa, serta simulasi ujian CBT.",
  },
  {
    question: "Apa itu metode Spaced Repetition System (SRS)?",
    answer:
      "SRS adalah metode pengulangan hafalan berbasis sains memori. Algoritma NihongoRoute akan otomatis menjadwalkan ulang kartu flashcard kosakata yang perlu Anda ulas tepat di saat memori otak Anda akan mulai lupa. Metode ini menghemat waktu belajar hingga 60%.",
  },
  {
    question: "Apakah data progres saya tersimpan jika membuka di HP & Laptop?",
    answer:
      "Ya! Begitu perangkat Anda tersambung kembali ke internet, data progres belajar lokal akan disinkronkan secara aman ke cloud server Supabase dan disiarkan secara otomatis ke seluruh perangkat yang terhubung dengan akun Anda.",
  },
];

/**
 * LandingFaq component.
 * Renders interactive FAQ accordion list for landing page.
 */
export function LandingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative my-20 md:my-28">
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
          <HelpCircle size={14} className="mr-1.5" />
          <span>Pertanyaan Umum</span>
        </Badge>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
          Sering Ditanyakan <span className="text-primary">Pembelajar</span>
        </h2>
        <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-medium">
          Segala hal yang perlu kamu ketahui sebelum memulai perjalanan belajar Bahasa Jepang di NihongoRoute.
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <Card
              key={item.question}
              className={`border transition-all duration-300 rounded-2xl overflow-hidden ${
                isOpen
                  ? "bg-card border-primary/40 shadow-sm"
                  : "bg-card/70 border-border/70 hover:border-border hover:bg-card"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(index)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-foreground text-base md:text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
              >
                <span>{item.question}</span>
                <ChevronDown
                  size={20}
                  className={`text-muted-foreground shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 pt-0 text-sm md:text-base text-muted-foreground leading-relaxed animate-in fade-in duration-200 border-t border-border/40 mt-1 pt-4">
                  {item.answer}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
}
