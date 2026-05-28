"use client";

import { useAddToSRS } from "./useAddToSRS";
import { Star, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AddToSRSButtonProps {
  wordId: string;
  className?: string;
}

export function AddToSRSButton({ wordId, className }: AddToSRSButtonProps) {
  const { isLoaded, isAdded, handleAdd } = useAddToSRS(wordId);

  if (!isLoaded) {
    return (
      <Button
        variant="outline"
        size="icon"
        disabled
        className={cn(
          "h-10 w-10 rounded-xl bg-card/20 backdrop-blur-md border-border opacity-50",
          className
        )}
        aria-label="Memuat status SRS..."
      >
        <span className="size-4 animate-pulse bg-muted rounded-full" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={isAdded ? undefined : handleAdd}
      disabled={isAdded}
      className={cn(
        "h-10 w-10 rounded-xl transition-all duration-300 backdrop-blur-md",
        isAdded
          ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.35)] cursor-default"
          : "bg-card/40 border-border hover:border-primary/50 text-muted-foreground hover:text-primary hover:scale-105 active:scale-95 shadow-[0_0_10px_rgba(0,0,0,0.05)]",
        className
      )}
      aria-label={isAdded ? "Sudah ditambahkan ke SRS" : "Tambahkan ke SRS"}
      title={isAdded ? "Sudah ditambahkan ke SRS" : "Tambahkan ke SRS"}
    >
      {isAdded ? (
        <div className="relative flex items-center justify-center">
          <Star className="size-5 fill-primary text-primary filter drop-shadow-[0_0_2px_rgba(var(--primary-rgb),0.5)] animate-[scaleIn_0.3s_ease-out]" />
          <Check className="size-2.5 absolute text-background font-black stroke-[3]" />
        </div>
      ) : (
        <Star className="size-5 transition-transform duration-300 group-hover:scale-110" />
      )}
    </Button>
  );
}
