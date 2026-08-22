"use client";

/**
 * @file FeedbackWidget.tsx
 * @description Komponen modal dialog bagi pengguna untuk mengirimkan masukan (feedback).
 * Menyediakan opsi jenis masukan berupa laporan Bug (kutu), Saran, atau Pujian, serta form pengiriman teks pesan masukan.
 */

// IMPOR

import { Message, SendPlane, Loader } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useFeedbackWidget } from "./useFeedbackWidget";

// ANTARMUKA & TIPE

/**
 * Props for FeedbackWidget component.
 */
interface FeedbackWidgetProps {
 /** Force dialog open state. Override internal state. */
 forceOpen?: boolean;
 /** Callback trigger when dialog open state change. */
 onOpenChange?: (open: boolean) => void;
}

// EKSEKUSI UTAMA

/**
 * FeedbackWidget component. Render dialog modal for user feedback.
 * Allow user select type (bug, suggestion, compliment) and write message.
 */
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

 // Use external open state if provided. Fallback to internal state.
 const openState = forceOpen !== undefined ? forceOpen : isOpen;
 
 // Use external state handler if provided. Fallback to internal handler.
 const setOpenState = onOpenChange !== undefined ? onOpenChange : setIsOpen;

 // Hide widget if user not authenticated or route excluded.
 if (isHidden) {
 return null;
 }

 return (
 <>
 <Dialog open={openState} onOpenChange={setOpenState}>
 <DialogContent className="sm:max-w-[425px] border-border bg-background text-foreground transition-colors duration-300 shadow-2xl rounded-xl">
 <DialogHeader>
 <DialogTitle className="text-xl text-foreground flex items-center gap-2 font-black uppercase tracking-tight">
 <Message aria-hidden="true" className="text-primary" />
 Kirim Masukan
 </DialogTitle>
 <DialogDescription className="text-muted-foreground">
 Bantu NihongoRoute menjadi lebih baik.
 </DialogDescription>
 </DialogHeader>

 <form onSubmit={handleSubmit} className="space-y-4 mt-4">
 <div className="space-y-2">
 <label className="text-sm font-medium text-foreground/80">Jenis Masukan</label>
 <div className="flex gap-2">
 {/* Render feedback type buttons */}
 {(['bug', 'suggestion', 'compliment'] as const).map((t) => (
 <button
 key={t}
 type="button"
 onClick={() => setType(t)}
 className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
 type === t 
 ? 'bg-primary/20 border-primary text-primary' 
 : 'bg-muted/50 dark:bg-background/20 border border-border text-muted-foreground hover:bg-muted dark:hover:bg-background/5'
 }`}
 >
 {t === 'bug' ? 'Bug' : t === 'suggestion' ? 'Saran' : 'Pujian'}
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
 <Loader aria-hidden="true" className="size-5 animate-spin" />
 ) : (
 <>
 <SendPlane aria-hidden="true" className="size-4 mr-2" />
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