import { Search, Grid3X3, LayoutList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";

interface KanjiHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  levelFilter: string | null;
  onLevelFilterChange: (level: string | null) => void;
}

export function KanjiHeader({
  search,
  onSearchChange,
  levelFilter,
  onLevelFilterChange,
}: KanjiHeaderProps) {
  const levels = ["N5", "N4", "N3", "N2", "N1"];
  const layoutPreference = useUIStore((s) => s.settings.layoutPreference) ?? "grid";
  const setLayoutPreference = useUIStore((s) => s.setLayoutPreference);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tight text-foreground mb-4">
          Pustaka <span className="text-primary">Kanji</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Pelajari struktur dan cara penulisan kanji standar JLPT. Gunakan filter level untuk memfokuskan target pembelajaran Anda.
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 xl:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" aria-hidden="true" />
          <Input 
            placeholder="Cari kanji, arti, atau cara baca..." 
            className="pl-12 h-14 bg-card/40 backdrop-blur-xl border border-border rounded-2xl text-lg shadow-2xl focus:ring-primary/20"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            {levels.map(lvl => (
              <Button
                key={lvl}
                variant={levelFilter === lvl ? "default" : "outline"}
                className={`h-14 px-6 rounded-2xl font-bold transition-all duration-300 ${
                  levelFilter === lvl 
                    ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]" 
                    : "bg-card/40 border border-border hover:bg-muted"
                }`}
                onClick={() => onLevelFilterChange(levelFilter === lvl ? null : lvl)}
              >
                {lvl}
              </Button>
            ))}
          </div>

          <div className="flex p-1 bg-card/40 backdrop-blur-xl rounded-2xl border border-border h-14 items-center gap-1 px-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setLayoutPreference("grid")}
              className={`p-2 h-10 w-10 rounded-xl transition-all ${
                layoutPreference === "grid"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Tampilan Grid"
            >
              <Grid3X3 size={16} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setLayoutPreference("list")}
              className={`p-2 h-10 w-10 rounded-xl transition-all ${
                layoutPreference === "list"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Tampilan Tabel Ringkas"
            >
              <LayoutList size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
