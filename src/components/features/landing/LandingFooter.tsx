import Image from "next/image";
import Link from "next/link";
import { Github, Instagram, MessageCircle } from "lucide-react";

const learningLinks = [
  { href: "/tools/kana", label: "Hiragana & Katakana" },
  { href: "/library/vocab", label: "Kosakata Utama" },
  { href: "/library/kanji", label: "Kamus Kanji" },
  { href: "/library/grammar", label: "Tata Bahasa" },
  { href: "/exams", label: "Simulasi JLPT" },
];

const featureLinks = [
  { href: "/review", label: "Flashcard SRS" },
  { href: "/dashboard", label: "Papan Kemajuan" },
  { href: "/tools", label: "Pusat Peralatan" },
  { href: "https://github.com/zan-118/nihongoroute", label: "Kontribusi GitHub", external: true },
];

const supportLinks = [
  { href: "/support", label: "Dukung Kami" },
  { href: "/privacy", label: "Kebijakan Privasi" },
  { href: "/terms", label: "Syarat & Ketentuan" },
];

const socialLinks = [
  { href: "https://www.instagram.com/nihongoroute", label: "Instagram", icon: Instagram },
  { href: "https://www.threads.com/nihongoroute", label: "Threads", icon: MessageCircle },
  { href: "https://github.com/zan-118/nihongoroute", label: "GitHub", icon: Github },
];

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

export function LandingFooter() {
  return (
    <footer className="mt-24 md:mt-28 pt-16 md:pt-20 border-t border-border/80 pb-14 relative z-10 w-full">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent pointer-events-none" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 mb-16">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="relative size-10 dark:drop-shadow-[0_0_15px_rgb(var(--primary-rgb)_/_0.25)]">
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
            Platform belajar bahasa Jepang bebas biaya yang dirancang agar rutinitas
            belajar terasa rapi, cepat, dan nyaman dipakai setiap hari.
          </p>

          <div className="flex items-center gap-3 pt-2">
            {socialLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`Kunjungi ${item.label} NihongoRoute`}
                className="size-11 rounded-xl premium-surface flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                <item.icon size={18} />
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
        <span suppressHydrationWarning>
          &copy; {new Date().getFullYear()} NihongoRoute. All Rights Reserved.
        </span>
        <span className="text-muted-foreground/70 font-semibold normal-case tracking-normal text-center sm:text-right">
          Dibuat untuk seluruh pembelajar bahasa Jepang di Indonesia.
        </span>
      </div>
    </footer>
  );
}
