"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Command, BookOpen, Trophy, Layers, BrainCircuit, Heart, Settings, Share2, ArrowRight, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  category: "Platform" | "Belajar" | "Sistem" | "Aksi Cepat";
}

const SEARCH_ITEMS: SearchItem[] = [
  { id: "dash", title: "Dasbor", description: "Ringkasan progres dan statistik Anda", href: "/dashboard", icon: Zap, category: "Platform" },
  { id: "materi", title: "Materi", description: "Jalur belajar JLPT dan Topik Umum", href: "/courses", icon: BookOpen, category: "Platform" },
  { id: "ujian", title: "Ujian", description: "Simulasi JLPT dan Test Mandiri", href: "/exams", icon: Trophy, category: "Platform" },
  { id: "pustaka", title: "Pustaka", description: "Daftar kata benda, kata kerja, dan kanji", href: "/library", icon: Layers, category: "Belajar" },
  { id: "hafalan", title: "Hafalan", description: "Latihan SRS untuk ingatan jangka panjang", href: "/review", icon: BrainCircuit, category: "Belajar" },
  { id: "sosial", title: "Sosial", description: "Peringkat global dan komunitas", href: "/social", icon: Trophy, category: "Belajar" },
  { id: "dukungan", title: "Dukungan", description: "Bantuan dan panduan penggunaan", href: "/support", icon: Heart, category: "Sistem" },
  { id: "pengaturan", title: "Pengaturan", description: "Kelola profil dan preferensi aplikasi", href: "/settings", icon: Settings, category: "Sistem" },
  { id: "bagikan", title: "Bagikan", description: "Ajak teman belajar bersama di NihongoRoute", href: "/share", icon: Share2, category: "Sistem" },
  { id: "quick-review", title: "Review Sekarang", description: "Mulai sesi review SRS yang tertunda", href: "/review", icon: Zap, category: "Aksi Cepat" },
  { id: "quick-kana", title: "Belajar Kana", description: "Latihan dasar Hiragana & Katakana", href: "/courses/basics", icon: BookOpen, category: "Aksi Cepat" },
];

export default function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  const filteredItems = query.trim() === "" 
    ? SEARCH_ITEMS.filter(item => item.category === "Aksi Cepat")
    : SEARCH_ITEMS.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) || 
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );

  const handleSelect = useCallback((href: string) => {
    router.push(href);
    onClose();
  }, [router, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
      }
      
      if (!isOpen) return;

      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(prev => (prev + 1) % filteredItems.length);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[activeIndex]) handleSelect(filteredItems[activeIndex].href);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, filteredItems, activeIndex, handleSelect]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-20 px-4 md:pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-2xl bg-card/80 backdrop-blur-3xl border border-border shadow-2xl rounded-[2.5rem] overflow-hidden relative z-10"
          >
            {/* Search Input */}
            <div className="p-6 border-b border-border flex items-center gap-4">
              <Search className="text-primary animate-pulse" size={24} />
              <input
                autoFocus
                placeholder="Apa yang ingin Anda pelajari hari ini?"
                className="flex-1 bg-transparent border-none outline-none text-lg md:text-xl font-bold text-foreground placeholder:text-muted-foreground/40"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="hidden md:flex items-center gap-1 px-2 py-1 bg-muted border border-border rounded-lg text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <Command size={10} /> K
              </div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
              {filteredItems.length > 0 ? (
                <div className="space-y-6">
                  {/* Grouped results could be done here, but let's keep it simple for now */}
                  <div className="space-y-2">
                    {filteredItems.map((item, index) => (
                      <div
                        key={item.id}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => handleSelect(item.href)}
                        className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 relative group ${
                          index === activeIndex 
                            ? 'bg-primary/10 border border-primary/20 shadow-[0_0_20px_rgba(0,238,255,0.05)]' 
                            : 'hover:bg-muted/50 border border-transparent'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                          index === activeIndex ? 'bg-primary text-white dark:text-black shadow-lg scale-110' : 'bg-muted text-muted-foreground'
                        }`}>
                          <item.icon size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <h4 className={`font-black text-sm md:text-base uppercase tracking-wider ${index === activeIndex ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {item.title}
                            </h4>
                            <span className="text-[8px] font-bold text-primary/50 uppercase tracking-[0.2em]">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-[10px] md:text-xs text-muted-foreground font-medium truncate mt-1">
                            {item.description}
                          </p>
                        </div>
                        <ArrowRight size={18} className={`transition-all duration-300 ${index === activeIndex ? 'text-primary translate-x-0 opacity-100' : 'opacity-0 -translate-x-4'}`} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-6 border border-border/50">
                    <Search className="text-muted-foreground/20" size={32} />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-[0.2em] text-foreground mb-2">Tidak Menemukan Hasil</h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Coba gunakan kata kunci lain atau cari melalui navigasi utama.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><ArrowRight size={10} className="rotate-90" /> Navigasi</span>
                <span className="flex items-center gap-1.5"><Command size={10} className="rotate-90" /> Pilih</span>
              </div>
              <span className="opacity-50">NihongoRoute Search v1.0</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
