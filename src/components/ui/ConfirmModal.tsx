/**
 * @file ConfirmModal.tsx
 * @description Komponen dialog konfirmasi premium (ConfirmModal) untuk tindakan penting/destruktif (misal: keluar kuis, hapus data).
 */

"use client";

// ======================
// IMPOR
// ======================
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// ======================
// ANTARMUKA / TIPE DATA
// ======================
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

// ======================
// EKSEKUSI UTAMA
// ======================
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  isDestructive = false,
}: ConfirmModalProps) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        {/* Lapisan overlay latar belakang dengan z-[200] agar berada di atas seluruh kanvas permainan */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-[200] bg-background/72  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        
        {/* Kontainer Modal dengan perangkap fokus dan transisi ease-out kustom yang terinspirasi pegas */}
        <DialogPrimitive.Content className="premium-surface fixed left-[50%] top-[50%] z-[200] w-[calc(100%-2rem)] max-w-md translate-x-[-50%] translate-y-[-50%] p-5 md:p-8 rounded-xl shadow-2xl overflow-hidden focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200">
          {/* Batang batas atas aksen */}
          <div className={`absolute top-0 left-0 w-full h-1 ${isDestructive ? 'bg-destructive' : 'bg-primary'} shadow-sm`} />
          
          <div className="flex flex-col items-center text-center pt-2">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 border ${
              isDestructive 
                ? 'bg-destructive/10 border-destructive/30 text-destructive shadow-lg shadow-destructive/10' 
                : 'bg-primary/10 border-primary/30 text-primary shadow-lg shadow-primary/10'
            }`}>
              <AlertTriangle size={32} aria-hidden="true" />
            </div>
            
            <DialogPrimitive.Title className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight mb-3">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="text-muted-foreground text-sm mb-8 font-medium leading-relaxed">
              {description}
            </DialogPrimitive.Description>
            
            <div className="flex flex-col-reverse sm:flex-row w-full gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-xs"
              >
                {cancelText}
              </Button>
              <Button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg border-none ${
                  isDestructive
                    ? 'button-danger-premium hover:opacity-90 transition-all'
                    : 'btn-cyber transition-all'
                }`}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
