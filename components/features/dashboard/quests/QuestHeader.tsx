import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";

export function QuestHeader() {
  return (
    <header className="flex items-center justify-between mb-8 md:mb-10 relative z-10">
      <div className="flex items-center gap-3 md:gap-4">
        <Card className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-cyber-neon/10 border-cyber-neon/20 flex items-center justify-center neo-inset shadow-none shrink-0">
          <Target size={20} className="text-cyber-neon md:w-6 md:h-6" />
        </Card>
        <div className="text-left">
          <h3 className="text-white font-black uppercase tracking-widest text-xs md:text-sm drop-shadow-md">
            Target Hari Ini
          </h3>
          <span className="block text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
            Yuk, kejar targetmu!
          </span>
        </div>
      </div>
      <Badge
        variant="outline"
        className="bg-[#121620] border-white/5 text-slate-500 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[9px] md:text-[10px] font-bold tracking-widest uppercase neo-inset h-auto"
      >
        Reset 00:00
      </Badge>
    </header>
  );
}
