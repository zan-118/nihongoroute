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
      
    } catch (error: any) {
      console.error("Gagal memperbarui kata sandi:", error);
      toast.error("Gagal Memperbarui", {
        description: error.message || "Terjadi kesalahan saat memperbarui kata sandi.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] opacity-50 pointer-events-none" />
        <div className="w-[300px] h-[300px] bg-teal-600/10 rounded-full blur-[80px] absolute -top-10 -right-10 opacity-30 pointer-events-none" />
      </div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 z-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            {isSuccess ? <CheckCircle className="text-emerald-400" size={32} /> : <KeyRound className="text-emerald-400" size={32} />}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Perbarui Kata Sandi
          </h1>
          <p className="text-sm text-slate-400">
            {isSuccess 
              ? "Yess! Kata sandimu udah diganti. Tunggu sebentar ya..." 
              : "Yuk, ketik kata sandi barumu di bawah ini."}
          </p>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                placeholder="Kata sandi baru" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                placeholder="Konfirmasi kata sandi baru" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
            >
              {loading ? "Lagi disimpan..." : "Aktifkan Sandi Baru"}
            </button>
          </form>
        ) : (
          <Link
            href="/"
            className="block text-center w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors border border-slate-700"
          >
            Lanjutkan ke Dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
