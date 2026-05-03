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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] opacity-50 pointer-events-none" />
        <div className="w-[300px] h-[300px] bg-orange-600/10 rounded-full blur-[80px] absolute -top-10 -right-10 opacity-30 pointer-events-none" />
      </div>

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 z-10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Kembali ke Login
        </Link>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
            <KeyRound className="text-red-400" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Lupa Kata Sandi? Tenang aja!
          </h1>
          <p className="text-sm text-slate-400">
            {emailSent 
              ? "Yess! Email buat ganti sandi udah dikirim. Tunggu bentar ya..." 
              : "Yuk, tulis email kamu di bawah, nanti kita kirim link buat bikin sandi baru."}
          </p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="email" 
              placeholder="Contoh: nama@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50 disabled:hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          >
            {loading ? "Lagi dikirim..." : "Kirim Link Pemulihan"}
          </button>
        </form>
      </div>
    </div>
  );
}
