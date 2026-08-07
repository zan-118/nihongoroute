"use client";

/**
 * @file ContactForm.tsx
 * @description Interactive contact & feedback submission form connected to Server Action submitContactFormAction.
 */

import React, { useState } from "react";
import { SendPlane, Check, Loader } from "@/components/ui/icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { submitContactFormAction } from "@/actions/contact.actions";
import { toast } from "sonner";

export function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "saran",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) return;

    setLoading(true);

    try {
      const res = await submitContactFormAction({
        name: formData.name,
        email: formData.email,
        category: formData.category,
        message: formData.message,
      });

      if (!res.success) {
        toast.error(res.error || "Gagal mengirim pesan. Coba lagi sebentar lagi.");
        return;
      }

      toast.success("Pesanmu berhasil terkirim! Terima kasih.");
      setSubmitted(true);
    } catch (err) {
      console.error("Error submitting contact form:", err);
      toast.error("Gagal mengirim pesan. Pastikan koneksi internet aktif!");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="p-8 md:p-10 bg-card border border-primary/30 rounded-2xl text-center space-y-4">
        <div className="size-16 bg-success/15 text-success rounded-full flex items-center justify-center mx-auto">
          <Check size={32} />
        </div>
        <h3 className="text-2xl font-bold text-foreground">Pesan Berhasil Terkirim!</h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
          Terima kasih atas masukan Anda. Pesan Anda telah tersimpan aman di database dan notifikasi pengembang telah terkirim otomatis.
        </p>
        <Button
          onClick={() => {
            setSubmitted(false);
            setFormData({ name: "", email: "", category: "saran", message: "" });
          }}
          variant="outline"
          className="rounded-full mt-4"
        >
          Kirim Pesan Lain
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 md:p-10 bg-card border border-border rounded-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="contact-name" className="text-xs font-bold uppercase tracking-wider text-foreground">
              Nama Lengkap
            </label>
            <input
              id="contact-name"
              type="text"
              required
              placeholder="Contoh: Budi Santoso"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="contact-email" className="text-xs font-bold uppercase tracking-wider text-foreground">
              Alamat Email
            </label>
            <input
              id="contact-email"
              type="email"
              required
              placeholder="nama@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="contact-category" className="text-xs font-bold uppercase tracking-wider text-foreground">
            Kategori Pesan
          </label>
          <select
            id="contact-category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="saran">💡 Masukan & Saran Fitur</option>
            <option value="bug">🐛 Laporan Bug / Kendala Teknis</option>
            <option value="pertanyaan">❓ Pertanyaan Seputar Aplikasi</option>
            <option value="kerjasama">🤝 Kerjasama / Kontribusi</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="contact-message" className="text-xs font-bold uppercase tracking-wider text-foreground">
            Isi Pesan
          </label>
          <textarea
            id="contact-message"
            required
            rows={5}
            placeholder="Tuliskan masukan, kendala, atau pertanyaan Anda di sini secara detail..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-y min-h-[120px]"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 rounded-full font-bold text-sm transition-all"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader size={16} className="animate-spin" />
              <span>Mengirim Pesan...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <SendPlane size={16} />
              <span>Kirim Pesan</span>
            </span>
          )}
        </Button>
      </form>
    </Card>
  );
}
