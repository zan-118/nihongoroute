"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Save, Check, Edit2, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSRSStore } from "@/store/useSRSStore";

interface MnemonicEditorProps {
  wordId: string;
  className?: string;
  /** Compact mode: used in flashcard back, no label, smaller size */
  compact?: boolean;
}

/**
 * Komponen: MnemonicEditor
 * 
 * Antarmuka editor interaktif untuk membuat, memperbarui, atau menghapus "jembatan keledai" (mnemonik)
 * kustom milik pengguna untuk membantu mengingat kosakata bahasa Jepang.
 * Terintegrasi langsung dengan `useSRSStore` untuk pembaruan instan (luring-pertama) dan 
 * penanganan inisialisasi state aman menggunakan penundaan hidrasi peramban (isClient).
 * 
 * @param {Object} props - Properti komponen
 * @param {string} props.wordId - ID kosakata terkait yang ingin ditambahkan mnemonik kustom
 * @param {string} [props.className] - Kelas CSS opsional untuk kustomisasi gaya pembungkus
 * @param {boolean} [props.compact=false] - Jika true, render dalam mode minimal ringkas (tampilan kartu flashcard)
 */
export function MnemonicEditor({ wordId, className, compact = false }: MnemonicEditorProps) {
  const srs = useSRSStore((s) => s.srs);
  const updateCustomMnemonic = useSRSStore((s) => s.updateCustomMnemonic);

  const [isClient, setIsClient] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [draft, setDraft] = useState("");

  // Derived state from store (luring-pertama)
  const savedMnemonic = isClient ? (srs[wordId]?.customMnemonic ?? "") : "";

  useEffect(() => {
    requestAnimationFrame(() => setIsClient(true));
  }, []);

  // Sync draft when store updates or wordId changes
  useEffect(() => {
    if (isClient) {
      requestAnimationFrame(() => setDraft(srs[wordId]?.customMnemonic ?? ""));
    }
  }, [isClient, wordId, srs]);

  const handleSave = useCallback(() => {
    const trimmed = draft.trim();
    updateCustomMnemonic(wordId, trimmed);
    setIsEditing(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  }, [draft, wordId, updateCustomMnemonic]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape") {
        setDraft(savedMnemonic);
        setIsEditing(false);
      }
    },
    [handleSave, savedMnemonic]
  );

  if (!isClient) return null;

  if (compact) {
    // Compact mode: read-only display for flashcard back
    if (!savedMnemonic) return null;
    return (
      <div
        className={cn(
          "p-2.5 rounded-xl border border-primary/15 bg-primary/[0.04] text-left relative overflow-hidden",
          className
        )}
      >
        <span className="text-[7px] font-black uppercase tracking-widest text-primary/50 flex items-center gap-1 mb-0.5">
          <BrainCircuit size={8} aria-hidden="true" />
          Jembatan Keledai Saya
        </span>
        <p className="text-[9px] md:text-[11px] font-medium text-foreground/80 italic leading-tight line-clamp-2">
          &ldquo;{savedMnemonic}&rdquo;
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit size={14} aria-hidden="true" className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            Jembatan Keledai Saya
          </span>
        </div>
        {!isEditing && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
            aria-label="Edit jembatan keledai"
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
          >
            <Edit2 size={12} />
          </Button>
        )}
      </div>

      {/* Display or Editor */}
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="flex flex-col gap-2"
          >
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={3}
              maxLength={500}
              placeholder="Tulis cerita atau asosiasi unikmu untuk mengingat kata ini... (Ctrl+Enter untuk simpan)"
              aria-label="Tulis jembatan keledai kustom"
              className={cn(
                "w-full resize-none rounded-xl border bg-card/50 backdrop-blur-sm px-4 py-3",
                "text-sm text-foreground placeholder:text-muted-foreground/40 leading-relaxed",
                "border-primary/30 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20",
                "transition-all duration-200"
              )}
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground/50 font-mono">
                {draft.length}/500
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setDraft(savedMnemonic); setIsEditing(false); }}
                  className="h-7 px-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:text-foreground rounded-lg"
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={draft.trim() === savedMnemonic}
                  className={cn(
                    "h-7 px-4 text-[10px] font-black uppercase tracking-wider rounded-lg",
                    "bg-primary/90 hover:bg-primary text-primary-foreground",
                    "transition-all duration-200 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]",
                    "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                  )}
                >
                  <Save size={11} className="mr-1.5" aria-hidden="true" />
                  Simpan
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {savedMnemonic ? (
              <div
                className="group/mnemonic relative p-4 rounded-xl bg-primary/[0.04] border border-primary/15 cursor-pointer hover:border-primary/30 hover:bg-primary/[0.07] transition-all duration-200"
                onClick={() => setIsEditing(true)}
                role="button"
                tabIndex={0}
                aria-label="Klik untuk edit jembatan keledai"
                onKeyDown={(e) => e.key === "Enter" && setIsEditing(true)}
              >
                <p className="text-sm font-medium text-foreground/80 leading-relaxed italic">
                  &ldquo;{savedMnemonic}&rdquo;
                </p>
                <span className="absolute bottom-2 right-2 text-[9px] text-primary/30 font-black uppercase tracking-widest opacity-0 group-hover/mnemonic:opacity-100 transition-opacity">
                  Edit
                </span>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border border-dashed border-primary/20",
                  "hover:border-primary/40 hover:bg-primary/[0.04] transition-all duration-200",
                  "text-xs text-muted-foreground/50 italic font-medium",
                  "flex items-center gap-2"
                )}
                aria-label="Tambah jembatan keledai kustom"
              >
                <Lightbulb size={13} className="shrink-0 text-primary/30" aria-hidden="true" />
                Tambah jembatan keledai kustom untuk kata ini...
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved confirmation flash */}
      <AnimatePresence>
        {isSaved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex items-center gap-2 text-success text-[10px] font-black uppercase tracking-widest"
          >
            <Check size={12} aria-hidden="true" />
            Tersimpan secara lokal &amp; akan disinkronkan
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
