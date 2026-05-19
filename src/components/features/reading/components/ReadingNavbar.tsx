"use client";

import { motion } from "framer-motion";
import { ChevronLeft, Maximize2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReadingNavbarProps {
  title: string;
  difficulty: string;
  mode: string;
  modes: any[];
  onModeChange: (id: string) => void;
  onZenModeToggle: () => void;
}

export function ReadingNavbar({
  title,
  difficulty,
  mode,
  modes,
  onModeChange,
  onZenModeToggle,
}: ReadingNavbarProps) {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="fixed top-0 inset-x-0 h-20 z-50 border-b border-border/40 glass flex items-center px-6 justify-between"
    >
      <div className="flex items-center gap-6">
        <Link
          href="/library"
          className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-all"
        >
          <div className="p-2 rounded-xl bg-muted/30 group-hover:bg-primary/10 border border-border group-hover:border-primary/30 transition-all">
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden md:block">Pustaka</span>
        </Link>
        <div className="h-6 w-px bg-border mx-2 hidden md:block" />
        <div className="flex flex-col">
          <h2 className="text-sm font-black text-foreground truncate max-w-[200px] md:max-w-[400px]">
            {title}
          </h2>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Level {difficulty}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
          onClick={onZenModeToggle}
          aria-label="Mode Zen"
        >
          <Maximize2 size={20} />
        </Button>
        <div className="h-6 w-px bg-border mx-1" />
        <div className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-muted/30 border border-border">
          {modes.map((m) => (
            <Button
              key={m.id}
              variant={mode === m.id ? "default" : "ghost"}
              size="sm"
              onClick={() => onModeChange(m.id)}
              className={cn(
                "rounded-lg px-3 py-1.5 h-auto text-[10px] font-black uppercase tracking-wider",
                mode === m.id && "shadow-lg shadow-primary/20"
              )}
            >
              <m.icon size={14} className="mr-2" />
              {m.label}
            </Button>
          ))}
        </div>
      </div>
    </motion.nav>
  );
}
