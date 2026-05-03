"use client";

import { motion } from "framer-motion";
import { Coffee, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export default function EmptyState({
  icon: Icon = Coffee,
  title,
  description,
  actionText,
  actionHref,
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center bg-card/50 border border-border/50 rounded-[3rem] backdrop-blur-sm"
    >
      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-8 shadow-inner border border-primary/20">
        <Icon size={48} className="animate-bounce" />
      </div>
      
      <h3 className="text-xl md:text-3xl font-black text-foreground uppercase tracking-tight mb-3">
        {title}
      </h3>
      <p className="text-muted-foreground/80 text-sm md:text-base font-medium max-w-[280px] md:max-w-sm mb-10 leading-relaxed">
        {description}
      </p>

      {actionText && actionHref && (
        <Button asChild className="h-14 px-10 bg-primary hover:bg-foreground text-primary-foreground font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all">
          <Link href={actionHref}>{actionText}</Link>
        </Button>
      )}
    </motion.div>
  );
}
