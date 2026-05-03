import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";

export function QuestHeader() {
  return (
    <header className="flex items-center justify-between mb-8 relative z-10">
      <div className="flex items-center gap-3">
        <Card className="w-10 h-10 rounded-xl bg-muted dark:bg-white/[0.04] border border-border dark:border-white/[0.08] flex items-center justify-center shadow-none shrink-0">
          <Target size={18} className="text-primary" />
        </Card>
        <div className="text-left">
          <h3 className="text-foreground font-black uppercase tracking-tight text-xs md:text-sm">
            Target Hari Ini
          </h3>
          <span className="block text-xs text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
            Yuk, kejar targetmu!
          </span>
        </div>
      </div>
      <Badge
        variant="ghost"
        className="bg-muted dark:bg-white/[0.03] border border-border dark:border-white/[0.08] text-muted-foreground px-3 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase shadow-none h-auto"
      >
        Reset 00:00
      </Badge>
    </header>
  );
}
