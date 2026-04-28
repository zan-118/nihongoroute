"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquarePlus, Send, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function FeedbackWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"bug" | "suggestion" | "compliment">("suggestion");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Menyembunyikan tombol di halaman yang membutuhkan fokus penuh
  if (
    pathname === "/support" ||
    pathname?.startsWith("/studio") ||
    pathname?.includes("/exam") ||
    pathname === "/review"
  ) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      // Mendapatkan session user saat ini (opsional)
      const { data: { session } } = await supabase.auth.getSession();

      const { error } = await supabase
        .from('user_feedback')
        .insert([
          { 
            user_id: session?.user?.id || null, // null jika user belum login
            type, 
            message, 
            route: pathname 
          }
        ]);

      if (error) throw error;

      toast.success("Feedback berhasil dikirim. Terima kasih!");
      setIsOpen(false);
      setMessage("");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengirim feedback. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ y: -5 }}
        // Ditempatkan di atas FloatingSupport
        className="fixed bottom-52 right-4 md:bottom-32 md:right-10 z-[40]"
      >
        <div className="relative group block">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-10 group-hover:opacity-30 animate-pulse transition-opacity" />
          
          <Button
            onClick={() => setIsOpen(true)}
            variant="ghost"
            size="icon"
            className="relative w-12 h-12 md:w-14 md:h-14 bg-cyber-surface border border-white/10 rounded-full flex items-center justify-center neo-card shadow-none group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-all active:scale-90 cursor-pointer h-auto"
          >
            <MessageSquarePlus
              size={22}
              className="text-slate-500 group-hover:text-blue-500 transition-colors duration-300"
            />
          </Button>
        </div>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] border-white/10 bg-cyber-surface text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquarePlus className="text-blue-500" />
              Kirim Feedback
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Bantu kami membuat NihongoRoute menjadi lebih baik.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Jenis Feedback</label>
              <div className="flex gap-2">
                {(['bug', 'suggestion', 'compliment'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                      type === t 
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                        : 'bg-black/20 border-white/10 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    {t === 'bug' ? '🐛 Bug' : t === 'suggestion' ? '💡 Saran' : '💖 Pujian'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Pesan</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ceritakan detailnya di sini..."
                className="w-full min-h-[120px] p-3 rounded-lg bg-black/40 border border-white/10 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting || !message.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Kirim Feedback
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
