"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { client } from "@/sanity/lib/client";

import { Loader2, Info } from "lucide-react";
import { useSRSStore } from "@/store/useSRSStore";

interface KanjiItem {
  _id: string;
  kanji: string;
  meaning: string;
}

export default function KanjiProgressGrid() {
  const [kanjis, setKanjis] = useState<KanjiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const srs = useSRSStore(s => s.srs);

  useEffect(() => {
    const fetchKanjis = async () => {
      try {
        const query = `*[_type == "kanji" && (level->code == "N5" || level == "N5")] | order(_id asc) {
          _id,
          kanji,
          meaning
        }`;
        const data = await client.fetch(query);
        setKanjis(data);
      } catch (err) {
        console.error("Gagal memuat kanji:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchKanjis();
  }, []);

  if (loading) {
    return (
      <Card className="p-8 flex items-center justify-center bg-card/50 border-border">
        <Loader2 className="animate-spin text-primary" size={24} />
      </Card>
    );
  }

  const masteredCount = kanjis.filter(k => (srs?.[k._id]?.interval || 0) > 21).length;
  const learningCount = kanjis.filter(k => srs?.[k._id] && srs[k._id].interval <= 21).length;

  return (
    <Card className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-lg overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-2 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Peta Penguasaan Kanji N5
          </h2>
          <p className="text-sm font-black text-foreground uppercase tracking-tight">
            {masteredCount} <span className="text-muted-foreground font-medium text-xs">Dikuasai</span> / {kanjis.length} <span className="text-muted-foreground font-medium text-xs">Total</span>
          </p>
        </div>
        
        <div className="flex gap-3">
          <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary text-[8px] font-bold uppercase tracking-widest px-3">
            {learningCount} Belajar
          </Badge>
          <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500 text-[8px] font-bold uppercase tracking-widest px-3">
            {masteredCount} Mahir
          </Badge>
        </div>
      </div>

        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
          {kanjis.map((item, idx) => {
            const status = srs?.[item._id];
            const isMastered = (status?.interval || 0) > 21;
            const isLearning = status && !isMastered;

            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.01 }}
                title={`${item.kanji}: ${item.meaning} (${isMastered ? "Mahir" : isLearning ? "Latihan" : "Belum"})`}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-lg font-japanese font-bold transition-all duration-300 border cursor-default
                  ${isMastered 
                    ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                    : isLearning 
                    ? 'bg-primary/20 border-primary/40 text-primary shadow-[0_0_10px_rgba(0,238,255,0.1)]' 
                    : 'bg-muted/50 border-border/50 text-muted-foreground/30 hover:border-muted-foreground/50'}
                `}
              >
                {item.kanji}
              </motion.div>
            );
          })}
        </div>

      <div className="mt-8 flex items-center gap-2 text-muted-foreground">
        <Info size={12} />
        <p className="text-xs font-bold uppercase tracking-widest">
          Tip: Pelajari kanji baru di menu kursus untuk mengisi peta ini.
        </p>
      </div>
    </Card>
  );
}
