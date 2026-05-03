"use client";

import { motion } from "framer-motion";
import { MessageSquarePlus, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useFeedbackWidget } from "./useFeedbackWidget";

export default function FeedbackWidget() {
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

  if (isHidden) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="fixed bottom-52 right-4 md:bottom-32 md:right-10 z-[40]"
      >
        <div className="relative group block">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-10 group-hover:opacity-30 animate-pulse transition-opacity" />
          
          <Button
            onClick={() => setIsOpen(true)}
            variant="ghost"
            size="icon"
            className="relative w-12 h-12 md:w-14 md:h-14 bg-card dark:bg-slate-900 border border-border dark:border-white/10 rounded-full flex items-center justify-center neo-card shadow-lg group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-all active:scale-90 cursor-pointer h-auto"
          >
            <MessageSquarePlus
              size={22}
              className="text-muted-foreground group-hover:text-blue-500 transition-colors duration-300"
            />
          </Button>
        </div>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] border-border dark:border-white/10 bg-card dark:bg-slate-950 text-foreground transition-colors duration-300">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <MessageSquarePlus className="text-blue-500" />
              Kirim Feedback
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Bantu kami membuat NihongoRoute menjadi lebih baik.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Jenis Feedback</label>
              <div className="flex gap-2">
                {(['bug', 'suggestion', 'compliment'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                      type === t 
                        ? 'bg-blue-500/20 border-blue-500 text-blue-600 dark:text-blue-400' 
                        : 'bg-muted/50 dark:bg-black/20 border border-border dark:border-white/10 text-muted-foreground hover:bg-muted dark:hover:bg-white/5'
                    }`}
                  >
                    {t === 'bug' ? '🐛 Bug' : t === 'suggestion' ? '💡 Saran' : '💖 Pujian'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Pesan</label>
              <textarea
               value={message}
               onChange={(e) => setMessage(e.target.value)}
               placeholder="Ceritakan detailnya di sini..."
               className="w-full min-h-[120px] p-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
               required
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting || !message.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:text-black dark:hover:bg-white transition-all border-none"
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
