/**
 * @file page.tsx
 * @description Social Hub page route component for NihongoRoute. Features Global Leaderboard and community interaction.
 */


// Import & Dependencies

import { Metadata } from "next";
import SocialView from "@/features/social/SocialView";
import { Badge } from "@/components/ui/badge";
import { Team } from "@/components/ui/icons";
import { createPageMetadata } from "@/lib/seo";

import { ROUTES } from "@/lib/core/routes";
/**
 * Metadata configuration for Social page.
 * Disables search engine indexing for social hub.
 */
export const metadata: Metadata = {
 ...createPageMetadata({
 title: "Sosial & Komunitas | NihongoRoute",
 description: "Berdiskusi, bertanya, dan bersaing secara sehat dengan pembelajar bahasa Jepang lainnya di seluruh dunia.",
 path:ROUTES.SOCIAL,
 noIndex: true,
 }),
};

/**
 * SocialPage component.
 * Renders main layout, header, and client-side social hub interface.
 * 
 * @returns Social page layout.
 */
export default function SocialPage() {
 return (
 <main className="min-h-screen bg-transparent pt-12 px-4 sm:px-6 transition-colors duration-300">
 <div className="max-w-7xl mx-auto">
 
 {/* HEADER SECTION */}
 {/* Renders page icon, title, description, and status badges */}
 <div className="flex flex-col items-center text-center mb-10">
 <div className="size-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6 border border-primary/20 shadow-lg">
 <Team className="text-primary" size={32} />
 </div>
 
 <h1 className="text-4xl sm:text-6xl text-foreground uppercase tracking-tighter italic mb-4">
 Nihongo <span className="text-primary">Hub</span>
 </h1>
 
 <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
 Berdiskusi, bertanya, dan bersaing secara sehat dengan pembelajar bahasa Jepang lainnya di seluruh dunia.
 </p>
 
 <div className="flex gap-3 mt-6">
 <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full">
 Live Feed
 </Badge>
 <Badge variant="outline" className="text-muted-foreground border-border px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full">
 Global League
 </Badge>
 </div>
 </div>

 {/* CONTENT SECTION (TABBED CLIENT VIEW) */}
 {/* Client component handles tab switching and dynamic data fetching */}
 <SocialView />
 
 </div>
 </main>
 );
}