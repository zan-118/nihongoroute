/**
 * @file ContactView.tsx
 * @description Feature view component for the Contact page with form layout and social links.
 */

import React from "react";
import Link from "next/link";
import { 
  Message, 
  Facebook,
  Github, 
  Instagram, 
  Threads, 
  Heart, 
  Question 
} from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ContactForm } from "./ContactForm";

const socialChannels = [
  {
    name: "Facebook",
    desc: "Halaman resmi & komunitas NihongoRoute",
    href: "https://www.facebook.com/nihongoroute/",
    icon: Facebook,
    label: "nihongoroute",
  },
  {
    name: "Instagram",
    desc: "Update fitur harian & materi singkat",
    href: "https://www.instagram.com/nihongoroute",
    icon: Instagram,
    label: "@nihongoroute",
  },
  {
    name: "Threads",
    desc: "Diskusi pejuang JLPT & pengumuman",
    href: "https://www.threads.com/nihongoroute",
    icon: Threads,
    label: "@nihongoroute",
  },
  {
    name: "GitHub Open Source",
    desc: "Kontribusi kode, isu teknis, & repositori",
    href: "https://github.com/zan-118/nihongoroute",
    icon: Github,
    label: "zan-118/nihongoroute",
  },
];

/**
 * ContactView component.
 * Renders the layout and interactive elements for the Contact feature page.
 */
export default function ContactView() {
  return (
    <div className="app-page min-h-screen py-10 md:py-16">
      <div className="app-container-narrow mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <Badge variant="outline" className="bg-card border-border text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2">
            <Message size={14} className="text-primary" />
            <span>Hubungi Kami</span>
          </Badge>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
            Kami Siap <span className="text-primary">Mendengar Suaramu</span>.
          </h1>

          <p className="text-muted-foreground text-base leading-relaxed">
            Punya ide fitur baru, menemukan kendala teknis, atau ingin berkolaborasi? Tuliskan pesanmu di bawah ini atau hubungi kanal resmi kami.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Interactive Form (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-6">
            <ContactForm />
          </div>

          {/* Quick Links & Information Sidebar (Cols 8-12) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                
                <span>Kanal Resmi Komunitas</span>
              </h2>

              {socialChannels.map((channel) => (
                <a
                  key={channel.name}
                  href={channel.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block group"
                >
                  <Card className="p-5 bg-card border border-border rounded-xl group-hover:border-primary/40 transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:scale-105 transition-transform">
                        <channel.icon size={20} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            {channel.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {channel.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {channel.desc}
                        </p>
                      </div>
                    </div>
                  </Card>
                </a>
              ))}
            </div>

            {/* Support & Donasi Card */}
            <Card className="p-6 bg-primary/10 border border-primary/20 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Heart size={18} />
                <span>Ingin Mendukung Server?</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Kamu bisa ikut mendukung kelangsungan server dan infrastruktur audio TTS NihongoRoute lewat Halaman Dukungan.
              </p>
              <Link
                href="/support"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline pt-1"
              >
                <Question size={14} />
                <span>Kunjungi Halaman Dukungan & FAQ</span>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
