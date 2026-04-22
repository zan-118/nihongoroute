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
        // Mode Daftar
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
        // Mode Masuk
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        toast.success(`Okaeri, ${data.user?.user_metadata?.full_name ? data.user.user_metadata.full_name.split(' ')[0] : 'Siswa'}!`, {
          description: "Senang melihatmu kembali. Mari lanjut belajarnya!",
        });

        // Redirect setelah sukses
        router.push("/");
      }
    } catch (error: any) {
      console.error("Gagal autentikasi email:", error);
      toast.error("Ada sedikit kendala...", {
        description: error.message || "Email atau kata sandi mungkin salah. Coba cek lagi ya!",
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
      const { data, error } = await supabase.auth.signInAnonymously();
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] opacity-50 pointer-events-none" />
        <div className="w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[80px] absolute -top-10 -right-10 opacity-30 pointer-events-none" />
      </div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 z-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            <Sparkles className="text-blue-400" size={32} />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {isRegistering ? "Buat Akun Baru" : "Mulai Perjalananmu"}
          </h1>
          <p className="text-sm text-slate-400">
            {isRegistering 
              ? "Daftar dengan email untuk menyimpan progres belajarmu di cloud." 
              : "Masuk ke akun untuk melanjutkan belajarmu yang tersimpan."}
          </p>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
          <div className="space-y-2">
            {isRegistering && (
              <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Nama Lengkap" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={isRegistering}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                placeholder="Alamat Email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                placeholder="Kata Sandi" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            {!isRegistering && (
              <div className="flex justify-end mt-1">
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Lupa kata sandi?
                </Link>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          >
            {loading ? "Memproses..." : (isRegistering ? "Daftar Akun" : "Masuk")}
          </button>
        </form>

        <div className="text-center mb-6">
          <button 
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
            }}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {isRegistering 
              ? "Sudah punya akun? Masuk di sini" 
              : "Belum punya akun? Daftar di sini"}
          </button>
        </div>

        <div className="relative py-4 mb-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-slate-900 px-4 text-xs text-slate-500 uppercase tracking-widest">Opsi Lainnya</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-50 font-semibold text-sm"
          >
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Lanjutkan dengan Google
            </div>
            <ChevronRight size={16} className="text-slate-400" />
          </button>

          <button
            type="button"
            onClick={handleAnonymousLogin}
            disabled={loading}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors text-white disabled:opacity-50 text-sm"
          >
            <div className="flex items-center gap-3">
              <User size={20} className="text-slate-400" />
              <div className="text-left">
                <div className="font-semibold">Mulai Tanpa Akun</div>
              </div>
            </div>
            <LogIn size={16} className="text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
