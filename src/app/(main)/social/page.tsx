import { Metadata } from "next";
import LeaderboardClient from "./LeaderboardClient";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

/**
 * @file page.tsx (Social)
 * @description Halaman Hub Sosial NihongoRoute.
 * Fokus utama saat ini adalah Global Leaderboard untuk memacu kompetisi antar siswa.
 */

export const metadata: Metadata = {
  title: "Sosial & Papan Peringkat | NihongoRoute",
  description: "Lihat siapa yang berada di posisi teratas dan bandingkan kemajuan belajarmu dengan siswa lain di seluruh dunia.",
};

export default function SocialPage() {
  return (
    <main className="min-h-screen bg-background pt-12 px-4 sm:px-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20 shadow-lg">
            <Users className="text-primary" size={32} />
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black text-foreground uppercase tracking-tighter italic mb-4">
            Global <span className="text-primary">League</span>
          </h1>
          
          <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Tunjukkan semangat belajarmu! Papan peringkat diperbarui secara real-time berdasarkan total XP yang kamu kumpulkan.
          </p>
          
          <div className="flex gap-3 mt-8">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full">
              Live Ranking
            </Badge>
            <Badge variant="outline" className="text-muted-foreground border-border px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full">
              Updated Just Now
            </Badge>
          </div>
        </div>

        {/* CONTENT SECTION */}
        <LeaderboardClient />
        
      </div>
    </main>
  );
}
