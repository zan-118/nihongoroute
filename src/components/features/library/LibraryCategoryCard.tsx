import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

interface LibraryCategoryCardProps {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  label: string;
  index: number;
}

/**
 * Komponen kartu kategori untuk halaman pustaka.
 * Dioptimalkan tanpa JavaScript animation (Framer Motion) untuk performa ekstrem.
 */
export function LibraryCategoryCard({
  href,
  title,
  desc,
  icon,
  label,
  index,
}: LibraryCategoryCardProps) {
  return (
    <Link href={href} className="group flex h-full">
      <div className="w-full h-full transform hover:-translate-y-1 transition-all duration-300">
        <Card className="h-full p-6 md:p-8 rounded-[2rem] border border-border bg-[rgba(var(--card-rgb),0.6)] backdrop-blur-sm hover:border-[rgba(var(--primary-rgb),0.4)] hover:bg-[rgba(var(--primary-rgb),0.03)] transition-all duration-300 flex flex-col group shadow-xl relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[rgba(var(--primary-rgb),0.05)] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-[rgba(var(--primary-rgb),0.1)] transition-all duration-300" />
          
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-background border border-border rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-none transition-all duration-500 text-primary shadow-inner">
              {icon}
            </div>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">0{index + 1}</span>
          </div>

          <div className="flex-1 space-y-3 relative z-10">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] block opacity-70 group-hover:opacity-100 transition-opacity">
              {label}
            </span>
            <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight group-hover:text-primary transition-colors duration-300 leading-tight">
              {title}
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed font-medium group-hover:text-foreground/80 transition-colors line-clamp-3">
              {desc}
            </p>
          </div>

          <div className="mt-10 pt-6 border-t border-border/50 flex items-center justify-between relative z-10">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] group-hover:text-primary transition-colors">Akses Modul</span>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-background border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-none transition-all duration-500 shadow-sm">
               <ArrowRight size={16} />
            </div>
          </div>
        </Card>
      </div>
    </Link>
  );
}
