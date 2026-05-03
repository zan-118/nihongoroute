"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="w-full max-w-md bg-card backdrop-blur-2xl border border-border p-6 md:p-8 rounded-[2rem] shadow-2xl pointer-events-auto relative overflow-hidden transition-colors duration-300"
            >
              <div className={`absolute top-0 left-0 w-full h-1 ${isDestructive ? 'bg-destructive' : 'bg-primary'} shadow-sm`} />
              
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 border ${
                  isDestructive 
                    ? 'bg-destructive/10 border-destructive/30 text-destructive shadow-lg' 
                    : 'bg-primary/10 border-primary/30 text-primary shadow-lg'
                }`}>
                  <AlertTriangle size={32} />
                </div>
                
                <h3 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-tight mb-3">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm mb-8 font-medium leading-relaxed">
                  {description}
                </p>
                
                <div className="flex flex-col-reverse sm:flex-row w-full gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 h-12 rounded-xl bg-muted border border-border hover:bg-background text-muted-foreground font-bold uppercase tracking-widest text-xs"
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
                        ? 'bg-destructive hover:opacity-90 text-white transition-all'
                        : 'bg-primary hover:bg-foreground text-white dark:text-black transition-all'
                    }`}
                  >
                    {confirmText}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
