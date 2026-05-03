"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Zap, Info } from "lucide-react";
import { useProgressStore } from "@/store/useProgressStore";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";

export default function StreakFreezeCard() {
  const { xp, freezeCount, buyFreeze } = useProgressStore(
    useShallow((state) => ({ 
      xp: state.progress.xp, 
      freezeCount: state.progress.inventory?.streakFreeze || 0,
      buyFreeze: state.buyStreakFreeze 
    }))
  );

  const COST = 500;

  const handleBuy = () => {
    if (xp < COST) {
      toast.error("XP Tidak Cukup", {
        description: `Kamu butuh ${COST - xp} XP lagi untuk membeli ini.`
      });
      return;
    }
    
    if (buyFreeze()) {
      toast.success("Streak Terlindungi!", {
        description: "1 Pelindung Streak telah ditambahkan ke kantongmu."
      });
    }
  };

  return (
    <Card className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 shadow-lg relative overflow-hidden group h-full flex flex-col justify-between">
      <div className="absolute -top-4 -right-4 text-indigo-500/10 rotate-12 group-hover:scale-125 transition-transform duration-700">
        <ShieldCheck size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-500">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-0.5">Peningkatan</h4>
            <h3 className="text-sm font-black text-foreground uppercase tracking-tight">Pelindung Streak</h3>
          </div>
        </div>
        
        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed mb-6">
          Lindungi streak harianmu jika lupa belajar selama 1 hari. Sangat berguna untuk pejuang streak!
        </p>

        <div className="flex items-center justify-between mb-4">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Milikmu:</span>
          <span className="text-xl font-black text-indigo-500">{freezeCount}</span>
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-3">
        <Button 
          onClick={handleBuy}
          disabled={xp < COST}
          className={`w-full h-10 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border-none ${
            xp >= COST 
              ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          Beli dengan {COST} XP <Zap size={14} className="ml-2" />
        </Button>
        
        <div className="flex items-center gap-1.5 justify-center opacity-40">
          <Info size={10} className="text-muted-foreground" />
          <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Otomatis Terpakai</span>
        </div>
      </div>
    </Card>
  );
}
