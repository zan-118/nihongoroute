"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, LogIn, ChevronRight, Sparkles, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        toast.success("Selamat Bergabung!", {
          description: "Akunmu sudah siap. Silakan masuk untuk mulai petualangan belajarmu!",
        });
        setIsRegistering(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        toast.success(`Selamat Datang Kembali, ${data.user?.user_metadata?.full_name ? data.user.user_metadata.full_name.split(' ')[0] : 'Siswa'}!`, {
          description: "Senang melihatmu kembali. Mari lanjut belajarnya!",
        });

        router.push("/");
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error("Gagal autentikasi email:", err);
      toast.error("Ada sedikit kendala...", {
        description: err.message || "Email atau kata sandi mungkin salah. Coba cek lagi ya!",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error("Gagal login dengan Google:", error);
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      
      toast.success("Mode Tamu Aktif", {
        description: "Kamu bisa belajar sekarang, tapi progresmu hanya tersimpan di perangkat ini.",
      });
      router.push("/");
    } catch (error) {
      console.error("Gagal login secara anonim:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] opacity-50 pointer-events-none" />
        <div className="w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] absolute -top-10 -right-10 opacity-30 pointer-events-none" />
      </div>

      <div className="w-full max-w-md bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 z-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
        <Link 
          href="/" 
          className="absolute -top-12 left-0 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-muted/50 border border-border flex items-center justify-center group-hover:border-primary/30 transition-all">
            <ChevronRight className="rotate-180" size={14} />
          </div>
          Kembali ke Beranda
        </Link>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-lg">
            <Sparkles className="text-primary" size={32} />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2 uppercase tracking-tight">
            {isRegistering ? "Yuk, bikin akun baru!" : "Siap lanjut belajar?"}
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed">
            {isRegistering 
              ? "Bikin akun yuk, biar semua progres belajarmu tersimpan rapi dan bisa diakses kapan aja." 
              : "Masuk ke akunmu, yuk! Kita lanjutin petualangan belajar yang seru ini."}
          </p>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
          <div className="space-y-2">
            {isRegistering && (
              <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="text" 
                  placeholder="Nama panggilannya siapa?" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={isRegistering}
                  className="w-full bg-muted border border-border rounded-xl py-3 pl-10 pr-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="email" 
                placeholder="Alamat emailmu" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-muted border border-border rounded-xl py-3 pl-10 pr-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="password" 
                placeholder="Kata sandi rahasia" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-muted border border-border rounded-xl py-3 pl-10 pr-4 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            {!isRegistering && (
              <div className="flex justify-end mt-1">
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Lupa kata sandi? Tenang, bisa kita bantu kok!
                </Link>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold uppercase tracking-widest text-xs md:text-xs transition-all disabled:opacity-50 shadow-lg border-none"
          >
            {loading ? "Sedang memproses..." : (isRegistering ? "Daftar Sekarang" : "Masuk Sekarang")}
          </button>
        </form>

        <div className="text-center mb-6">
          <button 
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
            }}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            {isRegistering 
              ? "Sudah punya akun? Masuk lewat sini aja" 
              : "Belum punya akun? Yuk, daftar dulu!"}
          </button>
        </div>

        <div className="relative py-4 mb-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-card px-4 text-xs md:text-xs font-bold text-muted-foreground uppercase tracking-widest">Atau pakai cara ini</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-foreground text-background hover:opacity-90 transition-all disabled:opacity-50 font-semibold text-sm"
          >
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Masuk dengan akun Google
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>

          <button
            type="button"
            onClick={handleAnonymousLogin}
            disabled={loading}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-muted hover:bg-muted/80 border border-border transition-colors text-foreground disabled:opacity-50 text-sm"
          >
            <div className="flex items-center gap-3">
              <User size={20} className="text-primary" />
              <div className="text-left">
                <div className="font-semibold">Coba Intip Dulu (Mode Tamu)</div>
              </div>
            </div>
            <LogIn size={16} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
