"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageSquarePlus, Coffee, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import FeedbackWidget from "../feedback/FeedbackWidget";

/**
 * @file FloatingActions.tsx
 * @description Unified Floating Action Button (FAB) that combines Support and Feedback
 * into a single, space-saving expandable widget.
 */

export default function FloatingActions() {
  const [isOpen, setIsOpen] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  return (
    <>
      <div className="fixed bottom-28 right-6 md:bottom-10 md:right-10 z-[100] flex flex-col items-end gap-4">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.8 }}
              className="flex flex-col gap-3 mb-2"
            >
              {/* Feedback Button */}
              <motion.div whileHover={{ x: -5 }}>
                <Button
                  onClick={() => {
                    setShowFeedbackDialog(true);
                    setIsOpen(false);
                  }}
                  className="bg-card hover:bg-primary hover:text-primary-foreground text-foreground border border-border shadow-xl rounded-2xl px-4 py-6 flex items-center gap-3 transition-all h-auto group"
                >
                  <span className="text-xs font-black uppercase tracking-widest hidden md:block">Feedback</span>
                  <MessageSquarePlus size={20} className="text-primary group-hover:text-current" />
                </Button>
              </motion.div>

              {/* Support Button */}
              <motion.div whileHover={{ x: -5 }}>
                <Link href="/support">
                  <Button
                    className="bg-card hover:bg-red-500 hover:text-white text-foreground border border-border shadow-xl rounded-2xl px-4 py-6 flex items-center gap-3 transition-all h-auto group"
                  >
                    <span className="text-xs font-black uppercase tracking-widest hidden md:block">Donasi</span>
                    <Coffee size={20} className="text-red-500 group-hover:text-current" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Toggle Button */}
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 md:w-16 md:h-16 rounded-full shadow-2xl transition-all duration-500 border-none flex items-center justify-center p-0 ${
            isOpen 
              ? "bg-foreground text-background rotate-0" 
              : "bg-primary text-primary-foreground hover:scale-110 shadow-primary/20"
          }`}
        >
          {isOpen ? <X size={28} /> : <Plus size={28} className={isOpen ? "" : "animate-pulse"} />}
        </Button>
      </div>

      {/* Reusing existing Feedback Dialog logic but triggered from here */}
      {showFeedbackDialog && (
        <div className="hidden">
            {/* 
                We keep the FeedbackWidget mounted but hidden if needed, 
                or we can just trigger its dialog state.
                Since FeedbackWidget is usually global, we'll ensure it's controlled correctly.
            */}
        </div>
      )}
      
      {/* Ensure the actual widget is available for the dialog */}
      <FeedbackWidget forceOpen={showFeedbackDialog} onOpenChange={setShowFeedbackDialog} />
    </>
  );
}
