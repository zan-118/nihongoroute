"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const supabase = createClient();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) throw error;
      
      setEmailSent(true);
      toast.success("Email Pemulihan Meluncur!", {
        description: "Silakan cek kotak masuk (atau spam) email Anda untuk mengatur ulang kata sandi.",
      });
    } catch (error: unknown) {
      console.error("Gagal mengirim email pemulihan:", error);
      const message = error instanceof Error ? error.message : "Terjadi kesalahan tidak dikenal";
      toast.error("Ups, pengiriman gagal...", {
        description: message || "Pastikan alamat email yang Anda masukkan sudah benar dan terdaftar.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Decor & Neural Grid */}
      <div className="neural-grid" />
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] bg-destructive/10 rounded-full blur-[120px] opacity-40 absolute -top-12 -left-12" />
        <div className="w-[400px] h-[400px] bg-warning/10 rounded-full blur-[100px] opacity-35 absolute -bottom-10 -right-10" />
      </div>

      <div className="w-full max-w-md bg-card/85 backdrop-blur-xl border border-border/80 rounded-[2rem] p-8 z-10 shadow-[0_15px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_rgba(var(--destructive-rgb),0.1)] transition-all duration-500 relative glass">
        {/* Decorative corner glows */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-destructive/10 to-transparent blur-md rounded-tr-[2rem] pointer-events-none" />

        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-all group mb-8"
        >
          <div className="w-8 h-8 rounded-full bg-muted/60 border border-border flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all">
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          </div>
          Login
        </Link>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-destructive/20 shadow-[0_0_20px_rgba(var(--destructive-rgb),0.15)] animate-pulse">
            <KeyRound className="text-destructive" size={32} />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2 uppercase tracking-tight font-japanese">
            Lupa Kata Sandi?
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed">
            {emailSent 
              ? "Yess! Email buat ganti sandi udah dikirim. Tunggu bentar ya..." 
              : "Yuk, tulis email kamu di bawah, nanti kita kirim link buat bikin sandi baru."}
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="email" 
              placeholder="Contoh: nama@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-muted/50 border border-border/80 rounded-xl py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-destructive focus:ring-1 focus:ring-destructive/40 focus:shadow-[0_0_15px_rgba(var(--destructive-rgb),0.1)] transition-all duration-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3.5 px-4 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(var(--destructive-rgb),0.15)] hover:shadow-[0_0_25px_rgba(var(--destructive-rgb),0.3)] active:scale-[0.98] duration-300"
          >
            {loading ? "Lagi dikirim..." : "Kirim Link Pemulihan"}
          </button>
        </form>
      </div>
    </div>
  );
}
