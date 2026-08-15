/**
 * @file LandingFooter.tsx
 * @description Landing page footer component with quick navigation links, branding, and social connections.
 */

import Image from "next/image";
import Link from "next/link";
import { Facebook, Github, Instagram, Threads } from "@/components/ui/icons";

import { ROUTES } from "@/lib/core/routes";
/**
 * Navigation links for learning resources.
 */
const learningLinks = [
 { href:ROUTES.TOOLS.KANA, label: "Hiragana & Katakana" },
 { href: "/library/vocab", label: "Kosakata Utama" },
 { href: "/library/kanji", label: "Kamus Kanji" },
 { href: "/library/grammar", label: "Tata Bahasa" },
 { href: "/exams", label: "Simulasi JLPT" },
];

/**
 * Navigation links for core platform features.
 */
const featureLinks = [
 { href:ROUTES.REVIEW, label: "Flashcard SRS" },
 { href: "/dashboard", label: "Papan Kemajuan" },
 { href:ROUTES.TOOLS.ROOT, label: "Pusat Peralatan" },
 { href: "https://github.com/zan-118/nihongoroute", label: "Kontribusi GitHub", external: true },
];

/**
 * Navigation links for support and legal pages.
 */
const supportLinks = [
 { href: "/about", label: "Tentang Kami" },
 { href: "/contact", label: "Hubungi Kami" },
 { href: "/support", label: "Dukung Kami" },
 { href: "/privacy", label: "Kebijakan Privasi" },
 { href: "/terms", label: "Syarat & Ketentuan" },
];

/**
 * Social media links with icons.
 */
const socialLinks = [
 { href: "https://www.facebook.com/nihongoroute/", label: "Facebook", icon: Facebook },
 { href: "https://www.instagram.com/nihongoroute", label: "Instagram", icon: Instagram },
 { href: "https://www.threads.com/nihongoroute", label: "Threads", icon: Threads },
 { href: "https://github.com/zan-118/nihongoroute", label: "GitHub", icon: Github },
];

/**
 * @description Render single column of footer links.
 * @param props - Component props.
 * @param props.title - Column header text.
 * @param props.links - Array of link objects.
 */
function FooterColumn({
 title,
 links,
}: {
 title: string;
 links: Array<{ href: string; label: string; external?: boolean }>;
}) {
 return (
 <div className="flex flex-col gap-5">
 <span className="text-xs font-black uppercase tracking-[0.18em] text-foreground">
 {title}
 </span>
 <div className="flex flex-col gap-2 text-xs font-semibold text-muted-foreground">
 {links.map((link) =>
 link.external ? (
 <a
 key={link.href}
 href={link.href}
 target="_blank"
 rel="noreferrer"
 className="inline-flex min-h-8 items-center hover:text-primary transition-colors"
 >
 {link.label}
 </a>
 ) : (
 <Link
 key={link.href}
 href={link.href}
 className="inline-flex min-h-8 items-center hover:text-primary transition-colors"
 >
 {link.label}
 </Link>
 )
 )}
 </div>
 </div>
 );
}

/**
 * @description Main footer component for landing page.
 */
export function LandingFooter() {
 return (
 <footer className="mt-24 md:mt-28 border-t border-border/80 pb-14 relative z-10 w-full content-auto">
 {/* Decorative top border gradient */}
 <div className="absolute inset-x-0 top-0 h-px pointer-events-none" />

 <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 md:pt-20">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 mb-16">
 <div className="lg:col-span-4 flex flex-col gap-6">
 <div className="flex items-center gap-3">
 <div className="relative size-14 dark:drop-shadow-[0_0_15px_hsl(var(--primary)_/_0.25)]">
 <Image
 src="/logo-branding.svg"
 alt="NihongoRoute Logo"
 fill
 className="object-contain"
 />
 </div>
 <div className="flex flex-col">
 <span className="text-foreground text-xl font-black tracking-tight">
 Nihongo<span className="text-primary">Route</span>
 </span>
 <span className="text-[8px] text-muted-foreground font-extrabold uppercase tracking-widest">
 Platform Belajar Modern
 </span>
 </div>
 </div>

 <p className="text-muted-foreground text-xs font-semibold leading-relaxed max-w-sm">
 Platform belajar bahasa Jepang gratis yang bikin rutinitas
 belajarmu rapi, cepat, dan nyaman setiap hari.
 </p>

 <div className="flex items-center gap-3 pt-2">
 {socialLinks.map((item) => (
 <a
 key={item.href}
 href={item.href}
 target="_blank"
 rel="noreferrer"
 aria-label={`Kunjungi ${item.label} NihongoRoute`}
 className="size-11 rounded-xl bg-card border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary/40 transition-all duration-300 hover:-translate-y-0.5"
 >
 <item.icon size={20} />
 </a>
 ))}
 </div>
 </div>

 <div className="lg:col-span-2 lg:col-start-6">
 <FooterColumn title="Belajar" links={learningLinks} />
 </div>
 <div className="lg:col-span-2">
 <FooterColumn title="Fitur Utama" links={featureLinks} />
 </div>
 <div className="lg:col-span-2">
 <FooterColumn title="Dukungan & Legal" links={supportLinks} />
 </div>
 </div>

 <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
 {/* Prevent SSR mismatch on dynamic year */}
 <span suppressHydrationWarning>
 &copy; {new Date().getFullYear()} NihongoRoute. Hak cipta dilindungi.
 </span>
 <span className="text-muted-foreground/70 font-semibold normal-case tracking-normal text-center sm:text-right">
 Dibuat untuk semua pejuang bahasa Jepang di Indonesia.
 </span>
 </div>
 </div>
 </footer>
 );
}