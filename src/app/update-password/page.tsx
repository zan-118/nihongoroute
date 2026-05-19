"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Lock, KeyRound, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Memeriksa apakah user benar-benar masuk dengan status pemulihan
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Sesi Berakhir", {
          description: "Tautan ini sudah tidak berlaku. Silakan minta tautan pemulihan yang baru ya.",
        });
      }
    };
    checkSession();
  }, [supabase.auth]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Wah, passwordnya beda...", {
        description: "Pastikan kedua kolom kata sandi terisi dengan karakter yang sama persis.",
      });
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password terlalu singkat", {
        description: "Gunakan minimal 6 karakter agar akunmu tetap aman.",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) throw error;
      
      setIsSuccess(true);
      toast.success("Berhasil Diperbarui!", {
        description: "Kata sandi barumu sudah aktif. Yuk, lanjut belajar lagi!",
      });
      
      // Redirect setelah 3 detik
      setTimeout(() => {
        router.push("/");
      }, 3000);
      
    } catch (error: unknown) {
      console.error("Gagal memperbarui kata sandi:", error);
      const message = error instanceof Error ? error.message : "Terjadi kesalahan tidak dikenal";
      toast.error("Gagal Memperbarui", {
        description: message || "Terjadi kesalahan saat memperbarui kata sandi.",
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
        <div className="w-[500px] h-[500px] bg-success/10 rounded-full blur-[120px] opacity-40 absolute -top-12 -left-12" />
        <div className="w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] opacity-35 absolute -bottom-10 -right-10" />
      </div>

      <div className="w-full max-w-md bg-card/85 backdrop-blur-xl border border-border/80 rounded-[2rem] p-8 z-10 shadow-[0_15px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_rgba(var(--success-rgb),0.1)] transition-all duration-500 relative glass">
        {/* Decorative corner glows */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-success/10 to-transparent blur-md rounded-tr-[2rem] pointer-events-none" />

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-success/20 shadow-[0_0_20px_rgba(var(--success-rgb),0.15)]">
            {isSuccess ? <CheckCircle className="text-success animate-bounce" size={32} /> : <KeyRound className="text-success animate-pulse" size={32} />}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2 uppercase tracking-tight font-japanese">
            Perbarui Kata Sandi
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium leading-relaxed">
            {isSuccess 
              ? "Yess! Kata sandimu udah diganti. Tunggu sebentar ya..." 
              : "Yuk, ketik kata sandi barumu di bawah ini."}
          </p>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-3">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="password" 
                  placeholder="Kata sandi baru" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-muted/50 border border-border/80 rounded-xl py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-success focus:ring-1 focus:ring-success/40 focus:shadow-[0_0_15px_rgba(var(--success-rgb),0.1)] transition-all duration-300"
                />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="password" 
                  placeholder="Konfirmasi kata sandi baru" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-muted/50 border border-border/80 rounded-xl py-3 pl-10 pr-4 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-success focus:ring-1 focus:ring-success/40 focus:shadow-[0_0_15px_rgba(var(--success-rgb),0.1)] transition-all duration-300"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-success hover:bg-success/90 text-success-foreground rounded-xl font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(var(--success-rgb),0.15)] hover:shadow-[0_0_25px_rgba(var(--success-rgb),0.3)] active:scale-[0.98] duration-300"
            >
              {loading ? "Lagi disimpan..." : "Aktifkan Sandi Baru"}
            </button>
          </form>
        ) : (
          <Link
            href="/"
            className="block text-center w-full py-3.5 px-4 bg-muted/60 hover:bg-muted/80 text-foreground border border-border/80 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors duration-300 active:scale-[0.98]"
          >
            Lanjutkan ke Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
