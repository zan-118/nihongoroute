"use client";

/**
 * @file StreakFreezeCard.tsx
 * @description Komponen visual kartu pembekuan beruntun (Streak Freeze Card).
 * Menampilkan kuantitas pelindung streak milik pengguna, opsi pembelian menggunakan XP, 
 * serta melakukan sinkronisasi transaksi langsung ke Zustand store (`useUserStore`).
 */

// ======================
// IMPOR
// ======================
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Zap, Info } from "@/components/ui/icons";
import { toast } from "sonner";
import { useUserStore, STREAK_FREEZE_COST } from "@/store/useUserStore";

// ======================
// EKSEKUSI UTAMA
// ======================

/**
 * StreakFreezeCard component.
 * Renders user streak freeze inventory, cost, and purchase button.
 * Syncs with Zustand user store.
 */
export default function StreakFreezeCard() {
  // Get current user XP
  const xp = useUserStore(s => s.xp);
  // Get current streak freeze count from inventory
  const freezeCount = useUserStore(s => s.inventory.streakFreeze || 0);
  // Get purchase action from store
  const buyStreakFreeze = useUserStore(s => s.buyStreakFreeze);

  /**
   * Handles streak freeze purchase.
   * Validates XP balance before executing transaction.
   */
  const handleBuy = () => {
    // Block purchase if XP insufficient
    if (xp < STREAK_FREEZE_COST) {
      toast.error("XP Tidak Cukup", {
        description: `Kamu butuh ${STREAK_FREEZE_COST - xp} XP lagi untuk membeli ini.`
      });
      return;
    }
    
    // Execute purchase and notify user
    if (buyStreakFreeze()) {
      toast.success("Streak Terlindungi!", {
        description: "1 Pelindung Streak telah ditambahkan ke kantongmu."
      });
    }
  };

  return (
    <Card className="p-6 rounded-lg bg-secondary/5 border border-secondary/20 shadow-lg relative overflow-hidden group h-full flex flex-col justify-between">
      {/* Background decorative icon */}
      <div className="absolute -top-4 -right-4 text-secondary/10 rotate-12 group-hover:scale-125 transition-transform duration-700">
        <ShieldCheck size={120} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="text-xs text-secondary uppercase tracking-widest mb-0.5">Peningkatan</h4>
            <h3 className="text-sm text-foreground uppercase tracking-tight">Pelindung Streak</h3>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-6">
          Lindungi streak harianmu jika lupa belajar selama 1 hari. Sangat berguna untuk pejuang streak!
        </p>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Milikmu:</span>
          <span className="text-xl font-black text-secondary">{freezeCount}</span>
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-3">
        {/* Purchase button. Disabled if user cannot afford cost. */}
        <Button 
          onClick={handleBuy}
          disabled={xp < STREAK_FREEZE_COST}
          className={`w-full h-10 text-xs font-black uppercase tracking-widest rounded-xl transition-all border-none ${
            xp >= STREAK_FREEZE_COST 
              ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg shadow-secondary/20' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          Beli dengan {STREAK_FREEZE_COST} XP <Zap size={14} className="ml-2" />
        </Button>
        
        <div className="flex items-center gap-1.5 justify-center opacity-40">
          <Info size={10} className="text-muted-foreground" />
          <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Otomatis Terpakai</span>
        </div>
      </div>
    </Card>
  );
}