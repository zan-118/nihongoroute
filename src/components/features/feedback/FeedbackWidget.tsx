"use client";

/**
 * @file FeedbackWidget.tsx
 * @description Komponen modal dialog bagi pengguna untuk mengirimkan masukan (feedback).
 * Menyediakan opsi jenis masukan berupa laporan Bug (kutu), Saran, atau Pujian, serta form pengiriman teks pesan masukan.
 */

// ======================
// IMPOR
// ======================
import { MessageSquarePlus, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useFeedbackWidget } from "./useFeedbackWidget";

// ======================
// ANTARMUKA & TIPE
// ======================
interface FeedbackWidgetProps {
  forceOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// ======================
// EKSEKUSI UTAMA
// ======================
export default function FeedbackWidget({ forceOpen, onOpenChange }: FeedbackWidgetProps) {
  const {
    isOpen,
    setIsOpen,
    type,
    setType,
    message,
    setMessage,
    isSubmitting,
    isHidden,
    handleSubmit,
  } = useFeedbackWidget();

  // If externally controlled, use the props
  const openState = forceOpen !== undefined ? forceOpen : isOpen;
  const setOpenState = onOpenChange !== undefined ? onOpenChange : setIsOpen;

  if (isHidden) {
    return null;
  }

  return (
    <>
      <Dialog open={openState} onOpenChange={setOpenState}>
        <DialogContent className="sm:max-w-[425px] border-border bg-card bg-background text-foreground transition-colors duration-300 shadow-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2 font-black uppercase tracking-tight">
              <MessageSquarePlus aria-hidden="true" className="text-primary" />
              Kirim Masukan
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Bantu kami membuat NihongoRoute menjadi lebih baik.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Jenis Masukan</label>
              <div className="flex gap-2">
                {(['bug', 'suggestion', 'compliment'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                      type === t 
                        ? 'bg-[rgba(var(--primary-rgb),0.2)] border-primary text-primary text-primary' 
                        : 'bg-[rgba(var(--muted-rgb),0.5)] dark:bg-[rgba(var(--background-rgb),0.2)] border border-border text-muted-foreground hover:bg-muted dark:hover:bg-[rgba(var(--background-rgb),0.05)]'
                    }`}
                  >
                    {t === 'bug' ? '🐛 Bug' : t === 'suggestion' ? '💡 Saran' : '💖 Pujian'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Pesan</label>
              <textarea aria-label="Ceritakan detailnya di sini"
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               placeholder="Ceritakan detailnya di sini..."
               className="w-full min-h-[120px] p-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-ring transition-all resize-none"
               required
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting || !message.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all border-none"
            >
              {isSubmitting ? (
                <Loader2 aria-hidden="true" className="size-5 animate-spin" />
              ) : (
                <>
                  <Send aria-hidden="true" className="size-4 mr-2" />
                  Kirim Masukan
                </>
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
