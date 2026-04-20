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
              className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-full h-1 ${isDestructive ? 'bg-red-500' : 'bg-cyber-neon'} shadow-[0_0_15px_currentColor]`} />
              
              <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 border ${
                  isDestructive 
                    ? 'bg-red-500/10 border-red-500/30 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                    : 'bg-cyber-neon/10 border-cyber-neon/30 text-cyber-neon shadow-[0_0_20px_rgba(0,238,255,0.3)]'
                }`}>
                  <AlertTriangle size={32} />
                </div>
                
                <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mb-3">
                  {title}
                </h3>
                <p className="text-slate-400 text-sm mb-8 font-medium leading-relaxed">
                  {description}
                </p>
                
                <div className="flex flex-col-reverse sm:flex-row w-full gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 h-12 rounded-xl bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 font-bold uppercase tracking-widest text-xs"
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
                        ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:shadow-[0_0_25px_rgba(239,68,68,0.6)]'
                        : 'bg-cyber-neon hover:bg-white text-black shadow-[0_0_15px_rgba(0,238,255,0.4)] hover:shadow-[0_0_25px_rgba(255,255,255,0.6)]'
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
